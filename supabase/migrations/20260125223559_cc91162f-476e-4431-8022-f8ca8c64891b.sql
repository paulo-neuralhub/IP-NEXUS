-- =============================================
-- SEED: Trademark Services - Modifications & Contracts
-- =============================================

INSERT INTO service_catalog (
  organization_id, preconfigured_code, name, description, category, subcategory,
  base_price, includes_official_fees, official_fees_note,
  estimated_duration, generates_matter,
  is_active, is_preconfigured, display_order
) VALUES
(NULL, 'TM_CHANGE_OWNER',
 'Cambio de titularidad',
 'Inscripción de cambio de titular de la marca (cesión, fusión, etc.).',
 'trademarks', 'modifications',
 195.00, true, 'Tasas según oficina',
 '1-3 meses', false, false, true, 600),

(NULL, 'TM_CHANGE_NAME',
 'Cambio de nombre/dirección',
 'Inscripción de cambio de nombre o domicilio del titular.',
 'trademarks', 'modifications',
 145.00, true, 'Tasas según oficina',
 '1-2 meses', false, false, true, 601),

(NULL, 'TM_LICENSE_REGISTER',
 'Inscripción de licencia',
 'Inscripción de contrato de licencia de marca en el registro.',
 'trademarks', 'modifications',
 250.00, true, 'Tasas según oficina',
 '1-3 meses', false, false, true, 602),

(NULL, 'TM_ASSIGNMENT_DRAFT',
 'Contrato de cesión de marca',
 'Redacción de contrato de cesión/transmisión de marca.',
 'trademarks', 'contracts',
 450.00, false, NULL,
 '3-5 días', false, false, true, 610),

(NULL, 'TM_LICENSE_DRAFT',
 'Contrato de licencia de marca',
 'Redacción de contrato de licencia de marca (exclusiva/no exclusiva).',
 'trademarks', 'contracts',
 550.00, false, NULL,
 '5-7 días', false, false, true, 611),

(NULL, 'TM_COEXISTENCE_AGREEMENT',
 'Acuerdo de coexistencia',
 'Negociación y redacción de acuerdo de coexistencia de marcas.',
 'trademarks', 'contracts',
 750.00, false, NULL,
 '1-4 semanas', false, false, true, 612)
ON CONFLICT (preconfigured_code) DO NOTHING;

-- =============================================
-- SEED: Patent Services - Searches
-- =============================================

INSERT INTO service_catalog (
  organization_id, preconfigured_code, name, description, category, subcategory,
  base_price, includes_official_fees, official_fees_note,
  estimated_duration, generates_matter,
  is_active, is_preconfigured, display_order
) VALUES
(NULL, 'PT_SEARCH_PATENTABILITY',
 'Búsqueda de patentabilidad',
 'Búsqueda del estado de la técnica para evaluar novedad y actividad inventiva. Informe con análisis y recomendación.',
 'patents', 'searches',
 650.00, false, NULL,
 '5-10 días', false, false, true, 1000),

(NULL, 'PT_SEARCH_FREEDOM',
 'Informe de libertad de operación (FTO)',
 'Análisis de patentes en vigor que podrían afectar a un producto/proceso. Evaluación de riesgos de infracción.',
 'patents', 'searches',
 1200.00, false, NULL,
 '2-3 semanas', false, false, true, 1001),

(NULL, 'PT_SEARCH_VALIDITY',
 'Búsqueda de validez',
 'Búsqueda de anterioridades para evaluar la validez de una patente de tercero.',
 'patents', 'searches',
 950.00, false, NULL,
 '1-2 semanas', false, false, true, 1002)
ON CONFLICT (preconfigured_code) DO NOTHING;

-- =============================================
-- SEED: Patent Services - Registration
-- =============================================

INSERT INTO service_catalog (
  organization_id, preconfigured_code, name, description, category, subcategory,
  base_price, includes_official_fees, official_fees_note,
  estimated_duration, generates_matter, default_matter_type,
  applicable_offices, is_active, is_preconfigured, display_order
) VALUES
(NULL, 'PT_REGISTER_ES',
 'Solicitud de patente España',
 'Redacción y presentación de solicitud de patente nacional ante OEPM. Incluye memoria descriptiva, reivindicaciones y seguimiento.',
 'patents', 'registration',
 2500.00, true, 'Tasas OEPM: desde 657,98€',
 '3-5 años', true, 'patent',
 ARRAY['OEPM'], false, true, 1100),

(NULL, 'PT_REGISTER_EU',
 'Solicitud de patente europea (EPO)',
 'Redacción y presentación de solicitud de patente europea. Tramitación ante la Oficina Europea de Patentes.',
 'patents', 'registration',
 4500.00, true, 'Tasas EPO: desde 1.775€',
 '3-5 años', true, 'patent',
 ARRAY['EPO'], false, true, 1110),

(NULL, 'PT_REGISTER_PCT',
 'Solicitud PCT internacional',
 'Solicitud internacional vía PCT. Permite reservar derechos en múltiples países.',
 'patents', 'registration',
 3500.00, true, 'Tasas OMPI: desde 1.330€',
 '30-31 meses (fase nacional)', true, 'patent',
 ARRAY['WIPO'], false, true, 1120),

(NULL, 'PT_VALIDATION_EU',
 'Validación patente europea',
 'Validación de patente europea concedida en país designado.',
 'patents', 'registration',
 450.00, true, 'Tasas según país',
 '1-3 meses', false, NULL,
 NULL, false, true, 1130),

(NULL, 'PT_PHASE_NATIONAL',
 'Entrada en fase nacional PCT',
 'Entrada en fase nacional desde solicitud PCT en país seleccionado.',
 'patents', 'registration',
 850.00, true, 'Tasas según país',
 '2-4 años', true, 'patent',
 NULL, false, true, 1140)
ON CONFLICT (preconfigured_code) DO NOTHING;

-- =============================================
-- SEED: Patent Services - Maintenance
-- =============================================

INSERT INTO service_catalog (
  organization_id, preconfigured_code, name, description, category, subcategory,
  base_price, includes_official_fees, official_fees_note,
  estimated_duration, generates_matter,
  is_active, is_preconfigured, display_order
) VALUES
(NULL, 'PT_ANNUITY_ES',
 'Anualidad patente España',
 'Pago de anualidad para mantenimiento de patente española.',
 'patents', 'maintenance',
 95.00, true, 'Tasa anualidad: según año',
 '1-2 semanas', false, false, true, 1200),

(NULL, 'PT_ANNUITY_EU',
 'Anualidad patente europea',
 'Pago de anualidad de patente europea validada.',
 'patents', 'maintenance',
 145.00, true, 'Tasa: según país y año',
 '1-2 semanas', false, false, true, 1201),

(NULL, 'PT_ANNUITY_MANAGEMENT',
 'Gestión integral de anualidades',
 'Servicio de gestión y pago de todas las anualidades de la cartera de patentes.',
 'patents', 'maintenance',
 0.00, false, 'Según cartera',
 'Continuo', false, false, true, 1210)
ON CONFLICT (preconfigured_code) DO NOTHING;

-- =============================================
-- SEED: Patent Services - Oppositions & Litigation
-- =============================================

INSERT INTO service_catalog (
  organization_id, preconfigured_code, name, description, category, subcategory,
  base_price, includes_official_fees, official_fees_note,
  estimated_duration, generates_matter, default_matter_type,
  is_active, is_preconfigured, display_order
) VALUES
(NULL, 'PT_OPPOSITION_FILE',
 'Oposición a patente',
 'Redacción y presentación de oposición contra patente concedida.',
 'patents', 'oppositions',
 2500.00, true, 'Tasa oposición EPO: 815€',
 '1-3 años', true, 'opposition', false, true, 1300),

(NULL, 'PT_OPPOSITION_DEFENSE',
 'Defensa contra oposición',
 'Defensa de patente propia frente a oposición de tercero.',
 'patents', 'oppositions',
 2500.00, false, NULL,
 '1-3 años', false, NULL, false, true, 1301),

(NULL, 'PT_INFRINGEMENT_OPINION',
 'Opinión de infracción',
 'Análisis técnico-jurídico sobre posible infracción de patente.',
 'patents', 'litigation',
 1500.00, false, NULL,
 '2-3 semanas', false, NULL, false, true, 1310)
ON CONFLICT (preconfigured_code) DO NOTHING;