// =====================================================
// Quote to Matter Form - Create matter from quote item
// =====================================================

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FolderPlus, ChevronLeft, SkipForward, ArrowRight } from 'lucide-react';
import { useQuoteToMatter, QuoteItemWithMatterInfo } from '@/hooks/useQuoteToMatter';
import { useAuth } from '@/contexts/auth-context';
import { Matter } from '@/types/matters';
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const matterFormSchema = z.object({
  reference: z.string().min(1, 'Referencia requerida'),
  title: z.string().min(1, 'Título requerido'),
  type: z.string().min(1, 'Tipo requerido'),
  status: z.string().default('pending'),
  jurisdiction: z.string().optional(),
  jurisdiction_code: z.string().optional(),
  mark_name: z.string().optional(),
  mark_type: z.string().optional(),
  nice_classes: z.string().optional(),
  addClientAsOwner: z.boolean().default(true),
  importClientRelationships: z.boolean().default(false),
  linkInvoice: z.boolean().default(true),
  linkQuote: z.boolean().default(true),
});

type MatterFormData = z.infer<typeof matterFormSchema>;

interface Props {
  quoteId: string;
  quoteNumber: string;
  invoiceNumber?: string;
  item: QuoteItemWithMatterInfo;
  currentIndex: number;
  totalItems: number;
  onMatterCreated: (matter: Matter) => void;
  onSkip: () => void;
  onBack: () => void;
}

const JURISDICTIONS = [
  { code: 'ES', name: 'España', flag: '🇪🇸' },
  { code: 'EU', name: 'Unión Europea', flag: '🇪🇺' },
  { code: 'US', name: 'Estados Unidos', flag: '🇺🇸' },
  { code: 'WIPO', name: 'Internacional (Madrid)', flag: '🌐' },
  { code: 'GB', name: 'Reino Unido', flag: '🇬🇧' },
  { code: 'DE', name: 'Alemania', flag: '🇩🇪' },
  { code: 'FR', name: 'Francia', flag: '🇫🇷' },
  { code: 'CN', name: 'China', flag: '🇨🇳' },
  { code: 'JP', name: 'Japón', flag: '🇯🇵' },
];

const MATTER_TYPES = [
  { value: 'trademark', label: 'Marca' },
  { value: 'patent', label: 'Patente' },
  { value: 'design', label: 'Diseño' },
  { value: 'copyright', label: 'Derechos de autor' },
  { value: 'domain', label: 'Dominio' },
  { value: 'other', label: 'Otro' },
];

const MARK_TYPES = [
  { value: 'word', label: 'Denominativa' },
  { value: 'figurative', label: 'Figurativa' },
  { value: 'combined', label: 'Mixta' },
  { value: '3d', label: 'Tridimensional' },
  { value: 'sound', label: 'Sonora' },
  { value: 'other', label: 'Otra' },
];

export function QuoteToMatterForm({
  quoteId,
  quoteNumber,
  invoiceNumber,
  item,
  currentIndex,
  totalItems,
  onMatterCreated,
  onSkip,
  onBack,
}: Props) {
  const { user } = useAuth();
  const { createMatterFromQuote, isCreating } = useQuoteToMatter(quoteId);
  const [autoReference, setAutoReference] = useState(true);

  const form = useForm<MatterFormData>({
    resolver: zodResolver(matterFormSchema),
    defaultValues: {
      reference: 'auto',
      title: item.description,
      type: item.matter_type || 'trademark',
      status: 'pending',
      jurisdiction: item.matter_jurisdiction || '',
      jurisdiction_code: item.matter_jurisdiction || '',
      mark_name: '',
      mark_type: 'word',
      nice_classes: '',
      addClientAsOwner: true,
      importClientRelationships: false,
      linkInvoice: true,
      linkQuote: true,
    },
  });

  const watchType = form.watch('type');
  const isTrademark = watchType === 'trademark';

  const handleSubmit = async (data: MatterFormData) => {
    try {
      const niceClassesArray = data.nice_classes
        ? data.nice_classes.split(',').map(c => parseInt(c.trim())).filter(n => !isNaN(n))
        : undefined;

      const result = await createMatterFromQuote({
        quoteItemIds: [item.id],
        matterData: {
          reference: autoReference ? 'auto' : data.reference,
          title: data.title,
          type: data.type,
          status: data.status,
          jurisdiction: data.jurisdiction,
          jurisdiction_code: data.jurisdiction_code,
          mark_name: data.mark_name,
          mark_type: data.mark_type,
          nice_classes: niceClassesArray,
          assigned_to: user?.id,
        },
        options: {
          addClientAsOwner: data.addClientAsOwner,
          importClientRelationships: data.importClientRelationships,
          linkInvoice: data.linkInvoice,
          linkQuote: data.linkQuote,
        },
      });

      if (result.success && result.matter) {
        onMatterCreated(result.matter);
      }
    } catch (error) {
      console.error('Error creating matter:', error);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <FolderPlus className="h-5 w-5" />
          Crear Expediente
          <span className="text-sm font-normal text-muted-foreground ml-2">
            {currentIndex + 1} de {totalItems}
          </span>
        </DialogTitle>
        <DialogDescription>
          <span className="block">Servicio: {item.description}</span>
          <span className="text-xs">
            Presupuesto: {quoteNumber}
            {invoiceNumber && ` │ Factura: ${invoiceNumber}`}
          </span>
        </DialogDescription>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 py-4">
          {/* Reference and Title */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <FormField
                control={form.control}
                name="reference"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Referencia interna</FormLabel>
                    <div className="flex items-center gap-2">
                      <FormControl>
                        <Input
                          {...field}
                          disabled={autoReference}
                          placeholder="ACME-2025-001"
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setAutoReference(!autoReference)}
                      >
                        {autoReference ? 'Manual' : 'Auto'}
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título del expediente</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Registro marca ACME" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Type and Jurisdiction */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {MATTER_TYPES.map(t => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="jurisdiction"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jurisdicción</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      form.setValue('jurisdiction_code', value);
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {JURISDICTIONS.map(j => (
                        <SelectItem key={j.code} value={j.code}>
                          {j.flag} {j.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Trademark specific fields */}
          {isTrademark && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
              <h4 className="font-medium text-sm">Datos de la marca</h4>
              
              <FormField
                control={form.control}
                name="mark_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de la marca</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="ACME" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="mark_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de marca</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {MARK_TYPES.map(t => (
                            <SelectItem key={t.value} value={t.value}>
                              {t.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nice_classes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Clases Niza</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="9, 35, 42" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}

          {/* Options */}
          <div className="space-y-3 p-4 border rounded-lg">
            <h4 className="font-medium text-sm mb-3">Opciones</h4>
            
            <FormField
              control={form.control}
              name="addClientAsOwner"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="font-normal cursor-pointer">
                    Añadir cliente como titular
                  </FormLabel>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="linkInvoice"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="font-normal cursor-pointer">
                    Vincular factura al expediente
                  </FormLabel>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="linkQuote"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="font-normal cursor-pointer">
                    Vincular presupuesto al expediente
                  </FormLabel>
                </FormItem>
              )}
            />
          </div>
        </form>
      </Form>

      <DialogFooter className="flex-col sm:flex-row gap-2">
        <Button variant="ghost" onClick={onBack} disabled={isCreating}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          Anterior
        </Button>
        <div className="flex-1" />
        <Button variant="outline" onClick={onSkip} disabled={isCreating}>
          <SkipForward className="h-4 w-4 mr-1" />
          Saltar
        </Button>
        <Button onClick={form.handleSubmit(handleSubmit)} disabled={isCreating}>
          {isCreating ? 'Creando...' : (
            <>
              {currentIndex < totalItems - 1 ? 'Crear y continuar' : 'Crear expediente'}
              <ArrowRight className="h-4 w-4 ml-1" />
            </>
          )}
        </Button>
      </DialogFooter>
    </>
  );
}
