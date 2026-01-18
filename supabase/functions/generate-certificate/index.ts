import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { timestamp_id } = await req.json();
    
    if (!timestamp_id) {
      throw new Error('timestamp_id is required');
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Obtener timestamp
    const { data: timestamp, error: fetchError } = await supabase
      .from('blockchain_timestamps')
      .select('*')
      .eq('id', timestamp_id)
      .single();
    
    if (fetchError || !timestamp) {
      throw new Error('Timestamp not found');
    }
    
    if (timestamp.status !== 'confirmed') {
      throw new Error('Timestamp not yet confirmed on blockchain');
    }
    
    // Determinar URL del explorador
    const explorerUrls: Record<string, string> = {
      ethereum: 'https://etherscan.io/tx/',
      polygon: 'https://polygonscan.com/tx/',
      bitcoin: 'https://blockchain.com/btc/tx/',
      opentimestamps: 'https://opentimestamps.org/info.html?ots=',
    };
    
    const explorerUrl = explorerUrls[timestamp.blockchain] || explorerUrls.polygon;
    const verificationUrl = `${explorerUrl}${timestamp.tx_hash}`;
    
    // Generar certificado
    const certificate = {
      id: timestamp.id,
      title: 'CERTIFICADO DE TIMESTAMP BLOCKCHAIN',
      subtitle: 'Prueba de Existencia Digital',
      
      document: {
        file_name: timestamp.file_name,
        file_hash: timestamp.file_hash,
        content_hash: timestamp.content_hash,
        file_size: timestamp.file_size,
      },
      
      blockchain: {
        network: timestamp.blockchain,
        network_name: getBlockchainName(timestamp.blockchain),
        tx_hash: timestamp.tx_hash,
        block_number: timestamp.block_number,
        block_timestamp: timestamp.block_timestamp,
      },
      
      timestamps: {
        created: timestamp.created_at,
        submitted: timestamp.submitted_at,
        confirmed: timestamp.confirmed_at,
      },
      
      metadata: timestamp.metadata,
      
      verification: {
        url: verificationUrl,
        instructions: [
          '1. Visite la URL de verificación para ver la transacción en el explorador de blockchain.',
          '2. Verifique que el hash del contenido en los datos de la transacción coincide con el hash de su archivo.',
          '3. La fecha y hora del bloque prueban que el documento existía en ese momento.',
        ],
      },
      
      legal_notice: `Este certificado demuestra que el archivo identificado por el hash SHA-256 "${timestamp.file_hash}" existía antes de la fecha ${timestamp.block_timestamp}. La prueba está registrada de forma inmutable en la blockchain de ${getBlockchainName(timestamp.blockchain)}.`,
      
      generated_at: new Date().toISOString(),
      issuer: 'IP-NEXUS Blockchain Timestamping Service',
    };
    
    // Actualizar timestamp con URL del certificado (si se genera PDF)
    await supabase
      .from('blockchain_timestamps')
      .update({
        certificate_data: certificate,
      })
      .eq('id', timestamp_id);
    
    console.log('Certificate generated for:', timestamp_id);
    
    return new Response(
      JSON.stringify(certificate),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Certificate generation error:', errorMessage);
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function getBlockchainName(blockchain: string): string {
  const names: Record<string, string> = {
    ethereum: 'Ethereum Mainnet',
    polygon: 'Polygon (Matic)',
    bitcoin: 'Bitcoin',
    opentimestamps: 'OpenTimestamps',
  };
  return names[blockchain] || blockchain;
}
