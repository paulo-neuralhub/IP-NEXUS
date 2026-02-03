
-- ══════════════════════════════════════════════════════
-- FASE 13: EMAIL_QUEUE (Cola de emails)
-- ══════════════════════════════════════════════════════

INSERT INTO email_queue (
  id, organization_id, to_email, subject, html_body, template, template_data, status, sent_at, created_at
) VALUES

-- Recordatorio plazo oposición
('e0000001-0001-0000-0000-000000000001', 'd0000001-0000-0000-0000-000000000001',
 'r.casas@greenpower-energia.es',
 'Recordatorio: Plazo respuesta oposición ECOFLOW SOLAR vence el 15/02/2026',
 '<h2>Recordatorio de plazo</h2><p>Estimado Roberto,</p><p>Le recordamos que el plazo para responder a la oposición contra la marca ECOFLOW SOLAR vence el 15 de febrero de 2026.</p><p>Nuestro equipo está preparando las alegaciones. Le mantendremos informado.</p><p>Saludos,<br>Meridian IP Consulting</p>',
 'deadline_reminder', '{"matter_ref": "2025/TM/011", "deadline_date": "2026-02-15"}',
 'sent', '2026-02-01T08:01:00Z', '2026-02-01T03:00:15Z'),

-- Aviso factura pendiente NordikHaus
('e0000001-0002-0000-0000-000000000001', 'd0000001-0000-0000-0000-000000000001',
 'k.bergmann@nordikhaus.de',
 'Aviso de factura pendiente — INV-2025-0006',
 '<h2>Factura pendiente de pago</h2><p>Estimado Klaus,</p><p>Le informamos que la factura INV-2025-0006 por importe de €6.500,00 con vencimiento el 15/01/2026 se encuentra pendiente de pago.</p><p>Le agradeceríamos proceder al pago a la mayor brevedad.</p><p>IBAN: ES91 2100 0418 4502 0005 1332 (CaixaBank)</p><p>Saludos,<br>Lucía Navarro - Meridian IP</p>',
 'invoice_overdue', '{"invoice_id": "INV-2025-0006", "amount": 6500}',
 'sent', '2026-02-03T08:02:00Z', '2026-02-03T03:00:10Z'),

-- Alerta vigilancia TechFlow (pendiente)
('e0000001-0003-0000-0000-000000000001', 'd0000001-0000-0000-0000-000000000001',
 'alejandro.ruiz@techflow.es',
 'Alerta de vigilancia: Marca similar a TECHFLOW detectada',
 '<h2>Alerta de vigilancia de marca</h2><p>Estimado Alejandro,</p><p>Nuestro sistema de vigilancia ha detectado una nueva solicitud de marca que podría afectar a su marca TECHFLOW:</p><ul><li><strong>Marca detectada:</strong> TECHFLOW AI SOLUTIONS</li><li><strong>Solicitante:</strong> TechSoft GmbH</li><li><strong>Jurisdicción:</strong> UE (EUIPO)</li><li><strong>Similitud:</strong> 91%</li></ul><p>Le recomendamos una reunión para evaluar acciones. ¿Le viene bien esta semana?</p><p>Saludos,<br>Sofía Delgado - Meridian IP</p>',
 'surveillance_alert', '{"alert_id": "sa000001-0004", "similarity": 91}',
 'pending', NULL, '2026-02-03T03:15:00Z');
