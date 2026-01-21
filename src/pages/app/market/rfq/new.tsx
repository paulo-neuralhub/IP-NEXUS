import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  ChevronRight, 
  ChevronLeft,
  Loader2,
  Check
} from 'lucide-react';
import { 
  useCreateRfqRequest, 
  usePublishRfqRequest 
} from '@/hooks/market/useRfqRequests';
import { 
  SERVICE_CATEGORY_LABELS, 
  JURISDICTIONS,
  ServiceCategory,
  getServiceTypesByCategory
} from '@/types/quote-request';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  service_category: z.string().min(1, 'Selecciona una categoría'),
  service_type: z.string().min(1, 'Selecciona un tipo de servicio'),
  title: z.string().min(5, 'Mínimo 5 caracteres').max(100, 'Máximo 100 caracteres'),
  description: z.string().min(20, 'Describe tu necesidad con más detalle (mínimo 20 caracteres)'),
  jurisdictions: z.array(z.string()).min(1, 'Selecciona al menos una jurisdicción'),
  budget_min: z.number().optional(),
  budget_max: z.number().optional(),
  budget_currency: z.string().default('EUR'),
  urgency: z.enum(['urgent', 'normal', 'flexible']).default('normal'),
  is_blind: z.boolean().default(true),
  max_quotes: z.number().min(1).max(10).default(5),
});

type FormData = z.infer<typeof formSchema>;

export default function CreateRfqRequestPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const createMutation = useCreateRfqRequest();
  const publishMutation = usePublishRfqRequest();
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      service_category: '',
      service_type: '',
      title: '',
      description: '',
      jurisdictions: [],
      budget_currency: 'EUR',
      urgency: 'normal',
      is_blind: true,
      max_quotes: 5,
    },
  });
  
  const selectedCategory = form.watch('service_category') as ServiceCategory;
  const serviceTypes = selectedCategory ? getServiceTypesByCategory(selectedCategory) : [];
  
  const onSubmit = async (data: FormData) => {
    try {
      const request = await createMutation.mutateAsync({
        service_category: data.service_category as any,
        service_type: data.service_type as any,
        title: data.title,
        description: data.description,
        jurisdictions: data.jurisdictions,
        budget_min: data.budget_min,
        budget_max: data.budget_max,
        budget_currency: data.budget_currency,
        urgency: data.urgency,
        is_blind: data.is_blind,
        max_quotes: data.max_quotes,
      });
      
      // Publish immediately
      await publishMutation.mutateAsync(request.id);
      
      navigate(`/app/market/rfq/${request.id}`);
    } catch (error) {
      console.error(error);
    }
  };
  
  const canProceedStep1 = !!form.watch('service_type');
  const canProceedStep2 = 
    form.watch('title')?.length >= 5 && 
    form.watch('description')?.length >= 20 && 
    form.watch('jurisdictions')?.length > 0;
  
  const isSubmitting = createMutation.isPending || publishMutation.isPending;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Solicitar Presupuestos</h1>
        <p className="text-muted-foreground mt-1">
          Describe tu necesidad y recibe presupuestos de agentes verificados
        </p>
      </div>
      
      {/* Progress */}
      <div className="flex items-center gap-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div 
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                step > s 
                  ? "bg-green-500 text-white"
                  : step === s 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted text-muted-foreground"
              )}
            >
              {step > s ? <Check className="w-4 h-4" /> : s}
            </div>
            <span className={cn(
              "text-sm hidden sm:inline",
              step === s ? "text-foreground font-medium" : "text-muted-foreground"
            )}>
              {s === 1 ? 'Servicio' : s === 2 ? 'Detalles' : 'Preferencias'}
            </span>
            {s < 3 && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
          </div>
        ))}
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Step 1: Service Type */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>¿Qué servicio necesitas?</CardTitle>
                <CardDescription>
                  Selecciona la categoría y tipo de servicio de PI
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="service_category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoría</FormLabel>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {Object.entries(SERVICE_CATEGORY_LABELS).map(([key, config]) => (
                          <button
                            key={key}
                            type="button"
                            onClick={() => {
                              field.onChange(key);
                              form.setValue('service_type', '');
                            }}
                            className={cn(
                              "p-4 rounded-xl border-2 text-left transition-all",
                              field.value === key 
                                ? "border-primary bg-primary/5" 
                                : "border-border hover:border-primary/50"
                            )}
                          >
                            <div className="font-medium text-foreground">{config.es}</div>
                          </button>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {selectedCategory && serviceTypes.length > 0 && (
                  <FormField
                    control={form.control}
                    name="service_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de servicio</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona el servicio específico" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {serviceTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                <div className="flex justify-end pt-4">
                  <Button 
                    type="button" 
                    onClick={() => setStep(2)}
                    disabled={!canProceedStep1}
                  >
                    Continuar
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Step 2: Details */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Detalles de la solicitud</CardTitle>
                <CardDescription>
                  Describe tu necesidad con el mayor detalle posible
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Ej: Registro de marca ACME en España y UE" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe tu necesidad, el contexto, cualquier detalle relevante..."
                          rows={5}
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Cuanto más detalle proporciones, mejores presupuestos recibirás
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="jurisdictions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jurisdicciones</FormLabel>
                      <div className="flex flex-wrap gap-2">
                        {JURISDICTIONS.map((j) => {
                          const isSelected = field.value.includes(j.code);
                          return (
                            <button
                              key={j.code}
                              type="button"
                              onClick={() => {
                                if (isSelected) {
                                  field.onChange(field.value.filter(v => v !== j.code));
                                } else {
                                  field.onChange([...field.value, j.code]);
                                }
                              }}
                              className={cn(
                                "px-3 py-1.5 rounded-full border text-sm transition-all",
                                isSelected 
                                  ? "border-primary bg-primary text-primary-foreground" 
                                  : "border-border hover:border-primary"
                              )}
                            >
                              {j.name}
                            </button>
                          );
                        })}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-between pt-4">
                  <Button type="button" variant="outline" onClick={() => setStep(1)}>
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Atrás
                  </Button>
                  <Button 
                    type="button" 
                    onClick={() => setStep(3)}
                    disabled={!canProceedStep2}
                  >
                    Continuar
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Step 3: Preferences */}
          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Presupuesto y preferencias</CardTitle>
                <CardDescription>
                  Configura tus preferencias para los presupuestos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="budget_min"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Presupuesto mínimo (opcional)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="0" 
                            {...field}
                            value={field.value ?? ''}
                            onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="budget_max"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Presupuesto máximo (opcional)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="Sin límite" 
                            {...field}
                            value={field.value ?? ''}
                            onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="urgency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Urgencia</FormLabel>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { value: 'urgent', label: 'Urgente', desc: '< 1 semana' },
                          { value: 'normal', label: 'Normal', desc: '1-4 semanas' },
                          { value: 'flexible', label: 'Flexible', desc: 'Sin prisa' },
                        ].map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => field.onChange(option.value)}
                            className={cn(
                              "p-3 rounded-lg border-2 text-left transition-all",
                              field.value === option.value 
                                ? "border-primary bg-primary/5" 
                                : "border-border"
                            )}
                          >
                            <div className="font-medium text-foreground">{option.label}</div>
                            <div className="text-xs text-muted-foreground">{option.desc}</div>
                          </button>
                        ))}
                      </div>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="max_quotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Máximo de presupuestos a recibir</FormLabel>
                      <Select 
                        onValueChange={(v) => field.onChange(Number(v))} 
                        value={field.value.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {[3, 5, 7, 10].map((n) => (
                            <SelectItem key={n} value={n.toString()}>
                              {n} presupuestos
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="is_blind"
                  render={({ field }) => (
                    <FormItem className="flex items-start gap-3 space-y-0 rounded-lg border p-4">
                      <FormControl>
                        <Checkbox 
                          checked={field.value} 
                          onCheckedChange={field.onChange} 
                        />
                      </FormControl>
                      <div>
                        <FormLabel className="cursor-pointer">Presupuestos ciegos</FormLabel>
                        <FormDescription>
                          Los agentes no podrán ver los presupuestos de otros competidores
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-between pt-4">
                  <Button type="button" variant="outline" onClick={() => setStep(2)}>
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Atrás
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Publicar Solicitud
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </form>
      </Form>
    </div>
  );
}
