// ============================================
// CALENDAR SYNC FUNCTION
// Bidirectional sync between IP-NEXUS and external calendars
// ============================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Calendar API endpoints
const GOOGLE_EVENTS_URL = 'https://www.googleapis.com/calendar/v3/calendars';
const MICROSOFT_EVENTS_URL = 'https://graph.microsoft.com/v1.0/me/calendars';

interface CalendarEvent {
  id?: string;
  title: string;
  description?: string;
  start: string;
  end: string;
  allDay?: boolean;
  location?: string;
}

async function refreshGoogleToken(refreshToken: string, clientId: string, clientSecret: string): Promise<string | null> {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) return null;
  const data = await response.json();
  return data.access_token;
}

async function refreshMicrosoftToken(refreshToken: string, clientId: string, clientSecret: string): Promise<string | null> {
  const response = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) return null;
  const data = await response.json();
  return data.access_token;
}

async function createGoogleEvent(accessToken: string, calendarId: string, event: CalendarEvent): Promise<string | null> {
  const response = await fetch(`${GOOGLE_EVENTS_URL}/${encodeURIComponent(calendarId)}/events`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      summary: event.title,
      description: event.description,
      location: event.location,
      start: event.allDay 
        ? { date: event.start.split('T')[0] }
        : { dateTime: event.start, timeZone: 'UTC' },
      end: event.allDay
        ? { date: event.end.split('T')[0] }
        : { dateTime: event.end, timeZone: 'UTC' },
    }),
  });

  if (!response.ok) {
    console.error('Failed to create Google event:', await response.text());
    return null;
  }
  
  const data = await response.json();
  return data.id;
}

async function createMicrosoftEvent(accessToken: string, calendarId: string, event: CalendarEvent): Promise<string | null> {
  const response = await fetch(`${MICROSOFT_EVENTS_URL}/${calendarId}/events`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      subject: event.title,
      body: { contentType: 'text', content: event.description || '' },
      location: { displayName: event.location || '' },
      start: { dateTime: event.start, timeZone: 'UTC' },
      end: { dateTime: event.end, timeZone: 'UTC' },
      isAllDay: event.allDay,
    }),
  });

  if (!response.ok) {
    console.error('Failed to create Microsoft event:', await response.text());
    return null;
  }
  
  const data = await response.json();
  return data.id;
}

function generateContentHash(content: any): string {
  const str = JSON.stringify(content);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(16);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request
    const { connection_id, action } = await req.json();

    if (!connection_id || action !== 'sync') {
      return new Response(
        JSON.stringify({ error: 'Invalid request parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get calendar connection
    const { data: connection, error: connError } = await supabase
      .from('calendar_connections')
      .select('*')
      .eq('id', connection_id)
      .single();

    if (connError || !connection) {
      return new Response(
        JSON.stringify({ error: 'Calendar connection not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if sync is enabled
    if (!connection.sync_enabled || connection.sync_status === 'paused') {
      return new Response(
        JSON.stringify({ message: 'Sync is disabled for this connection' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Refresh token if needed
    let accessToken = connection.access_token;
    
    if (connection.token_expires_at && new Date(connection.token_expires_at) < new Date()) {
      // Get client credentials
      const { data: clientIdSetting } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', `${connection.provider}_calendar_client_id`)
        .single();

      const { data: clientSecretSetting } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', `${connection.provider}_calendar_client_secret`)
        .single();

      const clientId = clientIdSetting?.value || Deno.env.get(`${connection.provider.toUpperCase()}_CLIENT_ID`);
      const clientSecret = clientSecretSetting?.value || Deno.env.get(`${connection.provider.toUpperCase()}_CLIENT_SECRET`);

      if (clientId && clientSecret && connection.refresh_token) {
        const newToken = connection.provider === 'google'
          ? await refreshGoogleToken(connection.refresh_token, clientId, clientSecret)
          : await refreshMicrosoftToken(connection.refresh_token, clientId, clientSecret);

        if (newToken) {
          accessToken = newToken;
          await supabase
            .from('calendar_connections')
            .update({
              access_token: newToken,
              token_expires_at: new Date(Date.now() + 3600 * 1000).toISOString(),
            })
            .eq('id', connection_id);
        }
      }
    }

    let syncedCount = 0;
    const errors: string[] = [];

    // Sync deadlines if enabled
    if (connection.sync_deadlines && (connection.sync_direction === 'both' || connection.sync_direction === 'to_calendar')) {
      const { data: deadlines } = await supabase
        .from('matter_deadlines')
        .select('id, title, description, due_date, matter_id, matters(reference)')
        .eq('organization_id', connection.organization_id)
        .gte('due_date', new Date().toISOString())
        .limit(100);

      for (const deadline of deadlines || []) {
        // Check if already synced
        const { data: mapping } = await supabase
          .from('calendar_event_mappings')
          .select('*')
          .eq('calendar_connection_id', connection_id)
          .eq('source_type', 'deadline')
          .eq('source_id', deadline.id)
          .single();

        const eventContent = {
          title: `📅 ${deadline.title}`,
          description: `Expediente: ${(deadline as any).matters?.reference || 'N/A'}\\n\\n${deadline.description || ''}`,
          start: deadline.due_date,
          end: deadline.due_date,
          allDay: true,
        };

        const contentHash = generateContentHash(eventContent);

        // Skip if already synced and unchanged
        if (mapping && mapping.sync_hash === contentHash) {
          continue;
        }

        // Create event in external calendar
        const externalEventId = connection.provider === 'google'
          ? await createGoogleEvent(accessToken, connection.calendar_id, eventContent)
          : await createMicrosoftEvent(accessToken, connection.calendar_id, eventContent);

        if (externalEventId) {
          // Save or update mapping
          await supabase
            .from('calendar_event_mappings')
            .upsert({
              id: mapping?.id,
              calendar_connection_id: connection_id,
              source_type: 'deadline',
              source_id: deadline.id,
              external_event_id: externalEventId,
              external_calendar_id: connection.calendar_id,
              sync_hash: contentHash,
              last_synced_at: new Date().toISOString(),
            });
          syncedCount++;
        } else {
          errors.push(`Failed to sync deadline: ${deadline.title}`);
        }
      }
    }

    // Update last sync timestamp
    await supabase
      .from('calendar_connections')
      .update({
        last_sync_at: new Date().toISOString(),
        last_sync_error: errors.length > 0 ? errors.join('; ') : null,
        sync_status: errors.length > 0 ? 'error' : 'active',
      })
      .eq('id', connection_id);

    return new Response(
      JSON.stringify({
        success: true,
        synced_count: syncedCount,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Calendar sync error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
