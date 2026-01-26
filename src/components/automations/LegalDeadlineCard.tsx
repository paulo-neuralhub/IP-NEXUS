// ============================================================
// IP-NEXUS - LEGAL DEADLINE CARD
// Displays a single legal deadline reference
// ============================================================

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { LegalDeadline } from '@/hooks/useLegalDeadlines';
import { VerificationBadge } from './VerificationBadge';
import { cn } from '@/lib/utils';

interface LegalDeadlineCardProps {
  deadline: LegalDeadline;
}

export function LegalDeadlineCard({ deadline }: LegalDeadlineCardProps) {
  // Format duration
  const formatDuration = () => {
    const parts: string[] = [];
    
    if (deadline.years_offset) {
      parts.push(`${deadline.years_offset} año${deadline.years_offset > 1 ? 's' : ''}`);
    }
    if (deadline.months_offset) {
      parts.push(`${deadline.months_offset} mes${deadline.months_offset > 1 ? 'es' : ''}`);
    }
    if (deadline.days_offset) {
      parts.push(`${deadline.days_offset} día${deadline.days_offset > 1 ? 's' : ''}`);
    }
    
    return parts.length > 0 ? parts.join(' ') : 'No definido';
  };

  // Format grace period
  const formatGrace = () => {
    if (!deadline.grace_period_days && !deadline.grace_period_months) {
      return 'No aplica';
    }
    
    const parts: string[] = [];
    if (deadline.grace_period_months) {
      parts.push(`${deadline.grace_period_months} mes${deadline.grace_period_months > 1 ? 'es' : ''}`);
    }
    if (deadline.grace_period_days) {
      parts.push(`${deadline.grace_period_days} día${deadline.grace_period_days > 1 ? 's' : ''}`);
    }
    
    return parts.join(' ') + (deadline.grace_has_surcharge ? ' con recargo' : '');
  };

  // Get deadline category label
  const getCategoryLabel = () => {
    const labels: Record<string, string> = {
      opposition: 'Oposición',
      renewal: 'Renovación',
      response: 'Respuesta',
      declaration: 'Declaración',
      annuity: 'Anualidad',
      validation: 'Validación',
      appeal: 'Apelación',
      examination: 'Examen',
    };
    return labels[deadline.deadline_category] || deadline.deadline_category;
  };

  // Get right type label
  const getRightTypeLabel = () => {
    const labels: Record<string, { label: string; color: string }> = {
      trademark: { label: 'Marca', color: 'bg-purple-100 text-purple-700' },
      patent: { label: 'Patente', color: 'bg-blue-100 text-blue-700' },
      design: { label: 'Diseño', color: 'bg-pink-100 text-pink-700' },
    };
    return labels[deadline.right_type] || { label: deadline.right_type, color: 'bg-muted text-muted-foreground' };
  };

  const rightType = getRightTypeLabel();

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-medium">{deadline.name}</h3>
              {deadline.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {deadline.description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge className={cn("shrink-0", rightType.color)}>
                {rightType.label}
              </Badge>
              <Badge variant="outline">{getCategoryLabel()}</Badge>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Duración</p>
              <p className="font-medium flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDuration()}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Período de gracia</p>
              <p className="font-medium">{formatGrace()}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Extensible</p>
              <p className="font-medium flex items-center gap-1">
                {deadline.is_extendable ? (
                  <>
                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                    Sí
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-3 w-3 text-muted-foreground" />
                    No
                  </>
                )}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Trigger</p>
              <p className="font-medium capitalize">
                {deadline.trigger_event?.replace(/_/g, ' ') || 'N/A'}
              </p>
            </div>
          </div>

          {/* Legal Basis */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {deadline.legal_basis && (
                <span>Base legal: {deadline.legal_basis}</span>
              )}
              {deadline.legal_basis_url && (
                <a
                  href={deadline.legal_basis_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-1"
                >
                  <ExternalLink className="h-3 w-3" />
                  Fuente oficial
                </a>
              )}
            </div>
            {deadline.last_verified_at && (
              <VerificationBadge date={deadline.last_verified_at} showLabel />
            )}
          </div>

          {/* Notes */}
          {deadline.notes && (
            <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
              <strong>Notas:</strong> {deadline.notes}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
