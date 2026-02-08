/**
 * MarketNotificationPanel — SILK Design
 * Dropdown panel for the Market bell icon showing notification history
 */
import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell, Check, CheckCheck, Archive, Clock,
  MessageSquare, CheckCircle, XCircle, CreditCard,
  Flag, Package, DollarSign, AlertTriangle, MessageCircle,
} from 'lucide-react';
import {
  useMarketNotifications,
  useMarketUnreadCount,
  useMarkMarketNotificationRead,
  useMarkAllMarketRead,
  type MarketNotification,
} from '@/hooks/market/useMarketNotifications';
import {
  MARKET_NOTIFICATION_CONFIG,
  type MarketNotificationType,
} from '@/types/market-notifications';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

// ── Icon map ──
const ICON_MAP: Record<string, React.ComponentType<any>> = {
  MessageSquare,
  CheckCircle,
  XCircle,
  CreditCard,
  Flag,
  Package,
  DollarSign,
  AlertTriangle,
  MessageCircle,
  Clock,
};

function getIcon(iconName: string) {
  return ICON_MAP[iconName] || Bell;
}

export function MarketNotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { data: unread = 0 } = useMarketUnreadCount();

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      {/* Bell button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ background: '#f1f4f9', boxShadow: '3px 3px 7px #cdd1dc, -3px -3px 7px #ffffff' }}
      >
        <Bell className="w-4 h-4" style={{ color: '#64748b' }} />
        {unread > 0 && (
          <span
            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-white"
            style={{ fontSize: '9px', fontWeight: 700, background: '#ef4444', padding: '0 4px' }}
          >
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && <NotificationDropdown onClose={() => setOpen(false)} />}
    </div>
  );
}

function NotificationDropdown({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const { data: notifications = [], isLoading } = useMarketNotifications(20);
  const markRead = useMarkMarketNotificationRead();
  const markAllRead = useMarkAllMarketRead();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filtered = filter === 'unread' ? notifications.filter(n => !n.is_read) : notifications;

  const handleClick = (n: MarketNotification) => {
    if (!n.is_read) markRead.mutate(n.id);
    if (n.transaction_id) {
      navigate('/app/market/transactions');
      onClose();
    } else if (n.request_id) {
      navigate(`/app/market/rfq/${n.request_id}`);
      onClose();
    }
  };

  return (
    <div
      className="absolute right-0 top-12 w-[380px] max-h-[480px] rounded-2xl overflow-hidden z-50"
      style={{
        background: '#fff',
        boxShadow: '0 15px 50px rgba(0,0,0,0.12)',
        border: '1px solid rgba(0,0,0,0.06)',
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0a2540' }}>Notificaciones</h3>
        <div className="flex items-center gap-2">
          {/* Filter pills */}
          {(['all', 'unread'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all"
              style={
                filter === f
                  ? { background: '#0a2540', color: '#fff' }
                  : { background: '#f8fafc', color: '#94a3b8' }
              }
            >
              {f === 'all' ? 'Todas' : 'No leídas'}
            </button>
          ))}
          {/* Mark all read */}
          <button
            onClick={() => markAllRead.mutate()}
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: '#f1f4f9' }}
            title="Marcar todo como leído"
          >
            <CheckCheck className="w-3.5 h-3.5" style={{ color: '#94a3b8' }} />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="overflow-y-auto" style={{ maxHeight: '400px' }}>
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="w-5 h-5 border-2 border-slate-200 border-t-slate-500 rounded-full animate-spin mx-auto" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="w-8 h-8 mx-auto mb-2" style={{ color: '#e2e8f0' }} />
            <p style={{ fontSize: '12px', color: '#94a3b8' }}>
              {filter === 'unread' ? 'No hay notificaciones sin leer' : 'Sin notificaciones aún'}
            </p>
          </div>
        ) : (
          filtered.map((n) => {
            const config = MARKET_NOTIFICATION_CONFIG[n.type];
            if (!config) return null;
            const Icon = getIcon(config.icon);

            return (
              <div
                key={n.id}
                onClick={() => handleClick(n)}
                className="flex items-start gap-3 px-4 py-3 cursor-pointer transition-all hover:bg-slate-50"
                style={{
                  borderBottom: '1px solid rgba(0,0,0,0.03)',
                  background: n.is_read ? 'transparent' : 'rgba(0,180,216,0.02)',
                }}
              >
                {/* Icon */}
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: config.bgColor }}
                >
                  <Icon className="w-4 h-4" style={{ color: config.color }} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className="truncate"
                      style={{
                        fontSize: '12px',
                        fontWeight: n.is_read ? 500 : 600,
                        color: '#0a2540',
                        lineHeight: 1.3,
                      }}
                    >
                      {n.title}
                    </p>
                    {!n.is_read && (
                      <div className="w-2 h-2 rounded-full shrink-0 mt-1" style={{ background: '#00b4d8' }} />
                    )}
                  </div>
                  <p
                    className="line-clamp-2"
                    style={{ fontSize: '11px', color: '#64748b', lineHeight: 1.4, marginTop: '2px' }}
                  >
                    {n.message}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span style={{ fontSize: '9px', color: '#94a3b8' }}>
                      {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: es })}
                    </span>
                    <span
                      className="px-1.5 py-0.5 rounded text-[8px] font-semibold"
                      style={{ background: config.bgColor, color: config.color }}
                    >
                      {config.label}
                    </span>
                  </div>
                </div>

                {/* Mark read */}
                {!n.is_read && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    markRead.mutate(n.id);
                  }}
                  className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 opacity-0 group-hover:opacity-100 hover:bg-slate-100"
                  title="Marcar como leída"
                >
                  <Check className="w-3 h-3" style={{ color: '#94a3b8' }} />
                </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
