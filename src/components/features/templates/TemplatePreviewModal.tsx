// ============================================================
// TEMPLATE PREVIEW MODAL - Modal de vista previa con datos del tenant
// ============================================================

import * as React from 'react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  X, Download, Edit, Check, ChevronDown, FileText, FileSpreadsheet,
  Building2, User, Calendar, Hash, Mail, Phone, Globe, MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { StyleSelectorInline } from './StyleSelectorInline';
import { useOrganization } from '@/contexts/organization-context';
import type { DocumentType, DesignTokens } from '@/lib/document-templates/designTokens';
import { CATEGORY_LABELS } from '@/lib/document-templates/designTokens';

interface TemplatePreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentType: DocumentType | null;
  defaultStyle: DesignTokens | null;
  allStyles: DesignTokens[];
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
  onStyleChange: (style: DesignTokens) => void;
}

// Variables de ejemplo que se muestran como placeholders
const PLACEHOLDER_VARIABLES = [
  { key: 'nombre_cliente', label: 'Nombre del cliente', icon: User },
  { key: 'referencia', label: 'Referencia del expediente', icon: Hash },
  { key: 'denominacion', label: 'Denominación', icon: FileText },
  { key: 'fecha', label: 'Fecha actual', icon: Calendar },
  { key: 'clases_nice', label: 'Clases Nice', icon: Hash },
];

// ============================================================
// DOCUMENT BODY RENDERERS - Each type has its own layout
// ============================================================
function renderDocumentBody(typeId: string, colors: any) {
  const id = typeId.toLowerCase();
  
  // CERTIFICADO
  if (id === 'certificate' || id === 'certificado') {
    return <CertificateBody colors={colors} />;
  }
  
  // FACTURA / PRESUPUESTO / NOTA DE CRÉDITO
  if (id === 'invoice' || id === 'factura' || id === 'quote' || id === 'presupuesto' || id.includes('credit')) {
    return <InvoiceBody colors={colors} />;
  }
  
  // CARTA
  if (id === 'official-letter' || id === 'carta' || id.includes('letter')) {
    return <LetterBody colors={colors} />;
  }
  
  // CONTRATO / NDA / LICENCIA
  if (id === 'contract' || id === 'contrato' || id === 'nda' || id === 'license' || id === 'licencia') {
    return <ContractBody colors={colors} label={id === 'nda' ? 'NDA' : id === 'license' || id === 'licencia' ? 'LICENCIA' : 'CONTRATO'} />;
  }
  
  // INFORME / VIGILANCIA
  if (id.includes('report') || id === 'informe' || id === 'vigilancia' || id.includes('portfolio') || id.includes('watch')) {
    return <ReportBody colors={colors} />;
  }
  
  // PODER NOTARIAL
  if (id === 'power-of-attorney' || id === 'poder' || id.includes('power')) {
    return <PowerBody colors={colors} />;
  }
  
  // RENOVACIÓN
  if (id === 'renewal' || id === 'renovacion') {
    return <RenewalBody colors={colors} />;
  }
  
  // RECIBO
  if (id === 'receipt' || id === 'recibo') {
    return <ReceiptBody colors={colors} />;
  }
  
  // ACTA
  if (id === 'meeting-minutes' || id === 'acta' || id.includes('meeting')) {
    return <MeetingBody colors={colors} />;
  }
  
  // CEASE & DESIST
  if (id === 'cease-desist' || id.includes('cease')) {
    return <CeaseDesistBody colors={colors} />;
  }
  
  // Default: Letter
  return <LetterBody colors={colors} />;
}

// ============================================================
// CERTIFICADO BODY
// ============================================================
function CertificateBody({ colors }: { colors: any }) {
  return (
    <div className="text-center py-6">
      {/* Sello central */}
      <div 
        className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center border-4"
        style={{ borderColor: colors?.headerBg || '#2563eb', backgroundColor: `${colors?.headerBg || '#2563eb'}15` }}
      >
        <span className="text-3xl" style={{ color: colors?.headerBg || '#2563eb' }}>✓</span>
      </div>
      
      <h2 className="text-xl font-bold mb-2" style={{ color: colors?.text }}>CERTIFICADO DE REGISTRO</h2>
      <div className="w-32 h-1 mx-auto mb-6" style={{ backgroundColor: colors?.headerBg || '#2563eb' }}></div>
      
      <p className="text-sm mb-6" style={{ color: colors?.textMuted }}>
        Se certifica que la marca denominada:
      </p>
      
      <div className="text-2xl font-bold mb-6" style={{ color: colors?.text }}>[Denominación]</div>
      
      {/* Grid de datos */}
      <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto mb-8">
        <div className="p-3 rounded-lg text-left" style={{ backgroundColor: colors?.backgroundAlt || '#f8fafc' }}>
          <div className="text-[9px] uppercase tracking-wide" style={{ color: colors?.textMuted }}>Nº Registro</div>
          <div className="text-sm font-semibold" style={{ color: colors?.text }}>[Referencia]</div>
        </div>
        <div className="p-3 rounded-lg text-left" style={{ backgroundColor: colors?.backgroundAlt || '#f8fafc' }}>
          <div className="text-[9px] uppercase tracking-wide" style={{ color: colors?.textMuted }}>Fecha</div>
          <div className="text-sm font-semibold" style={{ color: colors?.text }}>[Fecha]</div>
        </div>
        <div className="p-3 rounded-lg text-left" style={{ backgroundColor: colors?.backgroundAlt || '#f8fafc' }}>
          <div className="text-[9px] uppercase tracking-wide" style={{ color: colors?.textMuted }}>Titular</div>
          <div className="text-sm font-semibold" style={{ color: colors?.text }}>[Cliente]</div>
        </div>
        <div className="p-3 rounded-lg text-left" style={{ backgroundColor: colors?.backgroundAlt || '#f8fafc' }}>
          <div className="text-[9px] uppercase tracking-wide" style={{ color: colors?.textMuted }}>Clases Nice</div>
          <div className="text-sm font-semibold" style={{ color: colors?.text }}>[Clases]</div>
        </div>
      </div>
      
      {/* Sellos oficiales */}
      <div className="flex justify-center gap-6 pt-4">
        {[1, 2, 3].map((i) => (
          <div 
            key={i}
            className="w-10 h-10 rounded-full flex items-center justify-center border-2"
            style={{ borderColor: colors?.headerBg || '#2563eb' }}
          >
            <span style={{ color: colors?.headerBg || '#2563eb' }}>✓</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// FACTURA/PRESUPUESTO BODY
// ============================================================
function InvoiceBody({ colors }: { colors: any }) {
  return (
    <>
      {/* Client info */}
      <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: colors?.backgroundAlt || '#f8fafc' }}>
        <h3 className="text-[10px] font-semibold mb-1" style={{ color: colors?.text }}>Cliente</h3>
        <p className="text-xs font-medium">[Nombre del cliente]</p>
        <p className="text-[10px]" style={{ color: colors?.textMuted || '#999' }}>[Dirección] · NIF: [NIF]</p>
      </div>
      
      {/* Table */}
      <table className="w-full border-collapse text-[10px] mb-5">
        <thead>
          <tr>
            <th className="text-left p-2 font-semibold" style={{ backgroundColor: colors?.tableHeadBg || '#2563eb', color: colors?.tableHeadText || '#fff' }}>Concepto</th>
            <th className="text-center p-2 font-semibold w-16" style={{ backgroundColor: colors?.tableHeadBg || '#2563eb', color: colors?.tableHeadText || '#fff' }}>Uds.</th>
            <th className="text-right p-2 font-semibold w-20" style={{ backgroundColor: colors?.tableHeadBg || '#2563eb', color: colors?.tableHeadText || '#fff' }}>Precio</th>
            <th className="text-right p-2 font-semibold w-20" style={{ backgroundColor: colors?.tableHeadBg || '#2563eb', color: colors?.tableHeadText || '#fff' }}>Importe</th>
          </tr>
        </thead>
        <tbody>
          {['Servicio de registro de marca', 'Tasas oficiales OEPM', 'Búsqueda de anterioridades'].map((item, i) => (
            <tr key={i}>
              <td className="p-2 border-b" style={{ borderColor: colors?.border, backgroundColor: i % 2 === 0 ? colors?.backgroundAlt : 'transparent' }}>{item}</td>
              <td className="p-2 text-center border-b" style={{ borderColor: colors?.border, backgroundColor: i % 2 === 0 ? colors?.backgroundAlt : 'transparent' }}>1</td>
              <td className="p-2 text-right border-b" style={{ borderColor: colors?.border, backgroundColor: i % 2 === 0 ? colors?.backgroundAlt : 'transparent' }}>€{(400 + i * 100).toFixed(2)}</td>
              <td className="p-2 text-right border-b" style={{ borderColor: colors?.border, backgroundColor: i % 2 === 0 ? colors?.backgroundAlt : 'transparent' }}>€{(400 + i * 100).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={3} className="p-2 text-right font-medium" style={{ color: colors?.textMuted }}>Subtotal</td>
            <td className="p-2 text-right">€900.00</td>
          </tr>
          <tr>
            <td colSpan={3} className="p-2 text-right font-medium" style={{ color: colors?.textMuted }}>IVA (21%)</td>
            <td className="p-2 text-right">€189.00</td>
          </tr>
          <tr>
            <td colSpan={3} className="p-2 font-bold" style={{ backgroundColor: colors?.totalBg || '#2563eb', color: colors?.totalText || '#fff' }}>TOTAL</td>
            <td className="p-2 font-bold text-right" style={{ backgroundColor: colors?.totalBg || '#2563eb', color: colors?.totalText || '#fff' }}>€1,089.00</td>
          </tr>
        </tfoot>
      </table>
      
      <div className="pt-4 border-t text-[10px]" style={{ borderColor: colors?.border, color: colors?.textMuted }}>
        <p>Forma de pago: Transferencia bancaria</p>
        <p>IBAN: ES12 1234 5678 9012 3456 7890</p>
      </div>
    </>
  );
}

// ============================================================
// CARTA BODY
// ============================================================
function LetterBody({ colors }: { colors: any }) {
  return (
    <>
      {/* Recipient */}
      <div className="mb-4">
        <p className="text-[10px]" style={{ color: colors?.textMuted }}>A la atención de:</p>
        <p className="text-xs font-medium">[Nombre del cliente]</p>
        <p className="text-[10px]" style={{ color: colors?.textMuted }}>[Dirección del cliente]</p>
      </div>
      
      {/* Subject */}
      <div className="mb-4 pb-2 border-b-2" style={{ borderColor: colors?.headerBg || '#2563eb' }}>
        <p className="text-xs font-semibold">Asunto: [Denominación] - Ref: [Referencia]</p>
      </div>
      
      {/* Body paragraphs */}
      <div className="space-y-3 text-xs leading-relaxed" style={{ color: colors?.text }}>
        <p>Estimado/a <span className="font-medium">[Nombre del cliente]</span>,</p>
        <p>
          En relación con el expediente <span className="font-medium">[Referencia]</span> correspondiente 
          a la marca <span className="font-medium">[Denominación]</span>, le comunicamos que el procedimiento 
          se encuentra en la fase de examen formal.
        </p>
        <p>
          Le informamos que hemos recibido notificación de la Oficina de Propiedad Intelectual 
          con fecha [Fecha], en la que se indica que el expediente ha sido admitido a trámite.
        </p>
        <p>
          El próximo plazo relevante es la publicación en el Boletín Oficial, prevista para 
          aproximadamente 2 meses desde la fecha de admisión.
        </p>
        <p>
          Quedamos a su disposición para cualquier aclaración que precise.
        </p>
      </div>
      
      {/* Signature */}
      <div className="pt-8">
        <p className="text-xs" style={{ color: colors?.text }}>Atentamente,</p>
        <div className="w-24 h-px mt-8 mb-2" style={{ backgroundColor: colors?.text }}></div>
        <p className="text-xs font-semibold" style={{ color: colors?.text }}>[Nombre del agente]</p>
        <p className="text-[10px]" style={{ color: colors?.textMuted }}>Agente de Propiedad Industrial</p>
      </div>
    </>
  );
}

// ============================================================
// CONTRATO/NDA/LICENCIA BODY
// ============================================================
function ContractBody({ colors, label }: { colors: any; label: string }) {
  const clauses = label === 'NDA' 
    ? ['DEFINICIONES', 'INFORMACIÓN CONFIDENCIAL', 'OBLIGACIONES', 'DURACIÓN']
    : label === 'LICENCIA'
    ? ['OBJETO DE LA LICENCIA', 'TERRITORIO', 'ROYALTIES', 'DURACIÓN']
    : ['OBJETO DEL CONTRATO', 'OBLIGACIONES', 'PRECIO Y FORMA DE PAGO', 'DURACIÓN'];
  
  return (
    <>
      {/* Parties */}
      <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b" style={{ borderColor: colors?.border }}>
        <div>
          <p className="text-[10px] uppercase tracking-wide" style={{ color: colors?.textMuted }}>Parte A</p>
          <p className="text-xs font-medium">[Nombre del cliente]</p>
          <p className="text-[10px]" style={{ color: colors?.textMuted }}>NIF: [NIF]</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wide" style={{ color: colors?.textMuted }}>Parte B</p>
          <p className="text-xs font-medium">[Tu Empresa S.L.]</p>
          <p className="text-[10px]" style={{ color: colors?.textMuted }}>NIF: B12345678</p>
        </div>
      </div>
      
      {/* Clauses */}
      <div className="space-y-4 text-xs">
        {clauses.map((clause, i) => (
          <div key={i}>
            <div className="flex items-center gap-2 mb-1">
              <span 
                className="px-2 py-0.5 text-[9px] font-bold rounded"
                style={{ backgroundColor: colors?.headerBg || '#2563eb', color: '#fff' }}
              >
                {['PRIMERA', 'SEGUNDA', 'TERCERA', 'CUARTA'][i]}
              </span>
              <span className="font-semibold" style={{ color: colors?.text }}>{clause}</span>
            </div>
            <p className="text-[10px] leading-relaxed pl-2" style={{ color: colors?.textMuted }}>
              {i === 0 && 'El presente acuerdo tiene por objeto establecer los términos y condiciones bajo los cuales...'}
              {i === 1 && 'Ambas partes se comprometen a cumplir con las obligaciones establecidas en el presente documento...'}
              {i === 2 && 'Las condiciones económicas serán las siguientes: [detalles del precio y forma de pago]...'}
              {i === 3 && 'El presente contrato tendrá una duración de [X] años a partir de la fecha de firma...'}
            </p>
          </div>
        ))}
      </div>
      
      {/* Double signature */}
      <div className="grid grid-cols-2 gap-8 pt-12">
        <div className="text-center">
          <div className="w-24 h-px mx-auto mb-2" style={{ backgroundColor: colors?.text }}></div>
          <p className="text-[10px] font-medium" style={{ color: colors?.text }}>[Nombre cliente]</p>
          <p className="text-[9px]" style={{ color: colors?.textMuted }}>PARTE A</p>
        </div>
        <div className="text-center">
          <div className="w-24 h-px mx-auto mb-2" style={{ backgroundColor: colors?.text }}></div>
          <p className="text-[10px] font-medium" style={{ color: colors?.text }}>[Tu nombre]</p>
          <p className="text-[9px]" style={{ color: colors?.textMuted }}>PARTE B</p>
        </div>
      </div>
    </>
  );
}

// ============================================================
// INFORME BODY
// ============================================================
function ReportBody({ colors }: { colors: any }) {
  return (
    <>
      {/* KPIs grid */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {[
          { label: 'Marcas Activas', value: '42' },
          { label: 'Patentes', value: '8' },
          { label: 'Acciones Pend.', value: '5' },
          { label: 'Jurisdicciones', value: '12' },
        ].map((kpi, i) => (
          <div 
            key={i}
            className="p-2 rounded-lg border-l-2 text-center"
            style={{ 
              backgroundColor: colors?.backgroundAlt || '#f8fafc',
              borderColor: colors?.headerBg || '#2563eb',
            }}
          >
            <div className="text-lg font-bold" style={{ color: colors?.text }}>{kpi.value}</div>
            <div className="text-[8px]" style={{ color: colors?.textMuted }}>{kpi.label}</div>
          </div>
        ))}
      </div>
      
      {/* Section */}
      <div className="mb-4">
        <h3 
          className="text-xs font-bold mb-2 pb-1 border-b-2"
          style={{ color: colors?.text, borderColor: colors?.headerBg || '#2563eb' }}
        >
          Resumen Ejecutivo
        </h3>
        <p className="text-[10px] leading-relaxed" style={{ color: colors?.textMuted }}>
          El portfolio de propiedad intelectual de <span className="font-medium">[Cliente]</span> se 
          encuentra en buen estado general. Se identifican 3 acciones prioritarias para el próximo trimestre.
        </p>
      </div>
      
      {/* Table */}
      <div className="mb-4">
        <h3 className="text-xs font-bold mb-2" style={{ color: colors?.text }}>Plazos Críticos</h3>
        <table className="w-full border-collapse text-[9px]">
          <thead>
            <tr>
              <th className="text-left p-1.5" style={{ backgroundColor: colors?.tableHeadBg || '#2563eb', color: '#fff' }}>Activo</th>
              <th className="text-left p-1.5" style={{ backgroundColor: colors?.tableHeadBg || '#2563eb', color: '#fff' }}>Acción</th>
              <th className="text-center p-1.5" style={{ backgroundColor: colors?.tableHeadBg || '#2563eb', color: '#fff' }}>Fecha</th>
              <th className="text-center p-1.5" style={{ backgroundColor: colors?.tableHeadBg || '#2563eb', color: '#fff' }}>Prioridad</th>
            </tr>
          </thead>
          <tbody>
            {[
              { asset: 'MARCA PRINCIPAL', action: 'Renovación', date: '15/03/2026', priority: 'Alta', pColor: '#dc2626' },
              { asset: 'LOGO CORP', action: 'Extensión', date: '30/04/2026', priority: 'Media', pColor: '#f59e0b' },
              { asset: 'PATENTE-001', action: 'Anualidad', date: '15/05/2026', priority: 'Normal', pColor: '#22c55e' },
            ].map((row, i) => (
              <tr key={i}>
                <td className="p-1.5 border-b" style={{ borderColor: colors?.border, backgroundColor: i % 2 === 0 ? colors?.backgroundAlt : 'transparent' }}>{row.asset}</td>
                <td className="p-1.5 border-b" style={{ borderColor: colors?.border, backgroundColor: i % 2 === 0 ? colors?.backgroundAlt : 'transparent' }}>{row.action}</td>
                <td className="p-1.5 text-center border-b" style={{ borderColor: colors?.border, backgroundColor: i % 2 === 0 ? colors?.backgroundAlt : 'transparent' }}>{row.date}</td>
                <td className="p-1.5 text-center border-b" style={{ borderColor: colors?.border, backgroundColor: i % 2 === 0 ? colors?.backgroundAlt : 'transparent' }}>
                  <span className="px-1.5 py-0.5 rounded text-white text-[8px] font-medium" style={{ backgroundColor: row.pColor }}>{row.priority}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Footer */}
      <div className="pt-3 border-t text-[9px]" style={{ borderColor: colors?.border, color: colors?.textMuted }}>
        <p>Elaborado por: [Tu Empresa] · Fecha: [Fecha actual]</p>
      </div>
    </>
  );
}

// ============================================================
// PODER NOTARIAL BODY
// ============================================================
function PowerBody({ colors }: { colors: any }) {
  return (
    <>
      <div className="text-center mb-4">
        <h2 className="text-lg font-bold" style={{ color: colors?.text }}>PODER DE REPRESENTACIÓN</h2>
        <div className="w-20 h-0.5 mx-auto mt-1" style={{ backgroundColor: colors?.headerBg || '#2563eb' }}></div>
      </div>
      
      {/* Parties */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-[10px] uppercase" style={{ color: colors?.textMuted }}>Poderdante</p>
          <p className="text-xs font-medium">[Nombre del cliente]</p>
        </div>
        <div>
          <p className="text-[10px] uppercase" style={{ color: colors?.textMuted }}>Apoderado</p>
          <p className="text-xs font-medium">[Tu nombre/empresa]</p>
        </div>
      </div>
      
      {/* Offices */}
      <div className="p-3 rounded-lg mb-4 text-center" style={{ backgroundColor: colors?.backgroundAlt || '#f8fafc' }}>
        <p className="text-[9px] uppercase mb-2" style={{ color: colors?.textMuted }}>Oficinas Autorizadas</p>
        <div className="flex justify-center gap-4 text-2xl">
          <span>🇪🇸</span>
          <span>🇪🇺</span>
          <span>🌐</span>
        </div>
        <p className="text-[9px] mt-1" style={{ color: colors?.textMuted }}>OEPM · EUIPO · WIPO</p>
      </div>
      
      {/* Text */}
      <p className="text-[10px] leading-relaxed mb-6" style={{ color: colors?.textMuted }}>
        Por el presente documento, el Poderdante confiere poder especial al Apoderado para 
        que, en su nombre y representación, pueda realizar todas las gestiones necesarias 
        ante las oficinas de propiedad intelectual indicadas...
      </p>
      
      {/* Double signature + seal */}
      <div className="grid grid-cols-3 gap-4 pt-6">
        <div className="text-center">
          <div className="w-16 h-px mx-auto mb-2" style={{ backgroundColor: colors?.text }}></div>
          <p className="text-[9px]" style={{ color: colors?.textMuted }}>Poderdante</p>
        </div>
        <div className="text-center">
          <div 
            className="w-12 h-12 rounded-full mx-auto flex items-center justify-center border-2"
            style={{ borderColor: colors?.headerBg || '#2563eb' }}
          >
            <span className="text-[8px] font-bold" style={{ color: colors?.headerBg || '#2563eb' }}>NOTARIO</span>
          </div>
        </div>
        <div className="text-center">
          <div className="w-16 h-px mx-auto mb-2" style={{ backgroundColor: colors?.text }}></div>
          <p className="text-[9px]" style={{ color: colors?.textMuted }}>Apoderado</p>
        </div>
      </div>
    </>
  );
}

// ============================================================
// RENOVACIÓN BODY
// ============================================================
function RenewalBody({ colors }: { colors: any }) {
  return (
    <>
      {/* Expiry date box */}
      <div className="p-4 rounded-lg border-2 text-center mb-4" style={{ borderColor: '#f59e0b' }}>
        <p className="text-[10px] uppercase" style={{ color: '#92400e' }}>Fecha de Vencimiento</p>
        <p className="text-2xl font-bold my-1" style={{ color: colors?.text }}>15 ABR 2026</p>
        <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold" style={{ backgroundColor: '#fef3c7', color: '#92400e' }}>
          ⏳ 71 días restantes
        </span>
      </div>
      
      {/* Matter info */}
      <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: colors?.backgroundAlt || '#f8fafc' }}>
        <div className="grid grid-cols-2 gap-2 text-[10px]">
          <div><span style={{ color: colors?.textMuted }}>Referencia:</span> <span className="font-medium">[Referencia]</span></div>
          <div><span style={{ color: colors?.textMuted }}>Denominación:</span> <span className="font-medium">[Denominación]</span></div>
          <div><span style={{ color: colors?.textMuted }}>Titular:</span> <span className="font-medium">[Cliente]</span></div>
          <div><span style={{ color: colors?.textMuted }}>Clases Nice:</span> <span className="font-medium">[9, 35, 42]</span></div>
        </div>
      </div>
      
      {/* Costs table */}
      <table className="w-full border-collapse text-[10px] mb-4">
        <thead>
          <tr>
            <th className="text-left p-1.5" style={{ backgroundColor: colors?.tableHeadBg || '#2563eb', color: '#fff' }}>Concepto</th>
            <th className="text-right p-1.5" style={{ backgroundColor: colors?.tableHeadBg || '#2563eb', color: '#fff' }}>Importe</th>
          </tr>
        </thead>
        <tbody>
          <tr><td className="p-1.5 border-b" style={{ borderColor: colors?.border }}>Tasa renovación OEPM</td><td className="p-1.5 text-right border-b" style={{ borderColor: colors?.border }}>€400.00</td></tr>
          <tr><td className="p-1.5 border-b" style={{ borderColor: colors?.border }}>Honorarios profesionales</td><td className="p-1.5 text-right border-b" style={{ borderColor: colors?.border }}>€200.00</td></tr>
        </tbody>
        <tfoot>
          <tr>
            <td className="p-1.5 font-bold" style={{ backgroundColor: colors?.totalBg || '#2563eb', color: '#fff' }}>TOTAL</td>
            <td className="p-1.5 text-right font-bold" style={{ backgroundColor: colors?.totalBg || '#2563eb', color: '#fff' }}>€600.00</td>
          </tr>
        </tfoot>
      </table>
      
      {/* Alert */}
      <div className="p-2 rounded-lg border-l-4 text-[10px]" style={{ backgroundColor: '#fef3c7', borderColor: '#f59e0b', color: '#92400e' }}>
        <strong>Importante:</strong> Confirme la renovación antes del 15/03/2026 para evitar recargos.
      </div>
    </>
  );
}

// ============================================================
// RECIBO BODY
// ============================================================
function ReceiptBody({ colors }: { colors: any }) {
  return (
    <div className="text-center py-4">
      <p className="text-[10px] mb-2" style={{ color: colors?.textMuted }}>Recibo Nº 2026-0125</p>
      
      {/* Amount box */}
      <div 
        className="p-6 rounded-lg mb-4 border-2"
        style={{ borderColor: colors?.headerBg || '#2563eb', backgroundColor: `${colors?.headerBg || '#2563eb'}10` }}
      >
        <p className="text-3xl font-bold" style={{ color: colors?.headerBg || '#2563eb' }}>€2,450.00</p>
      </div>
      
      {/* Details */}
      <div className="text-left space-y-2 text-[10px] mb-6">
        <div className="flex"><span className="w-20" style={{ color: colors?.textMuted }}>Recibido de:</span> <span className="font-medium">[Cliente]</span></div>
        <div className="flex"><span className="w-20" style={{ color: colors?.textMuted }}>Concepto:</span> <span>[Referencia]</span></div>
        <div className="flex"><span className="w-20" style={{ color: colors?.textMuted }}>Forma pago:</span> <span>Transferencia</span></div>
        <div className="flex"><span className="w-20" style={{ color: colors?.textMuted }}>Fecha:</span> <span>[Fecha]</span></div>
      </div>
      
      {/* PAID stamp */}
      <div 
        className="inline-block px-6 py-2 rounded border-2 -rotate-6"
        style={{ borderColor: '#22c55e', color: '#22c55e' }}
      >
        <span className="text-xl font-bold">PAGADO</span>
      </div>
    </div>
  );
}

// ============================================================
// ACTA BODY
// ============================================================
function MeetingBody({ colors }: { colors: any }) {
  return (
    <>
      {/* Date/Time */}
      <div className="text-center mb-4 p-2 rounded-lg" style={{ backgroundColor: colors?.backgroundAlt || '#f8fafc' }}>
        <p className="text-xs font-medium" style={{ color: colors?.text }}>15 de Enero de 2026 · 10:00 - 11:30</p>
      </div>
      
      {/* Attendees */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-2 rounded-lg border" style={{ borderColor: colors?.border }}>
          <p className="text-[9px] uppercase mb-1" style={{ color: colors?.textMuted }}>Asistentes</p>
          <p className="text-[10px]">• Juan García</p>
          <p className="text-[10px]">• María López</p>
          <p className="text-[10px]">• [Cliente]</p>
        </div>
        <div className="p-2 rounded-lg border" style={{ borderColor: colors?.border }}>
          <p className="text-[9px] uppercase mb-1" style={{ color: colors?.textMuted }}>Ausentes</p>
          <p className="text-[10px]" style={{ color: colors?.textMuted }}>• Pedro Ruiz</p>
        </div>
      </div>
      
      {/* Numbered points */}
      <div className="space-y-3 text-[10px]">
        {['Revisión del estado del expediente', 'Estrategia de protección', 'Próximos pasos'].map((point, i) => (
          <div key={i} className="flex gap-2">
            <span 
              className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0"
              style={{ backgroundColor: colors?.headerBg || '#2563eb', color: '#fff' }}
            >
              {i + 1}
            </span>
            <div>
              <p className="font-semibold" style={{ color: colors?.text }}>{point}</p>
              <p style={{ color: colors?.textMuted }}>Se acordó que [descripción del acuerdo]...</p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Signature */}
      <div className="pt-6">
        <div className="w-20 h-px mb-1" style={{ backgroundColor: colors?.text }}></div>
        <p className="text-[9px]" style={{ color: colors?.textMuted }}>Secretario de la reunión</p>
      </div>
    </>
  );
}

// ============================================================
// CEASE & DESIST BODY
// ============================================================
function CeaseDesistBody({ colors }: { colors: any }) {
  return (
    <>
      {/* Subject */}
      <div className="mb-4 pb-2 border-b-2" style={{ borderColor: '#dc2626' }}>
        <p className="text-xs font-bold" style={{ color: '#dc2626' }}>REQUERIMIENTO DE CESE Y DESISTIMIENTO</p>
      </div>
      
      {/* Intro */}
      <p className="text-[10px] leading-relaxed mb-4" style={{ color: colors?.text }}>
        Nos dirigimos a usted en representación de <span className="font-medium">[Cliente]</span>, 
        titular de la marca registrada <span className="font-medium">[Denominación]</span>, para comunicarle 
        que hemos detectado un uso no autorizado de dicha marca.
      </p>
      
      {/* Demands */}
      <div className="space-y-2 mb-4">
        {['Cese inmediato del uso de la marca', 'Retirada de productos/materiales', 'Confirmación por escrito'].map((demand, i) => (
          <div key={i} className="flex gap-2 p-2 rounded-r-lg border-l-2" style={{ borderColor: '#dc2626', backgroundColor: '#fef2f2' }}>
            <span className="font-bold text-[10px]" style={{ color: '#dc2626' }}>{i + 1}.</span>
            <span className="text-[10px]" style={{ color: colors?.text }}>{demand}</span>
          </div>
        ))}
      </div>
      
      {/* Deadline warning */}
      <div className="p-3 rounded-lg text-center mb-4" style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}>
        <span className="text-sm font-bold" style={{ color: '#dc2626' }}>⚠ PLAZO: 10 días hábiles</span>
      </div>
      
      <p className="text-[10px]" style={{ color: colors?.textMuted }}>
        En caso de no recibir respuesta satisfactoria, nos reservamos el derecho a iniciar las acciones 
        legales pertinentes.
      </p>
      
      {/* Signature */}
      <div className="pt-6">
        <div className="w-20 h-px mb-1" style={{ backgroundColor: colors?.text }}></div>
        <p className="text-[9px] font-medium" style={{ color: colors?.text }}>[Nombre del abogado]</p>
      </div>
    </>
  );
}

export function TemplatePreviewModal({
  open,
  onOpenChange,
  documentType,
  defaultStyle,
  allStyles,
  isEnabled,
  onToggle,
  onStyleChange,
}: TemplatePreviewModalProps) {
  const { currentOrganization } = useOrganization();
  const [previewStyle, setPreviewStyle] = useState<DesignTokens | null>(defaultStyle);
  
  // Reset preview style when modal opens
  React.useEffect(() => {
    if (open && defaultStyle) {
      setPreviewStyle(defaultStyle);
    }
  }, [open, defaultStyle]);
  
  if (!documentType) return null;
  
  const colors = previewStyle?.colors || defaultStyle?.colors;
  const orgName = currentOrganization?.name || 'Tu Empresa S.L.';
  
  const handleStyleSelect = (style: DesignTokens) => {
    setPreviewStyle(style);
  };
  
  const handleSaveStyle = () => {
    if (previewStyle) {
      onStyleChange(previewStyle);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[90vh] p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b bg-slate-50/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{documentType.icon}</span>
              <div>
                <DialogTitle className="text-lg">{documentType.name}</DialogTitle>
                <p className="text-sm text-muted-foreground">
                  {CATEGORY_LABELS[documentType.category]} · Última edición: {new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Download dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="h-4 w-4" />
                    Descargar
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem className="gap-2">
                    <FileText className="h-4 w-4" />
                    Descargar PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    Descargar DOCX
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button variant="outline" size="sm" className="gap-2">
                <Edit className="h-4 w-4" />
                Editar
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        {/* Main content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Document preview */}
          <div className="flex-1 bg-slate-100 p-6 overflow-auto flex items-start justify-center">
            <div 
              className="bg-white rounded-lg shadow-lg overflow-hidden"
              style={{ 
                width: '480px',
                minHeight: '680px',
                backgroundColor: colors?.background || '#ffffff',
                fontSize: '11px',
              }}
            >
              {/* Document Header - universal */}
              <div
                className="px-5 py-4"
                style={{ backgroundColor: colors?.headerBg || '#2563eb' }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div 
                      className="w-20 h-6 rounded flex items-center justify-center text-[9px] font-medium"
                      style={{ 
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        color: colors?.headerText || '#ffffff',
                      }}
                    >
                      [Logo]
                    </div>
                    <h2 
                      className="text-sm font-bold mt-2"
                      style={{ color: colors?.headerText || '#ffffff' }}
                    >
                      {orgName}
                    </h2>
                    <p 
                      className="text-[10px] opacity-80"
                      style={{ color: colors?.headerText || '#ffffff' }}
                    >
                      C/ Gran Vía 42, 28013 Madrid
                    </p>
                  </div>
                  <div className="text-right">
                    <h1 
                      className="text-base font-bold uppercase"
                      style={{ color: colors?.headerText || '#ffffff' }}
                    >
                      {documentType.name}
                    </h1>
                    <p 
                      className="text-[10px] opacity-80 mt-0.5"
                      style={{ color: colors?.headerText || '#ffffff' }}
                    >
                      Nº: [Referencia]
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Document Body - varies by type */}
              <div className="p-5" style={{ color: colors?.text || '#333333' }}>
                {renderDocumentBody(documentType.id, colors)}
              </div>
            </div>
          </div>

          {/* Right: Settings panel */}
          <div className="w-80 border-l bg-white flex flex-col">
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-6">
                {/* Style selector */}
                <div>
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-500" />
                    Estilo visual
                  </h4>
                  <StyleSelectorInline
                    selectedStyleId={previewStyle?.id || null}
                    onSelect={handleStyleSelect}
                  />
                  {previewStyle?.id !== defaultStyle?.id && (
                    <Button 
                      size="sm" 
                      className="w-full mt-2 bg-cyan-500 hover:bg-cyan-600"
                      onClick={handleSaveStyle}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Guardar como estilo por defecto
                    </Button>
                  )}
                </div>
                
                {/* Tenant data */}
                <div>
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Datos de tu organización
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Building2 className="h-4 w-4 text-slate-400" />
                      <span>{orgName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      <span>C/ Gran Vía 42, 28013 Madrid</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Mail className="h-4 w-4 text-slate-400" />
                      <span>info@empresa.com</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Phone className="h-4 w-4 text-slate-400" />
                      <span>+34 91 555 0100</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Globe className="h-4 w-4 text-slate-400" />
                      <span>www.empresa.com</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    Estos datos se rellenan automáticamente desde la configuración de tu organización
                  </p>
                </div>
                
                {/* Placeholder variables */}
                <div>
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    Campos variables
                  </h4>
                  <div className="space-y-2">
                    {PLACEHOLDER_VARIABLES.map((v) => (
                      <div 
                        key={v.key}
                        className="flex items-center gap-2 text-sm p-2 rounded bg-amber-50 border border-amber-100"
                      >
                        <v.icon className="h-4 w-4 text-amber-600" />
                        <div>
                          <code className="text-xs text-amber-700 font-mono">
                            {`{${v.key}}`}
                          </code>
                          <span className="text-slate-500 ml-2 text-xs">
                            {v.label}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    Estos campos se rellenan con los datos del expediente y cliente
                  </p>
                </div>
              </div>
            </ScrollArea>
            
            {/* Footer actions */}
            <div className="p-4 border-t bg-slate-50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">Estado de la plantilla</span>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={isEnabled}
                    onCheckedChange={onToggle}
                    className="data-[state=checked]:bg-cyan-500"
                  />
                  <span className={cn(
                    'text-sm font-medium',
                    isEnabled ? 'text-emerald-600' : 'text-slate-400'
                  )}>
                    {isEnabled ? 'Activada' : 'Desactivada'}
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-500">
                {isEnabled 
                  ? 'Esta plantilla está disponible para generar documentos en expedientes'
                  : 'Esta plantilla no aparecerá en el selector de documentos'
                }
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
