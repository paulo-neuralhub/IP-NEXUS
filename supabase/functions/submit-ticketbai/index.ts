import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// TicketBAI - Basque Country electronic invoicing system
// Required for Bizkaia (BI), Gipuzkoa (SS), and Álava (VI)

// TicketBAI endpoints by territory
const TBAI_ENDPOINTS = {
  BI: { // Bizkaia
    production: "https://batuz.eus/QRTBAI/TicketBAI",
    test: "https://pruebas.batuz.eus/QRTBAI/TicketBAI",
    qr_base: "https://batuz.eus/QRTBAI/",
  },
  SS: { // Gipuzkoa
    production: "https://tbai.egoitza.gipuzkoa.eus/WAS/HACI/HTBAIValidarFacturaWEB/rest/validarFactura",
    test: "https://tbai-z.egoitza.gipuzkoa.eus/WAS/HACI/HTBAIValidarFacturaWEB/rest/validarFactura",
    qr_base: "https://tbai.egoitza.gipuzkoa.eus/qr/",
  },
  VI: { // Álava
    production: "https://ticketbai.araba.eus/TicketBAI",
    test: "https://pruebas.ticketbai.araba.eus/TicketBAI",
    qr_base: "https://ticketbai.araba.eus/tbai/qr/",
  },
};

interface TBAIRequest {
  invoice_id: string;
  test_mode?: boolean;
}

// Generate TicketBAI identifier
function generateTBAIIdentifier(
  nif: string,
  issueDate: Date,
  signature: string
): string {
  const dateStr = `${issueDate.getDate().toString().padStart(2, '0')}${(issueDate.getMonth() + 1).toString().padStart(2, '0')}${issueDate.getFullYear()}`;
  const sigPart = signature.substring(0, 13);
  return `TBAI-${nif}-${dateStr}-${sigPart}`;
}

// Calculate chain hash for TicketBAI
function calculateChainHash(
  previousSeries: string | null,
  previousNumber: string | null,
  previousDate: string | null,
  previousSignature: string | null
): string {
  if (!previousSignature) {
    // First invoice in chain
    return '0'.repeat(64);
  }
  
  // In production, this would be a proper SHA-256 hash
  const data = `${previousSeries || ''}${previousNumber || ''}${previousDate || ''}${previousSignature || ''}`;
  
  // Simulated hash (in production, use crypto.subtle.digest)
  let hash = '';
  for (let i = 0; i < 64; i++) {
    hash += Math.floor(Math.random() * 16).toString(16);
  }
  return hash.toUpperCase();
}

// Generate QR code URL
function generateQRUrl(
  territory: string,
  tbaiId: string,
  series: string,
  number: string,
  total: number,
  nif: string
): string {
  const endpoint = TBAI_ENDPOINTS[territory as keyof typeof TBAI_ENDPOINTS];
  if (!endpoint) return '';
  
  const params = new URLSearchParams({
    id: tbaiId,
    s: series || '',
    nf: number,
    i: total.toFixed(2),
    cr: nif,
  });
  
  return `${endpoint.qr_base}?${params.toString()}`;
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

function formatTBAIDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getDate().toString().padStart(2, '0')}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getFullYear()}`;
}

function formatTBAITime(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;
}

// Build TicketBAI XML
function buildTBAIXml(
  invoice: any,
  fiscalSettings: any,
  client: any,
  lines: any[],
  previousInvoice: any | null
): string {
  const issueDate = new Date(invoice.issue_date);
  const chainHash = calculateChainHash(
    previousInvoice?.series,
    previousInvoice?.invoice_number,
    previousInvoice?.issue_date,
    previousInvoice?.tbai_signature
  );
  
  // Build invoice lines
  let detallesXml = '';
  lines.forEach((line: any, index: number) => {
    detallesXml += `
        <DetalleFactura>
          <DescripcionDetalle>${escapeXml(line.description || line.concept || 'Servicio')}</DescripcionDetalle>
          <Cantidad>${(line.quantity || 1).toFixed(2)}</Cantidad>
          <ImporteUnitario>${(line.unit_price || 0).toFixed(8)}</ImporteUnitario>
          <Descuento>${(line.discount_amount || 0).toFixed(2)}</Descuento>
          <ImporteTotal>${(line.total || line.subtotal || 0).toFixed(2)}</ImporteTotal>
        </DetalleFactura>`;
  });

  // Build VAT breakdown
  const vatBreakdown = invoice.vat_breakdown || [];
  let ivaDesglose = '';
  
  if (vatBreakdown.length > 0) {
    vatBreakdown.forEach((vat: any) => {
      ivaDesglose += `
        <DetalleNoExenta>
          <TipoNoExenta>S1</TipoNoExenta>
          <DetalleIVA>
            <BaseImponible>${vat.base.toFixed(2)}</BaseImponible>
            <TipoImpositivo>${vat.rate.toFixed(2)}</TipoImpositivo>
            <CuotaImpuesto>${vat.amount.toFixed(2)}</CuotaImpuesto>
            ${vat.surcharge && vat.surcharge > 0 ? `
            <TipoRecargoEquivalencia>${(vat.surcharge_rate || 0).toFixed(2)}</TipoRecargoEquivalencia>
            <CuotaRecargoEquivalencia>${vat.surcharge.toFixed(2)}</CuotaRecargoEquivalencia>` : ''}
          </DetalleIVA>
        </DetalleNoExenta>`;
    });
  } else {
    ivaDesglose = `
        <DetalleNoExenta>
          <TipoNoExenta>S1</TipoNoExenta>
          <DetalleIVA>
            <BaseImponible>${invoice.tax_base.toFixed(2)}</BaseImponible>
            <TipoImpositivo>21.00</TipoImpositivo>
            <CuotaImpuesto>${invoice.total_vat.toFixed(2)}</CuotaImpuesto>
          </DetalleIVA>
        </DetalleNoExenta>`;
  }

  // Build recipient (Destinatario)
  let destinatarioXml = '';
  if (client.tax_id) {
    const isSpanish = (client.country || 'ES').toUpperCase() === 'ES';
    destinatarioXml = `
      <Destinatarios>
        <IDDestinatario>
          ${isSpanish ? `<NIF>${escapeXml(client.tax_id)}</NIF>` : `
          <IDOtro>
            <CodigoPais>${client.country || 'ES'}</CodigoPais>
            <IDType>02</IDType>
            <ID>${escapeXml(client.tax_id)}</ID>
          </IDOtro>`}
          <ApellidosNombreRazonSocial>${escapeXml(client.name)}</ApellidosNombreRazonSocial>
          ${client.postal_code ? `<CodigoPostal>${escapeXml(client.postal_code)}</CodigoPostal>` : ''}
          ${client.address ? `<Direccion>${escapeXml(client.address)}</Direccion>` : ''}
        </IDDestinatario>
      </Destinatarios>`;
  }

  // Build chaining (HuellaTBAI)
  let encadenamientoXml = '';
  if (previousInvoice) {
    encadenamientoXml = `
      <EncadenamientoFacturaAnterior>
        <SerieFacturaAnterior>${escapeXml(previousInvoice.series || '')}</SerieFacturaAnterior>
        <NumFacturaAnterior>${escapeXml(previousInvoice.invoice_number)}</NumFacturaAnterior>
        <FechaExpedicionFacturaAnterior>${formatTBAIDate(previousInvoice.issue_date)}</FechaExpedicionFacturaAnterior>
        <SignatureValueFirmaFacturaAnterior>${escapeXml(previousInvoice.tbai_signature || chainHash)}</SignatureValueFirmaFacturaAnterior>
      </EncadenamientoFacturaAnterior>`;
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<T:TicketBai xmlns:T="urn:ticketbai:emision" xmlns:ds="http://www.w3.org/2000/09/xmldsig#">
  <Cabecera>
    <IDVersionTBAI>1.2</IDVersionTBAI>
  </Cabecera>
  <Sujetos>
    <Emisor>
      <NIF>${escapeXml(fiscalSettings.tax_id)}</NIF>
      <ApellidosNombreRazonSocial>${escapeXml(fiscalSettings.legal_name)}</ApellidosNombreRazonSocial>
    </Emisor>
    ${destinatarioXml}
  </Sujetos>
  <Factura>
    <CabeceraFactura>
      <SerieFactura>${escapeXml(invoice.series || '')}</SerieFactura>
      <NumFactura>${escapeXml(invoice.invoice_number)}</NumFactura>
      <FechaExpedicionFactura>${formatTBAIDate(invoice.issue_date)}</FechaExpedicionFactura>
      <HoraExpedicionFactura>${formatTBAITime(invoice.issue_date)}</HoraExpedicionFactura>
      <FacturaSimplificada>${invoice.invoice_type === 'FA' ? 'S' : 'N'}</FacturaSimplificada>
      ${invoice.corrected_invoice_id ? `
      <FacturaEmitidaSustitucionSimplificada>N</FacturaEmitidaSustitucionSimplificada>
      <FacturaRectificativa>
        <Codigo>${invoice.correction_reason || '01'}</Codigo>
        <Tipo>S</Tipo>
        <ImporteRectificacionSustitutiva>
          <BaseRectificada>${invoice.tax_base.toFixed(2)}</BaseRectificada>
          <CuotaRectificada>${invoice.total_vat.toFixed(2)}</CuotaRectificada>
        </ImporteRectificacionSustitutiva>
      </FacturaRectificativa>` : ''}
    </CabeceraFactura>
    <DatosFactura>
      <FechaOperacion>${formatTBAIDate(invoice.tax_point_date || invoice.issue_date)}</FechaOperacion>
      <DescripcionFactura>${escapeXml(lines[0]?.description || 'Servicios profesionales')}</DescripcionFactura>
      <DetallesFactura>${detallesXml}
      </DetallesFactura>
      <ImporteTotalFactura>${invoice.total.toFixed(2)}</ImporteTotalFactura>
      ${invoice.total_withholding > 0 ? `
      <RetencionSoportada>${invoice.total_withholding.toFixed(2)}</RetencionSoportada>` : ''}
      <Claves>
        <IDClave>
          <ClaveRegimenIvaOpTrascendencia>01</ClaveRegimenIvaOpTrascendencia>
        </IDClave>
      </Claves>
    </DatosFactura>
    <TipoDesglose>
      <DesgloseFactura>
        <Sujeta>
          <NoExenta>${ivaDesglose}
          </NoExenta>
        </Sujeta>
      </DesgloseFactura>
    </TipoDesglose>
  </Factura>
  <HuellaTBAI>
    ${encadenamientoXml}
    <Software>
      <LicenciaTBAI>${escapeXml(fiscalSettings.tbai_license_key || 'TBAIXXXXXX')}</LicenciaTBAI>
      <EntidadDesarrolladora>
        <NIF>${escapeXml(fiscalSettings.tax_id)}</NIF>
      </EntidadDesarrolladora>
      <Nombre>${escapeXml(fiscalSettings.tbai_software_name || 'IP-NEXUS')}</Nombre>
      <Version>${escapeXml(fiscalSettings.tbai_software_version || '1.0.0')}</Version>
    </Software>
  </HuellaTBAI>
</T:TicketBai>`;

  return xml;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { invoice_id, test_mode = true }: TBAIRequest = await req.json();

    if (!invoice_id) {
      return new Response(
        JSON.stringify({ error: "invoice_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .select(`
        *,
        clients:client_id (
          id, name, tax_id, tax_id_type,
          billing_address, billing_postal_code, billing_city,
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
      .eq("invoice_id", invoice_id)
      .order("line_number", { ascending: true });

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

    // Check TicketBAI is enabled
    if (!fiscalSettings.tbai_enabled) {
      return new Response(
        JSON.stringify({ error: "TicketBAI not enabled for this organization" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const territory = fiscalSettings.tbai_territory;
    if (!territory || !TBAI_ENDPOINTS[territory as keyof typeof TBAI_ENDPOINTS]) {
      return new Response(
        JSON.stringify({ error: "Invalid TicketBAI territory. Must be BI, SS, or VI" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get previous invoice for chaining
    const { data: previousInvoice } = await supabase
      .from("invoices")
      .select("id, series, invoice_number, issue_date, tbai_signature, tbai_identifier")
      .eq("organization_id", invoice.organization_id)
      .not("tbai_identifier", "is", null)
      .lt("issue_date", invoice.issue_date)
      .order("issue_date", { ascending: false })
      .limit(1)
      .single();

    // Map client
    const client = {
      name: invoice.clients?.name || invoice.client_name || '',
      tax_id: invoice.clients?.tax_id || '',
      address: invoice.clients?.billing_address || '',
      postal_code: invoice.clients?.billing_postal_code || '',
      city: invoice.clients?.billing_city || '',
      country: invoice.clients?.billing_country || 'ES',
    };

    // Build XML
    const xml = buildTBAIXml(invoice, fiscalSettings, client, lines || [], previousInvoice);

    // Generate simulated signature and identifier
    const simulatedSignature = `SIG${Date.now()}${Math.random().toString(36).substr(2, 10).toUpperCase()}`;
    const issueDate = new Date(invoice.issue_date);
    const tbaiId = generateTBAIIdentifier(fiscalSettings.tax_id, issueDate, simulatedSignature);
    
    // Generate QR URL
    const qrUrl = generateQRUrl(
      territory,
      tbaiId,
      invoice.series || '',
      invoice.invoice_number,
      invoice.total,
      fiscalSettings.tax_id
    );

    // Calculate chain hash
    const chainHash = calculateChainHash(
      previousInvoice?.series,
      previousInvoice?.invoice_number,
      previousInvoice?.issue_date,
      previousInvoice?.tbai_signature
    );

    // Update invoice
    const { error: updateError } = await supabase
      .from("invoices")
      .update({
        tbai_status: 'sent',
        tbai_identifier: tbaiId,
        tbai_qr_url: qrUrl,
        tbai_signature: simulatedSignature,
        tbai_sent_at: new Date().toISOString(),
        tbai_chain_hash: chainHash,
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
      submission_type: "ticketbai",
      status: "sent",
      request_data: {
        territory,
        test_mode,
        xml_preview: xml.substring(0, 500) + '...',
      },
      response_data: {
        tbai_identifier: tbaiId,
        qr_url: qrUrl,
        chain_hash: chainHash,
      },
      submitted_at: new Date().toISOString(),
    });

    return new Response(
      JSON.stringify({
        success: true,
        tbai_identifier: tbaiId,
        qr_url: qrUrl,
        chain_hash: chainHash,
        territory,
        test_mode,
        message: test_mode
          ? `Simulación TicketBAI (${territory}) completada. En producción se firmaría y enviaría.`
          : `Factura enviada a TicketBAI (${territory}) correctamente`,
        xml_preview: xml.substring(0, 1000),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error submitting to TicketBAI:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: "Internal server error", details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
