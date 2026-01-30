// src/pages/app/settings/templates/index.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SectionHeader } from '@/components/help/SectionHeader';
import { 
  FileText, Receipt, FileCheck, Mail, BarChart3, 
  Palette, ChevronRight, Settings2, Star, RefreshCw, FileSignature
} from 'lucide-react';
import { useDocumentTemplates, DocumentType } from '@/hooks/useDocumentTemplates';
import { seedDocumentTemplates } from '@/lib/templates/seed-document-templates';
import { useToast } from '@/hooks/use-toast';

const TEMPLATE_TYPES: { type: DocumentType; label: string; icon: React.ElementType; color: string; description: string }[] = [
  { 
    type: 'invoice', 
    label: 'Facturas', 
    icon: Receipt, 
    color: 'text-finance bg-finance/10',
    description: 'Plantillas para facturas comerciales'
  },
  { 
    type: 'quote', 
    label: 'Presupuestos', 
    icon: FileText, 
    color: 'text-primary bg-primary/10',
    description: 'Plantillas para presupuestos y propuestas'
  },
  { 
    type: 'certificate', 
    label: 'Certificados', 
    icon: FileCheck, 
    color: 'text-warning bg-warning/10',
    description: 'Certificados de registro y presentación'
  },
  { 
    type: 'letter', 
    label: 'Cartas', 
    icon: Mail, 
    color: 'text-genius bg-genius/10',
    description: 'Cartas formales y notificaciones'
  },
  { 
    type: 'report', 
    label: 'Informes', 
    icon: BarChart3, 
    color: 'text-crm bg-crm/10',
    description: 'Informes de vigilancia y análisis'
  },
];

export default function TemplatesDashboardPage() {
  const { templates, isLoading } = useDocumentTemplates();
  const { toast } = useToast();
  const [isSeeding, setIsSeeding] = useState(false);

  const handleSeedTemplates = async () => {
    setIsSeeding(true);
    try {
      const result = await seedDocumentTemplates();
      toast({
        title: result.success ? 'Plantillas creadas' : 'Proceso completado con errores',
        description: `${result.inserted} insertadas, ${result.updated} actualizadas`,
        variant: result.success ? 'default' : 'destructive',
      });
      window.location.reload();
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudieron crear las plantillas', variant: 'destructive' });
    } finally {
      setIsSeeding(false);
    }
  };
  const countsByType = templates.reduce((acc, t) => {
    acc[t.document_type] = (acc[t.document_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Count defaults by type
  const defaultsByType = templates.reduce((acc, t) => {
    if (t.is_default) acc[t.document_type] = t.name;
    return acc;
  }, {} as Record<string, string>);

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-3">
        <FileText className="w-6 h-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Plantillas de Documentos</h1>
          <p className="text-sm text-muted-foreground">Gestiona las plantillas para facturas, presupuestos, certificados y más</p>
        </div>
      </div>

      {/* Branding Card */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
        <CardContent className="flex items-center justify-between py-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <Palette className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Identidad de Marca</h3>
              <p className="text-sm text-muted-foreground">
                Configura logo, colores y datos de empresa para todos los documentos
              </p>
            </div>
          </div>
          <Button asChild>
            <Link to="/app/settings/templates/branding">
              <Settings2 className="w-4 h-4 mr-2" />
              Configurar
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Seed Button */}
      <Card className="border-dashed">
        <CardContent className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <FileSignature className="w-5 h-5 text-muted-foreground" />
            <div>
              <div className="font-medium text-sm">Inicializar plantillas del sistema</div>
              <div className="text-xs text-muted-foreground">Crea las 20 plantillas base (5 estilos × 4 tipos)</div>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleSeedTemplates} disabled={isSeeding}>
            {isSeeding ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            {isSeeding ? 'Creando...' : 'Crear plantillas'}
          </Button>
        </CardContent>
      </Card>

      {/* Template Types Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {TEMPLATE_TYPES.map(({ type, label, icon: Icon, color, description }) => (
          <Link key={type} to={`/app/settings/templates/${type}`}>
            <Card className="h-full hover:shadow-md transition-shadow cursor-pointer group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className={`p-2 rounded-lg ${color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {countsByType[type] || 0} plantillas
                  </Badge>
                </div>
                <CardTitle className="text-lg mt-3">{label}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
              <CardContent>
                {defaultsByType[type] && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Star className="w-3 h-3 text-warning fill-warning" />
                    <span className="truncate">{defaultsByType[type]}</span>
                  </div>
                )}
                <div className="flex items-center justify-end mt-4 text-primary group-hover:translate-x-1 transition-transform">
                  <span className="text-sm font-medium mr-1">Ver plantillas</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Resumen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">{templates.length}</div>
              <div className="text-sm text-muted-foreground">Total plantillas</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-finance">
                {templates.filter(t => t.is_system_template).length}
              </div>
              <div className="text-sm text-muted-foreground">Del sistema</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">
                {templates.filter(t => !t.is_system_template).length}
              </div>
              <div className="text-sm text-muted-foreground">Personalizadas</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-warning">
                {templates.filter(t => t.is_default).length}
              </div>
              <div className="text-sm text-muted-foreground">Por defecto</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
