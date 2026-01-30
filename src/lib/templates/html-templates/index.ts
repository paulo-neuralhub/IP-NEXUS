// src/lib/templates/html-templates/index.ts
// Export all template collections

export { INVOICE_TEMPLATES } from './invoice-templates';
export { QUOTE_TEMPLATES } from './quote-templates';
export { LETTER_TEMPLATES } from './letter-templates';
export { CONTRACT_TEMPLATES } from './contract-templates';

import { INVOICE_TEMPLATES } from './invoice-templates';
import { QUOTE_TEMPLATES } from './quote-templates';
import { LETTER_TEMPLATES } from './letter-templates';
import { CONTRACT_TEMPLATES } from './contract-templates';
import { DocumentStyle, DocumentTemplateType, DOCUMENT_STYLES, DOCUMENT_TYPE_LABELS } from '../document-template-styles';

export interface TemplateDefinition {
  code: string;
  name: string;
  description: string;
  document_type: DocumentTemplateType;
  style: DocumentStyle;
  content_html: string;
  category: string;
}

// Generate all template definitions
export function getAllTemplateDefinitions(): TemplateDefinition[] {
  const templates: TemplateDefinition[] = [];
  const styles: DocumentStyle[] = ['classic', 'modern', 'minimal', 'corporate', 'elegant'];
  const types: DocumentTemplateType[] = ['invoice', 'quote', 'letter', 'contract'];

  const templateMaps: Record<DocumentTemplateType, Record<string, string>> = {
    invoice: INVOICE_TEMPLATES,
    quote: QUOTE_TEMPLATES,
    letter: LETTER_TEMPLATES,
    contract: CONTRACT_TEMPLATES,
  };

  for (const docType of types) {
    for (const style of styles) {
      const styleInfo = DOCUMENT_STYLES[style];
      const typeLabel = DOCUMENT_TYPE_LABELS[docType];
      const content = templateMaps[docType][style];

      if (content) {
        templates.push({
          code: `${docType.toUpperCase()}_${style.toUpperCase()}`,
          name: `${typeLabel} ${styleInfo.name}`,
          description: `${typeLabel} con estilo ${styleInfo.name.toLowerCase()}. ${styleInfo.description}`,
          document_type: docType,
          style: style,
          content_html: content,
          category: docType === 'invoice' || docType === 'quote' ? 'finance' : 'legal',
        });
      }
    }
  }

  return templates;
}

// Get template by type and style
export function getTemplateByTypeAndStyle(
  docType: DocumentTemplateType,
  style: DocumentStyle
): string | null {
  const templateMaps: Record<DocumentTemplateType, Record<string, string>> = {
    invoice: INVOICE_TEMPLATES,
    quote: QUOTE_TEMPLATES,
    letter: LETTER_TEMPLATES,
    contract: CONTRACT_TEMPLATES,
  };

  return templateMaps[docType]?.[style] || null;
}

// Get all templates for a document type
export function getTemplatesForType(docType: DocumentTemplateType): Record<DocumentStyle, string> {
  const templateMaps: Record<DocumentTemplateType, Record<string, string>> = {
    invoice: INVOICE_TEMPLATES,
    quote: QUOTE_TEMPLATES,
    letter: LETTER_TEMPLATES,
    contract: CONTRACT_TEMPLATES,
  };

  return templateMaps[docType] as Record<DocumentStyle, string>;
}
