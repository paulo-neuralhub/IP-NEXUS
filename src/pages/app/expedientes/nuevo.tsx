// ============================================================
// IP-NEXUS - New Matter Page (Matters V2)
// Phase 1-E: Creation form with automatic number generation
// ============================================================

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Loader2, Sparkles, Building2, Info } from 'lucide-react';
import { NiceClassSelectorV2, type NiceSelection } from '@/components/features/docket';
import { 
  useCreateMatterV2, 
  useGenerateMatterNumber,
  usePreviewMatterNumber,
  useMatterTypes 
} from '@/hooks/use-matters-v2';
import { useGenerateInternalReference } from '@/hooks/use-internal-reference-config';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { usePageTitle } from '@/contexts/page-context';
import { cn } from '@/lib/utils';

// Jurisdictions with full format support
const JURISDICTIONS = [
  { code: 'GL', name: '🌍 Global (Pre-depósito)', description: 'Para evaluación antes de elegir países' },
  { code: 'ES', name: '🇪🇸 España (OEPM)', description: 'Oficina Española de Patentes y Marcas' },
  { code: 'EU', name: '🇪🇺 Unión Europea (EUIPO)', description: 'Oficina de Propiedad Intelectual de la UE' },
  { code: 'WO', name: '🌐 Internacional (WIPO)', description: 'PCT / Sistema de Madrid' },
  { code: 'EP', name: '🇪🇺 Patente Europea (EPO)', description: 'Oficina Europea de Patentes' },
  { code: 'US', name: '🇺🇸 Estados Unidos (USPTO)', description: 'US Patent and Trademark Office' },
  { code: 'GB', name: '🇬🇧 Reino Unido (UKIPO)', description: 'UK Intellectual Property Office' },
  { code: 'DE', name: '🇩🇪 Alemania (DPMA)', description: 'Deutsches Patent- und Markenamt' },
  { code: 'FR', name: '🇫🇷 Francia (INPI)', description: 'Institut National de la Propriété Industrielle' },
  { code: 'CN', name: '🇨🇳 China (CNIPA)', description: 'China National IP Administration' },
  { code: 'JP', name: '🇯🇵 Japón (JPO)', description: 'Japan Patent Office' },
  { code: 'BR', name: '🇧🇷 Brasil (INPI)', description: 'Instituto Nacional da Propriedade Industrial' },
  { code: 'MX', name: '🇲🇽 México (IMPI)', description: 'Instituto Mexicano de la Propiedad Industrial' },
];

const formSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  matter_type: z.string().min(1, 'Selecciona un tipo'),
  jurisdiction_code: z.string().min(1, 'Selecciona una jurisdicción'),
  client_id: z.string().optional(),
  mark_name: z.string().optional(),
  invention_title: z.string().optional(),
  // Nice classes ahora es array de NiceSelection, no string
  goods_services: z.string().optional(),
  reference: z.string().optional(),
  client_reference: z.string().optional(),
  internal_notes: z.string().optional(),
  is_urgent: z.boolean().default(false),
  is_confidential: z.boolean().default(false),
});

type FormData = z.infer<typeof formSchema>;

// Contact with client token
interface ContactWithToken {
  id: string;
  name: string;
  company_name: string | null;
  client_token: string | null;
}

export default function NewMatterPage() {
  usePageTitle('Nuevo Expediente');
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentOrganization } = useOrganization();
  const { data: matterTypes, isLoading: loadingTypes } = useMatterTypes();
  const createMatter = useCreateMatterV2();
  const generateNumber = useGenerateMatterNumber();
  const previewNumberMutation = usePreviewMatterNumber();
  const generateInternalRef = useGenerateInternalReference();
  
  const [previewNumberValue, setPreviewNumberValue] = useState<string | null>(null);
  const [generatingNumber, setGeneratingNumber] = useState(false);
  
  // Fetch clients (contacts with client_token)
  const { data: clients, isLoading: loadingClients } = useQuery({
    queryKey: ['clients-for-matter', currentOrganization?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contacts')
        .select('id, name, company_name, client_token')
        .eq('organization_id', currentOrganization!.id)
        .not('client_token', 'is', null)
        .order('name');
      
      if (error) throw error;
      return data as ContactWithToken[];
    },
    enabled: !!currentOrganization?.id,
  });
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      matter_type: '',
      jurisdiction_code: '',
      client_id: '',
      mark_name: '',
      invention_title: '',
      goods_services: '',
      reference: '',
      client_reference: '',
      internal_notes: '',
      is_urgent: false,
      is_confidential: false,
    },
  });
  
  // State for Nice classes (outside react-hook-form because it's complex object)
  const [niceSelections, setNiceSelections] = useState<NiceSelection[]>([]);
  
  const watchedType = form.watch('matter_type');
  const watchedJurisdiction = form.watch('jurisdiction_code');
  const watchedClientId = form.watch('client_id');
  
  // Get selected client info for preview
  const selectedClient = clients?.find(c => c.id === watchedClientId);
  
  // Generate preview number when type, jurisdiction or client change
  useEffect(() => {
    if (watchedType && watchedJurisdiction) {
      setGeneratingNumber(true);
      previewNumberMutation.mutateAsync({
        matterType: watchedType,
        jurisdictionCode: watchedJurisdiction,
        clientId: watchedClientId || undefined,
      }).then(number => {
        setPreviewNumberValue(number);
      }).catch(() => {
        setPreviewNumberValue(null);
      }).finally(() => {
        setGeneratingNumber(false);
      });
    } else {
      setPreviewNumberValue(null);
    }
  }, [watchedType, watchedJurisdiction, watchedClientId]);
  
  const onSubmit = async (data: FormData) => {
    try {
      // Generate final number with client if selected
      const matterNumber = await generateNumber.mutateAsync({
        matterType: data.matter_type,
        jurisdictionCode: data.jurisdiction_code,
        clientId: data.client_id || undefined,
      });
      
      // Generate internal reference automatically (if not provided manually)
      let internalReference = data.reference || null;
      if (!internalReference) {
        try {
          internalReference = await generateInternalRef.mutateAsync({
            typeCode: data.matter_type,
            jurisdictionCode: data.jurisdiction_code,
            clientCode: selectedClient?.client_token || undefined,
          });
        } catch (err) {
          // If auto-generation fails, continue without it
          console.warn('Could not auto-generate internal reference:', err);
        }
      }
      
      // Extract nice class numbers from selections
      const niceClassNumbers = niceSelections.map(s => s.classNumber);
      
      // Build goods/services text from selections if not manually provided
      let goodsServicesText = data.goods_services || '';
      if (!goodsServicesText && niceSelections.length > 0) {
        const parts = niceSelections.map(s => {
          const allProducts = [...s.products, ...s.customProducts];
          if (allProducts.length > 0) {
            return `Clase ${s.classNumber}: ${allProducts.join('; ')}`;
          }
          return `Clase ${s.classNumber}`;
        });
        goodsServicesText = parts.join('\n');
      }
      
      // Create matter
      const matter = await createMatter.mutateAsync({
        matter_number: matterNumber,
        title: data.title,
        matter_type: data.matter_type,
        client_id: data.client_id || null,
        reference: internalReference,
        mark_name: data.mark_name || null,
        invention_title: data.invention_title || null,
        nice_classes: niceClassNumbers.length ? niceClassNumbers : null,
        nice_classes_detail: niceSelections.length ? niceSelections : null,
        goods_services: goodsServicesText || null,
        internal_notes: data.internal_notes || null,
        is_urgent: data.is_urgent,
        is_confidential: data.is_confidential,
      });
      
      toast({ title: 'Expediente creado', description: matterNumber });
      navigate(`/app/expedientes/${matter.id}`);
    } catch (error) {
      toast({ 
        title: 'Error al crear expediente', 
        description: error instanceof Error ? error.message : 'Error desconocido',
        variant: 'destructive' 
      });
    }
  };
  
  const selectedType = matterTypes?.find(t => t.code === watchedType);
  const isTrademarkType = watchedType === 'TM';
  const isPatentType = watchedType === 'PT' || watchedType === 'UM';
  
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/app/expedientes')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Nuevo Expediente</h1>
          <p className="text-muted-foreground">Crea un nuevo expediente de propiedad intelectual</p>
        </div>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Tipo de Expediente</CardTitle>
              <CardDescription>Selecciona el tipo de derecho de propiedad intelectual</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingTypes ? (
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {matterTypes?.map(type => (
                    <button
                      key={type.code}
                      type="button"
                      onClick={() => form.setValue('matter_type', type.code)}
                      className={cn(
                        "flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border transition-all text-sm",
                        watchedType === type.code
                          ? "border-primary bg-primary/10 font-medium"
                          : "border-border hover:border-primary/50 bg-card"
                      )}
                    >
                      <span 
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: type.color }}
                      />
                      <span className="text-foreground truncate">{type.name_es}</span>
                    </button>
                  ))}
                </div>
              )}
              {form.formState.errors.matter_type && (
                <p className="text-sm text-destructive mt-2">
                  {form.formState.errors.matter_type.message}
                </p>
              )}
            </CardContent>
          </Card>
          
          {/* Jurisdiction + Client Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Jurisdicción y Cliente</CardTitle>
              <CardDescription>Selecciona la oficina de registro y el cliente asociado</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Jurisdiction */}
                <FormField
                  control={form.control}
                  name="jurisdiction_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jurisdicción *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona jurisdicción" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {JURISDICTIONS.map(j => (
                            <SelectItem key={j.code} value={j.code}>
                              <span>{j.name}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Client */}
                <FormField
                  control={form.control}
                  name="client_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cliente</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona cliente (opcional)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {loadingClients ? (
                            <div className="p-2 text-sm text-muted-foreground">Cargando...</div>
                          ) : clients?.length === 0 ? (
                            <div className="p-2 text-sm text-muted-foreground">
                              No hay clientes con token
                            </div>
                          ) : (
                            clients?.map(client => (
                              <SelectItem key={client.id} value={client.id}>
                                <div className="flex items-center gap-2">
                                  <Building2 className="h-4 w-4 text-muted-foreground" />
                                  <span>{client.name}</span>
                                  {client.client_token && (
                                    <Badge variant="outline" className="text-xs">
                                      {client.client_token}
                                    </Badge>
                                  )}
                                </div>
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        El token del cliente se incluirá en el número de expediente
                      </FormDescription>
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Global jurisdiction info */}
              {watchedJurisdiction === 'GL' && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Expediente Global (Pre-depósito):</strong> Usa esta opción para 
                    invenciones o marcas en fase de evaluación, antes de decidir en qué países registrar.
                    Podrás añadir Filings específicos por jurisdicción más adelante.
                  </AlertDescription>
                </Alert>
              )}
              
              {/* Number Preview */}
              {(watchedType && watchedJurisdiction) && (
                <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Número de expediente</p>
                    {generatingNumber ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Generando...</span>
                      </div>
                    ) : previewNumberValue ? (
                      <>
                        <p className="font-mono text-lg font-semibold text-primary">{previewNumberValue}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Formato: TIPO-JUR-FECHA-{selectedClient ? selectedClient.client_token : 'CLI'}-SEQ-CHECK
                        </p>
                      </>
                    ) : null}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Información Básica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título del expediente *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Registro de marca ACME en España" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="reference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Referencia interna (opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Se genera automáticamente si se deja vacío" {...field} />
                      </FormControl>
                      <FormDescription>
                        Déjalo vacío para generar automáticamente según tu configuración
                      </FormDescription>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="client_reference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Referencia del cliente</FormLabel>
                      <FormControl>
                        <Input placeholder="Referencia que usa el cliente" {...field} />
                      </FormControl>
                      <FormDescription>Referencia proporcionada por el cliente</FormDescription>
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Trademark specific fields */}
              {isTrademarkType && (
                <>
                  <FormField
                    control={form.control}
                    name="mark_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Denominación de la marca</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: ACME" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormItem>
                    <FormLabel>Clases Nice</FormLabel>
                    <NiceClassSelectorV2
                      value={niceSelections}
                      onChange={setNiceSelections}
                    />
                    <FormDescription>
                      Selecciona las clases y productos/servicios
                    </FormDescription>
                  </FormItem>
                  
                  <FormField
                    control={form.control}
                    name="goods_services"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Productos/Servicios</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Descripción de productos y servicios..."
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </>
              )}
              
              {/* Patent specific fields */}
              {isPatentType && (
                <FormField
                  control={form.control}
                  name="invention_title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título de la invención</FormLabel>
                      <FormControl>
                        <Input placeholder="Título técnico de la invención" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}
              
              <FormField
                control={form.control}
                name="internal_notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notas internas</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Notas adicionales..."
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          
          {/* Options */}
          <Card>
            <CardHeader>
              <CardTitle>Opciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="is_urgent"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <FormLabel className="text-base">Urgente</FormLabel>
                      <FormDescription>Marcar como expediente prioritario</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="is_confidential"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <FormLabel className="text-base">Confidencial</FormLabel>
                      <FormDescription>Restringir acceso a usuarios autorizados</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          
          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => navigate('/app/expedientes')}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createMatter.isPending}>
              {createMatter.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Crear Expediente
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
