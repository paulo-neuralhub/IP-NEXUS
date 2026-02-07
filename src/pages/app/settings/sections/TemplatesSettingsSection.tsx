// ============================================================
// TEMPLATES SETTINGS SECTION — Embedded in Settings > Organization
// 15 tipos × 18 estilos = 270 combinaciones
// ============================================================

import * as React from 'react';
import { useState, useCallback, useMemo } from 'react';
import { generateDocumentHTML } from '@/lib/document-templates/pdf-engine';

// ── DESIGN TOKENS (18 estilos) ──────────────────────────────
interface StyleToken {
  id: string;
  name: string;
  pack: 'Classic' | 'Modern' | 'Executive';
  primary: string;
  accent: string;
  headerBg: string;
  headerText: string;
  tableBg: string;
  totalBg: string;
  altBg: string;
  border: string;
  font: string;
  dark?: boolean;
  gradient?: string;
}

const STYLES: StyleToken[] = [
  { id: "clasico", name: "Clásico", pack: "Classic", primary: "#1a1a1a", accent: "#1a1a1a", headerBg: "#1a1a1a", headerText: "#fff", tableBg: "#1a1a1a", totalBg: "#1a1a1a", altBg: "#f9f9f9", border: "#ddd", font: "'Libre Baskerville', serif" },
  { id: "elegante", name: "Elegante", pack: "Classic", primary: "#f0e6d3", accent: "#c5a679", headerBg: "#1a1520", headerText: "#f0e6d3", tableBg: "rgba(197,166,121,0.12)", totalBg: "#c5a679", altBg: "#13101a", border: "rgba(197,166,121,0.15)", font: "'Cormorant Garamond', serif", dark: true },
  { id: "moderno", name: "Moderno", pack: "Classic", primary: "#1e293b", accent: "#2563eb", headerBg: "#2563eb", headerText: "#fff", tableBg: "#2563eb", totalBg: "#2563eb", altBg: "#f8fafc", border: "#e2e8f0", font: "'Outfit', sans-serif" },
  { id: "sofisticado", name: "Sofisticado", pack: "Classic", primary: "#1a202c", accent: "#667eea", headerBg: "#1a202c", headerText: "#cbd5e0", tableBg: "#667eea", totalBg: "#1a202c", altBg: "#f7fafc", border: "#edf2f7", font: "'Sora', sans-serif" },
  { id: "corporativo", name: "Corporativo", pack: "Classic", primary: "#1f2937", accent: "#0f4c81", headerBg: "#0f4c81", headerText: "#fff", tableBg: "#0f4c81", totalBg: "#0f4c81", altBg: "#f9fafb", border: "#e5e7eb", font: "'DM Sans', sans-serif" },
  { id: "creativo", name: "Creativo", pack: "Classic", primary: "#1a1a2e", accent: "#f43f5e", headerBg: "#fff", headerText: "#1a1a2e", tableBg: "#f43f5e", totalBg: "#f43f5e", altBg: "#fafafa", border: "#f0f0f0", font: "'Sora', sans-serif", gradient: "linear-gradient(135deg, #f43f5e, #8b5cf6)" },
  { id: "bold-orange", name: "Bold Orange", pack: "Modern", primary: "#1a1a1a", accent: "#f97316", headerBg: "#1a1a1a", headerText: "#fff", tableBg: "#1a1a1a", totalBg: "#f97316", altBg: "#fef7f0", border: "#f0f0f0", font: "'Outfit', sans-serif" },
  { id: "tech-dark", name: "Tech Dark", pack: "Modern", primary: "#fff", accent: "#6366f1", headerBg: "#0c0c14", headerText: "#fff", tableBg: "transparent", totalBg: "#6366f1", altBg: "#111119", border: "rgba(99,102,241,0.1)", font: "'Sora', sans-serif", dark: true },
  { id: "wave-blue", name: "Wave Blue", pack: "Modern", primary: "#1e293b", accent: "#0369a1", headerBg: "#0369a1", headerText: "#fff", tableBg: "#0369a1", totalBg: "#0369a1", altBg: "#f8fafc", border: "#f1f5f9", font: "'Manrope', sans-serif" },
  { id: "red-accent", name: "Red Accent", pack: "Modern", primary: "#1f2937", accent: "#dc2626", headerBg: "#fff", headerText: "#1f2937", tableBg: "#fff", totalBg: "#dc2626", altBg: "#fef2f2", border: "#f3f4f6", font: "'Urbanist', sans-serif" },
  { id: "geometric", name: "Geometric", pack: "Modern", primary: "#0f172a", accent: "#3b82f6", headerBg: "#fff", headerText: "#0f172a", tableBg: "transparent", totalBg: "#3b82f6", altBg: "#f8fafc", border: "#e2e8f0", font: "'Poppins', sans-serif" },
  { id: "split-green", name: "Split Green", pack: "Modern", primary: "#111", accent: "#16a34a", headerBg: "#16a34a", headerText: "#fff", tableBg: "#16a34a", totalBg: "#16a34a", altBg: "#f0fdf4", border: "#e5e7eb", font: "'Plus Jakarta Sans', sans-serif" },
  { id: "swiss", name: "Swiss Precision", pack: "Executive", primary: "#0a0a0a", accent: "#0a0a0a", headerBg: "#0a0a0a", headerText: "#fff", tableBg: "#fafafa", totalBg: "#0a0a0a", altBg: "#fafafa", border: "#e5e5e5", font: "'Inter Tight', sans-serif" },
  { id: "navy-gold", name: "Navy & Gold", pack: "Executive", primary: "#1b2541", accent: "#c6a367", headerBg: "#1b2541", headerText: "#fff", tableBg: "transparent", totalBg: "#1b2541", altBg: "#faf8f5", border: "#e8e0d4", font: "'Playfair Display', serif" },
  { id: "teal-exec", name: "Teal Executive", pack: "Executive", primary: "#0f172a", accent: "#0d9488", headerBg: "#fff", headerText: "#0f172a", tableBg: "transparent", totalBg: "#0d9488", altBg: "#f8fffe", border: "#e2e8f0", font: "'IBM Plex Sans', sans-serif" },
  { id: "editorial", name: "Editorial", pack: "Executive", primary: "#1a1a1a", accent: "#1a1a1a", headerBg: "#faf9f6", headerText: "#1a1a1a", tableBg: "transparent", totalBg: "#1a1a1a", altBg: "#f5f3ee", border: "#e0ddd6", font: "'Fraunces', serif" },
  { id: "monochrome", name: "Monochrome", pack: "Executive", primary: "#111", accent: "#333", headerBg: "#333", headerText: "#fff", tableBg: "#333", totalBg: "#333", altBg: "#fafafa", border: "#eee", font: "'Space Grotesk', sans-serif" },
  { id: "dual-indigo", name: "Dual Indigo", pack: "Executive", primary: "#1e1b4b", accent: "#6366f1", headerBg: "#312e81", headerText: "#fff", tableBg: "transparent", totalBg: "#6366f1", altBg: "#f5f3ff", border: "#e0e7ff", font: "'Manrope', sans-serif" },
];

// ── 15 TIPOS DE DOCUMENTO ───────────────────────────────────
interface DocType {
  id: string;
  name: string;
  cat: string;
  icon: string;
  desc: string;
}

const DOC_TYPES: DocType[] = [
  { id: "factura", name: "Factura", cat: "Financiero", icon: "📄", desc: "Facturación de servicios con desglose IVA" },
  { id: "presupuesto", name: "Presupuesto", cat: "Financiero", icon: "💰", desc: "Propuesta económica con condiciones" },
  { id: "nota-credito", name: "Nota de Crédito", cat: "Financiero", icon: "↩️", desc: "Ajuste sobre factura emitida" },
  { id: "recibo", name: "Recibo de Pago", cat: "Financiero", icon: "🧾", desc: "Confirmación de pago recibido" },
  { id: "carta", name: "Carta Oficial", cat: "Comunicación", icon: "✉️", desc: "Comunicaciones formales" },
  { id: "cease", name: "Cease & Desist", cat: "Comunicación", icon: "⚖️", desc: "Requerimiento por infracción" },
  { id: "acta", name: "Acta de Reunión", cat: "Comunicación", icon: "📝", desc: "Resumen y acuerdos de reuniones" },
  { id: "informe", name: "Informe Portfolio", cat: "Informes", icon: "📊", desc: "Estado del portfolio IP del cliente" },
  { id: "vigilancia", name: "Informe Vigilancia", cat: "Informes", icon: "🔍", desc: "Alertas semanales de monitorización" },
  { id: "contrato", name: "Contrato de Servicios", cat: "Legal", icon: "📋", desc: "Acuerdo de prestación de servicios" },
  { id: "nda", name: "NDA", cat: "Legal", icon: "🔒", desc: "Acuerdo de confidencialidad bilateral" },
  { id: "licencia", name: "Licencia de Marca", cat: "Legal", icon: "🤝", desc: "Acuerdo de licencia con royalties" },
  { id: "poder", name: "Poder Notarial", cat: "Legal", icon: "🏛️", desc: "Representación ante oficinas IP" },
  { id: "certificado", name: "Certificado", cat: "IP", icon: "🏆", desc: "Certificado de registro completado" },
  { id: "renovacion", name: "Aviso de Renovación", cat: "IP", icon: "🔄", desc: "Aviso de vencimiento y costes" },
];

interface CategoryDef {
  id: string;
  name: string;
  icon: string;
  count: number;
}

const CATEGORIES: CategoryDef[] = [
  { id: "all", name: "Todas", icon: "⊞", count: 15 },
  { id: "Financiero", name: "Financiero", icon: "💰", count: 4 },
  { id: "Comunicación", name: "Comunicación", icon: "📨", count: 3 },
  { id: "Informes", name: "Informes", icon: "📊", count: 2 },
  { id: "Legal", name: "Legal", icon: "⚖️", count: 4 },
  { id: "IP", name: "IP", icon: "🏆", count: 2 },
];

// ── SVG THUMBNAIL GENERATORS ────────────────────────────────

function ThumbnailFactura({ style }: { style: StyleToken }) {
  return (
    <svg viewBox="0 0 170 220" className="w-full h-full">
      <rect width="170" height="220" fill={style.dark ? style.headerBg : "#fff"} rx="2" />
      <rect x="0" y="0" width="170" height="36" fill={style.headerBg} rx="2" />
      <rect x="10" y="10" width="50" height="6" rx="1" fill={style.headerText} opacity="0.9" />
      <rect x="10" y="20" width="30" height="3" rx="1" fill={style.headerText} opacity="0.4" />
      <rect x="110" y="10" width="48" height="8" rx="1" fill={style.headerText} opacity="0.8" />
      <rect x="125" y="22" width="33" height="3" rx="1" fill={style.headerText} opacity="0.4" />
      <rect x="10" y="44" width="45" height="3" rx="1" fill={style.dark ? "#555" : "#ccc"} />
      <rect x="10" y="50" width="70" height="4" rx="1" fill={style.dark ? style.primary : "#333"} opacity="0.7" />
      <rect x="10" y="57" width="55" height="3" rx="1" fill={style.dark ? "#555" : "#bbb"} />
      <line x1="10" y1="67" x2="160" y2="67" stroke={style.border} strokeWidth="0.5" />
      <rect x="10" y="74" width="150" height="14" rx="3" fill={style.tableBg || style.accent} />
      <rect x="14" y="79" width="40" height="3" rx="1" fill={style.headerText || "#fff"} opacity="0.8" />
      <rect x="90" y="79" width="18" height="3" rx="1" fill={style.headerText || "#fff"} opacity="0.6" />
      <rect x="120" y="79" width="12" height="3" rx="1" fill={style.headerText || "#fff"} opacity="0.6" />
      <rect x="142" y="79" width="14" height="3" rx="1" fill={style.headerText || "#fff"} opacity="0.8" />
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i}>
          <rect x="10" y={94 + i * 16} width="150" height="14" fill={i % 2 === 1 ? style.altBg : "transparent"} />
          <rect x="14" y={99 + i * 16} width={50 + Math.sin(i * 2) * 15} height="3" rx="1" fill={style.dark ? "#666" : "#999"} />
          <rect x="92" y={99 + i * 16} width="16" height="3" rx="1" fill={style.dark ? "#555" : "#bbb"} />
          <rect x="120" y={99 + i * 16} width="8" height="3" rx="1" fill={style.dark ? "#555" : "#bbb"} />
          <rect x="140" y={99 + i * 16} width="16" height="3" rx="1" fill={style.dark ? "#666" : "#999"} />
        </g>
      ))}
      <rect x="100" y="180" width="60" height="4" rx="1" fill={style.dark ? "#555" : "#ccc"} />
      <rect x="100" y="188" width="60" height="4" rx="1" fill={style.dark ? "#555" : "#ccc"} />
      <rect x="95" y="196" width="65" height="12" rx="3" fill={style.totalBg} />
      <rect x="102" y="200" width="20" height="4" rx="1" fill="#fff" opacity="0.9" />
      <rect x="138" y="200" width="16" height="4" rx="1" fill="#fff" opacity="0.9" />
      <line x1="10" y1="214" x2="160" y2="214" stroke={style.border} strokeWidth="0.3" />
    </svg>
  );
}

function ThumbnailPresupuesto({ style }: { style: StyleToken }) {
  return (
    <svg viewBox="0 0 170 220" className="w-full h-full">
      <rect width="170" height="220" fill={style.dark ? style.headerBg : "#fff"} rx="2" />
      <rect x="0" y="0" width="170" height="36" fill={style.headerBg} rx="2" />
      <rect x="10" y="10" width="50" height="6" rx="1" fill={style.headerText} opacity="0.9" />
      <rect x="10" y="20" width="30" height="3" rx="1" fill={style.headerText} opacity="0.4" />
      <rect x="100" y="8" width="58" height="10" rx="1" fill={style.accent} opacity="0.3" />
      <rect x="106" y="11" width="46" height="4" rx="1" fill={style.headerText} opacity="0.9" />
      <rect x="125" y="22" width="33" height="3" rx="1" fill={style.headerText} opacity="0.4" />
      <rect x="10" y="44" width="45" height="3" rx="1" fill={style.dark ? "#555" : "#ccc"} />
      <rect x="10" y="50" width="65" height="4" rx="1" fill={style.dark ? style.primary : "#333"} opacity="0.7" />
      <line x1="10" y1="62" x2="160" y2="62" stroke={style.border} strokeWidth="0.5" />
      <rect x="10" y="68" width="150" height="14" rx="3" fill={style.tableBg || style.accent} />
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect x="10" y={88 + i * 16} width="150" height="14" fill={i % 2 === 1 ? style.altBg : "transparent"} />
          <rect x="14" y={93 + i * 16} width={55 + i * 5} height="3" rx="1" fill={style.dark ? "#666" : "#999"} />
          <rect x="140" y={93 + i * 16} width="16" height="3" rx="1" fill={style.dark ? "#666" : "#999"} />
        </g>
      ))}
      <rect x="95" y="160" width="65" height="12" rx="3" fill={style.totalBg} />
      <rect x="102" y="164" width="50" height="4" rx="1" fill="#fff" opacity="0.9" />
      <rect x="10" y="180" width="150" height="28" rx="3" fill={style.altBg} stroke={style.border} strokeWidth="0.5" />
      <rect x="13" y="180" width="3" height="28" rx="1" fill={style.accent} />
      <rect x="20" y="186" width="35" height="3" rx="1" fill={style.dark ? "#555" : "#aaa"} />
      <rect x="20" y="193" width="120" height="2.5" rx="1" fill={style.dark ? "#444" : "#ccc"} />
      <rect x="20" y="199" width="100" height="2.5" rx="1" fill={style.dark ? "#444" : "#ccc"} />
      <line x1="10" y1="214" x2="160" y2="214" stroke={style.border} strokeWidth="0.3" />
    </svg>
  );
}

function ThumbnailNotaCredito({ style }: { style: StyleToken }) {
  return (
    <svg viewBox="0 0 170 220" className="w-full h-full">
      <rect width="170" height="220" fill={style.dark ? style.headerBg : "#fff"} rx="2" />
      <rect x="0" y="0" width="170" height="36" fill={style.headerBg} rx="2" />
      <rect x="10" y="10" width="50" height="6" rx="1" fill={style.headerText} opacity="0.9" />
      <rect x="10" y="20" width="30" height="3" rx="1" fill={style.headerText} opacity="0.4" />
      <rect x="95" y="10" width="65" height="8" rx="1" fill={style.headerText} opacity="0.8" />
      <rect x="10" y="50" width="150" height="24" rx="3" fill={style.altBg} stroke={style.border} strokeWidth="0.5" />
      <rect x="13" y="50" width="3" height="24" rx="1" fill={style.accent} />
      <rect x="20" y="56" width="25" height="3" rx="1" fill={style.dark ? "#555" : "#aaa"} />
      <rect x="20" y="63" width="110" height="2.5" rx="1" fill={style.dark ? "#444" : "#ccc"} />
      <rect x="10" y="84" width="150" height="14" rx="3" fill={style.tableBg || style.accent} />
      {[0, 1].map((i) => (
        <g key={i}>
          <rect x="10" y={104 + i * 18} width="150" height="16" fill={i % 2 === 1 ? style.altBg : "transparent"} />
          <rect x="14" y={110 + i * 18} width={70 + i * 10} height="3" rx="1" fill={style.dark ? "#666" : "#999"} />
          <rect x="140" y={110 + i * 18} width="16" height="3" rx="1" fill="#dc2626" opacity="0.7" />
        </g>
      ))}
      <rect x="95" y="152" width="65" height="12" rx="3" fill={style.totalBg} />
      <rect x="102" y="156" width="50" height="4" rx="1" fill="#fff" opacity="0.9" />
      <rect x="10" y="174" width="150" height="20" rx="3" fill={style.altBg} />
      <rect x="18" y="180" width="120" height="2.5" rx="1" fill={style.dark ? "#444" : "#ccc"} />
      <rect x="18" y="186" width="80" height="2.5" rx="1" fill={style.dark ? "#444" : "#ccc"} />
      <line x1="10" y1="214" x2="160" y2="214" stroke={style.border} strokeWidth="0.3" />
    </svg>
  );
}

function ThumbnailRecibo({ style }: { style: StyleToken }) {
  return (
    <svg viewBox="0 0 170 220" className="w-full h-full">
      <rect width="170" height="220" fill={style.dark ? style.headerBg : "#fff"} rx="2" />
      <rect x="0" y="0" width="170" height="36" fill={style.headerBg} rx="2" />
      <rect x="10" y="10" width="50" height="6" rx="1" fill={style.headerText} opacity="0.9" />
      <rect x="10" y="20" width="30" height="3" rx="1" fill={style.headerText} opacity="0.4" />
      <rect x="105" y="10" width="55" height="8" rx="1" fill={style.headerText} opacity="0.8" />
      <rect x="25" y="52" width="120" height="50" rx="6" fill="none" stroke={style.accent} strokeWidth="1.5" />
      <rect x="55" y="58" width="60" height="4" rx="1" fill={style.dark ? "#555" : "#aaa"} />
      <rect x="42" y="68" width="86" height="12" rx="1" fill={style.dark ? style.primary : "#222"} opacity="0.8" />
      <rect x="60" y="86" width="50" height="10" rx="5" fill="#16a34a" opacity="0.15" />
      <rect x="68" y="89" width="34" height="4" rx="1" fill="#16a34a" />
      <rect x="10" y="114" width="150" height="12" rx="3" fill={style.tableBg || style.accent} />
      <rect x="10" y="130" width="150" height="14" fill={style.altBg} />
      <rect x="14" y="135" width="50" height="3" rx="1" fill={style.dark ? "#666" : "#999"} />
      <rect x="130" y="135" width="24" height="3" rx="1" fill={style.dark ? "#666" : "#999"} />
      <rect x="10" y="158" width="72" height="24" rx="3" fill={style.altBg} />
      <rect x="88" y="158" width="72" height="24" rx="3" fill={style.altBg} />
      <rect x="16" y="164" width="30" height="2.5" rx="1" fill={style.dark ? "#555" : "#aaa"} />
      <rect x="16" y="170" width="50" height="3" rx="1" fill={style.dark ? "#666" : "#888"} />
      <rect x="94" y="164" width="25" height="2.5" rx="1" fill={style.dark ? "#555" : "#aaa"} />
      <rect x="94" y="170" width="45" height="3" rx="1" fill={style.dark ? "#666" : "#888"} />
      <line x1="10" y1="214" x2="160" y2="214" stroke={style.border} strokeWidth="0.3" />
    </svg>
  );
}

function ThumbnailCarta({ style }: { style: StyleToken }) {
  return (
    <svg viewBox="0 0 170 220" className="w-full h-full">
      <rect width="170" height="220" fill={style.dark ? style.headerBg : "#fff"} rx="2" />
      <rect x="0" y="0" width="170" height="36" fill={style.headerBg} rx="2" />
      <rect x="10" y="10" width="50" height="6" rx="1" fill={style.headerText} opacity="0.9" />
      <rect x="10" y="20" width="30" height="3" rx="1" fill={style.headerText} opacity="0.4" />
      <rect x="120" y="12" width="38" height="6" rx="1" fill={style.headerText} opacity="0.7" />
      <rect x="10" y="50" width="150" height="14" rx="0" fill="transparent" />
      <rect x="10" y="50" width="2" height="14" fill={style.accent} />
      <rect x="18" y="54" width="90" height="5" rx="1" fill={style.dark ? style.primary : "#333"} opacity="0.7" />
      {[0, 1, 2].map((p) => (
        <g key={p}>
          {[0, 1, 2].map((l) => (
            <rect
              key={l}
              x="10"
              y={76 + p * 30 + l * 7}
              width={l === 2 ? 80 + p * 15 : 148}
              height="3"
              rx="1"
              fill={style.dark ? "#555" : "#ccc"}
            />
          ))}
        </g>
      ))}
      <rect x="10" y="180" width="55" height="1" fill={style.dark ? style.primary : "#333"} />
      <rect x="10" y="185" width="45" height="4" rx="1" fill={style.dark ? style.primary : "#333"} opacity="0.8" />
      <rect x="10" y="192" width="35" height="2.5" rx="1" fill={style.dark ? "#555" : "#aaa"} />
      <line x1="10" y1="214" x2="160" y2="214" stroke={style.border} strokeWidth="0.3" />
    </svg>
  );
}

function ThumbnailCease({ style }: { style: StyleToken }) {
  return (
    <svg viewBox="0 0 170 220" className="w-full h-full">
      <rect width="170" height="220" fill={style.dark ? style.headerBg : "#fff"} rx="2" />
      <rect x="0" y="0" width="170" height="36" fill={style.headerBg} rx="2" />
      <rect x="10" y="10" width="50" height="6" rx="1" fill={style.headerText} opacity="0.9" />
      <rect x="95" y="10" width="65" height="8" rx="1" fill={style.headerText} opacity="0.8" />
      <rect x="10" y="46" width="2" height="12" fill="#dc2626" />
      <rect x="18" y="49" width="100" height="5" rx="1" fill={style.dark ? style.primary : "#333"} opacity="0.7" />
      {[0, 1].map((p) => (
        <g key={p}>
          {[0, 1, 2, 3].map((l) => (
            <rect key={l} x="10" y={70 + p * 36 + l * 7} width={l === 3 ? 90 : 148} height="2.5" rx="1" fill={style.dark ? "#555" : "#ccc"} />
          ))}
        </g>
      ))}
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <circle cx="16" cy={150 + i * 14} r="4" fill={style.accent} opacity="0.2" />
          <rect x="14" y={148 + i * 14} width="4" height="4" rx="1" fill={style.accent} opacity="0.7" />
          <rect x="26" y={148 + i * 14} width={100 - i * 15} height="3" rx="1" fill={style.dark ? "#555" : "#bbb"} />
        </g>
      ))}
      <rect x="10" y="192" width="150" height="14" rx="3" fill="#fef2f2" stroke="#fecaca" strokeWidth="0.5" />
      <rect x="18" y="197" width="100" height="2.5" rx="1" fill="#dc2626" opacity="0.5" />
      <line x1="10" y1="214" x2="160" y2="214" stroke={style.border} strokeWidth="0.3" />
    </svg>
  );
}

function ThumbnailActa({ style }: { style: StyleToken }) {
  return (
    <svg viewBox="0 0 170 220" className="w-full h-full">
      <rect width="170" height="220" fill={style.dark ? style.headerBg : "#fff"} rx="2" />
      <rect x="0" y="0" width="170" height="36" fill={style.headerBg} rx="2" />
      <rect x="10" y="10" width="50" height="6" rx="1" fill={style.headerText} opacity="0.9" />
      <rect x="105" y="10" width="55" height="8" rx="1" fill={style.headerText} opacity="0.8" />
      <rect x="10" y="46" width="72" height="32" rx="3" fill={style.altBg} />
      <rect x="88" y="46" width="72" height="32" rx="3" fill={style.altBg} />
      <rect x="16" y="50" width="35" height="2.5" rx="1" fill={style.dark ? "#555" : "#aaa"} />
      <rect x="16" y="56" width="50" height="3" rx="1" fill={style.dark ? "#666" : "#888"} />
      <rect x="16" y="63" width="45" height="3" rx="1" fill={style.dark ? "#666" : "#888"} />
      <rect x="94" y="50" width="30" height="2.5" rx="1" fill={style.dark ? "#555" : "#aaa"} />
      <rect x="94" y="56" width="50" height="3" rx="1" fill={style.dark ? "#666" : "#888"} />
      <rect x="94" y="63" width="40" height="3" rx="1" fill={style.dark ? "#666" : "#888"} />
      {[0, 1, 2].map((s) => (
        <g key={s}>
          <rect x="10" y={90 + s * 34} width={60 + s * 10} height="4" rx="1" fill={style.accent} opacity="0.7" />
          <line x1="10" y1={97 + s * 34} x2="160" y2={97 + s * 34} stroke={style.accent} strokeWidth="0.5" opacity="0.3" />
          {[0, 1, 2].map((l) => (
            <rect key={l} x="10" y={102 + s * 34 + l * 6} width={140 - l * 20} height="2.5" rx="1" fill={style.dark ? "#555" : "#ccc"} />
          ))}
        </g>
      ))}
      <line x1="10" y1="214" x2="160" y2="214" stroke={style.border} strokeWidth="0.3" />
    </svg>
  );
}

function ThumbnailInforme({ style }: { style: StyleToken }) {
  return (
    <svg viewBox="0 0 170 220" className="w-full h-full">
      <rect width="170" height="220" fill={style.dark ? style.headerBg : "#fff"} rx="2" />
      <rect x="0" y="0" width="170" height="36" fill={style.headerBg} rx="2" />
      <rect x="10" y="10" width="50" height="6" rx="1" fill={style.headerText} opacity="0.9" />
      <rect x="10" y="20" width="70" height="3" rx="1" fill={style.headerText} opacity="0.4" />
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect x={10 + i * 39} y="46" width="35" height="28" rx="3" fill={style.altBg} />
          <rect x={12 + i * 39} y="46" width="2" height="28" rx="1" fill={style.accent} />
          <rect x={18 + i * 39} y="52" width="18" height="8" rx="1" fill={style.dark ? style.primary : "#222"} opacity="0.7" />
          <rect x={18 + i * 39} y="64" width="24" height="2.5" rx="1" fill={style.dark ? "#555" : "#aaa"} />
        </g>
      ))}
      <rect x="10" y="84" width="55" height="4" rx="1" fill={style.accent} opacity="0.7" />
      <line x1="10" y1="91" x2="160" y2="91" stroke={style.accent} strokeWidth="0.5" opacity="0.3" />
      {[0, 1, 2].map((l) => (
        <rect key={l} x="10" y={98 + l * 7} width={145 - l * 25} height="2.5" rx="1" fill={style.dark ? "#555" : "#ccc"} />
      ))}
      <rect x="10" y="126" width="150" height="10" rx="2" fill={style.tableBg || style.accent} opacity="0.8" />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x="10" y={140 + i * 12} width="150" height="10" fill={i % 2 === 0 ? style.altBg : "transparent"} />
          <rect x="14" y={143 + i * 12} width={60 + i * 10} height="2.5" rx="1" fill={style.dark ? "#555" : "#bbb"} />
          <rect x="130" y={143 + i * 12} width="22" height="2.5" rx="1" fill={style.dark ? "#555" : "#bbb"} />
        </g>
      ))}
      <rect x="10" y="182" width="45" height="4" rx="1" fill={style.accent} opacity="0.7" />
      {[0, 1].map((l) => (
        <rect key={l} x="10" y={192 + l * 7} width={140 - l * 30} height="2.5" rx="1" fill={style.dark ? "#555" : "#ccc"} />
      ))}
      <line x1="10" y1="214" x2="160" y2="214" stroke={style.border} strokeWidth="0.3" />
    </svg>
  );
}

function ThumbnailVigilancia({ style }: { style: StyleToken }) {
  return (
    <svg viewBox="0 0 170 220" className="w-full h-full">
      <rect width="170" height="220" fill={style.dark ? style.headerBg : "#fff"} rx="2" />
      <rect x="0" y="0" width="170" height="36" fill={style.headerBg} rx="2" />
      <rect x="10" y="10" width="50" height="6" rx="1" fill={style.headerText} opacity="0.9" />
      <rect x="10" y="20" width="35" height="3" rx="1" fill={style.headerText} opacity="0.4" />
      {[0, 1, 2, 3].map((i) => {
        const colors = [style.accent, "#f59e0b", "#dc2626", "#16a34a"];
        return (
          <g key={i}>
            <rect x={10 + i * 39} y="46" width="35" height="28" rx="3" fill={style.altBg} />
            <rect x={12 + i * 39} y="46" width="2" height="28" rx="1" fill={colors[i]} />
            <rect x={18 + i * 39} y="52" width="16" height="8" rx="1" fill={style.dark ? style.primary : "#222"} opacity="0.7" />
            <rect x={18 + i * 39} y="64" width="22" height="2.5" rx="1" fill={style.dark ? "#555" : "#aaa"} />
          </g>
        );
      })}
      <rect x="10" y="84" width="150" height="10" rx="2" fill={style.tableBg || style.accent} opacity="0.8" />
      {[0, 1, 2, 3].map((i) => {
        const badgeColors = ["#dc2626", "#dc2626", "#f59e0b", "#16a34a"];
        return (
          <g key={i}>
            <rect x="10" y={98 + i * 14} width="150" height="12" fill={i % 2 === 0 ? style.altBg : "transparent"} />
            <rect x="14" y={102 + i * 14} width={45 + i * 5} height="3" rx="1" fill={style.dark ? "#666" : "#999"} />
            <rect x="80" y={101 + i * 14} width="18" height="5" rx="1" fill={style.dark ? "#555" : "#ddd"} />
            <rect x="110" y={101 + i * 14} width="22" height="5" rx="8" fill={badgeColors[i]} opacity="0.15" />
            <rect x="114" y={102.5 + i * 14} width="14" height="2.5" rx="1" fill={badgeColors[i]} opacity="0.7" />
          </g>
        );
      })}
      <rect x="10" y="162" width="45" height="4" rx="1" fill={style.accent} opacity="0.7" />
      {[0, 1, 2].map((l) => (
        <rect key={l} x="10" y={172 + l * 7} width={120 - l * 20} height="2.5" rx="1" fill={style.dark ? "#555" : "#ccc"} />
      ))}
      <line x1="10" y1="214" x2="160" y2="214" stroke={style.border} strokeWidth="0.3" />
    </svg>
  );
}

function ThumbnailContrato({ style }: { style: StyleToken }) {
  return (
    <svg viewBox="0 0 170 220" className="w-full h-full">
      <rect width="170" height="220" fill={style.dark ? style.headerBg : "#fff"} rx="2" />
      <rect x="0" y="0" width="170" height="36" fill={style.headerBg} rx="2" />
      <rect x="10" y="10" width="50" height="6" rx="1" fill={style.headerText} opacity="0.9" />
      <rect x="10" y="20" width="80" height="3" rx="1" fill={style.headerText} opacity="0.4" />
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i}>
          <rect x="10" y={50 + i * 28} width="10" height="10" rx="2" fill={style.accent} opacity="0.15" />
          <rect x="12" y={52 + i * 28} width="6" height="6" rx="1" fill={style.accent} opacity="0.6" />
          <rect x="26" y={51 + i * 28} width={70 + (i % 3) * 10} height="3.5" rx="1" fill={style.dark ? style.primary : "#333"} opacity="0.6" />
          {[0, 1].map((l) => (
            <rect key={l} x="26" y={58 + i * 28 + l * 6} width={130 - l * 30 - i * 5} height="2.5" rx="1" fill={style.dark ? "#555" : "#ccc"} />
          ))}
        </g>
      ))}
      <rect x="10" y="196" width="55" height="0.8" fill={style.dark ? style.primary : "#333"} />
      <rect x="10" y="200" width="40" height="3" rx="1" fill={style.dark ? style.primary : "#333"} opacity="0.7" />
      <rect x="10" y="206" width="30" height="2" rx="1" fill={style.dark ? "#555" : "#aaa"} />
      <rect x="100" y="196" width="55" height="0.8" fill={style.dark ? style.primary : "#333"} />
      <rect x="100" y="200" width="40" height="3" rx="1" fill={style.dark ? style.primary : "#333"} opacity="0.7" />
      <rect x="100" y="206" width="30" height="2" rx="1" fill={style.dark ? "#555" : "#aaa"} />
    </svg>
  );
}

function ThumbnailNDA({ style }: { style: StyleToken }) {
  return (
    <svg viewBox="0 0 170 220" className="w-full h-full">
      <rect width="170" height="220" fill={style.dark ? style.headerBg : "#fff"} rx="2" />
      <rect x="0" y="0" width="170" height="36" fill={style.headerBg} rx="2" />
      <rect x="10" y="10" width="50" height="6" rx="1" fill={style.headerText} opacity="0.9" />
      <rect x="90" y="10" width="70" height="8" rx="1" fill={style.headerText} opacity="0.8" />
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i}>
          <rect x="10" y={48 + i * 30} width="150" height="24" rx="3" fill={style.altBg} stroke={style.border} strokeWidth="0.3" />
          <rect x="13" y={48 + i * 30} width="3" height="24" rx="1" fill={style.accent} />
          <rect x="22" y={53 + i * 30} width={50 + i * 8} height="3.5" rx="1" fill={style.dark ? style.primary : "#333"} opacity="0.6" />
          <rect x="22" y={60 + i * 30} width={120 - i * 10} height="2.5" rx="1" fill={style.dark ? "#555" : "#ccc"} />
          <rect x="22" y={66 + i * 30} width={100 - i * 8} height="2.5" rx="1" fill={style.dark ? "#444" : "#ddd"} />
        </g>
      ))}
      <rect x="10" y="200" width="55" height="0.8" fill={style.dark ? style.primary : "#333"} />
      <rect x="10" y="204" width="40" height="3" rx="1" fill={style.dark ? style.primary : "#333"} opacity="0.7" />
      <rect x="100" y="200" width="55" height="0.8" fill={style.dark ? style.primary : "#333"} />
      <rect x="100" y="204" width="40" height="3" rx="1" fill={style.dark ? style.primary : "#333"} opacity="0.7" />
    </svg>
  );
}

function ThumbnailLicencia({ style }: { style: StyleToken }) {
  return (
    <svg viewBox="0 0 170 220" className="w-full h-full">
      <rect width="170" height="220" fill={style.dark ? style.headerBg : "#fff"} rx="2" />
      <rect x="0" y="0" width="170" height="36" fill={style.headerBg} rx="2" />
      <rect x="10" y="10" width="50" height="6" rx="1" fill={style.headerText} opacity="0.9" />
      <rect x="10" y="20" width="30" height="3" rx="1" fill={style.headerText} opacity="0.4" />
      <rect x="10" y="46" width="150" height="48" rx="4" fill={style.altBg} stroke={style.border} strokeWidth="0.5" />
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect x="16" y={52 + i * 10} width="28" height="2.5" rx="1" fill={style.dark ? "#555" : "#aaa"} />
          <rect x="50" y={52 + i * 10} width={55 + (i % 2) * 15} height="3" rx="1" fill={style.dark ? "#777" : "#666"} />
        </g>
      ))}
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x="10" y={106 + i * 28} width="150" height="22" rx="3" fill={style.altBg} stroke={style.border} strokeWidth="0.3" />
          <rect x="13" y={106 + i * 28} width="3" height="22" rx="1" fill={style.accent} />
          <rect x="22" y={111 + i * 28} width={50 + i * 12} height="3" rx="1" fill={style.dark ? style.primary : "#333"} opacity="0.6" />
          <rect x="22" y={118 + i * 28} width={110 - i * 10} height="2.5" rx="1" fill={style.dark ? "#555" : "#ccc"} />
        </g>
      ))}
      <rect x="10" y="200" width="55" height="0.8" fill={style.dark ? style.primary : "#333"} />
      <rect x="10" y="204" width="40" height="3" rx="1" fill={style.dark ? style.primary : "#333"} opacity="0.7" />
      <rect x="100" y="200" width="55" height="0.8" fill={style.dark ? style.primary : "#333"} />
      <rect x="100" y="204" width="40" height="3" rx="1" fill={style.dark ? style.primary : "#333"} opacity="0.7" />
    </svg>
  );
}

function ThumbnailPoder({ style }: { style: StyleToken }) {
  return (
    <svg viewBox="0 0 170 220" className="w-full h-full">
      <rect width="170" height="220" fill={style.dark ? style.headerBg : "#fff"} rx="2" />
      <rect x="0" y="0" width="170" height="36" fill={style.headerBg} rx="2" />
      <rect x="10" y="10" width="50" height="6" rx="1" fill={style.headerText} opacity="0.9" />
      <rect x="100" y="10" width="60" height="8" rx="1" fill={style.headerText} opacity="0.8" />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x={10 + i * 52} y="50" width="46" height="28" rx="4" fill={style.altBg} />
          <circle cx={33 + i * 52} cy="59" r="5" fill={style.accent} opacity="0.2" />
          <rect x={22 + i * 52} y="68" width="22" height="2.5" rx="1" fill={style.dark ? "#555" : "#aaa"} />
        </g>
      ))}
      <rect x="10" y="88" width="150" height="38" rx="3" fill={style.altBg} stroke={style.border} strokeWidth="0.3" />
      <rect x="13" y="88" width="3" height="38" rx="1" fill={style.accent} />
      <rect x="22" y="93" width="55" height="3.5" rx="1" fill={style.dark ? style.primary : "#333"} opacity="0.6" />
      {[0, 1, 2, 3].map((l) => (
        <rect key={l} x="22" y={101 + l * 6} width={125 - l * 15} height="2.5" rx="1" fill={style.dark ? "#555" : "#ccc"} />
      ))}
      <rect x="10" y="136" width="150" height="28" rx="3" fill={style.altBg} stroke={style.border} strokeWidth="0.3" />
      <rect x="13" y="136" width="3" height="28" rx="1" fill={style.accent} />
      <rect x="22" y="141" width="35" height="3.5" rx="1" fill={style.dark ? style.primary : "#333"} opacity="0.6" />
      {[0, 1].map((l) => (
        <rect key={l} x="22" y={149 + l * 6} width={120 - l * 30} height="2.5" rx="1" fill={style.dark ? "#555" : "#ccc"} />
      ))}
      <rect x="10" y="182" width="55" height="0.8" fill={style.dark ? style.primary : "#333"} />
      <rect x="10" y="186" width="40" height="3" rx="1" fill={style.dark ? style.primary : "#333"} opacity="0.7" />
      <rect x="10" y="192" width="30" height="2" rx="1" fill={style.dark ? "#555" : "#aaa"} />
      <rect x="100" y="182" width="55" height="0.8" fill={style.dark ? style.primary : "#333"} />
      <rect x="100" y="186" width="40" height="3" rx="1" fill={style.dark ? style.primary : "#333"} opacity="0.7" />
      <rect x="100" y="192" width="30" height="2" rx="1" fill={style.dark ? "#555" : "#aaa"} />
    </svg>
  );
}

function ThumbnailCertificado({ style }: { style: StyleToken }) {
  return (
    <svg viewBox="0 0 170 220" className="w-full h-full">
      <rect width="170" height="220" fill={style.dark ? style.headerBg : "#fff"} rx="2" />
      <rect x="0" y="0" width="170" height="28" fill={style.headerBg} rx="2" />
      <rect x="10" y="8" width="40" height="5" rx="1" fill={style.headerText} opacity="0.9" />
      <rect x="10" y="16" width="25" height="2.5" rx="1" fill={style.headerText} opacity="0.4" />
      <rect x="30" y="40" width="110" height="3" rx="1" fill={style.dark ? "#555" : "#aaa"} />
      <rect x="22" y="50" width="126" height="10" rx="1" fill={style.dark ? style.primary : "#222"} opacity="0.8" />
      <rect x="35" y="66" width="100" height="3" rx="1" fill={style.dark ? "#555" : "#bbb"} />
      {[0, 1, 2, 3].map((row) => (
        <g key={row}>
          {[0, 1].map((col) => (
            <g key={col}>
              <rect x={10 + col * 80} y={80 + row * 22} width="74" height="18" rx="3" fill={style.altBg} />
              <rect x={14 + col * 80} y={84 + row * 22} width="25" height="2.5" rx="1" fill={style.dark ? "#555" : "#aaa"} />
              <rect x={14 + col * 80} y={90 + row * 22} width={40 + col * 10} height="3" rx="1" fill={style.dark ? "#777" : "#666"} />
            </g>
          ))}
        </g>
      ))}
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <circle cx={40 + i * 45} cy="182" r="12" fill="none" stroke={style.accent} strokeWidth="1" />
          <circle cx={40 + i * 45} cy="182" r="3" fill={style.accent} opacity="0.3" />
          <rect x={30 + i * 45} y="198" width="20" height="2.5" rx="1" fill={style.dark ? "#555" : "#aaa"} />
        </g>
      ))}
      <rect x="35" y="208" width="100" height="2" rx="1" fill={style.dark ? "#444" : "#ccc"} />
    </svg>
  );
}

function ThumbnailRenovacion({ style }: { style: StyleToken }) {
  return (
    <svg viewBox="0 0 170 220" className="w-full h-full">
      <rect width="170" height="220" fill={style.dark ? style.headerBg : "#fff"} rx="2" />
      <rect x="0" y="0" width="170" height="36" fill={style.headerBg} rx="2" />
      <rect x="10" y="10" width="50" height="6" rx="1" fill={style.headerText} opacity="0.9" />
      <rect x="105" y="10" width="55" height="8" rx="1" fill={style.headerText} opacity="0.8" />
      <rect x="20" y="46" width="130" height="38" rx="5" fill="none" stroke={style.accent} strokeWidth="1.5" />
      <rect x="45" y="52" width="80" height="3" rx="1" fill={style.dark ? "#555" : "#aaa"} />
      <rect x="35" y="60" width="100" height="10" rx="1" fill={style.dark ? style.primary : "#222"} opacity="0.8" />
      <rect x="55" y="74" width="60" height="6" rx="3" fill="#f59e0b" opacity="0.15" />
      <rect x="62" y="75.5" width="46" height="3" rx="1" fill="#f59e0b" opacity="0.8" />
      <rect x="10" y="94" width="150" height="10" rx="2" fill={style.tableBg || style.accent} opacity="0.8" />
      {[0, 1, 2].map((i) => {
        const badgeColors = ["#f59e0b", "#16a34a", "#16a34a"];
        return (
          <g key={i}>
            <rect x="10" y={108 + i * 14} width="150" height="12" fill={i % 2 === 0 ? style.altBg : "transparent"} />
            <rect x="14" y={112 + i * 14} width={40 + i * 5} height="3" rx="1" fill={style.dark ? "#666" : "#999"} />
            <rect x="100" y={111 + i * 14} width="22" height="5" rx="8" fill={badgeColors[i]} opacity="0.15" />
            <rect x="104" y={112 + i * 14} width="14" height="3" rx="1" fill={badgeColors[i]} opacity="0.7" />
          </g>
        );
      })}
      <rect x="95" y="160" width="65" height="12" rx="3" fill={style.totalBg} />
      <rect x="102" y="164" width="50" height="4" rx="1" fill="#fff" opacity="0.9" />
      <rect x="10" y="182" width="150" height="24" rx="3" fill={style.altBg} stroke={style.border} strokeWidth="0.5" />
      <rect x="13" y="182" width="3" height="24" rx="1" fill={style.accent} />
      <rect x="20" y="188" width="80" height="3" rx="1" fill={style.dark ? "#666" : "#888"} />
      <rect x="20" y="195" width="120" height="2.5" rx="1" fill={style.dark ? "#555" : "#ccc"} />
      <rect x="20" y="201" width="90" height="2.5" rx="1" fill={style.dark ? "#555" : "#ccc"} />
    </svg>
  );
}

// ── MAP DOC TYPE → THUMBNAIL ────────────────────────────────
const THUMB_MAP: Record<string, React.ComponentType<{ style: StyleToken }>> = {
  factura: ThumbnailFactura,
  presupuesto: ThumbnailPresupuesto,
  "nota-credito": ThumbnailNotaCredito,
  recibo: ThumbnailRecibo,
  carta: ThumbnailCarta,
  cease: ThumbnailCease,
  acta: ThumbnailActa,
  informe: ThumbnailInforme,
  vigilancia: ThumbnailVigilancia,
  contrato: ThumbnailContrato,
  nda: ThumbnailNDA,
  licencia: ThumbnailLicencia,
  poder: ThumbnailPoder,
  certificado: ThumbnailCertificado,
  renovacion: ThumbnailRenovacion,
};

// ── CATEGORY COLORS ─────────────────────────────────────────
const CAT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Financiero: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  Comunicación: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  Informes: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  Legal: { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200" },
  IP: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" },
};

// ── STYLE PACK COLORS ───────────────────────────────────────
const PACK_COLORS: Record<string, string> = {
  Classic: "bg-slate-100 text-slate-600",
  Modern: "bg-indigo-100 text-indigo-600",
  Executive: "bg-amber-100 text-amber-700",
};

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function TemplatesSettingsSection() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedStyleId, setSelectedStyleId] = useState("moderno");
  const [enabledDocs, setEnabledDocs] = useState<Record<string, boolean>>(() =>
    DOC_TYPES.reduce((acc, d) => ({ ...acc, [d.id]: true }), {} as Record<string, boolean>)
  );
  const [previewDoc, setPreviewDoc] = useState<DocType | null>(null);
  const [showStylePicker, setShowStylePicker] = useState(false);
  const [hoverStyle, setHoverStyle] = useState<string | null>(null);

  const selectedStyle = useMemo(
    () => STYLES.find((s) => s.id === selectedStyleId) || STYLES[2],
    [selectedStyleId]
  );

  const previewStyle = hoverStyle
    ? STYLES.find((s) => s.id === hoverStyle) || selectedStyle
    : selectedStyle;

  const filtered = useMemo(
    () =>
      activeCategory === "all"
        ? DOC_TYPES
        : DOC_TYPES.filter((d) => d.cat === activeCategory),
    [activeCategory]
  );

  const toggleDoc = useCallback((id: string) => {
    setEnabledDocs((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const tenant = useMemo(() => ({
    name: 'Meridian IP Consulting',
    subtitle: 'Intellectual Property',
    email: 'info@meridian-ip.com',
    phone: '+34 912 345 678',
    address: 'Paseo de la Castellana 89, 28046 Madrid',
    cif: 'B-87654321',
    iban: 'ES12 3456 7890 1234 5678 9012',
    city: 'Madrid'
  }), []);

  const previewHTML = useMemo(() => {
    if (!previewDoc) return '';
    const activeStyleId = hoverStyle || selectedStyleId;
    try {
      const rawHTML = generateDocumentHTML(activeStyleId, previewDoc.id, tenant, {});
      // Wrap with scaling so the full document fits without scroll
      return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
        html, body { margin:0; padding:0; height:100vh; overflow:hidden; }
        body { display:flex; align-items:flex-start; justify-content:center; background:#f1f5f9; }
        .scale-wrapper { transform-origin: top center; width:210mm; }
      </style>
      <script>
        function fitPage() {
          var w = document.querySelector('.scale-wrapper');
          if (!w) return;
          var s = window.innerHeight / w.scrollHeight;
          if (s < 1) w.style.transform = 'scale(' + s + ')';
          else w.style.transform = 'scale(1)';
        }
        window.addEventListener('load', fitPage);
        window.addEventListener('resize', fitPage);
      </script></head><body><div class="scale-wrapper">${rawHTML}</div></body></html>`;
    } catch (e) {
      console.error('Preview generation error:', e);
      return '';
    }
  }, [previewDoc, hoverStyle, selectedStyleId, tenant]);

  return (
    <div>
      {/* ── HEADER ──────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200 px-6 py-5 -mx-6 -mt-6 mb-6 rounded-t-xl">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Plantillas de Documentos
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              15 tipos × 18 estilos = 270 combinaciones profesionales
            </p>
          </div>

          {/* Style selector */}
          <div className="relative">
            <button
              onClick={() => setShowStylePicker(!showStylePicker)}
              className="flex items-center gap-3 px-4 py-2.5 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all"
            >
              <div
                className="w-5 h-5 rounded-md shadow-inner"
                style={{
                  background: selectedStyle.gradient || selectedStyle.accent,
                }}
              />
              <div className="text-left">
                <div className="text-xs text-slate-400 leading-none">
                  Estilo por defecto
                </div>
                <div className="text-sm font-semibold text-slate-700">
                  {selectedStyle.name}
                </div>
              </div>
              <svg
                className={`w-4 h-4 text-slate-400 transition-transform ${showStylePicker ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Style dropdown */}
            {showStylePicker && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-3 max-h-96 overflow-y-auto">
                {(["Classic", "Modern", "Executive"] as const).map((pack) => (
                  <div key={pack} className="mb-3">
                    <div
                      className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded ${PACK_COLORS[pack]} mb-1.5`}
                    >
                      {pack} Collection
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      {STYLES.filter((s) => s.pack === pack).map((s) => (
                        <button
                          key={s.id}
                          onClick={() => {
                            setSelectedStyleId(s.id);
                            setShowStylePicker(false);
                          }}
                          className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-all text-center ${
                            selectedStyleId === s.id
                              ? "border-indigo-400 bg-indigo-50 shadow-sm"
                              : "border-transparent hover:bg-slate-50"
                          }`}
                        >
                          <div
                            className="w-6 h-6 rounded-md shadow-sm"
                            style={{
                              background: s.gradient || s.accent,
                            }}
                          />
                          <span className="text-[10px] font-medium text-slate-600 leading-tight">
                            {s.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── CATEGORY TABS ───────────────────────────── */}
      <div className="flex gap-1 pb-4 overflow-x-auto mb-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              activeCategory === cat.id
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.name}</span>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                activeCategory === cat.id
                  ? "bg-white/20 text-white"
                  : "bg-slate-100 text-slate-400"
              }`}
            >
              {cat.count}
            </span>
          </button>
        ))}
      </div>

      {/* ── DOCUMENT GRID ───────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((doc) => {
          const ThumbComponent = THUMB_MAP[doc.id];
          const catColor = CAT_COLORS[doc.cat] || CAT_COLORS.Financiero;
          const enabled = enabledDocs[doc.id];

          return (
            <div
              key={doc.id}
              className={`group bg-white rounded-xl border overflow-hidden transition-all duration-200 ${
                enabled
                  ? "border-slate-200 shadow-sm hover:shadow-lg hover:border-slate-300"
                  : "border-slate-100 opacity-60"
              }`}
            >
              {/* Thumbnail */}
              <div
                className="relative cursor-pointer"
                onClick={() => setPreviewDoc(doc)}
              >
                <div
                  className={`mx-4 mt-4 rounded-lg overflow-hidden border shadow-sm transition-shadow group-hover:shadow-md ${
                    selectedStyle.dark
                      ? "border-slate-600 bg-slate-800"
                      : "border-slate-200 bg-white"
                  }`}
                  style={{ aspectRatio: "170/220" }}
                >
                  {ThumbComponent && (
                    <ThumbComponent style={selectedStyle} />
                  )}
                </div>
                {/* Hover overlay */}
                <div className="absolute inset-0 mx-4 mt-4 rounded-lg bg-slate-900/0 group-hover:bg-slate-900/5 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg text-sm font-medium text-slate-700">
                    Vista previa
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="p-4 pt-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base">{doc.icon}</span>
                      <h3 className="font-semibold text-slate-900 text-sm truncate">
                        {doc.name}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {doc.desc}
                    </p>
                  </div>

                  {/* Toggle */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleDoc(doc.id);
                    }}
                    className={`relative flex-shrink-0 ml-3 w-10 rounded-full transition-colors duration-200 ${
                      enabled ? "bg-indigo-500" : "bg-slate-200"
                    }`}
                    style={{ height: "22px" }}
                  >
                    <div
                      className={`absolute top-0.5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                        enabled ? "translate-x-5" : "translate-x-0.5"
                      }`}
                      style={{
                        width: "18px",
                        height: "18px",
                      }}
                    />
                  </button>
                </div>

                {/* Category badge */}
                <div className="mt-2 flex items-center gap-2">
                  <span
                    className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${catColor.bg} ${catColor.text} ${catColor.border}`}
                  >
                    {doc.cat}
                  </span>
                  <span className="text-[10px] text-slate-300">
                    18 estilos
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── PREVIEW MODAL ───────────────────────────── */}
      {previewDoc && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => {
            setPreviewDoc(null);
            setHoverStyle(null);
          }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-[95vw] max-w-6xl flex flex-col"
            style={{ height: '92vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-slate-100 flex-shrink-0">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{previewDoc.icon}</span>
                <div>
                  <h2 className="font-bold text-lg text-slate-900">
                    {previewDoc.name}
                  </h2>
                  <p className="text-xs text-slate-400">{previewDoc.desc}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleDoc(previewDoc.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    enabledDocs[previewDoc.id]
                      ? "bg-indigo-50 text-indigo-600"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {enabledDocs[previewDoc.id] ? "✓ Activada" : "Desactivada"}
                </button>
                <button
                  onClick={() => {
                    setPreviewDoc(null);
                    setHoverStyle(null);
                  }}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal body */}
            <div className="flex-1 min-h-0 flex">
              {/* Document preview — real HTML via iframe */}
              <div className="flex-1 bg-slate-100 p-6 flex items-stretch justify-center">
                <div className="w-full max-w-2xl rounded-lg shadow-xl overflow-hidden border border-slate-200 bg-white">
                  <iframe
                    srcDoc={previewHTML}
                    title="Document preview"
                    className="w-full h-full border-0"
                    sandbox="allow-same-origin"
                  />
                </div>
              </div>

              {/* Style picker sidebar */}
              <div className="w-64 border-l border-slate-100 p-4 overflow-y-auto bg-white">
                <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
                  Estilos disponibles
                </div>
                {(["Classic", "Modern", "Executive"] as const).map((pack) => (
                  <div key={pack} className="mb-4">
                    <div
                      className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded mb-2 inline-block ${PACK_COLORS[pack]}`}
                    >
                      {pack}
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {STYLES.filter((s) => s.pack === pack).map((s) => (
                        <button
                          key={s.id}
                          onClick={() => setSelectedStyleId(s.id)}
                          onMouseEnter={() => setHoverStyle(s.id)}
                          onMouseLeave={() => setHoverStyle(null)}
                          className={`flex flex-col items-center gap-1 p-2 rounded-lg border text-center transition-all ${
                            selectedStyleId === s.id
                              ? "border-indigo-400 bg-indigo-50 shadow-sm"
                              : hoverStyle === s.id
                                ? "border-slate-300 bg-slate-50"
                                : "border-transparent hover:bg-slate-50"
                          }`}
                        >
                          <div
                            className="w-5 h-5 rounded shadow-sm"
                            style={{
                              background: s.gradient || s.accent,
                            }}
                          />
                          <span className="text-[9px] font-medium text-slate-600 leading-tight">
                            {s.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-between px-6 py-3 border-t border-slate-100 bg-slate-50">
              <div className="text-xs text-slate-400">
                Estilo actual:{" "}
                <span className="font-semibold text-slate-600">
                  {selectedStyle.name}
                </span>{" "}
                · Pack {selectedStyle.pack}
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                  Descargar ejemplo PDF
                </button>
                <button className="px-4 py-2 text-sm font-medium bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors shadow-sm">
                  Usar este estilo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── CLICK OUTSIDE TO CLOSE STYLE PICKER ───── */}
      {showStylePicker && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowStylePicker(false)}
        />
      )}
    </div>
  );
}
