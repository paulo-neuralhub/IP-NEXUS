// ============================================
// src/hooks/backoffice/useLandingPages.ts
// Hooks for managing landing pages in backoffice
// ============================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface LandingFeature {
  icon: string;
  title: string;
  description: string;
  benefit?: string;
  image_url?: string;
}

export interface LandingPricingPlan {
  name: string;
  price: number | null;
  currency: string;
  period: string;
  features: string[];
  cta_text: string;
  cta_url?: string;
  is_popular?: boolean;
}

export interface LandingTestimonial {
  name: string;
  role: string;
  company: string;
  avatar_url?: string;
  quote: string;
  rating?: number;
}

export interface LandingFaq {
  question: string;
  answer: string;
}

export interface LandingPage {
  id: string;
  slug: string;
  name: string;
  module_code: string;
  title: string;
  meta_description: string | null;
  og_image_url: string | null;
  hero_title: string;
  hero_subtitle: string | null;
  hero_cta_text: string;
  hero_cta_url: string | null;
  hero_secondary_cta_text: string | null;
  hero_secondary_cta_url: string | null;
  hero_image_url: string | null;
  hero_video_url: string | null;
  features: LandingFeature[];
  pricing_plans: LandingPricingPlan[];
  testimonials: LandingTestimonial[];
  faqs: LandingFaq[];
  integrations: string[];
  final_cta_title: string | null;
  final_cta_subtitle: string | null;
  final_cta_type: 'form' | 'button' | 'calendly';
  final_cta_config: Record<string, unknown>;
  accent_color: string;
  status: 'draft' | 'published' | 'archived';
  is_published: boolean;
  total_visits: number;
  total_leads: number;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

// Fetch all landing pages
export function useLandingPages() {
  return useQuery({
    queryKey: ['backoffice-landing-pages'],
    queryFn: async (): Promise<LandingPage[]> => {
      const { data, error } = await supabase
        .from('landing_pages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return (data || []).map(page => ({
        ...page,
        name: page.name || `IP-${page.module_code?.toUpperCase()}`,
        features: (page.features as unknown as LandingFeature[]) || [],
        pricing_plans: (page.pricing_plans as unknown as LandingPricingPlan[]) || [],
        testimonials: (page.testimonials as unknown as LandingTestimonial[]) || [],
        faqs: (page.faqs as unknown as LandingFaq[]) || [],
        integrations: (page.integrations as unknown as string[]) || [],
        final_cta_type: (page.final_cta_type as LandingPage['final_cta_type']) || 'form',
        final_cta_config: (page.final_cta_config as Record<string, unknown>) || {},
        accent_color: page.accent_color || '#1E40AF',
        status: (page.status as LandingPage['status']) || 'published',
        total_visits: page.total_visits || 0,
        total_leads: page.total_leads || 0,
      }));
    },
  });
}

// Fetch single landing page
export function useLandingPage(id: string | undefined) {
  return useQuery({
    queryKey: ['backoffice-landing-page', id],
    queryFn: async (): Promise<LandingPage | null> => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('landing_pages')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;
      
      return {
        ...data,
        name: data.name || `IP-${data.module_code?.toUpperCase()}`,
        features: (data.features as unknown as LandingFeature[]) || [],
        pricing_plans: (data.pricing_plans as unknown as LandingPricingPlan[]) || [],
        testimonials: (data.testimonials as unknown as LandingTestimonial[]) || [],
        faqs: (data.faqs as unknown as LandingFaq[]) || [],
        integrations: (data.integrations as unknown as string[]) || [],
        final_cta_type: (data.final_cta_type as LandingPage['final_cta_type']) || 'form',
        final_cta_config: (data.final_cta_config as Record<string, unknown>) || {},
        accent_color: data.accent_color || '#1E40AF',
        status: (data.status as LandingPage['status']) || 'published',
        total_visits: data.total_visits || 0,
        total_leads: data.total_leads || 0,
      };
    },
    enabled: !!id,
  });
}

// Create landing page
export function useCreateLandingPage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<LandingPage>) => {
      const { data: result, error } = await supabase
        .from('landing_pages')
        .insert([{
          slug: data.slug,
          name: data.name,
          module_code: data.module_code,
          title: data.title,
          meta_description: data.meta_description,
          hero_title: data.hero_title || data.title,
          hero_subtitle: data.hero_subtitle,
          hero_cta_text: data.hero_cta_text || 'Comenzar',
          accent_color: data.accent_color || '#1E40AF',
          status: data.status || 'draft',
          features: JSON.parse(JSON.stringify(data.features || [])),
          pricing_plans: JSON.parse(JSON.stringify(data.pricing_plans || [])),
          faqs: JSON.parse(JSON.stringify(data.faqs || [])),
        } as Record<string, unknown>])
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backoffice-landing-pages'] });
      toast.success('Landing page creada');
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
}

// Update landing page
export function useUpdateLandingPage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<LandingPage> & { id: string }) => {
      const updateData: Record<string, unknown> = { ...data };
      
      // Remove computed fields
      delete updateData.is_published;
      delete updateData.created_at;
      
      // Update published_at if publishing
      if (data.status === 'published') {
        updateData.published_at = new Date().toISOString();
      }
      
      const { data: result, error } = await supabase
        .from('landing_pages')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['backoffice-landing-pages'] });
      queryClient.invalidateQueries({ queryKey: ['backoffice-landing-page', variables.id] });
      toast.success('Landing page actualizada');
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
}

// Delete landing page
export function useDeleteLandingPage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('landing_pages')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backoffice-landing-pages'] });
      toast.success('Landing page eliminada');
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
}

// Duplicate landing page
export function useDuplicateLandingPage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      // Fetch original
      const { data: original, error: fetchError } = await supabase
        .from('landing_pages')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      // Create copy
      const { data: result, error } = await supabase
        .from('landing_pages')
        .insert({
          slug: `${original.slug}-copy-${Date.now()}`,
          name: `${original.name} (copia)`,
          module_code: original.module_code,
          title: original.title,
          meta_description: original.meta_description,
          hero_title: original.hero_title,
          hero_subtitle: original.hero_subtitle,
          hero_cta_text: original.hero_cta_text,
          hero_cta_url: original.hero_cta_url,
          hero_secondary_cta_text: original.hero_secondary_cta_text,
          hero_secondary_cta_url: original.hero_secondary_cta_url,
          hero_image_url: original.hero_image_url,
          hero_video_url: original.hero_video_url,
          features: original.features,
          pricing_plans: original.pricing_plans,
          testimonials: original.testimonials,
          faqs: original.faqs,
          final_cta_title: original.final_cta_title,
          final_cta_subtitle: original.final_cta_subtitle,
          final_cta_type: original.final_cta_type,
          final_cta_config: original.final_cta_config,
          accent_color: original.accent_color,
          status: 'draft',
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backoffice-landing-pages'] });
      toast.success('Landing page duplicada');
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
}
