import { useState } from 'react';
import { 
  Key, 
  Plus, 
  Copy, 
  Trash2, 
  AlertTriangle,
  Check,
  Clock,
  ExternalLink,
  FileText
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  useApiKeys, 
  useCreateApiKey, 
  useRevokeApiKey, 
  useDeleteApiKey 
} from '@/hooks/use-api-keys';
import { API_SCOPES } from '@/lib/constants/api';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';
import type { ApiScope } from '@/types/api';

export default function ApiKeysPage() {
  const { data: apiKeys = [], isLoading } = useApiKeys();
  const createMutation = useCreateApiKey();
  const revokeMutation = useRevokeApiKey();
  const deleteMutation = useDeleteApiKey();
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [scopes, setScopes] = useState<ApiScope[]>(['read']);
  const [expiresIn, setExpiresIn] = useState('never');
  
  const handleCreate = async () => {
    let expires_at: string | undefined;
    if (expiresIn !== 'never') {
      const days = parseInt(expiresIn);
      expires_at = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
    }
    
    try {
      const result = await createMutation.mutateAsync({ 
        name, 
        description, 
        scopes, 
        expires_at 
      });
      setNewKey(result.key);
      setShowCreateDialog(false);
      resetForm();
    } catch (error) {
      // Error handled by mutation
    }
  };
  
  const resetForm = () => {
    setName('');
    setDescription('');
    setScopes(['read']);
    setExpiresIn('never');
  };
  
  const handleRevoke = async (id: string) => {
    if (!confirm('¿Revocar esta API Key? No podrá usarse más.')) return;
    await revokeMutation.mutateAsync(id);
  };
  
  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta API Key permanentemente?')) return;
    await deleteMutation.mutateAsync(id);
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado al portapapeles');
  };
  
  const toggleScope = (scope: ApiScope) => {
    setScopes(prev =>
      prev.includes(scope)
        ? prev.filter(s => s !== scope)
        : [...prev, scope]
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">API Keys</h1>
          <p className="text-muted-foreground">
            Gestiona las claves de acceso a la API REST
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <a 
              href="https://dcdbpmbzizzzzdfkvohl.supabase.co/functions/v1/api-v1/health" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              API Docs
            </a>
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nueva API Key
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Nueva API Key</DialogTitle>
                <DialogDescription>
                  Crea una clave para acceder a la API de IP-NEXUS
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Mi integración"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Input
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Para qué se usará esta API Key"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Permisos</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(API_SCOPES).map(([scope, config]) => (
                      <button
                        key={scope}
                        type="button"
                        onClick={() => toggleScope(scope as ApiScope)}
                        className={cn(
                          "flex items-center gap-2 p-2 border rounded-lg text-left transition-colors",
                          scopes.includes(scope as ApiScope) 
                            ? "bg-primary/10 border-primary" 
                            : "hover:bg-muted"
                        )}
                      >
                        <div className={cn(
                          "w-4 h-4 rounded border flex items-center justify-center shrink-0",
                          scopes.includes(scope as ApiScope) 
                            ? "bg-primary border-primary" 
                            : "border-muted-foreground"
                        )}>
                          {scopes.includes(scope as ApiScope) && (
                            <Check className="w-3 h-3 text-primary-foreground" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{config.label}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="expires">Expiración</Label>
                  <Select value={expiresIn} onValueChange={setExpiresIn}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="never">Nunca</SelectItem>
                      <SelectItem value="30">30 días</SelectItem>
                      <SelectItem value="90">90 días</SelectItem>
                      <SelectItem value="180">6 meses</SelectItem>
                      <SelectItem value="365">1 año</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setShowCreateDialog(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleCreate}
                  disabled={!name || scopes.length === 0 || createMutation.isPending}
                >
                  {createMutation.isPending ? 'Creando...' : 'Crear API Key'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* New Key Alert */}
      {newKey && (
        <Alert className="bg-green-50 border-green-200">
          <AlertTriangle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">API Key creada</AlertTitle>
          <AlertDescription className="text-green-700">
            <p className="mb-3">Copia esta clave ahora. No podrás verla de nuevo.</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-white px-3 py-2 rounded border font-mono text-sm break-all">
                {newKey}
              </code>
              <Button
                size="sm"
                onClick={() => copyToClipboard(newKey)}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <Button
              variant="link"
              className="mt-2 p-0 h-auto text-green-700"
              onClick={() => setNewKey(null)}
            >
              He copiado la clave, cerrar
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      {/* API Keys List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            Claves de API
          </CardTitle>
          <CardDescription>
            Usa estas claves para autenticarte en la API REST
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Cargando...
            </div>
          ) : apiKeys.length === 0 ? (
            <div className="text-center py-12">
              <Key className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">No hay API Keys</p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                Crea una API Key para integrar con sistemas externos
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {apiKeys.map(apiKey => (
                <div key={apiKey.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                        apiKey.is_active ? "bg-green-100" : "bg-muted"
                      )}>
                        <Key className={cn(
                          "w-5 h-5",
                          apiKey.is_active ? "text-green-600" : "text-muted-foreground"
                        )} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-medium">{apiKey.name}</h3>
                          {!apiKey.is_active && (
                            <Badge variant="secondary">Revocada</Badge>
                          )}
                        </div>
                        <code className="text-sm text-muted-foreground font-mono">
                          {apiKey.key_prefix}••••••••
                        </code>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
                          <span>
                            Creada: {format(new Date(apiKey.created_at), 'dd/MM/yyyy', { locale: es })}
                          </span>
                          {apiKey.last_used_at && (
                            <span>
                              Último uso: {format(new Date(apiKey.last_used_at), 'dd/MM HH:mm', { locale: es })}
                            </span>
                          )}
                          {apiKey.expires_at && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Expira: {format(new Date(apiKey.expires_at), 'dd/MM/yyyy', { locale: es })}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {apiKey.scopes.slice(0, 4).map(scope => (
                            <Badge key={scope} variant="outline" className="text-xs">
                              {scope}
                            </Badge>
                          ))}
                          {apiKey.scopes.length > 4 && (
                            <Badge variant="outline" className="text-xs">
                              +{apiKey.scopes.length - 4}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 shrink-0">
                      {apiKey.is_active && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRevoke(apiKey.id)}
                          title="Revocar"
                        >
                          <AlertTriangle className="w-4 h-4 text-yellow-600" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(apiKey.id)}
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Quick Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Referencia rápida
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Autenticación</h4>
            <p className="text-sm text-muted-foreground mb-2">
              Incluye tu API key en el header de cada petición:
            </p>
            <pre className="bg-muted p-3 rounded-lg text-sm overflow-x-auto">
{`curl -X GET \\
  'https://dcdbpmbzizzzzdfkvohl.supabase.co/functions/v1/api-v1/matters' \\
  -H 'X-API-Key: ipn_tu_api_key_aqui'`}
            </pre>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Endpoints disponibles</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li><code className="bg-muted px-1 rounded">GET /matters</code> - Listar expedientes</li>
              <li><code className="bg-muted px-1 rounded">GET /contacts</code> - Listar contactos</li>
              <li><code className="bg-muted px-1 rounded">GET /deadlines</code> - Listar plazos</li>
              <li><code className="bg-muted px-1 rounded">GET /invoices</code> - Listar facturas</li>
              <li><code className="bg-muted px-1 rounded">GET /documents</code> - Listar documentos</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
