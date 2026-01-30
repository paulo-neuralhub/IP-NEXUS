// src/lib/templates/html-templates/quote-templates.ts
// Plantillas HTML para presupuestos en cada estilo

export const QUOTE_CLASSIC = `
<div style="font-family: Arial, sans-serif; color: #1F2937; max-width: 800px; margin: 0 auto; padding: 40px;">
  <!-- Header -->
  <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #1E40AF; padding-bottom: 20px; margin-bottom: 30px;">
    <div>
      <div style="font-size: 24px; font-weight: bold; color: #1E40AF; font-family: Georgia, serif;">{{company_name}}</div>
      <div style="font-size: 12px; color: #6B7280; margin-top: 8px;">
        {{company_address}}<br>
        Tel: {{company_phone}} | {{company_email}}
      </div>
    </div>
    <div style="text-align: right;">
      <div style="font-size: 28px; font-weight: bold; color: #1E40AF; font-family: Georgia, serif;">PRESUPUESTO</div>
      <div style="font-size: 14px; color: #6B7280; margin-top: 8px;">
        <strong>Nº:</strong> {{quote_number}}<br>
        <strong>Fecha:</strong> {{quote_date}}<br>
        <strong>Validez:</strong> {{validity_date}}
      </div>
    </div>
  </div>

  <!-- Client Info -->
  <div style="background: #F3F4F6; padding: 20px; border-radius: 4px; margin-bottom: 30px;">
    <div style="font-size: 12px; color: #6B7280; margin-bottom: 8px;">PRESUPUESTO PARA:</div>
    <div style="font-weight: bold; font-size: 16px; color: #1E40AF;">{{client_name}}</div>
    <div style="font-size: 14px; color: #4B5563; margin-top: 4px;">
      {{client_address}}<br>
      {{client_email}}
    </div>
  </div>

  <!-- Matter Reference -->
  <div style="background: #EFF6FF; padding: 16px; border-left: 4px solid #3B82F6; margin-bottom: 30px;">
    <div style="font-size: 12px; color: #3B82F6; font-weight: 600;">REFERENCIA DEL ASUNTO</div>
    <div style="font-size: 14px; color: #1E40AF; margin-top: 4px;">{{matter_reference}} - {{matter_title}}</div>
  </div>

  <!-- Items Table -->
  <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
    <thead>
      <tr style="background: #1E40AF; color: white;">
        <th style="padding: 12px; text-align: left; font-size: 12px; text-transform: uppercase;">Concepto</th>
        <th style="padding: 12px; text-align: center; font-size: 12px; text-transform: uppercase; width: 80px;">Uds.</th>
        <th style="padding: 12px; text-align: right; font-size: 12px; text-transform: uppercase; width: 100px;">Precio/Ud.</th>
        <th style="padding: 12px; text-align: right; font-size: 12px; text-transform: uppercase; width: 100px;">Importe</th>
      </tr>
    </thead>
    <tbody>
      {{#items}}
      <tr style="border-bottom: 1px solid #E5E7EB;">
        <td style="padding: 12px; font-size: 14px;">
          <div style="font-weight: 500;">{{description}}</div>
          <div style="font-size: 12px; color: #6B7280; margin-top: 4px;">{{details}}</div>
        </td>
        <td style="padding: 12px; text-align: center; font-size: 14px;">{{quantity}}</td>
        <td style="padding: 12px; text-align: right; font-size: 14px;">{{unit_price}} €</td>
        <td style="padding: 12px; text-align: right; font-size: 14px; font-weight: 500;">{{line_total}} €</td>
      </tr>
      {{/items}}
    </tbody>
  </table>

  <!-- Totals -->
  <div style="display: flex; justify-content: flex-end;">
    <div style="width: 300px;">
      <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #E5E7EB;">
        <span style="color: #6B7280;">Subtotal</span>
        <span>{{subtotal}} €</span>
      </div>
      <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #E5E7EB;">
        <span style="color: #6B7280;">IVA ({{tax_rate}}%)</span>
        <span>{{tax_amount}} €</span>
      </div>
      <div style="display: flex; justify-content: space-between; padding: 16px; background: #1E40AF; color: white; margin-top: 8px; border-radius: 4px;">
        <span style="font-weight: bold; font-size: 16px;">TOTAL</span>
        <span style="font-weight: bold; font-size: 20px;">{{total}} €</span>
      </div>
    </div>
  </div>

  <!-- Terms -->
  <div style="margin-top: 40px; padding: 20px; background: #F9FAFB; border-radius: 4px;">
    <div style="font-weight: bold; color: #1E40AF; margin-bottom: 12px;">Condiciones del Presupuesto</div>
    <ul style="font-size: 13px; color: #4B5563; margin: 0; padding-left: 20px; line-height: 1.8;">
      <li>Presupuesto válido hasta: {{validity_date}}</li>
      <li>Forma de pago: {{payment_terms}}</li>
      <li>Los precios no incluyen tasas oficiales</li>
      <li>Aceptación por escrito o transferencia bancaria</li>
    </ul>
  </div>

  <!-- Signature -->
  <div style="margin-top: 50px; display: flex; justify-content: space-between;">
    <div style="width: 45%;">
      <div style="font-size: 12px; color: #6B7280; margin-bottom: 60px;">Conforme el Cliente:</div>
      <div style="border-top: 1px solid #D1D5DB; padding-top: 8px; font-size: 12px; color: #6B7280;">
        Firma y fecha
      </div>
    </div>
    <div style="width: 45%; text-align: right;">
      <div style="font-size: 12px; color: #6B7280; margin-bottom: 60px;">Por {{company_name}}:</div>
      <div style="border-top: 1px solid #D1D5DB; padding-top: 8px; font-size: 12px; color: #6B7280;">
        {{user_name}}
      </div>
    </div>
  </div>

  <!-- Footer -->
  <div style="margin-top: 40px; text-align: center; font-size: 11px; color: #9CA3AF; border-top: 1px solid #E5E7EB; padding-top: 20px;">
    {{company_name}} | NIF: {{company_tax_id}} | {{company_address}}
  </div>
</div>
`;

export const QUOTE_MODERN = `
<div style="font-family: 'Inter', sans-serif; color: #111827; max-width: 800px; margin: 0 auto; background: #F9FAFB; padding: 32px; border-radius: 24px;">
  <!-- Header Card -->
  <div style="background: linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%); border-radius: 20px; padding: 32px; margin-bottom: 24px; color: white;">
    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
      <div>
        <div style="font-size: 12px; opacity: 0.8; text-transform: uppercase; letter-spacing: 2px;">Propuesta Comercial</div>
        <div style="font-size: 28px; font-weight: 800; margin-top: 8px;">{{company_name}}</div>
      </div>
      <div style="text-align: right;">
        <div style="background: rgba(255,255,255,0.2); padding: 12px 24px; border-radius: 12px;">
          <div style="font-size: 24px; font-weight: 700;">#{{quote_number}}</div>
          <div style="font-size: 12px; opacity: 0.8;">{{quote_date}}</div>
        </div>
      </div>
    </div>
  </div>

  <!-- Client & Project Cards -->
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px;">
    <div style="background: white; padding: 24px; border-radius: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
      <div style="font-size: 11px; color: #6B7280; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">📧 Cliente</div>
      <div style="font-size: 16px; font-weight: 600; color: #7C3AED;">{{client_name}}</div>
      <div style="font-size: 13px; color: #6B7280; margin-top: 4px;">{{client_email}}</div>
    </div>
    <div style="background: white; padding: 24px; border-radius: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
      <div style="font-size: 11px; color: #6B7280; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">📋 Asunto</div>
      <div style="font-size: 16px; font-weight: 600; color: #111827;">{{matter_title}}</div>
      <div style="font-size: 13px; color: #6B7280; margin-top: 4px;">Ref: {{matter_reference}}</div>
    </div>
  </div>

  <!-- Items -->
  <div style="background: white; border-radius: 16px; padding: 24px; margin-bottom: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
    <div style="font-size: 14px; font-weight: 600; color: #111827; margin-bottom: 16px;">Servicios Propuestos</div>
    {{#items}}
    <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px; background: #F9FAFB; border-radius: 12px; margin-bottom: 12px;">
      <div style="flex: 1;">
        <div style="font-weight: 500;">{{description}}</div>
        <div style="font-size: 12px; color: #6B7280; margin-top: 4px;">{{details}}</div>
      </div>
      <div style="text-align: right; margin-left: 24px;">
        <div style="font-size: 12px; color: #6B7280;">{{quantity}} x {{unit_price}} €</div>
        <div style="font-size: 18px; font-weight: 700; color: #7C3AED;">{{line_total}} €</div>
      </div>
    </div>
    {{/items}}
  </div>

  <!-- Total Card -->
  <div style="background: linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%); border-radius: 16px; padding: 24px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
    <div style="color: white;">
      <div style="font-size: 13px; opacity: 0.8;">Subtotal: {{subtotal}} € | IVA {{tax_rate}}%: {{tax_amount}} €</div>
      <div style="font-size: 12px; opacity: 0.6; margin-top: 4px;">Válido hasta {{validity_date}}</div>
    </div>
    <div style="text-align: right; color: white;">
      <div style="font-size: 12px; opacity: 0.8;">INVERSIÓN TOTAL</div>
      <div style="font-size: 36px; font-weight: 800;">{{total}} €</div>
    </div>
  </div>

  <!-- CTA -->
  <div style="text-align: center; padding: 32px; background: white; border-radius: 16px;">
    <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">¿Listo para comenzar?</div>
    <div style="font-size: 14px; color: #6B7280; margin-bottom: 20px;">Responde a este presupuesto o contacta directamente</div>
    <div style="display: inline-block; background: linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%); color: white; padding: 14px 32px; border-radius: 12px; font-weight: 600;">
      {{company_email}} · {{company_phone}}
    </div>
  </div>
</div>
`;

export const QUOTE_MINIMAL = `
<div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #18181B; max-width: 800px; margin: 0 auto; padding: 60px 40px;">
  <!-- Header -->
  <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 80px;">
    <div>
      <div style="font-size: 14px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase;">{{company_name}}</div>
      <div style="font-size: 12px; color: #A1A1AA; margin-top: 8px;">{{company_email}}</div>
    </div>
    <div style="text-align: right;">
      <div style="font-size: 11px; color: #A1A1AA; letter-spacing: 1px; text-transform: uppercase;">Presupuesto</div>
      <div style="font-size: 28px; font-weight: 300; margin-top: 4px;">{{quote_number}}</div>
    </div>
  </div>

  <!-- Client & Date -->
  <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 40px; margin-bottom: 60px;">
    <div>
      <div style="font-size: 10px; color: #A1A1AA; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 8px;">Para</div>
      <div style="font-size: 16px; font-weight: 500;">{{client_name}}</div>
      <div style="font-size: 13px; color: #71717A; margin-top: 4px;">{{client_address}}</div>
    </div>
    <div>
      <div style="font-size: 10px; color: #A1A1AA; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 8px;">Fecha</div>
      <div style="font-size: 14px;">{{quote_date}}</div>
      <div style="font-size: 12px; color: #71717A; margin-top: 8px;">Válido hasta {{validity_date}}</div>
    </div>
  </div>

  <!-- Project -->
  <div style="margin-bottom: 40px; padding-bottom: 20px; border-bottom: 1px solid #E4E4E7;">
    <div style="font-size: 10px; color: #A1A1AA; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 8px;">Proyecto</div>
    <div style="font-size: 18px; font-weight: 500;">{{matter_title}}</div>
  </div>

  <!-- Items -->
  {{#items}}
  <div style="display: grid; grid-template-columns: 1fr 100px; gap: 20px; padding: 20px 0; border-bottom: 1px solid #F4F4F5;">
    <div>
      <div style="font-size: 14px; font-weight: 500;">{{description}}</div>
      <div style="font-size: 12px; color: #71717A; margin-top: 4px;">{{details}}</div>
    </div>
    <div style="text-align: right; font-size: 15px; font-weight: 500;">{{line_total}} €</div>
  </div>
  {{/items}}

  <!-- Totals -->
  <div style="margin-top: 40px; display: flex; justify-content: flex-end;">
    <div style="width: 200px;">
      <div style="display: flex; justify-content: space-between; padding: 8px 0; font-size: 13px; color: #71717A;">
        <span>Subtotal</span>
        <span>{{subtotal}} €</span>
      </div>
      <div style="display: flex; justify-content: space-between; padding: 8px 0; font-size: 13px; color: #71717A;">
        <span>IVA {{tax_rate}}%</span>
        <span>{{tax_amount}} €</span>
      </div>
      <div style="display: flex; justify-content: space-between; padding: 16px 0; margin-top: 8px; border-top: 2px solid #18181B;">
        <span style="font-weight: 600;">Total</span>
        <span style="font-size: 24px; font-weight: 600;">{{total}} €</span>
      </div>
    </div>
  </div>

  <!-- Terms -->
  <div style="margin-top: 60px; font-size: 11px; color: #A1A1AA; line-height: 1.8;">
    <div style="font-weight: 500; color: #71717A; margin-bottom: 8px;">Términos</div>
    {{payment_terms}}
  </div>

  <!-- Footer -->
  <div style="margin-top: 80px; padding-top: 20px; border-top: 1px solid #E4E4E7; font-size: 11px; color: #A1A1AA;">
    {{company_name}} · {{company_address}} · {{company_tax_id}}
  </div>
</div>
`;

export const QUOTE_CORPORATE = `
<div style="font-family: 'Roboto', Arial, sans-serif; color: #0F172A; max-width: 800px; margin: 0 auto; display: flex;">
  <!-- Sidebar -->
  <div style="width: 220px; background: linear-gradient(180deg, #0F172A 0%, #1E293B 100%); color: white; padding: 40px 24px;">
    <div style="font-size: 18px; font-weight: 700; margin-bottom: 40px;">{{company_name}}</div>
    
    <div style="margin-bottom: 32px;">
      <div style="font-size: 10px; opacity: 0.6; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Presupuesto</div>
      <div style="font-size: 16px; font-weight: 600; color: #0EA5E9;">{{quote_number}}</div>
    </div>
    
    <div style="margin-bottom: 32px;">
      <div style="font-size: 10px; opacity: 0.6; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Fecha</div>
      <div style="font-size: 14px;">{{quote_date}}</div>
    </div>
    
    <div style="margin-bottom: 32px;">
      <div style="font-size: 10px; opacity: 0.6; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Válido hasta</div>
      <div style="font-size: 14px; color: #FCD34D;">{{validity_date}}</div>
    </div>
    
    <div style="margin-top: auto; padding-top: 40px; border-top: 1px solid rgba(255,255,255,0.1);">
      <div style="font-size: 10px; opacity: 0.5; line-height: 1.6;">
        {{company_address}}<br><br>
        {{company_phone}}<br>
        {{company_email}}
      </div>
    </div>
  </div>

  <!-- Main Content -->
  <div style="flex: 1; padding: 40px; background: #FFFFFF;">
    <div style="font-size: 28px; font-weight: 700; color: #0F172A; margin-bottom: 8px;">PROPUESTA</div>
    <div style="height: 4px; width: 60px; background: #0EA5E9; margin-bottom: 32px;"></div>

    <!-- Client -->
    <div style="background: #F8FAFC; padding: 20px; border-radius: 8px; border-left: 4px solid #0EA5E9; margin-bottom: 24px;">
      <div style="font-size: 11px; color: #64748B; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Preparado para</div>
      <div style="font-size: 18px; font-weight: 600; color: #0F172A;">{{client_name}}</div>
      <div style="font-size: 13px; color: #64748B; margin-top: 4px;">{{client_email}}</div>
    </div>

    <!-- Project -->
    <div style="background: #ECFDF5; padding: 16px 20px; border-radius: 8px; margin-bottom: 24px;">
      <div style="font-size: 11px; color: #059669; font-weight: 600; margin-bottom: 4px;">PROYECTO</div>
      <div style="font-size: 15px; color: #065F46;">{{matter_title}}</div>
    </div>

    <!-- Items -->
    <div style="margin-bottom: 24px;">
      <div style="font-size: 12px; color: #64748B; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px;">Detalle de Servicios</div>
      {{#items}}
      <div style="padding: 16px; border: 1px solid #E2E8F0; border-radius: 8px; margin-bottom: 12px;">
        <div style="display: flex; justify-content: space-between;">
          <div>
            <div style="font-weight: 600; color: #0F172A;">{{description}}</div>
            <div style="font-size: 12px; color: #64748B; margin-top: 4px;">{{details}}</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 12px; color: #64748B;">{{quantity}} ud. x {{unit_price}} €</div>
            <div style="font-size: 18px; font-weight: 700; color: #0EA5E9;">{{line_total}} €</div>
          </div>
        </div>
      </div>
      {{/items}}
    </div>

    <!-- Totals -->
    <div style="background: #0F172A; border-radius: 8px; padding: 20px; color: white;">
      <div style="display: flex; justify-content: space-between; font-size: 13px; opacity: 0.8; margin-bottom: 8px;">
        <span>Subtotal: {{subtotal}} €</span>
        <span>IVA {{tax_rate}}%: {{tax_amount}} €</span>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.2);">
        <span style="font-size: 14px; font-weight: 600;">INVERSIÓN TOTAL</span>
        <span style="font-size: 28px; font-weight: 800; color: #0EA5E9;">{{total}} €</span>
      </div>
    </div>

    <!-- Terms -->
    <div style="margin-top: 24px; padding: 16px; background: #FFFBEB; border-radius: 8px; border: 1px solid #FDE68A;">
      <div style="font-size: 11px; font-weight: 600; color: #92400E; margin-bottom: 8px;">📋 Condiciones</div>
      <div style="font-size: 12px; color: #78350F; line-height: 1.6;">{{payment_terms}}</div>
    </div>
  </div>
</div>
`;

export const QUOTE_ELEGANT = `
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
    <div style="font-size: 13px; color: #78716C; letter-spacing: 2px;">PROPUESTA DE SERVICIOS PROFESIONALES</div>
  </div>

  <!-- Quote Number -->
  <div style="text-align: center; margin-bottom: 40px;">
    <div style="display: inline-block; border: 1px solid #D97706; padding: 12px 40px;">
      <span style="font-family: 'Playfair Display', Georgia, serif; font-size: 14px; letter-spacing: 4px; color: #78350F;">Nº {{quote_number}}</span>
    </div>
  </div>

  <!-- Client & Project -->
  <div style="display: flex; gap: 40px; margin-bottom: 40px;">
    <div style="flex: 1; padding: 24px; background: rgba(217, 119, 6, 0.05); border: 1px solid #FDE68A;">
      <div style="font-size: 11px; color: #A8A29E; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px;">Estimado/a</div>
      <div style="font-family: 'Playfair Display', Georgia, serif; font-size: 18px; color: #78350F;">{{client_name}}</div>
      <div style="font-size: 13px; color: #78716C; margin-top: 4px;">{{client_address}}</div>
    </div>
    <div style="flex: 1; padding: 24px; background: rgba(217, 119, 6, 0.05); border: 1px solid #FDE68A;">
      <div style="font-size: 11px; color: #A8A29E; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px;">Proyecto</div>
      <div style="font-family: 'Playfair Display', Georgia, serif; font-size: 16px; color: #78350F;">{{matter_title}}</div>
      <div style="font-size: 12px; color: #78716C; margin-top: 4px;">Válido hasta {{validity_date}}</div>
    </div>
  </div>

  <!-- Items -->
  <div style="margin-bottom: 40px;">
    {{#items}}
    <div style="padding: 20px 0; border-bottom: 1px solid #FDE68A;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        <div style="flex: 1;">
          <div style="font-size: 15px; color: #1C1917;">{{description}}</div>
          <div style="font-size: 13px; color: #78716C; margin-top: 4px;">{{details}}</div>
        </div>
        <div style="text-align: right; margin-left: 40px;">
          <div style="font-family: 'Playfair Display', Georgia, serif; font-size: 18px; color: #78350F;">{{line_total}} €</div>
        </div>
      </div>
    </div>
    {{/items}}
  </div>

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
        <span style="font-family: 'Playfair Display', Georgia, serif; font-size: 28px; color: #78350F;">{{total}} €</span>
      </div>
    </div>
  </div>

  <!-- Terms -->
  <div style="margin-top: 40px; padding: 20px; border: 1px solid #FDE68A; text-align: center;">
    <div style="font-size: 12px; color: #78716C; line-height: 1.8;">{{payment_terms}}</div>
  </div>

  <!-- Signature -->
  <div style="margin-top: 60px; text-align: center;">
    <div style="width: 80px; height: 1px; background: #D97706; margin: 0 auto 16px;"></div>
    <div style="font-family: 'Playfair Display', Georgia, serif; font-size: 12px; color: #78716C; font-style: italic;">Quedamos a su entera disposición</div>
    <div style="font-size: 13px; color: #78350F; margin-top: 8px;">{{user_name}}</div>
  </div>
</div>
`;

export const QUOTE_TEMPLATES = {
  classic: QUOTE_CLASSIC,
  modern: QUOTE_MODERN,
  minimal: QUOTE_MINIMAL,
  corporate: QUOTE_CORPORATE,
  elegant: QUOTE_ELEGANT,
};
