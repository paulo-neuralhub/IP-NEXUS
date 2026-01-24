import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatRequest {
  configId?: string;
  landingSlug: string;
  conversationId?: string;
  sessionId: string;
  message: string;
  sessionData?: {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    referrer?: string;
  };
}

interface ChatResponse {
  conversationId: string;
  response: string;
  quickReplies: string[];
  shouldAskEmail: boolean;
  shouldOfferDemo: boolean;
  leadCaptured: boolean;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!anthropicKey) {
      throw new Error('ANTHROPIC_API_KEY not configured');
    }

    const body: ChatRequest = await req.json();
    const { landingSlug, sessionId, message, sessionData } = body;
    let { conversationId, configId } = body;

    // Get chatbot config
    let config;
    if (configId) {
      const { data } = await supabase
        .from('chatbot_configs')
        .select('*')
        .eq('id', configId)
        .eq('is_active', true)
        .single();
      config = data;
    } else {
      const { data } = await supabase
        .from('chatbot_configs')
        .select('*')
        .eq('landing_slug', landingSlug)
        .eq('is_active', true)
        .single();
      config = data;
    }

    if (!config) {
      return new Response(
        JSON.stringify({ error: 'Chatbot not configured for this landing' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get or create conversation
    let conversation;
    if (conversationId) {
      const { data } = await supabase
        .from('chatbot_conversations')
        .select('*')
        .eq('id', conversationId)
        .single();
      conversation = data;
    }

    if (!conversation) {
      const { data, error } = await supabase
        .from('chatbot_conversations')
        .insert({
          config_id: config.id,
          session_id: sessionId,
          landing_slug: landingSlug,
          utm_source: sessionData?.utm_source,
          utm_medium: sessionData?.utm_medium,
          utm_campaign: sessionData?.utm_campaign,
          referrer: sessionData?.referrer,
          status: 'active',
          message_count: 0,
        })
        .select()
        .single();
      
      if (error) throw error;
      conversation = data;
      conversationId = data.id;

      // Insert greeting as first message
      await supabase.from('chatbot_messages').insert({
        conversation_id: conversationId,
        role: 'assistant',
        content: config.greeting_message,
      });
    }

    // Save user message
    await supabase.from('chatbot_messages').insert({
      conversation_id: conversationId,
      role: 'user',
      content: message,
    });

    // Update message count
    const newCount = (conversation.message_count || 0) + 1;
    await supabase
      .from('chatbot_conversations')
      .update({ 
        message_count: newCount, 
        last_message_at: new Date().toISOString() 
      })
      .eq('id', conversationId);

    // Get conversation history (last 20 messages)
    const { data: messages } = await supabase
      .from('chatbot_messages')
      .select('role, content')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(20);

    // Build messages for Claude
    const systemPrompt = config.system_prompt || 'Eres un asistente útil y profesional.';
    
    // Add context about lead capture if needed
    let enhancedSystem = systemPrompt;
    const shouldAskEmail = !conversation.lead_email && newCount >= (config.ask_email_after || 3);
    
    if (shouldAskEmail) {
      enhancedSystem += `\n\nNOTA: Es un buen momento para pedir el email del usuario de forma natural. Ejemplo: "Por cierto, ¿te puedo enviar información más detallada por email?"`;
    }

    // Detect if user shared email
    const emailMatch = message.match(/[\w.-]+@[\w.-]+\.\w+/);
    if (emailMatch && !conversation.lead_email) {
      await supabase
        .from('chatbot_conversations')
        .update({ 
          lead_email: emailMatch[0],
          status: 'lead_captured',
          converted_at: new Date().toISOString()
        })
        .eq('id', conversationId);

      // Create lead record
      await supabase.from('chatbot_leads').insert({
        conversation_id: conversationId,
        email: emailMatch[0],
        source_landing: landingSlug,
        utm_source: sessionData?.utm_source,
        utm_medium: sessionData?.utm_medium,
        utm_campaign: sessionData?.utm_campaign,
        interested_modules: [landingSlug],
        lead_score: 50,
      });
    }

    // Call Claude API
    const claudeMessages = (messages || []).map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content,
    }));

    // Add the current message if not already included
    if (claudeMessages.length === 0 || claudeMessages[claudeMessages.length - 1].content !== message) {
      claudeMessages.push({ role: 'user', content: message });
    }

    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        system: enhancedSystem,
        messages: claudeMessages,
      }),
    });

    if (!claudeResponse.ok) {
      const errorText = await claudeResponse.text();
      console.error('Claude API error:', errorText);
      throw new Error(`Claude API error: ${claudeResponse.status}`);
    }

    const claudeData = await claudeResponse.json();
    const assistantMessage = claudeData.content[0]?.text || config.fallback_message;

    // Save assistant response
    await supabase.from('chatbot_messages').insert({
      conversation_id: conversationId,
      role: 'assistant',
      content: assistantMessage,
    });

    // Parse quick replies from config
    let quickReplies: string[] = [];
    try {
      quickReplies = typeof config.quick_replies === 'string' 
        ? JSON.parse(config.quick_replies) 
        : config.quick_replies || [];
    } catch {
      quickReplies = [];
    }

    // Detect if we should offer demo
    const demoKeywords = ['demo', 'prueba', 'probar', 'ver', 'mostrar'];
    const shouldOfferDemo = demoKeywords.some(kw => 
      message.toLowerCase().includes(kw) || assistantMessage.toLowerCase().includes(kw)
    );

    const response: ChatResponse = {
      conversationId: conversationId!,
      response: assistantMessage,
      quickReplies: newCount <= 2 ? quickReplies : [],
      shouldAskEmail: shouldAskEmail && !emailMatch,
      shouldOfferDemo,
      leadCaptured: !!emailMatch,
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Chatbot error:', error);
    const message = error instanceof Error ? error.message : 'Internal error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
