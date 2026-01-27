-- =============================================
-- FASE 1-C: Completar Timeline y Parties
-- =============================================

-- 1. AÑADIR COLUMNAS FALTANTES A matter_timeline
ALTER TABLE matter_timeline ADD COLUMN IF NOT EXISTS reference_type VARCHAR(30);
ALTER TABLE matter_timeline ADD COLUMN IF NOT EXISTS reference_id UUID;
ALTER TABLE matter_timeline ADD COLUMN IF NOT EXISTS actor_type VARCHAR(20) DEFAULT 'user';
ALTER TABLE matter_timeline ADD COLUMN IF NOT EXISTS actor_user_id UUID;
ALTER TABLE matter_timeline ADD COLUMN IF NOT EXISTS actor_name VARCHAR(200);
ALTER TABLE matter_timeline ADD COLUMN IF NOT EXISTS is_internal BOOLEAN DEFAULT FALSE;
ALTER TABLE matter_timeline ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT FALSE;

-- 2. AÑADIR COLUMNAS FALTANTES A matter_parties
ALTER TABLE matter_parties ADD COLUMN IF NOT EXISTS filing_id UUID;
ALTER TABLE matter_parties ADD COLUMN IF NOT EXISTS party_type VARCHAR(30);
ALTER TABLE matter_parties ADD COLUMN IF NOT EXISTS role_detail VARCHAR(100);
ALTER TABLE matter_parties ADD COLUMN IF NOT EXISTS external_name_local VARCHAR(500);
ALTER TABLE matter_parties ADD COLUMN IF NOT EXISTS inventor_nationality VARCHAR(3);
ALTER TABLE matter_parties ADD COLUMN IF NOT EXISTS inventor_residence VARCHAR(3);
ALTER TABLE matter_parties ADD COLUMN IF NOT EXISTS inventor_id_number VARCHAR(30);
ALTER TABLE matter_parties ADD COLUMN IF NOT EXISTS employment_status VARCHAR(30);
ALTER TABLE matter_parties ADD COLUMN IF NOT EXISTS assignment_status VARCHAR(30);
ALTER TABLE matter_parties ADD COLUMN IF NOT EXISTS assignment_date DATE;
ALTER TABLE matter_parties ADD COLUMN IF NOT EXISTS oath_declaration_status VARCHAR(30);
ALTER TABLE matter_parties ADD COLUMN IF NOT EXISTS oath_declaration_date DATE;
ALTER TABLE matter_parties ADD COLUMN IF NOT EXISTS entity_status VARCHAR(20);
ALTER TABLE matter_parties ADD COLUMN IF NOT EXISTS entity_status_date DATE;
ALTER TABLE matter_parties ADD COLUMN IF NOT EXISTS poa_type VARCHAR(20);
ALTER TABLE matter_parties ADD COLUMN IF NOT EXISTS poa_reference VARCHAR(50);
ALTER TABLE matter_parties ADD COLUMN IF NOT EXISTS poa_date DATE;
ALTER TABLE matter_parties ADD COLUMN IF NOT EXISTS poa_expiry DATE;
ALTER TABLE matter_parties ADD COLUMN IF NOT EXISTS poa_document_id UUID;
ALTER TABLE matter_parties ADD COLUMN IF NOT EXISTS effective_from DATE;
ALTER TABLE matter_parties ADD COLUMN IF NOT EXISTS effective_to DATE;
ALTER TABLE matter_parties ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Sincronizar party_type con party_role existente
UPDATE matter_parties SET party_type = party_role WHERE party_type IS NULL AND party_role IS NOT NULL;

-- 3. ÍNDICES ADICIONALES
CREATE INDEX IF NOT EXISTS idx_timeline_matter_date ON matter_timeline(matter_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_timeline_filing ON matter_timeline(filing_id, created_at DESC) WHERE filing_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_timeline_type ON matter_timeline(event_type);
CREATE INDEX IF NOT EXISTS idx_timeline_category ON matter_timeline(event_category);
CREATE INDEX IF NOT EXISTS idx_timeline_internal ON matter_timeline(is_internal) WHERE is_internal = FALSE;

CREATE INDEX IF NOT EXISTS idx_parties_filing ON matter_parties(filing_id) WHERE filing_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_parties_type ON matter_parties(party_type);
CREATE INDEX IF NOT EXISTS idx_parties_active ON matter_parties(is_active) WHERE is_active = TRUE;

-- 4. FUNCIÓN: Registrar Evento en Timeline (mejorada)
CREATE OR REPLACE FUNCTION public.log_matter_event(
  p_organization_id UUID,
  p_matter_id UUID,
  p_filing_id UUID,
  p_event_type VARCHAR,
  p_title VARCHAR,
  p_description TEXT DEFAULT NULL,
  p_old_value JSONB DEFAULT NULL,
  p_new_value JSONB DEFAULT NULL,
  p_reference_type VARCHAR DEFAULT NULL,
  p_reference_id UUID DEFAULT NULL,
  p_is_internal BOOLEAN DEFAULT FALSE
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_event_id UUID;
  v_actor_id UUID;
  v_actor_name VARCHAR;
  v_category VARCHAR;
BEGIN
  -- Obtener actor actual
  v_actor_id := auth.uid();
  SELECT full_name INTO v_actor_name FROM users WHERE id = v_actor_id;
  
  -- Determinar categoría automáticamente
  v_category := CASE 
    WHEN p_event_type ILIKE '%status%' THEN 'status'
    WHEN p_event_type ILIKE '%document%' THEN 'document'
    WHEN p_event_type ILIKE '%communication%' OR p_event_type ILIKE '%email%' OR p_event_type ILIKE '%message%' THEN 'communication'
    WHEN p_event_type ILIKE '%deadline%' OR p_event_type ILIKE '%reminder%' THEN 'deadline'
    WHEN p_event_type ILIKE '%task%' THEN 'task'
    WHEN p_event_type ILIKE '%payment%' OR p_event_type ILIKE '%invoice%' OR p_event_type ILIKE '%fee%' THEN 'financial'
    WHEN p_event_type ILIKE '%party%' OR p_event_type ILIKE '%inventor%' OR p_event_type ILIKE '%applicant%' THEN 'party'
    WHEN p_event_type ILIKE '%filing%' THEN 'filing'
    WHEN p_event_type ILIKE '%created%' OR p_event_type ILIKE '%updated%' OR p_event_type ILIKE '%deleted%' THEN 'lifecycle'
    ELSE 'general'
  END;
  
  INSERT INTO matter_timeline (
    organization_id, matter_id, filing_id,
    event_type, event_category,
    title, description,
    old_value, new_value,
    reference_type, reference_id,
    actor_type, actor_user_id, actor_name,
    is_internal, metadata, created_at
  ) VALUES (
    p_organization_id, p_matter_id, p_filing_id,
    p_event_type, v_category,
    p_title, p_description,
    p_old_value, p_new_value,
    p_reference_type, p_reference_id,
    CASE WHEN v_actor_id IS NULL THEN 'system' ELSE 'user' END,
    v_actor_id, COALESCE(v_actor_name, 'Sistema'),
    p_is_internal, '{}', NOW()
  )
  RETURNING id INTO v_event_id;
  
  RETURN v_event_id;
END;
$$;

-- 5. TRIGGER: Auto-log en matters_v2
CREATE OR REPLACE FUNCTION public.trigger_matter_timeline()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.log_matter_event(
      NEW.organization_id, 
      NEW.id, 
      NULL,
      'matter_created', 
      'Expediente creado',
      'Nuevo expediente: ' || NEW.matter_number,
      NULL,
      jsonb_build_object(
        'matter_number', NEW.matter_number,
        'title', NEW.title,
        'type', COALESCE(NEW.type_code, NEW.matter_type),
        'status', NEW.status
      )
    );
  ELSIF TG_OP = 'UPDATE' THEN
    -- Log cambio de estado
    IF OLD.status IS DISTINCT FROM NEW.status THEN
      PERFORM public.log_matter_event(
        NEW.organization_id, 
        NEW.id, 
        NULL,
        'status_changed', 
        'Estado cambiado a ' || NEW.status,
        NULL,
        jsonb_build_object('status', OLD.status),
        jsonb_build_object('status', NEW.status)
      );
    END IF;
    
    -- Log cambio de responsable
    IF OLD.responsible_id IS DISTINCT FROM NEW.responsible_id THEN
      PERFORM public.log_matter_event(
        NEW.organization_id, 
        NEW.id, 
        NULL,
        'responsible_changed', 
        'Responsable reasignado',
        NULL,
        jsonb_build_object('responsible_id', OLD.responsible_id),
        jsonb_build_object('responsible_id', NEW.responsible_id)
      );
    END IF;
    
    -- Log archivo/desarchivo
    IF OLD.is_archived IS DISTINCT FROM NEW.is_archived THEN
      PERFORM public.log_matter_event(
        NEW.organization_id, 
        NEW.id, 
        NULL,
        CASE WHEN NEW.is_archived THEN 'matter_archived' ELSE 'matter_unarchived' END,
        CASE WHEN NEW.is_archived THEN 'Expediente archivado' ELSE 'Expediente desarchivado' END
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_matter_timeline ON matters_v2;
CREATE TRIGGER trg_matter_timeline
  AFTER INSERT OR UPDATE ON matters_v2
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_matter_timeline();

-- 6. TRIGGER: Auto-log en matter_filings
CREATE OR REPLACE FUNCTION public.trigger_filing_timeline()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.log_matter_event(
      NEW.organization_id, 
      NEW.matter_id, 
      NEW.id,
      'filing_added', 
      'Filing añadido: ' || NEW.jurisdiction_code,
      'Nueva presentación en jurisdicción ' || NEW.jurisdiction_code,
      NULL,
      jsonb_build_object(
        'jurisdiction_code', NEW.jurisdiction_code,
        'application_number', NEW.application_number,
        'filing_date', NEW.filing_date
      )
    );
  ELSIF TG_OP = 'UPDATE' THEN
    -- Log cambio de estado
    IF OLD.status IS DISTINCT FROM NEW.status THEN
      PERFORM public.log_matter_event(
        NEW.organization_id, 
        NEW.matter_id, 
        NEW.id,
        'filing_status_changed', 
        'Estado de ' || NEW.jurisdiction_code || ' cambiado a ' || COALESCE(NEW.status, 'N/A'),
        NULL,
        jsonb_build_object('status', OLD.status),
        jsonb_build_object('status', NEW.status)
      );
    END IF;
    
    -- Log número de registro asignado
    IF OLD.registration_number IS NULL AND NEW.registration_number IS NOT NULL THEN
      PERFORM public.log_matter_event(
        NEW.organization_id, 
        NEW.matter_id, 
        NEW.id,
        'registration_granted', 
        'Registro concedido: ' || NEW.registration_number,
        'Número de registro: ' || NEW.registration_number || ' en ' || NEW.jurisdiction_code,
        NULL,
        jsonb_build_object('registration_number', NEW.registration_number, 'registration_date', NEW.registration_date)
      );
    END IF;
    
    -- Log número de publicación
    IF OLD.publication_number IS NULL AND NEW.publication_number IS NOT NULL THEN
      PERFORM public.log_matter_event(
        NEW.organization_id, 
        NEW.matter_id, 
        NEW.id,
        'filing_published', 
        'Publicado: ' || NEW.publication_number,
        NULL,
        NULL,
        jsonb_build_object('publication_number', NEW.publication_number, 'publication_date', NEW.publication_date)
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_filing_timeline ON matter_filings;
CREATE TRIGGER trg_filing_timeline
  AFTER INSERT OR UPDATE ON matter_filings
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_filing_timeline();

-- 7. TRIGGER: Auto-log en matter_parties
CREATE OR REPLACE FUNCTION public.trigger_party_timeline()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_party_name TEXT;
BEGIN
  -- Obtener nombre del party
  v_party_name := COALESCE(
    (SELECT name FROM contacts WHERE id = NEW.contact_id),
    (SELECT name FROM contacts WHERE id = NEW.client_id),
    NEW.external_name,
    'Parte sin nombre'
  );

  IF TG_OP = 'INSERT' THEN
    PERFORM public.log_matter_event(
      NEW.organization_id, 
      NEW.matter_id, 
      NEW.filing_id,
      'party_added', 
      COALESCE(NEW.party_type, NEW.party_role) || ' añadido: ' || v_party_name,
      NULL,
      NULL,
      jsonb_build_object(
        'party_type', COALESCE(NEW.party_type, NEW.party_role),
        'party_name', v_party_name,
        'is_primary', NEW.is_primary
      ),
      'party', NEW.id
    );
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.log_matter_event(
      OLD.organization_id, 
      OLD.matter_id, 
      OLD.filing_id,
      'party_removed', 
      COALESCE(OLD.party_type, OLD.party_role) || ' eliminado',
      NULL,
      jsonb_build_object('party_type', COALESCE(OLD.party_type, OLD.party_role), 'party_name', v_party_name),
      NULL,
      'party', OLD.id
    );
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_party_timeline ON matter_parties;
CREATE TRIGGER trg_party_timeline
  AFTER INSERT OR DELETE ON matter_parties
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_party_timeline();

-- 8. TRIGGER: updated_at para matter_parties
DROP TRIGGER IF EXISTS trg_matter_parties_updated ON matter_parties;
CREATE TRIGGER trg_matter_parties_updated
  BEFORE UPDATE ON matter_parties
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 9. FOREIGN KEY para filing_id en matter_parties
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'matter_parties_filing_id_fkey'
  ) THEN
    ALTER TABLE matter_parties 
    ADD CONSTRAINT matter_parties_filing_id_fkey 
    FOREIGN KEY (filing_id) REFERENCES matter_filings(id) ON DELETE CASCADE;
  END IF;
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;