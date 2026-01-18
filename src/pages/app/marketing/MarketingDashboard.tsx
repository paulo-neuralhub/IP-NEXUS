import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCampaigns, useTemplates, useContactLists } from '@/hooks/use-marketing';
import { Mail, Users, LayoutTemplate, Zap, Send, Eye, MousePointer, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

export default function MarketingDashboard() {
  const { data: campaigns, isLoading: loadingCampaigns } = useCampaigns();
  const { data: templates, isLoading: loadingTemplates } = useTemplates();
  const { data: lists, isLoading: loadingLists } = useContactLists();

  const activeCampaigns = campaigns?.filter(c => c.status === 'sending') || [];
  const sentCampaigns = campaigns?.filter(c => c.status === 'sent') || [];
  
  // Calculate totals from campaigns
  const totalSent = sentCampaigns.reduce((sum, c) => sum + (c.total_sent || 0), 0);
  const totalOpened = sentCampaigns.reduce((sum, c) => sum + (c.total_opened || 0), 0);
  const totalClicked = sentCampaigns.reduce((sum, c) => sum + (c.total_clicked || 0), 0);
  const openRate = totalSent > 0 ? ((totalOpened / totalSent) * 100).toFixed(1) : '0';
  const clickRate = totalOpened > 0 ? ((totalClicked / totalOpened) * 100).toFixed(1) : '0';

  const totalContacts = lists?.reduce((sum, l) => sum + (l.contact_count || 0), 0) || 0;

  const stats = [
    { 
      label: 'Emails Enviados', 
      value: totalSent.toLocaleString(), 
      icon: Send, 
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    { 
      label: 'Tasa Apertura', 
      value: `${openRate}%`, 
      icon: Eye, 
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    { 
      label: 'Tasa de Clics', 
      value: `${clickRate}%`, 
      icon: MousePointer, 
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    { 
      label: 'Contactos Totales', 
      value: totalContacts.toLocaleString(), 
      icon: Users, 
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
  ];

  const quickActions = [
    { 
      label: 'Nueva Plantilla', 
      to: '/app/marketing/templates/new', 
      icon: LayoutTemplate,
      description: 'Crea una plantilla de email con el editor visual'
    },
    { 
      label: 'Nueva Campaña', 
      to: '/app/marketing/campaigns/new', 
      icon: Mail,
      description: 'Lanza una campaña de email a tus contactos'
    },
    { 
      label: 'Nueva Lista', 
      to: '/app/marketing/lists/new', 
      icon: Users,
      description: 'Segmenta tus contactos en listas'
    },
    { 
      label: 'Nueva Automatización', 
      to: '/app/marketing/automations/new', 
      icon: Zap,
      description: 'Automatiza emails según eventos'
    },
  ];

  const isLoading = loadingCampaigns || loadingTemplates || loadingLists;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={cn('p-3 rounded-lg', stat.bgColor)}>
                  <stat.icon className={cn('w-6 h-6', stat.color)} />
                </div>
                <div>
                  {isLoading ? (
                    <Skeleton className="h-8 w-20" />
                  ) : (
                    <p className="text-2xl font-bold">{stat.value}</p>
                  )}
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
          <CardDescription>Comienza a crear contenido para tu marketing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <Link key={action.to} to={action.to}>
                <Card className="hover:border-primary hover:shadow-md transition-all cursor-pointer h-full">
                  <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                    <div className="p-3 rounded-full bg-primary/10">
                      <action.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-medium">{action.label}</h3>
                    <p className="text-xs text-muted-foreground">{action.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Campaigns */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Campañas Recientes</CardTitle>
              <CardDescription>Últimas campañas enviadas</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/app/marketing/campaigns">Ver todas</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {loadingCampaigns ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : campaigns && campaigns.length > 0 ? (
              <div className="space-y-3">
                {campaigns.slice(0, 5).map((campaign) => (
                  <div 
                    key={campaign.id} 
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div>
                      <p className="font-medium">{campaign.name}</p>
                      <p className="text-sm text-muted-foreground">{campaign.subject}</p>
                    </div>
                    <div className="text-right text-sm">
                      <p className="font-medium">{campaign.total_sent || 0} enviados</p>
                      <p className="text-muted-foreground">
                        {campaign.total_opened || 0} abiertos
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Mail className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No hay campañas aún</p>
                <Button asChild variant="link" className="mt-2">
                  <Link to="/app/marketing/campaigns/new">Crear primera campaña</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Templates */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Plantillas</CardTitle>
              <CardDescription>Tus plantillas de email</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/app/marketing/templates">Ver todas</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {loadingTemplates ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : templates && templates.length > 0 ? (
              <div className="space-y-3">
                {templates.slice(0, 5).map((template) => (
                  <Link 
                    key={template.id} 
                    to={`/app/marketing/templates/${template.id}/edit`}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div>
                      <p className="font-medium">{template.name}</p>
                      <p className="text-sm text-muted-foreground">{template.category || 'Sin categoría'}</p>
                    </div>
                    <LayoutTemplate className="w-5 h-5 text-muted-foreground" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <LayoutTemplate className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No hay plantillas aún</p>
                <Button asChild variant="link" className="mt-2">
                  <Link to="/app/marketing/templates/new">Crear primera plantilla</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
