-- ============================================
-- SEED: PI REMINDER WORKFLOW TEMPLATES
-- ============================================

-- Workflow: Trademark Renewal Reminders
INSERT INTO workflow_templates (
  code, name, description, category, trigger_type, trigger_config, steps, icon, color, tags, is_active, is_system
) VALUES (
  'WF_TRADEMARK_RENEWAL',
  'Recordatorio Renovación Marca',
  'Secuencia de recordatorios 6, 3, 1 mes y 2 semanas antes del vencimiento.',
  'reminders',
  'event',
  '{"event": "deadline_approaching", "deadline_type": "TM_RENEWAL", "days_before": 180}'::jsonb,
  '[
    {"id": "trigger", "type": "trigger", "name": "6 meses antes"},
    {"id": "email_6m", "type": "send_email", "name": "Aviso 6 meses", "config": {"email_template_code": "RENEWAL_6_MONTHS", "to": "{{matter.client_email}}", "cc": "{{matter.owner_email}}"}},
    {"id": "delay_1", "type": "delay", "config": {"value": 90, "unit": "days"}},
    {"id": "email_3m", "type": "send_email", "name": "Aviso 3 meses", "config": {"email_template_code": "RENEWAL_3_MONTHS", "to": "{{matter.client_email}}"}},
    {"id": "task_quote", "type": "create_task", "name": "Preparar presupuesto", "config": {"title": "Presupuesto renovación: {{matter.reference}}", "due_days": 7}},
    {"id": "delay_2", "type": "delay", "config": {"value": 60, "unit": "days"}},
    {"id": "email_1m", "type": "send_email", "name": "Aviso urgente 1 mes", "config": {"email_template_code": "RENEWAL_1_MONTH", "to": "{{matter.client_email}}"}},
    {"id": "task_call", "type": "create_task", "name": "Llamar urgente", "config": {"title": "URGENTE renovación: {{matter.reference}}", "due_days": 2, "priority": "urgent"}},
    {"id": "delay_3", "type": "delay", "config": {"value": 14, "unit": "days"}},
    {"id": "email_final", "type": "send_email", "name": "Último aviso", "config": {"email_template_code": "RENEWAL_FINAL", "to": "{{matter.client_email}}"}},
    {"id": "notification", "type": "send_notification", "name": "Alerta interna", "config": {"title": "⚠️ Renovación crítica", "body": "{{matter.reference}} vence en 2 semanas", "to": ["matter_owner", "admin"]}}
  ]'::jsonb,
  'refresh-cw',
  'red',
  ARRAY['renovación', 'marca', 'vencimiento'],
  true,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  steps = EXCLUDED.steps,
  trigger_config = EXCLUDED.trigger_config,
  updated_at = now();

-- Workflow: USPTO Declaration of Use
INSERT INTO workflow_templates (
  code, name, description, category, trigger_type, trigger_config, steps, icon, color, tags, is_active, is_system
) VALUES (
  'WF_USPTO_DECLARATION',
  'Declaración Uso USPTO (Section 8/9)',
  'Recordatorios para declaraciones de uso USPTO años 5-6 y 9-10.',
  'reminders',
  'event',
  '{"event": "deadline_approaching", "deadline_type": "TM_DECLARATION_OF_USE", "days_before": 180}'::jsonb,
  '[
    {"id": "trigger", "type": "trigger", "name": "6 meses antes"},
    {"id": "email_notice", "type": "send_email", "name": "Aviso declaración", "config": {"email_template_code": "USPTO_DECLARATION_NOTICE", "to": "{{matter.client_email}}"}},
    {"id": "task", "type": "create_task", "name": "Preparar documentación", "config": {"title": "Section 8/9: {{matter.reference}}", "due_days": 30}},
    {"id": "delay_1", "type": "delay", "config": {"value": 90, "unit": "days"}},
    {"id": "email_reminder", "type": "send_email", "name": "Recordatorio", "config": {"email_template_code": "USPTO_DECLARATION_REMINDER", "to": "{{matter.client_email}}"}},
    {"id": "delay_2", "type": "delay", "config": {"value": 60, "unit": "days"}},
    {"id": "email_urgent", "type": "send_email", "name": "Aviso urgente", "config": {"email_template_code": "USPTO_DECLARATION_URGENT", "to": "{{matter.client_email}}"}}
  ]'::jsonb,
  'file-check',
  'blue',
  ARRAY['USPTO', 'declaración uso', 'section 8'],
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
-- SEED: RENEWAL EMAIL TEMPLATES
-- (Using html_content which is NOT NULL in schema)
-- ============================================

-- Email: 6 months renewal notice
INSERT INTO email_templates (
  code, name, category, subject, html_content, body_html, variables, language, is_active
) VALUES (
  'RENEWAL_6_MONTHS',
  'Renovación 6 meses',
  'reminder',
  '📅 Tu marca {{matter.mark_name}} vence en 6 meses',
  '<div style="font-family: Arial, sans-serif; max-width: 600px;">
    <h1 style="color: #2563eb;">Aviso de renovación</h1>
    <p>Estimado/a {{client.name}},</p>
    <p>Tu marca vence en aproximadamente <strong>6 meses</strong>:</p>
    <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p><strong>🏷️ Marca:</strong> {{matter.mark_name}}</p>
      <p><strong>📋 Expediente:</strong> {{matter.reference}}</p>
      <p><strong>🏛️ Oficina:</strong> {{matter.office_name}}</p>
      <p><strong>📅 Vencimiento:</strong> {{matter.expiry_date}}</p>
    </div>
    <p>Te contactaremos con un presupuesto para la renovación.</p>
    <p style="margin-top: 30px; color: #64748b; font-size: 14px;">Si tienes dudas, contacta con tu gestor.</p>
  </div>',
  '<div style="font-family: Arial, sans-serif; max-width: 600px;">
    <h1 style="color: #2563eb;">Aviso de renovación</h1>
    <p>Estimado/a {{client.name}},</p>
    <p>Tu marca vence en aproximadamente <strong>6 meses</strong>:</p>
    <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p><strong>🏷️ Marca:</strong> {{matter.mark_name}}</p>
      <p><strong>📋 Expediente:</strong> {{matter.reference}}</p>
      <p><strong>🏛️ Oficina:</strong> {{matter.office_name}}</p>
      <p><strong>📅 Vencimiento:</strong> {{matter.expiry_date}}</p>
    </div>
    <p>Te contactaremos con un presupuesto para la renovación.</p>
  </div>',
  '[{"name": "client.name"}, {"name": "matter.mark_name"}, {"name": "matter.reference"}, {"name": "matter.office_name"}, {"name": "matter.expiry_date"}]'::jsonb,
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

-- Email: 3 months renewal notice
INSERT INTO email_templates (
  code, name, category, subject, html_content, body_html, variables, language, is_active
) VALUES (
  'RENEWAL_3_MONTHS',
  'Renovación 3 meses',
  'reminder',
  '📋 Renovación de {{matter.mark_name}} - 3 meses restantes',
  '<div style="font-family: Arial, sans-serif; max-width: 600px;">
    <h1 style="color: #f59e0b;">Recordatorio de renovación</h1>
    <p>Estimado/a {{client.name}},</p>
    <p>Te recordamos que tu marca vence en <strong>3 meses</strong>:</p>
    <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
      <p><strong>🏷️ Marca:</strong> {{matter.mark_name}}</p>
      <p><strong>📋 Expediente:</strong> {{matter.reference}}</p>
      <p><strong>📅 Vencimiento:</strong> {{matter.expiry_date}}</p>
    </div>
    <p>Te enviaremos próximamente el presupuesto de renovación.</p>
  </div>',
  '<div style="font-family: Arial, sans-serif; max-width: 600px;">
    <h1 style="color: #f59e0b;">Recordatorio de renovación</h1>
    <p>Estimado/a {{client.name}},</p>
    <p>Te recordamos que tu marca vence en <strong>3 meses</strong>:</p>
    <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
      <p><strong>🏷️ Marca:</strong> {{matter.mark_name}}</p>
      <p><strong>📋 Expediente:</strong> {{matter.reference}}</p>
      <p><strong>📅 Vencimiento:</strong> {{matter.expiry_date}}</p>
    </div>
    <p>Te enviaremos próximamente el presupuesto de renovación.</p>
  </div>',
  '[{"name": "client.name"}, {"name": "matter.mark_name"}, {"name": "matter.reference"}, {"name": "matter.expiry_date"}]'::jsonb,
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

-- Email: 1 month urgent renewal notice
INSERT INTO email_templates (
  code, name, category, subject, html_content, body_html, variables, language, is_active
) VALUES (
  'RENEWAL_1_MONTH',
  'Renovación 1 mes URGENTE',
  'reminder',
  '🚨 URGENTE: Tu marca {{matter.mark_name}} vence en 1 MES',
  '<div style="font-family: Arial, sans-serif; max-width: 600px;">
    <h1 style="color: #dc2626;">⚠️ AVISO URGENTE</h1>
    <p>Estimado/a {{client.name}},</p>
    <div style="background: #fee2e2; padding: 20px; border-radius: 8px; border-left: 4px solid #dc2626;">
      <p style="font-size: 18px;"><strong>📅 Fecha límite: {{matter.expiry_date}}</strong></p>
      <p style="color: #dc2626;">Es imperativo actuar ahora.</p>
    </div>
    <h2 style="color: #991b1b;">¿Qué pasa si no renovamos?</h2>
    <ul>
      <li>❌ Perderás la protección exclusiva</li>
      <li>❌ Terceros podrían registrar tu marca</li>
      <li>❌ Tendrás que empezar de nuevo</li>
    </ul>
    <a href="{{renewal.quote_url}}" style="display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px;">RENOVAR AHORA</a>
    <p style="margin-top: 30px; color: #64748b; font-size: 14px;">Si ya has confirmado la renovación, ignora este mensaje.</p>
  </div>',
  '<div style="font-family: Arial, sans-serif; max-width: 600px;">
    <h1 style="color: #dc2626;">⚠️ AVISO URGENTE</h1>
    <p>Estimado/a {{client.name}},</p>
    <div style="background: #fee2e2; padding: 20px; border-radius: 8px; border-left: 4px solid #dc2626;">
      <p style="font-size: 18px;"><strong>📅 Fecha límite: {{matter.expiry_date}}</strong></p>
      <p style="color: #dc2626;">Es imperativo actuar ahora.</p>
    </div>
    <h2 style="color: #991b1b;">¿Qué pasa si no renovamos?</h2>
    <ul>
      <li>❌ Perderás la protección exclusiva</li>
      <li>❌ Terceros podrían registrar tu marca</li>
      <li>❌ Tendrás que empezar de nuevo</li>
    </ul>
    <a href="{{renewal.quote_url}}" style="display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px;">RENOVAR AHORA</a>
  </div>',
  '[{"name": "client.name"}, {"name": "matter.mark_name"}, {"name": "matter.expiry_date"}, {"name": "renewal.quote_url"}]'::jsonb,
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

-- Email: Final renewal notice
INSERT INTO email_templates (
  code, name, category, subject, html_content, body_html, variables, language, is_active
) VALUES (
  'RENEWAL_FINAL',
  'Renovación Aviso Final',
  'reminder',
  '⏰ ÚLTIMO AVISO: {{matter.mark_name}} vence en 2 SEMANAS',
  '<div style="font-family: Arial, sans-serif; max-width: 600px;">
    <h1 style="color: #dc2626;">🚨 ÚLTIMA OPORTUNIDAD</h1>
    <p>Estimado/a {{client.name}},</p>
    <div style="background: #fee2e2; padding: 20px; border-radius: 8px; border: 2px solid #dc2626;">
      <p style="font-size: 20px; font-weight: bold; color: #dc2626;">Tu marca vence en 2 SEMANAS</p>
      <p><strong>📅 Fecha límite absoluta: {{matter.expiry_date}}</strong></p>
    </div>
    <p style="margin-top: 20px;">Si no actuamos antes de esta fecha, <strong>perderás tu marca</strong>.</p>
    <a href="{{renewal.quote_url}}" style="display: inline-block; background: #dc2626; color: white; padding: 16px 32px; text-decoration: none; border-radius: 6px; margin-top: 20px; font-size: 18px;">CONFIRMAR RENOVACIÓN AHORA</a>
  </div>',
  '<div style="font-family: Arial, sans-serif; max-width: 600px;">
    <h1 style="color: #dc2626;">🚨 ÚLTIMA OPORTUNIDAD</h1>
    <p>Estimado/a {{client.name}},</p>
    <div style="background: #fee2e2; padding: 20px; border-radius: 8px; border: 2px solid #dc2626;">
      <p style="font-size: 20px; font-weight: bold; color: #dc2626;">Tu marca vence en 2 SEMANAS</p>
      <p><strong>📅 Fecha límite absoluta: {{matter.expiry_date}}</strong></p>
    </div>
    <p style="margin-top: 20px;">Si no actuamos antes de esta fecha, <strong>perderás tu marca</strong>.</p>
    <a href="{{renewal.quote_url}}" style="display: inline-block; background: #dc2626; color: white; padding: 16px 32px; text-decoration: none; border-radius: 6px; margin-top: 20px; font-size: 18px;">CONFIRMAR RENOVACIÓN AHORA</a>
  </div>',
  '[{"name": "client.name"}, {"name": "matter.mark_name"}, {"name": "matter.expiry_date"}, {"name": "renewal.quote_url"}]'::jsonb,
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