import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sourceText, sourceLanguage, targetLanguage, documentType, glossaryId } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get glossary terms if available
    let glossaryTerms: Array<{ source: string; target: string }> = [];
    
    if (glossaryId) {
      const { data: terms } = await supabase
        .from('ai_glossary_terms')
        .select('source_term, target_term')
        .eq('glossary_id', glossaryId);
      
      if (terms) {
        glossaryTerms = terms.map(t => ({ source: t.source_term, target: t.target_term }));
      }
    } else {
      // Get official glossary terms for this language pair
      const { data: glossaries } = await supabase
        .from('ai_translation_glossaries')
        .select('id')
        .eq('source_language', sourceLanguage)
        .eq('target_language', targetLanguage)
        .eq('is_official', true)
        .limit(1);

      if (glossaries?.[0]) {
        const { data: terms } = await supabase
          .from('ai_glossary_terms')
          .select('source_term, target_term')
          .eq('glossary_id', glossaries[0].id);
        
        if (terms) {
          glossaryTerms = terms.map(t => ({ source: t.source_term, target: t.target_term }));
        }
      }
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');

    const systemPrompt = `Eres un traductor legal experto especializado en propiedad intelectual.

INSTRUCCIONES CRÍTICAS:
1. Traduce del ${sourceLanguage} al ${targetLanguage}
2. Tipo de documento: ${documentType}
3. Mantén la precisión legal absoluta
4. Usa terminología técnica apropiada
5. NO modifiques nombres propios, fechas, números de registro
6. Preserva el formato y estructura del documento
7. Si hay términos ambiguos, mantén el significado más cercano al original

${glossaryTerms.length > 0 ? `
GLOSARIO OBLIGATORIO (usar estos términos):
${glossaryTerms.map(t => `"${t.source}" → "${t.target}"`).join('\n')}
` : ''}

FORMATO DE SALIDA:
- Solo proporciona el texto traducido
- Sin explicaciones ni notas adicionales
- Sin disclaimers (se añaden por separado)`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: sourceText }
        ],
        max_tokens: 8000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('AI gateway error:', error);
      throw new Error('Translation failed');
    }

    const data = await response.json();
    const translatedText = data.choices?.[0]?.message?.content || '';

    // Find which glossary terms were used
    const termsUsed = glossaryTerms.filter(t => 
      translatedText.toLowerCase().includes(t.target.toLowerCase())
    );

    return new Response(JSON.stringify({
      translatedText,
      confidence: 0.85,
      termsUsed,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Translation error:', error);
    const message = error instanceof Error ? error.message : 'Translation failed';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
