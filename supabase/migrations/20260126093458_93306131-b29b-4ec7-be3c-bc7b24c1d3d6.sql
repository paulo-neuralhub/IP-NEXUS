-- ============================================================
-- SEED: Legal Deadlines - Patents (EPO, USPTO, OEPM, PCT/WIPO)
-- Verified: 2026-01-26
-- ============================================================

-- EPO Patent Deadlines
INSERT INTO public.legal_deadlines (
  code, office_id, right_type, deadline_category, name, name_en, description,
  trigger_event, months_offset, years_offset, is_before_event,
  grace_period_months, grace_has_surcharge,
  is_extendable, max_extension_months,
  legal_basis, legal_basis_url,
  last_verified_at, verified_source, next_review_at
) VALUES
-- Annuities start
('EPO_PT_ANNUITY_START',
 (SELECT id FROM public.ip_offices WHERE code = 'EPO'),
 'patent', 'annuity',
 'Inicio pago anualidades', 'Annuity payment start',
 'Las anualidades se pagan desde el 3er año desde la fecha de solicitud.',
 'filing', NULL, 3, false,
 NULL, false, false, NULL,
 'EPC Art. 86', 'https://www.epo.org',
 '2026-01-26', 'EPO Guidelines', '2026-07-01'),

-- Examination response
('EPO_PT_EXAMINATION_RESPONSE',
 (SELECT id FROM public.ip_offices WHERE code = 'EPO'),
 'patent', 'response',
 'Respuesta a comunicación del examinador', 'Examination response',
 'Plazo típico de 4 meses para responder a comunicaciones del examinador.',
 'notification', 4, NULL, false,
 NULL, false, true, 2,
 'EPC Rules', 'https://www.epo.org',
 '2026-01-26', 'EPO Guidelines', '2026-07-01'),

-- Further Processing
('EPO_PT_FURTHER_PROCESSING',
 (SELECT id FROM public.ip_offices WHERE code = 'EPO'),
 'patent', 'restoration',
 'Further processing', 'Further processing',
 'Mecanismo de continuación sin justificación (no aplica a todos los plazos).',
 'missed_deadline', 2, NULL, false,
 NULL, false, false, NULL,
 'EPC Art. 121', 'https://www.epo.org',
 '2026-01-26', 'EPO Guidelines E-VIII', '2026-07-01'),

-- Restitutio in integrum
('EPO_PT_RESTITUTIO',
 (SELECT id FROM public.ip_offices WHERE code = 'EPO'),
 'patent', 'restoration',
 'Restitutio in integrum', 'Re-establishment of rights',
 'Restauración de derechos con demostración de diligencia debida. 2 meses desde cese causa + máx 1 año.',
 'missed_deadline', 2, NULL, false,
 NULL, false, false, NULL,
 'EPC Art. 122', 'https://www.epo.org',
 '2026-01-26', 'EPO Guidelines E-VIII', '2026-07-01'),

-- Opposition
('EPO_PT_OPPOSITION',
 (SELECT id FROM public.ip_offices WHERE code = 'EPO'),
 'patent', 'opposition',
 'Plazo oposición patente europea', 'EP patent opposition period',
 'Período de 9 meses para presentar oposición desde publicación de concesión.',
 'grant_publication', 9, NULL, false,
 NULL, false, false, NULL,
 'EPC Art. 99', 'https://www.epo.org',
 '2026-01-26', 'EPO Official', '2026-07-01'),

-- Appeal
('EPO_PT_APPEAL',
 (SELECT id FROM public.ip_offices WHERE code = 'EPO'),
 'patent', 'response',
 'Plazo de apelación', 'Appeal period',
 'Plazo de 2 meses para presentar recurso + 4 meses para fundamentos.',
 'decision_notification', 2, NULL, false,
 NULL, false, false, NULL,
 'EPC Art. 108', 'https://www.epo.org',
 '2026-01-26', 'EPO Guidelines', '2026-07-01'),

-- National validation
('EPO_PT_VALIDATION',
 (SELECT id FROM public.ip_offices WHERE code = 'EPO'),
 'patent', 'response',
 'Plazo validación nacional', 'National validation deadline',
 'Plazo típico de 3 meses para validar en estados designados tras concesión.',
 'grant', 3, NULL, false,
 NULL, false, false, NULL,
 'EPC Art. 65', 'https://www.epo.org',
 '2026-01-26', 'EPO Guidelines', '2026-07-01')

ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  name_en = EXCLUDED.name_en,
  description = EXCLUDED.description,
  last_verified_at = EXCLUDED.last_verified_at,
  next_review_at = EXCLUDED.next_review_at;

-- USPTO Patent Deadlines
INSERT INTO public.legal_deadlines (
  code, office_id, right_type, deadline_category, name, name_en, description,
  trigger_event, months_offset, years_offset, is_before_event,
  grace_period_months, grace_has_surcharge,
  is_extendable, max_extension_months,
  legal_basis, last_verified_at, verified_source, next_review_at
) VALUES
-- Office Action response
('USPTO_PT_OFFICE_ACTION',
 (SELECT id FROM public.ip_offices WHERE code = 'USPTO'),
 'patent', 'response',
 'Respuesta a Office Action', 'Office Action response',
 'Plazo de 3 meses para responder (extensible hasta 6 meses con tasas).',
 'notification', 3, NULL, false,
 NULL, false, true, 3,
 '37 CFR 1.134', '2026-01-26', 'USPTO MPEP', '2026-07-01'),

-- Maintenance Fee 3.5 years
('USPTO_PT_MAINTENANCE_3_5',
 (SELECT id FROM public.ip_offices WHERE code = 'USPTO'),
 'patent', 'annuity',
 'Maintenance fee (3.5 años)', 'Maintenance fee (3.5 years)',
 'Primera tasa de mantenimiento a los 3.5 años desde concesión.',
 'grant', 42, NULL, false,
 6, true, false, NULL,
 '35 U.S.C. §41(b)', '2026-01-26', 'USPTO Official', '2026-07-01'),

-- Maintenance Fee 7.5 years
('USPTO_PT_MAINTENANCE_7_5',
 (SELECT id FROM public.ip_offices WHERE code = 'USPTO'),
 'patent', 'annuity',
 'Maintenance fee (7.5 años)', 'Maintenance fee (7.5 years)',
 'Segunda tasa de mantenimiento a los 7.5 años desde concesión.',
 'grant', 90, NULL, false,
 6, true, false, NULL,
 '35 U.S.C. §41(b)', '2026-01-26', 'USPTO Official', '2026-07-01'),

-- Maintenance Fee 11.5 years
('USPTO_PT_MAINTENANCE_11_5',
 (SELECT id FROM public.ip_offices WHERE code = 'USPTO'),
 'patent', 'annuity',
 'Maintenance fee (11.5 años)', 'Maintenance fee (11.5 years)',
 'Tercera y última tasa de mantenimiento a los 11.5 años desde concesión.',
 'grant', 138, NULL, false,
 6, true, false, NULL,
 '35 U.S.C. §41(b)', '2026-01-26', 'USPTO Official', '2026-07-01'),

-- Revival
('USPTO_PT_REVIVAL',
 (SELECT id FROM public.ip_offices WHERE code = 'USPTO'),
 'patent', 'restoration',
 'Revival solicitud abandonada', 'Revival of abandoned application',
 'Petition para revivir solicitud abandonada (estándar: unintentional).',
 'abandonment', NULL, NULL, false,
 NULL, false, false, NULL,
 '37 CFR 1.137', '2026-01-26', 'USPTO MPEP', '2026-07-01')

ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  name_en = EXCLUDED.name_en,
  description = EXCLUDED.description,
  last_verified_at = EXCLUDED.last_verified_at,
  next_review_at = EXCLUDED.next_review_at;

-- OEPM Patent Deadlines (Spain)
INSERT INTO public.legal_deadlines (
  code, office_id, right_type, deadline_category, name, name_en, description,
  trigger_event, months_offset, years_offset, is_before_event,
  grace_period_months, grace_has_surcharge,
  legal_basis, last_verified_at, verified_source, next_review_at
) VALUES
('OEPM_PT_ANNUITY_START',
 (SELECT id FROM public.ip_offices WHERE code = 'OEPM'),
 'patent', 'annuity',
 'Inicio pago anualidades', 'Annuity payment start',
 'Anualidades desde el 3er año desde fecha de solicitud.',
 'filing', NULL, 3, false,
 3, true,
 'Ley 24/2015 de Patentes', '2026-01-26', 'OEPM Oficial', '2026-07-01'),

('OEPM_PT_EXAMINATION_REQUEST',
 (SELECT id FROM public.ip_offices WHERE code = 'OEPM'),
 'patent', 'response',
 'Solicitud examen sustantivo', 'Substantive examination request',
 'Plazo para solicitar examen sustantivo.',
 'filing', NULL, 3, false,
 NULL, false,
 'Ley 24/2015', '2026-01-26', 'OEPM Oficial', '2026-07-01'),

('OEPM_PT_OFFICE_ACTION',
 (SELECT id FROM public.ip_offices WHERE code = 'OEPM'),
 'patent', 'response',
 'Respuesta a requerimiento OEPM', 'OEPM Office Action response',
 'Plazo típico de 2 meses para responder a requerimientos.',
 'notification', 2, NULL, false,
 NULL, false,
 'Ley 24/2015', '2026-01-26', 'OEPM Oficial', '2026-07-01')

ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  name_en = EXCLUDED.name_en,
  description = EXCLUDED.description,
  last_verified_at = EXCLUDED.last_verified_at,
  next_review_at = EXCLUDED.next_review_at;

-- PCT/WIPO Patent Deadlines
INSERT INTO public.legal_deadlines (
  code, office_id, right_type, deadline_category, name, name_en, description,
  trigger_event, months_offset, is_before_event,
  legal_basis, last_verified_at, verified_source, next_review_at
) VALUES
('WIPO_PCT_NATIONAL_PHASE',
 (SELECT id FROM public.ip_offices WHERE code = 'WIPO'),
 'patent', 'response',
 'Entrada fase nacional PCT', 'PCT national phase entry',
 'Plazo general de 30/31 meses para entrar en fase nacional.',
 'priority_date', 30, false,
 'PCT Art. 22/39', '2026-01-26', 'WIPO PCT Guide', '2026-07-01'),

('WIPO_PCT_CHAPTER_II',
 (SELECT id FROM public.ip_offices WHERE code = 'WIPO'),
 'patent', 'response',
 'Demanda examen preliminar (Capítulo II)', 'Chapter II demand',
 'Plazo para presentar demanda de examen preliminar internacional.',
 'priority_date', 22, false,
 'PCT Art. 31', '2026-01-26', 'WIPO PCT Guide', '2026-07-01'),

('WIPO_PCT_ISR_RESPONSE',
 (SELECT id FROM public.ip_offices WHERE code = 'WIPO'),
 'patent', 'response',
 'Respuesta a ISR', 'ISR response (Art. 19 amendments)',
 'Plazo para presentar modificaciones según Art. 19.',
 'isr_notification', 2, false,
 'PCT Art. 19', '2026-01-26', 'WIPO PCT Guide', '2026-07-01'),

('WIPO_PCT_PRIORITY_CLAIM',
 (SELECT id FROM public.ip_offices WHERE code = 'WIPO'),
 'patent', 'response',
 'Reivindicación de prioridad', 'Priority claim',
 'Plazo para añadir o corregir reivindicación de prioridad.',
 'filing', 16, false,
 'PCT Rule 26bis', '2026-01-26', 'WIPO PCT Guide', '2026-07-01')

ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  name_en = EXCLUDED.name_en,
  description = EXCLUDED.description,
  last_verified_at = EXCLUDED.last_verified_at,
  next_review_at = EXCLUDED.next_review_at;