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

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  let importId: string | null = null;

  try {
    const body = await req.json();
    importId = body.import_id;
    
    if (!importId) {
      throw new Error("import_id is required");
    }

    // Get import record
    const { data: importRecord, error: fetchError } = await supabase
      .from("imports")
      .select("*")
      .eq("id", importId)
      .single();

    if (fetchError || !importRecord) {
      throw new Error("Import not found");
    }

    if (importRecord.status !== 'validated' && importRecord.status !== 'importing') {
      throw new Error(`Import must be validated first. Current status: ${importRecord.status}`);
    }

    const { import_type, mapping, organization_id, total_rows, options } = importRecord;

    // Start import
    await supabase
      .from("imports")
      .update({ 
        status: 'importing',
        started_at: new Date().toISOString(),
      })
      .eq("id", importId);

    // For demo, we'll simulate importing records
    // In production, you would:
    // 1. Download and parse the file
    // 2. Apply mapping transformations
    // 3. Insert/update records in batches
    
    const createdIds: string[] = [];
    const updatedIds: string[] = [];
    const errors: any[] = [];
    let successCount = 0;
    let errorCount = 0;

    // Simulate batch processing
    const batchSize = 10;
    const rowsToProcess = total_rows || 50;

    for (let i = 0; i < rowsToProcess; i++) {
      try {
        // Simulate processing each row
        if (import_type === 'matters') {
          // Create demo matter
          if (i < 3) { // Only create a few real records for demo
            const { data: matter, error: insertError } = await supabase
              .from("matters")
              .insert({
                organization_id,
                reference: `IMP-${Date.now()}-${i}`,
                title: `Imported Matter ${i + 1}`,
                ip_type: 'trademark',
                status: 'active',
              })
              .select('id')
              .single();

            if (insertError) {
              throw insertError;
            }
            
            if (matter) {
              createdIds.push(matter.id);
            }
          }
          successCount++;
        } else if (import_type === 'contacts') {
          // Create demo contact
          if (i < 3) {
            const { data: contact, error: insertError } = await supabase
              .from("contacts")
              .insert({
                organization_id,
                owner_type: 'tenant',
                name: `Imported Contact ${i + 1}`,
                email: `contact${i + 1}@example.com`,
                type: 'person',
              })
              .select('id')
              .single();

            if (insertError) {
              throw insertError;
            }
            
            if (contact) {
              createdIds.push(contact.id);
            }
          }
          successCount++;
        } else {
          // For other types, just simulate success
          successCount++;
        }

        // Update progress periodically
        if (i % batchSize === 0) {
          await supabase
            .from("imports")
            .update({ 
              processed_rows: i + 1,
              success_rows: successCount,
              error_rows: errorCount,
            })
            .eq("id", importId);
        }
      } catch (rowError: any) {
        errorCount++;
        errors.push({
          row: i + 1,
          field: 'insert',
          error: rowError.message,
          value: null,
        });
      }
    }

    // Complete import
    await supabase
      .from("imports")
      .update({ 
        status: 'completed',
        completed_at: new Date().toISOString(),
        processed_rows: rowsToProcess,
        success_rows: successCount,
        error_rows: errorCount,
        skipped_rows: 0,
        created_ids: createdIds,
        updated_ids: updatedIds,
        errors: errors.length > 0 ? errors : importRecord.errors || [],
      })
      .eq("id", importId);

    return new Response(
      JSON.stringify({
        success: true,
        created: createdIds.length,
        updated: updatedIds.length,
        errors: errorCount,
        created_ids: createdIds,
        updated_ids: updatedIds,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Execute import error:", error);
    
    // Update status to failed
    if (importId) {
      await supabase
        .from("imports")
        .update({ 
          status: 'failed',
          completed_at: new Date().toISOString(),
          errors: [{ row: 0, field: 'system', error: error.message, value: null }],
        })
        .eq("id", importId);
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
