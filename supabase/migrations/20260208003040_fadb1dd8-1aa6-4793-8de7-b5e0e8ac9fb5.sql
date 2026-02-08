
-- ═══ SEED: More quotes for open requests ═══

-- Quotes for "Presentación de patente IoT" (5858401c)
INSERT INTO rfq_quotes (request_id, agent_id, status, total_price, currency, price_breakdown, estimated_duration_days, proposal_summary, relevant_experience, payment_terms, payment_milestones, deliverables, submitted_at)
VALUES
  ('5858401c-c678-4b70-af67-cc1b3e071db0', '35df751c-f08f-415a-a0f7-65ee1abcea08', 'submitted', 4500.00, 'USD',
   '{"professional_fees": 3500, "official_fees": 1000}', 60,
   'Extensive USPTO patent prosecution experience with IoT/tech inventions. We will draft claims, prepare drawings, and file electronically.',
   'Over 200 utility patents filed at USPTO. Specializing in IoT, sensors and industrial automation.',
   'milestone', '[{"description":"Prior art review & claims drafting","percentage":40},{"description":"Filing & prosecution","percentage":40},{"description":"Grant & certificate","percentage":20}]',
   '[{"item":"Patent application draft","format":"PDF"},{"item":"Formal drawings","format":"PDF"},{"item":"Filing receipt","format":"PDF"}]',
   NOW() - INTERVAL '1 day'),
  ('5858401c-c678-4b70-af67-cc1b3e071db0', 'db59c32c-dcc2-4667-9280-e606188b9194', 'submitted', 5200.00, 'USD',
   '{"professional_fees": 4200, "official_fees": 1000}', 45,
   'UK patent attorneys with direct USPTO filing capabilities. Faster turnaround with our US associate network.',
   '150+ US utility patents. Strong in electronics, software, and IoT.',
   'milestone', '[{"description":"Claims strategy & drafting","percentage":50},{"description":"Filing","percentage":30},{"description":"Prosecution","percentage":20}]',
   '[{"item":"Full patent application","format":"PDF"},{"item":"USPTO filing confirmation","format":"PDF"}]',
   NOW() - INTERVAL '2 days');

-- Quotes for "Oposición EUIPO" (9e8c7b90)
INSERT INTO rfq_quotes (request_id, agent_id, status, total_price, currency, price_breakdown, estimated_duration_days, proposal_summary, relevant_experience, payment_terms, payment_milestones, deliverables, submitted_at)
VALUES
  ('9e8c7b90-e33a-4fd8-b265-a768df85ce37', '2d23bfdf-f5be-4085-a153-b71ceae2b436', 'submitted', 2200.00, 'EUR',
   '{"professional_fees": 1850, "official_fees": 350}', 30,
   'Experienced EUIPO opposition team. We handle likelihood of confusion cases daily with a 78% success rate.',
   '120+ EUIPO oppositions filed. Former EUIPO examiner on our team.',
   'milestone', '[{"description":"Analysis & strategy","percentage":30},{"description":"Opposition filing","percentage":50},{"description":"Reply & resolution","percentage":20}]',
   '[{"item":"Opposition brief","format":"PDF"},{"item":"Evidence compilation","format":"PDF"},{"item":"EUIPO decision","format":"PDF"}]',
   NOW() - INTERVAL '3 hours'),
  ('9e8c7b90-e33a-4fd8-b265-a768df85ce37', 'e9ba842c-0fbb-46d0-a1ac-ab204191f589', 'submitted', 2800.00, 'EUR',
   '{"professional_fees": 2500, "official_fees": 300}', 25,
   'Mueller IP has extensive experience in EUIPO oppositions. Our legal team includes a EUIPO-certified attorney.',
   '200+ opposition proceedings. Specializing in tech and automotive sectors.',
   'milestone', '[{"description":"Case assessment","percentage":20},{"description":"Opposition submission","percentage":50},{"description":"Oral hearing prep","percentage":30}]',
   '[{"item":"Legal opinion","format":"PDF"},{"item":"Opposition documents","format":"PDF"}]',
   NOW() - INTERVAL '1 day');

-- Quotes for "Búsqueda anterioridades multi-jurisdicción" (ea800a6c)
INSERT INTO rfq_quotes (request_id, agent_id, status, total_price, currency, price_breakdown, estimated_duration_days, proposal_summary, relevant_experience, payment_terms, payment_milestones, deliverables, submitted_at)
VALUES
  ('ea800a6c-ed1f-44ee-ae7f-5c27d920f9cf', '2d23bfdf-f5be-4085-a153-b71ceae2b436', 'submitted', 1800.00, 'EUR',
   '{"professional_fees": 1800, "official_fees": 0}', 14,
   'Comprehensive multi-jurisdiction search covering ES, EU, US, GB, JP, CN databases. Full risk analysis report included.',
   'Over 500 trademark searches conducted globally. Access to all major databases.',
   'milestone', '[{"description":"Database searches","percentage":60},{"description":"Risk analysis report","percentage":40}]',
   '[{"item":"Search results compilation","format":"PDF"},{"item":"Risk analysis report","format":"PDF"}]',
   NOW() - INTERVAL '5 hours'),
  ('ea800a6c-ed1f-44ee-ae7f-5c27d920f9cf', 'a1a1a1a1-a1a1-4a1a-a1a1-a1a1a1a1a1a1', 'submitted', 2100.00, 'EUR',
   '{"professional_fees": 2100, "official_fees": 0}', 10,
   'Tanaka IP has direct access to JPO and CNIPA databases, providing deeper Asian market coverage than Western firms.',
   'Specialized in Asia-Pacific trademark searches with native-language capabilities.',
   'milestone', '[{"description":"Western markets search","percentage":40},{"description":"Asian markets search","percentage":40},{"description":"Consolidated report","percentage":20}]',
   '[{"item":"Individual jurisdiction reports","format":"PDF"},{"item":"Consolidated risk matrix","format":"Excel"}]',
   NOW() - INTERVAL '8 hours');

-- Update quotes_received counts
UPDATE rfq_requests SET quotes_received = (SELECT COUNT(*) FROM rfq_quotes WHERE request_id = rfq_requests.id AND status != 'draft') WHERE id IN (
  '5858401c-c678-4b70-af67-cc1b3e071db0',
  '9e8c7b90-e33a-4fd8-b265-a768df85ce37',
  'ea800a6c-ed1f-44ee-ae7f-5c27d920f9cf',
  '037370d4-f40d-4821-ba1d-e3600f593413',
  '535ecd14-23bc-4c1e-b568-0c65ee7d3b18'
);

-- ═══ SEED: Notifications ═══
INSERT INTO market_notifications (user_id, type, title, message, request_id, offer_id, transaction_id, is_read, created_at)
VALUES
  ('0090b656-5c9a-445c-91be-34228afb2b0f', 'offer_received', 'Nueva oferta recibida',
   'García & Asociados ha enviado una oferta de €1,900 para tu solicitud de marca EUIPO.',
   '037370d4-f40d-4821-ba1d-e3600f593413', '3d0f43a4-a135-4d0c-aac3-1acfda69e946', NULL, true, NOW() - INTERVAL '5 days'),

  ('0090b656-5c9a-445c-91be-34228afb2b0f', 'offer_received', 'Nueva oferta recibida',
   'Jean Martin ha enviado una oferta de €2,000 para tu solicitud de marca EUIPO.',
   '037370d4-f40d-4821-ba1d-e3600f593413', '55972594-0dca-482c-a46b-55fca07bc76c', NULL, true, NOW() - INTERVAL '4 days'),

  ('0090b656-5c9a-445c-91be-34228afb2b0f', 'offer_accepted', 'Oferta adjudicada',
   'Has adjudicado la oferta de García & Asociados para el registro de marca EUIPO.',
   '037370d4-f40d-4821-ba1d-e3600f593413', '3d0f43a4-a135-4d0c-aac3-1acfda69e946', NULL, true, NOW() - INTERVAL '3 days'),

  ('0090b656-5c9a-445c-91be-34228afb2b0f', 'payment_received', 'Pago al escrow confirmado',
   '€1,942.50 depositados en escrow para TX-2026-000001.',
   NULL, NULL, 'b1b1b1b1-b1b1-4b1b-b1b1-b1b1b1b1b1b1', true, NOW() - INTERVAL '2 days'),

  ('0090b656-5c9a-445c-91be-34228afb2b0f', 'milestone_completed', 'Milestone entregado',
   'El agente ha completado "Búsqueda anterioridades" en TX-2026-000001. Revisa y aprueba.',
   NULL, NULL, 'b1b1b1b1-b1b1-4b1b-b1b1-b1b1b1b1b1b1', true, NOW() - INTERVAL '1 day'),

  ('0090b656-5c9a-445c-91be-34228afb2b0f', 'milestone_approved', 'Pago liberado',
   '€127.50 liberados del escrow para milestone "Búsqueda anterioridades".',
   NULL, NULL, 'b1b1b1b1-b1b1-4b1b-b1b1-b1b1b1b1b1b1', true, NOW() - INTERVAL '20 hours'),

  ('0090b656-5c9a-445c-91be-34228afb2b0f', 'new_message', 'Nuevo mensaje',
   'Tienes un nuevo mensaje del agente en TX-2026-000001.',
   NULL, NULL, 'b1b1b1b1-b1b1-4b1b-b1b1-b1b1b1b1b1b1', false, NOW() - INTERVAL '30 minutes'),

  ('0090b656-5c9a-445c-91be-34228afb2b0f', 'offer_received', 'Nueva oferta para solicitud de patente',
   'Smith & Partners ha enviado una oferta de $4,500 para tu solicitud de patente IoT.',
   '5858401c-c678-4b70-af67-cc1b3e071db0', NULL, NULL, false, NOW() - INTERVAL '1 hour'),

  ('0090b656-5c9a-445c-91be-34228afb2b0f', 'delivery_complete', 'Servicio completado',
   'TX-2026-000003 ha sido completada exitosamente. ¡Deja tu valoración!',
   NULL, NULL, 'b3b3b3b3-b3b3-4b3b-b3b3-b3b3b3b3b3b3', false, NOW() - INTERVAL '2 hours');

-- ═══ SEED: Messages for TX-1 ═══
-- Need to allow NULL sender_user_id for system messages
ALTER TABLE market_service_messages ALTER COLUMN sender_user_id DROP NOT NULL;

INSERT INTO market_service_messages (transaction_id, sender_user_id, content, message_type, created_at)
VALUES
  ('b1b1b1b1-b1b1-4b1b-b1b1-b1b1b1b1b1b1', NULL, 'Transacción iniciada. Fondos depositados en escrow.', 'system', NOW() - INTERVAL '15 days'),
  ('b1b1b1b1-b1b1-4b1b-b1b1-b1b1b1b1b1b1', '0090b656-5c9a-445c-91be-34228afb2b0f', 'Buenos días. Por favor proceda con la búsqueda de anterioridades. Los datos de la marca son: NEXAFLOW, clases 9, 35 y 42.', 'text', NOW() - INTERVAL '14 days'),
  ('b1b1b1b1-b1b1-4b1b-b1b1-b1b1b1b1b1b1', NULL, 'He completado la búsqueda de anterioridades. No se han encontrado marcas conflictivas en las clases 9, 35 y 42. Adjunto el informe completo.', 'text', NOW() - INTERVAL '10 days'),
  ('b1b1b1b1-b1b1-4b1b-b1b1-b1b1b1b1b1b1', NULL, 'Milestone "Búsqueda anterioridades" marcado como entregado.', 'system', NOW() - INTERVAL '10 days'),
  ('b1b1b1b1-b1b1-4b1b-b1b1-b1b1b1b1b1b1', '0090b656-5c9a-445c-91be-34228afb2b0f', 'Perfecto, gracias por el informe. Aprobamos el milestone y procedemos con la presentación.', 'text', NOW() - INTERVAL '8 days'),
  ('b1b1b1b1-b1b1-4b1b-b1b1-b1b1b1b1b1b1', NULL, 'Milestone "Búsqueda anterioridades" aprobado. €127.50 liberados al agente.', 'system', NOW() - INTERVAL '8 days'),
  ('b1b1b1b1-b1b1-4b1b-b1b1-b1b1b1b1b1b1', NULL, 'Iniciando preparación de la solicitud. Les enviaré el borrador para revisión antes de presentar ante EUIPO.', 'text', NOW() - INTERVAL '6 days'),
  ('b1b1b1b1-b1b1-4b1b-b1b1-b1b1b1b1b1b1', '0090b656-5c9a-445c-91be-34228afb2b0f', 'De acuerdo, quedo a la espera del borrador.', 'text', NOW() - INTERVAL '5 days');

-- Messages for TX-2
INSERT INTO market_service_messages (transaction_id, sender_user_id, content, message_type, created_at)
VALUES
  ('b2b2b2b2-b2b2-4b2b-b2b2-b2b2b2b2b2b2', NULL, 'Transacción iniciada. Registro urgente de marca en CNIPA.', 'system', NOW() - INTERVAL '10 days'),
  ('b2b2b2b2-b2b2-4b2b-b2b2-b2b2b2b2b2b2', NULL, '已开始对CNIPA数据库进行初步核查。We are starting the preliminary check on CNIPA database.', 'text', NOW() - INTERVAL '9 days'),
  ('b2b2b2b2-b2b2-4b2b-b2b2-b2b2b2b2b2b2', '0090b656-5c9a-445c-91be-34228afb2b0f', 'Gracias, ¿cuándo estiman tener los resultados de la verificación?', 'text', NOW() - INTERVAL '8 days');
