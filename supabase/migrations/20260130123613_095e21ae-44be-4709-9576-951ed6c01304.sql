-- ================================================
-- SISTEMA DE CARPETAS DE CLIENTE
-- ================================================

-- CARPETAS DE CLIENTE
CREATE TABLE IF NOT EXISTS client_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  folder_type TEXT NOT NULL CHECK (folder_type IN ('contratos', 'cartas', 'informes', 'facturas', 'documentos_oficiales', 'otros')),
  parent_id UUID REFERENCES client_folders(id) ON DELETE CASCADE,
  
  description TEXT,
  color TEXT,
  icon TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice único para evitar duplicados (sin COALESCE en constraint)
CREATE UNIQUE INDEX IF NOT EXISTS idx_client_folders_unique 
  ON client_folders(client_id, name, parent_id) 
  WHERE parent_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_client_folders_unique_root 
  ON client_folders(client_id, name) 
  WHERE parent_id IS NULL;

-- DOCUMENTOS EN CARPETAS
CREATE TABLE IF NOT EXISTS client_folder_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  folder_id UUID NOT NULL REFERENCES client_folders(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  
  source_type TEXT CHECK (source_type IN ('generated_document', 'uploaded', 'email_attachment', 'matter_document')),
  source_id UUID,
  
  name TEXT NOT NULL,
  file_type TEXT,
  file_url TEXT,
  file_size INTEGER,
  
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  
  uploaded_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_client_folders_client ON client_folders(client_id);
CREATE INDEX IF NOT EXISTS idx_client_folders_org ON client_folders(organization_id);
CREATE INDEX IF NOT EXISTS idx_client_folder_docs_folder ON client_folder_documents(folder_id);
CREATE INDEX IF NOT EXISTS idx_client_folder_docs_client ON client_folder_documents(client_id);
CREATE INDEX IF NOT EXISTS idx_client_folder_docs_org ON client_folder_documents(organization_id);

-- RLS
ALTER TABLE client_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_folder_documents ENABLE ROW LEVEL SECURITY;

-- Policies para client_folders
CREATE POLICY "Members can view client folders" ON client_folders
  FOR SELECT USING (
    organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
  );

CREATE POLICY "Members can insert client folders" ON client_folders
  FOR INSERT WITH CHECK (
    organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
  );

CREATE POLICY "Members can update client folders" ON client_folders
  FOR UPDATE USING (
    organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
  );

CREATE POLICY "Members can delete client folders" ON client_folders
  FOR DELETE USING (
    organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
  );

-- Policies para client_folder_documents
CREATE POLICY "Members can view folder documents" ON client_folder_documents
  FOR SELECT USING (
    organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
  );

CREATE POLICY "Members can insert folder documents" ON client_folder_documents
  FOR INSERT WITH CHECK (
    organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
  );

CREATE POLICY "Members can update folder documents" ON client_folder_documents
  FOR UPDATE USING (
    organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
  );

CREATE POLICY "Members can delete folder documents" ON client_folder_documents
  FOR DELETE USING (
    organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
  );

-- FUNCIÓN: Crear carpetas automáticas al crear cliente
CREATE OR REPLACE FUNCTION create_default_client_folders()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  folder_types TEXT[] := ARRAY['contratos', 'cartas', 'informes', 'facturas', 'documentos_oficiales', 'otros'];
  folder_names TEXT[] := ARRAY['Contratos', 'Cartas', 'Informes', 'Facturas', 'Documentos Oficiales', 'Otros'];
  i INTEGER;
BEGIN
  IF NEW.type IN ('company', 'person') THEN
    FOR i IN 1..array_length(folder_types, 1) LOOP
      INSERT INTO client_folders (organization_id, client_id, name, folder_type)
      VALUES (NEW.organization_id, NEW.id, folder_names[i], folder_types[i])
      ON CONFLICT DO NOTHING;
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_create_client_folders ON contacts;
CREATE TRIGGER trigger_create_client_folders
  AFTER INSERT ON contacts
  FOR EACH ROW
  EXECUTE FUNCTION create_default_client_folders();