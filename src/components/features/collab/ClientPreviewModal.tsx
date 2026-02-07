/**
 * Client Preview Modal — "Ver como cliente"
 * Fullscreen modal showing what a client sees in their portal
 * SILK Design System
 */

import * as React from 'react';
import { useState } from 'react';
import {
  Eye,
  X,
  Briefcase,
  FileText,
  MessageSquare,
  Receipt,
  FolderOpen,
  Mail,
  Clock,
} from 'lucide-react';

interface PortalData {
  id: string;
  portal_name: string;
  client?: {
    name?: string;
    company_name?: string;
  };
  is_active: boolean;
}

interface ClientPreviewModalProps {
  portal: PortalData | null;
  open: boolean;
  onClose: () => void;
}

const TABS = [
  { key: 'expedientes', label: 'Expedientes', icon: Briefcase },
  { key: 'documentos', label: 'Documentos', icon: FileText },
  { key: 'mensajes', label: 'Mensajes', icon: MessageSquare },
  { key: 'facturas', label: 'Facturas', icon: Receipt },
] as const;

type TabKey = typeof TABS[number]['key'];

function EmptyState({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
        style={{
          background: '#f1f4f9',
          boxShadow: '4px 4px 10px #cdd1dc, -4px -4px 10px #ffffff',
        }}
      >
        <Icon className="w-6 h-6" style={{ color: '#00b4d8' }} />
      </div>
      <h3 className="text-sm font-bold mb-1" style={{ color: '#0a2540' }}>
        {title}
      </h3>
      <p className="text-xs" style={{ color: '#64748b', maxWidth: 280 }}>
        {description}
      </p>
    </div>
  );
}

export default function ClientPreviewModal({ portal, open, onClose }: ClientPreviewModalProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('expedientes');

  if (!open || !portal) return null;

  const clientName = portal.client?.name || 'Cliente';
  const clientCompany = portal.client?.company_name || '';

  return (
    <div className="fixed inset-0 z-[100] flex flex-col" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Preview banner — amber/orange */}
      <div
        className="flex items-center justify-between px-6 py-2.5 shrink-0"
        style={{
          background: 'linear-gradient(135deg, #f59e0b, #f97316)',
          color: '#fff',
          boxShadow: '0 2px 12px rgba(245, 158, 11, 0.3)',
        }}
      >
        <div className="flex items-center gap-3">
          <Eye className="w-4 h-4" />
          <span className="text-sm font-semibold">
            Modo Preview — Viendo como: {clientName}
          </span>
          {clientCompany && (
            <span className="text-xs opacity-80 ml-1">({clientCompany})</span>
          )}
        </div>
        <button
          onClick={onClose}
          className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
          style={{ background: 'rgba(255,255,255,0.2)' }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.3)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.2)')}
        >
          <X className="w-4 h-4" />
          Salir del preview
        </button>
      </div>

      {/* Portal content */}
      <div className="flex-1 overflow-auto" style={{ background: '#f1f4f9' }}>
        {/* Portal header */}
        <div
          className="px-8 pt-6 pb-5"
          style={{ background: '#fff', borderBottom: '1px solid rgba(0,0,0,0.06)' }}
        >
          <div className="flex items-center gap-4 max-w-5xl mx-auto">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0"
              style={{ background: 'linear-gradient(135deg, #00b4d8, #00d4aa)' }}
            >
              IP
            </div>
            <div>
              <h1 className="text-lg font-bold" style={{ color: '#0a2540' }}>
                Portal de {clientCompany || clientName}
              </h1>
              <p className="text-xs" style={{ color: '#64748b' }}>
                Bienvenido, {clientName}
              </p>
            </div>
          </div>
        </div>

        {/* Tab navigation + content */}
        <div className="px-8 py-6 max-w-5xl mx-auto">
          {/* Tabs — neumorphic */}
          <div
            className="flex gap-1 p-1 rounded-xl mb-6"
            style={{
              background: '#e8ecf3',
              boxShadow: 'inset 2px 2px 5px #cdd1dc, inset -2px -2px 5px #ffffff',
            }}
          >
            {TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-all"
                style={
                  activeTab === key
                    ? {
                        background: '#f1f4f9',
                        boxShadow: '3px 3px 7px #cdd1dc, -3px -3px 7px #ffffff',
                        color: '#0a2540',
                      }
                    : { color: '#64748b' }
                }
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>

          {/* Tab content — empty states */}
          {activeTab === 'expedientes' && (
            <EmptyState
              icon={Briefcase}
              title="Sin expedientes asignados"
              description="Los expedientes vinculados a este portal aparecerán aquí con su estado y fase actual."
            />
          )}
          {activeTab === 'documentos' && (
            <EmptyState
              icon={FolderOpen}
              title="Sin documentos compartidos"
              description="Los documentos con visibilidad de portal aparecerán aquí para que el cliente los descargue."
            />
          )}
          {activeTab === 'mensajes' && (
            <EmptyState
              icon={Mail}
              title="Sin mensajes"
              description="Las comunicaciones entre el despacho y el cliente se mostrarán en esta sección."
            />
          )}
          {activeTab === 'facturas' && (
            <EmptyState
              icon={Receipt}
              title="Sin facturas"
              description="Las facturas emitidas al cliente aparecerán aquí con su estado de pago."
            />
          )}
        </div>
      </div>
    </div>
  );
}
