-- ════════════════════════════════════════════════════════════════════════════
-- PROMPT 4 - PASO 7: Seed data - Plantillas de Servicios IP (corregido)
-- ════════════════════════════════════════════════════════════════════════════

-- Obtener IDs de categorías
DO $$
DECLARE
  v_tm_reg UUID;
  v_tm_renewal UUID;
  v_tm_search UUID;
  v_tm_opposition UUID;
  v_tm_watch UUID;
  v_pt_filing UUID;
  v_pt_prosecution UUID;
  v_pt_maintenance UUID;
  v_ds_reg UUID;
  v_dn_reg UUID;
  v_legal_adv UUID;
  v_litigation UUID;
  v_misc UUID;
BEGIN
  SELECT id INTO v_tm_reg FROM service_categories WHERE code = 'TM_REG';
  SELECT id INTO v_tm_renewal FROM service_categories WHERE code = 'TM_RENEWAL';
  SELECT id INTO v_tm_search FROM service_categories WHERE code = 'TM_SEARCH';
  SELECT id INTO v_tm_opposition FROM service_categories WHERE code = 'TM_OPPOSITION';
  SELECT id INTO v_tm_watch FROM service_categories WHERE code = 'TM_WATCH';
  SELECT id INTO v_pt_filing FROM service_categories WHERE code = 'PT_FILING';
  SELECT id INTO v_pt_prosecution FROM service_categories WHERE code = 'PT_PROSECUTION';
  SELECT id INTO v_pt_maintenance FROM service_categories WHERE code = 'PT_MAINTENANCE';
  SELECT id INTO v_ds_reg FROM service_categories WHERE code = 'DS_REG';
  SELECT id INTO v_dn_reg FROM service_categories WHERE code = 'DN_REG';
  SELECT id INTO v_legal_adv FROM service_categories WHERE code = 'LEGAL_ADV';
  SELECT id INTO v_litigation FROM service_categories WHERE code = 'LITIGATION';
  SELECT id INTO v_misc FROM service_categories WHERE code = 'MISC';

  -- MARCAS REGISTRO
  INSERT INTO service_catalog (preconfigured_code, name, description, service_type, jurisdiction, official_fee, professional_fee, base_price, currency, nice_classes_included, extra_class_fee, estimated_days, generates_matter, default_matter_type, is_preconfigured, is_active, category_id) VALUES
    ('TM_REG_ES_1', 'Registro marca España (1 clase)', 'Solicitud de marca nacional ante OEPM', 'tm_registration', 'ES', 143.15, 450.00, 593.15, 'EUR', 1, 101.81, 90, TRUE, 'trademark', TRUE, TRUE, v_tm_reg),
    ('TM_REG_ES_3', 'Registro marca España (hasta 3 clases)', 'Solicitud de marca nacional ante OEPM', 'tm_registration', 'ES', 346.77, 550.00, 896.77, 'EUR', 3, 101.81, 90, TRUE, 'trademark', TRUE, TRUE, v_tm_reg),
    ('TM_REG_EU_1', 'Registro marca UE (1 clase)', 'Solicitud EUTM ante EUIPO', 'tm_registration', 'EU', 850.00, 650.00, 1500.00, 'EUR', 1, 50.00, 120, TRUE, 'trademark', TRUE, TRUE, v_tm_reg),
    ('TM_REG_EU_2', 'Registro marca UE (2 clases)', 'Solicitud EUTM ante EUIPO', 'tm_registration', 'EU', 900.00, 700.00, 1600.00, 'EUR', 2, 50.00, 120, TRUE, 'trademark', TRUE, TRUE, v_tm_reg),
    ('TM_REG_EU_3', 'Registro marca UE (3 clases)', 'Solicitud EUTM ante EUIPO', 'tm_registration', 'EU', 1050.00, 750.00, 1800.00, 'EUR', 3, 150.00, 120, TRUE, 'trademark', TRUE, TRUE, v_tm_reg),
    ('TM_REG_US_1', 'Registro marca USA (1 clase)', 'Solicitud trademark ante USPTO - TEAS Plus', 'tm_registration', 'US', 250.00, 850.00, 1100.00, 'USD', 1, 250.00, 180, TRUE, 'trademark', TRUE, TRUE, v_tm_reg),
    ('TM_REG_US_ITU', 'Registro marca USA (Intent-to-Use)', 'Solicitud ITU ante USPTO', 'tm_registration', 'US', 250.00, 950.00, 1200.00, 'USD', 1, 250.00, 240, TRUE, 'trademark', TRUE, TRUE, v_tm_reg),
    ('TM_REG_GB_1', 'Registro marca UK (1 clase)', 'Solicitud trademark ante UKIPO', 'tm_registration', 'GB', 170.00, 500.00, 670.00, 'GBP', 1, 50.00, 90, TRUE, 'trademark', TRUE, TRUE, v_tm_reg),
    ('TM_REG_CN_1', 'Registro marca China (1 clase)', 'Solicitud trademark ante CNIPA', 'tm_registration', 'CN', 270.00, 600.00, 870.00, 'USD', 1, 270.00, 365, TRUE, 'trademark', TRUE, TRUE, v_tm_reg),
    ('TM_REG_WO', 'Registro marca Internacional Madrid', 'Solicitud internacional vía Protocolo Madrid', 'tm_registration', 'WO', 653.00, 850.00, 1503.00, 'CHF', 1, 100.00, 180, TRUE, 'trademark', TRUE, TRUE, v_tm_reg),
    ('TM_REG_WO_EU', 'Designación UE en marca Madrid', 'Designación posterior UE vía Madrid', 'tm_registration', 'WO', 897.00, 400.00, 1297.00, 'CHF', 1, 0, 120, TRUE, 'trademark', TRUE, TRUE, v_tm_reg),
    ('TM_REG_JP_1', 'Registro marca Japón (1 clase)', 'Solicitud trademark ante JPO', 'tm_registration', 'JP', 12000.00, 750.00, 12750.00, 'JPY', 1, 8600.00, 365, TRUE, 'trademark', TRUE, TRUE, v_tm_reg),
    ('TM_REG_KR_1', 'Registro marca Corea (1 clase)', 'Solicitud trademark ante KIPO', 'tm_registration', 'KR', 210.00, 600.00, 810.00, 'USD', 1, 210.00, 300, TRUE, 'trademark', TRUE, TRUE, v_tm_reg),
    ('TM_REG_MX_1', 'Registro marca México (1 clase)', 'Solicitud trademark ante IMPI', 'tm_registration', 'MX', 2800.00, 500.00, 3300.00, 'MXN', 1, 2800.00, 180, TRUE, 'trademark', TRUE, TRUE, v_tm_reg),
    ('TM_REG_BR_1', 'Registro marca Brasil (1 clase)', 'Solicitud trademark ante INPI Brasil', 'tm_registration', 'BR', 355.00, 600.00, 955.00, 'BRL', 1, 355.00, 365, TRUE, 'trademark', TRUE, TRUE, v_tm_reg)
  ON CONFLICT (preconfigured_code) WHERE preconfigured_code IS NOT NULL DO NOTHING;

  -- MARCAS RENOVACIÓN
  INSERT INTO service_catalog (preconfigured_code, name, description, service_type, jurisdiction, official_fee, professional_fee, base_price, currency, nice_classes_included, extra_class_fee, estimated_days, generates_matter, is_preconfigured, is_active, category_id) VALUES
    ('TM_REN_ES', 'Renovación marca España', 'Renovación marca nacional OEPM (10 años)', 'tm_renewal', 'ES', 169.64, 200.00, 369.64, 'EUR', 1, 101.81, 30, FALSE, TRUE, TRUE, v_tm_renewal),
    ('TM_REN_EU', 'Renovación marca UE', 'Renovación EUTM ante EUIPO (10 años)', 'tm_renewal', 'EU', 850.00, 300.00, 1150.00, 'EUR', 1, 50.00, 30, FALSE, TRUE, TRUE, v_tm_renewal),
    ('TM_REN_US', 'Renovación marca USA', 'Renovación trademark USPTO (Sec. 8 & 9)', 'tm_renewal', 'US', 525.00, 400.00, 925.00, 'USD', 1, 0, 30, FALSE, TRUE, TRUE, v_tm_renewal),
    ('TM_REN_GB', 'Renovación marca UK', 'Renovación trademark UKIPO (10 años)', 'tm_renewal', 'GB', 200.00, 200.00, 400.00, 'GBP', 1, 50.00, 30, FALSE, TRUE, TRUE, v_tm_renewal),
    ('TM_REN_WO', 'Renovación marca Internacional', 'Renovación registro Madrid (10 años)', 'tm_renewal', 'WO', 653.00, 350.00, 1003.00, 'CHF', 1, 0, 30, FALSE, TRUE, TRUE, v_tm_renewal),
    ('TM_REN_CN', 'Renovación marca China', 'Renovación trademark CNIPA (10 años)', 'tm_renewal', 'CN', 450.00, 350.00, 800.00, 'USD', 1, 0, 45, FALSE, TRUE, TRUE, v_tm_renewal),
    ('TM_REN_JP', 'Renovación marca Japón', 'Renovación trademark JPO (10 años)', 'tm_renewal', 'JP', 38800.00, 400.00, 39200.00, 'JPY', 1, 0, 30, FALSE, TRUE, TRUE, v_tm_renewal)
  ON CONFLICT (preconfigured_code) WHERE preconfigured_code IS NOT NULL DO NOTHING;

  -- MARCAS BÚSQUEDAS
  INSERT INTO service_catalog (preconfigured_code, name, description, service_type, jurisdiction, official_fee, professional_fee, base_price, currency, estimated_days, generates_matter, is_preconfigured, is_active, category_id) VALUES
    ('TM_SEARCH_ES', 'Búsqueda marca España', 'Búsqueda de anterioridades OEPM', 'tm_search', 'ES', 0, 250.00, 250.00, 'EUR', 3, FALSE, TRUE, TRUE, v_tm_search),
    ('TM_SEARCH_EU', 'Búsqueda marca UE', 'Búsqueda anterioridades EUIPO + nacionales', 'tm_search', 'EU', 0, 450.00, 450.00, 'EUR', 5, FALSE, TRUE, TRUE, v_tm_search),
    ('TM_SEARCH_US', 'Búsqueda marca USA', 'Búsqueda federal + state USPTO', 'tm_search', 'US', 0, 550.00, 550.00, 'USD', 5, FALSE, TRUE, TRUE, v_tm_search),
    ('TM_SEARCH_WO', 'Búsqueda marca Internacional', 'Búsqueda global multi-jurisdicción', 'tm_search', 'WO', 0, 850.00, 850.00, 'EUR', 7, FALSE, TRUE, TRUE, v_tm_search),
    ('TM_SEARCH_FULL', 'Búsqueda completa + informe', 'Búsqueda exhaustiva con opinión legal', 'tm_search', NULL, 0, 950.00, 950.00, 'EUR', 10, FALSE, TRUE, TRUE, v_tm_search),
    ('TM_SEARCH_IDENT', 'Búsqueda de marca idéntica', 'Búsqueda rápida de marcas idénticas', 'tm_search', NULL, 0, 150.00, 150.00, 'EUR', 1, FALSE, TRUE, TRUE, v_tm_search),
    ('TM_SEARCH_PHONETIC', 'Búsqueda fonética', 'Búsqueda de similitud fonética', 'tm_search', NULL, 0, 350.00, 350.00, 'EUR', 5, FALSE, TRUE, TRUE, v_tm_search)
  ON CONFLICT (preconfigured_code) WHERE preconfigured_code IS NOT NULL DO NOTHING;

  -- MARCAS OPOSICIONES
  INSERT INTO service_catalog (preconfigured_code, name, description, service_type, jurisdiction, official_fee, professional_fee, base_price, currency, estimated_days, generates_matter, is_preconfigured, is_active, category_id) VALUES
    ('TM_OPP_ES_FILE', 'Presentar oposición España', 'Escrito de oposición ante OEPM', 'tm_opposition', 'ES', 106.68, 950.00, 1056.68, 'EUR', 60, TRUE, TRUE, TRUE, v_tm_opposition),
    ('TM_OPP_ES_DEF', 'Defender oposición España', 'Contestación a oposición OEPM', 'tm_opposition', 'ES', 0, 850.00, 850.00, 'EUR', 30, FALSE, TRUE, TRUE, v_tm_opposition),
    ('TM_OPP_EU_FILE', 'Presentar oposición UE', 'Escrito de oposición ante EUIPO', 'tm_opposition', 'EU', 320.00, 1500.00, 1820.00, 'EUR', 90, TRUE, TRUE, TRUE, v_tm_opposition),
    ('TM_OPP_EU_DEF', 'Defender oposición UE', 'Contestación a oposición EUIPO', 'tm_opposition', 'EU', 0, 1350.00, 1350.00, 'EUR', 60, FALSE, TRUE, TRUE, v_tm_opposition),
    ('TM_OPP_US_FILE', 'Presentar oposición USA', 'Oposición ante TTAB', 'tm_opposition', 'US', 600.00, 2500.00, 3100.00, 'USD', 180, TRUE, TRUE, TRUE, v_tm_opposition),
    ('TM_OPP_US_DEF', 'Defender oposición USA', 'Defensa ante TTAB', 'tm_opposition', 'US', 0, 2200.00, 2200.00, 'USD', 120, FALSE, TRUE, TRUE, v_tm_opposition),
    ('TM_CANC_ES', 'Nulidad/Caducidad España', 'Acción de nulidad o caducidad OEPM', 'tm_opposition', 'ES', 106.68, 1200.00, 1306.68, 'EUR', 180, TRUE, TRUE, TRUE, v_tm_opposition),
    ('TM_CANC_EU', 'Nulidad/Caducidad UE', 'Acción de nulidad o caducidad EUIPO', 'tm_opposition', 'EU', 630.00, 1800.00, 2430.00, 'EUR', 180, TRUE, TRUE, TRUE, v_tm_opposition)
  ON CONFLICT (preconfigured_code) WHERE preconfigured_code IS NOT NULL DO NOTHING;

  -- MARCAS VIGILANCIA
  INSERT INTO service_catalog (preconfigured_code, name, description, service_type, jurisdiction, official_fee, professional_fee, base_price, currency, estimated_days, generates_matter, is_preconfigured, is_active, category_id) VALUES
    ('TM_WATCH_ES', 'Vigilancia marca España', 'Servicio anual vigilancia OEPM', 'tm_watch', 'ES', 0, 350.00, 350.00, 'EUR', 365, FALSE, TRUE, TRUE, v_tm_watch),
    ('TM_WATCH_EU', 'Vigilancia marca UE', 'Servicio anual vigilancia EUIPO', 'tm_watch', 'EU', 0, 450.00, 450.00, 'EUR', 365, FALSE, TRUE, TRUE, v_tm_watch),
    ('TM_WATCH_GLOBAL', 'Vigilancia marca Global', 'Vigilancia multi-jurisdicción (10 países)', 'tm_watch', NULL, 0, 1200.00, 1200.00, 'EUR', 365, FALSE, TRUE, TRUE, v_tm_watch),
    ('TM_WATCH_DOMAIN', 'Vigilancia dominios', 'Vigilancia de dominios similares', 'tm_watch', NULL, 0, 450.00, 450.00, 'EUR', 365, FALSE, TRUE, TRUE, v_tm_watch),
    ('TM_WATCH_SOCIAL', 'Vigilancia redes sociales', 'Vigilancia de uso en redes sociales', 'tm_watch', NULL, 0, 550.00, 550.00, 'EUR', 365, FALSE, TRUE, TRUE, v_tm_watch)
  ON CONFLICT (preconfigured_code) WHERE preconfigured_code IS NOT NULL DO NOTHING;

  -- PATENTES FILING
  INSERT INTO service_catalog (preconfigured_code, name, description, service_type, jurisdiction, official_fee, professional_fee, base_price, currency, estimated_days, generates_matter, default_matter_type, is_preconfigured, is_active, category_id) VALUES
    ('PT_FILE_ES', 'Solicitud patente España', 'Redacción y presentación ante OEPM', 'pt_filing', 'ES', 102.98, 3500.00, 3602.98, 'EUR', 30, TRUE, 'patent', TRUE, TRUE, v_pt_filing),
    ('PT_FILE_ES_UM', 'Solicitud modelo utilidad España', 'Redacción y presentación modelo utilidad OEPM', 'pt_filing', 'ES', 51.49, 2500.00, 2551.49, 'EUR', 30, TRUE, 'patent', TRUE, TRUE, v_pt_filing),
    ('PT_FILE_EP', 'Solicitud patente europea', 'Redacción y filing ante EPO', 'pt_filing', 'EP', 1420.00, 6500.00, 7920.00, 'EUR', 60, TRUE, 'patent', TRUE, TRUE, v_pt_filing),
    ('PT_FILE_PCT', 'Solicitud PCT internacional', 'Redacción y filing internacional', 'pt_filing', 'PCT', 1562.00, 5500.00, 7062.00, 'CHF', 60, TRUE, 'patent', TRUE, TRUE, v_pt_filing),
    ('PT_FILE_US_PROV', 'Solicitud provisional USA', 'Provisional application USPTO', 'pt_filing', 'US', 320.00, 2500.00, 2820.00, 'USD', 30, TRUE, 'patent', TRUE, TRUE, v_pt_filing),
    ('PT_FILE_US', 'Solicitud patente USA', 'Non-provisional application USPTO', 'pt_filing', 'US', 1720.00, 7500.00, 9220.00, 'USD', 60, TRUE, 'patent', TRUE, TRUE, v_pt_filing),
    ('PT_FILE_CN', 'Solicitud patente China', 'Patente de invención CNIPA', 'pt_filing', 'CN', 900.00, 4500.00, 5400.00, 'USD', 60, TRUE, 'patent', TRUE, TRUE, v_pt_filing),
    ('PT_FILE_JP', 'Solicitud patente Japón', 'Patente ante JPO', 'pt_filing', 'JP', 15000.00, 5500.00, 20500.00, 'JPY', 60, TRUE, 'patent', TRUE, TRUE, v_pt_filing)
  ON CONFLICT (preconfigured_code) WHERE preconfigured_code IS NOT NULL DO NOTHING;

  -- PATENTES TRAMITACIÓN
  INSERT INTO service_catalog (preconfigured_code, name, description, service_type, jurisdiction, official_fee, professional_fee, base_price, currency, estimated_days, generates_matter, is_preconfigured, is_active, category_id) VALUES
    ('PT_PROS_ES_OA', 'Respuesta requerimiento ES', 'Contestación office action OEPM', 'pt_prosecution', 'ES', 0, 850.00, 850.00, 'EUR', 30, FALSE, TRUE, TRUE, v_pt_prosecution),
    ('PT_PROS_EP_OA', 'Respuesta requerimiento EPO', 'Contestación office action EPO', 'pt_prosecution', 'EP', 0, 1500.00, 1500.00, 'EUR', 30, FALSE, TRUE, TRUE, v_pt_prosecution),
    ('PT_PROS_US_OA', 'Respuesta office action USA', 'Response to USPTO office action', 'pt_prosecution', 'US', 0, 1800.00, 1800.00, 'USD', 30, FALSE, TRUE, TRUE, v_pt_prosecution),
    ('PT_PROS_EP_EXAM', 'Solicitud examen EP', 'Request for examination EPO', 'pt_prosecution', 'EP', 1965.00, 500.00, 2465.00, 'EUR', 14, FALSE, TRUE, TRUE, v_pt_prosecution),
    ('PT_PROS_PCT_31', 'Entrada fase nacional (31 meses)', 'National phase entry from PCT', 'pt_prosecution', 'PCT', 0, 1500.00, 1500.00, 'EUR', 14, TRUE, TRUE, TRUE, v_pt_prosecution),
    ('PT_PROS_EP_VAL', 'Validación patente EP', 'Validation in designated state', 'pt_prosecution', 'EP', 0, 800.00, 800.00, 'EUR', 90, TRUE, TRUE, TRUE, v_pt_prosecution)
  ON CONFLICT (preconfigured_code) WHERE preconfigured_code IS NOT NULL DO NOTHING;

  -- PATENTES MANTENIMIENTO
  INSERT INTO service_catalog (preconfigured_code, name, description, service_type, jurisdiction, official_fee, professional_fee, base_price, currency, estimated_days, generates_matter, is_preconfigured, is_active, category_id) VALUES
    ('PT_ANN_ES', 'Anualidad patente España', 'Pago anualidad OEPM', 'pt_maintenance', 'ES', 25.00, 100.00, 125.00, 'EUR', 7, FALSE, TRUE, TRUE, v_pt_maintenance),
    ('PT_ANN_EP', 'Anualidad patente EP', 'Pago anualidad EPO', 'pt_maintenance', 'EP', 495.00, 150.00, 645.00, 'EUR', 7, FALSE, TRUE, TRUE, v_pt_maintenance),
    ('PT_MAINT_US_4', 'Maintenance fee USA (3.5 años)', 'USPTO maintenance fee - 1st window', 'pt_maintenance', 'US', 1600.00, 200.00, 1800.00, 'USD', 7, FALSE, TRUE, TRUE, v_pt_maintenance),
    ('PT_MAINT_US_8', 'Maintenance fee USA (7.5 años)', 'USPTO maintenance fee - 2nd window', 'pt_maintenance', 'US', 3600.00, 200.00, 3800.00, 'USD', 7, FALSE, TRUE, TRUE, v_pt_maintenance),
    ('PT_MAINT_US_12', 'Maintenance fee USA (11.5 años)', 'USPTO maintenance fee - 3rd window', 'pt_maintenance', 'US', 7400.00, 200.00, 7600.00, 'USD', 7, FALSE, TRUE, TRUE, v_pt_maintenance)
  ON CONFLICT (preconfigured_code) WHERE preconfigured_code IS NOT NULL DO NOTHING;

  -- DISEÑOS (todos con misma estructura)
  INSERT INTO service_catalog (preconfigured_code, name, description, service_type, jurisdiction, official_fee, professional_fee, base_price, currency, estimated_days, generates_matter, default_matter_type, is_preconfigured, is_active, category_id) VALUES
    ('DS_REG_ES', 'Registro diseño España', 'Solicitud diseño industrial OEPM', 'ds_registration', 'ES', 91.30, 600.00, 691.30, 'EUR', 60, TRUE, 'design', TRUE, TRUE, v_ds_reg),
    ('DS_REG_EU', 'Registro diseño UE', 'Solicitud RCD ante EUIPO', 'ds_registration', 'EU', 350.00, 750.00, 1100.00, 'EUR', 30, TRUE, 'design', TRUE, TRUE, v_ds_reg),
    ('DS_REG_EU_MULT', 'Diseño UE múltiple (hasta 10)', 'Solicitud RCD múltiple EUIPO', 'ds_registration', 'EU', 350.00, 1200.00, 1550.00, 'EUR', 30, TRUE, 'design', TRUE, TRUE, v_ds_reg),
    ('DS_REG_WO', 'Registro diseño La Haya', 'Solicitud internacional WIPO Hague', 'ds_registration', 'WO', 397.00, 950.00, 1347.00, 'CHF', 90, TRUE, 'design', TRUE, TRUE, v_ds_reg)
  ON CONFLICT (preconfigured_code) WHERE preconfigured_code IS NOT NULL DO NOTHING;

  -- DISEÑOS RENOVACIÓN (separado)
  INSERT INTO service_catalog (preconfigured_code, name, description, service_type, jurisdiction, official_fee, professional_fee, base_price, currency, estimated_days, generates_matter, is_preconfigured, is_active, category_id) VALUES
    ('DS_REN_ES', 'Renovación diseño España', 'Renovación quinquenal OEPM', 'ds_renewal', 'ES', 91.30, 150.00, 241.30, 'EUR', 14, FALSE, TRUE, TRUE, v_ds_reg),
    ('DS_REN_EU', 'Renovación diseño UE', 'Renovación quinquenal EUIPO', 'ds_renewal', 'EU', 90.00, 200.00, 290.00, 'EUR', 14, FALSE, TRUE, TRUE, v_ds_reg)
  ON CONFLICT (preconfigured_code) WHERE preconfigured_code IS NOT NULL DO NOTHING;

  -- DOMINIOS
  INSERT INTO service_catalog (preconfigured_code, name, description, service_type, jurisdiction, official_fee, professional_fee, base_price, currency, estimated_days, generates_matter, default_matter_type, is_preconfigured, is_active, category_id) VALUES
    ('DN_REG_ES', 'Registro dominio .es', 'Registro y gestión dominio .es', 'domain_registration', 'ES', 7.00, 50.00, 57.00, 'EUR', 1, TRUE, 'domain', TRUE, TRUE, v_dn_reg),
    ('DN_REG_COM', 'Registro dominio .com', 'Registro y gestión dominio .com', 'domain_registration', NULL, 12.00, 50.00, 62.00, 'USD', 1, TRUE, 'domain', TRUE, TRUE, v_dn_reg),
    ('DN_REG_EU', 'Registro dominio .eu', 'Registro y gestión dominio .eu', 'domain_registration', 'EU', 5.00, 50.00, 55.00, 'EUR', 1, TRUE, 'domain', TRUE, TRUE, v_dn_reg),
    ('DN_UDRP', 'Procedimiento UDRP', 'Reclamación de dominio WIPO', 'domain_dispute', NULL, 1500.00, 3500.00, 5000.00, 'USD', 60, TRUE, 'domain', TRUE, TRUE, v_dn_reg),
    ('DN_URS', 'Procedimiento URS', 'Uniform Rapid Suspension', 'domain_dispute', NULL, 375.00, 1500.00, 1875.00, 'USD', 30, TRUE, 'domain', TRUE, TRUE, v_dn_reg)
  ON CONFLICT (preconfigured_code) WHERE preconfigured_code IS NOT NULL DO NOTHING;

  -- ASESORÍA LEGAL
  INSERT INTO service_catalog (preconfigured_code, name, description, service_type, jurisdiction, official_fee, professional_fee, base_price, currency, estimated_days, generates_matter, is_preconfigured, is_active, category_id) VALUES
    ('ADV_CONSULT', 'Consulta asesoramiento PI', 'Consulta legal propiedad intelectual', 'legal_consulting', NULL, 0, 250.00, 250.00, 'EUR', 1, FALSE, TRUE, TRUE, v_legal_adv),
    ('ADV_OPINION', 'Informe jurídico', 'Opinión legal detallada', 'legal_consulting', NULL, 0, 750.00, 750.00, 'EUR', 7, FALSE, TRUE, TRUE, v_legal_adv),
    ('ADV_STRATEGY', 'Estrategia de protección', 'Plan estratégico protección PI', 'legal_consulting', NULL, 0, 1500.00, 1500.00, 'EUR', 14, FALSE, TRUE, TRUE, v_legal_adv),
    ('ADV_PORTFOLIO', 'Auditoría de portfolio', 'Revisión completa activos PI', 'legal_consulting', NULL, 0, 2500.00, 2500.00, 'EUR', 30, FALSE, TRUE, TRUE, v_legal_adv),
    ('ADV_LICENSE', 'Redacción contrato licencia', 'Contrato de licencia de PI', 'legal_consulting', NULL, 0, 1800.00, 1800.00, 'EUR', 14, FALSE, TRUE, TRUE, v_legal_adv),
    ('ADV_ASSIGN', 'Redacción contrato cesión', 'Contrato de cesión de PI', 'legal_consulting', NULL, 0, 1200.00, 1200.00, 'EUR', 10, FALSE, TRUE, TRUE, v_legal_adv),
    ('ADV_COEXIST', 'Acuerdo de coexistencia', 'Negociación y redacción coexistencia', 'legal_consulting', NULL, 0, 1500.00, 1500.00, 'EUR', 14, FALSE, TRUE, TRUE, v_legal_adv),
    ('ADV_FREEDOM', 'Informe Freedom to Operate', 'Análisis FTO patentes', 'legal_consulting', NULL, 0, 3500.00, 3500.00, 'EUR', 21, FALSE, TRUE, TRUE, v_legal_adv),
    ('ADV_VALIDITY', 'Informe de validez', 'Análisis de validez patente/marca', 'legal_consulting', NULL, 0, 2000.00, 2000.00, 'EUR', 14, FALSE, TRUE, TRUE, v_legal_adv)
  ON CONFLICT (preconfigured_code) WHERE preconfigured_code IS NOT NULL DO NOTHING;

  -- LITIGIOS
  INSERT INTO service_catalog (preconfigured_code, name, description, service_type, jurisdiction, official_fee, professional_fee, base_price, currency, estimated_days, generates_matter, is_preconfigured, is_active, category_id) VALUES
    ('LIT_INFR_ES', 'Acción por infracción ES', 'Demanda infracción PI tribunales españoles', 'litigation', 'ES', 0, 8500.00, 8500.00, 'EUR', 365, TRUE, TRUE, TRUE, v_litigation),
    ('LIT_INFR_EU', 'Acción ante UPC', 'Procedimiento Unified Patent Court', 'litigation', 'EU', 0, 25000.00, 25000.00, 'EUR', 365, TRUE, TRUE, TRUE, v_litigation),
    ('LIT_CEASE', 'Carta cease & desist', 'Requerimiento extrajudicial cesación', 'litigation', NULL, 0, 750.00, 750.00, 'EUR', 7, FALSE, TRUE, TRUE, v_litigation),
    ('LIT_CUSTOMS', 'Vigilancia aduanera', 'Solicitud intervención aduanas', 'litigation', 'EU', 0, 500.00, 500.00, 'EUR', 30, FALSE, TRUE, TRUE, v_litigation),
    ('LIT_MEDIATION', 'Mediación PI', 'Procedimiento de mediación OMPI/EUIPO', 'litigation', NULL, 0, 3500.00, 3500.00, 'EUR', 90, FALSE, TRUE, TRUE, v_litigation)
  ON CONFLICT (preconfigured_code) WHERE preconfigured_code IS NOT NULL DO NOTHING;

  -- SERVICIOS VARIOS
  INSERT INTO service_catalog (preconfigured_code, name, description, service_type, jurisdiction, official_fee, professional_fee, base_price, currency, estimated_days, generates_matter, is_preconfigured, is_active, category_id) VALUES
    ('MISC_RECORDAL', 'Inscripción registral', 'Inscripción de cambios en registros', 'recordal', NULL, 0, 250.00, 250.00, 'EUR', 14, FALSE, TRUE, TRUE, v_misc),
    ('MISC_CERT', 'Certificado oficial', 'Obtención de certificado de registro', 'certification', NULL, 50.00, 100.00, 150.00, 'EUR', 7, FALSE, TRUE, TRUE, v_misc),
    ('MISC_LEGALIZATION', 'Legalización documentos', 'Apostilla/Legalización consular', 'legalization', NULL, 30.00, 150.00, 180.00, 'EUR', 14, FALSE, TRUE, TRUE, v_misc),
    ('MISC_TRANSLATION', 'Traducción jurada', 'Traducción certificada por página', 'translation', NULL, 0, 45.00, 45.00, 'EUR', 5, FALSE, TRUE, TRUE, v_misc),
    ('MISC_POA', 'Poder de representación', 'Preparación y tramitación poder', 'administrative', NULL, 0, 150.00, 150.00, 'EUR', 7, FALSE, TRUE, TRUE, v_misc),
    ('MISC_ASSIGN_REC', 'Inscripción cesión', 'Registro de cesión en oficina', 'recordal', NULL, 100.00, 200.00, 300.00, 'EUR', 30, FALSE, TRUE, TRUE, v_misc),
    ('MISC_LICENSE_REC', 'Inscripción licencia', 'Registro de licencia en oficina', 'recordal', NULL, 100.00, 200.00, 300.00, 'EUR', 30, FALSE, TRUE, TRUE, v_misc),
    ('MISC_NAME_CHANGE', 'Cambio de nombre/dirección', 'Inscripción cambio titular', 'recordal', NULL, 50.00, 150.00, 200.00, 'EUR', 21, FALSE, TRUE, TRUE, v_misc)
  ON CONFLICT (preconfigured_code) WHERE preconfigured_code IS NOT NULL DO NOTHING;

END $$;