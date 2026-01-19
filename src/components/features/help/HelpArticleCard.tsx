// ============================================================
// IP-NEXUS HELP - ARTICLE CARD COMPONENT
// ============================================================

import { Link } from 'react-router-dom';
import { HelpArticle } from '@/types/help';
import { 
  FileText, 
  PlayCircle, 
  Book, 
  AlertCircle,
  ChevronRight,
  Eye,
  ThumbsUp
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const typeIcons = {
  guide: Book,
  tutorial: PlayCircle,
  faq: AlertCircle,
  troubleshooting: AlertCircle,
  reference: FileText,
  video: PlayCircle,
};

const typeBadges: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  guide: { label: 'Guía', variant: 'default' },
  tutorial: { label: 'Tutorial', variant: 'secondary' },
  faq: { label: 'FAQ', variant: 'outline' },
  troubleshooting: { label: 'Solución', variant: 'outline' },
  reference: { label: 'Referencia', variant: 'outline' },
  video: { label: 'Video', variant: 'secondary' },
};

interface HelpArticleCardProps {
  article: HelpArticle;
  variant?: 'default' | 'compact';
  basePath?: string;
}

export function HelpArticleCard({ 
  article, 
  variant = 'default',
  basePath = '/app/help'
}: HelpArticleCardProps) {
  const Icon = typeIcons[article.article_type] || FileText;
  const badge = typeBadges[article.article_type];

  if (variant === 'compact') {
    return (
      <Link
        to={`${basePath}/article/${article.slug}`}
        className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
      >
        <Icon className="h-5 w-5 text-muted-foreground group-hover:text-primary flex-shrink-0" />
        <span className="flex-1 text-foreground group-hover:text-primary transition-colors truncate">
          {article.title}
        </span>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </Link>
    );
  }

  return (
    <Link
      to={`${basePath}/article/${article.slug}`}
      className="group block"
    >
      <div className={cn(
        "p-5 rounded-xl border border-border bg-card",
        "hover:border-primary/50 hover:shadow-md transition-all duration-200"
      )}>
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-medium text-foreground group-hover:text-primary transition-colors truncate">
                {article.title}
              </h3>
              {article.is_featured && (
                <Badge variant="default" className="flex-shrink-0">
                  Destacado
                </Badge>
              )}
            </div>
            
            {article.summary && (
              <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                {article.summary}
              </p>
            )}

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              {badge && (
                <Badge variant={badge.variant} className="text-xs">
                  {badge.label}
                </Badge>
              )}
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {article.view_count}
              </span>
              <span className="flex items-center gap-1">
                <ThumbsUp className="h-3 w-3" />
                {article.helpful_count}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
