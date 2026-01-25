
-- =============================================
-- SEED: WORKFLOWS Y EMAILS DE MARKETING Y VENTAS
-- =============================================

-- 1. WORKFLOW: SEGUIMIENTO PRESUPUESTO
INSERT INTO workflow_templates (code, name, description, category, trigger_type, trigger_config, steps, icon, color, tags, is_system, is_active) VALUES
('WF_QUOTE_FOLLOWUP',
 'Seguimiento Presupuesto',
 'Recordatorios automáticos hasta aceptación o rechazo del presupuesto.',
 'marketing',
 'event',
 '{"event": "quote_sent"}',
 '[
   {"id": "trigger", "type": "trigger", "name": "Presupuesto enviado"},
   {"id": "delay_1", "type": "delay", "name": "Esperar 3 días", "config": {"value": 3, "unit": "days"}},
   {"id": "check_1", "type": "condition", "name": "¿Pendiente?", "config": {"field": "quote.status", "operator": "equals", "value": "sent"}, "branches": {"yes": "email_1", "no": "end"}},
   {"id": "email_1", "type": "send_email", "name": "Primer recordatorio", "config": {"email_template_code": "QUOTE_FOLLOWUP_1", "to": "{{quote.client_email}}"}},
   {"id": "delay_2", "type": "delay", "name": "Esperar 4 días", "config": {"value": 4, "unit": "days"}},
   {"id": "check_2", "type": "condition", "name": "¿Sigue pendiente?", "config": {"field": "quote.status", "operator": "equals", "value": "sent"}, "branches": {"yes": "email_2", "no": "end"}},
   {"id": "email_2", "type": "send_email", "name": "Segundo recordatorio", "config": {"email_template_code": "QUOTE_FOLLOWUP_2", "to": "{{quote.client_email}}"}},
   {"id": "task", "type": "create_task", "name": "Llamar cliente", "config": {"title": "Seguimiento: {{quote.number}}", "due_days": 1, "priority": "high"}},
   {"id": "delay_3", "type": "delay", "name": "Esperar 7 días", "config": {"value": 7, "unit": "days"}},
   {"id": "check_3", "type": "condition", "name": "¿Última oportunidad?", "config": {"field": "quote.status", "operator": "equals", "value": "sent"}, "branches": {"yes": "email_final", "no": "end"}},
   {"id": "email_final", "type": "send_email", "name": "Email final", "config": {"email_template_code": "QUOTE_FOLLOWUP_FINAL", "to": "{{quote.client_email}}"}},
   {"id": "end", "type": "end", "name": "Fin"}
 ]',
 'file-text', 'green', ARRAY['presupuesto', 'seguimiento', 'ventas'], true, true
),
-- 2. WORKFLOW: NURTURING LEADS
('WF_LEAD_NURTURING',
 'Nurturing de Leads',
 'Secuencia educativa para leads no listos para comprar.',
 'marketing',
 'event',
 '{"event": "lead_created"}',
 '[
   {"id": "trigger", "type": "trigger", "name": "Nuevo lead"},
   {"id": "email_1", "type": "send_email", "name": "Bienvenida + Guía", "config": {"email_template_code": "NURTURING_WELCOME", "to": "{{lead.email}}"}},
   {"id": "delay_1", "type": "delay", "config": {"value": 3, "unit": "days"}},
   {"id": "email_2", "type": "send_email", "name": "Por qué registrar marca", "config": {"email_template_code": "NURTURING_WHY_TRADEMARK", "to": "{{lead.email}}"}},
   {"id": "delay_2", "type": "delay", "config": {"value": 4, "unit": "days"}},
   {"id": "email_3", "type": "send_email", "name": "Proceso de registro", "config": {"email_template_code": "NURTURING_PROCESS", "to": "{{lead.email}}"}},
   {"id": "delay_3", "type": "delay", "config": {"value": 5, "unit": "days"}},
   {"id": "email_4", "type": "send_email", "name": "Caso de éxito", "config": {"email_template_code": "NURTURING_CASE_STUDY", "to": "{{lead.email}}"}},
   {"id": "delay_4", "type": "delay", "config": {"value": 5, "unit": "days"}},
   {"id": "email_5", "type": "send_email", "name": "Oferta especial", "config": {"email_template_code": "NURTURING_OFFER", "to": "{{lead.email}}"}},
   {"id": "task", "type": "create_task", "name": "Calificar lead", "config": {"title": "Calificar: {{lead.name}}", "due_days": 2}}
 ]',
 'target', 'purple', ARRAY['leads', 'nurturing', 'marketing'], true, true
)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  steps = EXCLUDED.steps,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color,
  tags = EXCLUDED.tags,
  updated_at = now();

-- 3. EMAILS DE SEGUIMIENTO PRESUPUESTO (category 'reminder' es válida)
INSERT INTO email_templates (code, name, category, subject, html_content, body_html, variables, is_system, is_active) VALUES
('QUOTE_FOLLOWUP_1', 'Seguimiento Presupuesto 1', 'reminder',
 '¿Tienes dudas sobre el presupuesto {{quote.number}}?',
 '<div style="font-family: Arial, sans-serif; max-width: 600px;">
   <h1 style="color: #2563eb;">Seguimiento de tu presupuesto</h1>
   <p>Hola {{client.name}},</p>
   <p>Hace unos días te enviamos el presupuesto <strong>{{quote.number}}</strong>.</p>
   <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
     <p><strong>Concepto:</strong> {{quote.description}}</p>
     <p><strong>Importe:</strong> {{quote.total}}€</p>
     <p><strong>Válido hasta:</strong> {{quote.valid_until}}</p>
   </div>
   <p>¿Tienes alguna pregunta? Estamos aquí para ayudarte.</p>
   <a href="{{quote.accept_url}}" style="background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Aceptar presupuesto</a>
 </div>',
 '<div style="font-family: Arial, sans-serif; max-width: 600px;">
   <h1 style="color: #2563eb;">Seguimiento de tu presupuesto</h1>
   <p>Hola {{client.name}},</p>
   <p>Hace unos días te enviamos el presupuesto <strong>{{quote.number}}</strong>.</p>
   <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
     <p><strong>Concepto:</strong> {{quote.description}}</p>
     <p><strong>Importe:</strong> {{quote.total}}€</p>
     <p><strong>Válido hasta:</strong> {{quote.valid_until}}</p>
   </div>
   <p>¿Tienes alguna pregunta? Estamos aquí para ayudarte.</p>
   <a href="{{quote.accept_url}}" style="background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Aceptar presupuesto</a>
 </div>',
 '[{"name": "client.name"}, {"name": "quote.number"}, {"name": "quote.description"}, {"name": "quote.total"}, {"name": "quote.valid_until"}, {"name": "quote.accept_url"}]',
 true, true
),
('QUOTE_FOLLOWUP_FINAL', 'Seguimiento Final Presupuesto', 'reminder',
 '⏰ Tu presupuesto {{quote.number}} caduca pronto',
 '<div style="font-family: Arial, sans-serif; max-width: 600px;">
   <h1 style="color: #dc2626;">Última oportunidad</h1>
   <p>Hola {{client.name}},</p>
   <p>Queríamos recordarte que tu presupuesto está a punto de caducar.</p>
   <div style="background: #fee2e2; padding: 20px; border-radius: 8px; border-left: 4px solid #dc2626; margin: 20px 0;">
     <p><strong>⚠️ El presupuesto caduca el {{quote.valid_until}}</strong></p>
     <p>Presupuesto: {{quote.number}}</p>
     <p>Importe: {{quote.total}}€</p>
   </div>
   <p>No pierdas esta oportunidad de proteger tu marca.</p>
   <a href="{{quote.accept_url}}" style="background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; display: inline-block;">Aceptar presupuesto ahora</a>
 </div>',
 '<div style="font-family: Arial, sans-serif; max-width: 600px;">
   <h1 style="color: #dc2626;">Última oportunidad</h1>
   <p>Hola {{client.name}},</p>
   <p>Queríamos recordarte que tu presupuesto está a punto de caducar.</p>
   <div style="background: #fee2e2; padding: 20px; border-radius: 8px; border-left: 4px solid #dc2626; margin: 20px 0;">
     <p><strong>⚠️ El presupuesto caduca el {{quote.valid_until}}</strong></p>
     <p>Presupuesto: {{quote.number}}</p>
     <p>Importe: {{quote.total}}€</p>
   </div>
   <p>No pierdas esta oportunidad de proteger tu marca.</p>
   <a href="{{quote.accept_url}}" style="background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; display: inline-block;">Aceptar presupuesto ahora</a>
 </div>',
 '[{"name": "client.name"}, {"name": "quote.number"}, {"name": "quote.total"}, {"name": "quote.valid_until"}, {"name": "quote.accept_url"}]',
 true, true
)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  subject = EXCLUDED.subject,
  html_content = EXCLUDED.html_content,
  body_html = EXCLUDED.body_html,
  variables = EXCLUDED.variables,
  updated_at = now();
