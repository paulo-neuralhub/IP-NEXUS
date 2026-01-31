// ============================================================
// IP-NEXUS - NICE CLASS SELECTOR COMPONENT
// L128: Nice classification selector for trademark matters
// ============================================================

import { useState, useMemo } from 'react';
import { Check, Search, X, Package, Wrench } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

// Nice Classification data
const NICE_CLASSES = [
  { number: 1, title: 'Productos químicos', description: 'Productos químicos para la industria, ciencia y fotografía', category: 'products' },
  { number: 2, title: 'Pinturas', description: 'Pinturas, barnices, lacas, preservativos contra oxidación', category: 'products' },
  { number: 3, title: 'Cosméticos', description: 'Cosméticos y preparaciones de tocador no medicinales', category: 'products' },
  { number: 4, title: 'Aceites industriales', description: 'Aceites y grasas industriales, lubricantes, combustibles', category: 'products' },
  { number: 5, title: 'Productos farmacéuticos', description: 'Productos farmacéuticos, veterinarios e higiénicos', category: 'products' },
  { number: 6, title: 'Metales', description: 'Metales comunes y sus aleaciones, materiales de construcción metálicos', category: 'products' },
  { number: 7, title: 'Máquinas', description: 'Máquinas, máquinas herramientas y motores', category: 'products' },
  { number: 8, title: 'Herramientas manuales', description: 'Herramientas e instrumentos de mano accionados manualmente', category: 'products' },
  { number: 9, title: 'Electrónica', description: 'Aparatos e instrumentos científicos, electrónicos, informáticos', category: 'products' },
  { number: 10, title: 'Aparatos médicos', description: 'Aparatos e instrumentos quirúrgicos, médicos, dentales', category: 'products' },
  { number: 11, title: 'Iluminación', description: 'Aparatos de alumbrado, calefacción, refrigeración', category: 'products' },
  { number: 12, title: 'Vehículos', description: 'Vehículos y aparatos de locomoción terrestre, aérea o acuática', category: 'products' },
  { number: 13, title: 'Armas de fuego', description: 'Armas de fuego, municiones, proyectiles, explosivos', category: 'products' },
  { number: 14, title: 'Joyería', description: 'Metales preciosos y sus aleaciones, joyería, relojería', category: 'products' },
  { number: 15, title: 'Instrumentos musicales', description: 'Instrumentos musicales, estuches y accesorios', category: 'products' },
  { number: 16, title: 'Papel', description: 'Papel, cartón, impresos, material de oficina y papelería', category: 'products' },
  { number: 17, title: 'Caucho', description: 'Caucho, gutapercha, goma, plásticos semielaborados', category: 'products' },
  { number: 18, title: 'Cuero', description: 'Cuero y cuero de imitación, equipaje, bolsos, paraguas', category: 'products' },
  { number: 19, title: 'Materiales construcción', description: 'Materiales de construcción no metálicos, tubos rígidos', category: 'products' },
  { number: 20, title: 'Muebles', description: 'Muebles, espejos, marcos, productos de madera y sustitutos', category: 'products' },
  { number: 21, title: 'Utensilios cocina', description: 'Utensilios de cocina, cristalería, porcelana', category: 'products' },
  { number: 22, title: 'Cuerdas', description: 'Cuerdas, cordeles, redes, tiendas de campaña, toldos', category: 'products' },
  { number: 23, title: 'Hilos', description: 'Hilos e hilados para uso textil', category: 'products' },
  { number: 24, title: 'Tejidos', description: 'Tejidos y productos textiles, ropa de cama y mesa', category: 'products' },
  { number: 25, title: 'Ropa', description: 'Prendas de vestir, calzado, artículos de sombrerería', category: 'products' },
  { number: 26, title: 'Mercería', description: 'Encajes, bordados, cintas, botones, cremalleras', category: 'products' },
  { number: 27, title: 'Alfombras', description: 'Alfombras, felpudos, esteras, revestimientos de suelos', category: 'products' },
  { number: 28, title: 'Juegos', description: 'Juegos, juguetes, artículos de gimnasia y deporte', category: 'products' },
  { number: 29, title: 'Alimentos (carne)', description: 'Carne, pescado, frutas y legumbres en conserva', category: 'products' },
  { number: 30, title: 'Alimentos (cereales)', description: 'Café, té, cacao, arroz, pan, pastelería, confitería', category: 'products' },
  { number: 31, title: 'Productos agrícolas', description: 'Productos agrícolas, granos, frutas y verduras frescas', category: 'products' },
  { number: 32, title: 'Bebidas', description: 'Cervezas, aguas minerales, bebidas sin alcohol', category: 'products' },
  { number: 33, title: 'Bebidas alcohólicas', description: 'Bebidas alcohólicas (excepto cervezas), vinos, licores', category: 'products' },
  { number: 34, title: 'Tabaco', description: 'Tabaco, artículos para fumadores, cerillas', category: 'products' },
  { number: 35, title: 'Publicidad', description: 'Publicidad, gestión de negocios, administración comercial', category: 'services' },
  { number: 36, title: 'Seguros/Finanzas', description: 'Seguros, operaciones financieras e inmobiliarias', category: 'services' },
  { number: 37, title: 'Construcción', description: 'Servicios de construcción, reparación, instalación', category: 'services' },
  { number: 38, title: 'Telecomunicaciones', description: 'Servicios de telecomunicaciones', category: 'services' },
  { number: 39, title: 'Transporte', description: 'Transporte, embalaje y almacenamiento de mercancías', category: 'services' },
  { number: 40, title: 'Tratamiento materiales', description: 'Tratamiento de materiales, impresión, producción de energía', category: 'services' },
  { number: 41, title: 'Educación', description: 'Educación, formación, actividades deportivas y culturales', category: 'services' },
  { number: 42, title: 'Servicios científicos', description: 'Servicios científicos y tecnológicos, diseño industrial', category: 'services' },
  { number: 43, title: 'Restauración', description: 'Servicios de restauración, hospedaje temporal', category: 'services' },
  { number: 44, title: 'Servicios médicos', description: 'Servicios médicos, veterinarios, higiene y belleza', category: 'services' },
  { number: 45, title: 'Servicios jurídicos', description: 'Servicios jurídicos, seguridad, servicios personales', category: 'services' },
];

interface NiceClassSelectorProps {
  value: number[];
  onChange: (value: number[]) => void;
  disabled?: boolean;
}

export function NiceClassSelector({ value, onChange, disabled }: NiceClassSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<number[]>(value);

  const filteredClasses = useMemo(() => {
    if (!search) return NICE_CLASSES;
    const s = search.toLowerCase();
    return NICE_CLASSES.filter(
      (c) =>
        c.number.toString().includes(s) ||
        c.title.toLowerCase().includes(s) ||
        c.description.toLowerCase().includes(s)
    );
  }, [search]);

  const productClasses = filteredClasses.filter((c) => c.category === 'products');
  const serviceClasses = filteredClasses.filter((c) => c.category === 'services');

  const handleToggle = (num: number) => {
    setSelected((prev) =>
      prev.includes(num)
        ? prev.filter((n) => n !== num)
        : [...prev, num].sort((a, b) => a - b)
    );
  };

  const handleConfirm = () => {
    onChange(selected);
    setOpen(false);
  };

  const handleOpen = () => {
    setSelected(value);
    setOpen(true);
  };

  return (
    <>
      {/* Preview of selected classes */}
      <div
        onClick={disabled ? undefined : handleOpen}
        className={cn(
          'min-h-[48px] p-3 rounded-lg border-2 border-dashed transition-all',
          disabled
            ? 'opacity-50 cursor-not-allowed'
            : 'cursor-pointer hover:border-primary/50 hover:bg-muted/50'
        )}
      >
        {value.length === 0 ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Package className="h-4 w-4" />
            <span>Seleccionar clases Nice...</span>
          </div>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {value.map((num) => {
              const clase = NICE_CLASSES.find((c) => c.number === num);
              return (
                <Badge
                  key={num}
                  variant="secondary"
                  className="gap-1.5 pr-1"
                >
                  <span className="font-mono">{num}</span>
                  <span className="text-muted-foreground">·</span>
                  <span className="max-w-[100px] truncate">{clase?.title}</span>
                  {!disabled && (
                    <button
                      type="button"
                      className="ml-1 hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        onChange(value.filter((n) => n !== num));
                      }}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </Badge>
              );
            })}
          </div>
        )}
      </div>

      {/* Selection Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Seleccionar Clases Nice</DialogTitle>
          </DialogHeader>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por número, nombre o descripción..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Selected badges */}
          {selected.length > 0 && (
            <div className="flex flex-wrap gap-1.5 p-2 bg-muted/50 rounded-lg">
              {selected.map((num) => (
                <Badge
                  key={num}
                  variant="default"
                  className="gap-1 cursor-pointer"
                  onClick={() => handleToggle(num)}
                >
                  Clase {num}
                  <X className="h-3 w-3" />
                </Badge>
              ))}
            </div>
          )}

          {/* Class list */}
          <ScrollArea className="flex-1 -mx-6 px-6">
            <div className="space-y-6 py-2">
              {/* Products */}
              {productClasses.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3 sticky top-0 bg-background py-1">
                    <Package className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium text-muted-foreground">
                      PRODUCTOS (Clases 1-34)
                    </span>
                  </div>
                  <div className="space-y-1">
                    {productClasses.map((clase) => (
                      <div
                        key={clase.number}
                        className={cn(
                          'flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors',
                          selected.includes(clase.number)
                            ? 'bg-primary/10 border border-primary/30'
                            : 'hover:bg-muted/50'
                        )}
                        onClick={() => handleToggle(clase.number)}
                      >
                        <Checkbox
                          checked={selected.includes(clase.number)}
                          className="mt-0.5"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="font-mono">
                              {clase.number}
                            </Badge>
                            <span className="font-medium">{clase.title}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                            {clase.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Services */}
              {serviceClasses.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3 sticky top-0 bg-background py-1">
                    <Wrench className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm font-medium text-muted-foreground">
                      SERVICIOS (Clases 35-45)
                    </span>
                  </div>
                  <div className="space-y-1">
                    {serviceClasses.map((clase) => (
                      <div
                        key={clase.number}
                        className={cn(
                          'flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors',
                          selected.includes(clase.number)
                            ? 'bg-primary/10 border border-primary/30'
                            : 'hover:bg-muted/50'
                        )}
                        onClick={() => handleToggle(clase.number)}
                      >
                        <Checkbox
                          checked={selected.includes(clase.number)}
                          className="mt-0.5"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="font-mono">
                              {clase.number}
                            </Badge>
                            <span className="font-medium">{clase.title}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                            {clase.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {filteredClasses.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No se encontraron clases con "{search}"
                </div>
              )}
            </div>
          </ScrollArea>

          <DialogFooter className="border-t pt-4">
            <div className="flex items-center justify-between w-full">
              <span className="text-sm text-muted-foreground">
                {selected.length} clase(s) seleccionada(s)
              </span>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleConfirm}>
                  <Check className="h-4 w-4 mr-2" />
                  Confirmar
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
