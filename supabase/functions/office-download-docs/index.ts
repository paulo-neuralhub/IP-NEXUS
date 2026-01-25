// ============================================================
// IP-NEXUS - OFFICE DOWNLOAD DOCUMENTS EDGE FUNCTION
// Downloads documents from IP offices for a matter
// ============================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DocumentInfo {
  id: string;
  type: string;
  date: string;
  title: string;
  description?: string;
  downloadUrl?: string;
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

    const { matterId, documentIds } = await req.json();

    if (!matterId) {
      return new Response(JSON.stringify({ error: "matterId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get matter details
    const { data: matter, error: matterError } = await supabase
      .from("matters")
      .select("id, organization_id, application_number, jurisdiction_code, jurisdiction")
      .eq("id", matterId)
      .single();

    if (matterError || !matter) {
      return new Response(JSON.stringify({ error: "Matter not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const officeCode = matter.jurisdiction_code || matter.jurisdiction;

    // Get already downloaded documents
    const { data: existingDocs } = await supabase
      .from("office_documents")
      .select("office_doc_id")
      .eq("matter_id", matterId)
      .eq("download_status", "completed");

    const existingDocIds = new Set(existingDocs?.map(d => d.office_doc_id) || []);

    // Mock: Get list of documents from office API
    // In production, this would call the actual office API
    const mockOfficeDocs: DocumentInfo[] = [
      {
        id: `${officeCode}-${matter.application_number}-001`,
        type: "filing_receipt",
        date: new Date().toISOString().split("T")[0],
        title: "Acuse de recibo de solicitud",
        description: "Filing receipt from office",
      },
      {
        id: `${officeCode}-${matter.application_number}-002`,
        type: "examination_report",
        date: new Date().toISOString().split("T")[0],
        title: "Informe de examen",
        description: "Examination report",
      },
    ];

    // Filter documents to download
    const docsToDownload = mockOfficeDocs.filter(doc => {
      if (documentIds && documentIds.length > 0) {
        return documentIds.includes(doc.id) && !existingDocIds.has(doc.id);
      }
      return !existingDocIds.has(doc.id);
    });

    const results = {
      total: docsToDownload.length,
      downloaded: 0,
      failed: 0,
      documents: [] as Array<{ id: string; status: string; error?: string }>,
    };

    for (const doc of docsToDownload) {
      try {
        // Create office_documents record
        const { data: officeDoc, error: insertError } = await supabase
          .from("office_documents")
          .insert({
            tenant_id: matter.organization_id,
            matter_id: matterId,
            office_code: officeCode,
            office_doc_id: doc.id,
            office_doc_type: doc.type,
            office_doc_date: doc.date,
            title: doc.title,
            description: doc.description,
            download_status: "completed",
            downloaded_at: new Date().toISOString(),
            file_name: `${doc.id}.pdf`,
            mime_type: "application/pdf",
          })
          .select()
          .single();

        if (insertError) throw insertError;

        // Also create matter_documents record for easy access
        await supabase.from("matter_documents").insert({
          organization_id: matter.organization_id,
          matter_id: matterId,
          name: doc.title,
          document_type: doc.type,
          file_path: `offices/${officeCode}/${doc.id}.pdf`,
          file_size: 0,
          mime_type: "application/pdf",
          source: "office_sync",
          metadata: {
            office_doc_id: doc.id,
            office_code: officeCode,
          },
        });

        results.downloaded++;
        results.documents.push({ id: doc.id, status: "completed" });

      } catch (error) {
        results.failed++;
        results.documents.push({ 
          id: doc.id, 
          status: "failed",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    // Log activity
    if (results.downloaded > 0) {
      await supabase.from("activity_log").insert({
        organization_id: matter.organization_id,
        entity_type: "matter",
        entity_id: matterId,
        action: "documents_downloaded",
        title: `${results.downloaded} documentos descargados de ${officeCode}`,
        metadata: { results },
      });
    }

    return new Response(JSON.stringify({
      success: true,
      ...results,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error downloading documents:", error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
