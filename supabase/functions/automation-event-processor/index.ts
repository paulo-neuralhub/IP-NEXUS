// ============================================================================
// IP-NEXUS: AUTOMATION EVENT PROCESSOR
// ============================================================================
// Procesa eventos de la cola automation_event_queue y dispara automatizaciones.
// Se ejecuta periódicamente via cron o manualmente.
// ============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface QueuedEvent {
  id: string;
  organization_id: string;
  trigger_type: string;
  entity_type: string;
  entity_id: string | null;
  event_type: string;
  event_data: Record<string, unknown>;
  old_data: Record<string, unknown> | null;
  status: string;
  created_at: string;
}

interface ProcessResult {
  event_id: string;
  automation_id?: string;
  status: 'processed' | 'skipped' | 'error';
  automations_triggered: number;
  error?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN HANDLER
// ─────────────────────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  console.log('[EventProcessor] 🚀 Starting event queue processing...');

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parsear opciones
    let batchSize = 50;
    try {
      const body = await req.json();
      batchSize = body.batch_size || 50;
    } catch {
      // Sin body, usar defaults
    }

    // Obtener eventos pendientes
    const { data: events, error } = await supabase
      .from('automation_event_queue')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(batchSize);

    if (error) {
      throw error;
    }

    if (!events || events.length === 0) {
      console.log('[EventProcessor] No pending events found');
      return new Response(JSON.stringify({
        success: true,
        processed: 0,
        message: 'No pending events'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`[EventProcessor] Found ${events.length} pending events`);

    const results: ProcessResult[] = [];

    for (const event of events as QueuedEvent[]) {
      try {
        // Marcar como procesando
        await supabase
          .from('automation_event_queue')
          .update({ status: 'processing' })
          .eq('id', event.id);

        // Buscar automatizaciones que coincidan con este evento
        const automationsTriggered = await processEvent(
          supabase,
          supabaseUrl,
          supabaseServiceKey,
          event
        );

        // Marcar como procesado
        await supabase
          .from('automation_event_queue')
          .update({ 
            status: 'processed',
            processed_at: new Date().toISOString()
          })
          .eq('id', event.id);

        results.push({
          event_id: event.id,
          status: automationsTriggered > 0 ? 'processed' : 'skipped',
          automations_triggered: automationsTriggered
        });

      } catch (e: unknown) {
        const errMsg = e instanceof Error ? e.message : 'Error desconocido';
        console.error(`[EventProcessor] Error processing event ${event.id}:`, e);

        await supabase
          .from('automation_event_queue')
          .update({ 
            status: 'error',
            error_message: errMsg,
            processed_at: new Date().toISOString()
          })
          .eq('id', event.id);

        results.push({
          event_id: event.id,
          status: 'error',
          automations_triggered: 0,
          error: errMsg
        });
      }
    }

    const summary = {
      success: true,
      total_events: events.length,
      processed: results.filter(r => r.status === 'processed').length,
      skipped: results.filter(r => r.status === 'skipped').length,
      errors: results.filter(r => r.status === 'error').length,
      automations_triggered: results.reduce((sum, r) => sum + r.automations_triggered, 0),
      duration_ms: Date.now() - startTime,
      results
    };

    console.log(`[EventProcessor] ✅ Completed: ${summary.processed} processed, ${summary.skipped} skipped, ${summary.errors} errors`);

    return new Response(JSON.stringify(summary), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    console.error('[EventProcessor] ❌ Fatal error:', error);

    return new Response(JSON.stringify({
      success: false,
      error: errorMessage,
      duration_ms: Date.now() - startTime
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PROCESS EVENT
// ─────────────────────────────────────────────────────────────────────────────

async function processEvent(
  // deno-lint-ignore no-explicit-any
  supabase: any,
  supabaseUrl: string,
  supabaseServiceKey: string,
  event: QueuedEvent
): Promise<number> {
  // Buscar automatizaciones activas que coincidan con este trigger
  const { data: automations, error } = await supabase
    .from('tenant_automations')
    .select('id, name, trigger_config')
    .eq('organization_id', event.organization_id)
    .eq('trigger_type', event.trigger_type)
    .eq('is_active', true);

  if (error) {
    console.error('[EventProcessor] Error fetching automations:', error);
    return 0;
  }

  if (!automations || automations.length === 0) {
    return 0;
  }

  let triggeredCount = 0;

  for (const automation of automations) {
    // Verificar si la configuración del trigger coincide
    if (!matchesTriggerConfig(automation.trigger_config, event)) {
      continue;
    }

    try {
      // Llamar a automation-execute
      const response = await fetch(`${supabaseUrl}/functions/v1/automation-execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({
          automation_id: automation.id,
          trigger_type: event.trigger_type,
          entity_type: event.entity_type,
          entity_id: event.entity_id,
          organization_id: event.organization_id,
          trigger_data: {
            event_type: event.event_type,
            record: event.event_data,
            old_record: event.old_data,
            table: event.entity_type,
            event: event.event_type
          },
          idempotency_key: `event_${event.id}_${automation.id}`
        })
      });

      if (response.ok) {
        triggeredCount++;
        console.log(`[EventProcessor] Triggered automation ${automation.name}`);
      } else {
        const result = await response.json();
        console.warn(`[EventProcessor] Automation ${automation.id} failed:`, result);
      }

    } catch (e) {
      console.error(`[EventProcessor] Error triggering automation ${automation.id}:`, e);
    }
  }

  return triggeredCount;
}

// ─────────────────────────────────────────────────────────────────────────────
// MATCH TRIGGER CONFIG
// ─────────────────────────────────────────────────────────────────────────────

function matchesTriggerConfig(
  triggerConfig: Record<string, unknown> | null,
  event: QueuedEvent
): boolean {
  if (!triggerConfig) return true; // Sin config = cualquier evento

  // Verificar tabla
  if (triggerConfig.table && triggerConfig.table !== event.entity_type) {
    return false;
  }

  // Verificar evento (INSERT, UPDATE, DELETE)
  if (triggerConfig.event && triggerConfig.event !== event.event_type) {
    return false;
  }

  // Verificar filtros sobre el record
  if (triggerConfig.filter && typeof triggerConfig.filter === 'object') {
    const filter = triggerConfig.filter as Record<string, unknown>;
    const record = event.event_data;

    for (const [key, value] of Object.entries(filter)) {
      if (Array.isArray(value)) {
        // in array
        if (!value.includes(record[key])) return false;
      } else {
        // equals
        if (record[key] !== value) return false;
      }
    }
  }

  // Para field_change, verificar si el campo específico cambió
  if (event.trigger_type === 'field_change' && triggerConfig.field && event.old_data) {
    const field = triggerConfig.field as string;
    const oldValue = (event.old_data as Record<string, unknown>)[field];
    const newValue = (event.event_data as Record<string, unknown>)[field];
    
    if (oldValue === newValue) {
      return false; // El campo no cambió
    }

    // Si hay valor específico que debe cambiar A
    if (triggerConfig.old_value !== undefined && oldValue !== triggerConfig.old_value) {
      return false;
    }

    // Si hay valor específico que debe cambiar a B
    if (triggerConfig.new_value !== undefined && newValue !== triggerConfig.new_value) {
      return false;
    }
  }

  return true;
}
