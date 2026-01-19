import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Anthropic from 'https://esm.sh/@anthropic-ai/sdk@0.24.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { connectionMethodId, brokenSelectors } = await req.json();
    console.log('Regenerating scraper for:', connectionMethodId);

    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!anthropicKey) {
      return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const anthropic = new Anthropic({ apiKey: anthropicKey });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Get scraper config with office info
    const { data: scraperConfig, error: configError } = await supabase
      .from('ipo_scraper_configs')
      .select('*')
      .eq('connection_method_id', connectionMethodId)
      .single();

    if (configError || !scraperConfig) {
      console.error('Scraper config not found:', configError);
      return new Response(JSON.stringify({ error: 'Scraper config not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get office info
    const { data: method } = await supabase
      .from('ipo_connection_methods')
      .select('office_id')
      .eq('id', connectionMethodId)
      .single();

    const { data: office } = await supabase
      .from('ipo_offices')
      .select('name_official, code')
      .eq('id', method?.office_id)
      .single();

    // Fetch current page HTML
    let pageHtml = '';
    try {
      const pageResponse = await fetch(scraperConfig.target_url, {
        headers: { 'User-Agent': scraperConfig.user_agent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        signal: AbortSignal.timeout(15000),
      });
      pageHtml = await pageResponse.text();
    } catch (fetchError) {
      console.error('Failed to fetch target page:', fetchError);
      return new Response(JSON.stringify({ error: 'Failed to fetch target page' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate new selectors with Claude
    const prompt = `You are an expert web scraper developer. A scraper for the ${office?.name_official || 'IP Office'} (${office?.code || 'Unknown'}) trademark office has broken selectors.

Current configuration:
- Target URL: ${scraperConfig.target_url}
- Broken selectors: ${(brokenSelectors || []).join(', ') || 'Unknown'}
- Current selectors: ${JSON.stringify(scraperConfig.selectors, null, 2)}

Here is the current HTML of the page (truncated to first 40000 characters):
\`\`\`html
${pageHtml.substring(0, 40000)}
\`\`\`

Please analyze the HTML and provide updated CSS selectors that will correctly extract:
1. Trademark name/title
2. Application/registration number
3. Filing date
4. Owner/applicant name
5. Status
6. Classes

Respond ONLY with a valid JSON object containing the new selectors.
Format: { "fieldName": "cssSelector" } or { "fieldName": ["primarySelector", "fallbackSelector"] }

For example:
{
  "trademark_name": "h1.trademark-title, .mark-name",
  "application_number": ["#appNumber", ".application-id span"],
  "filing_date": ".filing-date",
  "owner": ".applicant-name",
  "status": ".status-badge",
  "classes": ".nice-classes"
}`;

    console.log('Calling Claude for selector generation...');
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    });

    const responseText = response.content[0].type === 'text' ? response.content[0].text : '';
    console.log('Claude response:', responseText.substring(0, 500));

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      console.error('Failed to parse AI response - no JSON found');
      return new Response(JSON.stringify({ error: 'Failed to parse AI response' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let newSelectors;
    try {
      newSelectors = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('Failed to parse JSON:', parseError);
      return new Response(JSON.stringify({ error: 'Invalid JSON in AI response' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Calculate new version
    const currentVersion = scraperConfig.script_version || 'v1.0.0';
    const versionParts = currentVersion.replace('v', '').split('.').map(Number);
    versionParts[2] = (versionParts[2] || 0) + 1;
    const newVersion = `v${versionParts.join('.')}`;

    // Save new scraper version
    const { data: savedVersion, error: saveError } = await supabase
      .from('ipo_scraper_versions')
      .insert({
        scraper_config_id: scraperConfig.id,
        version: newVersion,
        script_content: scraperConfig.script_content || '',
        selectors: newSelectors,
        generated_by: 'ai_automend',
        generation_prompt: prompt.substring(0, 1000),
        test_status: 'untested',
      })
      .select()
      .single();

    if (saveError) {
      console.error('Failed to save version:', saveError);
      return new Response(JSON.stringify({ error: 'Failed to save new version' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('New scraper version created:', newVersion);

    return new Response(JSON.stringify({ 
      success: true, 
      newVersion, 
      newSelectors, 
      versionId: savedVersion.id 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

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
