import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
};

function apiResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: corsHeaders });
}

function apiError(message: string, status = 400) {
  return apiResponse({ error: message }, status);
}

interface AuthResult {
  isValid: boolean;
  organizationId?: string;
  scopes?: string[];
  apiKeyId?: string;
  error?: string;
  statusCode?: number;
}

async function authenticateRequest(req: Request): Promise<AuthResult> {
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

function hasScope(scopes: string[], required: string): boolean {
  if (scopes.includes('admin')) return true;
  if (scopes.includes(required)) return true;
  if (required.includes(':')) {
    const [, action] = required.split(':');
    return scopes.includes(action);
  }
  return false;
}

serve(async (req) => {
  const startTime = Date.now();
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  const auth = await authenticateRequest(req);
  
  if (!auth.isValid) {
    return apiError(auth.error!, auth.statusCode!);
  }
  
  // deno-lint-ignore no-explicit-any
  const supabase: any = createClient(supabaseUrl, supabaseServiceKey);
  const url = new URL(req.url);
  const path = url.pathname.replace(/^\/api-v1\/?/, '').replace(/^\/+|\/+$/g, '');
  const segments = path.split('/').filter(Boolean);
  
  let response: Response;
  
  try {
    switch (segments[0]) {
      case 'matters':
        response = await handleMatters(req, segments, auth, supabase, url);
        break;
      case 'contacts':
        response = await handleContacts(req, segments, auth, supabase, url);
        break;
      case 'deadlines':
        response = await handleDeadlines(req, segments, auth, supabase, url);
        break;
      case 'documents':
        response = await handleDocuments(req, segments, auth, supabase, url);
        break;
      case 'invoices':
        response = await handleInvoices(req, segments, auth, supabase, url);
        break;
      case 'health':
        response = apiResponse({ status: 'ok', timestamp: new Date().toISOString() });
        break;
      default:
        response = apiError('Endpoint not found', 404);
    }
  } catch (error: unknown) {
    console.error('API error:', error);
    response = apiError(error instanceof Error ? error.message : 'Internal error', 500);
  }
  
  // Log request
  const responseTime = Date.now() - startTime;
  try {
    await supabase.from('api_logs').insert({
      api_key_id: auth.apiKeyId,
      organization_id: auth.organizationId,
      method: req.method,
      endpoint: url.pathname,
      query_params: Object.fromEntries(url.searchParams),
      status_code: response.status,
      response_time_ms: responseTime,
      ip_address: req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip'),
      user_agent: req.headers.get('user-agent'),
    });
  } catch (e) {
    console.error('Failed to log request:', e);
  }
  
  return response;
});

// deno-lint-ignore no-explicit-any
async function handleMatters(req: Request, segments: string[], auth: AuthResult, supabase: any, url: URL): Promise<Response> {
  const [, matterId] = segments;
  const orgId = auth.organizationId!;
  
  switch (req.method) {
    case 'GET':
      if (!hasScope(auth.scopes!, 'matters:read')) return apiError('Insufficient permissions', 403);
      
      if (matterId) {
        const { data, error } = await supabase.from('matters').select('*').eq('id', matterId).eq('organization_id', orgId).single();
        if (error || !data) return apiError('Matter not found', 404);
        return apiResponse(data);
      } else {
        const page = parseInt(url.searchParams.get('page') || '1');
        const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100);
        let query = supabase.from('matters').select('*', { count: 'exact' }).eq('organization_id', orgId).order('created_at', { ascending: false }).range((page - 1) * limit, page * limit - 1);
        const ipType = url.searchParams.get('ip_type');
        const status = url.searchParams.get('status');
        if (ipType) query = query.eq('ip_type', ipType);
        if (status) query = query.eq('status', status);
        const { data, count, error } = await query;
        if (error) return apiError(error.message, 400);
        return apiResponse({ data, pagination: { page, limit, total: count, total_pages: Math.ceil((count || 0) / limit) } });
      }
    
    case 'POST':
      if (!hasScope(auth.scopes!, 'matters:write')) return apiError('Insufficient permissions', 403);
      const createData = await req.json();
      const { data: newMatter, error: createError } = await supabase.from('matters').insert({ ...createData, organization_id: orgId }).select().single();
      if (createError) return apiError(createError.message, 400);
      return apiResponse(newMatter, 201);
    
    case 'PATCH':
    case 'PUT':
      if (!hasScope(auth.scopes!, 'matters:write')) return apiError('Insufficient permissions', 403);
      if (!matterId) return apiError('Matter ID required', 400);
      const updateData = await req.json();
      const { data: updatedMatter, error: updateError } = await supabase.from('matters').update({ ...updateData, updated_at: new Date().toISOString() }).eq('id', matterId).eq('organization_id', orgId).select().single();
      if (updateError) return apiError(updateError.message, 400);
      return apiResponse(updatedMatter);
    
    case 'DELETE':
      if (!hasScope(auth.scopes!, 'delete')) return apiError('Insufficient permissions', 403);
      if (!matterId) return apiError('Matter ID required', 400);
      const { error: deleteError } = await supabase.from('matters').delete().eq('id', matterId).eq('organization_id', orgId);
      if (deleteError) return apiError(deleteError.message, 400);
      return apiResponse({ deleted: true });
    
    default:
      return apiError('Method not allowed', 405);
  }
}

// deno-lint-ignore no-explicit-any
async function handleContacts(req: Request, segments: string[], auth: AuthResult, supabase: any, url: URL): Promise<Response> {
  const [, contactId] = segments;
  const orgId = auth.organizationId!;
  
  switch (req.method) {
    case 'GET':
      if (!hasScope(auth.scopes!, 'contacts:read')) return apiError('Insufficient permissions', 403);
      if (contactId) {
        const { data, error } = await supabase.from('contacts').select('*').eq('id', contactId).eq('organization_id', orgId).single();
        if (error || !data) return apiError('Contact not found', 404);
        return apiResponse(data);
      } else {
        const page = parseInt(url.searchParams.get('page') || '1');
        const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100);
        const { data, count, error } = await supabase.from('contacts').select('*', { count: 'exact' }).eq('organization_id', orgId).order('created_at', { ascending: false }).range((page - 1) * limit, page * limit - 1);
        if (error) return apiError(error.message, 400);
        return apiResponse({ data, pagination: { page, limit, total: count, total_pages: Math.ceil((count || 0) / limit) } });
      }
    case 'POST':
      if (!hasScope(auth.scopes!, 'contacts:write')) return apiError('Insufficient permissions', 403);
      const createData = await req.json();
      const { data: newContact, error: createError } = await supabase.from('contacts').insert({ ...createData, organization_id: orgId }).select().single();
      if (createError) return apiError(createError.message, 400);
      return apiResponse(newContact, 201);
    case 'PATCH':
      if (!hasScope(auth.scopes!, 'contacts:write')) return apiError('Insufficient permissions', 403);
      if (!contactId) return apiError('Contact ID required', 400);
      const updateData = await req.json();
      const { data: updatedContact, error: updateError } = await supabase.from('contacts').update({ ...updateData, updated_at: new Date().toISOString() }).eq('id', contactId).eq('organization_id', orgId).select().single();
      if (updateError) return apiError(updateError.message, 400);
      return apiResponse(updatedContact);
    case 'DELETE':
      if (!hasScope(auth.scopes!, 'delete')) return apiError('Insufficient permissions', 403);
      if (!contactId) return apiError('Contact ID required', 400);
      const { error: deleteError } = await supabase.from('contacts').delete().eq('id', contactId).eq('organization_id', orgId);
      if (deleteError) return apiError(deleteError.message, 400);
      return apiResponse({ deleted: true });
    default:
      return apiError('Method not allowed', 405);
  }
}

// deno-lint-ignore no-explicit-any
async function handleDeadlines(req: Request, segments: string[], auth: AuthResult, supabase: any, url: URL): Promise<Response> {
  const [, deadlineId] = segments;
  if (!hasScope(auth.scopes!, 'deadlines:read')) return apiError('Insufficient permissions', 403);
  
  if (req.method === 'GET') {
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100);
    const { data, count, error } = await supabase.from('matter_deadlines').select('*', { count: 'exact' }).order('due_date').range((page - 1) * limit, page * limit - 1);
    if (error) return apiError(error.message, 400);
    return apiResponse({ data, pagination: { page, limit, total: count, total_pages: Math.ceil((count || 0) / limit) } });
  }
  return apiError('Method not allowed', 405);
}

// deno-lint-ignore no-explicit-any
async function handleDocuments(req: Request, segments: string[], auth: AuthResult, supabase: any, url: URL): Promise<Response> {
  if (!hasScope(auth.scopes!, 'documents:read')) return apiError('Insufficient permissions', 403);
  if (req.method === 'GET') {
    const matterId = url.searchParams.get('matter_id');
    let query = supabase.from('matter_documents').select('*').order('created_at', { ascending: false });
    if (matterId) query = query.eq('matter_id', matterId);
    const { data, error } = await query;
    if (error) return apiError(error.message, 400);
    return apiResponse({ data });
  }
  return apiError('Method not allowed', 405);
}

// deno-lint-ignore no-explicit-any
async function handleInvoices(req: Request, segments: string[], auth: AuthResult, supabase: any, url: URL): Promise<Response> {
  const [, invoiceId] = segments;
  const orgId = auth.organizationId!;
  
  if (!hasScope(auth.scopes!, 'invoices:read')) return apiError('Insufficient permissions', 403);
  
  if (req.method === 'GET') {
    if (invoiceId) {
      const { data, error } = await supabase.from('invoices').select('*, items:invoice_items(*)').eq('id', invoiceId).eq('organization_id', orgId).single();
      if (error || !data) return apiError('Invoice not found', 404);
      return apiResponse(data);
    } else {
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100);
      const { data, count, error } = await supabase.from('invoices').select('*', { count: 'exact' }).eq('organization_id', orgId).order('invoice_date', { ascending: false }).range((page - 1) * limit, page * limit - 1);
      if (error) return apiError(error.message, 400);
      return apiResponse({ data, pagination: { page, limit, total: count, total_pages: Math.ceil((count || 0) / limit) } });
    }
  }
  return apiError('Method not allowed', 405);
}
