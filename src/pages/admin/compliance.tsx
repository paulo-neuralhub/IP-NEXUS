// src/pages/admin/compliance.tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  TrendingUp,
  Users,
  FileSearch,
  Activity,
  RefreshCw
} from 'lucide-react';
import { RiskScoreCard, ComplianceChecklist } from '@/components/market/compliance';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const riskDistribution = [
  { name: 'Bajo', value: 245, color: '#22c55e' },
  { name: 'Medio', value: 89, color: '#eab308' },
  { name: 'Alto', value: 23, color: '#f97316' },
  { name: 'Crítico', value: 5, color: '#ef4444' },
];

const checksOverTime = [
  { month: 'Oct', aml: 120, sanctions: 118, pep: 115, media: 110 },
  { month: 'Nov', aml: 145, sanctions: 142, pep: 140, media: 135 },
  { month: 'Dic', aml: 168, sanctions: 165, pep: 160, media: 155 },
  { month: 'Ene', aml: 180, sanctions: 178, pep: 175, media: 170 },
];

const pendingReviews = [
  { id: '1', user: 'empresa@ejemplo.com', type: 'AML', riskScore: 78, status: 'flagged' },
  { id: '2', user: 'agente@ip.com', type: 'PEP', riskScore: 65, status: 'flagged' },
  { id: '3', user: 'startup@tech.io', type: 'Sanctions', riskScore: 82, status: 'flagged' },
];

export default function ComplianceDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Compliance Dashboard
          </h1>
          <p className="text-muted-foreground">
            Monitoreo de cumplimiento y riesgo del marketplace
          </p>
        </div>
        
        <Button>
          <RefreshCw className="h-4 w-4 mr-2" />
          Ejecutar verificaciones
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">362</div>
                <p className="text-sm text-muted-foreground">Usuarios verificados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">28</div>
                <p className="text-sm text-muted-foreground">Requieren revisión</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">5</div>
                <p className="text-sm text-muted-foreground">Bloqueados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <FileSearch className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">1,245</div>
                <p className="text-sm text-muted-foreground">Checks este mes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Risk Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Distribución de Riesgo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {riskDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Checks Over Time */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Verificaciones por Mes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={checksOverTime}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="aml" fill="#3b82f6" name="AML" />
                  <Bar dataKey="sanctions" fill="#8b5cf6" name="Sanciones" />
                  <Bar dataKey="pep" fill="#f59e0b" name="PEP" />
                  <Bar dataKey="media" fill="#10b981" name="Medios" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Reviews */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Revisiones Pendientes
          </CardTitle>
          <CardDescription>
            Usuarios con alertas de compliance que requieren revisión manual
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pendingReviews.map((review) => (
              <div 
                key={review.id}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                    <Users className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium">{review.user}</p>
                    <div className="flex items-center gap-2 text-sm">
                      <Badge variant="outline">{review.type}</Badge>
                      <span className="text-muted-foreground">
                        Score: <span className="text-orange-600 font-medium">{review.riskScore}</span>
                      </span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Revisar
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
