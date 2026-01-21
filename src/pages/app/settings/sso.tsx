/**
 * SSO Settings Page
 * Configuración de Single Sign-On Enterprise
 */

import { useState } from 'react';
import { useSSOConfig, useSSOSessions, SSOConfiguration } from '@/hooks/use-sso';
import { useOrganization } from '@/contexts/organization-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { 
  Shield, Key, Users, Settings, Check, AlertCircle, 
  Loader2, ExternalLink, Copy, Download, Upload, Plus,
  Trash2, RefreshCw, Info, Building2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';

// Provider logos como SVGs
const AzureADLogo = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24">
    <path fill="#00A4EF" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
  </svg>
);

const GoogleLogo = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const OktaLogo = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24">
    <circle fill="#007DC1" cx="12" cy="12" r="10"/>
    <circle fill="white" cx="12" cy="12" r="4"/>
  </svg>
);

type ProviderType = SSOConfiguration['provider_type'];

const PROVIDERS: { 
  id: ProviderType; 
  name: string; 
  logo: React.FC;
  description: string;
  type: 'saml' | 'oidc';
}[] = [
  { 
    id: 'azure_ad', 
    name: 'Microsoft Azure AD', 
    logo: AzureADLogo,
    description: 'Single Sign-On con Microsoft 365 y Azure Active Directory',
    type: 'oidc',
  },
  { 
    id: 'google_workspace', 
    name: 'Google Workspace', 
    logo: GoogleLogo,
    description: 'Inicio de sesión con cuentas de Google Workspace',
    type: 'oidc',
  },
  { 
    id: 'okta', 
    name: 'Okta', 
    logo: OktaLogo,
    description: 'Integración con Okta Identity Platform',
    type: 'oidc',
  },
  { 
    id: 'saml_generic', 
    name: 'SAML 2.0 Genérico', 
    logo: Shield,
    description: 'Cualquier proveedor compatible con SAML 2.0',
    type: 'saml',
  },
  { 
    id: 'oidc_generic', 
    name: 'OIDC Genérico', 
    logo: Key,
    description: 'Cualquier proveedor compatible con OpenID Connect',
    type: 'oidc',
  },
];

export default function SSOSettingsPage() {
  const { currentOrganization } = useOrganization();
  const { 
    config, 
    isLoading, 
    createConfig, 
    updateConfig, 
    deleteConfig,
    testConnection,
    activateSSO,
    deactivateSSO,
  } = useSSOConfig();
  const { sessions, isLoading: sessionsLoading } = useSSOSessions();
  
  const [selectedProvider, setSelectedProvider] = useState<ProviderType | null>(null);
  const [formData, setFormData] = useState<Partial<SSOConfiguration>>({});
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [roleMappings, setRoleMappings] = useState<{ group: string; role: string }[]>([
    { group: '', role: '' }
  ]);

  // SP Metadata
  const spMetadata = {
    entityId: `https://app.ip-nexus.com/sso/${currentOrganization?.id}`,
    acsUrl: `https://dcdbpmbzizzzzdfkvohl.supabase.co/functions/v1/sso-callback`,
    sloUrl: `https://dcdbpmbzizzzzdfkvohl.supabase.co/functions/v1/sso-logout`,
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado al portapapeles`);
  };

  const handleSaveConfig = () => {
    // Convertir role mappings array a objeto
    const roleMapping: Record<string, string> = {};
    roleMappings.forEach(({ group, role }) => {
      if (group && role) roleMapping[group] = role;
    });

    updateConfig.mutate({
      ...formData,
      role_mapping: roleMapping,
    });
  };

  const currentProvider = PROVIDERS.find(p => p.id === config?.provider_type);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            Single Sign-On (SSO)
          </h1>
          <p className="text-muted-foreground">
            Configura el inicio de sesión único con tu proveedor de identidad
          </p>
        </div>
        
        {config && (
          <div className="flex items-center gap-2">
            {config.is_active ? (
              <Badge className="bg-success/10 text-success border-success/20">
                <Check className="w-3 h-3 mr-1" />
                SSO Activo
              </Badge>
            ) : (
              <Badge variant="secondary">
                <AlertCircle className="w-3 h-3 mr-1" />
                SSO Inactivo
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Enterprise Alert */}
      <Alert>
        <Building2 className="h-4 w-4" />
        <AlertTitle>Funcionalidad Enterprise</AlertTitle>
        <AlertDescription>
          SSO está disponible en planes Enterprise. Contacta con ventas para activar esta función.
        </AlertDescription>
      </Alert>

      {!config ? (
        /* Selección de proveedor */
        <Card>
          <CardHeader>
            <CardTitle>Selecciona un proveedor</CardTitle>
            <CardDescription>
              Elige el proveedor de identidad que usas en tu organización
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {PROVIDERS.map((provider) => (
                <button
                  key={provider.id}
                  onClick={() => setSelectedProvider(provider.id)}
                  className={cn(
                    "p-4 border rounded-lg text-left hover:border-primary transition-all hover:shadow-sm",
                    selectedProvider === provider.id && "border-primary bg-primary/5 ring-1 ring-primary"
                  )}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <provider.logo />
                    <span className="font-medium">{provider.name}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {provider.description}
                  </p>
                  <Badge variant="outline" className="mt-2">
                    {provider.type.toUpperCase()}
                  </Badge>
                </button>
              ))}
            </div>

            {selectedProvider && (
              <div className="mt-6 flex justify-end">
                <Button 
                  onClick={() => createConfig.mutate(selectedProvider)}
                  disabled={createConfig.isPending}
                >
                  {createConfig.isPending && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  Continuar con {PROVIDERS.find(p => p.id === selectedProvider)?.name}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        /* Configuración del proveedor seleccionado */
        <Tabs defaultValue="config">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="config">Configuración</TabsTrigger>
            <TabsTrigger value="mapping">Mapeo</TabsTrigger>
            <TabsTrigger value="options">Opciones</TabsTrigger>
            <TabsTrigger value="logs">Sesiones</TabsTrigger>
          </TabsList>

          {/* Tab: Configuración */}
          <TabsContent value="config" className="space-y-6 mt-6">
            {/* Estado y proveedor */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    {currentProvider && <currentProvider.logo />}
                    <div>
                      <CardTitle>{currentProvider?.name}</CardTitle>
                      <CardDescription>
                        Configuración del proveedor de identidad
                      </CardDescription>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-destructive"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Datos de IP-NEXUS (SP) */}
                <div className="p-4 bg-muted/50 rounded-lg border">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    Datos de IP-NEXUS (Service Provider)
                  </h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Copia estos datos en la configuración de tu proveedor de identidad:
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-background rounded-lg border">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Entity ID / Identifier</p>
                        <code className="text-sm">{spMetadata.entityId}</code>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => copyToClipboard(spMetadata.entityId, 'Entity ID')}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-background rounded-lg border">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">ACS URL / Reply URL / Callback</p>
                        <code className="text-sm break-all">{spMetadata.acsUrl}</code>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => copyToClipboard(spMetadata.acsUrl, 'ACS URL')}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-background rounded-lg border">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Logout URL (SLO)</p>
                        <code className="text-sm break-all">{spMetadata.sloUrl}</code>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => copyToClipboard(spMetadata.sloUrl, 'Logout URL')}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Config SAML o OIDC */}
                {currentProvider?.type === 'saml' ? (
                  <SAMLConfigForm 
                    config={config}
                    formData={formData}
                    setFormData={setFormData}
                  />
                ) : (
                  <OIDCConfigForm 
                    config={config}
                    formData={formData}
                    setFormData={setFormData}
                    providerType={config.provider_type}
                  />
                )}

                {/* Acciones */}
                <div className="flex gap-2 pt-4">
                  <Button 
                    variant="outline"
                    onClick={() => testConnection.mutate()}
                    disabled={testConnection.isPending}
                  >
                    {testConnection.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4 mr-2" />
                    )}
                    Probar conexión
                  </Button>
                  
                  <Button
                    onClick={handleSaveConfig}
                    disabled={updateConfig.isPending}
                  >
                    {updateConfig.isPending && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    Guardar configuración
                  </Button>

                  <div className="ml-auto">
                    {config.is_active ? (
                      <Button 
                        variant="destructive"
                        onClick={() => deactivateSSO.mutate()}
                        disabled={deactivateSSO.isPending}
                      >
                        Desactivar SSO
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => activateSSO.mutate()}
                        disabled={activateSSO.isPending}
                      >
                        {activateSSO.isPending && (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        )}
                        <Check className="w-4 h-4 mr-2" />
                        Activar SSO
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Mapeo */}
          <TabsContent value="mapping" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Mapeo de atributos</CardTitle>
                <CardDescription>
                  Configura cómo se mapean los atributos del IdP a IP-NEXUS
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Atributo Email</Label>
                    <Input 
                      defaultValue={config.attribute_mapping?.email || 'email'}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        attribute_mapping: {
                          ...config.attribute_mapping,
                          ...prev.attribute_mapping,
                          email: e.target.value,
                        }
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Atributo Nombre</Label>
                    <Input 
                      defaultValue={config.attribute_mapping?.first_name || 'given_name'}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        attribute_mapping: {
                          ...config.attribute_mapping,
                          ...prev.attribute_mapping,
                          first_name: e.target.value,
                        }
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Atributo Apellido</Label>
                    <Input 
                      defaultValue={config.attribute_mapping?.last_name || 'family_name'}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        attribute_mapping: {
                          ...config.attribute_mapping,
                          ...prev.attribute_mapping,
                          last_name: e.target.value,
                        }
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Atributo Grupos</Label>
                    <Input 
                      defaultValue={config.attribute_mapping?.groups || 'groups'}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        attribute_mapping: {
                          ...config.attribute_mapping,
                          ...prev.attribute_mapping,
                          groups: e.target.value,
                        }
                      }))}
                    />
                  </div>
                </div>

                <Separator />

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-medium">Mapeo de roles</h4>
                      <p className="text-sm text-muted-foreground">
                        Asigna roles de IP-NEXUS según los grupos del IdP
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setRoleMappings(prev => [...prev, { group: '', role: '' }])}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Añadir mapeo
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    {roleMappings.map((mapping, index) => (
                      <div key={index} className="flex gap-2">
                        <Input 
                          placeholder="Nombre del grupo en IdP" 
                          value={mapping.group}
                          onChange={(e) => {
                            const newMappings = [...roleMappings];
                            newMappings[index].group = e.target.value;
                            setRoleMappings(newMappings);
                          }}
                        />
                        <Select
                          value={mapping.role}
                          onValueChange={(value) => {
                            const newMappings = [...roleMappings];
                            newMappings[index].role = value;
                            setRoleMappings(newMappings);
                          }}
                        >
                          <SelectTrigger className="w-48">
                            <SelectValue placeholder="Rol en IP-NEXUS" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Administrador</SelectItem>
                            <SelectItem value="manager">Manager</SelectItem>
                            <SelectItem value="member">Miembro</SelectItem>
                            <SelectItem value="viewer">Visualizador</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setRoleMappings(prev => prev.filter((_, i) => i !== index));
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveConfig} disabled={updateConfig.isPending}>
                    Guardar mapeo
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Opciones */}
          <TabsContent value="options" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Opciones de provisioning</CardTitle>
                <CardDescription>
                  Configura cómo se gestionan los usuarios con SSO
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Crear usuarios automáticamente</Label>
                    <p className="text-sm text-muted-foreground">
                      Los usuarios nuevos se crean en el primer login SSO
                    </p>
                  </div>
                  <Switch 
                    checked={formData.auto_provision_users ?? config.auto_provision_users}
                    onCheckedChange={(checked) => setFormData(prev => ({
                      ...prev,
                      auto_provision_users: checked,
                    }))}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Actualizar usuarios en cada login</Label>
                    <p className="text-sm text-muted-foreground">
                      Sincronizar nombre, email y grupos en cada inicio de sesión
                    </p>
                  </div>
                  <Switch 
                    checked={formData.auto_update_users ?? config.auto_update_users}
                    onCheckedChange={(checked) => setFormData(prev => ({
                      ...prev,
                      auto_update_users: checked,
                    }))}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-destructive">Forzar SSO</Label>
                    <p className="text-sm text-muted-foreground">
                      Deshabilitar login con email/password para esta organización
                    </p>
                  </div>
                  <Switch 
                    checked={formData.require_sso ?? config.require_sso}
                    onCheckedChange={(checked) => setFormData(prev => ({
                      ...prev,
                      require_sso: checked,
                    }))}
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Rol por defecto</Label>
                  <Select
                    value={formData.default_role ?? config.default_role}
                    onValueChange={(value) => setFormData(prev => ({
                      ...prev,
                      default_role: value,
                    }))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="member">Miembro</SelectItem>
                      <SelectItem value="viewer">Visualizador</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Rol asignado cuando no hay mapeo de grupos
                  </p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Dominios permitidos</Label>
                  <Input
                    placeholder="tuempresa.com, subsidiaria.com"
                    defaultValue={config.allowed_domains?.join(', ')}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      allowed_domains: e.target.value.split(',').map(d => d.trim()).filter(Boolean),
                    }))}
                  />
                  <p className="text-sm text-muted-foreground">
                    Solo usuarios con estos dominios de email pueden acceder. Separar con comas.
                  </p>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveConfig} disabled={updateConfig.isPending}>
                    Guardar opciones
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Logs/Sesiones */}
          <TabsContent value="logs" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Sesiones SSO</CardTitle>
                <CardDescription>
                  Historial de inicios de sesión con SSO
                </CardDescription>
              </CardHeader>
              <CardContent>
                {sessionsLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : sessions && sessions.length > 0 ? (
                  <ScrollArea className="h-[400px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Usuario</TableHead>
                          <TableHead>Inicio</TableHead>
                          <TableHead>IP</TableHead>
                          <TableHead>Estado</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sessions.map((session: any) => (
                          <TableRow key={session.id}>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {session.user?.full_name || 'Usuario'}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {session.user?.email}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="text-sm">
                                  {format(new Date(session.logged_in_at), 'dd/MM/yyyy HH:mm')}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {formatDistanceToNow(new Date(session.logged_in_at), { 
                                    addSuffix: true, 
                                    locale: es 
                                  })}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {session.ip_address || '-'}
                            </TableCell>
                            <TableCell>
                              {session.logged_out_at ? (
                                <Badge variant="secondary">Cerrada</Badge>
                              ) : (
                                <Badge variant="default" className="bg-success text-success-foreground">Activa</Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No hay sesiones SSO registradas</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Dialog para eliminar */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar configuración SSO</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres eliminar la configuración SSO? 
              Los usuarios deberán usar email/password para acceder.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancelar
            </Button>
            <Button 
              variant="destructive"
              onClick={() => {
                deleteConfig.mutate();
                setShowDeleteDialog(false);
              }}
              disabled={deleteConfig.isPending}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Subcomponente: Configuración SAML
function SAMLConfigForm({ 
  config, 
  formData, 
  setFormData 
}: { 
  config: SSOConfiguration;
  formData: Partial<SSOConfiguration>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<SSOConfiguration>>>;
}) {
  return (
    <div className="space-y-4">
      <h4 className="font-medium">Configuración del Identity Provider (SAML)</h4>
      
      <div className="space-y-2">
        <Label>URL del Metadata XML (recomendado)</Label>
        <div className="flex gap-2">
          <Input
            placeholder="https://login.microsoftonline.com/.../federationmetadata.xml"
            defaultValue={config.saml_metadata_url || ''}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              saml_metadata_url: e.target.value,
            }))}
          />
          <Button variant="outline" disabled>
            <Upload className="w-4 h-4 mr-2" />
            Importar
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          La configuración se importará automáticamente desde el metadata
        </p>
      </div>

      <div className="relative py-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            o configurar manualmente
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <Label>SSO URL (Login)</Label>
        <Input
          placeholder="https://login.microsoftonline.com/.../saml2"
          defaultValue={config.saml_sso_url || ''}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            saml_sso_url: e.target.value,
          }))}
        />
      </div>

      <div className="space-y-2">
        <Label>Entity ID del IdP</Label>
        <Input
          placeholder="https://sts.windows.net/..."
          defaultValue={config.saml_entity_id || ''}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            saml_entity_id: e.target.value,
          }))}
        />
      </div>

      <div className="space-y-2">
        <Label>Certificado X.509</Label>
        <Textarea
          placeholder="-----BEGIN CERTIFICATE-----
MIICpDCCAYwCCQC..."
          rows={5}
          defaultValue={config.saml_certificate || ''}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            saml_certificate: e.target.value,
          }))}
          className="font-mono text-xs"
        />
      </div>
    </div>
  );
}

// Subcomponente: Configuración OIDC
function OIDCConfigForm({ 
  config, 
  formData, 
  setFormData,
  providerType,
}: { 
  config: SSOConfiguration;
  formData: Partial<SSOConfiguration>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<SSOConfiguration>>>;
  providerType: ProviderType;
}) {
  // URLs predefinidas por proveedor
  const providerHints: Record<string, { issuer: string; docs: string }> = {
    azure_ad: {
      issuer: 'https://login.microsoftonline.com/{tenant}/v2.0',
      docs: 'https://docs.microsoft.com/azure/active-directory/develop/',
    },
    google_workspace: {
      issuer: 'https://accounts.google.com',
      docs: 'https://developers.google.com/identity/openid-connect/openid-connect',
    },
    okta: {
      issuer: 'https://{your-domain}.okta.com',
      docs: 'https://developer.okta.com/docs/guides/implement-grant-type/',
    },
  };

  const hint = providerHints[providerType];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Configuración OIDC</h4>
        {hint?.docs && (
          <Button variant="link" size="sm" asChild>
            <a href={hint.docs} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-1" />
              Documentación
            </a>
          </Button>
        )}
      </div>
      
      <div className="space-y-2">
        <Label>Client ID</Label>
        <Input 
          placeholder="your-client-id"
          defaultValue={config.oidc_client_id || ''}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            oidc_client_id: e.target.value,
          }))}
        />
      </div>
      
      <div className="space-y-2">
        <Label>Client Secret</Label>
        <Input 
          type="password" 
          placeholder="••••••••"
          onChange={(e) => setFormData(prev => ({
            ...prev,
            oidc_client_secret_encrypted: e.target.value,
          }))}
        />
        <p className="text-xs text-muted-foreground">
          El secret se almacena de forma segura
        </p>
      </div>
      
      <div className="space-y-2">
        <Label>Issuer URL</Label>
        <Input
          placeholder={hint?.issuer || 'https://your-identity-provider.com'}
          defaultValue={config.oidc_issuer_url || ''}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            oidc_issuer_url: e.target.value,
          }))}
        />
        <p className="text-xs text-muted-foreground">
          La URL base del proveedor (se descubrirán los endpoints automáticamente)
        </p>
      </div>

      <div className="space-y-2">
        <Label>Scopes</Label>
        <Input 
          placeholder="openid email profile"
          defaultValue={config.oidc_scopes || 'openid email profile'}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            oidc_scopes: e.target.value,
          }))}
        />
      </div>
    </div>
  );
}
