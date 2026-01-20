import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useSpiderConnectors,
  useConnectorCredentials,
  useSaveConnectorCredentials,
  useDeleteConnectorCredentials,
} from '@/hooks/spider/use-spider-connectors';
import {
  Globe,
  Shield,
  Key,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Trash2,
  Eye,
  EyeOff,
  Building2,
  Search,
  AlertCircle,
} from 'lucide-react';

const connectorTypeIcons: Record<string, typeof Globe> = {
  trademark_office: Building2,
  patent_office: Shield,
  domain_registrar: Globe,
  marketplace: Search,
  web_monitor: Eye,
  social_media: Globe,
};

const connectorTypeLabels: Record<string, string> = {
  trademark_office: 'Oficina de Marcas',
  patent_office: 'Oficina de Patentes',
  domain_registrar: 'Registrador de Dominios',
  marketplace: 'Marketplace',
  web_monitor: 'Monitor Web',
  social_media: 'Redes Sociales',
};

export function SpiderConnectorsPanel() {
  const { data: connectors, isLoading: loadingConnectors } = useSpiderConnectors();
  const { data: credentialsMap, isLoading: loadingCredentials } = useConnectorCredentials();
  const saveCredentials = useSaveConnectorCredentials();
  const deleteCredentials = useDeleteConnectorCredentials();

  const [selectedConnector, setSelectedConnector] = useState<string | null>(null);
  const [showCredentialsDialog, setShowCredentialsDialog] = useState(false);
  const [credentialValues, setCredentialValues] = useState<Record<string, string>>({});
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState('all');

  const handleOpenCredentials = (connectorId: string) => {
    setSelectedConnector(connectorId);
    setCredentialValues({});
    setShowCredentialsDialog(true);
  };

  const handleSaveCredentials = async () => {
    if (!selectedConnector) return;

    await saveCredentials.mutateAsync({
      connectorId: selectedConnector,
      credentials: credentialValues,
    });

    setShowCredentialsDialog(false);
    setCredentialValues({});
    setSelectedConnector(null);
  };

  const handleDeleteCredentials = async (connectorId: string) => {
    if (!confirm('¿Estás seguro de eliminar estas credenciales?')) return;
    await deleteCredentials.mutateAsync(connectorId);
  };

  const getConnectorStatus = (connectorId: string) => {
    const cred = credentialsMap?.[connectorId];
    if (!cred) return 'not_configured';
    if (!cred.is_valid) return 'invalid';
    return 'active';
  };

  const filteredConnectors = connectors?.filter((c) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'configured') return getConnectorStatus(c.id) !== 'not_configured';
    return c.connector_type === activeTab;
  });

  const connectorTypes = [...new Set(connectors?.map((c) => c.connector_type) || [])];
  const configuredCount = connectors?.filter((c) => credentialsMap?.[c.id]?.is_valid).length || 0;

  if (loadingConnectors) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Conectores de Vigilancia</h2>
          <p className="text-muted-foreground">
            Configura las fuentes de datos para la vigilancia de PI
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          {configuredCount} de {connectors?.length || 0} activos
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="configured">Configurados</TabsTrigger>
          {connectorTypes.slice(0, 4).map((type) => (
            <TabsTrigger key={type} value={type}>
              {connectorTypeLabels[type] || type}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredConnectors?.map((connector) => {
              const status = getConnectorStatus(connector.id);
              const Icon = connectorTypeIcons[connector.connector_type] || Globe;
              const cred = credentialsMap?.[connector.id];

              return (
                <Card key={connector.id} className="relative overflow-hidden">
                  {!connector.is_active && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80">
                      <Badge variant="secondary">Próximamente</Badge>
                    </div>
                  )}

                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                            status === 'active'
                              ? 'bg-green-500/10 text-green-600'
                              : status === 'invalid'
                                ? 'bg-red-500/10 text-red-600'
                                : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{connector.name}</CardTitle>
                          <CardDescription className="text-xs">
                            {connector.jurisdictions?.[0] || 'Global'}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge
                        variant={
                          status === 'active'
                            ? 'default'
                            : status === 'invalid'
                              ? 'destructive'
                              : 'secondary'
                        }
                        className="text-xs"
                      >
                        {status === 'active' && <CheckCircle2 className="mr-1 h-3 w-3" />}
                        {status === 'invalid' && <XCircle className="mr-1 h-3 w-3" />}
                        {status === 'not_configured' && <Clock className="mr-1 h-3 w-3" />}
                        {status === 'active'
                          ? 'Activo'
                          : status === 'invalid'
                            ? 'Error'
                            : 'Sin configurar'}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {connector.description || `Conector para ${connector.name}`}
                    </p>

                    <div className="flex flex-wrap gap-1">
                      <Badge variant="outline" className="text-xs">
                        {connector.auth_type}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {connector.required_tier}
                      </Badge>
                    </div>

                    {cred?.last_validated_at && (
                      <p className="text-xs text-muted-foreground">
                        Última validación:{' '}
                        {new Date(cred.last_validated_at).toLocaleDateString()}
                      </p>
                    )}

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleOpenCredentials(connector.id)}
                        disabled={!connector.is_active}
                      >
                        <Key className="mr-1 h-3 w-3" />
                        {status === 'not_configured' ? 'Configurar' : 'Editar'}
                      </Button>

                      {status !== 'not_configured' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCredentials(connector.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredConnectors?.length === 0 && (
            <div className="py-12 text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No hay conectores</h3>
              <p className="text-muted-foreground">
                No se encontraron conectores en esta categoría.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Credentials Dialog */}
      <Dialog open={showCredentialsDialog} onOpenChange={setShowCredentialsDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Configurar Credenciales</DialogTitle>
            <DialogDescription>
              Ingresa las credenciales necesarias para conectar con esta fuente.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-4 py-4">
              {['api_key', 'username', 'password'].map((field) => (
                <div key={field} className="space-y-2">
                  <Label htmlFor={field} className="capitalize">
                    {field.replace(/_/g, ' ')}
                  </Label>
                  <div className="relative">
                    <Input
                      id={field}
                      type={showSecrets[field] ? 'text' : 'password'}
                      value={credentialValues[field] || ''}
                      onChange={(e) =>
                        setCredentialValues((prev) => ({
                          ...prev,
                          [field]: e.target.value,
                        }))
                      }
                      placeholder={`Ingresa ${field.replace(/_/g, ' ')}`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1 h-7 w-7 p-0"
                      onClick={() =>
                        setShowSecrets((prev) => ({
                          ...prev,
                          [field]: !prev[field],
                        }))
                      }
                    >
                      {showSecrets[field] ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCredentialsDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveCredentials} disabled={saveCredentials.isPending}>
              {saveCredentials.isPending && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
