// ============================================================
// IP-NEXUS - NICE CLASS WITH PRODUCTS SELECTOR
// L130: Enhanced selector with product selection within each class
// ============================================================

import { useState, useMemo } from 'react';
import { Check, Search, X, Package, Briefcase, ChevronRight, ChevronDown, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

// Nice Classification data with products
const NICE_CLASSES_WITH_PRODUCTS = [
  {
    number: 1,
    title: 'Productos químicos',
    icon: '🧪',
    category: 'products',
    products: [
      'Productos químicos para la industria',
      'Productos químicos para la ciencia',
      'Productos químicos para la fotografía',
      'Productos químicos para la agricultura',
      'Abonos para las tierras',
      'Adhesivos para la industria',
      'Materias plásticas en bruto',
    ]
  },
  {
    number: 2,
    title: 'Pinturas y barnices',
    icon: '🎨',
    category: 'products',
    products: [
      'Pinturas',
      'Barnices',
      'Lacas',
      'Preservativos contra la oxidación',
      'Materias tintóreas',
      'Mordientes',
      'Resinas naturales en bruto',
      'Metales en hojas para pintar',
    ]
  },
  {
    number: 3,
    title: 'Cosméticos',
    icon: '💄',
    category: 'products',
    products: [
      'Cosméticos',
      'Preparaciones de tocador no medicinales',
      'Dentífricos no medicinales',
      'Perfumes',
      'Aceites esenciales',
      'Preparaciones para blanquear',
      'Jabones',
      'Productos de limpieza',
    ]
  },
  {
    number: 4,
    title: 'Aceites industriales',
    icon: '🛢️',
    category: 'products',
    products: [
      'Aceites industriales',
      'Grasas industriales',
      'Lubricantes',
      'Combustibles',
      'Carburantes',
      'Materias para alumbrar',
      'Velas',
      'Mechas para iluminación',
    ]
  },
  {
    number: 5,
    title: 'Productos farmacéuticos',
    icon: '💊',
    category: 'products',
    products: [
      'Productos farmacéuticos',
      'Productos higiénicos y sanitarios',
      'Productos veterinarios',
      'Sustancias dietéticas para uso médico',
      'Alimentos para bebés',
      'Emplastos',
      'Material para apósitos',
      'Desinfectantes',
    ]
  },
  {
    number: 6,
    title: 'Metales',
    icon: '🔩',
    category: 'products',
    products: [
      'Metales comunes y sus aleaciones',
      'Minerales metalíferos',
      'Materiales de construcción metálicos',
      'Construcciones metálicas transportables',
      'Cables e hilos metálicos no eléctricos',
      'Cerrajería metálica',
      'Tubos metálicos',
      'Cajas de caudales',
    ]
  },
  {
    number: 7,
    title: 'Máquinas',
    icon: '⚙️',
    category: 'products',
    products: [
      'Máquinas',
      'Máquinas herramientas',
      'Motores (excepto para vehículos terrestres)',
      'Acoplamientos de transmisión',
      'Instrumentos agrícolas',
      'Incubadoras de huevos',
      'Distribuidores automáticos',
    ]
  },
  {
    number: 8,
    title: 'Herramientas manuales',
    icon: '🔧',
    category: 'products',
    products: [
      'Herramientas de mano accionadas manualmente',
      'Instrumentos de mano accionados manualmente',
      'Cuchillería',
      'Tenedores',
      'Cucharas',
      'Armas blancas',
      'Maquinillas de afeitar',
    ]
  },
  {
    number: 9,
    title: 'Electrónica',
    icon: '📱',
    category: 'products',
    products: [
      'Software de aplicaciones informáticas',
      'Aplicaciones móviles descargables',
      'Plataformas de software como servicio (SaaS)',
      'Ordenadores',
      'Ordenadores portátiles',
      'Teléfonos inteligentes',
      'Tabletas electrónicas',
      'Auriculares',
      'Altavoces',
      'Cámaras fotográficas',
      'Aparatos de navegación GPS',
      'Gafas de realidad virtual',
      'Relojes inteligentes',
      'Aparatos de grabación de sonido',
      'Aparatos de transmisión de sonido',
    ]
  },
  {
    number: 10,
    title: 'Aparatos médicos',
    icon: '🩺',
    category: 'products',
    products: [
      'Aparatos quirúrgicos',
      'Aparatos médicos',
      'Aparatos dentales',
      'Aparatos veterinarios',
      'Artículos ortopédicos',
      'Material de sutura',
      'Dispositivos terapéuticos',
      'Aparatos de masaje',
    ]
  },
  {
    number: 11,
    title: 'Iluminación',
    icon: '💡',
    category: 'products',
    products: [
      'Aparatos de alumbrado',
      'Aparatos de calefacción',
      'Aparatos de refrigeración',
      'Aparatos de secado',
      'Aparatos de ventilación',
      'Instalaciones de distribución de agua',
      'Instalaciones sanitarias',
    ]
  },
  {
    number: 12,
    title: 'Vehículos',
    icon: '🚗',
    category: 'products',
    products: [
      'Vehículos terrestres',
      'Vehículos aéreos',
      'Vehículos acuáticos',
      'Automóviles',
      'Motocicletas',
      'Bicicletas',
      'Patinetes eléctricos',
      'Cochecitos de niño',
      'Partes de vehículos',
    ]
  },
  {
    number: 13,
    title: 'Armas',
    icon: '🔫',
    category: 'products',
    products: [
      'Armas de fuego',
      'Municiones',
      'Proyectiles',
      'Explosivos',
      'Fuegos artificiales',
    ]
  },
  {
    number: 14,
    title: 'Joyería',
    icon: '💎',
    category: 'products',
    products: [
      'Metales preciosos y sus aleaciones',
      'Artículos de joyería',
      'Piedras preciosas',
      'Piedras semipreciosas',
      'Relojería',
      'Instrumentos cronométricos',
      'Bisutería',
      'Gemelos',
    ]
  },
  {
    number: 15,
    title: 'Instrumentos musicales',
    icon: '🎸',
    category: 'products',
    products: [
      'Instrumentos musicales',
      'Guitarras',
      'Pianos',
      'Violines',
      'Instrumentos de viento',
      'Instrumentos de percusión',
      'Estuches para instrumentos',
    ]
  },
  {
    number: 16,
    title: 'Papel y cartón',
    icon: '📄',
    category: 'products',
    products: [
      'Papel',
      'Cartón',
      'Productos de imprenta',
      'Material de encuadernación',
      'Fotografías',
      'Artículos de papelería',
      'Materiales de instrucción',
      'Material de embalaje de plástico',
    ]
  },
  {
    number: 17,
    title: 'Caucho y plástico',
    icon: '🧴',
    category: 'products',
    products: [
      'Caucho sin trabajar',
      'Gutapercha',
      'Goma',
      'Plásticos semielaborados',
      'Materiales para calafatear',
      'Materiales para obturar',
      'Tubos flexibles no metálicos',
    ]
  },
  {
    number: 18,
    title: 'Cuero y equipaje',
    icon: '👜',
    category: 'products',
    products: [
      'Cuero',
      'Imitaciones de cuero',
      'Pieles de animales',
      'Artículos de equipaje',
      'Bolsos',
      'Maletas',
      'Mochilas',
      'Paraguas',
      'Sombrillas',
      'Bastones',
      'Arneses',
    ]
  },
  {
    number: 19,
    title: 'Materiales construcción',
    icon: '🧱',
    category: 'products',
    products: [
      'Materiales de construcción no metálicos',
      'Madera de construcción',
      'Piedra',
      'Cemento',
      'Hormigón',
      'Baldosas',
      'Tejas',
      'Tuberías rígidas no metálicas',
    ]
  },
  {
    number: 20,
    title: 'Muebles',
    icon: '🪑',
    category: 'products',
    products: [
      'Muebles',
      'Espejos',
      'Marcos',
      'Contenedores no metálicos',
      'Hueso',
      'Asta',
      'Marfil',
      'Corcho',
      'Caña',
    ]
  },
  {
    number: 21,
    title: 'Utensilios cocina',
    icon: '🍳',
    category: 'products',
    products: [
      'Utensilios de cocina',
      'Utensilios de uso doméstico',
      'Peines',
      'Esponjas',
      'Cepillos',
      'Materiales para fabricar cepillos',
      'Cristalería',
      'Porcelana',
    ]
  },
  {
    number: 22,
    title: 'Cuerdas y redes',
    icon: '🪢',
    category: 'products',
    products: [
      'Cuerdas',
      'Cordeles',
      'Redes',
      'Tiendas de campaña',
      'Lonas',
      'Toldos',
      'Velas para embarcaciones',
      'Sacos',
      'Material para acolchar',
    ]
  },
  {
    number: 23,
    title: 'Hilos textiles',
    icon: '🧵',
    category: 'products',
    products: [
      'Hilos para uso textil',
      'Hilos de coser',
      'Hilos de bordar',
      'Hilo elástico',
      'Fibras textiles',
    ]
  },
  {
    number: 24,
    title: 'Tejidos',
    icon: '🧶',
    category: 'products',
    products: [
      'Tejidos',
      'Productos textiles',
      'Ropa de cama',
      'Ropa de mesa',
      'Mantelería',
      'Cortinas',
      'Tapicería textil',
    ]
  },
  {
    number: 25,
    title: 'Ropa y calzado',
    icon: '👕',
    category: 'products',
    products: [
      'Prendas de vestir',
      'Camisetas',
      'Camisas',
      'Pantalones',
      'Vestidos',
      'Faldas',
      'Chaquetas',
      'Abrigos',
      'Jerseys',
      'Sudaderas',
      'Ropa deportiva',
      'Ropa interior',
      'Calzado',
      'Zapatos',
      'Botas',
      'Zapatillas deportivas',
      'Sombreros',
      'Gorras',
    ]
  },
  {
    number: 26,
    title: 'Mercería',
    icon: '🪡',
    category: 'products',
    products: [
      'Encajes',
      'Bordados',
      'Cintas',
      'Cordones',
      'Botones',
      'Corchetes',
      'Alfileres',
      'Agujas',
      'Flores artificiales',
      'Cabello postizo',
    ]
  },
  {
    number: 27,
    title: 'Alfombras',
    icon: '🧺',
    category: 'products',
    products: [
      'Alfombras',
      'Felpudos',
      'Esteras',
      'Linóleo',
      'Revestimientos de suelos',
      'Tapices murales no textiles',
    ]
  },
  {
    number: 28,
    title: 'Juegos y juguetes',
    icon: '🎮',
    category: 'products',
    products: [
      'Juegos',
      'Juguetes',
      'Videojuegos',
      'Consolas de juegos',
      'Artículos de gimnasia',
      'Artículos de deporte',
      'Decoraciones para árboles de Navidad',
    ]
  },
  {
    number: 29,
    title: 'Alimentos (carne)',
    icon: '🥩',
    category: 'products',
    products: [
      'Carne',
      'Pescado',
      'Aves',
      'Caza',
      'Extractos de carne',
      'Frutas y verduras en conserva',
      'Jaleas',
      'Mermeladas',
      'Huevos',
      'Leche',
      'Productos lácteos',
      'Aceites y grasas comestibles',
    ]
  },
  {
    number: 30,
    title: 'Alimentos (cereales)',
    icon: '🍞',
    category: 'products',
    products: [
      'Café',
      'Té',
      'Cacao',
      'Sucedáneos del café',
      'Arroz',
      'Tapioca',
      'Harina',
      'Preparaciones a base de cereales',
      'Pan',
      'Pastelería',
      'Confitería',
      'Helados',
      'Miel',
      'Sal',
      'Mostaza',
      'Vinagre',
      'Salsas',
      'Condimentos',
      'Especias',
    ]
  },
  {
    number: 31,
    title: 'Productos agrícolas',
    icon: '🌾',
    category: 'products',
    products: [
      'Productos agrícolas',
      'Productos hortícolas',
      'Productos forestales',
      'Granos',
      'Semillas',
      'Frutas frescas',
      'Verduras frescas',
      'Plantas',
      'Flores naturales',
      'Animales vivos',
      'Alimentos para animales',
      'Malta',
    ]
  },
  {
    number: 32,
    title: 'Bebidas',
    icon: '🥤',
    category: 'products',
    products: [
      'Cervezas',
      'Aguas minerales',
      'Aguas gaseosas',
      'Bebidas sin alcohol',
      'Bebidas de frutas',
      'Zumos de frutas',
      'Siropes',
      'Preparaciones para hacer bebidas',
    ]
  },
  {
    number: 33,
    title: 'Bebidas alcohólicas',
    icon: '🍷',
    category: 'products',
    products: [
      'Bebidas alcohólicas (excepto cervezas)',
      'Vinos',
      'Licores',
      'Sidra',
      'Digestivos',
      'Aguardientes',
    ]
  },
  {
    number: 34,
    title: 'Tabaco',
    icon: '🚬',
    category: 'products',
    products: [
      'Tabaco',
      'Artículos para fumadores',
      'Cerillas',
      'Cigarrillos electrónicos',
      'Vaporizadores para fumadores',
    ]
  },
  // Services (35-45)
  {
    number: 35,
    title: 'Publicidad y negocios',
    icon: '📢',
    category: 'services',
    products: [
      'Servicios de publicidad',
      'Servicios de marketing',
      'Servicios de marketing digital',
      'Gestión de negocios comerciales',
      'Administración comercial',
      'Trabajos de oficina',
      'Servicios de venta al por menor',
      'Servicios de comercio electrónico',
      'Servicios de tiendas en línea',
      'Organización de ferias comerciales',
      'Estudios de mercado',
    ]
  },
  {
    number: 36,
    title: 'Seguros y finanzas',
    icon: '🏦',
    category: 'services',
    products: [
      'Servicios de seguros',
      'Operaciones financieras',
      'Operaciones monetarias',
      'Negocios inmobiliarios',
      'Servicios bancarios',
      'Gestión de fondos de inversión',
      'Servicios de corretaje',
    ]
  },
  {
    number: 37,
    title: 'Construcción',
    icon: '🏗️',
    category: 'services',
    products: [
      'Servicios de construcción',
      'Servicios de reparación',
      'Servicios de instalación',
      'Mantenimiento de edificios',
      'Reparación de vehículos',
      'Servicios de fontanería',
      'Servicios de electricidad',
    ]
  },
  {
    number: 38,
    title: 'Telecomunicaciones',
    icon: '📡',
    category: 'services',
    products: [
      'Servicios de telecomunicaciones',
      'Transmisión de datos',
      'Servicios de telefonía',
      'Servicios de videoconferencia',
      'Servicios de streaming',
      'Provisión de acceso a Internet',
      'Servicios de mensajería electrónica',
    ]
  },
  {
    number: 39,
    title: 'Transporte',
    icon: '🚚',
    category: 'services',
    products: [
      'Servicios de transporte',
      'Embalaje de mercancías',
      'Almacenamiento de mercancías',
      'Organización de viajes',
      'Servicios de mensajería',
      'Servicios de entrega',
      'Servicios de mudanzas',
    ]
  },
  {
    number: 40,
    title: 'Tratamiento materiales',
    icon: '🏭',
    category: 'services',
    products: [
      'Tratamiento de materiales',
      'Reciclaje de residuos',
      'Producción de energía',
      'Purificación de aire',
      'Tratamiento de aguas',
      'Impresión',
      'Encuadernación',
    ]
  },
  {
    number: 41,
    title: 'Educación y ocio',
    icon: '🎓',
    category: 'services',
    products: [
      'Servicios educativos',
      'Servicios de formación',
      'Cursos en línea',
      'Servicios de coaching',
      'Servicios de entretenimiento',
      'Organización de eventos',
      'Producción de espectáculos',
      'Servicios deportivos',
      'Producción cinematográfica',
      'Servicios de streaming de vídeo',
      'Servicios de juegos en línea',
      'Edición de libros',
    ]
  },
  {
    number: 42,
    title: 'Servicios científicos',
    icon: '🔬',
    category: 'services',
    products: [
      'Diseño y desarrollo de software',
      'Desarrollo de aplicaciones móviles',
      'Desarrollo de sitios web',
      'Diseño de sitios web',
      'Servicios de programación informática',
      'Servicios de computación en la nube',
      'Software como servicio (SaaS)',
      'Plataforma como servicio (PaaS)',
      'Alojamiento de sitios web',
      'Servicios de seguridad informática',
      'Servicios de consultoría tecnológica',
      'Servicios de análisis de datos',
      'Servicios de inteligencia artificial',
      'Investigación y desarrollo',
      'Servicios de diseño industrial',
    ]
  },
  {
    number: 43,
    title: 'Restauración',
    icon: '🍽️',
    category: 'services',
    products: [
      'Servicios de restaurante',
      'Servicios de cafetería',
      'Servicios de bar',
      'Servicios de catering',
      'Servicios de comida para llevar',
      'Servicios de entrega de comida',
      'Servicios de hotel',
      'Servicios de alojamiento temporal',
      'Reserva de alojamiento',
    ]
  },
  {
    number: 44,
    title: 'Servicios médicos',
    icon: '🏥',
    category: 'services',
    products: [
      'Servicios médicos',
      'Servicios veterinarios',
      'Servicios de higiene y belleza',
      'Servicios de peluquería',
      'Servicios de spa',
      'Servicios de agricultura',
      'Servicios de horticultura',
      'Servicios de silvicultura',
    ]
  },
  {
    number: 45,
    title: 'Servicios jurídicos',
    icon: '⚖️',
    category: 'services',
    products: [
      'Servicios jurídicos',
      'Servicios de abogados',
      'Servicios de seguridad',
      'Investigaciones de seguridad',
      'Licencias de propiedad intelectual',
      'Gestión de derechos de autor',
      'Servicios de mediación',
      'Servicios funerarios',
    ]
  },
];

// Selected products structure: { classNumber: string[] }
export interface NiceSelection {
  [classNumber: number]: string[];
}

interface NiceClassWithProductsSelectorProps {
  value: NiceSelection;
  onChange: (value: NiceSelection) => void;
  disabled?: boolean;
}

export function NiceClassWithProductsSelector({ value, onChange, disabled }: NiceClassWithProductsSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedTab, setSelectedTab] = useState<'all' | 'products' | 'services'>('all');
  const [expandedClasses, setExpandedClasses] = useState<number[]>([]);
  const [tempSelected, setTempSelected] = useState<NiceSelection>(value || {});
  const [customTermInput, setCustomTermInput] = useState<{ [key: number]: string }>({});

  // Open modal
  const handleOpen = () => {
    setTempSelected(value || {});
    setSearch('');
    setSelectedTab('all');
    setExpandedClasses(Object.keys(value || {}).map(Number).filter(k => (value || {})[k]?.length > 0));
    setOpen(true);
  };

  // Count totals
  const totalClasses = useMemo(() => Object.keys(tempSelected).filter(k => tempSelected[Number(k)]?.length > 0).length, [tempSelected]);
  const totalProducts = useMemo(() => Object.values(tempSelected).reduce((acc, arr) => acc + (arr?.length || 0), 0), [tempSelected]);
  
  const valueClasses = useMemo(() => Object.keys(value || {}).filter(k => (value || {})[Number(k)]?.length > 0).length, [value]);
  const valueProducts = useMemo(() => Object.values(value || {}).reduce((acc, arr) => acc + (arr?.length || 0), 0), [value]);

  // Filter classes
  const filteredClasses = useMemo(() => {
    let classes = NICE_CLASSES_WITH_PRODUCTS;
    
    if (selectedTab !== 'all') {
      classes = classes.filter(c => c.category === selectedTab);
    }
    
    if (search.trim()) {
      const s = search.toLowerCase();
      classes = classes.filter(c =>
        c.number.toString().includes(s) ||
        c.title.toLowerCase().includes(s) ||
        c.products.some(p => p.toLowerCase().includes(s))
      );
    }
    
    return classes;
  }, [search, selectedTab]);

  // Toggle class expansion
  const toggleExpanded = (classNum: number) => {
    setExpandedClasses(prev =>
      prev.includes(classNum)
        ? prev.filter(n => n !== classNum)
        : [...prev, classNum]
    );
  };

  // Toggle product selection
  const toggleProduct = (classNum: number, product: string) => {
    setTempSelected(prev => {
      const current = prev[classNum] || [];
      const updated = current.includes(product)
        ? current.filter(p => p !== product)
        : [...current, product];
      
      if (updated.length === 0) {
        const { [classNum]: _, ...rest } = prev;
        return rest;
      }
      
      return { ...prev, [classNum]: updated };
    });
  };

  // Select all products in a class
  const selectAllInClass = (classNum: number) => {
    const clase = NICE_CLASSES_WITH_PRODUCTS.find(c => c.number === classNum);
    if (!clase) return;
    
    setTempSelected(prev => ({
      ...prev,
      [classNum]: [...clase.products]
    }));
  };

  // Clear all in class
  const clearClass = (classNum: number) => {
    setTempSelected(prev => {
      const { [classNum]: _, ...rest } = prev;
      return rest;
    });
  };

  // Add custom term
  const addCustomTerm = (classNum: number) => {
    const term = customTermInput[classNum]?.trim();
    if (!term) return;
    
    setTempSelected(prev => ({
      ...prev,
      [classNum]: [...(prev[classNum] || []), term]
    }));
    setCustomTermInput(prev => ({ ...prev, [classNum]: '' }));
  };

  // Confirm
  const handleConfirm = () => {
    onChange(tempSelected);
    setOpen(false);
  };

  return (
    <>
      {/* Trigger */}
      <div
        onClick={disabled ? undefined : handleOpen}
        className={cn(
          'min-h-[60px] p-4 rounded-xl border-2 border-dashed transition-all',
          disabled
            ? 'opacity-50 cursor-not-allowed'
            : 'cursor-pointer hover:border-primary/50 hover:bg-muted/30'
        )}
      >
        {valueClasses === 0 ? (
          <div className="flex items-center gap-3 text-muted-foreground">
            <Package className="h-5 w-5" />
            <div>
              <p className="font-medium">Seleccionar clases y productos Nice</p>
              <p className="text-xs">Haz clic para elegir clases y sus productos específicos</p>
            </div>
            <ChevronRight className="h-4 w-4 ml-auto" />
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Badge variant="default" className="gap-1">
                <Package className="h-3 w-3" />
                {valueClasses} clase(s), {valueProducts} producto(s)
              </Badge>
              <span className="text-xs text-muted-foreground">Haz clic para editar</span>
            </div>
            <div className="space-y-2">
              {Object.entries(value || {}).filter(([_, products]) => products?.length > 0).slice(0, 3).map(([classNum, products]) => {
                const clase = NICE_CLASSES_WITH_PRODUCTS.find(c => c.number === Number(classNum));
                return (
                  <div key={classNum} className="text-sm bg-muted/50 rounded-lg p-2">
                    <div className="flex items-center gap-2 font-medium">
                      <span>{clase?.icon}</span>
                      <span>Clase {classNum}: {clase?.title}</span>
                      <Badge variant="secondary" className="text-xs ml-auto">
                        {products.length} productos
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                      {products.join('; ')}
                    </p>
                  </div>
                );
              })}
              {valueClasses > 3 && (
                <p className="text-xs text-muted-foreground">+{valueClasses - 3} clase(s) más...</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-4">
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Clasificación Nice - Clases y Productos
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              Selecciona las clases y los productos/servicios específicos para tu marca
            </p>
          </DialogHeader>

          {/* Controls */}
          <div className="px-6 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar clase o producto..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <Tabs value={selectedTab} onValueChange={(v) => setSelectedTab(v as any)}>
              <TabsList className="w-full">
                <TabsTrigger value="all" className="flex-1">Todas (45)</TabsTrigger>
                <TabsTrigger value="products" className="flex-1">
                  <Package className="h-3.5 w-3.5 mr-1.5" />
                  Productos (1-34)
                </TabsTrigger>
                <TabsTrigger value="services" className="flex-1">
                  <Briefcase className="h-3.5 w-3.5 mr-1.5" />
                  Servicios (35-45)
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Summary */}
            {totalProducts > 0 && (
              <div className="flex items-center justify-between p-2 bg-primary/10 rounded-lg">
                <span className="text-sm font-medium">
                  {totalClasses} clase(s) con {totalProducts} producto(s) seleccionado(s)
                </span>
                <Button variant="ghost" size="sm" onClick={() => setTempSelected({})}>
                  Limpiar todo
                </Button>
              </div>
            )}
          </div>

          {/* Class List - Fixed height for scroll */}
          <div className="flex-1 min-h-0 px-6 mt-3 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 320px)' }}>
            <div className="space-y-2 pb-4">
              {filteredClasses.map((clase) => {
                const selectedProducts = tempSelected[clase.number] || [];
                const isExpanded = expandedClasses.includes(clase.number);
                const hasSelection = selectedProducts.length > 0;
                const isProduct = clase.category === 'products';

                return (
                  <Collapsible key={clase.number} open={isExpanded} onOpenChange={() => toggleExpanded(clase.number)}>
                    <CollapsibleTrigger asChild>
                      <div
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border",
                          hasSelection
                            ? isProduct
                              ? "border-blue-300 bg-blue-50 dark:bg-blue-950/30"
                              : "border-green-300 bg-green-50 dark:bg-green-950/30"
                            : "border-transparent hover:bg-muted/50"
                        )}
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="text-xl">{clase.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="font-mono text-xs">{clase.number}</Badge>
                            <span className="font-medium">{clase.title}</span>
                          </div>
                        </div>
                        {hasSelection && (
                          <Badge variant={isProduct ? "default" : "secondary"} className="bg-primary">
                            {selectedProducts.length} seleccionado(s)
                          </Badge>
                        )}
                      </div>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <div className="ml-8 mr-2 mt-2 p-4 bg-muted/30 rounded-lg space-y-3">
                        {/* Quick actions */}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => selectAllInClass(clase.number)}
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Seleccionar todos
                          </Button>
                          {hasSelection && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => clearClass(clase.number)}
                            >
                              <X className="h-3 w-3 mr-1" />
                              Limpiar
                            </Button>
                          )}
                        </div>

                        {/* Products grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {clase.products.map((product) => {
                            const isSelected = selectedProducts.includes(product);
                            return (
                              <label
                                key={product}
                                className={cn(
                                  "flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all",
                                  isSelected
                                    ? "bg-primary/10 border border-primary/30"
                                    : "hover:bg-muted"
                                )}
                              >
                                <Checkbox
                                  checked={isSelected}
                                  onCheckedChange={() => toggleProduct(clase.number, product)}
                                />
                                <span className="text-sm">{product}</span>
                              </label>
                            );
                          })}
                        </div>

                        {/* Custom terms */}
                        {selectedProducts.filter(p => !clase.products.includes(p)).length > 0 && (
                          <div className="pt-2 border-t">
                            <p className="text-xs font-medium text-muted-foreground mb-2">Términos personalizados:</p>
                            <div className="flex flex-wrap gap-1">
                              {selectedProducts.filter(p => !clase.products.includes(p)).map(term => (
                                <Badge key={term} variant="secondary" className="gap-1">
                                  {term}
                                  <button onClick={() => toggleProduct(clase.number, term)}>
                                    <X className="h-3 w-3" />
                                  </button>
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Add custom term */}
                        <div className="flex gap-2 pt-2 border-t">
                          <Input
                            placeholder="Añadir término personalizado..."
                            value={customTermInput[clase.number] || ''}
                            onChange={(e) => setCustomTermInput(prev => ({ ...prev, [clase.number]: e.target.value }))}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                addCustomTerm(clase.number);
                              }
                            }}
                            className="text-sm"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => addCustomTerm(clase.number)}
                            disabled={!customTermInput[clase.number]?.trim()}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                );
              })}

              {filteredClasses.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  No se encontraron clases con "{search}"
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <DialogFooter className="px-6 py-4 border-t bg-muted/30">
            <div className="flex items-center justify-between w-full">
              <span className="text-sm text-muted-foreground">
                {totalClasses} clase(s), {totalProducts} producto(s)
              </span>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleConfirm}>
                  <Check className="h-4 w-4 mr-2" />
                  Confirmar selección
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
