import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Key, Plus, Eye, EyeOff, Trash2, Edit, 
  CheckCircle, XCircle, RefreshCw, Shield,
  CreditCard, Mail, Globe, Database, Zap
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Tipos
interface SystemApiKey {
  id: string;
  provider: string;
  name: string;
  api_key_masked: string;
  api_key_encrypted?: string;
  environment: 'production' | 'sandbox' | 'test';
  is_active: boolean;
  last_used_at?: string;
  last_verified_at?: string;
  verification_status: 'pending' | 'valid' | 'invalid' | 'expired';
  metadata: Record<string, any>;
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

// Configuración de proveedores
const API_PROVIDERS = [
  { 
    code: 'stripe', 
    name: 'Stripe', 
    icon: CreditCard,
    color: 'bg-purple-100 text-purple-700',
    description: 'Pagos y suscripciones',
    requiredKeys: ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET'],
    docUrl: 'https://stripe.com/docs/keys'
  },
  { 
    code: 'resend', 
    name: 'Resend', 
    icon: Mail,
    color: 'bg-blue-100 text-blue-700',
    description: 'Envío de emails transaccionales',
    requiredKeys: ['RESEND_API_KEY'],
    docUrl: 'https://resend.com/docs/api-reference/api-keys'
  },
  { 
    code: 'openai', 
    name: 'OpenAI', 
    icon: Zap,
    color: 'bg-green-100 text-green-700',
    description: 'IA y procesamiento de lenguaje',
    requiredKeys: ['OPENAI_API_KEY'],
    docUrl: 'https://platform.openai.com/api-keys'
  },
  { 
    code: 'anthropic', 
    name: 'Anthropic', 
    icon: Zap,
    color: 'bg-orange-100 text-orange-700',
    description: 'Claude AI',
    requiredKeys: ['ANTHROPIC_API_KEY'],
    docUrl: 'https://console.anthropic.com/settings/keys'
  },
  { 
    code: 'euipo', 
    name: 'EUIPO', 
    icon: Globe,
    color: 'bg-indigo-100 text-indigo-700',
    description: 'Oficina de PI de la UE',
    requiredKeys: ['EUIPO_API_KEY', 'EUIPO_API_SECRET'],
    docUrl: 'https://euipo.europa.eu'
  },
  { 
    code: 'wipo', 
    name: 'WIPO', 
    icon: Globe,
    color: 'bg-cyan-100 text-cyan-700',
    description: 'Organización Mundial de PI',
    requiredKeys: ['WIPO_API_KEY'],
    docUrl: 'https://www.wipo.int'
  },
  { 
    code: 'tmview', 
    name: 'TMView', 
    icon: Database,
    color: 'bg-teal-100 text-teal-700',
    description: 'Base de datos de marcas',
    requiredKeys: ['TMVIEW_API_KEY'],
    docUrl: 'https://www.tmdn.org/tmview'
  },
  { 
    code: 'other', 
    name: 'Otro', 
    icon: Key,
    color: 'bg-gray-100 text-gray-700',
    description: 'API personalizada',
    requiredKeys: [],
    docUrl: ''
  },
];

export default function AdminApiKeysPage() {
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<SystemApiKey | null>(null);
  const [deletingKey, setDeletingKey] = useState<SystemApiKey | null>(null);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  
  // Form state
  const [formData, setFormData] = useState({
    provider: '',
    name: '',
    api_key: '',
    environment: 'production' as 'production' | 'sandbox' | 'test',
    notes: '',
  });

  // Query API keys from system_settings
  const { data: apiKeys, isLoading } = useQuery({
    queryKey: ['admin-api-keys'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .eq('category', 'api_keys')
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform to our format
      return (data || []).map(setting => {
        const value = setting.value as Record<string, any> | null;
        return {
          id: setting.id,
          provider: value?.provider || 'other',
          name: setting.key,
          api_key_masked: maskApiKey(value?.api_key || ''),
          api_key_encrypted: value?.api_key,
          environment: value?.environment || 'production',
          is_active: value?.is_active ?? true,
          last_used_at: value?.last_used_at,
          last_verified_at: value?.last_verified_at,
          verification_status: value?.verification_status || 'pending',
          metadata: value?.metadata || {},
          notes: value?.notes,
          created_at: setting.updated_at || new Date().toISOString(),
          updated_at: setting.updated_at || new Date().toISOString(),
          created_by: setting.updated_by,
        } as SystemApiKey;
      });
    },
  });

  // Add/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData & { id?: string }) => {
      const settingValue = {
        provider: data.provider,
        api_key: data.api_key,
        environment: data.environment,
        is_active: true,
        verification_status: 'pending',
        notes: data.notes,
        updated_at: new Date().toISOString(),
      };

      if (data.id) {
        // Update existing
        const { error } = await supabase
          .from('system_settings')
          .update({
            value: settingValue,
            updated_at: new Date().toISOString(),
          })
          .eq('id', data.id);
        if (error) throw error;
      } else {
        // Create new
        const { error } = await supabase
          .from('system_settings')
          .insert({
            key: data.name,
            value: settingValue,
            category: 'api_keys',
            description: `API Key para ${data.provider}`,
            value_type: 'secret',
            is_required: false,
            is_public: false,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-api-keys'] });
      toast.success(editingKey ? 'API Key actualizada' : 'API Key añadida');
      handleCloseModal();
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('system_settings')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-api-keys'] });
      toast.success('API Key eliminada');
      setDeletingKey(null);
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  // Toggle active status
  const toggleMutation = useMutation({
    mutationFn: async ({ id, currentValue }: { id: string; currentValue: any }) => {
      const { error } = await supabase
        .from('system_settings')
        .update({
          value: { ...currentValue, is_active: !currentValue.is_active },
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-api-keys'] });
      toast.success('Estado actualizado');
    },
  });

  function maskApiKey(key: string): string {
    if (!key || key.length < 8) return '••••••••';
    return key.substring(0, 4) + '••••••••' + key.substring(key.length - 4);
  }

  function handleCloseModal() {
    setIsAddModalOpen(false);
    setEditingKey(null);
    setFormData({
      provider: '',
      name: '',
      api_key: '',
      environment: 'production',
      notes: '',
    });
  }

  function handleEdit(key: SystemApiKey) {
    setEditingKey(key);
    setFormData({
      provider: key.provider,
      name: key.name,
      api_key: '', // Don't show actual key
      environment: key.environment,
      notes: key.notes || '',
    });
    setIsAddModalOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    saveMutation.mutate({
      ...formData,
      id: editingKey?.id,
    });
  }

  function getProviderConfig(code: string) {
    return API_PROVIDERS.find(p => p.code === code) || API_PROVIDERS[API_PROVIDERS.length - 1];
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case 'valid':
        return <Badge className="bg-green-100 text-green-700"><CheckCircle className="w-3 h-3 mr-1" />Válida</Badge>;
      case 'invalid':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Inválida</Badge>;
      case 'expired':
        return <Badge className="bg-orange-100 text-orange-700">Expirada</Badge>;
      default:
        return <Badge variant="outline">Pendiente</Badge>;
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Key className="w-6 h-6 text-primary" />
            API Keys
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestiona las claves API del sistema (Stripe, Resend, IA, etc.)
          </p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Añadir API Key
        </Button>
      </div>

      {/* Resumen de proveedores */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {API_PROVIDERS.slice(0, 4).map(provider => {
          const Icon = provider.icon;
          const configured = apiKeys?.filter(k => k.provider === provider.code).length || 0;
          return (
            <Card key={provider.code} className="border-l-4" style={{ borderLeftColor: provider.color.includes('purple') ? '#9333EA' : provider.color.includes('blue') ? '#3B82F6' : provider.color.includes('green') ? '#22C55E' : '#F97316' }}>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${provider.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium">{provider.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {configured > 0 ? `${configured} configurada(s)` : 'No configurada'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tabla de API Keys */}
      <Card>
        <CardHeader>
          <CardTitle>Claves Configuradas</CardTitle>
          <CardDescription>
            Las claves se almacenan de forma segura y encriptada
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Cargando...
            </div>
          ) : !apiKeys?.length ? (
            <div className="text-center py-12">
              <Shield className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="font-medium mb-2">No hay API Keys configuradas</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Añade tus primeras claves API para habilitar integraciones
              </p>
              <Button onClick={() => setIsAddModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Añadir API Key
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Proveedor</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Clave</TableHead>
                  <TableHead>Entorno</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Verificación</TableHead>
                  <TableHead>Última actualización</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiKeys.map(key => {
                  const provider = getProviderConfig(key.provider);
                  const Icon = provider.icon;
                  return (
                    <TableRow key={key.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded ${provider.color}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="font-medium">{provider.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{key.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {showSecrets[key.id] ? key.api_key_encrypted : key.api_key_masked}
                          </code>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => setShowSecrets(prev => ({ ...prev, [key.id]: !prev[key.id] }))}
                          >
                            {showSecrets[key.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {key.environment}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={key.is_active ? 'default' : 'secondary'}>
                          {key.is_active ? 'Activa' : 'Inactiva'}
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(key.verification_status)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(key.updated_at), "dd MMM yyyy HH:mm", { locale: es })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(key)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeletingKey(key)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modal Añadir/Editar */}
      <Dialog open={isAddModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingKey ? 'Editar API Key' : 'Añadir API Key'}
            </DialogTitle>
            <DialogDescription>
              {editingKey 
                ? 'Actualiza la configuración de esta clave API'
                : 'Añade una nueva clave API para habilitar una integración'
              }
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Proveedor</Label>
              <Select 
                value={formData.provider} 
                onValueChange={v => setFormData(prev => ({ ...prev, provider: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un proveedor" />
                </SelectTrigger>
                <SelectContent>
                  {API_PROVIDERS.map(p => {
                    const Icon = p.icon;
                    return (
                      <SelectItem key={p.code} value={p.code}>
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          <span>{p.name}</span>
                          <span className="text-muted-foreground text-xs">- {p.description}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Nombre / Identificador</Label>
              <Input
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="ej: STRIPE_SECRET_KEY"
                className="font-mono"
                disabled={!!editingKey}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Usa MAYÚSCULAS_CON_GUIONES para seguir convenciones
              </p>
            </div>

            <div>
              <Label>API Key</Label>
              <Input
                type="password"
                value={formData.api_key}
                onChange={e => setFormData(prev => ({ ...prev, api_key: e.target.value }))}
                placeholder={editingKey ? '••••••••••••••••' : 'sk_live_...'}
                className="font-mono"
              />
              {editingKey && (
                <p className="text-xs text-muted-foreground mt-1">
                  Deja vacío para mantener la clave actual
                </p>
              )}
            </div>

            <div>
              <Label>Entorno</Label>
              <Select 
                value={formData.environment} 
                onValueChange={(v: 'production' | 'sandbox' | 'test') => 
                  setFormData(prev => ({ ...prev, environment: v }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="production">Producción</SelectItem>
                  <SelectItem value="sandbox">Sandbox</SelectItem>
                  <SelectItem value="test">Test</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Notas (opcional)</Label>
              <Textarea
                value={formData.notes}
                onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Notas internas sobre esta clave..."
                rows={2}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseModal}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? 'Guardando...' : editingKey ? 'Actualizar' : 'Añadir'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmación de eliminación */}
      <AlertDialog open={!!deletingKey} onOpenChange={() => setDeletingKey(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar API Key?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente la clave <strong>{deletingKey?.name}</strong>.
              Las integraciones que dependan de ella dejarán de funcionar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingKey && deleteMutation.mutate(deletingKey.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
