import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Plus } from 'lucide-react';
import { useCreateConnector } from '@/hooks/use-data-hub';
import { CONNECTOR_TYPES, SYNC_FREQUENCIES } from '@/lib/constants/data-hub';
import type { ConnectorType, SyncFrequency } from '@/types/data-hub';

interface ConnectorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Field configurations for each connector type
const CONNECTOR_FIELDS: Record<string, Array<{
  key: string;
  label: string;
  type: 'text' | 'password' | 'select' | 'textarea';
  required: boolean;
  options?: string[];
}>> = {
  euipo: [
    { key: 'username', label: 'Usuario EUIPO', type: 'text', required: true },
    { key: 'password', label: 'Contraseña', type: 'password', required: true },
  ],
  wipo: [
    { key: 'api_key', label: 'API Key', type: 'password', required: true },
  ],
  tmview: [
    { key: 'api_key', label: 'API Key', type: 'password', required: true },
  ],
  oepm: [
    { key: 'certificate', label: 'Certificado Digital', type: 'textarea', required: true },
    { key: 'password', label: 'Contraseña Certificado', type: 'password', required: true },
  ],
  epo: [
    { key: 'api_key', label: 'API Key', type: 'password', required: true },
  ],
  uspto: [
    { key: 'api_key', label: 'API Key', type: 'password', required: true },
  ],
  ukipo: [
    { key: 'api_key', label: 'API Key', type: 'password', required: true },
  ],
  inpi_es: [
    { key: 'api_key', label: 'API Key', type: 'password', required: true },
  ],
  custom_api: [
    { key: 'base_url', label: 'URL Base', type: 'text', required: true },
    { key: 'auth_type', label: 'Tipo Auth', type: 'select', required: true, options: ['none', 'bearer', 'basic', 'api_key'] },
    { key: 'auth_value', label: 'Token/Credenciales', type: 'password', required: false },
  ],
};

export function ConnectorModal({ open, onOpenChange }: ConnectorModalProps) {
  const [connectorType, setConnectorType] = useState<ConnectorType>('euipo');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [config, setConfig] = useState<Record<string, string>>({});
  const [syncFrequency, setSyncFrequency] = useState<SyncFrequency>('manual');
  
  const { mutate: createConnector, isPending } = useCreateConnector();
  
  const connectorInfo = CONNECTOR_TYPES[connectorType];
  const fields = CONNECTOR_FIELDS[connectorType] || [];
  
  const handleCreate = () => {
    createConnector({
      name: name || connectorInfo?.label || connectorType,
      connector_type: connectorType,
      config,
      sync_frequency: syncFrequency,
      sync_enabled: syncFrequency !== 'manual',
    }, {
      onSuccess: () => {
        onOpenChange(false);
        resetForm();
      }
    });
  };
  
  const resetForm = () => {
    setName('');
    setDescription('');
    setConfig({});
    setSyncFrequency('manual');
  };
  
  const updateConfig = (key: string, value: string) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };
  
  const ConnectorIcon = connectorInfo?.icon;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nuevo Conector</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Connector type */}
          <div>
            <Label>Tipo de conector</Label>
            <Select value={connectorType} onValueChange={(v) => {
              setConnectorType(v as ConnectorType);
              setConfig({});
            }}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CONNECTOR_TYPES).map(([key, cfg]) => {
                  const Icon = cfg.icon;
                  return (
                    <SelectItem key={key} value={key}>
                      <span className="flex items-center gap-2">
                        {Icon && <Icon className="h-4 w-4" style={{ color: cfg.color }} />}
                        {cfg.label}
                      </span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {connectorInfo?.description && (
              <p className="text-sm text-muted-foreground mt-1">{connectorInfo.description}</p>
            )}
          </div>
          
          {/* Name */}
          <div>
            <Label>Nombre</Label>
            <Input
              className="mt-2"
              placeholder={connectorInfo?.label || 'Nombre del conector'}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          
          {/* Description */}
          <div>
            <Label>Descripción (opcional)</Label>
            <Textarea
              className="mt-2"
              placeholder="Describe el propósito de este conector..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          
          {/* Configuration fields */}
          {fields.length > 0 && (
            <div className="space-y-4">
              <Label className="text-base font-medium">Configuración</Label>
              {fields.map(field => (
                <div key={field.key}>
                  <Label className="text-sm">{field.label}</Label>
                  {field.type === 'select' ? (
                    <Select
                      value={config[field.key] || ''}
                      onValueChange={(v) => updateConfig(field.key, v)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder={`Seleccionar ${field.label}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options?.map(opt => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : field.type === 'textarea' ? (
                    <Textarea
                      className="mt-1"
                      placeholder={field.label}
                      value={config[field.key] || ''}
                      onChange={(e) => updateConfig(field.key, e.target.value)}
                    />
                  ) : (
                    <Input
                      className="mt-1"
                      type={field.type}
                      placeholder={field.label}
                      value={config[field.key] || ''}
                      onChange={(e) => updateConfig(field.key, e.target.value)}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
          
          {/* Sync frequency */}
          <div>
            <Label>Frecuencia de sincronización</Label>
            <Select value={syncFrequency} onValueChange={(v) => setSyncFrequency(v as SyncFrequency)}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(SYNC_FREQUENCIES).map(([key, cfg]) => (
                  <SelectItem key={key} value={key}>
                    <span className="flex flex-col">
                      <span>{cfg.label}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleCreate} disabled={isPending}>
            {isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            Crear Conector
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
