import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  ArrowLeft, 
  Clock, 
  MapPin, 
  DollarSign, 
  Users, 
  Eye,
  Calendar,
  FileText,
  Send,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import SendQuoteModal from '@/components/features/market/SendQuoteModal';
import { useAcceptQuoteAndCreateTransaction } from '@/hooks/market/useServiceTransactions';
import { Label } from '@/components/ui/label';
import { 
  SERVICE_CATEGORY_LABELS, 
  SERVICE_TYPE_LABELS, 
  URGENCY_LABELS,
  REQUEST_STATUS_LABELS,
  QUOTE_STATUS_LABELS,
  RfqRequest,
  RfqQuote
} from '@/types/quote-request';

export default function RfqRequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { currentOrganization } = useOrganization();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('details');
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const acceptQuote = useAcceptQuoteAndCreateTransaction();
  // Fetch request details
  const { data: request, isLoading } = useQuery({
    queryKey: ['rfq-request', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rfq_requests')
        .select(`
          *,
          requester:market_users!rfq_requests_requester_id_fkey(
            id, display_name, avatar_url, user_type, is_verified
          ),
          quotes:rfq_quotes(
            *,
            agent:market_users!rfq_quotes_agent_id_fkey(
              id, display_name, avatar_url, rating_avg, review_count
            )
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Check if current user is the requester
  const { data: currentMarketUser } = useQuery({
    queryKey: ['current-market-user', currentOrganization?.id],
    queryFn: async (): Promise<{ id: string; user_type: string } | null> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !currentOrganization?.id) return null;

      const client: any = supabase;
      const result = await client
        .from('market_users')
        .select('id, user_type')
        .eq('user_id', user.id)
        .eq('organization_id', currentOrganization.id)
        .maybeSingle();
      return result.data;
    },
    enabled: !!currentOrganization?.id,
  });

  const isRequester = currentMarketUser?.id === request?.requester_id;
  const isAgent = currentMarketUser?.user_type === 'ip_agent';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Solicitud no encontrada</h2>
        <p className="text-muted-foreground mb-4">La solicitud que buscas no existe o no tienes acceso.</p>
        <Button asChild>
          <Link to="/app/market/rfq">Volver a solicitudes</Link>
        </Button>
      </div>
    );
  }

  const categoryConfig = SERVICE_CATEGORY_LABELS[request.service_category as keyof typeof SERVICE_CATEGORY_LABELS];
  const serviceConfig = SERVICE_TYPE_LABELS[request.service_type as keyof typeof SERVICE_TYPE_LABELS];
  const urgencyConfig = URGENCY_LABELS[request.urgency as keyof typeof URGENCY_LABELS];
  const statusConfig = REQUEST_STATUS_LABELS[request.status as keyof typeof REQUEST_STATUS_LABELS];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/app/market/rfq" className="hover:text-foreground flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Link>
            <span>/</span>
            <span>{request.reference_number}</span>
          </div>
          <h1 className="text-2xl font-bold">{request.title}</h1>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Badge variant="secondary">{categoryConfig?.es}</Badge>
            <Badge variant="outline">{serviceConfig?.es}</Badge>
            <Badge className={`${urgencyConfig?.bgColor} ${urgencyConfig?.color}`}>
              {urgencyConfig?.es}
            </Badge>
            <Badge className={`${statusConfig?.bgColor} ${statusConfig?.color}`}>
              {statusConfig?.es}
            </Badge>
          </div>
        </div>

        <div className="flex gap-2">
          {isAgent && request.status === 'open' && (
            <Button onClick={() => setQuoteModalOpen(true)}>
              <Send className="h-4 w-4 mr-2" />
              Enviar Presupuesto
            </Button>
          )}
          {isRequester && request.status === 'open' && (
            <Button variant="outline">
              Cerrar Solicitud
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Eye className="h-4 w-4" />
              Vistas
            </div>
            <p className="text-2xl font-bold mt-1">{request.views_count}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <FileText className="h-4 w-4" />
              Presupuestos
            </div>
            <p className="text-2xl font-bold mt-1">{request.quotes_received} / {request.max_quotes}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <MapPin className="h-4 w-4" />
              Jurisdicciones
            </div>
            <p className="text-2xl font-bold mt-1">{request.jurisdictions?.length || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Clock className="h-4 w-4" />
              Cierra
            </div>
            <p className="text-lg font-bold mt-1">
              {request.closes_at 
                ? format(new Date(request.closes_at), 'dd MMM', { locale: es })
                : 'Sin fecha'
              }
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="details">Detalles</TabsTrigger>
          <TabsTrigger value="quotes" className="flex items-center gap-1">
            Presupuestos
            {request.quotes_received > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 justify-center">
                {request.quotes_received}
              </Badge>
            )}
          </TabsTrigger>
          {isRequester && <TabsTrigger value="invitations">Invitaciones</TabsTrigger>}
        </TabsList>

        <TabsContent value="details" className="mt-6">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Main Details */}
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Descripción</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{request.description}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Jurisdicciones</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {request.jurisdictions?.map((j) => (
                      <Badge key={j} variant="outline">{j}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {request.nice_classes && request.nice_classes.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Clases de Niza</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {request.nice_classes.map((c) => (
                        <Badge key={c} variant="secondary">Clase {c}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {request.attachments && Array.isArray(request.attachments) && request.attachments.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Documentos Adjuntos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {(request.attachments as any[]).map((att: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-2 p-2 border rounded-lg">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="flex-1">{att.name}</span>
                          <Button variant="ghost" size="sm">Descargar</Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Presupuesto</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {request.budget_min || request.budget_max ? (
                    <>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {request.budget_min && request.budget_max 
                            ? `${request.budget_min.toLocaleString()} - ${request.budget_max.toLocaleString()} ${request.budget_currency}`
                            : request.budget_max 
                              ? `Hasta ${request.budget_max.toLocaleString()} ${request.budget_currency}`
                              : `Desde ${request.budget_min?.toLocaleString()} ${request.budget_currency}`
                          }
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {request.budget_type === 'total' && 'Presupuesto total'}
                        {request.budget_type === 'per_jurisdiction' && 'Por jurisdicción'}
                        {request.budget_type === 'hourly' && 'Tarifa por hora'}
                      </p>
                    </>
                  ) : (
                    <p className="text-muted-foreground">No especificado</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Fechas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Publicado:</span>
                    <span className="font-medium">
                      {request.published_at 
                        ? format(new Date(request.published_at), 'dd/MM/yyyy', { locale: es })
                        : '-'
                      }
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>Cierre:</span>
                    <span className="font-medium">
                      {request.closes_at 
                        ? format(new Date(request.closes_at), 'dd/MM/yyyy', { locale: es })
                        : 'Sin fecha'
                      }
                    </span>
                  </div>
                  {request.deadline_completion && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-muted-foreground" />
                      <span>Entrega esperada:</span>
                      <span className="font-medium">
                        {format(new Date(request.deadline_completion), 'dd/MM/yyyy', { locale: es })}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Solicitante</CardTitle>
                </CardHeader>
                <CardContent>
                  {request.is_blind ? (
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>?</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">Anónimo</p>
                        <p className="text-sm text-muted-foreground">Solicitud ciega</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={(request.requester as any)?.avatar_url} />
                        <AvatarFallback>
                          {(request.requester as any)?.display_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{(request.requester as any)?.display_name}</p>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          {(request.requester as any)?.is_verified && (
                            <CheckCircle className="h-3 w-3 text-success" />
                          )}
                          <span>
                            {(request.requester as any)?.user_type === 'ip_agent' ? 'Agente' : 'Solicitante'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {request.requirements && typeof request.requirements === 'object' && Object.keys(request.requirements).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Requisitos</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    {(request.requirements as any).min_rating && (
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-warning" />
                        <span>Rating mínimo: {(request.requirements as any).min_rating}</span>
                      </div>
                    )}
                    {(request.requirements as any).verified_only && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-success" />
                        <span>Solo verificados</span>
                      </div>
                    )}
                    {(request.requirements as any).experience_years && (
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>Min. {(request.requirements as any).experience_years} años experiencia</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="quotes" className="mt-6">
          {request.quotes && Array.isArray(request.quotes) && request.quotes.length > 0 ? (
            <div className="space-y-4">
              {request.quotes.map((quote: any) => {
                const quoteStatus = QUOTE_STATUS_LABELS[quote.status as keyof typeof QUOTE_STATUS_LABELS];
                return (
                  <Card key={quote.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={quote.agent?.avatar_url} />
                            <AvatarFallback>
                              {quote.agent?.display_name?.charAt(0) || 'A'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold">{quote.agent?.display_name}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              {quote.agent?.rating_avg && (
                                <span className="flex items-center gap-1">
                                  <Star className="h-3 w-3 text-warning" />
                                  {quote.agent.rating_avg.toFixed(1)}
                                </span>
                              )}
                              {quote.agent?.review_count && (
                                <span>({quote.agent.review_count} reseñas)</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">
                            {quote.total_price.toLocaleString()} {quote.currency}
                          </p>
                          <Badge className={`${quoteStatus?.bgColor} ${quoteStatus?.color}`}>
                            {quoteStatus?.es}
                          </Badge>
                        </div>
                      </div>

                      <Separator className="my-4" />

                      <div className="grid md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Duración estimada</p>
                          <p className="font-medium">{quote.estimated_duration_days} días</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Términos de pago</p>
                          <p className="font-medium capitalize">{quote.payment_terms}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Válido hasta</p>
                          <p className="font-medium">
                            {quote.valid_until 
                              ? format(new Date(quote.valid_until), 'dd/MM/yyyy')
                              : '-'
                            }
                          </p>
                        </div>
                      </div>

                      <p className="mt-4 text-sm">{quote.proposal_summary}</p>

                      {isRequester && quote.status === 'submitted' && (
                        <div className="flex gap-2 mt-4">
                          <Button size="sm" 
                            disabled={acceptQuote.isPending}
                            onClick={async () => {
                              await acceptQuote.mutateAsync({ quoteId: quote.id, requestId: request.id });
                              navigate('/app/market/transactions');
                            }}>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            {acceptQuote.isPending ? 'Procesando...' : 'Adjudicar'}
                          </Button>
                          <Button size="sm" variant="outline">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Preguntar
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Sin presupuestos aún</h3>
                <p className="text-muted-foreground">
                  {isRequester 
                    ? 'Los agentes aún no han enviado presupuestos para esta solicitud.'
                    : 'Sé el primero en enviar un presupuesto para esta solicitud.'
                  }
                </p>
                {isAgent && request.status === 'open' && (
                  <Button className="mt-4" onClick={() => setQuoteModalOpen(true)}>
                    <Send className="h-4 w-4 mr-2" />
                    Enviar Presupuesto
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {isRequester && (
          <TabsContent value="invitations" className="mt-6">
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Gestión de invitaciones</h3>
                <p className="text-muted-foreground mb-4">
                  Invita agentes específicos o deja que el sistema encuentre los mejores candidatos.
                </p>
                <Button>
                  <Users className="h-4 w-4 mr-2" />
                  Invitar Agentes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Send Quote Modal */}
      <SendQuoteModal
        open={quoteModalOpen}
        onClose={() => setQuoteModalOpen(false)}
        requestId={request.id}
        requestTitle={request.title}
        currency={request.budget_currency || 'EUR'}
      />
    </div>
  );
}
