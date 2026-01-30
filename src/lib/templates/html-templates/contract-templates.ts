// src/lib/templates/html-templates/contract-templates.ts
// Plantillas HTML para contratos en cada estilo

export const CONTRACT_CLASSIC = `
<div style="font-family: 'Times New Roman', Georgia, serif; color: #1F2937; max-width: 800px; margin: 0 auto; padding: 60px;">
  <!-- Header -->
  <div style="text-align: center; margin-bottom: 40px; border-bottom: 3px double #1E40AF; padding-bottom: 24px;">
    <div style="font-size: 14px; color: #6B7280; letter-spacing: 2px; text-transform: uppercase;">{{company_name}}</div>
    <div style="font-size: 28px; font-weight: bold; color: #1E40AF; margin-top: 16px; font-family: Georgia, serif;">CONTRATO DE {{contract_type}}</div>
    <div style="font-size: 13px; color: #6B7280; margin-top: 8px;">Referencia: {{contract_number}}</div>
  </div>

  <!-- Parties -->
  <div style="margin-bottom: 32px;">
    <div style="font-size: 14px; line-height: 1.8;">
      <p style="margin-bottom: 16px;">
        En <strong>{{city}}</strong>, a <strong>{{contract_date}}</strong>
      </p>
      
      <div style="background: #F3F4F6; padding: 20px; border-left: 4px solid #1E40AF; margin-bottom: 16px;">
        <div style="font-weight: bold; color: #1E40AF; margin-bottom: 8px;">PARTE PRIMERA</div>
        <p style="margin: 0;">
          <strong>{{company_name}}</strong>, con NIF {{company_tax_id}}, domiciliada en {{company_address}}, 
          representada por <strong>{{company_representative}}</strong>, en calidad de {{company_representative_title}} 
          (en adelante, "LA PARTE PRIMERA").
        </p>
      </div>
      
      <div style="background: #F3F4F6; padding: 20px; border-left: 4px solid #3B82F6; margin-bottom: 16px;">
        <div style="font-weight: bold; color: #3B82F6; margin-bottom: 8px;">PARTE SEGUNDA</div>
        <p style="margin: 0;">
          <strong>{{client_name}}</strong>, con NIF/CIF {{client_tax_id}}, domiciliada en {{client_address}} 
          (en adelante, "LA PARTE SEGUNDA" o "EL CLIENTE").
        </p>
      </div>
      
      <p style="margin-top: 16px;">Ambas partes se reconocen mutuamente capacidad legal suficiente para obligarse mediante el presente contrato y,</p>
    </div>
  </div>

  <!-- Recitals -->
  <div style="margin-bottom: 32px;">
    <div style="font-size: 16px; font-weight: bold; color: #1E40AF; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 1px;">EXPONEN</div>
    <div style="font-size: 14px; line-height: 1.8; padding-left: 20px; border-left: 2px solid #E5E7EB;">
      {{recitals}}
    </div>
  </div>

  <!-- Clauses -->
  <div style="margin-bottom: 32px;">
    <div style="font-size: 16px; font-weight: bold; color: #1E40AF; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 1px;">ESTIPULACIONES</div>
    <div style="font-size: 14px; line-height: 1.8;">
      {{clauses}}
    </div>
  </div>

  <!-- Signatures -->
  <div style="margin-top: 60px; page-break-inside: avoid;">
    <p style="font-size: 14px; margin-bottom: 40px;">
      Y en prueba de conformidad, las partes firman el presente contrato por duplicado ejemplar, en el lugar y fecha indicados en el encabezamiento.
    </p>
    
    <div style="display: flex; justify-content: space-between; margin-top: 40px;">
      <div style="width: 45%; text-align: center;">
        <div style="font-size: 12px; color: #6B7280; margin-bottom: 80px;">Por LA PARTE PRIMERA</div>
        <div style="border-top: 1px solid #1F2937; padding-top: 8px;">
          <div style="font-weight: bold;">{{company_representative}}</div>
          <div style="font-size: 12px; color: #6B7280;">{{company_representative_title}}</div>
          <div style="font-size: 12px; color: #1E40AF;">{{company_name}}</div>
        </div>
      </div>
      <div style="width: 45%; text-align: center;">
        <div style="font-size: 12px; color: #6B7280; margin-bottom: 80px;">Por LA PARTE SEGUNDA</div>
        <div style="border-top: 1px solid #1F2937; padding-top: 8px;">
          <div style="font-weight: bold;">{{client_representative}}</div>
          <div style="font-size: 12px; color: #6B7280;">{{client_representative_title}}</div>
          <div style="font-size: 12px; color: #3B82F6;">{{client_name}}</div>
        </div>
      </div>
    </div>
  </div>

  <!-- Footer -->
  <div style="margin-top: 60px; text-align: center; font-size: 10px; color: #9CA3AF; border-top: 1px solid #E5E7EB; padding-top: 16px;">
    Contrato {{contract_number}} | Página 1 de 1
  </div>
</div>
`;

export const CONTRACT_MODERN = `
<div style="font-family: 'Inter', sans-serif; color: #111827; max-width: 800px; margin: 0 auto; padding: 40px; background: #F9FAFB; border-radius: 24px;">
  <!-- Header -->
  <div style="background: linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%); border-radius: 20px; padding: 32px; margin-bottom: 24px; color: white; text-align: center;">
    <div style="font-size: 12px; opacity: 0.8; letter-spacing: 2px; text-transform: uppercase;">Acuerdo Legal</div>
    <div style="font-size: 28px; font-weight: 800; margin-top: 8px;">{{contract_type}}</div>
    <div style="display: inline-block; background: rgba(255,255,255,0.2); padding: 8px 20px; border-radius: 20px; margin-top: 16px; font-size: 13px;">
      Ref: {{contract_number}} · {{contract_date}}
    </div>
  </div>

  <!-- Parties Cards -->
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px;">
    <div style="background: white; padding: 24px; border-radius: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
      <div style="font-size: 11px; color: #6B7280; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">🏢 Prestador</div>
      <div style="font-size: 16px; font-weight: 600; color: #7C3AED;">{{company_name}}</div>
      <div style="font-size: 13px; color: #6B7280; margin-top: 4px;">NIF: {{company_tax_id}}</div>
      <div style="font-size: 12px; color: #9CA3AF; margin-top: 8px;">Rep: {{company_representative}}</div>
    </div>
    <div style="background: white; padding: 24px; border-radius: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
      <div style="font-size: 11px; color: #6B7280; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">👤 Cliente</div>
      <div style="font-size: 16px; font-weight: 600; color: #06B6D4;">{{client_name}}</div>
      <div style="font-size: 13px; color: #6B7280; margin-top: 4px;">NIF/CIF: {{client_tax_id}}</div>
      <div style="font-size: 12px; color: #9CA3AF; margin-top: 8px;">{{client_address}}</div>
    </div>
  </div>

  <!-- Content -->
  <div style="background: white; border-radius: 16px; padding: 32px; margin-bottom: 24px;">
    <!-- Recitals -->
    <div style="margin-bottom: 32px;">
      <div style="display: inline-block; background: linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%); color: white; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-bottom: 16px;">CONSIDERANDO</div>
      <div style="font-size: 14px; line-height: 1.8; color: #4B5563; padding-left: 16px; border-left: 3px solid #7C3AED;">
        {{recitals}}
      </div>
    </div>

    <!-- Clauses -->
    <div>
      <div style="display: inline-block; background: linear-gradient(135deg, #06B6D4 0%, #0891B2 100%); color: white; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-bottom: 16px;">ACUERDAN</div>
      <div style="font-size: 14px; line-height: 1.9; color: #374151;">
        {{clauses}}
      </div>
    </div>
  </div>

  <!-- Signatures -->
  <div style="background: white; border-radius: 16px; padding: 32px;">
    <div style="text-align: center; margin-bottom: 32px;">
      <div style="font-size: 13px; color: #6B7280;">Las partes firman en {{city}}, a {{contract_date}}</div>
    </div>
    
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 32px;">
      <div style="text-align: center; padding: 24px; background: #F9FAFB; border-radius: 12px;">
        <div style="height: 60px; margin-bottom: 16px;"></div>
        <div style="height: 1px; background: #7C3AED; margin-bottom: 12px;"></div>
        <div style="font-weight: 600;">{{company_representative}}</div>
        <div style="font-size: 12px; color: #6B7280;">{{company_name}}</div>
      </div>
      <div style="text-align: center; padding: 24px; background: #F9FAFB; border-radius: 12px;">
        <div style="height: 60px; margin-bottom: 16px;"></div>
        <div style="height: 1px; background: #06B6D4; margin-bottom: 12px;"></div>
        <div style="font-weight: 600;">{{client_representative}}</div>
        <div style="font-size: 12px; color: #6B7280;">{{client_name}}</div>
      </div>
    </div>
  </div>
</div>
`;

export const CONTRACT_MINIMAL = `
<div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #18181B; max-width: 800px; margin: 0 auto; padding: 80px 60px;">
  <!-- Header -->
  <div style="margin-bottom: 80px;">
    <div style="font-size: 11px; color: #A1A1AA; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 8px;">Contrato</div>
    <div style="font-size: 32px; font-weight: 300; margin-bottom: 16px;">{{contract_type}}</div>
    <div style="display: flex; gap: 24px; font-size: 12px; color: #71717A;">
      <span>Ref: {{contract_number}}</span>
      <span>{{contract_date}}</span>
      <span>{{city}}</span>
    </div>
  </div>

  <!-- Parties -->
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 60px; margin-bottom: 60px; padding-bottom: 40px; border-bottom: 1px solid #E4E4E7;">
    <div>
      <div style="font-size: 10px; color: #A1A1AA; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 12px;">Parte A</div>
      <div style="font-size: 16px; font-weight: 500;">{{company_name}}</div>
      <div style="font-size: 13px; color: #71717A; margin-top: 4px;">{{company_tax_id}}</div>
      <div style="font-size: 12px; color: #A1A1AA; margin-top: 8px;">{{company_representative}}</div>
    </div>
    <div>
      <div style="font-size: 10px; color: #A1A1AA; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 12px;">Parte B</div>
      <div style="font-size: 16px; font-weight: 500;">{{client_name}}</div>
      <div style="font-size: 13px; color: #71717A; margin-top: 4px;">{{client_tax_id}}</div>
      <div style="font-size: 12px; color: #A1A1AA; margin-top: 8px;">{{client_address}}</div>
    </div>
  </div>

  <!-- Recitals -->
  <div style="margin-bottom: 40px;">
    <div style="font-size: 10px; color: #A1A1AA; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 16px;">Antecedentes</div>
    <div style="font-size: 14px; line-height: 1.9; color: #52525B;">
      {{recitals}}
    </div>
  </div>

  <!-- Clauses -->
  <div style="margin-bottom: 60px;">
    <div style="font-size: 10px; color: #A1A1AA; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 16px;">Términos</div>
    <div style="font-size: 14px; line-height: 2; color: #3F3F46;">
      {{clauses}}
    </div>
  </div>

  <!-- Signatures -->
  <div style="margin-top: 80px; display: grid; grid-template-columns: 1fr 1fr; gap: 60px;">
    <div>
      <div style="height: 80px;"></div>
      <div style="width: 100%; height: 1px; background: #18181B;"></div>
      <div style="margin-top: 12px;">
        <div style="font-size: 13px; font-weight: 500;">{{company_representative}}</div>
        <div style="font-size: 12px; color: #71717A;">{{company_name}}</div>
      </div>
    </div>
    <div>
      <div style="height: 80px;"></div>
      <div style="width: 100%; height: 1px; background: #18181B;"></div>
      <div style="margin-top: 12px;">
        <div style="font-size: 13px; font-weight: 500;">{{client_representative}}</div>
        <div style="font-size: 12px; color: #71717A;">{{client_name}}</div>
      </div>
    </div>
  </div>
</div>
`;

export const CONTRACT_CORPORATE = `
<div style="font-family: 'Roboto', Arial, sans-serif; color: #0F172A; max-width: 800px; margin: 0 auto;">
  <!-- Header -->
  <div style="background: linear-gradient(90deg, #0F172A 0%, #1E293B 100%); padding: 40px; color: white;">
    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
      <div>
        <div style="font-size: 11px; opacity: 0.7; letter-spacing: 2px; text-transform: uppercase;">Acuerdo Legal</div>
        <div style="font-size: 28px; font-weight: 700; margin-top: 8px;">{{contract_type}}</div>
      </div>
      <div style="text-align: right;">
        <div style="font-size: 14px; color: #0EA5E9;">{{contract_number}}</div>
        <div style="font-size: 12px; opacity: 0.7; margin-top: 4px;">{{contract_date}}</div>
      </div>
    </div>
  </div>

  <!-- Content -->
  <div style="padding: 40px;">
    <!-- Parties -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 32px;">
      <div style="background: #F8FAFC; padding: 24px; border-radius: 8px; border-left: 4px solid #0F172A;">
        <div style="font-size: 11px; color: #64748B; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Parte Primera</div>
        <div style="font-size: 16px; font-weight: 600;">{{company_name}}</div>
        <div style="font-size: 13px; color: #64748B; margin-top: 4px;">NIF: {{company_tax_id}}</div>
        <div style="font-size: 12px; color: #94A3B8; margin-top: 8px;">Rep: {{company_representative}}</div>
      </div>
      <div style="background: #F8FAFC; padding: 24px; border-radius: 8px; border-left: 4px solid #0EA5E9;">
        <div style="font-size: 11px; color: #64748B; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Parte Segunda</div>
        <div style="font-size: 16px; font-weight: 600;">{{client_name}}</div>
        <div style="font-size: 13px; color: #64748B; margin-top: 4px;">NIF/CIF: {{client_tax_id}}</div>
        <div style="font-size: 12px; color: #94A3B8; margin-top: 8px;">{{client_address}}</div>
      </div>
    </div>

    <!-- Recitals -->
    <div style="margin-bottom: 32px;">
      <div style="background: #0F172A; color: white; display: inline-block; padding: 8px 16px; font-size: 12px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 16px;">Exponen</div>
      <div style="font-size: 14px; line-height: 1.8; color: #334155; padding: 20px; background: #F8FAFC; border-radius: 8px;">
        {{recitals}}
      </div>
    </div>

    <!-- Clauses -->
    <div style="margin-bottom: 40px;">
      <div style="background: #0EA5E9; color: white; display: inline-block; padding: 8px 16px; font-size: 12px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 16px;">Estipulaciones</div>
      <div style="font-size: 14px; line-height: 1.9; color: #334155;">
        {{clauses}}
      </div>
    </div>

    <!-- Signatures -->
    <div style="background: #0F172A; border-radius: 8px; padding: 32px; color: white;">
      <div style="text-align: center; font-size: 13px; opacity: 0.8; margin-bottom: 32px;">
        En {{city}}, a {{contract_date}}
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px;">
        <div style="text-align: center;">
          <div style="height: 60px; margin-bottom: 16px;"></div>
          <div style="height: 1px; background: rgba(255,255,255,0.3); margin-bottom: 12px;"></div>
          <div style="font-weight: 600;">{{company_representative}}</div>
          <div style="font-size: 12px; color: #0EA5E9;">{{company_name}}</div>
        </div>
        <div style="text-align: center;">
          <div style="height: 60px; margin-bottom: 16px;"></div>
          <div style="height: 1px; background: rgba(255,255,255,0.3); margin-bottom: 12px;"></div>
          <div style="font-weight: 600;">{{client_representative}}</div>
          <div style="font-size: 12px; color: #0EA5E9;">{{client_name}}</div>
        </div>
      </div>
    </div>
  </div>
</div>
`;

export const CONTRACT_ELEGANT = `
<div style="font-family: 'Lora', Georgia, serif; color: #1C1917; max-width: 800px; margin: 0 auto; padding: 60px; background: #FFFBEB; position: relative;">
  <!-- Decorative border -->
  <div style="position: absolute; top: 16px; left: 16px; right: 16px; bottom: 16px; border: 1px solid #D97706; pointer-events: none;"></div>
  
  <!-- Header -->
  <div style="text-align: center; margin-bottom: 50px; padding: 20px;">
    <div style="font-family: 'Playfair Display', Georgia, serif; font-size: 14px; color: #A8A29E; letter-spacing: 4px; text-transform: uppercase;">{{company_name}}</div>
    <div style="width: 60px; height: 1px; background: #D97706; margin: 20px auto;"></div>
    <div style="font-family: 'Playfair Display', Georgia, serif; font-size: 28px; color: #78350F; margin-top: 16px;">Contrato de {{contract_type}}</div>
    <div style="font-size: 13px; color: #78716C; margin-top: 12px;">Referencia: {{contract_number}}</div>
  </div>

  <!-- Preamble -->
  <div style="text-align: center; margin-bottom: 40px; font-size: 14px; color: #78716C; font-style: italic;">
    En {{city}}, a {{contract_date}}
  </div>

  <!-- Parties -->
  <div style="margin-bottom: 40px;">
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 32px;">
      <div style="padding: 24px; border: 1px solid #FDE68A; background: rgba(217, 119, 6, 0.03);">
        <div style="font-size: 11px; color: #A8A29E; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 12px;">De una parte</div>
        <div style="font-family: 'Playfair Display', Georgia, serif; font-size: 16px; color: #78350F;">{{company_name}}</div>
        <div style="font-size: 13px; color: #78716C; margin-top: 8px;">NIF: {{company_tax_id}}</div>
        <div style="font-size: 12px; color: #A8A29E; margin-top: 8px;">Rep.: {{company_representative}}</div>
      </div>
      <div style="padding: 24px; border: 1px solid #FDE68A; background: rgba(217, 119, 6, 0.03);">
        <div style="font-size: 11px; color: #A8A29E; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 12px;">De otra parte</div>
        <div style="font-family: 'Playfair Display', Georgia, serif; font-size: 16px; color: #78350F;">{{client_name}}</div>
        <div style="font-size: 13px; color: #78716C; margin-top: 8px;">NIF/CIF: {{client_tax_id}}</div>
        <div style="font-size: 12px; color: #A8A29E; margin-top: 8px;">{{client_address}}</div>
      </div>
    </div>
  </div>

  <!-- Recitals -->
  <div style="margin-bottom: 40px;">
    <div style="text-align: center; margin-bottom: 20px;">
      <span style="font-family: 'Playfair Display', Georgia, serif; font-size: 14px; letter-spacing: 4px; color: #78350F; border-bottom: 1px solid #D97706; padding-bottom: 4px;">MANIFIESTAN</span>
    </div>
    <div style="font-size: 14px; line-height: 1.9; color: #44403C; text-align: justify; padding: 0 20px;">
      {{recitals}}
    </div>
  </div>

  <!-- Clauses -->
  <div style="margin-bottom: 50px;">
    <div style="text-align: center; margin-bottom: 20px;">
      <span style="font-family: 'Playfair Display', Georgia, serif; font-size: 14px; letter-spacing: 4px; color: #78350F; border-bottom: 1px solid #D97706; padding-bottom: 4px;">PACTAN</span>
    </div>
    <div style="font-size: 14px; line-height: 2; color: #44403C; text-align: justify; padding: 0 20px;">
      {{clauses}}
    </div>
  </div>

  <!-- Signatures -->
  <div style="margin-top: 60px; padding-top: 40px; border-top: 1px solid #FDE68A;">
    <div style="text-align: center; font-size: 13px; color: #78716C; font-style: italic; margin-bottom: 40px;">
      Y en prueba de conformidad, firman el presente documento por duplicado
    </div>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 60px;">
      <div style="text-align: center;">
        <div style="height: 80px; margin-bottom: 16px;"></div>
        <div style="width: 80%; height: 1px; background: #D97706; margin: 0 auto 12px;"></div>
        <div style="font-family: 'Playfair Display', Georgia, serif; font-size: 14px; color: #78350F;">{{company_representative}}</div>
        <div style="font-size: 12px; color: #78716C;">{{company_name}}</div>
      </div>
      <div style="text-align: center;">
        <div style="height: 80px; margin-bottom: 16px;"></div>
        <div style="width: 80%; height: 1px; background: #D97706; margin: 0 auto 12px;"></div>
        <div style="font-family: 'Playfair Display', Georgia, serif; font-size: 14px; color: #78350F;">{{client_representative}}</div>
        <div style="font-size: 12px; color: #78716C;">{{client_name}}</div>
      </div>
    </div>
  </div>
</div>
`;

export const CONTRACT_TEMPLATES = {
  classic: CONTRACT_CLASSIC,
  modern: CONTRACT_MODERN,
  minimal: CONTRACT_MINIMAL,
  corporate: CONTRACT_CORPORATE,
  elegant: CONTRACT_ELEGANT,
};
