/**
 * Widget para mostrar firmas pendientes en el dashboard
 */

import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileSignature, ArrowRight, Clock, AlertCircle } from 'lucide-react';
import { formatDistanceToNow, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { useSignatureRequests, useSignatureStats } from '@/hooks/signatures/useSignatureRequests';
import { SignerProgress } from './SignerProgress';

export function PendingSignaturesWidget() {
  const { data: stats } = useSignatureStats();
  const { data: requests, isLoading } = useSignatureRequests({
    status: 'pending',
    limit: 5,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <FileSignature className="w-4 h-4" />
              Firmas pendientes
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-6">
            <div className="animate-pulse text-muted-foreground">Cargando...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const pendingCount = stats?.pending || 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <FileSignature className="w-4 h-4" />
            Firmas pendientes
            {pendingCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {pendingCount}
              </Badge>
            )}
          </CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/app/legal-ops/signatures">
              Ver todas
              <ArrowRight className="w-3 h-3 ml-1" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {!requests || requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <FileSignature className="w-8 h-8 text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">
              No hay firmas pendientes
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((request) => {
              const daysUntilExpiry = request.expires_at
                ? differenceInDays(new Date(request.expires_at), new Date())
                : null;
              const isUrgent = daysUntilExpiry !== null && daysUntilExpiry <= 3;

              return (
                <Link
                  key={request.id}
                  to={`/app/legal-ops/signatures/${request.id}`}
                  className="block p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">
                        {request.document_name}
                      </p>
                      {request.matter && (
                        <p className="text-xs text-muted-foreground truncate">
                          {request.matter.reference}
                        </p>
                      )}
                    </div>
                    {isUrgent && (
                      <Badge variant="destructive" className="shrink-0">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Urgente
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <SignerProgress signers={request.signers} size="sm" />
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {request.expires_at
                        ? formatDistanceToNow(new Date(request.expires_at), {
                            locale: es,
                            addSuffix: true,
                          }).replace('en ', '')
                        : 'Sin fecha'}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
