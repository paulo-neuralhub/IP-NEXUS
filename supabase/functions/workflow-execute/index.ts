import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WorkflowAction {
  id: string;
  type: string;
  name: string;
  config: Record<string, unknown>;
  conditions?: ConditionGroup[];
}

interface ConditionGroup {
  logic: 'and' | 'or';
  conditions: Condition[];
}

interface Condition {
  field: string;
  operator: string;
  value: unknown;
}

interface ExecutionContext {
  trigger_data: Record<string, unknown>;
  variables: Record<string, unknown>;
  action_outputs: Record<string, unknown>;
  organization_id?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { execution_id, queue_id, trigger_type, trigger_data, organization_id } = await req.json();

    // Direct trigger mode: find matching workflows and execute
    if (trigger_type && organization_id) {
      return await handleDirectTrigger(supabase, trigger_type, trigger_data, organization_id);
    }

    if (!execution_id && !queue_id) {
      throw new Error('execution_id, queue_id, or trigger_type is required');
    }

    let executionId = execution_id;
    let queueItem = null;

    // If queue_id provided, get execution from queue
    if (queue_id) {
      const { data: queue, error: queueError } = await supabase
        .from('workflow_queue')
        .select('*')
        .eq('id', queue_id)
        .single();

      if (queueError) throw queueError;
      queueItem = queue;

      // Create execution record
      const { data: newExecution, error: execError } = await supabase
        .from('workflow_executions')
        .insert({
          organization_id: queue.organization_id,
          workflow_id: queue.workflow_id,
          trigger_type: queue.trigger_type,
          trigger_data: queue.trigger_data,
          status: 'running',
          started_at: new Date().toISOString(),
          context: {}
        })
        .select()
        .single();

      if (execError) throw execError;
      executionId = newExecution.id;

      // Update queue with execution_id
      await supabase
        .from('workflow_queue')
        .update({ 
          execution_id: executionId,
          status: 'processing',
          locked_at: new Date().toISOString()
        })
        .eq('id', queue_id);
    }

    // Get execution record
    const { data: execution, error: execError } = await supabase
      .from('workflow_executions')
      .select(`
        *,
        workflow:workflow_templates(*)
      `)
      .eq('id', executionId)
      .single();

    if (execError) throw execError;

    const result = await executeWorkflow(supabase, execution, queueItem?.id);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: unknown) {
    console.error('[Workflow Execute] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return new Response(JSON.stringify({
      success: false,
      error: errorMessage
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

// =============================================
// DIRECT TRIGGER HANDLER
// =============================================

async function handleDirectTrigger(
  supabase: any,
  triggerType: string,
  triggerData: Record<string, unknown>,
  organizationId: string
) {
  // Find all active workflows matching this trigger
  const { data: workflows, error } = await supabase
    .from('workflow_templates')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('trigger_type', triggerType)
    .eq('is_active', true);

  if (error) throw error;

  if (!workflows || workflows.length === 0) {
    return new Response(JSON.stringify({
      success: true,
      message: 'No matching workflows found',
      workflows_triggered: 0
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }

  const results = [];

  for (const workflow of workflows) {
    // Check if workflow requires approval
    if (workflow.requires_approval) {
      // Queue for approval instead of executing
      await supabase.from('workflow_queue').insert({
        organization_id: organizationId,
        workflow_id: workflow.id,
        trigger_type: triggerType,
        trigger_data: triggerData,
        status: 'pending_approval',
        scheduled_for: new Date().toISOString()
      });
      results.push({ workflow_id: workflow.id, status: 'pending_approval' });
      continue;
    }

    // Create execution record
    const { data: execution, error: execError } = await supabase
      .from('workflow_executions')
      .insert({
        organization_id: organizationId,
        workflow_id: workflow.id,
        trigger_type: triggerType,
        trigger_data: triggerData,
        status: 'running',
        started_at: new Date().toISOString(),
        context: {}
      })
      .select(`*, workflow:workflow_templates(*)`)
      .single();

    if (execError) {
      results.push({ workflow_id: workflow.id, status: 'error', error: execError.message });
      continue;
    }

    try {
      const result = await executeWorkflow(supabase, execution, null);
      results.push({ workflow_id: workflow.id, ...result });
    } catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : 'Unknown error';
      results.push({ workflow_id: workflow.id, status: 'failed', error: errMsg });
    }
  }

  return new Response(JSON.stringify({
    success: true,
    workflows_triggered: workflows.length,
    results
  }), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  });
}

// =============================================
// MAIN WORKFLOW EXECUTOR
// =============================================

async function executeWorkflow(supabase: any, execution: any, queueId: string | null) {
  const workflow = execution.workflow;
  const actions = workflow.actions as WorkflowAction[];
  
  console.log(`[Workflow ${workflow.code}] Starting execution ${execution.id}`);
  console.log(`[Workflow ${workflow.code}] ${actions.length} actions to execute`);

  // Initialize context
  const context: ExecutionContext = {
    trigger_data: execution.trigger_data || {},
    variables: {},
    action_outputs: {},
    organization_id: execution.organization_id
  };

  // Load workflow variables
  const { data: variables } = await supabase
    .from('workflow_variables')
    .select('key, value')
    .eq('organization_id', execution.organization_id);
  
  if (variables) {
    for (const v of variables) {
      context.variables[v.key] = v.value;
    }
  }

  // Add computed variables
  context.variables['today'] = new Date().toISOString().split('T')[0];
  context.variables['now'] = new Date().toISOString();
  context.variables['tomorrow'] = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  context.variables['next_week'] = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

  let actionsCompleted = 0;
  let actionsFailed = 0;
  let actionsSkipped = 0;
  let currentIndex = 0;

  // Execute each action
  for (const action of actions) {
    currentIndex++;
    
    console.log(`[Workflow ${workflow.code}] Evaluating action ${currentIndex}/${actions.length}: ${action.type}`);

    // Check conditions before executing
    if (action.conditions && action.conditions.length > 0) {
      const conditionsMet = evaluateConditions(action.conditions, context);
      if (!conditionsMet) {
        console.log(`[Workflow ${workflow.code}] Conditions not met for action ${action.type}, skipping`);
        actionsSkipped++;
        
        // Log skipped action
        await supabase.from('workflow_action_logs').insert({
          execution_id: execution.id,
          action_index: currentIndex,
          action_type: action.type,
          action_config: action.config,
          status: 'skipped',
          started_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
          input_data: context
        });
        continue;
      }
    }

    // Create action log
    const { data: actionLog } = await supabase
      .from('workflow_action_logs')
      .insert({
        execution_id: execution.id,
        action_index: currentIndex,
        action_type: action.type,
        action_config: action.config,
        status: 'running',
        started_at: new Date().toISOString(),
        input_data: context
      })
      .select()
      .single();

    const startTime = Date.now();

    try {
      // Execute action based on type
      const result = await executeAction(supabase, action, context, execution.organization_id);
      
      const duration = Date.now() - startTime;
      
      // Store output in context for next actions
      context.action_outputs[action.id] = result;

      // Update action log as completed
      await supabase
        .from('workflow_action_logs')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          duration_ms: duration,
          output_data: result
        })
        .eq('id', actionLog.id);

      actionsCompleted++;
      console.log(`[Workflow ${workflow.code}] Action ${action.type} completed in ${duration}ms`);

    } catch (actionError: unknown) {
      const duration = Date.now() - startTime;
      actionsFailed++;
      const errorMessage = actionError instanceof Error ? actionError.message : 'Unknown error';

      console.error(`[Workflow ${workflow.code}] Action ${action.type} failed:`, actionError);

      // Update action log as failed
      await supabase
        .from('workflow_action_logs')
        .update({
          status: 'failed',
          completed_at: new Date().toISOString(),
          duration_ms: duration,
          error_message: errorMessage
        })
        .eq('id', actionLog.id);

      // Continue to next action on failure (configurable in future)
    }

    // Update execution progress
    await supabase
      .from('workflow_executions')
      .update({
        current_action_index: currentIndex,
        actions_completed: actionsCompleted,
        actions_failed: actionsFailed,
        context
      })
      .eq('id', execution.id);
  }

  // Mark execution as completed
  const finalStatus = actionsFailed > 0 ? 
    (actionsCompleted > 0 ? 'completed' : 'failed') : 'completed';

  await supabase
    .from('workflow_executions')
    .update({
      status: finalStatus,
      completed_at: new Date().toISOString(),
      result: context.action_outputs
    })
    .eq('id', execution.id);

  // Update workflow stats
  await supabase
    .from('workflow_templates')
    .update({
      execution_count: workflow.execution_count + 1,
      last_executed_at: new Date().toISOString()
    })
    .eq('id', workflow.id);

  // Update queue if applicable
  if (queueId) {
    await supabase
      .from('workflow_queue')
      .update({ status: 'completed' })
      .eq('id', queueId);
  }

  console.log(`[Workflow ${workflow.code}] Execution completed: ${actionsCompleted} succeeded, ${actionsFailed} failed, ${actionsSkipped} skipped`);

  return {
    success: true,
    execution_id: execution.id,
    status: finalStatus,
    actions_completed: actionsCompleted,
    actions_failed: actionsFailed,
    actions_skipped: actionsSkipped
  };
}

// =============================================
// CONDITIONS EVALUATOR
// =============================================

function evaluateConditions(conditionGroups: ConditionGroup[], context: ExecutionContext): boolean {
  if (!conditionGroups || conditionGroups.length === 0) return true;

  // Evaluate each group (groups are AND'd together by default)
  for (const group of conditionGroups) {
    const groupResult = evaluateConditionGroup(group, context);
    if (!groupResult) return false; // All groups must pass
  }
  return true;
}

function evaluateConditionGroup(group: ConditionGroup, context: ExecutionContext): boolean {
  const results = group.conditions.map(cond => evaluateSingleCondition(cond, context));
  
  if (group.logic === 'or') {
    return results.some(r => r);
  }
  return results.every(r => r); // 'and' is default
}

function evaluateSingleCondition(condition: Condition, context: ExecutionContext): boolean {
  const { field, operator, value } = condition;
  const fieldValue = getNestedValue(context as unknown as Record<string, unknown>, field);
  const compareValue = typeof value === 'string' ? interpolateString(value, context) : value;

  switch (operator) {
    // Text operators
    case 'equals':
    case 'eq':
      return String(fieldValue) === String(compareValue);
    
    case 'not_equals':
    case 'neq':
      return String(fieldValue) !== String(compareValue);
    
    case 'contains':
      return String(fieldValue).toLowerCase().includes(String(compareValue).toLowerCase());
    
    case 'not_contains':
      return !String(fieldValue).toLowerCase().includes(String(compareValue).toLowerCase());
    
    case 'starts_with':
      return String(fieldValue).toLowerCase().startsWith(String(compareValue).toLowerCase());
    
    case 'ends_with':
      return String(fieldValue).toLowerCase().endsWith(String(compareValue).toLowerCase());
    
    case 'matches':
      try {
        const regex = new RegExp(String(compareValue), 'i');
        return regex.test(String(fieldValue));
      } catch {
        return false;
      }

    // Number operators
    case 'greater_than':
    case 'gt':
      return Number(fieldValue) > Number(compareValue);
    
    case 'greater_than_or_equal':
    case 'gte':
      return Number(fieldValue) >= Number(compareValue);
    
    case 'less_than':
    case 'lt':
      return Number(fieldValue) < Number(compareValue);
    
    case 'less_than_or_equal':
    case 'lte':
      return Number(fieldValue) <= Number(compareValue);
    
    case 'between':
      if (Array.isArray(compareValue) && compareValue.length === 2) {
        const num = Number(fieldValue);
        return num >= Number(compareValue[0]) && num <= Number(compareValue[1]);
      }
      return false;

    // Boolean/null operators
    case 'is_true':
      return fieldValue === true || fieldValue === 'true' || fieldValue === 1;
    
    case 'is_false':
      return fieldValue === false || fieldValue === 'false' || fieldValue === 0;
    
    case 'is_empty':
    case 'is_null':
      return fieldValue === null || fieldValue === undefined || fieldValue === '';
    
    case 'is_not_empty':
    case 'is_not_null':
      return fieldValue !== null && fieldValue !== undefined && fieldValue !== '';

    // Array operators
    case 'includes':
    case 'in':
      if (Array.isArray(fieldValue)) {
        return fieldValue.includes(compareValue);
      }
      if (Array.isArray(compareValue)) {
        return compareValue.includes(fieldValue);
      }
      return false;
    
    case 'not_includes':
    case 'not_in':
      if (Array.isArray(fieldValue)) {
        return !fieldValue.includes(compareValue);
      }
      if (Array.isArray(compareValue)) {
        return !compareValue.includes(fieldValue);
      }
      return true;

    // Date operators
    case 'date_before':
      return new Date(String(fieldValue)) < new Date(String(compareValue));
    
    case 'date_after':
      return new Date(String(fieldValue)) > new Date(String(compareValue));
    
    case 'date_equals':
      return new Date(String(fieldValue)).toDateString() === new Date(String(compareValue)).toDateString();

    default:
      console.warn(`Unknown condition operator: ${operator}`);
      return true; // Default to true for unknown operators
  }
}

// =============================================
// ACTION EXECUTORS
// =============================================

async function executeAction(
  supabase: any,
  action: WorkflowAction,
  context: ExecutionContext,
  organizationId: string
): Promise<Record<string, unknown>> {
  const config = interpolateConfig(action.config, context);

  switch (action.type) {
    case 'send_email':
      return await executeSendEmail(supabase, config, organizationId);
    
    case 'send_sms':
      return await executeSendSMS(supabase, config, organizationId);
    
    case 'send_whatsapp':
      return await executeSendWhatsApp(supabase, config, organizationId);
    
    case 'send_notification':
      return await executeSendNotification(supabase, config, organizationId);
    
    case 'create_task':
      return await executeCreateTask(supabase, config, organizationId, context);
    
    case 'update_field':
      return await executeUpdateField(supabase, config, context);
    
    case 'change_status':
      return await executeChangeStatus(supabase, config, context);
    
    case 'create_activity':
      return await executeCreateActivity(supabase, config, organizationId, context);
    
    case 'generate_document':
      return await executeGenerateDocument(supabase, config, organizationId, context);
    
    case 'share_document':
      return await executeShareDocument(supabase, config, context);
    
    case 'webhook':
      return await executeWebhook(config);
    
    case 'delay':
      return await executeDelay(config);
    
    case 'add_tag':
      return await executeAddTag(supabase, config, context);
    
    case 'remove_tag':
      return await executeRemoveTag(supabase, config, context);
    
    case 'assign_user':
      return await executeAssignUser(supabase, config, context);
    
    case 'create_deadline':
      return await executeCreateDeadline(supabase, config, organizationId, context);
    
    case 'create_invoice':
      return await executeCreateInvoice(supabase, config, organizationId, context);
    
    default:
      console.warn(`Unknown action type: ${action.type}`);
      return { skipped: true, reason: 'unknown_action_type' };
  }
}

// Interpolate template variables in config
function interpolateConfig(config: Record<string, unknown>, context: ExecutionContext): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(config)) {
    if (typeof value === 'string') {
      result[key] = interpolateString(value, context);
    } else if (Array.isArray(value)) {
      result[key] = value.map(item => 
        typeof item === 'string' ? interpolateString(item, context) : item
      );
    } else if (typeof value === 'object' && value !== null) {
      result[key] = interpolateConfig(value as Record<string, unknown>, context);
    } else {
      result[key] = value;
    }
  }
  
  return result;
}

function interpolateString(template: string, context: ExecutionContext): string {
  return template.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
    const value = getNestedValue(context as unknown as Record<string, unknown>, path.trim());
    return value !== undefined ? String(value) : match;
  });
}

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  const parts = path.split('.');
  let current: unknown = obj;
  
  // Handle special prefixes
  const firstPart = parts[0];
  if (firstPart === 'trigger_data' || firstPart === 'trigger') {
    current = (obj as Record<string, unknown>).trigger_data;
    parts.shift();
    // Handle trigger.data.x or trigger_data.x - check first element after shift
    const nextPart = parts[0];
    if (parts.length > 0 && nextPart === 'data') parts.shift();
  } else if (firstPart === 'variables') {
    current = (obj as Record<string, unknown>).variables;
    parts.shift();
  } else if (parts[0] === 'action_outputs' || parts[0] === 'outputs') {
    current = (obj as Record<string, unknown>).action_outputs;
    parts.shift();
  } else if (!['variables', 'action_outputs'].includes(parts[0])) {
    // Check trigger_data first for unknown paths
    const triggerValue = getNestedValueDirect((obj as Record<string, unknown>).trigger_data as Record<string, unknown>, path);
    if (triggerValue !== undefined) return triggerValue;
    
    // Then check variables
    const varValue = getNestedValueDirect((obj as Record<string, unknown>).variables as Record<string, unknown>, path);
    if (varValue !== undefined) return varValue;
  }
  
  for (const part of parts) {
    if (current && typeof current === 'object') {
      current = (current as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }
  
  return current;
}

function getNestedValueDirect(obj: Record<string, unknown> | undefined, path: string): unknown {
  if (!obj) return undefined;
  const parts = path.split('.');
  let current: unknown = obj;
  
  for (const part of parts) {
    if (current && typeof current === 'object') {
      current = (current as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }
  
  return current;
}

// =============================================
// INDIVIDUAL ACTION EXECUTORS
// =============================================

async function executeSendEmail(supabase: any, config: Record<string, unknown>, organizationId: string) {
  const to = config.to as string;
  const subject = config.subject as string;
  const body = config.body as string;
  const templateId = config.template_id as string;

  // Call send-email edge function
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  
  const response = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseServiceKey}`
    },
    body: JSON.stringify({
      to,
      subject,
      html: body,
      template_code: templateId,
      organization_id: organizationId
    })
  });

  const result = await response.json();
  
  return { 
    sent: response.ok, 
    to,
    message_id: result.message_id,
    error: result.error
  };
}

async function executeSendSMS(supabase: any, config: Record<string, unknown>, organizationId: string) {
  const to = config.to as string;
  const message = config.message as string;
  
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  
  const response = await fetch(`${supabaseUrl}/functions/v1/send-sms`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseServiceKey}`
    },
    body: JSON.stringify({ to, message, organization_id: organizationId })
  });

  const result = await response.json();
  return { sent: response.ok, to, ...result };
}

async function executeSendWhatsApp(supabase: any, config: Record<string, unknown>, organizationId: string) {
  const to = config.to as string;
  const templateName = config.template_name as string;
  const templateParams = config.template_params as string[];
  const message = config.message as string;
  
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  
  const response = await fetch(`${supabaseUrl}/functions/v1/send-whatsapp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseServiceKey}`
    },
    body: JSON.stringify({ 
      to, 
      template_name: templateName,
      template_params: templateParams,
      message,
      organization_id: organizationId 
    })
  });

  const result = await response.json();
  return { sent: response.ok, to, ...result };
}

async function executeSendNotification(supabase: any, config: Record<string, unknown>, organizationId: string) {
  const { data, error } = await supabase
    .from('notifications')
    .insert({
      organization_id: organizationId,
      user_id: config.user_id || null,
      title: config.title,
      message: config.message,
      type: config.type || 'info',
      link: config.link || null,
      is_read: false
    })
    .select()
    .single();

  if (error) {
    console.log('[Action] Notification insert failed:', error.message);
    return { sent: false, error: error.message };
  }

  return { sent: true, notification_id: data?.id };
}

async function executeCreateTask(supabase: any, config: Record<string, unknown>, organizationId: string, context: ExecutionContext) {
  const { data, error } = await supabase
    .from('activities')
    .insert({
      organization_id: organizationId,
      owner_type: 'tenant',
      type: 'task',
      subject: config.title,
      content: config.description,
      due_date: config.due_date,
      is_completed: false,
      matter_id: context.trigger_data?.matter_id,
      contact_id: context.trigger_data?.contact_id,
      deal_id: context.trigger_data?.deal_id,
      created_by: config.assignee
    })
    .select()
    .single();

  if (error) throw error;
  return { created: true, task_id: data.id };
}

async function executeUpdateField(supabase: any, config: Record<string, unknown>, context: ExecutionContext) {
  const entity = config.entity as string;
  const field = config.field as string;
  const value = config.value;
  
  const tableMap: Record<string, string> = {
    'matter': 'matters',
    'contact': 'contacts',
    'deal': 'deals',
    'invoice': 'invoices'
  };
  
  const table = tableMap[entity];
  if (!table) throw new Error(`Unknown entity: ${entity}`);
  
  const recordId = context.trigger_data?.[`${entity}_id`] as string;
  if (!recordId) throw new Error(`No ${entity}_id in trigger data`);

  const { error } = await supabase
    .from(table)
    .update({ [field]: value })
    .eq('id', recordId);

  if (error) throw error;
  return { updated: true, entity, field, value };
}

async function executeChangeStatus(supabase: any, config: Record<string, unknown>, context: ExecutionContext) {
  const entity = config.entity as string || 'matter';
  const newStatus = config.status as string;
  
  const tableMap: Record<string, string> = {
    'matter': 'matters',
    'deal': 'deals',
    'invoice': 'invoices'
  };
  
  const table = tableMap[entity];
  if (!table) throw new Error(`Unknown entity: ${entity}`);
  
  const recordId = context.trigger_data?.[`${entity}_id`] as string;
  if (!recordId) throw new Error(`No ${entity}_id in trigger data`);

  const { error } = await supabase
    .from(table)
    .update({ status: newStatus })
    .eq('id', recordId);

  if (error) throw error;
  return { updated: true, entity, new_status: newStatus };
}

async function executeCreateActivity(supabase: any, config: Record<string, unknown>, organizationId: string, context: ExecutionContext) {
  const { data, error } = await supabase
    .from('activities')
    .insert({
      organization_id: organizationId,
      owner_type: 'tenant',
      type: config.type || 'note',
      subject: config.subject,
      content: config.content,
      matter_id: context.trigger_data?.matter_id,
      contact_id: context.trigger_data?.contact_id,
      deal_id: context.trigger_data?.deal_id
    })
    .select()
    .single();

  if (error) throw error;
  return { created: true, activity_id: data.id };
}

async function executeGenerateDocument(supabase: any, config: Record<string, unknown>, organizationId: string, context: ExecutionContext) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  
  const response = await fetch(`${supabaseUrl}/functions/v1/generate-document-ai`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseServiceKey}`
    },
    body: JSON.stringify({
      template_id: config.template_id,
      matter_id: context.trigger_data?.matter_id,
      organization_id: organizationId,
      variables: context.trigger_data
    })
  });

  const result = await response.json();
  return { generated: response.ok, ...result };
}

async function executeShareDocument(supabase: any, config: Record<string, unknown>, context: ExecutionContext) {
  const documentId = config.document_id as string || context.trigger_data?.document_id as string;
  const portalId = config.portal_id as string || context.trigger_data?.portal_id as string;
  
  if (!documentId || !portalId) {
    return { shared: false, reason: 'missing_document_id_or_portal_id' };
  }

  const { error } = await supabase
    .from('portal_shared_content')
    .insert({
      portal_id: portalId,
      content_type: 'document',
      content_id: documentId,
      can_download: config.can_download !== false,
      expires_at: config.expires_at
    });

  if (error) throw error;
  return { shared: true, document_id: documentId };
}

async function executeWebhook(config: Record<string, unknown>) {
  const url = config.url as string;
  const method = (config.method as string) || 'POST';
  const headers = (config.headers as Record<string, string>) || {};
  const body = config.body;

  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    body: body ? JSON.stringify(body) : undefined
  });

  const responseData = await response.text();
  
  return {
    status: response.status,
    ok: response.ok,
    response: responseData
  };
}

async function executeDelay(config: Record<string, unknown>) {
  const duration = config.duration as number;
  const unit = config.unit as string;
  
  let ms = duration;
  switch (unit) {
    case 'minutes':
      ms = duration * 60 * 1000;
      break;
    case 'hours':
      ms = duration * 60 * 60 * 1000;
      break;
    case 'days':
      ms = duration * 24 * 60 * 60 * 1000;
      break;
  }

  // Cap at 30 seconds for edge function limits
  const actualDelay = Math.min(ms, 30000);
  await new Promise(resolve => setTimeout(resolve, actualDelay));
  
  return { delayed: true, requested_ms: ms, actual_ms: actualDelay };
}

async function executeAddTag(supabase: any, config: Record<string, unknown>, context: ExecutionContext) {
  const tag = config.tag as string;
  const entityId = context.trigger_data?.matter_id || context.trigger_data?.contact_id || context.trigger_data?.deal_id;
  const table = context.trigger_data?.matter_id ? 'matters' : 
                context.trigger_data?.contact_id ? 'contacts' : 'deals';

  if (!entityId) return { skipped: true, reason: 'no_entity_id' };

  const { data: entity } = await supabase
    .from(table)
    .select('tags')
    .eq('id', entityId)
    .single();

  const currentTags = (entity?.tags || []) as string[];
  if (!currentTags.includes(tag)) {
    const { error } = await supabase
      .from(table)
      .update({ tags: [...currentTags, tag] })
      .eq('id', entityId);

    if (error) throw error;
  }

  return { added: true, tag };
}

async function executeRemoveTag(supabase: any, config: Record<string, unknown>, context: ExecutionContext) {
  const tag = config.tag as string;
  const entityId = context.trigger_data?.matter_id || context.trigger_data?.contact_id || context.trigger_data?.deal_id;
  const table = context.trigger_data?.matter_id ? 'matters' : 
                context.trigger_data?.contact_id ? 'contacts' : 'deals';

  if (!entityId) return { skipped: true, reason: 'no_entity_id' };

  const { data: entity } = await supabase
    .from(table)
    .select('tags')
    .eq('id', entityId)
    .single();

  const currentTags = (entity?.tags || []) as string[];
  const newTags = currentTags.filter(t => t !== tag);

  const { error } = await supabase
    .from(table)
    .update({ tags: newTags })
    .eq('id', entityId);

  if (error) throw error;
  return { removed: true, tag };
}

async function executeAssignUser(supabase: any, config: Record<string, unknown>, context: ExecutionContext) {
  const userId = config.user_id as string;
  const entityId = context.trigger_data?.matter_id || context.trigger_data?.deal_id;
  const table = context.trigger_data?.matter_id ? 'matters' : 'deals';

  if (!entityId) return { skipped: true, reason: 'no_entity_id' };

  const { error } = await supabase
    .from(table)
    .update({ assigned_to: userId })
    .eq('id', entityId);

  if (error) throw error;
  return { assigned: true, user_id: userId };
}

async function executeCreateDeadline(supabase: any, config: Record<string, unknown>, organizationId: string, context: ExecutionContext) {
  const matterId = context.trigger_data?.matter_id as string;
  if (!matterId) return { skipped: true, reason: 'no_matter_id' };

  const { data, error } = await supabase
    .from('matter_deadlines')
    .insert({
      organization_id: organizationId,
      matter_id: matterId,
      description: config.description,
      deadline_date: config.date,
      deadline_type: config.type || 'custom',
      is_critical: config.is_critical || false,
      status: 'pending'
    })
    .select()
    .single();

  if (error) throw error;
  return { created: true, deadline_id: data.id };
}

async function executeCreateInvoice(supabase: any, config: Record<string, unknown>, organizationId: string, context: ExecutionContext) {
  const clientId = context.trigger_data?.client_id as string;
  const matterId = context.trigger_data?.matter_id as string;

  // Get next invoice number
  const { data: lastInvoice } = await supabase
    .from('invoices')
    .select('invoice_number')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  const nextNumber = lastInvoice?.invoice_number 
    ? `INV-${String(parseInt(lastInvoice.invoice_number.replace('INV-', '')) + 1).padStart(5, '0')}`
    : 'INV-00001';

  const { data, error } = await supabase
    .from('invoices')
    .insert({
      organization_id: organizationId,
      client_id: clientId,
      matter_id: matterId,
      invoice_number: nextNumber,
      amount: config.amount || 0,
      currency: config.currency || 'EUR',
      status: 'draft',
      due_date: config.due_date
    })
    .select()
    .single();

  if (error) throw error;
  return { created: true, invoice_id: data.id, invoice_number: nextNumber };
}
