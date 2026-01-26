-- ============================================================
-- IP-NEXUS - LEGAL DEADLINES SEED
-- Trademark deadlines for Europe (EUIPO, OEPM, UKIPO)
-- Verified: 2026-01-26
-- ============================================================

-- 1. EUIPO (EU Trademark) Deadlines
INSERT INTO public.legal_deadlines (
  code, office_id, right_type, deadline_category, name, name_en, description,
  trigger_event, months_offset, years_offset, is_before_event,
  grace_period_months, grace_has_surcharge, window_start_months,
  is_extendable, max_extension_months,
  legal_basis, legal_basis_url,
  last_verified_at, verified_source, next_review_at
) VALUES
-- Opposition
('EUIPO_TM_OPPOSITION_PERIOD', 
 (SELECT id FROM public.ip_offices WHERE code = 'EUIPO'),
 'trademark', 'opposition',
 'Plazo de oposición marca UE', 'EU trademark opposition period',
 'Período de 3 meses para presentar oposición contra solicitud de marca de la UE publicada.',
 'publication', 3, NULL, false,
 NULL, false, NULL, false, NULL,
 'EUTMR Art. 46', 'https://euipo.europa.eu/ohimportal/en/opposition',
 '2026-01-26', 'https://euipo.europa.eu/en/trade-marks/after-applying/opposition', '2026-07-01'),

-- Cooling-off
('EUIPO_TM_COOLING_OFF',
 (SELECT id FROM public.ip_offices WHERE code = 'EUIPO'),
 'trademark', 'response',
 'Período de cooling-off', 'Cooling-off period',
 'Período inicial de 2 meses para negociación amistosa tras oposición. Extensible hasta 24 meses total.',
 'opposition_filed', 2, NULL, false,
 NULL, false, NULL, true, 22,
 'EUTMR', 'https://euipo.europa.eu',
 '2026-01-26', 'EUIPO Guidelines', '2026-07-01'),

-- Renewal (10 years)
('EUIPO_TM_RENEWAL_10Y',
 (SELECT id FROM public.ip_offices WHERE code = 'EUIPO'),
 'trademark', 'renewal',
 'Vencimiento marca UE (10 años)', 'EU trademark expiry (10 years)',
 'Renovación cada 10 años desde fecha de solicitud. Período de gracia de 6 meses con recargo.',
 'filing', NULL, 10, false,
 6, true, 6, false, NULL,
 'EUTMR Art. 52-53', 'https://euipo.europa.eu',
 '2026-01-26', 'EUIPO Official', '2026-07-01'),

-- Appeal
('EUIPO_TM_APPEAL',
 (SELECT id FROM public.ip_offices WHERE code = 'EUIPO'),
 'trademark', 'response',
 'Plazo de apelación', 'Appeal period',
 'Plazo de 2 meses para presentar recurso contra decisión de la EUIPO.',
 'notification', 2, NULL, false,
 NULL, false, NULL, false, NULL,
 'EUTMR Art. 68', 'https://euipo.europa.eu',
 '2026-01-26', 'EUIPO Guidelines', '2026-07-01'),

-- Appeal grounds
('EUIPO_TM_APPEAL_GROUNDS',
 (SELECT id FROM public.ip_offices WHERE code = 'EUIPO'),
 'trademark', 'response',
 'Fundamentos de apelación', 'Appeal grounds submission',
 'Plazo de 4 meses desde notificación para presentar los fundamentos del recurso.',
 'notification', 4, NULL, false,
 NULL, false, NULL, false, NULL,
 'EUTMR Art. 68', 'https://euipo.europa.eu',
 '2026-01-26', 'EUIPO Guidelines', '2026-07-01'),

-- Conversion
('EUIPO_TM_CONVERSION',
 (SELECT id FROM public.ip_offices WHERE code = 'EUIPO'),
 'trademark', 'response',
 'Solicitud de conversión', 'Conversion request',
 'Plazo de 3 meses para solicitar conversión a marca nacional tras denegación/retirada.',
 'decision_final', 3, NULL, false,
 NULL, false, NULL, false, NULL,
 'EUTMR Art. 139', 'https://euipo.europa.eu',
 '2026-01-26', 'EUIPO Guidelines', '2026-07-01'),

-- Proof of use request
('EUIPO_TM_PROOF_OF_USE',
 (SELECT id FROM public.ip_offices WHERE code = 'EUIPO'),
 'trademark', 'response',
 'Prueba de uso', 'Proof of use submission',
 'Plazo para presentar prueba de uso cuando es solicitada en oposición.',
 'notification', 2, NULL, false,
 NULL, false, NULL, false, NULL,
 'EUTMR Art. 47', 'https://euipo.europa.eu',
 '2026-01-26', 'EUIPO Guidelines', '2026-07-01')

ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  name_en = EXCLUDED.name_en,
  description = EXCLUDED.description,
  last_verified_at = EXCLUDED.last_verified_at,
  next_review_at = EXCLUDED.next_review_at;

-- 2. OEPM (Spain) Deadlines
INSERT INTO public.legal_deadlines (
  code, office_id, right_type, deadline_category, name, name_en, description,
  trigger_event, months_offset, days_offset, is_before_event,
  grace_period_months, grace_has_surcharge, window_start_months,
  is_extendable, max_extension_months,
  legal_basis, legal_basis_url,
  last_verified_at, verified_source, next_review_at
) VALUES
-- Opposition
('OEPM_TM_OPPOSITION_PERIOD',
 (SELECT id FROM public.ip_offices WHERE code = 'OEPM'),
 'trademark', 'opposition',
 'Plazo de oposición marca España', 'Spanish trademark opposition period',
 'Período de 2 meses para presentar oposición contra solicitud publicada en BOPI.',
 'publication', 2, NULL, false,
 NULL, false, NULL, false, NULL,
 'Ley 17/2001 de Marcas Art. 19', 'https://www.oepm.es',
 '2026-01-26', 'OEPM Oficial', '2026-07-01'),

-- Opposition response
('OEPM_TM_OPPOSITION_RESPONSE',
 (SELECT id FROM public.ip_offices WHERE code = 'OEPM'),
 'trademark', 'response',
 'Respuesta a oposición', 'Opposition response',
 'Plazo de 1 mes para contestar a la oposición recibida.',
 'opposition_notification', 1, NULL, false,
 NULL, false, NULL, false, NULL,
 'Ley 17/2001', 'https://www.oepm.es',
 '2026-01-26', 'OEPM Oficial', '2026-07-01'),

-- Defect correction
('OEPM_TM_DEFECT_CORRECTION',
 (SELECT id FROM public.ip_offices WHERE code = 'OEPM'),
 'trademark', 'response',
 'Subsanación de defectos', 'Defect correction',
 'Plazo de 1 mes para subsanar defectos formales en solicitud.',
 'notification', 1, NULL, false,
 NULL, false, NULL, false, NULL,
 'Ley 17/2001', 'https://www.oepm.es',
 '2026-01-26', 'OEPM Oficial', '2026-07-01'),

-- Renewal (10 years)
('OEPM_TM_RENEWAL_10Y',
 (SELECT id FROM public.ip_offices WHERE code = 'OEPM'),
 'trademark', 'renewal',
 'Vencimiento marca España (10 años)', 'Spanish trademark expiry (10 years)',
 'Renovación cada 10 años desde fecha de solicitud. Período de gracia de 6 meses con recargo.',
 'filing', NULL, NULL, false,
 6, true, 6, false, NULL,
 'Ley 17/2001 Art. 32', 'https://www.oepm.es',
 '2026-01-26', 'OEPM Oficial', '2026-07-01'),

-- Provisional refusal response
('OEPM_TM_PROVISIONAL_REFUSAL',
 (SELECT id FROM public.ip_offices WHERE code = 'OEPM'),
 'trademark', 'response',
 'Respuesta a denegación provisional', 'Provisional refusal response',
 'Plazo de 1 mes para contestar a la denegación provisional.',
 'notification', 1, NULL, false,
 NULL, false, NULL, false, NULL,
 'Ley 17/2001', 'https://www.oepm.es',
 '2026-01-26', 'OEPM Oficial', '2026-07-01'),

-- Cancellation response
('OEPM_TM_CANCELLATION_RESPONSE',
 (SELECT id FROM public.ip_offices WHERE code = 'OEPM'),
 'trademark', 'response',
 'Respuesta a nulidad/caducidad', 'Cancellation response',
 'Plazo de 2 meses para contestar a solicitud de nulidad o caducidad.',
 'notification', 2, NULL, false,
 NULL, false, NULL, false, NULL,
 'Ley 17/2001', 'https://www.oepm.es',
 '2026-01-26', 'OEPM Oficial', '2026-07-01'),

-- Appeal
('OEPM_TM_APPEAL',
 (SELECT id FROM public.ip_offices WHERE code = 'OEPM'),
 'trademark', 'response',
 'Recurso de alzada', 'Administrative appeal',
 'Plazo de 1 mes para interponer recurso de alzada ante la OEPM.',
 'notification', 1, NULL, false,
 NULL, false, NULL, false, NULL,
 'Ley 17/2001', 'https://www.oepm.es',
 '2026-01-26', 'OEPM Oficial', '2026-07-01')

ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  name_en = EXCLUDED.name_en,
  description = EXCLUDED.description,
  last_verified_at = EXCLUDED.last_verified_at,
  next_review_at = EXCLUDED.next_review_at;

-- 3. UKIPO (United Kingdom) Deadlines
INSERT INTO public.legal_deadlines (
  code, office_id, right_type, deadline_category, name, name_en, description,
  trigger_event, months_offset, is_before_event,
  grace_period_months, grace_has_surcharge, window_start_months,
  is_extendable, max_extension_months,
  legal_basis, legal_basis_url,
  last_verified_at, verified_source, next_review_at
) VALUES
-- Opposition
('UKIPO_TM_OPPOSITION_PERIOD',
 (SELECT id FROM public.ip_offices WHERE code = 'UKIPO'),
 'trademark', 'opposition',
 'Plazo de oposición marca UK', 'UK trademark opposition period',
 'Período de 2 meses para presentar oposición. Extensible 1 mes adicional.',
 'publication', 2, false,
 NULL, false, NULL, true, 1,
 'Trade Marks Act 1994', 'https://www.gov.uk/government/organisations/intellectual-property-office',
 '2026-01-26', 'UKIPO Official', '2026-07-01'),

-- Cooling-off
('UKIPO_TM_COOLING_OFF',
 (SELECT id FROM public.ip_offices WHERE code = 'UKIPO'),
 'trademark', 'response',
 'Período de cooling-off UK', 'UK cooling-off period',
 'Período inicial de 2 meses para negociación. Extensible hasta 9 meses si ambas partes acuerdan.',
 'opposition_filed', 2, false,
 NULL, false, NULL, true, 7,
 'Trade Marks Rules', 'https://www.gov.uk/government/organisations/intellectual-property-office',
 '2026-01-26', 'UKIPO Official', '2026-07-01'),

-- Counterstatement
('UKIPO_TM_COUNTERSTATEMENT',
 (SELECT id FROM public.ip_offices WHERE code = 'UKIPO'),
 'trademark', 'response',
 'Counterstatement', 'Counterstatement deadline',
 'Plazo de 2 meses para presentar defensa contra oposición.',
 'opposition_notification', 2, false,
 NULL, false, NULL, false, NULL,
 'Trade Marks Rules', 'https://www.gov.uk/government/organisations/intellectual-property-office',
 '2026-01-26', 'UKIPO Official', '2026-07-01'),

-- Renewal (10 years)
('UKIPO_TM_RENEWAL_10Y',
 (SELECT id FROM public.ip_offices WHERE code = 'UKIPO'),
 'trademark', 'renewal',
 'Vencimiento marca UK (10 años)', 'UK trademark expiry (10 years)',
 'Renovación cada 10 años desde fecha de solicitud. Período de gracia de 6 meses con recargo.',
 'filing', NULL, false,
 6, true, 6, false, NULL,
 'Trade Marks Act 1994', 'https://www.gov.uk/government/organisations/intellectual-property-office',
 '2026-01-26', 'UKIPO Official', '2026-07-01'),

-- Restoration
('UKIPO_TM_RESTORATION',
 (SELECT id FROM public.ip_offices WHERE code = 'UKIPO'),
 'trademark', 'restoration',
 'Restauración marca UK', 'UK trademark restoration',
 'Plazo de 6 meses para solicitar restauración de marca caducada por no renovación.',
 'expiry', 6, false,
 NULL, false, NULL, false, NULL,
 'Trade Marks Act 1994', 'https://www.gov.uk/government/organisations/intellectual-property-office',
 '2026-01-26', 'UKIPO Official', '2026-07-01'),

-- Evidence rounds
('UKIPO_TM_EVIDENCE',
 (SELECT id FROM public.ip_offices WHERE code = 'UKIPO'),
 'trademark', 'response',
 'Ronda de pruebas', 'Evidence round',
 'Plazo de 2 meses para presentar pruebas en procedimiento de oposición.',
 'notification', 2, false,
 NULL, false, NULL, true, 2,
 'Trade Marks Rules', 'https://www.gov.uk/government/organisations/intellectual-property-office',
 '2026-01-26', 'UKIPO Official', '2026-07-01')

ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  name_en = EXCLUDED.name_en,
  description = EXCLUDED.description,
  last_verified_at = EXCLUDED.last_verified_at,
  next_review_at = EXCLUDED.next_review_at;