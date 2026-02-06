// ============================================================
// DOCUMENT THUMBNAIL - Miniaturas realistas tipo documento A4
// Cada tipo de documento tiene su propia estructura visual
// ============================================================

import * as React from 'react';
import { cn } from '@/lib/utils';
import type { DocumentCategory, DesignColors } from '@/lib/document-templates/designTokens';

interface DocumentThumbnailProps {
  typeId: string;
  category: DocumentCategory;
  colors?: DesignColors | null;
  className?: string;
}

// Line placeholder component
const Line = ({ width = '100%', height = '2px', className }: { width?: string; height?: string; className?: string }) => (
  <div 
    className={cn('rounded-full bg-slate-200', className)} 
    style={{ width, height }} 
  />
);

// Table row component
const TableRow = ({ alt = false }: { alt?: boolean }) => (
  <div className={cn('flex gap-1 py-0.5', alt && 'bg-slate-50')}>
    <div className="flex-1 h-1.5 bg-slate-200 rounded-sm" />
    <div className="w-6 h-1.5 bg-slate-200 rounded-sm" />
    <div className="w-5 h-1.5 bg-slate-200 rounded-sm" />
  </div>
);

// Seal/stamp placeholder
const Seal = ({ small = false }: { small?: boolean }) => (
  <div 
    className={cn(
      'rounded-full border-2 border-slate-300 border-dashed flex items-center justify-center',
      small ? 'w-4 h-4' : 'w-6 h-6'
    )}
  >
    <div className={cn('rounded-full bg-slate-300', small ? 'w-1.5 h-1.5' : 'w-2 h-2')} />
  </div>
);

// Signature line
const Signature = () => (
  <div className="flex flex-col items-center gap-0.5">
    <div className="w-10 h-0.5 bg-slate-300" />
    <Line width="70%" height="1px" />
  </div>
);

// ============ Document Type Specific Layouts ============

// Factura, Presupuesto, Nota de Crédito, Recibo
function FinancialLayout({ colors }: { colors?: DesignColors | null }) {
  const headerBg = colors?.headerBg || '#2563eb';
  const totalBg = colors?.totalBg || '#2563eb';
  
  return (
    <>
      {/* Header */}
      <div className="h-4 rounded-t-sm" style={{ backgroundColor: headerBg }} />
      
      {/* Meta info */}
      <div className="flex justify-between mt-2 px-1">
        <Line width="40%" height="2px" />
        <Line width="25%" height="2px" />
      </div>
      
      {/* Client block */}
      <div className="mt-2 p-1 bg-slate-50 rounded-sm mx-1">
        <Line width="60%" height="1.5px" />
        <Line width="45%" height="1px" className="mt-0.5 opacity-60" />
      </div>
      
      {/* Table header */}
      <div className="mt-2 mx-1">
        <div className="h-2 rounded-t-sm flex items-center px-1 gap-1" style={{ backgroundColor: headerBg }}>
          <div className="flex-1 h-0.5 bg-white/40 rounded" />
          <div className="w-4 h-0.5 bg-white/40 rounded" />
          <div className="w-3 h-0.5 bg-white/40 rounded" />
        </div>
        
        {/* Table rows */}
        <div className="border-x border-slate-200">
          <TableRow />
          <TableRow alt />
          <TableRow />
          <TableRow alt />
        </div>
        
        {/* Total row */}
        <div 
          className="h-2.5 rounded-b-sm flex items-center justify-between px-1"
          style={{ backgroundColor: totalBg }}
        >
          <div className="w-8 h-0.5 bg-white/60 rounded" />
          <div className="w-6 h-0.5 bg-white/80 rounded" />
        </div>
      </div>
      
      {/* Footer */}
      <div className="mt-2 px-1">
        <Line width="50%" height="1px" className="opacity-50" />
      </div>
    </>
  );
}

// Carta Oficial, Cease & Desist
function LetterLayout({ colors }: { colors?: DesignColors | null }) {
  const headerBg = colors?.headerBg || '#2563eb';
  
  return (
    <>
      {/* Header */}
      <div className="h-3 rounded-t-sm" style={{ backgroundColor: headerBg }} />
      
      {/* Sender info */}
      <div className="mt-2 px-1.5">
        <Line width="35%" height="1.5px" />
        <Line width="50%" height="1px" className="mt-0.5 opacity-50" />
      </div>
      
      {/* Date & ref */}
      <div className="mt-2 px-1.5 text-right">
        <Line width="30%" height="1px" className="ml-auto opacity-60" />
      </div>
      
      {/* Recipient block */}
      <div className="mt-2 px-1.5">
        <Line width="45%" height="1.5px" />
        <Line width="55%" height="1px" className="mt-0.5 opacity-50" />
        <Line width="40%" height="1px" className="mt-0.5 opacity-50" />
      </div>
      
      {/* Salutation */}
      <div className="mt-2 px-1.5">
        <Line width="25%" height="1.5px" />
      </div>
      
      {/* Body paragraphs */}
      <div className="mt-1.5 px-1.5 space-y-1">
        <div className="space-y-0.5">
          <Line width="100%" height="1px" className="opacity-70" />
          <Line width="95%" height="1px" className="opacity-70" />
          <Line width="85%" height="1px" className="opacity-70" />
        </div>
        <div className="space-y-0.5">
          <Line width="100%" height="1px" className="opacity-70" />
          <Line width="90%" height="1px" className="opacity-70" />
          <Line width="75%" height="1px" className="opacity-70" />
        </div>
      </div>
      
      {/* Signature */}
      <div className="mt-3 px-1.5">
        <Line width="20%" height="1px" />
        <div className="mt-1">
          <Signature />
        </div>
      </div>
    </>
  );
}

// Acta de Reunión
function MeetingMinutesLayout({ colors }: { colors?: DesignColors | null }) {
  const headerBg = colors?.headerBg || '#2563eb';
  
  return (
    <>
      {/* Header */}
      <div className="h-3 rounded-t-sm flex items-center justify-center" style={{ backgroundColor: headerBg }}>
        <div className="w-12 h-0.5 bg-white/60 rounded" />
      </div>
      
      {/* Title */}
      <div className="mt-2 text-center px-1">
        <Line width="60%" height="2px" className="mx-auto" />
        <Line width="40%" height="1px" className="mx-auto mt-0.5 opacity-60" />
      </div>
      
      {/* Two columns: attendees */}
      <div className="mt-2 px-1 flex gap-1">
        <div className="flex-1 p-1 bg-slate-50 rounded-sm">
          <Line width="80%" height="1px" />
          <Line width="60%" height="1px" className="mt-0.5 opacity-60" />
          <Line width="70%" height="1px" className="mt-0.5 opacity-60" />
        </div>
        <div className="flex-1 p-1 bg-slate-50 rounded-sm">
          <Line width="75%" height="1px" />
          <Line width="55%" height="1px" className="mt-0.5 opacity-60" />
          <Line width="65%" height="1px" className="mt-0.5 opacity-60" />
        </div>
      </div>
      
      {/* Sections */}
      <div className="mt-2 px-1 space-y-1.5">
        <div>
          <Line width="35%" height="1.5px" />
          <div className="mt-0.5 pl-1 space-y-0.5">
            <Line width="90%" height="1px" className="opacity-60" />
            <Line width="85%" height="1px" className="opacity-60" />
          </div>
        </div>
        <div>
          <Line width="40%" height="1.5px" />
          <div className="mt-0.5 pl-1 space-y-0.5">
            <Line width="95%" height="1px" className="opacity-60" />
            <Line width="80%" height="1px" className="opacity-60" />
          </div>
        </div>
      </div>
    </>
  );
}

// Informe Portfolio, Informe Vigilancia
function ReportLayout({ colors }: { colors?: DesignColors | null }) {
  const headerBg = colors?.headerBg || '#2563eb';
  const accent = colors?.accent || '#3b82f6';
  
  return (
    <>
      {/* Header */}
      <div className="h-4 rounded-t-sm" style={{ backgroundColor: headerBg }} />
      
      {/* Title */}
      <div className="mt-2 px-1.5">
        <Line width="55%" height="2px" />
        <Line width="35%" height="1px" className="mt-0.5 opacity-50" />
      </div>
      
      {/* KPI Grid */}
      <div className="mt-2 px-1 grid grid-cols-4 gap-0.5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-1 bg-slate-50 rounded-sm text-center">
            <div 
              className="w-3 h-3 rounded mx-auto mb-0.5" 
              style={{ backgroundColor: `${accent}20` }}
            />
            <Line width="80%" height="1px" className="mx-auto opacity-60" />
          </div>
        ))}
      </div>
      
      {/* Mini table */}
      <div className="mt-2 mx-1">
        <div className="h-1.5 rounded-t-sm" style={{ backgroundColor: headerBg }} />
        <div className="border-x border-b border-slate-200 rounded-b-sm">
          <TableRow />
          <TableRow alt />
          <TableRow />
        </div>
      </div>
      
      {/* Text section */}
      <div className="mt-2 px-1.5 space-y-0.5">
        <Line width="100%" height="1px" className="opacity-60" />
        <Line width="90%" height="1px" className="opacity-60" />
        <Line width="80%" height="1px" className="opacity-60" />
      </div>
    </>
  );
}

// Contrato, NDA, Licencia
function ContractLayout({ colors }: { colors?: DesignColors | null }) {
  const headerBg = colors?.headerBg || '#2563eb';
  
  return (
    <>
      {/* Header */}
      <div className="h-3 rounded-t-sm" style={{ backgroundColor: headerBg }} />
      
      {/* Title centered */}
      <div className="mt-2 text-center">
        <Line width="50%" height="2px" className="mx-auto" />
      </div>
      
      {/* Numbered clauses */}
      <div className="mt-2 px-1.5 space-y-1">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-slate-300 flex-shrink-0 mt-0.5 flex items-center justify-center">
              <span className="text-[4px] text-slate-600 font-bold">{n}</span>
            </div>
            <div className="flex-1 space-y-0.5">
              <Line width="90%" height="1px" className="opacity-70" />
              <Line width="80%" height="1px" className="opacity-50" />
            </div>
          </div>
        ))}
      </div>
      
      {/* Double signature */}
      <div className="mt-3 px-1.5 flex justify-between">
        <Signature />
        <Signature />
      </div>
    </>
  );
}

// Poder Notarial
function PowerOfAttorneyLayout({ colors }: { colors?: DesignColors | null }) {
  const headerBg = colors?.headerBg || '#2563eb';
  
  return (
    <>
      {/* Header centered */}
      <div className="h-3 rounded-t-sm flex items-center justify-center" style={{ backgroundColor: headerBg }}>
        <div className="w-14 h-0.5 bg-white/60 rounded" />
      </div>
      
      {/* Official title */}
      <div className="mt-2 text-center">
        <Line width="45%" height="2.5px" className="mx-auto" />
        <Line width="35%" height="1.5px" className="mx-auto mt-1" />
      </div>
      
      {/* Official block */}
      <div className="mt-2 mx-2 p-1.5 border border-slate-200 rounded-sm">
        <div className="space-y-0.5">
          <Line width="100%" height="1px" className="opacity-70" />
          <Line width="95%" height="1px" className="opacity-70" />
          <Line width="90%" height="1px" className="opacity-70" />
          <Line width="85%" height="1px" className="opacity-70" />
        </div>
      </div>
      
      {/* Seals and signature */}
      <div className="mt-3 px-2 flex items-end justify-between">
        <Seal />
        <Signature />
        <Seal />
      </div>
    </>
  );
}

// Certificado
function CertificateLayout({ colors }: { colors?: DesignColors | null }) {
  const headerBg = colors?.headerBg || '#2563eb';
  const accent = colors?.accent || '#3b82f6';
  
  return (
    <>
      {/* Decorative header */}
      <div className="h-2 rounded-t-sm" style={{ backgroundColor: headerBg }} />
      
      {/* Centered content */}
      <div className="text-center mt-3">
        <Line width="30%" height="1px" className="mx-auto opacity-50" />
        <Line width="55%" height="3px" className="mx-auto mt-1" />
        <Line width="40%" height="1px" className="mx-auto mt-1 opacity-50" />
      </div>
      
      {/* Main content block */}
      <div className="mt-2 mx-2 p-1.5 bg-slate-50 rounded-sm text-center">
        <Line width="80%" height="2px" className="mx-auto" />
        <div className="mt-1 grid grid-cols-2 gap-1">
          <Line width="90%" height="1px" className="opacity-60" />
          <Line width="85%" height="1px" className="opacity-60" />
          <Line width="75%" height="1px" className="opacity-60" />
          <Line width="80%" height="1px" className="opacity-60" />
        </div>
      </div>
      
      {/* Seals */}
      <div className="mt-3 flex justify-center gap-4">
        <Seal />
        <Seal />
      </div>
      
      {/* Decorative footer */}
      <div className="mt-2 h-1 mx-4 rounded" style={{ backgroundColor: `${accent}30` }} />
    </>
  );
}

// Renovación
function RenewalLayout({ colors }: { colors?: DesignColors | null }) {
  const headerBg = colors?.headerBg || '#2563eb';
  
  return (
    <>
      {/* Header */}
      <div className="h-3 rounded-t-sm" style={{ backgroundColor: headerBg }} />
      
      {/* Title */}
      <div className="mt-2 px-1.5">
        <Line width="50%" height="2px" />
      </div>
      
      {/* Date highlight block */}
      <div 
        className="mt-2 mx-1.5 p-1.5 rounded-sm border-l-2"
        style={{ 
          backgroundColor: `${headerBg}10`,
          borderColor: headerBg,
        }}
      >
        <Line width="40%" height="1.5px" />
        <Line width="60%" height="2.5px" className="mt-1" />
      </div>
      
      {/* Table */}
      <div className="mt-2 mx-1.5">
        <div className="h-1.5 rounded-t-sm" style={{ backgroundColor: headerBg }} />
        <div className="border-x border-b border-slate-200 rounded-b-sm">
          <TableRow />
          <TableRow alt />
        </div>
      </div>
      
      {/* Alert notice */}
      <div className="mt-2 mx-1.5 p-1 bg-amber-50 border border-amber-200 rounded-sm">
        <Line width="70%" height="1px" className="bg-amber-300" />
        <Line width="50%" height="1px" className="mt-0.5 bg-amber-200" />
      </div>
    </>
  );
}

// Map document types to their layouts
const LAYOUT_MAP: Record<string, React.FC<{ colors?: DesignColors | null }>> = {
  // Financiero
  'invoice': FinancialLayout,
  'quote': FinancialLayout,
  'credit-note': FinancialLayout,
  'receipt': FinancialLayout,
  
  // Comunicación
  'official-letter': LetterLayout,
  'cease-desist': LetterLayout,
  'meeting-minutes': MeetingMinutesLayout,
  
  // Informes
  'portfolio-report': ReportLayout,
  'surveillance-report': ReportLayout,
  
  // Legal
  'contract': ContractLayout,
  'nda': ContractLayout,
  'license': ContractLayout,
  'power-of-attorney': PowerOfAttorneyLayout,
  
  // IP
  'certificate': CertificateLayout,
  'renewal': RenewalLayout,
};

// Category fallbacks
const CATEGORY_FALLBACK: Record<DocumentCategory, React.FC<{ colors?: DesignColors | null }>> = {
  financiero: FinancialLayout,
  comunicacion: LetterLayout,
  informe: ReportLayout,
  legal: ContractLayout,
  ip: CertificateLayout,
};

export function DocumentThumbnail({ typeId, category, colors, className }: DocumentThumbnailProps) {
  const LayoutComponent = LAYOUT_MAP[typeId] || CATEGORY_FALLBACK[category] || FinancialLayout;
  
  return (
    <div className={cn(
      'bg-slate-50 p-3 flex items-center justify-center',
      className
    )}>
      {/* A4 aspect ratio container: 1:1.414 */}
      <div 
        className="w-full bg-white rounded-md shadow-sm border border-slate-200 overflow-hidden"
        style={{ aspectRatio: '1 / 1.414' }}
      >
        <div className="p-1.5 h-full">
          <LayoutComponent colors={colors} />
        </div>
      </div>
    </div>
  );
}
