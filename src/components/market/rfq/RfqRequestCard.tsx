import { Link } from 'react-router-dom';
import { Clock, MapPin, DollarSign, Users, ChevronRight, Calendar } from 'lucide-react';
import { 
  RfqRequest, 
  SERVICE_TYPE_LABELS, 
  URGENCY_LABELS,
  REQUEST_STATUS_LABELS 
} from '@/types/quote-request';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface RfqRequestCardProps {
  request: RfqRequest;
  showStatus?: boolean;
  linkPrefix?: string;
}

export function RfqRequestCard({ 
  request, 
  showStatus = false,
  linkPrefix = '/app/market/rfq' 
}: RfqRequestCardProps) {
  const serviceLabel = SERVICE_TYPE_LABELS[request.service_type]?.es || request.service_type;
  const urgencyConfig = URGENCY_LABELS[request.urgency];
  const statusConfig = REQUEST_STATUS_LABELS[request.status];
  
  const formatBudget = () => {
    if (!request.budget_min && !request.budget_max) return null;
    
    const currency = request.budget_currency || 'EUR';
    if (request.budget_min && request.budget_max) {
      return `${request.budget_min.toLocaleString()}-${request.budget_max.toLocaleString()} ${currency}`;
    }
    if (request.budget_max) {
      return `Hasta ${request.budget_max.toLocaleString()} ${currency}`;
    }
    return `Desde ${request.budget_min?.toLocaleString()} ${currency}`;
  };
  
  return (
    <Link to={`${linkPrefix}/${request.id}`}>
      <Card className="p-6 hover:border-primary/50 hover:shadow-lg transition-all">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Header badges */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge variant="outline">{serviceLabel}</Badge>
              <Badge className={cn(urgencyConfig.bgColor, urgencyConfig.color, 'border-0')}>
                {urgencyConfig.es}
              </Badge>
              {showStatus && (
                <Badge className={cn(statusConfig.bgColor, statusConfig.color, 'border-0')}>
                  {statusConfig.es}
                </Badge>
              )}
            </div>
            
            {/* Title */}
            <h3 className="text-lg font-semibold text-foreground line-clamp-1">
              {request.title}
            </h3>
            
            {/* Reference */}
            <p className="text-xs text-muted-foreground mt-0.5">
              {request.reference_number}
            </p>
            
            {/* Description */}
            <p className="text-muted-foreground text-sm mt-2 line-clamp-2">
              {request.description}
            </p>
            
            {/* Meta info */}
            <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {request.jurisdictions.slice(0, 3).join(', ')}
                {request.jurisdictions.length > 3 && ` +${request.jurisdictions.length - 3}`}
              </span>
              
              {formatBudget() && (
                <span className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  {formatBudget()}
                </span>
              )}
              
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {request.quotes_received}/{request.max_quotes} presupuestos
              </span>
              
              {request.deadline_response && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Cierra {formatDistanceToNow(new Date(request.deadline_response), { 
                    addSuffix: true, 
                    locale: es 
                  })}
                </span>
              )}
            </div>
          </div>
          
          {/* Right side */}
          <div className="flex flex-col items-end gap-2 shrink-0">
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(request.published_at || request.created_at), { 
                addSuffix: true, 
                locale: es 
              })}
            </span>
            
            {request.requester && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {(request.requester as any).display_name}
                </span>
                <Avatar className="w-8 h-8">
                  <AvatarImage src={(request.requester as any).avatar_url} />
                  <AvatarFallback>
                    {(request.requester as any).display_name?.[0] || '?'}
                  </AvatarFallback>
                </Avatar>
              </div>
            )}
            
            <ChevronRight className="w-5 h-5 text-muted-foreground/50" />
          </div>
        </div>
      </Card>
    </Link>
  );
}
