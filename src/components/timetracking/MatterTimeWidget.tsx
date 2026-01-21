/**
 * Matter Time Widget
 * Displays time entries for a specific matter
 * P57: Time Tracking Module
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Plus, Play, Receipt } from 'lucide-react';
import { useTimeEntries, useStartTimer, TimeEntry } from '@/hooks/timetracking';
import { AddTimeEntryDialog } from './AddTimeEntryDialog';
import { TimeEntryRow } from './TimeEntryRow';
import { toast } from 'sonner';

interface MatterTimeWidgetProps {
  matterId: string;
  matterReference: string;
  matterTitle: string;
}

export function MatterTimeWidget({
  matterId,
  matterReference,
  matterTitle,
}: MatterTimeWidgetProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);

  const { data: entries = [], isLoading } = useTimeEntries({ matterId });
  const startTimerMutation = useStartTimer();

  // Calculate totals
  const totalMinutes = entries.reduce((sum, e) => sum + e.duration_minutes, 0);
  const billableMinutes = entries
    .filter((e) => e.is_billable)
    .reduce((sum, e) => sum + e.duration_minutes, 0);
  const totalAmount = entries.reduce((sum, e) => sum + (e.billing_amount || 0), 0);
  const unbilledAmount = entries
    .filter((e) => e.billing_status !== 'billed')
    .reduce((sum, e) => sum + (e.billing_amount || 0), 0);

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
      currency: 'EUR',
    }).format(amount);
  };

  const handleStartTimer = async () => {
    try {
      await startTimerMutation.mutateAsync({
        matter_id: matterId,
        is_billable: true,
      });
      toast.success('Timer iniciado');
    } catch (error: any) {
      toast.error(error.message || 'Error al iniciar timer');
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Tiempo registrado
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleStartTimer}
              disabled={startTimerMutation.isPending}
            >
              <Play className="h-4 w-4 mr-1" />
              Timer
            </Button>
            <Button size="sm" onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Añadir
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-3">
          <div className="text-center p-2 bg-muted/50 rounded-lg">
            <div className="text-lg font-semibold">{formatDuration(totalMinutes)}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
          <div className="text-center p-2 bg-green-50 rounded-lg">
            <div className="text-lg font-semibold text-green-700">{formatDuration(billableMinutes)}</div>
            <div className="text-xs text-green-600">Facturable</div>
          </div>
          <div className="text-center p-2 bg-blue-50 rounded-lg">
            <div className="text-lg font-semibold text-blue-700">{formatCurrency(totalAmount)}</div>
            <div className="text-xs text-blue-600">Importe</div>
          </div>
          <div className="text-center p-2 bg-amber-50 rounded-lg">
            <div className="text-lg font-semibold text-amber-700">{formatCurrency(unbilledAmount)}</div>
            <div className="text-xs text-amber-600">Sin facturar</div>
          </div>
        </div>

        {/* Quick Invoice Button */}
        {unbilledAmount > 0 && (
          <Button variant="outline" className="w-full" asChild>
            <a href={`/app/finance/invoices/new?matter=${matterId}`}>
              <Receipt className="h-4 w-4 mr-2" />
              Facturar tiempo ({formatCurrency(unbilledAmount)})
            </a>
          </Button>
        )}

        {/* Entries List */}
        <div className="border rounded-lg divide-y max-h-80 overflow-auto">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">Cargando...</div>
          ) : entries.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No hay registros de tiempo
            </div>
          ) : (
            entries.slice(0, 10).map((entry) => (
              <TimeEntryRow
                key={entry.id}
                entry={entry}
                showMatter={false}
              />
            ))
          )}
        </div>

        {entries.length > 10 && (
          <div className="text-center">
            <Button variant="link" size="sm" asChild>
              <a href={`/app/timetracking?matter=${matterId}`}>
                Ver todos ({entries.length} registros)
              </a>
            </Button>
          </div>
        )}
      </CardContent>

      <AddTimeEntryDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        defaultMatter={{ id: matterId, reference: matterReference, title: matterTitle }}
      />
    </Card>
  );
}
