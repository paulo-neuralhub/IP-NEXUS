/**
 * LeadDetailModal - Modal con ficha completa del Lead
 * Muestra datos de contacto, empresa, interés, origen y actividades
 */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Phone,
  Mail,
  MessageSquare,
  Building2,
  Globe,
  MapPin,
  Calendar,
  Tag,
  FileText,
  CheckCircle,
  Trash2,
  Clock,
  User,
  Briefcase,
  Link as LinkIcon,
  DollarSign,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Lead } from '@/hooks/crm/useLeads';
import { useCRMPipelines } from '@/hooks/crm/v2/pipelines';
import { PipelineProgressBar } from '@/components/features/crm/shared/PipelineProgressBar';

interface LeadDetailModalProps {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCall?: () => void;
  onEmail?: () => void;
  onWhatsApp?: () => void;
  onApprove?: () => void;
  onDelete?: () => void;
  onStageChange?: (stageId: string) => void;
}

const SOURCE_LABELS: Record<string, { label: string; icon: typeof Globe }> = {
  web: { label: 'Web - Formulario landing', icon: Globe },
  referral: { label: 'Referido', icon: User },
  linkedin: { label: 'LinkedIn', icon: LinkIcon },
  cold_call: { label: 'Llamada en frío', icon: Phone },
  event: { label: 'Evento', icon: Calendar },
  partner: { label: 'Partner', icon: Briefcase },
  other: { label: 'Otro', icon: Globe },
};

export function LeadDetailModal({
  lead,
  open,
  onOpenChange,
  onCall,
  onEmail,
  onWhatsApp,
  onApprove,
  onDelete,
  onStageChange,
}: LeadDetailModalProps) {
  const { data: pipelines = [] } = useCRMPipelines();
  
  if (!lead) return null;

  // Get pipeline stages for this lead
  const leadPipeline = pipelines.find(p => p.id === lead.pipeline_id);
  const stages = leadPipeline?.stages ?? [];

  const initials = lead.contact_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const sourceConfig = SOURCE_LABELS[lead.source || 'other'] || SOURCE_LABELS.other;
  const SourceIcon = sourceConfig.icon;

  // Mock activities for demonstration
  const activities = [
    {
      id: '1',
      type: 'note',
      title: 'Lead recibido por web',
      date: lead.created_at,
    },
    ...(lead.status === 'contacted'
      ? [
          {
            id: '2',
            type: 'email',
            title: 'Enviada info inicial',
            date: new Date(new Date(lead.created_at).getTime() + 86400000).toISOString(),
          },
        ]
      : []),
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="p-6 pb-4 border-b bg-muted/30">
          <div className="flex items-start gap-4">
            <Avatar className="h-14 w-14 bg-primary/10">
              <AvatarFallback className="text-lg font-semibold text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-xl font-bold">
                {lead.contact_name}
              </DialogTitle>
              {lead.company_name && (
                <p className="text-muted-foreground flex items-center gap-1 mt-1">
                  <Building2 className="w-4 h-4" />
                  {lead.company_name}
                </p>
              )}
              <Badge variant="secondary" className="mt-2">
                {lead.status === 'new' ? 'Nuevo' : 
                 lead.status === 'contacted' ? 'Contactado' :
                 lead.status === 'standby' ? 'En espera' : 'Convertido'}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        {/* Pipeline Progress Bar */}
        {stages.length > 0 && lead.stage_id && (
          <div className="px-6 py-2 bg-muted/20 border-b">
            <PipelineProgressBar
              stages={stages}
              currentStageId={lead.stage_id}
              onStageClick={onStageChange}
            />
          </div>
        )}

        <ScrollArea className="flex-1 max-h-[calc(90vh-280px)]">
          <div className="p-6 space-y-6">
            {/* Datos de Contacto */}
            <section>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Datos de Contacto
              </h3>
              <div className="space-y-2">
                {lead.contact_email && (
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <a href={`mailto:${lead.contact_email}`} className="text-primary hover:underline">
                      {lead.contact_email}
                    </a>
                  </div>
                )}
                {lead.contact_phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <a href={`tel:${lead.contact_phone}`} className="hover:underline">
                      {lead.contact_phone}
                    </a>
                  </div>
                )}
              </div>
            </section>

            <Separator />

            {/* Empresa */}
            {lead.company_name && (
              <>
                <section>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                    Empresa
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 text-sm">
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                      <span>{lead.company_name}</span>
                    </div>
                    {lead.company_tax_id && (
                      <div className="flex items-center gap-3 text-sm">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <span className="font-mono">{lead.company_tax_id}</span>
                      </div>
                    )}
                  </div>
                </section>
                <Separator />
              </>
            )}

            {/* Interés */}
            <section>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Interés
              </h3>
              <div className="space-y-3">
                {lead.interested_in && lead.interested_in.length > 0 && (
                  <div className="flex items-start gap-3">
                    <Tag className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div className="flex flex-wrap gap-1">
                      {lead.interested_in.map((tag) => (
                        <Badge key={tag} variant="secondary">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {lead.estimated_value && lead.estimated_value > 0 && (
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <span className="text-lg font-bold text-primary">
                      {lead.estimated_value.toLocaleString('es-ES')} € estimado
                    </span>
                  </div>
                )}
                {lead.notes && (
                  <div className="flex items-start gap-3">
                    <FileText className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {lead.notes}
                    </p>
                  </div>
                )}
              </div>
            </section>

            <Separator />

            {/* Origen */}
            <section>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Origen
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-sm">
                  <SourceIcon className="w-4 h-4 text-muted-foreground" />
                  <span>{sourceConfig.label}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>
                    {format(new Date(lead.created_at), "d 'de' MMMM yyyy", { locale: es })}
                    {' · '}
                    {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true, locale: es })}
                  </span>
                </div>
              </div>
            </section>

            {/* Next Action */}
            {lead.next_action && (
              <>
                <Separator />
                <section>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                    Próxima Acción
                  </h3>
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="font-medium">{lead.next_action}</p>
                    {lead.next_action_date && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3" />
                        {format(new Date(lead.next_action_date), "EEEE d MMM 'a las' HH:mm", { locale: es })}
                      </p>
                    )}
                  </div>
                </section>
              </>
            )}

            {/* Stand-by info */}
            {lead.status === 'standby' && lead.standby_until && (
              <>
                <Separator />
                <section>
                  <h3 className="text-sm font-semibold text-[hsl(var(--ip-pending-text))] uppercase tracking-wide mb-3">
                    En Espera
                  </h3>
                  <div className="bg-[hsl(var(--ip-pending-bg))] p-3 rounded-lg">
                    <p className="font-medium text-[hsl(var(--ip-pending-text))]">
                      Reactivar: {format(new Date(lead.standby_until), "d MMMM yyyy", { locale: es })}
                    </p>
                    {lead.standby_reason && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {lead.standby_reason}
                      </p>
                    )}
                  </div>
                </section>
              </>
            )}

            <Separator />

            {/* Historial de Actividades */}
            <section>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Historial de Actividades
              </h3>
              <div className="space-y-3">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                    <div className="flex-1">
                      <span className="text-muted-foreground">
                        {format(new Date(activity.date), "d/MM", { locale: es })}
                      </span>
                      <span className="mx-2">-</span>
                      <span className="capitalize">{activity.type}:</span>
                      <span className="ml-1">{activity.title}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </ScrollArea>

        {/* Footer Actions */}
        <div className="border-t p-4 bg-muted/30">
          <div className="flex items-center gap-2 flex-wrap">
            {lead.contact_phone && onCall && (
              <Button variant="outline" size="sm" onClick={onCall}>
                <Phone className="w-4 h-4 mr-2" />
                Llamar
              </Button>
            )}
            {lead.contact_phone && onWhatsApp && (
              <Button variant="outline" size="sm" onClick={onWhatsApp}>
                <MessageSquare className="w-4 h-4 mr-2 text-[#25D366]" />
                WhatsApp
              </Button>
            )}
            {lead.contact_email && onEmail && (
              <Button variant="outline" size="sm" onClick={onEmail}>
                <Mail className="w-4 h-4 mr-2" />
                Email
              </Button>
            )}
            <div className="flex-1" />
            {onApprove && (
              <Button size="sm" onClick={onApprove}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Aprobar
              </Button>
            )}
            {onDelete && (
              <Button variant="ghost" size="sm" className="text-destructive" onClick={onDelete}>
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
