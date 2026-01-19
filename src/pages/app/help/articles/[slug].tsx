// ============================================================
// IP-NEXUS APP - HELP ARTICLE DETAIL PAGE
// ============================================================

import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ThumbsUp, ThumbsDown, Clock, Eye, Calendar, Tag, FileQuestion } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import {
  useHelpArticle,
  useRelatedArticles,
  useSubmitArticleFeedback,
} from '@/hooks/help';
import { HelpArticleCard } from '@/components/features/help/HelpArticleCard';
import { EmptyState } from '@/components/ui/empty-state';

export default function HelpArticleDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [pendingFeedback, setPendingFeedback] = useState<'helpful' | 'not_helpful' | null>(null);

  const { data: article, isLoading } = useHelpArticle(slug || '');
  const { data: relatedArticles = [] } = useRelatedArticles(article?.id || '', {
    enabled: !!article?.id,
  });
  const submitFeedback = useSubmitArticleFeedback();

  const handleFeedback = (isHelpful: boolean) => {
    if (feedbackSubmitted) return;
    setPendingFeedback(isHelpful ? 'helpful' : 'not_helpful');
    setShowFeedbackForm(true);
  };

  const handleSubmitFeedback = () => {
    if (!article || !pendingFeedback) return;

    submitFeedback.mutate(
      {
        articleId: article.id,
        isHelpful: pendingFeedback === 'helpful',
        feedbackText: feedbackComment || undefined,
      },
      {
        onSuccess: () => {
          setFeedbackSubmitted(true);
          setShowFeedbackForm(false);
          toast({
            title: '¡Gracias por tu feedback!',
            description: 'Tu opinión nos ayuda a mejorar.',
          });
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!article) {
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
          title="Artículo no encontrado"
          description="El artículo que buscas no existe o ha sido eliminado."
        />
      </div>
    );
  }

  // Estimate reading time: ~200 words per minute
  const wordCount = article.content.split(/\s+/).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/app/help" className="hover:text-foreground">
          Centro de Ayuda
        </Link>
        <span>/</span>
        {article.category && (
          <>
            <Link
              to={`/app/help/category/${article.category.slug}`}
              className="hover:text-foreground"
            >
              {article.category.name}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-foreground truncate">{article.title}</span>
      </div>

      {/* Article Header */}
      <div>
        <h1 className="text-3xl font-bold mb-4">{article.title}</h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {format(new Date(article.updated_at || article.created_at), "d 'de' MMMM, yyyy", {
              locale: es,
            })}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {readingTime} min de lectura
          </div>
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            {article.view_count || 0} vistas
          </div>
        </div>
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <Tag className="h-4 w-4 text-muted-foreground" />
            {article.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Article Content */}
      <Card>
        <CardContent className="prose prose-slate dark:prose-invert max-w-none p-6">
          <ReactMarkdown>{article.content}</ReactMarkdown>
        </CardContent>
      </Card>

      {/* Feedback Section */}
      <Card>
        <CardContent className="p-6">
          {feedbackSubmitted ? (
            <div className="text-center py-4">
              <p className="text-lg font-medium text-primary">
                ¡Gracias por tu feedback!
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Tu opinión nos ayuda a mejorar nuestro contenido.
              </p>
            </div>
          ) : showFeedbackForm ? (
            <div className="space-y-4">
              <p className="font-medium">
                {pendingFeedback === 'helpful'
                  ? '¿Qué te resultó más útil?'
                  : '¿Cómo podemos mejorar este artículo?'}
              </p>
              <Textarea
                placeholder="Tu comentario (opcional)..."
                value={feedbackComment}
                onChange={(e) => setFeedbackComment(e.target.value)}
                rows={3}
              />
              <div className="flex gap-2">
                <Button onClick={handleSubmitFeedback} disabled={submitFeedback.isPending}>
                  Enviar feedback
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowFeedbackForm(false);
                    setPendingFeedback(null);
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <p className="font-medium">¿Te resultó útil este artículo?</p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleFeedback(true)}
                >
                  <ThumbsUp className="mr-2 h-4 w-4" />
                  Sí
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleFeedback(false)}
                >
                  <ThumbsDown className="mr-2 h-4 w-4" />
                  No
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Artículos Relacionados</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {relatedArticles.slice(0, 4).map((related) => (
              <HelpArticleCard key={related.id} article={related} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
