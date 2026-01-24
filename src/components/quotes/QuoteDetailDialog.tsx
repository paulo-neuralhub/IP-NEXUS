import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  FileText,
  Send,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight,
  Loader2,
  Receipt,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useConvertQuoteToInvoice } from '@/hooks/use-finance';
import { toast } from 'sonner';
import type { Quote } from '@/types/finance';

interface QuoteItemBasic {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  subtotal?: number;
}

interface QuoteWithItems extends Omit<Quote, 'items'> {
  items?: QuoteItemBasic[];
}

interface QuoteDetailDialogProps {
  quote: QuoteWithItems | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConvertSuccess?: () => void;
}

type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'converted';

const statusConfig: Record<QuoteStatus, { label: string; color: string; icon: React.ReactNode }> = {
  draft: { label: 'Borrador', color: 'bg-muted text-muted-foreground', icon: <FileText className="w-3 h-3" /> },
  sent: { label: 'Enviado', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: <Send className="w-3 h-3" /> },
  accepted: { label: 'Aceptado', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: <CheckCircle className="w-3 h-3" /> },
  rejected: { label: 'Rechazado', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: <XCircle className="w-3 h-3" /> },
  expired: { label: 'Caducado', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: <Clock className="w-3 h-3" /> },
  converted: { label: 'Convertido', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', icon: <Receipt className="w-3 h-3" /> },
};

export function QuoteDetailDialog({ quote, open, onOpenChange, onConvertSuccess }: QuoteDetailDialogProps) {
  const navigate = useNavigate();
  const convertMutation = useConvertQuoteToInvoice();
  const [isConverting, setIsConverting] = useState(false);

  if (!quote) return null;

  const status = statusConfig[quote.status as QuoteStatus] || statusConfig.draft;
  const items = quote.items || [];
  
  // Calcular totales
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  const taxRate = quote.tax_rate || 21;
  const taxAmount = quote.tax_amount || (subtotal * taxRate / 100);
  const total = quote.total || (subtotal + taxAmount);

  const canConvert = quote.status === 'sent' || quote.status === 'accepted';

  const handleConvertToInvoice = async () => {
    if (!quote.id) return;
    
    setIsConverting(true);
    try {
      const result = await convertMutation.mutateAsync(quote.id);
      
      toast.success(`Factura ${result.invoiceNumber} creada correctamente`, {
        description: 'Redirigiendo a la factura...',
        action: {
          label: 'Ver factura',
          onClick: () => navigate(`/app/finance/invoices/${result.invoiceId}`),
        },
      });
      
      onOpenChange(false);
      onConvertSuccess?.();
      
      // Redirigir a la factura creada
      setTimeout(() => {
        navigate(`/app/finance/invoices/${result.invoiceId}`);
      }, 1500);
      
    } catch (error) {
      console.error('Error converting quote:', error);
      toast.error('Error al convertir el presupuesto', {
        description: error instanceof Error ? error.message : 'Inténtalo de nuevo',
      });
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">
              Presupuesto {quote.quote_number}
            </DialogTitle>
            <Badge className={`${status.color} gap-1`}>
              {status.icon}
              {status.label}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Info del cliente */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Cliente</p>
              <p className="font-medium">{quote.client_name || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Fecha</p>
              <p className="font-medium">
                {quote.quote_date 
                  ? format(new Date(quote.quote_date), 'dd MMM yyyy', { locale: es })
                  : format(new Date(quote.created_at), 'dd MMM yyyy', { locale: es })}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Válido hasta</p>
              <p className="font-medium">
                {quote.valid_until 
                  ? format(new Date(quote.valid_until), 'dd MMM yyyy', { locale: es })
                  : '-'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Moneda</p>
              <p className="font-medium">{quote.currency || 'EUR'}</p>
            </div>
          </div>

          {/* Notas */}
          {quote.notes && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Concepto</p>
              <p className="text-sm bg-muted p-3 rounded-md">{quote.notes}</p>
            </div>
          )}

          <Separator />

          {/* Líneas del presupuesto */}
          <div>
            <h4 className="font-medium mb-3">Líneas del presupuesto</h4>
            {items.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descripción</TableHead>
                    <TableHead className="text-right w-20">Cant.</TableHead>
                    <TableHead className="text-right w-28">Precio</TableHead>
                    <TableHead className="text-right w-28">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.description}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">{item.unit_price.toLocaleString()} €</TableCell>
                      <TableCell className="text-right font-medium">
                        {(item.quantity * item.unit_price).toLocaleString()} €
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No hay líneas de detalle
              </p>
            )}
          </div>

          {/* Totales */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{subtotal.toLocaleString()} €</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">IVA ({taxRate}%)</span>
              <span>{taxAmount.toLocaleString()} €</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>{total.toLocaleString()} €</span>
            </div>
          </div>

          {/* Botón de conversión */}
          {canConvert && (
            <div className="flex justify-end pt-2">
              <Button 
                onClick={handleConvertToInvoice}
                disabled={isConverting}
                className="gap-2"
              >
                {isConverting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creando factura...
                  </>
                ) : (
                  <>
                    <Receipt className="w-4 h-4" />
                    Convertir a Factura
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Mensaje si ya está convertido */}
          {quote.status === 'converted' && quote.converted_invoice_id && (
            <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg border border-primary/20">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-primary" />
                <span className="text-sm text-primary">
                  Este presupuesto ya ha sido convertido a factura
                </span>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate(`/app/finance/invoices/${quote.converted_invoice_id}`)}
              >
                Ver factura
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
