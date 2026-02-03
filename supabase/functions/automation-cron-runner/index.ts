// ============================================================================
// IP-NEXUS: AUTOMATION CRON RUNNER
// ============================================================================
// Ejecuta automatizaciones programadas (cron y date_relative).
// Se invoca diariamente via pg_cron, Supabase Dashboard Cron, o manualmente.
//
// Flujo:
// 1. Busca todas las automations activas de tipo cron y date_relative
// 2. Evalúa cuáles deben dispararse hoy según su configuración
// 3. Llama a automation-execute para cada una
// ============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface TenantAutomation {
  id: string;
  organization_id: string;
  name: string;
  trigger_type: string;
  trigger_config: TriggerConfig;
  is_active: boolean;
}

interface TriggerConfig {
  schedule?: string;
  timezone?: string;
  table?: string;
  date_field?: string;
  offset_days?: number;
  repeat_offsets?: number[];
  filter?: Record<string, unknown>;
}

interface CronResult {
  automation_id: string;
  automation_name: string;
  organization_id: string;
  trigger_type: string;
  status: 'triggered' | 'skipped' | 'error';
  entities_triggered?: number;
  message?: string;
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
  console.log('[CronRunner] 🚀 Starting daily automation check...');

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parsear body opcional (para filtrar por tipo o org)
    let filters: { trigger_type?: string; organization_id?: string } = {};
    try {
      if (req.body) {
        filters = await req.json();
      }
    } catch {
      // No body, ejecutar todo
    }

    const results: CronResult[] = [];

    // ─── PASO 1: Procesar CRON automations ──────────────────────────────────
    if (!filters.trigger_type || filters.trigger_type === 'cron') {
      const cronResults = await processCronAutomations(supabase, supabaseUrl, supabaseServiceKey, filters.organization_id);
      results.push(...cronResults);
    }

    // ─── PASO 2: Procesar DATE_RELATIVE automations ─────────────────────────
    if (!filters.trigger_type || filters.trigger_type === 'date_relative') {
      const dateResults = await processDateRelativeAutomations(supabase, supabaseUrl, supabaseServiceKey, filters.organization_id);
      results.push(...dateResults);
    }

    const summary = {
      success: true,
      total_processed: results.length,
      triggered: results.filter(r => r.status === 'triggered').length,
      skipped: results.filter(r => r.status === 'skipped').length,
      errors: results.filter(r => r.status === 'error').length,
      duration_ms: Date.now() - startTime,
      results,
    };

    console.log(`[CronRunner] ✅ Completed: ${summary.triggered} triggered, ${summary.skipped} skipped, ${summary.errors} errors`);

    return new Response(JSON.stringify(summary), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    console.error('[CronRunner] ❌ Fatal error:', error);

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
// PROCESS CRON AUTOMATIONS
// ─────────────────────────────────────────────────────────────────────────────

async function processCronAutomations(
  // deno-lint-ignore no-explicit-any
  supabase: any,
  supabaseUrl: string,
  supabaseServiceKey: string,
  organizationId?: string
): Promise<CronResult[]> {
  const results: CronResult[] = [];

  // Buscar automations activas de tipo cron
  let query = supabase
    .from('tenant_automations')
    .select('id, organization_id, name, trigger_type, trigger_config')
    .eq('is_active', true)
    .eq('trigger_type', 'cron');

  if (organizationId) {
    query = query.eq('organization_id', organizationId);
  }

  const { data: automations, error } = await query;

  if (error) {
    console.error('[CronRunner] Error fetching cron automations:', error);
    return results;
  }

  if (!automations || automations.length === 0) {
    console.log('[CronRunner] No cron automations found');
    return results;
  }

  console.log(`[CronRunner] Found ${automations.length} cron automations`);

  for (const automation of automations as TenantAutomation[]) {
    try {
      // Evaluar si debe ejecutarse según el schedule
      if (!shouldRunCron(automation.trigger_config)) {
        results.push({
          automation_id: automation.id,
          automation_name: automation.name,
          organization_id: automation.organization_id,
          trigger_type: 'cron',
          status: 'skipped',
          message: 'Schedule does not match today'
        });
        continue;
      }

      // Llamar a automation-execute
      const response = await fetch(`${supabaseUrl}/functions/v1/automation-execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({
          automation_id: automation.id,
          trigger_type: 'cron',
          trigger_data: {
            schedule: automation.trigger_config.schedule,
            run_date: new Date().toISOString(),
            run_type: 'scheduled'
          },
          organization_id: automation.organization_id,
          idempotency_key: `cron_${automation.id}_${new Date().toISOString().split('T')[0]}`
        })
      });

      const result = await response.json();

      results.push({
        automation_id: automation.id,
        automation_name: automation.name,
        organization_id: automation.organization_id,
        trigger_type: 'cron',
        status: response.ok && result.success !== false ? 'triggered' : 'error',
        message: result.message || result.status,
        error: result.error
      });

    } catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : 'Error desconocido';
      results.push({
        automation_id: automation.id,
        automation_name: automation.name,
        organization_id: automation.organization_id,
        trigger_type: 'cron',
        status: 'error',
        error: errMsg
      });
    }
  }

  return results;
}

// ─────────────────────────────────────────────────────────────────────────────
// PROCESS DATE_RELATIVE AUTOMATIONS
// ─────────────────────────────────────────────────────────────────────────────

async function processDateRelativeAutomations(
  // deno-lint-ignore no-explicit-any
  supabase: any,
  supabaseUrl: string,
  supabaseServiceKey: string,
  organizationId?: string
): Promise<CronResult[]> {
  const results: CronResult[] = [];

  // Buscar automations activas de tipo date_relative
  let query = supabase
    .from('tenant_automations')
    .select('id, organization_id, name, trigger_type, trigger_config')
    .eq('is_active', true)
    .eq('trigger_type', 'date_relative');

  if (organizationId) {
    query = query.eq('organization_id', organizationId);
  }

  const { data: automations, error } = await query;

  if (error) {
    console.error('[CronRunner] Error fetching date_relative automations:', error);
    return results;
  }

  if (!automations || automations.length === 0) {
    console.log('[CronRunner] No date_relative automations found');
    return results;
  }

  console.log(`[CronRunner] Found ${automations.length} date_relative automations`);

  for (const automation of automations as TenantAutomation[]) {
    try {
      const triggered = await checkAndTriggerDateRelative(
        supabase,
        supabaseUrl,
        supabaseServiceKey,
        automation
      );

      results.push({
        automation_id: automation.id,
        automation_name: automation.name,
        organization_id: automation.organization_id,
        trigger_type: 'date_relative',
        status: triggered > 0 ? 'triggered' : 'skipped',
        entities_triggered: triggered,
        message: triggered > 0 ? `Triggered for ${triggered} entities` : 'No matching entities today'
      });

    } catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : 'Error desconocido';
      results.push({
        automation_id: automation.id,
        automation_name: automation.name,
        organization_id: automation.organization_id,
        trigger_type: 'date_relative',
        status: 'error',
        error: errMsg
      });
    }
  }

  return results;
}

// ─────────────────────────────────────────────────────────────────────────────
// CHECK AND TRIGGER DATE_RELATIVE
// Busca entidades cuya fecha + offset = hoy
// ─────────────────────────────────────────────────────────────────────────────

async function checkAndTriggerDateRelative(
  // deno-lint-ignore no-explicit-any
  supabase: any,
  supabaseUrl: string,
  supabaseServiceKey: string,
  automation: TenantAutomation
): Promise<number> {
  const config = automation.trigger_config;
  const table = config.table;
  const dateField = config.date_field;
  
  if (!table || !dateField) {
    console.warn(`[CronRunner] Missing table or date_field for automation ${automation.id}`);
    return 0;
  }

  // Obtener offsets a evaluar
  const offsets = config.repeat_offsets || 
                  (config.offset_days !== undefined ? [config.offset_days] : [0]);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let triggeredCount = 0;

  for (const offset of offsets) {
    // Calcular la fecha objetivo: si offset es -90, buscamos entidades cuyo
    // date_field es hoy + 90 días (es decir, vence en 90 días)
    const targetDate = new Date(today);
    targetDate.setDate(targetDate.getDate() + Math.abs(offset));
    const targetDateStr = targetDate.toISOString().split('T')[0];

    // Construir query
    let query = supabase
      .from(table)
      .select('id')
      .eq('organization_id', automation.organization_id)
      .eq(dateField, targetDateStr);

    // Aplicar filtros adicionales
    if (config.filter && typeof config.filter === 'object') {
      for (const [key, value] of Object.entries(config.filter)) {
        if (Array.isArray(value)) {
          query = query.in(key, value);
        } else {
          query = query.eq(key, value);
        }
      }
    }

    const { data: entities, error } = await query;

    if (error) {
      console.error(`[CronRunner] Error querying ${table}:`, error);
      continue;
    }

    if (!entities || entities.length === 0) {
      continue;
    }

    console.log(`[CronRunner] Found ${entities.length} entities for offset ${offset} in ${table}`);

    // Disparar automation para cada entidad
    for (const entity of entities) {
      try {
        await fetch(`${supabaseUrl}/functions/v1/automation-execute`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({
            automation_id: automation.id,
            trigger_type: 'date_relative',
            entity_type: table,
            entity_id: entity.id,
            organization_id: automation.organization_id,
            trigger_data: {
              offset_days: offset,
              target_date: targetDateStr,
              days_remaining: Math.abs(offset),
              date_field: dateField
            },
            idempotency_key: `date_${automation.id}_${entity.id}_${offset}_${targetDateStr}`
          })
        });

        triggeredCount++;

      } catch (e) {
        console.error(`[CronRunner] Error triggering entity ${entity.id}:`, e);
      }
    }
  }

  return triggeredCount;
}

// ─────────────────────────────────────────────────────────────────────────────
// SHOULD RUN CRON
// Evalúa si una automation cron debe ejecutarse hoy según su schedule
// ─────────────────────────────────────────────────────────────────────────────

function shouldRunCron(config: TriggerConfig): boolean {
  if (!config?.schedule) return true; // Sin schedule = siempre

  const schedule = config.schedule;
  const parts = schedule.split(' ');

  // Formato: minute hour dayOfMonth month dayOfWeek
  if (parts.length < 5) return true; // Formato inválido = ejecutar

  const [_minute, _hour, dayOfMonth, month, dayOfWeek] = parts;
  const now = new Date();

  // Ajustar por timezone del tenant si se especifica
  // (simplificado: asumimos UTC o timezone del servidor)

  // Verificar día de la semana (0=dom, 1=lun, ..., 6=sáb)
  if (dayOfWeek !== '*') {
    const allowedDays = parseCronField(dayOfWeek, 0, 6);
    if (!allowedDays.includes(now.getDay())) return false;
  }

  // Verificar día del mes
  if (dayOfMonth !== '*') {
    const allowedDays = parseCronField(dayOfMonth, 1, 31);
    if (!allowedDays.includes(now.getDate())) return false;
  }

  // Verificar mes
  if (month !== '*') {
    const allowedMonths = parseCronField(month, 1, 12);
    if (!allowedMonths.includes(now.getMonth() + 1)) return false;
  }

  return true;
}

// ─────────────────────────────────────────────────────────────────────────────
// PARSE CRON FIELD
// Maneja: *, 1, 1,2,3, 1-5, */2
// ─────────────────────────────────────────────────────────────────────────────

function parseCronField(field: string, min: number, max: number): number[] {
  if (field === '*') {
    return Array.from({ length: max - min + 1 }, (_, i) => min + i);
  }

  // Step: */2
  if (field.startsWith('*/')) {
    const step = parseInt(field.substring(2), 10);
    const result: number[] = [];
    for (let i = min; i <= max; i += step) {
      result.push(i);
    }
    return result;
  }

  // Range: 1-5
  if (field.includes('-') && !field.includes(',')) {
    const [start, end] = field.split('-').map(Number);
    const result: number[] = [];
    for (let i = start; i <= end; i++) {
      result.push(i);
    }
    return result;
  }

  // List: 1,3,5
  if (field.includes(',')) {
    const values: number[] = [];
    for (const part of field.split(',')) {
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(Number);
        for (let i = start; i <= end; i++) {
          values.push(i);
        }
      } else {
        values.push(parseInt(part, 10));
      }
    }
    return values;
  }

  // Single value
  return [parseInt(field, 10)];
}
