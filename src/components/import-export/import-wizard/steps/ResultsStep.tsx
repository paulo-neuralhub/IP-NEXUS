import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, XCircle, Download, Eye, RotateCcw, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ResultsStepProps {
  result: {
    success: boolean;
    totalProcessed: number;
    totalSuccess: number;
    totalFailed: number;
    jobId: string;
  };
  entityType: string;
  onClose: () => void;
}

export function ResultsStep({ result, entityType, onClose }: ResultsStepProps) {
  const navigate = useNavigate();
  const successRate = result.totalProcessed > 0 
    ? Math.round((result.totalSuccess / result.totalProcessed) * 100) 
    : 0;

  const getEntityRoute = () => {
    switch (entityType) {
      case 'assets':
      case 'asset':
        return '/app/docket';
      case 'contacts':
      case 'contact':
        return '/app/crm/contacts';
      case 'deadlines':
      case 'deadline':
        return '/app/docket';
      case 'costs':
      case 'cost':
        return '/app/finance/costs';
      default:
        return '/app/dashboard';
    }
  };

  return (
    <div className="space-y-6">
      {/* Success/Failure banner */}
      {result.success ? (
        <Alert className="border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          <AlertDescription className="text-emerald-700 dark:text-emerald-400 text-base">
            ¡Importación completada exitosamente! Se importaron {result.totalSuccess} registros.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert variant="destructive">
          <XCircle className="h-5 w-5" />
          <AlertDescription className="text-base">
            La importación se completó con errores. {result.totalFailed} registros fallaron.
          </AlertDescription>
        </Alert>
      )}

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 text-center">
          <div className="text-4xl font-bold text-foreground">{result.totalProcessed}</div>
          <div className="text-sm text-muted-foreground mt-1">Procesados</div>
        </Card>
        <Card className="p-6 text-center border-emerald-500/50">
          <div className="text-4xl font-bold text-emerald-600">{result.totalSuccess}</div>
          <div className="text-sm text-muted-foreground mt-1">Exitosos</div>
        </Card>
        <Card className="p-6 text-center border-destructive/50">
          <div className="text-4xl font-bold text-destructive">{result.totalFailed}</div>
          <div className="text-sm text-muted-foreground mt-1">Fallidos</div>
        </Card>
        <Card className="p-6 text-center">
          <div className={`text-4xl font-bold ${successRate >= 90 ? 'text-emerald-600' : successRate >= 70 ? 'text-amber-600' : 'text-destructive'}`}>
            {successRate}%
          </div>
          <div className="text-sm text-muted-foreground mt-1">Tasa de éxito</div>
        </Card>
      </div>

      {/* Visual progress bar */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-medium">Resultado de la importación</span>
        </div>
        <div className="h-4 rounded-full overflow-hidden bg-muted flex">
          <div 
            className="bg-emerald-500 transition-all"
            style={{ width: `${(result.totalSuccess / result.totalProcessed) * 100}%` }}
          />
          <div 
            className="bg-destructive transition-all"
            style={{ width: `${(result.totalFailed / result.totalProcessed) * 100}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            Exitosos ({result.totalSuccess})
          </span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-destructive" />
            Fallidos ({result.totalFailed})
          </span>
        </div>
      </Card>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Button
          variant="outline"
          className="h-auto py-4 flex-col gap-2"
          onClick={() => navigate(getEntityRoute())}
        >
          <Eye className="h-5 w-5" />
          <span>Ver datos importados</span>
        </Button>
        
        <Button
          variant="outline"
          className="h-auto py-4 flex-col gap-2"
          onClick={() => navigate('/app/data-hub')}
        >
          <ExternalLink className="h-5 w-5" />
          <span>Ir al Data Hub</span>
        </Button>
      </div>

      {result.totalFailed > 0 && (
        <div className="flex gap-4">
          <Button variant="outline" className="flex-1 gap-2">
            <Download className="h-4 w-4" />
            Descargar errores
          </Button>
          <Button variant="outline" className="flex-1 gap-2">
            <RotateCcw className="h-4 w-4" />
            Reintentar fallidos
          </Button>
        </div>
      )}

      {/* Job reference */}
      <div className="text-center text-sm text-muted-foreground border-t pt-4">
        Referencia del trabajo: <code className="bg-muted px-2 py-1 rounded">{result.jobId}</code>
      </div>
    </div>
  );
}
