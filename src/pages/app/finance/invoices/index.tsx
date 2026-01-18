import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  FileText, 
  Send, 
  Eye,
  Download,
  MoreVertical,
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { useInvoices, useSendInvoice, useMarkInvoicePaid } from '@/hooks/use-finance';
import { INVOICE_STATUSES, formatCurrency } from '@/lib/constants/finance';
import type { Invoice, InvoiceStatus } from '@/types/finance';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { toast } from 'sonner';

function StatCard({ label, value, icon: Icon, color }: { 
  label: string; 
  value: string; 
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="bg-card rounded-xl border p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
        </div>
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
      </div>
    </div>
  );
}

function InvoiceRow({ invoice, onSend, onMarkPaid }: {
  invoice: Invoice;
  onSend: () => void;
  onMarkPaid: (payment: { amount: number; date: string }) => void;
}) {
  const statusConfig = INVOICE_STATUSES[invoice.status];
  
  const daysOverdue = invoice.due_date && invoice.status !== 'paid'
    ? differenceInDays(new Date(), new Date(invoice.due_date))
    : 0;
  
  return (
    <TableRow>
      <TableCell>
        <Link 
          to={`/app/finance/invoices/${invoice.id}`}
          className="font-medium text-primary hover:underline"
        >
          {invoice.invoice_number}
        </Link>
      </TableCell>
      <TableCell>
        <p className="text-sm font-medium text-foreground">{invoice.client_name}</p>
        {invoice.client_tax_id && (
          <p className="text-xs text-muted-foreground">{invoice.client_tax_id}</p>
        )}
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {format(new Date(invoice.invoice_date), 'dd/MM/yyyy', { locale: es })}
      </TableCell>
      <TableCell className="text-sm">
        {invoice.due_date ? (
          <span className={cn(
            daysOverdue > 0 && invoice.status !== 'paid' && "text-destructive font-medium"
          )}>
            {format(new Date(invoice.due_date), 'dd/MM/yyyy', { locale: es })}
            {daysOverdue > 0 && invoice.status !== 'paid' && (
              <span className="text-xs ml-1">({daysOverdue}d vencida)</span>
            )}
          </span>
        ) : '—'}
      </TableCell>
      <TableCell className="text-right font-medium">
        {formatCurrency(invoice.total, invoice.currency)}
      </TableCell>
      <TableCell className="text-center">
        <span 
          className="px-2 py-1 text-xs font-medium rounded-full inline-flex items-center gap-1"
          style={{ 
            backgroundColor: `${statusConfig.color}20`,
            color: statusConfig.color,
          }}
        >
          {statusConfig.label}
        </span>
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="w-4 h-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link to={`/app/finance/invoices/${invoice.id}`} className="flex items-center gap-2">
                <Eye className="w-4 h-4" /> Ver
              </Link>
            </DropdownMenuItem>
            {invoice.status === 'draft' && (
              <DropdownMenuItem onClick={onSend} className="flex items-center gap-2">
                <Send className="w-4 h-4" /> Enviar
              </DropdownMenuItem>
            )}
            {['sent', 'viewed', 'overdue'].includes(invoice.status) && (
              <DropdownMenuItem 
                onClick={() => onMarkPaid({ 
                  amount: invoice.total, 
                  date: new Date().toISOString().split('T')[0] 
                })}
                className="flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" /> Marcar pagada
              </DropdownMenuItem>
            )}
            <DropdownMenuItem className="flex items-center gap-2">
              <Download className="w-4 h-4" /> Descargar PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

export default function InvoiceListPage() {
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  
  const { data: invoices = [], isLoading } = useInvoices(
    statusFilter !== 'all' ? { status: statusFilter } : undefined
  );
  
  const sendMutation = useSendInvoice();
  const markPaidMutation = useMarkInvoicePaid();
  
  const filteredInvoices = invoices.filter(inv =>
    !search || 
    inv.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
    inv.client_name.toLowerCase().includes(search.toLowerCase())
  );
  
  // Stats
  const thisMonth = new Date().toISOString().slice(0, 7) + '-01';
  const stats = {
    totalMonth: invoices
      .filter(i => i.invoice_date >= thisMonth)
      .reduce((sum, i) => sum + i.total, 0),
    pending: invoices
      .filter(i => ['sent', 'viewed', 'partial'].includes(i.status))
      .reduce((sum, i) => sum + (i.total - (i.paid_amount || 0)), 0),
    paidMonth: invoices
      .filter(i => i.status === 'paid' && i.paid_date && i.paid_date >= thisMonth)
      .reduce((sum, i) => sum + i.total, 0),
    overdue: invoices.filter(i => i.status === 'overdue').length,
  };

  const handleSend = async (id: string) => {
    try {
      await sendMutation.mutateAsync(id);
      toast.success('Factura enviada');
    } catch {
      toast.error('Error al enviar la factura');
    }
  };

  const handleMarkPaid = async (id: string, payment: { amount: number; date: string }) => {
    try {
      await markPaidMutation.mutateAsync({ id, payment });
      toast.success('Factura marcada como pagada');
    } catch {
      toast.error('Error al actualizar la factura');
    }
  };
  
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Facturas</h1>
        <Button asChild>
          <Link to="/app/finance/invoices/new">
            <Plus className="w-4 h-4 mr-2" /> Nueva factura
          </Link>
        </Button>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard 
          label="Facturado este mes" 
          value={formatCurrency(stats.totalMonth)} 
          icon={FileText}
          color="#3B82F6"
        />
        <StatCard 
          label="Pendiente de cobro" 
          value={formatCurrency(stats.pending)} 
          icon={Clock}
          color="#F59E0B"
        />
        <StatCard 
          label="Cobrado este mes" 
          value={formatCurrency(stats.paidMonth)} 
          icon={CheckCircle}
          color="#22C55E"
        />
        <StatCard 
          label="Facturas vencidas" 
          value={String(stats.overdue)} 
          icon={AlertTriangle}
          color="#EF4444"
        />
      </div>
      
      {/* Filtros */}
      <div className="flex items-center gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => setStatusFilter('all')}
            className={cn(
              "px-3 py-1.5 text-sm rounded-lg transition-colors",
              statusFilter === 'all' ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
            )}
          >
            Todas
          </button>
          {(['draft', 'sent', 'paid', 'overdue'] as InvoiceStatus[]).map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                "px-3 py-1.5 text-sm rounded-lg transition-colors",
                statusFilter === status 
                  ? "text-white" 
                  : "bg-muted hover:bg-muted/80"
              )}
              style={statusFilter === status ? { backgroundColor: INVOICE_STATUSES[status].color } : undefined}
            >
              {INVOICE_STATUSES[status].label}
            </button>
          ))}
        </div>
        
        <div className="flex-1 max-w-sm relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por número o cliente..."
            className="pl-10"
          />
        </div>
      </div>
      
      {/* Lista */}
      <div className="border rounded-xl overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nº Factura</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Vencimiento</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-center">Estado</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInvoices.map(invoice => (
              <InvoiceRow 
                key={invoice.id} 
                invoice={invoice}
                onSend={() => handleSend(invoice.id)}
                onMarkPaid={(payment) => handleMarkPaid(invoice.id, payment)}
              />
            ))}
          </TableBody>
        </Table>
        
        {filteredInvoices.length === 0 && !isLoading && (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No hay facturas</p>
          </div>
        )}
      </div>
    </div>
  );
}
