/**
 * MatterInvoicesTab - Pestaña de facturas del expediente
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Receipt, Plus, Eye, ArrowUpRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMatterInvoices } from '@/hooks/use-matter-invoices';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface MatterInvoicesTabProps {
  matterId: string;
  clientId?: string | null;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  draft: { label: 'Borrador', color: 'bg-gray-100 text-gray-700' },
  pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-700' },
  sent: { label: 'Enviada', color: 'bg-blue-100 text-blue-700' },
  paid: { label: 'Pagada', color: 'bg-green-100 text-green-700' },
  overdue: { label: 'Vencida', color: 'bg-red-100 text-red-700' },
  cancelled: { label: 'Cancelada', color: 'bg-gray-100 text-gray-500' },
};

export function MatterInvoicesTab({ matterId, clientId }: MatterInvoicesTabProps) {
  const navigate = useNavigate();
  const { data: invoices, isLoading } = useMatterInvoices(matterId);

  const handleNewInvoice = () => {
    // Navigate to new invoice with pre-filled matter
    const params = new URLSearchParams();
    params.set('matter_id', matterId);
    if (clientId) params.set('client_id', clientId);
    navigate(`/app/finance/invoices/new?${params.toString()}`);
  };

  const handleViewInvoice = (invoiceId: string) => {
    navigate(`/app/finance/invoices/${invoiceId}`);
  };

  // Calculate totals
  const totals = invoices?.reduce((acc, inv) => ({
    total: acc.total + (inv.total_amount || 0),
    paid: acc.paid + (inv.status === 'paid' ? (inv.total_amount || 0) : 0),
    pending: acc.pending + (inv.status === 'pending' || inv.status === 'sent' || inv.status === 'overdue' 
      ? (inv.total_amount || 0) : 0),
  }), { total: 0, paid: 0, pending: 0 });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5" />
          Facturas
          {invoices && invoices.length > 0 && (
            <Badge variant="secondary">{invoices.length}</Badge>
          )}
        </CardTitle>
        <Button size="sm" onClick={handleNewInvoice}>
          <Plus className="h-4 w-4 mr-1" />
          Nueva factura
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Cargando...</div>
        ) : !invoices?.length ? (
          <div className="text-center py-8">
            <Receipt className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">No hay facturas</p>
            <p className="text-sm text-muted-foreground mt-1">
              Crea la primera factura del expediente
            </p>
          </div>
        ) : (
          <>
            {/* Summary */}
            <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Total facturado</p>
                <p className="text-lg font-semibold">
                  {totals?.total.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cobrado</p>
                <p className="text-lg font-semibold text-primary">
                  {totals?.paid.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pendiente</p>
                <p className="text-lg font-semibold text-destructive">
                  {totals?.pending.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                </p>
              </div>
            </div>

            {/* Invoice list */}
            <div className="divide-y">
              {invoices.map((invoice) => {
                const statusConfig = STATUS_CONFIG[invoice.status] || STATUS_CONFIG.draft;
                
                return (
                  <div 
                    key={invoice.id} 
                    className="flex items-center justify-between py-3 cursor-pointer hover:bg-muted/30 px-2 -mx-2 rounded"
                    onClick={() => handleViewInvoice(invoice.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                        <Receipt className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{invoice.invoice_number}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Badge className={statusConfig.color} variant="secondary">
                            {statusConfig.label}
                          </Badge>
                          <span>
                            {format(new Date(invoice.issue_date || invoice.created_at), 'dd MMM yyyy', { locale: es })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="font-semibold">
                        {(invoice.total_amount || 0).toLocaleString('es-ES', { 
                          style: 'currency', 
                          currency: invoice.currency || 'EUR' 
                        })}
                      </p>
                      <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
