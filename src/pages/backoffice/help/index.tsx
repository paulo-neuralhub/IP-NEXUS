// ============================================================
// IP-NEXUS BACKOFFICE - HELP DASHBOARD
// ============================================================

import { 
  Book, 
  Ticket, 
  MessageSquare, 
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Users
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useHelpCategories, useAllHelpArticles } from '@/hooks/help/useHelpArticles';
import { useAllSupportTickets } from '@/hooks/help/useSupportTickets';
import { useHelpAnnouncements } from '@/hooks/help/useHelpAnnouncements';

export default function HelpDashboardPage() {
  const { data: categories = [] } = useHelpCategories();
  const { data: articles = [] } = useAllHelpArticles();
  const { data: tickets = [] } = useAllSupportTickets();
  const { data: announcements = [] } = useHelpAnnouncements();

  // Calculate stats
  const publishedArticles = articles.filter(a => a.is_published).length;
  const openTickets = tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length;
  const pendingTickets = tickets.filter(t => t.status === 'waiting_customer' || t.status === 'waiting_internal').length;
  const resolvedTickets = tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length;
  const activeAnnouncements = announcements.filter(a => a.is_published).length;

  const stats = [
    {
      title: 'Artículos Publicados',
      value: publishedArticles,
      icon: Book,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Tickets Abiertos',
      value: openTickets,
      icon: Ticket,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
    {
      title: 'Esperando Respuesta',
      value: pendingTickets,
      icon: Clock,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    },
    {
      title: 'Tickets Resueltos',
      value: resolvedTickets,
      icon: CheckCircle2,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
  ];

  // Recent tickets
  const recentTickets = [...tickets]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tickets */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ticket className="h-5 w-5" />
              Tickets Recientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentTickets.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No hay tickets recientes
              </p>
            ) : (
              <div className="space-y-3">
                {recentTickets.map((ticket) => (
                  <div 
                    key={ticket.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {ticket.subject}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        #{ticket.ticket_number}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      ticket.status === 'open' ? 'bg-blue-500/10 text-blue-500' :
                      ticket.status === 'in_progress' ? 'bg-yellow-500/10 text-yellow-500' :
                      ticket.status === 'resolved' ? 'bg-green-500/10 text-green-500' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {ticket.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Categories Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Book className="h-5 w-5" />
              Categorías
            </CardTitle>
          </CardHeader>
          <CardContent>
            {categories.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No hay categorías
              </p>
            ) : (
              <div className="space-y-3">
                {categories.map((category) => (
                  <div 
                    key={category.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{category.icon}</span>
                      <div>
                        <p className="font-medium text-foreground">{category.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {category.description || 'Sin descripción'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
