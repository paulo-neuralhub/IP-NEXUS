// ============================================================
// IP-NEXUS BACKOFFICE - Nice Classes Admin Hooks
// ============================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';

// Types - matching actual DB schema with new columns
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
  // Admin fields
  last_reviewed_at: string | null;
  reviewed_by: string | null;
  icon: string | null;
  color: string | null;
  notes: string | null;
  // Computed UI field
  product_count?: number;
}

export interface NiceProduct {
  id: string;
  class_number: number;
  name_es: string;
  name_en: string | null;
  is_common: boolean;
  is_active: boolean;
  search_keywords: string[] | null;
  added_by: string | null;
  added_at: string | null;
  wipo_code: string | null;
}

export interface NiceStats {
  totalClasses: number;
  totalProducts: number;
  classesNeedingReview: number;
  reviewedThisYear: number;
}

// Helper to check if class needs review (>1 year)
export function needsReview(lastReviewedAt: string | null): boolean {
  if (!lastReviewedAt) return true;
  
  const lastReview = new Date(lastReviewedAt);
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  
  return lastReview < oneYearAgo;
}

// Get Nice Stats
export function useNiceStats() {
  return useQuery({
    queryKey: ['nice-stats'],
    queryFn: async (): Promise<NiceStats> => {
      const { data: classes, error: classError } = await supabase
        .from('nice_classes')
        .select('class_number, last_reviewed_at');

      if (classError) throw classError;

      const { count: totalProducts } = await supabase
        .from('nice_products')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      const classesNeedingReview = classes?.filter(c => 
        !c.last_reviewed_at || new Date(c.last_reviewed_at) < oneYearAgo
      ).length || 0;

      const currentYear = new Date().getFullYear();
      const reviewedThisYear = classes?.filter(c => {
        if (!c.last_reviewed_at) return false;
        return new Date(c.last_reviewed_at).getFullYear() === currentYear;
      }).length || 0;

      return {
        totalClasses: classes?.length || 45,
        totalProducts: totalProducts || 0,
        classesNeedingReview,
        reviewedThisYear,
      };
    },
  });
}

// Get all Nice Classes
export function useNiceClasses() {
  return useQuery({
    queryKey: ['nice-classes-admin'],
    queryFn: async (): Promise<NiceClass[]> => {
      const { data, error } = await supabase
        .from('nice_classes')
        .select('*')
        .order('class_number', { ascending: true });

      if (error) throw error;
      return data as NiceClass[];
    },
  });
}

// Get single Nice Class
export function useNiceClass(classNumber: number | null) {
  return useQuery({
    queryKey: ['nice-class', classNumber],
    queryFn: async (): Promise<NiceClass | null> => {
      if (!classNumber) return null;
      
      const { data, error } = await supabase
        .from('nice_classes')
        .select('*')
        .eq('class_number', classNumber)
        .single();

      if (error) throw error;
      return data as NiceClass;
    },
    enabled: !!classNumber,
  });
}

// Get products for a class
export function useNiceProducts(classNumber: number | null) {
  return useQuery({
    queryKey: ['nice-products', classNumber],
    queryFn: async (): Promise<NiceProduct[]> => {
      if (!classNumber) return [];
      
      const { data, error } = await supabase
        .from('nice_products')
        .select('*')
        .eq('class_number', classNumber)
        .order('is_common', { ascending: false })
        .order('name_es', { ascending: true });

      if (error) throw error;
      return data as NiceProduct[];
    },
    enabled: !!classNumber,
  });
}

// Mark class as reviewed
export function useMarkClassReviewed() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (classNumber: number) => {
      const { error } = await supabase
        .from('nice_classes')
        .update({ 
          last_reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id,
        })
        .eq('class_number', classNumber);

      if (error) throw error;

      // Log revision
      await supabase.from('nice_revision_log').insert({
        class_number: classNumber,
        action: 'reviewed',
        details: {},
        performed_by: user?.id,
      });
    },
    onSuccess: (_, classNumber) => {
      queryClient.invalidateQueries({ queryKey: ['nice-classes-admin'] });
      queryClient.invalidateQueries({ queryKey: ['nice-class', classNumber] });
      queryClient.invalidateQueries({ queryKey: ['nice-stats'] });
      toast.success('Clase marcada como revisada');
    },
    onError: (error) => {
      toast.error('Error al marcar como revisada');
      console.error(error);
    },
  });
}

// Update class notes/version
export function useUpdateNiceClass() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ classNumber, updates }: { 
      classNumber: number; 
      updates: Partial<Pick<NiceClass, 'notes'>>;
    }) => {
      const { error } = await supabase
        .from('nice_classes')
        .update(updates as any)
        .eq('class_number', classNumber);

      if (error) throw error;

      // Log revision
      await supabase.from('nice_revision_log').insert([{
        class_number: classNumber,
        action: 'class_updated',
        details: updates as any,
        performed_by: user?.id,
      }]);
    },
    onSuccess: (_, { classNumber }) => {
      queryClient.invalidateQueries({ queryKey: ['nice-classes-admin'] });
      queryClient.invalidateQueries({ queryKey: ['nice-class', classNumber] });
      toast.success('Clase actualizada');
    },
    onError: (error) => {
      toast.error('Error al actualizar clase');
      console.error(error);
    },
  });
}

// Add product
export function useAddNiceProduct() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ classNumber, nameEs, nameEn, isCommon = false }: { 
      classNumber: number; 
      nameEs: string;
      nameEn?: string;
      isCommon?: boolean;
    }) => {
      const { data, error } = await supabase
        .from('nice_products')
        .insert({
          class_number: classNumber,
          name_es: nameEs.trim(),
          name_en: nameEn?.trim() || null,
          is_common: isCommon,
          is_active: true,
          added_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Log revision
      await supabase.from('nice_revision_log').insert({
        class_number: classNumber,
        action: 'product_added',
        details: { name: nameEs, product_id: data.id },
        performed_by: user?.id,
      });

      return data;
    },
    onSuccess: (_, { classNumber }) => {
      queryClient.invalidateQueries({ queryKey: ['nice-products', classNumber] });
      queryClient.invalidateQueries({ queryKey: ['nice-classes-admin'] });
      queryClient.invalidateQueries({ queryKey: ['nice-stats'] });
      toast.success('Producto añadido');
    },
    onError: (error) => {
      toast.error('Error al añadir producto');
      console.error(error);
    },
  });
}

// Update product
export function useUpdateNiceProduct() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ productId, classNumber, updates }: { 
      productId: string; 
      classNumber: number;
      updates: Partial<Pick<NiceProduct, 'name_es' | 'name_en' | 'is_common' | 'is_active' | 'wipo_code'>>;
    }) => {
      const { error } = await supabase
        .from('nice_products')
        .update(updates)
        .eq('id', productId);

      if (error) throw error;

      // Log revision
      await supabase.from('nice_revision_log').insert({
        class_number: classNumber,
        action: 'product_updated',
        details: { product_id: productId, ...updates },
        performed_by: user?.id,
      });
    },
    onSuccess: (_, { classNumber }) => {
      queryClient.invalidateQueries({ queryKey: ['nice-products', classNumber] });
      queryClient.invalidateQueries({ queryKey: ['nice-classes-admin'] });
      toast.success('Producto actualizado');
    },
    onError: (error) => {
      toast.error('Error al actualizar producto');
      console.error(error);
    },
  });
}

// Delete product (soft delete by setting is_active = false)
export function useDeleteNiceProduct() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ productId, classNumber, hardDelete = false }: { 
      productId: string; 
      classNumber: number;
      hardDelete?: boolean;
    }) => {
      if (hardDelete) {
        const { error } = await supabase
          .from('nice_products')
          .delete()
          .eq('id', productId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('nice_products')
          .update({ is_active: false })
          .eq('id', productId);
        if (error) throw error;
      }

      // Log revision
      await supabase.from('nice_revision_log').insert({
        class_number: classNumber,
        action: 'product_removed',
        details: { product_id: productId, hard_delete: hardDelete },
        performed_by: user?.id,
      });
    },
    onSuccess: (_, { classNumber }) => {
      queryClient.invalidateQueries({ queryKey: ['nice-products', classNumber] });
      queryClient.invalidateQueries({ queryKey: ['nice-classes-admin'] });
      queryClient.invalidateQueries({ queryKey: ['nice-stats'] });
      toast.success('Producto eliminado');
    },
    onError: (error) => {
      toast.error('Error al eliminar producto');
      console.error(error);
    },
  });
}

// Get revision log for a class
export function useNiceRevisionLog(classNumber: number | null) {
  return useQuery({
    queryKey: ['nice-revision-log', classNumber],
    queryFn: async () => {
      if (!classNumber) return [];
      
      const { data, error } = await supabase
        .from('nice_revision_log')
        .select('*, performer:performed_by(full_name, email)')
        .eq('class_number', classNumber)
        .order('performed_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data;
    },
    enabled: !!classNumber,
  });
}

// Export to CSV
export function useExportNiceClasses() {
  return useMutation({
    mutationFn: async () => {
      const { data: classes, error: classError } = await supabase
        .from('nice_classes')
        .select('*')
        .order('class_number');

      if (classError) throw classError;

      const { data: products, error: productError } = await supabase
        .from('nice_products')
        .select('*')
        .eq('is_active', true)
        .order('class_number')
        .order('name_es');

      if (productError) throw productError;

      return { classes, products };
    },
    onSuccess: ({ classes, products }) => {
      // Create CSV content
      const classRows = (classes as any[])?.map(c => 
        `${c.class_number},"${c.title_es || ''}","${c.title_en || ''}",${c.class_type},0,"${c.last_reviewed_at || ''}"`
      ).join('\n');
      
      const classCSV = `class_number,title_es,title_en,type,product_count,last_reviewed_at\n${classRows}`;
      
      const blob = new Blob([classCSV], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nice-classes-export-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success('Exportación completada');
    },
    onError: (error) => {
      toast.error('Error al exportar');
      console.error(error);
    },
  });
}
