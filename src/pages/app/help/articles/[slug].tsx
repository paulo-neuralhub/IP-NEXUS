// ============================================================
// IP-NEXUS APP - HELP ARTICLE DETAIL (Component + Static + DB)
// Priority: Component > Static > DB (fastest first)
// ============================================================

import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, FileQuestion, ChevronRight, Clock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { StaticArticlePremium } from '@/components/help/StaticArticlePremium';
import { Skeleton } from '@/components/ui/skeleton';
import { useHelpArticle } from '@/hooks/help';
import { EmptyState } from '@/components/ui/empty-state';
import { getStaticArticle, getStaticCategory, getStaticArticlesByCategory } from '@/lib/helpStaticContent';
import { getArticleBySlug } from '@/data/help-articles';
import { contentRegistry } from '@/components/help/articles/contentRegistry';
import { ArticlePlaceholder } from '@/components/help/articles/ArticlePlaceholder';

export default function HelpArticleDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [feedbackGiven, setFeedbackGiven] = useState<'up' | 'down' | null>(null);

  // 1. Check component-based article FIRST (instant, no loading)
  const componentArticle = getArticleBySlug(slug || '');
  const ContentComponent = componentArticle ? contentRegistry[componentArticle.content] : undefined;

  // 2. Check static markdown (instant, no loading)
  const staticArticle = getStaticArticle(slug || '');

  // 3. Only query DB if no local content exists
  const hasLocalContent = !!ContentComponent || !!staticArticle || (!!componentArticle);
  const { data: dbArticle, isLoading } = useHelpArticle(slug || '', { enabled: !hasLocalContent });

  // ── Render: Component-based article (premium) ──
  if (ContentComponent) {
    return <ContentComponent />;
  }

  // ── Render: Component article without content yet ──
  if (componentArticle && !ContentComponent) {
    const catSlug = componentArticle.category;
    const catData = getStaticCategory(catSlug);
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <nav className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link to="/app/help" className="hover:text-foreground transition-colors">Centro de Ayuda</Link>
          <ChevronRight className="w-3 h-3" />
          {catData && (
            <>
              <Link to={`/app/help/category/${catSlug}`} className="hover:text-foreground transition-colors">{catData.name}</Link>
              <ChevronRight className="w-3 h-3" />
            </>
          )}
          <span className="text-foreground truncate max-w-[200px]">{componentArticle.title}</span>
        </nav>
        <ArticlePlaceholder title={componentArticle.title} />
      </div>
    );
  }

  // ── Render: Static markdown article (PREMIUM layout) ──
  if (staticArticle) {
    const staticCategory = getStaticCategory(staticArticle.categorySlug);
    const relatedStatic = getStaticArticlesByCategory(staticArticle.categorySlug)
      .filter(a => a.slug !== slug).slice(0, 4);

    return (
      <StaticArticlePremium
        article={staticArticle}
        category={staticCategory || undefined}
        relatedArticles={relatedStatic.map(r => ({ slug: r.slug, title: r.title, readTime: r.readTime }))}
      />
    );
  }

  // ── Render: DB loading state (only when no local content) ──
  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  // ── Render: DB article ──
  if (dbArticle) {
    const wordCount = dbArticle.content.split(/\s+/).length;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <nav className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link to="/app/help" className="hover:text-foreground">Centro de Ayuda</Link>
          <ChevronRight className="w-3 h-3" />
          {dbArticle.category && (
            <>
              <Link to={`/app/help/category/${dbArticle.category.slug}`} className="hover:text-foreground">{dbArticle.category.name}</Link>
              <ChevronRight className="w-3 h-3" />
            </>
          )}
          <span className="text-foreground truncate">{dbArticle.title}</span>
        </nav>
        <h1 className="text-[26px] font-bold text-foreground" style={{ letterSpacing: '-0.02em' }}>{dbArticle.title}</h1>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{readingTime} min</span>
        </div>
        <div className="article-content prose prose-slate dark:prose-invert max-w-none">
          <ReactMarkdown>{dbArticle.content}</ReactMarkdown>
        </div>
      </div>
    );
  }

  // ── Not found ──
  return (
    <div className="space-y-6">
      <Link to="/app/help"><Button variant="ghost" size="sm"><ArrowLeft className="mr-2 h-4 w-4" />Volver</Button></Link>
      <EmptyState icon={<FileQuestion className="h-12 w-12" />} title="Artículo no encontrado" description="El artículo que buscas no existe." />
    </div>
  );
}