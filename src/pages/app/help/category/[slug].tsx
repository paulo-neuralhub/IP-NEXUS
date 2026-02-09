// ============================================================
// IP-NEXUS APP - HELP CATEGORY PAGE (Unified: component + static)
// ============================================================

import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, FileText, ChevronRight, Brain, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  getUnifiedArticlesByCategory,
  HELP_CATEGORIES,
  type UnifiedArticle,
} from '@/lib/helpUnifiedArticles';
import { getStaticCategory } from '@/lib/helpStaticContent';

const typeBadge: Record<string, string> = {
  guide: 'Guía', tutorial: 'Tutorial', faq: 'FAQ',
  troubleshooting: 'Solución', reference: 'Referencia',
};

export default function HelpCategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const category = getStaticCategory(slug || '');
  const articles = getUnifiedArticlesByCategory(slug || '');

  if (!category) {
    return (
      <div className="space-y-6">
        <Link to="/app/help">
          <Button variant="ghost" size="sm"><ArrowLeft className="mr-2 h-4 w-4" />Volver</Button>
        </Link>
        <div className="text-center py-10 bg-muted/30 rounded-xl border border-border">
          <p className="text-muted-foreground">Categoría no encontrada.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link to="/app/help">
        <Button variant="ghost" size="sm"><ArrowLeft className="mr-2 h-4 w-4" />Centro de Ayuda</Button>
      </Link>

      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl" style={{ backgroundColor: `${category.color}15` }}>
          <span className="text-2xl" style={{ color: category.color }}>📚</span>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{category.name}</h1>
          <p className="text-muted-foreground mt-1">{category.description}</p>
          <p className="text-sm text-muted-foreground mt-2">{articles.length} artículos</p>
        </div>
      </div>

      {articles.length === 0 ? (
        <div className="text-center py-10 bg-muted/30 rounded-xl border border-border">
          <p className="text-muted-foreground">Esta categoría aún no tiene artículos.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {articles.map((a) => (
            <Link key={a.slug} to={`/app/help/article/${a.slug}`} className="group block">
              <div className="p-5 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-md transition-all">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg flex-shrink-0" style={{ backgroundColor: `${category.color}10` }}>
                    {a.source === 'component' ? (
                      <Star className="w-4 h-4" style={{ color: category.color }} />
                    ) : (
                      <FileText className="w-4 h-4" style={{ color: category.color }} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-1">{a.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{a.summary}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {a.articleType && (
                        <Badge variant="outline" className="text-[10px]">{typeBadge[a.articleType] || 'Guía'}</Badge>
                      )}
                      {a.source === 'component' && (
                        <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">Premium</Badge>
                      )}
                      <span>{a.readTime}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary flex-shrink-0 mt-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
