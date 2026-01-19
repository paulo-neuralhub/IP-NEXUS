import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye
} from 'lucide-react';
import { useMarketTransactions } from '@/hooks/use-market';
import { 
  TRANSACTION_TYPE_CONFIG, 
  TRANSACTION_STATUS_CONFIG,
  type TransactionType,
  type TransactionStatus 
} from '@/types/market.types';

type RoleFilter = 'all' | 'buyer' | 'seller';

export default function TransactionsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const { data: transactions, isLoading } = useMarketTransactions();

  // TODO: Filter by role when we have user context
  const filteredTransactions = transactions?.filter(tx => {
    if (statusFilter !== 'all' && tx.status !== statusFilter) return false;
    if (searchQuery && !(tx as any).listing?.title?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const stats = {
    total: transactions?.length || 0,
    completed: transactions?.filter(t => t.status === 'completed').length || 0,
    pending: transactions?.filter(t => ['negotiation', 'due_diligence', 'payment_pending'].includes(t.status)).length || 0,
    cancelled: transactions?.filter(t => t.status === 'cancelled').length || 0,
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Transacciones</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{stats.completed}</p>
                <p className="text-xs text-muted-foreground">Completadas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-xs text-muted-foreground">En Proceso</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{stats.cancelled}</p>
                <p className="text-xs text-muted-foreground">Canceladas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar transacciones..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Tabs value={roleFilter} onValueChange={(v) => setRoleFilter(v as RoleFilter)}>
          <TabsList>
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="buyer">
              <ArrowDownLeft className="h-4 w-4 mr-1" />
              Compras
            </TabsTrigger>
            <TabsTrigger value="seller">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              Ventas
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Transactions List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-20 bg-muted animate-pulse rounded-lg" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredTransactions && filteredTransactions.length > 0 ? (
        <div className="space-y-4">
          {filteredTransactions.map((transaction) => (
            <TransactionCard key={transaction.id} transaction={transaction} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No hay transacciones</h3>
            <p className="text-muted-foreground mb-4">
              Tus transacciones de compra y venta aparecerán aquí
            </p>
            <Button asChild>
              <Link to="/app/market">Explorar Marketplace</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function TransactionCard({ transaction }: { transaction: any }) {
  const txTypeConfig = TRANSACTION_TYPE_CONFIG[transaction.transaction_type as TransactionType];
  const statusConfig = TRANSACTION_STATUS_CONFIG[transaction.status as TransactionStatus];

  const statusIcons = {
    initiated: Clock,
    negotiation: AlertCircle,
    due_diligence: Eye,
    contract_pending: Clock,
    payment_pending: Clock,
    payment_received: CheckCircle,
    transfer_pending: Clock,
    completed: CheckCircle,
    cancelled: XCircle,
    disputed: AlertCircle,
  };

  const StatusIcon = statusIcons[transaction.status as keyof typeof statusIcons] || Clock;

  return (
    <Link to={`/app/market/transactions/${transaction.id}`}>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
              <StatusIcon className="h-6 w-6" style={{ color: statusConfig?.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-medium truncate">
                  {transaction.listing?.title || `Transacción #${transaction.id.slice(0, 8)}`}
                </h4>
                <Badge variant="outline">
                  {txTypeConfig?.label || transaction.transaction_type}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {transaction.buyer_id === 'current_user' ? (
                  <span className="flex items-center gap-1">
                    <ArrowDownLeft className="h-3 w-3" /> Compra
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <ArrowUpRight className="h-3 w-3" /> Venta
                  </span>
                )}
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold">
                €{(transaction.final_price || transaction.listing?.asking_price || 0).toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(transaction.created_at).toLocaleDateString()}
              </p>
            </div>
            <Badge 
              variant="outline"
              style={{ 
                backgroundColor: statusConfig?.color + '20',
                borderColor: statusConfig?.color,
                color: statusConfig?.color 
              }}
            >
              {statusConfig?.label || transaction.status}
            </Badge>
          </div>
          
          {/* Progress indicator */}
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              {['initiated', 'negotiation', 'due_diligence', 'payment_pending', 'completed'].map((step, idx) => {
                const steps = ['initiated', 'negotiation', 'due_diligence', 'payment_pending', 'completed'];
                const currentIdx = steps.indexOf(transaction.status);
                const isCompleted = idx <= currentIdx;
                const isCurrent = step === transaction.status;
                
                return (
                  <div key={step} className="flex items-center flex-1">
                    <div 
                      className={`h-2 w-2 rounded-full ${
                        isCompleted ? 'bg-market' : 'bg-muted'
                      } ${isCurrent ? 'ring-2 ring-market ring-offset-2' : ''}`}
                    />
                    {idx < 4 && (
                      <div className={`h-0.5 flex-1 ${isCompleted ? 'bg-market' : 'bg-muted'}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
