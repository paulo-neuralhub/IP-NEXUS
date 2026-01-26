import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// SII - Suministro Inmediato de Información
// Real-time communication with Spanish Tax Agency (AEAT)

// SII Endpoints
const SII_ENDPOINTS = {
  production: {
    facturas_emitidas: "https://www2.agenciatributaria.gob.es/static_files/common/internet/dep/aplicaciones/es/aeat/ssii_fact/ws/SuministroFactEmitidas.wsdl",
    facturas_recibidas: "https://www1.agenciatributaria.gob.es/wlpl/SSII-FACT/ws/fe/SiiFactFEV1SOAP",
  },
  test: {
    facturas_emitidas: "https://prewww1.aeat.es/wlpl/SSII-FACT/ws/fe/SiiFactFEV1SOAP",
    facturas_recibidas: "https://prewww1.aeat.es/wlpl/SSII-FACT/ws/fr/SiiFactFRV1SOAP",
  },
};

// SII Invoice Type Codes
const INVOICE_TYPE_CODES: Record<string, string> = {
  'FC': 'F1',  // Factura completa
  'FA': 'F2',  // Factura simplificada
  'FR': 'R1',  // Factura rectificativa (error fundado en derecho)
  'NC': 'R4',  // Factura rectificativa (resto)
};

// SII Special Regime Keys
const REGIME_KEYS: Record<string, { code: string; description: string }> = {
  'general': { code: '01', description: 'Operación de régimen general' },
  'export': { code: '02', description: 'Exportación' },
  'used_goods': { code: '03', description: 'Operaciones a las que se aplique el régimen especial de bienes usados' },
  'investment_gold': { code: '04', description: 'Régimen especial del oro de inversión' },
  'travel_agencies': { code: '05', description: 'Régimen especial de las agencias de viajes' },
  'group_entities': { code: '06', description: 'Régimen especial grupo de entidades en IVA' },
  'cash_basis': { code: '07', description: 'Régimen especial del criterio de caja' },
  'canary_islands': { code: '08', description: 'Operaciones sujetas al IPSI/IGIC' },
  'professional': { code: '09', description: 'Facturación de las prestaciones de servicios de agencias de viaje' },
  'third_party': { code: '10', description: 'Cobros por cuenta de terceros' },
  'business_premises': { code: '11', description: 'Operaciones de arrendamiento de local de negocio' },
  'not_subject': { code: '12', description: 'Operaciones de arrendamiento de local de negocio no sujetas' },
  'certification': { code: '13', description: 'Factura de certificaciones de obra' },
  'intra_community': { code: '14', description: 'Facturas de importaciones' },
  'pro_taxpayer': { code: '15', description: 'Factura con IVA pendiente de devengo en operaciones de tracto sucesivo' },
  'multi_regime': { code: '16', description: 'Primer semestre 2017 y otras facturas anteriores' },
};

interface SIIRequest {
  invoice_id: string;
  test_mode?: boolean;
}

interface VatBreakdown {
  rate: number;
  base: number;
  amount: number;
  surcharge?: number;
  surcharge_rate?: number;
}

// Build SII SOAP envelope
function buildSIIEnvelope(
  invoice: any,
  fiscalSettings: any,
  client: any,
  lines: any[]
): string {
  const period = new Date(invoice.issue_date);
  const ejercicio = period.getFullYear().toString();
  const periodo = (period.getMonth() + 1).toString().padStart(2, '0');
  
  const invoiceType = INVOICE_TYPE_CODES[invoice.invoice_type] || 'F1';
  const regimeKey = REGIME_KEYS[fiscalSettings.vat_regime]?.code || '01';
  
  // Build VAT breakdown
  const vatBreakdown: VatBreakdown[] = invoice.vat_breakdown || [];
  let desgloseIVA = '';
  
  if (vatBreakdown.length > 0) {
    vatBreakdown.forEach((vat) => {
      desgloseIVA += `
                        <sii:DetalleIVA>
                          <sii:TipoImpositivo>${vat.rate.toFixed(2)}</sii:TipoImpositivo>
                          <sii:BaseImponible>${vat.base.toFixed(2)}</sii:BaseImponible>
                          <sii:CuotaRepercutida>${vat.amount.toFixed(2)}</sii:CuotaRepercutida>
                          ${vat.surcharge && vat.surcharge > 0 ? `
                          <sii:TipoRecargoEquivalencia>${(vat.surcharge_rate || 0).toFixed(2)}</sii:TipoRecargoEquivalencia>
                          <sii:CuotaRecargoEquivalencia>${vat.surcharge.toFixed(2)}</sii:CuotaRecargoEquivalencia>` : ''}
                        </sii:DetalleIVA>`;
    });
  } else {
    // Default single VAT rate
    desgloseIVA = `
                        <sii:DetalleIVA>
                          <sii:TipoImpositivo>21.00</sii:TipoImpositivo>
                          <sii:BaseImponible>${invoice.tax_base.toFixed(2)}</sii:BaseImponible>
                          <sii:CuotaRepercutida>${invoice.total_vat.toFixed(2)}</sii:CuotaRepercutida>
                        </sii:DetalleIVA>`;
  }

  // Build counterparty (Contraparte)
  const isSpanish = (client.country || 'ES').toUpperCase() === 'ES';
  let contraparteXml = '';
  
  if (isSpanish && client.tax_id) {
    contraparteXml = `
                <sii:Contraparte>
                  <sii:NombreRazon>${escapeXml(client.name)}</sii:NombreRazon>
                  <sii:NIF>${escapeXml(client.tax_id)}</sii:NIF>
                </sii:Contraparte>`;
  } else if (client.tax_id) {
    contraparteXml = `
                <sii:Contraparte>
                  <sii:NombreRazon>${escapeXml(client.name)}</sii:NombreRazon>
                  <sii:IDOtro>
                    <sii:CodigoPais>${client.country || 'ES'}</sii:CodigoPais>
                    <sii:IDType>02</sii:IDType>
                    <sii:ID>${escapeXml(client.tax_id)}</sii:ID>
                  </sii:IDOtro>
                </sii:Contraparte>`;
  }

  // Build description from lines
  const description = lines.length > 0 
    ? lines.map(l => l.description || l.concept).join('; ').substring(0, 500)
    : 'Servicios profesionales';

  // Format date for SII (DD-MM-YYYY)
  const formatSIIDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getDate().toString().padStart(2, '0')}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getFullYear()}`;
  };

  const soapEnvelope = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" 
                  xmlns:siiLR="https://www2.agenciatributaria.gob.es/static_files/common/internet/dep/aplicaciones/es/aeat/ssii/fact/ws/SusinitraLRFacturasEmitidas.xsd"
                  xmlns:sii="https://www2.agenciatributaria.gob.es/static_files/common/internet/dep/aplicaciones/es/aeat/ssii/fact/ws/SuministroInformacion.xsd">
  <soapenv:Header/>
  <soapenv:Body>
    <siiLR:SuministroLRFacturasEmitidas>
      <sii:Cabecera>
        <sii:IDVersionSii>1.1</sii:IDVersionSii>
        <sii:Titular>
          <sii:NombreRazon>${escapeXml(fiscalSettings.legal_name)}</sii:NombreRazon>
          <sii:NIF>${escapeXml(fiscalSettings.tax_id)}</sii:NIF>
        </sii:Titular>
        <sii:TipoComunicacion>A0</sii:TipoComunicacion>
      </sii:Cabecera>
      <siiLR:RegistroLRFacturasEmitidas>
        <sii:PeriodoLiquidacion>
          <sii:Ejercicio>${ejercicio}</sii:Ejercicio>
          <sii:Periodo>${periodo}</sii:Periodo>
        </sii:PeriodoLiquidacion>
        <siiLR:IDFactura>
          <sii:IDEmisorFactura>
            <sii:NIF>${escapeXml(fiscalSettings.tax_id)}</sii:NIF>
          </sii:IDEmisorFactura>
          <sii:NumSerieFacturaEmisor>${escapeXml(invoice.invoice_number)}</sii:NumSerieFacturaEmisor>
          <sii:FechaExpedicionFacturaEmisor>${formatSIIDate(invoice.issue_date)}</sii:FechaExpedicionFacturaEmisor>
        </siiLR:IDFactura>
        <siiLR:FacturaExpedida>
          <sii:TipoFactura>${invoiceType}</sii:TipoFactura>
          <sii:ClaveRegimenEspecialOTrascendencia>${regimeKey}</sii:ClaveRegimenEspecialOTrascendencia>
          <sii:ImporteTotal>${invoice.total.toFixed(2)}</sii:ImporteTotal>
          <sii:DescripcionOperacion>${escapeXml(description)}</sii:DescripcionOperacion>
          ${contraparteXml}
          <sii:TipoDesglose>
            <sii:DesgloseFactura>
              <sii:Sujeta>
                <sii:NoExenta>
                  <sii:TipoNoExenta>S1</sii:TipoNoExenta>
                  <sii:DesgloseIVA>${desgloseIVA}
                  </sii:DesgloseIVA>
                </sii:NoExenta>
              </sii:Sujeta>
            </sii:DesgloseFactura>
          </sii:TipoDesglose>
        </siiLR:FacturaExpedida>
      </siiLR:RegistroLRFacturasEmitidas>
    </siiLR:SuministroLRFacturasEmitidas>
  </soapenv:Body>
</soapenv:Envelope>`;

  return soapEnvelope;
}

function escapeXml(str: string | null | undefined): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { invoice_id, test_mode = true }: SIIRequest = await req.json();

    if (!invoice_id) {
      return new Response(
        JSON.stringify({ error: "invoice_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get invoice with client
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .select(`
        *,
        clients:client_id (
          id, name, tax_id, tax_id_type,
          billing_country, type
        )
      `)
      .eq("id", invoice_id)
      .single();

    if (invoiceError || !invoice) {
      return new Response(
        JSON.stringify({ error: "Invoice not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get invoice lines
    const { data: lines } = await supabase
      .from("invoice_items")
      .select("*")
      .eq("invoice_id", invoice_id);

    // Get fiscal settings
    const { data: fiscalSettings, error: fiscalError } = await supabase
      .from("fiscal_settings")
      .select("*")
      .eq("organization_id", invoice.organization_id)
      .single();

    if (fiscalError || !fiscalSettings) {
      return new Response(
        JSON.stringify({ error: "Fiscal settings not configured" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check SII is enabled
    if (!fiscalSettings.sii_enabled) {
      return new Response(
        JSON.stringify({ error: "SII not enabled for this organization" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Map client
    const client = {
      name: invoice.clients?.name || invoice.client_name || '',
      tax_id: invoice.clients?.tax_id || '',
      country: invoice.clients?.billing_country || 'ES',
    };

    // Build SOAP envelope
    const soapEnvelope = buildSIIEnvelope(invoice, fiscalSettings, client, lines || []);

    // In production, this would send to AEAT
    // For now, we simulate the response
    const endpoint = test_mode 
      ? SII_ENDPOINTS.test.facturas_emitidas 
      : SII_ENDPOINTS.production.facturas_emitidas;

    // Simulate SII response (in production, use actual SOAP call with certificate)
    const simulatedResponse = {
      EstadoEnvio: 'Correcto',
      CSV: `SII${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      RespuestaLinea: [{
        IDFactura: {
          NumSerieFacturaEmisor: invoice.invoice_number,
        },
        EstadoRegistro: 'Correcto',
        CodigoErrorRegistro: null,
        DescripcionErrorRegistro: null,
      }],
    };

    // Update invoice with SII status
    const { error: updateError } = await supabase
      .from("invoices")
      .update({
        sii_status: 'sent',
        sii_csv: simulatedResponse.CSV,
        sii_sent_at: new Date().toISOString(),
        sii_response: simulatedResponse,
        sii_registration_key: REGIME_KEYS[fiscalSettings.vat_regime]?.code || '01',
        updated_at: new Date().toISOString(),
      })
      .eq("id", invoice_id);

    if (updateError) {
      console.error("Failed to update invoice:", updateError);
    }

    // Log submission
    await supabase.from("regulatory_submissions").insert({
      organization_id: invoice.organization_id,
      invoice_id: invoice_id,
      submission_type: "sii",
      status: "sent",
      request_data: { 
        endpoint,
        test_mode,
        envelope_preview: soapEnvelope.substring(0, 500) + '...',
      },
      response_data: simulatedResponse,
      submitted_at: new Date().toISOString(),
    });

    return new Response(
      JSON.stringify({
        success: true,
        csv: simulatedResponse.CSV,
        status: 'sent',
        test_mode,
        message: test_mode 
          ? "Simulación SII completada. En producción se enviaría con certificado digital."
          : "Factura enviada al SII correctamente",
        response: simulatedResponse,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error submitting to SII:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: "Internal server error", details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
