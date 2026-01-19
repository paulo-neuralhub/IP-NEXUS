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

export function useHelpArticle(slug: string) {
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

      // Increment view count
      await supabase
        .from('help_articles')
        .update({ view_count: (data.view_count || 0) + 1 })
        .eq('id', data.id);

      return data as HelpArticle;
    },
    enabled: !!slug,
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
