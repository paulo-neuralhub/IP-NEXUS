import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2, XCircle, Database, FileCheck } from 'lucide-react';
import { ImportExportService } from '@/services/import-export-service';
import { useOrganization } from '@/contexts/organization-context';
import { supabase } from '@/integrations/supabase/client';
import type { FieldMapping } from '@/types/import-export';

interface ImportStepProps {
  file: File;
  data: Record<string, unknown>[];
  mappings: FieldMapping[];
  entityType: string;
  onImportComplete: (result: {
    success: boolean;
    totalProcessed: number;
    totalSuccess: number;
    totalFailed: number;
    jobId: string;
  }) => void;
}

type ImportPhase = 'creating_job' | 'uploading_file' | 'processing' | 'completed' | 'failed';

export function ImportStep({
  file,
  data,
  mappings,
  entityType,
  onImportComplete
}: ImportStepProps) {
  const { currentOrganization } = useOrganization();
  const [phase, setPhase] = useState<ImportPhase>('creating_job');
  const [progress, setProgress] = useState(0);
  const [jobId, setJobId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({ processed: 0, success: 0, failed: 0 });

  useEffect(() => {
    if (!currentOrganization) return;
    
    startImport();
  }, [currentOrganization]);

  const startImport = async () => {
    if (!currentOrganization) return;

    try {
      // Phase 1: Create job
      setPhase('creating_job');
      setProgress(10);

      const { data: job, error: jobError } = await supabase
        .from('import_jobs_v2' as any)
        .insert({
          organization_id: currentOrganization.id,
          entity_type: entityType,
          source_type: 'file',
          source_name: file.name,
          file_name: file.name,
          file_size: file.size,
          total_rows: data.length,
          field_mappings: mappings,
          status: 'pending'
        })
        .select()
        .single();

      if (jobError) throw jobError;
      setJobId(job.id);

      // Phase 2: Upload file
      setPhase('uploading_file');
      setProgress(25);

      const filePath = `${currentOrganization.id}/${job.id}/${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('imports')
        .upload(filePath, file);

      if (uploadError) {
        console.warn('File upload warning:', uploadError);
        // Continue anyway - file is optional for processing
      }

      // Update job with file URL
      const { data: urlData } = supabase.storage
        .from('imports')
        .getPublicUrl(filePath);

      await supabase
        .from('import_jobs_v2' as any)
        .update({ 
          file_url: urlData.publicUrl,
          status: 'processing',
          started_at: new Date().toISOString()
        })
        .eq('id', job.id);

      // Phase 3: Process import
      setPhase('processing');
      setProgress(40);

      // Simulate progress during processing
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 5, 90));
      }, 500);

      const result = await ImportExportService.processImport(
        job.id,
        data,
        mappings,
        entityType,
        currentOrganization.id
      );

      clearInterval(progressInterval);

      // Phase 4: Completed
      setPhase(result.success ? 'completed' : 'failed');
      setProgress(100);
      setStats({
        processed: result.totalProcessed,
        success: result.totalSuccess,
        failed: result.totalFailed
      });

      onImportComplete({
        success: result.success,
        totalProcessed: result.totalProcessed,
        totalSuccess: result.totalSuccess,
        totalFailed: result.totalFailed,
        jobId: job.id
      });

    } catch (err) {
      setPhase('failed');
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('Import error:', err);
    }
  };

  const getPhaseInfo = () => {
    switch (phase) {
      case 'creating_job':
        return { icon: Database, label: 'Creando trabajo de importación...' };
      case 'uploading_file':
        return { icon: FileCheck, label: 'Subiendo archivo...' };
      case 'processing':
        return { icon: Loader2, label: `Procesando ${data.length} registros...` };
      case 'completed':
        return { icon: CheckCircle2, label: 'Importación completada' };
      case 'failed':
        return { icon: XCircle, label: 'Error en la importación' };
    }
  };

  const phaseInfo = getPhaseInfo();
  const PhaseIcon = phaseInfo.icon;

  return (
    <div className="space-y-6">
      {/* Main status */}
      <Card className="p-8">
        <div className="flex flex-col items-center gap-6">
          <div className={`p-4 rounded-full ${
            phase === 'completed' 
              ? 'bg-green-100 dark:bg-green-900/30' 
              : phase === 'failed'
                ? 'bg-destructive/10'
                : 'bg-primary/10'
          }`}>
            <PhaseIcon className={`h-12 w-12 ${
              phase === 'completed' 
                ? 'text-green-600' 
                : phase === 'failed'
                  ? 'text-destructive'
                  : 'text-primary'
            } ${phase === 'processing' || phase === 'creating_job' || phase === 'uploading_file' ? 'animate-spin' : ''}`} />
          </div>
          
          <div className="text-center">
            <h3 className="text-lg font-semibold">{phaseInfo.label}</h3>
            {phase === 'processing' && (
              <p className="text-sm text-muted-foreground mt-1">
                Por favor espera mientras se procesan los datos
              </p>
            )}
          </div>

          <div className="w-full max-w-md">
            <Progress value={progress} className="h-2" />
            <p className="text-center text-sm text-muted-foreground mt-2">
              {progress}% completado
            </p>
          </div>
        </div>
      </Card>

      {/* Stats */}
      {(phase === 'processing' || phase === 'completed' || phase === 'failed') && (
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold">{stats.processed || data.length}</div>
            <div className="text-sm text-muted-foreground">Total</div>
          </Card>
          <Card className="p-4 text-center border-green-500/50">
            <div className="text-2xl font-bold text-green-600">{stats.success}</div>
            <div className="text-sm text-muted-foreground">Exitosos</div>
          </Card>
          <Card className="p-4 text-center border-destructive/50">
            <div className="text-2xl font-bold text-destructive">{stats.failed}</div>
            <div className="text-sm text-muted-foreground">Fallidos</div>
          </Card>
        </div>
      )}

      {/* Error message */}
      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Job ID */}
      {jobId && (
        <div className="text-center text-sm text-muted-foreground">
          ID del trabajo: <code className="bg-muted px-2 py-1 rounded">{jobId}</code>
        </div>
      )}
    </div>
  );
}
