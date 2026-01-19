import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Search,
  FileText,
  Download,
  Calendar,
  Play,
  Star,
  StarOff,
  MoreVertical,
  Plus,
  Briefcase,
  Coins,
  Activity,
  Users,
  Clock,
  FileBarChart,
  TrendingUp,
  BarChart3,
  PieChart,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  useReportDefinitions, 
  useReportExecutions, 
  useRunReport,
  useToggleFavoriteReport,
  useAnalyticsStats 
} from '@/hooks/analytics/useAnalytics';
import { RunReportDialog } from './RunReportDialog';
import { AnalyticsStatsCards } from './AnalyticsStatsCards';

const CATEGORY_CONFIG: Record<string, { label: string; icon: typeof Briefcase; color: string }> = {
  portfolio: { label: 'Portfolio', icon: Briefcase, color: 'text-blue-500' },
  costs: { label: 'Costes', icon: Coins, color: 'text-green-500' },
  activity: { label: 'Actividad', icon: Activity, color: 'text-purple-500' },
  client: { label: 'Clientes', icon: Users, color: 'text-indigo-500' },
  custom: { label: 'Personalizados', icon: FileBarChart, color: 'text-gray-500' },
};

export function AnalyticsDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [showRunDialog, setShowRunDialog] = useState(false);

  const { data: reports, isLoading } = useReportDefinitions({
    category: activeCategory !== 'all' ? activeCategory : undefined
  });
  
  const { data: recentExecutions } = useReportExecutions({ limit: 5 });
  const { data: stats } = useAnalyticsStats();
  
  const runMutation = useRunReport();
  const favoriteMutation = useToggleFavoriteReport();

  const filteredReports = reports?.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRunReport = (report: any) => {
    if (report.config?.parameters?.length > 0) {
      setSelectedReport(report);
      setShowRunDialog(true);
    } else {
      runMutation.mutate({ reportId: report.id, params: {} });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Analytics & Reportes</h1>
          <p className="text-muted-foreground">
            Genera informes y analiza tu portfolio de PI
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Crear Reporte
        </Button>
      </div>

      {/* Stats Cards */}
      <AnalyticsStatsCards stats={stats} />

      {/* Recent Downloads */}
      {recentExecutions && recentExecutions.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Reportes Recientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {recentExecutions.filter(e => e.status === 'completed').map((exec: any) => (
                <div
                  key={exec.id}
                  className="flex items-center gap-3 p-3 border rounded-lg min-w-[250px] hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <FileText className="h-8 w-8 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{exec.report?.name || 'Reporte'}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(exec.created_at), 'dd MMM HH:mm', { locale: es })}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {exec.result_summary?.rows || 0} filas
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar reportes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList>
            <TabsTrigger value="all">Todos</TabsTrigger>
            {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
              <TabsTrigger key={key} value={key} className="hidden sm:flex">
                <config.icon className="h-4 w-4 mr-1" />
                {config.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Reports Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReports?.map((report) => {
            const category = CATEGORY_CONFIG[report.category as keyof typeof CATEGORY_CONFIG];
            const CategoryIcon = category?.icon || FileBarChart;
            
            return (
              <Card key={report.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <CategoryIcon className={`h-5 w-5 ${category?.color || 'text-gray-500'}`} />
                      <div>
                        <CardTitle className="text-base">{report.name}</CardTitle>
                        <Badge variant="outline" className="mt-1 text-xs">
                          {category?.label || report.category}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => favoriteMutation.mutate({ 
                          id: report.id, 
                          isFavorite: report.is_favorite 
                        })}
                      >
                        {report.is_favorite ? (
                          <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                        ) : (
                          <StarOff className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Calendar className="h-4 w-4 mr-2" />
                            Programar
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <FileText className="h-4 w-4 mr-2" />
                            Ver historial
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {report.description || 'Sin descripción'}
                  </p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-xs text-muted-foreground">
                      {report.run_count > 0 && (
                        <span>{report.run_count} ejecuciones</span>
                      )}
                    </div>
                    <div className="flex gap-1">
                      {report.available_formats?.slice(0, 3).map((fmt: string) => (
                        <Badge key={fmt} variant="secondary" className="text-xs">
                          {fmt.toUpperCase()}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Button 
                    className="w-full" 
                    onClick={() => handleRunReport(report)}
                    disabled={runMutation.isPending}
                  >
                    {runMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4 mr-2" />
                    )}
                    Generar Reporte
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {filteredReports?.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <FileBarChart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No hay reportes</h3>
          <p className="text-muted-foreground">
            {searchQuery ? 'No se encontraron reportes con ese criterio' : 'Crea tu primer reporte personalizado'}
          </p>
        </div>
      )}

      {/* Run Report Dialog */}
      <RunReportDialog
        report={selectedReport}
        open={showRunDialog}
        onClose={() => {
          setShowRunDialog(false);
          setSelectedReport(null);
        }}
        onRun={(params) => {
          runMutation.mutate({ reportId: selectedReport.id, params });
          setShowRunDialog(false);
          setSelectedReport(null);
        }}
      />
    </div>
  );
}
