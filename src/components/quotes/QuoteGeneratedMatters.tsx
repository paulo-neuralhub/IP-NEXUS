// =====================================================
// Quote Generated Matters - List of matters from quote
// =====================================================

import { FolderOpen, ExternalLink, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuoteToMatter } from '@/hooks/useQuoteToMatter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface Props {
  quoteId: string;
  quoteStatus: string;
  onCreateMatter?: () => void;
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500',
  filed: 'bg-blue-500',
  granted: 'bg-green-500',
  active: 'bg-green-500',
  expired: 'bg-gray-500',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  filed: 'Presentado',
  granted: 'Concedido',
  active: 'Activo',
  expired: 'Caducado',
};

const TYPE_LABELS: Record<string, string> = {
  trademark: 'Marca',
  patent: 'Patente',
  design: 'Diseño',
  copyright: 'Derechos de autor',
  domain: 'Dominio',
  other: 'Otro',
};

export function QuoteGeneratedMatters({ quoteId, quoteStatus, onCreateMatter }: Props) {
  const navigate = useNavigate();
  const { generatedMatters, pendingMatterItems, isLoading, canCreateMatter } = useQuoteToMatter(quoteId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  const showCreateButton = quoteStatus === 'accepted' && canCreateMatter;

  if (generatedMatters.length === 0 && !showCreateButton) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <FolderOpen className="h-4 w-4" />
          Expedientes Generados
        </CardTitle>
        {showCreateButton && (
          <Button size="sm" variant="outline" onClick={onCreateMatter}>
            <Plus className="h-3 w-3 mr-1" />
            Crear expediente
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {generatedMatters.length > 0 ? (
          <div className="space-y-2">
            {generatedMatters.map(matter => (
              <div
                key={matter.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <FolderOpen className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium truncate">{matter.reference}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="text-xs">
                        {TYPE_LABELS[matter.type] || matter.type}
                      </Badge>
                      {matter.jurisdiction_code && (
                        <span>{matter.jurisdiction_code}</span>
                      )}
                      <div className="flex items-center gap-1">
                        <div className={`w-1.5 h-1.5 rounded-full ${STATUS_COLORS[matter.status] || 'bg-gray-500'}`} />
                        <span>{STATUS_LABELS[matter.status] || matter.status}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/app/docket/${matter.id}`)}
                >
                  Ver
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            <p className="text-sm">No se han creado expedientes aún</p>
            {pendingMatterItems.length > 0 && (
              <p className="text-xs mt-1">
                {pendingMatterItems.length} servicio(s) pueden generar expedientes
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
