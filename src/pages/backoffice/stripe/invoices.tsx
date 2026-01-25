import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Search,
  Download,
  ExternalLink,
  FileText
} from 'lucide-react';
import { useStripeInvoices, useStripeInvoiceStats, type StripeInvoice } from '@/hooks/backoffice';
import { formatEur } from '@/components/voip/backoffice/format';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  paid: { label: '✅ Pagada', variant: 'default' },
  open: { label: '🟡 Pendiente', variant: 'outline' },
  draft: { label: '⚪ Borrador', variant: 'secondary' },
  void: { label: '❌ Anulada', variant: 'destructive' },
  uncollectible: { label: '❌ Incobrable', variant: 'destructive' },
};

export default function StripeInvoicesPage() {
  const [filters, setFilters] = useState({
    status: 'all',
    period: 'month' as const,
    search: '',
  });

  const { data: invoices, isLoading } = useStripeInvoices(filters);
  const { data: stats } = useStripeInvoiceStats(filters.period);

  const filteredInvoices = invoices?.filter((inv) => {
    if (filters.search) {
      const search = filters.search.toLowerCase();
      return (
        inv.organization?.name?.toLowerCase().includes(search) ||
        inv.invoice_number?.toLowerCase().includes(search) ||
        inv.stripe_invoice_id?.toLowerCase().includes(search)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Facturas Stripe</h1>
          <p className="text-muted-foreground">
            Historial de facturas generadas por Stripe
          </p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{formatEur(stats?.total || 0)}</div>
            <p className="text-sm text-muted-foreground">Total facturado</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{formatEur(stats?.paid || 0)}</div>
            <p className="text-sm text-muted-foreground">Cobrado ({stats?.paidCount || 0} facturas)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">{formatEur(stats?.pending || 0)}</div>
            <p className="text-sm text-muted-foreground">Pendiente ({stats?.pendingCount || 0} facturas)</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por tenant o nº factura..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-9"
              />
            </div>
            <Select
              value={filters.period}
              onValueChange={(v) => setFilters({ ...filters, period: v as typeof filters.period })}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Hoy</SelectItem>
                <SelectItem value="week">Esta semana</SelectItem>
                <SelectItem value="month">Este mes</SelectItem>
                <SelectItem value="year">Este año</SelectItem>
                <SelectItem value="all">Todo</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.status}
              onValueChange={(v) => setFilters({ ...filters, status: v })}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="paid">Pagadas</SelectItem>
                <SelectItem value="open">Pendientes</SelectItem>
                <SelectItem value="void">Anuladas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nº Factura</TableHead>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Importe</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices?.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-mono">
                      {invoice.invoice_number || invoice.stripe_invoice_id?.slice(0, 15) || '-'}
                    </TableCell>
                    <TableCell>
                      {invoice.organization?.name || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {formatEur(invoice.total_cents || 0)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusConfig[invoice.status || 'draft']?.variant || 'secondary'}>
                        {statusConfig[invoice.status || 'draft']?.label || invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {invoice.created_at 
                        ? format(new Date(invoice.created_at), 'dd/MM/yy', { locale: es })
                        : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {invoice.invoice_pdf_url && (
                          <Button size="sm" variant="ghost" asChild>
                            <a href={invoice.invoice_pdf_url} target="_blank" rel="noopener noreferrer">
                              <FileText className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                        {invoice.hosted_invoice_url && (
                          <Button size="sm" variant="ghost" asChild>
                            <a href={invoice.hosted_invoice_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredInvoices?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No se encontraron facturas
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
