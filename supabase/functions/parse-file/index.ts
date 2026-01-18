import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const optionsStr = formData.get("options") as string;
    const options = optionsStr ? JSON.parse(optionsStr) : {};

    if (!file) {
      throw new Error("No file provided");
    }

    const fileName = file.name.toLowerCase();
    const content = await file.text();
    
    let headers: string[] = [];
    let rows: any[][] = [];
    
    if (fileName.endsWith('.csv')) {
      // Parse CSV
      const delimiter = options.delimiter || ',';
      const lines = content.split('\n').filter(line => line.trim());
      
      if (lines.length === 0) {
        throw new Error("Empty file");
      }
      
      // Parse header
      if (options.skip_header !== false) {
        headers = parseCSVLine(lines[0], delimiter);
        rows = lines.slice(1).map(line => parseCSVLine(line, delimiter));
      } else {
        // Generate column headers A, B, C, etc.
        const firstRow = parseCSVLine(lines[0], delimiter);
        headers = firstRow.map((_, i) => getColumnLetter(i));
        rows = lines.map(line => parseCSVLine(line, delimiter));
      }
    } else if (fileName.endsWith('.json')) {
      // Parse JSON
      const jsonData = JSON.parse(content);
      
      if (Array.isArray(jsonData)) {
        if (jsonData.length === 0) {
          throw new Error("Empty JSON array");
        }
        headers = Object.keys(jsonData[0]);
        rows = jsonData.map(item => headers.map(h => item[h]));
      } else if (typeof jsonData === 'object') {
        headers = Object.keys(jsonData);
        rows = [headers.map(h => jsonData[h])];
      }
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      // For Excel, we'd need a library. For now, return error with instructions
      // In production, use a library like xlsx or sheetjs
      return new Response(
        JSON.stringify({
          error: "Excel parsing requires client-side processing",
          message: "Please use the client-side Excel parser or convert to CSV"
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    } else {
      throw new Error(`Unsupported file type: ${fileName}`);
    }

    // Apply skip_rows option
    const skipRows = options.skip_rows || 0;
    if (skipRows > 0) {
      rows = rows.slice(skipRows);
    }

    // Get preview (first 10 rows)
    const preview = rows.slice(0, 10);

    return new Response(
      JSON.stringify({
        headers,
        rows,
        total_rows: rows.length,
        preview,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Parse file error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});

function parseCSVLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

function getColumnLetter(index: number): string {
  let result = '';
  let i = index;
  
  while (i >= 0) {
    result = String.fromCharCode((i % 26) + 65) + result;
    i = Math.floor(i / 26) - 1;
  }
  
  return result;
}
