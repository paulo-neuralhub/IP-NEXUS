-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- CRM Configuration Seed Data for Demo Organizations
-- ═══════════════════════════════════════════════════════════════════════════════════════════

-- Tipos de cliente para Enterprise Total
INSERT INTO public.client_type_config (organization_id, code, name, description, color, is_default, sort_order)
VALUES 
  ('a1000000-0000-0000-0000-000000000001', 'direct', 'Cliente Directo', 'Cliente final que contrata servicios directamente', '#3B82F6', true, 1),
  ('a1000000-0000-0000-0000-000000000001', 'agent', 'Agente PI', 'Agente de propiedad industrial que deriva trabajo', '#8B5CF6', false, 2),
  ('a1000000-0000-0000-0000-000000000001', 'group', 'Empresa Grupo', 'Empresa que pertenece a un grupo corporativo', '#22C55E', false, 3),
  ('a1000000-0000-0000-0000-000000000001', 'partner', 'Colaborador', 'Partner o colaborador estratégico', '#F97316', false, 4),
  ('a1000000-0000-0000-0000-000000000001', 'prospect', 'Prospecto', 'Cliente potencial en fase de evaluación', '#6B7280', false, 5)
ON CONFLICT (organization_id, code) DO UPDATE SET 
  name = EXCLUDED.name, 
  color = EXCLUDED.color,
  description = EXCLUDED.description;

-- Tipos de cliente para Pro Completo
INSERT INTO public.client_type_config (organization_id, code, name, description, color, is_default, sort_order)
VALUES 
  ('a2000000-0000-0000-0000-000000000002', 'direct', 'Cliente Directo', 'Cliente final que contrata servicios directamente', '#3B82F6', true, 1),
  ('a2000000-0000-0000-0000-000000000002', 'agent', 'Agente PI', 'Agente de propiedad industrial que deriva trabajo', '#8B5CF6', false, 2),
  ('a2000000-0000-0000-0000-000000000002', 'group', 'Empresa Grupo', 'Empresa que pertenece a un grupo corporativo', '#22C55E', false, 3),
  ('a2000000-0000-0000-0000-000000000002', 'partner', 'Colaborador', 'Partner o colaborador estratégico', '#F97316', false, 4),
  ('a2000000-0000-0000-0000-000000000002', 'prospect', 'Prospecto', 'Cliente potencial en fase de evaluación', '#6B7280', false, 5)
ON CONFLICT (organization_id, code) DO UPDATE SET 
  name = EXCLUDED.name, 
  color = EXCLUDED.color;

-- Clasificaciones de pago para Enterprise Total
INSERT INTO public.payment_classification_config (organization_id, code, name, description, color, alert_level, is_default, sort_order)
VALUES 
  ('a1000000-0000-0000-0000-000000000001', 'excellent', 'Excelente Pagador', 'Paga siempre a tiempo o anticipado', '#22C55E', 'none', true, 1),
  ('a1000000-0000-0000-0000-000000000001', 'normal', 'Pago Normal', 'Paga dentro del plazo habitual', '#EAB308', 'none', false, 2),
  ('a1000000-0000-0000-0000-000000000001', 'slow', 'Pago Lento', 'Suele retrasarse en los pagos', '#F97316', 'warning', false, 3),
  ('a1000000-0000-0000-0000-000000000001', 'risk', 'Riesgo de Cobro', 'Alto riesgo de impago', '#EF4444', 'warning', false, 4),
  ('a1000000-0000-0000-0000-000000000001', 'provision', 'Requiere Provisión', 'Necesita pago anticipado', '#3B82F6', 'warning', false, 5),
  ('a1000000-0000-0000-0000-000000000001', 'litigation', 'En Litigio', 'Disputa legal por cobros', '#1E293B', 'critical', false, 6)
ON CONFLICT (organization_id, code) DO UPDATE SET 
  name = EXCLUDED.name, 
  color = EXCLUDED.color;

-- Clasificaciones de pago para Pro Completo
INSERT INTO public.payment_classification_config (organization_id, code, name, description, color, alert_level, is_default, sort_order)
VALUES 
  ('a2000000-0000-0000-0000-000000000002', 'excellent', 'Excelente Pagador', 'Paga siempre a tiempo o anticipado', '#22C55E', 'none', true, 1),
  ('a2000000-0000-0000-0000-000000000002', 'normal', 'Pago Normal', 'Paga dentro del plazo habitual', '#EAB308', 'none', false, 2),
  ('a2000000-0000-0000-0000-000000000002', 'slow', 'Pago Lento', 'Suele retrasarse en los pagos', '#F97316', 'warning', false, 3),
  ('a2000000-0000-0000-0000-000000000002', 'risk', 'Riesgo de Cobro', 'Alto riesgo de impago', '#EF4444', 'warning', false, 4),
  ('a2000000-0000-0000-0000-000000000002', 'provision', 'Requiere Provisión', 'Necesita pago anticipado', '#3B82F6', 'warning', false, 5),
  ('a2000000-0000-0000-0000-000000000002', 'litigation', 'En Litigio', 'Disputa legal por cobros', '#1E293B', 'critical', false, 6)
ON CONFLICT (organization_id, code) DO UPDATE SET 
  name = EXCLUDED.name, 
  color = EXCLUDED.color;

-- Roles de contacto para Enterprise Total
INSERT INTO public.contact_role_config (organization_id, code, name, description, icon, is_unique, sort_order)
VALUES 
  ('a1000000-0000-0000-0000-000000000001', 'principal', 'Contacto Principal', 'Contacto principal de la cuenta', '⭐', true, 1),
  ('a1000000-0000-0000-0000-000000000001', 'legal', 'Legal', 'Contacto para asuntos legales', '⚖️', false, 2),
  ('a1000000-0000-0000-0000-000000000001', 'billing', 'Facturación', 'Contacto para temas de facturación', '💰', false, 3),
  ('a1000000-0000-0000-0000-000000000001', 'notifications', 'Notificaciones', 'Recibe notificaciones y alertas', '🔔', false, 4),
  ('a1000000-0000-0000-0000-000000000001', 'signer', 'Firmante', 'Autorizado para firmar documentos', '✍️', false, 5),
  ('a1000000-0000-0000-0000-000000000001', 'operative', 'Operativo', 'Contacto para gestiones operativas', '📞', false, 6)
ON CONFLICT (organization_id, code) DO UPDATE SET 
  name = EXCLUDED.name, 
  icon = EXCLUDED.icon;

-- Roles de contacto para Pro Completo
INSERT INTO public.contact_role_config (organization_id, code, name, description, icon, is_unique, sort_order)
VALUES 
  ('a2000000-0000-0000-0000-000000000002', 'principal', 'Contacto Principal', 'Contacto principal de la cuenta', '⭐', true, 1),
  ('a2000000-0000-0000-0000-000000000002', 'legal', 'Legal', 'Contacto para asuntos legales', '⚖️', false, 2),
  ('a2000000-0000-0000-0000-000000000002', 'billing', 'Facturación', 'Contacto para temas de facturación', '💰', false, 3),
  ('a2000000-0000-0000-0000-000000000002', 'notifications', 'Notificaciones', 'Recibe notificaciones y alertas', '🔔', false, 4),
  ('a2000000-0000-0000-0000-000000000002', 'signer', 'Firmante', 'Autorizado para firmar documentos', '✍️', false, 5),
  ('a2000000-0000-0000-0000-000000000002', 'operative', 'Operativo', 'Contacto para gestiones operativas', '📞', false, 6)
ON CONFLICT (organization_id, code) DO UPDATE SET 
  name = EXCLUDED.name, 
  icon = EXCLUDED.icon;

-- Categorías de etiquetas para Enterprise Total
INSERT INTO public.client_tag_categories (id, organization_id, name, sort_order)
VALUES 
  ('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'Sector', 1),
  ('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'Comportamiento', 2),
  ('b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 'Prioridad', 3)
ON CONFLICT (id) DO NOTHING;

-- Categorías de etiquetas para Pro Completo
INSERT INTO public.client_tag_categories (id, organization_id, name, sort_order)
VALUES 
  ('b2000000-0000-0000-0000-000000000001', 'a2000000-0000-0000-0000-000000000002', 'Sector', 1),
  ('b2000000-0000-0000-0000-000000000002', 'a2000000-0000-0000-0000-000000000002', 'Comportamiento', 2),
  ('b2000000-0000-0000-0000-000000000003', 'a2000000-0000-0000-0000-000000000002', 'Prioridad', 3)
ON CONFLICT (id) DO NOTHING;

-- Etiquetas para Enterprise Total
INSERT INTO public.client_tag_config (organization_id, category_id, name, color, sort_order)
VALUES 
  -- Sector
  ('a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'Pharma', '#EC4899', 1),
  ('a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'Tech', '#3B82F6', 2),
  ('a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'FMCG', '#22C55E', 3),
  ('a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'Fintech', '#8B5CF6', 4),
  ('a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'Retail', '#F59E0B', 5),
  -- Comportamiento
  ('a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000002', 'Startup', '#F97316', 1),
  ('a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000002', 'Multinacional', '#0EA5E9', 2),
  ('a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000002', 'Familiar', '#14B8A6', 3),
  ('a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000002', 'Pyme', '#6366F1', 4),
  -- Prioridad
  ('a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000003', 'VIP', '#EAB308', 1),
  ('a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000003', 'Estratégico', '#EF4444', 2),
  ('a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000003', 'En Crecimiento', '#22C55E', 3);

-- Etiquetas para Pro Completo
INSERT INTO public.client_tag_config (organization_id, category_id, name, color, sort_order)
VALUES 
  -- Sector
  ('a2000000-0000-0000-0000-000000000002', 'b2000000-0000-0000-0000-000000000001', 'Pharma', '#EC4899', 1),
  ('a2000000-0000-0000-0000-000000000002', 'b2000000-0000-0000-0000-000000000001', 'Tech', '#3B82F6', 2),
  ('a2000000-0000-0000-0000-000000000002', 'b2000000-0000-0000-0000-000000000001', 'FMCG', '#22C55E', 3),
  ('a2000000-0000-0000-0000-000000000002', 'b2000000-0000-0000-0000-000000000001', 'Fintech', '#8B5CF6', 4),
  -- Comportamiento
  ('a2000000-0000-0000-0000-000000000002', 'b2000000-0000-0000-0000-000000000002', 'Startup', '#F97316', 1),
  ('a2000000-0000-0000-0000-000000000002', 'b2000000-0000-0000-0000-000000000002', 'Multinacional', '#0EA5E9', 2),
  ('a2000000-0000-0000-0000-000000000002', 'b2000000-0000-0000-0000-000000000002', 'Familiar', '#14B8A6', 3),
  -- Prioridad
  ('a2000000-0000-0000-0000-000000000002', 'b2000000-0000-0000-0000-000000000003', 'VIP', '#EAB308', 1),
  ('a2000000-0000-0000-0000-000000000002', 'b2000000-0000-0000-0000-000000000003', 'Estratégico', '#EF4444', 2);