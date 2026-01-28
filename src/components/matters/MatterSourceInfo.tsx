// =====================================================
// Matter Source Info - Show origin of matter
// =====================================================

import { FileText, Receipt, User, ExternalLink, ClipboardList } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMatterSource } from '@/hooks/useMatterSource';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils';

interface Props {
  matterId: string;
}

const SOURCE_TYPE_LABELS: Record<string, string> = {
  manual: 'Creación manual',
  quote: 'Desde presupuesto',
  import: 'Importación',
  api: 'Integración API',
};

export function MatterSourceInfo({ matterId }: Props) {
  const navigate = useNavigate();
  const { source, isLoading, hasSource } = useMatterSource(matterId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  // Don't show for manual creation
  if (!hasSource || !source) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <ClipboardList className="h-4 w-4" />
          Origen
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Quote info */}
        {source.quote && (
          <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium text-sm">Presupuesto {source.quote.quote_number}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{formatCurrency(source.quote.total)}</span>
                  <Badge variant="outline" className="text-xs capitalize">
                    {source.quote.status}
                  </Badge>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/app/finance/quotes/${source.quote!.id}`)}
            >
              Ver
              <ExternalLink className="h-3 w-3 ml-1" />
            </Button>
          </div>
        )}

        {/* Invoice info */}
        {source.invoice && (
          <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <Receipt className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium text-sm">Factura {source.invoice.invoice_number}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{formatCurrency(source.invoice.total)}</span>
                  <Badge variant="outline" className="text-xs capitalize">
                    {source.invoice.status}
                  </Badge>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/app/finance/invoices/${source.invoice!.id}`)}
            >
              Ver
              <ExternalLink className="h-3 w-3 ml-1" />
            </Button>
          </div>
        )}

        {/* Client info */}
        {source.client && (
          <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium text-sm">{source.client.company_name || source.client.name}</p>
                {source.client.email && (
                  <p className="text-xs text-muted-foreground">{source.client.email}</p>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/app/legal-ops/clients/${source.client!.id}`)}
            >
              Ver
              <ExternalLink className="h-3 w-3 ml-1" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
