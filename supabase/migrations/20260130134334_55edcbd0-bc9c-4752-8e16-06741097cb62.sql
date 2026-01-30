-- Plantillas adicionales de WhatsApp profesionales

INSERT INTO communication_templates (code, name, description, channel, category, content_text, variables, is_system, tags) VALUES

('wa_welcome_new_client_v2', 'Bienvenida nuevo cliente', 'Mensaje de bienvenida para nuevos clientes', 'whatsapp', 'bienvenida',
'¡Hola {{client_name}}! 👋

Soy *{{agent_name}}* de *{{company_name}}*.

Es un placer darte la bienvenida. Hemos recibido tu solicitud y ya estamos trabajando en ella.

📋 *Tu referencia:* {{matter_ref}}
📝 *Asunto:* {{matter_title}}

Estaré encantado/a de ayudarte en todo el proceso. Si tienes cualquier duda, puedes escribirme por aquí o llamarme al {{company_phone}}.

¡Gracias por confiar en nosotros! 🤝',
'[{"name": "client_name", "label": "Nombre del cliente", "required": true}, {"name": "agent_name", "label": "Nombre del agente", "required": true}, {"name": "company_name", "label": "Nombre de la empresa", "required": true}, {"name": "matter_ref", "label": "Referencia del expediente", "required": false}, {"name": "matter_title", "label": "Título del asunto", "required": false}, {"name": "company_phone", "label": "Teléfono de la empresa", "required": false}]',
TRUE, ARRAY['bienvenida', 'nuevo-cliente', 'onboarding']),

('wa_welcome_consultation', 'Confirmación consulta inicial', 'Confirmar recepción de consulta', 'whatsapp', 'bienvenida',
'Hola {{client_name}} 👋

Gracias por contactar con *{{company_name}}*.

✅ Hemos recibido tu consulta sobre *{{consultation_topic}}*.

📅 Te responderemos en un plazo máximo de *24-48 horas laborables*.

Mientras tanto, si necesitas añadir información adicional, puedes responder a este mensaje.

Un saludo cordial,
*{{agent_name}}*',
'[{"name": "client_name", "label": "Nombre del cliente", "required": true}, {"name": "company_name", "label": "Nombre de la empresa", "required": true}, {"name": "consultation_topic", "label": "Tema de la consulta", "required": true}, {"name": "agent_name", "label": "Nombre del agente", "required": true}]',
TRUE, ARRAY['bienvenida', 'consulta', 'confirmacion']),

('wa_matter_update', 'Actualización de expediente', 'Informar sobre avances en el expediente', 'whatsapp', 'seguimiento',
'Hola {{client_name}} 📬

Te informo sobre el estado de tu expediente:

📋 *Ref:* {{matter_ref}}
📝 *Asunto:* {{matter_title}}

*Estado actual:* {{current_status}}

{{update_details}}

📅 *Próximo paso:* {{next_step}}
⏰ *Fecha estimada:* {{estimated_date}}

Si tienes alguna pregunta, estoy a tu disposición.

Saludos,
*{{agent_name}}*',
'[{"name": "client_name", "label": "Nombre del cliente", "required": true}, {"name": "matter_ref", "label": "Referencia", "required": true}, {"name": "matter_title", "label": "Título", "required": true}, {"name": "current_status", "label": "Estado actual", "required": true}, {"name": "update_details", "label": "Detalles de la actualización", "required": true}, {"name": "next_step", "label": "Próximo paso", "required": true}, {"name": "estimated_date", "label": "Fecha estimada", "required": false}, {"name": "agent_name", "label": "Nombre del agente", "required": true}]',
TRUE, ARRAY['seguimiento', 'actualizacion', 'expediente']),

('wa_matter_phase_change', 'Cambio de fase', 'Notificar cambio de fase en expediente', 'whatsapp', 'seguimiento',
'Hola {{client_name}} 🎯

¡Buenas noticias! Tu expediente ha avanzado de fase.

📋 *Ref:* {{matter_ref}}

✅ *Fase completada:* {{previous_phase}}
➡️ *Nueva fase:* {{new_phase}}

{{phase_description}}

Te mantendré informado/a de los próximos avances.

*{{agent_name}}*
{{company_name}}',
'[{"name": "client_name", "label": "Nombre del cliente", "required": true}, {"name": "matter_ref", "label": "Referencia", "required": true}, {"name": "previous_phase", "label": "Fase anterior", "required": true}, {"name": "new_phase", "label": "Nueva fase", "required": true}, {"name": "phase_description", "label": "Descripción de la fase", "required": false}, {"name": "agent_name", "label": "Nombre del agente", "required": true}, {"name": "company_name", "label": "Nombre de la empresa", "required": true}]',
TRUE, ARRAY['seguimiento', 'fase', 'progreso']),

('wa_deadline_reminder_urgent', 'Recordatorio URGENTE', 'Plazo muy próximo - urgente', 'whatsapp', 'plazos',
'🚨 *URGENTE* - {{client_name}}

El plazo para tu expediente *{{matter_ref}}* vence *{{deadline_date}}*.

⏰ *Acción necesaria:* {{action_required}}

Por favor, contacta con nosotros lo antes posible para evitar la pérdida de derechos.

📞 {{company_phone}}
✉️ {{company_email}}

*{{agent_name}}*
{{company_name}}',
'[{"name": "client_name", "label": "Nombre del cliente", "required": true}, {"name": "matter_ref", "label": "Referencia", "required": true}, {"name": "deadline_date", "label": "Fecha límite", "required": true}, {"name": "action_required", "label": "Acción requerida", "required": true}, {"name": "company_phone", "label": "Teléfono", "required": true}, {"name": "company_email", "label": "Email", "required": true}, {"name": "agent_name", "label": "Nombre del agente", "required": true}, {"name": "company_name", "label": "Nombre de la empresa", "required": true}]',
TRUE, ARRAY['plazos', 'urgente', 'critico']),

('wa_renewal_reminder_v2', 'Recordatorio de renovación', 'Recordar próxima renovación', 'whatsapp', 'plazos',
'Hola {{client_name}} 🔄

Te informo que la *renovación* de tu registro está próxima:

🏷️ *Marca/Patente:* {{ip_name}}
📋 *Nº Registro:* {{registration_number}}
📅 *Vencimiento:* {{expiry_date}}
💰 *Coste estimado:* {{estimated_cost}}

Para mantener la protección de tus derechos, es necesario proceder con la renovación antes de la fecha indicada.

¿Deseas que procedamos con la renovación? Responde *SÍ* para confirmar o *LLAMAR* si prefieres que te contactemos.

*{{agent_name}}*
{{company_name}}',
'[{"name": "client_name", "label": "Nombre del cliente", "required": true}, {"name": "ip_name", "label": "Nombre de la marca/patente", "required": true}, {"name": "registration_number", "label": "Número de registro", "required": true}, {"name": "expiry_date", "label": "Fecha de vencimiento", "required": true}, {"name": "estimated_cost", "label": "Coste estimado", "required": false}, {"name": "agent_name", "label": "Nombre del agente", "required": true}, {"name": "company_name", "label": "Nombre de la empresa", "required": true}]',
TRUE, ARRAY['renovacion', 'recordatorio', 'vencimiento']),

('wa_invoice_sent_v2', 'Factura enviada', 'Notificar envío de factura', 'whatsapp', 'facturacion',
'Hola {{client_name}} 📄

Te informo que hemos emitido una nueva factura:

🧾 *Nº Factura:* {{invoice_number}}
💰 *Importe:* {{invoice_amount}}
📅 *Vencimiento:* {{due_date}}

📧 Recibirás la factura en tu email: {{client_email}}

*Datos para el pago:*
🏦 {{bank_name}}
💳 {{bank_iban}}

¿Tienes alguna pregunta sobre la factura? Estoy a tu disposición.

*{{agent_name}}*',
'[{"name": "client_name", "label": "Nombre del cliente", "required": true}, {"name": "invoice_number", "label": "Número de factura", "required": true}, {"name": "invoice_amount", "label": "Importe", "required": true}, {"name": "due_date", "label": "Fecha de vencimiento", "required": true}, {"name": "client_email", "label": "Email del cliente", "required": true}, {"name": "bank_name", "label": "Nombre del banco", "required": true}, {"name": "bank_iban", "label": "IBAN", "required": true}, {"name": "agent_name", "label": "Nombre del agente", "required": true}]',
TRUE, ARRAY['facturacion', 'factura', 'cobro']),

('wa_payment_reminder_v2', 'Recordatorio de pago', 'Recordar pago pendiente', 'whatsapp', 'facturacion',
'Hola {{client_name}} 💳

Te recordamos que tienes una factura pendiente de pago:

🧾 *Nº Factura:* {{invoice_number}}
💰 *Importe:* {{invoice_amount}}
📅 *Vencimiento:* {{due_date}}

Si ya has realizado el pago, puedes ignorar este mensaje. Si necesitas más tiempo o tienes alguna duda, por favor contáctanos.

Gracias por tu atención.

*{{agent_name}}*
{{company_name}}',
'[{"name": "client_name", "label": "Nombre del cliente", "required": true}, {"name": "invoice_number", "label": "Número de factura", "required": true}, {"name": "invoice_amount", "label": "Importe", "required": true}, {"name": "due_date", "label": "Fecha de vencimiento", "required": true}, {"name": "agent_name", "label": "Nombre del agente", "required": true}, {"name": "company_name", "label": "Nombre de la empresa", "required": true}]',
TRUE, ARRAY['facturacion', 'recordatorio', 'pago']),

('wa_payment_received_v2', 'Confirmación de pago', 'Confirmar recepción de pago', 'whatsapp', 'facturacion',
'Hola {{client_name}} ✅

Confirmamos la recepción de tu pago:

🧾 *Factura:* {{invoice_number}}
💰 *Importe:* {{payment_amount}}
📅 *Fecha:* {{payment_date}}

Muchas gracias por tu confianza. Seguimos trabajando en tu expediente.

*{{agent_name}}*
{{company_name}}',
'[{"name": "client_name", "label": "Nombre del cliente", "required": true}, {"name": "invoice_number", "label": "Número de factura", "required": true}, {"name": "payment_amount", "label": "Importe pagado", "required": true}, {"name": "payment_date", "label": "Fecha de pago", "required": true}, {"name": "agent_name", "label": "Nombre del agente", "required": true}, {"name": "company_name", "label": "Nombre de la empresa", "required": true}]',
TRUE, ARRAY['facturacion', 'pago', 'confirmacion']),

('wa_registration_granted', 'Registro concedido', 'Notificar concesión de registro', 'whatsapp', 'legal',
'🎉 *¡Enhorabuena {{client_name}}!*

Nos complace informarte que tu registro ha sido *CONCEDIDO*:

🏷️ *{{ip_type}}:* {{ip_name}}
📋 *Nº Registro:* {{registration_number}}
📅 *Fecha de concesión:* {{grant_date}}
🌍 *Territorio:* {{jurisdiction}}

Tu {{ip_type}} está ahora oficialmente protegida.

📄 Te enviaremos el certificado de registro por email.

¡Gracias por confiar en {{company_name}}!

*{{agent_name}}*',
'[{"name": "client_name", "label": "Nombre del cliente", "required": true}, {"name": "ip_type", "label": "Tipo (Marca/Patente)", "required": true}, {"name": "ip_name", "label": "Nombre", "required": true}, {"name": "registration_number", "label": "Número de registro", "required": true}, {"name": "grant_date", "label": "Fecha de concesión", "required": true}, {"name": "jurisdiction", "label": "Territorio", "required": true}, {"name": "company_name", "label": "Nombre de la empresa", "required": true}, {"name": "agent_name", "label": "Nombre del agente", "required": true}]',
TRUE, ARRAY['legal', 'registro', 'concesion', 'exito']),

('wa_opposition_received', 'Oposición recibida', 'Notificar oposición contra solicitud', 'whatsapp', 'legal',
'Hola {{client_name}} ⚠️

Te informamos que hemos recibido una *oposición* contra tu solicitud:

📋 *Expediente:* {{matter_ref}}
🏷️ *Marca:* {{trademark_name}}
🏢 *Oponente:* {{opponent_name}}

📅 *Plazo de respuesta:* {{response_deadline}}

Ya estamos analizando la oposición. Te contactaremos en breve para explicarte las opciones disponibles y nuestra recomendación.

Por favor, no te preocupes, esto es parte del proceso habitual.

*{{agent_name}}*
{{company_name}}',
'[{"name": "client_name", "label": "Nombre del cliente", "required": true}, {"name": "matter_ref", "label": "Referencia", "required": true}, {"name": "trademark_name", "label": "Nombre de la marca", "required": true}, {"name": "opponent_name", "label": "Nombre del oponente", "required": true}, {"name": "response_deadline", "label": "Plazo de respuesta", "required": true}, {"name": "agent_name", "label": "Nombre del agente", "required": true}, {"name": "company_name", "label": "Nombre de la empresa", "required": true}]',
TRUE, ARRAY['legal', 'oposicion', 'alerta']),

('wa_official_action', 'Acción oficial recibida', 'Notificar requerimiento de oficina', 'whatsapp', 'legal',
'Hola {{client_name}} 📋

Hemos recibido un *requerimiento oficial* de {{office_name}}:

📋 *Expediente:* {{matter_ref}}
📝 *Tipo:* {{action_type}}
📅 *Plazo de respuesta:* {{response_deadline}}

{{action_summary}}

Estamos preparando la respuesta. Te contactaremos si necesitamos información adicional de tu parte.

*{{agent_name}}*',
'[{"name": "client_name", "label": "Nombre del cliente", "required": true}, {"name": "office_name", "label": "Nombre de la oficina", "required": true}, {"name": "matter_ref", "label": "Referencia", "required": true}, {"name": "action_type", "label": "Tipo de acción", "required": true}, {"name": "response_deadline", "label": "Plazo de respuesta", "required": true}, {"name": "action_summary", "label": "Resumen de la acción", "required": false}, {"name": "agent_name", "label": "Nombre del agente", "required": true}]',
TRUE, ARRAY['legal', 'requerimiento', 'oficina']),

('wa_meeting_confirmation_v2', 'Confirmación de reunión', 'Confirmar cita programada', 'whatsapp', 'notificaciones',
'Hola {{client_name}} 📅

Confirmamos tu cita:

📅 *Fecha:* {{meeting_date}}
⏰ *Hora:* {{meeting_time}}
📍 *Lugar:* {{meeting_location}}
👤 *Con:* {{agent_name}}

*Tema:* {{meeting_subject}}

{{meeting_notes}}

Si necesitas cambiar la cita, por favor avísanos con al menos 24h de antelación.

¡Te esperamos!

*{{company_name}}*',
'[{"name": "client_name", "label": "Nombre del cliente", "required": true}, {"name": "meeting_date", "label": "Fecha", "required": true}, {"name": "meeting_time", "label": "Hora", "required": true}, {"name": "meeting_location", "label": "Lugar", "required": true}, {"name": "agent_name", "label": "Nombre del agente", "required": true}, {"name": "meeting_subject", "label": "Tema", "required": true}, {"name": "meeting_notes", "label": "Notas adicionales", "required": false}, {"name": "company_name", "label": "Nombre de la empresa", "required": true}]',
TRUE, ARRAY['reunion', 'cita', 'confirmacion']),

('wa_meeting_reminder_v2', 'Recordatorio de reunión', 'Recordar cita próxima', 'whatsapp', 'notificaciones',
'Hola {{client_name}} 🔔

Te recordamos tu cita de *mañana*:

📅 *Fecha:* {{meeting_date}}
⏰ *Hora:* {{meeting_time}}
📍 *Lugar:* {{meeting_location}}

{{preparation_notes}}

¿Confirmas tu asistencia? Responde *SÍ* o *NO*.

*{{agent_name}}*',
'[{"name": "client_name", "label": "Nombre del cliente", "required": true}, {"name": "meeting_date", "label": "Fecha", "required": true}, {"name": "meeting_time", "label": "Hora", "required": true}, {"name": "meeting_location", "label": "Lugar", "required": true}, {"name": "preparation_notes", "label": "Notas de preparación", "required": false}, {"name": "agent_name", "label": "Nombre del agente", "required": true}]',
TRUE, ARRAY['reunion', 'recordatorio', 'cita']),

('wa_document_request', 'Solicitud de documentos', 'Solicitar documentación al cliente', 'whatsapp', 'notificaciones',
'Hola {{client_name}} 📎

Para continuar con tu expediente *{{matter_ref}}*, necesitamos la siguiente documentación:

{{document_list}}

📅 *Fecha límite:* {{deadline_date}}

Puedes enviarla por aquí (foto clara o PDF) o por email a {{company_email}}.

¿Tienes alguna duda sobre los documentos? Estoy para ayudarte.

*{{agent_name}}*',
'[{"name": "client_name", "label": "Nombre del cliente", "required": true}, {"name": "matter_ref", "label": "Referencia del expediente", "required": true}, {"name": "document_list", "label": "Lista de documentos", "required": true}, {"name": "deadline_date", "label": "Fecha límite", "required": true}, {"name": "company_email", "label": "Email de la empresa", "required": true}, {"name": "agent_name", "label": "Nombre del agente", "required": true}]',
TRUE, ARRAY['documentos', 'solicitud', 'pendiente']),

('wa_document_received_v2', 'Documentos recibidos', 'Confirmar recepción de documentos', 'whatsapp', 'notificaciones',
'Hola {{client_name}} ✅

Confirmamos la recepción de los documentos que nos has enviado.

📋 *Expediente:* {{matter_ref}}
📄 *Documentos recibidos:* {{documents_received}}

Procederemos a revisarlos y te informaremos si necesitamos algo más.

Gracias por tu colaboración.

*{{agent_name}}*',
'[{"name": "client_name", "label": "Nombre del cliente", "required": true}, {"name": "matter_ref", "label": "Referencia del expediente", "required": true}, {"name": "documents_received", "label": "Documentos recibidos", "required": true}, {"name": "agent_name", "label": "Nombre del agente", "required": true}]',
TRUE, ARRAY['documentos', 'recibidos', 'confirmacion']);