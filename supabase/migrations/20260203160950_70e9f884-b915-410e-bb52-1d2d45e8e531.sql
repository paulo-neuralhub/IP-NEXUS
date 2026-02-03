
-- ══════════════════════════════════════════════════════
-- FASE 5: COMMUNICATIONS - received_at NOT NULL corregido
-- ══════════════════════════════════════════════════════

INSERT INTO communications (
  id, organization_id, contact_id, matter_id, channel, direction,
  subject, body, body_preview, attachments,
  email_from, email_to, whatsapp_from, whatsapp_to, phone_from, phone_to, phone_duration_seconds,
  is_read, read_at, received_at, created_at
) VALUES

-- EMAIL: Bienvenida a TechFlow (outbound)
('c1000000-0000-0000-0000-000000000001', 'd0000001-0000-0000-0000-000000000001',
 'c0000001-0001-0000-0000-000000000001', '10000001-0004-0000-0000-000000000001', 
 'email', 'outbound',
 'Bienvenido a Meridian IP — Inicio expediente TECHFLOW',
 'Estimado Alejandro,

Es un placer darle la bienvenida como cliente de Meridian IP Consulting. Hemos abierto el expediente 2025/TM/003 para el registro de la marca TECHFLOW ante la OEPM.

Próximos pasos:
1. Preparación de la solicitud (3-5 días)
2. Presentación ante la OEPM
3. Le notificaremos el número de solicitud

Quedo a su disposición.

Sofía Delgado
Abogada Senior - Meridian IP',
 'Es un placer darle la bienvenida como cliente de Meridian IP Consulting...',
 '[]',
 'sofia@meridian-ip.com', ARRAY['alejandro.ruiz@techflow.es'], NULL, NULL, NULL, NULL, NULL,
 true, '2025-03-22T09:05:00Z', '2025-03-22T09:00:00Z', '2025-03-22T09:00:00Z'),

-- WHATSAPP: Confirmación Alejandro (inbound)
('c1000000-0000-0000-0000-000000000002', 'd0000001-0000-0000-0000-000000000001',
 'c0000001-0001-0000-0000-000000000001', '10000001-0004-0000-0000-000000000001',
 'whatsapp', 'inbound',
 NULL,
 'Perfecto Sofía! Recibido. ¿Necesitáis alguna documentación adicional por mi parte? Gracias! 👍',
 'Perfecto Sofía! Recibido. ¿Necesitáis alguna documentación adicional...',
 '[]',
 NULL, NULL, '+34666111201', '+34915550100', NULL, NULL, NULL,
 true, '2025-03-22T09:50:00Z', '2025-03-22T09:45:00Z', '2025-03-22T09:45:00Z'),

-- WHATSAPP: Respuesta Sofía (outbound)
('c1000000-0000-0000-0000-000000000003', 'd0000001-0000-0000-0000-000000000001',
 'c0000001-0001-0000-0000-000000000001', '10000001-0004-0000-0000-000000000001',
 'whatsapp', 'outbound',
 NULL,
 'Hola Alejandro! Solo necesitamos la autorización de representación firmada. Con eso podemos presentar la solicitud esta semana.',
 'Hola Alejandro! Solo necesitamos la autorización de representación firmada...',
 '[]',
 NULL, NULL, '+34915550100', '+34666111201', NULL, NULL, NULL,
 true, NULL, '2025-03-22T10:02:00Z', '2025-03-22T10:02:00Z'),

-- EMAIL: Notificación OEPM - GREENPOWER (inbound)
('c1000000-0000-0000-0000-000000000004', 'd0000001-0000-0000-0000-000000000001',
 'c0000001-0006-0000-0000-000000000001', '10000001-0001-0000-0000-000000000001',
 'email', 'inbound',
 'OEPM — Certificado de registro marca GREENPOWER nº 0 4052001',
 'Se adjunta certificado de registro de la marca denominativa GREENPOWER, registrada el 20/09/2025.',
 'Se adjunta certificado de registro de la marca denominativa GREENPOWER...',
 '[{"name": "certificado_greenpower_0_4052001.pdf", "size": 245000}]',
 'notificaciones@oepm.es', ARRAY['info@meridian-ip.com'], NULL, NULL, NULL, NULL, NULL,
 true, '2025-09-22T08:45:00Z', '2025-09-22T08:30:00Z', '2025-09-22T08:30:00Z'),

-- EMAIL: Comunicar registro a GreenPower (outbound)
('c1000000-0000-0000-0000-000000000005', 'd0000001-0000-0000-0000-000000000001',
 'c0000001-0006-0000-0000-000000000001', '10000001-0001-0000-0000-000000000001',
 'email', 'outbound',
 'Excelente noticia — Marca GREENPOWER registrada ✅',
 'Estimado Roberto,

Me complace comunicarle que la marca GREENPOWER ha sido registrada con éxito ante la OEPM con el número 0 4052001.

La marca está protegida en las clases 9, 37 y 42 para todo el territorio español. El registro tiene validez hasta el 15/03/2035.

Adjunto el certificado oficial.

Enhorabuena,
Carlos Meridian',
 'Me complace comunicarle que la marca GREENPOWER ha sido registrada con éxito...',
 '[{"name": "certificado_greenpower.pdf", "size": 245000}]',
 'carlos@meridian-ip.com', ARRAY['r.casas@greenpower-energia.es'], NULL, NULL, NULL, NULL, NULL,
 true, '2025-09-22T10:05:00Z', '2025-09-22T10:00:00Z', '2025-09-22T10:00:00Z'),

-- CALL: Llamada con Dra. Voss - BioVoss-7
('c1000000-0000-0000-0000-000000000006', 'd0000001-0000-0000-0000-000000000001',
 'c0000001-0003-0000-0000-000000000001', '10000001-0010-0000-0000-000000000001',
 'phone', 'outbound',
 'Llamada actualización patente BioVoss-7',
 'Llamada de 22 min con Dra. Voss. Informamos sobre el estado del examen de la patente BioVoss-7. La OEPM ha emitido un requerimiento solicitando documentación adicional.',
 'Llamada de 22 min con Dra. Voss. Informamos sobre el estado del examen...',
 '[]',
 NULL, NULL, NULL, NULL, '+34915550100', '+34616555403', 1320,
 true, NULL, '2026-01-22T11:00:00Z', '2026-01-22T11:00:00Z'),

-- WHATSAPP: Dra. Voss envía documentos (inbound)
('c1000000-0000-0000-0000-000000000007', 'd0000001-0000-0000-0000-000000000001',
 'c0000001-0003-0000-0000-000000000001', '10000001-0010-0000-0000-000000000001',
 'whatsapp', 'inbound',
 NULL,
 'Hola Sofía, te envío los datos experimentales que me pedisteis. Son 3 archivos PDF. ¿Los recibiste bien? Un saludo, Elena',
 'Hola Sofía, te envío los datos experimentales que me pedisteis...',
 '[{"name": "datos_experimentales_biovoss7.pdf", "size": 1500000}]',
 NULL, NULL, '+34616555403', '+34915550100', NULL, NULL, NULL,
 true, '2026-01-25T15:35:00Z', '2026-01-25T15:30:00Z', '2026-01-25T15:30:00Z'),

-- EMAIL: Oposición ECOFLOW SOLAR (inbound)
('c1000000-0000-0000-0000-000000000008', 'd0000001-0000-0000-0000-000000000001',
 'c0000001-0006-0000-0000-000000000001', '10000001-0014-0000-0000-000000000001',
 'email', 'inbound',
 'OEPM — Notificación de oposición contra marca ECOFLOW SOLAR',
 'Se notifica la presentación de oposición por parte de EcoFlow Technology Ltd. contra la solicitud de marca ECOFLOW SOLAR nº M-4088901. Plazo para alegaciones: 2 meses.',
 'Se notifica la presentación de oposición por parte de EcoFlow Technology Ltd...',
 '[{"name": "oposicion_ecoflow_M4088901.pdf", "size": 890000}]',
 'notificaciones@oepm.es', ARRAY['info@meridian-ip.com'], NULL, NULL, NULL, NULL, NULL,
 true, '2025-12-15T08:15:00Z', '2025-12-15T08:00:00Z', '2025-12-15T08:00:00Z'),

-- EMAIL: Klaus pregunta - NORDIKHAUS (inbound)
('c1000000-0000-0000-0000-000000000009', 'd0000001-0000-0000-0000-000000000001',
 'c0000001-0004-0000-0000-000000000001', '10000001-0011-0000-0000-000000000001',
 'email', 'inbound',
 'RE: Estado solicitud NORDIKHAUS España',
 'Estimado Miguel Ángel, quería consultarle el estado de nuestra solicitud de marca NORDIKHAUS en España. ¿Ha habido alguna comunicación de la OEPM? Gracias, Klaus Bergmann',
 'Quería consultarle el estado de nuestra solicitud de marca NORDIKHAUS...',
 '[]',
 'k.bergmann@nordikhaus.de', ARRAY['miguel@meridian-ip.com'], NULL, NULL, NULL, NULL, NULL,
 true, '2026-01-28T09:20:00Z', '2026-01-28T09:15:00Z', '2026-01-28T09:15:00Z'),

-- EMAIL: Respuesta a Klaus (outbound)
('c1000000-0000-0000-0000-000000000010', 'd0000001-0000-0000-0000-000000000001',
 'c0000001-0004-0000-0000-000000000001', '10000001-0011-0000-0000-000000000001',
 'email', 'outbound',
 'RE: RE: Estado solicitud NORDIKHAUS España',
 'Estimado Klaus, la solicitud NORDIKHAUS (M-4082345) se encuentra en fase de examen formal. Esperamos resultado en las próximas 4-6 semanas. No hay comunicaciones pendientes de la OEPM. Respecto a NORDIK LIVING en Portugal, la solicitud avanza según calendario normal. Le mantendremos informado. Saludos, Miguel Ángel Roca',
 'La solicitud NORDIKHAUS (M-4082345) se encuentra en fase de examen formal...',
 '[]',
 'miguel@meridian-ip.com', ARRAY['k.bergmann@nordikhaus.de'], NULL, NULL, NULL, NULL, NULL,
 true, NULL, '2026-01-28T11:30:00Z', '2026-01-28T11:30:00Z');
