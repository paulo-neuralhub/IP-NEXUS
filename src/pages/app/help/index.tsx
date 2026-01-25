// ============================================================
// IP-NEXUS APP - HELP CENTER INDEX
// Knowledge Base Main Page
// ============================================================

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ArrowRight, MessageCircle, ExternalLink, FileQuestion } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { HelpCategoryCard } from '@/components/features/help/HelpCategoryCard';
import { HelpArticleCard } from '@/components/features/help/HelpArticleCard';
import {
  useHelpCategories,
  useHelpArticles,
  useSearchHelpArticles,
} from '@/hooks/help';
import { useDebounce } from '@/hooks/use-debounce';
import { EmptyState } from '@/components/ui/empty-state';
import { InlineHelp } from '@/components/help';

export default function HelpCenterIndex() {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);

  const { data: categories = [], isLoading: loadingCategories } = useHelpCategories();
  const { data: featuredArticles = [], isLoading: loadingFeatured } = useHelpArticles({
    featured: true,
    limit: 6,
  });
  const { data: searchResults = [], isLoading: loadingSearch } = useSearchHelpArticles(
    debouncedSearch,
    { enabled: debouncedSearch.length >= 2 }
  );

  const isSearching = debouncedSearch.length >= 2;

  return (
    <div className="space-y-8">
      {/* Search Section */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-8 text-center">
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2 justify-center">
          ¿En qué podemos ayudarte?
          <InlineHelp text="Centro de ayuda con artículos, guías, FAQs y tutoriales. Busca respuestas o crea tickets de soporte si necesitas asistencia personalizada." />
        </h2>
        <p className="text-muted-foreground mb-6">
          Busca en nuestra base de conocimiento o explora las categorías
        </p>
        <div className="max-w-xl mx-auto relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Buscar artículos, guías, preguntas frecuentes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 text-base"
          />
        </div>
      </div>

      {/* Search Results */}
      {isSearching && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            Resultados para "{debouncedSearch}"
          </h3>
          {loadingSearch ? (
            <div className="grid gap-4 md:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          ) : searchResults.length === 0 ? (
            <EmptyState
              icon={<FileQuestion className="h-12 w-12" />}
              title="Sin resultados"
              description="No encontramos artículos que coincidan con tu búsqueda. Intenta con otros términos."
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {searchResults.map((article) => (
                <HelpArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Categories */}
      {!isSearching && (
        <>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Categorías</h3>
            </div>
            {loadingCategories ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-32" />
                ))}
              </div>
            ) : categories.length === 0 ? (
              <EmptyState
                icon={<FileQuestion className="h-12 w-12" />}
                title="Sin categorías"
                description="Aún no hay categorías de ayuda disponibles."
              />
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {categories.map((category) => (
                  <HelpCategoryCard key={category.id} category={category} />
                ))}
              </div>
            )}
          </div>

          {/* Featured Articles */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Artículos Destacados</h3>
              <Link to="/app/help/articles">
                <Button variant="ghost" size="sm">
                  Ver todos
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
            {loadingFeatured ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-40" />
                ))}
              </div>
            ) : featuredArticles.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="p-6 text-center text-muted-foreground">
                  No hay artículos destacados aún.
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {featuredArticles.map((article) => (
                  <HelpArticleCard key={article.id} article={article} />
                ))}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  ¿Necesitas más ayuda?
                </CardTitle>
                <CardDescription>
                  Nuestro equipo de soporte está disponible para ayudarte
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/app/help/tickets/new">
                  <Button>
                    Crear Ticket de Soporte
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ExternalLink className="h-5 w-5" />
                  Recursos Adicionales
                </CardTitle>
                <CardDescription>
                  Documentación técnica y guías avanzadas
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Badge variant="secondary">API Docs</Badge>
                <Badge variant="secondary">Video Tutoriales</Badge>
                <Badge variant="secondary">Webinars</Badge>
                <Badge variant="secondary">Comunidad</Badge>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
