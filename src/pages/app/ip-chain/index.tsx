import { useState } from 'react';
import { 
  Shield, 
  Plus, 
  Download, 
  CheckCircle, 
  Clock, 
  XCircle,
  ExternalLink,
  Hash,
  Loader2,
  FileText
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  useBlockchainTimestamps, 
  useCreateTimestamp,
  useDownloadCertificate
} from '@/hooks/use-blockchain';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { BLOCKCHAIN_CONFIG, type TimestampStatus, type ResourceType } from '@/types/advanced';
import { InlineHelp } from '@/components/help';

const STATUS_CONFIG: Record<TimestampStatus, { label: string; icon: typeof Clock; color: string }> = {
  pending: { label: 'Pendiente', icon: Clock, color: '#6B7280' },
  submitted: { label: 'Enviado', icon: Loader2, color: '#3B82F6' },
  confirmed: { label: 'Confirmado', icon: CheckCircle, color: '#22C55E' },
  failed: { label: 'Error', icon: XCircle, color: '#EF4444' },
};

export default function IPChainPage() {
  const { data: timestamps = [], isLoading } = useBlockchainTimestamps();
  const createMutation = useCreateTimestamp();
  const downloadMutation = useDownloadCertificate();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const handleDownloadCertificate = async (id: string) => {
    try {
      const result = await downloadMutation.mutateAsync(id);
      toast.success('Certificado generado');
      // Could trigger download here based on result
    } catch (error) {
      toast.error('Error al generar certificado');
    }
  };
  
  const getExplorerUrl = (blockchain: string, txHash: string) => {
    const config = BLOCKCHAIN_CONFIG[blockchain as keyof typeof BLOCKCHAIN_CONFIG];
    return config ? `${config.explorerUrl}${txHash}` : `https://polygonscan.com/tx/${txHash}`;
  };
  
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Shield className="w-7 h-7 text-primary" />
            IP-CHAIN
            <InlineHelp text="Timestamping blockchain para crear pruebas inmutables de existencia y autoría de tus documentos. Genera certificados verificables con fecha exacta." />
          </h1>
          <p className="text-muted-foreground">
            Timestamping blockchain para prueba de existencia y autoría
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Nuevo Timestamp
        </button>
      </div>
      
      {/* Info Card */}
      <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-xl p-6">
        <h3 className="font-semibold text-foreground mb-2">¿Qué es IP-CHAIN?</h3>
        <p className="text-sm text-muted-foreground mb-4">
          IP-CHAIN utiliza tecnología blockchain para crear pruebas inmutables de existencia 
          de tus documentos y creaciones. Cada timestamp genera un certificado verificable 
          que demuestra que un archivo existía en una fecha específica.
        </p>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Prueba de existencia</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Inmutable</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Verificable</span>
          </div>
        </div>
      </div>
      
      {/* Lista de Timestamps */}
      <div className="bg-card rounded-xl border">
        <div className="p-4 border-b">
          <h2 className="font-semibold text-foreground">Timestamps Registrados</h2>
        </div>
        
        {isLoading ? (
          <div className="p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
          </div>
        ) : timestamps.length === 0 ? (
          <div className="p-8 text-center">
            <Shield className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">No hay timestamps registrados</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Crea tu primer timestamp para proteger tus creaciones
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {timestamps.map(timestamp => {
              const StatusIcon = STATUS_CONFIG[timestamp.status].icon;
              const statusColor = STATUS_CONFIG[timestamp.status].color;
              
              return (
                <div key={timestamp.id} className="p-4 hover:bg-muted/50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${statusColor}15` }}
                      >
                        <StatusIcon 
                          className={cn("w-5 h-5", timestamp.status === 'submitted' && "animate-spin")}
                          style={{ color: statusColor }}
                        />
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground">
                            {timestamp.metadata?.title || timestamp.file_name || 'Sin título'}
                          </p>
                          <span 
                            className="px-2 py-0.5 text-xs rounded-full"
                            style={{ backgroundColor: `${statusColor}15`, color: statusColor }}
                          >
                            {STATUS_CONFIG[timestamp.status].label}
                          </span>
                        </div>
                        
                        {timestamp.metadata?.description && (
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {timestamp.metadata.description}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Hash className="w-3 h-3" />
                            {timestamp.content_hash.substring(0, 16)}...
                          </span>
                          <span>
                            {format(new Date(timestamp.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                          </span>
                          <span className="uppercase">{timestamp.blockchain}</span>
                        </div>
                        
                        {timestamp.tx_hash && (
                          <div className="mt-2">
                            <a
                              href={getExplorerUrl(timestamp.blockchain, timestamp.tx_hash)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline flex items-center gap-1"
                            >
                              Ver en blockchain <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {timestamp.status === 'confirmed' && (
                        <button
                          onClick={() => handleDownloadCertificate(timestamp.id)}
                          disabled={downloadMutation.isPending}
                          className="px-3 py-1.5 text-sm border rounded-lg hover:bg-muted flex items-center gap-1"
                        >
                          <Download className="w-4 h-4" /> Certificado
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Create Modal */}
      {showCreateModal && (
        <CreateTimestampModal
          onClose={() => setShowCreateModal(false)}
          onCreate={async (data) => {
            try {
              await createMutation.mutateAsync(data);
              toast.success('Timestamp creado correctamente');
              setShowCreateModal(false);
            } catch (error) {
              toast.error('Error al crear timestamp');
            }
          }}
          isLoading={createMutation.isPending}
        />
      )}
    </div>
  );
}

function CreateTimestampModal({ onClose, onCreate, isLoading }: {
  onClose: () => void;
  onCreate: (data: { file: File; resourceType: ResourceType; metadata?: Record<string, unknown> }) => void;
  isLoading: boolean;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [resourceType, setResourceType] = useState<ResourceType>('document');
  const [dragOver, setDragOver] = useState(false);
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) setFile(droppedFile);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    
    onCreate({
      file,
      resourceType,
      metadata: { title, description },
    });
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl w-full max-w-lg">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Nuevo Timestamp</h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded text-2xl leading-none">&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* File Drop */}
          <div
            className={cn(
              "border-2 border-dashed rounded-xl p-8 text-center transition-colors",
              dragOver ? "border-primary bg-primary/5" : "border-border",
              file && "border-green-500 bg-green-50"
            )}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            {file ? (
              <div className="flex items-center justify-center gap-3">
                <FileText className="w-8 h-8 text-green-500" />
                <div className="text-left">
                  <p className="font-medium text-foreground">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="ml-4 text-muted-foreground hover:text-destructive text-xl"
                >
                  &times;
                </button>
              </div>
            ) : (
              <>
                <Shield className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground">Arrastra un archivo aquí</p>
                <p className="text-sm text-muted-foreground/70 mt-1">o</p>
                <label className="mt-2 inline-block px-4 py-2 bg-muted text-foreground rounded-lg cursor-pointer hover:bg-muted/80">
                  Seleccionar archivo
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                </label>
              </>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Título
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Diseño logo versión final"
              className="w-full border rounded-lg px-3 py-2 bg-background"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Descripción
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción opcional..."
              rows={2}
              className="w-full border rounded-lg px-3 py-2 bg-background"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Tipo de recurso
            </label>
            <select
              value={resourceType}
              onChange={(e) => setResourceType(e.target.value as ResourceType)}
              className="w-full border rounded-lg px-3 py-2 bg-background"
            >
              <option value="document">Documento</option>
              <option value="design">Diseño</option>
              <option value="invention">Invención</option>
              <option value="contract">Contrato</option>
              <option value="custom">Otro</option>
            </select>
          </div>
          
          <div className="flex justify-end gap-2 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg hover:bg-muted"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!file || isLoading}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Procesando...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" /> Crear Timestamp
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
