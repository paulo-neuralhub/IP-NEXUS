import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Type, Image as ImageIcon, Layers, Music, Box, 
  Target, Grid, Palette, Play, Sparkles, AlertCircle,
  Calendar, Flag, FileText, Upload, X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WizardFormData } from '../FilingWizard';
import { MARK_TYPES } from '@/types/filing.types';

interface Step4Props {
  formData: WizardFormData;
  updateFormData: (updates: Partial<WizardFormData>) => void;
  errors: Record<string, string[]>;
}

import { TypeSelectionCard } from '../SelectionCard';

const MARK_TYPE_CONFIG = [
  { value: 'word', label: 'Denominativa', icon: Type, description: 'Solo texto' },
  { value: 'figurative', label: 'Figurativa', icon: ImageIcon, description: 'Solo imagen' },
  { value: 'combined', label: 'Mixta', icon: Layers, description: 'Texto + imagen' },
  { value: 'sound', label: 'Sonora', icon: Music, description: 'Marca sonora' },
  { value: 'shape_3d', label: '3D', icon: Box, description: 'Tridimensional' },
  { value: 'position', label: 'Posición', icon: Target, description: 'Ubicación' },
  { value: 'pattern', label: 'Patrón', icon: Grid, description: 'Repetitivo' },
  { value: 'color', label: 'Color', icon: Palette, description: 'Color único' },
  { value: 'motion', label: 'Movimiento', icon: Play, description: 'Animación' },
  { value: 'hologram', label: 'Holograma', icon: Sparkles, description: 'Holográfica' },
];

const PRIORITY_COUNTRIES = [
  { code: 'ES', name: 'España' },
  { code: 'EU', name: 'Unión Europea' },
  { code: 'US', name: 'Estados Unidos' },
  { code: 'GB', name: 'Reino Unido' },
  { code: 'CN', name: 'China' },
  { code: 'JP', name: 'Japón' },
  { code: 'KR', name: 'Corea del Sur' },
  { code: 'IN', name: 'India' },
  { code: 'BR', name: 'Brasil' },
  { code: 'MX', name: 'México' },
];

export function Step4MarkDetails({ formData, updateFormData, errors }: Step4Props) {
  const [colorInput, setColorInput] = useState('');
  
  // If not trademark, show appropriate message
  if (formData.ip_type !== 'trademark') {
    return (
      <Card className="bg-muted/50">
        <CardContent className="p-8 text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">
            Detalles de {formData.ip_type === 'patent' ? 'Patente' : 'Diseño'}
          </h3>
          <p className="text-muted-foreground">
            Los formularios específicos para este tipo de PI están en desarrollo.
            Por ahora, puedes continuar con el paso de documentos para adjuntar
            la documentación técnica necesaria.
          </p>
        </CardContent>
      </Card>
    );
  }

  const renderError = (field: string) => {
    if (errors[field]) {
      return (
        <div className="flex items-center gap-1 text-destructive text-sm mt-1">
          <AlertCircle className="h-3 w-3" />
          {errors[field][0]}
        </div>
      );
    }
    return null;
  };

  const addColor = () => {
    if (colorInput.trim()) {
      const newColors = [...(formData.mark_colors || []), colorInput.trim()];
      updateFormData({ mark_colors: newColors });
      setColorInput('');
    }
  };

  const removeColor = (index: number) => {
    const newColors = formData.mark_colors?.filter((_, i) => i !== index) || [];
    updateFormData({ mark_colors: newColors });
  };

  return (
    <div className="space-y-6">
      {/* Mark Type Selection - Premium Grid */}
      <Card className="border-2">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Layers className="h-4 w-4 text-primary" />
            </div>
            Tipo de Marca
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {MARK_TYPE_CONFIG.map(type => {
              const isSelected = formData.mark_type === type.value;
              const Icon = type.icon;
              
              return (
                <TypeSelectionCard
                  key={type.value}
                  isSelected={isSelected}
                  onClick={() => updateFormData({ mark_type: type.value as any })}
                  icon={<Icon className="h-5 w-5" />}
                  label={type.label}
                  description={type.description}
                />
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Mark Name and Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Type className="h-5 w-5" />
            Denominación de la Marca
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mark_name">
              Nombre de la Marca *
            </Label>
            <Input
              id="mark_name"
              value={formData.mark_name || ''}
              onChange={(e) => updateFormData({ mark_name: e.target.value })}
              placeholder="Introduce el nombre de tu marca"
              className={cn("text-lg", errors.mark_name && "border-destructive")}
            />
            {renderError('mark_name')}
            <p className="text-xs text-muted-foreground">
              Escribe el nombre exactamente como quieres que se registre
            </p>
          </div>

          {/* Image upload for figurative/combined */}
          {(formData.mark_type === 'figurative' || formData.mark_type === 'combined') && (
            <div className="space-y-2">
              <Label>Imagen de la Marca</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">
                  Arrastra o haz clic para subir la imagen
                </p>
                <Button variant="outline" size="sm">
                  Seleccionar archivo
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Formatos: JPG, PNG. Tamaño máximo: 2MB. Resolución mínima: 300x300px
                </p>
              </div>
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="mark_description">
              Descripción de la Marca
            </Label>
            <Textarea
              id="mark_description"
              value={formData.mark_description || ''}
              onChange={(e) => updateFormData({ mark_description: e.target.value })}
              placeholder="Describe los elementos de la marca (opcional pero recomendado para marcas figurativas)"
              rows={3}
            />
          </div>

          {/* Colors */}
          <div className="space-y-2">
            <Label>Colores Reivindicados</Label>
            <div className="flex gap-2">
              <Input
                value={colorInput}
                onChange={(e) => setColorInput(e.target.value)}
                placeholder="Ej: Azul Pantone 286 C"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addColor())}
              />
              <Button type="button" variant="outline" onClick={addColor}>
                Añadir
              </Button>
            </div>
            {formData.mark_colors && formData.mark_colors.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.mark_colors.map((color, index) => (
                  <Badge key={index} variant="secondary" className="gap-1">
                    {color}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeColor(index)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Disclaimer */}
          <div className="space-y-2">
            <Label htmlFor="mark_disclaimer">
              Disclaimer / Renuncia
            </Label>
            <Input
              id="mark_disclaimer"
              value={formData.mark_disclaimer || ''}
              onChange={(e) => updateFormData({ mark_disclaimer: e.target.value })}
              placeholder="Elementos no protegibles (opcional)"
            />
            <p className="text-xs text-muted-foreground">
              Indica elementos descriptivos o genéricos que no forman parte de la protección
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Priority Claim */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Checkbox
              id="priority_claimed"
              checked={formData.priority_claimed}
              onCheckedChange={(checked) => updateFormData({ priority_claimed: checked as boolean })}
            />
            <Label htmlFor="priority_claimed" className="text-lg font-semibold cursor-pointer">
              <Flag className="inline h-5 w-5 mr-2" />
              Reivindicar Prioridad
            </Label>
          </div>
        </CardHeader>
        
        {formData.priority_claimed && (
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Si has presentado una solicitud anterior en los últimos 6 meses, puedes reivindicar su prioridad.
            </p>
            
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="priority_country">País de Prioridad</Label>
                <Select
                  value={formData.priority_country}
                  onValueChange={(value) => updateFormData({ priority_country: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar país" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITY_COUNTRIES.map(country => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority_date">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Fecha de Prioridad
                </Label>
                <Input
                  id="priority_date"
                  type="date"
                  value={formData.priority_date || ''}
                  onChange={(e) => updateFormData({ priority_date: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority_number">
                  <FileText className="inline h-4 w-4 mr-1" />
                  Nº de Solicitud
                </Label>
                <Input
                  id="priority_number"
                  value={formData.priority_number || ''}
                  onChange={(e) => updateFormData({ priority_number: e.target.value })}
                  placeholder="018123456"
                />
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}