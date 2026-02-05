// ============================================================
// IP-NEXUS - Client Info Card (SILK Design System)
// Enhanced client card for matter detail sidebar
// ============================================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, formatDistanceToNow, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Building2, Mail, Phone, MapPin, Globe, CreditCard,
  MessageCircle, ChevronRight, Star, Calendar, Clock,
  Edit3, Plus, Briefcase, User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { NeoBadge } from '@/components/ui/neo-badge';
import { cn } from '@/lib/utils';
import { useCRMAccount } from '@/hooks/crm/v2/accounts';
import { toast } from 'sonner';

interface ClientInfoCardProps {
  clientId: string | null;
  clientName: string | null | undefined;
  clientEmail: string | null | undefined;
  clientPhone: string | null | undefined;
  isUrgent?: boolean;
  createdAt?: string;
  onEmailClick?: () => void;
  onWhatsAppClick?: () => void;
  onCallClick?: () => void;
}

export function ClientInfoCard({
  clientId,
  clientName,
  clientEmail,
  clientPhone,
  isUrgent = false,
  createdAt,
  onEmailClick,
  onWhatsAppClick,
  onCallClick,
}: ClientInfoCardProps) {
  const navigate = useNavigate();
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notes, setNotes] = useState('');

  // Fetch full client data if we have an ID
  const { data: clientData } = useCRMAccount(clientId || '');

  if (!clientId || !clientName) {
    return (
      <div 
        style={{
          borderRadius: '14px',
          border: '1px solid rgba(0, 0, 0, 0.06)',
          background: '#f1f4f9',
          overflow: 'hidden'
        }}
      >
        <div className="text-center py-8 px-4">
          <div 
            className="w-14 h-14 mx-auto mb-3 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(148, 163, 184, 0.1)' }}
          >
            <Building2 className="h-6 w-6" style={{ color: '#94a3b8' }} />
          </div>
          <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '12px' }}>
            Sin cliente asignado
          </p>
          <Button variant="outline" size="sm" style={{ fontSize: '11px' }}>
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Asignar cliente
          </Button>
        </div>
      </div>
    );
  }

  // Get enriched data from CRM account
  const company = clientData?.legal_name || clientData?.name || '';
  const address = clientData?.billing_address_line1 
    ? `${clientData.billing_address_line1}${clientData.billing_address_city ? `, ${clientData.billing_address_city}` : ''}${clientData.billing_address_postal_code ? ` ${clientData.billing_address_postal_code}` : ''}`
    : '';
  const website = (clientData as any)?.website || '';
  const taxId = clientData?.tax_id || '';
  const clientType = (clientData?.client_type as any)?.name || 'Corporativo';
  const clientTypeColor = (clientData?.client_type as any)?.color || '#00b4d8';
  const rating = clientData?.rating_stars || 0;
  const tier = clientData?.tier || 'standard';
  const clientNotes = (clientData as any)?.notes || notes;
  
  // Stats from client data
  const totalMatters = 0; // Would need to fetch from stats
  const activeMatters = 0;
  const totalInvoiced = 0;
  
  // Activity tracking
  const lastInteraction = clientData?.last_interaction_at;
  const daysSinceContact = lastInteraction 
    ? differenceInDays(new Date(), new Date(lastInteraction))
    : null;
  
  const getContactColor = () => {
    if (daysSinceContact === null) return '#64748b';
    if (daysSinceContact <= 7) return '#10b981'; // Green - recent
    if (daysSinceContact <= 30) return '#f59e0b'; // Amber - medium
    return '#64748b'; // Slate - old
  };

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  // Badge styles based on tier
  const tierConfig: Record<string, { bg: string; text: string; label: string }> = {
    premium: { bg: 'rgba(245, 158, 11, 0.1)', text: '#f59e0b', label: 'Cliente Premium' },
    vip: { bg: 'rgba(139, 92, 246, 0.1)', text: '#8b5cf6', label: 'Cliente VIP' },
    enterprise: { bg: 'rgba(16, 185, 129, 0.1)', text: '#10b981', label: 'Enterprise' },
    standard: { bg: 'rgba(0, 180, 216, 0.1)', text: '#00b4d8', label: 'Cliente Corporativo' },
  };
  
  const currentTier = tierConfig[tier] || tierConfig.standard;
  if (isUrgent && tier === 'standard') {
    currentTier.label = 'Cliente VIP';
    currentTier.bg = tierConfig.vip.bg;
    currentTier.text = tierConfig.vip.text;
  }

  return (
    <div 
      style={{
        borderRadius: '14px',
        border: '1px solid rgba(0, 0, 0, 0.06)',
        overflow: 'hidden'
      }}
    >
      {/* Header with gradient */}
      <div 
        style={{
          padding: '20px',
          background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.04)'
        }}
      >
        {/* Type badge */}
        <div 
          className="inline-flex items-center gap-2 mb-4"
          style={{
            padding: '6px 10px',
            borderRadius: '8px',
            background: currentTier.bg,
            border: `1px solid ${currentTier.text}15`
          }}
        >
          <div 
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: currentTier.text,
              boxShadow: `0 0 8px ${currentTier.text}80`
            }}
          />
          <span style={{ fontSize: '11px', fontWeight: 600, color: currentTier.text }}>
            {currentTier.label}
          </span>
        </div>

        {/* Avatar and name */}
        <div className="flex items-start gap-4">
          {/* Large avatar */}
          <div 
            className="w-16 h-16 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: `linear-gradient(135deg, ${clientTypeColor} 0%, ${clientTypeColor}cc 100%)`,
              boxShadow: `0 4px 12px ${clientTypeColor}40`
            }}
          >
            <span style={{ fontSize: '18px', fontWeight: 700, color: 'white' }}>
              {getInitials(clientName)}
            </span>
          </div>

          {/* Name and company */}
          <div className="flex-1 min-w-0">
            <h3 style={{ 
              fontSize: '16px', 
              fontWeight: 700, 
              color: '#0a2540',
              marginBottom: '4px',
              lineHeight: 1.3
            }}>
              {clientName}
            </h3>
            {company && company !== clientName && (
              <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>
                {company}
              </p>
            )}
            {/* Rating stars */}
            {rating > 0 && (
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className="h-3 w-3"
                    style={{
                      fill: star <= rating ? '#f59e0b' : 'transparent',
                      color: star <= rating ? '#f59e0b' : '#d1d5db'
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contact data */}
      <div style={{ padding: '16px', background: '#f1f4f9' }}>
        <div className="space-y-2">
          {/* Email */}
          {clientEmail && (
            <a 
              href={`mailto:${clientEmail}`}
              className="flex items-center gap-3 p-2 rounded-lg transition-all hover:bg-white/60"
              style={{ textDecoration: 'none' }}
            >
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: 'rgba(59, 130, 246, 0.08)' }}
              >
                <Mail className="h-4 w-4" style={{ color: '#3b82f6' }} />
              </div>
              <span style={{ fontSize: '12px', color: '#0a2540' }} className="truncate">
                {clientEmail}
              </span>
            </a>
          )}

          {/* Phone */}
          {clientPhone && (
            <a 
              href={`tel:${clientPhone}`}
              className="flex items-center gap-3 p-2 rounded-lg transition-all hover:bg-white/60"
              style={{ textDecoration: 'none' }}
            >
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: 'rgba(16, 185, 129, 0.08)' }}
              >
                <Phone className="h-4 w-4" style={{ color: '#10b981' }} />
              </div>
              <span style={{ fontSize: '12px', color: '#0a2540' }}>
                {clientPhone}
              </span>
            </a>
          )}

          {/* Address */}
          {address && (
            <div className="flex items-center gap-3 p-2">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: 'rgba(139, 92, 246, 0.08)' }}
              >
                <MapPin className="h-4 w-4" style={{ color: '#8b5cf6' }} />
              </div>
              <span style={{ fontSize: '12px', color: '#0a2540' }} className="line-clamp-2">
                {address}
              </span>
            </div>
          )}

          {/* Website */}
          {website && (
            <a 
              href={website.startsWith('http') ? website : `https://${website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-2 rounded-lg transition-all hover:bg-white/60"
              style={{ textDecoration: 'none' }}
            >
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: 'rgba(0, 180, 216, 0.08)' }}
              >
                <Globe className="h-4 w-4" style={{ color: '#00b4d8' }} />
              </div>
              <span style={{ fontSize: '12px', color: '#0a2540' }} className="truncate">
                {website.replace(/^https?:\/\//, '')}
              </span>
            </a>
          )}

          {/* Tax ID */}
          {taxId && (
            <div className="flex items-center gap-3 p-2">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: 'rgba(100, 116, 139, 0.08)' }}
              >
                <CreditCard className="h-4 w-4" style={{ color: '#64748b' }} />
              </div>
              <span style={{ fontSize: '12px', color: '#0a2540' }}>
                NIF: {taxId}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* KPIs Summary */}
      <div style={{ padding: '0 16px 16px', background: '#f1f4f9' }}>
        <div 
          className="flex items-center gap-2 mb-3"
          style={{ fontSize: '12px', fontWeight: 600, color: '#0a2540' }}
        >
          📊 Resumen
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div 
            className="flex flex-col items-center p-3 rounded-lg"
            style={{ background: 'rgba(255, 255, 255, 0.6)', border: '1px solid rgba(0, 0, 0, 0.04)' }}
          >
            <span style={{ fontSize: '18px', fontWeight: 700, color: '#0a2540' }}>
              {totalMatters || '-'}
            </span>
            <span style={{ fontSize: '10px', color: '#64748b' }}>Exp.</span>
          </div>
          <div 
            className="flex flex-col items-center p-3 rounded-lg"
            style={{ background: 'rgba(255, 255, 255, 0.6)', border: '1px solid rgba(0, 0, 0, 0.04)' }}
          >
            <span style={{ fontSize: '18px', fontWeight: 700, color: '#10b981' }}>
              {activeMatters || '-'}
            </span>
            <span style={{ fontSize: '10px', color: '#64748b' }}>Actv</span>
          </div>
          <div 
            className="flex flex-col items-center p-3 rounded-lg"
            style={{ background: 'rgba(255, 255, 255, 0.6)', border: '1px solid rgba(0, 0, 0, 0.04)' }}
          >
            <span style={{ fontSize: '18px', fontWeight: 700, color: '#3b82f6' }}>
              {totalInvoiced ? `${(totalInvoiced / 1000).toFixed(0)}K€` : '-'}
            </span>
            <span style={{ fontSize: '10px', color: '#64748b' }}>Fact</span>
          </div>
        </div>
      </div>

      {/* Activity info */}
      <div style={{ padding: '0 16px 16px', background: '#f1f4f9' }}>
        <div className="space-y-2">
          {/* Client since */}
          {createdAt && (
            <div className="flex items-center gap-2" style={{ fontSize: '11px', color: '#64748b' }}>
              <Calendar className="h-3.5 w-3.5" />
              <span>Cliente desde {format(new Date(createdAt), "MMMM yyyy", { locale: es })}</span>
            </div>
          )}
          
          {/* Last contact */}
          {lastInteraction && (
            <div className="flex items-center gap-2" style={{ fontSize: '11px', color: getContactColor() }}>
              <Clock className="h-3.5 w-3.5" />
              <span>
                Último contacto: {formatDistanceToNow(new Date(lastInteraction), { locale: es, addSuffix: true })}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ padding: '0 16px 16px', background: '#f1f4f9' }}>
        <div className="grid grid-cols-3 gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onEmailClick}
                className="flex items-center justify-center gap-1.5 py-2 rounded-xl transition-all hover:shadow-sm"
                style={{
                  background: 'white',
                  border: '1px solid rgba(0, 0, 0, 0.06)',
                  fontSize: '11px',
                  fontWeight: 500,
                  color: '#3b82f6'
                }}
              >
                <Mail className="h-3.5 w-3.5" />
                Email
              </button>
            </TooltipTrigger>
            <TooltipContent>Enviar email</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onWhatsAppClick}
                className="flex items-center justify-center gap-1.5 py-2 rounded-xl transition-all hover:shadow-sm hover:bg-green-50 hover:border-green-200"
                style={{
                  background: 'white',
                  border: '1px solid rgba(0, 0, 0, 0.06)',
                  fontSize: '11px',
                  fontWeight: 500,
                  color: '#22c55e'
                }}
              >
                <MessageCircle className="h-3.5 w-3.5" />
                WA
              </button>
            </TooltipTrigger>
            <TooltipContent>Enviar WhatsApp</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onCallClick}
                className="flex items-center justify-center gap-1.5 py-2 rounded-xl transition-all hover:shadow-sm"
                style={{
                  background: 'white',
                  border: '1px solid rgba(0, 0, 0, 0.06)',
                  fontSize: '11px',
                  fontWeight: 500,
                  color: '#00b4d8'
                }}
              >
                <Phone className="h-3.5 w-3.5" />
                Llamar
              </button>
            </TooltipTrigger>
            <TooltipContent>Llamar al cliente</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Notes section */}
      <div style={{ padding: '0 16px 16px', background: '#f1f4f9' }}>
        <div 
          className="flex items-center justify-between mb-2"
          style={{ fontSize: '12px', fontWeight: 600, color: '#0a2540' }}
        >
          <span>📋 Notas del cliente</span>
          {clientNotes && !isEditingNotes && (
            <button
              onClick={() => setIsEditingNotes(true)}
              className="p-1 rounded hover:bg-white/60"
            >
              <Edit3 className="h-3 w-3" style={{ color: '#64748b' }} />
            </button>
          )}
        </div>
        
        {isEditingNotes ? (
          <div className="space-y-2">
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Añadir notas sobre el cliente..."
              className="min-h-[60px] text-sm"
              style={{ fontSize: '12px' }}
            />
            <div className="flex justify-end gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsEditingNotes(false)}
                style={{ fontSize: '11px' }}
              >
                Cancelar
              </Button>
              <Button 
                size="sm" 
                onClick={() => setIsEditingNotes(false)}
                style={{ fontSize: '11px' }}
              >
                Guardar
              </Button>
            </div>
          </div>
        ) : clientNotes ? (
          <div 
            className="p-3 rounded-lg"
            style={{ 
              background: 'rgba(251, 191, 36, 0.08)', 
              border: '1px solid rgba(251, 191, 36, 0.15)',
              fontSize: '12px',
              fontStyle: 'italic',
              color: '#78350f',
              lineHeight: 1.5
            }}
          >
            "{clientNotes}"
          </div>
        ) : (
          <button
            onClick={() => setIsEditingNotes(true)}
            className="w-full p-3 rounded-lg text-left transition-all hover:bg-white/60"
            style={{
              border: '1px dashed rgba(0, 0, 0, 0.1)',
              fontSize: '12px',
              color: '#94a3b8'
            }}
          >
            <Plus className="h-3 w-3 inline-block mr-1" />
            Añadir nota...
          </button>
        )}
      </div>

      {/* Link to full profile */}
      <div style={{ padding: '0 16px 16px', background: '#f1f4f9' }}>
        <button
          onClick={() => {
            if (clientId) {
              // Try to navigate to CRM account
              navigate(`/app/crm/accounts/${clientId}`);
            } else {
              toast.info('Este cliente no tiene ficha CRM completa', {
                description: 'Es un cliente asociado al expediente sin datos adicionales.',
              });
            }
          }}
          className="w-full flex items-center justify-between py-2.5 px-3 rounded-xl transition-all hover:bg-white/80"
          style={{
            background: 'white',
            border: '1px solid rgba(0, 0, 0, 0.06)',
            fontSize: '12px',
            fontWeight: 500,
            color: '#00b4d8'
          }}
        >
          <span>Ver ficha completa</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
