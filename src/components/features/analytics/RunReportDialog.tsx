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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Play, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';

interface RunReportDialogProps {
  report: any;
  open: boolean;
  onClose: () => void;
  onRun: (params: Record<string, unknown>) => void;
  isLoading?: boolean;
}

export function RunReportDialog({ report, open, onClose, onRun, isLoading }: RunReportDialogProps) {
  const [params, setParams] = useState<Record<string, unknown>>({});
  const { currentOrganization } = useOrganization();
  
  const { data: contacts } = useQuery({
    queryKey: ['contacts-for-select', currentOrganization?.id],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];
      const { data } = await supabase
        .from('contacts')
        .select('id, name, type')
        .eq('organization_id', currentOrganization.id)
        .eq('type', 'company');
      return data || [];
    },
    enabled: !!currentOrganization?.id
  });

  if (!report) return null;

  const parameters = report.config?.parameters || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRun(params);
  };

  const renderParameterInput = (param: any) => {
    switch (param.type) {
      case 'date':
        return (
          <Input
            type="date"
            value={(params[param.key] as string) || ''}
            onChange={(e) => setParams({ ...params, [param.key]: e.target.value })}
          />
        );
      
      case 'number':
        return (
          <Input
            type="number"
            value={(params[param.key] as string) || param.default || ''}
            onChange={(e) => setParams({ ...params, [param.key]: e.target.value })}
            placeholder={param.placeholder}
          />
        );
      
      case 'client_select':
        return (
          <Select
            value={(params[param.key] as string) || ''}
            onValueChange={(value) => setParams({ ...params, [param.key]: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar cliente" />
            </SelectTrigger>
            <SelectContent>
              {contacts?.map((contact) => (
                <SelectItem key={contact.id} value={contact.id}>
                  {contact.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case 'select':
        return (
          <Select
            value={(params[param.key] as string) || ''}
            onValueChange={(value) => setParams({ ...params, [param.key]: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder={param.placeholder || 'Seleccionar'} />
            </SelectTrigger>
            <SelectContent>
              {param.options?.map((opt: any) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      default:
        return (
          <Input
            value={(params[param.key] as string) || ''}
            onChange={(e) => setParams({ ...params, [param.key]: e.target.value })}
            placeholder={param.placeholder}
          />
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Generar: {report.name}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {parameters.map((param: any) => (
            <div key={param.key} className="space-y-2">
              <Label htmlFor={param.key}>
                {param.label}
                {param.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              {renderParameterInput(param)}
              {param.description && (
                <p className="text-xs text-muted-foreground">{param.description}</p>
              )}
            </div>
          ))}

          {parameters.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Este reporte no requiere parámetros adicionales.
            </p>
          )}

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              Generar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
