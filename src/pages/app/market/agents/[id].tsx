import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useMarketUser } from '@/hooks/market/useMarketUsers';
import { useMarketUserReviews, useReviewsSummary } from '@/hooks/market/useMarketUserReviews';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  ArrowLeft,
  Star,
  MapPin,
  CheckCircle,
  BadgeCheck,
  Clock,
  Users,
  TrendingUp,
  Briefcase,
  Globe,
  Phone,
  Mail,
  MessageSquare,
  FileQuestion,
  Award,
  Languages
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  BADGE_CONFIG, 
  AGENT_TYPE_LABELS,
  getReputationColor,
  formatResponseTime 
} from '@/types/market-users';
import { cn } from '@/lib/utils';

export default function AgentProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: agent, isLoading } = useMarketUser(id);
  const { data: reviews } = useMarketUserReviews(id);
  const { data: reviewsSummary } = useReviewsSummary(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="text-center py-12">
        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Agente no encontrado</h2>
        <p className="text-muted-foreground mb-4">El perfil que buscas no existe o no está disponible.</p>
        <Button asChild>
          <Link to="/app/market/agents">Volver a agentes</Link>
        </Button>
      </div>
    );
  }

  const initials = agent.display_name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const agentTypeLabel = agent.agent_type 
    ? AGENT_TYPE_LABELS[agent.agent_type]?.es 
    : null;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/app/market/agents" className="hover:text-foreground flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" />
          Agentes
        </Link>
        <span>/</span>
        <span className="text-foreground">{agent.display_name}</span>
      </div>

      {/* Header Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar & Basic Info */}
            <div className="flex items-start gap-4">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={agent.avatar_url || undefined} alt={agent.display_name} />
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                {agent.is_verified_agent && (
                  <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold">{agent.display_name}</h1>
                  {agent.is_verified_agent && (
                    <Badge className="bg-green-100 text-green-700">
                      <BadgeCheck className="w-3 h-3 mr-1" />
                      Verificado
                    </Badge>
                  )}
                </div>
                
                {agent.company_name && (
                  <p className="text-muted-foreground">{agent.company_name}</p>
                )}

                <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                  {(agent.city || agent.country) && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {[agent.city, agent.country].filter(Boolean).join(', ')}
                    </span>
                  )}
                  {agentTypeLabel && (
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-4 h-4" />
                      {agentTypeLabel}
                    </span>
                  )}
                  {agent.years_experience && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {agent.years_experience} años exp.
                    </span>
                  )}
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={cn(
                          "w-5 h-5",
                          star <= Math.round(agent.rating_avg)
                            ? "text-yellow-500 fill-yellow-500"
                            : "text-gray-300"
                        )}
                      />
                    ))}
                  </div>
                  <span className="font-semibold">{agent.rating_avg.toFixed(1)}</span>
                  <span className="text-muted-foreground">({agent.ratings_count} reviews)</span>
                </div>
              </div>
            </div>

            {/* Score & CTA */}
            <div className="md:ml-auto flex flex-col items-end gap-4">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Puntuación de reputación</p>
                <p className={cn("text-4xl font-bold", getReputationColor(agent.reputation_score))}>
                  {agent.reputation_score}
                </p>
              </div>

              <div className="flex gap-2">
                <Button variant="outline">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Contactar
                </Button>
                <Button>
                  <FileQuestion className="w-4 h-4 mr-2" />
                  Solicitar Presupuesto
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="w-5 h-5 mx-auto mb-2 text-green-500" />
            <p className="text-2xl font-bold">{agent.total_transactions}</p>
            <p className="text-xs text-muted-foreground">Trabajos completados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="w-5 h-5 mx-auto mb-2 text-blue-500" />
            <p className="text-2xl font-bold">{formatResponseTime(agent.response_time_avg)}</p>
            <p className="text-xs text-muted-foreground">Tiempo respuesta</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-5 h-5 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{agent.success_rate.toFixed(0)}%</p>
            <p className="text-xs text-muted-foreground">Tasa de éxito</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Award className="w-5 h-5 mx-auto mb-2 text-yellow-500" />
            <p className="text-2xl font-bold">#{agent.rank_position || '-'}</p>
            <p className="text-xs text-muted-foreground">Posición ranking</p>
          </CardContent>
        </Card>
      </div>

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Información</TabsTrigger>
          <TabsTrigger value="reviews">Reviews ({agent.ratings_count})</TabsTrigger>
          <TabsTrigger value="credentials">Credenciales</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="md:col-span-2 space-y-6">
              {/* Bio */}
              <Card>
                <CardHeader>
                  <CardTitle>Sobre mí</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-muted-foreground">
                    {agent.bio || 'Este agente aún no ha añadido una descripción.'}
                  </p>
                </CardContent>
              </Card>

              {/* Specializations */}
              {agent.specializations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Especialidades</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {agent.specializations.map((spec) => (
                        <Badge key={spec} variant="secondary" className="text-sm">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Jurisdictions */}
              {agent.jurisdictions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="w-5 h-5" />
                      Jurisdicciones
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {agent.jurisdictions.map((j) => (
                        <div key={j} className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                          <span className="text-lg">{getFlagEmoji(j)}</span>
                          <span className="text-sm font-medium">{j}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Badges */}
              {agent.badges.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Insignias</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {agent.badges.map((badge) => {
                        const config = BADGE_CONFIG[badge];
                        return (
                          <div key={badge} className="flex items-center gap-2 p-2 rounded-lg bg-muted">
                            <Badge className={cn("text-xs", config?.bgColor, config?.color)}>
                              {config?.labelEs || badge}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Languages */}
              {agent.languages && agent.languages.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Languages className="w-5 h-5" />
                      Idiomas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {agent.languages.map((lang) => (
                        <Badge key={lang} variant="outline">{lang}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Pricing */}
              {agent.hourly_rate && (
                <Card>
                  <CardHeader>
                    <CardTitle>Tarifa</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      {agent.hourly_rate.toLocaleString()} {agent.rate_currency || 'EUR'}
                      <span className="text-sm font-normal text-muted-foreground">/hora</span>
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Contact Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Contacto</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {agent.company_website && (
                    <a
                      href={agent.company_website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <Globe className="w-4 h-4" />
                      {agent.company_website}
                    </a>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    Zona horaria: {agent.timezone || 'Europe/Madrid'}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="reviews" className="mt-6 space-y-6">
          {/* Reviews Summary */}
          {reviewsSummary && reviewsSummary.count > 0 && (
            <Card>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Left: Overall Rating */}
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-5xl font-bold">{reviewsSummary.avgOverall.toFixed(1)}</p>
                      <div className="flex items-center justify-center gap-1 my-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={cn(
                              "w-5 h-5",
                              star <= Math.round(reviewsSummary.avgOverall)
                                ? "text-yellow-500 fill-yellow-500"
                                : "text-gray-300"
                            )}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground">{reviewsSummary.count} reviews</p>
                    </div>

                    <Separator orientation="vertical" className="h-24 hidden md:block" />

                    {/* Rating Distribution */}
                    <div className="flex-1 space-y-2">
                      {[5, 4, 3, 2, 1].map((rating) => (
                        <div key={rating} className="flex items-center gap-2 text-sm">
                          <span className="w-3">{rating}</span>
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <Progress 
                            value={(reviewsSummary.distribution[rating] / reviewsSummary.count) * 100} 
                            className="h-2 flex-1"
                          />
                          <span className="w-8 text-muted-foreground text-right">
                            {reviewsSummary.distribution[rating]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right: Category Ratings */}
                  <div className="space-y-3">
                    <RatingBar label="Comunicación" value={reviewsSummary.avgCommunication} />
                    <RatingBar label="Calidad" value={reviewsSummary.avgQuality} />
                    <RatingBar label="Puntualidad" value={reviewsSummary.avgTimeliness} />
                    <RatingBar label="Relación calidad-precio" value={reviewsSummary.avgValue} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Reviews List */}
          <div className="space-y-4">
            {reviews && reviews.length > 0 ? (
              reviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={review.reviewer?.avatar_url || undefined} />
                        <AvatarFallback>
                          {review.reviewer?.display_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{review.reviewer?.display_name || 'Usuario'}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={cn(
                                      "w-3 h-3",
                                      star <= review.rating_overall
                                        ? "text-yellow-500 fill-yellow-500"
                                        : "text-gray-300"
                                    )}
                                  />
                                ))}
                              </div>
                              <span>•</span>
                              <span>
                                {formatDistanceToNow(new Date(review.created_at), { 
                                  addSuffix: true, 
                                  locale: es 
                                })}
                              </span>
                            </div>
                          </div>
                          {review.is_verified && (
                            <Badge variant="outline" className="text-xs">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Verificada
                            </Badge>
                          )}
                        </div>
                        {review.title && (
                          <h4 className="font-medium mt-2">{review.title}</h4>
                        )}
                        <p className="text-muted-foreground mt-1">{review.comment}</p>

                        {/* Response */}
                        {review.response && (
                          <div className="mt-3 pl-4 border-l-2 border-primary/30 bg-muted/50 p-3 rounded-r-lg">
                            <p className="text-xs font-medium mb-1">Respuesta del agente:</p>
                            <p className="text-sm text-muted-foreground">{review.response}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  <Star className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p>Este agente aún no tiene reviews.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="credentials" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información profesional</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {agent.license_number && (
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-muted-foreground">Número de colegiado</span>
                  <span className="font-medium">{agent.license_number}</span>
                </div>
              )}
              {agent.bar_association && (
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-muted-foreground">Colegio / Asociación</span>
                  <span className="font-medium">{agent.bar_association}</span>
                </div>
              )}
              {agent.years_experience && (
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-muted-foreground">Años de experiencia</span>
                  <span className="font-medium">{agent.years_experience} años</span>
                </div>
              )}
              {agent.kyc_status && (
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-muted-foreground">Verificación</span>
                  <Badge variant={agent.kyc_status === 'verified' ? 'default' : 'secondary'}>
                    {agent.kyc_status === 'verified' ? 'Verificado' : agent.kyc_status}
                  </Badge>
                </div>
              )}
              {agent.is_verified_agent && agent.agent_verified_at && (
                <div className="flex items-center justify-between py-2">
                  <span className="text-muted-foreground">Verificado desde</span>
                  <span className="font-medium">
                    {format(new Date(agent.agent_verified_at), 'dd/MM/yyyy', { locale: es })}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Company Info */}
          {agent.company_name && (
            <Card>
              <CardHeader>
                <CardTitle>Empresa</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  {agent.company_logo_url && (
                    <img 
                      src={agent.company_logo_url} 
                      alt={agent.company_name} 
                      className="w-16 h-16 object-contain rounded-lg border"
                    />
                  )}
                  <div>
                    <p className="font-semibold text-lg">{agent.company_name}</p>
                    {agent.company_type && (
                      <p className="text-sm text-muted-foreground">{agent.company_type}</p>
                    )}
                  </div>
                </div>
                {agent.company_website && (
                  <a
                    href={agent.company_website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    <Globe className="w-4 h-4" />
                    {agent.company_website}
                  </a>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper Components
function RatingBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted-foreground w-32">{label}</span>
      <Progress value={(value / 5) * 100} className="h-2 flex-1" />
      <span className="text-sm font-medium w-8">{value.toFixed(1)}</span>
    </div>
  );
}

function getFlagEmoji(code: string): string {
  const flags: Record<string, string> = {
    ES: '🇪🇸',
    EU: '🇪🇺',
    US: '🇺🇸',
    GB: '🇬🇧',
    DE: '🇩🇪',
    FR: '🇫🇷',
    IT: '🇮🇹',
    PT: '🇵🇹',
    CN: '🇨🇳',
    JP: '🇯🇵',
    KR: '🇰🇷',
    BR: '🇧🇷',
    MX: '🇲🇽',
    AR: '🇦🇷',
    CL: '🇨🇱',
    CO: '🇨🇴',
    WIPO: '🌐',
    PCT: '🌐',
  };
  return flags[code] || '🏳️';
}
