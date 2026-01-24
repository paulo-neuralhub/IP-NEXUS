import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ListTodo,
  FolderTree,
  Mail,
  Settings,
  Zap,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { useSmartTasks } from '@/hooks/docket';
import { SmartTasksPanel } from './SmartTasksPanel';
import { PortfoliosPanel } from './PortfoliosPanel';
import { EmailIngestionPanel } from './EmailIngestionPanel';
import { RulesConfigPanel } from './RulesConfigPanel';
import { FeatureHelp, FEATURE_HELP_CONTENT } from '@/components/ui/feature-help';

interface DocketStats {
  totalTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  completedToday: number;
  upcomingThisWeek: number;
}

export function CommandCenter({ afterStats }: { afterStats?: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState('tasks');
  
  const { data: allTasks = [] } = useSmartTasks();
  const { data: overdueTasks = [] } = useSmartTasks({ isOverdue: true });
  
  const today = new Date().toISOString().split('T')[0];
  const weekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const stats: DocketStats = {
    totalTasks: allTasks.length,
    pendingTasks: allTasks.filter(t => t.status === 'pending').length,
    overdueTasks: overdueTasks.length,
    completedToday: allTasks.filter(t => 
      t.status === 'completed' && 
      t.completed_at?.startsWith(today)
    ).length,
    upcomingThisWeek: allTasks.filter(t => 
      t.due_date >= today && 
      t.due_date <= weekFromNow &&
      t.status !== 'completed'
    ).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Zap className="h-6 w-6 text-warning" />
            Command Center
          </h1>
          <p className="text-muted-foreground">
            Control centralizado de tu cartera de PI
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
        <StatsCard
          title="Tareas Totales"
          value={stats.totalTasks}
          icon={ListTodo}
          color="text-primary"
        />
        <StatsCard
          title="Pendientes"
          value={stats.pendingTasks}
          icon={Clock}
          color="text-warning"
        />
        <StatsCard
          title="Vencidas"
          value={stats.overdueTasks}
          icon={AlertTriangle}
          color="text-destructive"
          highlight={stats.overdueTasks > 0}
        />
        <StatsCard
          title="Completadas Hoy"
          value={stats.completedToday}
          icon={CheckCircle2}
          color="text-success"
        />
        <StatsCard
          title="Esta Semana"
          value={stats.upcomingThisWeek}
          icon={Calendar}
          color="text-info"
        />
      </div>

      {afterStats ? <div className="-mt-2">{afterStats}</div> : null}

      {/* Urgent Alerts */}
      {stats.overdueTasks > 0 && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-destructive flex items-center gap-2 text-base">
              <AlertTriangle className="h-5 w-5" />
              Alertas Urgentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-sm text-destructive/90">
                Tienes <strong>{stats.overdueTasks}</strong> tarea(s) vencida(s) que requieren atención inmediata
              </p>
              <Button 
                size="sm" 
                variant="destructive"
                onClick={() => setActiveTab('tasks')}
              >
                Ver Vencidas
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex items-center gap-2">
          <TabsList className="grid grid-cols-4 lg:w-[600px]">
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <ListTodo className="h-4 w-4" />
              <span className="hidden sm:inline">Smart Tasks</span>
              {stats.pendingTasks > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {stats.pendingTasks}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="portfolios" className="flex items-center gap-2">
              <FolderTree className="h-4 w-4" />
              <span className="hidden sm:inline">Portfolios</span>
            </TabsTrigger>
            <TabsTrigger value="ingestion" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span className="hidden sm:inline">Ingesta</span>
            </TabsTrigger>
            <TabsTrigger value="rules" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Reglas</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Contextual Help - updates based on active tab */}
          <FeatureHelp 
            {...(activeTab === 'tasks' ? FEATURE_HELP_CONTENT.smartTasks :
                 activeTab === 'portfolios' ? FEATURE_HELP_CONTENT.portfolios :
                 activeTab === 'ingestion' ? FEATURE_HELP_CONTENT.emailIngestion :
                 FEATURE_HELP_CONTENT.jurisdictionRules)}
          />
        </div>

        <TabsContent value="tasks" className="space-y-4">
          <SmartTasksPanel />
        </TabsContent>

        <TabsContent value="portfolios" className="space-y-4">
          <PortfoliosPanel />
        </TabsContent>

        <TabsContent value="ingestion" className="space-y-4">
          <EmailIngestionPanel />
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <RulesConfigPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
  highlight?: boolean;
}

function StatsCard({ title, value, icon: Icon, color, highlight }: StatsCardProps) {
  return (
    <Card
      className={
        highlight
          ? 'border-destructive/30 bg-destructive/5'
          : 'bg-muted/40 border-border/60'
      }
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 py-3">
        <CardTitle className="text-xs font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent className="pt-0 pb-3">
        <div className={`text-xl font-semibold tracking-tight ${highlight ? 'text-destructive' : ''}`}>
          {value}
        </div>
      </CardContent>
    </Card>
  );
}
