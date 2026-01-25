-- Seed Certificate and Letter Templates
INSERT INTO document_templates (
  organization_id, code, name, description, document_type, category, 
  is_system_template, layout, template_content, body_sections, custom_texts, type_config
) VALUES

-- 1. Certificado de Registro
(NULL, 'CERT_REGISTRATION', 'Certificado de Registro',
 'Certificado elegante que acredita el registro de marca/patente. Diseño formal con elementos decorativos.',
 'certificate', 'trademark', true, 'certificate',
 '═══════════════════════════════════════════════════════
                           
                    {{company.logo}}

                       CERTIFICADO
                   DE REGISTRO DE MARCA

═══════════════════════════════════════════════════════

Por medio del presente documento, {{company.name}} certifica que la marca 
descrita a continuación ha sido registrada satisfactoriamente ante 
{{matter.office_name}}.

───────────────────────────────────────────────────────

| Denominación      | {{matter.mark_name}}              |
| Nº Registro       | {{matter.registration_number}}    |
| Fecha Registro    | {{matter.registration_date}}      |
| Titular           | {{client.name}}                   |
| Clases Niza       | {{matter.nice_classes}}           |
| Válido hasta      | {{matter.expiry_date}}            |

───────────────────────────────────────────────────────

                    {{matter.mark_image}}

───────────────────────────────────────────────────────

En {{company.city}}, a {{certificate.date}}



                    ________________________
                    {{signer.name}}
                    {{signer.title}}
                    
                         [SELLO]

───────────────────────────────────────────────────────
Certificado Nº: {{certificate.number}}
Código verificación: {{certificate.verification_code}}
                                                [QR]
═══════════════════════════════════════════════════════',
'{
  "sections": [
    {
      "id": "border",
      "type": "decorative_border",
      "config": {"style": "elegant", "color": "primary", "width": 3, "pattern": "double"}
    },
    {
      "id": "header",
      "type": "certificate_header",
      "config": {
        "logo_centered": true,
        "logo_max_width": 150,
        "ornament": true,
        "ornament_style": "classic"
      }
    },
    {
      "id": "title",
      "type": "certificate_title",
      "config": {
        "main": "CERTIFICADO",
        "subtitle": "DE REGISTRO DE MARCA",
        "font": "serif",
        "size": 28,
        "spacing": 4,
        "color": "primary"
      }
    },
    {
      "id": "body",
      "type": "certificate_body",
      "config": {
        "text": "Por medio del presente documento, {{company.name}} certifica que la marca descrita a continuación ha sido registrada satisfactoriamente.",
        "font": "serif",
        "align": "center",
        "margin_y": 20
      }
    },
    {
      "id": "details",
      "type": "certificate_details",
      "config": {
        "style": "elegant_table",
        "fields": [
          {"label": "Denominación", "key": "matter.mark_name"},
          {"label": "Nº Registro", "key": "matter.registration_number"},
          {"label": "Fecha Registro", "key": "matter.registration_date"},
          {"label": "Titular", "key": "client.name"},
          {"label": "Clases Niza", "key": "matter.nice_classes"},
          {"label": "Válido hasta", "key": "matter.expiry_date"}
        ],
        "border": true,
        "background": "#fafafa",
        "border_radius": 4
      }
    },
    {
      "id": "mark_image",
      "type": "mark_display",
      "config": {"show_if_figurative": true, "border": true, "max_width": 200, "centered": true}
    },
    {
      "id": "signature",
      "type": "signature_section",
      "config": {
        "place_date": "En {{company.city}}, a {{certificate.date}}",
        "signature_line": true,
        "stamp_placeholder": true,
        "signer_name": true,
        "signer_title": true,
        "align": "center"
      }
    },
    {
      "id": "footer",
      "type": "certificate_footer",
      "config": {
        "certificate_number": true,
        "verification_code": true,
        "qr_code": true
      }
    }
  ]
}',
'{
  "title": "CERTIFICADO",
  "subtitle": "DE REGISTRO DE MARCA",
  "body_text": "Por medio del presente documento, {{company.name}} certifica que la marca descrita a continuación ha sido registrada satisfactoriamente ante {{matter.office_name}}.",
  "place_prefix": "En {{company.city}}, a"
}',
'{
  "paper_size": "A4",
  "orientation": "portrait",
  "border_style": "elegant",
  "show_qr": true,
  "show_verification": true
}'
),

-- 2. Certificado de Presentación
(NULL, 'CERT_FILING', 'Certificado de Presentación',
 'Certificado que acredita la presentación de solicitud de registro ante oficina.',
 'certificate', 'trademark', true, 'certificate',
 '═══════════════════════════════════════════════════════

                    {{company.logo}}

                       CERTIFICADO
               DE PRESENTACIÓN DE SOLICITUD

═══════════════════════════════════════════════════════

Se certifica que con fecha {{matter.filing_date}} se ha presentado 
ante {{matter.office_name}} la solicitud de registro de marca 
para el signo distintivo que se detalla a continuación.

───────────────────────────────────────────────────────

| Marca                | {{matter.mark_name}}           |
| Nº Solicitud         | {{matter.application_number}}  |
| Fecha presentación   | {{matter.filing_date}}         |
| Solicitante          | {{client.name}}                |
| Oficina              | {{matter.office_name}}         |
| Clases               | {{matter.nice_classes}}        |

───────────────────────────────────────────────────────

El presente certificado se expide a efectos informativos, 
quedando la concesión del registro sujeta al examen 
y resolución de la oficina competente.

───────────────────────────────────────────────────────

En {{company.city}}, a {{certificate.date}}



                    ________________________
                    {{signer.name}}
                    {{signer.title}}

═══════════════════════════════════════════════════════',
'{
  "sections": [
    {
      "id": "border",
      "type": "decorative_border",
      "config": {"style": "simple", "color": "primary", "width": 2}
    },
    {
      "id": "header",
      "type": "certificate_header",
      "config": {"logo_centered": true, "logo_max_width": 140}
    },
    {
      "id": "title",
      "type": "certificate_title",
      "config": {
        "main": "CERTIFICADO",
        "subtitle": "DE PRESENTACIÓN DE SOLICITUD",
        "font": "serif",
        "size": 24
      }
    },
    {
      "id": "body",
      "type": "certificate_body",
      "config": {
        "text": "Se certifica que con fecha {{matter.filing_date}} se ha presentado la solicitud de registro.",
        "font": "serif",
        "align": "center"
      }
    },
    {
      "id": "details",
      "type": "certificate_details",
      "config": {
        "style": "clean_table",
        "fields": [
          {"label": "Marca", "key": "matter.mark_name"},
          {"label": "Nº Solicitud", "key": "matter.application_number"},
          {"label": "Fecha presentación", "key": "matter.filing_date"},
          {"label": "Solicitante", "key": "client.name"},
          {"label": "Oficina", "key": "matter.office_name"},
          {"label": "Clases", "key": "matter.nice_classes"}
        ],
        "border": true,
        "background": "#f8fafc"
      }
    },
    {
      "id": "disclaimer",
      "type": "text_block",
      "config": {
        "text": "El presente certificado se expide a efectos informativos, quedando la concesión del registro sujeta al examen y resolución de la oficina competente.",
        "italic": true,
        "font_size": 9,
        "color": "muted"
      }
    },
    {
      "id": "signature",
      "type": "signature_section",
      "config": {"formal": true, "centered": true}
    }
  ]
}',
'{
  "title": "CERTIFICADO",
  "subtitle": "DE PRESENTACIÓN DE SOLICITUD",
  "disclaimer": "El presente certificado se expide a efectos informativos, quedando la concesión del registro sujeta al examen y resolución de la oficina competente."
}',
'{
  "paper_size": "A4",
  "border_style": "simple"
}'
),

-- 3. Carta Formal
(NULL, 'LETTER_FORMAL', 'Carta Formal',
 'Formato de carta comercial estándar profesional. Ideal para comunicaciones generales.',
 'letter', 'correspondence', true, 'letter',
 '{{company.logo}}

**{{company.name}}**
{{company.address}}
{{company.postal_code}} {{company.city}}
Tel: {{company.phone}} | {{company.email}}

───────────────────────────────────────────────────────

{{company.city}}, {{letter.date}}

Ref: {{letter.reference}}

───────────────────────────────────────────────────────

**{{recipient.name}}**
{{recipient.company}}
{{recipient.address}}
{{recipient.postal_code}} {{recipient.city}}

───────────────────────────────────────────────────────

**Asunto:** {{letter.subject}}

───────────────────────────────────────────────────────

Estimado/a Sr./Sra.:

{{letter.body}}

Quedamos a su disposición para cualquier aclaración.

Atentamente,



________________________
{{signer.name}}
{{signer.title}}

───────────────────────────────────────────────────────
{{company.name}} · {{company.tax_id}} · {{company.website}}',
'{
  "sections": [
    {
      "id": "header",
      "type": "letter_header",
      "config": {
        "show_logo": true,
        "show_company_full": true,
        "logo_position": "left",
        "show_contact": true
      }
    },
    {
      "id": "date_ref",
      "type": "date_line",
      "config": {
        "format": "{{company.city}}, {{letter.date}}",
        "show_reference": true,
        "align": "right"
      }
    },
    {
      "id": "recipient",
      "type": "recipient_block",
      "config": {
        "formal": true,
        "show_attention": true,
        "margin_top": 20
      }
    },
    {
      "id": "subject",
      "type": "subject_line",
      "config": {
        "prefix": "Asunto:",
        "bold": true,
        "margin_y": 15
      }
    },
    {
      "id": "salutation",
      "type": "salutation",
      "config": {"default": "Estimado/a Sr./Sra.:"}
    },
    {
      "id": "body",
      "type": "letter_body",
      "config": {
        "paragraphs": true,
        "line_height": 1.6,
        "margin_y": 20
      }
    },
    {
      "id": "closing",
      "type": "closing",
      "config": {
        "default": "Atentamente,",
        "margin_top": 20
      }
    },
    {
      "id": "signature",
      "type": "signature",
      "config": {
        "space_height": 60,
        "show_name": true,
        "show_title": true
      }
    },
    {
      "id": "footer",
      "type": "letter_footer",
      "config": {
        "minimal": true,
        "show_contact": true,
        "show_legal": true
      }
    }
  ]
}',
'{
  "default_salutation": "Estimado/a Sr./Sra.:",
  "default_closing": "Atentamente,",
  "default_postscript": "Quedamos a su disposición para cualquier aclaración."
}',
'{
  "paper_size": "A4",
  "margins": {"top": 25, "right": 25, "bottom": 25, "left": 25}
}'
),

-- 4. Carta de Notificación
(NULL, 'LETTER_NOTIFICATION', 'Carta de Notificación',
 'Para comunicar eventos importantes al cliente. Incluye caja destacada y próximos pasos.',
 'letter', 'correspondence', true, 'letter',
 '{{company.logo}}

{{company.city}}, {{letter.date}}
Ref: {{matter.reference}}

───────────────────────────────────────────────────────

**{{recipient.name}}**
{{recipient.company}}
{{recipient.address}}

───────────────────────────────────────────────────────

┌─────────────────────────────────────────────────────┐
│  **Asunto:** {{letter.subject}}                     │
└─────────────────────────────────────────────────────┘

Estimado/a {{recipient.name}}:

┌─ ℹ️ INFORMACIÓN IMPORTANTE ─────────────────────────┐
│                                                      │
│  {{notification.highlight}}                          │
│                                                      │
└──────────────────────────────────────────────────────┘

{{letter.body}}

───────────────────────────────────────────────────────

**PRÓXIMOS PASOS:**

1. {{next_step_1}}
2. {{next_step_2}}
3. {{next_step_3}}

───────────────────────────────────────────────────────

Para cualquier consulta, no dude en contactarnos.

Atentamente,



________________________
{{signer.name}}
{{signer.title}}
{{company.email}} | {{company.phone}}',
'{
  "sections": [
    {
      "id": "header",
      "type": "letter_header",
      "config": {"professional": true, "compact": true}
    },
    {
      "id": "date_ref",
      "type": "date_line",
      "config": {
        "show_matter_ref": true,
        "align": "right"
      }
    },
    {
      "id": "recipient",
      "type": "recipient_block",
      "config": {"compact": true}
    },
    {
      "id": "subject",
      "type": "subject_line",
      "config": {
        "highlight": true,
        "background": "#fef3c7",
        "border": "#f59e0b",
        "padding": 12,
        "border_radius": 4
      }
    },
    {
      "id": "salutation",
      "type": "salutation",
      "config": {"personalized": true}
    },
    {
      "id": "highlight_box",
      "type": "highlight_box",
      "config": {
        "background": "#f0fdf4",
        "border_left": "#16a34a",
        "border_left_width": 4,
        "icon": "info",
        "padding": 16,
        "margin_y": 20
      }
    },
    {
      "id": "body",
      "type": "letter_body",
      "config": {"paragraphs": true}
    },
    {
      "id": "next_steps",
      "type": "action_list",
      "config": {
        "title": "PRÓXIMOS PASOS:",
        "numbered": true,
        "background": "#f8fafc",
        "padding": 16,
        "margin_top": 20
      }
    },
    {
      "id": "closing",
      "type": "closing",
      "config": {"default": "Atentamente,"}
    },
    {
      "id": "signature",
      "type": "signature",
      "config": {
        "show_name": true,
        "show_title": true,
        "show_contact": true
      }
    }
  ]
}',
'{
  "next_steps_title": "PRÓXIMOS PASOS:",
  "default_salutation": "Estimado/a",
  "default_closing": "Atentamente,",
  "contact_prompt": "Para cualquier consulta, no dude en contactarnos."
}',
'{
  "paper_size": "A4",
  "show_highlight_box": true,
  "show_next_steps": true
}'
);