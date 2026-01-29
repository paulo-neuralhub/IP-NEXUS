import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Briefcase, Clock, Building, Euro, TrendingUp, 
  Settings, ChevronRight, FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePageTitle } from '@/contexts/page-context';

const reportTypes = [
  {
    id: 'expedientes',
    title: 'Expedientes',
    description: 'Lista de expedientes con filtros por estado, tipo, cliente y fechas',
    icon: Briefcase,
    color: 'bg-blue-500',
    href: '/app/reportes/expedientes',
  },
  {
    id: 'plazos',
    title: 'Plazos',
    description: 'Plazos pendientes, vencidos y próximos por rango de fechas',
    icon: Clock,
    color: 'bg-amber-500',
    href: '/app/reportes/plazos',
  },
  {
    id: 'clientes',
    title: 'Clientes',
    description: 'Actividad y expedientes por cliente',
    icon: Building,
    color: 'bg-emerald-500',
    href: '/app/reportes/clientes',
  },
  {
    id: 'financiero',
    title: 'Financiero',
    description: 'Facturación, costes y rentabilidad por período',
    icon: Euro,
    color: 'bg-purple-500',
    href: '/app/reportes/financiero',
  },
  {
    id: 'productividad',
    title: 'Productividad',
    description: 'Rendimiento del equipo y carga de trabajo',
    icon: TrendingUp,
    color: 'bg-pink-500',
    href: '/app/reportes/productividad',
  },
  {
    id: 'personalizado',
    title: 'Personalizado',
    description: 'Crea un reporte a medida con los campos que necesites',
    icon: Settings,
    color: 'bg-slate-500',
    href: '/app/reportes/personalizado',
  },
];

export default function ReportesPage() {
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle('Reportes');
  }, [setTitle]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Reportes</h1>
            <p className="text-sm text-muted-foreground">
              Genera y exporta informes en PDF, Excel o CSV
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reportTypes.map((report) => (
          <Link key={report.id} to={report.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${report.color}`}>
                    <report.icon className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle className="text-lg">
                    {report.title}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  {report.description}
                </CardDescription>
                <Button variant="ghost" size="sm" className="w-full justify-between">
                  Generar reporte
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
