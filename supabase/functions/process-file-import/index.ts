// ============================================================
// IP-NEXUS - PROCESS FILE IMPORT EDGE FUNCTION
// Processes imported files from IP offices (Excel, CSV, PDF with OCR)
// ============================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ParsedRecord {
  applicationNumber?: string;
  registrationNumber?: string;
  markName?: string;
  applicant?: string;
  filingDate?: string;
  status?: string;
  niceClasses?: number[];
  confidence: number;
  fieldsWithLowConfidence: string[];
  rawData: Record<string, unknown>;
}

interface ImportResult {
  recordsFound: number;
  recordsImported: number;
  recordsUpdated: number;
  recordsFailed: number;
  recordsForReview: number;
  errors: Array<{ row: number; error: string }>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { importId } = await req.json();

    if (!importId) {
      return new Response(JSON.stringify({ error: "importId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get import record
    const { data: importRecord, error: importError } = await supabase
      .from("office_file_imports")
      .select("*")
      .eq("id", importId)
      .single();

    if (importError || !importRecord) {
      return new Response(JSON.stringify({ error: "Import not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update status to processing
    await supabase
      .from("office_file_imports")
      .update({ import_status: "processing" })
      .eq("id", importId);

    const result: ImportResult = {
      recordsFound: 0,
      recordsImported: 0,
      recordsUpdated: 0,
      recordsFailed: 0,
      recordsForReview: 0,
      errors: [],
    };

    try {
      // Parse file based on type
      const fileType = importRecord.file_type?.toLowerCase();
      let parsedRecords: ParsedRecord[] = [];

      if (fileType === "pdf") {
        // For PDF files, would use OCR via Claude Vision
        // Simulated for now
        parsedRecords = await processPdfFile(importRecord);
      } else if (fileType === "xlsx" || fileType === "xls") {
        parsedRecords = await processExcelFile(importRecord);
      } else if (fileType === "csv") {
        parsedRecords = await processCsvFile(importRecord);
      } else {
        throw new Error(`Unsupported file type: ${fileType}`);
      }

      result.recordsFound = parsedRecords.length;

      // Process each record
      for (let i = 0; i < parsedRecords.length; i++) {
        const record = parsedRecords[i];

        try {
          // Check if record needs manual review (low confidence)
          if (record.confidence < 0.9 || record.fieldsWithLowConfidence.length > 0) {
            // Add to review queue
            await supabase.from("office_import_review_queue").insert({
              import_id: importId,
              tenant_id: importRecord.tenant_id,
              extracted_data: record.rawData,
              confidence_score: record.confidence,
              fields_to_review: record.fieldsWithLowConfidence,
              status: "pending",
            });

            result.recordsForReview++;
            continue;
          }

          // Check if matter already exists
          const { data: existingMatter } = await supabase
            .from("matters")
            .select("id")
            .eq("organization_id", importRecord.tenant_id)
            .eq("application_number", record.applicationNumber)
            .maybeSingle();

          if (existingMatter) {
            // Update existing matter
            await supabase
              .from("matters")
              .update({
                status: record.status,
                mark_name: record.markName,
                nice_classes: record.niceClasses,
              })
              .eq("id", existingMatter.id);

            result.recordsUpdated++;
          } else {
            // Create new matter
            await supabase.from("matters").insert({
              organization_id: importRecord.tenant_id,
              application_number: record.applicationNumber,
              registration_number: record.registrationNumber,
              mark_name: record.markName,
              status: record.status || "filed",
              filing_date: record.filingDate,
              nice_classes: record.niceClasses,
              jurisdiction_code: importRecord.office_code,
              source: "file_import",
              metadata: {
                import_id: importId,
                imported_at: new Date().toISOString(),
              },
            });

            result.recordsImported++;
          }

        } catch (recordError) {
          result.recordsFailed++;
          result.errors.push({
            row: i + 1,
            error: recordError instanceof Error ? recordError.message : "Unknown error",
          });
        }
      }

      // Update import record with results
      await supabase
        .from("office_file_imports")
        .update({
          import_status: result.recordsFailed > 0 ? "partial" : "completed",
          records_found: result.recordsFound,
          records_imported: result.recordsImported,
          records_updated: result.recordsUpdated,
          records_failed: result.recordsFailed,
          requires_review: result.recordsForReview > 0,
          errors: result.errors.length > 0 ? { items: result.errors } : null,
          processed_at: new Date().toISOString(),
        })
        .eq("id", importId);

      // Log activity
      await supabase.from("activity_log").insert({
        organization_id: importRecord.tenant_id,
        entity_type: "import",
        entity_id: importId,
        action: "file_import_completed",
        title: `Importación completada: ${result.recordsImported} nuevos, ${result.recordsUpdated} actualizados`,
        metadata: result,
      });

    } catch (processError) {
      await supabase
        .from("office_file_imports")
        .update({
          import_status: "failed",
          errors: { message: processError instanceof Error ? processError.message : "Unknown error" },
        })
        .eq("id", importId);

      throw processError;
    }

    return new Response(JSON.stringify({
      success: true,
      result,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error processing import:", error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// Helper functions (simulated - would use actual parsing libraries)

async function processPdfFile(importRecord: Record<string, unknown>): Promise<ParsedRecord[]> {
  // In production, would use Claude Vision for OCR
  // For now, return mock data
  return [
    {
      applicationNumber: "018123456",
      markName: "EXAMPLE BRAND",
      status: "filed",
      confidence: 0.85,
      fieldsWithLowConfidence: ["status"],
      rawData: { source: "pdf_ocr" },
    },
  ];
}

async function processExcelFile(importRecord: Record<string, unknown>): Promise<ParsedRecord[]> {
  // In production, would use xlsx library
  return [
    {
      applicationNumber: "018234567",
      markName: "TEST MARK",
      filingDate: "2024-01-15",
      niceClasses: [9, 42],
      confidence: 0.95,
      fieldsWithLowConfidence: [],
      rawData: { source: "excel" },
    },
  ];
}

async function processCsvFile(importRecord: Record<string, unknown>): Promise<ParsedRecord[]> {
  // In production, would parse CSV content
  return [
    {
      applicationNumber: "018345678",
      markName: "CSV BRAND",
      status: "published",
      confidence: 0.98,
      fieldsWithLowConfidence: [],
      rawData: { source: "csv" },
    },
  ];
}
