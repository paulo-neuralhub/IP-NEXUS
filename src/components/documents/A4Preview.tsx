// ============================================================
// L111: Vista Previa A4 de Documentos
// ============================================================

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { DocumentStyle, TenantDocumentSettings } from '@/types/documents';
import { DocumentHeader } from './preview/DocumentHeader';
import { DocumentFooter } from './preview/DocumentFooter';

interface A4PreviewProps {
  content: string;
  style: DocumentStyle;
  tenantSettings?: TenantDocumentSettings;
  title?: string;
  documentNumber?: string;
  documentDate?: string;
  className?: string;
}

export const A4Preview = forwardRef<HTMLDivElement, A4PreviewProps>(
  ({ content, style, tenantSettings, title, documentNumber, documentDate, className }, ref) => {
    // Merge tenant colors with style colors
    const colors = {
      ...style.colors,
      ...tenantSettings?.customColors,
    };

    const typography = {
      ...style.typography,
      ...tenantSettings?.customTypography,
    };

    // A4 dimensions: 210mm x 297mm
    // At 96 DPI: ~794px x 1123px
    const a4Width = 794;
    const a4Height = 1123;

    return (
      <div className={cn('bg-muted/50 p-6 overflow-auto', className)}>
        <div
          ref={ref}
          className="mx-auto bg-white shadow-xl relative"
          style={{
            width: `${a4Width}px`,
            minHeight: `${a4Height}px`,
            backgroundColor: colors.background,
            fontFamily: typography.bodyFont,
            fontSize: typography.bodySize,
            color: colors.text,
          }}
        >
          {/* Header */}
          <DocumentHeader
            style={style}
            colors={colors}
            typography={typography}
            tenantSettings={tenantSettings}
            documentNumber={documentNumber}
            documentDate={documentDate}
          />

          {/* Content */}
          <div
            className="prose prose-sm max-w-none"
            style={{
              padding: `${style.layout.margins.top}mm ${style.layout.margins.right}mm ${style.layout.margins.bottom}mm ${style.layout.margins.left}mm`,
              fontFamily: typography.bodyFont,
              minHeight: '600px',
            }}
            dangerouslySetInnerHTML={{ __html: content }}
          />

          {/* Footer */}
          <DocumentFooter
            style={style}
            colors={colors}
            tenantSettings={tenantSettings}
          />
        </div>
      </div>
    );
  }
);

A4Preview.displayName = 'A4Preview';
