// ============================================================
// L111: Footer del Documento A4
// ============================================================

import React from 'react';
import { DocumentStyle, StyleColors, TenantDocumentSettings } from '@/types/documents';

interface DocumentFooterProps {
  style: DocumentStyle;
  colors: StyleColors;
  tenantSettings?: TenantDocumentSettings;
}

export function DocumentFooter({
  style,
  colors,
  tenantSettings,
}: DocumentFooterProps) {
  const companyInfo = tenantSettings?.companyInfo;
  const customTexts = tenantSettings?.customTexts;
  const confidentiality = customTexts?.confidentialityNotice || 
    'Este documento es confidencial y está destinado únicamente al destinatario indicado.';

  // Render different footer styles
  switch (style.layout.footerStyle) {
    case 'band':
      return (
        <div
          className="absolute bottom-0 left-0 right-0"
          style={{
            backgroundColor: colors.footerBg,
            color: colors.footerText,
            padding: '15px 25px',
          }}
        >
          <div className="flex items-center justify-between text-xs">
            <div>
              {style.layout.showFooterContact && companyInfo && (
                <p>
                  {companyInfo.name}
                  {companyInfo.phone && ` | Tel: ${companyInfo.phone}`}
                  {companyInfo.email && ` | ${companyInfo.email}`}
                </p>
              )}
            </div>
            <div className="text-right">
              {companyInfo?.website && <p>{companyInfo.website}</p>}
              {companyInfo?.cif && <p>CIF: {companyInfo.cif}</p>}
            </div>
          </div>
          <p className="text-[10px] mt-2 opacity-70 text-center">
            {confidentiality}
          </p>
        </div>
      );

    case 'line':
      return (
        <div
          className="absolute bottom-0 left-0 right-0 border-t"
          style={{
            borderColor: colors.border,
            backgroundColor: colors.footerBg,
            padding: '12px 25px',
          }}
        >
          <div className="flex items-center justify-between text-xs" style={{ color: colors.footerText }}>
            <div>
              {style.layout.showFooterContact && companyInfo && (
                <p>
                  {companyInfo.name}
                  {companyInfo.address && ` · ${companyInfo.address}`}
                </p>
              )}
            </div>
            <div className="text-right">
              {companyInfo?.phone && <span>Tel: {companyInfo.phone}</span>}
              {companyInfo?.email && <span className="ml-3">{companyInfo.email}</span>}
            </div>
          </div>
          <p className="text-[9px] mt-1.5 text-center" style={{ color: colors.footerText, opacity: 0.7 }}>
            {confidentiality}
          </p>
        </div>
      );

    case 'minimal':
    default:
      return (
        <div
          className="absolute bottom-0 left-0 right-0"
          style={{
            backgroundColor: colors.footerBg || colors.background,
            padding: '12px 25px',
          }}
        >
          <div className="text-center text-[10px]" style={{ color: colors.footerText || colors.secondary }}>
            {style.layout.showFooterContact && companyInfo && (
              <p className="mb-1">
                {[
                  companyInfo.name,
                  companyInfo.address,
                  companyInfo.phone,
                  companyInfo.email,
                ].filter(Boolean).join(' · ')}
              </p>
            )}
            <p style={{ opacity: 0.7 }}>
              {confidentiality}
            </p>
          </div>
        </div>
      );
  }
}
