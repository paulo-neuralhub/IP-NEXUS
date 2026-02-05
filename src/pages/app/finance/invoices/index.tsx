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
  AlertTriangle,
  FileWarning,
  Copy,
  FileCode,
  Check,
  X,
  AlertCircle,
  Minus,
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { useInvoices, useSendInvoice, useMarkInvoicePaid } from '@/hooks/use-finance';
import { usePaymentLinksForInvoices } from '@/hooks/use-invoice-payment-links';
import { useDownloadFacturae } from '@/hooks/finance/useRegulatorySubmissions';
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { SendInvoiceDialog, RectifyInvoiceDialog } from '@/components/features/finance/invoices';
import { toast } from 'sonner';

function StatCard({ label, value, icon: Icon, color }: { 
  label: string; 
  value: string; 
  icon: React.ElementType;
  color: string;
}) {
  const hasValue = value !== '0 €' && value !== '€0,00' && value !== '0';
  const isAlert = (label.toLowerCase().includes('pendiente') || label.toLowerCase().includes('vencid')) && hasValue;
  
  // Determine background gradient based on label
  const getBgGradient = () => {
    if (label.toLowerCase().includes('facturado')) return 'linear-gradient(135deg, #dbeafe 0%, #f1f4f9 100%)';
    if (label.toLowerCase().includes('pendiente')) return 'linear-gradient(135deg, #fef3c7 0%, #f1f4f9 100%)';
    if (label.toLowerCase().includes('cobrado')) return 'linear-gradient(135deg, #dcfce7 0%, #f1f4f9 100%)';
    if (label.toLowerCase().includes('vencid')) return 'linear-gradient(135deg, #fee2e2 0%, #f1f4f9 100%)';
    return '#f1f4f9';
  };
  
  return (
    <div 
      className="relative overflow-hidden transition-all duration-300 hover:shadow-md"
      style={{
        padding: '20px',
        borderRadius: '14px',
        border: isAlert ? `1px solid ${color}40` : '1px solid rgba(0, 0, 0, 0.06)',
        borderLeft: isAlert ? `4px solid ${color}` : undefined,
        background: getBgGradient(),
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p 
            className="text-[11px] font-semibold uppercase tracking-wider mb-2"
            style={{ color: '#64748b' }}
          >
            {label}
          </p>
          <p 
            style={{ 
              fontSize: '24px', 
              fontWeight: 800, 
              color: hasValue ? color : '#94a3b8',
              letterSpacing: '-0.02em',
              textShadow: '0 1px 2px rgba(0,0,0,0.05)',
            }}
          >
            {value}
          </p>
        </div>
        <div 
          style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: '#f1f4f9',
            boxShadow: '6px 6px 14px #b5b9c4, -6px -6px 14px #ffffff, inset 0 2px 3px rgba(255,255,255,0.9), inset 0 -2px 3px rgba(0,0,0,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon className="w-5 h-5" style={{ color: hasValue ? color : '#94a3b8' }} />
        </div>
      </div>
    </div>
  );
}

// SII/TicketBAI status indicator
function RegulatoryStatusCell({ invoice }: { invoice: Invoice }) {
  const siiStatus = invoice.sii_status;
  const tbaiStatus = invoice.tbai_status;
  const verifactuStatus = invoice.verifactu_status;

  // Determine overall status
  const hasAny = siiStatus || tbaiStatus || verifactuStatus;
  
  if (!hasAny) {
    return (
      <span className="text-muted-foreground">—</span>
    );
  }

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'accepted':
        return <Check className="h-3 w-3 text-green-500" />;
      case 'sent':
        return <Clock className="h-3 w-3 text-blue-500" />;
      case 'pending':
        return <AlertCircle className="h-3 w-3 text-yellow-500" />;
      case 'rejected':
      case 'error':
        return <X className="h-3 w-3 text-red-500" />;
      default:
        return <Minus className="h-3 w-3 text-muted-foreground" />;
    }
  };

  return (
    <div className="flex items-center justify-center gap-1">
      {siiStatus && (
        <Tooltip>
          <TooltipTrigger>
            <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-muted">
              {getStatusIcon(siiStatus)}
            </span>
          </TooltipTrigger>
          <TooltipContent>SII: {siiStatus}</TooltipContent>
        </Tooltip>
      )}
      {tbaiStatus && (
        <Tooltip>
          <TooltipTrigger>
            <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-muted">
              {getStatusIcon(tbaiStatus)}
            </span>
          </TooltipTrigger>
          <TooltipContent>TicketBAI: {tbaiStatus}</TooltipContent>
        </Tooltip>
      )}
      {verifactuStatus && (
        <Tooltip>
          <TooltipTrigger>
            <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-muted">
              {getStatusIcon(verifactuStatus)}
            </span>
          </TooltipTrigger>
          <TooltipContent>VERI*FACTU: {verifactuStatus}</TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}

function InvoiceRow({ invoice, paymentLabel, onSend, onMarkPaid, onRectify, onDownloadXml }: {
  invoice: Invoice;
  paymentLabel?: string;
  onSend: () => void;
  onMarkPaid: (payment: { amount: number; date: string }) => void;
  onRectify: () => void;
  onDownloadXml: () => void;
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
        {invoice.invoice_type === 'FR' && (
          <span className="ml-1 text-xs text-orange-500">(Rect.)</span>
        )}
      </TableCell>
      <TableCell>
        {invoice.billing_client_id ? (
          <Link 
            to={`/app/crm/accounts/${invoice.billing_client_id}`}
            className="group"
          >
            <p className="text-sm font-medium text-foreground group-hover:text-primary group-hover:underline">{invoice.client_name}</p>
            {invoice.client_tax_id && (
              <p className="text-xs text-muted-foreground">{invoice.client_tax_id}</p>
            )}
          </Link>
        ) : (
          <>
            <p className="text-sm font-medium text-foreground">{invoice.client_name}</p>
            {invoice.client_tax_id && (
              <p className="text-xs text-muted-foreground">{invoice.client_tax_id}</p>
            )}
          </>
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
      <TableCell className="text-center">
        <RegulatoryStatusCell invoice={invoice} />
      </TableCell>
      <TableCell className="text-center">
        <span className="text-xs text-muted-foreground">{paymentLabel || '—'}</span>
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
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex items-center gap-2">
              <Download className="w-4 h-4" /> Descargar PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDownloadXml} className="flex items-center gap-2">
              <FileCode className="w-4 h-4" /> Descargar XML
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to={`/app/finance/invoices/new?duplicate=${invoice.id}`} className="flex items-center gap-2">
                <Copy className="w-4 h-4" /> Duplicar
              </Link>
            </DropdownMenuItem>
            {invoice.status !== 'rectified' && invoice.invoice_type !== 'FR' && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onRectify} className="flex items-center gap-2 text-orange-600">
                  <FileWarning className="w-4 h-4" /> Rectificar
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

export default function InvoiceListPage() {
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [sendInvoice, setSendInvoice] = useState<Invoice | null>(null);
  const [rectifyInvoice, setRectifyInvoice] = useState<Invoice | null>(null);
  
  const { data: invoices = [], isLoading } = useInvoices(
    statusFilter !== 'all' ? { status: statusFilter } : undefined
  );
  
  const sendMutation = useSendInvoice();
  const markPaidMutation = useMarkInvoicePaid();
  const { downloadXml } = useDownloadFacturae();
  
  const filteredInvoices = invoices.filter(inv =>
    !search || 
    inv.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
    inv.client_name.toLowerCase().includes(search.toLowerCase())
  );

  const invoiceIds = filteredInvoices.map((i) => i.id);
  const paymentLinksQuery = usePaymentLinksForInvoices(invoiceIds);
  const paymentLinksByInvoice = new Map(paymentLinksQuery.data?.map((pl) => [pl.invoice_id, pl]) ?? []);
  
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
      
      {/* Filtros - SILK Tabs Style */}
      <div className="flex items-center gap-4">
        <div 
          className="flex gap-1 p-1"
          style={{
            background: '#f1f4f9',
            borderRadius: '12px',
            boxShadow: 'inset 2px 2px 5px #cdd1dc, inset -2px -2px 5px #ffffff',
          }}
        >
          <button
            onClick={() => setStatusFilter('all')}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 relative",
              statusFilter === 'all' 
                ? "bg-white shadow-sm text-slate-800" 
                : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
            )}
          >
            Todas
            {statusFilter === 'all' && (
              <span 
                className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full"
                style={{ background: 'linear-gradient(90deg, #00b4d8, #00d4aa)' }}
              />
            )}
          </button>
          {(['draft', 'sent', 'paid', 'overdue'] as InvoiceStatus[]).map(status => {
            const isActive = statusFilter === status;
            const count = invoices.filter(i => i.status === status).length;
            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 relative flex items-center gap-2",
                  isActive 
                    ? "bg-white shadow-sm" 
                    : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
                )}
                style={isActive ? { color: INVOICE_STATUSES[status].color } : undefined}
              >
                {INVOICE_STATUSES[status].label}
                {count > 0 && (
                  <span 
                    className="px-1.5 py-0.5 text-[10px] font-bold rounded-full"
                    style={{
                      background: isActive ? `${INVOICE_STATUSES[status].color}15` : '#e2e8f0',
                      color: isActive ? INVOICE_STATUSES[status].color : '#64748b',
                    }}
                  >
                    {count}
                  </span>
                )}
                {isActive && (
                  <span 
                    className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full"
                    style={{ background: INVOICE_STATUSES[status].color }}
                  />
                )}
              </button>
            );
          })}
        </div>
        
        <div className="flex-1 max-w-sm relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por número o cliente..."
            className="pl-10 rounded-lg"
          />
        </div>
      </div>
      
      {/* Lista - SILK Table Style */}
      <div 
        className="overflow-hidden"
        style={{
          borderRadius: '14px',
          border: '1px solid rgba(0, 0, 0, 0.06)',
          background: '#f1f4f9',
        }}
      >
        <Table>
          <TableHeader>
            <TableRow className="border-b border-slate-200/60">
              <TableHead className="bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Nº Factura</TableHead>
              <TableHead className="bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Cliente</TableHead>
              <TableHead className="bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Fecha</TableHead>
              <TableHead className="bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Vencimiento</TableHead>
              <TableHead className="bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500 text-right">Total</TableHead>
              <TableHead className="bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500 text-center">Estado</TableHead>
              <TableHead className="bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500 text-center">Pago</TableHead>
              <TableHead className="bg-slate-50/80 w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInvoices.map(invoice => {
              const pl = paymentLinksByInvoice.get(invoice.id);
              const paymentLabel =
                pl?.status === 'completed'
                  ? 'Pagado'
                  : pl?.status === 'active'
                    ? 'Link activo'
                    : pl?.status === 'expired'
                      ? 'Expirado'
                      : pl?.status === 'cancelled'
                        ? 'Cancelado'
                        : '—';

              return (
                <InvoiceRow
                  key={invoice.id}
                  invoice={invoice}
                  paymentLabel={paymentLabel}
                  onSend={() => handleSend(invoice.id)}
                  onMarkPaid={(payment) => handleMarkPaid(invoice.id, payment)}
                  onRectify={() => setRectifyInvoice(invoice)}
                  onDownloadXml={() => downloadXml(invoice.id, invoice.invoice_number)}
                />
              );
            })}
          </TableBody>
        </Table>
        
        {filteredInvoices.length === 0 && !isLoading && (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No hay facturas</p>
          </div>
        )}
      </div>

      {/* Dialogs */}
      {sendInvoice && (
        <SendInvoiceDialog
          open={!!sendInvoice}
          onOpenChange={(open) => !open && setSendInvoice(null)}
          invoice={sendInvoice}
          onSuccess={() => setSendInvoice(null)}
        />
      )}

      {rectifyInvoice && (
        <RectifyInvoiceDialog
          open={!!rectifyInvoice}
          onOpenChange={(open) => !open && setRectifyInvoice(null)}
          invoice={rectifyInvoice}
        />
      )}
    </div>
  );
}
