import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Anthropic from 'https://esm.sh/@anthropic-ai/sdk@0.24.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const { templateId, matterId, variables } = await req.json();

    if (!templateId) {
      return new Response(
        JSON.stringify({ error: 'templateId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Get template
    const { data: template, error: templateError } = await supabase
      .from('document_templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (templateError || !template) {
      return new Response(
        JSON.stringify({ error: 'Template not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get matter data if matterId is provided
    let matterData: Record<string, unknown> | null = null;
    if (matterId) {
      const { data: matter } = await supabase
        .from('matters')
        .select(`
          *,
          contact:contacts(id, name, email, phone, company_name, address_line1, city, country),
          organization:organizations(id, name)
        `)
        .eq('id', matterId)
        .single();
      
      if (matter) {
        matterData = {
          ...matter,
          matter: matter, // Also expose as "matter" for source_path
        };
      }
    }

    // Resolve all variables
    const resolvedVariables: Record<string, string | number | null> = {};
    const templateVariables = template.variables || [];

    for (const varDef of templateVariables) {
      if (varDef.source === 'auto' && varDef.source_path) {
        if (varDef.source_path === 'TODAY') {
          resolvedVariables[varDef.key] = new Date().toISOString().split('T')[0];
        } else if (matterData) {
          // Navigate nested path
          const value = getNestedValue(matterData, varDef.source_path);
          resolvedVariables[varDef.key] = value ?? variables?.[varDef.key] ?? '';
        } else {
          resolvedVariables[varDef.key] = variables?.[varDef.key] ?? '';
        }
      } else if (varDef.source === 'manual') {
        resolvedVariables[varDef.key] = variables?.[varDef.key] ?? '';
      }
      // AI variables will be populated after AI generation
    }

    // Check for AI variables
    const aiVariables = templateVariables.filter((v: { source: string }) => v.source === 'ai');
    let tokensUsed = 0;

    if (aiVariables.length > 0 && template.ai_user_prompt_template) {
      const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
      
      if (!anthropicApiKey) {
        return new Response(
          JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Initialize Anthropic
      const anthropic = new Anthropic({
        apiKey: anthropicApiKey,
      });

      // Build user prompt with resolved variables
      let userPrompt = template.ai_user_prompt_template;
      for (const [key, value] of Object.entries(resolvedVariables)) {
        userPrompt = userPrompt.replace(new RegExp(`{{${key}}}`, 'g'), String(value || ''));
      }
      // Also replace manual variables from input
      for (const [key, value] of Object.entries(variables || {})) {
        userPrompt = userPrompt.replace(new RegExp(`{{${key}}}`, 'g'), String(value || ''));
      }

      // Call Claude
      const response = await anthropic.messages.create({
        model: template.ai_model || 'claude-sonnet-4-5-20250929',
        max_tokens: template.ai_max_tokens || 4096,
        temperature: Number(template.ai_temperature) || 0.3,
        system: template.ai_system_prompt || 'You are a professional legal document writer. Write in Spanish unless otherwise specified.',
        messages: [{ role: 'user', content: userPrompt }],
      });

      const aiContent = response.content[0].type === 'text' ? response.content[0].text : '';
      tokensUsed = (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0);

      // Assign AI content to AI variables
      // For simplicity, assign to first AI variable if multiple exist
      for (const aiVar of aiVariables) {
        resolvedVariables[aiVar.key] = aiContent;
      }
    }

    // Generate final document by replacing all variables
    let finalContent = template.template_content;
    for (const [key, value] of Object.entries(resolvedVariables)) {
      finalContent = finalContent.replace(new RegExp(`{{${key}}}`, 'g'), String(value || `[${key}]`));
    }
    // Replace any remaining manual variables
    for (const [key, value] of Object.entries(variables || {})) {
      finalContent = finalContent.replace(new RegExp(`{{${key}}}`, 'g'), String(value || `[${key}]`));
    }

    // Increment usage count
    await supabase
      .from('document_templates')
      .update({ usage_count: (template.usage_count || 0) + 1 })
      .eq('id', templateId);

    const generationTime = Date.now() - startTime;

    return new Response(
      JSON.stringify({
        content: finalContent,
        variables: { ...resolvedVariables, ...variables },
        generationTime,
        tokensUsed,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Error generating document:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Helper function to get nested value from object
function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  const parts = path.split('.');
  let current: unknown = obj;
  
  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    if (typeof current === 'object') {
      current = (current as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }
  
  return current;
}
