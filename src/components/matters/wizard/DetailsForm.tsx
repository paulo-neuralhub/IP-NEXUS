// ============================================================
// IP-NEXUS - DETAILS FORM COMPONENT
// L130: Matter details form with Nice class + products selector
// ============================================================

import { useState } from 'react';
import {
  Building2,
  FileText,
  AlertCircle,
  Loader2,
  Sparkles,
  Tag,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ClientSelector } from './ClientSelector';
import { NiceClassWithProductsSelector, type NiceSelection } from './NiceClassWithProductsSelector';
import { CreateClientDialog } from './CreateClientDialog';

export interface MatterDetailsData {
  title: string;
  client_id: string;
  reference: string;
  client_reference: string;
  mark_name: string;
  invention_title: string;
  internal_notes: string;
  is_urgent: boolean;
  is_confidential: boolean;
  nice_classes: number[];
  nice_classes_detail?: NiceSelection; // New: class -> products mapping
}

interface DetailsFormProps {
  data: MatterDetailsData;
  onChange: (data: Partial<MatterDetailsData>) => void;
  matterType: string;
  previewNumber?: string;
  isGeneratingNumber?: boolean;
}

export function DetailsForm({
  data,
  onChange,
  matterType,
  previewNumber,
  isGeneratingNumber,
}: DetailsFormProps) {
  const [showCreateClient, setShowCreateClient] = useState(false);
  const [clientSearch, setClientSearch] = useState('');

  const isTrademarkType = matterType?.startsWith('TM') || matterType === 'NC';
  const isPatentType = matterType?.startsWith('PT') || matterType === 'UM';

  const handleClientCreated = (clientId: string) => {
    onChange({ client_id: clientId });
    setShowCreateClient(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-xl font-semibold mb-2">Detalles del expediente</h2>
        <p className="text-muted-foreground">Completa la información básica</p>
      </div>

      {/* Number Preview */}
      {previewNumber && (
        <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-lg border border-primary/20 mb-6">
          <Sparkles className="h-5 w-5 text-primary shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-muted-foreground">Número de expediente</p>
            {isGeneratingNumber ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Generando...</span>
              </div>
            ) : (
              <p className="font-mono text-lg font-semibold text-primary truncate">
                {previewNumber}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Client Selector */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          Cliente
        </Label>
        <ClientSelector
          value={data.client_id}
          onChange={(clientId) => onChange({ client_id: clientId })}
          onCreateNew={() => setShowCreateClient(true)}
        />
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Título del expediente *
        </Label>
        <Input
          placeholder="Ej: Registro de marca ACME en España"
          value={data.title}
          onChange={(e) => onChange({ title: e.target.value })}
          className="h-12"
        />
        {data.title && data.title.length < 3 && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            El título debe tener al menos 3 caracteres
          </p>
        )}
      </div>

      {/* Type-specific fields */}
      {isTrademarkType && (
        <>
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Denominación de la marca
            </Label>
            <Input
              placeholder="Ej: ACME"
              value={data.mark_name}
              onChange={(e) => onChange({ mark_name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Clases Nice y Productos</Label>
            <NiceClassWithProductsSelector
              value={data.nice_classes_detail || {}}
              onChange={(selection) => {
                // Update both: legacy nice_classes (array of numbers) and new detail
                const classNumbers = Object.keys(selection).map(Number).sort((a, b) => a - b);
                onChange({
                  nice_classes: classNumbers,
                  nice_classes_detail: selection,
                });
              }}
            />
          </div>
        </>
      )}

      {isPatentType && (
        <div className="space-y-2">
          <Label>Título de la invención</Label>
          <Input
            placeholder="Título técnico de la invención"
            value={data.invention_title}
            onChange={(e) => onChange({ invention_title: e.target.value })}
          />
        </div>
      )}

      {/* References */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Referencia interna</Label>
          <Input
            placeholder="Se genera automáticamente"
            value={data.reference}
            onChange={(e) => onChange({ reference: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">
            Déjalo vacío para generar automáticamente
          </p>
        </div>
        <div className="space-y-2">
          <Label>Referencia del cliente</Label>
          <Input
            placeholder="Referencia que usa el cliente"
            value={data.client_reference}
            onChange={(e) => onChange({ client_reference: e.target.value })}
          />
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label>Notas internas</Label>
        <Textarea
          placeholder="Notas adicionales..."
          value={data.internal_notes}
          onChange={(e) => onChange({ internal_notes: e.target.value })}
          rows={3}
        />
      </div>

      {/* Options */}
      <div className="space-y-4 pt-4 border-t">
        <div className="flex items-center justify-between p-4 rounded-lg border">
          <div>
            <p className="font-medium">Urgente</p>
            <p className="text-sm text-muted-foreground">Marcar como expediente prioritario</p>
          </div>
          <Switch
            checked={data.is_urgent}
            onCheckedChange={(checked) => onChange({ is_urgent: checked })}
          />
        </div>
        <div className="flex items-center justify-between p-4 rounded-lg border">
          <div>
            <p className="font-medium">Confidencial</p>
            <p className="text-sm text-muted-foreground">Restringir acceso a usuarios autorizados</p>
          </div>
          <Switch
            checked={data.is_confidential}
            onCheckedChange={(checked) => onChange({ is_confidential: checked })}
          />
        </div>
      </div>

      {/* Create Client Dialog */}
      <CreateClientDialog
        open={showCreateClient}
        onOpenChange={setShowCreateClient}
        onClientCreated={handleClientCreated}
        initialName={clientSearch}
      />
    </motion.div>
  );
}
