// ============================================
// CALENDAR OAUTH CALLBACK HANDLER
// Exchanges authorization code for tokens and creates connection
// ============================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Token endpoints
const TOKEN_ENDPOINTS = {
  google: 'https://oauth2.googleapis.com/token',
  microsoft: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
};

// Calendar list endpoints  
const CALENDAR_LIST_ENDPOINTS = {
  google: 'https://www.googleapis.com/calendar/v3/users/me/calendarList',
  microsoft: 'https://graph.microsoft.com/v1.0/me/calendars',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  try {
    // Parse request body
    const { code, state, provider } = await req.json();

    if (!code || !state || !provider) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify state token
    const { data: oauthState, error: stateError } = await supabase
      .from('oauth_states')
      .select('*')
      .eq('state', state)
      .eq('provider', provider)
      .single();

    if (stateError || !oauthState) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired state token' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if state expired
    if (new Date(oauthState.expires_at) < new Date()) {
      await supabase.from('oauth_states').delete().eq('state', state);
      return new Response(
        JSON.stringify({ error: 'State token expired' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get client credentials
    const { data: clientIdSetting } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', `${provider}_calendar_client_id`)
      .single();

    const { data: clientSecretSetting } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', `${provider}_calendar_client_secret`)
      .single();

    const clientId = clientIdSetting?.value || Deno.env.get(`${provider.toUpperCase()}_CLIENT_ID`);
    const clientSecret = clientSecretSetting?.value || Deno.env.get(`${provider.toUpperCase()}_CLIENT_SECRET`);

    if (!clientId || !clientSecret) {
      return new Response(
        JSON.stringify({ error: `${provider} OAuth credentials not configured` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Exchange code for tokens
    const tokenEndpoint = TOKEN_ENDPOINTS[provider as keyof typeof TOKEN_ENDPOINTS];
    const tokenResponse = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: oauthState.redirect_uri,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || tokenData.error) {
      console.error('Token exchange error:', tokenData);
      return new Response(
        JSON.stringify({ error: tokenData.error_description || 'Failed to exchange code' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user's primary calendar
    const calendarListEndpoint = CALENDAR_LIST_ENDPOINTS[provider as keyof typeof CALENDAR_LIST_ENDPOINTS];
    const calendarResponse = await fetch(calendarListEndpoint, {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    let primaryCalendar = { id: 'primary', name: 'Calendario principal' };
    
    if (calendarResponse.ok) {
      const calendarData = await calendarResponse.json();
      
      if (provider === 'google') {
        const primary = calendarData.items?.find((c: any) => c.primary) || calendarData.items?.[0];
        if (primary) {
          primaryCalendar = { id: primary.id, name: primary.summary };
        }
      } else if (provider === 'microsoft') {
        const defaultCal = calendarData.value?.find((c: any) => c.isDefaultCalendar) || calendarData.value?.[0];
        if (defaultCal) {
          primaryCalendar = { id: defaultCal.id, name: defaultCal.name };
        }
      }
    }

    // Get user's organization
    const { data: membership } = await supabase
      .from('memberships')
      .select('organization_id')
      .eq('user_id', oauthState.user_id)
      .limit(1)
      .single();

    if (!membership) {
      return new Response(
        JSON.stringify({ error: 'User has no organization' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate token expiry
    const tokenExpiresAt = tokenData.expires_in 
      ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
      : null;

    // Create or update calendar connection
    const { data: connection, error: connectionError } = await supabase
      .from('calendar_connections')
      .upsert({
        user_id: oauthState.user_id,
        organization_id: membership.organization_id,
        provider,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        token_expires_at: tokenExpiresAt,
        calendar_id: primaryCalendar.id,
        calendar_name: primaryCalendar.name,
        sync_status: 'active',
        sync_enabled: true,
        sync_deadlines: true,
        sync_tasks: true,
        sync_meetings: true,
        sync_direction: 'both',
      }, {
        onConflict: 'user_id,provider',
      })
      .select()
      .single();

    if (connectionError) {
      console.error('Connection error:', connectionError);
      return new Response(
        JSON.stringify({ error: 'Failed to save calendar connection' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Clean up state token
    await supabase.from('oauth_states').delete().eq('state', state);

    return new Response(
      JSON.stringify({ 
        success: true, 
        connection: {
          id: connection.id,
          provider: connection.provider,
          calendar_name: connection.calendar_name,
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('OAuth callback error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
