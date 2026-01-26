import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Mail, 
  Phone, 
  MessageSquare, 
  MessageCircle,
  Plus,
  Check,
  X,
  AlertCircle,
  Trash2,
  MoreVertical,
  RefreshCw,
  ExternalLink,
  Shield,
  Settings,
  Globe,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { Database } from '@/integrations/supabase/types';

type CommChannel = Database['public']['Enums']['comm_channel'];

interface CommunicationChannel {
  id: string;
  organization_id: string;
  channel: CommChannel;
  config: Record<string, unknown> | null;
  credentials_encrypted: string | null;
  is_active: boolean | null;
  sync_status: string | null;
  last_sync_at: string | null;
  created_at: string | null;
  created_by: string | null;
}

const CHANNEL_CONFIG: Record<CommChannel, {
  icon: typeof Mail;
  color: string;
  label: string;
  description: string;
  configurable: boolean;
  providers?: { value: string; label: string }[];
}> = {
  email: {
    icon: Mail,
    color: 'hsl(var(--primary))',
    label: 'Email',
    description: 'Configuración SMTP/IMAP para emails',
    configurable: true,
    providers: [
      { value: 'smtp', label: 'SMTP Personalizado' },
      { value: 'gmail', label: 'Gmail API' },
      { value: 'outlook', label: 'Microsoft 365' },
    ],
  },
  whatsapp: {
    icon: MessageCircle,
    color: '#25D366',
    label: 'WhatsApp',
    description: 'WhatsApp Business API o Web QR',
    configurable: true,
    providers: [
      { value: 'meta_api', label: 'Meta Cloud API' },
      { value: 'web_qr', label: 'Web QR (n8n)' },
    ],
  },
  phone: {
    icon: Phone,
    color: '#8B5CF6',
    label: 'Teléfono',
    description: 'VoIP con Twilio u otro proveedor',
    configurable: true,
    providers: [
      { value: 'twilio', label: 'Twilio' },
      { value: 'vonage', label: 'Vonage' },
    ],
  },
  sms: {
    icon: MessageSquare,
    color: '#F59E0B',
    label: 'SMS',
    description: 'Mensajes de texto SMS',
    configurable: true,
    providers: [
      { value: 'twilio', label: 'Twilio' },
    ],
  },
  portal: {
    icon: Globe,
    color: '#0EA5E9',
    label: 'Portal Cliente',
    description: 'Mensajes desde el portal de clientes',
    configurable: false,
  },
  in_person: {
    icon: Users,
    color: '#10B981',
    label: 'Presencial',
    description: 'Registro de comunicaciones presenciales',
    configurable: false,
  },
  other: {
    icon: MessageSquare,
    color: '#6B7280',
    label: 'Otro',
    description: 'Otros canales de comunicación',
    configurable: false,
  },
};

export default function CommunicationsSettingsPage() {
  const { currentOrganization } = useOrganization();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [addingChannelType, setAddingChannelType] = useState<CommChannel | null>(null);
  const [editingChannel, setEditingChannel] = useState<CommunicationChannel | null>(null);

  // Fetch channels
  const { data: channels, isLoading } = useQuery({
    queryKey: ['communication-channels', currentOrganization?.id],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];
      const { data, error } = await supabase
        .from('communication_channels')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .order('channel');
      if (error) throw error;
      return data as CommunicationChannel[];
    },
    enabled: !!currentOrganization?.id,
  });

  // Delete channel
  const deleteChannel = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('communication_channels')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communication-channels'] });
      toast.success('Canal eliminado');
    },
    onError: (error: Error) => {
      toast.error('Error: ' + error.message);
    },
  });

  // Toggle active status
  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('communication_channels')
        .update({ is_active })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communication-channels'] });
      toast.success('Estado actualizado');
    },
  });

  // Group channels by type
  const channelsByType = channels?.reduce((acc, ch) => {
    if (!acc[ch.channel]) acc[ch.channel] = [];
    acc[ch.channel].push(ch);
    return acc;
  }, {} as Record<CommChannel, CommunicationChannel[]>);

  const handleAddChannel = (type: CommChannel) => {
    setAddingChannelType(type);
    setIsAddDialogOpen(true);
  };

  // Configurable channels only
  const configurableChannels = Object.entries(CHANNEL_CONFIG).filter(
    ([, config]) => config.configurable
  ) as [CommChannel, typeof CHANNEL_CONFIG[CommChannel]][];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-xl font-semibold text-foreground">Configuración de Canales</h2>
        <p className="text-sm text-muted-foreground">
          Configura los canales de comunicación para tu organización
        </p>
      </div>

      {/* Grid of channel types */}
      <div className="grid gap-4 md:grid-cols-2">
        {configurableChannels.map(([type, config]) => {
          const Icon = config.icon;
          const typeChannels = channelsByType?.[type] || [];

          return (
            <Card key={type} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-lg"
                      style={{ backgroundColor: `${config.color}15` }}
                    >
                      <Icon className="h-5 w-5" style={{ color: config.color }} />
                    </div>
                    <div>
                      <CardTitle className="text-base">{config.label}</CardTitle>
                      <CardDescription className="text-xs">{config.description}</CardDescription>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAddChannel(type)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Añadir
                  </Button>
                </div>
              </CardHeader>

              <CardContent>
                {typeChannels.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <Icon className="h-8 w-8 text-muted-foreground/30 mb-2" />
                    <p className="text-sm text-muted-foreground">Sin configurar</p>
                    <Button
                      variant="link"
                      size="sm"
                      className="mt-1"
                      onClick={() => handleAddChannel(type)}
                    >
                      Configurar ahora
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {typeChannels.map((channel) => (
                      <ChannelRow
                        key={channel.id}
                        channel={channel}
                        config={config}
                        onEdit={() => setEditingChannel(channel)}
                        onDelete={() => deleteChannel.mutate(channel.id)}
                        onToggleActive={(active) => toggleActive.mutate({ id: channel.id, is_active: active })}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Security info */}
      <Card className="bg-muted/30 border-muted">
        <CardContent className="flex items-start gap-3 pt-4">
          <Shield className="h-5 w-5 text-primary mt-0.5" />
          <div>
            <h4 className="font-medium text-sm">Seguridad de credenciales</h4>
            <p className="text-xs text-muted-foreground mt-1">
              Todas las credenciales se almacenan de forma segura y encriptada. 
              Nunca compartimos tus datos con terceros.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Add Channel Dialog */}
      <AddChannelDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        channelType={addingChannelType}
        organizationId={currentOrganization?.id}
      />

      {/* Edit Channel Dialog */}
      {editingChannel && (
        <EditChannelDialog
          open={!!editingChannel}
          onOpenChange={(open) => !open && setEditingChannel(null)}
          channel={editingChannel}
        />
      )}
    </div>
  );
}

// =============================================
// Channel Row Component
// =============================================

interface ChannelRowProps {
  channel: CommunicationChannel;
  config: typeof CHANNEL_CONFIG[CommChannel];
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: (active: boolean) => void;
}

function ChannelRow({ channel, config, onEdit, onDelete, onToggleActive }: ChannelRowProps) {
  const syncStatusConfig: Record<string, { icon: typeof Check; color: string; label: string }> = {
    connected: { icon: Check, color: 'text-green-500', label: 'Conectado' },
    syncing: { icon: RefreshCw, color: 'text-blue-500', label: 'Sincronizando' },
    error: { icon: X, color: 'text-destructive', label: 'Error' },
    pending: { icon: AlertCircle, color: 'text-amber-500', label: 'Pendiente' },
  };

  const status = syncStatusConfig[channel.sync_status || 'pending'] || syncStatusConfig.pending;
  const StatusIcon = status.icon;
  const providerLabel = (config.providers?.find(p => p.value === (channel.config as Record<string, unknown>)?.provider)?.label) 
    || (channel.config as Record<string, unknown>)?.provider as string 
    || 'Sin proveedor';

  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card p-3 hover:bg-muted/30 transition-colors">
      {/* Status indicator */}
      <StatusIcon className={cn('h-4 w-4 shrink-0', status.color)} />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium truncate">
            {providerLabel}
          </span>
          {channel.is_active && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              Activo
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {channel.last_sync_at 
            ? `Última sync: ${new Date(channel.last_sync_at).toLocaleDateString('es-ES')}`
            : 'Sin sincronizar'
          }
        </p>
      </div>

      {/* Active toggle */}
      <Switch
        checked={channel.is_active || false}
        onCheckedChange={onToggleActive}
        className="shrink-0"
      />

      {/* Actions */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-popover">
          <DropdownMenuItem onClick={onEdit}>
            <Settings className="h-4 w-4 mr-2" />
            Configurar
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onDelete} className="text-destructive">
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// =============================================
// Add Channel Dialog
// =============================================

interface AddChannelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  channelType: CommChannel | null;
  organizationId?: string;
}

function AddChannelDialog({ open, onOpenChange, channelType, organizationId }: AddChannelDialogProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    provider: '',
    config: {} as Record<string, string>,
  });
  const [isSaving, setIsSaving] = useState(false);

  if (!channelType) return null;

  const config = CHANNEL_CONFIG[channelType];
  const Icon = config.icon;

  // Config fields based on provider
  const getConfigFields = (): { key: string; label: string; type: string; placeholder?: string; required?: boolean }[] => {
    const provider = formData.provider || config.providers?.[0]?.value;
    
    switch (provider) {
      case 'smtp':
        return [
          { key: 'host', label: 'Host SMTP', type: 'text', placeholder: 'smtp.ejemplo.com', required: true },
          { key: 'port', label: 'Puerto', type: 'text', placeholder: '587', required: true },
          { key: 'username', label: 'Usuario', type: 'text', required: true },
          { key: 'password', label: 'Contraseña', type: 'password', required: true },
          { key: 'from_email', label: 'Email remitente', type: 'email', placeholder: 'noreply@empresa.com', required: true },
          { key: 'from_name', label: 'Nombre remitente', type: 'text', placeholder: 'Mi Empresa' },
        ];
      case 'gmail':
      case 'outlook':
        return [
          { key: 'client_id', label: 'Client ID', type: 'text', required: true },
          { key: 'client_secret', label: 'Client Secret', type: 'password', required: true },
          { key: 'from_email', label: 'Email remitente', type: 'email', required: true },
        ];
      case 'meta_api':
        return [
          { key: 'phone_number_id', label: 'Phone Number ID', type: 'text', required: true },
          { key: 'access_token', label: 'Access Token', type: 'password', required: true },
          { key: 'business_id', label: 'Business Account ID', type: 'text' },
          { key: 'verify_token', label: 'Webhook Verify Token', type: 'text' },
        ];
      case 'web_qr':
        return [
          { key: 'n8n_webhook_url', label: 'n8n Webhook URL', type: 'text', placeholder: 'https://n8n.ejemplo.com/webhook/...' },
        ];
      case 'twilio':
        return [
          { key: 'account_sid', label: 'Account SID', type: 'text', placeholder: 'ACxxxxxxxx', required: true },
          { key: 'auth_token', label: 'Auth Token', type: 'password', required: true },
          { key: 'phone_number', label: 'Número de teléfono', type: 'text', placeholder: '+34612345678' },
        ];
      case 'vonage':
        return [
          { key: 'api_key', label: 'API Key', type: 'text', required: true },
          { key: 'api_secret', label: 'API Secret', type: 'password', required: true },
          { key: 'phone_number', label: 'Número de teléfono', type: 'text' },
        ];
      default:
        return [];
    }
  };

  const handleSave = async () => {
    if (!organizationId) {
      toast.error('No se pudo obtener la organización');
      return;
    }

    const provider = formData.provider || config.providers?.[0]?.value;
    const fields = getConfigFields();
    const requiredFields = fields.filter(f => f.required);
    
    for (const field of requiredFields) {
      if (!formData.config[field.key]) {
        toast.error(`El campo "${field.label}" es requerido`);
        return;
      }
    }

    setIsSaving(true);

    try {
      const { error } = await supabase
        .from('communication_channels')
        .insert({
          organization_id: organizationId,
          channel: channelType,
          config: {
            provider,
            ...formData.config,
          },
          is_active: false,
          sync_status: 'pending',
        });

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['communication-channels'] });
      toast.success('Canal añadido correctamente');
      onOpenChange(false);
      setFormData({ provider: '', config: {} });
    } catch (error) {
      toast.error('Error: ' + (error as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${config.color}15` }}
            >
              <Icon className="h-4 w-4" style={{ color: config.color }} />
            </div>
            Añadir {config.label}
          </DialogTitle>
          <DialogDescription>
            {config.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Provider select */}
          {config.providers && config.providers.length > 1 && (
            <div className="space-y-2">
              <Label>Proveedor</Label>
              <Select
                value={formData.provider || config.providers[0]?.value}
                onValueChange={(v) => setFormData({ provider: v, config: {} })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {config.providers.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Config fields */}
          {getConfigFields().map((field) => (
            <div key={field.key} className="space-y-2">
              <Label>
                {field.label}
                {field.required && <span className="text-destructive ml-1">*</span>}
              </Label>
              <Input
                type={field.type}
                value={formData.config[field.key] || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  config: { ...formData.config, [field.key]: e.target.value }
                })}
                placeholder={field.placeholder}
              />
            </div>
          ))}

          {/* Documentation link */}
          <a
            href="https://docs.ip-nexus.com/integraciones"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            <ExternalLink className="h-4 w-4" />
            Ver guía de configuración
          </a>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// =============================================
// Edit Channel Dialog
// =============================================

interface EditChannelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  channel: CommunicationChannel;
}

function EditChannelDialog({ open, onOpenChange, channel }: EditChannelDialogProps) {
  const queryClient = useQueryClient();
  const config = CHANNEL_CONFIG[channel.channel];
  const Icon = config.icon;
  
  const channelConfig = (channel.config || {}) as Record<string, string>;
  const [formData, setFormData] = useState<Record<string, string>>({ ...channelConfig });
  const [isSaving, setIsSaving] = useState(false);

  const getConfigFields = (): { key: string; label: string; type: string; placeholder?: string }[] => {
    const provider = channelConfig.provider;
    
    switch (provider) {
      case 'smtp':
        return [
          { key: 'host', label: 'Host SMTP', type: 'text' },
          { key: 'port', label: 'Puerto', type: 'text' },
          { key: 'username', label: 'Usuario', type: 'text' },
          { key: 'password', label: 'Contraseña', type: 'password' },
          { key: 'from_email', label: 'Email remitente', type: 'email' },
          { key: 'from_name', label: 'Nombre remitente', type: 'text' },
        ];
      case 'meta_api':
        return [
          { key: 'phone_number_id', label: 'Phone Number ID', type: 'text' },
          { key: 'access_token', label: 'Access Token', type: 'password' },
          { key: 'business_id', label: 'Business Account ID', type: 'text' },
          { key: 'verify_token', label: 'Webhook Verify Token', type: 'text' },
        ];
      case 'twilio':
        return [
          { key: 'account_sid', label: 'Account SID', type: 'text' },
          { key: 'auth_token', label: 'Auth Token', type: 'password' },
          { key: 'phone_number', label: 'Número de teléfono', type: 'text' },
        ];
      default:
        return Object.keys(channelConfig)
          .filter(k => k !== 'provider')
          .map(k => ({ key: k, label: k, type: 'text' }));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const { error } = await supabase
        .from('communication_channels')
        .update({
          config: { 
            provider: channelConfig.provider,
            ...formData 
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', channel.id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['communication-channels'] });
      toast.success('Canal actualizado');
      onOpenChange(false);
    } catch (error) {
      toast.error('Error: ' + (error as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5" style={{ color: config.color }} />
            Editar {config.label}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Provider (read-only) */}
          <div className="space-y-2">
            <Label>Proveedor</Label>
            <Input
              value={config.providers?.find(p => p.value === channelConfig.provider)?.label || channelConfig.provider || 'Desconocido'}
              disabled
              className="bg-muted"
            />
          </div>

          {/* Config fields */}
          {getConfigFields().map((field) => (
            <div key={field.key} className="space-y-2">
              <Label>{field.label}</Label>
              <Input
                type={field.type}
                value={formData[field.key] || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  [field.key]: e.target.value
                })}
                placeholder={field.placeholder}
              />
            </div>
          ))}

          {/* Sync status */}
          {channel.sync_status === 'error' && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3">
              <p className="text-sm font-medium text-destructive">Error de sincronización</p>
              <p className="text-xs text-muted-foreground mt-1">
                Verifica las credenciales e intenta de nuevo
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
