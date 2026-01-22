import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Mail, Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';

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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface EmailTemplate {
  id: string;
  organization_id: string;
  code: string;
  name: string;
  category: string | null;
  subject: string | null;
  body_html: string | null;
  is_active: boolean | null;
}

interface SendEmailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact?: {
    id: string;
    email?: string | null;
    full_name: string;
  };
  dealId?: string;
}

export function SendEmailModal({ open, onOpenChange, contact, dealId }: SendEmailModalProps) {
  const { currentOrganization } = useOrganization();
  const qc = useQueryClient();

  const [mode, setMode] = useState<'template' | 'custom'>('template');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [toEmail, setToEmail] = useState(contact?.email || '');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  useEffect(() => {
    setToEmail(contact?.email || '');
  }, [contact?.email, open]);

  const { data: templates = [] } = useQuery({
    queryKey: ['email-templates', currentOrganization?.id],
    queryFn: async () => {
      if (!currentOrganization?.id) return [] as EmailTemplate[];

      const { data, error } = await supabase
        .from('crm_email_templates')
        .select('id, organization_id, code, name, category, subject, body_html, is_active')
        .eq('organization_id', currentOrganization.id)
        .eq('is_active', true)
        .order('category', { ascending: true })
        .order('name', { ascending: true });
      if (error) throw error;
      return (data ?? []) as EmailTemplate[];
    },
    enabled: !!currentOrganization?.id && open,
  });

  const replaceVariables = (text: string): string => {
    if (!text) return '';
    const firstName = contact?.full_name?.split(' ')?.[0] || '';
    return text
      .replace(/\{\{contact\.first_name\}\}/g, firstName)
      .replace(/\{\{contact\.full_name\}\}/g, contact?.full_name || '')
      .replace(/\{\{organization\.name\}\}/g, currentOrganization?.name || '');
  };

  const templatesByCategory = useMemo(() => {
    return templates.reduce<Record<string, EmailTemplate[]>>((acc, t) => {
      const cat = t.category || 'general';
      acc[cat] = acc[cat] || [];
      acc[cat].push(t);
      return acc;
    }, {});
  }, [templates]);

  const handleTemplateSelect = (code: string) => {
    setSelectedTemplate(code);
    const template = templates.find((t) => t.code === code);
    if (!template) return;
    setSubject(replaceVariables(template.subject || ''));
    setBody(replaceVariables(template.body_html || ''));
  };

  const resetForm = () => {
    setMode('template');
    setSelectedTemplate('');
    setSubject('');
    setBody('');
    setToEmail(contact?.email || '');
  };

  const sendMutation = useMutation({
    mutationFn: async () => {
      if (!currentOrganization?.id) throw new Error('No organization');

      const { error, data } = await supabase.functions.invoke('send-email', {
        body: {
          to: toEmail,
          subject,
          html: body,
          organization_id: currentOrganization.id,
          contact_id: contact?.id,
          deal_id: dealId,
          template_code: mode === 'template' ? selectedTemplate : undefined,
        },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any)?.message || (data as any)?.error);
    },
    onSuccess: () => {
      toast.success('Email enviado correctamente');
      qc.invalidateQueries({ queryKey: ['crm-interactions'] });
      qc.invalidateQueries({ queryKey: ['email-tracking'] });
      qc.invalidateQueries({ queryKey: ['communication-history'] });
      onOpenChange(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast.error(`Error al enviar email: ${error.message}`);
    },
  });

  const canSend = !!toEmail && !!subject && !!body && (mode === 'custom' || !!selectedTemplate);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Enviar Email
          </DialogTitle>
        </DialogHeader>

        <Tabs value={mode} onValueChange={(v) => setMode(v as 'template' | 'custom')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="template">Usar plantilla</TabsTrigger>
            <TabsTrigger value="custom">Email personalizado</TabsTrigger>
          </TabsList>

          <TabsContent value="template" className="space-y-3 mt-4">
            <div className="space-y-2">
              <Label>Seleccionar plantilla</Label>
              <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Elige una plantilla" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(templatesByCategory).map(([category, items]) => (
                    <div key={category} className="px-2 py-1">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-2 py-1">
                        {category}
                      </p>
                      {items.map((t) => (
                        <SelectItem key={t.id} value={t.code}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </div>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="custom" className="mt-4" />
        </Tabs>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Para</Label>
            <Input value={toEmail} onChange={(e) => setToEmail(e.target.value)} placeholder="email@ejemplo.com" />
          </div>
          <div className="space-y-2">
            <Label>Asunto</Label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Asunto del email" />
          </div>
          <div className="space-y-2">
            <Label>Mensaje</Label>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Escribe tu mensaje…"
              rows={10}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Variables: {'{{contact.first_name}}'}, {'{{contact.full_name}}'}, {'{{organization.name}}'}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              resetForm();
            }}
          >
            Cancelar
          </Button>
          <Button onClick={() => sendMutation.mutate()} disabled={!canSend || sendMutation.isPending}>
            {sendMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enviando…
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Enviar Email
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
