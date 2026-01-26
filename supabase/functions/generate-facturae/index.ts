import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Facturae 3.2.2 XML Generator
// Spanish electronic invoicing standard

interface InvoiceLine {
  id: string;
  line_number: number;
  concept: string;
  description?: string;
  quantity: number;
  unit_price: number;
  discount_percent: number;
  discount_amount: number;
  subtotal: number;
  vat_rate: number;
  vat_amount: number;
  surcharge_rate: number;
  surcharge_amount: number;
  total: number;
}

interface Invoice {
  id: string;
  invoice_number: string;
  series?: string;
  invoice_type: string;
  issue_date: string;
  due_date?: string;
  tax_point_date?: string;
  subtotal: number;
  discount_percent: number;
  discount_amount: number;
  tax_base: number;
  vat_breakdown: any[];
  total_vat: number;
  total_surcharge: number;
  total_withholding: number;
  withholding_percent: number;
  total: number;
  currency: string;
  payment_method?: string;
  notes?: string;
  corrected_invoice_id?: string;
  correction_reason?: string;
  correction_description?: string;
}

interface FiscalSettings {
  tax_id: string;
  tax_id_type: string;
  legal_name: string;
  trade_name?: string;
  address_line1?: string;
  address_line2?: string;
  postal_code?: string;
  city?: string;
  province?: string;
  country_code: string;
  default_bank_account?: string;
  default_bank_bic?: string;
}

interface Client {
  id: string;
  name: string;
  tax_id?: string;
  tax_id_type?: string;
  address?: string;
  postal_code?: string;
  city?: string;
  province?: string;
  country?: string;
  is_company?: boolean;
}

// XML escape helper
function escapeXml(str: string | null | undefined): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Format decimal for Facturae (2 decimals)
function formatDecimal(num: number, decimals = 2): string {
  return num.toFixed(decimals);
}

// Format date for Facturae (YYYY-MM-DD)
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toISOString().split('T')[0];
}

// Get person type code (J=Juridica, F=Fisica)
function getPersonTypeCode(isCompany: boolean): string {
  return isCompany ? 'J' : 'F';
}

// Get country code in ISO 3166-1 alpha-3
function getCountryCode3(code2: string): string {
  const mapping: Record<string, string> = {
    'ES': 'ESP', 'PT': 'PRT', 'FR': 'FRA', 'DE': 'DEU',
    'IT': 'ITA', 'GB': 'GBR', 'US': 'USA', 'BE': 'BEL',
    'NL': 'NLD', 'AT': 'AUT', 'CH': 'CHE', 'IE': 'IRL',
  };
  return mapping[code2?.toUpperCase()] || 'ESP';
}

// Get invoice document type code
function getInvoiceDocumentType(invoiceType: string): string {
  const mapping: Record<string, string> = {
    'FC': 'FC', // Factura completa
    'FA': 'FA', // Factura simplificada
    'FR': 'FC', // Rectificativa (document type is still FC)
    'NC': 'FC', // Nota de crédito
  };
  return mapping[invoiceType] || 'FC';
}

// Get invoice class (OO=Original, OR=Rectificativa, OC=Copia)
function getInvoiceClass(invoiceType: string, correctedInvoiceId?: string): string {
  if (invoiceType === 'FR' || invoiceType === 'NC' || correctedInvoiceId) {
    return 'OR'; // Rectificativa
  }
  return 'OO'; // Original
}

// Get payment means code
function getPaymentMeansCode(method?: string): string {
  const mapping: Record<string, string> = {
    'cash': '01',
    'check': '02',
    'transfer': '04',
    'direct_debit': '05',
    'card': '19',
    'promissory_note': '06',
  };
  return mapping[method || 'transfer'] || '04';
}

// Generate Facturae XML
function generateFacturaeXml(
  invoice: Invoice,
  lines: InvoiceLine[],
  fiscalSettings: FiscalSettings,
  client: Client
): string {
  const batchId = `${fiscalSettings.tax_id}${invoice.invoice_number}`.replace(/[^a-zA-Z0-9]/g, '');
  const invoiceClass = getInvoiceClass(invoice.invoice_type, invoice.corrected_invoice_id);
  
  // Build VAT breakdown XML
  let taxesOutputsXml = '';
  const vatBreakdown = invoice.vat_breakdown || [];
  
  if (vatBreakdown.length > 0) {
    vatBreakdown.forEach((vat: any) => {
      taxesOutputsXml += `
          <Tax>
            <TaxTypeCode>01</TaxTypeCode>
            <TaxRate>${formatDecimal(vat.rate)}</TaxRate>
            <TaxableBase>
              <TotalAmount>${formatDecimal(vat.base)}</TotalAmount>
            </TaxableBase>
            <TaxAmount>
              <TotalAmount>${formatDecimal(vat.amount)}</TotalAmount>
            </TaxAmount>
            ${vat.surcharge > 0 ? `
            <EquivalenceSurcharge>${formatDecimal(vat.surcharge_rate || 0)}</EquivalenceSurcharge>
            <EquivalenceSurchargeAmount>
              <TotalAmount>${formatDecimal(vat.surcharge)}</TotalAmount>
            </EquivalenceSurchargeAmount>` : ''}
          </Tax>`;
    });
  } else {
    // Default 21% if no breakdown
    taxesOutputsXml = `
          <Tax>
            <TaxTypeCode>01</TaxTypeCode>
            <TaxRate>21.00</TaxRate>
            <TaxableBase>
              <TotalAmount>${formatDecimal(invoice.tax_base)}</TotalAmount>
            </TaxableBase>
            <TaxAmount>
              <TotalAmount>${formatDecimal(invoice.total_vat)}</TotalAmount>
            </TaxAmount>
          </Tax>`;
  }

  // Build invoice lines XML
  let itemsXml = '';
  lines.forEach((line, index) => {
    itemsXml += `
        <InvoiceLine>
          <ItemDescription>${escapeXml(line.concept)}</ItemDescription>
          ${line.description ? `<AdditionalLineItemInformation>${escapeXml(line.description)}</AdditionalLineItemInformation>` : ''}
          <Quantity>${formatDecimal(line.quantity, 3)}</Quantity>
          <UnitOfMeasure>01</UnitOfMeasure>
          <UnitPriceWithoutTax>${formatDecimal(line.unit_price, 4)}</UnitPriceWithoutTax>
          <TotalCost>${formatDecimal(line.quantity * line.unit_price)}</TotalCost>
          ${line.discount_amount > 0 ? `
          <DiscountsAndRebates>
            <Discount>
              <DiscountReason>Descuento</DiscountReason>
              <DiscountRate>${formatDecimal(line.discount_percent)}</DiscountRate>
              <DiscountAmount>${formatDecimal(line.discount_amount)}</DiscountAmount>
            </Discount>
          </DiscountsAndRebates>` : ''}
          <GrossAmount>${formatDecimal(line.subtotal)}</GrossAmount>
          <TaxesOutputs>
            <Tax>
              <TaxTypeCode>01</TaxTypeCode>
              <TaxRate>${formatDecimal(line.vat_rate)}</TaxRate>
              <TaxableBase>
                <TotalAmount>${formatDecimal(line.subtotal)}</TotalAmount>
              </TaxableBase>
              <TaxAmount>
                <TotalAmount>${formatDecimal(line.vat_amount)}</TotalAmount>
              </TaxAmount>
            </Tax>
          </TaxesOutputs>
        </InvoiceLine>`;
  });

  // Build corrective data if applicable
  let correctiveXml = '';
  if (invoice.corrected_invoice_id && invoice.correction_reason) {
    correctiveXml = `
      <Corrective>
        <InvoiceNumber>${invoice.corrected_invoice_id}</InvoiceNumber>
        <ReasonCode>${invoice.correction_reason}</ReasonCode>
        <ReasonDescription>${escapeXml(invoice.correction_description || 'Corrección de factura')}</ReasonDescription>
        <TaxPeriod>
          <StartDate>${formatDate(invoice.issue_date)}</StartDate>
          <EndDate>${formatDate(invoice.issue_date)}</EndDate>
        </TaxPeriod>
        <CorrectionMethod>01</CorrectionMethod>
        <CorrectionMethodDescription>Rectificación íntegra</CorrectionMethodDescription>
      </Corrective>`;
  }

  // Build withholding XML if applicable
  let withholdingXml = '';
  if (invoice.total_withholding > 0) {
    withholdingXml = `
        <TaxesWithheld>
          <Tax>
            <TaxTypeCode>04</TaxTypeCode>
            <TaxRate>${formatDecimal(invoice.withholding_percent)}</TaxRate>
            <TaxableBase>
              <TotalAmount>${formatDecimal(invoice.tax_base)}</TotalAmount>
            </TaxableBase>
            <TaxAmount>
              <TotalAmount>${formatDecimal(invoice.total_withholding)}</TotalAmount>
            </TaxAmount>
          </Tax>
        </TaxesWithheld>`;
  }

  // Build payment details
  let paymentDetailsXml = '';
  if (invoice.due_date) {
    paymentDetailsXml = `
      <PaymentDetails>
        <Installment>
          <InstallmentDueDate>${formatDate(invoice.due_date)}</InstallmentDueDate>
          <InstallmentAmount>${formatDecimal(invoice.total)}</InstallmentAmount>
          <PaymentMeans>${getPaymentMeansCode(invoice.payment_method)}</PaymentMeans>
          ${fiscalSettings.default_bank_account ? `
          <AccountToBeCredited>
            <IBAN>${escapeXml(fiscalSettings.default_bank_account)}</IBAN>
            ${fiscalSettings.default_bank_bic ? `<BIC>${escapeXml(fiscalSettings.default_bank_bic)}</BIC>` : ''}
          </AccountToBeCredited>` : ''}
        </Installment>
      </PaymentDetails>`;
  }

  // Build legal literals
  let legalLiteralsXml = '';
  if (invoice.notes) {
    legalLiteralsXml = `
      <LegalLiterals>
        <LegalReference>${escapeXml(invoice.notes)}</LegalReference>
      </LegalLiterals>`;
  }

  // Calculate executable amount (total - withholding)
  const executableAmount = invoice.total - (invoice.total_withholding || 0);

  // Build full XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<fe:Facturae xmlns:fe="http://www.facturae.gob.es/formato/Versiones/Facturaev3_2_2.xml" xmlns:ds="http://www.w3.org/2000/09/xmldsig#">
  <FileHeader>
    <SchemaVersion>3.2.2</SchemaVersion>
    <Modality>I</Modality>
    <InvoiceIssuerType>EM</InvoiceIssuerType>
    <Batch>
      <BatchIdentifier>${escapeXml(batchId)}</BatchIdentifier>
      <InvoicesCount>1</InvoicesCount>
      <TotalInvoicesAmount>
        <TotalAmount>${formatDecimal(invoice.total)}</TotalAmount>
      </TotalInvoicesAmount>
      <TotalOutstandingAmount>
        <TotalAmount>${formatDecimal(invoice.total)}</TotalAmount>
      </TotalOutstandingAmount>
      <TotalExecutableAmount>
        <TotalAmount>${formatDecimal(executableAmount)}</TotalAmount>
      </TotalExecutableAmount>
      <InvoiceCurrencyCode>${invoice.currency || 'EUR'}</InvoiceCurrencyCode>
    </Batch>
  </FileHeader>
  
  <Parties>
    <SellerParty>
      <TaxIdentification>
        <PersonTypeCode>${getPersonTypeCode(true)}</PersonTypeCode>
        <ResidenceTypeCode>R</ResidenceTypeCode>
        <TaxIdentificationNumber>${escapeXml(fiscalSettings.tax_id)}</TaxIdentificationNumber>
      </TaxIdentification>
      <LegalEntity>
        <CorporateName>${escapeXml(fiscalSettings.legal_name)}</CorporateName>
        ${fiscalSettings.trade_name ? `<TradeName>${escapeXml(fiscalSettings.trade_name)}</TradeName>` : ''}
        <AddressInSpain>
          <Address>${escapeXml(fiscalSettings.address_line1 || '')}</Address>
          <PostCode>${escapeXml(fiscalSettings.postal_code || '00000')}</PostCode>
          <Town>${escapeXml(fiscalSettings.city || '')}</Town>
          <Province>${escapeXml(fiscalSettings.province || '')}</Province>
          <CountryCode>${getCountryCode3(fiscalSettings.country_code)}</CountryCode>
        </AddressInSpain>
      </LegalEntity>
    </SellerParty>
    
    <BuyerParty>
      <TaxIdentification>
        <PersonTypeCode>${getPersonTypeCode(client.is_company !== false)}</PersonTypeCode>
        <ResidenceTypeCode>${(client.country || 'ES').toUpperCase() === 'ES' ? 'R' : 'E'}</ResidenceTypeCode>
        <TaxIdentificationNumber>${escapeXml(client.tax_id || '')}</TaxIdentificationNumber>
      </TaxIdentification>
      ${client.is_company !== false ? `
      <LegalEntity>
        <CorporateName>${escapeXml(client.name)}</CorporateName>
        <AddressInSpain>
          <Address>${escapeXml(client.address || '')}</Address>
          <PostCode>${escapeXml(client.postal_code || '00000')}</PostCode>
          <Town>${escapeXml(client.city || '')}</Town>
          <Province>${escapeXml(client.province || '')}</Province>
          <CountryCode>${getCountryCode3(client.country || 'ES')}</CountryCode>
        </AddressInSpain>
      </LegalEntity>` : `
      <Individual>
        <Name>${escapeXml(client.name.split(' ')[0] || '')}</Name>
        <FirstSurname>${escapeXml(client.name.split(' ').slice(1).join(' ') || '')}</FirstSurname>
        <AddressInSpain>
          <Address>${escapeXml(client.address || '')}</Address>
          <PostCode>${escapeXml(client.postal_code || '00000')}</PostCode>
          <Town>${escapeXml(client.city || '')}</Town>
          <Province>${escapeXml(client.province || '')}</Province>
          <CountryCode>${getCountryCode3(client.country || 'ES')}</CountryCode>
        </AddressInSpain>
      </Individual>`}
    </BuyerParty>
  </Parties>
  
  <Invoices>
    <Invoice>
      <InvoiceHeader>
        <InvoiceNumber>${escapeXml(invoice.invoice_number)}</InvoiceNumber>
        ${invoice.series ? `<InvoiceSeriesCode>${escapeXml(invoice.series)}</InvoiceSeriesCode>` : ''}
        <InvoiceDocumentType>${getInvoiceDocumentType(invoice.invoice_type)}</InvoiceDocumentType>
        <InvoiceClass>${invoiceClass}</InvoiceClass>
        ${correctiveXml}
      </InvoiceHeader>
      
      <InvoiceIssueData>
        <IssueDate>${formatDate(invoice.issue_date)}</IssueDate>
        ${invoice.tax_point_date ? `<OperationDate>${formatDate(invoice.tax_point_date)}</OperationDate>` : ''}
        <InvoiceCurrencyCode>${invoice.currency || 'EUR'}</InvoiceCurrencyCode>
        <TaxCurrencyCode>EUR</TaxCurrencyCode>
        <LanguageName>es</LanguageName>
      </InvoiceIssueData>
      
      <TaxesOutputs>${taxesOutputsXml}
      </TaxesOutputs>
      ${withholdingXml}
      
      <InvoiceTotals>
        <TotalGrossAmount>${formatDecimal(invoice.subtotal)}</TotalGrossAmount>
        ${invoice.discount_amount > 0 ? `
        <GeneralDiscounts>
          <Discount>
            <DiscountReason>Descuento general</DiscountReason>
            <DiscountRate>${formatDecimal(invoice.discount_percent)}</DiscountRate>
            <DiscountAmount>${formatDecimal(invoice.discount_amount)}</DiscountAmount>
          </Discount>
        </GeneralDiscounts>
        <TotalGeneralDiscounts>${formatDecimal(invoice.discount_amount)}</TotalGeneralDiscounts>` : ''}
        <TotalGrossAmountBeforeTaxes>${formatDecimal(invoice.tax_base)}</TotalGrossAmountBeforeTaxes>
        <TotalTaxOutputs>${formatDecimal(invoice.total_vat + (invoice.total_surcharge || 0))}</TotalTaxOutputs>
        ${invoice.total_withholding > 0 ? `<TotalTaxesWithheld>${formatDecimal(invoice.total_withholding)}</TotalTaxesWithheld>` : ''}
        <InvoiceTotal>${formatDecimal(invoice.total)}</InvoiceTotal>
        <TotalOutstandingAmount>${formatDecimal(invoice.total)}</TotalOutstandingAmount>
        <TotalExecutableAmount>${formatDecimal(executableAmount)}</TotalExecutableAmount>
      </InvoiceTotals>
      
      <Items>${itemsXml}
      </Items>
      ${paymentDetailsXml}
      ${legalLiteralsXml}
    </Invoice>
  </Invoices>
</fe:Facturae>`;

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

    const { invoice_id, sign = false } = await req.json();

    if (!invoice_id) {
      return new Response(
        JSON.stringify({ error: "invoice_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get invoice with client data
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .select(`
        *,
        clients:client_id (
          id, name, tax_id, tax_id_type, 
          billing_address, billing_city, billing_postal_code, 
          billing_province, billing_country, type
        )
      `)
      .eq("id", invoice_id)
      .single();

    if (invoiceError || !invoice) {
      return new Response(
        JSON.stringify({ error: "Invoice not found", details: invoiceError }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get invoice lines
    const { data: lines, error: linesError } = await supabase
      .from("invoice_items")
      .select("*")
      .eq("invoice_id", invoice_id)
      .order("line_number", { ascending: true });

    if (linesError) {
      return new Response(
        JSON.stringify({ error: "Failed to get invoice lines", details: linesError }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get fiscal settings
    const { data: fiscalSettings, error: fiscalError } = await supabase
      .from("fiscal_settings")
      .select("*")
      .eq("organization_id", invoice.organization_id)
      .single();

    if (fiscalError || !fiscalSettings) {
      return new Response(
        JSON.stringify({ error: "Fiscal settings not configured", details: fiscalError }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Map client data
    const client: Client = {
      id: invoice.clients?.id || '',
      name: invoice.clients?.name || invoice.client_name || '',
      tax_id: invoice.clients?.tax_id || '',
      tax_id_type: invoice.clients?.tax_id_type || 'NIF',
      address: invoice.clients?.billing_address || '',
      postal_code: invoice.clients?.billing_postal_code || '',
      city: invoice.clients?.billing_city || '',
      province: invoice.clients?.billing_province || '',
      country: invoice.clients?.billing_country || 'ES',
      is_company: invoice.clients?.type === 'company',
    };

    // Map lines
    const mappedLines: InvoiceLine[] = (lines || []).map((line: any, index: number) => ({
      id: line.id,
      line_number: line.line_number || index + 1,
      concept: line.description || line.concept || 'Servicios profesionales',
      description: line.notes,
      quantity: line.quantity || 1,
      unit_price: line.unit_price || 0,
      discount_percent: line.discount_percent || 0,
      discount_amount: line.discount_amount || 0,
      subtotal: line.subtotal || (line.quantity * line.unit_price),
      vat_rate: line.vat_rate || 21,
      vat_amount: line.vat_amount || 0,
      surcharge_rate: line.surcharge_rate || 0,
      surcharge_amount: line.surcharge_amount || 0,
      total: line.total || line.subtotal || 0,
    }));

    // Generate XML
    const xml = generateFacturaeXml(invoice, mappedLines, fiscalSettings, client);

    // Save XML to invoice
    const { error: updateError } = await supabase
      .from("invoices")
      .update({
        facturae_xml: xml,
        facturae_signed: sign,
        updated_at: new Date().toISOString(),
      })
      .eq("id", invoice_id);

    if (updateError) {
      console.error("Failed to save XML:", updateError);
    }

    // Log regulatory submission
    await supabase.from("regulatory_submissions").insert({
      organization_id: invoice.organization_id,
      invoice_id: invoice_id,
      submission_type: "facturae",
      status: "generated",
      request_data: { sign },
      response_data: { xml_length: xml.length },
    });

    return new Response(
      JSON.stringify({
        success: true,
        xml,
        invoice_number: invoice.invoice_number,
        signed: sign,
        message: sign 
          ? "XML generado. La firma XAdES requiere certificado digital configurado."
          : "XML Facturae 3.2.2 generado correctamente",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error generating Facturae:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: "Internal server error", details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
