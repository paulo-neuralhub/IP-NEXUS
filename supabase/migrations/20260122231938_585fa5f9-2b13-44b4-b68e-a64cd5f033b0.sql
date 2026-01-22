-- =====================================================
-- IP-NEXUS CRM: Seed default communication templates
-- Creates internal seed functions + RPC wrappers with auth/membership checks
-- Executes seed for existing organizations
-- =====================================================

-- 1) Helper: ensure caller is member of org (for RPC usage)
CREATE OR REPLACE FUNCTION public.crm_assert_org_member(p_organization_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.memberships m
    WHERE m.organization_id = p_organization_id
      AND m.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'not authorized';
  END IF;
END;
$$;

-- 2) INTERNAL: Email seed (no auth required; intended for admin/migrations)
CREATE OR REPLACE FUNCTION public._crm_seed_default_email_templates(p_organization_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer := 0;
BEGIN
  -- Avoid duplicates: if system templates already exist for org
  IF EXISTS (
    SELECT 1 FROM public.crm_email_templates
    WHERE organization_id = p_organization_id AND is_system = TRUE
  ) THEN
    RETURN 0;
  END IF;

  -- CAPTACIÓN / LEADS
  INSERT INTO public.crm_email_templates
    (organization_id, code, name, category, subject, body_html, body_text, variables, is_system, is_active)
  VALUES
    (p_organization_id, 'lead_instant_response', 'Respuesta Inmediata a Lead', 'sales',
     'Gracias por contactar con {{organization.name}}',
     '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">\n<p>Estimado/a {{contact.first_name}},</p>\n<p>Gracias por ponerte en contacto con <strong>{{organization.name}}</strong>.</p>\n<p>Hemos recibido tu consulta sobre <strong>{{inquiry.type}}</strong> y uno de nuestros especialistas en Propiedad Intelectual se pondrá en contacto contigo en las próximas <strong>24 horas</strong>.</p>\n<p>Mientras tanto, si tienes alguna pregunta urgente, puedes llamarnos al <strong>{{organization.phone}}</strong>.</p>\n<br>\n<p>Un cordial saludo,</p>\n<p><strong>{{organization.name}}</strong></p>\n</div>',
     'Estimado/a {{contact.first_name}},\n\nGracias por contactar con {{organization.name}}.\n\nHemos recibido tu consulta sobre {{inquiry.type}} y uno de nuestros especialistas se pondrá en contacto contigo en las próximas 24 horas.\n\nSi tienes alguna pregunta urgente, llámanos al {{organization.phone}}.\n\nUn cordial saludo,\n{{organization.name}}',
     '[{"key":"contact.first_name","label":"Nombre del contacto"},{"key":"inquiry.type","label":"Tipo de consulta"},{"key":"organization.name","label":"Nombre del despacho"},{"key":"organization.phone","label":"Teléfono"}]'::jsonb,
     TRUE, TRUE
    ),
    (p_organization_id, 'lead_followup_3days', 'Follow-up Lead 3 días', 'sales',
     '¿Podemos ayudarte con tu consulta sobre {{inquiry.type}}?',
     '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">\n<p>Hola {{contact.first_name}},</p>\n<p>Hace unos días nos contactaste para consultar sobre <strong>{{inquiry.type}}</strong>.</p>\n<p>Queríamos saber si pudimos resolver tu consulta o si necesitas más información.</p>\n<p>Estamos a tu disposición para:</p>\n<ul>\n<li>Resolver cualquier duda adicional</li>\n<li>Enviarte un presupuesto personalizado</li>\n<li>Agendar una llamada o videollamada</li>\n</ul>\n<p>Solo tienes que responder a este email o llamarnos al {{organization.phone}}.</p>\n<br>\n<p>Un saludo,</p>\n<p><strong>{{owner.name}}</strong><br>{{organization.name}}</p>\n</div>',
     NULL,
     '[{"key":"contact.first_name","label":"Nombre"},{"key":"inquiry.type","label":"Tipo consulta"},{"key":"organization.phone","label":"Teléfono"},{"key":"owner.name","label":"Nombre del responsable"},{"key":"organization.name","label":"Despacho"}]'::jsonb,
     TRUE, TRUE
    );
  v_count := v_count + 2;

  -- ONBOARDING / BIENVENIDA
  INSERT INTO public.crm_email_templates
    (organization_id, code, name, category, subject, body_html, body_text, variables, is_system, is_active)
  VALUES
    (p_organization_id, 'welcome_new_client', 'Bienvenida Nuevo Cliente', 'onboarding',
     '¡Bienvenido/a a {{organization.name}}!',
     '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">\n<p>Estimado/a {{contact.full_name}},</p>\n<p>Es un placer darte la bienvenida como cliente de <strong>{{organization.name}}</strong>.</p>\n<p><strong>Datos de tu expediente:</strong></p>\n<table style="width: 100%; border-collapse: collapse; margin: 20px 0;">\n<tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Referencia:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">{{deal.reference}}</td></tr>\n<tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Servicio:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">{{deal.service_type}}</td></tr>\n<tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Responsable:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">{{owner.name}}</td></tr>\n</table>\n<p>Tu abogado responsable se pondrá en contacto contigo en breve para explicarte los próximos pasos.</p>\n<p>Si tienes acceso al <strong>Portal del Cliente</strong>, podrás seguir el estado de tu expediente en tiempo real.</p>\n<br>\n<p>¡Gracias por confiar en nosotros!</p>\n<p><strong>{{organization.name}}</strong></p>\n</div>',
     NULL,
     '[{"key":"contact.full_name","label":"Nombre completo"},{"key":"deal.reference","label":"Referencia"},{"key":"deal.service_type","label":"Tipo de servicio"},{"key":"owner.name","label":"Abogado responsable"},{"key":"organization.name","label":"Despacho"}]'::jsonb,
     TRUE, TRUE
    );
  v_count := v_count + 1;

  -- TRAMITACIÓN MARCAS
  INSERT INTO public.crm_email_templates
    (organization_id, code, name, category, subject, body_html, body_text, variables, is_system, is_active)
  VALUES
    (p_organization_id, 'docs_pending_reminder', 'Recordatorio Documentos Pendientes', 'service',
     '📋 Documentos pendientes para tu marca {{deal.trademark_name}}',
     '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">\n<p>Hola {{contact.first_name}},</p>\n<p>Te recordamos que para avanzar con el registro de tu marca <strong>{{deal.trademark_name}}</strong>, necesitamos que nos envíes la siguiente documentación:</p>\n<div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">\n{{pending_docs_list}}\n</div>\n<p>Puedes enviar los documentos respondiendo a este email o subiéndolos directamente en el Portal del Cliente.</p>\n<p><strong>¿Necesitas ayuda?</strong> No dudes en contactarnos.</p>\n<br>\n<p>Un saludo,</p>\n<p><strong>{{owner.name}}</strong></p>\n</div>',
     NULL,
     '[{"key":"contact.first_name","label":"Nombre"},{"key":"deal.trademark_name","label":"Nombre de la marca"},{"key":"pending_docs_list","label":"Lista de documentos"},{"key":"owner.name","label":"Responsable"}]'::jsonb,
     TRUE, TRUE
    ),
    (p_organization_id, 'trademark_filed', 'Marca Presentada', 'service',
     '✅ Tu marca {{deal.trademark_name}} ha sido presentada',
     '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">\n<p>Estimado/a {{contact.first_name}},</p>\n<p>Nos complace informarte que tu marca <strong>{{deal.trademark_name}}</strong> ha sido presentada oficialmente.</p>\n<table style="width: 100%; border-collapse: collapse; margin: 20px 0; background: #f0fdf4; border-radius: 8px;">\n<tr><td style="padding: 12px;"><strong>Marca:</strong></td><td style="padding: 12px;">{{deal.trademark_name}}</td></tr>\n<tr><td style="padding: 12px;"><strong>Nº Solicitud:</strong></td><td style="padding: 12px;">{{matter.application_number}}</td></tr>\n<tr><td style="padding: 12px;"><strong>Fecha presentación:</strong></td><td style="padding: 12px;">{{matter.filing_date}}</td></tr>\n<tr><td style="padding: 12px;"><strong>Territorio:</strong></td><td style="padding: 12px;">{{deal.territory}}</td></tr>\n</table>\n<p><strong>¿Qué sigue ahora?</strong></p>\n<p>La oficina examinará la solicitud. Este proceso suele tardar entre 3-6 meses. Te mantendremos informado de cualquier novedad.</p>\n<br>\n<p>Un saludo,</p>\n<p><strong>{{owner.name}}</strong><br>{{organization.name}}</p>\n</div>',
     NULL,
     '[{"key":"contact.first_name","label":"Nombre"},{"key":"deal.trademark_name","label":"Marca"},{"key":"matter.application_number","label":"Nº Solicitud"},{"key":"matter.filing_date","label":"Fecha"},{"key":"deal.territory","label":"Territorio"},{"key":"owner.name","label":"Responsable"},{"key":"organization.name","label":"Despacho"}]'::jsonb,
     TRUE, TRUE
    ),
    (p_organization_id, 'trademark_office_action', 'Suspenso/Objeción Recibido', 'service',
     '⚠️ Acción requerida: Suspenso en tu marca {{deal.trademark_name}}',
     '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">\n<p>Estimado/a {{contact.first_name}},</p>\n<p>Te informamos que hemos recibido un <strong>suspenso/objeción</strong> de la oficina respecto a tu marca <strong>{{deal.trademark_name}}</strong>.</p>\n<div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">\n<strong>Motivo:</strong> {{office_action.reason}}<br>\n<strong>Plazo de respuesta:</strong> {{office_action.deadline}}\n</div>\n<p>Nuestro equipo ya está analizando el caso y te contactaremos en breve para explicarte las opciones disponibles.</p>\n<p><strong>No te preocupes</strong>, muchos suspensos se resuelven satisfactoriamente con la estrategia adecuada.</p>\n<br>\n<p>Un saludo,</p>\n<p><strong>{{owner.name}}</strong></p>\n</div>',
     NULL,
     '[{"key":"contact.first_name","label":"Nombre"},{"key":"deal.trademark_name","label":"Marca"},{"key":"office_action.reason","label":"Motivo"},{"key":"office_action.deadline","label":"Plazo"},{"key":"owner.name","label":"Responsable"}]'::jsonb,
     TRUE, TRUE
    ),
    (p_organization_id, 'trademark_granted', 'Marca Concedida', 'service',
     '🎉 ¡Enhorabuena! Tu marca {{deal.trademark_name}} ha sido concedida',
     '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">\n<p>Estimado/a {{contact.first_name}},</p>\n<p style="font-size: 18px;">🎉 <strong>¡Excelentes noticias!</strong></p>\n<p>Tu marca <strong>{{deal.trademark_name}}</strong> ha sido <strong style="color: #22c55e;">CONCEDIDA</strong> y registrada oficialmente.</p>\n<table style="width: 100%; border-collapse: collapse; margin: 20px 0; background: #f0fdf4; border-radius: 8px;">\n<tr><td style="padding: 12px;"><strong>Marca:</strong></td><td style="padding: 12px;">{{deal.trademark_name}}</td></tr>\n<tr><td style="padding: 12px;"><strong>Nº Registro:</strong></td><td style="padding: 12px;">{{matter.registration_number}}</td></tr>\n<tr><td style="padding: 12px;"><strong>Fecha concesión:</strong></td><td style="padding: 12px;">{{matter.grant_date}}</td></tr>\n<tr><td style="padding: 12px;"><strong>Válida hasta:</strong></td><td style="padding: 12px;">{{matter.expiry_date}}</td></tr>\n</table>\n<p>Te enviaremos el certificado oficial en cuanto lo recibamos de la oficina.</p>\n<p><strong>¿Quieres ampliar la protección?</strong> Podemos ayudarte a registrar tu marca en otros países o para otras clases de productos/servicios.</p>\n<br>\n<p>¡Enhorabuena!</p>\n<p><strong>{{owner.name}}</strong><br>{{organization.name}}</p>\n</div>',
     NULL,
     '[{"key":"contact.first_name","label":"Nombre"},{"key":"deal.trademark_name","label":"Marca"},{"key":"matter.registration_number","label":"Nº Registro"},{"key":"matter.grant_date","label":"Fecha concesión"},{"key":"matter.expiry_date","label":"Válida hasta"},{"key":"owner.name","label":"Responsable"},{"key":"organization.name","label":"Despacho"}]'::jsonb,
     TRUE, TRUE
    );
  v_count := v_count + 4;

  -- RENOVACIONES
  INSERT INTO public.crm_email_templates
    (organization_id, code, name, category, subject, body_html, body_text, variables, is_system, is_active)
  VALUES
    (p_organization_id, 'renewal_notice_6m', 'Aviso Renovación 6 meses', 'renewal',
     '📅 Tu marca {{matter.title}} vence en 6 meses',
     '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">\n<p>Estimado/a {{contact.first_name}},</p>\n<p>Te informamos que tu marca <strong>{{matter.title}}</strong> vencerá en aproximadamente <strong>6 meses</strong>.</p>\n<table style="width: 100%; border-collapse: collapse; margin: 20px 0;">\n<tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Marca:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">{{matter.title}}</td></tr>\n<tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Nº Registro:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">{{matter.registration_number}}</td></tr>\n<tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Fecha vencimiento:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">{{matter.expiry_date}}</td></tr>\n</table>\n<p>Para mantener tu marca protegida, es necesario renovarla antes de la fecha de vencimiento.</p>\n<p><strong>¿Quieres que procedamos con la renovación?</strong> Responde a este email o llámanos y te enviaremos el presupuesto.</p>\n<br>\n<p>Un saludo,</p>\n<p><strong>{{organization.name}}</strong></p>\n</div>',
     NULL,
     '[{"key":"contact.first_name","label":"Nombre"},{"key":"matter.title","label":"Marca"},{"key":"matter.registration_number","label":"Nº Registro"},{"key":"matter.expiry_date","label":"Vencimiento"},{"key":"organization.name","label":"Despacho"}]'::jsonb,
     TRUE, TRUE
    ),
    (p_organization_id, 'renewal_urgent_2m', 'Renovación URGENTE 2 meses', 'renewal',
     '🚨 URGENTE: Tu marca {{matter.title}} vence en 2 meses',
     '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">\n<p>Estimado/a {{contact.first_name}},</p>\n<div style="background: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">\n<strong>⚠️ AVISO URGENTE</strong><br>\nTu marca <strong>{{matter.title}}</strong> vence el <strong>{{matter.expiry_date}}</strong>.\n</div>\n<p>Si no se renueva antes de esa fecha, <strong>perderás los derechos</strong> sobre la marca y tendrías que volver a solicitarla desde cero (con el riesgo de que un tercero la registre antes).</p>\n<p><strong>Actúa ahora:</strong> Responde a este email o llámanos al {{organization.phone}} para confirmar la renovación.</p>\n<br>\n<p>Quedamos a la espera de tu confirmación.</p>\n<p><strong>{{owner.name}}</strong><br>{{organization.name}}</p>\n</div>',
     NULL,
     '[{"key":"contact.first_name","label":"Nombre"},{"key":"matter.title","label":"Marca"},{"key":"matter.expiry_date","label":"Vencimiento"},{"key":"organization.phone","label":"Teléfono"},{"key":"owner.name","label":"Responsable"},{"key":"organization.name","label":"Despacho"}]'::jsonb,
     TRUE, TRUE
    );
  v_count := v_count + 2;

  -- FACTURACIÓN
  INSERT INTO public.crm_email_templates
    (organization_id, code, name, category, subject, body_html, body_text, variables, is_system, is_active)
  VALUES
    (p_organization_id, 'invoice_reminder', 'Recordatorio de Factura', 'billing',
     'Recordatorio: Factura {{invoice.number}} pendiente de pago',
     '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">\n<p>Estimado/a {{contact.first_name}},</p>\n<p>Te recordamos que tienes pendiente de pago la siguiente factura:</p>\n<table style="width: 100%; border-collapse: collapse; margin: 20px 0; background: #f8f9fa; border-radius: 8px;">\n<tr><td style="padding: 12px;"><strong>Factura:</strong></td><td style="padding: 12px;">{{invoice.number}}</td></tr>\n<tr><td style="padding: 12px;"><strong>Importe:</strong></td><td style="padding: 12px;"><strong>{{invoice.amount}} €</strong></td></tr>\n<tr><td style="padding: 12px;"><strong>Vencimiento:</strong></td><td style="padding: 12px;">{{invoice.due_date}}</td></tr>\n</table>\n<p>Si ya has realizado el pago, por favor ignora este mensaje.</p>\n<p>Para cualquier consulta sobre esta factura, no dudes en contactarnos.</p>\n<br>\n<p>Un saludo,</p>\n<p><strong>{{organization.name}}</strong></p>\n</div>',
     NULL,
     '[{"key":"contact.first_name","label":"Nombre"},{"key":"invoice.number","label":"Nº Factura"},{"key":"invoice.amount","label":"Importe"},{"key":"invoice.due_date","label":"Vencimiento"},{"key":"organization.name","label":"Despacho"}]'::jsonb,
     TRUE, TRUE
    );
  v_count := v_count + 1;

  -- CLIENTE / RETENCIÓN
  INSERT INTO public.crm_email_templates
    (organization_id, code, name, category, subject, body_html, body_text, variables, is_system, is_active)
  VALUES
    (p_organization_id, 'client_inactive_60days', 'Cliente Inactivo 60 días', 'retention',
     'Te echamos de menos, {{contact.first_name}}',
     '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">\n<p>Hola {{contact.first_name}},</p>\n<p>Hace tiempo que no sabemos de ti y queríamos preguntarte: <strong>¿cómo va todo?</strong></p>\n<p>Recordamos que trabajamos juntos en {{last_service}} y fue un placer colaborar contigo.</p>\n<p>Si tienes alguna consulta sobre Propiedad Intelectual, o necesitas:</p>\n<ul>\n<li>Registrar una nueva marca o patente</li>\n<li>Revisar el estado de tus registros actuales</li>\n<li>Asesoramiento sobre vigilancia de marca</li>\n</ul>\n<p>Estamos aquí para ayudarte. Solo tienes que responder a este email.</p>\n<br>\n<p>Un cordial saludo,</p>\n<p><strong>{{owner.name}}</strong><br>{{organization.name}}</p>\n</div>',
     NULL,
     '[{"key":"contact.first_name","label":"Nombre"},{"key":"last_service","label":"Último servicio"},{"key":"owner.name","label":"Responsable"},{"key":"organization.name","label":"Despacho"}]'::jsonb,
     TRUE, TRUE
    ),
    (p_organization_id, 'nps_survey', 'Encuesta NPS Post-Servicio', 'retention',
     '¿Cómo fue tu experiencia con {{organization.name}}?',
     '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">\n<p>Hola {{contact.first_name}},</p>\n<p>Recientemente completamos el servicio de <strong>{{service.name}}</strong> y nos encantaría conocer tu opinión.</p>\n<p style="font-size: 16px; margin: 20px 0;"><strong>¿Recomendarías {{organization.name}} a un colega o amigo?</strong></p>\n<div style="text-align: center; margin: 20px 0;">\n<p>Haz clic en un número del 0 (nada probable) al 10 (muy probable):</p>\n<div style="display: inline-block;">\n{{nps_buttons}}\n</div>\n</div>\n<p>Tu feedback nos ayuda a mejorar. ¡Gracias!</p>\n<br>\n<p><strong>{{organization.name}}</strong></p>\n</div>',
     NULL,
     '[{"key":"contact.first_name","label":"Nombre"},{"key":"service.name","label":"Servicio"},{"key":"organization.name","label":"Despacho"},{"key":"nps_buttons","label":"Botones NPS"}]'::jsonb,
     TRUE, TRUE
    );
  v_count := v_count + 2;

  RETURN v_count;
END;
$$;

-- 3) INTERNAL: WhatsApp seed (no auth required; intended for admin/migrations)
CREATE OR REPLACE FUNCTION public._crm_seed_default_whatsapp_templates(p_organization_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer := 0;
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.crm_whatsapp_templates
    WHERE organization_id = p_organization_id
  ) THEN
    RETURN 0;
  END IF;

  INSERT INTO public.crm_whatsapp_templates (
    organization_id, name, code, wa_template_name, language, category,
    header_type, body_text, variables, status
  ) VALUES
    (p_organization_id,
     'Respuesta Inmediata Lead',
     'lead_instant_response',
     'lead_instant_response',
     'es',
     'UTILITY',
     'NONE',
     'Hola {{1}}, gracias por contactar con {{2}}. Hemos recibido tu consulta y uno de nuestros especialistas te contactará en las próximas 24 horas. Si tienes urgencia, llámanos al {{3}}.',
     '[{"key":"1","label":"Nombre contacto","example":"María"},{"key":"2","label":"Nombre despacho","example":"IP Legal"},{"key":"3","label":"Teléfono","example":"+34 91 123 4567"}]'::jsonb,
     'pending'
    ),
    (p_organization_id,
     'Recordatorio Documentos',
     'docs_pending_reminder',
     'docs_pending_reminder',
     'es',
     'UTILITY',
     'NONE',
     'Hola {{1}}, te recordamos que para avanzar con el registro de tu marca {{2}}, necesitamos que nos envíes la documentación pendiente. ¿Puedes enviárnosla hoy?',
     '[{"key":"1","label":"Nombre","example":"Juan"},{"key":"2","label":"Marca","example":"ACME"}]'::jsonb,
     'pending'
    ),
    (p_organization_id,
     'Marca Presentada',
     'trademark_filed',
     'trademark_filed',
     'es',
     'UTILITY',
     'NONE',
     '✅ {{1}}, tu marca {{2}} ha sido presentada con número {{3}}. Te mantendremos informado del proceso. Puedes ver el estado en tu portal de cliente.',
     '[{"key":"1","label":"Nombre","example":"Ana"},{"key":"2","label":"Marca","example":"NOVA"},{"key":"3","label":"Nº Solicitud","example":"M-123456"}]'::jsonb,
     'pending'
    ),
    (p_organization_id,
     'Marca Concedida',
     'trademark_granted',
     'trademark_granted',
     'es',
     'UTILITY',
     'NONE',
     '🎉 ¡Enhorabuena {{1}}! Tu marca {{2}} ha sido CONCEDIDA con nº de registro {{3}}. Te enviaremos el certificado por email.',
     '[{"key":"1","label":"Nombre","example":"Pedro"},{"key":"2","label":"Marca","example":"SOLAR"},{"key":"3","label":"Nº Registro","example":"R-789012"}]'::jsonb,
     'pending'
    ),
    (p_organization_id,
     'Aviso Renovación',
     'renewal_notice',
     'renewal_notice',
     'es',
     'UTILITY',
     'NONE',
     '📅 Hola {{1}}, tu marca {{2}} vence el {{3}}. ¿Quieres que procedamos con la renovación? Responde SÍ para confirmar o llámanos si tienes dudas.',
     '[{"key":"1","label":"Nombre","example":"Laura"},{"key":"2","label":"Marca","example":"TECH"},{"key":"3","label":"Fecha vencimiento","example":"15/03/2025"}]'::jsonb,
     'pending'
    ),
    (p_organization_id,
     'Renovación Urgente',
     'renewal_urgent',
     'renewal_urgent',
     'es',
     'UTILITY',
     'NONE',
     '🚨 URGENTE {{1}}: Tu marca {{2}} vence en menos de 2 meses ({{3}}). Si no la renuevas, perderás los derechos. Llámanos YA al {{4}}.',
     '[{"key":"1","label":"Nombre","example":"Carlos"},{"key":"2","label":"Marca","example":"BRAND"},{"key":"3","label":"Fecha","example":"01/02/2025"},{"key":"4","label":"Teléfono","example":"+34 91 123 4567"}]'::jsonb,
     'pending'
    ),
    (p_organization_id,
     'Encuesta Satisfacción',
     'nps_survey',
     'nps_survey',
     'es',
     'MARKETING',
     'NONE',
     'Hola {{1}}, acabamos de completar el servicio de {{2}}. ¿Del 1 al 10, cómo valorarías tu experiencia? Tu opinión nos ayuda a mejorar.',
     '[{"key":"1","label":"Nombre","example":"Marta"},{"key":"2","label":"Servicio","example":"registro de marca"}]'::jsonb,
     'pending'
    ),
    (p_organization_id,
     'Felicitación Cumpleaños',
     'birthday_greeting',
     'birthday_greeting',
     'es',
     'MARKETING',
     'NONE',
     '🎂 ¡Feliz cumpleaños {{1}}! Todo el equipo de {{2}} te desea un día muy especial. ¡Que cumplas muchos más!',
     '[{"key":"1","label":"Nombre","example":"Elena"},{"key":"2","label":"Despacho","example":"IP Legal"}]'::jsonb,
     'pending'
    );

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- 4) RPC wrappers (safe to call from app): enforce membership first
CREATE OR REPLACE FUNCTION public.crm_seed_default_email_templates(p_organization_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.crm_assert_org_member(p_organization_id);
  RETURN public._crm_seed_default_email_templates(p_organization_id);
END;
$$;

CREATE OR REPLACE FUNCTION public.crm_seed_default_whatsapp_templates(p_organization_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.crm_assert_org_member(p_organization_id);
  RETURN public._crm_seed_default_whatsapp_templates(p_organization_id);
END;
$$;

CREATE OR REPLACE FUNCTION public.crm_initialize_communication_templates(p_organization_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email_count integer;
  v_whatsapp_count integer;
BEGIN
  PERFORM public.crm_assert_org_member(p_organization_id);

  SELECT public._crm_seed_default_email_templates(p_organization_id) INTO v_email_count;
  SELECT public._crm_seed_default_whatsapp_templates(p_organization_id) INTO v_whatsapp_count;

  RETURN jsonb_build_object(
    'email_templates_created', v_email_count,
    'whatsapp_templates_created', v_whatsapp_count,
    'organization_id', p_organization_id,
    'initialized_at', now()
  );
END;
$$;

-- 5) Execute seed for existing organizations (idempotent)
DO $$
DECLARE
  org record;
  v_email integer;
  v_wa integer;
BEGIN
  FOR org IN SELECT id, name FROM public.organizations LOOP
    v_email := public._crm_seed_default_email_templates(org.id);
    v_wa := public._crm_seed_default_whatsapp_templates(org.id);
    RAISE NOTICE 'Org: % (%): email=% whatsapp=%', org.name, org.id, v_email, v_wa;
  END LOOP;
END $$;
