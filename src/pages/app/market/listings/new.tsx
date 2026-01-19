import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, ArrowRight, Save, Send, Upload, Plus, X,
  Store, Lightbulb, Type, Globe, Image as ImageIcon, Check
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  AssetType, 
  TransactionType, 
  ASSET_TYPE_CONFIG, 
  TRANSACTION_TYPE_CONFIG 
} from '@/types/market.types';
import { useMarketAssets, useCreateMarketListing } from '@/hooks/use-market';
import { cn } from '@/lib/utils';

const listingSchema = z.object({
  title: z.string().min(5, 'El título debe tener al menos 5 caracteres'),
  description: z.string().min(20, 'La descripción debe tener al menos 20 caracteres'),
  price: z.number().min(1, 'El precio debe ser mayor a 0'),
  currency: z.string().default('EUR'),
  asset_id: z.string().min(1, 'Debes seleccionar un activo'),
  transaction_types: z.array(z.string()).min(1, 'Selecciona al menos un tipo de transacción'),
  is_negotiable: z.boolean().default(true),
  visibility: z.enum(['public', 'private', 'unlisted']).default('public'),
});

type ListingFormData = z.infer<typeof listingSchema>;

const STEPS = [
  { id: 'asset', title: 'Seleccionar Activo', icon: Lightbulb },
  { id: 'details', title: 'Detalles del Listing', icon: Type },
  { id: 'pricing', title: 'Precio y Condiciones', icon: Store },
  { id: 'review', title: 'Revisar y Publicar', icon: Check },
];

export default function CreateListingPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTransactionTypes, setSelectedTransactionTypes] = useState<TransactionType[]>([]);

  const { data: assets, isLoading: assetsLoading } = useMarketAssets();
  const createListing = useCreateMarketListing();

  const form = useForm<ListingFormData>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      title: '',
      description: '',
      price: 0,
      currency: 'EUR',
      asset_id: '',
      transaction_types: [],
      is_negotiable: true,
      visibility: 'public',
    },
  });

  const selectedAssetId = form.watch('asset_id');
  const selectedAsset = assets?.find(a => a.id === selectedAssetId);

  const handleTransactionTypeToggle = (type: TransactionType) => {
    const newTypes = selectedTransactionTypes.includes(type)
      ? selectedTransactionTypes.filter(t => t !== type)
      : [...selectedTransactionTypes, type];
    setSelectedTransactionTypes(newTypes);
    form.setValue('transaction_types', newTypes);
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: ListingFormData) => {
    try {
      await createListing.mutateAsync({
        ...data,
        transaction_types: selectedTransactionTypes,
        status: 'draft',
      } as any);
      toast.success('Listing creado correctamente');
      navigate('/app/market/listings');
    } catch {
      toast.error('Error al crear el listing');
    }
  };

  const handleSaveDraft = async () => {
    const data = form.getValues();
    try {
      await createListing.mutateAsync({
        ...data,
        transaction_types: selectedTransactionTypes,
        status: 'draft',
      } as any);
      toast.success('Borrador guardado');
      navigate('/app/market/listings');
    } catch {
      toast.error('Error al guardar el borrador');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/app/market/listings')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Store className="h-6 w-6 text-market" />
              Crear Nuevo Listing
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Publica tu activo de PI en el marketplace
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={handleSaveDraft}>
          <Save className="h-4 w-4 mr-2" />
          Guardar Borrador
        </Button>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between">
        {STEPS.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors',
                  index <= currentStep
                    ? 'bg-primary border-primary text-primary-foreground'
                    : 'bg-background border-muted-foreground/30 text-muted-foreground'
                )}
              >
                <step.icon className="h-5 w-5" />
              </div>
              <span className={cn(
                'text-xs mt-1 font-medium',
                index <= currentStep ? 'text-primary' : 'text-muted-foreground'
              )}>
                {step.title}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={cn(
                  'h-0.5 w-16 mx-2 transition-colors',
                  index < currentStep ? 'bg-primary' : 'bg-muted-foreground/30'
                )}
              />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Step 1: Select Asset */}
        {currentStep === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Selecciona el Activo a Publicar</CardTitle>
              <CardDescription>
                Elige uno de tus activos de PI registrados para crear el listing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {assetsLoading ? (
                <div className="grid grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : assets && assets.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {assets.map(asset => {
                    const assetType = (asset as any).asset_type || (asset as any).type;
                    const config = assetType ? ASSET_TYPE_CONFIG[assetType as AssetType] : null;
                    const isSelected = selectedAssetId === asset.id;
                    return (
                      <div
                        key={asset.id}
                        onClick={() => form.setValue('asset_id', asset.id)}
                        className={cn(
                          'border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md',
                          isSelected 
                            ? 'border-primary bg-primary/5 ring-2 ring-primary' 
                            : 'hover:border-primary/50'
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                            {asset.images?.[0] ? (
                              <img src={asset.images[0]} alt={asset.title} className="w-full h-full object-cover rounded-lg" />
                            ) : (
                              <ImageIcon className="h-8 w-8 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium truncate">{asset.title}</h4>
                              {isSelected && (
                                <Check className="h-4 w-4 text-primary flex-shrink-0" />
                              )}
                            </div>
                            <Badge variant="secondary" className="text-xs mt-1">
                              {config?.labelEs || assetType || 'Activo'}
                            </Badge>
                            {asset.jurisdiction && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {asset.jurisdiction}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 border rounded-lg">
                  <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium mb-2">No tienes activos registrados</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Primero debes registrar tus activos de PI antes de publicarlos
                  </p>
                  <Button onClick={() => navigate('/app/market/assets')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Registrar Activo
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 2: Listing Details */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Detalles del Listing</CardTitle>
              <CardDescription>
                Describe tu activo para atraer compradores potenciales
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Título del Listing *</Label>
                <Input
                  id="title"
                  placeholder="Ej: Marca registrada ACME para sector tecnológico"
                  {...form.register('title')}
                />
                {form.formState.errors.title && (
                  <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe las características principales del activo, su valor estratégico y potencial..."
                  rows={6}
                  {...form.register('description')}
                />
                {form.formState.errors.description && (
                  <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>
                )}
              </div>

              <Separator />

              <div className="space-y-3">
                <Label>Tipos de Transacción Disponibles *</Label>
                <p className="text-sm text-muted-foreground">
                  Selecciona los tipos de operación que aceptarías
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {(Object.entries(TRANSACTION_TYPE_CONFIG) as [TransactionType, typeof TRANSACTION_TYPE_CONFIG[TransactionType]][]).map(([type, config]) => {
                    const isSelected = selectedTransactionTypes.includes(type);
                    return (
                      <div
                        key={type}
                        onClick={() => handleTransactionTypeToggle(type)}
                        className={cn(
                          'border rounded-lg p-3 cursor-pointer transition-all',
                          isSelected 
                            ? 'border-primary bg-primary/5' 
                            : 'hover:border-primary/50'
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <Checkbox checked={isSelected} />
                          <span className="text-sm font-medium">{config.labelEs}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 ml-6">
                          {config.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
                {form.formState.errors.transaction_types && (
                  <p className="text-sm text-destructive">{form.formState.errors.transaction_types.message}</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Pricing */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Precio y Condiciones</CardTitle>
              <CardDescription>
                Establece el precio y las condiciones de la transacción
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Precio *</Label>
                  <Input
                    id="price"
                    type="number"
                    min={0}
                    placeholder="50000"
                    {...form.register('price', { valueAsNumber: true })}
                  />
                  {form.formState.errors.price && (
                    <p className="text-sm text-destructive">{form.formState.errors.price.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Moneda</Label>
                  <Select
                    value={form.watch('currency')}
                    onValueChange={(v) => form.setValue('currency', v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EUR">€ EUR</SelectItem>
                      <SelectItem value="USD">$ USD</SelectItem>
                      <SelectItem value="GBP">£ GBP</SelectItem>
                      <SelectItem value="MXN">$ MXN</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="negotiable"
                  checked={form.watch('is_negotiable')}
                  onCheckedChange={(checked) => form.setValue('is_negotiable', !!checked)}
                />
                <Label htmlFor="negotiable" className="cursor-pointer">
                  Precio negociable
                </Label>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Visibilidad del Listing</Label>
                <Select
                  value={form.watch('visibility')}
                  onValueChange={(v) => form.setValue('visibility', v as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Público - Visible para todos
                      </div>
                    </SelectItem>
                    <SelectItem value="unlisted">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        No listado - Solo con enlace directo
                      </div>
                    </SelectItem>
                    <SelectItem value="private">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Privado - Solo invitados
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Review */}
        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Revisar y Publicar</CardTitle>
              <CardDescription>
                Verifica que toda la información sea correcta antes de publicar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Summary */}
              <div className="border rounded-lg p-4 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-24 h-24 rounded-lg bg-muted flex items-center justify-center">
                    {selectedAsset?.images?.[0] ? (
                      <img src={selectedAsset.images[0]} alt="" className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <ImageIcon className="h-10 w-10 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{form.watch('title') || 'Sin título'}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedAsset?.title} • {selectedAsset?.jurisdiction}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedTransactionTypes.map(type => (
                        <Badge key={type} variant="outline">
                          {TRANSACTION_TYPE_CONFIG[type]?.labelEs}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">
                      {form.watch('currency') === 'EUR' ? '€' : '$'}
                      {form.watch('price')?.toLocaleString()}
                    </p>
                    {form.watch('is_negotiable') && (
                      <p className="text-xs text-muted-foreground">Negociable</p>
                    )}
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-2">Descripción</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {form.watch('description') || 'Sin descripción'}
                  </p>
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-medium mb-2">Antes de publicar</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Tu listing será revisado antes de publicarse</li>
                  <li>• Recibirás una notificación cuando sea aprobado</li>
                  <li>• Podrás editar el listing en cualquier momento</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Anterior
          </Button>

          {currentStep < STEPS.length - 1 ? (
            <Button 
              type="button" 
              onClick={handleNext}
              disabled={currentStep === 0 && !selectedAssetId}
            >
              Siguiente
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button type="submit" disabled={createListing.isPending}>
              <Send className="h-4 w-4 mr-2" />
              {createListing.isPending ? 'Publicando...' : 'Publicar Listing'}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
