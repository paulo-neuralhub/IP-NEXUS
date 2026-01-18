import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useCampaigns, useDeleteCampaign } from '@/hooks/use-marketing';
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye, Send, Mail } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CAMPAIGN_STATUSES } from '@/lib/constants/marketing';

export default function CampaignList() {
  const [search, setSearch] = useState('');
  const { data: campaigns, isLoading } = useCampaigns();
  const deleteCampaign = useDeleteCampaign();

  const filteredCampaigns = campaigns?.filter(campaign =>
    campaign.name.toLowerCase().includes(search.toLowerCase()) ||
    campaign.subject.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const getStatusBadge = (status: string) => {
    const statusConfig = CAMPAIGN_STATUSES[status as keyof typeof CAMPAIGN_STATUSES];
    if (!statusConfig) return <Badge variant="secondary">{status}</Badge>;
    
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      draft: 'secondary',
      scheduled: 'outline',
      sending: 'default',
      sent: 'default',
      paused: 'secondary',
      cancelled: 'destructive'
    };
    
    return (
      <Badge variant={variants[status] || 'secondary'}>
        {statusConfig.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar campañas..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button asChild>
          <Link to="/app/marketing/campaigns/new">
            <Plus className="w-4 h-4 mr-2" />
            Nueva Campaña
          </Link>
        </Button>
      </div>

      {/* Campaigns Table */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-1/3 mb-2" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredCampaigns.length > 0 ? (
        <div className="space-y-3">
          {filteredCampaigns.map((campaign) => (
            <Card key={campaign.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium truncate">{campaign.name}</h3>
                      {getStatusBadge(campaign.status)}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {campaign.subject}
                    </p>
                  </div>

                  <div className="hidden md:flex items-center gap-8 text-sm">
                    <div className="text-center">
                      <p className="font-medium">{campaign.total_sent || 0}</p>
                      <p className="text-muted-foreground">Enviados</p>
                    </div>
                    <div className="text-center">
                      <p className="font-medium">{campaign.total_opened || 0}</p>
                      <p className="text-muted-foreground">Abiertos</p>
                    </div>
                    <div className="text-center">
                      <p className="font-medium">{campaign.total_clicked || 0}</p>
                      <p className="text-muted-foreground">Clics</p>
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground hidden lg:block">
                    {campaign.scheduled_at 
                      ? format(new Date(campaign.scheduled_at), 'dd MMM yyyy HH:mm', { locale: es })
                      : campaign.created_at && format(new Date(campaign.created_at), 'dd MMM yyyy', { locale: es })
                    }
                  </div>

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
                      {campaign.status === 'draft' && (
                        <>
                          <DropdownMenuItem asChild>
                            <Link to={`/app/marketing/campaigns/${campaign.id}/edit`}>
                              <Edit className="w-4 h-4 mr-2" />
                              Editar
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Send className="w-4 h-4 mr-2" />
                            Enviar ahora
                          </DropdownMenuItem>
                        </>
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
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Mail className="w-16 h-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">No hay campañas</h3>
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
