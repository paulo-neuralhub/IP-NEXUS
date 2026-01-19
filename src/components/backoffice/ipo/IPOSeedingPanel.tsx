// src/components/backoffice/ipo/IPOSeedingPanel.tsx
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Database, Play, CheckCircle, AlertTriangle, Loader2, FileJson } from 'lucide-react';
import { IPOSeedingService } from '@/services/ipo/seedingService';
import { ALL_IPO_SEED_DATA, TIER1_OFFICES, TIER2_OFFICES, TIER3_OFFICES } from '@/data/ipo-seed-data';

export function IPOSeedingPanel() {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState({ phase: '', current: 0, total: 0, message: '' });
  const [result, setResult] = useState<{ success: boolean; stats: { officesCreated: number; officesSkipped: number; errorsCount: number } } | null>(null);

  const handleRunSeeding = async () => {
    setIsRunning(true);
    setResult(null);
    const service = new IPOSeedingService((p) => setProgress(p));
    const seedResult = await service.runFullSeeding();
    setResult(seedResult);
    setIsRunning(false);
  };

  const progressPercent = progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Seeding de Oficinas
        </CardTitle>
        <CardDescription>Importación inicial de datos de oficinas de PI</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-center">
            <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{TIER1_OFFICES.length}</p>
            <p className="text-sm text-purple-600 dark:text-purple-400">Tier 1 (Críticas)</p>
          </div>
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{TIER2_OFFICES.length}</p>
            <p className="text-sm text-blue-600 dark:text-blue-400">Tier 2 (Importantes)</p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
            <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">{TIER3_OFFICES.length}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Tier 3 (Secundarias)</p>
          </div>
        </div>

        <Alert>
          <FileJson className="h-4 w-4" />
          <AlertDescription>
            Total: {ALL_IPO_SEED_DATA.length} oficinas preparadas para importar.
          </AlertDescription>
        </Alert>

        {isRunning && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>{progress.message}</span>
              <span>{progressPercent}%</span>
            </div>
            <Progress value={progressPercent} />
          </div>
        )}

        {result && (
          <div className={`p-4 rounded-lg ${result.success ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
            <div className="flex items-center gap-2 mb-2">
              {result.success ? <CheckCircle className="h-5 w-5 text-green-600" /> : <AlertTriangle className="h-5 w-5 text-red-600" />}
              <span className="font-medium">{result.success ? 'Seeding completado' : 'Seeding con errores'}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div><span className="text-muted-foreground">Creadas:</span> <strong className="text-green-600">{result.stats.officesCreated}</strong></div>
              <div><span className="text-muted-foreground">Omitidas:</span> <strong>{result.stats.officesSkipped}</strong></div>
              <div><span className="text-muted-foreground">Errores:</span> <strong className="text-red-600">{result.stats.errorsCount}</strong></div>
            </div>
          </div>
        )}

        <Button onClick={handleRunSeeding} disabled={isRunning} className="w-full">
          {isRunning ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Importando...</> : <><Play className="h-4 w-4 mr-2" />Ejecutar Seeding</>}
        </Button>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>• El seeding omite oficinas que ya existen (por código ST.3)</p>
          <p>• Los datos de conexión (APIs, scrapers) deben configurarse manualmente</p>
        </div>
      </CardContent>
    </Card>
  );
}
