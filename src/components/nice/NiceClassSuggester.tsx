// ============================================================
// IP-NEXUS - NICE CLASS SUGGESTER
// Suggests classes based on product/service description
// ============================================================

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Loader2, ChevronRight, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { NICE_CLASS_ICONS, NICE_CLASS_TITLES_ES } from '@/types/nice-classification';
import { useDebounce } from '@/hooks/use-debounce';
import { cn } from '@/lib/utils';

interface NiceClassSuggestion {
  class_number: number;
  class_type: string;
  class_title: string;
  match_count: number;
  sample_items: string[];
}

interface Props {
  onSelectClass?: (classNumber: number) => void;
  selectedClasses?: number[];
}

export function NiceClassSuggester({ onSelectClass, selectedClasses = [] }: Props) {
  const [description, setDescription] = useState('');
  const [suggestions, setSuggestions] = useState<NiceClassSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  
  const debouncedDescription = useDebounce(description, 500);

  useEffect(() => {
    if (!debouncedDescription || debouncedDescription.length < 3) { 
      setSuggestions([]); 
      return; 
    }

    async function getSuggestions() {
      setLoading(true);
      
      // Extract keywords from description
      const keywords = debouncedDescription
        .toLowerCase()
        .split(/[\s,;.]+/)
        .filter(word => word.length > 2);
      
      if (keywords.length === 0) {
        setSuggestions([]);
        setLoading(false);
        return;
      }
      
      // Search products matching keywords (columns: name_en, name_es)
      const { data: products } = await supabase
        .from('nice_products')
        .select('class_number, name_en, name_es')
        .or(`name_en.ilike.%${keywords[0]}%,name_es.ilike.%${keywords[0]}%`)
        .limit(100);
      
      if (!products || products.length === 0) {
        setSuggestions([]);
        setLoading(false);
        return;
      }
      
      // Group by class and count matches
      const classMatches: Record<number, { count: number; samples: string[] }> = {};
      
      for (const product of products) {
        if (!classMatches[product.class_number]) {
          classMatches[product.class_number] = { count: 0, samples: [] };
        }
        classMatches[product.class_number].count++;
        if (classMatches[product.class_number].samples.length < 3) {
          classMatches[product.class_number].samples.push(product.name_es || product.name_en);
        }
      }
      
      // Get class info
      const classNumbers = Object.keys(classMatches).map(Number);
      const { data: classes } = await supabase
        .from('nice_classes')
        .select('class_number, class_type, title_en, title_es')
        .in('class_number', classNumbers);
      
      // Build suggestions sorted by match count
      const suggestionsData: NiceClassSuggestion[] = (classes || [])
        .map(c => ({
          class_number: c.class_number,
          class_type: c.class_type || 'product',
          class_title: c.title_es || c.title_en || NICE_CLASS_TITLES_ES[c.class_number] || '',
          match_count: classMatches[c.class_number]?.count || 0,
          sample_items: classMatches[c.class_number]?.samples || []
        }))
        .sort((a, b) => b.match_count - a.match_count)
        .slice(0, 5);
      
      setSuggestions(suggestionsData);
      setLoading(false);
    }
    
    getSuggestions();
  }, [debouncedDescription]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          Sugerir Clases
        </CardTitle>
        <CardDescription>
          Describe tus productos o servicios para obtener sugerencias de clases
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="Ej: Aplicación móvil para delivery de comida, software de gestión empresarial, camisetas de algodón..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="min-h-[100px]"
        />

        {loading && (
          <div className="flex justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {!loading && suggestions.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Clases sugeridas basadas en tu descripción:
            </p>
            {suggestions.map((s) => {
              const isSelected = selectedClasses.includes(s.class_number);
              return (
                <button
                  key={s.class_number}
                  onClick={() => onSelectClass?.(s.class_number)}
                  className={cn(
                    'w-full p-4 rounded-lg border text-left transition-colors hover:border-primary/50',
                    isSelected && 'border-primary bg-primary/5'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{NICE_CLASS_ICONS[s.class_number] || '📦'}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">Clase {s.class_number}</span>
                        <Badge variant={s.class_type === 'product' ? 'default' : 'secondary'}>
                          {s.class_type === 'product' ? 'Producto' : 'Servicio'}
                        </Badge>
                        <Badge variant="outline">{s.match_count} coincidencias</Badge>
                        {isSelected && (
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {s.class_title}
                      </p>
                      {s.sample_items?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {s.sample_items.map((item, i) => (
                            <Badge key={i} variant="outline" className="text-xs font-normal">
                              {item.length > 30 ? item.substring(0, 30) + '...' : item}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {!loading && description.length >= 3 && suggestions.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No se encontraron sugerencias. Intenta con otros términos.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
