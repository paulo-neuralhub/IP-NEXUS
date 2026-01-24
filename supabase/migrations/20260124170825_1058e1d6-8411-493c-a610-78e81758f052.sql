-- ============================================
-- Complete storage bucket setup with RLS
-- ============================================

-- Ensure all required buckets exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('documents', 'documents', false, 10485760, ARRAY['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','image/jpeg','image/png']::text[]),
  ('images', 'images', true, 5242880, ARRAY['image/jpeg','image/png','image/webp','image/svg+xml']::text[])
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Update existing buckets to ensure proper configuration
UPDATE storage.buckets SET
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document','image/jpeg','image/png']::text[]
WHERE id = 'matter-documents';

UPDATE storage.buckets SET
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document','image/jpeg','image/png']::text[]
WHERE id = 'client-documents';

UPDATE storage.buckets SET
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['application/pdf']::text[]
WHERE id = 'invoices';

UPDATE storage.buckets SET
  file_size_limit = 5242880,
  public = true,
  allowed_mime_types = ARRAY['image/jpeg','image/png','image/webp','image/svg+xml']::text[]
WHERE id = 'logos';

-- ============================================
-- RLS Policies for documents bucket
-- ============================================

DROP POLICY IF EXISTS "documents_select_policy" ON storage.objects;
DROP POLICY IF EXISTS "documents_insert_policy" ON storage.objects;
DROP POLICY IF EXISTS "documents_delete_policy" ON storage.objects;

CREATE POLICY "documents_select_policy" ON storage.objects
FOR SELECT USING (
  bucket_id = 'documents' AND
  auth.uid() IS NOT NULL AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM public.organizations WHERE id IN (
      SELECT organization_id FROM public.memberships WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "documents_insert_policy" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'documents' AND
  auth.uid() IS NOT NULL AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM public.organizations WHERE id IN (
      SELECT organization_id FROM public.memberships WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "documents_delete_policy" ON storage.objects
FOR DELETE USING (
  bucket_id = 'documents' AND
  auth.uid() IS NOT NULL AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM public.organizations WHERE id IN (
      SELECT organization_id FROM public.memberships WHERE user_id = auth.uid()
    )
  )
);

-- ============================================
-- RLS Policies for images bucket (public)
-- ============================================

DROP POLICY IF EXISTS "images_select_policy" ON storage.objects;
DROP POLICY IF EXISTS "images_insert_policy" ON storage.objects;
DROP POLICY IF EXISTS "images_delete_policy" ON storage.objects;

CREATE POLICY "images_select_policy" ON storage.objects
FOR SELECT USING (bucket_id = 'images');

CREATE POLICY "images_insert_policy" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'images' AND
  auth.uid() IS NOT NULL AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM public.organizations WHERE id IN (
      SELECT organization_id FROM public.memberships WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "images_delete_policy" ON storage.objects
FOR DELETE USING (
  bucket_id = 'images' AND
  auth.uid() IS NOT NULL AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM public.organizations WHERE id IN (
      SELECT organization_id FROM public.memberships WHERE user_id = auth.uid()
    )
  )
);

-- ============================================
-- RLS Policies for matter-documents bucket
-- ============================================

DROP POLICY IF EXISTS "matter_docs_select" ON storage.objects;
DROP POLICY IF EXISTS "matter_docs_insert" ON storage.objects;
DROP POLICY IF EXISTS "matter_docs_delete" ON storage.objects;

CREATE POLICY "matter_docs_select" ON storage.objects
FOR SELECT USING (
  bucket_id = 'matter-documents' AND
  auth.uid() IS NOT NULL AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM public.organizations WHERE id IN (
      SELECT organization_id FROM public.memberships WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "matter_docs_insert" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'matter-documents' AND
  auth.uid() IS NOT NULL AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM public.organizations WHERE id IN (
      SELECT organization_id FROM public.memberships WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "matter_docs_delete" ON storage.objects
FOR DELETE USING (
  bucket_id = 'matter-documents' AND
  auth.uid() IS NOT NULL AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM public.organizations WHERE id IN (
      SELECT organization_id FROM public.memberships WHERE user_id = auth.uid()
    )
  )
);

-- ============================================
-- RLS Policies for client-documents bucket
-- ============================================

DROP POLICY IF EXISTS "client_docs_select" ON storage.objects;
DROP POLICY IF EXISTS "client_docs_insert" ON storage.objects;
DROP POLICY IF EXISTS "client_docs_delete" ON storage.objects;

CREATE POLICY "client_docs_select" ON storage.objects
FOR SELECT USING (
  bucket_id = 'client-documents' AND
  auth.uid() IS NOT NULL AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM public.organizations WHERE id IN (
      SELECT organization_id FROM public.memberships WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "client_docs_insert" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'client-documents' AND
  auth.uid() IS NOT NULL AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM public.organizations WHERE id IN (
      SELECT organization_id FROM public.memberships WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "client_docs_delete" ON storage.objects
FOR DELETE USING (
  bucket_id = 'client-documents' AND
  auth.uid() IS NOT NULL AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM public.organizations WHERE id IN (
      SELECT organization_id FROM public.memberships WHERE user_id = auth.uid()
    )
  )
);

-- ============================================
-- RLS Policies for invoices bucket
-- ============================================

DROP POLICY IF EXISTS "invoices_select" ON storage.objects;
DROP POLICY IF EXISTS "invoices_insert" ON storage.objects;
DROP POLICY IF EXISTS "invoices_delete" ON storage.objects;

CREATE POLICY "invoices_select" ON storage.objects
FOR SELECT USING (
  bucket_id = 'invoices' AND
  auth.uid() IS NOT NULL AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM public.organizations WHERE id IN (
      SELECT organization_id FROM public.memberships WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "invoices_insert" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'invoices' AND
  auth.uid() IS NOT NULL AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM public.organizations WHERE id IN (
      SELECT organization_id FROM public.memberships WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "invoices_delete" ON storage.objects
FOR DELETE USING (
  bucket_id = 'invoices' AND
  auth.uid() IS NOT NULL AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM public.organizations WHERE id IN (
      SELECT organization_id FROM public.memberships WHERE user_id = auth.uid()
    )
  )
);

-- ============================================
-- RLS Policies for logos bucket (public)
-- ============================================

DROP POLICY IF EXISTS "logos_select" ON storage.objects;
DROP POLICY IF EXISTS "logos_insert" ON storage.objects;
DROP POLICY IF EXISTS "logos_delete" ON storage.objects;

CREATE POLICY "logos_select" ON storage.objects
FOR SELECT USING (bucket_id = 'logos');

CREATE POLICY "logos_insert" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'logos' AND
  auth.uid() IS NOT NULL AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM public.organizations WHERE id IN (
      SELECT organization_id FROM public.memberships WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "logos_delete" ON storage.objects
FOR DELETE USING (
  bucket_id = 'logos' AND
  auth.uid() IS NOT NULL AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM public.organizations WHERE id IN (
      SELECT organization_id FROM public.memberships WHERE user_id = auth.uid()
    )
  )
);