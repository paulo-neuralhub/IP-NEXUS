-- DEADLINE RULES SEED DATA ONLY (holidays skipped for now)
INSERT INTO deadline_rules (code, name, jurisdiction, matter_type, event_type, days_from_event, calendar_type, alert_days, priority, description, is_active, creates_deadline, auto_create_task)
VALUES
  ('EUIPO-TM-OPP', 'Oposición a solicitud', 'EUIPO', 'trademark', 'publication', 90, 'calendar', ARRAY[60, 30, 14, 7], 'high', 'Plazo para presentar oposición', true, true, true),
  ('EUIPO-TM-REN', 'Renovación marca', 'EUIPO', 'trademark', 'expiry', -180, 'calendar', ARRAY[180, 90, 30, 7], 'critical', 'Renovación de marca', true, true, true),
  ('OEPM-TM-OPP', 'Oposición a solicitud', 'OEPM', 'trademark', 'publication', 60, 'calendar', ARRAY[30, 14, 7], 'high', 'Oposición BOPI', true, true, true),
  ('OEPM-TM-REN', 'Renovación marca', 'OEPM', 'trademark', 'expiry', -180, 'calendar', ARRAY[180, 90, 30, 7], 'critical', 'Renovación marca española', true, true, true),
  ('USPTO-TM-OPP', 'Opposition period', 'USPTO', 'trademark', 'publication', 30, 'calendar', ARRAY[14, 7], 'high', 'Opposition period', true, true, true),
  ('USPTO-TM-SEC9', 'Section 9 Renewal', 'USPTO', 'trademark', 'registration', 3650, 'calendar', ARRAY[365, 180, 90], 'critical', 'Renewal every 10 years', true, true, true),
  ('WIPO-MAD-REN', 'Madrid Renewal', 'WIPO', 'trademark', 'expiry', -180, 'calendar', ARRAY[180, 90, 30, 7], 'critical', 'International renewal', true, true, true),
  ('EPO-PAT-ANN', 'Annual Fee', 'EPO', 'patent', 'anniversary', 0, 'calendar', ARRAY[90, 30, 7], 'critical', 'Annual renewal fee', true, true, true)
ON CONFLICT (code) DO NOTHING;