import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TrackEventPayload {
  event_name: string;
  event_category: string;
  properties?: Record<string, unknown>;
  page_path?: string;
  page_title?: string;
  referrer?: string;
  session_id?: string;
  screen_resolution?: string;
  feature_key?: string;
  duration_seconds?: number;
  success?: boolean;
  timestamp?: string;
}

interface BatchPayload {
  events: TrackEventPayload[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    
    // Support both single event and batch of events
    const events: TrackEventPayload[] = body.events 
      ? (body as BatchPayload).events 
      : [body as TrackEventPayload];

    if (events.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No events provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user from JWT if exists (once for all events)
    let userId: string | null = null;
    let orgId: string | null = null;

    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      
      if (user) {
        userId = user.id;
        
        // Get user's organization
        const { data: membership } = await supabase
          .from('memberships')
          .select('organization_id')
          .eq('user_id', user.id)
          .limit(1)
          .single();
        
        orgId = membership?.organization_id || null;
      }
    }

    // Parse User-Agent for device info (once for all events)
    const userAgent = req.headers.get('user-agent') || '';
    
    let deviceType: 'desktop' | 'tablet' | 'mobile' = 'desktop';
    if (/mobile/i.test(userAgent)) {
      deviceType = 'mobile';
    } else if (/tablet|ipad/i.test(userAgent)) {
      deviceType = 'tablet';
    }

    // Extract browser name
    let browser = 'unknown';
    if (/firefox/i.test(userAgent)) browser = 'Firefox';
    else if (/edg/i.test(userAgent)) browser = 'Edge';
    else if (/chrome/i.test(userAgent)) browser = 'Chrome';
    else if (/safari/i.test(userAgent)) browser = 'Safari';
    else if (/opera|opr/i.test(userAgent)) browser = 'Opera';

    // Extract OS
    let os = 'unknown';
    if (/windows/i.test(userAgent)) os = 'Windows';
    else if (/macintosh|mac os/i.test(userAgent)) os = 'macOS';
    else if (/linux/i.test(userAgent)) os = 'Linux';
    else if (/android/i.test(userAgent)) os = 'Android';
    else if (/iphone|ipad|ipod/i.test(userAgent)) os = 'iOS';

    // Prepare events for insertion
    const eventsToInsert = events
      .filter(e => e.event_name && e.event_category)
      .map((event) => ({
        event_name: event.event_name,
        event_category: event.event_category,
        properties: event.properties || {},
        page_path: event.page_path,
        page_title: event.page_title,
        referrer: event.referrer,
        session_id: event.session_id || crypto.randomUUID(),
        user_id: userId,
        organization_id: orgId,
        device_type: deviceType,
        browser,
        os,
        screen_resolution: event.screen_resolution,
      }));

    if (eventsToInsert.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No valid events to insert' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Batch insert all events
    const { error } = await supabase.from('analytics_events').insert(eventsToInsert);

    if (error) {
      console.error('Error inserting events:', error);
      throw error;
    }

    // Handle feature usage events
    const featureEvents = events.filter(
      e => e.event_category === 'feature_use' && e.feature_key
    );

    if (featureEvents.length > 0) {
      const featureRecords = featureEvents.map(event => ({
        organization_id: orgId,
        user_id: userId,
        feature_key: event.feature_key!,
        context: event.properties || {},
        duration_seconds: event.duration_seconds,
        success: event.success ?? true,
      }));

      const { error: featureError } = await supabase
        .from('analytics_feature_usage')
        .insert(featureRecords);

      if (featureError) {
        console.error('Error inserting feature_usage:', featureError);
        // Don't throw - main events already saved
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        inserted: eventsToInsert.length,
        session_id: eventsToInsert[0]?.session_id 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error in track-event:', errorMessage);
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
