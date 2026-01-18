-- Fix security issues: Enable RLS on gazette_sources and set search_path on functions

-- Enable RLS on gazette_sources (public read, no public write)
ALTER TABLE gazette_sources ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read gazette_sources (they are reference data)
CREATE POLICY "Anyone can read gazette_sources" ON gazette_sources FOR SELECT USING (true);

-- Fix function search_path issues
CREATE OR REPLACE FUNCTION create_alert_from_result()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.priority IN ('high', 'critical') AND NEW.status = 'new' THEN
    INSERT INTO spider_alerts (
      organization_id, watchlist_id, watch_result_id,
      alert_type, title, message, severity, data
    ) VALUES (
      NEW.organization_id,
      NEW.watchlist_id,
      NEW.id,
      CASE 
        WHEN NEW.result_type = 'trademark_filing' THEN 'new_conflict'
        WHEN NEW.result_type = 'trademark_published' THEN 'opposition_window'
        ELSE 'high_similarity'
      END,
      NEW.title,
      COALESCE(NEW.description, 'Se ha detectado un resultado que requiere atención'),
      NEW.priority,
      jsonb_build_object(
        'similarity_score', NEW.similarity_score,
        'source', NEW.source,
        'source_url', NEW.source_url
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_watchlist_timestamp()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;