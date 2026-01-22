-- =====================================================
-- IP-NEXUS CRM FIX 4/4 (FINAL): create schema in correct order
-- =====================================================

-- 0) updated_at trigger helper
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 1) crm_email_tracking
CREATE TABLE IF NOT EXISTS public.crm_email_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  interaction_id UUID REFERENCES public.crm_interactions(id) ON DELETE SET NULL,
  contact_id UUID REFERENCES public.crm_contacts(id) ON DELETE SET NULL,
  deal_id UUID REFERENCES public.crm_deals(id) ON DELETE SET NULL,

  provider TEXT DEFAULT 'sendgrid',
  provider_message_id TEXT,

  from_email TEXT NOT NULL,
  from_name TEXT,
  to_email TEXT NOT NULL,
  to_name TEXT,
  cc_emails TEXT[],
  bcc_emails TEXT[],
  reply_to TEXT,

  subject TEXT NOT NULL,
  body_preview TEXT,
  template_code TEXT,

  status TEXT DEFAULT 'queued',

  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  first_opened_at TIMESTAMPTZ,
  last_opened_at TIMESTAMPTZ,
  opened_count INTEGER DEFAULT 0,
  first_clicked_at TIMESTAMPTZ,
  clicked_links JSONB DEFAULT '[]'::jsonb,

  error_code TEXT,
  error_message TEXT,
  bounce_type TEXT,

  metadata JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_email_tracking_org ON public.crm_email_tracking(organization_id);
CREATE INDEX IF NOT EXISTS idx_email_tracking_contact ON public.crm_email_tracking(contact_id) WHERE contact_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_email_tracking_deal ON public.crm_email_tracking(deal_id) WHERE deal_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_email_tracking_status ON public.crm_email_tracking(status);
CREATE INDEX IF NOT EXISTS idx_email_tracking_to ON public.crm_email_tracking(to_email);
CREATE INDEX IF NOT EXISTS idx_email_tracking_created ON public.crm_email_tracking(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_tracking_provider_id ON public.crm_email_tracking(provider_message_id) WHERE provider_message_id IS NOT NULL;

ALTER TABLE public.crm_email_tracking ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  BEGIN
    EXECUTE 'CREATE POLICY tenant_email_tracking ON public.crm_email_tracking FOR ALL USING (organization_id = ANY(get_user_organization_ids()) OR is_backoffice_admin()) WITH CHECK (organization_id = ANY(get_user_organization_ids()) OR is_backoffice_admin())';
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;

DROP TRIGGER IF EXISTS trg_crm_email_tracking_updated_at ON public.crm_email_tracking;
CREATE TRIGGER trg_crm_email_tracking_updated_at
BEFORE UPDATE ON public.crm_email_tracking
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- 2) crm_whatsapp_messages
CREATE TABLE IF NOT EXISTS public.crm_whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  interaction_id UUID REFERENCES public.crm_interactions(id) ON DELETE SET NULL,
  contact_id UUID REFERENCES public.crm_contacts(id) ON DELETE SET NULL,

  wa_message_id TEXT,
  wa_conversation_id TEXT,
  wa_phone_number_id TEXT,

  direction TEXT NOT NULL,

  from_phone TEXT NOT NULL,
  to_phone TEXT NOT NULL,

  message_type TEXT NOT NULL DEFAULT 'text',

  content TEXT,
  template_name TEXT,
  template_namespace TEXT,
  template_language TEXT DEFAULT 'es',
  template_components JSONB,

  media_id TEXT,
  media_url TEXT,
  media_mime_type TEXT,
  media_filename TEXT,
  media_caption TEXT,

  status TEXT DEFAULT 'pending',

  error_code TEXT,
  error_message TEXT,

  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,

  metadata JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wa_messages_org ON public.crm_whatsapp_messages(organization_id);
CREATE INDEX IF NOT EXISTS idx_wa_messages_contact ON public.crm_whatsapp_messages(contact_id) WHERE contact_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_wa_messages_direction ON public.crm_whatsapp_messages(direction);
CREATE INDEX IF NOT EXISTS idx_wa_messages_status ON public.crm_whatsapp_messages(status);
CREATE INDEX IF NOT EXISTS idx_wa_messages_to_phone ON public.crm_whatsapp_messages(to_phone);
CREATE INDEX IF NOT EXISTS idx_wa_messages_from_phone ON public.crm_whatsapp_messages(from_phone);
CREATE INDEX IF NOT EXISTS idx_wa_messages_wa_id ON public.crm_whatsapp_messages(wa_message_id) WHERE wa_message_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_wa_messages_created ON public.crm_whatsapp_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wa_messages_conversation ON public.crm_whatsapp_messages(wa_conversation_id) WHERE wa_conversation_id IS NOT NULL;

ALTER TABLE public.crm_whatsapp_messages ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  BEGIN
    EXECUTE 'CREATE POLICY tenant_wa_messages ON public.crm_whatsapp_messages FOR ALL USING (organization_id = ANY(get_user_organization_ids()) OR is_backoffice_admin()) WITH CHECK (organization_id = ANY(get_user_organization_ids()) OR is_backoffice_admin())';
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;

DROP TRIGGER IF EXISTS trg_crm_whatsapp_messages_updated_at ON public.crm_whatsapp_messages;
CREATE TRIGGER trg_crm_whatsapp_messages_updated_at
BEFORE UPDATE ON public.crm_whatsapp_messages
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- 3) crm_whatsapp_templates
CREATE TABLE IF NOT EXISTS public.crm_whatsapp_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  code TEXT NOT NULL,

  wa_template_name TEXT NOT NULL,
  wa_template_id TEXT,
  wa_namespace TEXT,

  language TEXT DEFAULT 'es',
  category TEXT DEFAULT 'MARKETING',

  header_type TEXT,
  header_text TEXT,
  header_example TEXT,

  body_text TEXT NOT NULL,
  body_example TEXT,

  footer_text TEXT,

  buttons JSONB DEFAULT '[]'::jsonb,
  variables JSONB DEFAULT '[]'::jsonb,

  status TEXT DEFAULT 'pending',
  rejection_reason TEXT,

  metadata JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  approved_at TIMESTAMPTZ,

  UNIQUE(organization_id, code)
);

CREATE INDEX IF NOT EXISTS idx_wa_templates_org ON public.crm_whatsapp_templates(organization_id);
CREATE INDEX IF NOT EXISTS idx_wa_templates_status ON public.crm_whatsapp_templates(status);
CREATE INDEX IF NOT EXISTS idx_wa_templates_code ON public.crm_whatsapp_templates(organization_id, code);

ALTER TABLE public.crm_whatsapp_templates ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  BEGIN
    EXECUTE 'CREATE POLICY tenant_wa_templates ON public.crm_whatsapp_templates FOR ALL USING (organization_id = ANY(get_user_organization_ids()) OR is_backoffice_admin()) WITH CHECK (organization_id = ANY(get_user_organization_ids()) OR is_backoffice_admin())';
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;

DROP TRIGGER IF EXISTS trg_crm_whatsapp_templates_updated_at ON public.crm_whatsapp_templates;
CREATE TRIGGER trg_crm_whatsapp_templates_updated_at
BEFORE UPDATE ON public.crm_whatsapp_templates
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- 4) crm_email_templates
CREATE TABLE IF NOT EXISTS public.crm_email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,

  category TEXT DEFAULT 'general',

  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  body_text TEXT,

  variables JSONB DEFAULT '[]'::jsonb,

  from_name TEXT,
  from_email TEXT,
  reply_to TEXT,

  is_active BOOLEAN DEFAULT TRUE,
  is_system BOOLEAN DEFAULT FALSE,

  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,

  metadata JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES public.users(id),

  UNIQUE(organization_id, code)
);

CREATE INDEX IF NOT EXISTS idx_email_templates_org ON public.crm_email_templates(organization_id);
CREATE INDEX IF NOT EXISTS idx_email_templates_code ON public.crm_email_templates(organization_id, code);
CREATE INDEX IF NOT EXISTS idx_email_templates_category ON public.crm_email_templates(organization_id, category);
CREATE INDEX IF NOT EXISTS idx_email_templates_active ON public.crm_email_templates(organization_id, is_active) WHERE is_active = TRUE;

ALTER TABLE public.crm_email_templates ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  BEGIN
    EXECUTE 'CREATE POLICY tenant_email_templates ON public.crm_email_templates FOR ALL USING (organization_id = ANY(get_user_organization_ids()) OR is_backoffice_admin()) WITH CHECK (organization_id = ANY(get_user_organization_ids()) OR is_backoffice_admin())';
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;

DROP TRIGGER IF EXISTS trg_crm_email_templates_updated_at ON public.crm_email_templates;
CREATE TRIGGER trg_crm_email_templates_updated_at
BEFORE UPDATE ON public.crm_email_templates
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- 5) organizations: non-sensitive integration config fields
ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS whatsapp_phone TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_business_id TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_phone_number_id TEXT,
  ADD COLUMN IF NOT EXISTS email_from_address TEXT,
  ADD COLUMN IF NOT EXISTS email_from_name TEXT;

-- 6) RPCs
CREATE OR REPLACE FUNCTION public.crm_initialize_default_email_templates(p_organization_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_count INTEGER := 0;
BEGIN
  IF NOT (p_organization_id = ANY(get_user_organization_ids()) OR is_backoffice_admin()) THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  IF EXISTS (SELECT 1 FROM public.crm_email_templates WHERE organization_id = p_organization_id AND is_system = TRUE) THEN
    RETURN 0;
  END IF;

  INSERT INTO public.crm_email_templates (organization_id, code, name, category, subject, body_html, variables, is_system)
  VALUES (
    p_organization_id,
    'lead_response_immediate',
    'Respuesta Inmediata a Lead',
    'onboarding',
    'Gracias por contactar con nosotros',
    '<p>Hola {{contact.first_name}},</p>\n<p>Gracias por ponerte en contacto con nosotros. Hemos recibido tu consulta sobre <strong>{{contact.inquiry_type}}</strong>.</p>\n<p>Uno de nuestros especialistas se pondrá en contacto contigo en las próximas horas para atenderte personalmente.</p>\n<p>Mientras tanto, si tienes alguna pregunta urgente, no dudes en llamarnos al {{organization.phone}}.</p>\n<p>Un saludo,<br>El equipo de {{organization.name}}</p>',
    '[{"key":"contact.first_name","label":"Nombre"},{"key":"contact.inquiry_type","label":"Tipo de consulta"},{"key":"organization.name","label":"Nombre empresa"},{"key":"organization.phone","label":"Teléfono"}]'::jsonb,
    TRUE
  );
  v_count := v_count + 1;

  INSERT INTO public.crm_email_templates (organization_id, code, name, category, subject, body_html, variables, is_system)
  VALUES (
    p_organization_id,
    'welcome_client',
    'Bienvenida Nuevo Cliente',
    'onboarding',
    '¡Bienvenido a {{organization.name}}!',
    '<p>Estimado/a {{contact.full_name}},</p>\n<p>Es un placer darte la bienvenida como cliente de {{organization.name}}.</p>\n<p>Tu abogado responsable será <strong>{{deal.owner.name}}</strong>, quien te contactará en breve para explicarte los próximos pasos.</p>\n<p>Datos de tu expediente:</p>\n<ul>\n<li><strong>Referencia:</strong> {{deal.name}}</li>\n<li><strong>Servicio:</strong> {{deal.service_type}}</li>\n</ul>\n<p>Si tienes cualquier pregunta, no dudes en contactarnos.</p>\n<p>¡Gracias por confiar en nosotros!</p>',
    '[{"key":"contact.full_name","label":"Nombre completo"},{"key":"organization.name","label":"Nombre empresa"},{"key":"deal.owner.name","label":"Abogado responsable"},{"key":"deal.name","label":"Referencia"},{"key":"deal.service_type","label":"Tipo de servicio"}]'::jsonb,
    TRUE
  );
  v_count := v_count + 1;

  INSERT INTO public.crm_email_templates (organization_id, code, name, category, subject, body_html, variables, is_system)
  VALUES (
    p_organization_id,
    'trademark_filed',
    'Confirmación Marca Presentada',
    'service',
    '✅ Tu marca {{deal.trademark_name}} ha sido presentada',
    '<p>Estimado/a {{contact.first_name}},</p>\n<p>Nos complace informarte que tu marca <strong>{{deal.trademark_name}}</strong> ha sido presentada ante la oficina correspondiente.</p>\n<p><strong>Datos de la solicitud:</strong></p>\n<ul>\n<li>Marca: {{deal.trademark_name}}</li>\n<li>Número de solicitud: {{matter.official_number}}</li>\n<li>Fecha de presentación: {{matter.filing_date}}</li>\n<li>Territorio: {{deal.territory}}</li>\n</ul>\n<p>El proceso de examen suele tardar entre 3-6 meses. Te mantendremos informado de cualquier novedad.</p>\n<p>Un saludo,<br>{{deal.owner.name}}</p>',
    '[{"key":"contact.first_name","label":"Nombre"},{"key":"deal.trademark_name","label":"Nombre marca"},{"key":"matter.official_number","label":"Número solicitud"},{"key":"matter.filing_date","label":"Fecha presentación"},{"key":"deal.territory","label":"Territorio"},{"key":"deal.owner.name","label":"Abogado"}]'::jsonb,
    TRUE
  );
  v_count := v_count + 1;

  INSERT INTO public.crm_email_templates (organization_id, code, name, category, subject, body_html, variables, is_system)
  VALUES (
    p_organization_id,
    'trademark_granted',
    '¡Marca Concedida!',
    'service',
    '🎉 ¡Enhorabuena! Tu marca {{deal.trademark_name}} ha sido concedida',
    '<p>Estimado/a {{contact.first_name}},</p>\n<p>¡Excelentes noticias! Tu marca <strong>{{deal.trademark_name}}</strong> ha sido oficialmente concedida y registrada.</p>\n<p><strong>Datos del registro:</strong></p>\n<ul>\n<li>Marca: {{deal.trademark_name}}</li>\n<li>Número de registro: {{matter.registration_number}}</li>\n<li>Fecha de concesión: {{matter.grant_date}}</li>\n<li>Válida hasta: {{matter.expiry_date}}</li>\n</ul>\n<p>Te enviaremos el título oficial en cuanto lo recibamos de la oficina.</p>\n<p>Si deseas ampliar la protección a otros territorios o servicios adicionales, estaremos encantados de asesorarte.</p>\n<p>¡Enhorabuena!<br>{{deal.owner.name}}</p>',
    '[{"key":"contact.first_name","label":"Nombre"},{"key":"deal.trademark_name","label":"Nombre marca"},{"key":"matter.registration_number","label":"Número registro"},{"key":"matter.grant_date","label":"Fecha concesión"},{"key":"matter.expiry_date","label":"Fecha vencimiento"},{"key":"deal.owner.name","label":"Abogado"}]'::jsonb,
    TRUE
  );
  v_count := v_count + 1;

  INSERT INTO public.crm_email_templates (organization_id, code, name, category, subject, body_html, variables, is_system)
  VALUES (
    p_organization_id,
    'renewal_notice_6m',
    'Aviso Renovación 6 Meses',
    'renewal',
    '📅 Renovación próxima: {{matter.title}}',
    '<p>Estimado/a {{contact.first_name}},</p>\n<p>Te informamos que tu marca <strong>{{matter.title}}</strong> vencerá en aproximadamente 6 meses.</p>\n<p><strong>Datos:</strong></p>\n<ul>\n<li>Marca: {{matter.title}}</li>\n<li>Número: {{matter.registration_number}}</li>\n<li>Fecha vencimiento: {{matter.expiry_date}}</li>\n</ul>\n<p>Para mantener tu marca protegida, es necesario renovarla antes de la fecha de vencimiento.</p>\n<p>Adjuntamos presupuesto para la renovación. Si deseas proceder, responde a este email o llámanos.</p>\n<p>Un saludo,<br>{{organization.name}}</p>',
    '[{"key":"contact.first_name","label":"Nombre"},{"key":"matter.title","label":"Nombre marca"},{"key":"matter.registration_number","label":"Número registro"},{"key":"matter.expiry_date","label":"Fecha vencimiento"},{"key":"organization.name","label":"Nombre empresa"}]'::jsonb,
    TRUE
  );
  v_count := v_count + 1;

  INSERT INTO public.crm_email_templates (organization_id, code, name, category, subject, body_html, variables, is_system)
  VALUES (
    p_organization_id,
    'invoice_reminder',
    'Recordatorio de Factura',
    'billing',
    'Recordatorio: Factura {{invoice.number}} pendiente',
    '<p>Estimado/a {{contact.first_name}},</p>\n<p>Te recordamos que tienes pendiente de pago la siguiente factura:</p>\n<ul>\n<li>Factura: {{invoice.number}}</li>\n<li>Importe: {{invoice.amount}}€</li>\n<li>Vencimiento: {{invoice.due_date}}</li>\n</ul>\n<p>Si ya has realizado el pago, por favor ignora este mensaje.</p>\n<p>Para cualquier consulta sobre esta factura, no dudes en contactarnos.</p>\n<p>Un saludo,<br>{{organization.name}}</p>',
    '[{"key":"contact.first_name","label":"Nombre"},{"key":"invoice.number","label":"Número factura"},{"key":"invoice.amount","label":"Importe"},{"key":"invoice.due_date","label":"Fecha vencimiento"},{"key":"organization.name","label":"Nombre empresa"}]'::jsonb,
    TRUE
  );
  v_count := v_count + 1;

  RETURN v_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.crm_log_email_sent(
  p_organization_id UUID,
  p_to_email TEXT,
  p_subject TEXT,
  p_from_email TEXT,
  p_from_name TEXT DEFAULT NULL,
  p_contact_id UUID DEFAULT NULL,
  p_deal_id UUID DEFAULT NULL,
  p_interaction_id UUID DEFAULT NULL,
  p_template_code TEXT DEFAULT NULL,
  p_provider TEXT DEFAULT 'sendgrid',
  p_provider_message_id TEXT DEFAULT NULL,
  p_body_preview TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_email_id UUID;
BEGIN
  IF NOT (p_organization_id = ANY(get_user_organization_ids()) OR is_backoffice_admin()) THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  INSERT INTO public.crm_email_tracking (
    organization_id,
    interaction_id,
    contact_id,
    deal_id,
    provider,
    provider_message_id,
    from_email,
    from_name,
    to_email,
    subject,
    body_preview,
    template_code,
    status,
    sent_at,
    metadata
  ) VALUES (
    p_organization_id,
    p_interaction_id,
    p_contact_id,
    p_deal_id,
    COALESCE(p_provider, 'sendgrid'),
    p_provider_message_id,
    p_from_email,
    p_from_name,
    p_to_email,
    p_subject,
    CASE WHEN p_body_preview IS NULL THEN NULL ELSE LEFT(p_body_preview, 200) END,
    p_template_code,
    'sent',
    now(),
    COALESCE(p_metadata, '{}'::jsonb)
  )
  RETURNING id INTO v_email_id;

  IF p_template_code IS NOT NULL THEN
    UPDATE public.crm_email_templates
    SET usage_count = usage_count + 1,
        last_used_at = now()
    WHERE organization_id = p_organization_id
      AND code = p_template_code;
  END IF;

  RETURN v_email_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.crm_log_whatsapp_sent(
  p_organization_id UUID,
  p_to_phone TEXT,
  p_message_type TEXT,
  p_content TEXT DEFAULT NULL,
  p_template_name TEXT DEFAULT NULL,
  p_contact_id UUID DEFAULT NULL,
  p_interaction_id UUID DEFAULT NULL,
  p_wa_message_id TEXT DEFAULT NULL,
  p_wa_conversation_id TEXT DEFAULT NULL,
  p_wa_phone_number_id TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_message_id UUID;
  v_from_phone TEXT;
BEGIN
  IF NOT (p_organization_id = ANY(get_user_organization_ids()) OR is_backoffice_admin()) THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  SELECT o.whatsapp_phone INTO v_from_phone
  FROM public.organizations o
  WHERE o.id = p_organization_id;

  INSERT INTO public.crm_whatsapp_messages (
    organization_id,
    interaction_id,
    contact_id,
    wa_message_id,
    wa_conversation_id,
    wa_phone_number_id,
    direction,
    from_phone,
    to_phone,
    message_type,
    content,
    template_name,
    status,
    sent_at,
    metadata
  ) VALUES (
    p_organization_id,
    p_interaction_id,
    p_contact_id,
    p_wa_message_id,
    p_wa_conversation_id,
    p_wa_phone_number_id,
    'outbound',
    COALESCE(v_from_phone, 'unknown'),
    p_to_phone,
    COALESCE(p_message_type, 'text'),
    p_content,
    p_template_name,
    'sent',
    now(),
    COALESCE(p_metadata, '{}'::jsonb)
  )
  RETURNING id INTO v_message_id;

  RETURN v_message_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.crm_get_contact_communications(
  p_contact_id UUID,
  p_limit INTEGER DEFAULT 50
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_org_id UUID;
BEGIN
  SELECT c.organization_id INTO v_org_id
  FROM public.crm_contacts c
  WHERE c.id = p_contact_id;

  IF v_org_id IS NULL THEN
    RAISE EXCEPTION 'contact not found';
  END IF;

  IF NOT (v_org_id = ANY(get_user_organization_ids()) OR is_backoffice_admin()) THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  RETURN (
    SELECT jsonb_build_object(
      'emails', (
        SELECT COALESCE(
          jsonb_agg(
            jsonb_build_object(
              'id', et.id,
              'type', 'email',
              'subject', et.subject,
              'to_email', et.to_email,
              'status', et.status,
              'sent_at', et.sent_at,
              'opened_at', et.first_opened_at,
              'opened_count', et.opened_count
            )
            ORDER BY et.created_at DESC
          ),
          '[]'::jsonb
        )
        FROM public.crm_email_tracking et
        WHERE et.contact_id = p_contact_id
        LIMIT p_limit
      ),
      'whatsapp', (
        SELECT COALESCE(
          jsonb_agg(
            jsonb_build_object(
              'id', wm.id,
              'type', 'whatsapp',
              'direction', wm.direction,
              'message_type', wm.message_type,
              'content', CASE WHEN wm.content IS NULL THEN NULL ELSE LEFT(wm.content, 100) END,
              'status', wm.status,
              'sent_at', wm.sent_at,
              'read_at', wm.read_at
            )
            ORDER BY wm.created_at DESC
          ),
          '[]'::jsonb
        )
        FROM public.crm_whatsapp_messages wm
        WHERE wm.contact_id = p_contact_id
        LIMIT p_limit
      )
    )
  );
END;
$$;