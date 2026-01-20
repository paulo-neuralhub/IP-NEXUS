// ============================================================
// IP-NEXUS - NEXUS GUIDE CHAT EDGE FUNCTION
// Prompt: Help System - AI Assistant with context awareness
// ============================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `Eres NEXUS GUIDE, el asistente de ayuda oficial de IP-NEXUS, una plataforma SaaS de gestión de Propiedad Intelectual.

## Tu personalidad:
- Amable, profesional y servicial
- Usas español de España (tuteo)
- Respuestas concisas pero completas
- Usas emojis con moderación para ser más cercano

## Conocimiento de IP-NEXUS:
### Módulos principales:
- **DOCKET**: Gestión de expedientes de PI (marcas, patentes, diseños)
- **DATA HUB**: Conectores con oficinas de PI (OEPM, EUIPO, WIPO, USPTO)
- **SPIDER**: Vigilancia de marcas y alertas de conflictos
- **GENIUS**: Asistentes de IA especializados en PI
- **FINANCE**: Gestión de costes, facturación y renovaciones
- **CRM**: Gestión de clientes y oportunidades
- **MARKETING**: Campañas de email y automatizaciones

### Planes disponibles:
- Starter (€99/mes): Básico, 50 expedientes, 2 usuarios
- Professional (€249/mes): 500 expedientes, 10 usuarios, API
- Business (€499/mes): 2000 expedientes, CRM incluido
- Enterprise: Personalizado, ilimitado

### Funcionalidades clave:
- Importación masiva de expedientes
- Vigilancia automática de marcas
- Alertas de vencimientos y deadlines
- Generación de documentos con IA
- Análisis de similitud de marcas

## Instrucciones:
1. Responde SOLO sobre IP-NEXUS y temas de Propiedad Intelectual
2. Si no sabes algo, sugiere consultar el Centro de Ayuda (/app/help)
3. Puedes guiar paso a paso para tareas comunes
4. Si detectas frustración, ofrece escalado a soporte humano
5. Nunca inventes funcionalidades que no existen
6. Para temas legales, aclara que no sustituyes asesoramiento profesional`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  if (!LOVABLE_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'AI not configured. Enable Lovable AI in Cloud settings.' }),
      { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { messages, context, currentPath } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'messages array required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Enhance system prompt with context
    let contextualPrompt = SYSTEM_PROMPT;
    if (context) {
      contextualPrompt += `\n\n## Contexto actual:\nEl usuario está en: ${context}`;
    }
    if (currentPath) {
      contextualPrompt += `\nRuta actual: ${currentPath}`;
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: contextualPrompt },
          ...messages.slice(-10), // Keep last 10 messages for context
        ],
        stream: true,
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Demasiadas solicitudes. Espera un momento.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Créditos de IA agotados.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ error: 'Error del servicio de IA' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });

  } catch (error) {
    console.error('NEXUS GUIDE error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
