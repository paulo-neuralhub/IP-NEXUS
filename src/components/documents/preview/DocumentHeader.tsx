// ============================================================
// L111: Header del Documento A4
// ============================================================

import React from 'react';
import { DocumentStyle, StyleColors, StyleTypography, TenantDocumentSettings } from '@/types/documents';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface DocumentHeaderProps {
  style: DocumentStyle;
  colors: StyleColors;
  typography: StyleTypography;
  tenantSettings?: TenantDocumentSettings;
  documentNumber?: string;
  documentDate?: string;
}

export function DocumentHeader({
  style,
  colors,
  typography,
  tenantSettings,
  documentNumber,
  documentDate,
}: DocumentHeaderProps) {
  const companyInfo = tenantSettings?.companyInfo;
  const logoUrl = tenantSettings?.logoUrl;
  const logoPosition = tenantSettings?.logoPosition || 'left';
  const logoMaxHeight = tenantSettings?.logoMaxHeight || 50;

  const today = documentDate || format(new Date(), "d 'de' MMMM 'de' yyyy", { locale: es });

  // Render different header styles
  switch (style.layout.headerStyle) {
    case 'band':
      return (
        <div
          className="w-full"
          style={{
            backgroundColor: colors.headerBg,
            color: colors.headerText,
            padding: '20px 25px',
          }}
        >
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-4 ${logoPosition === 'center' ? 'justify-center flex-1' : ''}`}>
              {logoUrl && (
                <img
                  src={logoUrl}
                  alt="Logo"
                  style={{ maxHeight: `${logoMaxHeight}px`, objectFit: 'contain' }}
                />
              )}
              {style.layout.showHeaderInfo && companyInfo && logoPosition !== 'center' && (
                <div>
                  <h1 style={{ fontFamily: typography.titleFont, fontSize: '20px', fontWeight: 'bold' }}>
                    {companyInfo.name}
                  </h1>
                  {companyInfo.address && (
                    <p className="text-sm opacity-80">{companyInfo.address}</p>
                  )}
                </div>
              )}
            </div>
            <div className="text-right text-sm">
              {documentNumber && <p className="font-mono">Ref: {documentNumber}</p>}
              <p>{today}</p>
            </div>
          </div>
        </div>
      );

    case 'wave':
      return (
        <div className="relative">
          <div
            style={{
              backgroundColor: colors.headerBg,
              color: colors.headerText,
              padding: '20px 25px 40px',
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {logoUrl && (
                  <img
                    src={logoUrl}
                    alt="Logo"
                    style={{ maxHeight: `${logoMaxHeight}px`, objectFit: 'contain' }}
                  />
                )}
                {style.layout.showHeaderInfo && companyInfo && (
                  <div>
                    <h1 style={{ fontFamily: typography.titleFont, fontSize: '20px', fontWeight: 'bold' }}>
                      {companyInfo.name}
                    </h1>
                  </div>
                )}
              </div>
              <div className="text-right text-sm">
                {documentNumber && <p className="font-mono">Ref: {documentNumber}</p>}
                <p>{today}</p>
              </div>
            </div>
          </div>
          <svg
            className="absolute bottom-0 left-0 w-full"
            style={{ height: '30px', transform: 'translateY(50%)' }}
            viewBox="0 0 1440 100"
            preserveAspectRatio="none"
          >
            <path
              d="M0,0 C480,100 960,100 1440,0 L1440,0 L0,0 Z"
              fill={colors.headerBg}
            />
          </svg>
        </div>
      );

    case 'diagonal':
      return (
        <div className="relative overflow-hidden">
          <div
            style={{
              backgroundColor: colors.background,
              padding: '25px',
            }}
          >
            <div className="flex items-start justify-between relative z-10">
              <div className="flex items-center gap-4">
                {logoUrl && (
                  <img
                    src={logoUrl}
                    alt="Logo"
                    style={{ maxHeight: `${logoMaxHeight}px`, objectFit: 'contain' }}
                  />
                )}
                {style.layout.showHeaderInfo && companyInfo && (
                  <div>
                    <h1 style={{ fontFamily: typography.titleFont, fontSize: '22px', fontWeight: 'bold', color: colors.primary }}>
                      {companyInfo.name}
                    </h1>
                    {companyInfo.address && (
                      <p className="text-sm" style={{ color: colors.secondary }}>{companyInfo.address}</p>
                    )}
                  </div>
                )}
              </div>
              <div className="text-right text-sm" style={{ color: colors.text }}>
                {documentNumber && <p className="font-mono font-medium">Ref: {documentNumber}</p>}
                <p>{today}</p>
              </div>
            </div>
          </div>
          {/* Diagonal decoration */}
          <div
            className="absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rotate-45"
            style={{ backgroundColor: colors.primary, opacity: 0.1 }}
          />
          <div
            className="absolute top-0 right-0 w-20 h-20 -mr-10 -mt-10 rotate-45"
            style={{ backgroundColor: colors.accent, opacity: 0.2 }}
          />
        </div>
      );

    case 'organic':
      return (
        <div className="relative overflow-hidden" style={{ backgroundColor: colors.headerBg }}>
          <div
            style={{
              padding: '25px',
              color: colors.headerText,
            }}
          >
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-4">
                {logoUrl && (
                  <img
                    src={logoUrl}
                    alt="Logo"
                    style={{ maxHeight: `${logoMaxHeight}px`, objectFit: 'contain' }}
                  />
                )}
                {style.layout.showHeaderInfo && companyInfo && (
                  <div>
                    <h1 style={{ fontFamily: typography.titleFont, fontSize: '22px', fontWeight: 'bold' }}>
                      {companyInfo.name}
                    </h1>
                  </div>
                )}
              </div>
              <div className="text-right text-sm">
                {documentNumber && <p className="font-mono">Ref: {documentNumber}</p>}
                <p>{today}</p>
              </div>
            </div>
          </div>
          {/* Organic shapes */}
          <div
            className="absolute -top-10 -right-10 w-40 h-40 rounded-full"
            style={{ backgroundColor: colors.secondary, opacity: 0.3 }}
          />
          <div
            className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full"
            style={{ backgroundColor: colors.accent, opacity: 0.2 }}
          />
        </div>
      );

    case 'minimal':
    default:
      return (
        <div
          className="border-b"
          style={{
            padding: '25px',
            borderColor: colors.border,
            backgroundColor: colors.headerBg,
          }}
        >
          <div className="flex items-start justify-between">
            <div className={`flex items-center gap-4 ${logoPosition === 'center' ? 'justify-center flex-1' : ''}`}>
              {logoUrl && (
                <img
                  src={logoUrl}
                  alt="Logo"
                  style={{ maxHeight: `${logoMaxHeight}px`, objectFit: 'contain' }}
                />
              )}
              {style.layout.showHeaderInfo && companyInfo && logoPosition !== 'center' && (
                <div>
                  <h1 style={{ fontFamily: typography.titleFont, fontSize: '18px', fontWeight: 'bold', color: colors.headerText }}>
                    {companyInfo.name}
                  </h1>
                  {companyInfo.address && (
                    <p className="text-xs" style={{ color: colors.secondary }}>
                      {companyInfo.address}
                      {companyInfo.city && `, ${companyInfo.city}`}
                      {companyInfo.postalCode && ` ${companyInfo.postalCode}`}
                    </p>
                  )}
                  <p className="text-xs" style={{ color: colors.secondary }}>
                    {[companyInfo.phone, companyInfo.email].filter(Boolean).join(' | ')}
                  </p>
                </div>
              )}
            </div>
            <div className="text-right text-xs" style={{ color: colors.text }}>
              {documentNumber && (
                <p className="font-mono font-medium">
                  Ref: <span>{documentNumber}</span>
                </p>
              )}
              <p>Fecha: {today}</p>
            </div>
          </div>
        </div>
      );
  }
}
