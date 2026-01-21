/**
 * Time Entry Row Component
 * For displaying a single time entry in lists/tables
 * P57: Time Tracking Module
 */

import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Trash2, Receipt, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TimeEntry } from '@/hooks/timetracking';

interface TimeEntryRowProps {
  entry: TimeEntry;
  onEdit?: (entry: TimeEntry) => void;
  onDelete?: (entry: TimeEntry) => void;
  onBill?: (entry: TimeEntry) => void;
  showMatter?: boolean;
  showUser?: boolean;
}

const ACTIVITY_LABELS: Record<string, string> = {
  research: 'Investigación',
  drafting: 'Redacción',
  review: 'Revisión',
  meeting: 'Reunión',
  call: 'Llamada',
  email: 'Email',
  filing: 'Presentación',
  court: 'Tribunal',
  travel: 'Desplazamiento',
  admin: 'Administrativo',
  other: 'Otro',
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  draft: { label: 'Borrador', color: 'bg-gray-100 text-gray-700' },
  submitted: { label: 'Enviado', color: 'bg-blue-100 text-blue-700' },
  approved: { label: 'Aprobado', color: 'bg-green-100 text-green-700' },
  rejected: { label: 'Rechazado', color: 'bg-red-100 text-red-700' },
  billed: { label: 'Facturado', color: 'bg-purple-100 text-purple-700' },
};

export function TimeEntryRow({
  entry,
  onEdit,
  onDelete,
  onBill,
  showMatter = true,
  showUser = false,
}: TimeEntryRowProps) {
  const formatDuration = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: entry.currency || 'EUR',
    }).format(amount);
  };

  const status = STATUS_CONFIG[entry.billing_status] || STATUS_CONFIG.draft;

  return (
    <div className="flex items-center gap-4 p-3 border-b hover:bg-muted/50 transition-colors">
      {/* Date */}
      <div className="w-20 text-sm text-muted-foreground">
        {format(new Date(entry.date), 'd MMM', { locale: es })}
      </div>

      {/* Matter (optional) */}
      {showMatter && entry.matter && (
        <div className="w-32 truncate">
          <span className="text-sm font-medium">{entry.matter.reference}</span>
        </div>
      )}

      {/* User (optional) */}
      {showUser && entry.user && (
        <div className="w-28 truncate text-sm">
          {entry.user.full_name}
        </div>
      )}

      {/* Description */}
      <div className="flex-1 min-w-0">
        <p className="text-sm truncate">{entry.description}</p>
        {entry.activity_type && (
          <span className="text-xs text-muted-foreground">
            {ACTIVITY_LABELS[entry.activity_type] || entry.activity_type}
          </span>
        )}
      </div>

      {/* Duration */}
      <div className="w-16 text-right">
        <span className="text-sm font-medium">{formatDuration(entry.duration_minutes)}</span>
      </div>

      {/* Amount */}
      <div className="w-24 text-right">
        {entry.is_billable ? (
          <span className="text-sm font-medium text-green-600">
            {formatCurrency(entry.billing_amount || 0)}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">No facturable</span>
        )}
      </div>

      {/* Status */}
      <div className="w-24">
        <Badge variant="secondary" className={cn('text-xs', status.color)}>
          {status.label}
        </Badge>
      </div>

      {/* Actions */}
      <div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onEdit && entry.billing_status !== 'billed' && (
              <DropdownMenuItem onClick={() => onEdit(entry)}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
            )}
            {onBill && entry.is_billable && entry.billing_status === 'draft' && (
              <DropdownMenuItem onClick={() => onBill(entry)}>
                <Receipt className="mr-2 h-4 w-4" />
                Facturar
              </DropdownMenuItem>
            )}
            {entry.invoice_id && (
              <DropdownMenuItem>
                <FileText className="mr-2 h-4 w-4" />
                Ver factura
              </DropdownMenuItem>
            )}
            {onDelete && entry.billing_status !== 'billed' && (
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => onDelete(entry)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
