-- ============================================================
-- IP-NEXUS: SISTEMA COMPLETO DE CLASIFICACIONES IP
-- Tablas para Niza (mejoradas), IPC, Locarno, Viena
-- ============================================================

-- 1. TIPO ENUM para sistemas de clasificación
DO $$ BEGIN
  CREATE TYPE classification_system AS ENUM ('nice', 'ipc', 'locarno', 'vienna');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2. TABLA MAESTRA DE SISTEMAS DE CLASIFICACIÓN
CREATE TABLE IF NOT EXISTS classification_systems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code classification_system NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  current_version TEXT NOT NULL,
  version_date DATE NOT NULL,
  source_url TEXT NOT NULL,
  last_sync_at TIMESTAMPTZ,
  next_sync_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  sync_status TEXT DEFAULT 'pending', -- pending, syncing, success, failed
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar sistemas base
INSERT INTO classification_systems (code, name, description, current_version, version_date, source_url) VALUES
('nice', 'Clasificación de Niza', 'Clasificación internacional de productos y servicios para el registro de marcas', 'NCL(13-2026)', '2026-01-01', 'https://www.wipo.int/classifications/nice/'),
('ipc', 'Clasificación Internacional de Patentes', 'Sistema jerárquico para clasificar patentes por área técnica', 'IPC-2026.01', '2026-01-01', 'https://www.wipo.int/classifications/ipc/'),
('locarno', 'Clasificación de Locarno', 'Clasificación internacional para diseños industriales', 'LOC(14-2025)', '2025-01-01', 'https://www.wipo.int/classifications/locarno/'),
('vienna', 'Clasificación de Viena', 'Clasificación de elementos figurativos de marcas', 'VCL(9-2026)', '2026-01-01', 'https://www.wipo.int/classifications/vienna/')
ON CONFLICT (code) DO NOTHING;

-- ============================================================
-- 3. CLASIFICACIÓN IPC (PATENTES) - ~74,000 códigos
-- ============================================================

-- Secciones IPC (8 secciones: A-H)
CREATE TABLE IF NOT EXISTS ipc_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code CHAR(1) NOT NULL UNIQUE,
  title_es TEXT NOT NULL,
  title_en TEXT,
  description_es TEXT,
  version TEXT NOT NULL DEFAULT 'IPC-2026.01',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar secciones IPC
INSERT INTO ipc_sections (code, title_es, title_en, description_es) VALUES
('A', 'Necesidades corrientes de la vida', 'Human Necessities', 'Agricultura, alimentación, tabaco, vestimenta, salud'),
('B', 'Técnicas industriales diversas; transportes', 'Performing Operations; Transporting', 'Separación, mezcla, conformado, impresión, transportes'),
('C', 'Química; metalurgia', 'Chemistry; Metallurgy', 'Química orgánica e inorgánica, metalurgia, bioquímica'),
('D', 'Textiles; papel', 'Textiles; Paper', 'Hilatura, tejido, fabricación de papel'),
('E', 'Construcciones fijas', 'Fixed Constructions', 'Edificios, minería, cerrajería'),
('F', 'Mecánica; iluminación; calefacción; armamento; voladura', 'Mechanical Engineering; Lighting; Heating; Weapons; Blasting', 'Motores, bombas, iluminación, armas'),
('G', 'Física', 'Physics', 'Instrumentos, óptica, metrología, computación'),
('H', 'Electricidad', 'Electricity', 'Generación, conversión, distribución de energía eléctrica')
ON CONFLICT (code) DO NOTHING;

-- Clases IPC (~130 clases)
CREATE TABLE IF NOT EXISTS ipc_classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES ipc_sections(id) ON DELETE CASCADE,
  code VARCHAR(3) NOT NULL UNIQUE,
  title_es TEXT NOT NULL,
  title_en TEXT,
  version TEXT NOT NULL DEFAULT 'IPC-2026.01',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subclases IPC (~640 subclases)
CREATE TABLE IF NOT EXISTS ipc_subclasses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES ipc_classes(id) ON DELETE CASCADE,
  code VARCHAR(4) NOT NULL UNIQUE,
  title_es TEXT NOT NULL,
  title_en TEXT,
  definition_es TEXT,
  version TEXT NOT NULL DEFAULT 'IPC-2026.01',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Grupos IPC (~74,000 grupos)
CREATE TABLE IF NOT EXISTS ipc_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subclass_id UUID NOT NULL REFERENCES ipc_subclasses(id) ON DELETE CASCADE,
  code VARCHAR(15) NOT NULL,
  title_es TEXT NOT NULL,
  title_en TEXT,
  is_main_group BOOLEAN DEFAULT false,
  parent_group_id UUID REFERENCES ipc_groups(id),
  hierarchy_level INTEGER DEFAULT 0,
  version TEXT NOT NULL DEFAULT 'IPC-2026.01',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(code, version)
);

-- Índices IPC
CREATE INDEX IF NOT EXISTS idx_ipc_groups_subclass ON ipc_groups(subclass_id);
CREATE INDEX IF NOT EXISTS idx_ipc_groups_code ON ipc_groups(code);
CREATE INDEX IF NOT EXISTS idx_ipc_groups_title_es ON ipc_groups USING gin(to_tsvector('spanish', title_es));

-- ============================================================
-- 4. CLASIFICACIÓN DE LOCARNO (DISEÑOS) - ~7,500 productos
-- ============================================================

-- Clases de Locarno (32 clases)
CREATE TABLE IF NOT EXISTS locarno_classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_number INTEGER NOT NULL UNIQUE CHECK (class_number BETWEEN 1 AND 99),
  title_es TEXT NOT NULL,
  title_en TEXT,
  note_es TEXT,
  version TEXT NOT NULL DEFAULT 'LOC(14-2025)',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subclases de Locarno
CREATE TABLE IF NOT EXISTS locarno_subclasses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES locarno_classes(id) ON DELETE CASCADE,
  code VARCHAR(10) NOT NULL,
  title_es TEXT NOT NULL,
  title_en TEXT,
  version TEXT NOT NULL DEFAULT 'LOC(14-2025)',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(code, version)
);

-- Productos de Locarno (~7,000)
CREATE TABLE IF NOT EXISTS locarno_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subclass_id UUID NOT NULL REFERENCES locarno_subclasses(id) ON DELETE CASCADE,
  item_number VARCHAR(15) NOT NULL,
  term_es TEXT NOT NULL,
  term_en TEXT,
  version TEXT NOT NULL DEFAULT 'LOC(14-2025)',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(item_number, version)
);

-- Índices Locarno
CREATE INDEX IF NOT EXISTS idx_locarno_items_subclass ON locarno_items(subclass_id);
CREATE INDEX IF NOT EXISTS idx_locarno_items_term_es ON locarno_items USING gin(to_tsvector('spanish', term_es));

-- ============================================================
-- 5. CLASIFICACIÓN DE VIENA (ELEMENTOS FIGURATIVOS) - ~2,000
-- ============================================================

-- Categorías de Viena (29 categorías)
CREATE TABLE IF NOT EXISTS vienna_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(2) NOT NULL UNIQUE,
  title_es TEXT NOT NULL,
  title_en TEXT,
  version TEXT NOT NULL DEFAULT 'VCL(9-2026)',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Divisiones de Viena
CREATE TABLE IF NOT EXISTS vienna_divisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES vienna_categories(id) ON DELETE CASCADE,
  code VARCHAR(5) NOT NULL,
  title_es TEXT NOT NULL,
  title_en TEXT,
  version TEXT NOT NULL DEFAULT 'VCL(9-2026)',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(code, version)
);

-- Secciones de Viena
CREATE TABLE IF NOT EXISTS vienna_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  division_id UUID NOT NULL REFERENCES vienna_divisions(id) ON DELETE CASCADE,
  code VARCHAR(10) NOT NULL,
  title_es TEXT NOT NULL,
  title_en TEXT,
  auxiliary_code VARCHAR(5),
  version TEXT NOT NULL DEFAULT 'VCL(9-2026)',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(code, version)
);

-- Índices Viena
CREATE INDEX IF NOT EXISTS idx_vienna_sections_division ON vienna_sections(division_id);
CREATE INDEX IF NOT EXISTS idx_vienna_sections_code ON vienna_sections(code);

-- ============================================================
-- 6. HISTORIAL DE SINCRONIZACIÓN
-- ============================================================

CREATE TABLE IF NOT EXISTS classification_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  classification_system classification_system NOT NULL,
  version_before TEXT,
  version_after TEXT NOT NULL,
  records_added INTEGER DEFAULT 0,
  records_updated INTEGER DEFAULT 0,
  records_deleted INTEGER DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  error_message TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 7. FUNCIONES DE BÚSQUEDA
-- ============================================================

-- Búsqueda en Niza
CREATE OR REPLACE FUNCTION search_nice_items(
  p_query TEXT,
  p_class_numbers INTEGER[] DEFAULT NULL,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  class_number INTEGER,
  class_title TEXT,
  basic_number TEXT,
  term TEXT,
  relevance REAL
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    np.id,
    np.class_number,
    nc.title_es,
    np.wipo_code,
    np.name_es,
    ts_rank(to_tsvector('spanish', np.name_es), plainto_tsquery('spanish', p_query)) AS relevance
  FROM nice_products np
  JOIN nice_classes nc ON np.class_number = nc.class_number
  WHERE 
    np.is_active = true
    AND (p_class_numbers IS NULL OR np.class_number = ANY(p_class_numbers))
    AND (
      to_tsvector('spanish', np.name_es) @@ plainto_tsquery('spanish', p_query)
      OR np.name_es ILIKE '%' || p_query || '%'
      OR np.wipo_code LIKE p_query || '%'
    )
  ORDER BY relevance DESC, np.class_number, np.wipo_code
  LIMIT p_limit;
END;
$$;

-- Búsqueda en IPC
CREATE OR REPLACE FUNCTION search_ipc_groups(
  p_query TEXT,
  p_section CHAR(1) DEFAULT NULL,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  full_code VARCHAR(15),
  section_code CHAR(1),
  class_code VARCHAR(3),
  subclass_code VARCHAR(4),
  title TEXT,
  relevance REAL
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ig.id,
    ig.code,
    s.code,
    c.code,
    sc.code,
    ig.title_es,
    ts_rank(to_tsvector('spanish', ig.title_es), plainto_tsquery('spanish', p_query)) AS relevance
  FROM ipc_groups ig
  JOIN ipc_subclasses sc ON ig.subclass_id = sc.id
  JOIN ipc_classes c ON sc.class_id = c.id
  JOIN ipc_sections s ON c.section_id = s.id
  WHERE 
    ig.is_active = true
    AND (p_section IS NULL OR s.code = p_section)
    AND (
      to_tsvector('spanish', ig.title_es) @@ plainto_tsquery('spanish', p_query)
      OR ig.title_es ILIKE '%' || p_query || '%'
      OR ig.code LIKE p_query || '%'
    )
  ORDER BY relevance DESC, ig.code
  LIMIT p_limit;
END;
$$;

-- Búsqueda en Locarno
CREATE OR REPLACE FUNCTION search_locarno_items(
  p_query TEXT,
  p_class_number INTEGER DEFAULT NULL,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  class_number INTEGER,
  class_title TEXT,
  subclass_code VARCHAR(10),
  item_number VARCHAR(15),
  term TEXT,
  relevance REAL
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    li.id,
    lc.class_number,
    lc.title_es,
    ls.code,
    li.item_number,
    li.term_es,
    ts_rank(to_tsvector('spanish', li.term_es), plainto_tsquery('spanish', p_query)) AS relevance
  FROM locarno_items li
  JOIN locarno_subclasses ls ON li.subclass_id = ls.id
  JOIN locarno_classes lc ON ls.class_id = lc.id
  WHERE 
    li.is_active = true
    AND (p_class_number IS NULL OR lc.class_number = p_class_number)
    AND (
      to_tsvector('spanish', li.term_es) @@ plainto_tsquery('spanish', p_query)
      OR li.term_es ILIKE '%' || p_query || '%'
      OR li.item_number LIKE p_query || '%'
    )
  ORDER BY relevance DESC, lc.class_number, li.item_number
  LIMIT p_limit;
END;
$$;

-- Búsqueda en Viena
CREATE OR REPLACE FUNCTION search_vienna_sections(
  p_query TEXT,
  p_category_code VARCHAR(2) DEFAULT NULL,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  category_code VARCHAR(2),
  category_title TEXT,
  division_code VARCHAR(5),
  section_code VARCHAR(10),
  title TEXT,
  relevance REAL
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    vs.id,
    vc.code,
    vc.title_es,
    vd.code,
    vs.code,
    vs.title_es,
    ts_rank(to_tsvector('spanish', vs.title_es), plainto_tsquery('spanish', p_query)) AS relevance
  FROM vienna_sections vs
  JOIN vienna_divisions vd ON vs.division_id = vd.id
  JOIN vienna_categories vc ON vd.category_id = vc.id
  WHERE 
    vs.is_active = true
    AND (p_category_code IS NULL OR vc.code = p_category_code)
    AND (
      to_tsvector('spanish', vs.title_es) @@ plainto_tsquery('spanish', p_query)
      OR vs.title_es ILIKE '%' || p_query || '%'
      OR vs.code LIKE p_query || '%'
    )
  ORDER BY relevance DESC, vs.code
  LIMIT p_limit;
END;
$$;

-- ============================================================
-- 8. RLS POLICIES (Datos públicos de solo lectura)
-- ============================================================

ALTER TABLE classification_systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE ipc_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE ipc_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ipc_subclasses ENABLE ROW LEVEL SECURITY;
ALTER TABLE ipc_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE locarno_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE locarno_subclasses ENABLE ROW LEVEL SECURITY;
ALTER TABLE locarno_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE vienna_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE vienna_divisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vienna_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE classification_sync_logs ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura pública para clasificaciones (datos oficiales WIPO)
CREATE POLICY "Classification systems are publicly readable" ON classification_systems FOR SELECT USING (true);
CREATE POLICY "IPC sections are publicly readable" ON ipc_sections FOR SELECT USING (true);
CREATE POLICY "IPC classes are publicly readable" ON ipc_classes FOR SELECT USING (true);
CREATE POLICY "IPC subclasses are publicly readable" ON ipc_subclasses FOR SELECT USING (true);
CREATE POLICY "IPC groups are publicly readable" ON ipc_groups FOR SELECT USING (true);
CREATE POLICY "Locarno classes are publicly readable" ON locarno_classes FOR SELECT USING (true);
CREATE POLICY "Locarno subclasses are publicly readable" ON locarno_subclasses FOR SELECT USING (true);
CREATE POLICY "Locarno items are publicly readable" ON locarno_items FOR SELECT USING (true);
CREATE POLICY "Vienna categories are publicly readable" ON vienna_categories FOR SELECT USING (true);
CREATE POLICY "Vienna divisions are publicly readable" ON vienna_divisions FOR SELECT USING (true);
CREATE POLICY "Vienna sections are publicly readable" ON vienna_sections FOR SELECT USING (true);
CREATE POLICY "Sync logs are publicly readable" ON classification_sync_logs FOR SELECT USING (true);