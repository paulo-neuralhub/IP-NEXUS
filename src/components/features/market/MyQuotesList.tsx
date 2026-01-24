import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Eye, MoreHorizontal, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { cn } from '@/lib/utils';

export interface RfqQuote {
  id: string;
  rfq_request_id: string;
  request_reference: string;
  request_title: string;
  client_name: string;
  amount: number;
  currency: string;
  status: 'draft' | 'submitted' | 'accepted' | 'rejected' | 'expired';
  submitted_at?: string;
  created_at: string;
}

interface MyQuotesListProps {
  quotes: RfqQuote[];
  isLoading?: boolean;
}

const STATUS_CONFIG = {
  draft: { label: 'Borrador', icon: '📝', color: 'bg-muted text-muted-foreground' },
  submitted: { label: 'Pendiente', icon: '🟡', color: 'bg-warning/10 text-warning' },
  accepted: { label: 'Aceptado', icon: '🟢', color: 'bg-green-500/10 text-green-600' },
  rejected: { label: 'Rechazado', icon: '🔴', color: 'bg-destructive/10 text-destructive' },
  expired: { label: 'Expirado', icon: '⚫', color: 'bg-muted text-muted-foreground' },
};

export function MyQuotesList({ quotes, isLoading }: MyQuotesListProps) {
  const formatCurrency = (amount: number, currency = 'EUR') => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mis Presupuestos Enviados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          Mis Presupuestos Enviados
        </CardTitle>
        <Button asChild variant="outline" size="sm">
          <Link to="/app/market/rfq?tab=quotes">Ver todos</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {quotes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Send className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No has enviado presupuestos aún</p>
            <Button asChild variant="outline" className="mt-4">
              <Link to="/app/market/rfq">Explorar solicitudes</Link>
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Estado</TableHead>
                <TableHead>Solicitud</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead className="text-right">Monto</TableHead>
                <TableHead className="w-[80px]">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotes.map((quote) => {
                const status = STATUS_CONFIG[quote.status];
                return (
                  <TableRow key={quote.id}>
                    <TableCell>
                      <Badge variant="outline" className={cn('gap-1', status.color)}>
                        <span>{status.icon}</span>
                        <span className="hidden sm:inline">{status.label}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <span className="text-xs font-mono text-muted-foreground">
                          {quote.request_reference}
                        </span>
                        <p className="font-medium truncate max-w-[200px]">
                          {quote.request_title}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {quote.client_name}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(quote.amount, quote.currency)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to={`/app/market/rfq/${quote.rfq_request_id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              Ver solicitud
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to={`/app/market/rfq/quotes/${quote.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              Ver presupuesto
                            </Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
