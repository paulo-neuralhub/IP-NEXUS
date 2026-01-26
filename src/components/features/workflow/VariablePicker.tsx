// =============================================
// IP-NEXUS - VARIABLE PICKER COMPONENT
// Allows inserting dynamic variables into workflow fields
// =============================================

import { useState } from 'react';
import { Variable, Search, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

export interface VariableCategory {
  id: string;
  label: string;
  icon?: string;
  variables: VariableDefinition[];
}

export interface VariableDefinition {
  key: string;
  label: string;
  description?: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'email';
  example?: string;
}

// Available variables organized by category
export const WORKFLOW_VARIABLES: VariableCategory[] = [
  {
    id: 'matter',
    label: 'Expediente',
    variables: [
      { key: 'matter.id', label: 'ID', description: 'ID único del expediente', type: 'string' },
      { key: 'matter.reference', label: 'Referencia', description: 'Número de referencia', type: 'string', example: 'TM-2026-001' },
      { key: 'matter.title', label: 'Título', description: 'Nombre del expediente', type: 'string' },
      { key: 'matter.status', label: 'Estado', description: 'Estado actual', type: 'string', example: 'pending' },
      { key: 'matter.type', label: 'Tipo', description: 'Tipo de expediente', type: 'string', example: 'trademark' },
      { key: 'matter.created_at', label: 'Fecha creación', description: 'Fecha de creación', type: 'date' },
      { key: 'matter.assigned_to.name', label: 'Asignado (nombre)', description: 'Nombre del usuario asignado', type: 'string' },
      { key: 'matter.assigned_to.email', label: 'Asignado (email)', description: 'Email del usuario asignado', type: 'email' },
    ]
  },
  {
    id: 'client',
    label: 'Cliente',
    variables: [
      { key: 'client.id', label: 'ID', description: 'ID del cliente', type: 'string' },
      { key: 'client.name', label: 'Nombre', description: 'Nombre completo', type: 'string', example: 'ACME Corporation' },
      { key: 'client.email', label: 'Email', description: 'Email principal', type: 'email', example: 'contact@acme.com' },
      { key: 'client.phone', label: 'Teléfono', description: 'Teléfono de contacto', type: 'string' },
      { key: 'client.company', label: 'Empresa', description: 'Nombre de la empresa', type: 'string' },
      { key: 'client.country', label: 'País', description: 'País del cliente', type: 'string' },
    ]
  },
  {
    id: 'contact',
    label: 'Contacto',
    variables: [
      { key: 'contact.id', label: 'ID', description: 'ID del contacto', type: 'string' },
      { key: 'contact.name', label: 'Nombre', description: 'Nombre completo', type: 'string' },
      { key: 'contact.email', label: 'Email', description: 'Email del contacto', type: 'email' },
      { key: 'contact.phone', label: 'Teléfono', description: 'Teléfono', type: 'string' },
      { key: 'contact.job_title', label: 'Cargo', description: 'Cargo o puesto', type: 'string' },
    ]
  },
  {
    id: 'deadline',
    label: 'Plazo',
    variables: [
      { key: 'deadline.id', label: 'ID', description: 'ID del plazo', type: 'string' },
      { key: 'deadline.title', label: 'Título', description: 'Nombre del plazo', type: 'string' },
      { key: 'deadline.date', label: 'Fecha', description: 'Fecha de vencimiento', type: 'date' },
      { key: 'deadline.days_remaining', label: 'Días restantes', description: 'Días hasta el vencimiento', type: 'number', example: '7' },
      { key: 'deadline.type', label: 'Tipo', description: 'Tipo de plazo', type: 'string' },
      { key: 'deadline.is_critical', label: 'Es crítico', description: 'Si es un plazo crítico', type: 'boolean' },
    ]
  },
  {
    id: 'deal',
    label: 'Oportunidad (CRM)',
    variables: [
      { key: 'deal.id', label: 'ID', description: 'ID de la oportunidad', type: 'string' },
      { key: 'deal.title', label: 'Título', description: 'Nombre de la oportunidad', type: 'string' },
      { key: 'deal.value', label: 'Valor', description: 'Valor monetario', type: 'number' },
      { key: 'deal.stage', label: 'Etapa', description: 'Etapa actual', type: 'string' },
      { key: 'deal.probability', label: 'Probabilidad', description: 'Probabilidad de cierre (%)', type: 'number' },
    ]
  },
  {
    id: 'invoice',
    label: 'Factura',
    variables: [
      { key: 'invoice.id', label: 'ID', description: 'ID de la factura', type: 'string' },
      { key: 'invoice.number', label: 'Número', description: 'Número de factura', type: 'string', example: 'INV-2026-001' },
      { key: 'invoice.total', label: 'Total', description: 'Importe total', type: 'number' },
      { key: 'invoice.due_date', label: 'Vencimiento', description: 'Fecha de vencimiento', type: 'date' },
      { key: 'invoice.status', label: 'Estado', description: 'Estado de la factura', type: 'string' },
      { key: 'invoice.days_overdue', label: 'Días vencida', description: 'Días desde el vencimiento', type: 'number' },
    ]
  },
  {
    id: 'user',
    label: 'Usuario actual',
    variables: [
      { key: 'current_user.id', label: 'ID', description: 'ID del usuario', type: 'string' },
      { key: 'current_user.name', label: 'Nombre', description: 'Nombre del usuario', type: 'string' },
      { key: 'current_user.email', label: 'Email', description: 'Email del usuario', type: 'email' },
    ]
  },
  {
    id: 'system',
    label: 'Sistema',
    variables: [
      { key: 'today', label: 'Hoy', description: 'Fecha actual', type: 'date' },
      { key: 'tomorrow', label: 'Mañana', description: 'Fecha de mañana', type: 'date' },
      { key: 'next_week', label: 'Próxima semana', description: 'Fecha en 7 días', type: 'date' },
      { key: 'organization.name', label: 'Organización', description: 'Nombre de la organización', type: 'string' },
      { key: 'trigger.timestamp', label: 'Hora del trigger', description: 'Momento en que se disparó', type: 'date' },
      { key: 'trigger.type', label: 'Tipo de trigger', description: 'Tipo del evento disparador', type: 'string' },
    ]
  },
];

interface VariablePickerProps {
  onSelect: (variable: string) => void;
  className?: string;
  buttonLabel?: string;
  disabled?: boolean;
}

export function VariablePicker({ 
  onSelect, 
  className,
  buttonLabel = 'Variables',
  disabled = false
}: VariablePickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // Filter variables by search
  const filteredCategories = WORKFLOW_VARIABLES.map(category => ({
    ...category,
    variables: category.variables.filter(v =>
      !search ||
      v.key.toLowerCase().includes(search.toLowerCase()) ||
      v.label.toLowerCase().includes(search.toLowerCase()) ||
      v.description?.toLowerCase().includes(search.toLowerCase())
    )
  })).filter(category => category.variables.length > 0);

  const handleSelect = (variable: VariableDefinition) => {
    onSelect(`{{${variable.key}}}`);
    setOpen(false);
    setSearch('');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className={cn("gap-1.5", className)}
          disabled={disabled}
        >
          <Variable className="h-3.5 w-3.5" />
          {buttonLabel}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-3 border-b">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar variable..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8"
            />
          </div>
        </div>
        
        <ScrollArea className="h-72">
          {filteredCategories.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground text-sm">
              No se encontraron variables
            </div>
          ) : (
            <div className="p-1">
              {filteredCategories.map(category => (
                <div key={category.id}>
                  <button
                    className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium hover:bg-muted rounded-md"
                    onClick={() => setExpandedCategory(
                      expandedCategory === category.id ? null : category.id
                    )}
                  >
                    <span>{category.label}</span>
                    <ChevronRight className={cn(
                      "h-4 w-4 transition-transform",
                      expandedCategory === category.id && "rotate-90"
                    )} />
                  </button>
                  
                  {(expandedCategory === category.id || search) && (
                    <div className="ml-2 border-l pl-2 mb-2">
                      {category.variables.map(variable => (
                        <button
                          key={variable.key}
                          className="w-full text-left px-3 py-1.5 text-sm hover:bg-muted rounded-md group"
                          onClick={() => handleSelect(variable)}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs text-primary">
                              {`{{${variable.key}}}`}
                            </span>
                          </div>
                          <div className="text-muted-foreground text-xs mt-0.5">
                            {variable.description}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

// Helper component for inputs with variable support
interface VariableInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
}

export function VariableInput({ value, onChange, placeholder, label, className }: VariableInputProps) {
  const handleInsertVariable = (variable: string) => {
    onChange(value + variable);
  };

  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">{label}</label>
          <VariablePicker onSelect={handleInsertVariable} buttonLabel="Insertar" />
        </div>
      )}
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}
