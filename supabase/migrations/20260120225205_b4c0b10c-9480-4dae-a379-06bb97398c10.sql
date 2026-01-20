-- Create Security Invoker Views
-- These views respect the RLS policies of underlying tables

-- Create matter_deadline_summary with security_invoker
CREATE OR REPLACE VIEW matter_deadline_summary 
WITH (security_invoker = true)
AS
SELECT 
  m.id as matter_id,
  m.reference,
  m.title,
  m.organization_id,
  md.id as deadline_id,
  md.title as deadline_title,
  md.deadline_date,
  md.status as deadline_status,
  md.priority
FROM matters m
LEFT JOIN matter_deadlines md ON md.matter_id = m.id
WHERE md.deadline_date >= CURRENT_DATE;

-- Create organization_usage_stats with security_invoker
CREATE OR REPLACE VIEW organization_usage_stats
WITH (security_invoker = true)
AS
SELECT 
  o.id as organization_id,
  o.name,
  COUNT(DISTINCT m.id) as total_matters,
  COUNT(DISTINCT c.id) as total_contacts,
  COUNT(DISTINCT mb.user_id) as total_users
FROM organizations o
LEFT JOIN matters m ON m.organization_id = o.id
LEFT JOIN contacts c ON c.organization_id = o.id
LEFT JOIN memberships mb ON mb.organization_id = o.id
GROUP BY o.id, o.name;