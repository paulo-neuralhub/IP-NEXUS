
INSERT INTO crm_leads (
  organization_id, contact_name, contact_email, contact_phone, 
  company_name, status, interested_in, estimated_value, source, 
  next_action, next_action_date
) VALUES 
(
  'a1000000-0000-0000-0000-000000000001',
  'Laura Martínez',
  'laura@innovatech.es',
  '+34 611 222 333',
  'InnovaTech Solutions',
  'new',
  ARRAY['Marcas', 'Patentes'],
  12000,
  'web',
  'Llamar para presentación',
  '2026-01-30'
),
(
  'a1000000-0000-0000-0000-000000000001',
  'Javier Fernández',
  'jfernandez@greenenergia.com',
  '+34 622 333 444',
  'Green Energía',
  'new',
  ARRAY['Marcas'],
  8500,
  'linkedin',
  'Enviar catálogo de servicios',
  '2026-01-31'
),
(
  'a1000000-0000-0000-0000-000000000001',
  'María Sánchez',
  'msanchez@farmaplus.es',
  '+34 633 444 555',
  'FarmaPlus Laboratories',
  'new',
  ARRAY['Patentes', 'Internacional'],
  25000,
  'referral',
  'Agendar reunión técnica',
  '2026-02-01'
),
(
  'a1000000-0000-0000-0000-000000000001',
  'David López',
  'dlopez@modaurbana.com',
  '+34 644 555 666',
  'Moda Urbana SL',
  'new',
  ARRAY['Diseños', 'Marcas'],
  6500,
  'event',
  'Preparar propuesta inicial',
  '2026-02-02'
);
