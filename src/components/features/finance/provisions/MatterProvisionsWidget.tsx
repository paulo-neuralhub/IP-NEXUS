// ============================================
// src/components/features/finance/provisions/MatterProvisionsWidget.tsx
// Widget de provisiones para el detalle de expediente
// ============================================

import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Plus,
  Wallet,
  Clock,
  ArrowDownCircle,
  ArrowUpCircle,
  Coins,
  RotateCcw,
  ArrowRight,
} from 'lucide-react';
import { useProvisionsByMatter, type ProvisionStatus } from '@/hooks/finance/useProvisions';
import { formatCurrency } from '@/lib/utils';
import { useState } from 'react';
import { ProvisionDialog } from './ProvisionDialog';

interface MatterProvisionsWidgetProps {
  matterId: string;
  clientId?: string;
}

const statusConfig: Record<ProvisionStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: 'Pendiente', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: <Clock className="w-3 h-3" /> },
  requested: { label: 'Solicitada', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: <ArrowUpCircle className="w-3 h-3" /> },
  received: { label: 'Recibida', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: <ArrowDownCircle className="w-3 h-3" /> },
  used: { label: 'Utilizada', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', icon: <Coins className="w-3 h-3" /> },
  returned: { label: 'Devuelta', color: 'bg-muted text-muted-foreground', icon: <RotateCcw className="w-3 h-3" /> },
};

export function MatterProvisionsWidget({ matterId, clientId }: MatterProvisionsWidgetProps) {
  const { data: provisions, isLoading, refetch } = useProvisionsByMatter(matterId);
  const [showDialog, setShowDialog] = useState(false);

  // Calculate totals
  const totalAmount = provisions?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
  const receivedAmount = provisions
    ?.filter(p => ['received', 'used', 'returned'].includes(p.status))
    .reduce((sum, p) => sum + Number(p.amount), 0) || 0;
  const usedAmount = provisions?.reduce((sum, p) => sum + Number(p.used_amount), 0) || 0;
  const availableAmount = receivedAmount - usedAmount - 
    (provisions?.reduce((sum, p) => sum + Number(p.returned_amount), 0) || 0);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary" />
            <CardTitle className="text-base">Provisiones</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => setShowDialog(true)}>
              <Plus className="w-4 h-4 mr-1" />
              Nueva
            </Button>
            <Link to="/app/finance/provisions">
              <Button size="sm" variant="ghost">
                Ver todo <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-2 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground">Solicitado</p>
            <p className="font-semibold">{formatCurrency(totalAmount)}</p>
          </div>
          <div className="p-2 bg-green-50 dark:bg-green-950/30 rounded-lg">
            <p className="text-xs text-green-600 dark:text-green-400">Recibido</p>
            <p className="font-semibold text-green-700 dark:text-green-300">
              {formatCurrency(receivedAmount)}
            </p>
          </div>
          <div className="p-2 bg-primary/10 rounded-lg">
            <p className="text-xs text-primary">Disponible</p>
            <p className="font-semibold text-primary">
              {formatCurrency(Math.max(0, availableAmount))}
            </p>
          </div>
        </div>

        {/* List */}
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2].map(i => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : provisions && provisions.length > 0 ? (
          <div className="space-y-2">
            {provisions.slice(0, 5).map((provision) => {
              const status = statusConfig[provision.status];
              return (
                <Link
                  key={provision.id}
                  to={`/app/finance/provisions/${provision.id}`}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-muted"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{provision.concept}</p>
                    <Badge variant="secondary" className={`${status.color} text-xs mt-1`}>
                      {status.icon}
                      <span className="ml-1">{status.label}</span>
                    </Badge>
                  </div>
                  <div className="text-right ml-2">
                    <p className="font-medium">{formatCurrency(provision.amount)}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <Wallet className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No hay provisiones</p>
          </div>
        )}
      </CardContent>

      <ProvisionDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        defaultMatterId={matterId}
        defaultClientId={clientId}
        onSuccess={() => refetch()}
      />
    </Card>
  );
}
