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
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: TrackEventPayload = await req.json();
    const {
      event_name,
      event_category,
      properties = {},
      page_path,
      page_title,
      referrer,
      session_id,
      screen_resolution,
      feature_key,
      duration_seconds,
      success = true,
    } = body;

    if (!event_name || !event_category) {
      return new Response(
        JSON.stringify({ error: 'event_name and event_category are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user from JWT if exists
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

    // Parse User-Agent for device info
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

    // Generate session ID if not provided
    const finalSessionId = session_id || crypto.randomUUID();

    // Insert event
    const { error } = await supabase.from('analytics_events').insert({
      event_name,
      event_category,
      properties,
      page_path,
      page_title,
      referrer,
      session_id: finalSessionId,
      user_id: userId,
      organization_id: orgId,
      device_type: deviceType,
      browser,
      os,
      screen_resolution,
    });

    if (error) {
      console.error('Error inserting event:', error);
      throw error;
    }

    // If feature_use and feature_key provided, also insert into analytics_feature_usage
    if (event_category === 'feature_use' && feature_key) {
      const { error: featureError } = await supabase.from('analytics_feature_usage').insert({
        organization_id: orgId,
        user_id: userId,
        feature_key,
        context: properties,
        duration_seconds,
        success,
      });

      if (featureError) {
        console.error('Error inserting feature_usage:', featureError);
        // Don't throw - main event already saved
      }
    }

    return new Response(
      JSON.stringify({ success: true, session_id: finalSessionId }),
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
