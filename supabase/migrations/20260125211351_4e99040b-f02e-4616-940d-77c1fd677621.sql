-- ============================================
-- SEED: OPERATIONS & BILLING WORKFLOW TEMPLATES
-- ============================================

-- Workflow: Registration Success
INSERT INTO workflow_templates (
  code, name, description, category, trigger_type, trigger_config, steps, icon, color, tags, is_active, is_system
) VALUES (
  'WF_REGISTRATION_SUCCESS',
  'Marca/Patente Registrada',
  'Comunicación cuando un expediente se registra exitosamente.',
  'operations',
  'event',
  '{"event": "matter_status_changed", "new_status": "registered"}'::jsonb,
  '[
    {"id": "trigger", "type": "trigger", "name": "Expediente registrado"},
    {"id": "email_congrats", "type": "send_email", "name": "Felicitación", "config": {"email_template_code": "REGISTRATION_CONGRATULATIONS", "to": "{{matter.client_email}}"}},
    {"id": "task_cert", "type": "create_task", "name": "Enviar certificado", "config": {"title": "Enviar certificado: {{matter.reference}}", "due_days": 3}},
    {"id": "delay_1", "type": "delay", "config": {"value": 7, "unit": "days"}},
    {"id": "email_next", "type": "send_email", "name": "Próximos pasos", "config": {"email_template_code": "REGISTRATION_NEXT_STEPS", "to": "{{matter.client_email}}"}},
    {"id": "delay_2", "type": "delay", "config": {"value": 14, "unit": "days"}},
    {"id": "email_review", "type": "send_email", "name": "Solicitar reseña", "config": {"email_template_code": "REQUEST_REVIEW", "to": "{{matter.client_email}}"}}
  ]'::jsonb,
  'award',
  'green',
  ARRAY['registro', 'éxito'],
  true,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  steps = EXCLUDED.steps,
  trigger_config = EXCLUDED.trigger_config,
  updated_at = now();

-- Workflow: Opposition Received
INSERT INTO workflow_templates (
  code, name, description, category, trigger_type, trigger_config, steps, icon, color, tags, is_active, is_system
) VALUES (
  'WF_OPPOSITION_RECEIVED',
  'Oposición Recibida',
  'Gestión cuando se recibe una oposición contra nuestra solicitud.',
  'operations',
  'event',
  '{"event": "matter_status_changed", "new_status": "opposition"}'::jsonb,
  '[
    {"id": "trigger", "type": "trigger", "name": "Oposición detectada"},
    {"id": "notification", "type": "send_notification", "name": "Alerta urgente", "config": {"title": "⚠️ Oposición recibida", "body": "{{matter.reference}}", "to": ["matter_owner", "admin"], "priority": "urgent"}},
    {"id": "email_client", "type": "send_email", "name": "Informar cliente", "config": {"email_template_code": "OPPOSITION_RECEIVED", "to": "{{matter.client_email}}"}},
    {"id": "task_analyze", "type": "create_task", "name": "Analizar oposición", "config": {"title": "URGENTE - Analizar: {{matter.reference}}", "due_days": 3, "priority": "urgent"}},
    {"id": "delay_1", "type": "delay", "config": {"value": 5, "unit": "days"}},
    {"id": "task_meeting", "type": "create_task", "name": "Reunión cliente", "config": {"title": "Estrategia oposición: {{matter.reference}}", "due_days": 2, "priority": "high"}}
  ]'::jsonb,
  'alert-triangle',
  'red',
  ARRAY['oposición', 'urgente'],
  true,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  steps = EXCLUDED.steps,
  trigger_config = EXCLUDED.trigger_config,
  updated_at = now();

-- Workflow: Invoice Overdue
INSERT INTO workflow_templates (
  code, name, description, category, trigger_type, trigger_config, steps, icon, color, tags, is_active, is_system
) VALUES (
  'WF_INVOICE_OVERDUE',
  'Seguimiento Factura Impagada',
  'Recordatorios para facturas vencidas no pagadas.',
  'billing',
  'event',
  '{"event": "invoice_overdue"}'::jsonb,
  '[
    {"id": "trigger", "type": "trigger", "name": "Factura vencida"},
    {"id": "email_1", "type": "send_email", "name": "Primer recordatorio", "config": {"email_template_code": "INVOICE_OVERDUE_1", "to": "{{invoice.client_email}}"}},
    {"id": "delay_1", "type": "delay", "config": {"value": 7, "unit": "days"}},
    {"id": "check_1", "type": "condition", "name": "¿Pagada?", "config": {"field": "invoice.status", "operator": "equals", "value": "paid"}, "branches": {"yes": "end", "no": "email_2"}},
    {"id": "email_2", "type": "send_email", "name": "Segundo recordatorio", "config": {"email_template_code": "INVOICE_OVERDUE_2", "to": "{{invoice.client_email}}"}},
    {"id": "task_call", "type": "create_task", "name": "Llamar cliente", "config": {"title": "Cobro: {{invoice.number}}", "due_days": 1, "priority": "high"}},
    {"id": "delay_2", "type": "delay", "config": {"value": 14, "unit": "days"}},
    {"id": "check_2", "type": "condition", "name": "¿Pagada?", "config": {"field": "invoice.status", "operator": "equals", "value": "paid"}, "branches": {"yes": "end", "no": "email_final"}},
    {"id": "email_final", "type": "send_email", "name": "Aviso suspensión", "config": {"email_template_code": "INVOICE_OVERDUE_FINAL", "to": "{{invoice.client_email}}"}},
    {"id": "notification", "type": "send_notification", "name": "Escalar", "config": {"title": "Factura impagada 21+ días", "to": ["admin", "finance"]}},
    {"id": "end", "type": "end", "name": "Fin"}
  ]'::jsonb,
  'alert-circle',
  'red',
  ARRAY['factura', 'impagada', 'cobro'],
  true,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  steps = EXCLUDED.steps,
  trigger_config = EXCLUDED.trigger_config,
  updated_at = now();

-- ============================================
-- SEED: OPERATIONS EMAIL TEMPLATES
-- ============================================

-- Email: Registration Congratulations
INSERT INTO email_templates (
  code, name, category, subject, html_content, body_html, variables, language, is_active
) VALUES (
  'REGISTRATION_CONGRATULATIONS',
  'Felicitación Registro',
  'notification',
  '🎉 ¡Enhorabuena! Tu marca {{matter.mark_name}} ha sido registrada',
  '<div style="font-family: Arial, sans-serif; max-width: 600px;">
    <div style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
      <h1 style="margin: 0;">🎉 ¡ENHORABUENA!</h1>
    </div>
    <div style="padding: 30px; background: #f0fdf4; border-radius: 0 0 8px 8px;">
      <p>Estimado/a {{client.name}},</p>
      <p style="font-size: 18px;">Tu marca <strong>{{matter.mark_name}}</strong> ha sido <strong style="color: #10b981;">registrada oficialmente</strong>.</p>
      <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
        <p><strong>📋 Expediente:</strong> {{matter.reference}}</p>
        <p><strong>🏛️ Oficina:</strong> {{matter.office_name}}</p>
        <p><strong>📅 Fecha registro:</strong> {{matter.registration_date}}</p>
        <p><strong>📅 Válida hasta:</strong> {{matter.expiry_date}}</p>
      </div>
      <p>En breve recibirás el certificado oficial de registro.</p>
      <p style="margin-top: 30px;">¡Gracias por confiar en nosotros!</p>
    </div>
  </div>',
  '<div style="font-family: Arial, sans-serif; max-width: 600px;">
    <div style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
      <h1 style="margin: 0;">🎉 ¡ENHORABUENA!</h1>
    </div>
    <div style="padding: 30px; background: #f0fdf4; border-radius: 0 0 8px 8px;">
      <p>Estimado/a {{client.name}},</p>
      <p style="font-size: 18px;">Tu marca <strong>{{matter.mark_name}}</strong> ha sido <strong style="color: #10b981;">registrada oficialmente</strong>.</p>
      <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
        <p><strong>📋 Expediente:</strong> {{matter.reference}}</p>
        <p><strong>🏛️ Oficina:</strong> {{matter.office_name}}</p>
        <p><strong>📅 Fecha registro:</strong> {{matter.registration_date}}</p>
        <p><strong>📅 Válida hasta:</strong> {{matter.expiry_date}}</p>
      </div>
      <p>En breve recibirás el certificado oficial de registro.</p>
    </div>
  </div>',
  '[{"name": "client.name"}, {"name": "matter.mark_name"}, {"name": "matter.reference"}, {"name": "matter.office_name"}, {"name": "matter.registration_date"}, {"name": "matter.expiry_date"}]'::jsonb,
  'es',
  true
)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  subject = EXCLUDED.subject,
  html_content = EXCLUDED.html_content,
  body_html = EXCLUDED.body_html,
  variables = EXCLUDED.variables,
  updated_at = now();

-- Email: Registration Next Steps
INSERT INTO email_templates (
  code, name, category, subject, html_content, body_html, variables, language, is_active
) VALUES (
  'REGISTRATION_NEXT_STEPS',
  'Próximos Pasos Post-Registro',
  'notification',
  '📋 Próximos pasos para tu marca {{matter.mark_name}}',
  '<div style="font-family: Arial, sans-serif; max-width: 600px;">
    <h1 style="color: #2563eb;">Próximos pasos importantes</h1>
    <p>Estimado/a {{client.name}},</p>
    <p>Ahora que tu marca <strong>{{matter.mark_name}}</strong> está registrada, te recomendamos:</p>
    <div style="margin: 20px 0;">
      <div style="margin: 15px 0; padding: 15px; background: #f0f9ff; border-radius: 8px;">
        <strong>1️⃣ Usa tu marca</strong><br/>El uso continuado fortalece tus derechos.
      </div>
      <div style="margin: 15px 0; padding: 15px; background: #f0f9ff; border-radius: 8px;">
        <strong>2️⃣ Vigilancia</strong><br/>Monitoriza posibles infracciones de terceros.
      </div>
      <div style="margin: 15px 0; padding: 15px; background: #f0f9ff; border-radius: 8px;">
        <strong>3️⃣ Renovación</strong><br/>Recuerda renovar antes de {{matter.expiry_date}}.
      </div>
    </div>
    <a href="{{portal_url}}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Ver mi expediente</a>
  </div>',
  '<div style="font-family: Arial, sans-serif; max-width: 600px;">
    <h1 style="color: #2563eb;">Próximos pasos importantes</h1>
    <p>Estimado/a {{client.name}},</p>
    <p>Ahora que tu marca <strong>{{matter.mark_name}}</strong> está registrada, te recomendamos:</p>
    <ul>
      <li><strong>Usa tu marca</strong> - El uso continuado fortalece tus derechos.</li>
      <li><strong>Vigilancia</strong> - Monitoriza posibles infracciones de terceros.</li>
      <li><strong>Renovación</strong> - Recuerda renovar antes de {{matter.expiry_date}}.</li>
    </ul>
    <a href="{{portal_url}}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Ver mi expediente</a>
  </div>',
  '[{"name": "client.name"}, {"name": "matter.mark_name"}, {"name": "matter.expiry_date"}, {"name": "portal_url"}]'::jsonb,
  'es',
  true
)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  subject = EXCLUDED.subject,
  html_content = EXCLUDED.html_content,
  body_html = EXCLUDED.body_html,
  variables = EXCLUDED.variables,
  updated_at = now();

-- Email: Opposition Received
INSERT INTO email_templates (
  code, name, category, subject, html_content, body_html, variables, language, is_active
) VALUES (
  'OPPOSITION_RECEIVED',
  'Oposición Recibida',
  'notification',
  '⚠️ Importante: Oposición contra tu solicitud {{matter.reference}}',
  '<div style="font-family: Arial, sans-serif; max-width: 600px;">
    <div style="background: #fef3c7; padding: 20px; border-left: 4px solid #f59e0b; margin-bottom: 20px;">
      <h1 style="color: #92400e; margin: 0;">⚠️ Oposición Recibida</h1>
    </div>
    <p>Estimado/a {{client.name}},</p>
    <p>Te informamos que hemos recibido una <strong>oposición</strong> contra tu solicitud:</p>
    <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p><strong>📋 Expediente:</strong> {{matter.reference}}</p>
      <p><strong>🏷️ Marca:</strong> {{matter.mark_name}}</p>
      <p><strong>📅 Fecha oposición:</strong> {{opposition.date}}</p>
      <p><strong>👤 Oponente:</strong> {{opposition.opponent_name}}</p>
    </div>
    <h2 style="color: #1e40af;">¿Qué significa esto?</h2>
    <p>Un tercero ha presentado objeciones formales. <strong>No te preocupes</strong>, analizaremos la situación y te contactaremos para definir la mejor estrategia.</p>
    <h2 style="color: #1e40af;">Próximos pasos</h2>
    <ol>
      <li>Analizaremos los fundamentos de la oposición</li>
      <li>Te contactaremos en los próximos días</li>
      <li>Definiremos juntos la estrategia de respuesta</li>
    </ol>
    <p style="margin-top: 30px; padding: 15px; background: #dbeafe; border-radius: 8px;">Tu gestor se pondrá en contacto contigo pronto.</p>
  </div>',
  '<div style="font-family: Arial, sans-serif; max-width: 600px;">
    <h1 style="color: #92400e;">⚠️ Oposición Recibida</h1>
    <p>Estimado/a {{client.name}},</p>
    <p>Te informamos que hemos recibido una <strong>oposición</strong> contra tu solicitud:</p>
    <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p><strong>📋 Expediente:</strong> {{matter.reference}}</p>
      <p><strong>🏷️ Marca:</strong> {{matter.mark_name}}</p>
    </div>
    <p>Analizaremos la situación y te contactaremos para definir la mejor estrategia.</p>
  </div>',
  '[{"name": "client.name"}, {"name": "matter.reference"}, {"name": "matter.mark_name"}, {"name": "opposition.date"}, {"name": "opposition.opponent_name"}]'::jsonb,
  'es',
  true
)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  subject = EXCLUDED.subject,
  html_content = EXCLUDED.html_content,
  body_html = EXCLUDED.body_html,
  variables = EXCLUDED.variables,
  updated_at = now();

-- ============================================
-- SEED: BILLING EMAIL TEMPLATES
-- ============================================

-- Email: Invoice Overdue 1
INSERT INTO email_templates (
  code, name, category, subject, html_content, body_html, variables, language, is_active
) VALUES (
  'INVOICE_OVERDUE_1',
  'Factura Recordatorio 1',
  'reminder',
  'Recordatorio: Factura {{invoice.number}} pendiente',
  '<div style="font-family: Arial, sans-serif; max-width: 600px;">
    <h1 style="color: #2563eb;">Recordatorio de pago</h1>
    <p>Estimado/a {{client.name}},</p>
    <p>La factura <strong>{{invoice.number}}</strong> venció el {{invoice.due_date}} y permanece pendiente de pago.</p>
    <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p><strong>📄 Factura:</strong> {{invoice.number}}</p>
      <p><strong>💶 Importe:</strong> {{invoice.total}}€</p>
      <p><strong>📅 Vencimiento:</strong> {{invoice.due_date}}</p>
    </div>
    <p>Te agradeceríamos que procedieras al pago a la mayor brevedad.</p>
    <a href="{{invoice.payment_url}}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px;">Pagar ahora</a>
    <p style="margin-top: 30px; color: #64748b; font-size: 14px;">Si ya has realizado el pago, ignora este mensaje.</p>
  </div>',
  '<div style="font-family: Arial, sans-serif; max-width: 600px;">
    <h1 style="color: #2563eb;">Recordatorio de pago</h1>
    <p>Estimado/a {{client.name}},</p>
    <p>La factura <strong>{{invoice.number}}</strong> venció el {{invoice.due_date}}.</p>
    <div style="background: #f3f4f6; padding: 20px; border-radius: 8px;">
      <p><strong>Importe:</strong> {{invoice.total}}€</p>
      <p><strong>Vencimiento:</strong> {{invoice.due_date}}</p>
    </div>
    <a href="{{invoice.payment_url}}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; display: inline-block;">Pagar ahora</a>
  </div>',
  '[{"name": "client.name"}, {"name": "invoice.number"}, {"name": "invoice.total"}, {"name": "invoice.due_date"}, {"name": "invoice.payment_url"}]'::jsonb,
  'es',
  true
)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  subject = EXCLUDED.subject,
  html_content = EXCLUDED.html_content,
  body_html = EXCLUDED.body_html,
  variables = EXCLUDED.variables,
  updated_at = now();

-- Email: Invoice Overdue 2
INSERT INTO email_templates (
  code, name, category, subject, html_content, body_html, variables, language, is_active
) VALUES (
  'INVOICE_OVERDUE_2',
  'Factura Recordatorio 2',
  'reminder',
  '⚠️ Segundo recordatorio: Factura {{invoice.number}} pendiente',
  '<div style="font-family: Arial, sans-serif; max-width: 600px;">
    <h1 style="color: #f59e0b;">Segundo recordatorio de pago</h1>
    <p>Estimado/a {{client.name}},</p>
    <p>Te recordamos nuevamente que la factura <strong>{{invoice.number}}</strong> permanece impagada.</p>
    <div style="background: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0;">
      <p><strong>📄 Factura:</strong> {{invoice.number}}</p>
      <p><strong>💶 Importe:</strong> {{invoice.total}}€</p>
      <p><strong>📅 Vencimiento:</strong> {{invoice.due_date}}</p>
      <p><strong>⏰ Días de retraso:</strong> {{invoice.days_overdue}}</p>
    </div>
    <p><strong>Es importante regularizar esta situación</strong> para evitar interrupciones en el servicio.</p>
    <a href="{{invoice.payment_url}}" style="display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px;">Pagar ahora</a>
  </div>',
  '<div style="font-family: Arial, sans-serif; max-width: 600px;">
    <h1 style="color: #f59e0b;">Segundo recordatorio de pago</h1>
    <p>Estimado/a {{client.name}},</p>
    <p>La factura <strong>{{invoice.number}}</strong> permanece impagada.</p>
    <div style="background: #fef3c7; padding: 20px; border-radius: 8px;">
      <p><strong>Importe:</strong> {{invoice.total}}€</p>
      <p><strong>Días de retraso:</strong> {{invoice.days_overdue}}</p>
    </div>
    <a href="{{invoice.payment_url}}" style="background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Pagar ahora</a>
  </div>',
  '[{"name": "client.name"}, {"name": "invoice.number"}, {"name": "invoice.total"}, {"name": "invoice.due_date"}, {"name": "invoice.days_overdue"}, {"name": "invoice.payment_url"}]'::jsonb,
  'es',
  true
)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  subject = EXCLUDED.subject,
  html_content = EXCLUDED.html_content,
  body_html = EXCLUDED.body_html,
  variables = EXCLUDED.variables,
  updated_at = now();

-- Email: Invoice Overdue Final
INSERT INTO email_templates (
  code, name, category, subject, html_content, body_html, variables, language, is_active
) VALUES (
  'INVOICE_OVERDUE_FINAL',
  'Factura Aviso Final',
  'reminder',
  '🔴 AVISO FINAL: Suspensión de servicios - {{invoice.number}}',
  '<div style="font-family: Arial, sans-serif; max-width: 600px;">
    <div style="background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
      <h1 style="margin: 0;">🔴 AVISO FINAL</h1>
    </div>
    <div style="padding: 20px; border: 2px solid #dc2626; border-top: none; border-radius: 0 0 8px 8px;">
      <p>Estimado/a {{client.name}},</p>
      <p>Debido al impago continuado de la factura <strong>{{invoice.number}}</strong>, nos vemos obligados a considerar la <strong>suspensión de servicios</strong>.</p>
      <div style="background: #fee2e2; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>📄 Factura:</strong> {{invoice.number}}</p>
        <p><strong>💶 Importe:</strong> {{invoice.total}}€</p>
        <p><strong>⏰ Días de retraso:</strong> {{invoice.days_overdue}}</p>
      </div>
      <h2 style="color: #dc2626;">Si no recibimos el pago en 7 días:</h2>
      <ul style="color: #991b1b;">
        <li>❌ Suspensión de todos los servicios</li>
        <li>❌ Pausa de gestiones en curso</li>
        <li>❌ Inicio de acciones de recobro</li>
      </ul>
      <a href="{{invoice.payment_url}}" style="display: inline-block; background: #dc2626; color: white; padding: 16px 32px; text-decoration: none; border-radius: 6px; margin-top: 20px; font-size: 18px;">PAGAR AHORA</a>
      <p style="margin-top: 30px; color: #64748b; font-size: 14px;">Para cualquier consulta sobre esta factura, contacta con nuestro departamento de administración.</p>
    </div>
  </div>',
  '<div style="font-family: Arial, sans-serif; max-width: 600px;">
    <div style="background: #dc2626; color: white; padding: 20px; text-align: center;"><h1>AVISO FINAL</h1></div>
    <div style="padding: 20px; border: 1px solid #dc2626;">
      <p>Estimado/a {{client.name}},</p>
      <p>Debido al impago de <strong>{{invoice.number}}</strong>, consideramos <strong>suspensión de servicios</strong>.</p>
      <div style="background: #fee2e2; padding: 20px; border-radius: 8px;">
        <p><strong>Importe:</strong> {{invoice.total}}€</p>
        <p><strong>Días retraso:</strong> {{invoice.days_overdue}}</p>
      </div>
      <a href="{{invoice.payment_url}}" style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Pagar ahora</a>
    </div>
  </div>',
  '[{"name": "client.name"}, {"name": "invoice.number"}, {"name": "invoice.total"}, {"name": "invoice.days_overdue"}, {"name": "invoice.payment_url"}]'::jsonb,
  'es',
  true
)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  subject = EXCLUDED.subject,
  html_content = EXCLUDED.html_content,
  body_html = EXCLUDED.body_html,
  variables = EXCLUDED.variables,
  updated_at = now();

-- Email: Request Review (changed category to 'notification' as valid)
INSERT INTO email_templates (
  code, name, category, subject, html_content, body_html, variables, language, is_active
) VALUES (
  'REQUEST_REVIEW',
  'Solicitar Reseña',
  'notification',
  '⭐ ¿Cómo fue tu experiencia con nosotros?',
  '<div style="font-family: Arial, sans-serif; max-width: 600px;">
    <h1 style="color: #2563eb;">¡Tu opinión nos importa! ⭐</h1>
    <p>Estimado/a {{client.name}},</p>
    <p>Recientemente completamos el registro de tu marca <strong>{{matter.mark_name}}</strong> y nos encantaría saber tu opinión.</p>
    <div style="text-align: center; margin: 30px 0;">
      <p style="font-size: 18px;">¿Cómo valorarías tu experiencia?</p>
      <div style="font-size: 36px;">⭐⭐⭐⭐⭐</div>
    </div>
    <p>Tu feedback nos ayuda a mejorar y también ayuda a otros clientes a conocernos.</p>
    <div style="text-align: center;">
      <a href="{{review_url}}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px;">Dejar reseña en Google</a>
    </div>
    <p style="margin-top: 30px; color: #64748b; font-size: 14px;">Solo te llevará 2 minutos. ¡Gracias!</p>
  </div>',
  '<div style="font-family: Arial, sans-serif; max-width: 600px;">
    <h1 style="color: #2563eb;">¡Tu opinión nos importa! ⭐</h1>
    <p>Estimado/a {{client.name}},</p>
    <p>Recientemente completamos el registro de tu marca <strong>{{matter.mark_name}}</strong> y nos encantaría saber tu opinión.</p>
    <a href="{{review_url}}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Dejar reseña</a>
  </div>',
  '[{"name": "client.name"}, {"name": "matter.mark_name"}, {"name": "review_url"}]'::jsonb,
  'es',
  true
)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  subject = EXCLUDED.subject,
  html_content = EXCLUDED.html_content,
  body_html = EXCLUDED.body_html,
  variables = EXCLUDED.variables,
  updated_at = now();