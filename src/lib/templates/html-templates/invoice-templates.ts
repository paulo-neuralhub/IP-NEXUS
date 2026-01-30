// src/lib/templates/html-templates/invoice-templates.ts
// Plantillas HTML para facturas en cada estilo

export const INVOICE_CLASSIC = `
<div style="font-family: Arial, sans-serif; color: #1F2937; max-width: 800px; margin: 0 auto; padding: 40px;">
  <!-- Header -->
  <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #1E40AF; padding-bottom: 20px; margin-bottom: 30px;">
    <div>
      <div style="font-size: 12px; color: #6B7280; margin-bottom: 4px;">{{company_logo}}</div>
      <div style="font-size: 24px; font-weight: bold; color: #1E40AF; font-family: Georgia, serif;">{{company_name}}</div>
      <div style="font-size: 12px; color: #6B7280; margin-top: 8px;">
        {{company_address}}<br>
        Tel: {{company_phone}} | {{company_email}}
      </div>
    </div>
    <div style="text-align: right;">
      <div style="font-size: 32px; font-weight: bold; color: #1E40AF; font-family: Georgia, serif;">FACTURA</div>
      <div style="font-size: 14px; color: #6B7280; margin-top: 8px;">
        <strong>Nº:</strong> {{invoice_number}}<br>
        <strong>Fecha:</strong> {{invoice_date}}<br>
        <strong>Vencimiento:</strong> {{due_date}}
      </div>
    </div>
  </div>

  <!-- Client Info -->
  <div style="background: #F3F4F6; padding: 20px; border-radius: 4px; margin-bottom: 30px;">
    <div style="font-size: 12px; color: #6B7280; margin-bottom: 8px;">FACTURAR A:</div>
    <div style="font-weight: bold; font-size: 16px; color: #1E40AF;">{{client_name}}</div>
    <div style="font-size: 14px; color: #4B5563; margin-top: 4px;">
      {{client_address}}<br>
      NIF/CIF: {{client_tax_id}}
    </div>
  </div>

  <!-- Items Table -->
  <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
    <thead>
      <tr style="background: #1E40AF; color: white;">
        <th style="padding: 12px; text-align: left; font-size: 12px; text-transform: uppercase;">Descripción</th>
        <th style="padding: 12px; text-align: center; font-size: 12px; text-transform: uppercase; width: 80px;">Cant.</th>
        <th style="padding: 12px; text-align: right; font-size: 12px; text-transform: uppercase; width: 100px;">Precio</th>
        <th style="padding: 12px; text-align: right; font-size: 12px; text-transform: uppercase; width: 100px;">Total</th>
      </tr>
    </thead>
    <tbody>
      {{#items}}
      <tr style="border-bottom: 1px solid #E5E7EB;">
        <td style="padding: 12px; font-size: 14px;">{{description}}</td>
        <td style="padding: 12px; text-align: center; font-size: 14px;">{{quantity}}</td>
        <td style="padding: 12px; text-align: right; font-size: 14px;">{{unit_price}} €</td>
        <td style="padding: 12px; text-align: right; font-size: 14px; font-weight: 500;">{{line_total}} €</td>
      </tr>
      {{/items}}
    </tbody>
  </table>

  <!-- Totals -->
  <div style="display: flex; justify-content: flex-end;">
    <div style="width: 280px;">
      <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #E5E7EB;">
        <span style="color: #6B7280;">Subtotal</span>
        <span>{{subtotal}} €</span>
      </div>
      <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #E5E7EB;">
        <span style="color: #6B7280;">IVA ({{tax_rate}}%)</span>
        <span>{{tax_amount}} €</span>
      </div>
      <div style="display: flex; justify-content: space-between; padding: 12px 0; background: #1E40AF; color: white; margin-top: 8px; padding: 12px; border-radius: 4px;">
        <span style="font-weight: bold; font-size: 16px;">TOTAL</span>
        <span style="font-weight: bold; font-size: 18px;">{{total}} €</span>
      </div>
    </div>
  </div>

  <!-- Payment Info -->
  <div style="margin-top: 40px; padding: 20px; background: #F9FAFB; border-left: 4px solid #1E40AF; border-radius: 0 4px 4px 0;">
    <div style="font-weight: bold; color: #1E40AF; margin-bottom: 8px;">Datos de Pago</div>
    <div style="font-size: 13px; color: #4B5563;">
      <strong>Banco:</strong> {{bank_name}}<br>
      <strong>IBAN:</strong> {{bank_iban}}<br>
      <strong>Referencia:</strong> {{invoice_number}}
    </div>
  </div>

  <!-- Footer -->
  <div style="margin-top: 40px; text-align: center; font-size: 11px; color: #9CA3AF; border-top: 1px solid #E5E7EB; padding-top: 20px;">
    {{company_name}} | NIF: {{company_tax_id}} | {{company_address}}
  </div>
</div>
`;

export const INVOICE_MODERN = `
<div style="font-family: 'Inter', sans-serif; color: #111827; max-width: 800px; margin: 0 auto; background: linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%); padding: 40px; border-radius: 24px;">
  <!-- Header with gradient -->
  <div style="background: white; border-radius: 16px; padding: 32px; margin-bottom: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <div>
        <div style="font-size: 28px; font-weight: 800; background: linear-gradient(135deg, #7C3AED 0%, #06B6D4 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">{{company_name}}</div>
        <div style="font-size: 12px; color: #6B7280; margin-top: 4px;">{{company_email}} • {{company_phone}}</div>
      </div>
      <div style="text-align: right;">
        <div style="display: inline-block; background: linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%); color: white; padding: 8px 20px; border-radius: 24px; font-weight: 600; font-size: 14px;">
          FACTURA #{{invoice_number}}
        </div>
        <div style="font-size: 13px; color: #6B7280; margin-top: 8px;">{{invoice_date}}</div>
      </div>
    </div>
  </div>

  <!-- Client Card -->
  <div style="background: white; border-radius: 16px; padding: 24px; margin-bottom: 24px;">
    <div style="display: flex; gap: 24px;">
      <div style="flex: 1; padding: 16px; background: #F3F4F6; border-radius: 12px;">
        <div style="font-size: 11px; color: #6B7280; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Cliente</div>
        <div style="font-weight: 600; font-size: 16px; color: #7C3AED;">{{client_name}}</div>
        <div style="font-size: 13px; color: #4B5563; margin-top: 4px;">{{client_address}}</div>
      </div>
      <div style="flex: 1; padding: 16px; background: #F3F4F6; border-radius: 12px;">
        <div style="font-size: 11px; color: #6B7280; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Vencimiento</div>
        <div style="font-weight: 600; font-size: 16px; color: #EF4444;">{{due_date}}</div>
        <div style="font-size: 13px; color: #4B5563; margin-top: 4px;">NIF: {{client_tax_id}}</div>
      </div>
    </div>
  </div>

  <!-- Items -->
  <div style="background: white; border-radius: 16px; padding: 24px; margin-bottom: 24px;">
    <table style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr>
          <th style="padding: 16px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #6B7280; border-bottom: 2px solid #E5E7EB;">Servicio</th>
          <th style="padding: 16px; text-align: center; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #6B7280; border-bottom: 2px solid #E5E7EB;">Qty</th>
          <th style="padding: 16px; text-align: right; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #6B7280; border-bottom: 2px solid #E5E7EB;">Precio</th>
          <th style="padding: 16px; text-align: right; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #6B7280; border-bottom: 2px solid #E5E7EB;">Total</th>
        </tr>
      </thead>
      <tbody>
        {{#items}}
        <tr>
          <td style="padding: 16px; font-size: 14px; font-weight: 500;">{{description}}</td>
          <td style="padding: 16px; text-align: center; font-size: 14px;">{{quantity}}</td>
          <td style="padding: 16px; text-align: right; font-size: 14px;">{{unit_price}} €</td>
          <td style="padding: 16px; text-align: right; font-size: 14px; font-weight: 600; color: #7C3AED;">{{line_total}} €</td>
        </tr>
        {{/items}}
      </tbody>
    </table>
  </div>

  <!-- Total -->
  <div style="background: white; border-radius: 16px; padding: 24px;">
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <div>
        <div style="font-size: 13px; color: #6B7280;">Subtotal: {{subtotal}} € | IVA {{tax_rate}}%: {{tax_amount}} €</div>
      </div>
      <div style="background: linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%); color: white; padding: 16px 32px; border-radius: 12px;">
        <div style="font-size: 12px; opacity: 0.8;">TOTAL A PAGAR</div>
        <div style="font-size: 28px; font-weight: 800;">{{total}} €</div>
      </div>
    </div>
  </div>

  <!-- Footer -->
  <div style="text-align: center; margin-top: 24px; color: rgba(255,255,255,0.7); font-size: 12px;">
    {{company_name}} • {{company_address}} • {{company_tax_id}}
  </div>
</div>
`;

export const INVOICE_MINIMAL = `
<div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #18181B; max-width: 800px; margin: 0 auto; padding: 60px 40px;">
  <!-- Header -->
  <div style="display: flex; justify-content: space-between; margin-bottom: 80px;">
    <div style="font-size: 14px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase;">{{company_name}}</div>
    <div style="text-align: right;">
      <div style="font-size: 11px; color: #A1A1AA; letter-spacing: 1px; text-transform: uppercase;">Factura</div>
      <div style="font-size: 24px; font-weight: 300; margin-top: 4px;">{{invoice_number}}</div>
    </div>
  </div>

  <!-- Info Grid -->
  <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 40px; margin-bottom: 60px;">
    <div>
      <div style="font-size: 10px; color: #A1A1AA; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 8px;">Fecha</div>
      <div style="font-size: 14px;">{{invoice_date}}</div>
    </div>
    <div>
      <div style="font-size: 10px; color: #A1A1AA; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 8px;">Vencimiento</div>
      <div style="font-size: 14px;">{{due_date}}</div>
    </div>
    <div>
      <div style="font-size: 10px; color: #A1A1AA; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 8px;">Cliente</div>
      <div style="font-size: 14px; font-weight: 500;">{{client_name}}</div>
      <div style="font-size: 12px; color: #71717A; margin-top: 4px;">{{client_tax_id}}</div>
    </div>
  </div>

  <!-- Items -->
  <div style="margin-bottom: 60px;">
    <div style="border-top: 1px solid #E4E4E7; border-bottom: 1px solid #E4E4E7; padding: 16px 0;">
      <div style="display: grid; grid-template-columns: 1fr 80px 100px 100px; gap: 16px; font-size: 10px; color: #A1A1AA; letter-spacing: 1px; text-transform: uppercase;">
        <div>Descripción</div>
        <div style="text-align: center;">Cant.</div>
        <div style="text-align: right;">Precio</div>
        <div style="text-align: right;">Importe</div>
      </div>
    </div>
    {{#items}}
    <div style="display: grid; grid-template-columns: 1fr 80px 100px 100px; gap: 16px; padding: 20px 0; border-bottom: 1px solid #F4F4F5;">
      <div style="font-size: 14px;">{{description}}</div>
      <div style="text-align: center; font-size: 14px; color: #71717A;">{{quantity}}</div>
      <div style="text-align: right; font-size: 14px; color: #71717A;">{{unit_price}} €</div>
      <div style="text-align: right; font-size: 14px; font-weight: 500;">{{line_total}} €</div>
    </div>
    {{/items}}
  </div>

  <!-- Totals -->
  <div style="display: flex; justify-content: flex-end;">
    <div style="width: 240px;">
      <div style="display: flex; justify-content: space-between; padding: 8px 0; font-size: 13px; color: #71717A;">
        <span>Subtotal</span>
        <span>{{subtotal}} €</span>
      </div>
      <div style="display: flex; justify-content: space-between; padding: 8px 0; font-size: 13px; color: #71717A;">
        <span>IVA {{tax_rate}}%</span>
        <span>{{tax_amount}} €</span>
      </div>
      <div style="display: flex; justify-content: space-between; padding: 16px 0; margin-top: 8px; border-top: 2px solid #18181B;">
        <span style="font-size: 14px; font-weight: 600;">Total</span>
        <span style="font-size: 20px; font-weight: 600;">{{total}} €</span>
      </div>
    </div>
  </div>

  <!-- Footer -->
  <div style="margin-top: 80px; padding-top: 20px; border-top: 1px solid #E4E4E7; font-size: 11px; color: #A1A1AA;">
    <div>{{company_name}} · {{company_address}} · {{company_tax_id}}</div>
    <div style="margin-top: 4px;">IBAN: {{bank_iban}}</div>
  </div>
</div>
`;

export const INVOICE_CORPORATE = `
<div style="font-family: 'Roboto', Arial, sans-serif; color: #0F172A; max-width: 800px; margin: 0 auto; display: flex;">
  <!-- Sidebar -->
  <div style="width: 200px; background: linear-gradient(180deg, #0F172A 0%, #1E293B 100%); color: white; padding: 40px 24px; min-height: 100%;">
    <div style="font-size: 18px; font-weight: 700; margin-bottom: 40px;">{{company_name}}</div>
    
    <div style="margin-bottom: 32px;">
      <div style="font-size: 10px; opacity: 0.6; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Factura Nº</div>
      <div style="font-size: 16px; font-weight: 600; color: #0EA5E9;">{{invoice_number}}</div>
    </div>
    
    <div style="margin-bottom: 32px;">
      <div style="font-size: 10px; opacity: 0.6; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Fecha Emisión</div>
      <div style="font-size: 14px;">{{invoice_date}}</div>
    </div>
    
    <div style="margin-bottom: 32px;">
      <div style="font-size: 10px; opacity: 0.6; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Vencimiento</div>
      <div style="font-size: 14px;">{{due_date}}</div>
    </div>
    
    <div style="position: absolute; bottom: 40px; left: 24px; right: 24px;">
      <div style="font-size: 10px; opacity: 0.5; line-height: 1.6;">
        {{company_address}}<br>
        {{company_phone}}<br>
        {{company_email}}
      </div>
    </div>
  </div>

  <!-- Main Content -->
  <div style="flex: 1; padding: 40px; background: #FFFFFF;">
    <div style="font-size: 28px; font-weight: 700; color: #0F172A; margin-bottom: 8px;">FACTURA</div>
    <div style="height: 4px; width: 60px; background: #0EA5E9; margin-bottom: 32px;"></div>

    <!-- Client -->
    <div style="background: #F8FAFC; padding: 20px; border-radius: 8px; border-left: 4px solid #0EA5E9; margin-bottom: 32px;">
      <div style="font-size: 11px; color: #64748B; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Facturar a</div>
      <div style="font-size: 16px; font-weight: 600; color: #0F172A;">{{client_name}}</div>
      <div style="font-size: 13px; color: #64748B; margin-top: 4px;">{{client_address}}</div>
      <div style="font-size: 13px; color: #64748B;">NIF/CIF: {{client_tax_id}}</div>
    </div>

    <!-- Items -->
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 32px;">
      <thead>
        <tr style="background: #0F172A; color: white;">
          <th style="padding: 14px 16px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Concepto</th>
          <th style="padding: 14px 16px; text-align: center; font-size: 11px; text-transform: uppercase; width: 60px;">Ud.</th>
          <th style="padding: 14px 16px; text-align: right; font-size: 11px; text-transform: uppercase; width: 90px;">Precio</th>
          <th style="padding: 14px 16px; text-align: right; font-size: 11px; text-transform: uppercase; width: 100px;">Importe</th>
        </tr>
      </thead>
      <tbody>
        {{#items}}
        <tr style="border-bottom: 1px solid #E2E8F0;">
          <td style="padding: 14px 16px; font-size: 13px;">{{description}}</td>
          <td style="padding: 14px 16px; text-align: center; font-size: 13px; color: #64748B;">{{quantity}}</td>
          <td style="padding: 14px 16px; text-align: right; font-size: 13px; color: #64748B;">{{unit_price}} €</td>
          <td style="padding: 14px 16px; text-align: right; font-size: 13px; font-weight: 600;">{{line_total}} €</td>
        </tr>
        {{/items}}
      </tbody>
    </table>

    <!-- Totals -->
    <div style="display: flex; justify-content: flex-end;">
      <div style="width: 260px; background: #F8FAFC; border-radius: 8px; padding: 16px;">
        <div style="display: flex; justify-content: space-between; padding: 8px 0; font-size: 13px; color: #64748B;">
          <span>Base Imponible</span>
          <span>{{subtotal}} €</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 8px 0; font-size: 13px; color: #64748B; border-bottom: 1px solid #E2E8F0;">
          <span>IVA ({{tax_rate}}%)</span>
          <span>{{tax_amount}} €</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 12px 0; margin-top: 8px;">
          <span style="font-size: 14px; font-weight: 600;">TOTAL</span>
          <span style="font-size: 22px; font-weight: 700; color: #0EA5E9;">{{total}} €</span>
        </div>
      </div>
    </div>

    <!-- Payment -->
    <div style="margin-top: 32px; padding: 16px; background: #FFFBEB; border-radius: 8px; border: 1px solid #FDE68A;">
      <div style="font-size: 12px; font-weight: 600; color: #92400E; margin-bottom: 8px;">💳 Datos Bancarios</div>
      <div style="font-size: 12px; color: #78350F;">
        IBAN: {{bank_iban}} | Referencia: {{invoice_number}}
      </div>
    </div>
  </div>
</div>
`;

export const INVOICE_ELEGANT = `
<div style="font-family: 'Lora', Georgia, serif; color: #1C1917; max-width: 800px; margin: 0 auto; padding: 60px; background: #FFFBEB; position: relative;">
  <!-- Decorative corners -->
  <div style="position: absolute; top: 20px; left: 20px; width: 40px; height: 40px; border-top: 2px solid #D97706; border-left: 2px solid #D97706;"></div>
  <div style="position: absolute; top: 20px; right: 20px; width: 40px; height: 40px; border-top: 2px solid #D97706; border-right: 2px solid #D97706;"></div>
  <div style="position: absolute; bottom: 20px; left: 20px; width: 40px; height: 40px; border-bottom: 2px solid #D97706; border-left: 2px solid #D97706;"></div>
  <div style="position: absolute; bottom: 20px; right: 20px; width: 40px; height: 40px; border-bottom: 2px solid #D97706; border-right: 2px solid #D97706;"></div>

  <!-- Header -->
  <div style="text-align: center; margin-bottom: 50px;">
    <div style="font-family: 'Playfair Display', Georgia, serif; font-size: 32px; font-weight: 600; color: #78350F; letter-spacing: 4px;">{{company_name}}</div>
    <div style="width: 120px; height: 1px; background: linear-gradient(90deg, transparent, #D97706, transparent); margin: 20px auto;"></div>
    <div style="font-size: 13px; color: #78716C; letter-spacing: 2px;">{{company_address}}</div>
  </div>

  <!-- Invoice Title -->
  <div style="text-align: center; margin-bottom: 40px;">
    <div style="display: inline-block; border: 1px solid #D97706; padding: 12px 40px;">
      <span style="font-family: 'Playfair Display', Georgia, serif; font-size: 18px; letter-spacing: 6px; color: #78350F;">FACTURA</span>
    </div>
    <div style="margin-top: 16px; font-size: 14px; color: #78716C;">
      Nº {{invoice_number}} · {{invoice_date}}
    </div>
  </div>

  <!-- Client -->
  <div style="display: flex; justify-content: space-between; margin-bottom: 40px; padding: 24px; background: rgba(217, 119, 6, 0.05); border: 1px solid #FDE68A;">
    <div>
      <div style="font-size: 11px; color: #A8A29E; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px;">Facturar a</div>
      <div style="font-family: 'Playfair Display', Georgia, serif; font-size: 18px; color: #78350F;">{{client_name}}</div>
      <div style="font-size: 13px; color: #78716C; margin-top: 4px;">{{client_address}}</div>
    </div>
    <div style="text-align: right;">
      <div style="font-size: 11px; color: #A8A29E; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px;">Vencimiento</div>
      <div style="font-size: 16px; color: #78350F; font-weight: 600;">{{due_date}}</div>
    </div>
  </div>

  <!-- Items -->
  <table style="width: 100%; border-collapse: collapse; margin-bottom: 40px;">
    <thead>
      <tr style="border-bottom: 2px solid #D97706;">
        <th style="padding: 16px 0; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #78350F;">Descripción</th>
        <th style="padding: 16px 0; text-align: center; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #78350F; width: 80px;">Cant.</th>
        <th style="padding: 16px 0; text-align: right; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #78350F; width: 100px;">Precio</th>
        <th style="padding: 16px 0; text-align: right; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #78350F; width: 110px;">Importe</th>
      </tr>
    </thead>
    <tbody>
      {{#items}}
      <tr style="border-bottom: 1px solid #FDE68A;">
        <td style="padding: 16px 0; font-size: 14px;">{{description}}</td>
        <td style="padding: 16px 0; text-align: center; font-size: 14px; color: #78716C;">{{quantity}}</td>
        <td style="padding: 16px 0; text-align: right; font-size: 14px; color: #78716C;">{{unit_price}} €</td>
        <td style="padding: 16px 0; text-align: right; font-size: 14px;">{{line_total}} €</td>
      </tr>
      {{/items}}
    </tbody>
  </table>

  <!-- Totals -->
  <div style="display: flex; justify-content: flex-end;">
    <div style="width: 280px; border: 1px solid #D97706; padding: 20px;">
      <div style="display: flex; justify-content: space-between; padding: 8px 0; font-size: 13px; color: #78716C;">
        <span>Subtotal</span>
        <span>{{subtotal}} €</span>
      </div>
      <div style="display: flex; justify-content: space-between; padding: 8px 0; font-size: 13px; color: #78716C; border-bottom: 1px solid #FDE68A;">
        <span>IVA ({{tax_rate}}%)</span>
        <span>{{tax_amount}} €</span>
      </div>
      <div style="display: flex; justify-content: space-between; padding: 16px 0; margin-top: 8px;">
        <span style="font-family: 'Playfair Display', Georgia, serif; font-size: 14px; letter-spacing: 2px;">TOTAL</span>
        <span style="font-family: 'Playfair Display', Georgia, serif; font-size: 24px; color: #78350F;">{{total}} €</span>
      </div>
    </div>
  </div>

  <!-- Payment -->
  <div style="margin-top: 40px; text-align: center; padding-top: 24px; border-top: 1px solid #FDE68A;">
    <div style="font-size: 12px; color: #A8A29E; margin-bottom: 8px;">DATOS BANCARIOS</div>
    <div style="font-size: 13px; color: #78716C;">{{bank_name}} · IBAN: {{bank_iban}}</div>
  </div>

  <!-- Footer signature -->
  <div style="margin-top: 40px; text-align: center;">
    <div style="width: 80px; height: 1px; background: #D97706; margin: 0 auto 16px;"></div>
    <div style="font-family: 'Playfair Display', Georgia, serif; font-size: 12px; color: #78716C; font-style: italic;">Gracias por confiar en nosotros</div>
  </div>
</div>
`;

export const INVOICE_TEMPLATES = {
  classic: INVOICE_CLASSIC,
  modern: INVOICE_MODERN,
  minimal: INVOICE_MINIMAL,
  corporate: INVOICE_CORPORATE,
  elegant: INVOICE_ELEGANT,
};
