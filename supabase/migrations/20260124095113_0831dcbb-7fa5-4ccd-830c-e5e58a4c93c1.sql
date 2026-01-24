-- L35-SPIDER: Vigilancia de Logos
-- Añadir soporte para vigilancia de imágenes/logos con CLIP embeddings

-- Enable vector extension if not already enabled
CREATE EXTENSION IF NOT EXISTS vector;

-- Add new columns to watchlists table
ALTER TABLE public.watchlists
ADD COLUMN IF NOT EXISTS watch_type TEXT DEFAULT 'text' CHECK (watch_type IN ('text', 'image', 'combined')),
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS image_embedding vector(512),
ADD COLUMN IF NOT EXISTS color_palette TEXT[],
ADD COLUMN IF NOT EXISTS visual_threshold DECIMAL DEFAULT 0.7 CHECK (visual_threshold >= 0 AND visual_threshold <= 1);

-- Create index for vector similarity search
CREATE INDEX IF NOT EXISTS idx_watchlists_image_embedding ON public.watchlists 
USING ivfflat (image_embedding vector_cosine_ops) WITH (lists = 100);

-- Create spider-logos storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'spider-logos',
  'spider-logos',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for spider-logos bucket
CREATE POLICY "Spider logos are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'spider-logos');

CREATE POLICY "Authenticated users can upload spider logos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'spider-logos' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their organization logos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'spider-logos' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can delete their organization logos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'spider-logos' 
  AND auth.role() = 'authenticated'
);

-- Add comment for documentation
COMMENT ON COLUMN public.watchlists.watch_type IS 'Type of watch: text (phonetic), image (visual), or combined (both)';
COMMENT ON COLUMN public.watchlists.image_url IS 'URL to the logo image in spider-logos bucket';
COMMENT ON COLUMN public.watchlists.image_embedding IS 'CLIP embedding vector (512 dimensions) for visual similarity';
COMMENT ON COLUMN public.watchlists.color_palette IS 'Array of dominant colors in hex format';
COMMENT ON COLUMN public.watchlists.visual_threshold IS 'Minimum visual similarity score (0-1) to trigger alert';