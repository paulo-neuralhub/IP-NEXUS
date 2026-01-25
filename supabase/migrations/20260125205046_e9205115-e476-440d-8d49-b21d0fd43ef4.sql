
-- =============================================
-- SEED: WORKFLOWS Y EMAILS DE GESTIÓN DE CLIENTES
-- =============================================

-- 1. WORKFLOWS DE GESTIÓN DE CLIENTES (plantillas de sistema)
INSERT INTO workflow_templates (code, name, description, category, trigger_type, trigger_config, steps, icon, color, tags, is_system, is_active) VALUES
('WF_ONBOARDING_CLIENT', 
 'Onboarding Nuevo Cliente',
 'Secuencia de bienvenida para nuevos clientes con emails y seguimiento.',
 'client_management',
 'event',
 '{"event": "client_created"}',
 '[
   {"id": "trigger", "type": "trigger", "name": "Nuevo cliente creado", "config": {"event": "client_created"}},
   {"id": "email_welcome", "type": "send_email", "name": "Email de bienvenida", "config": {"email_template_code": "ONBOARDING_WELCOME", "to": "{{client.email}}"}},
   {"id": "delay_1", "type": "delay", "name": "Esperar 2 días", "config": {"value": 2, "unit": "days"}},
   {"id": "email_docs", "type": "send_email", "name": "Solicitud documentación", "config": {"email_template_code": "ONBOARDING_DOCUMENTS", "to": "{{client.email}}"}},
   {"id": "task_call", "type": "create_task", "name": "Llamada seguimiento", "config": {"title": "Llamada onboarding: {{client.name}}", "due_days": 3, "priority": "high"}},
   {"id": "delay_2", "type": "delay", "name": "Esperar 5 días", "config": {"value": 5, "unit": "days"}},
   {"id": "condition", "type": "condition", "name": "¿Tiene expedientes?", "config": {"field": "client.matters_count", "operator": "greater_than", "value": 0}, "branches": {"yes": "email_tips", "no": "email_reminder"}},
   {"id": "email_tips", "type": "send_email", "name": "Consejos plataforma", "config": {"email_template_code": "ONBOARDING_TIPS", "to": "{{client.email}}"}},
   {"id": "email_reminder", "type": "send_email", "name": "Recordatorio inicio", "config": {"email_template_code": "ONBOARDING_START_REMINDER", "to": "{{client.email}}"}}
 ]',
 'user-plus', 'blue', ARRAY['onboarding', 'nuevo cliente', 'bienvenida'], true, true
),
('WF_REACTIVATION',
 'Recuperación Cliente Inactivo',
 'Secuencia para reactivar clientes sin actividad en 90+ días.',
 'client_management',
 'schedule',
 '{"schedule": "daily", "condition": "client.last_activity_days > 90"}',
 '[
   {"id": "trigger", "type": "trigger", "name": "Cliente inactivo 90+ días"},
   {"id": "email_miss", "type": "send_email", "name": "Te echamos de menos", "config": {"email_template_code": "REACTIVATION_MISS_YOU", "to": "{{client.email}}"}},
   {"id": "delay_1", "type": "delay", "name": "Esperar 7 días", "config": {"value": 7, "unit": "days"}},
   {"id": "condition", "type": "condition", "name": "¿Abrió email?", "config": {"check": "email_opened"}, "branches": {"yes": "task_call", "no": "email_offer"}},
   {"id": "email_offer", "type": "send_email", "name": "Oferta especial", "config": {"email_template_code": "REACTIVATION_OFFER", "to": "{{client.email}}"}},
   {"id": "task_call", "type": "create_task", "name": "Llamar cliente", "config": {"title": "Reactivación: {{client.name}}", "due_days": 1, "priority": "high"}},
   {"id": "delay_2", "type": "delay", "name": "Esperar 14 días", "config": {"value": 14, "unit": "days"}},
   {"id": "email_last", "type": "send_email", "name": "Última oportunidad", "config": {"email_template_code": "REACTIVATION_LAST_CHANCE", "to": "{{client.email}}"}}
 ]',
 'user-check', 'orange', ARRAY['reactivación', 'inactivo'], true, true
)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  steps = EXCLUDED.steps,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color,
  tags = EXCLUDED.tags,
  is_system = EXCLUDED.is_system,
  updated_at = now();

-- 2. EMAILS DE ONBOARDING (categorías válidas: general, welcome, newsletter, promotion, reminder, notification, renewal, invoice, custom)
INSERT INTO email_templates (code, name, category, subject, html_content, body_html, variables, is_system, is_active) VALUES
('ONBOARDING_WELCOME', 'Bienvenida Cliente', 'welcome',
 '¡Bienvenido/a a {{company_name}}! 🎉',
 '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
   <h1 style="color: #2563eb;">¡Bienvenido/a, {{client.name}}!</h1>
   <p>Es un placer tenerte como cliente de <strong>{{company_name}}</strong>.</p>
   <h2 style="color: #1e40af;">¿Qué puedes esperar?</h2>
   <ul>
     <li>✅ Seguimiento constante de tus expedientes</li>
     <li>✅ Alertas automáticas de plazos</li>
     <li>✅ Acceso a tu portal 24/7</li>
   </ul>
   <p>Tu gestor es <strong>{{assigned_user.name}}</strong>.</p>
   <a href="{{portal_url}}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Acceder a mi portal</a>
   <p style="margin-top: 30px;">¡Gracias por confiar en nosotros!</p>
 </div>',
 '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
   <h1 style="color: #2563eb;">¡Bienvenido/a, {{client.name}}!</h1>
   <p>Es un placer tenerte como cliente de <strong>{{company_name}}</strong>.</p>
   <h2 style="color: #1e40af;">¿Qué puedes esperar?</h2>
   <ul>
     <li>✅ Seguimiento constante de tus expedientes</li>
     <li>✅ Alertas automáticas de plazos</li>
     <li>✅ Acceso a tu portal 24/7</li>
   </ul>
   <p>Tu gestor es <strong>{{assigned_user.name}}</strong>.</p>
   <a href="{{portal_url}}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Acceder a mi portal</a>
   <p style="margin-top: 30px;">¡Gracias por confiar en nosotros!</p>
 </div>',
 '[{"name": "client.name"}, {"name": "company_name"}, {"name": "assigned_user.name"}, {"name": "portal_url"}]',
 true, true
),
('ONBOARDING_DOCUMENTS', 'Solicitud Documentación', 'notification',
 'Documentación necesaria para tu expediente',
 '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
   <h1 style="color: #2563eb;">Documentación inicial</h1>
   <p>Hola {{client.name}},</p>
   <p>Para avanzar, necesitamos:</p>
   <div style="background: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b;">
     <ul>
       <li>Copia DNI/NIE o CIF</li>
       <li>Poder de representación (si aplica)</li>
       <li>Logo en alta calidad</li>
       <li>Listado productos/servicios</li>
     </ul>
   </div>
   <a href="{{portal_url}}/documentos" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px;">Subir documentos</a>
 </div>',
 '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
   <h1 style="color: #2563eb;">Documentación inicial</h1>
   <p>Hola {{client.name}},</p>
   <p>Para avanzar, necesitamos:</p>
   <div style="background: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b;">
     <ul>
       <li>Copia DNI/NIE o CIF</li>
       <li>Poder de representación (si aplica)</li>
       <li>Logo en alta calidad</li>
       <li>Listado productos/servicios</li>
     </ul>
   </div>
   <a href="{{portal_url}}/documentos" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px;">Subir documentos</a>
 </div>',
 '[{"name": "client.name"}, {"name": "portal_url"}]',
 true, true
)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  subject = EXCLUDED.subject,
  html_content = EXCLUDED.html_content,
  body_html = EXCLUDED.body_html,
  variables = EXCLUDED.variables,
  is_system = EXCLUDED.is_system,
  updated_at = now();
