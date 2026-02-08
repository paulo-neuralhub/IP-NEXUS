
-- Create storage bucket for market chat files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'market-chat-files',
  'market-chat-files',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for market chat files
CREATE POLICY "Authenticated users can upload market chat files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'market-chat-files');

CREATE POLICY "Anyone can read market chat files"
ON storage.objects FOR SELECT
USING (bucket_id = 'market-chat-files');

CREATE POLICY "Users can delete their own market chat files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'market-chat-files' AND auth.uid()::text = (storage.foldername(name))[1]);
