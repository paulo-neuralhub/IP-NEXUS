-- Seed data para service_catalog
-- Solo insertar si no hay datos existentes para evitar duplicados

DO $$
DECLARE
  v_org_id uuid;
BEGIN
  -- Obtener la primera organización existente para seed data de demo
  SELECT id INTO v_org_id FROM organizations LIMIT 1;
  
  -- Si existe una organización, insertar datos de ejemplo
  IF v_org_id IS NOT NULL THEN
    -- Solo insertar si no hay servicios con estos códigos
    INSERT INTO service_catalog (organization_id, reference_code, name, description, category, service_type, jurisdiction, official_fee, professional_fee, base_price, nice_classes_included, extra_class_fee, estimated_days, is_active)
    SELECT v_org_id, t.reference_code, t.name, t.description, t.category, t.service_type, t.jurisdiction, t.official_fee, t.professional_fee, t.official_fee + t.professional_fee, t.nice_classes_included, t.extra_class_fee, t.estimated_days, true
    FROM (VALUES
      -- Marcas España
      ('MAR-REG-ES-001', 'Registro marca España (1 clase)', 'Registro de marca nacional ante la OEPM incluyendo una clase Nice', 'Registro', 'marca', 'ES', 125.00, 350.00, 1, 85.00, 45),
      ('MAR-REG-ES-002', 'Registro marca España (2 clases)', 'Registro de marca nacional ante la OEPM incluyendo dos clases Nice', 'Registro', 'marca', 'ES', 200.00, 400.00, 2, 85.00, 45),
      ('MAR-REN-ES-001', 'Renovación marca España', 'Renovación de marca nacional por 10 años adicionales', 'Renovación', 'renovacion', 'ES', 125.00, 150.00, 1, 85.00, 5),
      
      -- Marcas UE
      ('MAR-REG-EU-001', 'Registro marca UE (1 clase)', 'Registro de marca de la Unión Europea ante la EUIPO', 'Registro', 'marca', 'EU', 850.00, 500.00, 1, 150.00, 90),
      ('MAR-REG-EU-002', 'Registro marca UE (2 clases)', 'Registro de marca UE incluyendo dos clases Nice', 'Registro', 'marca', 'EU', 900.00, 550.00, 2, 150.00, 90),
      ('MAR-REN-EU-001', 'Renovación marca UE', 'Renovación de marca UE por 10 años adicionales', 'Renovación', 'renovacion', 'EU', 850.00, 250.00, 1, 150.00, 5),
      
      -- Marcas Internacional
      ('MAR-REG-INT-001', 'Registro marca Internacional', 'Solicitud de marca internacional vía Protocolo de Madrid', 'Registro', 'marca', 'INT', 653.00, 750.00, 1, 200.00, 120),
      
      -- Patentes España
      ('PAT-REG-ES-001', 'Solicitud patente España', 'Preparación y presentación de solicitud de patente nacional', 'Registro', 'patente', 'ES', 650.00, 1500.00, 1, 0.00, 180),
      ('PAT-MAN-ES-001', 'Mantenimiento patente España', 'Pago de anualidades de patente nacional', 'Mantenimiento', 'patente', 'ES', 50.00, 80.00, 1, 0.00, 5),
      
      -- Patentes Europa
      ('PAT-REG-EP-001', 'Solicitud patente europea (EP)', 'Preparación y presentación de solicitud de patente europea', 'Registro', 'patente', 'EU', 1500.00, 3500.00, 1, 0.00, 240),
      
      -- Diseños
      ('DIS-REG-ES-001', 'Registro diseño España', 'Registro de diseño industrial ante la OEPM', 'Registro', 'diseño', 'ES', 90.00, 300.00, 1, 0.00, 30),
      ('DIS-REG-EU-001', 'Registro diseño UE', 'Registro de diseño comunitario ante la EUIPO', 'Registro', 'diseño', 'EU', 350.00, 450.00, 1, 0.00, 15),
      
      -- Vigilancia
      ('VIG-MAR-001', 'Vigilancia marcas mensual', 'Servicio de vigilancia de marcas similares (mensual)', 'Vigilancia', 'vigilancia', NULL, 0.00, 89.00, 1, 0.00, 30),
      ('VIG-MAR-002', 'Vigilancia marcas trimestral', 'Servicio de vigilancia de marcas similares (trimestral)', 'Vigilancia', 'vigilancia', NULL, 0.00, 239.00, 1, 0.00, 90),
      ('VIG-PAT-001', 'Vigilancia patentes mensual', 'Servicio de vigilancia de patentes en sector', 'Vigilancia', 'vigilancia', NULL, 0.00, 149.00, 1, 0.00, 30),
      
      -- Oposiciones
      ('OPO-MAR-ES-001', 'Oposición marca España', 'Presentación de oposición ante la OEPM', 'Oposición', 'oposicion', 'ES', 125.00, 800.00, 1, 0.00, 60),
      ('OPO-MAR-EU-001', 'Oposición marca UE', 'Presentación de oposición ante la EUIPO', 'Oposición', 'oposicion', 'EU', 350.00, 1500.00, 1, 0.00, 90),
      
      -- Informes
      ('INF-VIA-001', 'Informe viabilidad marca', 'Búsqueda de anterioridades e informe de viabilidad', 'Informe', 'informe', NULL, 0.00, 250.00, 1, 0.00, 3),
      ('INF-VIA-002', 'Informe viabilidad marca completo', 'Búsqueda exhaustiva de anterioridades con análisis jurídico', 'Informe', 'informe', NULL, 0.00, 450.00, 1, 0.00, 5),
      ('INF-DIS-001', 'Informe diseño', 'Búsqueda de diseños similares e informe', 'Informe', 'informe', NULL, 0.00, 350.00, 1, 0.00, 5),
      
      -- General
      ('GEN-CON-001', 'Consulta PI (1 hora)', 'Consultoría en propiedad industrial (por hora)', 'Consultoría', 'general', NULL, 0.00, 150.00, 1, 0.00, 1),
      ('GEN-ASE-001', 'Asesoramiento estrategia PI', 'Asesoramiento estratégico en protección de PI', 'Consultoría', 'general', NULL, 0.00, 500.00, 1, 0.00, 10)
    ) AS t(reference_code, name, description, category, service_type, jurisdiction, official_fee, professional_fee, nice_classes_included, extra_class_fee, estimated_days)
    WHERE NOT EXISTS (
      SELECT 1 FROM service_catalog sc 
      WHERE sc.organization_id = v_org_id 
      AND sc.reference_code = t.reference_code
    );
  END IF;
END $$;