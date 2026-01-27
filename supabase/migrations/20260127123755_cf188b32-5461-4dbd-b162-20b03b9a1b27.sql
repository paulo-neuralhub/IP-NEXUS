-- =====================================================
-- Consolidación: legal_deadlines -> ipo_offices
-- =====================================================

-- 1. Eliminar cualquier FK existente con ip_offices
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT constraint_name 
    FROM information_schema.table_constraints 
    WHERE table_name = 'legal_deadlines' 
      AND constraint_type = 'FOREIGN KEY'
      AND constraint_name LIKE '%office%'
  ) LOOP
    EXECUTE 'ALTER TABLE public.legal_deadlines DROP CONSTRAINT IF EXISTS ' || r.constraint_name;
  END LOOP;
END $$;

-- 2. Crear FK hacia ipo_offices
ALTER TABLE public.legal_deadlines
  ADD CONSTRAINT legal_deadlines_office_id_fkey 
  FOREIGN KEY (office_id) 
  REFERENCES public.ipo_offices(id)
  ON DELETE SET NULL;

-- 3. Comentario para documentar
COMMENT ON COLUMN public.legal_deadlines.office_id IS 'Referencia a ipo_offices.id';
