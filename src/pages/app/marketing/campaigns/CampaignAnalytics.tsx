import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useCampaignAnalytics, useCampaignSends } from '@/hooks/use-campaign-analytics';
import { 
  ArrowLeft, Download, Send, CheckCircle, Eye, MousePointer, 
  XCircle, AlertTriangle, Ban, ExternalLink, Loader2, TrendingUp, TrendingDown
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, Tooltip, CartesianGrid 
} from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function CampaignAnalytics() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  
  const { data: analytics, isLoading } = useCampaignAnalytics(id!);
  const { data: sends } = useCampaignSends(id!, activeTab !== 'all' ? activeTab : undefined);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Campaña no encontrada</p>
      </div>
    );
  }

  const { campaign, metrics, clicksByLink, clicksByDevice, opensByHour } = analytics;

  // Prepare chart data
  const opensByHourData = Object.entries(opensByHour || {})
    .map(([hour, count]) => ({ hour: `${hour}:00`, opens: count }))
    .sort((a, b) => parseInt(a.hour) - parseInt(b.hour));

  const deviceData = Object.entries(clicksByDevice || {}).map(([device, count]) => ({
    name: device === 'desktop' ? 'Escritorio' : device === 'mobile' ? 'Móvil' : device === 'tablet' ? 'Tablet' : device,
    value: count as number
  }));

  const mainMetrics = [
    { 
      label: 'Enviados', 
      value: metrics.sent, 
      percentage: '100%', 
      icon: Send, 
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    { 
      label: 'Entregados', 
      value: metrics.delivered, 
      percentage: `${metrics.deliveryRate}%`, 
      icon: CheckCircle, 
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    { 
      label: 'Abiertos', 
      value: metrics.opened, 
      percentage: `${metrics.openRate}%`, 
      icon: Eye, 
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      trend: 2.1 // Mock trend
    },
    { 
      label: 'Clicks', 
      value: metrics.clicked, 
      percentage: `${metrics.clickRate}%`, 
      icon: MousePointer, 
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      trend: -0.3 // Mock trend
    },
  ];

  const secondaryMetrics = [
    { label: 'Rebotados', value: metrics.bounced, percentage: `${metrics.bounceRate}%`, icon: XCircle, color: 'text-red-600' },
    { label: 'Bajas', value: metrics.unsubscribed, percentage: `${metrics.unsubscribeRate}%`, icon: Ban, color: 'text-yellow-600' },
    { label: 'Spam', value: metrics.complained, percentage: '0%', icon: AlertTriangle, color: 'text-red-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/app/marketing/campaigns')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{campaign?.name} - Analytics</h1>
            <p className="text-muted-foreground">
              {campaign?.completed_at && (
                <>Enviada el {format(new Date(campaign.completed_at), 'dd/MM/yyyy', { locale: es })} a las {format(new Date(campaign.completed_at), 'HH:mm')}</>
              )}
            </p>
          </div>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {mainMetrics.map((metric) => (
          <Card key={metric.label}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                  <metric.icon className={`w-5 h-5 ${metric.color}`} />
                </div>
                {metric.trend !== undefined && (
                  <div className={`flex items-center text-sm ${metric.trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {metric.trend > 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                    {Math.abs(metric.trend)}%
                  </div>
                )}
              </div>
              <p className="text-3xl font-bold">{metric.value.toLocaleString()}</p>
              <p className="text-lg font-medium text-muted-foreground">{metric.percentage}</p>
              <p className="text-sm text-muted-foreground">{metric.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-3 gap-4">
        {secondaryMetrics.map((metric) => (
          <Card key={metric.label}>
            <CardContent className="p-4 flex items-center gap-4">
              <metric.icon className={`w-6 h-6 ${metric.color}`} />
              <div>
                <p className="text-2xl font-bold">{metric.value}</p>
                <p className="text-sm text-muted-foreground">{metric.label} ({metric.percentage})</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Opens by Hour */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Aperturas por Hora</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={opensByHourData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="opens" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    dot={{ fill: '#3B82F6' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Devices */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Dispositivos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center">
              {deviceData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={deviceData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {deviceData.map((_, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground">Sin datos de dispositivos</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Links Clicked */}
      {clicksByLink.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Links más Clickeados</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead className="text-right">Clicks</TableHead>
                  <TableHead className="text-right">%</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clicksByLink.slice(0, 10).map((link, index) => {
                  const totalClicks = clicksByLink.reduce((sum, l) => sum + l.clicks, 0);
                  const percentage = totalClicks > 0 ? ((link.clicks / totalClicks) * 100).toFixed(1) : '0';
                  return (
                    <TableRow key={index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <a 
                          href={link.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-primary hover:underline"
                        >
                          {link.url.length > 60 ? `${link.url.substring(0, 60)}...` : link.url}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </TableCell>
                      <TableCell className="text-right font-medium">{link.clicks}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{percentage}%</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Contact List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Contactos</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="opened">Abiertos</TabsTrigger>
              <TabsTrigger value="clicked">Clicks</TabsTrigger>
              <TabsTrigger value="bounced">Rebotados</TabsTrigger>
              <TabsTrigger value="unsubscribed">Bajas</TabsTrigger>
            </TabsList>
            
            <div className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contacto</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Aperturas</TableHead>
                    <TableHead>Clicks</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sends?.slice(0, 20).map((send: any) => (
                    <TableRow key={send.id}>
                      <TableCell className="font-medium">
                        {send.contact?.name || 'Sin nombre'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {send.contact?.email}
                      </TableCell>
                      <TableCell>
                        {send.open_count > 0 ? `${send.open_count} vez${send.open_count > 1 ? 'es' : ''}` : '-'}
                      </TableCell>
                      <TableCell>
                        {send.click_count > 0 ? `${send.click_count} click${send.click_count > 1 ? 's' : ''}` : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          send.status === 'delivered' || send.status === 'opened' || send.status === 'clicked' 
                            ? 'default' 
                            : send.status === 'bounced' || send.status === 'failed' 
                              ? 'destructive' 
                              : 'secondary'
                        }>
                          {send.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {(!sends || sends.length === 0) && (
                <p className="text-center py-8 text-muted-foreground">
                  No hay datos para mostrar
                </p>
              )}
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
