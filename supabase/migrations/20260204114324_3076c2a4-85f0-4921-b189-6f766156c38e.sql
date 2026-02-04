
-- ===========================================
-- CORREGIR CONTACTOS EN crm_contacts
-- Reasignar account_id a la cuenta correcta
-- ===========================================

-- Klaus Weber y Sabine Müller → NordikHaus (estaban en Elena Voss)
UPDATE crm_contacts SET account_id = 'a0000001-0004-0000-0000-000000000001'
WHERE full_name IN ('Klaus Weber', 'Sabine Müller') 
AND organization_id = 'd0000001-0000-0000-0000-000000000001';

-- Dr. Hans Becker → Elena Voss/BioVoss (estaba en GreenPower)
UPDATE crm_contacts SET account_id = 'a0000001-0003-0000-0000-000000000001'
WHERE full_name = 'Dr. Hans Becker' 
AND organization_id = 'd0000001-0000-0000-0000-000000000001';

-- María José Ortega → Olivar Premium (estaba en NordikHaus)
UPDATE crm_contacts SET account_id = 'a0000001-0002-0000-0000-000000000001'
WHERE full_name = 'María José Ortega' 
AND organization_id = 'd0000001-0000-0000-0000-000000000001';

-- Miguel Ángel Fernández → GreenPower (estaba en Olivar)
UPDATE crm_contacts SET account_id = 'a0000001-0006-0000-0000-000000000001'
WHERE full_name = 'Miguel Ángel Fernández' 
AND organization_id = 'd0000001-0000-0000-0000-000000000001';
