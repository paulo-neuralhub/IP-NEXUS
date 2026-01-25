
-- Seed 4 professional invoice templates
INSERT INTO document_templates (
  organization_id, code, name, description, category, template_content, document_type, 
  is_system_template, layout, body_sections, custom_texts, type_config
) VALUES

-- Factura Clásica Profesional
(NULL, 'INV_CLASSIC', 'Factura Profesional Clásica', 
 'Diseño elegante y tradicional. Ideal para despachos que buscan imagen seria y profesional.',
 'other', '{{invoice_content}}', 'invoice', true, 'classic',
'{
  "sections": [
    {
      "id": "header",
      "type": "header",
      "config": {
        "layout": "two-column",
        "left": {"elements": ["logo"], "align": "left"},
        "right": {"elements": ["document_title", "document_info"], "align": "right"},
        "border_bottom": true,
        "border_color": "primary",
        "padding_bottom": 20
      }
    },
    {
      "id": "parties",
      "type": "two_column",
      "config": {
        "left": {"type": "company_info", "title": "EMISOR", "style": "compact"},
        "right": {"type": "client_info", "title": "CLIENTE", "style": "boxed", "background": "#f8fafc"},
        "margin_top": 30
      }
    },
    {
      "id": "items_table",
      "type": "line_items",
      "config": {
        "style": "professional",
        "header": {"background": "primary", "text": "white", "font_weight": "600"},
        "columns": [
          {"key": "description", "label": "Descripción", "width": "50%", "align": "left"},
          {"key": "quantity", "label": "Cant.", "width": "10%", "align": "center"},
          {"key": "unit_price", "label": "Precio", "width": "15%", "align": "right"},
          {"key": "tax", "label": "IVA", "width": "10%", "align": "center"},
          {"key": "total", "label": "Total", "width": "15%", "align": "right"}
        ],
        "row_padding": 12,
        "alternate_rows": true,
        "alternate_color": "#f8fafc",
        "border": "subtle"
      }
    },
    {
      "id": "totals",
      "type": "totals",
      "config": {
        "position": "right",
        "width": "280px",
        "style": "elegant",
        "items": [
          {"key": "subtotal", "label": "Subtotal", "style": "normal"},
          {"key": "tax", "label": "IVA ({{tax_rate}}%)", "style": "normal"},
          {"key": "total", "label": "TOTAL", "style": "highlight", "background": "primary", "text": "white", "font_size": 14}
        ],
        "border": true,
        "margin_top": 20
      }
    },
    {
      "id": "payment",
      "type": "payment_info",
      "config": {
        "style": "boxed",
        "background": "#f0f9ff",
        "border_left": "primary",
        "title": "INFORMACIÓN DE PAGO",
        "fields": ["bank_name", "iban", "swift", "due_date", "payment_terms"],
        "margin_top": 30
      }
    },
    {
      "id": "notes",
      "type": "notes",
      "config": {
        "show_if_present": true,
        "style": "italic",
        "color": "muted"
      }
    },
    {
      "id": "footer",
      "type": "footer",
      "config": {
        "border_top": true,
        "elements": ["company_legal", "registry", "page_number"],
        "font_size": 8,
        "color": "muted",
        "padding_top": 15
      }
    }
  ]
}'::jsonb,
'{
  "document_title": "FACTURA",
  "invoice_number_label": "Nº Factura",
  "date_label": "Fecha",
  "due_date_label": "Vencimiento",
  "subtotal_label": "Subtotal",
  "tax_label": "IVA",
  "total_label": "TOTAL A PAGAR",
  "payment_title": "DATOS DE PAGO",
  "payment_terms": "Pago a 30 días desde fecha de factura"
}'::jsonb,
'{
  "paper_size": "A4",
  "margins": {"top": 25, "right": 25, "bottom": 25, "left": 25},
  "header_height": 80,
  "footer_height": 40
}'::jsonb
),

-- Factura Moderna
(NULL, 'INV_MODERN', 'Factura Moderna',
 'Diseño contemporáneo con acentos de color. Ideal para empresas innovadoras.',
 'other', '{{invoice_content}}', 'invoice', true, 'modern',
'{
  "sections": [
    {
      "id": "accent_bar",
      "type": "color_bar",
      "config": {"height": 8, "color": "primary"}
    },
    {
      "id": "header",
      "type": "header",
      "config": {
        "layout": "modern",
        "logo_size": "large",
        "document_badge": {"background": "primary", "text": "white", "border_radius": 4}
      }
    },
    {
      "id": "info_cards",
      "type": "info_cards",
      "config": {
        "cards": [
          {"label": "Factura Nº", "value": "{{invoice.number}}", "icon": "file-text"},
          {"label": "Fecha", "value": "{{invoice.date}}", "icon": "calendar"},
          {"label": "Vencimiento", "value": "{{invoice.due_date}}", "icon": "clock"},
          {"label": "Estado", "value": "{{invoice.status}}", "icon": "check-circle", "badge": true}
        ],
        "style": "horizontal",
        "background": "#f8fafc",
        "border_radius": 8
      }
    },
    {
      "id": "parties",
      "type": "two_column",
      "config": {
        "left": {"type": "company_mini", "title": "De"},
        "right": {"type": "client_info", "title": "Para", "style": "card"}
      }
    },
    {
      "id": "items",
      "type": "line_items",
      "config": {
        "style": "modern",
        "header": {"background": "primary", "text": "white", "border_radius": "8px 8px 0 0"},
        "body": {"border": "1px solid #e5e7eb", "border_radius": "0 0 8px 8px"},
        "row_hover": true
      }
    },
    {
      "id": "totals",
      "type": "totals",
      "config": {
        "style": "card",
        "background": "linear-gradient(135deg, primary 0%, secondary 100%)",
        "text": "white",
        "border_radius": 8,
        "shadow": true
      }
    },
    {
      "id": "footer",
      "type": "footer",
      "config": {"style": "minimal", "show_qr": true}
    }
  ]
}'::jsonb,
'{
  "document_title": "FACTURA",
  "status_paid": "✓ PAGADA",
  "status_pending": "PENDIENTE"
}'::jsonb,
'{
  "accent_bar_height": 8,
  "border_radius": 8,
  "shadow": true
}'::jsonb
),

-- Factura Minimalista
(NULL, 'INV_MINIMAL', 'Factura Minimalista',
 'Ultra limpio, sin elementos decorativos. Máxima legibilidad.',
 'other', '{{invoice_content}}', 'invoice', true, 'minimal',
'{
  "sections": [
    {
      "id": "header",
      "type": "header",
      "config": {"layout": "minimal", "logo_only": true, "separator_line": true}
    },
    {
      "id": "title",
      "type": "title",
      "config": {"text": "Factura", "size": 24, "weight": 300}
    },
    {
      "id": "meta",
      "type": "inline_meta",
      "config": {"items": ["number", "date", "due_date"], "separator": " · ", "color": "muted"}
    },
    {
      "id": "client",
      "type": "client_info",
      "config": {"minimal": true, "margin_top": 30}
    },
    {
      "id": "items",
      "type": "line_items",
      "config": {"style": "minimal", "no_borders": true, "divider": "dotted"}
    },
    {
      "id": "totals",
      "type": "totals",
      "config": {"minimal": true, "align": "right"}
    },
    {
      "id": "payment",
      "type": "payment_info",
      "config": {"inline": true, "minimal": true}
    }
  ]
}'::jsonb,
'{"document_title": "Factura"}'::jsonb,
'{}'::jsonb
),

-- Factura Corporativa
(NULL, 'INV_CORPORATE', 'Factura Corporativa',
 'Diseño formal completo para grandes empresas y corporaciones.',
 'other', '{{invoice_content}}', 'invoice', true, 'corporate',
'{
  "sections": [
    {
      "id": "header",
      "type": "header",
      "config": {"layout": "corporate", "show_full_details": true, "show_registry": true}
    },
    {
      "id": "reference_box",
      "type": "reference_box",
      "config": {
        "border": true,
        "fields": ["number", "date", "due_date", "reference", "contract"],
        "two_column": true
      }
    },
    {
      "id": "client",
      "type": "client_info",
      "config": {"full_details": true, "show_contact": true}
    },
    {
      "id": "items",
      "type": "line_items",
      "config": {"detailed": true, "show_codes": true, "show_tax_per_line": true}
    },
    {
      "id": "totals",
      "type": "totals",
      "config": {"show_currency": true, "show_words": true}
    },
    {
      "id": "legal",
      "type": "legal_section",
      "config": {"show_terms": true, "show_late_payment": true}
    },
    {
      "id": "footer",
      "type": "footer",
      "config": {"show_all_details": true, "show_certification": true, "show_qr": true}
    }
  ]
}'::jsonb,
'{
  "document_title": "FACTURA COMERCIAL",
  "amount_words_prefix": "Son:",
  "late_payment_text": "Interés demora según Ley 3/2004"
}'::jsonb,
'{"show_qr": true, "show_amount_words": true}'::jsonb
);
