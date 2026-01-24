// ============================================
// src/hooks/legal-ops/useRelationshipTypes.ts
// Catálogo de tipos de relación
// ============================================

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface RelationshipType {
  id: string;
  code: string;
  name_es: string;
  name_en: string;
  category: 'legal' | 'commercial' | 'ip' | 'contact';
  description: string | null;
  requires_document: boolean;
  icon: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface GroupedRelationshipTypes {
  legal: RelationshipType[];
  commercial: RelationshipType[];
  ip: RelationshipType[];
  contact: RelationshipType[];
}

const CATEGORY_LABELS: Record<string, { es: string; en: string }> = {
  legal: { es: 'Legales', en: 'Legal' },
  commercial: { es: 'Comerciales', en: 'Commercial' },
  ip: { es: 'Propiedad Industrial', en: 'Intellectual Property' },
  contact: { es: 'Contactos', en: 'Contacts' },
};

export function useRelationshipTypes() {
  return useQuery({
    queryKey: ['relationship-types'],
    queryFn: async (): Promise<GroupedRelationshipTypes> => {
      const { data, error } = await supabase
        .from('relationship_types')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;

      const grouped: GroupedRelationshipTypes = {
        legal: [],
        commercial: [],
        ip: [],
        contact: [],
      };

      (data || []).forEach((type) => {
        const category = type.category as keyof GroupedRelationshipTypes;
        if (grouped[category]) {
          grouped[category].push(type as RelationshipType);
        }
      });

      return grouped;
    },
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });
}

export function useRelationshipTypeByCode(code: string) {
  const { data: types } = useRelationshipTypes();
  
  if (!types) return null;
  
  for (const category of Object.values(types)) {
    const found = category.find(t => t.code === code);
    if (found) return found;
  }
  
  return null;
}

export function getCategoryLabel(category: string, lang: 'es' | 'en' = 'es'): string {
  return CATEGORY_LABELS[category]?.[lang] || category;
}

export { CATEGORY_LABELS };
