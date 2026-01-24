import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Copy, ExternalLink, QrCode } from 'lucide-react';
import { useInvoice } from '@/hooks/use-finance';
import { formatCurrency, INVOICE_STATUSES } from '@/lib/constants/finance';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useCreatePaymentLink, usePaymentLinkByInvoice } from '@/hooks/use-invoice-payment-links';
import { toast } from 'sonner';

function StatusBadge({ status }: { status: keyof typeof INVOICE_STATUSES }) {
  const cfg = INVOICE_STATUSES[status];
  // Nota: el proyecto ya usa `cfg.color` en varias pantallas; aquí mantenemos consistencia.
  return (
    <span
      className="px-2 py-1 text-xs font-medium rounded-full inline-flex items-center gap-1"
      style={{ backgroundColor: `${cfg.color}20`, color: cfg.color }}
    >
      {cfg.label}
    </span>
  );
}

function PaymentLinkBadge({ status }: { status: 'active' | 'completed' | 'expired' | 'cancelled' }) {
  const label =
    status === 'active'
      ? 'Link activo'
      : status === 'completed'
        ? 'Pagado'
        : status === 'expired'
          ? 'Expirado'
          : 'Cancelado';
  return <span className="text-xs text-muted-foreground">{label}</span>;
}

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const invoiceId = id || '';

  const invoice = useInvoice(invoiceId);
  const paymentLink = usePaymentLinkByInvoice(invoiceId);
  const createPaymentLink = useCreatePaymentLink();

  const totals = useMemo(() => {
    const items = invoice.data?.items ?? [];
    const lines = items.map((it) => ({
      description: it.description,
      qty: it.quantity ?? 1,
      unit: it.unit_price ?? 0,
      subtotal: it.subtotal ?? 0,
    }));
    const sum = lines.reduce((acc, l) => acc + (l.subtotal || 0), 0);
    return { lines, sum };
  }, [invoice.data]);

  const handleCopy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success('Copiado al portapapeles');
    } catch {
      toast.error('No se pudo copiar');
    }
  };

  if (invoice.isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (invoice.isError || !invoice.data) {
    return (
      <div className="p-6 space-y-4">
        <Button variant="ghost" asChild>
          <Link to="/app/finance/invoices" className="inline-flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Volver
          </Link>
        </Button>
        <p className="text-sm text-muted-foreground">No se pudo cargar la factura.</p>
      </div>
    );
  }

  const inv = invoice.data;
  const pl = paymentLink.data;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <Button variant="ghost" asChild className="-ml-2">
            <Link to="/app/finance/invoices" className="inline-flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" /> Volver
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Factura {inv.invoice_number}</h1>
          <div className="flex items-center gap-3">
            <StatusBadge status={inv.status} />
            <span className="text-sm text-muted-foreground">{inv.client_name}</span>
          </div>
        </div>

        <div className="text-right">
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="text-2xl font-bold text-foreground">{formatCurrency(inv.total, inv.currency)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Conceptos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {(totals.lines.length ? totals.lines : [{ description: '—', qty: 0, unit: 0, subtotal: 0 }]).map(
                (line, idx) => (
                  <div key={idx} className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">{line.description}</p>
                      {line.qty ? (
                        <p className="text-xs text-muted-foreground">
                          {line.qty} × {formatCurrency(line.unit, inv.currency)}
                        </p>
                      ) : null}
                    </div>
                    <p className="text-sm font-medium text-foreground">{formatCurrency(line.subtotal, inv.currency)}</p>
                  </div>
                )
              )}
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Subtotal líneas</p>
              <p className="text-sm font-medium text-foreground">{formatCurrency(totals.sum, inv.currency)}</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Impuestos</p>
              <p className="text-sm font-medium text-foreground">{formatCurrency(inv.tax_amount ?? 0, inv.currency)}</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-sm font-semibold text-foreground">{formatCurrency(inv.total, inv.currency)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-4 w-4" /> Cobro
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {pl ? (
              <>
                <div className="flex items-center justify-between">
                  <PaymentLinkBadge status={pl.status} />
                  <span className="text-sm font-medium text-foreground">{formatCurrency(pl.amount, pl.currency)}</span>
                </div>

                {pl.qr_code_url ? (
                  <div className="rounded-lg border bg-card p-3 flex items-center justify-center">
                    {/* eslint-disable-next-line jsx-a11y/alt-text */}
                    <img src={pl.qr_code_url} alt="QR link de pago" className="h-48 w-48" loading="lazy" />
                  </div>
                ) : null}

                {pl.stripe_url ? (
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleCopy(pl.stripe_url!)}
                      className="w-full justify-start gap-2"
                    >
                      <Copy className="h-4 w-4" /> Copiar link
                    </Button>
                    <Button variant="outline" asChild className="w-full justify-start gap-2">
                      <a href={pl.stripe_url} target="_blank" rel="noreferrer">
                        <ExternalLink className="h-4 w-4" /> Abrir en Stripe
                      </a>
                    </Button>
                  </div>
                ) : null}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No hay link de pago para esta factura.</p>
            )}

            <Button
              onClick={() => createPaymentLink.mutate({ invoiceId })}
              disabled={createPaymentLink.isPending || inv.status === 'paid'}
              className="w-full"
            >
              {createPaymentLink.isPending ? 'Generando…' : 'Generar Link de Pago'}
            </Button>
            {inv.status === 'paid' ? (
              <p className="text-xs text-muted-foreground">La factura ya está marcada como pagada.</p>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
