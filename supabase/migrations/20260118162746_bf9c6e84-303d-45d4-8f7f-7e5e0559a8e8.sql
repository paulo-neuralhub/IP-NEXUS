-- Create private storage bucket for matter documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'matter-documents', 
  'matter-documents', 
  false,
  52428800, -- 50MB limit
  ARRAY['application/pdf', 'image/png', 'image/jpeg', 'image/gif', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/plain']
);

-- RLS Policies for matter-documents bucket
-- Users can view documents in their organization
CREATE POLICY "Users can view org documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'matter-documents' 
  AND (storage.foldername(name))[1] IN (
    SELECT organization_id::text FROM memberships WHERE user_id = auth.uid()
  )
);

-- Users can upload documents to their organization folder
CREATE POLICY "Users can upload org documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'matter-documents'
  AND (storage.foldername(name))[1] IN (
    SELECT organization_id::text FROM memberships WHERE user_id = auth.uid()
  )
);

-- Users can update their org documents
CREATE POLICY "Users can update org documents"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'matter-documents'
  AND (storage.foldername(name))[1] IN (
    SELECT organization_id::text FROM memberships WHERE user_id = auth.uid()
  )
);

-- Users can delete their org documents
CREATE POLICY "Users can delete org documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'matter-documents'
  AND (storage.foldername(name))[1] IN (
    SELECT organization_id::text FROM memberships WHERE user_id = auth.uid()
  )
);