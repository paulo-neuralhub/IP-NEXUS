// src/lib/templates/html-templates/letter-templates.ts
// Plantillas HTML para cartas formales en cada estilo

export const LETTER_CLASSIC = `
<div style="font-family: 'Times New Roman', Georgia, serif; color: #1F2937; max-width: 800px; margin: 0 auto; padding: 60px;">
  <!-- Letterhead -->
  <div style="border-bottom: 2px solid #1E40AF; padding-bottom: 24px; margin-bottom: 40px;">
    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
      <div>
        <div style="font-size: 24px; font-weight: bold; color: #1E40AF;">{{company_name}}</div>
        <div style="font-size: 12px; color: #6B7280; margin-top: 8px; line-height: 1.6;">
          {{company_address}}<br>
          Tel: {{company_phone}}<br>
          {{company_email}}
        </div>
      </div>
      <div style="text-align: right;">
        <div style="font-size: 13px; color: #6B7280;">{{letter_date}}</div>
        <div style="font-size: 12px; color: #9CA3AF; margin-top: 4px;">Ref: {{reference}}</div>
      </div>
    </div>
  </div>

  <!-- Recipient -->
  <div style="margin-bottom: 32px;">
    <div style="font-weight: 600; color: #1F2937;">{{recipient_name}}</div>
    <div style="font-size: 14px; color: #4B5563; margin-top: 4px;">{{recipient_title}}</div>
    <div style="font-size: 14px; color: #4B5563;">{{recipient_company}}</div>
    <div style="font-size: 14px; color: #6B7280; margin-top: 4px;">{{recipient_address}}</div>
  </div>

  <!-- Subject -->
  <div style="margin-bottom: 24px;">
    <div style="font-weight: bold; color: #1E40AF; font-size: 14px;">
      Asunto: {{subject}}
    </div>
  </div>

  <!-- Greeting -->
  <div style="margin-bottom: 20px; font-size: 15px;">
    {{greeting}}
  </div>

  <!-- Body -->
  <div style="font-size: 15px; line-height: 1.8; text-align: justify;">
    {{body}}
  </div>

  <!-- Closing -->
  <div style="margin-top: 32px; font-size: 15px;">
    {{closing}}
  </div>

  <!-- Signature -->
  <div style="margin-top: 60px;">
    <div style="font-weight: 600; color: #1F2937;">{{sender_name}}</div>
    <div style="font-size: 14px; color: #4B5563;">{{sender_title}}</div>
    <div style="font-size: 14px; color: #1E40AF;">{{company_name}}</div>
  </div>

  <!-- Footer -->
  <div style="margin-top: 80px; padding-top: 16px; border-top: 1px solid #E5E7EB; font-size: 11px; color: #9CA3AF; text-align: center;">
    {{company_name}} | NIF: {{company_tax_id}} | {{company_address}}
  </div>
</div>
`;

export const LETTER_MODERN = `
<div style="font-family: 'Inter', sans-serif; color: #111827; max-width: 800px; margin: 0 auto; padding: 48px;">
  <!-- Modern Header -->
  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 48px;">
    <div>
      <div style="font-size: 24px; font-weight: 800; background: linear-gradient(135deg, #7C3AED 0%, #06B6D4 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">{{company_name}}</div>
      <div style="font-size: 12px; color: #6B7280; margin-top: 4px;">{{company_email}} • {{company_phone}}</div>
    </div>
    <div style="text-align: right;">
      <div style="background: linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%); color: white; padding: 8px 16px; border-radius: 20px; font-size: 12px; font-weight: 600;">
        {{letter_date}}
      </div>
    </div>
  </div>

  <!-- Recipient Card -->
  <div style="background: #F9FAFB; padding: 24px; border-radius: 16px; margin-bottom: 32px;">
    <div style="font-size: 11px; color: #6B7280; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Destinatario</div>
    <div style="font-size: 18px; font-weight: 600; color: #7C3AED;">{{recipient_name}}</div>
    <div style="font-size: 14px; color: #4B5563; margin-top: 4px;">{{recipient_title}} • {{recipient_company}}</div>
  </div>

  <!-- Subject -->
  <div style="background: linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%); color: white; padding: 16px 24px; border-radius: 12px; margin-bottom: 32px;">
    <div style="font-size: 12px; opacity: 0.8; margin-bottom: 4px;">RE:</div>
    <div style="font-size: 16px; font-weight: 600;">{{subject}}</div>
  </div>

  <!-- Body -->
  <div style="padding: 0 8px;">
    <div style="font-size: 15px; line-height: 1.8; margin-bottom: 24px;">
      {{greeting}}
    </div>
    
    <div style="font-size: 15px; line-height: 1.9; color: #374151;">
      {{body}}
    </div>

    <div style="font-size: 15px; margin-top: 32px;">
      {{closing}}
    </div>
  </div>

  <!-- Signature -->
  <div style="margin-top: 48px; padding: 24px; background: #F9FAFB; border-radius: 16px; display: flex; align-items: center; gap: 20px;">
    <div style="width: 64px; height: 64px; background: linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%); border-radius: 16px; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px; font-weight: 800;">
      {{sender_initials}}
    </div>
    <div>
      <div style="font-size: 16px; font-weight: 600;">{{sender_name}}</div>
      <div style="font-size: 13px; color: #6B7280;">{{sender_title}}</div>
      <div style="font-size: 13px; color: #7C3AED;">{{sender_email}}</div>
    </div>
  </div>

  <!-- Footer -->
  <div style="margin-top: 48px; text-align: center; font-size: 11px; color: #9CA3AF;">
    {{company_name}} • {{company_address}}
  </div>
</div>
`;

export const LETTER_MINIMAL = `
<div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #18181B; max-width: 700px; margin: 0 auto; padding: 80px 60px;">
  <!-- Minimal Header -->
  <div style="margin-bottom: 80px;">
    <div style="font-size: 13px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase;">{{company_name}}</div>
  </div>

  <!-- Date & Reference -->
  <div style="display: flex; justify-content: space-between; margin-bottom: 60px;">
    <div style="font-size: 13px; color: #71717A;">{{letter_date}}</div>
    <div style="font-size: 12px; color: #A1A1AA;">Ref: {{reference}}</div>
  </div>

  <!-- Recipient -->
  <div style="margin-bottom: 40px;">
    <div style="font-size: 14px; font-weight: 500;">{{recipient_name}}</div>
    <div style="font-size: 13px; color: #71717A; margin-top: 4px;">{{recipient_company}}</div>
    <div style="font-size: 13px; color: #A1A1AA; margin-top: 2px;">{{recipient_address}}</div>
  </div>

  <!-- Subject Line -->
  <div style="margin-bottom: 40px; padding-bottom: 20px; border-bottom: 1px solid #E4E4E7;">
    <div style="font-size: 11px; color: #A1A1AA; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 8px;">Asunto</div>
    <div style="font-size: 16px; font-weight: 500;">{{subject}}</div>
  </div>

  <!-- Body -->
  <div style="font-size: 14px; line-height: 2;">
    <p style="margin-bottom: 20px;">{{greeting}}</p>
    
    <div style="color: #3F3F46;">{{body}}</div>
    
    <p style="margin-top: 32px;">{{closing}}</p>
  </div>

  <!-- Signature -->
  <div style="margin-top: 60px;">
    <div style="width: 120px; height: 1px; background: #18181B; margin-bottom: 16px;"></div>
    <div style="font-size: 13px; font-weight: 500;">{{sender_name}}</div>
    <div style="font-size: 12px; color: #71717A; margin-top: 2px;">{{sender_title}}</div>
  </div>

  <!-- Footer -->
  <div style="margin-top: 100px; font-size: 11px; color: #A1A1AA; line-height: 1.6;">
    {{company_name}}<br>
    {{company_address}}<br>
    {{company_email}} · {{company_phone}}
  </div>
</div>
`;

export const LETTER_CORPORATE = `
<div style="font-family: 'Roboto', Arial, sans-serif; color: #0F172A; max-width: 800px; margin: 0 auto;">
  <!-- Corporate Header -->
  <div style="background: linear-gradient(90deg, #0F172A 0%, #1E293B 100%); padding: 32px 40px; display: flex; justify-content: space-between; align-items: center;">
    <div style="color: white;">
      <div style="font-size: 20px; font-weight: 700;">{{company_name}}</div>
      <div style="font-size: 11px; opacity: 0.7; margin-top: 4px;">{{company_address}}</div>
    </div>
    <div style="text-align: right; color: white;">
      <div style="font-size: 12px; opacity: 0.7;">{{letter_date}}</div>
      <div style="font-size: 11px; color: #0EA5E9; margin-top: 4px;">Ref: {{reference}}</div>
    </div>
  </div>

  <!-- Content -->
  <div style="padding: 40px;">
    <!-- Recipient -->
    <div style="background: #F8FAFC; padding: 20px; border-radius: 8px; border-left: 4px solid #0EA5E9; margin-bottom: 32px;">
      <div style="font-size: 16px; font-weight: 600;">{{recipient_name}}</div>
      <div style="font-size: 13px; color: #64748B; margin-top: 4px;">{{recipient_title}}</div>
      <div style="font-size: 13px; color: #64748B;">{{recipient_company}}</div>
    </div>

    <!-- Subject -->
    <div style="margin-bottom: 32px;">
      <div style="font-size: 11px; color: #64748B; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Asunto</div>
      <div style="font-size: 18px; font-weight: 600; color: #0F172A;">{{subject}}</div>
      <div style="height: 3px; width: 60px; background: #0EA5E9; margin-top: 8px;"></div>
    </div>

    <!-- Body -->
    <div style="font-size: 14px; line-height: 1.8; color: #334155;">
      <p style="margin-bottom: 16px;">{{greeting}}</p>
      
      <div>{{body}}</div>
      
      <p style="margin-top: 24px;">{{closing}}</p>
    </div>

    <!-- Signature -->
    <div style="margin-top: 48px; padding: 20px; background: #F8FAFC; border-radius: 8px; display: inline-block;">
      <div style="font-weight: 600; color: #0F172A;">{{sender_name}}</div>
      <div style="font-size: 13px; color: #64748B;">{{sender_title}}</div>
      <div style="font-size: 13px; color: #0EA5E9; margin-top: 4px;">{{sender_email}}</div>
    </div>
  </div>

  <!-- Footer -->
  <div style="background: #F8FAFC; padding: 20px 40px; font-size: 11px; color: #64748B; text-align: center; border-top: 1px solid #E2E8F0;">
    {{company_name}} | NIF: {{company_tax_id}} | {{company_phone}} | {{company_email}}
  </div>
</div>
`;

export const LETTER_ELEGANT = `
<div style="font-family: 'Lora', Georgia, serif; color: #1C1917; max-width: 750px; margin: 0 auto; padding: 60px; background: #FFFBEB; position: relative;">
  <!-- Decorative top border -->
  <div style="position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, #D97706, #F59E0B, #D97706);"></div>
  
  <!-- Letterhead -->
  <div style="text-align: center; margin-bottom: 50px; padding-top: 20px;">
    <div style="font-family: 'Playfair Display', Georgia, serif; font-size: 28px; font-weight: 600; color: #78350F; letter-spacing: 3px;">{{company_name}}</div>
    <div style="width: 100px; height: 1px; background: #D97706; margin: 16px auto;"></div>
    <div style="font-size: 12px; color: #78716C; letter-spacing: 1px;">{{company_address}}</div>
  </div>

  <!-- Date & Reference -->
  <div style="text-align: right; margin-bottom: 40px; font-size: 13px; color: #78716C;">
    <div>{{letter_date}}</div>
    <div style="font-size: 12px; color: #A8A29E; margin-top: 4px;">Ref: {{reference}}</div>
  </div>

  <!-- Recipient -->
  <div style="margin-bottom: 32px;">
    <div style="font-family: 'Playfair Display', Georgia, serif; font-size: 16px; color: #78350F;">{{recipient_name}}</div>
    <div style="font-size: 14px; color: #78716C; margin-top: 4px;">{{recipient_title}}</div>
    <div style="font-size: 14px; color: #78716C;">{{recipient_company}}</div>
    <div style="font-size: 13px; color: #A8A29E; margin-top: 4px;">{{recipient_address}}</div>
  </div>

  <!-- Subject -->
  <div style="margin-bottom: 32px; padding: 16px 20px; border-left: 2px solid #D97706; background: rgba(217, 119, 6, 0.05);">
    <div style="font-size: 11px; color: #A8A29E; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 4px;">Asunto</div>
    <div style="font-size: 15px; color: #78350F;">{{subject}}</div>
  </div>

  <!-- Body -->
  <div style="font-size: 15px; line-height: 1.9; text-align: justify;">
    <p style="margin-bottom: 20px;">{{greeting}}</p>
    
    <div style="color: #44403C;">{{body}}</div>
    
    <p style="margin-top: 28px;">{{closing}}</p>
  </div>

  <!-- Signature -->
  <div style="margin-top: 60px;">
    <div style="width: 80px; height: 1px; background: #D97706; margin-bottom: 16px;"></div>
    <div style="font-family: 'Playfair Display', Georgia, serif; font-size: 15px; color: #78350F;">{{sender_name}}</div>
    <div style="font-size: 13px; color: #78716C; margin-top: 4px;">{{sender_title}}</div>
    <div style="font-size: 13px; color: #78350F; font-style: italic; margin-top: 8px;">{{company_name}}</div>
  </div>

  <!-- Footer -->
  <div style="margin-top: 60px; text-align: center; padding-top: 20px; border-top: 1px solid #FDE68A;">
    <div style="font-size: 11px; color: #A8A29E; letter-spacing: 1px;">
      {{company_email}} · {{company_phone}}
    </div>
  </div>
</div>
`;

export const LETTER_TEMPLATES = {
  classic: LETTER_CLASSIC,
  modern: LETTER_MODERN,
  minimal: LETTER_MINIMAL,
  corporate: LETTER_CORPORATE,
  elegant: LETTER_ELEGANT,
};
