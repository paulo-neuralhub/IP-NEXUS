-- ════════════════════════════════════════════════════════════════════════════
-- MEJORAR deadline_alerts: añadir columnas faltantes
-- ════════════════════════════════════════════════════════════════════════════

ALTER TABLE deadline_alerts 
  ADD COLUMN IF NOT EXISTS recipient_role TEXT,
  ADD COLUMN IF NOT EXISTS scheduled_for TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS message TEXT,
  ADD COLUMN IF NOT EXISTS response_data JSONB;

-- Actualizar CHECK constraints para alert_type y channel si no existen
DO $$
BEGIN
  -- Add escalation to alert_type if not present
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'deadline_alerts_alert_type_check'
  ) THEN
    ALTER TABLE deadline_alerts ADD CONSTRAINT deadline_alerts_alert_type_check 
    CHECK (alert_type IN ('reminder', 'warning', 'urgent', 'overdue', 'escalation', 'fatal'));
  END IF;
END $$;

-- Índices adicionales
CREATE INDEX IF NOT EXISTS idx_da_deadline ON deadline_alerts(deadline_id);
CREATE INDEX IF NOT EXISTS idx_da_scheduled ON deadline_alerts(scheduled_for) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_da_recipient ON deadline_alerts(recipient_id);
CREATE INDEX IF NOT EXISTS idx_da_status ON deadline_alerts(status);

-- Comentarios
COMMENT ON TABLE deadline_alerts IS 'Historial de alertas enviadas y programadas para plazos';
COMMENT ON COLUMN deadline_alerts.alert_type IS 'reminder, warning, urgent, overdue, escalation, fatal';