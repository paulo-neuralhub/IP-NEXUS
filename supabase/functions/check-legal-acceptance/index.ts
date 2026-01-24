// supabase/functions/check-legal-acceptance/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type FeatureType = 'ai' | 'general' | 'other';

interface CheckRequest {
  userId?: string;
  documentCode: string;
  featureType?: FeatureType;
}

type SignatureType = 'checkbox' | 'typed_name';

interface LegalDocumentDTO {
  id: string;
  organization_id: string | null;
  code: string;
  title: string;
  content: string;
  version: string;
  effective_date: string | null;
  requires_signature: boolean;
  signature_type: SignatureType | null;
  show_on_ai_first_use: boolean;
}

interface CheckResponse {
  accepted: boolean;
  requiresUpdate?: boolean;
  document?: LegalDocumentDTO;
}

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    if (req.method !== 'POST') {
      return json(405, { error: 'Method not allowed' });
    }

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
    const authedUserId = userData.user.id;

    const body = (await req.json()) as CheckRequest;
    if (!body?.documentCode) {
      return json(400, { error: 'Missing required field: documentCode' });
    }

    // If userId is provided, enforce it matches the authenticated user.
    if (body.userId && body.userId !== authedUserId) {
      return json(403, { error: 'userId does not match authenticated user' });
    }

    const effectiveCode = body.featureType === 'ai' ? 'ai_disclaimer' : body.documentCode;

    // 1) Buscar documento activo por code
    const { data: doc, error: docError } = await supabase
      .from('legal_documents')
      .select(
        'id, organization_id, code, title, content, version, effective_date, requires_signature, signature_type, show_on_ai_first_use, is_active'
      )
      .eq('code', effectiveCode)
      .eq('is_active', true)
      .order('effective_date', { ascending: false, nullsFirst: false })
      .limit(1)
      .maybeSingle();

    if (docError) throw docError;
    if (!doc) {
      return json(200, { accepted: false, requiresUpdate: false } satisfies CheckResponse);
    }

    // 2) Verificar si existe aceptación para user+document
    const { data: acc, error: accError } = await supabase
      .from('legal_acceptances')
      .select('id, version_accepted')
      .eq('user_id', authedUserId)
      .eq('document_id', doc.id)
      .maybeSingle();

    if (accError) throw accError;

    // 3) Comparar versiones
    const hasAcceptance = Boolean(acc?.id);
    const requiresUpdate = hasAcceptance ? acc!.version_accepted !== doc.version : false;
    const accepted = hasAcceptance && !requiresUpdate;

    const response: CheckResponse = {
      accepted,
      requiresUpdate,
      document: {
        id: doc.id,
        organization_id: doc.organization_id ?? null,
        code: doc.code,
        title: doc.title,
        content: doc.content,
        version: doc.version,
        effective_date: doc.effective_date ?? null,
        requires_signature: Boolean(doc.requires_signature),
        signature_type: (doc.signature_type ?? null) as SignatureType | null,
        show_on_ai_first_use: Boolean(doc.show_on_ai_first_use),
      },
    };

    return json(200, response);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('check-legal-acceptance error:', error);
    return json(500, { error: message });
  }
});
