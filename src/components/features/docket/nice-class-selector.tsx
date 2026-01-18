import { useState, useRef, useEffect } from 'react';
import { X, Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const NICE_CLASSES = [
  { number: 1, description: 'Productos químicos' },
  { number: 2, description: 'Pinturas, barnices, lacas' },
  { number: 3, description: 'Cosméticos, preparaciones de tocador' },
  { number: 4, description: 'Aceites y grasas industriales' },
  { number: 5, description: 'Productos farmacéuticos' },
  { number: 6, description: 'Metales comunes y sus aleaciones' },
  { number: 7, description: 'Máquinas y máquinas herramientas' },
  { number: 8, description: 'Herramientas e instrumentos de mano' },
  { number: 9, description: 'Aparatos científicos, informáticos' },
  { number: 10, description: 'Aparatos médicos' },
  { number: 11, description: 'Aparatos de alumbrado, calefacción' },
  { number: 12, description: 'Vehículos' },
  { number: 13, description: 'Armas de fuego' },
  { number: 14, description: 'Metales preciosos, joyería' },
  { number: 15, description: 'Instrumentos musicales' },
  { number: 16, description: 'Papel, cartón, artículos de oficina' },
  { number: 17, description: 'Caucho, gutapercha, plásticos' },
  { number: 18, description: 'Cuero, artículos de viaje' },
  { number: 19, description: 'Materiales de construcción' },
  { number: 20, description: 'Muebles, espejos, marcos' },
  { number: 21, description: 'Utensilios de cocina' },
  { number: 22, description: 'Cuerdas, redes, tiendas de campaña' },
  { number: 23, description: 'Hilos para uso textil' },
  { number: 24, description: 'Tejidos y productos textiles' },
  { number: 25, description: 'Prendas de vestir, calzado' },
  { number: 26, description: 'Encajes, bordados, cintas' },
  { number: 27, description: 'Alfombras, revestimientos de suelos' },
  { number: 28, description: 'Juegos, juguetes, artículos deportivos' },
  { number: 29, description: 'Carne, pescado, alimentos conservados' },
  { number: 30, description: 'Café, té, cacao, pastelería' },
  { number: 31, description: 'Productos agrícolas, animales vivos' },
  { number: 32, description: 'Cervezas, bebidas no alcohólicas' },
  { number: 33, description: 'Bebidas alcohólicas' },
  { number: 34, description: 'Tabaco, artículos para fumadores' },
  { number: 35, description: 'Publicidad, gestión de negocios' },
  { number: 36, description: 'Servicios financieros, seguros' },
  { number: 37, description: 'Servicios de construcción' },
  { number: 38, description: 'Telecomunicaciones' },
  { number: 39, description: 'Transporte, embalaje, almacenamiento' },
  { number: 40, description: 'Tratamiento de materiales' },
  { number: 41, description: 'Educación, formación, entretenimiento' },
  { number: 42, description: 'Servicios científicos y tecnológicos' },
  { number: 43, description: 'Servicios de restauración, hospedaje' },
  { number: 44, description: 'Servicios médicos, veterinarios' },
  { number: 45, description: 'Servicios jurídicos, seguridad' },
];

interface NiceClassSelectorProps {
  value: number[];
  onChange: (classes: number[]) => void;
}

export function NiceClassSelector({ value, onChange }: NiceClassSelectorProps) {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const filtered = NICE_CLASSES.filter(c => 
    c.number.toString().includes(search) || 
    c.description.toLowerCase().includes(search.toLowerCase())
  );
  
  const toggleClass = (num: number) => {
    if (value.includes(num)) {
      onChange(value.filter(n => n !== num));
    } else {
      onChange([...value, num].sort((a, b) => a - b));
    }
  };
  
  return (
    <div className="space-y-2" ref={containerRef}>
      {/* Selected classes */}
      <div className="flex flex-wrap gap-2">
        {value.map(num => (
          <Badge key={num} variant="secondary" className="pl-2 pr-1 gap-1">
            Clase {num}
            <button 
              type="button"
              onClick={() => toggleClass(num)} 
              className="ml-1 hover:text-destructive"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1 px-2 py-1 text-sm text-primary hover:bg-primary/10 rounded"
        >
          <Plus className="w-4 h-4" /> Añadir clase
        </button>
      </div>
      
      {/* Dropdown */}
      {isOpen && (
        <div className="border rounded-lg p-2 bg-card shadow-lg max-h-60 overflow-auto z-50">
          <div className="relative mb-2">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar clase..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          <div className="space-y-1">
            {filtered.map(c => (
              <button
                key={c.number}
                type="button"
                onClick={() => toggleClass(c.number)}
                className={cn(
                  "w-full text-left px-2 py-1.5 rounded text-sm hover:bg-muted flex items-center gap-2",
                  value.includes(c.number) && "bg-primary/10"
                )}
              >
                <span className="font-medium min-w-[50px]">Clase {c.number}</span>
                <span className="text-muted-foreground truncate">{c.description}</span>
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-2">
                No se encontraron clases
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
