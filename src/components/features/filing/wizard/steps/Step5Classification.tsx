import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  List, Search, AlertCircle, Plus, X, ChevronDown, ChevronUp,
  Package, Briefcase, Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WizardFormData } from '../FilingWizard';

interface Step5Props {
  formData: WizardFormData;
  updateFormData: (updates: Partial<WizardFormData>) => void;
  errors: Record<string, string[]>;
}

// Nice Classification (simplified - in production would be fetched from database)
const NICE_CLASSES = [
  { number: 1, title: 'Productos químicos', description: 'Productos químicos para la industria, la ciencia y la fotografía' },
  { number: 2, title: 'Pinturas y barnices', description: 'Pinturas, barnices, lacas; productos contra la herrumbre y el deterioro de la madera' },
  { number: 3, title: 'Cosméticos y productos de limpieza', description: 'Cosméticos y preparaciones de tocador no medicinales; dentífricos' },
  { number: 4, title: 'Aceites y grasas industriales', description: 'Aceites y grasas industriales, cera; lubricantes; combustibles' },
  { number: 5, title: 'Productos farmacéuticos', description: 'Productos farmacéuticos, preparaciones médicas y veterinarias' },
  { number: 6, title: 'Metales comunes', description: 'Metales comunes y sus aleaciones; materiales de construcción metálicos' },
  { number: 7, title: 'Máquinas', description: 'Máquinas y máquinas herramientas; motores' },
  { number: 8, title: 'Herramientas manuales', description: 'Herramientas e instrumentos de mano accionados manualmente' },
  { number: 9, title: 'Aparatos científicos y electrónicos', description: 'Aparatos científicos, de investigación, de navegación; software; ordenadores' },
  { number: 10, title: 'Aparatos médicos', description: 'Aparatos e instrumentos quirúrgicos, médicos, dentales y veterinarios' },
  { number: 11, title: 'Aparatos de alumbrado y calefacción', description: 'Aparatos de alumbrado, calefacción, refrigeración, ventilación' },
  { number: 12, title: 'Vehículos', description: 'Vehículos; aparatos de locomoción terrestre, aérea o acuática' },
  { number: 13, title: 'Armas de fuego', description: 'Armas de fuego; municiones y proyectiles; explosivos' },
  { number: 14, title: 'Joyería y relojería', description: 'Metales preciosos y sus aleaciones; artículos de joyería; relojes' },
  { number: 15, title: 'Instrumentos musicales', description: 'Instrumentos musicales; atriles y soportes para instrumentos musicales' },
  { number: 16, title: 'Papel y artículos de oficina', description: 'Papel y cartón; artículos de imprenta; material de oficina' },
  { number: 17, title: 'Caucho y plásticos', description: 'Caucho, gutapercha, goma, amianto, mica en bruto o semielaborados' },
  { number: 18, title: 'Artículos de cuero', description: 'Cuero y cuero de imitación; pieles de animales; artículos de equipaje' },
  { number: 19, title: 'Materiales de construcción no metálicos', description: 'Materiales de construcción no metálicos; monumentos no metálicos' },
  { number: 20, title: 'Muebles', description: 'Muebles, espejos, marcos; recipientes de madera o plástico' },
  { number: 21, title: 'Utensilios domésticos', description: 'Utensilios y recipientes para uso doméstico; cristalería, porcelana' },
  { number: 22, title: 'Cuerdas y fibras textiles', description: 'Cuerdas y cordeles; redes; tiendas de campaña' },
  { number: 23, title: 'Hilos para uso textil', description: 'Hilos e hilados para uso textil' },
  { number: 24, title: 'Tejidos y productos textiles', description: 'Tejidos y sus sustitutos; ropa de casa; cortinas' },
  { number: 25, title: 'Prendas de vestir', description: 'Prendas de vestir, calzado, artículos de sombrerería' },
  { number: 26, title: 'Mercería', description: 'Encajes, cordones y bordados; botones, ganchos, alfileres' },
  { number: 27, title: 'Alfombras y revestimientos', description: 'Alfombras, felpudos, esteras; revestimientos de suelos' },
  { number: 28, title: 'Juegos y juguetes', description: 'Juegos y juguetes; artículos de gimnasia y deporte' },
  { number: 29, title: 'Alimentos procesados', description: 'Carne, pescado, aves y caza; extractos de carne; frutas y verduras' },
  { number: 30, title: 'Alimentos básicos', description: 'Café, té, cacao; azúcar; arroz, pasta; harinas; pan, pastelería' },
  { number: 31, title: 'Productos agrícolas', description: 'Productos agrícolas, acuícolas, hortícolas y forestales en bruto' },
  { number: 32, title: 'Bebidas no alcohólicas', description: 'Cervezas; bebidas sin alcohol; aguas minerales y gaseosas' },
  { number: 33, title: 'Bebidas alcohólicas', description: 'Bebidas alcohólicas (excepto cervezas); preparaciones alcohólicas' },
  { number: 34, title: 'Tabaco', description: 'Tabaco y sucedáneos del tabaco; cigarrillos, puros' },
  { number: 35, title: 'Publicidad y negocios', description: 'Publicidad; gestión, organización y administración de negocios comerciales' },
  { number: 36, title: 'Servicios financieros', description: 'Servicios de seguros; operaciones financieras y monetarias; negocios inmobiliarios' },
  { number: 37, title: 'Construcción y reparación', description: 'Servicios de construcción; servicios de reparación; instalación' },
  { number: 38, title: 'Telecomunicaciones', description: 'Servicios de telecomunicaciones' },
  { number: 39, title: 'Transporte y almacenamiento', description: 'Transporte; embalaje y almacenamiento de mercancías; organización de viajes' },
  { number: 40, title: 'Tratamiento de materiales', description: 'Tratamiento de materiales; reciclaje de residuos y desechos' },
  { number: 41, title: 'Educación y entretenimiento', description: 'Educación; formación; servicios de entretenimiento; actividades deportivas' },
  { number: 42, title: 'Servicios científicos y tecnológicos', description: 'Servicios científicos y tecnológicos; diseño y desarrollo de software' },
  { number: 43, title: 'Hostelería', description: 'Servicios de restauración; hospedaje temporal' },
  { number: 44, title: 'Servicios médicos', description: 'Servicios médicos; servicios veterinarios; tratamientos de higiene y belleza' },
  { number: 45, title: 'Servicios jurídicos y de seguridad', description: 'Servicios jurídicos; servicios de seguridad; servicios personales y sociales' },
];

export function Step5Classification({ formData, updateFormData, errors }: Step5Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedClass, setExpandedClass] = useState<number | null>(null);

  // Filter to show only trademark classification (use ip_type not filing_type)
  if (formData.ip_type !== 'trademark') {
    return (
      <Card className="bg-muted/50">
        <CardContent className="p-8 text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">
            Clasificación para {formData.ip_type === 'patent' ? 'Patentes (IPC)' : 
                               formData.ip_type === 'design' ? 'Diseños (Locarno)' : 'Otro'}
          </h3>
          <p className="text-muted-foreground">
            La clasificación específica para este tipo de PI está en desarrollo.
            Puedes continuar al siguiente paso.
          </p>
        </CardContent>
      </Card>
    );
  }

  const filteredClasses = NICE_CLASSES.filter(cls =>
    cls.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cls.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cls.number.toString().includes(searchQuery)
  );

  const toggleClass = (classNumber: number) => {
    const currentClasses = formData.nice_classes || [];
    const newClasses = currentClasses.includes(classNumber)
      ? currentClasses.filter(c => c !== classNumber)
      : [...currentClasses, classNumber].sort((a, b) => a - b);
    
    // Also update goods_services if removing class
    if (!newClasses.includes(classNumber)) {
      const newGoodsServices = { ...formData.goods_services };
      delete newGoodsServices[classNumber];
      updateFormData({ nice_classes: newClasses, goods_services: newGoodsServices });
    } else {
      updateFormData({ nice_classes: newClasses });
    }
  };

  const updateGoodsServices = (classNumber: number, text: string) => {
    updateFormData({
      goods_services: {
        ...formData.goods_services,
        [classNumber]: text,
      }
    });
  };

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

  return (
    <div className="space-y-6">
      {/* Selected Classes Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <List className="h-5 w-5" />
            Clases Seleccionadas
            {formData.nice_classes.length > 0 && (
              <Badge className="ml-2">{formData.nice_classes.length}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {formData.nice_classes.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No has seleccionado ninguna clase todavía</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {formData.nice_classes.map(classNum => {
                const classInfo = NICE_CLASSES.find(c => c.number === classNum);
                return (
                  <Badge 
                    key={classNum} 
                    variant="secondary"
                    className="cursor-pointer hover:bg-destructive/10 gap-1"
                    onClick={() => toggleClass(classNum)}
                  >
                    Clase {classNum} - {classInfo?.title}
                    <X className="h-3 w-3" />
                  </Badge>
                );
              })}
            </div>
          )}
          {renderError('nice_classes')}
        </CardContent>
      </Card>

      {/* Class Selector */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Clasificación de Niza</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar clase..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Badge variant="outline" className="bg-blue-50 border-blue-200">
              <Package className="h-3 w-3 mr-1" />
              Clases 1-34: Productos
            </Badge>
            <Badge variant="outline" className="bg-purple-50 border-purple-200">
              <Briefcase className="h-3 w-3 mr-1" />
              Clases 35-45: Servicios
            </Badge>
          </div>

          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-2">
              {filteredClasses.map(cls => {
                const isSelected = formData.nice_classes.includes(cls.number);
                const isExpanded = expandedClass === cls.number;
                const isProducts = cls.number <= 34;
                
                return (
                  <div key={cls.number} className="border rounded-lg overflow-hidden">
                    <div
                      className={cn(
                        "flex items-center gap-3 p-3 cursor-pointer transition-colors",
                        isSelected 
                          ? "bg-primary/5 border-l-4 border-l-primary" 
                          : "hover:bg-muted/50"
                      )}
                      onClick={() => toggleClass(cls.number)}
                    >
                      <Checkbox 
                        checked={isSelected}
                        onCheckedChange={() => toggleClass(cls.number)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "min-w-[60px] justify-center",
                          isProducts 
                            ? "bg-blue-50 border-blue-200 text-blue-700"
                            : "bg-purple-50 border-purple-200 text-purple-700"
                        )}
                      >
                        Clase {cls.number}
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{cls.title}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {cls.description}
                        </p>
                      </div>
                      {isSelected && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedClass(isExpanded ? null : cls.number);
                          }}
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </div>
                    
                    {/* Goods/Services Input */}
                    {isSelected && isExpanded && (
                      <div className="p-4 bg-muted/30 border-t">
                        <Label className="text-sm mb-2 block">
                          Productos/Servicios para la Clase {cls.number}
                        </Label>
                        <Textarea
                          placeholder={`Describe los ${isProducts ? 'productos' : 'servicios'} que quieres proteger en esta clase...`}
                          value={formData.goods_services[cls.number] || ''}
                          onChange={(e) => updateGoodsServices(cls.number, e.target.value)}
                          rows={4}
                        />
                        <div className="flex items-center gap-2 mt-2">
                          <Button variant="outline" size="sm">
                            <Sparkles className="h-4 w-4 mr-1" />
                            Sugerir con IA
                          </Button>
                          <p className="text-xs text-muted-foreground">
                            Usa términos específicos del Clasificador de Niza
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
