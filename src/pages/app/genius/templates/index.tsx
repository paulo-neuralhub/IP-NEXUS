import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Plus, Search, Sparkles, FileText, Tag, Scale, 
  Lightbulb, Mail, BarChart, Edit, Star, FolderOpen
} from 'lucide-react';
import type { DocumentTemplate, TemplateCategory } from '@/types/document-generation';

const CATEGORIES: { id: TemplateCategory | 'all'; label: string; icon: typeof FileText }[] = [
  { id: 'all', label: 'Todas', icon: FileText },
  { id: 'trademark', label: 'Marcas', icon: Tag },
  { id: 'patent', label: 'Patentes', icon: Lightbulb },
  { id: 'contract', label: 'Contratos', icon: Scale },
  { id: 'correspondence', label: 'Correspondencia', icon: Mail },
  { id: 'report', label: 'Informes', icon: BarChart },
];

export default function DocumentTemplatesPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'all'>('all');

  const { data: templates, isLoading } = useQuery({
    queryKey: ['document-templates', selectedCategory],
    queryFn: async () => {
      let query = supabase
        .from('document_templates')
        .select('*')
        .eq('is_active', true)
        .order('usage_count', { ascending: false });

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as DocumentTemplate[];
    },
  });

  const filteredTemplates = templates?.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCategoryIcon = (category: string) => {
    const cat = CATEGORIES.find(c => c.id === category);
    return cat?.icon || FileText;
  };

  const getCategoryLabel = (category: string) => {
    const cat = CATEGORIES.find(c => c.id === category);
    return cat?.label || category;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            Generador de Documentos
          </h1>
          <p className="text-muted-foreground">
            Crea documentos legales profesionales con IA en segundos
          </p>
        </div>
        <Button onClick={() => navigate('/app/genius/templates/new')}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva plantilla
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar plantillas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
          {CATEGORIES.map((cat) => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(cat.id)}
            >
              <cat.icon className="w-4 h-4 mr-2" />
              {cat.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Templates Grid */}
      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates?.map((template) => {
            const CategoryIcon = getCategoryIcon(template.category);
            
            return (
              <Card key={template.id} className="hover:shadow-lg transition-shadow group">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                        <CategoryIcon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate">{template.name}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {template.description}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant="outline">{getCategoryLabel(template.category)}</Badge>
                    {template.is_public && (
                      <Badge variant="secondary">Pública</Badge>
                    )}
                    {template.template_type === 'ai_assisted' && (
                      <Badge className="bg-primary/20 text-primary border-0">
                        <Sparkles className="w-3 h-3 mr-1" />
                        IA
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{template.variables?.length || 0} variables</span>
                    <span>•</span>
                    <span>Usado {template.usage_count || 0} veces</span>
                    {template.average_rating && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-warning text-warning" />
                          {template.average_rating.toFixed(1)}
                        </span>
                      </>
                    )}
                  </div>
                </CardContent>
                
                <CardFooter className="flex gap-2">
                  <Button
                    className="flex-1"
                    onClick={() => navigate(`/app/genius/templates/generate/${template.id}`)}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generar
                  </Button>
                  {!template.is_public && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => navigate(`/app/genius/templates/edit/${template.id}`)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredTemplates?.length === 0 && (
        <div className="text-center py-12">
          <FolderOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
          <h3 className="text-lg font-medium mb-2">No se encontraron plantillas</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery 
              ? 'Prueba con otros términos de búsqueda'
              : 'Crea tu primera plantilla para empezar'
            }
          </p>
          {!searchQuery && (
            <Button onClick={() => navigate('/app/genius/templates/new')}>
              <Plus className="w-4 h-4 mr-2" />
              Nueva plantilla
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
