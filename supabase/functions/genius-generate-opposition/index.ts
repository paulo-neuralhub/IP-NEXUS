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
    const { input, organizationId } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get auth user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('No authorization header');
    
    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );
    if (userError || !user) throw new Error('Unauthorized');

    // Get official fees
    const { data: feeData } = await supabase
      .from('genius_official_fees')
      .select('*')
      .eq('office', input.earlierMark.registrationOffice)
      .eq('procedure_type', 'opposition')
      .is('effective_until', null)
      .maybeSingle();

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');

    // Determine tone instructions
    const toneInstructions = {
      diplomatic: 'Usa un tono conciliador y profesional, dejando abierta la puerta a negociación.',
      professional: 'Usa un tono técnico, formal y objetivo.',
      aggressive: 'Usa un tono firme, directo y contundente, enfatizando los riesgos legales.',
    };

    // Determine ground basis
    const groundsBasis = input.options.grounds.map((g: string) => {
      switch (g) {
        case 'likelihood_confusion': return 'Artículo 8.1.b) RMUE - Riesgo de confusión';
        case 'reputation': return 'Artículo 8.5 RMUE - Marca de renombre';
        case 'bad_faith': return 'Artículo 59.1.b) RMUE - Mala fe';
        default: return g;
      }
    }).join(', ');

    const systemPrompt = `Eres un abogado experto en propiedad intelectual especializado en oposiciones de marcas ante EUIPO y oficinas nacionales.

INSTRUCCIONES:
1. Genera un borrador de escrito de oposición completo y profesional
2. ${toneInstructions[input.options.tone as keyof typeof toneInstructions]}
3. Idioma: ${input.options.language === 'es' ? 'español' : input.options.language === 'en' ? 'inglés' : input.options.language}
4. Fundamenta la oposición en: ${groundsBasis}
5. Estructura el documento con secciones claras
6. Incluye referencias legales apropiadas (RMUE, jurisprudencia TJUE si aplica)
7. NO inventes números de caso o referencias - usa placeholders [CITAR]

DATOS DEL OPONENTE:
- Nombre: ${input.opponent.name}
- Dirección: ${input.opponent.address}
${input.opponent.representative ? `- Representante: ${input.opponent.representative.name} (ID: ${input.opponent.representative.id})` : ''}

MARCA ANTERIOR (base de la oposición):
- Denominación: ${input.earlierMark.text}
- Nº Registro: ${input.earlierMark.registrationNumber}
- Oficina: ${input.earlierMark.registrationOffice}
- Clases de Niza: ${input.earlierMark.classes.join(', ')}
- Productos/Servicios: ${input.earlierMark.goods}
${input.earlierMark.reputation ? '- Marca de renombre reconocido' : ''}

MARCA IMPUGNADA:
- Denominación: ${input.contestedMark.text}
- Nº Solicitud: ${input.contestedMark.applicationNumber}
- Solicitante: ${input.contestedMark.applicant}
- Clases de Niza: ${input.contestedMark.classes.join(', ')}
- Productos/Servicios: ${input.contestedMark.goods}
${input.contestedMark.publicationDate ? `- Fecha publicación: ${input.contestedMark.publicationDate}` : ''}

Genera el documento en formato Markdown con la siguiente estructura:
1. Encabezado (oficina, referencia)
2. Partes (oponente, representante, solicitante impugnado)
3. Objeto de la oposición
4. Fundamentos de hecho
5. Fundamentos de derecho (análisis de similitud visual, fonética, conceptual; productos/servicios)
6. Petitum (solicitud formal de denegación)
7. Anexos (lista de documentos a adjuntar)`;

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
          { role: 'user', content: 'Genera el borrador de oposición completo.' }
        ],
        max_tokens: 8000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error('Failed to generate opposition');
    }

    const aiData = await response.json();
    const contentMarkdown = aiData.choices?.[0]?.message?.content || '';
    
    // Simple markdown to HTML conversion
    const contentHtml = contentMarkdown
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/^- (.*$)/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

    // Build document result
    const documentResult = {
      id: crypto.randomUUID(),
      documentType: 'opposition',
      title: `Oposición - ${input.earlierMark.text} vs ${input.contestedMark.text}`,
      contentHtml: `<div class="opposition-document"><p>${contentHtml}</p></div>`,
      contentMarkdown,
      trademarkAnalysis: null, // Would be computed separately
      legalAnalysis: {
        applicableLaws: [],
        relevantCases: [],
        arguments: input.options.grounds.map((g: string) => ({
          point: g,
          basis: [],
          strength: 'moderate',
        })),
      },
      verificationStatus: 'pending',
      verificationWarnings: [
        {
          type: 'citation_not_found',
          message: 'Las referencias legales deben ser verificadas manualmente',
          severity: 'warning',
        },
      ],
      citations: [],
      estimatedFees: feeData ? {
        office: feeData.office,
        baseFee: parseFloat(feeData.base_fee),
        additionalFees: [],
        total: parseFloat(feeData.base_fee),
        currency: feeData.currency,
        lastUpdated: feeData.last_verified_at,
        disclaimer: 'Las tasas son orientativas. Verifique en la web oficial antes de presentar.',
      } : undefined,
      tone: input.options.tone,
      language: input.options.language,
      jurisdiction: input.earlierMark.registrationOffice === 'EUIPO' ? 'EU' : 
                    input.earlierMark.registrationOffice === 'OEPM' ? 'ES' : 'INT',
      createdAt: new Date().toISOString(),
    };

    // Save to database
    await supabase.from('genius_generated_documents').insert({
      id: documentResult.id,
      organization_id: organizationId,
      user_id: user.id,
      document_type: 'opposition',
      title: documentResult.title,
      input_data: input,
      content_html: documentResult.contentHtml,
      content_markdown: documentResult.contentMarkdown,
      legal_analysis: documentResult.legalAnalysis,
      verification_status: documentResult.verificationStatus,
      verification_warnings: documentResult.verificationWarnings,
      citations: documentResult.citations,
      estimated_fees: documentResult.estimatedFees,
      tone: documentResult.tone,
      disclaimer_accepted: true,
      disclaimer_accepted_at: new Date().toISOString(),
    });

    return new Response(JSON.stringify(documentResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Opposition generation error:', error);
    const message = error instanceof Error ? error.message : 'Generation failed';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
