// ============================================================
// L111: Configuración de Estilos de Documentos
// ============================================================

import { 
  DocumentStyle, 
  DocumentStyleCode, 
  TenantDocumentSettings 
} from '@/types/documents';

export const DOCUMENT_STYLES: Record<DocumentStyleCode, DocumentStyle> = {
  minimalista: {
    code: 'minimalista',
    name: 'Minimalista Clásico',
    description: 'Limpio y profesional, ideal para documentos oficiales OEPM/EUIPO',
    colors: {
      primary: '#1A1A1A',
      secondary: '#666666',
      accent: '#000000',
      background: '#FFFFFF',
      text: '#333333',
      border: '#E5E5E5',
      headerBg: '#FFFFFF',
      headerText: '#1A1A1A',
      footerBg: '#F5F5F5',
      footerText: '#666666',
    },
    typography: {
      titleFont: '"Playfair Display", Georgia, serif',
      bodyFont: '"Inter", -apple-system, sans-serif',
      signatureFont: '"Dancing Script", cursive',
      titleSize: '28px',
      bodySize: '12px',
    },
    layout: {
      headerStyle: 'minimal',
      footerStyle: 'line',
      margins: { top: 25, right: 25, bottom: 25, left: 30 },
      showLogo: true,
      showHeaderInfo: true,
      showFooterContact: true,
    },
    decorations: {
      hasShapes: false,
      hasTexture: false,
    },
  },

  corporativo: {
    code: 'corporativo',
    name: 'Corporativo Azul',
    description: 'Profesional con acentos azules, ideal para contratos y cartas',
    colors: {
      primary: '#1E3A5F',
      secondary: '#2563EB',
      accent: '#0D9488',
      background: '#FFFFFF',
      text: '#1F2937',
      border: '#D1D5DB',
      headerBg: '#1E3A5F',
      headerText: '#FFFFFF',
      footerBg: '#1E3A5F',
      footerText: '#FFFFFF',
    },
    typography: {
      titleFont: '"Montserrat", -apple-system, sans-serif',
      bodyFont: '"Inter", -apple-system, sans-serif',
      signatureFont: '"Dancing Script", cursive',
      titleSize: '32px',
      bodySize: '12px',
    },
    layout: {
      headerStyle: 'wave',
      footerStyle: 'band',
      margins: { top: 20, right: 25, bottom: 20, left: 25 },
      showLogo: true,
      showHeaderInfo: true,
      showFooterContact: true,
    },
    decorations: {
      hasShapes: true,
      shapeStyle: 'geometric',
      hasTexture: false,
    },
  },

  elegante: {
    code: 'elegante',
    name: 'Elegante Dorado',
    description: 'Sofisticado con tonos beige y dorado, ideal para despachos boutique',
    colors: {
      primary: '#1E3A5F',
      secondary: '#C9A962',
      accent: '#B8860B',
      background: '#FAF8F5',
      text: '#374151',
      border: '#E5DDD3',
      headerBg: '#FAF8F5',
      headerText: '#1E3A5F',
      footerBg: '#1E3A5F',
      footerText: '#FFFFFF',
    },
    typography: {
      titleFont: '"Cormorant Garamond", Georgia, serif',
      bodyFont: '"Source Sans Pro", -apple-system, sans-serif',
      signatureFont: '"Great Vibes", cursive',
      titleSize: '36px',
      bodySize: '12px',
    },
    layout: {
      headerStyle: 'minimal',
      footerStyle: 'band',
      margins: { top: 25, right: 25, bottom: 25, left: 25 },
      showLogo: true,
      showHeaderInfo: true,
      showFooterContact: true,
    },
    decorations: {
      hasShapes: true,
      shapeStyle: 'circles',
      hasTexture: false,
    },
  },

  dark: {
    code: 'dark',
    name: 'Dark Professional',
    description: 'Moderno con header oscuro, ideal para informes y tech',
    colors: {
      primary: '#1A1A2E',
      secondary: '#16213E',
      accent: '#E94560',
      background: '#FFFFFF',
      text: '#1F2937',
      border: '#E5E7EB',
      headerBg: '#1A1A2E',
      headerText: '#FFFFFF',
      footerBg: '#1A1A2E',
      footerText: '#FFFFFF',
    },
    typography: {
      titleFont: '"Poppins", -apple-system, sans-serif',
      bodyFont: '"Inter", -apple-system, sans-serif',
      signatureFont: '"Dancing Script", cursive',
      titleSize: '32px',
      bodySize: '12px',
    },
    layout: {
      headerStyle: 'band',
      footerStyle: 'band',
      margins: { top: 15, right: 25, bottom: 15, left: 25 },
      showLogo: true,
      showHeaderInfo: true,
      showFooterContact: true,
    },
    decorations: {
      hasShapes: false,
      hasTexture: true,
    },
  },

  creativo: {
    code: 'creativo',
    name: 'Creativo Colorido',
    description: 'Dinámico con formas orgánicas, ideal para agencias y marcas',
    colors: {
      primary: '#F97316',
      secondary: '#0EA5E9',
      accent: '#EAB308',
      background: '#FEF7ED',
      text: '#1F2937',
      border: '#FED7AA',
      headerBg: '#FEF7ED',
      headerText: '#1F2937',
      footerBg: '#FEF7ED',
      footerText: '#1F2937',
    },
    typography: {
      titleFont: '"Poppins", -apple-system, sans-serif',
      bodyFont: '"DM Sans", -apple-system, sans-serif',
      signatureFont: '"Pacifico", cursive',
      titleSize: '32px',
      bodySize: '12px',
    },
    layout: {
      headerStyle: 'organic',
      footerStyle: 'minimal',
      margins: { top: 25, right: 25, bottom: 25, left: 25 },
      showLogo: true,
      showHeaderInfo: false,
      showFooterContact: true,
    },
    decorations: {
      hasShapes: true,
      shapeStyle: 'organic',
      hasTexture: false,
    },
  },

  dinamico: {
    code: 'dinamico',
    name: 'Dinámico Moderno',
    description: 'Contemporáneo con franjas diagonales, ideal para comunicaciones',
    colors: {
      primary: '#2563EB',
      secondary: '#3B82F6',
      accent: '#06B6D4',
      background: '#FFFFFF',
      text: '#1E293B',
      border: '#E2E8F0',
      headerBg: '#FFFFFF',
      headerText: '#2563EB',
      footerBg: '#2563EB',
      footerText: '#FFFFFF',
    },
    typography: {
      titleFont: '"Montserrat", -apple-system, sans-serif',
      bodyFont: '"Inter", -apple-system, sans-serif',
      signatureFont: '"Dancing Script", cursive',
      titleSize: '28px',
      bodySize: '12px',
    },
    layout: {
      headerStyle: 'diagonal',
      footerStyle: 'band',
      margins: { top: 20, right: 25, bottom: 20, left: 25 },
      showLogo: true,
      showHeaderInfo: true,
      showFooterContact: true,
    },
    decorations: {
      hasShapes: true,
      shapeStyle: 'diagonal',
      hasTexture: false,
    },
  },
};

// Helper para obtener estilo con personalizaciones del tenant
export function getCustomizedStyle(
  styleCode: DocumentStyleCode,
  tenantSettings?: TenantDocumentSettings
): DocumentStyle {
  const baseStyle = { ...DOCUMENT_STYLES[styleCode] };
  
  if (!tenantSettings) return baseStyle;
  
  // Aplicar colores personalizados
  if (tenantSettings.customColors) {
    baseStyle.colors = {
      ...baseStyle.colors,
      ...tenantSettings.customColors,
    };
  }
  
  // Aplicar tipografías personalizadas
  if (tenantSettings.customTypography) {
    baseStyle.typography = {
      ...baseStyle.typography,
      ...tenantSettings.customTypography,
    };
  }
  
  return baseStyle;
}

// Lista de opciones para selectores UI
export const STYLE_SELECT_OPTIONS = Object.values(DOCUMENT_STYLES).map(style => ({
  value: style.code,
  label: style.name,
  description: style.description,
}));

// Helper para obtener nombre de estilo
export function getStyleName(code: DocumentStyleCode): string {
  return DOCUMENT_STYLES[code]?.name || code;
}

// Helper para obtener descripción de estilo
export function getStyleDescription(code: DocumentStyleCode): string {
  return DOCUMENT_STYLES[code]?.description || '';
}
