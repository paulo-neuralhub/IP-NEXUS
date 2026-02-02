// src/components/ipo/IPOSeedingPanel.tsx
import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  Globe2, 
  Database, 
  Loader2,
  Info
} from 'lucide-react';
import { IPOSeedingService } from '@/services/ipo/seedingService';
import { ALL_IPO_OFFICES, getOfficeStats } from '@/data/ipo-offices';
import { useQueryClient } from '@tanstack/react-query';

interface SeedingProgress {
  phase: string;
  current: number;
  total: number;
  message: string;
}

interface SeedingStats {
  officesCreated: number;
  officesSkipped: number;
  errorsCount: number;
}

export function IPOSeedingPanel({ currentOfficeCount }: { currentOfficeCount: number }) {
  const [isSeeding, setIsSeeding] = useState(false);
  const [progress, setProgress] = useState<SeedingProgress | null>(null);
  const [result, setResult] = useState<{ success: boolean; stats: SeedingStats } | null>(null);
  const queryClient = useQueryClient();

  const catalogStats = getOfficeStats();
  const missingOffices = catalogStats.total - currentOfficeCount;

  const handleSeed = useCallback(async () => {
    setIsSeeding(true);
    setResult(null);
    setProgress({ phase: 'init', current: 0, total: catalogStats.total, message: 'Iniciando...' });

    const service = new IPOSeedingService((p) => setProgress(p));
    const seedResult = await service.runFullSeeding();
    
    setResult(seedResult);
    setIsSeeding(false);
    setProgress(null);

    // Refresh the offices list
    queryClient.invalidateQueries({ queryKey: ['ipo-offices-full'] });
    queryClient.invalidateQueries({ queryKey: ['ipo-offices'] });
  }, [catalogStats.total, queryClient]);

  const progressPercent = progress 
    ? Math.round((progress.current / progress.total) * 100) 
    : 0;

  return (
    <Card className="border-dashed border-2 border-primary/20 bg-primary/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe2 className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Catálogo Global de Oficinas</CardTitle>
          </div>
          <Badge variant="secondary" className="font-mono">
            {catalogStats.total} oficinas disponibles
          </Badge>
        </div>
        <CardDescription>
          Importar el catálogo completo de {catalogStats.total} oficinas de PI mundiales
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-background rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-primary">{catalogStats.byRegion.europe}</p>
            <p className="text-xs text-muted-foreground">Europa</p>
          </div>
          <div className="bg-background rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-primary">{catalogStats.byRegion.americas}</p>
            <p className="text-xs text-muted-foreground">Américas</p>
          </div>
          <div className="bg-background rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-primary">{catalogStats.byRegion.asia_pacific}</p>
            <p className="text-xs text-muted-foreground">Asia-Pacífico</p>
          </div>
          <div className="bg-background rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-primary">
              {catalogStats.byRegion.africa + catalogStats.byRegion.middle_east}
            </p>
            <p className="text-xs text-muted-foreground">África + Medio Oriente</p>
          </div>
        </div>

        {/* Current Status */}
        <div className="flex items-center justify-between p-3 bg-background rounded-lg">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Oficinas en base de datos:</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold">{currentOfficeCount}</span>
            <span className="text-muted-foreground">/</span>
            <span className="font-mono text-muted-foreground">{catalogStats.total}</span>
            {missingOffices > 0 && (
              <Badge variant="outline" className="text-warning border-warning">
                {missingOffices} pendientes
              </Badge>
            )}
            {missingOffices === 0 && (
              <Badge variant="outline" className="text-primary border-primary">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Completo
              </Badge>
            )}
          </div>
        </div>

        {/* Progress */}
        {isSeeding && progress && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{progress.message}</span>
              <span className="font-mono">{progress.current}/{progress.total}</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>
        )}

        {/* Result */}
        {result && (
          <Alert variant={result.success ? 'default' : 'destructive'}>
            {result.success ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <AlertTriangle className="h-4 w-4" />
            )}
            <AlertTitle>
              {result.success ? 'Importación completada' : 'Error en importación'}
            </AlertTitle>
            <AlertDescription className="mt-2">
              <div className="flex gap-4 text-sm">
                <span className="text-primary">
                  ✓ {result.stats.officesCreated} creadas
                </span>
                <span className="text-muted-foreground">
                  ⊘ {result.stats.officesSkipped} existentes
                </span>
                {result.stats.errorsCount > 0 && (
                  <span className="text-destructive">
                    ✗ {result.stats.errorsCount} errores
                  </span>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Info Alert */}
        {missingOffices > 0 && !isSeeding && !result && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Oficinas pendientes de importar</AlertTitle>
            <AlertDescription>
              El catálogo incluye {missingOffices} oficinas adicionales que no están en la base de datos.
              Incluye oficinas de {catalogStats.madridMembers} miembros de Madrid y {catalogStats.pctMembers} del PCT.
            </AlertDescription>
          </Alert>
        )}

        {/* Action Button */}
        <Button 
          onClick={handleSeed} 
          disabled={isSeeding || missingOffices === 0}
          className="w-full"
          size="lg"
        >
          {isSeeding ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Importando... {progressPercent}%
            </>
          ) : missingOffices === 0 ? (
            <>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Catálogo completo
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Importar {missingOffices} oficinas
            </>
          )}
        </Button>

        {/* Tier breakdown */}
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground pt-2">
          <span>Tier 1: {catalogStats.byTier.tier1}</span>
          <span>•</span>
          <span>Tier 2: {catalogStats.byTier.tier2}</span>
          <span>•</span>
          <span>Tier 3: {catalogStats.byTier.tier3}</span>
        </div>
      </CardContent>
    </Card>
  );
}
