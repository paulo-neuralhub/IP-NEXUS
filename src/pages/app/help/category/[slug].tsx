// ============================================================
// IP-NEXUS APP - HELP CATEGORY PAGE
// ============================================================

import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, FileQuestion } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { HelpArticleCard } from '@/components/features/help/HelpArticleCard';
import { useHelpCategories, useHelpArticles } from '@/hooks/help';
import { EmptyState } from '@/components/ui/empty-state';

export default function HelpCategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  
  const { data: categories = [], isLoading: loadingCategories } = useHelpCategories();
  const category = categories.find((c) => c.slug === slug);

  const { data: articles = [], isLoading: loadingArticles } = useHelpArticles(
    category?.id ? { categoryId: category.id } : undefined
  );

  if (loadingCategories) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="space-y-6">
        <Link to="/app/help">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al Centro de Ayuda
          </Button>
        </Link>
        <EmptyState
          icon={<FileQuestion className="h-12 w-12" />}
          title="Categoría no encontrada"
          description="La categoría que buscas no existe o ha sido eliminada."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Link to="/app/help">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al Centro de Ayuda
        </Button>
      </Link>

      {/* Category Header */}
      <div className="flex items-start gap-4">
        <div
          className="p-3 rounded-lg"
          style={{ backgroundColor: `${category.color}20` }}
        >
          <span className="text-2xl">{category.icon}</span>
        </div>
        <div>
          <h1 className="text-2xl font-bold">{category.name}</h1>
          {category.description && (
            <p className="text-muted-foreground mt-1">{category.description}</p>
          )}
          <p className="text-sm text-muted-foreground mt-2">
            {articles.length} artículos
          </p>
        </div>
      </div>

      {/* Articles */}
      {loadingArticles ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : articles.length === 0 ? (
        <EmptyState
          icon={<FileQuestion className="h-12 w-12" />}
          title="Sin artículos"
          description="Esta categoría aún no tiene artículos publicados."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {articles.map((article) => (
            <HelpArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}
