-- Delete existing minimalist templates to avoid duplicates
DELETE FROM document_templates 
WHERE code IN ('INVOICE_MINIMALIST', 'QUOTE_MINIMALIST', 'LETTER_MINIMALIST', 'CONTRACT_MINIMALIST')
  AND organization_id IS NULL;

-- 1. FACTURA MINIMALISTA (category: billing)
INSERT INTO document_templates (
  code, name, description, document_type, style, category, 
  content_html, template_content, variables, 
  is_default, is_active, is_system_template, 
  show_logo, show_header, show_footer, layout
)
VALUES (
  'INVOICE_MINIMALIST',
  'Factura Minimalista',
  'Diseño limpio y moderno cyan',
  'invoice',
  'minimalist',
  'billing',
  '<!DOCTYPE html><html><head><meta charset="UTF-8"><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Inter,system-ui,sans-serif;background:#fff;color:#111;line-height:1.5}.invoice{max-width:800px;margin:0 auto;padding:60px}.header{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:40px;border-bottom:1px solid #eee}.brand h1{font-size:24px;font-weight:700;letter-spacing:-0.5px}.brand p{font-size:12px;color:#666;margin-top:5px}.invoice-meta{text-align:right}.invoice-meta .number{font-size:32px;font-weight:200;color:#06b6d4}.invoice-meta .label{font-size:10px;text-transform:uppercase;letter-spacing:2px;color:#999}.invoice-meta .date{font-size:13px;color:#666;margin-top:10px}.info-section{display:grid;grid-template-columns:1fr 1fr;gap:60px;padding:40px 0}.info-block .label{font-size:10px;text-transform:uppercase;letter-spacing:2px;color:#999;margin-bottom:15px}.info-block p{font-size:14px;margin:3px 0}.info-block .name{font-weight:600;font-size:16px}table{width:100%;margin:40px 0;border-collapse:collapse}thead{border-bottom:2px solid #111}th{padding:15px 0;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:2px;color:#999;font-weight:500}th:last-child{text-align:right}td{padding:20px 0;font-size:14px;border-bottom:1px solid #f0f0f0}td:last-child{text-align:right;font-weight:600}.totals{display:flex;justify-content:flex-end}.totals-box{width:280px}.totals-row{display:flex;justify-content:space-between;padding:12px 0;font-size:14px}.totals-row.total{border-top:2px solid #111;margin-top:15px;padding-top:20px;font-size:24px;font-weight:700}.totals-row.total span:last-child{color:#06b6d4}.footer{margin-top:60px;padding-top:40px;border-top:1px solid #eee;display:grid;grid-template-columns:1fr 1fr;gap:40px}.footer-block .label{font-size:10px;text-transform:uppercase;letter-spacing:2px;color:#999;margin-bottom:10px}.footer-block p{font-size:13px;color:#666}.accent-bar{width:60px;height:4px;background:#06b6d4;margin-bottom:20px}</style></head><body><div class="invoice"><div class="header"><div class="brand"><div class="accent-bar"></div><h1>{{empresa_nombre}}</h1><p>{{empresa_direccion}}</p></div><div class="invoice-meta"><div class="label">Factura</div><div class="number">{{factura_numero}}</div><div class="date">{{factura_fecha}}</div></div></div><div class="info-section"><div class="info-block"><div class="label">Facturado a</div><p class="name">{{cliente_nombre}}</p><p>{{cliente_direccion}}</p><p>{{cliente_cif}}</p></div><div class="info-block"><div class="label">Detalles</div><p><strong>Emisión:</strong> {{factura_fecha}}</p><p><strong>Vencimiento:</strong> {{factura_vencimiento}}</p><p><strong>Método:</strong> {{metodo_pago}}</p></div></div><table><thead><tr><th style="width:50%">Descripción</th><th style="width:15%">Cant.</th><th style="width:15%">Precio</th><th style="width:20%">Total</th></tr></thead><tbody>{{#items}}<tr><td>{{descripcion}}</td><td>{{cantidad}}</td><td>{{precio}}</td><td>{{total}}</td></tr>{{/items}}</tbody></table><div class="totals"><div class="totals-box"><div class="totals-row"><span>Subtotal</span><span>{{subtotal}}</span></div><div class="totals-row"><span>IVA ({{iva_porcentaje}})</span><span>{{iva_importe}}</span></div><div class="totals-row total"><span>Total</span><span>{{total_factura}}</span></div></div></div><div class="footer"><div class="footer-block"><div class="label">Datos de pago</div><p>{{banco_nombre}}</p><p>{{banco_iban}}</p></div><div class="footer-block"><div class="label">Contacto</div><p>{{empresa_email}}</p><p>{{empresa_telefono}}</p></div></div></div></body></html>',
  'Factura Minimalista Template',
  '{"empresa_nombre":{"label":"Empresa","required":true},"factura_numero":{"label":"Número","required":true},"items":{"label":"Líneas","type":"array"}}'::jsonb,
  false, true, true,
  true, true, true, 'minimalist'
);

-- 2. PRESUPUESTO MINIMALISTA (category: billing)
INSERT INTO document_templates (
  code, name, description, document_type, style, category,
  content_html, template_content, variables,
  is_default, is_active, is_system_template,
  show_logo, show_header, show_footer, layout
)
VALUES (
  'QUOTE_MINIMALIST',
  'Presupuesto Minimalista',
  'Presupuesto limpio y moderno',
  'quote',
  'minimalist',
  'billing',
  '<!DOCTYPE html><html><head><meta charset="UTF-8"><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Inter,system-ui,sans-serif;background:#fff;color:#111;line-height:1.5}.quote{max-width:800px;margin:0 auto;padding:60px}.header{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:40px;border-bottom:1px solid #eee}.brand h1{font-size:24px;font-weight:700;letter-spacing:-0.5px}.brand p{font-size:12px;color:#666;margin-top:5px}.quote-meta{text-align:right}.quote-meta .number{font-size:28px;font-weight:200;color:#06b6d4}.quote-meta .label{font-size:10px;text-transform:uppercase;letter-spacing:2px;color:#999}.quote-meta .date{font-size:13px;color:#666;margin-top:10px}.project-title{padding:30px 0;border-bottom:1px solid #eee}.project-title .label{font-size:10px;text-transform:uppercase;letter-spacing:2px;color:#999}.project-title h2{font-size:20px;font-weight:600;margin-top:8px}.accent-bar{width:60px;height:4px;background:#06b6d4;margin-bottom:20px}.info-section{display:grid;grid-template-columns:1fr 1fr;gap:60px;padding:40px 0}.info-block .label{font-size:10px;text-transform:uppercase;letter-spacing:2px;color:#999;margin-bottom:15px}.info-block p{font-size:14px;margin:3px 0}.info-block .name{font-weight:600;font-size:16px}table{width:100%;margin:40px 0;border-collapse:collapse}thead{border-bottom:2px solid #111}th{padding:15px 0;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:2px;color:#999;font-weight:500}th:last-child{text-align:right}td{padding:20px 0;font-size:14px;border-bottom:1px solid #f0f0f0}td:last-child{text-align:right;font-weight:600}.totals{display:flex;justify-content:flex-end;margin-bottom:50px}.totals-box{width:280px}.totals-row{display:flex;justify-content:space-between;padding:12px 0;font-size:14px}.totals-row.total{border-top:2px solid #111;margin-top:15px;padding-top:20px;font-size:24px;font-weight:700}.totals-row.total span:last-child{color:#06b6d4}.validity{background:#f8f8f8;padding:25px;margin-bottom:30px}.validity .label{font-size:10px;text-transform:uppercase;letter-spacing:2px;color:#999}.validity p{font-size:14px;margin-top:8px}.terms{font-size:13px;color:#666}.terms .label{font-size:10px;text-transform:uppercase;letter-spacing:2px;color:#999;margin-bottom:10px;display:block}.footer{margin-top:50px;padding-top:30px;border-top:1px solid #eee;text-align:center}.footer p{font-size:12px;color:#999}</style></head><body><div class="quote"><div class="header"><div class="brand"><div class="accent-bar"></div><h1>{{empresa_nombre}}</h1><p>{{empresa_direccion}}</p></div><div class="quote-meta"><div class="label">Presupuesto</div><div class="number">{{presupuesto_numero}}</div><div class="date">{{presupuesto_fecha}}</div></div></div><div class="project-title"><div class="label">Proyecto</div><h2>{{proyecto_nombre}}</h2></div><div class="info-section"><div class="info-block"><div class="label">Cliente</div><p class="name">{{cliente_nombre}}</p><p>{{cliente_direccion}}</p><p>{{cliente_email}}</p></div><div class="info-block"><div class="label">Contacto</div><p>{{empresa_telefono}}</p><p>{{empresa_email}}</p></div></div><table><thead><tr><th style="width:50%">Concepto</th><th style="width:15%">Cant.</th><th style="width:15%">Precio</th><th style="width:20%">Total</th></tr></thead><tbody>{{#items}}<tr><td>{{descripcion}}</td><td>{{cantidad}}</td><td>{{precio}}</td><td>{{total}}</td></tr>{{/items}}</tbody></table><div class="totals"><div class="totals-box"><div class="totals-row"><span>Subtotal</span><span>{{subtotal}}</span></div><div class="totals-row"><span>IVA ({{iva_porcentaje}})</span><span>{{iva_importe}}</span></div><div class="totals-row total"><span>Total</span><span>{{total_presupuesto}}</span></div></div></div><div class="validity"><div class="label">Validez</div><p>Este presupuesto es válido durante {{validez_dias}} días.</p></div><div class="terms"><span class="label">Condiciones</span><p>{{condiciones}}</p></div><div class="footer"><p>{{empresa_nombre}} · {{empresa_telefono}} · {{empresa_email}}</p></div></div></body></html>',
  'Presupuesto Minimalista Template',
  '{"presupuesto_numero":{"label":"Número","required":true},"proyecto_nombre":{"label":"Proyecto","required":true},"items":{"label":"Líneas","type":"array"}}'::jsonb,
  false, true, true,
  true, true, true, 'minimalist'
);

-- 3. CARTA MINIMALISTA (category: correspondence)
INSERT INTO document_templates (
  code, name, description, document_type, style, category,
  content_html, template_content, variables,
  is_default, is_active, is_system_template,
  show_logo, show_header, show_footer, layout
)
VALUES (
  'LETTER_MINIMALIST',
  'Carta Minimalista',
  'Membrete minimalista moderno',
  'letter',
  'minimalist',
  'correspondence',
  '<!DOCTYPE html><html><head><meta charset="UTF-8"><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Inter,system-ui,sans-serif;background:#fff;color:#111;line-height:1.7}.letter{max-width:800px;margin:0 auto;padding:60px;min-height:1000px;display:flex;flex-direction:column}.header{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:40px;border-bottom:1px solid #eee}.brand h1{font-size:20px;font-weight:700;letter-spacing:-0.5px}.brand p{font-size:11px;color:#999;margin-top:5px}.header-right{text-align:right;font-size:12px;color:#666}.accent-bar{width:40px;height:3px;background:#06b6d4;margin-bottom:15px}.content{flex:1;padding-top:50px}.date{font-size:13px;color:#999;margin-bottom:40px}.recipient{margin-bottom:40px}.recipient .label{font-size:10px;text-transform:uppercase;letter-spacing:2px;color:#999;margin-bottom:10px}.recipient .name{font-weight:600;font-size:16px}.recipient p{font-size:14px;color:#666;margin:2px 0}.subject{background:#f8f8f8;padding:15px 20px;margin-bottom:40px}.subject .label{font-size:10px;text-transform:uppercase;letter-spacing:2px;color:#999}.subject h2{font-size:14px;font-weight:600;margin-top:5px}.salutation{margin-bottom:25px;font-size:15px}.body-text{font-size:15px;color:#333;text-align:justify}.body-text p{margin-bottom:18px}.closing{margin-top:35px;font-size:15px}.signature-block{margin-top:50px}.sig-line{width:200px;height:1px;background:#06b6d4;margin-bottom:15px}.sig-name{font-size:16px;font-weight:600}.sig-title{font-size:12px;color:#999;margin-top:5px}.footer{padding-top:30px;border-top:1px solid #eee;text-align:center}.footer p{font-size:11px;color:#999}</style></head><body><div class="letter"><div class="header"><div class="brand"><div class="accent-bar"></div><h1>{{empresa_nombre}}</h1><p>{{empresa_direccion}}</p></div><div class="header-right"><p>{{empresa_telefono}}</p><p>{{empresa_email}}</p></div></div><div class="content"><div class="date">{{lugar}}, {{fecha}}</div><div class="recipient"><div class="label">Para</div><p class="name">{{destinatario_nombre}}</p><p>{{destinatario_cargo}}</p><p>{{destinatario_empresa}}</p></div><div class="subject"><div class="label">Asunto</div><h2>{{asunto}}</h2></div><div class="salutation">{{saludo}}</div><div class="body-text">{{cuerpo}}</div><div class="closing"><p>{{despedida}}</p></div><div class="signature-block"><div class="sig-line"></div><div class="sig-name">{{firmante_nombre}}</div><div class="sig-title">{{firmante_cargo}}</div></div></div><div class="footer"><p>{{empresa_nombre}} · CIF: {{empresa_cif}} · {{empresa_web}}</p></div></div></body></html>',
  'Carta Minimalista Template',
  '{"destinatario_nombre":{"label":"Destinatario","required":true},"asunto":{"label":"Asunto","required":true},"cuerpo":{"label":"Cuerpo","required":true}}'::jsonb,
  false, true, true,
  true, true, true, 'minimalist'
);

-- 4. CONTRATO MINIMALISTA (category: contract)
INSERT INTO document_templates (
  code, name, description, document_type, style, category,
  content_html, template_content, variables,
  is_default, is_active, is_system_template,
  show_logo, show_header, show_footer, layout
)
VALUES (
  'CONTRACT_MINIMALIST',
  'Contrato Minimalista',
  'Contrato con diseño minimalista',
  'contract',
  'minimalist',
  'contract',
  '<!DOCTYPE html><html><head><meta charset="UTF-8"><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Inter,system-ui,sans-serif;background:#fff;color:#111;line-height:1.7}.contract{max-width:800px;margin:0 auto;padding:60px}.header{text-align:center;padding-bottom:40px;border-bottom:1px solid #eee}.accent-bar{width:60px;height:4px;background:#06b6d4;margin:0 auto 20px}.header h1{font-size:28px;font-weight:700;letter-spacing:-0.5px}.header p{font-size:13px;color:#999;margin-top:10px}.intro{text-align:center;padding:40px 0;border-bottom:1px solid #eee}.intro p{font-size:14px;color:#666}.intro .date{font-size:16px;font-weight:600;color:#111;margin-top:10px}.parties{display:grid;grid-template-columns:1fr 1fr;gap:40px;padding:40px 0;border-bottom:1px solid #eee}.party .label{font-size:10px;text-transform:uppercase;letter-spacing:2px;color:#06b6d4;margin-bottom:15px}.party .name{font-weight:600;font-size:16px;margin-bottom:10px}.party p{font-size:13px;color:#666;margin:2px 0}.clauses{padding:40px 0}.clause{margin-bottom:30px}.clause-title{display:flex;align-items:center;gap:15px;margin-bottom:12px}.clause-number{font-size:11px;font-weight:700;color:#06b6d4}.clause-name{font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:1px}.clause-content{font-size:14px;color:#333;text-align:justify;padding-left:30px}.clause-content ul{margin:10px 0 10px 20px}.clause-content li{margin-bottom:6px}.signatures{display:grid;grid-template-columns:1fr 1fr;gap:60px;margin-top:60px;padding-top:40px;border-top:1px solid #eee}.sig-block{text-align:center}.sig-block .label{font-size:10px;text-transform:uppercase;letter-spacing:2px;color:#999;margin-bottom:50px}.sig-line{height:1px;background:#06b6d4;margin-bottom:15px}.sig-name{font-size:14px;font-weight:600}.sig-role{font-size:11px;color:#999;margin-top:5px}.footer{margin-top:50px;text-align:center}.footer p{font-size:11px;color:#999}</style></head><body><div class="contract"><div class="header"><div class="accent-bar"></div><h1>Contrato de Servicios</h1><p>{{contrato_tipo}}</p></div><div class="intro"><p>Celebrado entre las partes en</p><div class="date">{{lugar}}, a {{fecha}}</div></div><div class="parties"><div class="party"><div class="label">Primera Parte</div><p class="name">{{empresa_nombre}}</p><p>CIF: {{empresa_cif}}</p><p>{{empresa_direccion}}</p></div><div class="party"><div class="label">Segunda Parte</div><p class="name">{{cliente_nombre}}</p><p>CIF: {{cliente_cif}}</p><p>{{cliente_direccion}}</p></div></div><div class="clauses"><div class="clause"><div class="clause-title"><span class="clause-number">01</span><span class="clause-name">Objeto</span></div><div class="clause-content"><p>{{clausula_objeto}}</p></div></div><div class="clause"><div class="clause-title"><span class="clause-number">02</span><span class="clause-name">Servicios</span></div><div class="clause-content"><ul>{{#servicios}}<li>{{descripcion}}</li>{{/servicios}}</ul></div></div><div class="clause"><div class="clause-title"><span class="clause-number">03</span><span class="clause-name">Honorarios</span></div><div class="clause-content"><p>{{clausula_honorarios}}</p></div></div><div class="clause"><div class="clause-title"><span class="clause-number">04</span><span class="clause-name">Duración</span></div><div class="clause-content"><p>{{clausula_duracion}}</p></div></div></div><div class="signatures"><div class="sig-block"><div class="label">Por {{empresa_nombre}}</div><div class="sig-line"></div><div class="sig-name">{{representante_empresa}}</div><div class="sig-role">{{cargo_representante}}</div></div><div class="sig-block"><div class="label">Por el Cliente</div><div class="sig-line"></div><div class="sig-name">{{cliente_nombre}}</div></div></div><div class="footer"><p>{{empresa_nombre}} · {{empresa_telefono}} · {{empresa_email}}</p></div></div></body></html>',
  'Contrato Minimalista Template',
  '{"contrato_tipo":{"label":"Tipo contrato","required":true},"clausula_objeto":{"label":"Objeto","required":true},"servicios":{"label":"Servicios","type":"array"}}'::jsonb,
  false, true, true,
  true, true, true, 'minimalist'
);