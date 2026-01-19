// ============================================================
// IP-NEXUS HELP - SEARCH COMPONENT
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { Search, X, FileText, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSearchHelpArticles } from '@/hooks/help';
import { HelpArticle } from '@/types/help';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';
import { Link } from 'react-router-dom';

interface HelpCenterSearchProps {
  className?: string;
  placeholder?: string;
  size?: 'sm' | 'md' | 'lg';
  basePath?: string;
}

export function HelpCenterSearch({ 
  className, 
  placeholder = 'Buscar en el centro de ayuda...',
  size = 'md',
  basePath = '/app/help'
}: HelpCenterSearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  
  const { data: results, isLoading } = useSearchHelpArticles(debouncedQuery);
  
  const handleClear = useCallback(() => {
    setQuery('');
    setIsOpen(false);
  }, []);

  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [debouncedQuery]);

  const sizeStyles = {
    sm: 'h-9 text-sm',
    md: 'h-10',
    lg: 'h-12 text-lg',
  };

  return (
    <div className={cn('relative', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className={cn('pl-10 pr-10', sizeStyles[size])}
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
            onClick={handleClear}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Results dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-lg shadow-lg z-50 max-h-[400px] overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">
              Buscando...
            </div>
          ) : results && results.length > 0 ? (
            <div className="py-2">
              {results.map((article: HelpArticle) => (
                <Link
                  key={article.id}
                  to={`${basePath}/article/${article.slug}`}
                  className="flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <FileText className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{article.title}</p>
                    {article.summary && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                        {article.summary}
                      </p>
                    )}
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              No se encontraron resultados para "{debouncedQuery}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
