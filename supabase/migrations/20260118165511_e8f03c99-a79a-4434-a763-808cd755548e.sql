-- Añadir campo para imagen de marca
ALTER TABLE matters ADD COLUMN IF NOT EXISTS mark_image_url TEXT;

-- Añadir campo para múltiples imágenes (galería)
ALTER TABLE matters ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';

-- Actualizar tabla de documentos con más campos útiles
ALTER TABLE matter_documents ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE matter_documents ADD COLUMN IF NOT EXISTS is_official BOOLEAN DEFAULT false;
ALTER TABLE matter_documents ADD COLUMN IF NOT EXISTS document_date DATE;
ALTER TABLE matter_documents ADD COLUMN IF NOT EXISTS expiry_date DATE;

-- Crear bucket para archivos de expedientes
INSERT INTO storage.buckets (id, name, public)
VALUES ('matters', 'matters', false)
ON CONFLICT (id) DO NOTHING;

-- Policy para ver archivos de la organización
CREATE POLICY "Users can view org matter files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'matters' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM organizations WHERE id IN (
      SELECT organization_id FROM memberships WHERE user_id = auth.uid()
    )
  )
);

-- Policy para subir archivos
CREATE POLICY "Users can upload org matter files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'matters' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM organizations WHERE id IN (
      SELECT organization_id FROM memberships WHERE user_id = auth.uid()
    )
  )
);

-- Policy para actualizar archivos (upsert)
CREATE POLICY "Users can update org matter files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'matters' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM organizations WHERE id IN (
      SELECT organization_id FROM memberships WHERE user_id = auth.uid()
    )
  )
);

-- Policy para eliminar archivos (solo owners, admins, managers)
CREATE POLICY "Managers can delete org matter files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'matters' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM organizations WHERE id IN (
      SELECT organization_id FROM memberships 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin', 'manager')
    )
  )
);