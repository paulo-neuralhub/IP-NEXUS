import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Workflow Scheduler
 * 
 * Processes scheduled workflows (daily, weekly, monthly) and deadline-based triggers.
 * Should be called periodically via cron job.
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentHour = now.getUTCHours();
    const dayOfWeek = now.getUTCDay(); // 0=Sunday, 1=Monday, etc.
    const dayOfMonth = now.getUTCDate();

    console.log(`[Scheduler] Running at ${now.toISOString()}`);
    console.log(`[Scheduler] Day: ${dayOfWeek}, Hour: ${currentHour}, Date: ${dayOfMonth}`);

    const results = {
      scheduled_workflows: 0,
      deadline_workflows: 0,
      errors: [] as string[]
    };

    // =============================================
    // 1. PROCESS SCHEDULED WORKFLOWS
    // =============================================

    const { data: scheduledWorkflows, error: schedError } = await supabase
      .from('workflow_templates')
      .select('*')
      .eq('is_active', true)
      .in('trigger_type', ['schedule.daily', 'schedule.weekly', 'schedule.monthly']);

    if (schedError) {
      console.error('[Scheduler] Error fetching scheduled workflows:', schedError);
      results.errors.push(schedError.message);
    }

    if (scheduledWorkflows) {
      for (const workflow of scheduledWorkflows) {
        const config = workflow.trigger_config || {};
        let shouldRun = false;

        switch (workflow.trigger_type) {
          case 'schedule.daily':
            // Check if current hour matches configured hour (default 9)
            const dailyHour = config.hour ?? 9;
            shouldRun = currentHour === dailyHour;
            break;

          case 'schedule.weekly':
            // Check day of week and hour
            const weeklyDay = config.day_of_week ?? 1; // Default Monday
            const weeklyHour = config.hour ?? 9;
            shouldRun = dayOfWeek === weeklyDay && currentHour === weeklyHour;
            break;

          case 'schedule.monthly':
            // Check day of month and hour
            const monthlyDay = config.day_of_month ?? 1;
            const monthlyHour = config.hour ?? 9;
            shouldRun = dayOfMonth === monthlyDay && currentHour === monthlyHour;
            break;
        }

        if (shouldRun) {
          // Check if already run today
          const { data: lastRun } = await supabase
            .from('workflow_executions')
            .select('id')
            .eq('workflow_id', workflow.id)
            .gte('started_at', `${today}T00:00:00Z`)
            .limit(1)
            .single();

          if (lastRun) {
            console.log(`[Scheduler] Workflow ${workflow.code} already ran today, skipping`);
            continue;
          }

          console.log(`[Scheduler] Triggering scheduled workflow: ${workflow.code}`);

          try {
            await supabase.functions.invoke('workflow-execute', {
              body: {
                trigger_type: workflow.trigger_type,
                trigger_data: { 
                  scheduled_time: now.toISOString(),
                  trigger_reason: workflow.trigger_type
                },
                organization_id: workflow.organization_id
              }
            });
            results.scheduled_workflows++;
          } catch (e: unknown) {
            const errMsg = e instanceof Error ? e.message : 'Unknown error';
            console.error(`[Scheduler] Error triggering workflow ${workflow.code}:`, e);
            results.errors.push(`${workflow.code}: ${errMsg}`);
          }
        }
      }
    }

    // =============================================
    // 2. PROCESS DEADLINE-BASED WORKFLOWS
    // =============================================

    // Find deadlines approaching in the next 30 days
    const futureDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const { data: upcomingDeadlines, error: deadlineError } = await supabase
      .from('matter_deadlines')
      .select(`
        *,
        matter:matters(id, organization_id, reference, title, client_id)
      `)
      .eq('status', 'pending')
      .gte('deadline_date', today)
      .lte('deadline_date', futureDate.toISOString().split('T')[0]);

    if (deadlineError) {
      console.error('[Scheduler] Error fetching deadlines:', deadlineError);
      results.errors.push(deadlineError.message);
    }

    if (upcomingDeadlines) {
      for (const deadline of upcomingDeadlines) {
        if (!deadline.matter?.organization_id) continue;

        const deadlineDate = new Date(deadline.deadline_date);
        const daysRemaining = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        // Check for workflows triggered by deadline.approaching
        const { data: deadlineWorkflows } = await supabase
          .from('workflow_templates')
          .select('*')
          .eq('organization_id', deadline.matter.organization_id)
          .eq('trigger_type', 'deadline.approaching')
          .eq('is_active', true);

        if (!deadlineWorkflows) continue;

        for (const workflow of deadlineWorkflows) {
          const config = workflow.trigger_config || {};
          const triggerDays = config.days_before || [7, 30]; // Default: 7 and 30 days before

          if (!triggerDays.includes(daysRemaining)) continue;

          // Check if already triggered for this deadline + days_before combo
          const executionKey = `${deadline.id}-${daysRemaining}`;
          const { data: existingExec } = await supabase
            .from('workflow_executions')
            .select('id')
            .eq('workflow_id', workflow.id)
            .contains('trigger_data', { deadline_id: deadline.id, days_before: daysRemaining })
            .limit(1)
            .single();

          if (existingExec) {
            console.log(`[Scheduler] Deadline workflow already triggered for ${executionKey}`);
            continue;
          }

          console.log(`[Scheduler] Triggering deadline workflow for ${deadline.matter.reference}, ${daysRemaining} days before`);

          try {
            await supabase.functions.invoke('workflow-execute', {
              body: {
                trigger_type: 'deadline.approaching',
                trigger_data: {
                  deadline_id: deadline.id,
                  deadline_date: deadline.deadline_date,
                  deadline_description: deadline.description,
                  days_remaining: daysRemaining,
                  days_before: daysRemaining,
                  matter_id: deadline.matter_id,
                  matter_reference: deadline.matter?.reference,
                  matter_title: deadline.matter?.title,
                  client_id: deadline.matter?.client_id,
                  is_critical: deadline.is_critical
                },
                organization_id: deadline.matter.organization_id
              }
            });
            results.deadline_workflows++;
          } catch (e: unknown) {
            const errMsg = e instanceof Error ? e.message : 'Unknown error';
            console.error(`[Scheduler] Error triggering deadline workflow:`, e);
            results.errors.push(errMsg);
          }
        }
      }
    }

    // =============================================
    // 3. PROCESS DEADLINE REACHED (TODAY)
    // =============================================

    const { data: todayDeadlines } = await supabase
      .from('matter_deadlines')
      .select(`*, matter:matters(id, organization_id, reference, title, client_id)`)
      .eq('status', 'pending')
      .eq('deadline_date', today);

    if (todayDeadlines && currentHour === 8) { // Run at 8 AM
      for (const deadline of todayDeadlines) {
        if (!deadline.matter?.organization_id) continue;

        // Check for deadline.reached workflows
        const { data: reachedWorkflows } = await supabase
          .from('workflow_templates')
          .select('*')
          .eq('organization_id', deadline.matter.organization_id)
          .eq('trigger_type', 'deadline.reached')
          .eq('is_active', true);

        if (!reachedWorkflows) continue;

        for (const workflow of reachedWorkflows) {
          // Check if already triggered today
          const { data: existingExec } = await supabase
            .from('workflow_executions')
            .select('id')
            .eq('workflow_id', workflow.id)
            .contains('trigger_data', { deadline_id: deadline.id })
            .gte('started_at', `${today}T00:00:00Z`)
            .limit(1)
            .single();

          if (existingExec) continue;

          console.log(`[Scheduler] Triggering deadline.reached for ${deadline.matter.reference}`);

          try {
            await supabase.functions.invoke('workflow-execute', {
              body: {
                trigger_type: 'deadline.reached',
                trigger_data: {
                  deadline_id: deadline.id,
                  deadline_date: deadline.deadline_date,
                  deadline_description: deadline.description,
                  matter_id: deadline.matter_id,
                  matter_reference: deadline.matter?.reference,
                  matter_title: deadline.matter?.title,
                  client_id: deadline.matter?.client_id,
                  is_critical: deadline.is_critical
                },
                organization_id: deadline.matter.organization_id
              }
            });
            results.deadline_workflows++;
          } catch (e: unknown) {
            const errMsg = e instanceof Error ? e.message : 'Unknown error';
            results.errors.push(errMsg);
          }
        }
      }
    }

    // =============================================
    // 4. PROCESS OVERDUE INVOICES
    // =============================================

    if (currentHour === 9) { // Run at 9 AM
      const { data: overdueInvoices } = await supabase
        .from('invoices')
        .select('*, client:contacts(id, name, email)')
        .eq('status', 'pending')
        .lt('due_date', today);

      if (overdueInvoices) {
        for (const invoice of overdueInvoices) {
          const { data: overdueWorkflows } = await supabase
            .from('workflow_templates')
            .select('*')
            .eq('organization_id', invoice.organization_id)
            .eq('trigger_type', 'invoice.overdue')
            .eq('is_active', true);

          if (!overdueWorkflows) continue;

          for (const workflow of overdueWorkflows) {
            // Check if already triggered for this invoice today
            const { data: existingExec } = await supabase
              .from('workflow_executions')
              .select('id')
              .eq('workflow_id', workflow.id)
              .contains('trigger_data', { invoice_id: invoice.id })
              .gte('started_at', `${today}T00:00:00Z`)
              .limit(1)
              .single();

            if (existingExec) continue;

            const daysOverdue = Math.floor((now.getTime() - new Date(invoice.due_date).getTime()) / (1000 * 60 * 60 * 24));

            console.log(`[Scheduler] Triggering invoice.overdue for ${invoice.invoice_number}`);

            try {
              await supabase.functions.invoke('workflow-execute', {
                body: {
                  trigger_type: 'invoice.overdue',
                  trigger_data: {
                    invoice_id: invoice.id,
                    invoice_number: invoice.invoice_number,
                    amount: invoice.amount,
                    currency: invoice.currency,
                    due_date: invoice.due_date,
                    days_overdue: daysOverdue,
                    client_id: invoice.client_id,
                    client_name: invoice.client?.name,
                    client_email: invoice.client?.email
                  },
                  organization_id: invoice.organization_id
                }
              });
            } catch (e: unknown) {
              const errMsg = e instanceof Error ? e.message : 'Unknown error';
              results.errors.push(errMsg);
            }
          }
        }
      }
    }

    console.log(`[Scheduler] Completed. Scheduled: ${results.scheduled_workflows}, Deadline: ${results.deadline_workflows}, Errors: ${results.errors.length}`);

    return new Response(JSON.stringify({
      success: true,
      ...results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: unknown) {
    console.error('[Scheduler] Fatal error:', error);
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
