// ============================================
// CALENDAR OAUTH URL GENERATOR
// Generates OAuth authorization URLs for Google/Microsoft
// ============================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// OAuth configurations
const OAUTH_CONFIG = {
  google: {
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    scopes: [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events',
      'openid',
      'email',
      'profile',
    ],
  },
  microsoft: {
    authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    scopes: [
      'openid',
      'email',
      'profile',
      'offline_access',
      'Calendars.ReadWrite',
    ],
  },
};

function generateState(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate user
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const { provider, redirect_uri } = await req.json();

    if (!provider || !['google', 'microsoft'].includes(provider)) {
      return new Response(
        JSON.stringify({ error: 'Invalid provider. Use "google" or "microsoft"' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get client credentials from system settings
    const { data: settings } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', `${provider}_calendar_client_id`)
      .single();

    const clientId = settings?.value || Deno.env.get(`${provider.toUpperCase()}_CLIENT_ID`);

    if (!clientId) {
      return new Response(
        JSON.stringify({ 
          error: `${provider} OAuth no configurado`,
          message: 'Configure las credenciales OAuth en Configuración > Integraciones'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate state token
    const state = generateState();

    // Store state in database for verification
    await supabase
      .from('oauth_states')
      .upsert({
        state,
        user_id: user.id,
        provider,
        redirect_uri,
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
      });

    // Build authorization URL
    const config = OAUTH_CONFIG[provider as keyof typeof OAUTH_CONFIG];
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirect_uri || `${req.headers.get('origin')}/app/settings/integrations`,
      response_type: 'code',
      scope: config.scopes.join(' '),
      state,
      access_type: 'offline',
      prompt: 'consent',
    });

    // Add provider-specific params
    if (provider === 'microsoft') {
      params.set('response_mode', 'query');
    }

    const authorizationUrl = `${config.authUrl}?${params.toString()}`;

    return new Response(
      JSON.stringify({ 
        url: authorizationUrl, 
        state,
        provider 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error generating OAuth URL:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
