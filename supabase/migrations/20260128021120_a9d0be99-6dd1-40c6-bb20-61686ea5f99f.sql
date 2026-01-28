
-- SEED IP-MARKET - Versión simplificada sin RFQs problemáticos
CREATE OR REPLACE FUNCTION public.seed_market_demo_data(p_organization_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Clean & insert services + fees only (skip RFQ due to complex FK)
  DELETE FROM service_fees WHERE organization_id = p_organization_id;
  DELETE FROM service_catalog WHERE organization_id = p_organization_id;

  -- SERVICES (23)
  INSERT INTO service_catalog (organization_id, name, description, base_price, currency, category, service_type, jurisdiction, official_fee, professional_fee, estimated_days, is_active, display_order) VALUES
  (p_organization_id, 'Búsqueda Anterioridades ES', 'Búsqueda OEPM', 350, 'EUR', 'marcas', 'tm_search', 'ES', 0, 350, 3, true, 1),
  (p_organization_id, 'Búsqueda Anterioridades EU', 'Búsqueda EUIPO', 750, 'EUR', 'marcas', 'tm_search', 'EU', 0, 750, 5, true, 2),
  (p_organization_id, 'Registro Marca España', 'Registro OEPM', 650, 'EUR', 'marcas', 'tm_registration', 'ES', 125.36, 524.64, 180, true, 10),
  (p_organization_id, 'Registro Marca EU (EUTM)', 'Marca EUIPO', 1450, 'EUR', 'marcas', 'tm_registration', 'EU', 850, 600, 120, true, 11),
  (p_organization_id, 'Registro Marca USA', 'Marca USPTO', 1200, 'EUR', 'marcas', 'tm_registration', 'US', 250, 950, 365, true, 12),
  (p_organization_id, 'Registro Marca UK', 'Marca UKIPO', 850, 'EUR', 'marcas', 'tm_registration', 'GB', 170, 680, 90, true, 13),
  (p_organization_id, 'Registro Marca China', 'Marca CNIPA', 1100, 'EUR', 'marcas', 'tm_registration', 'CN', 270, 830, 365, true, 14),
  (p_organization_id, 'Renovación Marca ES', 'Renovación 10 años', 450, 'EUR', 'marcas', 'tm_renewal', 'ES', 154.50, 295.50, 30, true, 20),
  (p_organization_id, 'Renovación Marca EU', 'Renovación EUTM', 850, 'EUR', 'marcas', 'tm_renewal', 'EU', 850, 0, 30, true, 21),
  (p_organization_id, 'Vigilancia Marcas', 'Mensual', 120, 'EUR', 'marcas', 'tm_watch', NULL, 0, 120, NULL, true, 30),
  (p_organization_id, 'Oposición a Marca', 'Contra tercero', 1800, 'EUR', 'marcas', 'tm_opposition', 'ES', 400, 1400, 90, true, 40),
  (p_organization_id, 'Búsqueda Patentabilidad', 'Novedad', 950, 'EUR', 'patentes', 'pt_search', NULL, 0, 950, 10, true, 50),
  (p_organization_id, 'Patente España', 'OEPM', 3500, 'EUR', 'patentes', 'pt_filing', 'ES', 652, 2848, 365, true, 51),
  (p_organization_id, 'Patente Europea (EP)', 'EPO', 6500, 'EUR', 'patentes', 'pt_filing', 'EP', 1380, 5120, 730, true, 52),
  (p_organization_id, 'Solicitud PCT', 'Internacional', 4500, 'EUR', 'patentes', 'pt_filing', 'WO', 1330, 3170, 30, true, 53),
  (p_organization_id, 'Anualidad Patente', 'Mantenimiento', 250, 'EUR', 'patentes', 'pt_maintenance', NULL, 100, 150, 15, true, 54),
  (p_organization_id, 'Diseño España', 'OEPM', 550, 'EUR', 'disenos', 'ds_registration', 'ES', 120, 430, 60, true, 60),
  (p_organization_id, 'Diseño Comunitario (RCD)', 'EUIPO', 850, 'EUR', 'disenos', 'ds_registration', 'EU', 350, 500, 30, true, 61),
  (p_organization_id, 'Procedimiento UDRP', 'Dominio', 2500, 'EUR', 'dominios', 'litigation_infringement', NULL, 1500, 1000, 60, true, 70),
  (p_organization_id, 'Contrato Licencia', 'Redacción', 1200, 'EUR', 'contratos', 'licensing_negotiation', NULL, 0, 1200, 15, true, 80),
  (p_organization_id, 'Contrato Cesión', 'Redacción', 900, 'EUR', 'contratos', 'general_consultation', NULL, 0, 900, 10, true, 81);

  -- FEES (16)
  INSERT INTO service_fees (organization_id, code, name, category, ip_type, amount, currency, fee_model, is_active) VALUES
  (p_organization_id, 'OEPM-TM-REG', 'Tasa OEPM Marca', 'filing', 'trademark', 125.36, 'EUR', 'fixed', true),
  (p_organization_id, 'OEPM-TM-CLASS', 'Tasa OEPM Clase+', 'filing', 'trademark', 85, 'EUR', 'per_class', true),
  (p_organization_id, 'OEPM-TM-REN', 'Tasa OEPM Renovación', 'renewal', 'trademark', 154.50, 'EUR', 'fixed', true),
  (p_organization_id, 'OEPM-PAT', 'Tasa OEPM Patente', 'filing', 'patent', 652, 'EUR', 'fixed', true),
  (p_organization_id, 'EUIPO-TM', 'Tasa EUIPO Marca', 'filing', 'trademark', 850, 'EUR', 'fixed', true),
  (p_organization_id, 'EUIPO-RCD', 'Tasa EUIPO Diseño', 'filing', 'design', 350, 'EUR', 'fixed', true),
  (p_organization_id, 'EPO-FILE', 'Tasa EPO Filing', 'filing', 'patent', 1380, 'EUR', 'fixed', true),
  (p_organization_id, 'EPO-EXAM', 'Tasa EPO Examen', 'prosecution', 'patent', 1880, 'EUR', 'fixed', true),
  (p_organization_id, 'USPTO-TM', 'Tasa USPTO Marca', 'filing', 'trademark', 250, 'USD', 'fixed', true),
  (p_organization_id, 'USPTO-PAT', 'Tasa USPTO Patente', 'filing', 'patent', 1820, 'USD', 'fixed', true),
  (p_organization_id, 'WIPO-PCT', 'Tasa WIPO PCT', 'filing', 'patent', 1330, 'EUR', 'fixed', true),
  (p_organization_id, 'WIPO-UDRP', 'Tasa WIPO UDRP', 'litigation', 'domain', 1500, 'USD', 'fixed', true);

  RETURN jsonb_build_object(
    'success', true,
    'services', (SELECT COUNT(*) FROM service_catalog WHERE organization_id = p_organization_id),
    'fees', (SELECT COUNT(*) FROM service_fees WHERE organization_id = p_organization_id)
  );
END;
$$;

SELECT seed_market_demo_data('a1000000-0000-0000-0000-000000000001');
