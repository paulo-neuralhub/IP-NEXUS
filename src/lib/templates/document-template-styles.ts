// src/lib/templates/document-template-styles.ts
// Sistema de estilos visuales para plantillas de documentos

export type DocumentStyle = 'classic' | 'modern' | 'minimal' | 'corporate' | 'elegant';
export type DocumentTemplateType = 'invoice' | 'quote' | 'letter' | 'contract';

export interface StyleDefinition {
  code: DocumentStyle;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    muted: string;
    background: string;
    border: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  borderRadius: string;
  headerStyle: 'full-width' | 'centered' | 'minimal' | 'sidebar' | 'elegant';
}

export const DOCUMENT_STYLES: Record<DocumentStyle, StyleDefinition> = {
  classic: {
    code: 'classic',
    name: 'Clásico',
    description: 'Diseño tradicional y profesional con líneas limpias',
    colors: {
      primary: '#1E40AF',
      secondary: '#1E3A5F',
      accent: '#3B82F6',
      text: '#1F2937',
      muted: '#6B7280',
      background: '#FFFFFF',
      border: '#E5E7EB',
    },
    fonts: {
      heading: 'Georgia, serif',
      body: 'Arial, sans-serif',
    },
    borderRadius: '4px',
    headerStyle: 'full-width',
  },
  modern: {
    code: 'modern',
    name: 'Moderno',
    description: 'Estilo contemporáneo con gradientes y colores vibrantes',
    colors: {
      primary: '#7C3AED',
      secondary: '#4F46E5',
      accent: '#06B6D4',
      text: '#111827',
      muted: '#6B7280',
      background: '#FFFFFF',
      border: '#E5E7EB',
    },
    fonts: {
      heading: 'Inter, sans-serif',
      body: 'Inter, sans-serif',
    },
    borderRadius: '12px',
    headerStyle: 'centered',
  },
  minimal: {
    code: 'minimal',
    name: 'Minimalista',
    description: 'Diseño limpio con mucho espacio en blanco',
    colors: {
      primary: '#18181B',
      secondary: '#27272A',
      accent: '#71717A',
      text: '#18181B',
      muted: '#A1A1AA',
      background: '#FFFFFF',
      border: '#E4E4E7',
    },
    fonts: {
      heading: 'Helvetica Neue, sans-serif',
      body: 'Helvetica Neue, sans-serif',
    },
    borderRadius: '0px',
    headerStyle: 'minimal',
  },
  corporate: {
    code: 'corporate',
    name: 'Corporativo',
    description: 'Imagen empresarial seria con barra lateral',
    colors: {
      primary: '#0F172A',
      secondary: '#1E293B',
      accent: '#0EA5E9',
      text: '#0F172A',
      muted: '#64748B',
      background: '#FFFFFF',
      border: '#CBD5E1',
    },
    fonts: {
      heading: 'Roboto, sans-serif',
      body: 'Roboto, sans-serif',
    },
    borderRadius: '8px',
    headerStyle: 'sidebar',
  },
  elegant: {
    code: 'elegant',
    name: 'Elegante',
    description: 'Sofisticado con detalles dorados y tipografía refinada',
    colors: {
      primary: '#78350F',
      secondary: '#92400E',
      accent: '#D97706',
      text: '#1C1917',
      muted: '#78716C',
      background: '#FFFBEB',
      border: '#FDE68A',
    },
    fonts: {
      heading: 'Playfair Display, serif',
      body: 'Lora, serif',
    },
    borderRadius: '2px',
    headerStyle: 'elegant',
  },
};

export const DOCUMENT_TYPE_LABELS: Record<DocumentTemplateType, string> = {
  invoice: 'Factura',
  quote: 'Presupuesto',
  letter: 'Carta',
  contract: 'Contrato',
};

export const DOCUMENT_TYPE_ICONS: Record<DocumentTemplateType, string> = {
  invoice: 'Receipt',
  quote: 'FileText',
  letter: 'Mail',
  contract: 'FileCheck',
};
