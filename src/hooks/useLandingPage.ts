// ============================================
// src/hooks/useLandingPage.ts
// ============================================

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface LandingFeature {
  icon: string;
  title: string;
  description: string;
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
  module_code: string;
  title: string;
  meta_description: string | null;
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
  final_cta_title: string | null;
  final_cta_subtitle: string | null;
  final_cta_type: 'form' | 'button' | 'calendly';
  final_cta_config: Record<string, unknown>;
  is_published: boolean;
}

export function useLandingPage(slug: string) {
  return useQuery({
    queryKey: ['landing-page', slug],
    queryFn: async (): Promise<LandingPage | null> => {
      const { data, error } = await supabase
        .from('landing_pages')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      return {
        ...data,
        features: (data.features as unknown as LandingFeature[]) || [],
        pricing_plans: (data.pricing_plans as unknown as LandingPricingPlan[]) || [],
        testimonials: (data.testimonials as unknown as LandingTestimonial[]) || [],
        faqs: (data.faqs as unknown as LandingFaq[]) || [],
        final_cta_type: (data.final_cta_type as LandingPage['final_cta_type']) || 'form',
        final_cta_config: (data.final_cta_config as Record<string, unknown>) || {},
      };
    },
    enabled: !!slug,
  });
}
