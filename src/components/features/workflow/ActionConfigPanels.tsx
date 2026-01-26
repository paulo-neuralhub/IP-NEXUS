// =============================================
// IP-NEXUS - ACTION CONFIGURATION PANELS
// Enhanced configuration panels for all action types
// =============================================

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VariablePicker, VariableInput } from './VariablePicker';
import type { WorkflowAction } from '@/types/workflow.types';

interface ActionConfigProps {
  action: WorkflowAction;
  onUpdate: (config: Record<string, unknown>) => void;
}

// Field with variable support
function ConfigField({ 
  label, 
  value, 
  onChange, 
  placeholder,
  type = 'text',
  required = false
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'textarea' | 'number' | 'email';
  required?: boolean;
}) {
  const handleInsertVariable = (variable: string) => {
    onChange(value + variable);
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-sm">
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
        <VariablePicker onSelect={handleInsertVariable} buttonLabel="" className="h-6 w-6 p-0" />
      </div>
      {type === 'textarea' ? (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
        />
      ) : (
        <Input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      )}
    </div>
  );
}

// Send Email Action
export function SendEmailConfig({ action, onUpdate }: ActionConfigProps) {
  const updateField = (field: string, value: unknown) => {
    onUpdate({ ...action.config, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <ConfigField
          label="Para (To)"
          value={(action.config.to as string) || ''}
          onChange={(v) => updateField('to', v)}
          placeholder="{{client.email}} o email@ejemplo.com"
          type="email"
          required
        />
        <ConfigField
          label="CC (opcional)"
          value={(action.config.cc as string) || ''}
          onChange={(v) => updateField('cc', v)}
          placeholder="copia@ejemplo.com"
          type="email"
        />
      </div>
      
      <ConfigField
        label="Asunto"
        value={(action.config.subject as string) || ''}
        onChange={(v) => updateField('subject', v)}
        placeholder="Asunto del email"
        required
      />
      
      <div className="space-y-1.5">
        <Label className="text-sm">Plantilla de Email</Label>
        <Select
          value={(action.config.template_id as string) || ''}
          onValueChange={(v) => updateField('template_id', v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar plantilla (opcional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Sin plantilla</SelectItem>
            <SelectItem value="deadline_reminder">Recordatorio de plazo</SelectItem>
            <SelectItem value="welcome_client">Bienvenida cliente</SelectItem>
            <SelectItem value="document_shared">Documento compartido</SelectItem>
            <SelectItem value="invoice_reminder">Recordatorio de factura</SelectItem>
            <SelectItem value="matter_update">Actualización de expediente</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ConfigField
        label="Cuerpo del mensaje"
        value={(action.config.body as string) || ''}
        onChange={(v) => updateField('body', v)}
        placeholder="Contenido del email (si no usa plantilla)"
        type="textarea"
      />
    </div>
  );
}

// Send SMS Action
export function SendSMSConfig({ action, onUpdate }: ActionConfigProps) {
  const updateField = (field: string, value: unknown) => {
    onUpdate({ ...action.config, [field]: value });
  };

  return (
    <div className="space-y-4">
      <ConfigField
        label="Número de teléfono"
        value={(action.config.phone as string) || ''}
        onChange={(v) => updateField('phone', v)}
        placeholder="{{client.phone}} o +34600000000"
        required
      />
      
      <ConfigField
        label="Mensaje"
        value={(action.config.message as string) || ''}
        onChange={(v) => updateField('message', v)}
        placeholder="Contenido del SMS (máx 160 caracteres)"
        type="textarea"
      />
      
      <p className="text-xs text-muted-foreground">
        Máximo 160 caracteres por SMS. Los mensajes más largos se dividirán.
      </p>
    </div>
  );
}

// Send WhatsApp Action
export function SendWhatsAppConfig({ action, onUpdate }: ActionConfigProps) {
  const updateField = (field: string, value: unknown) => {
    onUpdate({ ...action.config, [field]: value });
  };

  return (
    <div className="space-y-4">
      <ConfigField
        label="Número de teléfono"
        value={(action.config.phone as string) || ''}
        onChange={(v) => updateField('phone', v)}
        placeholder="{{client.phone}} o +34600000000"
        required
      />
      
      <div className="space-y-1.5">
        <Label className="text-sm">Plantilla de WhatsApp</Label>
        <Select
          value={(action.config.template_name as string) || ''}
          onValueChange={(v) => updateField('template_name', v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar plantilla HSM" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="deadline_reminder">Recordatorio de plazo</SelectItem>
            <SelectItem value="document_ready">Documento listo</SelectItem>
            <SelectItem value="invoice_reminder">Recordatorio de pago</SelectItem>
            <SelectItem value="welcome">Bienvenida</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Solo se pueden enviar plantillas HSM aprobadas por Meta
        </p>
      </div>
    </div>
  );
}

// Send Notification Action
export function SendNotificationConfig({ action, onUpdate }: ActionConfigProps) {
  const updateField = (field: string, value: unknown) => {
    onUpdate({ ...action.config, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label className="text-sm">Destinatario</Label>
        <Select
          value={(action.config.recipient as string) || 'assigned'}
          onValueChange={(v) => updateField('recipient', v)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="assigned">Usuario asignado</SelectItem>
            <SelectItem value="creator">Creador del expediente</SelectItem>
            <SelectItem value="team">Todo el equipo</SelectItem>
            <SelectItem value="specific">Usuario específico</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {action.config.recipient === 'specific' && (
        <ConfigField
          label="ID del usuario"
          value={(action.config.user_id as string) || ''}
          onChange={(v) => updateField('user_id', v)}
          placeholder="ID del usuario"
          required
        />
      )}
      
      <ConfigField
        label="Título"
        value={(action.config.title as string) || ''}
        onChange={(v) => updateField('title', v)}
        placeholder="Título de la notificación"
        required
      />
      
      <ConfigField
        label="Mensaje"
        value={(action.config.message as string) || ''}
        onChange={(v) => updateField('message', v)}
        placeholder="Contenido de la notificación"
        type="textarea"
      />
      
      <div className="space-y-1.5">
        <Label className="text-sm">Tipo de notificación</Label>
        <Select
          value={(action.config.type as string) || 'info'}
          onValueChange={(v) => updateField('type', v)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="info">ℹ️ Información</SelectItem>
            <SelectItem value="success">✅ Éxito</SelectItem>
            <SelectItem value="warning">⚠️ Advertencia</SelectItem>
            <SelectItem value="error">❌ Error</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <ConfigField
        label="Enlace (opcional)"
        value={(action.config.link as string) || ''}
        onChange={(v) => updateField('link', v)}
        placeholder="/app/matters/{{matter.id}}"
      />
    </div>
  );
}

// Create Task Action
export function CreateTaskConfig({ action, onUpdate }: ActionConfigProps) {
  const updateField = (field: string, value: unknown) => {
    onUpdate({ ...action.config, [field]: value });
  };

  return (
    <div className="space-y-4">
      <ConfigField
        label="Título de la tarea"
        value={(action.config.title as string) || ''}
        onChange={(v) => updateField('title', v)}
        placeholder="Revisar documentación de {{matter.reference}}"
        required
      />
      
      <ConfigField
        label="Descripción"
        value={(action.config.description as string) || ''}
        onChange={(v) => updateField('description', v)}
        placeholder="Descripción detallada de la tarea"
        type="textarea"
      />
      
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-sm">Asignar a</Label>
          <Select
            value={(action.config.assignee as string) || 'assigned'}
            onValueChange={(v) => updateField('assignee', v)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="assigned">Usuario asignado del expediente</SelectItem>
              <SelectItem value="creator">Creador del expediente</SelectItem>
              <SelectItem value="specific">Usuario específico</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-1.5">
          <Label className="text-sm">Prioridad</Label>
          <Select
            value={(action.config.priority as string) || 'medium'}
            onValueChange={(v) => updateField('priority', v)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">🟢 Baja</SelectItem>
              <SelectItem value="medium">🟡 Media</SelectItem>
              <SelectItem value="high">🔴 Alta</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-sm">Fecha límite</Label>
          <Select
            value={(action.config.due_type as string) || 'days'}
            onValueChange={(v) => updateField('due_type', v)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="days">En X días</SelectItem>
              <SelectItem value="deadline">Fecha del plazo</SelectItem>
              <SelectItem value="none">Sin fecha</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {action.config.due_type === 'days' && (
          <div className="space-y-1.5">
            <Label className="text-sm">Días</Label>
            <Input
              type="number"
              min={1}
              value={(action.config.due_days as number) || 3}
              onChange={(e) => updateField('due_days', parseInt(e.target.value))}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// Update Field Action
export function UpdateFieldConfig({ action, onUpdate }: ActionConfigProps) {
  const updateField = (field: string, value: unknown) => {
    onUpdate({ ...action.config, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label className="text-sm">Entidad</Label>
        <Select
          value={(action.config.entity as string) || 'matter'}
          onValueChange={(v) => updateField('entity', v)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="matter">Expediente</SelectItem>
            <SelectItem value="contact">Contacto</SelectItem>
            <SelectItem value="deal">Oportunidad CRM</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <ConfigField
        label="Campo a actualizar"
        value={(action.config.field as string) || ''}
        onChange={(v) => updateField('field', v)}
        placeholder="status, priority, custom_field..."
        required
      />
      
      <ConfigField
        label="Nuevo valor"
        value={(action.config.value as string) || ''}
        onChange={(v) => updateField('value', v)}
        placeholder="Valor o {{variable}}"
        required
      />
    </div>
  );
}

// Delay Action
export function DelayConfig({ action, onUpdate }: ActionConfigProps) {
  const updateField = (field: string, value: unknown) => {
    onUpdate({ ...action.config, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-sm">Duración</Label>
          <Input
            type="number"
            min={1}
            value={(action.config.duration as number) || 1}
            onChange={(e) => updateField('duration', parseInt(e.target.value))}
          />
        </div>
        
        <div className="space-y-1.5">
          <Label className="text-sm">Unidad</Label>
          <Select
            value={(action.config.unit as string) || 'hours'}
            onValueChange={(v) => updateField('unit', v)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="minutes">Minutos</SelectItem>
              <SelectItem value="hours">Horas</SelectItem>
              <SelectItem value="days">Días</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <p className="text-sm text-muted-foreground">
        El workflow esperará {String(action.config.duration || 1)} {String(action.config.unit || 'horas')} antes de continuar con la siguiente acción.
      </p>
    </div>
  );
}

// Webhook Action
export function WebhookConfig({ action, onUpdate }: ActionConfigProps) {
  const updateField = (field: string, value: unknown) => {
    onUpdate({ ...action.config, [field]: value });
  };

  return (
    <div className="space-y-4">
      <ConfigField
        label="URL del Webhook"
        value={(action.config.url as string) || ''}
        onChange={(v) => updateField('url', v)}
        placeholder="https://api.ejemplo.com/webhook"
        required
      />
      
      <div className="space-y-1.5">
        <Label className="text-sm">Método HTTP</Label>
        <Select
          value={(action.config.method as string) || 'POST'}
          onValueChange={(v) => updateField('method', v)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="GET">GET</SelectItem>
            <SelectItem value="POST">POST</SelectItem>
            <SelectItem value="PUT">PUT</SelectItem>
            <SelectItem value="PATCH">PATCH</SelectItem>
            <SelectItem value="DELETE">DELETE</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <ConfigField
        label="Headers (JSON)"
        value={(action.config.headers as string) || '{}'}
        onChange={(v) => updateField('headers', v)}
        placeholder='{"Authorization": "Bearer token"}'
        type="textarea"
      />
      
      <ConfigField
        label="Body (JSON)"
        value={(action.config.body as string) || '{}'}
        onChange={(v) => updateField('body', v)}
        placeholder='{"matter_id": "{{matter.id}}"}'
        type="textarea"
      />
    </div>
  );
}

// AI Generate Action
export function AIGenerateConfig({ action, onUpdate }: ActionConfigProps) {
  const updateField = (field: string, value: unknown) => {
    onUpdate({ ...action.config, [field]: value });
  };

  return (
    <div className="space-y-4">
      <ConfigField
        label="Prompt"
        value={(action.config.prompt as string) || ''}
        onChange={(v) => updateField('prompt', v)}
        placeholder="Genera un resumen del expediente {{matter.title}}..."
        type="textarea"
        required
      />
      
      <div className="space-y-1.5">
        <Label className="text-sm">Modelo de IA</Label>
        <Select
          value={(action.config.model as string) || 'nexus_ops'}
          onValueChange={(v) => updateField('model', v)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="nexus_ops">NEXUS OPS (rápido)</SelectItem>
            <SelectItem value="nexus_legal">NEXUS LEGAL (preciso)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <ConfigField
        label="Guardar resultado en variable"
        value={(action.config.output_variable as string) || ''}
        onChange={(v) => updateField('output_variable', v)}
        placeholder="ai_result"
      />
      
      <p className="text-xs text-muted-foreground">
        El resultado estará disponible como {"{{ai_result}}"} en acciones posteriores
      </p>
    </div>
  );
}

// Main dispatcher component
export function ActionConfigFields({ action, onUpdate }: ActionConfigProps) {
  switch (action.type) {
    case 'send_email':
      return <SendEmailConfig action={action} onUpdate={onUpdate} />;
    case 'send_notification':
      return <SendNotificationConfig action={action} onUpdate={onUpdate} />;
    case 'create_task':
      return <CreateTaskConfig action={action} onUpdate={onUpdate} />;
    case 'update_field':
      return <UpdateFieldConfig action={action} onUpdate={onUpdate} />;
    case 'delay':
      return <DelayConfig action={action} onUpdate={onUpdate} />;
    case 'webhook':
      return <WebhookConfig action={action} onUpdate={onUpdate} />;
    case 'ai_generate':
      return <AIGenerateConfig action={action} onUpdate={onUpdate} />;
    default:
      return (
        <div className="p-3 bg-muted rounded-lg text-sm text-muted-foreground">
          Configuración para "{action.type}" próximamente disponible
        </div>
      );
  }
}
