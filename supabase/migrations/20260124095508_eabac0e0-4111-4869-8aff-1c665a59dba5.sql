-- L36-SPIDER: Resultados Visuales
-- Añadir campos para similitud visual a watch_results

ALTER TABLE public.watch_results
ADD COLUMN IF NOT EXISTS visual_similarity DECIMAL CHECK (visual_similarity >= 0 AND visual_similarity <= 1),
ADD COLUMN IF NOT EXISTS color_similarity DECIMAL CHECK (color_similarity >= 0 AND color_similarity <= 1),
ADD COLUMN IF NOT EXISTS combined_score DECIMAL CHECK (combined_score >= 0 AND combined_score <= 1),
ADD COLUMN IF NOT EXISTS comparison_image_url TEXT,
ADD COLUMN IF NOT EXISTS side_by_side_url TEXT,
ADD COLUMN IF NOT EXISTS result_embedding vector(512),
ADD COLUMN IF NOT EXISTS result_colors TEXT[];

-- Create index for vector similarity search on results
CREATE INDEX IF NOT EXISTS idx_watch_results_embedding ON public.watch_results 
USING ivfflat (result_embedding vector_cosine_ops) WITH (lists = 100);

-- Add comments
COMMENT ON COLUMN public.watch_results.visual_similarity IS 'Cosine similarity between original and result embeddings (0-1)';
COMMENT ON COLUMN public.watch_results.color_similarity IS 'Color palette similarity score (0-1)';
COMMENT ON COLUMN public.watch_results.combined_score IS 'Weighted average of visual and color similarity';
COMMENT ON COLUMN public.watch_results.comparison_image_url IS 'URL of the detected/found image';
COMMENT ON COLUMN public.watch_results.side_by_side_url IS 'Generated side-by-side comparison image URL';
COMMENT ON COLUMN public.watch_results.result_embedding IS 'CLIP embedding of the detected image';
COMMENT ON COLUMN public.watch_results.result_colors IS 'Dominant colors extracted from detected image';