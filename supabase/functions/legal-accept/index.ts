// supabase/functions/legal-accept/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type AcceptanceMethod = 'checkbox' | 'typed_name' | 'electronic';

interface AcceptRequest {
  documentCode: string;
  featureType?: 'ai' | 'general' | 'other';
  contentHash: string;
  acceptanceMethod: AcceptanceMethod;
  signatureData?: Record<string, unknown> | null;
}

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function getRequestIp(req: Request): string | null {
  return (
    req.headers.get('x-forwarded-for') ||
    req.headers.get('cf-connecting-ip') ||
    req.headers.get('x-real-ip')
  );
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    if (req.method !== 'POST') return json(405, { error: 'Method not allowed' });

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return json(401, { error: 'Missing Authorization header' });
    }
    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData?.user) {
      return json(401, { error: 'Invalid token' });
    }
    const userId = userData.user.id;

    const body = (await req.json()) as AcceptRequest;
    if (!body?.documentCode || !body?.contentHash || !body?.acceptanceMethod) {
      return json(400, { error: 'Missing required fields: documentCode, contentHash, acceptanceMethod' });
    }
    if (body.contentHash.length !== 64) {
      return json(400, { error: 'contentHash must be SHA-256 hex (64 chars)' });
    }

    const effectiveCode = body.featureType === 'ai' ? 'ai_disclaimer' : body.documentCode;

    // 1) Documento activo por code
    const { data: doc, error: docError } = await supabase
      .from('legal_documents')
      .select('id, organization_id, code, version, is_active')
      .eq('code', effectiveCode)
      .eq('is_active', true)
      .order('effective_date', { ascending: false, nullsFirst: false })
      .limit(1)
      .maybeSingle();

    if (docError) throw docError;
    if (!doc) return json(404, { error: 'Active legal document not found' });

    // 2) Upsert aceptación (UNIQUE user_id + document_id)
    const ip = getRequestIp(req);
    const userAgent = req.headers.get('user-agent');

    const { data: acceptance, error: accError } = await supabase
      .from('legal_acceptances')
      .upsert(
        {
          organization_id: doc.organization_id ?? null,
          user_id: userId,
          document_id: doc.id,
          version_accepted: doc.version,
          content_hash: body.contentHash,
          accepted_at: new Date().toISOString(),
          ip_address: ip,
          user_agent: userAgent,
          acceptance_method: body.acceptanceMethod,
          signature_data: body.signatureData ?? null,
        },
        { onConflict: 'user_id,document_id' }
      )
      .select('id, user_id, document_id, version_accepted, accepted_at')
      .single();

    if (accError) throw accError;

    return json(200, { success: true, acceptance });
  } catch (error: unknown) {
    console.error('legal-accept error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return json(500, { error: message });
  }
});
