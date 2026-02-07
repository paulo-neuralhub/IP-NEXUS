// ═══════════════════════════════════════
// IP-MARKET — Status, Service & Milestone Helpers
// ═══════════════════════════════════════

import {
  Shield,
  Lightbulb,
  PenTool,
  ShieldAlert,
  Eye,
  RefreshCw,
  Search,
  Scale,
  Gavel,
  MoreHorizontal,
  type LucideIcon,
} from 'lucide-react';

// ── Request / Transaction statuses ──────────────────────────

export interface StatusConfig {
  color: string;
  label: string;
  gradient: string;
}

export const REQUEST_STATUS_CONFIG: Record<string, StatusConfig> = {
  draft:       { color: '#94a3b8', label: 'Borrador',    gradient: '#e8ecf3' },
  open:        { color: '#00b4d8', label: 'Abierta',     gradient: 'linear-gradient(135deg, #00b4d8, #00d4aa)' },
  reviewing:   { color: '#6366f1', label: 'Revisando',   gradient: 'linear-gradient(135deg, #6366f1, #818cf8)' },
  accepted:    { color: '#10b981', label: 'Aceptada',    gradient: 'linear-gradient(135deg, #10b981, #34d399)' },
  in_progress: { color: '#f59e0b', label: 'En proceso',  gradient: 'linear-gradient(135deg, #f59e0b, #fbbf24)' },
  completed:   { color: '#10b981', label: 'Completada',  gradient: 'linear-gradient(135deg, #10b981, #059669)' },
  disputed:    { color: '#ef4444', label: 'En disputa',  gradient: 'linear-gradient(135deg, #ef4444, #f87171)' },
  cancelled:   { color: '#94a3b8', label: 'Cancelada',   gradient: '#e8ecf3' },
  expired:     { color: '#94a3b8', label: 'Expirada',    gradient: '#e8ecf3' },
};

export const TRANSACTION_STATUS_CONFIG: Record<string, StatusConfig> = {
  pending_payment: { color: '#f59e0b', label: 'Pago pendiente',   gradient: 'linear-gradient(135deg, #f59e0b, #fbbf24)' },
  payment_held:    { color: '#6366f1', label: 'Fondos retenidos', gradient: 'linear-gradient(135deg, #6366f1, #818cf8)' },
  in_progress:     { color: '#00b4d8', label: 'En proceso',       gradient: 'linear-gradient(135deg, #00b4d8, #00d4aa)' },
  delivered:       { color: '#10b981', label: 'Entregado',         gradient: 'linear-gradient(135deg, #10b981, #34d399)' },
  completed:       { color: '#10b981', label: 'Completada',        gradient: 'linear-gradient(135deg, #10b981, #059669)' },
  disputed:        { color: '#ef4444', label: 'En disputa',        gradient: 'linear-gradient(135deg, #ef4444, #f87171)' },
  refunded:        { color: '#94a3b8', label: 'Reembolsada',       gradient: '#e8ecf3' },
  cancelled:       { color: '#94a3b8', label: 'Cancelada',         gradient: '#e8ecf3' },
};

export const OFFER_STATUS_CONFIG: Record<string, StatusConfig> = {
  pending:   { color: '#f59e0b', label: 'Pendiente',  gradient: 'linear-gradient(135deg, #f59e0b, #fbbf24)' },
  viewed:    { color: '#6366f1', label: 'Vista',       gradient: 'linear-gradient(135deg, #6366f1, #818cf8)' },
  accepted:  { color: '#10b981', label: 'Aceptada',    gradient: 'linear-gradient(135deg, #10b981, #34d399)' },
  rejected:  { color: '#ef4444', label: 'Rechazada',   gradient: 'linear-gradient(135deg, #ef4444, #f87171)' },
  withdrawn: { color: '#94a3b8', label: 'Retirada',    gradient: '#e8ecf3' },
  expired:   { color: '#94a3b8', label: 'Expirada',    gradient: '#e8ecf3' },
};

export const MILESTONE_STATUS_CONFIG: Record<string, StatusConfig> = {
  pending:     { color: '#94a3b8', label: 'Pendiente',   gradient: '#e8ecf3' },
  in_progress: { color: '#f59e0b', label: 'En proceso',  gradient: 'linear-gradient(135deg, #f59e0b, #fbbf24)' },
  delivered:   { color: '#6366f1', label: 'Entregado',    gradient: 'linear-gradient(135deg, #6366f1, #818cf8)' },
  approved:    { color: '#10b981', label: 'Aprobado',     gradient: 'linear-gradient(135deg, #10b981, #34d399)' },
  disputed:    { color: '#ef4444', label: 'En disputa',   gradient: 'linear-gradient(135deg, #ef4444, #f87171)' },
};

// ── Service types ───────────────────────────────────────────

export interface ServiceConfig {
  icon: LucideIcon;
  color: string;
  label: string;
}

export const SERVICE_TYPE_CONFIG: Record<string, ServiceConfig> = {
  trademark_registration: { icon: Shield,         color: '#00b4d8', label: 'Registro de marca' },
  patent:                 { icon: Lightbulb,      color: '#6366f1', label: 'Registro de patente' },
  design:                 { icon: PenTool,        color: '#f59e0b', label: 'Registro de diseño' },
  opposition:             { icon: ShieldAlert,    color: '#ef4444', label: 'Oposición / Nulidad' },
  surveillance:           { icon: Eye,            color: '#10b981', label: 'Vigilancia' },
  renewal:                { icon: RefreshCw,      color: '#0a2540', label: 'Renovación' },
  search:                 { icon: Search,         color: '#00d4aa', label: 'Búsqueda anterioridades' },
  legal_opinion:          { icon: Scale,          color: '#8b5cf6', label: 'Opinión legal' },
  litigation:             { icon: Gavel,          color: '#dc2626', label: 'Litigación IP' },
  other:                  { icon: MoreHorizontal, color: '#64748b', label: 'Otro servicio' },
};

// ── Default milestones per service ──────────────────────────

export interface DefaultMilestone {
  name: string;
  percentage: number;
}

export const DEFAULT_MILESTONES: Record<string, DefaultMilestone[]> = {
  trademark_registration: [
    { name: 'Búsqueda de anterioridades', percentage: 15 },
    { name: 'Preparación y presentación', percentage: 35 },
    { name: 'Seguimiento y respuesta a objeciones', percentage: 25 },
    { name: 'Certificado de registro', percentage: 25 },
  ],
  patent: [
    { name: 'Estudio de patentabilidad', percentage: 20 },
    { name: 'Redacción de reivindicaciones', percentage: 30 },
    { name: 'Presentación ante oficina', percentage: 25 },
    { name: 'Seguimiento hasta concesión', percentage: 25 },
  ],
  design: [
    { name: 'Análisis y preparación', percentage: 25 },
    { name: 'Presentación ante oficina', percentage: 40 },
    { name: 'Certificado de registro', percentage: 35 },
  ],
  opposition: [
    { name: 'Análisis de viabilidad', percentage: 20 },
    { name: 'Redacción y presentación', percentage: 40 },
    { name: 'Seguimiento y resolución', percentage: 40 },
  ],
  surveillance: [
    { name: 'Configuración de vigilancia', percentage: 30 },
    { name: 'Informe inicial', percentage: 35 },
    { name: 'Informe de seguimiento', percentage: 35 },
  ],
  renewal: [
    { name: 'Verificación de datos', percentage: 20 },
    { name: 'Pago de tasas y presentación', percentage: 50 },
    { name: 'Confirmación de renovación', percentage: 30 },
  ],
  search: [
    { name: 'Búsqueda exhaustiva', percentage: 60 },
    { name: 'Informe de resultados', percentage: 40 },
  ],
  legal_opinion: [
    { name: 'Análisis del caso', percentage: 40 },
    { name: 'Redacción de dictamen', percentage: 40 },
    { name: 'Entrega y revisión', percentage: 20 },
  ],
  litigation: [
    { name: 'Análisis y estrategia', percentage: 15 },
    { name: 'Presentación de demanda / contestación', percentage: 30 },
    { name: 'Fase probatoria', percentage: 30 },
    { name: 'Sentencia / Resolución', percentage: 25 },
  ],
  other: [
    { name: 'Inicio del servicio', percentage: 30 },
    { name: 'Ejecución', percentage: 40 },
    { name: 'Entrega final', percentage: 30 },
  ],
};

// ── Fee calculation ─────────────────────────────────────────

export const PLATFORM_FEE_SELLER_PCT = 10; // 10% on professional fees
export const PLATFORM_FEE_BUYER_PCT = 5;   // 5% on professional fees

export function calculateFees(professionalFees: number, officialFees: number = 0) {
  const sellerFee = Math.round(professionalFees * (PLATFORM_FEE_SELLER_PCT / 100) * 100) / 100;
  const buyerFee = Math.round(professionalFees * (PLATFORM_FEE_BUYER_PCT / 100) * 100) / 100;
  const totalBuyerPays = professionalFees + officialFees + buyerFee;
  const totalSellerReceives = professionalFees + officialFees - sellerFee;

  return {
    professionalFees,
    officialFees,
    platformFeeSeller: sellerFee,
    platformFeeBuyer: buyerFee,
    totalBuyerPays,
    totalSellerReceives,
  };
}

// ── Urgency config ──────────────────────────────────────────

export const URGENCY_CONFIG: Record<string, { label: string; color: string; daysToExpire: number }> = {
  urgent:   { label: 'Urgente',  color: '#ef4444', daysToExpire: 3 },
  normal:   { label: 'Normal',   color: '#f59e0b', daysToExpire: 14 },
  flexible: { label: 'Flexible', color: '#10b981', daysToExpire: 30 },
};
