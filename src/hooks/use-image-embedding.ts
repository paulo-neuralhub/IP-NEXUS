import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface EmbeddingResult {
  success: boolean;
  embedding: number[];
  dimensions?: number;
  demo?: boolean;
  message?: string;
  error?: string;
}

interface ColorExtractionResult {
  colors: string[];
}

/**
 * Hook to generate CLIP embedding for an image
 */
export function useGenerateImageEmbedding() {
  return useMutation({
    mutationFn: async ({ imageUrl, watchlistId }: { imageUrl: string; watchlistId?: string }): Promise<EmbeddingResult> => {
      const { data, error } = await supabase.functions.invoke('generate-image-embedding', {
        body: { imageUrl, watchlistId },
      });

      if (error) throw error;
      return data as EmbeddingResult;
    },
  });
}

/**
 * Extract dominant colors from an image using canvas
 * This runs client-side to avoid extra API calls
 */
export function extractDominantColors(imageUrl: string, numColors = 5): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Scale down for faster processing
        const scale = Math.min(100 / img.width, 100 / img.height);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;

        // Simple color quantization using a color map
        const colorMap: Record<string, number> = {};
        
        for (let i = 0; i < pixels.length; i += 4) {
          const r = Math.round(pixels[i] / 32) * 32;
          const g = Math.round(pixels[i + 1] / 32) * 32;
          const b = Math.round(pixels[i + 2] / 32) * 32;
          const a = pixels[i + 3];

          // Skip transparent pixels
          if (a < 128) continue;

          const hex = rgbToHex(r, g, b);
          colorMap[hex] = (colorMap[hex] || 0) + 1;
        }

        // Sort by frequency and take top N
        const sortedColors = Object.entries(colorMap)
          .sort((a, b) => b[1] - a[1])
          .slice(0, numColors)
          .map(([color]) => color);

        resolve(sortedColors);
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageUrl;
  });
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b]
    .map(x => Math.min(255, Math.max(0, x)).toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Upload image to spider-logos bucket
 */
export function useUploadSpiderLogo() {
  return useMutation({
    mutationFn: async ({ file, organizationId }: { file: File; organizationId: string }): Promise<string> => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${organizationId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('spider-logos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('spider-logos')
        .getPublicUrl(fileName);

      return publicUrl;
    },
  });
}
