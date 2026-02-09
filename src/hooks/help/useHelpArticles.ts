// ============================================================
// IP-NEXUS HELP - ARTICLES HOOKS
// ============================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { HelpArticle, HelpCategory, CreateArticleForm } from '@/types/help';
import { toast } from 'sonner';

// ==========================================
// CATEGORIES
// ==========================================

export function useHelpCategories() {
  return useQuery({
    queryKey: ['help-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('help_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as HelpCategory[];
    },
  });
}

// ==========================================
// ARTICLES
// ==========================================

export function useHelpArticles(options?: {
  categoryId?: string;
  module?: string;
  type?: string;
  featured?: boolean;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['help-articles', options],
    queryFn: async () => {
      let query = supabase
        .from('help_articles')
        .select('*, category:help_categories(*)')
        .eq('is_published', true);

      if (options?.categoryId) {
        query = query.eq('category_id', options.categoryId);
      }
      if (options?.module) {
        query = query.eq('module', options.module);
      }
      if (options?.type) {
        query = query.eq('article_type', options.type);
      }
      if (options?.featured) {
        query = query.eq('is_featured', true);
      }

      query = query.order('display_order', { ascending: true });

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as HelpArticle[];
    },
  });
}

export function useHelpArticle(slug: string, options?: { enabled?: boolean }) {
  const isEnabled = options?.enabled !== undefined ? (options.enabled && !!slug) : !!slug;
  return useQuery({
    queryKey: ['help-article', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('help_articles')
        .select('*, category:help_categories(*)')
        .eq('slug', slug)
        .eq('is_published', true)
        .single();

      if (error) throw error;

      // Increment view count (RLS-safe)
      // Fire-and-forget to avoid blocking the page render.
      supabase.rpc('increment_help_view_count', { p_article_id: data.id }).then();

      return data as HelpArticle;
    },
    enabled: isEnabled,
  });
}

export function useSearchHelpArticles(
  query: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ['help-search', query],
    queryFn: async () => {
      if (!query || query.length < 2) return [];

      const { data, error } = await supabase
        .from('help_articles')
        .select('*, category:help_categories(*)')
        .eq('is_published', true)
        .textSearch('search_vector', query, { type: 'websearch', config: 'spanish' })
        .order('view_count', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as HelpArticle[];
    },
    enabled: options?.enabled !== false && query.length >= 2,
  });
}

export function useRelatedArticles(
  articleId: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ['help-related', articleId],
    queryFn: async () => {
      // Get current article's category and module
      const { data: article } = await supabase
        .from('help_articles')
        .select('category_id, module, tags')
        .eq('id', articleId)
        .single();

      if (!article) return [];

      const { data, error } = await supabase
        .from('help_articles')
        .select('*, category:help_categories(*)')
        .eq('is_published', true)
        .neq('id', articleId)
        .or(`category_id.eq.${article.category_id},module.eq.${article.module}`)
        .limit(5);

      if (error) throw error;
      return data as HelpArticle[];
    },
    enabled: options?.enabled !== false && !!articleId,
  });
}

// ==========================================
// ARTICLE FEEDBACK
// ==========================================

export function useSubmitArticleFeedback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      articleId,
      isHelpful,
      feedbackText,
      organizationId,
    }: {
      articleId: string;
      isHelpful: boolean;
      feedbackText?: string;
      organizationId?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase.from('help_article_feedback').insert({
        article_id: articleId,
        user_id: user?.id,
        organization_id: organizationId,
        is_helpful: isHelpful,
        feedback_text: feedbackText,
      });

      if (error) throw error;

      // Update article counts
      await supabase.rpc('increment_article_feedback', {
        p_article_id: articleId,
        p_is_helpful: isHelpful,
      });
    },
    onSuccess: () => {
      toast.success('¡Gracias por tu feedback!');
      queryClient.invalidateQueries({ queryKey: ['help-article'] });
    },
    onError: () => {
      toast.error('Error al enviar feedback');
    },
  });
}

// ==========================================
// ADMIN: ARTICLE MANAGEMENT
// ==========================================

export function useAllHelpArticles() {
  return useQuery({
    queryKey: ['help-articles-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('help_articles')
        .select('*, category:help_categories(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as HelpArticle[];
    },
  });
}

export function useCreateHelpArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (article: CreateArticleForm) => {
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('help_articles')
        .insert({
          ...article,
          created_by: user?.id,
          published_at: article.is_published ? new Date().toISOString() : null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Artículo creado');
      queryClient.invalidateQueries({ queryKey: ['help-articles'] });
    },
    onError: () => {
      toast.error('Error al crear artículo');
    },
  });
}

export function useUpdateHelpArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<HelpArticle> & { id: string }) => {
      const { data, error } = await supabase
        .from('help_articles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Artículo actualizado');
      queryClient.invalidateQueries({ queryKey: ['help-articles'] });
      queryClient.invalidateQueries({ queryKey: ['help-article'] });
    },
    onError: () => {
      toast.error('Error al actualizar artículo');
    },
  });
}

export function useDeleteHelpArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('help_articles')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Artículo eliminado');
      queryClient.invalidateQueries({ queryKey: ['help-articles'] });
    },
    onError: () => {
      toast.error('Error al eliminar artículo');
    },
  });
}

// ==========================================
// ADMIN: CATEGORY MANAGEMENT
// ==========================================

export function useCreateHelpCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (category: Partial<HelpCategory>) => {
      const { data, error } = await supabase
        .from('help_categories')
        .insert({
          slug: category.slug || '',
          name: category.name || '',
          description: category.description,
          icon: category.icon,
          color: category.color,
          parent_id: category.parent_id,
          display_order: category.display_order ?? 0,
          is_active: category.is_active ?? true,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Categoría creada');
      queryClient.invalidateQueries({ queryKey: ['help-categories'] });
    },
    onError: () => {
      toast.error('Error al crear categoría');
    },
  });
}

export function useUpdateHelpCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<HelpCategory> & { id: string }) => {
      const { data, error } = await supabase
        .from('help_categories')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Categoría actualizada');
      queryClient.invalidateQueries({ queryKey: ['help-categories'] });
    },
    onError: () => {
      toast.error('Error al actualizar categoría');
    },
  });
}

export function useDeleteHelpCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('help_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Categoría eliminada');
      queryClient.invalidateQueries({ queryKey: ['help-categories'] });
    },
    onError: () => {
      toast.error('Error al eliminar categoría');
    },
  });
}
