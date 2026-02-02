// ============================================================
// IP-NEXUS - NICE CLASSES HOOK
// Fetches Nice classes and products from Supabase
// Uses actual DB schema types
// ============================================================

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Types matching actual DB schema
export interface NiceClass {
  id: string;
  class_number: number;
  class_type: string;
  title_es: string | null;
  title_en: string;
  explanatory_note_es: string | null;
  explanatory_note_en: string | null;
  includes_en: string[] | null;
  includes_es: string[] | null;
  excludes_en: string[] | null;
  excludes_es: string[] | null;
  version_id: string | null;
  created_at: string | null;
  updated_at: string | null;
  last_reviewed_at: string | null;
  reviewed_by: string | null;
  icon: string | null;
  color: string | null;
  notes: string | null;
}

export interface NiceProduct {
  id: string;
  class_number: number;
  name_es: string;
  name_en: string | null;
  is_common: boolean;
  is_active?: boolean;
  wipo_code: string | null;
}

export interface NiceClassWithProducts extends NiceClass {
  products: NiceProduct[];
  category: 'product' | 'service' | 'products' | 'services';
}

export function useNiceClasses() {
  return useQuery({
    queryKey: ['nice-classes'],
    queryFn: async (): Promise<NiceClass[]> => {
      const { data, error } = await supabase
        .from('nice_classes')
        .select('*')
        .order('class_number', { ascending: true });
      
      if (error) throw error;
      return (data || []) as unknown as NiceClass[];
    },
    staleTime: 1000 * 60 * 60, // 1 hour - data is static
  });
}

export function useNiceProducts(classNumber?: number) {
  return useQuery({
    queryKey: ['nice-products', classNumber],
    queryFn: async (): Promise<NiceProduct[]> => {
      let query = supabase
        .from('nice_products')
        .select('*')
        .eq('is_active', true)
        .order('is_common', { ascending: false })
        .order('name_es', { ascending: true });
      
      if (classNumber) {
        query = query.eq('class_number', classNumber);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as NiceProduct[];
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

export function useNiceClassesWithProducts() {
  return useQuery({
    queryKey: ['nice-classes-with-products'],
    queryFn: async (): Promise<NiceClassWithProducts[]> => {
      // Fetch classes
      const { data: classes, error: classError } = await supabase
        .from('nice_classes')
        .select('*')
        .order('class_number', { ascending: true });
      
      if (classError) throw classError;
      
      // Fetch all products
      const { data: products, error: productError } = await supabase
        .from('nice_products')
        .select('*')
        .eq('is_active', true)
        .order('is_common', { ascending: false })
        .order('name_es', { ascending: true });
      
      if (productError) throw productError;
      
      // Group products by class
      const productsByClass = (products || []).reduce((acc, p) => {
        if (!acc[p.class_number]) acc[p.class_number] = [];
        acc[p.class_number].push(p as unknown as NiceProduct);
        return acc;
      }, {} as Record<number, NiceProduct[]>);
      
      // Combine
      return (classes || []).map(cls => ({
        ...(cls as unknown as NiceClass),
        products: productsByClass[cls.class_number] || [],
        category: cls.class_number <= 34 ? 'product' : 'service' as const,
      }));
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

// Icon mapping for classes without icons in DB
export const NICE_CLASS_ICONS: Record<number, string> = {
  1: '🧪', 2: '🎨', 3: '💄', 4: '🛢️', 5: '💊', 6: '🔩', 7: '⚙️', 8: '🔧',
  9: '📱', 10: '🩺', 11: '💡', 12: '🚗', 13: '🔫', 14: '💎', 15: '🎸',
  16: '📄', 17: '🧴', 18: '👜', 19: '🧱', 20: '🪑', 21: '🍳', 22: '🪢',
  23: '🧵', 24: '🧶', 25: '👕', 26: '🪡', 27: '🧺', 28: '🎮', 29: '🥩',
  30: '🍞', 31: '🌾', 32: '🍺', 33: '🍷', 34: '🚬', 35: '📢', 36: '🏦',
  37: '🏗️', 38: '📡', 39: '🚚', 40: '🏭', 41: '🎓', 42: '🔬', 43: '🍽️',
  44: '🏥', 45: '⚖️',
};
