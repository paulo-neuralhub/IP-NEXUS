// ============================================================
// L111: Header del Documento A4
// ============================================================

import React from 'react';
import { DocumentStyle, TenantDocumentSettings, StyleColors, StyleTypography } from '@/types/documents';

interface DocumentHeaderProps {
  style: DocumentStyle;
  colors: StyleColors;
  typography: StyleTypography;
  tenantSettings?: TenantDocumentSettings;
  title?: string;
  documentNumber?: string;
  documentDate?: string;
}

export function DocumentHeader({
  style,
  colors,
  typography,
  tenantSettings,
  title,
  documentNumber,
  documentDate,
}: DocumentHeaderProps) {
  const companyInfo = tenantSettings?.companyInfo;
  const logoUrl = tenantSettings?.logoUrl;

  // Render según el estilo del header
  switch (style.layout.headerStyle) {
    case 'wave':
      return (
        <div className="relative">
          {/* Fondo con ola */}
          <div
            style={{
              backgroundColor: colors.headerBg,
              color: colors.headerText,
              padding: '20px 25px 40px',
            }}
          >
            <div className="flex items-start justify-between">
              {/* Logo y nombre */}
              <div className="flex items-center gap-4">
                {logoUrl && (
                  <img
                    src={logoUrl}
                    alt="Logo"
                    style={{ maxHeight: '50px', objectFit: 'contain' }}
                  />
                )}
                {companyInfo?.name && (
                  <div>
                    <h1
                      style={{
                        fontFamily: typography.titleFont,
                        fontSize: '20px',
                        fontWeight: 'bold',
                      }}
                    >
                      {companyInfo.name}
                    </h1>
                  </div>
                )}
              </div>

              {/* Info del documento */}
              <div className="text-right text-sm">
                {documentNumber && (
                  <p className="font-mono">Nº: {documentNumber}</p>
                )}
                {documentDate && (
                  <p>Fecha: {documentDate}</p>
                )}
              </div>
            </div>
          </div>

          {/* Ola decorativa */}
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

          {/* Título del documento */}
          {title && (
            <div
              className="text-center pt-10 pb-4"
              style={{
                fontFamily: typography.titleFont,
                fontSize: typography.titleSize,
                fontWeight: 'bold',
                color: colors.primary,
              }}
            >
              {title}
            </div>
          )}
        </div>
      );

    case 'band':
      return (
        <div className="relative">
          {/* Banda superior */}
          <div
            style={{
              backgroundColor: colors.headerBg,
              color: colors.headerText,
              padding: '15px 25px',
            }}
          >
            <div className="flex items-center justify-between">
              {/* Logo y nombre */}
              <div className="flex items-center gap-4">
                {logoUrl && (
                  <img
                    src={logoUrl}
                    alt="Logo"
                    style={{ maxHeight: '40px', objectFit: 'contain' }}
                  />
                )}
                <div>
                  <p style={{ fontWeight: 'bold', fontSize: '16px' }}>
                    {companyInfo?.name || 'Empresa'}
                  </p>
                  {companyInfo?.phone && (
                    <p className="text-xs opacity-80">{companyInfo.phone}</p>
                  )}
                </div>
              </div>

              {/* Info documento */}
              <div className="text-right text-sm">
                {title && <p className="font-semibold">{title}</p>}
                {documentNumber && <p className="font-mono text-xs">Nº: {documentNumber}</p>}
                {documentDate && <p className="text-xs">{documentDate}</p>}
              </div>
            </div>
          </div>
        </div>
      );

    case 'diagonal':
      return (
        <div className="relative overflow-hidden" style={{ minHeight: '120px' }}>
          {/* Franjas diagonales */}
          <div
            className="absolute -top-10 -right-20 w-80 h-40 rotate-12"
            style={{ backgroundColor: colors.primary, opacity: 0.1 }}
          />
          <div
            className="absolute -top-5 -right-10 w-60 h-30 rotate-12"
            style={{ backgroundColor: colors.accent, opacity: 0.15 }}
          />

          {/* Contenido */}
          <div className="relative z-10 p-6">
            <div className="flex items-start gap-4">
              {logoUrl && (
                <img
                  src={logoUrl}
                  alt="Logo"
                  style={{ maxHeight: '50px', objectFit: 'contain' }}
                />
              )}
              <div>
                {companyInfo?.name && (
                  <h1
                    style={{
                      fontFamily: typography.titleFont,
                      fontSize: '22px',
                      fontWeight: 'bold',
                      color: colors.primary,
                    }}
                  >
                    {companyInfo.name}
                  </h1>
                )}
                {companyInfo?.phone && <p className="text-sm" style={{ color: colors.secondary }}>{companyInfo.phone}</p>}
                {companyInfo?.email && <p className="text-sm" style={{ color: colors.secondary }}>{companyInfo.email}</p>}
              </div>
            </div>

            {title && (
              <div
                className="mt-4 pt-4 border-t"
                style={{
                  borderColor: colors.border,
                  fontFamily: typography.titleFont,
                  fontSize: typography.titleSize,
                  fontWeight: 'bold',
                  color: colors.primary,
                }}
              >
                {title}
              </div>
            )}
          </div>
        </div>
      );

    case 'organic':
      return (
        <div className="relative overflow-hidden" style={{ backgroundColor: colors.headerBg, minHeight: '100px' }}>
          {/* Formas orgánicas */}
          <div
            className="absolute -top-10 -right-10 w-40 h-40 rounded-full"
            style={{ backgroundColor: colors.secondary, opacity: 0.3 }}
          />
          <div
            className="absolute top-10 -right-20 w-32 h-32 rounded-full"
            style={{ backgroundColor: colors.accent, opacity: 0.2 }}
          />

          {/* Contenido */}
          <div className="relative z-10 p-6" style={{ color: colors.headerText }}>
            <div className="flex items-center gap-4">
              {logoUrl && (
                <img
                  src={logoUrl}
                  alt="Logo"
                  style={{ maxHeight: '50px', objectFit: 'contain' }}
                />
              )}
              <div>
                {companyInfo?.name && (
                  <h1
                    style={{
                      fontFamily: typography.titleFont,
                      fontSize: '22px',
                      fontWeight: 'bold',
                    }}
                  >
                    {companyInfo.name}
                  </h1>
                )}
              </div>
            </div>

            <div className="flex justify-between items-end mt-4">
              {title && (
                <div
                  style={{
                    fontFamily: typography.titleFont,
                    fontSize: '18px',
                    fontWeight: 'bold',
                  }}
                >
                  {title}
                </div>
              )}
              <div className="text-right text-sm">
                {documentNumber && <p className="font-mono">{documentNumber}</p>}
                {documentDate && <p>{documentDate}</p>}
              </div>
            </div>
          </div>
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
            {/* Logo y empresa */}
            <div className="flex items-center gap-4">
              {logoUrl && (
                <img
                  src={logoUrl}
                  alt="Logo"
                  style={{ maxHeight: '50px', objectFit: 'contain' }}
                />
              )}
              <div>
                {companyInfo?.name && (
                  <h1
                    style={{
                      fontFamily: typography.titleFont,
                      fontSize: '18px',
                      fontWeight: 'bold',
                      color: colors.headerText || colors.primary,
                    }}
                  >
                    {companyInfo.name}
                  </h1>
                )}
                {companyInfo?.address && (
                  <p className="text-xs" style={{ color: colors.secondary }}>
                    {companyInfo.address}
                    {companyInfo.city && `, ${companyInfo.city}`}
                  </p>
                )}
              </div>
            </div>

            {/* Info documento */}
            <div className="text-right text-xs" style={{ color: colors.text }}>
              {documentNumber && (
                <p className="font-mono font-medium">
                  {documentNumber}
                </p>
              )}
              {documentDate && (
                <p>
                  {documentDate}
                </p>
              )}
            </div>
          </div>

          {/* Título */}
          {title && (
            <div
              className="mt-6 text-center"
              style={{
                fontFamily: typography.titleFont,
                fontSize: typography.titleSize,
                fontWeight: 'bold',
                color: colors.primary,
              }}
            >
              {title}
            </div>
          )}
        </div>
      );
  }
}
