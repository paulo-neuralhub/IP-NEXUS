// src/components/backoffice/ipo/AutoMendButton.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Zap, Loader2, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AutoMendButtonProps {
  officeId: string;
  connectionMethodId: string;
  officeName: string;
  disabled?: boolean;
}

type MendPhase = 'idle' | 'diagnosing' | 'repairing' | 'verifying' | 'complete';

interface DiagnosisResult {
  endpointTest?: { status: 'ok' | 'failed'; latencyMs?: number; error?: string };
  authTest?: { status: 'ok' | 'failed'; error?: string };
  scraperTest?: { status: 'ok' | 'failed'; selectorsValid?: number; selectorsBroken?: number };
  logAnalysis?: { recentErrors: number; errorPattern?: string; suggestedAction?: string };
}

interface MendAction {
  action: string;
  success: boolean;
  timestamp: string;
  details?: Record<string, unknown>;
}

export function AutoMendButton({ officeId, connectionMethodId, officeName, disabled }: AutoMendButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [phase, setPhase] = useState<MendPhase>('idle');
  const [progress, setProgress] = useState(0);
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);
  const [actions, setActions] = useState<MendAction[]>([]);
  const [finalStatus, setFinalStatus] = useState<string | null>(null);

  const autoMendMutation = useMutation({
    mutationFn: async () => {
      setPhase('diagnosing');
      setProgress(10);

      const { data, error } = await supabase.functions.invoke('ipo-auto-mend', {
        body: { officeId, connectionMethodId, triggerType: 'manual' },
      });

      if (error) throw error;

      // Poll for updates
      const checkProgress = async (): Promise<boolean> => {
        const { data: job } = await (supabase
          .from('ipo_automend_jobs' as any)
          .select('*')
          .eq('id', data.jobId)
          .single() as any);

        if (job.status === 'diagnosing') {
          setPhase('diagnosing');
          setProgress(30);
        } else if (job.status === 'repairing') {
          setPhase('repairing');
          setProgress(60);
          setDiagnosis(job.diagnosis_results);
        } else if (['success', 'partial', 'failed'].includes(job.status)) {
          setPhase('complete');
          setProgress(100);
          setDiagnosis(job.diagnosis_results);
          setActions(job.actions_taken || []);
          setFinalStatus(job.final_status);
          return true;
        }
        return false;
      };

      let complete = false;
      let attempts = 0;
      while (!complete && attempts < 30) {
        await new Promise(r => setTimeout(r, 2000));
        complete = await checkProgress();
        attempts++;
      }

      return data;
    },
    onSuccess: (data) => {
      if (data?.finalStatus === 'fully_recovered') {
        toast.success('¡Conexión recuperada completamente!');
      } else if (data?.finalStatus === 'failover_activated') {
        toast.warning('Se activó el método de respaldo');
      } else {
        toast.error('Se requiere intervención manual');
      }
    },
    onError: (error: Error) => {
      toast.error('Error en Auto-Mend: ' + error.message);
      setPhase('complete');
      setFinalStatus('error');
    },
  });

  const handleTrigger = () => {
    setIsOpen(true);
    setPhase('idle');
    setProgress(0);
    setDiagnosis(null);
    setActions([]);
    setFinalStatus(null);
  };

  const handleStart = () => autoMendMutation.mutate();

  const handleClose = () => {
    if (!['diagnosing', 'repairing', 'verifying'].includes(phase)) {
      setIsOpen(false);
    }
  };

  return (
    <>
      <Button
        variant="destructive"
        onClick={handleTrigger}
        disabled={disabled || autoMendMutation.isPending}
        className="bg-amber-600 hover:bg-amber-700"
      >
        <Zap className="h-4 w-4 mr-2" />
        Auto-Mend
      </Button>

      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Auto-Mend: {officeName}
            </DialogTitle>
            <DialogDescription>
              Sistema de diagnóstico y reparación automática
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {phase !== 'idle' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>
                    {phase === 'diagnosing' && 'Diagnosticando...'}
                    {phase === 'repairing' && 'Reparando...'}
                    {phase === 'verifying' && 'Verificando...'}
                    {phase === 'complete' && 'Completado'}
                  </span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} />
              </div>
            )}

            {phase === 'idle' && (
              <div className="space-y-4">
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-2">¿Qué hace Auto-Mend?</h4>
                  <ol className="text-sm text-amber-700 dark:text-amber-300 space-y-1 list-decimal list-inside">
                    <li>Diagnostica la conexión (endpoint, autenticación, selectores)</li>
                    <li>Analiza patrones de errores recientes</li>
                    <li>Intenta reparaciones automáticas (rotar credenciales, regenerar scraper)</li>
                    <li>Si falla, activa el método de respaldo</li>
                    <li>Si todo falla, pone la oficina en mantenimiento</li>
                  </ol>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
                  <Button onClick={handleStart} className="bg-amber-600 hover:bg-amber-700">
                    <Zap className="h-4 w-4 mr-2" />
                    Iniciar Auto-Mend
                  </Button>
                </div>
              </div>
            )}

            {diagnosis && (
              <div className="space-y-3">
                <h4 className="font-medium">Diagnóstico</h4>
                <div className="grid grid-cols-2 gap-3">
                  <DiagnosisItem 
                    label="Endpoint" 
                    status={diagnosis.endpointTest?.status} 
                    detail={diagnosis.endpointTest?.latencyMs ? `${diagnosis.endpointTest.latencyMs}ms` : diagnosis.endpointTest?.error} 
                  />
                  <DiagnosisItem 
                    label="Autenticación" 
                    status={diagnosis.authTest?.status} 
                    detail={diagnosis.authTest?.error} 
                  />
                  {diagnosis.scraperTest && (
                    <DiagnosisItem 
                      label="Scraper" 
                      status={diagnosis.scraperTest?.status} 
                      detail={`${diagnosis.scraperTest.selectorsValid || 0} válidos, ${diagnosis.scraperTest.selectorsBroken || 0} rotos`} 
                    />
                  )}
                  <DiagnosisItem 
                    label="Errores 24h" 
                    status={(diagnosis.logAnalysis?.recentErrors || 0) > 10 ? 'failed' : 'ok'} 
                    detail={`${diagnosis.logAnalysis?.recentErrors || 0} errores`} 
                  />
                </div>
              </div>
            )}

            {actions.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium">Acciones Ejecutadas</h4>
                <ScrollArea className="h-[150px]">
                  <div className="space-y-2">
                    {actions.map((action, i) => (
                      <div key={i} className={`p-2 rounded flex items-center justify-between ${action.success ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                        <div className="flex items-center gap-2">
                          {action.success ? <CheckCircle className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-600" />}
                          <span className="text-sm font-medium">{getActionLabel(action.action)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            {finalStatus && (
              <div className={`p-4 rounded-lg border ${
                finalStatus === 'fully_recovered' ? 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700' :
                finalStatus === 'failover_activated' ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700' :
                'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700'
              }`}>
                <div className="flex items-center gap-2">
                  {finalStatus === 'fully_recovered' && <><CheckCircle className="h-5 w-5 text-green-600" /><span className="font-medium text-green-800 dark:text-green-200">¡Conexión recuperada!</span></>}
                  {finalStatus === 'failover_activated' && <><RefreshCw className="h-5 w-5 text-blue-600" /><span className="font-medium text-blue-800 dark:text-blue-200">Failover activado</span></>}
                  {(finalStatus === 'human_intervention_needed' || finalStatus === 'error') && <><XCircle className="h-5 w-5 text-red-600" /><span className="font-medium text-red-800 dark:text-red-200">Requiere intervención manual</span></>}
                </div>
              </div>
            )}

            {phase === 'complete' && (
              <div className="flex justify-end">
                <Button onClick={() => setIsOpen(false)}>Cerrar</Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function DiagnosisItem({ label, status, detail }: { label: string; status?: 'ok' | 'failed'; detail?: string }) {
  return (
    <div className={`p-2 rounded border ${
      status === 'ok' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 
      status === 'failed' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' : 
      'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
    }`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        {status === 'ok' && <CheckCircle className="h-4 w-4 text-green-600" />}
        {status === 'failed' && <XCircle className="h-4 w-4 text-red-600" />}
      </div>
      {detail && <p className="text-xs text-muted-foreground mt-1">{detail}</p>}
    </div>
  );
}

function getActionLabel(action: string): string {
  const labels: Record<string, string> = {
    'rotate_credentials': 'Rotar credenciales',
    'regenerate_scraper': 'Regenerar scraper',
    'reduce_rate_limit': 'Reducir rate limit',
    'activate_failover': 'Activar failover',
    'set_maintenance_mode': 'Modo mantenimiento',
  };
  return labels[action] || action;
}
