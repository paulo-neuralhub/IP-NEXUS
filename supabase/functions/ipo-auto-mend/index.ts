import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DiagnosisResult {
  endpointTest: { status: 'ok' | 'failed'; latencyMs?: number; error?: string };
  authTest: { status: 'ok' | 'failed'; error?: string };
  scraperTest?: { status: 'ok' | 'failed'; selectorsValid: number; selectorsBroken: number };
  logAnalysis: { recentErrors: number; errorPattern?: string; suggestedAction?: string };
}

interface AutoMendAction {
  action: string;
  success: boolean;
  timestamp: string;
  details?: Record<string, unknown>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { officeId, connectionMethodId, triggerType } = await req.json();
    console.log('Auto-Mend started:', { officeId, connectionMethodId, triggerType });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    let userId = null;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id;
    }

    // Create job record
    const { data: job, error: jobError } = await supabase
      .from('ipo_automend_jobs')
      .insert({
        office_id: officeId,
        connection_method_id: connectionMethodId,
        trigger_type: triggerType,
        triggered_by: userId,
        status: 'running',
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (jobError) {
      console.error('Failed to create job:', jobError);
      throw new Error('Failed to create auto-mend job');
    }

    const jobId = job.id;
    const actionsTaken: AutoMendAction[] = [];

    try {
      // Update status to diagnosing
      await supabase.from('ipo_automend_jobs').update({ status: 'diagnosing' }).eq('id', jobId);

      // PHASE 1: Diagnosis
      const diagnosis = await runDiagnosis(supabase, connectionMethodId);
      await supabase.from('ipo_automend_jobs').update({ diagnosis_results: diagnosis }).eq('id', jobId);

      // PHASE 2: Determine required actions
      const requiredActions = determineActions(diagnosis);
      console.log('Required actions:', requiredActions);

      // PHASE 3: Execute repairs
      await supabase.from('ipo_automend_jobs').update({ status: 'repairing' }).eq('id', jobId);

      for (const action of requiredActions) {
        const result = await executeAction(supabase, action, officeId, connectionMethodId, diagnosis);
        actionsTaken.push(result);
        
        if (!result.success && action === 'activate_failover') {
          break;
        }
      }

      // PHASE 4: Verify recovery
      const recoveryTest = await verifyRecovery(supabase, connectionMethodId);
      
      // Determine final status
      const finalStatus = determineFinalStatus(diagnosis, actionsTaken, recoveryTest);

      // Update job with results
      await supabase.from('ipo_automend_jobs').update({
        status: actionsTaken.some(a => !a.success) ? 'partial' : 'success',
        actions_taken: actionsTaken,
        final_status: finalStatus,
        completed_at: new Date().toISOString(),
      }).eq('id', jobId);

      // Create alert if human intervention needed
      if (finalStatus === 'human_intervention_needed') {
        await supabase.from('ipo_alerts').insert({
          office_id: officeId,
          alert_type: 'automend_needs_human',
          severity: 'critical',
          data: { diagnosis, actions: actionsTaken, message: 'Auto-Mend no pudo recuperar la conexión.' },
        });
      }

      console.log('Auto-Mend completed:', { jobId, finalStatus, actionsTaken: actionsTaken.length });

      return new Response(JSON.stringify({
        success: finalStatus !== 'human_intervention_needed',
        jobId,
        finalStatus,
        actionsTaken,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (error) {
      console.error('Auto-Mend error:', error);
      await supabase.from('ipo_automend_jobs').update({
        status: 'failed',
        error_summary: error instanceof Error ? error.message : 'Unknown error',
        completed_at: new Date().toISOString(),
      }).eq('id', jobId);
      throw error;
    }

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function runDiagnosis(supabase: any, connectionMethodId: string): Promise<DiagnosisResult> {
  const [endpointTest, authTest, scraperTest, logAnalysis] = await Promise.all([
    testEndpoint(supabase, connectionMethodId),
    testAuth(supabase, connectionMethodId),
    testScraper(supabase, connectionMethodId),
    analyzeRecentLogs(supabase, connectionMethodId),
  ]);

  return { endpointTest, authTest, scraperTest, logAnalysis };
}

async function testEndpoint(supabase: any, connectionMethodId: string): Promise<DiagnosisResult['endpointTest']> {
  try {
    const { data: method } = await supabase
      .from('ipo_connection_methods')
      .select('method_type')
      .eq('id', connectionMethodId)
      .single();

    if (!method) {
      return { status: 'failed', error: 'Connection method not found' };
    }

    // For API methods, try to get the API config and test it
    if (method.method_type === 'api') {
      const { data: apiConfig } = await supabase
        .from('ipo_api_configs')
        .select('base_url')
        .eq('connection_method_id', connectionMethodId)
        .single();

      if (apiConfig?.base_url) {
        const startTime = Date.now();
        try {
          const response = await fetch(apiConfig.base_url, {
            method: 'HEAD',
            signal: AbortSignal.timeout(10000),
          });
          return {
            status: response.ok ? 'ok' : 'failed',
            latencyMs: Date.now() - startTime,
            error: response.ok ? undefined : `HTTP ${response.status}`,
          };
        } catch (fetchError) {
          return {
            status: 'failed',
            error: fetchError instanceof Error ? fetchError.message : 'Fetch failed',
          };
        }
      }
    }

    return { status: 'ok' };
  } catch (error) {
    return {
      status: 'failed',
      error: error instanceof Error ? error.message : 'Connection failed',
    };
  }
}

async function testAuth(supabase: any, connectionMethodId: string): Promise<DiagnosisResult['authTest']> {
  try {
    // Check if there are active credentials
    const { data: credentials } = await supabase
      .from('ipo_credentials')
      .select('id, is_active, expires_at')
      .eq('connection_method_id', connectionMethodId)
      .eq('is_active', true)
      .single();

    if (!credentials) {
      return { status: 'failed', error: 'No active credentials found' };
    }

    if (credentials.expires_at && new Date(credentials.expires_at) < new Date()) {
      return { status: 'failed', error: 'Credentials expired' };
    }

    return { status: 'ok' };
  } catch (error) {
    return {
      status: 'failed',
      error: error instanceof Error ? error.message : 'Auth test failed',
    };
  }
}

async function testScraper(supabase: any, connectionMethodId: string): Promise<DiagnosisResult['scraperTest'] | undefined> {
  try {
    const { data: method } = await supabase
      .from('ipo_connection_methods')
      .select('method_type')
      .eq('id', connectionMethodId)
      .single();

    if (method?.method_type !== 'scraper') {
      return undefined;
    }

    const { data: scraperConfig } = await supabase
      .from('ipo_scraper_configs')
      .select('selectors')
      .eq('connection_method_id', connectionMethodId)
      .single();

    if (!scraperConfig?.selectors) {
      return { status: 'failed', selectorsValid: 0, selectorsBroken: 0 };
    }

    // Count selectors (simplified check - just verify structure exists)
    const selectors = scraperConfig.selectors as Record<string, unknown>;
    const selectorCount = Object.keys(selectors).length;

    return {
      status: selectorCount > 0 ? 'ok' : 'failed',
      selectorsValid: selectorCount,
      selectorsBroken: 0,
    };
  } catch (error) {
    return {
      status: 'failed',
      selectorsValid: 0,
      selectorsBroken: -1,
    };
  }
}

async function analyzeRecentLogs(supabase: any, connectionMethodId: string): Promise<DiagnosisResult['logAnalysis']> {
  try {
    const { data: logs } = await supabase
      .from('ipo_sync_logs')
      .select('errors, status')
      .eq('connection_method_id', connectionMethodId)
      .gte('started_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('started_at', { ascending: false })
      .limit(20);

    const errors = logs?.flatMap(l => (l.errors as unknown[]) || []) || [];

    const { data: patterns } = await supabase
      .from('ipo_error_patterns')
      .select('*');

    let matchedPattern: string | undefined;
    let suggestedAction: string | undefined;

    for (const error of errors) {
      const errorStr = JSON.stringify(error).toLowerCase();
      
      for (const pattern of patterns || []) {
        if (pattern.error_message_pattern && 
            new RegExp(pattern.error_message_pattern, 'i').test(errorStr)) {
          matchedPattern = pattern.category;
          suggestedAction = pattern.recommended_action;
          break;
        }
      }
      if (matchedPattern) break;
    }

    return {
      recentErrors: errors.length,
      errorPattern: matchedPattern,
      suggestedAction,
    };
  } catch (error) {
    console.error('Error analyzing logs:', error);
    return { recentErrors: 0 };
  }
}

function determineActions(diagnosis: DiagnosisResult): string[] {
  const actions: string[] = [];

  if (diagnosis.authTest.status === 'failed') {
    actions.push('rotate_credentials');
  }

  if (diagnosis.scraperTest?.status === 'failed' && 
      diagnosis.scraperTest.selectorsBroken > 0) {
    actions.push('regenerate_scraper');
  }

  if (diagnosis.logAnalysis.errorPattern === 'rate_limit') {
    actions.push('reduce_rate_limit');
  }

  if (diagnosis.endpointTest.status === 'failed' || 
      (diagnosis.authTest.status === 'failed' && !actions.includes('rotate_credentials'))) {
    actions.push('activate_failover');
  }

  if (actions.length === 0 && 
      (diagnosis.endpointTest.status === 'failed' || 
       diagnosis.authTest.status === 'failed')) {
    actions.push('set_maintenance_mode');
  }

  return actions;
}

async function executeAction(
  supabase: any, 
  action: string, 
  officeId: string, 
  connectionMethodId: string,
  _diagnosis: DiagnosisResult
): Promise<AutoMendAction> {
  const timestamp = new Date().toISOString();

  try {
    switch (action) {
      case 'rotate_credentials':
        return await rotateCredentials(supabase, connectionMethodId, officeId, timestamp);
      
      case 'reduce_rate_limit':
        return await reduceRateLimit(supabase, connectionMethodId, timestamp);
      
      case 'activate_failover':
        return await activateFailover(supabase, officeId, connectionMethodId, timestamp);
      
      case 'set_maintenance_mode':
        return await setMaintenanceMode(supabase, officeId, timestamp);
      
      default:
        return { action, success: false, timestamp, details: { error: 'Unknown action' } };
    }
  } catch (error) {
    return {
      action,
      success: false,
      timestamp,
      details: { error: error instanceof Error ? error.message : 'Action failed' },
    };
  }
}

async function rotateCredentials(
  supabase: any, 
  connectionMethodId: string, 
  officeId: string,
  timestamp: string
): Promise<AutoMendAction> {
  const { error } = await supabase
    .from('ipo_credentials')
    .update({ is_active: false })
    .eq('connection_method_id', connectionMethodId)
    .eq('is_active', true);

  // Create alert for manual credential rotation
  await supabase.from('ipo_alerts').insert({
    office_id: officeId,
    alert_type: 'credential_rotation_needed',
    severity: 'high',
    data: { connectionMethodId, message: 'Las credenciales han expirado o son inválidas.' },
  });

  return {
    action: 'rotate_credentials',
    success: !error,
    timestamp,
    details: { message: 'Credentials marked for rotation, human action required' },
  };
}

async function reduceRateLimit(
  supabase: any, 
  connectionMethodId: string, 
  timestamp: string
): Promise<AutoMendAction> {
  const { data: method } = await supabase
    .from('ipo_connection_methods')
    .select('rate_limit_requests, rate_limit_period')
    .eq('id', connectionMethodId)
    .single();

  const currentLimit = (method?.rate_limit_requests as number) || 100;
  const newLimit = Math.max(10, Math.floor(currentLimit * 0.5));

  const { error } = await supabase
    .from('ipo_connection_methods')
    .update({ rate_limit_requests: newLimit })
    .eq('id', connectionMethodId);

  return {
    action: 'reduce_rate_limit',
    success: !error,
    timestamp,
    details: { previousLimit: currentLimit, newLimit },
  };
}

async function activateFailover(
  supabase: any, 
  officeId: string, 
  connectionMethodId: string, 
  timestamp: string
): Promise<AutoMendAction> {
  const { data: methods } = await supabase
    .from('ipo_connection_methods')
    .select('*')
    .eq('office_id', officeId)
    .eq('is_enabled', true)
    .neq('id', connectionMethodId)
    .order('priority', { ascending: true });

  const nextMethod = methods?.find((m: any) => m.health_status !== 'unhealthy');

  if (!nextMethod) {
    return {
      action: 'activate_failover',
      success: false,
      timestamp,
      details: { error: 'No healthy backup method available' },
    };
  }

  await supabase
    .from('ipo_connection_methods')
    .update({ priority: 99, health_status: 'unhealthy' })
    .eq('id', connectionMethodId);

  await supabase
    .from('ipo_connection_methods')
    .update({ priority: 1 })
    .eq('id', nextMethod.id);

  return {
    action: 'activate_failover',
    success: true,
    timestamp,
    details: { fromMethod: connectionMethodId, toMethod: nextMethod.id, toMethodType: nextMethod.method_type },
  };
}

async function setMaintenanceMode(
  supabase: any, 
  officeId: string, 
  timestamp: string
): Promise<AutoMendAction> {
  const { error } = await supabase
    .from('ipo_offices')
    .update({ status: 'maintenance' })
    .eq('id', officeId);

  return { action: 'set_maintenance_mode', success: !error, timestamp };
}

async function verifyRecovery(
  supabase: any, 
  connectionMethodId: string
): Promise<{ recovered: boolean; details: DiagnosisResult }> {
  const diagnosis = await runDiagnosis(supabase, connectionMethodId);
  
  return {
    recovered: diagnosis.endpointTest.status === 'ok' && diagnosis.authTest.status === 'ok',
    details: diagnosis,
  };
}

function determineFinalStatus(
  _diagnosis: DiagnosisResult, 
  actions: AutoMendAction[], 
  recovery: { recovered: boolean }
): string {
  if (recovery.recovered) return 'fully_recovered';
  const successfulActions = actions.filter(a => a.success);
  if (successfulActions.some(a => a.action === 'activate_failover')) return 'failover_activated';
  if (successfulActions.length > 0) return 'partially_recovered';
  return 'human_intervention_needed';
}
