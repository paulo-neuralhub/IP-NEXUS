import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

// Las 45 clases Nice con nombres cortos
const NICE_CLASSES = [
  { value: 1, label: 'Productos químicos', type: 'products', emoji: '🧪' },
  { value: 2, label: 'Pinturas y barnices', type: 'products', emoji: '🎨' },
  { value: 3, label: 'Cosméticos y limpieza', type: 'products', emoji: '🧴' },
  { value: 4, label: 'Lubricantes y combustibles', type: 'products', emoji: '⛽' },
  { value: 5, label: 'Productos farmacéuticos', type: 'products', emoji: '💊' },
  { value: 6, label: 'Metales comunes', type: 'products', emoji: '🔩' },
  { value: 7, label: 'Máquinas y herramientas', type: 'products', emoji: '⚙️' },
  { value: 8, label: 'Herramientas manuales', type: 'products', emoji: '🔧' },
  { value: 9, label: 'Electrónica y software', type: 'products', emoji: '💻' },
  { value: 10, label: 'Aparatos médicos', type: 'products', emoji: '🩺' },
  { value: 11, label: 'Iluminación y climatización', type: 'products', emoji: '💡' },
  { value: 12, label: 'Vehículos', type: 'products', emoji: '🚗' },
  { value: 13, label: 'Armas y explosivos', type: 'products', emoji: '💣' },
  { value: 14, label: 'Joyería y relojes', type: 'products', emoji: '💎' },
  { value: 15, label: 'Instrumentos musicales', type: 'products', emoji: '🎸' },
  { value: 16, label: 'Papel y cartón', type: 'products', emoji: '📄' },
  { value: 17, label: 'Caucho y plásticos', type: 'products', emoji: '🔲' },
  { value: 18, label: 'Cuero y equipaje', type: 'products', emoji: '👜' },
  { value: 19, label: 'Materiales construcción', type: 'products', emoji: '🧱' },
  { value: 20, label: 'Muebles', type: 'products', emoji: '🪑' },
  { value: 21, label: 'Utensilios domésticos', type: 'products', emoji: '🍳' },
  { value: 22, label: 'Cuerdas y lonas', type: 'products', emoji: '🧵' },
  { value: 23, label: 'Hilos textiles', type: 'products', emoji: '🪡' },
  { value: 24, label: 'Tejidos y textiles', type: 'products', emoji: '🧶' },
  { value: 25, label: 'Prendas de vestir', type: 'products', emoji: '👕' },
  { value: 26, label: 'Mercería y bordados', type: 'products', emoji: '🧷' },
  { value: 27, label: 'Alfombras y tapices', type: 'products', emoji: '🏠' },
  { value: 28, label: 'Juegos y juguetes', type: 'products', emoji: '🎮' },
  { value: 29, label: 'Alimentos (carne, lácteos)', type: 'products', emoji: '🥩' },
  { value: 30, label: 'Alimentos (café, pan)', type: 'products', emoji: '☕' },
  { value: 31, label: 'Productos agrícolas', type: 'products', emoji: '🌾' },
  { value: 32, label: 'Bebidas sin alcohol', type: 'products', emoji: '🥤' },
  { value: 33, label: 'Bebidas alcohólicas', type: 'products', emoji: '🍷' },
  { value: 34, label: 'Tabaco', type: 'products', emoji: '🚬' },
  { value: 35, label: 'Publicidad y negocios', type: 'services', emoji: '📊' },
  { value: 36, label: 'Servicios financieros', type: 'services', emoji: '🏦' },
  { value: 37, label: 'Construcción y reparación', type: 'services', emoji: '🔨' },
  { value: 38, label: 'Telecomunicaciones', type: 'services', emoji: '📡' },
  { value: 39, label: 'Transporte y viajes', type: 'services', emoji: '✈️' },
  { value: 40, label: 'Tratamiento de materiales', type: 'services', emoji: '🏭' },
  { value: 41, label: 'Educación y entretenimiento', type: 'services', emoji: '🎓' },
  { value: 42, label: 'Servicios tecnológicos', type: 'services', emoji: '🔬' },
  { value: 43, label: 'Restauración y hospedaje', type: 'services', emoji: '🏨' },
  { value: 44, label: 'Servicios médicos', type: 'services', emoji: '🏥' },
  { value: 45, label: 'Servicios jurídicos', type: 'services', emoji: '⚖️' },
];

interface NiceClassSelectorProps {
  value: number[];
  onChange: (value: number[]) => void;
  multiple?: boolean;
  placeholder?: string;
  disabled?: boolean;
}

export function NiceClassSelector({
  value = [],
  onChange,
  multiple = true,
  placeholder = 'Seleccionar clases Nice...',
  disabled = false,
}: NiceClassSelectorProps) {
  const [open, setOpen] = useState(false);

  const toggleClass = (classNumber: number) => {
    if (multiple) {
      if (value.includes(classNumber)) {
        onChange(value.filter(v => v !== classNumber));
      } else {
        onChange([...value, classNumber].sort((a, b) => a - b));
      }
    } else {
      onChange([classNumber]);
      setOpen(false);
    }
  };

  const removeClass = (classNumber: number, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(value.filter(v => v !== classNumber));
  };

  const selectedClasses = NICE_CLASSES.filter(c => value.includes(c.value));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between min-h-10 h-auto"
          disabled={disabled}
        >
          <div className="flex flex-wrap gap-1 flex-1">
            {selectedClasses.length > 0 ? (
              selectedClasses.map(c => (
                <Badge key={c.value} variant="secondary" className="gap-1">
                  {c.emoji} {c.value}
                  {multiple && (
                    <X 
                      className="w-3 h-3 cursor-pointer hover:text-destructive" 
                      onClick={(e) => removeClass(c.value, e)}
                    />
                  )}
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar clase..." />
          <CommandList>
            <CommandEmpty>No se encontraron clases.</CommandEmpty>
            <ScrollArea className="h-[300px]">
              <CommandGroup heading="Productos (1-34)">
                {NICE_CLASSES.filter(c => c.type === 'products').map(niceClass => (
                  <CommandItem
                    key={niceClass.value}
                    value={`${niceClass.value} ${niceClass.label}`}
                    onSelect={() => toggleClass(niceClass.value)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value.includes(niceClass.value) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span className="mr-2">{niceClass.emoji}</span>
                    <span className="font-medium mr-2">{niceClass.value}.</span>
                    <span className="text-muted-foreground">{niceClass.label}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandGroup heading="Servicios (35-45)">
                {NICE_CLASSES.filter(c => c.type === 'services').map(niceClass => (
                  <CommandItem
                    key={niceClass.value}
                    value={`${niceClass.value} ${niceClass.label}`}
                    onSelect={() => toggleClass(niceClass.value)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value.includes(niceClass.value) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span className="mr-2">{niceClass.emoji}</span>
                    <span className="font-medium mr-2">{niceClass.value}.</span>
                    <span className="text-muted-foreground">{niceClass.label}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </ScrollArea>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export { NICE_CLASSES };
