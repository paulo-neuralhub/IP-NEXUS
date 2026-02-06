// ============================================================
// DOCUMENT THUMBNAIL - SVG Mini-documentos reconocibles
// Cada tipo tiene un SVG único que representa su estructura
// ============================================================

import * as React from 'react';
import { cn } from '@/lib/utils';
import type { DesignColors } from '@/lib/document-templates/designTokens';

// Map style names to accent colors
const STYLE_ACCENT_MAP: Record<string, string> = {
  'Clásico': '#1e293b',
  'Elegante': '#b45309',
  'Moderno': '#3b82f6',
  'Sofisticado': '#6366f1',
  'Corporativo': '#1e3a8a',
  'Creativo': '#ec4899',
  'Bold Orange': '#f97316',
  'Tech Dark': '#8b5cf6',
  'Wave Blue': '#0ea5e9',
  'Red Accent': '#ef4444',
  'Geometric': '#2563eb',
  'Split Green': '#22c55e',
  'Swiss': '#0f172a',
  'Navy & Gold': '#d97706',
  'Teal Executive': '#14b8a6',
  'Editorial': '#1e293b',
  'Monochrome': '#475569',
  'Dual Indigo': '#4f46e5',
};

interface DocumentThumbnailProps {
  typeId: string;
  styleName?: string;
  colors?: DesignColors | null;
  className?: string;
}

function getAccentColor(styleName?: string, colors?: DesignColors | null): string {
  if (colors?.headerBg) return colors.headerBg;
  if (styleName && STYLE_ACCENT_MAP[styleName]) return STYLE_ACCENT_MAP[styleName];
  return '#0ea5e9';
}

// ============================================================
// FACTURA SVG - Tabla con header y TOTAL
// ============================================================
function InvoiceSVG({ accent }: { accent: string }) {
  return (
    <svg viewBox="0 0 100 130" className="w-full h-full">
      {/* Paper background */}
      <rect x="5" y="5" width="90" height="120" rx="2" fill="white" stroke="#e2e8f0" strokeWidth="1"/>
      
      {/* Logo area */}
      <rect x="10" y="10" width="20" height="6" rx="1" fill="#1e293b"/>
      <rect x="10" y="18" width="14" height="2" rx="0.5" fill="#cbd5e1"/>
      
      {/* FACTURA label */}
      <text x="90" y="16" textAnchor="end" fontSize="5" fontWeight="bold" fill="#475569">FACTURA</text>
      <rect x="70" y="18" width="20" height="2" rx="0.5" fill="#e2e8f0"/>
      
      {/* Separator */}
      <line x1="10" y1="26" x2="90" y2="26" stroke="#e2e8f0" strokeWidth="0.5"/>
      
      {/* Client info */}
      <rect x="10" y="30" width="8" height="2" rx="0.5" fill="#94a3b8"/>
      <rect x="10" y="34" width="25" height="3" rx="0.5" fill="#334155"/>
      <rect x="10" y="39" width="18" height="2" rx="0.5" fill="#e2e8f0"/>
      
      {/* Date info */}
      <rect x="70" y="30" width="10" height="2" rx="0.5" fill="#94a3b8"/>
      <rect x="65" y="34" width="25" height="3" rx="0.5" fill="#334155"/>
      
      {/* TABLE - This is what makes it recognizable as invoice */}
      {/* Header row */}
      <rect x="10" y="50" width="50" height="6" rx="1" fill={accent}/>
      <rect x="62" y="50" width="12" height="6" rx="1" fill={accent}/>
      <rect x="76" y="50" width="14" height="6" rx="1" fill={accent}/>
      
      {/* Table rows */}
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect x="10" y={58 + i * 7} width="50" height="5" rx="0.5" fill="#f1f5f9"/>
          <rect x="62" y={58 + i * 7} width="12" height="5" rx="0.5" fill="#f1f5f9"/>
          <rect x="76" y={58 + i * 7} width="14" height="5" rx="0.5" fill="#f1f5f9"/>
        </g>
      ))}
      
      {/* Subtotals */}
      <rect x="55" y="90" width="18" height="2" rx="0.5" fill="#cbd5e1"/>
      <rect x="76" y="90" width="14" height="2" rx="0.5" fill="#cbd5e1"/>
      <rect x="55" y="95" width="18" height="2" rx="0.5" fill="#cbd5e1"/>
      <rect x="76" y="95" width="14" height="2" rx="0.5" fill="#cbd5e1"/>
      
      {/* TOTAL - The key visual element */}
      <rect x="55" y="100" width="35" height="8" rx="1" fill={accent}/>
      <rect x="58" y="103" width="12" height="3" rx="0.5" fill="white" fillOpacity="0.6"/>
      <rect x="75" y="103" width="12" height="3" rx="0.5" fill="white" fillOpacity="0.9"/>
    </svg>
  );
}

// ============================================================
// PRESUPUESTO SVG - Similar a factura pero con badge "QUOTE"
// ============================================================
function QuoteSVG({ accent }: { accent: string }) {
  return (
    <svg viewBox="0 0 100 130" className="w-full h-full">
      <rect x="5" y="5" width="90" height="120" rx="2" fill="white" stroke="#e2e8f0" strokeWidth="1"/>
      
      <rect x="10" y="10" width="20" height="6" rx="1" fill="#1e293b"/>
      <rect x="10" y="18" width="14" height="2" rx="0.5" fill="#cbd5e1"/>
      
      <text x="90" y="16" textAnchor="end" fontSize="4.5" fontWeight="bold" fill="#475569">PRESUPUESTO</text>
      <rect x="65" y="18" width="25" height="2" rx="0.5" fill="#e2e8f0"/>
      
      <line x1="10" y1="26" x2="90" y2="26" stroke="#e2e8f0" strokeWidth="0.5"/>
      
      <rect x="10" y="30" width="8" height="2" rx="0.5" fill="#94a3b8"/>
      <rect x="10" y="34" width="25" height="3" rx="0.5" fill="#334155"/>
      
      {/* Validity badge */}
      <rect x="65" y="32" width="25" height="8" rx="2" fill={accent} fillOpacity="0.1" stroke={accent} strokeWidth="0.5"/>
      <text x="77.5" y="37.5" textAnchor="middle" fontSize="3.5" fill={accent} fontWeight="bold">Válido 30 días</text>
      
      {/* Table */}
      <rect x="10" y="48" width="50" height="6" rx="1" fill={accent}/>
      <rect x="62" y="48" width="12" height="6" rx="1" fill={accent}/>
      <rect x="76" y="48" width="14" height="6" rx="1" fill={accent}/>
      
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect x="10" y={56 + i * 7} width="50" height="5" rx="0.5" fill="#f1f5f9"/>
          <rect x="62" y={56 + i * 7} width="12" height="5" rx="0.5" fill="#f1f5f9"/>
          <rect x="76" y={56 + i * 7} width="14" height="5" rx="0.5" fill="#f1f5f9"/>
        </g>
      ))}
      
      <rect x="55" y="88" width="35" height="8" rx="1" fill={accent}/>
      <rect x="58" y="91" width="12" height="3" rx="0.5" fill="white" fillOpacity="0.6"/>
      <rect x="75" y="91" width="12" height="3" rx="0.5" fill="white" fillOpacity="0.9"/>
      
      {/* Conditions */}
      <rect x="10" y="100" width="40" height="2" rx="0.5" fill="#e2e8f0"/>
      <rect x="10" y="104" width="35" height="2" rx="0.5" fill="#e2e8f0"/>
    </svg>
  );
}

// ============================================================
// NOTA DE CRÉDITO SVG - Tabla con saldo negativo
// ============================================================
function CreditNoteSVG({ accent }: { accent: string }) {
  return (
    <svg viewBox="0 0 100 130" className="w-full h-full">
      <rect x="5" y="5" width="90" height="120" rx="2" fill="white" stroke="#e2e8f0" strokeWidth="1"/>
      
      <rect x="10" y="10" width="20" height="6" rx="1" fill="#1e293b"/>
      
      <text x="90" y="16" textAnchor="end" fontSize="4" fontWeight="bold" fill="#dc2626">NOTA CRÉDITO</text>
      
      <line x1="10" y1="24" x2="90" y2="24" stroke="#e2e8f0" strokeWidth="0.5"/>
      
      {/* Reference to original invoice */}
      <rect x="10" y="28" width="30" height="8" rx="1" fill="#fef2f2" stroke="#fecaca" strokeWidth="0.5"/>
      <text x="25" y="33.5" textAnchor="middle" fontSize="3" fill="#dc2626">Ref: FAC-2024-001</text>
      
      <rect x="10" y="40" width="25" height="3" rx="0.5" fill="#334155"/>
      <rect x="10" y="45" width="18" height="2" rx="0.5" fill="#e2e8f0"/>
      
      {/* Table with negative amounts */}
      <rect x="10" y="54" width="50" height="6" rx="1" fill={accent}/>
      <rect x="62" y="54" width="28" height="6" rx="1" fill={accent}/>
      
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x="10" y={62 + i * 7} width="50" height="5" rx="0.5" fill="#f1f5f9"/>
          <rect x="62" y={62 + i * 7} width="28" height="5" rx="0.5" fill="#fef2f2"/>
        </g>
      ))}
      
      {/* TOTAL in red/negative */}
      <rect x="55" y="90" width="35" height="8" rx="1" fill="#dc2626"/>
      <text x="72.5" y="95.5" textAnchor="middle" fontSize="4" fill="white" fontWeight="bold">-€1,250.00</text>
    </svg>
  );
}

// ============================================================
// RECIBO SVG - Simple, con "PAGADO"
// ============================================================
function ReceiptSVG({ accent }: { accent: string }) {
  return (
    <svg viewBox="0 0 100 130" className="w-full h-full">
      <rect x="5" y="5" width="90" height="120" rx="2" fill="white" stroke="#e2e8f0" strokeWidth="1"/>
      
      <rect x="10" y="10" width="20" height="6" rx="1" fill="#1e293b"/>
      
      <text x="90" y="16" textAnchor="end" fontSize="5" fontWeight="bold" fill="#475569">RECIBO</text>
      
      <line x1="10" y1="24" x2="90" y2="24" stroke="#e2e8f0" strokeWidth="0.5"/>
      
      {/* Receipt number */}
      <text x="50" y="34" textAnchor="middle" fontSize="4" fill="#64748b">Nº 2024-0125</text>
      
      {/* Amount big */}
      <rect x="20" y="42" width="60" height="16" rx="2" fill={accent} fillOpacity="0.1" stroke={accent} strokeWidth="0.5"/>
      <text x="50" y="53" textAnchor="middle" fontSize="8" fill={accent} fontWeight="bold">€2,450.00</text>
      
      {/* Details */}
      <rect x="10" y="66" width="12" height="2" rx="0.5" fill="#94a3b8"/>
      <rect x="25" y="66" width="40" height="2" rx="0.5" fill="#334155"/>
      
      <rect x="10" y="72" width="12" height="2" rx="0.5" fill="#94a3b8"/>
      <rect x="25" y="72" width="30" height="2" rx="0.5" fill="#334155"/>
      
      <rect x="10" y="78" width="12" height="2" rx="0.5" fill="#94a3b8"/>
      <rect x="25" y="78" width="35" height="2" rx="0.5" fill="#334155"/>
      
      {/* PAGADO stamp */}
      <g transform="translate(50, 100) rotate(-15)">
        <rect x="-18" y="-8" width="36" height="16" rx="2" fill="none" stroke="#22c55e" strokeWidth="1.5"/>
        <text x="0" y="3" textAnchor="middle" fontSize="7" fill="#22c55e" fontWeight="bold">PAGADO</text>
      </g>
    </svg>
  );
}

// ============================================================
// CARTA OFICIAL SVG - Párrafos + firma
// ============================================================
function LetterSVG({ accent }: { accent: string }) {
  return (
    <svg viewBox="0 0 100 130" className="w-full h-full">
      <rect x="5" y="5" width="90" height="120" rx="2" fill="white" stroke="#e2e8f0" strokeWidth="1"/>
      
      {/* Header with logo */}
      <rect x="10" y="10" width="20" height="6" rx="1" fill="#1e293b"/>
      <rect x="10" y="18" width="14" height="2" rx="0.5" fill="#cbd5e1"/>
      <rect x="75" y="10" width="15" height="10" rx="1" fill={accent} fillOpacity="0.15"/>
      
      <line x1="10" y1="26" x2="90" y2="26" stroke="#e2e8f0" strokeWidth="0.5"/>
      
      {/* Recipient */}
      <rect x="10" y="30" width="8" height="2" rx="0.5" fill="#94a3b8"/>
      <rect x="10" y="34" width="30" height="3" rx="0.5" fill="#334155"/>
      <rect x="10" y="39" width="22" height="2" rx="0.5" fill="#e2e8f0"/>
      <rect x="10" y="43" width="18" height="2" rx="0.5" fill="#e2e8f0"/>
      
      {/* Subject line with accent */}
      <rect x="10" y="52" width="45" height="3" rx="0.5" fill="#334155"/>
      <rect x="10" y="56" width="80" height="1" fill={accent}/>
      
      {/* Paragraphs */}
      <rect x="10" y="62" width="80" height="2" rx="0.5" fill="#e2e8f0"/>
      <rect x="10" y="66" width="75" height="2" rx="0.5" fill="#e2e8f0"/>
      <rect x="10" y="70" width="60" height="2" rx="0.5" fill="#e2e8f0"/>
      
      <rect x="10" y="78" width="80" height="2" rx="0.5" fill="#e2e8f0"/>
      <rect x="10" y="82" width="70" height="2" rx="0.5" fill="#e2e8f0"/>
      <rect x="10" y="86" width="55" height="2" rx="0.5" fill="#e2e8f0"/>
      
      {/* Signature */}
      <rect x="10" y="98" width="25" height="1" fill="#334155"/>
      <rect x="10" y="102" width="20" height="2" rx="0.5" fill="#475569"/>
      <rect x="10" y="106" width="15" height="2" rx="0.5" fill="#94a3b8"/>
    </svg>
  );
}

// ============================================================
// CEASE & DESIST SVG - Legal urgency, red accents
// ============================================================
function CeaseDesistSVG() {
  return (
    <svg viewBox="0 0 100 130" className="w-full h-full">
      <rect x="5" y="5" width="90" height="120" rx="2" fill="white" stroke="#e2e8f0" strokeWidth="1"/>
      
      <rect x="10" y="10" width="20" height="6" rx="1" fill="#1e293b"/>
      
      {/* C&D label in red */}
      <rect x="70" y="8" width="20" height="10" rx="1" fill="#dc2626"/>
      <text x="80" y="15" textAnchor="middle" fontSize="5" fill="white" fontWeight="bold">C&D</text>
      
      <line x1="10" y1="24" x2="90" y2="24" stroke="#dc2626" strokeWidth="1"/>
      
      {/* Subject in red */}
      <rect x="10" y="30" width="50" height="3" rx="0.5" fill="#334155"/>
      <rect x="10" y="35" width="80" height="1" fill="#dc2626"/>
      
      {/* Intro paragraph */}
      <rect x="10" y="42" width="80" height="2" rx="0.5" fill="#e2e8f0"/>
      <rect x="10" y="46" width="70" height="2" rx="0.5" fill="#e2e8f0"/>
      
      {/* Demands with red left border */}
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x="10" y={55 + i * 12} width="2" height="10" fill="#dc2626"/>
          <rect x="15" y={55 + i * 12} width="25" height="2" rx="0.5" fill="#fca5a5"/>
          <rect x="15" y={59 + i * 12} width="70" height="2" rx="0.5" fill="#e2e8f0"/>
          <rect x="15" y={63 + i * 12} width="60" height="2" rx="0.5" fill="#e2e8f0"/>
        </g>
      ))}
      
      {/* Deadline warning */}
      <rect x="10" y="95" width="80" height="10" rx="1" fill="#fef2f2" stroke="#fecaca" strokeWidth="0.5"/>
      <text x="50" y="102" textAnchor="middle" fontSize="4" fill="#dc2626" fontWeight="bold">⚠ Responder en 10 días</text>
      
      {/* Signature */}
      <rect x="10" y="110" width="20" height="1" fill="#334155"/>
      <rect x="10" y="113" width="16" height="2" rx="0.5" fill="#475569"/>
    </svg>
  );
}

// ============================================================
// ACTA DE REUNIÓN SVG - 2 columnas + puntos numerados
// ============================================================
function MeetingMinutesSVG({ accent }: { accent: string }) {
  return (
    <svg viewBox="0 0 100 130" className="w-full h-full">
      <rect x="5" y="5" width="90" height="120" rx="2" fill="white" stroke="#e2e8f0" strokeWidth="1"/>
      
      {/* Header bar */}
      <rect x="5" y="5" width="90" height="14" rx="2" fill={accent}/>
      <text x="50" y="14" textAnchor="middle" fontSize="5" fill="white" fontWeight="bold">ACTA DE REUNIÓN</text>
      
      {/* Date/Time */}
      <rect x="10" y="24" width="35" height="6" rx="1" fill="#f1f5f9"/>
      <text x="27.5" y="28.5" textAnchor="middle" fontSize="3.5" fill="#64748b">15 Enero 2026, 10:00</text>
      
      {/* Two columns - Attendees */}
      <rect x="10" y="34" width="38" height="18" rx="1" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.5"/>
      <text x="12" y="40" fontSize="3" fill="#94a3b8">ASISTENTES</text>
      <rect x="12" y="43" width="20" height="2" rx="0.5" fill="#475569"/>
      <rect x="12" y="47" width="18" height="2" rx="0.5" fill="#475569"/>
      
      <rect x="52" y="34" width="38" height="18" rx="1" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.5"/>
      <text x="54" y="40" fontSize="3" fill="#94a3b8">AUSENTES</text>
      <rect x="54" y="43" width="16" height="2" rx="0.5" fill="#94a3b8"/>
      
      {/* Numbered sections */}
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <circle cx="14" cy={60 + i * 16} r="3" fill={accent}/>
          <text x="14" y={61.5 + i * 16} textAnchor="middle" fontSize="4" fill="white" fontWeight="bold">{i + 1}</text>
          <rect x="20" y={57 + i * 16} width="40" height="3" rx="0.5" fill="#334155"/>
          <rect x="20" y={62 + i * 16} width="70" height="2" rx="0.5" fill="#e2e8f0"/>
          <rect x="20" y={66 + i * 16} width="55" height="2" rx="0.5" fill="#e2e8f0"/>
        </g>
      ))}
      
      {/* Signature */}
      <rect x="10" y="110" width="25" height="1" fill="#334155"/>
      <rect x="10" y="113" width="18" height="2" rx="0.5" fill="#475569"/>
    </svg>
  );
}

// ============================================================
// INFORME SVG - KPIs + tabla
// ============================================================
function ReportSVG({ accent }: { accent: string }) {
  return (
    <svg viewBox="0 0 100 130" className="w-full h-full">
      <rect x="5" y="5" width="90" height="120" rx="2" fill="white" stroke="#e2e8f0" strokeWidth="1"/>
      
      {/* Header */}
      <rect x="5" y="5" width="90" height="14" rx="2" fill={accent}/>
      <text x="50" y="14" textAnchor="middle" fontSize="5" fill="white" fontWeight="bold">INFORME</text>
      
      {/* 4 KPI boxes - key visual */}
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect x={10 + i * 21} y="24" width="18" height="16" rx="1" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.5"/>
          <rect x={10 + i * 21} y="24" width="2" height="16" fill={accent}/>
          <text x={19 + i * 21} y="33" textAnchor="middle" fontSize="6" fill="#334155" fontWeight="bold">{[42, 18, 95, 12][i]}</text>
          <rect x={13 + i * 21} y="36" width="12" height="2" rx="0.5" fill="#94a3b8"/>
        </g>
      ))}
      
      {/* Section title */}
      <rect x="10" y="46" width="30" height="3" rx="0.5" fill={accent}/>
      <rect x="10" y="51" width="80" height="2" rx="0.5" fill="#e2e8f0"/>
      <rect x="10" y="55" width="65" height="2" rx="0.5" fill="#e2e8f0"/>
      
      {/* Data table */}
      <rect x="10" y="64" width="50" height="5" rx="0.5" fill={accent}/>
      <rect x="62" y="64" width="14" height="5" rx="0.5" fill={accent}/>
      <rect x="78" y="64" width="12" height="5" rx="0.5" fill={accent}/>
      
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect x="10" y={71 + i * 6} width="50" height="4" rx="0.5" fill="#f8fafc"/>
          <rect x="62" y={71 + i * 6} width="14" height="4" rx="0.5" fill="#f8fafc"/>
          <rect x="78" y={71 + i * 6} width="12" height="4" rx="0.5" fill="#f8fafc"/>
        </g>
      ))}
      
      {/* Chart placeholder */}
      <rect x="10" y="100" width="80" height="18" rx="1" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.5"/>
      <polyline points="15,115 30,108 45,112 60,105 75,110 85,103" fill="none" stroke={accent} strokeWidth="1.5"/>
    </svg>
  );
}

// ============================================================
// CONTRATO SVG - Cláusulas numeradas + doble firma
// ============================================================
function ContractSVG({ accent, label = "CONTRATO" }: { accent: string; label?: string }) {
  return (
    <svg viewBox="0 0 100 130" className="w-full h-full">
      <rect x="5" y="5" width="90" height="120" rx="2" fill="white" stroke="#e2e8f0" strokeWidth="1"/>
      
      {/* Centered header */}
      <text x="50" y="18" textAnchor="middle" fontSize="6" fill="#1e293b" fontWeight="bold">{label}</text>
      <rect x="35" y="22" width="30" height="1" fill={accent}/>
      
      {/* Parties */}
      <rect x="10" y="30" width="8" height="2" rx="0.5" fill="#94a3b8"/>
      <rect x="20" y="30" width="25" height="2" rx="0.5" fill="#334155"/>
      <rect x="55" y="30" width="8" height="2" rx="0.5" fill="#94a3b8"/>
      <rect x="65" y="30" width="25" height="2" rx="0.5" fill="#334155"/>
      
      <line x1="10" y1="38" x2="90" y2="38" stroke="#e2e8f0" strokeWidth="0.5"/>
      
      {/* Numbered clauses - key visual */}
      {['PRIMERA', 'SEGUNDA', 'TERCERA', 'CUARTA'].map((_, i) => (
        <g key={i}>
          <rect x="10" y={42 + i * 14} width="18" height="3" rx="0.5" fill={accent}/>
          <rect x="10" y={47 + i * 14} width="80" height="2" rx="0.5" fill="#e2e8f0"/>
          <rect x="10" y={51 + i * 14} width="70" height="2" rx="0.5" fill="#e2e8f0"/>
        </g>
      ))}
      
      {/* Double signature - key visual */}
      <g>
        <rect x="10" y="102" width="30" height="1" fill="#334155"/>
        <rect x="10" y="106" width="25" height="2" rx="0.5" fill="#475569"/>
        <text x="25" y="115" textAnchor="middle" fontSize="3" fill="#94a3b8">PARTE A</text>
      </g>
      <g>
        <rect x="60" y="102" width="30" height="1" fill="#334155"/>
        <rect x="60" y="106" width="25" height="2" rx="0.5" fill="#475569"/>
        <text x="75" y="115" textAnchor="middle" fontSize="3" fill="#94a3b8">PARTE B</text>
      </g>
    </svg>
  );
}

// ============================================================
// PODER NOTARIAL SVG - Formal, oficinas, sellos
// ============================================================
function PowerOfAttorneySVG({ accent }: { accent: string }) {
  return (
    <svg viewBox="0 0 100 130" className="w-full h-full">
      <rect x="5" y="5" width="90" height="120" rx="2" fill="white" stroke="#e2e8f0" strokeWidth="1"/>
      
      {/* Formal centered header */}
      <text x="50" y="16" textAnchor="middle" fontSize="6" fill="#1e293b" fontWeight="bold">PODER</text>
      <text x="50" y="22" textAnchor="middle" fontSize="3" fill="#64748b">DE REPRESENTACIÓN</text>
      <rect x="30" y="25" width="40" height="1" fill={accent}/>
      
      {/* Principal & Agent */}
      <rect x="10" y="32" width="12" height="2" rx="0.5" fill="#94a3b8"/>
      <rect x="10" y="36" width="30" height="3" rx="0.5" fill="#334155"/>
      <rect x="55" y="32" width="12" height="2" rx="0.5" fill="#94a3b8"/>
      <rect x="55" y="36" width="30" height="3" rx="0.5" fill="#334155"/>
      
      {/* Office flags - 3 jurisdictions */}
      <rect x="25" y="46" width="50" height="14" rx="1" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.5"/>
      <text x="50" y="52" textAnchor="middle" fontSize="3" fill="#94a3b8">OFICINAS AUTORIZADAS</text>
      <text x="35" y="58" fontSize="8">🇪🇸</text>
      <text x="48" y="58" fontSize="8">🇪🇺</text>
      <text x="61" y="58" fontSize="8">🌐</text>
      
      {/* Text paragraphs */}
      <rect x="10" y="66" width="80" height="2" rx="0.5" fill="#e2e8f0"/>
      <rect x="10" y="70" width="75" height="2" rx="0.5" fill="#e2e8f0"/>
      <rect x="10" y="74" width="65" height="2" rx="0.5" fill="#e2e8f0"/>
      <rect x="10" y="78" width="70" height="2" rx="0.5" fill="#e2e8f0"/>
      
      {/* Double signature */}
      <rect x="10" y="90" width="30" height="1" fill="#334155"/>
      <rect x="10" y="93" width="22" height="2" rx="0.5" fill="#475569"/>
      <rect x="60" y="90" width="30" height="1" fill="#334155"/>
      <rect x="60" y="93" width="22" height="2" rx="0.5" fill="#475569"/>
      
      {/* Notary seal */}
      <circle cx="50" cy="112" r="8" fill="none" stroke={accent} strokeWidth="1"/>
      <circle cx="50" cy="112" r="5" fill="none" stroke={accent} strokeWidth="0.5"/>
      <text x="50" y="114" textAnchor="middle" fontSize="3" fill={accent} fontWeight="bold">NOTARIO</text>
    </svg>
  );
}

// ============================================================
// CERTIFICADO SVG - Centered, formal, seals
// ============================================================
function CertificateSVG({ accent }: { accent: string }) {
  return (
    <svg viewBox="0 0 100 130" className="w-full h-full">
      <rect x="5" y="5" width="90" height="120" rx="2" fill="white" stroke="#e2e8f0" strokeWidth="1"/>
      
      {/* Decorative border */}
      <rect x="8" y="8" width="84" height="114" rx="1" fill="none" stroke={accent} strokeWidth="0.5" strokeDasharray="2,1"/>
      
      {/* Central logo */}
      <circle cx="50" cy="28" r="10" fill="none" stroke={accent} strokeWidth="1.5"/>
      <circle cx="50" cy="28" r="6" fill={accent} fillOpacity="0.1"/>
      <text x="50" y="31" textAnchor="middle" fontSize="6" fill={accent} fontWeight="bold">✓</text>
      
      {/* Title */}
      <text x="50" y="50" textAnchor="middle" fontSize="7" fill="#1e293b" fontWeight="bold">CERTIFICADO</text>
      <rect x="25" y="54" width="50" height="1" fill={accent}/>
      
      {/* Data grid - 2x2 */}
      {[0, 1].map((row) => (
        <g key={row}>
          {[0, 1].map((col) => (
            <g key={col}>
              <rect x={15 + col * 38} y={62 + row * 16} width="32" height="12" rx="1" fill="#f8fafc"/>
              <rect x={17 + col * 38} y={64 + row * 16} width="12" height="2" rx="0.5" fill="#94a3b8"/>
              <rect x={17 + col * 38} y={68 + row * 16} width="20" height="3" rx="0.5" fill="#334155"/>
            </g>
          ))}
        </g>
      ))}
      
      {/* Official seals - 3 circles */}
      <circle cx="30" cy="108" r="6" fill="none" stroke={accent} strokeWidth="1"/>
      <text x="30" y="110" textAnchor="middle" fontSize="4" fill={accent}>✓</text>
      
      <circle cx="50" cy="108" r="6" fill="none" stroke={accent} strokeWidth="1"/>
      <text x="50" y="110" textAnchor="middle" fontSize="4" fill={accent}>✓</text>
      
      <circle cx="70" cy="108" r="6" fill="none" stroke={accent} strokeWidth="1"/>
      <text x="70" y="110" textAnchor="middle" fontSize="4" fill={accent}>✓</text>
    </svg>
  );
}

// ============================================================
// RENOVACIÓN SVG - Fecha destacada, urgency
// ============================================================
function RenewalSVG({ accent }: { accent: string }) {
  return (
    <svg viewBox="0 0 100 130" className="w-full h-full">
      <rect x="5" y="5" width="90" height="120" rx="2" fill="white" stroke="#e2e8f0" strokeWidth="1"/>
      
      <rect x="10" y="10" width="20" height="6" rx="1" fill="#1e293b"/>
      
      <text x="90" y="16" textAnchor="end" fontSize="4" fontWeight="bold" fill="#475569">RENOVACIÓN</text>
      
      <line x1="10" y1="22" x2="90" y2="22" stroke="#e2e8f0" strokeWidth="0.5"/>
      
      {/* Expiry date box - key visual */}
      <rect x="20" y="28" width="60" height="28" rx="2" fill="none" stroke="#f59e0b" strokeWidth="2"/>
      <text x="50" y="38" textAnchor="middle" fontSize="3" fill="#92400e">FECHA DE VENCIMIENTO</text>
      <text x="50" y="48" textAnchor="middle" fontSize="8" fill="#1e293b" fontWeight="bold">15 ABR 2026</text>
      
      {/* Days remaining badge */}
      <rect x="30" y="58" width="40" height="10" rx="5" fill="#fef3c7"/>
      <text x="50" y="65" textAnchor="middle" fontSize="4" fill="#92400e" fontWeight="bold">⏳ 71 DÍAS</text>
      
      {/* Items table */}
      <rect x="10" y="74" width="50" height="5" rx="0.5" fill="#1e293b"/>
      <rect x="62" y="74" width="14" height="5" rx="0.5" fill="#1e293b"/>
      <rect x="78" y="74" width="12" height="5" rx="0.5" fill="#1e293b"/>
      
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x="10" y={81 + i * 6} width="50" height="4" rx="0.5" fill="#f8fafc"/>
          <rect x="62" y={81 + i * 6} width="14" height="4" rx="0.5" fill="#f8fafc"/>
          <rect x="78" y={81 + i * 6} width="12" height="4" rx="0.5" fill="#f8fafc"/>
        </g>
      ))}
      
      {/* Alert */}
      <rect x="10" y="102" width="80" height="12" rx="1" fill="#fef3c7" stroke="#fcd34d" strokeWidth="0.5"/>
      <rect x="10" y="102" width="3" height="12" fill="#f59e0b"/>
      <rect x="16" y="106" width="60" height="2" rx="0.5" fill="#d97706"/>
      <rect x="16" y="110" width="45" height="2" rx="0.5" fill="#fbbf24"/>
    </svg>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export function DocumentThumbnail({ typeId, styleName, colors, className }: DocumentThumbnailProps) {
  const accent = getAccentColor(styleName, colors);
  
  const getThumbnailComponent = () => {
    const id = typeId.toLowerCase();
    
    // Financiero
    if (id === 'invoice' || id === 'factura') return <InvoiceSVG accent={accent} />;
    if (id === 'quote' || id === 'presupuesto') return <QuoteSVG accent={accent} />;
    if (id === 'credit-note' || id === 'nota-credito' || id.includes('credit')) return <CreditNoteSVG accent={accent} />;
    if (id === 'receipt' || id === 'recibo') return <ReceiptSVG accent={accent} />;
    
    // Comunicación
    if (id === 'official-letter' || id === 'carta' || id.includes('letter')) return <LetterSVG accent={accent} />;
    if (id === 'cease-desist' || id === 'cease' || id.includes('cease')) return <CeaseDesistSVG />;
    if (id === 'meeting-minutes' || id === 'acta' || id.includes('meeting') || id.includes('minutes')) return <MeetingMinutesSVG accent={accent} />;
    
    // Informes - IDs específicos de la BD
    if (id === 'informe' || id === 'portfolio-report' || id.includes('portfolio')) return <ReportSVG accent={accent} />;
    if (id === 'vigilancia' || id === 'watch-report' || id.includes('surveillance') || id.includes('watch')) return <ReportSVG accent={accent} />;
    
    // Legal
    if (id === 'contract' || id === 'contrato') return <ContractSVG accent={accent} label="CONTRATO" />;
    if (id === 'nda' || id.includes('confidential')) return <ContractSVG accent={accent} label="NDA" />;
    if (id === 'license' || id === 'licencia') return <ContractSVG accent={accent} label="LICENCIA" />;
    if (id === 'power-of-attorney' || id === 'poder' || id.includes('power')) return <PowerOfAttorneySVG accent={accent} />;
    
    // IP
    if (id === 'certificate' || id === 'certificado') return <CertificateSVG accent={accent} />;
    if (id === 'renewal' || id === 'renovacion' || id.includes('renewal')) return <RenewalSVG accent={accent} />;
    
    // Default - letter
    return <LetterSVG accent={accent} />;
  };
  
  return (
    <div 
      className={cn(
        "bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden",
        className
      )}
      style={{ aspectRatio: '1/1.3' }}
    >
      {getThumbnailComponent()}
    </div>
  );
}
