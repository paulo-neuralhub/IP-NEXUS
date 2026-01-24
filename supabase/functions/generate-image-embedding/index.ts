import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  imageUrl: string;
  watchlistId?: string;
}

interface ReplicateResponse {
  output: number[];
  error?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl, watchlistId }: RequestBody = await req.json();

    if (!imageUrl) {
      return new Response(
        JSON.stringify({ error: 'imageUrl is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check for Replicate API token
    const replicateToken = Deno.env.get('REPLICATE_API_TOKEN');
    
    if (!replicateToken) {
      console.warn('REPLICATE_API_TOKEN not configured - returning demo embedding');
      
      // Return a demo embedding for testing (512 random values normalized)
      const demoEmbedding = Array.from({ length: 512 }, () => (Math.random() - 0.5) * 2);
      const magnitude = Math.sqrt(demoEmbedding.reduce((sum, val) => sum + val * val, 0));
      const normalizedEmbedding = demoEmbedding.map(val => val / magnitude);
      
      return new Response(
        JSON.stringify({
          success: true,
          embedding: normalizedEmbedding,
          demo: true,
          message: 'Demo embedding generated. Configure REPLICATE_API_TOKEN for real CLIP embeddings.'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Generating CLIP embedding for image:', imageUrl);

    // Use Replicate's CLIP model
    // Model: openai/clip-vit-large-patch14
    const replicateResponse = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${replicateToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // Using a CLIP embedding model on Replicate
        version: "75b33f253f7714a281ad3e9b28f63e3232d583716ef6718f2e46641077ea040a",
        input: {
          image: imageUrl,
        },
      }),
    });

    if (!replicateResponse.ok) {
      const errorText = await replicateResponse.text();
      console.error('Replicate API error:', errorText);
      throw new Error(`Replicate API error: ${replicateResponse.status}`);
    }

    const prediction = await replicateResponse.json();
    console.log('Prediction created:', prediction.id);

    // Poll for completion
    let result = prediction;
    const maxAttempts = 60;
    let attempts = 0;

    while (result.status !== 'succeeded' && result.status !== 'failed' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: {
          'Authorization': `Token ${replicateToken}`,
        },
      });
      
      result = await pollResponse.json();
      attempts++;
    }

    if (result.status === 'failed') {
      throw new Error(`Replicate prediction failed: ${result.error}`);
    }

    if (result.status !== 'succeeded') {
      throw new Error('Replicate prediction timed out');
    }

    const embedding = result.output;

    // Ensure we have a 512-dimension vector (pad or truncate if needed)
    let finalEmbedding: number[];
    if (Array.isArray(embedding) && embedding.length > 0) {
      if (embedding.length >= 512) {
        finalEmbedding = embedding.slice(0, 512);
      } else {
        // Pad with zeros if less than 512
        finalEmbedding = [...embedding, ...Array(512 - embedding.length).fill(0)];
      }
    } else {
      throw new Error('Invalid embedding response from Replicate');
    }

    // If watchlistId provided, update the watchlist with the embedding
    if (watchlistId) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      const { error: updateError } = await supabase
        .from('watchlists')
        .update({ 
          image_embedding: `[${finalEmbedding.join(',')}]`,
        })
        .eq('id', watchlistId);

      if (updateError) {
        console.error('Error updating watchlist:', updateError);
      } else {
        console.log('Watchlist embedding updated:', watchlistId);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        embedding: finalEmbedding,
        dimensions: finalEmbedding.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error generating embedding:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        success: false,
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
