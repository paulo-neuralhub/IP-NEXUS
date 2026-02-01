-- ════════════════════════════════════════════════════════════════════════════
-- WIPO MADRID - Sistema Internacional de Marcas - CAMPOS COMPLETOS
-- Corrigiendo código: WIPO en vez de WO
-- ════════════════════════════════════════════════════════════════════════════

INSERT INTO jurisdiction_field_configs (
  jurisdiction_id, right_type, field_key, field_label_en, field_label_es,
  field_description, field_type, field_options, is_required, 
  visible_condition, field_group, display_order, grid_column
)
SELECT j.id, v.right_type, v.field_key, v.field_label_en, v.field_label_es,
       v.field_description, v.field_type, v.field_options::jsonb, v.is_required,
       v.visible_condition, v.field_group, v.display_order, v.grid_column
FROM jurisdictions j
CROSS JOIN (VALUES
  -- MARCA BASE
  ('trademark', 'wo_basic_mark_type', 'Basic Mark Type', 'Tipo Marca Base',
   'Application or registration', 'select',
   '[{"value":"application","label":"Application (pending)"},{"value":"registration","label":"Registration (granted)"}]',
   true, null, 'basic_mark', 10, 'third'),
   
  ('trademark', 'wo_basic_mark_country', 'Basic Mark Country', 'País Marca Base',
   'Country/Office of basic mark', 'country_select', null,
   true, null, 'basic_mark', 11, 'third'),
   
  ('trademark', 'wo_basic_mark_number', 'Basic Mark Number', 'Número Marca Base',
   null, 'text', null,
   true, null, 'basic_mark', 12, 'third'),
   
  ('trademark', 'wo_basic_mark_filing_date', 'Basic Mark Filing Date', 'Fecha Solicitud Marca Base',
   null, 'date', null,
   true, null, 'basic_mark', 13, 'half'),
   
  ('trademark', 'wo_basic_mark_reg_date', 'Basic Mark Registration Date', 'Fecha Registro Marca Base',
   null, 'date', null,
   false, 'wo_basic_mark_type === "registration"', 'basic_mark', 14, 'half'),
  
  -- OFICINA DE ORIGEN
  ('trademark', 'wo_office_of_origin', 'Office of Origin', 'Oficina de Origen',
   'IP Office that certified the application', 'country_select', null,
   true, null, 'origin', 20, 'half'),
   
  ('trademark', 'wo_certification_date', 'Certification Date', 'Fecha Certificación',
   'Date Office of Origin certified the application', 'date', null,
   false, null, 'origin', 21, 'half'),
  
  -- DESIGNACIONES
  ('trademark', 'wo_designated_parties', 'Designated Contracting Parties', 'Partes Contratantes Designadas',
   'Countries/regions designated for protection', 'multi_select', null,
   true, null, 'designations', 30, 'full'),
   
  ('trademark', 'wo_subsequent_designation', 'Subsequent Designation', 'Designación Posterior',
   'Adding new countries after initial filing', 'checkbox', null,
   false, null, 'designations', 31, 'half'),
   
  ('trademark', 'wo_subsequent_designation_date', 'Subsequent Designation Date', 'Fecha Designación Posterior',
   null, 'date', null,
   false, 'wo_subsequent_designation === true', 'designations', 32, 'half'),
  
  -- LIMITACIONES
  ('trademark', 'wo_has_limitations', 'Has Goods/Services Limitations', 'Tiene Limitaciones',
   'Different goods/services list for some countries', 'checkbox', null,
   false, null, 'limitations', 40, 'full'),
  
  -- DEPENDENCIA Y TRANSFORMACIÓN
  ('trademark', 'wo_dependency_end_date', 'Dependency End Date', 'Fin Periodo Dependencia',
   'Basic mark dependency ends 5 years after IR', 'date', null,
   false, null, 'dependency', 50, 'half'),
   
  ('trademark', 'wo_central_attack_received', 'Central Attack Received', 'Ataque Central Recibido',
   'Basic mark ceased within 5 years', 'checkbox', null,
   false, null, 'dependency', 51, 'half'),
   
  ('trademark', 'wo_transformation_requested', 'Transformation Requested', 'Transformación Solicitada',
   'Convert IR designations to national applications', 'checkbox', null,
   false, 'wo_central_attack_received === true', 'dependency', 52, 'half'),
  
  -- REEMPLAZO
  ('trademark', 'wo_replacement_claimed', 'Replacement Claimed', 'Reemplazo Reivindicado',
   'IR replaces national/regional registrations', 'checkbox', null,
   false, null, 'replacement', 60, 'full'),
  
  -- RENOVACIÓN
  ('trademark', 'wo_renewal_due', 'Renewal Due Date', 'Fecha Renovación',
   'IR renewal every 10 years', 'date', null,
   false, null, 'renewal', 70, 'half'),
   
  ('trademark', 'wo_last_renewal_date', 'Last Renewal Date', 'Última Renovación',
   null, 'date', null,
   false, null, 'renewal', 71, 'half')

) AS v(right_type, field_key, field_label_en, field_label_es, field_description, 
       field_type, field_options, is_required, visible_condition, field_group, 
       display_order, grid_column)
WHERE j.code = 'WIPO'
ON CONFLICT (jurisdiction_id, right_type, field_key) 
DO UPDATE SET
  field_label_en = EXCLUDED.field_label_en,
  field_description = EXCLUDED.field_description,
  visible_condition = EXCLUDED.visible_condition;