import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useCampaigns, useDeleteCampaign, useUpdateCampaign } from '@/hooks/use-marketing';
import { 
  Plus, MoreHorizontal, Edit, Trash2, Eye, Send, Mail, 
  Copy, BarChart3, Clock, CheckCircle, XCircle, Users 
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { CAMPAIGN_STATUSES } from '@/lib/constants/marketing';

type TabValue = 'all' | 'draft' | 'scheduled' | 'sent';

export default function CampaignList() {
  const [activeTab, setActiveTab] = useState<TabValue>('all');
  const { data: campaigns, isLoading } = useCampaigns();
  const deleteCampaign = useDeleteCampaign();
  const updateCampaign = useUpdateCampaign();

  const filteredCampaigns = campaigns?.filter(campaign => {
    if (activeTab === 'all') return true;
    if (activeTab === 'draft') return campaign.status === 'draft';
    if (activeTab === 'scheduled') return campaign.status === 'scheduled';
    if (activeTab === 'sent') return ['sent', 'sending'].includes(campaign.status);
    return true;
  }) || [];

  // Calculate stats
  const totalCampaigns = campaigns?.length || 0;
  const sentThisMonth = campaigns?.filter(c => {
    if (c.status !== 'sent' || !c.completed_at) return false;
    const completedDate = new Date(c.completed_at);
    const now = new Date();
    return completedDate.getMonth() === now.getMonth() && 
           completedDate.getFullYear() === now.getFullYear();
  }).length || 0;
  
  const sentCampaigns = campaigns?.filter(c => c.status === 'sent') || [];
  const totalSent = sentCampaigns.reduce((sum, c) => sum + (c.total_sent || 0), 0);
  const totalOpened = sentCampaigns.reduce((sum, c) => sum + (c.total_opened || 0), 0);
  const totalClicked = sentCampaigns.reduce((sum, c) => sum + (c.total_clicked || 0), 0);
  const avgOpenRate = totalSent > 0 ? ((totalOpened / totalSent) * 100).toFixed(1) : '0';
  const avgClickRate = totalOpened > 0 ? ((totalClicked / totalOpened) * 100).toFixed(1) : '0';

  const stats = [
    { label: 'Total campañas', value: totalCampaigns, icon: Mail },
    { label: 'Enviadas este mes', value: sentThisMonth, icon: Send },
    { label: 'Tasa apertura', value: `${avgOpenRate}%`, icon: Eye },
    { label: 'Tasa clics', value: `${avgClickRate}%`, icon: BarChart3 },
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = CAMPAIGN_STATUSES[status as keyof typeof CAMPAIGN_STATUSES];
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      draft: 'secondary',
      scheduled: 'outline',
      sending: 'default',
      sent: 'default',
      paused: 'secondary',
      cancelled: 'destructive',
      failed: 'destructive'
    };
    return (
      <Badge variant={variants[status] || 'secondary'}>
        {statusConfig?.label || status}
      </Badge>
    );
  };

  const handleCancelCampaign = (id: string) => {
    updateCampaign.mutate({ id, data: { status: 'cancelled' } });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Campañas</h1>
          <p className="text-muted-foreground">Gestiona tus campañas de email marketing</p>
        </div>
        <Button asChild>
          <Link to="/app/marketing/campaigns/new">
            <Plus className="w-4 h-4 mr-2" />
            Nueva Campaña
          </Link>
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)}>
        <TabsList>
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="draft">Borradores</TabsTrigger>
          <TabsTrigger value="scheduled">Programadas</TabsTrigger>
          <TabsTrigger value="sent">Enviadas</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <stat.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  {isLoading ? (
                    <Skeleton className="h-7 w-16" />
                  ) : (
                    <p className="text-xl font-bold">{stat.value}</p>
                  )}
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Campaign List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredCampaigns.length > 0 ? (
        <div className="space-y-4">
          {filteredCampaigns.map((campaign) => (
            <Card key={campaign.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="p-3 rounded-lg bg-primary/10 shrink-0">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  
                  {/* Main content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold truncate">{campaign.name}</h3>
                      {getStatusBadge(campaign.status)}
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">
                      {campaign.status === 'sent' && campaign.completed_at && (
                        <>Enviada · {format(new Date(campaign.completed_at), 'dd MMM yyyy', { locale: es })}</>
                      )}
                      {campaign.status === 'scheduled' && campaign.scheduled_at && (
                        <>Programada · {format(new Date(campaign.scheduled_at), 'dd MMM yyyy HH:mm', { locale: es })}</>
                      )}
                      {campaign.status === 'draft' && campaign.updated_at && (
                        <>Última edición: {formatDistanceToNow(new Date(campaign.updated_at), { addSuffix: true, locale: es })}</>
                      )}
                      {campaign.status === 'sending' && (
                        <>Enviando...</>
                      )}
                      {campaign.total_recipients && campaign.total_recipients > 0 && (
                        <> · {campaign.total_recipients.toLocaleString()} destinatarios</>
                      )}
                    </p>

                    {/* Metrics for sent campaigns */}
                    {campaign.status === 'sent' && (campaign.total_sent || 0) > 0 && (
                      <div className="flex items-center gap-6 p-3 bg-muted/50 rounded-lg text-sm">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="font-medium">
                            {campaign.total_delivered && campaign.total_sent
                              ? ((campaign.total_delivered / campaign.total_sent) * 100).toFixed(1)
                              : 0}%
                          </span>
                          <span className="text-muted-foreground">Entregados</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4 text-blue-600" />
                          <span className="font-medium">
                            {campaign.total_opened && campaign.total_sent
                              ? ((campaign.total_opened / campaign.total_sent) * 100).toFixed(1)
                              : 0}%
                          </span>
                          <span className="text-muted-foreground">Abiertos</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <BarChart3 className="w-4 h-4 text-purple-600" />
                          <span className="font-medium">
                            {campaign.total_clicked && campaign.total_sent
                              ? ((campaign.total_clicked / campaign.total_sent) * 100).toFixed(1)
                              : 0}%
                          </span>
                          <span className="text-muted-foreground">Clics</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <XCircle className="w-4 h-4 text-red-600" />
                          <span className="font-medium">
                            {campaign.total_unsubscribed && campaign.total_sent
                              ? ((campaign.total_unsubscribed / campaign.total_sent) * 100).toFixed(1)
                              : 0}%
                          </span>
                          <span className="text-muted-foreground">Bajas</span>
                        </div>
                      </div>
                    )}

                    {/* Time remaining for scheduled */}
                    {campaign.status === 'scheduled' && campaign.scheduled_at && (
                      <div className="flex items-center gap-2 p-3 bg-blue-50 text-blue-700 rounded-lg text-sm">
                        <Clock className="w-4 h-4" />
                        Enviará {formatDistanceToNow(new Date(campaign.scheduled_at), { addSuffix: true, locale: es })}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {campaign.status === 'sent' && (
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/app/marketing/campaigns/${campaign.id}/analytics`}>
                          <BarChart3 className="w-4 h-4 mr-1" />
                          Analytics
                        </Link>
                      </Button>
                    )}
                    {campaign.status === 'draft' && (
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/app/marketing/campaigns/${campaign.id}/edit`}>
                          <Edit className="w-4 h-4 mr-1" />
                          Editar
                        </Link>
                      </Button>
                    )}
                    {campaign.status === 'scheduled' && (
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/app/marketing/campaigns/${campaign.id}/edit`}>
                          <Edit className="w-4 h-4 mr-1" />
                          Editar
                        </Link>
                      </Button>
                    )}
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link to={`/app/marketing/campaigns/${campaign.id}`}>
                            <Eye className="w-4 h-4 mr-2" />
                            Ver detalles
                          </Link>
                        </DropdownMenuItem>
                        {campaign.status === 'sent' && (
                          <DropdownMenuItem asChild>
                            <Link to={`/app/marketing/campaigns/${campaign.id}/analytics`}>
                              <BarChart3 className="w-4 h-4 mr-2" />
                              Ver analytics
                            </Link>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem>
                          <Copy className="w-4 h-4 mr-2" />
                          Duplicar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {campaign.status === 'scheduled' && (
                          <DropdownMenuItem 
                            className="text-orange-600"
                            onClick={() => handleCancelCampaign(campaign.id)}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Cancelar envío
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => deleteCampaign.mutate(campaign.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Mail className="w-16 h-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {activeTab === 'all' ? 'No hay campañas' : `No hay campañas ${activeTab === 'draft' ? 'en borrador' : activeTab === 'scheduled' ? 'programadas' : 'enviadas'}`}
            </h3>
            <p className="text-muted-foreground mb-4">
              Crea tu primera campaña de email marketing
            </p>
            <Button asChild>
              <Link to="/app/marketing/campaigns/new">
                <Plus className="w-4 h-4 mr-2" />
                Crear Campaña
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
