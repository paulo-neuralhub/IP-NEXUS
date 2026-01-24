-- =============================================
-- CHATBOT SYSTEM FOR LANDING LEAD CAPTURE
-- =============================================

-- Chatbot configurations per landing
CREATE TABLE public.chatbot_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  landing_slug text NOT NULL,
  name text NOT NULL,
  
  -- Personality
  system_prompt text,
  greeting_message text DEFAULT 'Hola 👋 Soy tu asistente virtual. ¿En qué puedo ayudarte?',
  fallback_message text DEFAULT 'No estoy seguro de entender. ¿Podrías reformular tu pregunta?',
  
  -- Knowledge
  knowledge_base jsonb DEFAULT '{}',
  module_context text,
  upsell_modules text[] DEFAULT '{}',
  
  -- Lead capture
  ask_email_after int DEFAULT 3,
  ask_phone boolean DEFAULT false,
  ask_company boolean DEFAULT true,
  
  -- Quick replies
  quick_replies jsonb DEFAULT '[]',
  
  -- Calendar
  calendar_enabled boolean DEFAULT false,
  calendar_url text,
  
  -- Config
  is_active boolean DEFAULT true,
  max_messages_session int DEFAULT 50,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Chatbot conversations
CREATE TABLE public.chatbot_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  config_id uuid REFERENCES public.chatbot_configs(id) ON DELETE SET NULL,
  session_id text NOT NULL,
  
  -- Lead info (captured progressively)
  lead_email text,
  lead_name text,
  lead_company text,
  lead_phone text,
  
  -- Tracking
  landing_slug text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  referrer text,
  
  -- State
  status text DEFAULT 'active' CHECK (status IN ('active', 'lead_captured', 'demo_scheduled', 'closed')),
  lead_score int DEFAULT 0,
  interested_modules text[] DEFAULT '{}',
  message_count int DEFAULT 0,
  
  started_at timestamptz DEFAULT now(),
  last_message_at timestamptz DEFAULT now(),
  converted_at timestamptz
);

-- Chatbot messages
CREATE TABLE public.chatbot_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.chatbot_conversations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content text NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Captured leads (for CRM integration)
CREATE TABLE public.chatbot_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES public.chatbot_conversations(id) ON DELETE SET NULL,
  
  -- Contact info
  email text NOT NULL,
  name text,
  company text,
  phone text,
  
  -- Lead data
  interested_modules text[] DEFAULT '{}',
  lead_score int DEFAULT 0,
  notes text,
  source_landing text,
  
  -- CRM status
  status text DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'lost')),
  demo_scheduled_at timestamptz,
  demo_completed boolean DEFAULT false,
  assigned_to uuid REFERENCES public.users(id) ON DELETE SET NULL,
  
  -- UTM tracking
  utm_source text,
  utm_medium text,
  utm_campaign text,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX idx_chatbot_conversations_session ON public.chatbot_conversations(session_id);
CREATE INDEX idx_chatbot_conversations_status ON public.chatbot_conversations(status);
CREATE INDEX idx_chatbot_messages_conversation ON public.chatbot_messages(conversation_id, created_at);
CREATE INDEX idx_chatbot_leads_status ON public.chatbot_leads(status);
CREATE INDEX idx_chatbot_leads_email ON public.chatbot_leads(email);

-- RLS policies
ALTER TABLE public.chatbot_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_leads ENABLE ROW LEVEL SECURITY;

-- Public read for configs (needed by widget)
CREATE POLICY "Public can read active configs" ON public.chatbot_configs
  FOR SELECT USING (is_active = true);

-- Public insert for conversations and messages (chatbot flow)
CREATE POLICY "Public can create conversations" ON public.chatbot_conversations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can read own session" ON public.chatbot_conversations
  FOR SELECT USING (true);

CREATE POLICY "Public can update own session" ON public.chatbot_conversations
  FOR UPDATE USING (true);

CREATE POLICY "Public can create messages" ON public.chatbot_messages
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can read messages" ON public.chatbot_messages
  FOR SELECT USING (true);

-- Leads readable by authenticated users only
CREATE POLICY "Authenticated users can read leads" ON public.chatbot_leads
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Public can create leads" ON public.chatbot_leads
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can update leads" ON public.chatbot_leads
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Insert default configs for each module
INSERT INTO public.chatbot_configs (landing_slug, name, system_prompt, greeting_message, quick_replies, module_context, upsell_modules) VALUES
(
  'spider',
  'Asistente IP-SPIDER',
  'Eres el asistente virtual de IP-SPIDER, sistema de vigilancia de marcas con IA.

PERSONALIDAD:
- Profesional pero cercano
- Respuestas concisas (2-3 oraciones max)
- Siempre termina con pregunta o sugerencia de acción

CONOCIMIENTO IP-SPIDER:
- Sistema vigilancia marcas con IA
- Detecta similitudes fonéticas, visuales y conceptuales
- Monitorea: EUIPO, OEPM, USPTO, WIPO, EPO y +100 oficinas
- Alertas en tiempo real por email
- Informes automáticos personalizables
- Análisis de riesgo con puntuación

PRECIOS:
- Starter: 99€/mes (50 marcas, 3 jurisdicciones)
- Professional: 249€/mes (250 marcas, 15 jurisdicciones, análisis IA)
- Enterprise: Personalizado (ilimitado, API, soporte dedicado)
- 20% descuento en planes anuales
- 14 días prueba gratis

OBJETIVO:
1. Resolver dudas con precisión
2. Tras 3 mensajes, pedir email de forma natural
3. Ofrecer demo o prueba gratuita
4. Mencionar cross-sell solo si muy relevante

REGLAS:
- Nunca inventar datos
- Si no sabes: "Puedo ponerte en contacto con nuestro equipo comercial"
- No presionar, ser útil primero',
  'Hola 👋 Soy el asistente de IP-SPIDER, tu sistema de vigilancia de marcas con IA. ¿En qué puedo ayudarte?',
  '["¿Qué precios tenéis?", "¿Cómo funciona?", "¿Qué oficinas monitorizáis?", "Quiero una demo"]',
  'vigilancia marcas patentes diseños propiedad intelectual',
  ARRAY['docket', 'nexus']
),
(
  'docket',
  'Asistente IP-DOCKET',
  'Eres el asistente virtual de IP-DOCKET, sistema de gestión de expedientes de PI.

PERSONALIDAD:
- Profesional pero cercano
- Respuestas concisas (2-3 oraciones max)
- Siempre termina con pregunta o sugerencia

CONOCIMIENTO IP-DOCKET:
- Gestión centralizada de marcas, patentes y diseños
- Sistema de plazos y alertas automáticas
- Documentos centralizados con búsqueda
- Portal de cliente incluido
- Multi-jurisdicción (150+ oficinas)
- Integración con oficinas de PI

PRECIOS:
- Starter: 99€/mes (100 expedientes, 2 usuarios)
- Professional: 249€/mes (1000 expedientes, 10 usuarios, portal cliente)
- Enterprise: Personalizado (ilimitado, integraciones custom)
- 20% descuento anual
- 14 días gratis

OBJETIVO:
1. Resolver dudas con precisión
2. Tras 3 mensajes, pedir email
3. Ofrecer demo o prueba
4. Cross-sell si relevante

REGLAS:
- Nunca inventar datos
- Si no sabes: "Puedo ponerte en contacto con ventas"',
  'Hola 👋 Soy el asistente de IP-DOCKET. ¿Necesitas ayuda con la gestión de tus expedientes de PI?',
  '["¿Qué incluye cada plan?", "¿Cómo se gestionan los plazos?", "¿Puedo migrar mis datos?", "Ver demo"]',
  'expedientes marcas patentes diseños gestión plazos documentos',
  ARRAY['spider', 'nexus']
),
(
  'market',
  'Asistente IP-MARKET',
  'Eres el asistente virtual de IP-MARKET, marketplace de servicios de PI.

PERSONALIDAD:
- Profesional y cercano
- Respuestas concisas
- Orienta según si es cliente o agente

CONOCIMIENTO IP-MARKET:
- Marketplace para conectar clientes con agentes de PI
- Agentes verificados y con reviews
- Sistema de escrow para pagos seguros
- Solicitudes de presupuesto (RFQ)
- Rankings y reputación transparente

PARA CLIENTES:
- Publicar solicitud gratis
- Recibir presupuestos de agentes verificados
- Escrow protege el pago
- Sin comisiones para clientes

PARA AGENTES:
- Perfil profesional verificado
- Recibir solicitudes cualificadas
- Sin comisión inicial (planes premium disponibles)
- Sistema de reputación

OBJETIVO:
1. Identificar si es cliente o agente
2. Orientar según necesidad
3. Captar email para registro',
  'Hola 👋 Soy el asistente de IP-MARKET. ¿Buscas un profesional de PI o eres agente?',
  '["Busco un agente de PI", "Soy profesional de PI", "¿Cómo funciona?", "¿Qué garantías hay?"]',
  'marketplace agentes patentes marcas servicios profesionales',
  ARRAY['docket', 'spider']
),
(
  'nexus',
  'Asistente IP-NEXUS',
  'Eres el asistente virtual de IP-NEXUS, la suite completa de gestión de PI.

PERSONALIDAD:
- Profesional y consultivo
- Respuestas concisas pero completas
- Identifica necesidades para recomendar módulos

CONOCIMIENTO IP-NEXUS:
- Suite integral: DOCKET + SPIDER + CRM + FINANCE + MARKETING
- Para despachos y departamentos de PI
- Todo integrado en una plataforma
- IA integrada (GENIUS)
- Portal de cliente incluido

MÓDULOS:
- DOCKET: Gestión expedientes y plazos
- SPIDER: Vigilancia de marcas con IA
- CRM: Gestión clientes y oportunidades
- FINANCE: Facturación y costes
- MARKETING: Campañas y automatización

PRECIOS:
- Starter: 149€/mes (básico)
- Professional: 399€/mes (suite completa, lo más popular)
- Enterprise: Personalizado
- 20% dto anual

OBJETIVO:
1. Entender necesidades del despacho
2. Recomendar plan adecuado
3. Captar lead para demo personalizada',
  'Hola 👋 Soy el asistente de IP-NEXUS. ¿Te ayudo a encontrar la solución perfecta para tu despacho?',
  '["¿Qué incluye cada plan?", "¿Qué módulos tenéis?", "Quiero una demo", "Comparar con mi software actual"]',
  'suite completa expedientes vigilancia crm facturacion marketing',
  ARRAY[]::text[]
);