-- =============================================
-- Make organization_id nullable for preconfigured global services
-- =============================================

ALTER TABLE service_catalog ALTER COLUMN organization_id DROP NOT NULL;

-- Add preconfigured service fields (columns may already exist from partial migration)
ALTER TABLE service_catalog 
  ADD COLUMN IF NOT EXISTS is_preconfigured BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS preconfigured_code VARCHAR,
  ADD COLUMN IF NOT EXISTS category VARCHAR,
  ADD COLUMN IF NOT EXISTS subcategory VARCHAR,
  ADD COLUMN IF NOT EXISTS includes_official_fees BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS official_fees_note TEXT,
  ADD COLUMN IF NOT EXISTS estimated_duration VARCHAR,
  ADD COLUMN IF NOT EXISTS generates_matter BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS default_matter_type VARCHAR,
  ADD COLUMN IF NOT EXISTS default_matter_subtype VARCHAR,
  ADD COLUMN IF NOT EXISTS applicable_offices TEXT[],
  ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Add unique constraint only if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'service_catalog_preconfigured_code_key'
  ) THEN
    ALTER TABLE service_catalog ADD CONSTRAINT service_catalog_preconfigured_code_key UNIQUE (preconfigured_code);
  END IF;
END $$;

-- Create indexes if not exist
CREATE INDEX IF NOT EXISTS idx_service_catalog_preconfigured ON service_catalog(is_preconfigured) WHERE is_preconfigured = true;
CREATE INDEX IF NOT EXISTS idx_service_catalog_category ON service_catalog(category);

-- =============================================
-- SEED: Trademark Services - Searches
-- =============================================

INSERT INTO service_catalog (
  organization_id, preconfigured_code, name, description, category, subcategory,
  base_price, includes_official_fees, official_fees_note,
  estimated_duration, generates_matter, is_active, is_preconfigured, display_order
) VALUES
(NULL, 'TM_SEARCH_IDENTICAL_ES', 
 'Búsqueda de marca idéntica (España)',
 'Búsqueda de marcas idénticas registradas o solicitadas en España (OEPM). Incluye informe con resultados y recomendaciones.',
 'trademarks', 'searches',
 95.00, false, NULL,
 '24-48 horas', false, false, true, 100),

(NULL, 'TM_SEARCH_SIMILAR_ES',
 'Búsqueda de marca similar (España)',
 'Búsqueda fonética y conceptual de marcas similares en España. Incluye análisis de riesgo de confusión.',
 'trademarks', 'searches',
 195.00, false, NULL,
 '3-5 días', false, false, true, 101),

(NULL, 'TM_SEARCH_IDENTICAL_EU',
 'Búsqueda de marca idéntica (UE)',
 'Búsqueda de marcas idénticas en la base de datos de EUIPO. Incluye informe detallado.',
 'trademarks', 'searches',
 145.00, false, NULL,
 '24-48 horas', false, false, true, 102),

(NULL, 'TM_SEARCH_SIMILAR_EU',
 'Búsqueda de marca similar (UE)',
 'Búsqueda fonética, gráfica y conceptual en UE. Análisis de anterioridades y riesgo.',
 'trademarks', 'searches',
 295.00, false, NULL,
 '5-7 días', false, false, true, 103),

(NULL, 'TM_SEARCH_COMPREHENSIVE',
 'Búsqueda completa (España + UE)',
 'Búsqueda exhaustiva de anterioridades en España y Unión Europea. Incluye informe completo con análisis de riesgos y recomendación estratégica.',
 'trademarks', 'searches',
 450.00, false, NULL,
 '5-7 días', false, false, true, 104),

(NULL, 'TM_SEARCH_INTERNATIONAL',
 'Búsqueda internacional',
 'Búsqueda en múltiples jurisdicciones según necesidades del cliente. Presupuesto según países seleccionados.',
 'trademarks', 'searches',
 0.00, false, 'Precio según países',
 '7-10 días', false, false, true, 105)
ON CONFLICT (preconfigured_code) DO NOTHING;

-- =============================================
-- SEED: Trademark Services - Registration
-- =============================================

INSERT INTO service_catalog (
  organization_id, preconfigured_code, name, description, category, subcategory,
  base_price, includes_official_fees, official_fees_note,
  estimated_duration, generates_matter, default_matter_type, default_matter_subtype,
  applicable_offices, is_active, is_preconfigured, display_order
) VALUES
(NULL, 'TM_REGISTER_ES_1CLASS',
 'Registro de marca España (1 clase)',
 'Solicitud de registro de marca nacional ante la OEPM. Incluye: estudio previo, redacción de solicitud, presentación telemática, seguimiento del expediente hasta resolución.',
 'trademarks', 'registration',
 350.00, true, 'Tasas OEPM: 125,15€ (1 clase)',
 '4-6 meses', true, 'trademark', 'word',
 ARRAY['OEPM'], false, true, 200),

(NULL, 'TM_REGISTER_ES_EXTRA_CLASS',
 'Clase adicional (España)',
 'Clase adicional para registro de marca en España.',
 'trademarks', 'registration',
 75.00, true, 'Tasa OEPM clase extra: 81,89€',
 NULL, false, NULL, NULL,
 ARRAY['OEPM'], false, true, 201),

(NULL, 'TM_REGISTER_EU_1CLASS',
 'Registro de marca UE (1 clase)',
 'Solicitud de Marca de la Unión Europea ante EUIPO. Protección en los 27 estados miembros. Incluye: estudio previo, redacción, presentación y seguimiento.',
 'trademarks', 'registration',
 650.00, true, 'Tasas EUIPO: 850€ (1 clase)',
 '4-6 meses', true, 'trademark', 'word',
 ARRAY['EUIPO'], false, true, 210),

(NULL, 'TM_REGISTER_EU_2ND_CLASS',
 'Segunda clase (UE)',
 'Segunda clase para marca de la Unión Europea.',
 'trademarks', 'registration',
 75.00, true, 'Tasa EUIPO 2ª clase: 50€',
 NULL, false, NULL, NULL,
 ARRAY['EUIPO'], false, true, 211),

(NULL, 'TM_REGISTER_EU_3RD_CLASS',
 'Tercera clase y siguientes (UE)',
 'Tercera clase y cada clase adicional para marca UE.',
 'trademarks', 'registration',
 75.00, true, 'Tasa EUIPO 3ª+ clase: 150€',
 NULL, false, NULL, NULL,
 ARRAY['EUIPO'], false, true, 212),

(NULL, 'TM_REGISTER_WIPO',
 'Registro marca internacional (Madrid)',
 'Solicitud de registro internacional vía Sistema de Madrid (OMPI). Extensión de protección a países seleccionados.',
 'trademarks', 'registration',
 750.00, true, 'Tasas OMPI: según países designados',
 '12-18 meses', true, 'trademark', 'word',
 ARRAY['WIPO'], false, true, 220),

(NULL, 'TM_REGISTER_USA',
 'Registro de marca USA (USPTO)',
 'Solicitud de registro de marca en Estados Unidos. Incluye correspondencia con USPTO y seguimiento hasta registro.',
 'trademarks', 'registration',
 950.00, true, 'Tasas USPTO: desde $250 (TEAS Plus)',
 '8-12 meses', true, 'trademark', 'word',
 ARRAY['USPTO'], false, true, 230)
ON CONFLICT (preconfigured_code) DO NOTHING;

-- =============================================
-- SEED: Trademark Services - Renewals
-- =============================================

INSERT INTO service_catalog (
  organization_id, preconfigured_code, name, description, category, subcategory,
  base_price, includes_official_fees, official_fees_note,
  estimated_duration, generates_matter, applicable_offices,
  is_active, is_preconfigured, display_order
) VALUES
(NULL, 'TM_RENEWAL_ES',
 'Renovación marca España',
 'Renovación de marca nacional por 10 años adicionales. Incluye preparación y presentación de solicitud.',
 'trademarks', 'renewals',
 195.00, true, 'Tasa OEPM renovación: 161,95€',
 '1-2 meses', false, ARRAY['OEPM'], false, true, 300),

(NULL, 'TM_RENEWAL_EU',
 'Renovación marca UE',
 'Renovación de Marca de la Unión Europea por 10 años adicionales.',
 'trademarks', 'renewals',
 295.00, true, 'Tasa EUIPO renovación: desde 850€',
 '1-2 meses', false, ARRAY['EUIPO'], false, true, 301),

(NULL, 'TM_RENEWAL_WIPO',
 'Renovación marca internacional',
 'Renovación de registro internacional vía Sistema de Madrid.',
 'trademarks', 'renewals',
 350.00, true, 'Tasas OMPI: según designaciones',
 '1-3 meses', false, ARRAY['WIPO'], false, true, 302),

(NULL, 'TM_RENEWAL_USA',
 'Renovación marca USA + Declaración uso',
 'Renovación y declaración de uso (Section 8/9) ante USPTO.',
 'trademarks', 'renewals',
 450.00, true, 'Tasas USPTO: según clase',
 '2-4 meses', false, ARRAY['USPTO'], false, true, 303)
ON CONFLICT (preconfigured_code) DO NOTHING;

-- =============================================
-- SEED: Trademark Services - Oppositions & Defense
-- =============================================

INSERT INTO service_catalog (
  organization_id, preconfigured_code, name, description, category, subcategory,
  base_price, includes_official_fees, official_fees_note,
  estimated_duration, generates_matter, default_matter_type, applicable_offices,
  is_active, is_preconfigured, display_order
) VALUES
(NULL, 'TM_OPPOSITION_FILE_ES',
 'Presentar oposición (España)',
 'Redacción y presentación de escrito de oposición contra solicitud de marca de tercero en OEPM.',
 'trademarks', 'oppositions',
 650.00, true, 'Tasa oposición OEPM: 80,94€',
 '2-6 meses', true, 'opposition', ARRAY['OEPM'], false, true, 400),

(NULL, 'TM_OPPOSITION_FILE_EU',
 'Presentar oposición (UE)',
 'Redacción y presentación de oposición ante EUIPO contra marca de tercero.',
 'trademarks', 'oppositions',
 950.00, true, 'Tasa oposición EUIPO: 320€',
 '6-18 meses', true, 'opposition', ARRAY['EUIPO'], false, true, 401),

(NULL, 'TM_OPPOSITION_DEFENSE_ES',
 'Defensa contra oposición (España)',
 'Contestación a oposición presentada contra nuestra solicitud de marca.',
 'trademarks', 'oppositions',
 550.00, false, NULL,
 '2-6 meses', false, NULL, ARRAY['OEPM'], false, true, 410),

(NULL, 'TM_OPPOSITION_DEFENSE_EU',
 'Defensa contra oposición (UE)',
 'Contestación y defensa ante oposición en EUIPO.',
 'trademarks', 'oppositions',
 850.00, false, NULL,
 '6-18 meses', false, NULL, ARRAY['EUIPO'], false, true, 411),

(NULL, 'TM_CANCELLATION_FILE',
 'Solicitud de nulidad/caducidad',
 'Procedimiento de nulidad o caducidad contra marca registrada de tercero.',
 'trademarks', 'oppositions',
 1200.00, true, 'Tasas según oficina',
 '12-24 meses', true, 'cancellation', NULL, false, true, 420)
ON CONFLICT (preconfigured_code) DO NOTHING;

-- =============================================
-- SEED: Trademark Services - Watching
-- =============================================

INSERT INTO service_catalog (
  organization_id, preconfigured_code, name, description, category, subcategory,
  base_price, includes_official_fees, official_fees_note,
  estimated_duration, generates_matter, applicable_offices,
  is_active, is_preconfigured, display_order
) VALUES
(NULL, 'TM_WATCH_ES',
 'Vigilancia de marca (España)',
 'Servicio de vigilancia mensual de nuevas solicitudes similares en España. Informe periódico de alertas.',
 'trademarks', 'watching',
 35.00, false, NULL,
 'Suscripción mensual', false, ARRAY['OEPM'], false, true, 500),

(NULL, 'TM_WATCH_EU',
 'Vigilancia de marca (UE)',
 'Vigilancia de marcas similares en toda la Unión Europea.',
 'trademarks', 'watching',
 55.00, false, NULL,
 'Suscripción mensual', false, ARRAY['EUIPO'], false, true, 501),

(NULL, 'TM_WATCH_INTERNATIONAL',
 'Vigilancia internacional',
 'Vigilancia en múltiples jurisdicciones según selección.',
 'trademarks', 'watching',
 95.00, false, NULL,
 'Suscripción mensual', false, ARRAY['WIPO', 'USPTO', 'CNIPA', 'JPO'], false, true, 502)
ON CONFLICT (preconfigured_code) DO NOTHING;

-- Update applicable_offices for search services
UPDATE service_catalog SET applicable_offices = ARRAY['OEPM'] WHERE preconfigured_code = 'TM_SEARCH_IDENTICAL_ES';
UPDATE service_catalog SET applicable_offices = ARRAY['OEPM'] WHERE preconfigured_code = 'TM_SEARCH_SIMILAR_ES';
UPDATE service_catalog SET applicable_offices = ARRAY['EUIPO'] WHERE preconfigured_code = 'TM_SEARCH_IDENTICAL_EU';
UPDATE service_catalog SET applicable_offices = ARRAY['EUIPO'] WHERE preconfigured_code = 'TM_SEARCH_SIMILAR_EU';
UPDATE service_catalog SET applicable_offices = ARRAY['OEPM', 'EUIPO'] WHERE preconfigured_code = 'TM_SEARCH_COMPREHENSIVE';
UPDATE service_catalog SET applicable_offices = ARRAY['WIPO', 'USPTO', 'CNIPA', 'JPO'] WHERE preconfigured_code = 'TM_SEARCH_INTERNATIONAL';