/**
 * Regenerate Demo Documents with Real PDF Content
 * Uses jsPDF to create professional PDFs for demo matters
 */

import jsPDF from 'jspdf';
import { supabase } from '@/integrations/supabase/client';

const ORG_ID = 'd0000001-0001-0000-0000-000000000001';
const BUCKET = 'matter-documents';

interface MatterInfo {
  reference?: string;
  title?: string;
  current_phase?: string;
}

interface MatterDocument {
  id: string;
  title?: string | null;
  description?: string | null;
  document_type: string;
  file_name?: string | null;
  matter_id: string;
  created_at: string;
  category?: string | null;
  matters?: MatterInfo | null;
}

interface DocTemplate {
  title: string;
  sections: Array<{ heading?: string; content: string }>;
}

// Professional document templates with real content
function getDocumentTemplate(docType: string, category: string | null, matter: MatterInfo | null, docName: string): DocTemplate {
  const ref = matter?.reference || 'N/A';
  const matterTitle = matter?.title || docName || 'Documento';

  const templates: Record<string, DocTemplate> = {
    case_opening: {
      title: 'FICHA DE APERTURA DE EXPEDIENTE',
      sections: [
        { heading: 'DATOS DEL EXPEDIENTE', content: `Referencia: ${ref}\nTítulo: ${matterTitle}\nTipo: Marca / Patente\nOficina: OEPM / EUIPO / EPO` },
        { heading: 'DATOS DEL CLIENTE', content: 'Empresa: [Ver ficha cliente]\nContacto: [Ver contacto asignado]\nEmail: cliente@empresa.com\nTeléfono: +34 91 XXX XXXX' },
        { heading: 'OBJETO DE LA SOLICITUD', content: `Registro de marca/patente "${matterTitle}" ante la oficina correspondiente para proteger los derechos de propiedad industrial del cliente.` },
        { heading: 'CLASES NICE SOLICITADAS', content: 'Clase 9: Aparatos e instrumentos científicos, software\nClase 35: Publicidad, gestión de negocios\nClase 42: Servicios científicos y tecnológicos' },
        { heading: 'PRÓXIMOS PASOS', content: '1. Realizar búsqueda de anterioridades\n2. Preparar documentación completa\n3. Presentar solicitud ante oficina\n4. Seguimiento del examen formal\n5. Gestión del periodo de oposición' },
        { heading: 'OBSERVACIONES', content: 'Expediente abierto y pendiente de tramitación inicial.\nFecha estimada de resolución: 12-18 meses.' }
      ]
    },

    search_report: {
      title: 'INFORME DE BÚSQUEDA DE ANTERIORIDADES',
      sections: [
        { heading: '1. OBJETO DEL INFORME', content: `Búsqueda exhaustiva de anterioridades para la marca "${matterTitle}".\nReferencia: ${ref}\n\nEl presente informe analiza las marcas registradas y solicitudes pendientes.` },
        { heading: '2. BASES DE DATOS CONSULTADAS', content: '• OEPM - Base de datos de marcas nacionales\n• TMView - Base europea de marcas de la EUIPO\n• WIPO Global Brand Database\n• Registros nacionales de países clave' },
        { heading: '3. CRITERIOS DE BÚSQUEDA', content: 'Búsqueda fonética, visual y conceptual aplicando:\n• Similitud fonética > 70%\n• Similitud visual > 60%\n• Productos/servicios idénticos o similares' },
        { heading: '4. RESULTADOS DEL ANÁLISIS', content: 'Se han identificado las siguientes marcas potencialmente conflictivas:\n\nMARCA-A (Empresa Alpha) - Clases 9, 35 - Riesgo: Bajo\nMARCA-B (Empresa Beta) - Clase 42 - Riesgo: Medio\nMARCA-C (Empresa Gamma) - Clase 9 - Riesgo: Bajo' },
        { heading: '5. CONCLUSIÓN', content: 'NIVEL DE RIESGO GENERAL: BAJO\n\nLa marca solicitada presenta diferencias suficientes. Se recomienda proceder con la solicitud.' },
        { heading: '6. RECOMENDACIONES', content: '• Proceder con la solicitud en las clases indicadas\n• Monitorizar marcas durante oposición\n• Considerar extensión a mercados internacionales' }
      ]
    },

    power_of_attorney: {
      title: 'PODER DE REPRESENTACIÓN',
      sections: [
        { content: 'PODER DE REPRESENTACIÓN PARA ACTUACIONES\nANTE OFICINAS DE PROPIEDAD INDUSTRIAL\n\nExpediente: ' + ref },
        { heading: 'PODERDANTE', content: 'D./Dña. [Nombre del representante legal]\nen calidad de [Cargo] de [Nombre de la empresa]\ncon NIF/CIF [Número]\ny domicilio social en [Dirección completa]' },
        { heading: 'OTORGA PODER', content: 'a favor de MERIDIAN IP CONSULTING S.L.\ncon CIF B-12345678\ny en particular a D. Carlos Mendoza Ruiz\ncolegiado nº 1234 del Ilustre Colegio\nde Agentes de la Propiedad Industrial' },
        { heading: 'FACULTADES', content: '1. Solicitar el registro de marcas, patentes y otros derechos\n2. Presentar recursos, alegaciones y contestaciones\n3. Recibir notificaciones oficiales\n4. Realizar actos necesarios ante OEPM, EUIPO, EPO, WIPO\n5. Desistir, transigir y renunciar derechos\n6. Cobrar cantidades y otorgar recibos' },
        { heading: 'VIGENCIA', content: 'Este poder es válido hasta su revocación expresa.\n\n\nEn Madrid, a __ de __________ de 2026\n\n\n\nFdo.: ________________________\n[Nombre del representante legal]' }
      ]
    },

    filing_receipt: {
      title: 'ACUSE DE RECIBO DE SOLICITUD',
      sections: [
        { heading: 'OFICINA', content: 'OEPM - Oficina Española de Patentes y Marcas\nPaseo de la Castellana, 75 - 28046 Madrid' },
        { heading: 'DATOS DE LA SOLICITUD', content: `Número de solicitud: M-2026-XXXXXX\nFecha de presentación: ${new Date().toLocaleDateString('es-ES')}\nSolicitante: [Nombre empresa]\nRepresentante: Meridian IP Consulting S.L.\nReferencia: ${ref}` },
        { heading: 'MARCA SOLICITADA', content: `Denominación: ${matterTitle}\nTipo: Denominativa / Mixta\nClases Nice: 9, 35, 42` },
        { heading: 'TASAS ABONADAS', content: 'Tasa de solicitud base: 125,00 €\nTasa por clase adicional (x2): 100,00 €\nTotal: 225,00 € - Estado: PAGADA' },
        { heading: 'PRÓXIMAS ETAPAS', content: '• Examen formal: 1-2 meses\n• Publicación en BOPI: 3-4 meses\n• Periodo de oposición: 2 meses\n• Concesión estimada: 8-12 meses' }
      ]
    },

    publication: {
      title: 'PUBLICACIÓN EN BOLETÍN OFICIAL',
      sections: [
        { heading: 'DATOS DE PUBLICACIÓN', content: `Boletín: BOPI - Boletín Oficial de la Propiedad Industrial\nNúmero: 2026/XXXX\nFecha: ${new Date().toLocaleDateString('es-ES')}` },
        { heading: 'MARCA PUBLICADA', content: `Denominación: ${matterTitle}\nNúmero solicitud: M-2026-XXXXXX\nReferencia: ${ref}\nClases Nice: 9, 35, 42\nSolicitante: [Empresa cliente]` },
        { heading: 'PERIODO DE OPOSICIÓN', content: `Inicio: ${new Date().toLocaleDateString('es-ES')}\nFin: [+2 meses]\nDuración: 2 meses según Ley de Marcas\n\nCualquier tercero puede presentar oposición durante este periodo.` },
        { heading: 'ACCIONES RECOMENDADAS', content: '• Vigilancia activa de posibles oposiciones\n• Preparación de argumentos de defensa\n• Comunicación inmediata si se recibe oposición' }
      ]
    },

    certificate: {
      title: 'CERTIFICADO DE REGISTRO',
      sections: [
        { content: '══════════════════════════════════════\n      CERTIFICADO OFICIAL DE REGISTRO\n   OFICINA ESPAÑOLA DE PATENTES Y MARCAS\n══════════════════════════════════════' },
        { heading: 'DATOS DEL REGISTRO', content: `Denominación: ${matterTitle}\nNúmero de registro: ${Date.now().toString().slice(-7)}\nTitular: [Nombre de la empresa]\nClases Nice: 9, 35, 42` },
        { heading: 'FECHAS', content: `Fecha de solicitud: [fecha original]\nFecha de concesión: ${new Date().toLocaleDateString('es-ES')}\nFecha de caducidad: [+10 años]` },
        { heading: 'CERTIFICACIÓN', content: 'Este certificado acredita la concesión del derecho de propiedad industrial conforme a la Ley 17/2001 de Marcas.\n\nEl presente registro confiere a su titular el derecho exclusivo a utilizar la marca en el tráfico económico.\n\n\n[Firma y sello de la Oficina]' }
      ]
    },

    technical: {
      title: 'DOCUMENTACIÓN TÉCNICA',
      sections: [
        { heading: '1. CAMPO TÉCNICO', content: `La presente invención "${matterTitle}" se refiere al campo de las tecnologías de la información y comunicaciones.` },
        { heading: '2. ESTADO DE LA TÉCNICA', content: 'El estado actual presenta las siguientes limitaciones:\n• Procesos manuales y susceptibles de errores\n• Falta de integración entre sistemas\n• Tiempos de procesamiento elevados' },
        { heading: '3. DESCRIPCIÓN DE LA INVENCIÓN', content: 'La solución propuesta resuelve los problemas mediante:\n• Automatización inteligente de procesos\n• Arquitectura modular e integrable\n• Algoritmos optimizados de procesamiento' },
        { heading: '4. REIVINDICACIONES', content: 'Reivindicación 1: Sistema caracterizado por...\nReivindicación 2: Método que comprende...\nReivindicación 3: Programa de ordenador que...' },
        { heading: '5. DIBUJOS', content: 'Figura 1: Diagrama de bloques\nFigura 2: Diagrama de flujo\nFigura 3: Interfaz de usuario\n\n[Ver anexo con dibujos técnicos]' }
      ]
    },

    opposition: {
      title: 'ESCRITO DE OPOSICIÓN',
      sections: [
        { heading: 'DIRIGIDO A', content: 'OFICINA ESPAÑOLA DE PATENTES Y MARCAS\nDepartamento de Signos Distintivos' },
        { heading: 'OPONENTE', content: `[Empresa titular de derechos anteriores]\nRepresentado por: Meridian IP Consulting S.L.\nReferencia: ${ref}` },
        { heading: 'SOLICITUD OPUESTA', content: 'Número: M-2026-XXXXXX\nDenominación: [marca opuesta]\nSolicitante: [empresa contraria]' },
        { heading: 'FUNDAMENTOS', content: '1. RIESGO DE CONFUSIÓN (Art. 6.1.b LM)\n   • Similitud fonética significativa\n   • Similitud visual apreciable\n   • Identidad de productos/servicios\n\n2. APROVECHAMIENTO DE REPUTACIÓN (Art. 8 LM)' },
        { heading: 'PRUEBAS', content: 'Doc. 1: Certificado de registro marca anterior\nDoc. 2: Extractos de facturación\nDoc. 3: Material publicitario\nDoc. 4: Estudios de mercado' },
        { heading: 'PETICIÓN', content: 'Se solicita la DENEGACIÓN íntegra de la solicitud de marca.\nSubsidiariamente, denegación parcial en clases conflictivas.' }
      ]
    },

    office_action: {
      title: 'RESOLUCIÓN / REQUERIMIENTO OFICIAL',
      sections: [
        { heading: 'OFICINA EMISORA', content: 'OEPM - Subdirección General de Signos Distintivos' },
        { heading: 'DATOS DEL EXPEDIENTE', content: `Número: ${ref}\nMarca: ${matterTitle}\nRepresentante: Meridian IP Consulting S.L.` },
        { heading: 'REQUERIMIENTO', content: 'Se requiere al representante para que en plazo:\n\n1. Aporte traducción jurada de documentos de prioridad\n2. Subsane deficiencia en representación gráfica\n3. Aclare especificación de productos/servicios\n4. Aporte poder de representación legalizado' },
        { heading: 'PLAZO', content: `Plazo: 2 meses desde notificación\n\nADVERTENCIA: El incumplimiento dará lugar al archivo del expediente.` },
        { heading: 'RECURSOS', content: '• Recurso de alzada en plazo de 1 mes\n• Recurso contencioso-administrativo' }
      ]
    },

    evidence: {
      title: 'INFORME DE VIGILANCIA',
      sections: [
        { heading: 'ALERTA DE VIGILANCIA', content: `TIPO: Similitud de marca detectada\nPRIORIDAD: MEDIA\nFECHA: ${new Date().toLocaleDateString('es-ES')}` },
        { heading: 'MARCA VIGILADA', content: `Denominación: ${matterTitle}\nReferencia: ${ref}\nTitular: [Cliente]` },
        { heading: 'MARCA DETECTADA', content: 'Denominación: [marca similar]\nSolicitante: [empresa tercera]\nOficina: EUIPO\nNº solicitud: 018XXXXXXX\nClases: 9, 35' },
        { heading: 'ANÁLISIS DE SIMILITUD', content: 'Similitud fonética: 75%\nSimilitud visual: 60%\nSimilitud conceptual: 40%\nCoincidencia clases: 2/3\n\nNIVEL DE RIESGO: MEDIO' },
        { heading: 'RECOMENDACIONES', content: 'ACCIÓN SUGERIDA: Monitorizar / Valorar oposición\n\n1. Vigilar evolución de la solicitud\n2. Preparar argumentos de oposición preventiva\n3. Documentar uso intensivo de nuestra marca' }
      ]
    },

    generated: {
      title: 'DOCUMENTO GENERADO',
      sections: [
        { heading: 'INFORMACIÓN', content: `Expediente: ${ref}\nAsunto: ${matterTitle}` },
        { content: 'Documento generado automáticamente por IP-NEXUS.\n\nContiene información relevante sobre el expediente y su estado actual de tramitación.' }
      ]
    },

    uploaded: {
      title: 'DOCUMENTO ADJUNTADO',
      sections: [
        { heading: 'DATOS', content: `Expediente: ${ref}\nAsunto: ${matterTitle}` },
        { content: 'Documento adjuntado al expediente para archivo y consulta.' }
      ]
    },

    received: {
      title: 'DOCUMENTO RECIBIDO',
      sections: [
        { heading: 'ORIGEN', content: 'Documento recibido de oficina o tercero' },
        { heading: 'EXPEDIENTE', content: `Referencia: ${ref}\nAsunto: ${matterTitle}` },
        { content: 'Documento recibido y archivado para gestión.' }
      ]
    },

    sent: {
      title: 'DOCUMENTO ENVIADO',
      sections: [
        { heading: 'DESTINATARIO', content: 'Oficina de Propiedad Industrial / Cliente' },
        { heading: 'EXPEDIENTE', content: `Referencia: ${ref}\nAsunto: ${matterTitle}` },
        { content: 'Copia del documento enviado para archivo interno.' }
      ]
    },

    internal: {
      title: 'DOCUMENTO INTERNO',
      sections: [
        { heading: 'CLASIFICACIÓN', content: 'USO INTERNO - CONFIDENCIAL' },
        { heading: 'EXPEDIENTE', content: `Referencia: ${ref}\nAsunto: ${matterTitle}` },
        { content: 'Documento de uso interno. No distribuir.' }
      ]
    }
  };

  // Determine which template to use
  const key = category || docType || 'generated';
  return templates[key] || templates.generated;
}

function generatePDFDocument(doc: MatterDocument): Blob {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = { left: 20, right: 20, top: 20, bottom: 25 };
  const contentWidth = pageWidth - margin.left - margin.right;
  let currentY = margin.top;

  // Get template
  const docName = doc.title || doc.description || 'Documento';
  const template = getDocumentTemplate(doc.document_type, doc.category || null, doc.matters || null, docName);

  // === HEADER ===
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(31, 41, 55);
  pdf.text('MERIDIAN IP CONSULTING S.L.', margin.left, currentY);

  // Logo placeholder
  pdf.setDrawColor(200, 200, 200);
  pdf.setFillColor(248, 250, 252);
  pdf.roundedRect(pageWidth - margin.right - 22, currentY - 6, 22, 12, 1, 1, 'FD');
  pdf.setFontSize(6);
  pdf.setTextColor(150, 150, 150);
  pdf.text('LOGO', pageWidth - margin.right - 11, currentY, { align: 'center' });

  // Reference and date
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(107, 114, 128);
  currentY += 5;
  pdf.text(`Ref: ${doc.matters?.reference || doc.id.slice(0, 8)}`, margin.left, currentY);
  pdf.text(`Fecha: ${new Date(doc.created_at).toLocaleDateString('es-ES')}`, pageWidth - margin.right, currentY, { align: 'right' });

  currentY += 12;

  // === TITLE ===
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(31, 41, 55);
  const titleLines = pdf.splitTextToSize(template.title, contentWidth);
  pdf.text(titleLines, pageWidth / 2, currentY, { align: 'center' });
  currentY += titleLines.length * 6 + 4;

  // Separator line
  pdf.setDrawColor(59, 130, 246);
  pdf.setLineWidth(0.5);
  pdf.line(margin.left, currentY, pageWidth - margin.right, currentY);
  currentY += 10;

  // === SECTIONS ===
  for (const section of template.sections) {
    // Check if we need a new page
    if (currentY > pageHeight - margin.bottom - 30) {
      addFooter(pdf, pageWidth, pageHeight, margin, doc.matters?.reference);
      pdf.addPage();
      currentY = margin.top;
    }

    // Section heading
    if (section.heading) {
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(59, 130, 246);
      pdf.text(section.heading, margin.left, currentY);
      currentY += 5;
    }

    // Section content
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(55, 65, 81);

    const lines = pdf.splitTextToSize(section.content, contentWidth);
    for (const line of lines) {
      if (currentY > pageHeight - margin.bottom - 15) {
        addFooter(pdf, pageWidth, pageHeight, margin, doc.matters?.reference);
        pdf.addPage();
        currentY = margin.top;
      }
      pdf.text(line, margin.left, currentY);
      currentY += 4.5;
    }

    currentY += 6;
  }

  // Add footer to last page
  addFooter(pdf, pageWidth, pageHeight, margin, doc.matters?.reference);

  return pdf.output('blob');
}

function addFooter(pdf: jsPDF, pageWidth: number, pageHeight: number, margin: { bottom: number; left: number; right: number }, ref?: string) {
  const footerY = pageHeight - margin.bottom + 8;
  
  // Footer line
  pdf.setDrawColor(229, 231, 235);
  pdf.setLineWidth(0.3);
  pdf.line(margin.left, footerY - 5, pageWidth - margin.right, footerY - 5);
  
  // Footer text
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(156, 163, 175);
  pdf.text('Generado por IP-NEXUS', margin.left, footerY);
  pdf.text(`${new Date().toLocaleDateString('es-ES')} · Meridian IP Consulting S.L.`, pageWidth - margin.right, footerY, { align: 'right' });
  
  // Page number
  const pageCount = pdf.getNumberOfPages();
  const currentPage = pdf.getCurrentPageInfo().pageNumber;
  pdf.text(`Página ${currentPage} de ${pageCount}`, pageWidth / 2, footerY, { align: 'center' });
}

export async function regenerateAllDemoDocuments(
  onProgress?: (current: number, total: number, docTitle: string) => void
): Promise<{ success: number; failed: number; errors: string[] }> {
  const errors: string[] = [];
  let success = 0;
  let failed = 0;

  // Fetch all demo documents
  const { data: docs, error } = await supabase
    .from('matter_documents')
    .select('id, title, description, document_type, category, file_name, matter_id, created_at, matters(reference, title, current_phase)')
    .eq('organization_id', ORG_ID);

  if (error) {
    console.error('Error fetching documents:', error);
    return { success: 0, failed: 0, errors: [error.message] };
  }

  if (!docs || docs.length === 0) {
    return { success: 0, failed: 0, errors: ['No documents found'] };
  }

  console.log(`🔄 Regenerating ${docs.length} demo documents with jsPDF...`);

  for (let i = 0; i < docs.length; i++) {
    const doc = docs[i] as unknown as MatterDocument;
    const docTitle = doc.title || doc.description || `Document ${i + 1}`;
    
    try {
      onProgress?.(i + 1, docs.length, docTitle);
      
      // Generate PDF using jsPDF
      const pdfBlob = generatePDFDocument(doc);
      
      // Create file path
      const fileName = doc.file_name || `${doc.id}.pdf`;
      const filePath = `${ORG_ID}/${doc.matter_id}/${fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`}`;
      
      // Upload to Storage with upsert
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(filePath, pdfBlob, {
          contentType: 'application/pdf',
          upsert: true,
        });

      if (uploadError) {
        console.error(`❌ Upload error for ${docTitle}:`, uploadError);
        errors.push(`${docTitle}: ${uploadError.message}`);
        failed++;
        continue;
      }

      // Update database record
      const { error: updateError } = await supabase
        .from('matter_documents')
        .update({
          file_path: filePath,
          storage_path: filePath,
          file_size: pdfBlob.size,
          mime_type: 'application/pdf',
        })
        .eq('id', doc.id);

      if (updateError) {
        console.error(`❌ DB update error for ${docTitle}:`, updateError);
        errors.push(`${docTitle}: DB update failed`);
        failed++;
        continue;
      }

      console.log(`✅ ${docTitle} (${(pdfBlob.size / 1024).toFixed(1)} KB)`);
      success++;

    } catch (err) {
      console.error(`❌ Error with ${docTitle}:`, err);
      errors.push(`${docTitle}: ${err instanceof Error ? err.message : 'Unknown error'}`);
      failed++;
    }
  }

  console.log(`\n📊 Results: ${success} success, ${failed} failed`);
  return { success, failed, errors };
}

export { generatePDFDocument };
