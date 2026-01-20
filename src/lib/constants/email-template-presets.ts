// ============================================================
// IP-NEXUS MARKETING - EMAIL TEMPLATE PRESETS FOR PI
// Prompt: Marketing module - Plantillas prediseñadas
// ============================================================

export interface EmailTemplatePreset {
  id: string;
  name: string;
  category: string;
  description: string;
  subject: string;
  previewText?: string;
  blocks: EmailBlock[];
}

export interface EmailBlock {
  type: 'header' | 'text' | 'image' | 'button' | 'divider' | 'columns' | 'footer' | 'logo' | 'signature' | 'disclaimer';
  content?: string;
  props?: Record<string, any>;
}

// Plantillas prediseñadas para PI según el documento
export const EMAIL_TEMPLATE_PRESETS: EmailTemplatePreset[] = [
  {
    id: 'newsletter-pi',
    name: 'Newsletter Mensual PI',
    category: 'newsletter',
    description: 'Boletín informativo mensual sobre novedades en propiedad intelectual',
    subject: 'Newsletter PI - {{month}} {{year}}',
    previewText: 'Las últimas novedades en propiedad intelectual',
    blocks: [
      { type: 'logo', props: { align: 'center' } },
      { type: 'header', content: 'Newsletter de Propiedad Intelectual', props: { level: 1, align: 'center' } },
      { type: 'text', content: 'Estimado/a {{contact.name}},\n\nTe presentamos las novedades más relevantes del mes en el ámbito de la propiedad intelectual.' },
      { type: 'divider' },
      { type: 'header', content: '📋 Novedades Legislativas', props: { level: 2 } },
      { type: 'text', content: '[Contenido sobre cambios legislativos]' },
      { type: 'header', content: '⚖️ Jurisprudencia Destacada', props: { level: 2 } },
      { type: 'text', content: '[Resumen de casos relevantes]' },
      { type: 'header', content: '📊 Estadísticas del Mes', props: { level: 2 } },
      { type: 'text', content: '[Datos y métricas de interés]' },
      { type: 'button', content: 'Ver Newsletter Completa', props: { url: '{{newsletter_url}}', align: 'center' } },
      { type: 'divider' },
      { type: 'signature' },
      { type: 'disclaimer', content: 'Este email es informativo y no constituye asesoramiento legal.' },
      { type: 'footer' }
    ]
  },
  {
    id: 'alerta-vencimiento',
    name: 'Alerta de Vencimiento',
    category: 'transactional',
    description: 'Notificación de próximo vencimiento de derecho de PI',
    subject: '⚠️ Vencimiento próximo: {{matter.reference}}',
    previewText: 'Tu derecho de PI requiere atención',
    blocks: [
      { type: 'logo', props: { align: 'left' } },
      { type: 'header', content: 'Aviso de Vencimiento', props: { level: 1 } },
      { type: 'text', content: 'Estimado/a {{contact.name}},\n\nTe informamos que el siguiente derecho de propiedad intelectual tiene un vencimiento próximo:' },
      { type: 'divider' },
      { type: 'text', content: '**Referencia:** {{matter.reference}}\n**Tipo:** {{matter.type}}\n**Denominación:** {{matter.title}}\n**Fecha de vencimiento:** {{deadline.date}}\n**Días restantes:** {{deadline.days_remaining}}', props: { style: 'highlight' } },
      { type: 'divider' },
      { type: 'text', content: 'Es importante actuar antes de la fecha indicada para mantener la protección de tus derechos.' },
      { type: 'button', content: 'Ver Expediente', props: { url: '{{matter_url}}', variant: 'primary' } },
      { type: 'button', content: 'Iniciar Renovación', props: { url: '{{renewal_url}}', variant: 'secondary' } },
      { type: 'divider' },
      { type: 'signature' },
      { type: 'disclaimer', content: 'Este es un recordatorio automático. Para más información, contacta con tu asesor.' },
      { type: 'footer' }
    ]
  },
  {
    id: 'confirmacion-registro',
    name: 'Confirmación Registro Marca',
    category: 'transactional',
    description: 'Confirmación de presentación de solicitud de marca',
    subject: '✅ Solicitud presentada: {{matter.title}}',
    previewText: 'Tu solicitud de marca ha sido presentada',
    blocks: [
      { type: 'logo', props: { align: 'left' } },
      { type: 'header', content: '¡Solicitud Presentada!', props: { level: 1 } },
      { type: 'text', content: 'Estimado/a {{contact.name}},\n\nNos complace informarte que tu solicitud de registro de marca ha sido presentada correctamente.' },
      { type: 'divider' },
      { type: 'text', content: '**Denominación:** {{matter.title}}\n**Número de solicitud:** {{matter.application_number}}\n**Oficina:** {{matter.office}}\n**Fecha de presentación:** {{matter.filing_date}}\n**Clases:** {{matter.classes}}', props: { style: 'highlight' } },
      { type: 'header', content: 'Próximos Pasos', props: { level: 2 } },
      { type: 'text', content: '1. La oficina examinará la solicitud\n2. Se publicará en el boletín oficial\n3. Terceros podrán presentar oposiciones\n4. Si no hay oposiciones, se concederá el registro' },
      { type: 'button', content: 'Seguir Estado', props: { url: '{{matter_url}}', align: 'center' } },
      { type: 'divider' },
      { type: 'signature' },
      { type: 'footer' }
    ]
  },
  {
    id: 'informe-vigilancia',
    name: 'Informe de Vigilancia',
    category: 'report',
    description: 'Resumen de resultados de vigilancia de marcas',
    subject: '🔍 Informe de Vigilancia - {{period}}',
    previewText: 'Resumen de tu vigilancia de marcas',
    blocks: [
      { type: 'logo', props: { align: 'left' } },
      { type: 'header', content: 'Informe de Vigilancia', props: { level: 1 } },
      { type: 'text', content: 'Estimado/a {{contact.name}},\n\nTe presentamos el resumen de vigilancia del período {{period}}.' },
      { type: 'divider' },
      { type: 'header', content: '📊 Resumen', props: { level: 2 } },
      { type: 'text', content: '• **Marcas vigiladas:** {{stats.watchlists}}\n• **Resultados encontrados:** {{stats.results}}\n• **Alertas críticas:** {{stats.critical}}\n• **Alertas de riesgo alto:** {{stats.high}}' },
      { type: 'header', content: '⚠️ Alertas Críticas', props: { level: 2 } },
      { type: 'text', content: '{{#each critical_alerts}}\n• {{trademark}} - Similitud {{similarity}}%\n{{/each}}' },
      { type: 'button', content: 'Ver Informe Completo', props: { url: '{{report_url}}', align: 'center' } },
      { type: 'divider' },
      { type: 'text', content: 'Si identificas alguna marca que requiera acción, no dudes en contactarnos.' },
      { type: 'signature' },
      { type: 'footer' }
    ]
  },
  {
    id: 'propuesta-comercial',
    name: 'Propuesta Comercial',
    category: 'sales',
    description: 'Propuesta de servicios de PI a potencial cliente',
    subject: 'Propuesta de Servicios - {{company.name}}',
    previewText: 'Tu propuesta personalizada de servicios PI',
    blocks: [
      { type: 'logo', props: { align: 'left' } },
      { type: 'header', content: 'Propuesta de Servicios', props: { level: 1 } },
      { type: 'text', content: 'Estimado/a {{contact.name}},\n\nGracias por tu interés en nuestros servicios. A continuación te presentamos nuestra propuesta personalizada:' },
      { type: 'divider' },
      { type: 'header', content: 'Servicios Propuestos', props: { level: 2 } },
      { type: 'text', content: '{{services_description}}' },
      { type: 'header', content: 'Inversión', props: { level: 2 } },
      { type: 'text', content: '{{pricing_table}}', props: { style: 'highlight' } },
      { type: 'header', content: '¿Por qué elegirnos?', props: { level: 2 } },
      { type: 'text', content: '• Experiencia especializada en PI\n• Tecnología IP-NEXUS incluida\n• Equipo multidisciplinar\n• Cobertura internacional' },
      { type: 'button', content: 'Aceptar Propuesta', props: { url: '{{accept_url}}', variant: 'primary' } },
      { type: 'button', content: 'Agendar Llamada', props: { url: '{{meeting_url}}', variant: 'secondary' } },
      { type: 'divider' },
      { type: 'text', content: 'Esta propuesta es válida hasta {{expiry_date}}.' },
      { type: 'signature' },
      { type: 'footer' }
    ]
  },
  {
    id: 'recordatorio-renovacion',
    name: 'Recordatorio Renovación',
    category: 'reminder',
    description: 'Recordatorio de renovación de derechos de PI',
    subject: '🔄 Renovación pendiente: {{matter.reference}}',
    previewText: 'Es hora de renovar tu derecho de PI',
    blocks: [
      { type: 'logo', props: { align: 'left' } },
      { type: 'header', content: 'Recordatorio de Renovación', props: { level: 1 } },
      { type: 'text', content: 'Estimado/a {{contact.name}},\n\nTe recordamos que es necesario proceder a la renovación del siguiente derecho:' },
      { type: 'divider' },
      { type: 'text', content: '**{{matter.title}}**\n\n• Referencia: {{matter.reference}}\n• Tipo: {{matter.type}}\n• Fecha límite: {{renewal.deadline}}\n• Coste estimado: {{renewal.cost}}€', props: { style: 'highlight' } },
      { type: 'text', content: '**¿Qué necesitas hacer?**\n\n1. Confirmar que deseas renovar\n2. Aprobar el presupuesto\n3. Nosotros nos encargamos del resto' },
      { type: 'button', content: 'Confirmar Renovación', props: { url: '{{confirm_url}}', variant: 'primary', align: 'center' } },
      { type: 'divider' },
      { type: 'text', content: 'Si no deseas renovar este derecho, por favor comunícanoslo.' },
      { type: 'signature' },
      { type: 'footer' }
    ]
  },
  {
    id: 'bienvenida-cliente',
    name: 'Bienvenida Nuevo Cliente',
    category: 'onboarding',
    description: 'Email de bienvenida para nuevos clientes',
    subject: '🎉 ¡Bienvenido/a a {{company.name}}!',
    previewText: 'Comienza tu experiencia con nosotros',
    blocks: [
      { type: 'logo', props: { align: 'center' } },
      { type: 'header', content: '¡Bienvenido/a!', props: { level: 1, align: 'center' } },
      { type: 'text', content: 'Estimado/a {{contact.name}},\n\nEs un placer darte la bienvenida. Estamos encantados de que hayas confiado en nosotros para la gestión de tu propiedad intelectual.' },
      { type: 'divider' },
      { type: 'header', content: '¿Qué te espera?', props: { level: 2 } },
      { type: 'text', content: '• **Portal de cliente:** Acceso 24/7 a tus expedientes\n• **Alertas automáticas:** Nunca te pierdas un vencimiento\n• **Informes personalizados:** Tu cartera de PI a un clic\n• **Equipo dedicado:** Siempre disponible para ayudarte' },
      { type: 'button', content: 'Acceder al Portal', props: { url: '{{portal_url}}', variant: 'primary', align: 'center' } },
      { type: 'divider' },
      { type: 'header', content: 'Tu equipo', props: { level: 2 } },
      { type: 'text', content: 'Tu gestor asignado es **{{manager.name}}**. Puedes contactarle en {{manager.email}} o {{manager.phone}}.' },
      { type: 'signature' },
      { type: 'footer' }
    ]
  },
  {
    id: 'felicitacion-concesion',
    name: 'Felicitación Concesión',
    category: 'celebration',
    description: 'Felicitación por concesión de derecho de PI',
    subject: '🎊 ¡Enhorabuena! Tu marca ha sido concedida',
    previewText: 'Tu derecho de PI ha sido registrado',
    blocks: [
      { type: 'logo', props: { align: 'center' } },
      { type: 'image', props: { src: '{{celebration_image}}', alt: 'Celebración', align: 'center' } },
      { type: 'header', content: '¡Felicidades!', props: { level: 1, align: 'center' } },
      { type: 'text', content: 'Estimado/a {{contact.name}},\n\n¡Excelentes noticias! Tu marca **{{matter.title}}** ha sido concedida y registrada oficialmente.' },
      { type: 'divider' },
      { type: 'text', content: '**Datos del registro:**\n\n• Número de registro: {{matter.registration_number}}\n• Fecha de concesión: {{matter.grant_date}}\n• Vigencia hasta: {{matter.expiry_date}}\n• Clases: {{matter.classes}}', props: { style: 'highlight' } },
      { type: 'header', content: '¿Y ahora qué?', props: { level: 2 } },
      { type: 'text', content: '1. **Usa tu marca:** Añade ® junto a tu marca\n2. **Vigila el mercado:** Activa alertas de vigilancia\n3. **Planifica renovaciones:** Te avisaremos con antelación' },
      { type: 'button', content: 'Descargar Certificado', props: { url: '{{certificate_url}}', variant: 'primary', align: 'center' } },
      { type: 'divider' },
      { type: 'signature' },
      { type: 'footer' }
    ]
  }
];

// Función para obtener los bloques como HTML básico
export function blocksToHtml(blocks: EmailBlock[]): string {
  return blocks.map(block => {
    switch (block.type) {
      case 'header':
        const level = block.props?.level || 1;
        return `<h${level} style="margin: 20px 0 10px; color: #1E293B;">${block.content}</h${level}>`;
      case 'text':
        return `<p style="margin: 10px 0; line-height: 1.6; color: #334155;">${block.content?.replace(/\n/g, '<br/>')}</p>`;
      case 'button':
        return `<a href="${block.props?.url || '#'}" style="display: inline-block; padding: 12px 24px; background: #3B82F6; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0;">${block.content}</a>`;
      case 'divider':
        return '<hr style="border: none; border-top: 1px solid #E2E8F0; margin: 20px 0;" />';
      case 'logo':
        return '<div style="text-align: center; margin: 20px 0;"><img src="{{company.logo}}" alt="Logo" style="max-height: 50px;" /></div>';
      case 'signature':
        return '<div style="margin: 20px 0; padding: 15px; background: #F8FAFC; border-radius: 8px;"><strong>{{user.name}}</strong><br/>{{user.title}}<br/>{{company.name}}</div>';
      case 'disclaimer':
        return `<p style="font-size: 12px; color: #94A3B8; margin: 20px 0; font-style: italic;">${block.content}</p>`;
      case 'footer':
        return '<div style="text-align: center; padding: 20px; border-top: 1px solid #E2E8F0; margin-top: 20px; font-size: 12px; color: #94A3B8;">{{company.name}} • {{company.address}}<br/>© {{year}} Todos los derechos reservados</div>';
      default:
        return '';
    }
  }).join('\n');
}

export default EMAIL_TEMPLATE_PRESETS;
