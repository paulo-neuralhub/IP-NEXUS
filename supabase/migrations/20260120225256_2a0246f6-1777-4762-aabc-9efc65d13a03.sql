-- Fix remaining Security Definer Views - Change to SECURITY INVOKER
-- These views need to respect the RLS policies of underlying tables

-- Recreate ipo_health_overview with security_invoker
DROP VIEW IF EXISTS ipo_health_overview;
CREATE OR REPLACE VIEW ipo_health_overview
WITH (security_invoker = true)
AS
SELECT o.id,
    o.code,
    o.name_official,
    o.name_short,
    o.tier,
    o.region,
    o.status AS office_status,
    cm.id AS connection_method_id,
    cm.method_type,
    cm.health_status,
    cm.last_successful_sync,
    cm.consecutive_failures,
    cm.success_rate_7d,
    cm.avg_response_time_ms,
    CASE
        WHEN cm.health_status = 'healthy' THEN 'green'
        WHEN cm.health_status = 'degraded' THEN 'yellow'
        WHEN cm.health_status = 'unhealthy' THEN 'red'
        ELSE 'gray'
    END AS traffic_light
FROM ipo_offices o
LEFT JOIN ipo_connection_methods cm ON o.id = cm.office_id AND cm.is_enabled = true AND cm.priority = 1
WHERE o.status = 'active';

-- Recreate ipo_expiring_credentials with security_invoker
DROP VIEW IF EXISTS ipo_expiring_credentials;
CREATE OR REPLACE VIEW ipo_expiring_credentials
WITH (security_invoker = true)
AS
SELECT o.code,
    o.name_short,
    c.credential_type,
    c.expires_at,
    (c.expires_at - CURRENT_DATE::timestamp with time zone) AS days_until_expiry
FROM ipo_credentials c
JOIN ipo_connection_methods cm ON c.connection_method_id = cm.id
JOIN ipo_offices o ON cm.office_id = o.id
WHERE c.is_active = true 
    AND c.expires_at IS NOT NULL 
    AND c.expires_at <= (CURRENT_DATE + '60 days'::interval)
ORDER BY c.expires_at;