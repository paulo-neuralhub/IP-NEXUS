// ============================================================
// IP-NEXUS HELP - TICKET FORM COMPONENT
// ============================================================

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Upload, X, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useCreateSupportTicket } from '@/hooks/help';
import { CreateTicketForm } from '@/types/help';

const formSchema = z.object({
  subject: z.string().min(5, 'El asunto debe tener al menos 5 caracteres'),
  description: z.string().min(20, 'Describe el problema con al menos 20 caracteres'),
  category: z.enum(['bug', 'feature_request', 'question', 'billing', 'account', 'other']),
  priority: z.enum(['low', 'normal', 'high', 'urgent']),
  affected_module: z.string().optional(),
});

const categoryOptions = [
  { value: 'bug', label: '🐛 Error/Bug' },
  { value: 'feature_request', label: '✨ Solicitud de función' },
  { value: 'question', label: '❓ Pregunta' },
  { value: 'billing', label: '💳 Facturación' },
  { value: 'account', label: '👤 Cuenta' },
  { value: 'other', label: '📌 Otro' },
];

const priorityOptions = [
  { value: 'low', label: 'Baja' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'Alta' },
  { value: 'urgent', label: 'Urgente' },
];

const moduleOptions = [
  { value: 'docket', label: 'Docket' },
  { value: 'spider', label: 'Spider' },
  { value: 'genius', label: 'Genius' },
  { value: 'crm', label: 'CRM' },
  { value: 'finance', label: 'Finance' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'dashboard', label: 'Dashboard' },
  { value: 'settings', label: 'Configuración' },
  { value: 'other', label: 'Otro' },
];

interface TicketFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function TicketForm({ onSuccess, onCancel }: TicketFormProps) {
  const [files, setFiles] = useState<File[]>([]);
  const createTicket = useCreateSupportTicket();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subject: '',
      description: '',
      category: 'question',
      priority: 'normal',
      affected_module: '',
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    const ticketData: CreateTicketForm = {
      subject: data.subject,
      description: data.description,
      category: data.category,
      priority: data.priority,
      affected_module: data.affected_module,
      attachments: files,
    };

    await createTicket.mutateAsync(ticketData);
    onSuccess?.();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...newFiles].slice(0, 5)); // Max 5 files
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Asunto</FormLabel>
              <FormControl>
                <Input placeholder="Describe brevemente el problema..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoría</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categoryOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prioridad</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {priorityOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="affected_module"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Módulo afectado</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Opcional..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {moduleOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe el problema en detalle. Incluye pasos para reproducirlo si aplica..."
                  className="min-h-[150px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Cuanta más información proporciones, más rápido podremos ayudarte.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* File attachments */}
        <div>
          <Label>Adjuntos (opcional)</Label>
          <div className="mt-2">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('file-upload')?.click()}
                disabled={files.length >= 5}
              >
                <Upload className="h-4 w-4 mr-2" />
                Adjuntar archivo
              </Button>
              <span className="text-sm text-muted-foreground">
                {files.length}/5 archivos
              </span>
            </div>
            <input
              id="file-upload"
              type="file"
              multiple
              className="hidden"
              onChange={handleFileChange}
              accept="image/*,.pdf,.doc,.docx,.txt,.csv"
            />

            {files.length > 0 && (
              <div className="mt-3 space-y-2">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 rounded bg-muted"
                  >
                    <Paperclip className="h-4 w-4 text-muted-foreground" />
                    <span className="flex-1 text-sm truncate">{file.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          )}
          <Button type="submit" disabled={createTicket.isPending}>
            {createTicket.isPending && (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            )}
            Enviar ticket
          </Button>
        </div>
      </form>
    </Form>
  );
}
