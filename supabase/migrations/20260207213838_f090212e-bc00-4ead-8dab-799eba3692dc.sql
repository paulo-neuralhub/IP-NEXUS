
-- Drop legacy FK on reviews
ALTER TABLE market_user_reviews DROP CONSTRAINT IF EXISTS market_user_reviews_transaction_id_fkey;

-- Reviews without transaction_id FK issue
INSERT INTO market_user_reviews (reviewed_user_id, reviewer_id, rating_overall, rating_communication, rating_quality, rating_timeliness, rating_value, title, comment, is_verified, is_visible, created_at) VALUES
('2d23bfdf-f5be-4085-a153-b71ceae2b436', '87d40bf6-7f54-40fa-87fc-d8c987159aed', 5, 5, 5, 4, 5, 'Excelente servicio', 'Búsqueda exhaustiva y presentación impecable. 100% recomendable.', true, true, NOW()-INTERVAL '4 days'),
('e9ba842c-0fbb-46d0-a1ac-ab204191f589', '87d40bf6-7f54-40fa-87fc-d8c987159aed', 4, 5, 4, 4, 4, 'Buen trabajo en EUIPO', 'Proceso profesional y comunicación clara.', true, true, NOW()-INTERVAL '20 days'),
('db59c32c-dcc2-4667-9280-e606188b9194', '87d40bf6-7f54-40fa-87fc-d8c987159aed', 5, 5, 5, 5, 5, 'Outstanding service', 'Incredibly efficient and professional UK filing.', true, true, NOW()-INTERVAL '30 days');
