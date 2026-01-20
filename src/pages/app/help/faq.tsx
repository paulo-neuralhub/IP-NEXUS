/**
 * IP-NEXUS Help Center - FAQ Page
 * Frequently Asked Questions with search and categories
 */

import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, ChevronDown, ChevronRight, Tag } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FAQ_ITEMS, HELP_CATEGORIES } from '@/lib/constants/help-content';
import { useDebounce } from '@/hooks/use-debounce';
import ReactMarkdown from 'react-markdown';

export default function FAQPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(
    searchParams.get('category') || 'all'
  );
  
  const debouncedSearch = useDebounce(searchQuery, 300);

  const filteredFAQs = useMemo(() => {
    let items = FAQ_ITEMS;

    // Filter by category
    if (activeCategory !== 'all') {
      items = items.filter(faq => faq.categoryId === activeCategory);
    }

    // Filter by search
    if (debouncedSearch.length >= 2) {
      const query = debouncedSearch.toLowerCase();
      items = items.filter(faq => 
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query) ||
        faq.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    return items;
  }, [activeCategory, debouncedSearch]);

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    if (category === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', category);
    }
    setSearchParams(searchParams);
  };

  const getCategoryName = (categoryId: string) => {
    return HELP_CATEGORIES.find(c => c.id === categoryId)?.name || categoryId;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Preguntas Frecuentes</h1>
        <p className="text-muted-foreground">
          Encuentra respuestas a las preguntas más comunes
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar en las FAQs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Category Tabs */}
      <Tabs value={activeCategory} onValueChange={handleCategoryChange}>
        <TabsList className="flex-wrap h-auto gap-1 bg-transparent p-0">
          <TabsTrigger 
            value="all" 
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Todas
          </TabsTrigger>
          {HELP_CATEGORIES.slice(0, 6).map((category) => (
            <TabsTrigger
              key={category.id}
              value={category.id}
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Results Count */}
      {debouncedSearch.length >= 2 && (
        <p className="text-sm text-muted-foreground">
          {filteredFAQs.length} resultado{filteredFAQs.length !== 1 ? 's' : ''} 
          {activeCategory !== 'all' && ` en ${getCategoryName(activeCategory)}`}
        </p>
      )}

      {/* FAQ Accordion */}
      {filteredFAQs.length > 0 ? (
        <Accordion type="multiple" className="space-y-3">
          {filteredFAQs.map((faq) => (
            <AccordionItem 
              key={faq.id} 
              value={faq.id}
              className="border rounded-lg px-4 bg-card"
            >
              <AccordionTrigger className="text-left hover:no-underline py-4">
                <div className="flex-1 pr-4">
                  <div className="flex items-start gap-3">
                    <ChevronRight className="w-5 h-5 shrink-0 text-primary mt-0.5 transition-transform group-data-[state=open]:rotate-90" />
                    <div>
                      <p className="font-medium">{faq.question}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {getCategoryName(faq.categoryId)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4 pl-8">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>{faq.answer}</ReactMarkdown>
                </div>
                <div className="flex flex-wrap gap-1 mt-4 pt-3 border-t">
                  {faq.tags.map((tag) => (
                    <Badge 
                      key={tag} 
                      variant="secondary" 
                      className="text-xs cursor-pointer hover:bg-secondary/80"
                      onClick={() => setSearchQuery(tag)}
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg font-medium mb-2">No encontramos resultados</p>
          <p className="text-sm">
            Intenta con otros términos o{' '}
            <button 
              onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
              className="text-primary hover:underline"
            >
              ver todas las FAQs
            </button>
          </p>
        </div>
      )}
    </div>
  );
}
