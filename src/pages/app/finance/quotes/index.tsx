// ============================================
// src/pages/app/finance/quotes/index.tsx
// ============================================

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QuoteForm } from '@/components/quotes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Send,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { usePageTitle } from '@/hooks/use-page-title';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useQuotes } from '@/hooks/use-finance';
import { Alert, AlertDescription } from '@/components/ui/alert';

type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'converted';

const statusConfig: Record<QuoteStatus, { label: string; color: string; icon: React.ReactNode }> = {
  draft: { label: 'Borrador', color: 'bg-muted text-muted-foreground', icon: <FileText className="w-3 h-3" /> },
  sent: { label: 'Enviado', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: <Send className="w-3 h-3" /> },
  accepted: { label: 'Aceptado', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: <CheckCircle className="w-3 h-3" /> },
  rejected: { label: 'Rechazado', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: <XCircle className="w-3 h-3" /> },
  expired: { label: 'Caducado', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: <Clock className="w-3 h-3" /> },
  converted: { label: 'Convertido', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', icon: <FileText className="w-3 h-3" /> },
};

export default function QuotesPage() {
  usePageTitle('Presupuestos');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<QuoteStatus | 'all'>('all');
  const [showQuoteForm, setShowQuoteForm] = useState(false);

  // Fetch real data from Supabase
  const { data: quotes, isLoading, error, refetch } = useQuotes();

  // Filter quotes based on search and status
  const filteredQuotes = (quotes || []).filter(quote => {
    const matchesSearch = 
      (quote.quote_number || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (quote.client_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (quote.notes || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || quote.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate stats from real data
  const stats = {
    total: quotes?.length || 0,
    pending: quotes?.filter(q => q.status === 'sent').length || 0,
    accepted: quotes?.filter(q => q.status === 'accepted').length || 0,
    totalValue: quotes?.filter(q => q.status === 'accepted').reduce((sum, q) => sum + (q.total || 0), 0) || 0,
  };

  // Error state
  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Presupuestos</h1>
            <p className="text-muted-foreground">
              Gestiona presupuestos y propuestas para clientes
            </p>
          </div>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Error al cargar presupuestos: {error.message}</span>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Reintentar
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Presupuestos</h1>
          <p className="text-muted-foreground">
            Gestiona presupuestos y propuestas para clientes
          </p>
        </div>
        <Button onClick={() => setShowQuoteForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo presupuesto
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Total</div>
            {isLoading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <div className="text-2xl font-bold">{stats.total}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Pendientes</div>
            {isLoading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <div className="text-2xl font-bold text-primary">{stats.pending}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Aceptados</div>
            {isLoading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.accepted}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Valor aceptado</div>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{stats.totalValue.toLocaleString()}€</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Lista de presupuestos</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    {statusFilter === 'all' ? 'Todos' : statusConfig[statusFilter].label}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setStatusFilter('all')}>
                    Todos
                  </DropdownMenuItem>
                  {Object.entries(statusConfig).map(([key, config]) => (
                    <DropdownMenuItem key={key} onClick={() => setStatusFilter(key as QuoteStatus)}>
                      {config.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Referencia</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Concepto</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Válido hasta</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuotes.map((quote) => {
                const status = statusConfig[quote.status as QuoteStatus] || statusConfig.draft;
                return (
                  <TableRow key={quote.id}>
                    <TableCell className="font-medium">{quote.quote_number}</TableCell>
                    <TableCell>{quote.client_name || '-'}</TableCell>
                    <TableCell>{quote.notes || '-'}</TableCell>
                    <TableCell className="font-medium">
                      {(quote.total || 0).toLocaleString()} {quote.currency || 'EUR'}
                    </TableCell>
                    <TableCell>
                      <Badge className={`${status.color} gap-1`}>
                        {status.icon}
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {quote.valid_until 
                        ? format(new Date(quote.valid_until), 'dd MMM yyyy', { locale: es })
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="w-4 h-4 mr-2" />
                            Ver detalle
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          {quote.status === 'draft' && (
                            <DropdownMenuItem>
                              <Send className="w-4 h-4 mr-2" />
                              Enviar
                            </DropdownMenuItem>
                          )}
                          {quote.status === 'accepted' && (
                            <DropdownMenuItem>
                              <FileText className="w-4 h-4 mr-2" />
                              Crear factura
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
              {/* Loading state */}
              {isLoading && (
                <>
                  {[1, 2, 3].map((i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                    </TableRow>
                  ))}
                </>
              )}
              
              {/* Empty state */}
              {!isLoading && filteredQuotes.length === 0 && !searchQuery && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                        <FileText className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">No hay presupuestos</p>
                        <p className="text-sm text-muted-foreground">
                          Crea tu primer presupuesto para empezar
                        </p>
                      </div>
                      <Button size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Crear primer presupuesto
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
              
              {/* No results from search */}
              {!isLoading && filteredQuotes.length === 0 && searchQuery && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No se encontraron presupuestos para "{searchQuery}"
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Quote Form Modal */}
      <QuoteForm 
        open={showQuoteForm} 
        onOpenChange={setShowQuoteForm}
        onSuccess={() => refetch()}
      />
    </div>
  );
}
