// =====================================================
// IP-NEXUS - CLIENT SETTINGS TAB (PROMPT 27)
// Tab de configuración específica del cliente
// =====================================================

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Bell,
  Mail,
  CreditCard,
  FileText,
  Globe,
  Calendar,
  Building2,
  Save,
  AlertTriangle,
} from 'lucide-react';
import { fromTable } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface ClientSettingsTabProps {
  clientId: string;
}

interface ClientSettings {
  billing_email: string;
  payment_terms: number;
  currency: string;
  tax_rate: number;
  invoice_prefix: string;
  send_reminders: boolean;
  reminder_days_before: number;
  default_language: string;
  portal_access_enabled: boolean;
  auto_generate_reports: boolean;
  report_frequency: string;
}

export function ClientSettingsTab({ clientId }: ClientSettingsTabProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [hasChanges, setHasChanges] = useState(false);

  const { data: client, isLoading } = useQuery({
    queryKey: ['client-settings', clientId],
    queryFn: async () => {
      const { data, error } = await fromTable('crm_accounts')
        .select('id, billing_email, payment_terms, currency, metadata')
        .eq('id', clientId)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const [settings, setSettings] = useState<ClientSettings>({
    billing_email: client?.billing_email || '',
    payment_terms: client?.payment_terms || 30,
    currency: client?.currency || 'EUR',
    tax_rate: client?.metadata?.tax_rate || 21,
    invoice_prefix: client?.metadata?.invoice_prefix || '',
    send_reminders: client?.metadata?.send_reminders ?? true,
    reminder_days_before: client?.metadata?.reminder_days_before || 7,
    default_language: client?.metadata?.default_language || 'es',
    portal_access_enabled: client?.metadata?.portal_access_enabled ?? false,
    auto_generate_reports: client?.metadata?.auto_generate_reports ?? false,
    report_frequency: client?.metadata?.report_frequency || 'monthly',
  });

  const updateSettings = (key: keyof ClientSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const { error } = await fromTable('crm_accounts')
        .update({
          billing_email: settings.billing_email || null,
          payment_terms: settings.payment_terms,
          currency: settings.currency,
          metadata: {
            ...client?.metadata,
            tax_rate: settings.tax_rate,
            invoice_prefix: settings.invoice_prefix,
            send_reminders: settings.send_reminders,
            reminder_days_before: settings.reminder_days_before,
            default_language: settings.default_language,
            portal_access_enabled: settings.portal_access_enabled,
            auto_generate_reports: settings.auto_generate_reports,
            report_frequency: settings.report_frequency,
          },
        })
        .eq('id', clientId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-settings'] });
      toast({ title: 'Configuración guardada' });
      setHasChanges(false);
    },
    onError: () => {
      toast({ title: 'Error al guardar', variant: 'destructive' });
    },
  });

  return (
    <div className="space-y-6">
      {/* Billing Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CreditCard className="w-4 h-4 text-primary" />
            Facturación
          </CardTitle>
          <CardDescription>
            Configuración de facturación y pagos para este cliente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Email de facturación</Label>
              <Input
                type="email"
                value={settings.billing_email}
                onChange={(e) => updateSettings('billing_email', e.target.value)}
                placeholder="facturacion@empresa.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Plazo de pago (días)</Label>
              <Select
                value={settings.payment_terms.toString()}
                onValueChange={(v) => updateSettings('payment_terms', parseInt(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Contado</SelectItem>
                  <SelectItem value="15">15 días</SelectItem>
                  <SelectItem value="30">30 días</SelectItem>
                  <SelectItem value="45">45 días</SelectItem>
                  <SelectItem value="60">60 días</SelectItem>
                  <SelectItem value="90">90 días</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Moneda</Label>
              <Select
                value={settings.currency}
                onValueChange={(v) => updateSettings('currency', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>IVA (%)</Label>
              <Input
                type="number"
                value={settings.tax_rate}
                onChange={(e) => updateSettings('tax_rate', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Prefijo de factura</Label>
              <Input
                value={settings.invoice_prefix}
                onChange={(e) => updateSettings('invoice_prefix', e.target.value)}
                placeholder="INV-CLI001-"
              />
              <p className="text-xs text-muted-foreground">
                Prefijo personalizado para las facturas de este cliente
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="w-4 h-4 text-primary" />
            Notificaciones
          </CardTitle>
          <CardDescription>
            Configuración de recordatorios y alertas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Enviar recordatorios de plazos</Label>
              <p className="text-xs text-muted-foreground">
                Notificar automáticamente al cliente sobre plazos próximos
              </p>
            </div>
            <Switch
              checked={settings.send_reminders}
              onCheckedChange={(v) => updateSettings('send_reminders', v)}
            />
          </div>
          
          {settings.send_reminders && (
            <div className="space-y-2 pl-4 border-l-2 border-primary/20">
              <Label>Días de anticipación</Label>
              <Select
                value={settings.reminder_days_before.toString()}
                onValueChange={(v) => updateSettings('reminder_days_before', parseInt(v))}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 días</SelectItem>
                  <SelectItem value="7">7 días</SelectItem>
                  <SelectItem value="14">14 días</SelectItem>
                  <SelectItem value="30">30 días</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Portal Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Globe className="w-4 h-4 text-primary" />
            Portal del Cliente
          </CardTitle>
          <CardDescription>
            Configuración de acceso al portal de clientes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Acceso al portal habilitado</Label>
              <p className="text-xs text-muted-foreground">
                Permitir que el cliente acceda a su portal para ver expedientes y documentos
              </p>
            </div>
            <Switch
              checked={settings.portal_access_enabled}
              onCheckedChange={(v) => updateSettings('portal_access_enabled', v)}
            />
          </div>

          <Separator />
          
          <div className="space-y-2">
            <Label>Idioma preferido</Label>
            <Select
              value={settings.default_language}
              onValueChange={(v) => updateSettings('default_language', v)}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="de">Deutsch</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="w-4 h-4 text-primary" />
            Informes Automáticos
          </CardTitle>
          <CardDescription>
            Configuración de generación automática de informes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Generar informes automáticamente</Label>
              <p className="text-xs text-muted-foreground">
                Crear y enviar informes periódicos del estado de la cartera
              </p>
            </div>
            <Switch
              checked={settings.auto_generate_reports}
              onCheckedChange={(v) => updateSettings('auto_generate_reports', v)}
            />
          </div>

          {settings.auto_generate_reports && (
            <div className="space-y-2 pl-4 border-l-2 border-primary/20">
              <Label>Frecuencia</Label>
              <Select
                value={settings.report_frequency}
                onValueChange={(v) => updateSettings('report_frequency', v)}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Semanal</SelectItem>
                  <SelectItem value="monthly">Mensual</SelectItem>
                  <SelectItem value="quarterly">Trimestral</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      {hasChanges && (
        <div className="sticky bottom-4 flex justify-end">
          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
            <Save className="w-4 h-4 mr-2" />
            {saveMutation.isPending ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </div>
      )}
    </div>
  );
}
