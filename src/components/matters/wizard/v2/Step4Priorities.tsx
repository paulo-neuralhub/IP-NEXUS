// ============================================================
// IP-NEXUS - STEP 4: PRIORITIES & RELATED (V2)
// L132: Priority claims and related matters
// ============================================================

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, Link2, PlusCircle, Trash2, FileCheck, AlertCircle,
  Flag, FileText, Key, Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { MatterWizardState, WizardPriority, WizardRelatedMatter } from './types';

interface Step4PrioritiesProps {
  data: MatterWizardState['step4'];
  onChange: (data: Partial<MatterWizardState['step4']>) => void;
  matterType: string;
}

// Countries for priority
const PRIORITY_COUNTRIES = [
  { code: 'ES', label: 'España', flag: '🇪🇸' },
  { code: 'EU', label: 'Unión Europea', flag: '🇪🇺' },
  { code: 'US', label: 'Estados Unidos', flag: '🇺🇸' },
  { code: 'WO', label: 'Internacional', flag: '🌍' },
  { code: 'CN', label: 'China', flag: '🇨🇳' },
  { code: 'JP', label: 'Japón', flag: '🇯🇵' },
  { code: 'GB', label: 'Reino Unido', flag: '🇬🇧' },
  { code: 'DE', label: 'Alemania', flag: '🇩🇪' },
  { code: 'FR', label: 'Francia', flag: '🇫🇷' },
];

export function Step4Priorities({ data, onChange, matterType }: Step4PrioritiesProps) {
  const [showRelatedSearch, setShowRelatedSearch] = useState(false);
  
  const isTrademarkType = matterType?.startsWith('TM') || matterType === 'NC';
  const priorityMonths = isTrademarkType ? 6 : 12;

  // Add priority
  const addPriority = () => {
    const newPriority: WizardPriority = {
      country: '',
      number: '',
      date: '',
      documentReceived: false,
      certifiedCopy: false,
    };
    onChange({ priorities: [...data.priorities, newPriority] });
  };

  // Update priority
  const updatePriority = (index: number, updates: Partial<WizardPriority>) => {
    const updated = [...data.priorities];
    updated[index] = { ...updated[index], ...updates };
    onChange({ priorities: updated });
  };

  // Remove priority
  const removePriority = (index: number) => {
    const updated = [...data.priorities];
    updated.splice(index, 1);
    onChange({ priorities: updated });
  };

  // Add related matter
  const addRelatedMatter = (type: WizardRelatedMatter['relationshipType']) => {
    const newRelated: WizardRelatedMatter = {
      matterId: '',
      relationshipType: type,
    };
    onChange({ relatedMatters: [...data.relatedMatters, newRelated] });
  };

  // Remove related matter
  const removeRelatedMatter = (index: number) => {
    const updated = [...data.relatedMatters];
    updated.splice(index, 1);
    onChange({ relatedMatters: updated });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold mb-2">Prioridades y Relacionados</h2>
        <p className="text-muted-foreground">Reivindicaciones de prioridad y expedientes relacionados</p>
      </div>

      {/* PRIORITIES SECTION */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Prioridades Reivindicadas
            </CardTitle>
            <Button variant="outline" size="sm" onClick={addPriority}>
              <PlusCircle className="h-4 w-4 mr-1" />
              Añadir
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.priorities.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Flag className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No hay prioridades reivindicadas</p>
              <Button variant="link" size="sm" onClick={addPriority}>
                + Añadir prioridad
              </Button>
            </div>
          ) : (
            data.priorities.map((priority, index) => (
              <PriorityCard
                key={index}
                priority={priority}
                index={index}
                onUpdate={(updates) => updatePriority(index, updates)}
                onRemove={() => removePriority(index)}
                countries={PRIORITY_COUNTRIES}
              />
            ))
          )}

          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
            <AlertCircle className="h-3 w-3" />
            Plazo: {priorityMonths} meses desde la fecha de prioridad ({isTrademarkType ? 'marcas' : 'patentes'})
          </div>
        </CardContent>
      </Card>

      {/* RELATED MATTERS SECTION */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Link2 className="h-4 w-4" />
            Expedientes Relacionados
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <RadioGroup
              value=""
              onValueChange={(val) => addRelatedMatter(val as WizardRelatedMatter['relationshipType'])}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="derived_from" id="rel-derived" />
                <Label htmlFor="rel-derived" className="cursor-pointer">
                  Derivado de (división, continuación)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="related_to" id="rel-related" />
                <Label htmlFor="rel-related" className="cursor-pointer">
                  Relacionado con (familia)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="replaces" id="rel-replaces" />
                <Label htmlFor="rel-replaces" className="cursor-pointer">
                  Reemplaza a (renovación)
                </Label>
              </div>
            </RadioGroup>
          </div>

          {data.relatedMatters.length > 0 && (
            <div className="space-y-2 pt-2 border-t">
              {data.relatedMatters.map((related, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
                  <Badge variant="outline">
                    {related.relationshipType === 'derived_from' && 'Derivado de'}
                    {related.relationshipType === 'related_to' && 'Relacionado con'}
                    {related.relationshipType === 'replaces' && 'Reemplaza a'}
                  </Badge>
                  <Input
                    placeholder="Buscar expediente..."
                    className="flex-1 h-8"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => removeRelatedMatter(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ASSIGNMENTS & LICENSES SECTION */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Cesiones y Licencias
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <Checkbox
              id="has-assignment"
              checked={data.hasAssignment}
              onCheckedChange={(checked) => onChange({ hasAssignment: !!checked })}
            />
            <Label htmlFor="has-assignment" className="cursor-pointer flex items-center gap-2">
              <Key className="h-4 w-4 text-muted-foreground" />
              Existe cesión de derechos
            </Label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="has-license"
              checked={data.hasLicense}
              onCheckedChange={(checked) => onChange({ hasLicense: !!checked })}
            />
            <Label htmlFor="has-license" className="cursor-pointer flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-muted-foreground" />
              Existe licencia vigente
            </Label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="has-coownership"
              checked={data.hasCoOwnership}
              onCheckedChange={(checked) => onChange({ hasCoOwnership: !!checked })}
            />
            <Label htmlFor="has-coownership" className="cursor-pointer flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              Co-propiedad con terceros
            </Label>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Sub-components

interface PriorityCardProps {
  priority: WizardPriority;
  index: number;
  onUpdate: (updates: Partial<WizardPriority>) => void;
  onRemove: () => void;
  countries: { code: string; label: string; flag: string }[];
}

function PriorityCard({ priority, index, onUpdate, onRemove, countries }: PriorityCardProps) {
  const selectedCountry = countries.find(c => c.code === priority.country);
  
  return (
    <div className="p-4 border rounded-lg bg-muted/20 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          {selectedCountry && <span className="text-2xl">{selectedCountry.flag}</span>}
          <div>
            <p className="font-medium">
              {selectedCountry?.label || 'Nueva prioridad'}
            </p>
            {priority.number && (
              <p className="text-sm text-muted-foreground">{priority.number}</p>
            )}
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onRemove}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">País</Label>
          <Select
            value={priority.country}
            onValueChange={(val) => onUpdate({ country: val })}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent>
              {countries.map((c) => (
                <SelectItem key={c.code} value={c.code}>
                  {c.flag} {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Número</Label>
          <Input
            placeholder="M1234567"
            value={priority.number}
            onChange={(e) => onUpdate({ number: e.target.value })}
            className="h-9"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Fecha</Label>
          <Input
            type="date"
            value={priority.date}
            onChange={(e) => onUpdate({ date: e.target.value })}
            className="h-9"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-4 pt-2 border-t">
        <div className="flex items-center gap-2">
          <Checkbox
            id={`doc-received-${index}`}
            checked={priority.documentReceived}
            onCheckedChange={(checked) => onUpdate({ documentReceived: !!checked })}
          />
          <Label htmlFor={`doc-received-${index}`} className="text-xs cursor-pointer">
            Documento de prioridad recibido
          </Label>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id={`certified-${index}`}
            checked={priority.certifiedCopy}
            onCheckedChange={(checked) => onUpdate({ certifiedCopy: !!checked })}
          />
          <Label htmlFor={`certified-${index}`} className="text-xs cursor-pointer">
            Copia certificada
          </Label>
        </div>
      </div>
    </div>
  );
}
