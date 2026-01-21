import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Anthropic from 'https://esm.sh/@anthropic-ai/sdk@0.24.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { organizationId } = await req.json();

    if (!organizationId) {
      return new Response(
        JSON.stringify({ error: 'organizationId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY');
    const anthropic = anthropicKey ? new Anthropic({ apiKey: anthropicKey }) : null;

    const alerts: any[] = [];
    const now = new Date();

    // =========================================
    // 1. ANÁLISIS DE EXPEDIENTES CON PLAZOS PRÓXIMOS
    // =========================================
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const { data: mattersWithDeadlines } = await supabase
      .from('matters')
      .select('id, reference, title, status, next_deadline, priority, client_id')
      .eq('organization_id', organizationId)
      .not('next_deadline', 'is', null)
      .gte('next_deadline', now.toISOString())
      .lte('next_deadline', sevenDaysFromNow.toISOString())
      .neq('status', 'closed');

    for (const matter of mattersWithDeadlines || []) {
      const deadline = new Date(matter.next_deadline);
      const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
      
      let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';
      let confidence = 60;

      if (daysLeft <= 1) {
        severity = 'critical';
        confidence = 95;
      } else if (daysLeft <= 2) {
        severity = 'high';
        confidence = 85;
      } else if (daysLeft <= 4) {
        severity = 'medium';
        confidence = 75;
      } else {
        continue; // Skip low priority
      }

      let recommendation = 'Revise el expediente y asegure que todas las tareas estén completadas antes del plazo.';
      
      // Generate AI recommendation if available and severity is high or critical
      if (anthropic && (severity === 'high' || severity === 'critical')) {
        try {
          const aiResponse = await anthropic.messages.create({
            model: 'claude-sonnet-4-5-20250929',
            max_tokens: 100,
            messages: [{
              role: 'user',
              content: `Plazo legal en ${daysLeft} día(s) para expediente "${matter.title}". 
              Prioridad: ${matter.priority || 'normal'}.
              Da UNA recomendación corta y práctica (máx 2 frases) para evitar incumplimiento.`
            }],
          });

          if (aiResponse.content[0].type === 'text') {
            recommendation = aiResponse.content[0].text;
          }
        } catch (e) {
          console.error('AI recommendation error:', e);
        }
      }

      alerts.push({
        organization_id: organizationId,
        alert_type: 'deadline_risk',
        severity,
        confidence_score: confidence,
        title: `Plazo próximo: ${matter.reference}`,
        description: `"${matter.title}" vence en ${daysLeft} día(s).`,
        recommendation,
        matter_id: matter.id,
        contact_id: matter.client_id || null,
        expires_at: matter.next_deadline,
        analysis_data: {
          factors: [
            { name: 'days_until_deadline', value: daysLeft, weight: 0.6 },
            { name: 'priority', value: matter.priority === 'high' ? 1 : 0.5, weight: 0.4 }
          ],
          model_version: 'v1.0',
          computed_at: now.toISOString()
        }
      });
    }

    // =========================================
    // 2. ANÁLISIS DE RENOVACIONES PRÓXIMAS
    // =========================================
    const ninetyDaysFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
    
    const { data: renewals } = await supabase
      .from('matters')
      .select('id, reference, title, renewal_date, client_id')
      .eq('organization_id', organizationId)
      .not('renewal_date', 'is', null)
      .gte('renewal_date', now.toISOString())
      .lte('renewal_date', ninetyDaysFromNow.toISOString());

    for (const matter of renewals || []) {
      const renewalDate = new Date(matter.renewal_date);
      const daysLeft = Math.ceil((renewalDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));

      let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';
      if (daysLeft <= 14) {
        severity = 'critical';
      } else if (daysLeft <= 30) {
        severity = 'high';
      } else if (daysLeft <= 60) {
        severity = 'medium';
      }

      alerts.push({
        organization_id: organizationId,
        alert_type: 'renewal_upcoming',
        severity,
        confidence_score: 100,
        title: `Renovación: ${matter.reference}`,
        description: `"${matter.title}" vence en ${daysLeft} días.`,
        recommendation: daysLeft <= 30 
          ? 'Contacte urgentemente al cliente para confirmar renovación y preparar documentación.'
          : 'Prepare documentación de renovación y contacte al cliente para confirmar instrucciones.',
        matter_id: matter.id,
        contact_id: matter.client_id || null,
        expires_at: matter.renewal_date,
        analysis_data: {
          factors: [{ name: 'days_until_renewal', value: daysLeft, weight: 1.0 }],
          model_version: 'v1.0',
          computed_at: now.toISOString()
        }
      });
    }

    // =========================================
    // 3. ANÁLISIS DE FACTURAS PENDIENTES (Payment Risk)
    // =========================================
    const { data: overdueInvoices } = await supabase
      .from('invoices')
      .select('id, invoice_number, total_amount, due_date, status, contact_id')
      .eq('organization_id', organizationId)
      .eq('status', 'sent')
      .lt('due_date', now.toISOString());

    for (const invoice of overdueInvoices || []) {
      const dueDate = new Date(invoice.due_date);
      const daysOverdue = Math.ceil((now.getTime() - dueDate.getTime()) / (24 * 60 * 60 * 1000));

      let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';
      if (daysOverdue > 60) {
        severity = 'critical';
      } else if (daysOverdue > 30) {
        severity = 'high';
      } else if (daysOverdue > 14) {
        severity = 'medium';
      } else {
        continue;
      }

      alerts.push({
        organization_id: organizationId,
        alert_type: 'payment_risk',
        severity,
        confidence_score: 80 + Math.min(daysOverdue, 20),
        title: `Factura vencida: ${invoice.invoice_number}`,
        description: `${invoice.total_amount}€ pendiente hace ${daysOverdue} días.`,
        recommendation: daysOverdue > 30 
          ? 'Escale a cobro urgente. Considere acciones legales si no hay respuesta.'
          : 'Envíe recordatorio de pago al cliente.',
        invoice_id: invoice.id,
        contact_id: invoice.contact_id || null,
        analysis_data: {
          factors: [
            { name: 'days_overdue', value: daysOverdue, weight: 0.6 },
            { name: 'amount', value: invoice.total_amount, weight: 0.4 }
          ],
          model_version: 'v1.0',
          computed_at: now.toISOString()
        }
      });
    }

    // =========================================
    // INSERT ALERTS (upsert to avoid duplicates)
    // =========================================
    let insertedCount = 0;
    for (const alert of alerts) {
      const { error } = await supabase
        .from('predictive_alerts')
        .upsert(alert, {
          onConflict: 'organization_id,alert_type,matter_id,related_entity_id',
          ignoreDuplicates: true
        });
      
      if (!error) insertedCount++;
    }

    return new Response(
      JSON.stringify({
        success: true,
        alertsAnalyzed: alerts.length,
        alertsCreated: insertedCount,
        timestamp: now.toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Predictive analysis error:', err);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
