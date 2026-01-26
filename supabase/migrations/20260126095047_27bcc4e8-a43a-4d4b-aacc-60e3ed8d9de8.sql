-- =============================================
-- SEED: Automation Rules for USPTO, UKIPO, WIPO Trademarks
-- Verified: 2026-01-26
-- =============================================

-- 1. USPTO (USA) TRADEMARK RULES
INSERT INTO automation_rules (
  code, name, description, rule_type, category, subcategory,
  trigger_type, trigger_event, trigger_config, conditions,
  legal_deadline_id, deadline_config,
  is_system_rule, is_active, display_order
) VALUES
-- Section 8 (5-6 años)
('USPTO_TM_SECTION_8_FIRST',
 'Declaración uso Section 8 (5-6 años)',
 'Recordar presentar declaración de uso entre el 5º y 6º año.',
 'deadline', 'trademarks', 'declaration',
 'deadline_approaching', 'matter_anniversary',
 '{"years": 5, "months_before": 12}',
 '{"matter_types": ["trademark"], "offices": ["USPTO"], "statuses": ["registered"]}',
 (SELECT id FROM legal_deadlines WHERE code = 'USPTO_TM_SECTION_8_FIRST'),
 '{
   "title_template": "Section 8 requerida: {{matter.mark_name}}",
   "description_template": "La marca {{matter.mark_name}} requiere declaración de uso continuado (Section 8) entre el 5º y 6º año desde registro.",
   "priority": "high",
   "notify_before_days": [365, 180, 90, 30],
   "auto_send_email": true,
   "email_template": "USPTO_DECLARATION_NOTICE"
 }',
 true, false, 200),

-- Section 8+9 (renovación 10 años)
('USPTO_TM_SECTION_8_9',
 'Renovación Section 8+9 (cada 10 años)',
 'Recordar presentar declaración de uso + renovación entre 9º y 10º año.',
 'deadline', 'trademarks', 'renewal',
 'deadline_approaching', 'matter_anniversary',
 '{"years": 9, "months_before": 12}',
 '{"matter_types": ["trademark"], "offices": ["USPTO"], "statuses": ["registered"]}',
 (SELECT id FROM legal_deadlines WHERE code = 'USPTO_TM_SECTION_8_9'),
 '{
   "title_template": "Section 8+9 requerida: {{matter.mark_name}}",
   "description_template": "La marca {{matter.mark_name}} requiere declaración de uso + renovación (Sections 8 & 9) entre el 9º y 10º año.",
   "priority": "high",
   "notify_before_days": [365, 180, 90, 30],
   "auto_send_email": true,
   "email_template": "USPTO_RENEWAL_NOTICE"
 }',
 true, false, 201),

-- Section 15 (incontestabilidad opcional)
('USPTO_TM_SECTION_15',
 'Oportunidad Section 15 (incontestabilidad)',
 'Notificar oportunidad de declaración de incontestabilidad tras 5 años.',
 'notification', 'trademarks', 'declaration',
 'deadline_approaching', 'matter_anniversary',
 '{"years": 5, "months_before": 6}',
 '{"matter_types": ["trademark"], "offices": ["USPTO"], "statuses": ["registered"]}',
 (SELECT id FROM legal_deadlines WHERE code = 'USPTO_TM_SECTION_15'),
 '{
   "title_template": "Section 15 disponible: {{matter.mark_name}}",
   "description_template": "La marca {{matter.mark_name}} puede solicitar incontestabilidad (Section 15). Recomendado presentar junto con Section 8.",
   "priority": "low"
 }',
 true, false, 202),

-- Respuesta a Office Action
('USPTO_TM_OFFICE_ACTION_RULE',
 'Plazo respuesta Office Action',
 'Cuando se recibe Office Action, crear plazo de 6 meses.',
 'deadline', 'trademarks', 'response',
 'event', 'notification_received',
 '{"notification_type": "office_action"}',
 '{"matter_types": ["trademark"], "offices": ["USPTO"]}',
 (SELECT id FROM legal_deadlines WHERE code = 'USPTO_TM_OFFICE_ACTION'),
 '{
   "title_template": "Responder Office Action: {{matter.reference}}",
   "priority": "high",
   "notify_before_days": [90, 30, 14, 7],
   "auto_create_task": true,
   "task_title": "Preparar respuesta Office Action"
 }',
 true, false, 210),

-- Statement of Use (ITU)
('USPTO_TM_SOU_RULE',
 'Statement of Use (Intent-to-Use)',
 'Cuando se recibe Notice of Allowance, crear plazo para SOU.',
 'deadline', 'trademarks', 'declaration',
 'event', 'notification_received',
 '{"notification_type": "notice_of_allowance"}',
 '{"matter_types": ["trademark"], "offices": ["USPTO"], "filing_basis": ["1b"]}',
 (SELECT id FROM legal_deadlines WHERE code = 'USPTO_TM_SOU'),
 '{
   "title_template": "Presentar Statement of Use: {{matter.reference}}",
   "priority": "high",
   "notify_before_days": [90, 30, 14],
   "auto_create_task": true
 }',
 true, false, 220),

-- Petition to Revive
('USPTO_TM_PETITION_REVIVE_RULE',
 'Petition to Revive solicitud abandonada',
 'Cuando se abandona solicitud, crear plazo para petition to revive.',
 'deadline', 'trademarks', 'restoration',
 'event', 'matter_status_changed',
 '{"new_status": "abandoned"}',
 '{"matter_types": ["trademark"], "offices": ["USPTO"]}',
 (SELECT id FROM legal_deadlines WHERE code = 'USPTO_TM_PETITION_REVIVE'),
 '{
   "title_template": "Petition to Revive: {{matter.reference}}",
   "priority": "high",
   "notify_before_days": [30, 14, 7],
   "auto_create_task": true,
   "notes": "Considerar si el abandono fue unintentional"
 }',
 true, false, 230)

ON CONFLICT (tenant_id, code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  deadline_config = EXCLUDED.deadline_config,
  legal_deadline_id = EXCLUDED.legal_deadline_id,
  updated_at = now();

-- 2. UKIPO (UK) TRADEMARK RULES
INSERT INTO automation_rules (
  code, name, description, rule_type, category, subcategory,
  trigger_type, trigger_event, trigger_config, conditions,
  legal_deadline_id, deadline_config,
  is_system_rule, is_active, display_order
) VALUES
('UKIPO_TM_OPPOSITION_DEADLINE',
 'Crear plazo oposición marca UK',
 'Cuando una marca UK es publicada, crear plazo de 2 meses para oposición.',
 'deadline', 'trademarks', 'opposition',
 'event', 'matter_status_changed',
 '{"new_status": "published"}',
 '{"matter_types": ["trademark"], "offices": ["UKIPO"]}',
 (SELECT id FROM legal_deadlines WHERE code = 'UKIPO_TM_OPPOSITION_PERIOD'),
 '{
   "title_template": "Fin plazo oposición UK: {{matter.mark_name}}",
   "priority": "high",
   "notify_before_days": [14, 7, 1]
 }',
 true, false, 300),

('UKIPO_TM_COUNTERSTATEMENT',
 'Plazo counterstatement oposición UK',
 'Cuando se recibe oposición UK, crear plazo de 2 meses para counterstatement.',
 'deadline', 'trademarks', 'opposition',
 'event', 'matter_status_changed',
 '{"new_status": "opposition_received"}',
 '{"matter_types": ["trademark"], "offices": ["UKIPO"]}',
 (SELECT id FROM legal_deadlines WHERE code = 'UKIPO_TM_COUNTERSTATEMENT'),
 '{
   "title_template": "Counterstatement: {{matter.reference}}",
   "priority": "urgent",
   "notify_before_days": [14, 7, 3],
   "auto_create_task": true
 }',
 true, false, 301),

('UKIPO_TM_RENEWAL_6M',
 'Aviso renovación marca UK (6 meses)',
 'Avisar 6 meses antes del vencimiento de marca UK.',
 'deadline', 'trademarks', 'renewal',
 'deadline_approaching', 'matter_expiry',
 '{"days_before": 180}',
 '{"matter_types": ["trademark"], "offices": ["UKIPO"], "statuses": ["registered"]}',
 (SELECT id FROM legal_deadlines WHERE code = 'UKIPO_TM_RENEWAL'),
 '{
   "title_template": "Renovación UK: {{matter.mark_name}} vence en 6 meses",
   "priority": "medium"
 }',
 true, false, 310),

('UKIPO_TM_RENEWAL_1M',
 'Aviso URGENTE renovación marca UK (1 mes)',
 'Avisar 1 mes antes del vencimiento de marca UK.',
 'deadline', 'trademarks', 'renewal',
 'deadline_approaching', 'matter_expiry',
 '{"days_before": 30}',
 '{"matter_types": ["trademark"], "offices": ["UKIPO"], "statuses": ["registered"]}',
 (SELECT id FROM legal_deadlines WHERE code = 'UKIPO_TM_RENEWAL'),
 '{
   "title_template": "⚠️ URGENTE: {{matter.mark_name}} vence en 1 MES",
   "priority": "urgent",
   "auto_send_email": true,
   "auto_create_task": true
 }',
 true, false, 311)

ON CONFLICT (tenant_id, code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  deadline_config = EXCLUDED.deadline_config,
  legal_deadline_id = EXCLUDED.legal_deadline_id,
  updated_at = now();

-- 3. WIPO (Madrid) TRADEMARK RULES
INSERT INTO automation_rules (
  code, name, description, rule_type, category, subcategory,
  trigger_type, trigger_event, trigger_config, conditions,
  legal_deadline_id, deadline_config,
  is_system_rule, is_active, display_order
) VALUES
('WIPO_TM_DEPENDENCY_END',
 'Fin período dependencia marca internacional',
 'Notificar cuando termina el período de dependencia de 5 años.',
 'notification', 'trademarks', 'response',
 'deadline_approaching', 'matter_anniversary',
 '{"years": 5, "days_before": 30}',
 '{"matter_types": ["trademark"], "offices": ["WIPO"]}',
 (SELECT id FROM legal_deadlines WHERE code = 'WIPO_TM_DEPENDENCY'),
 '{
   "title_template": "Fin dependencia: {{matter.reference}}",
   "description_template": "El registro internacional {{matter.reference}} ya no depende de la marca base.",
   "priority": "low"
 }',
 true, false, 400),

('WIPO_TM_RENEWAL_6M',
 'Aviso renovación marca internacional (6 meses)',
 'Avisar 6 meses antes del vencimiento de registro internacional.',
 'deadline', 'trademarks', 'renewal',
 'deadline_approaching', 'matter_expiry',
 '{"days_before": 180}',
 '{"matter_types": ["trademark"], "offices": ["WIPO"], "statuses": ["registered"]}',
 (SELECT id FROM legal_deadlines WHERE code = 'WIPO_TM_RENEWAL'),
 '{
   "title_template": "Renovación WIPO: {{matter.reference}} vence en 6 meses",
   "priority": "medium",
   "auto_send_email": true
 }',
 true, false, 410),

('WIPO_TM_RENEWAL_3M',
 'Aviso renovación marca internacional (3 meses)',
 'Avisar 3 meses antes del vencimiento de registro internacional.',
 'deadline', 'trademarks', 'renewal',
 'deadline_approaching', 'matter_expiry',
 '{"days_before": 90}',
 '{"matter_types": ["trademark"], "offices": ["WIPO"], "statuses": ["registered"]}',
 (SELECT id FROM legal_deadlines WHERE code = 'WIPO_TM_RENEWAL'),
 '{
   "title_template": "RENOVACIÓN: {{matter.reference}} vence en 3 meses",
   "priority": "high",
   "auto_send_email": true,
   "auto_create_task": true
 }',
 true, false, 411),

('WIPO_TM_PROVISIONAL_REFUSAL',
 'Respuesta a denegación provisional país designado',
 'Cuando se recibe denegación provisional, crear plazo según país.',
 'deadline', 'trademarks', 'response',
 'event', 'notification_received',
 '{"notification_type": "provisional_refusal"}',
 '{"matter_types": ["trademark"], "offices": ["WIPO"]}',
 NULL,
 '{
   "title_template": "Responder denegación {{notification.country}}: {{matter.reference}}",
   "priority": "high",
   "notify_before_days": [30, 14, 7],
   "auto_create_task": true,
   "notes": "Plazo específico según país designado"
 }',
 true, false, 420),

('WIPO_TM_CENTRAL_ATTACK',
 'Ataque central detectado',
 'Notificar si la marca base es rechazada/cancelada durante período dependencia.',
 'notification', 'trademarks', 'response',
 'event', 'matter_status_changed',
 '{"new_status": ["cancelled", "refused", "withdrawn"], "check_dependency": true}',
 '{"matter_types": ["trademark"], "offices": ["WIPO"]}',
 NULL,
 '{
   "title_template": "⚠️ ATAQUE CENTRAL: {{matter.reference}}",
   "description_template": "La marca base ha sido cancelada/rechazada. El registro internacional puede verse afectado.",
   "priority": "urgent",
   "auto_create_task": true,
   "task_title": "Evaluar transformación a solicitudes nacionales"
 }',
 true, false, 430)

ON CONFLICT (tenant_id, code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  deadline_config = EXCLUDED.deadline_config,
  legal_deadline_id = EXCLUDED.legal_deadline_id,
  updated_at = now();