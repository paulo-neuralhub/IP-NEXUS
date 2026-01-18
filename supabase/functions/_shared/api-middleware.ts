import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface ApiAuthResult {
  isValid: boolean;
  organizationId?: string;
  scopes?: string[];
  apiKeyId?: string;
  error?: string;
  statusCode?: number;
}

export async function authenticateApiRequest(req: Request): Promise<ApiAuthResult> {
  const authHeader = req.headers.get('Authorization');
  const apiKey = req.headers.get('X-API-Key');
  const key = apiKey || (authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null);
  
  if (!key) {
    return { isValid: false, error: 'API key required', statusCode: 401 };
  }
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const { data, error } = await supabase.rpc('verify_api_key', { p_key: key });
  
  if (error || !data || !data[0]?.is_valid) {
    return { isValid: false, error: 'Invalid API key', statusCode: 401 };
  }
  
  const result = data[0];
  
  if (result.rate_limit_exceeded) {
    return { isValid: false, error: 'Rate limit exceeded', statusCode: 429 };
  }
  
  await supabase.rpc('increment_rate_limit', { p_api_key_id: result.api_key_id });
  
  return {
    isValid: true,
    organizationId: result.organization_id,
    scopes: result.scopes,
    apiKeyId: result.api_key_id,
  };
}

export function hasScope(scopes: string[], required: string | string[]): boolean {
  if (scopes.includes('admin')) return true;
  const requiredScopes = Array.isArray(required) ? required : [required];
  return requiredScopes.some(r => {
    if (scopes.includes(r)) return true;
    if (r.includes(':')) {
      const [, action] = r.split(':');
      return scopes.includes(action);
    }
    return false;
  });
}

export function apiResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
    },
  });
}

export function apiError(message: string, status = 400) {
  return apiResponse({ error: message }, status);
}
