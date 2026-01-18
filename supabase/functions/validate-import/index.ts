import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { import_id } = await req.json();
    
    if (!import_id) {
      throw new Error("import_id is required");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get import record
    const { data: importRecord, error: fetchError } = await supabase
      .from("imports")
      .select("*")
      .eq("id", import_id)
      .single();

    if (fetchError || !importRecord) {
      throw new Error("Import not found");
    }

    const { import_type, mapping, file_url, options } = importRecord;

    // For this demo, we'll simulate validation
    // In production, you would:
    // 1. Download the file from file_url
    // 2. Parse it according to source_type
    // 3. Validate each row against the mapping
    
    const errors: any[] = [];
    const warnings: any[] = [];
    let validRows = 0;
    const totalRows = 50; // Simulated

    // Simulate validation based on import_type
    if (import_type === 'matters') {
      // Check required fields in mapping
      if (!mapping.reference && !mapping.title) {
        errors.push({
          row: 0,
          field: 'mapping',
          error: 'Se requiere mapear al menos Referencia o Título',
          value: null,
        });
      }
    } else if (import_type === 'contacts') {
      if (!mapping.name) {
        errors.push({
          row: 0,
          field: 'mapping',
          error: 'Se requiere mapear el campo Nombre',
          value: null,
        });
      }
    }

    // Simulate some validation results
    if (errors.length === 0) {
      // Add some sample warnings
      warnings.push({
        row: 5,
        field: 'date',
        message: 'Fecha en formato no estándar, se intentará parsear',
        value: '15-01-2024',
      });
      
      validRows = totalRows - 2; // Assume 2 rows with issues
      
      errors.push({
        row: 12,
        field: 'email',
        error: 'Formato de email inválido',
        value: 'invalid-email',
      });
      errors.push({
        row: 23,
        field: 'reference',
        error: 'Referencia duplicada en el archivo',
        value: 'TM-001',
      });
    }

    // Determine final status
    const hasBlockingErrors = errors.some(e => e.row === 0); // Mapping errors are blocking
    const finalStatus = hasBlockingErrors ? 'failed' : 'validated';

    // Update import record
    await supabase
      .from("imports")
      .update({
        status: finalStatus,
        total_rows: totalRows,
        success_rows: validRows,
        error_rows: errors.filter(e => e.row > 0).length,
        errors: errors,
      })
      .eq("id", import_id);

    return new Response(
      JSON.stringify({
        success: !hasBlockingErrors,
        valid: !hasBlockingErrors,
        total_rows: totalRows,
        valid_rows: validRows,
        errors,
        warnings,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Validate import error:", error);
    
    // Try to update status to failed
    try {
      const { import_id } = await req.json();
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      await supabase
        .from("imports")
        .update({ status: 'failed', errors: [{ row: 0, field: 'system', error: error.message, value: null }] })
        .eq("id", import_id);
    } catch (_) {
      // Ignore update error
    }

    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
