import { Link } from 'react-router-dom';
import { 
  DollarSign, 
  ArrowRight,
} from 'lucide-react';
import { useFinanceStats, useUpcomingRenewals } from '@/hooks/use-finance';
import { formatCurrency } from '@/lib/constants/finance';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function FinanceWidget() {
  const { data: stats } = useFinanceStats();
  const { data: renewals = [] } = useUpcomingRenewals(30);
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-500" />
            <CardTitle className="text-base">Finanzas</CardTitle>
          </div>
          <Link 
            to="/app/finance" 
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            Ver todo <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
            <p className="text-xs text-blue-600 dark:text-blue-400">Facturado este mes</p>
            <p className="text-lg font-bold text-blue-700 dark:text-blue-300">
              {formatCurrency(stats?.invoicedThisMonth || 0)}
            </p>
          </div>
          <div className="p-3 bg-orange-50 dark:bg-orange-950/30 rounded-lg">
            <p className="text-xs text-orange-600 dark:text-orange-400">Pendiente cobro</p>
            <p className="text-lg font-bold text-orange-700 dark:text-orange-300">
              {formatCurrency(stats?.pendingInvoicesTotal || 0)}
            </p>
          </div>
        </div>
        
        {/* Upcoming renewals */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-muted-foreground">Renovaciones próximas</p>
            <Badge variant="secondary" className="bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400">
              {renewals.length}
            </Badge>
          </div>
          
          {renewals.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay renovaciones próximas</p>
          ) : (
            <div className="space-y-2">
              {renewals.slice(0, 3).map(r => (
                <Link
                  key={r.id}
                  to={`/app/docket/${r.matter_id}`}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-muted"
                >
                  <div>
                    <p className="text-sm font-medium">{r.matter?.reference}</p>
                    <p className="text-xs text-muted-foreground">
                      Vence {new Date(r.due_date).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">
                    {formatCurrency(r.total_estimate || 0)}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
