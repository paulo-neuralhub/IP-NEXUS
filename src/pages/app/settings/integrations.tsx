import { useState } from 'react';
import { 
  Plug, 
  CreditCard, 
  Mail, 
  Globe,
  Check,
  X,
  ExternalLink,
  RefreshCw,
  Eye,
  EyeOff,
  Calendar
} from 'lucide-react';
import { 
  useApiConnections, 
  useCreateApiConnection,
  useUpdateApiConnection,
  useStripePortal 
} from '@/hooks/use-integrations';
import { useCurrentSubscription } from '@/hooks/use-subscription';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CalendarIntegrationSection } from '@/components/settings/CalendarIntegrationSection';

interface IntegrationField {
  key: string;
  label: string;
  type: 'text' | 'password';
}

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: typeof CreditCard;
  color: string;
  category: string;
  fields: IntegrationField[];
  isManaged?: boolean;
  isSystem?: boolean;
}

const INTEGRATIONS: Integration[] = [
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Pagos y suscripciones',
    icon: CreditCard,
    color: '#635BFF',
    category: 'billing',
    fields: [],
    isManaged: true,
  },
  {
    id: 'euipo',
    name: 'EUIPO eSearch',
    description: 'Búsquedas en base de datos EUIPO',
    icon: Globe,
    color: '#003399',
    category: 'ip_offices',
    fields: [
      { key: 'api_key', label: 'API Key', type: 'password' },
    ],
  },
  {
    id: 'tmview',
    name: 'TMView',
    description: 'Base de datos mundial de marcas',
    icon: Globe,
    color: '#00A651',
    category: 'ip_offices',
    fields: [
      { key: 'username', label: 'Usuario', type: 'text' },
      { key: 'password', label: 'Contraseña', type: 'password' },
    ],
  },
  {
    id: 'wipo',
    name: 'WIPO Global Brand Database',
    description: 'Sistema Madrid y PCT',
    icon: Globe,
    color: '#0072BC',
    category: 'ip_offices',
    fields: [
      { key: 'api_key', label: 'API Key', type: 'password' },
    ],
  },
  {
    id: 'resend',
    name: 'Resend',
    description: 'Envío de emails transaccionales',
    icon: Mail,
    color: '#000000',
    category: 'email',
    fields: [
      { key: 'api_key', label: 'API Key', type: 'password' },
    ],
    isSystem: true,
  },
];

const CATEGORIES = [
  { id: 'billing', name: 'Pagos' },
  { id: 'ip_offices', name: 'Oficinas de PI' },
  { id: 'email', name: 'Email' },
];

export default function IntegrationsPage() {
  const { data: connections = [] } = useApiConnections();
  const { data: subscription } = useCurrentSubscription();
  const createMutation = useCreateApiConnection();
  const updateMutation = useUpdateApiConnection();
  const portalMutation = useStripePortal();
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<Record<string, string>>({});
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  
  const isConnected = (providerId: string) => 
    connections.some(c => c.provider === providerId && c.is_active);
  
  const getConnection = (providerId: string) =>
    connections.find(c => c.provider === providerId);
  
  const handleSave = async (integration: Integration) => {
    try {
      const creds: Record<string, string> = {};
      integration.fields.forEach(f => {
        creds[f.key] = credentials[f.key] || '';
      });
      
      const existingConnection = getConnection(integration.id);
      
      if (existingConnection) {
        await updateMutation.mutateAsync({
          id: existingConnection.id,
          credentials: creds,
          is_active: true,
        });
      } else {
        await createMutation.mutateAsync({
          provider: integration.id,
          credentials: creds,
          is_active: true,
          config: {},
        });
      }
      
      setEditingId(null);
      setCredentials({});
    } catch (error) {
      // Error handled by mutation
    }
  };
  
  const handleStripePortal = async () => {
    try {
      await portalMutation.mutateAsync(window.location.href);
    } catch (error) {
      toast.error('Error al abrir portal de Stripe');
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Integraciones</h1>
        <p className="text-muted-foreground">Conecta IP-NEXUS con servicios externos</p>
      </div>
      
      {CATEGORIES.map(category => {
        const categoryIntegrations = INTEGRATIONS.filter(i => i.category === category.id);
        if (categoryIntegrations.length === 0) return null;
        
        return (
          <div key={category.id}>
            <h2 className="text-lg font-semibold text-foreground mb-4">{category.name}</h2>
            <div className="space-y-4">
              {categoryIntegrations.map(integration => {
                const Icon = integration.icon;
                const connected = isConnected(integration.id);
                const connection = getConnection(integration.id);
                const isEditing = editingId === integration.id;
                
                return (
                  <Card key={integration.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div 
                            className="w-12 h-12 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: `${integration.color}15` }}
                          >
                            <Icon className="w-6 h-6" style={{ color: integration.color }} />
                          </div>
                          
                          <div>
                            <div className="flex items-center gap-2">
                              <CardTitle className="text-base">{integration.name}</CardTitle>
                              {connected && (
                                <Badge variant="secondary" className="bg-green-100 text-green-700">
                                  <Check className="w-3 h-3 mr-1" /> Conectado
                                </Badge>
                              )}
                            </div>
                            <CardDescription>{integration.description}</CardDescription>
                            
                            {connection?.last_error && (
                              <p className="text-xs text-destructive mt-1">{connection.last_error}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {/* Stripe - botón especial */}
                          {integration.id === 'stripe' && subscription?.stripe_customer_id && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleStripePortal}
                              disabled={portalMutation.isPending}
                            >
                              <ExternalLink className="w-4 h-4 mr-1" />
                              Portal de facturación
                            </Button>
                          )}
                          
                          {/* Otras integraciones */}
                          {!integration.isManaged && !integration.isSystem && (
                            <>
                              {!isEditing ? (
                                <Button
                                  size="sm"
                                  onClick={() => setEditingId(integration.id)}
                                >
                                  {connected ? 'Editar' : 'Conectar'}
                                </Button>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setEditingId(null);
                                    setCredentials({});
                                  }}
                                >
                                  Cancelar
                                </Button>
                              )}
                            </>
                          )}
                          
                          {integration.isSystem && (
                            <Badge variant="outline">Sistema</Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    
                    {/* Formulario de credenciales */}
                    {isEditing && integration.fields.length > 0 && (
                      <CardContent className="pt-0 border-t">
                        <div className="space-y-4 pt-4">
                          {integration.fields.map(field => (
                            <div key={field.key}>
                              <Label htmlFor={field.key}>{field.label}</Label>
                              <div className="relative mt-1">
                                <Input
                                  id={field.key}
                                  type={field.type === 'password' && !showSecrets[field.key] ? 'password' : 'text'}
                                  value={credentials[field.key] || ''}
                                  onChange={(e) => setCredentials({ ...credentials, [field.key]: e.target.value })}
                                  placeholder={`Introduce ${field.label.toLowerCase()}`}
                                />
                                {field.type === 'password' && (
                                  <button
                                    type="button"
                                    onClick={() => setShowSecrets({ ...showSecrets, [field.key]: !showSecrets[field.key] })}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                                  >
                                    {showSecrets[field.key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                          
                          <Button
                            onClick={() => handleSave(integration)}
                            disabled={createMutation.isPending || updateMutation.isPending}
                          >
                            {(createMutation.isPending || updateMutation.isPending) ? 'Guardando...' : 'Guardar conexión'}
                          </Button>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
