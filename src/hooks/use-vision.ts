import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import type { VisionAnalysis, VisionAnalysisType, TrademarkVisual } from '@/types/advanced';

export function useVisionAnalyses(analysisType?: VisionAnalysisType) {
  const { currentOrganization } = useOrganization();
  
  return useQuery({
    queryKey: ['vision-analyses', currentOrganization?.id, analysisType],
    queryFn: async () => {
      let query = supabase
        .from('vision_analyses')
        .select('*')
        .eq('organization_id', currentOrganization!.id)
        .order('created_at', { ascending: false });
      
      if (analysisType) query = query.eq('analysis_type', analysisType);
      
      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as VisionAnalysis[];
    },
    enabled: !!currentOrganization?.id,
  });
}

export function useVisionAnalysis(id: string) {
  return useQuery({
    queryKey: ['vision-analysis', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vision_analyses')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as unknown as VisionAnalysis;
    },
    enabled: !!id,
  });
}

export function useAnalyzeImage() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();
  
  return useMutation({
    mutationFn: async (data: {
      file?: File;
      imageUrl?: string;
      analysisType: VisionAnalysisType;
      compareWithId?: string;
    }) => {
      let imageUrl = data.imageUrl;
      
      // Subir imagen si se proporciona
      if (data.file) {
        const filePath = `vision/${currentOrganization!.id}/${Date.now()}_${data.file.name}`;
        const { error: uploadError } = await supabase.storage
          .from('images')
          .upload(filePath, data.file);
        
        if (uploadError) throw uploadError;
        
        const { data: urlData } = supabase.storage
          .from('images')
          .getPublicUrl(filePath);
        
        imageUrl = urlData.publicUrl;
      }
      
      // Crear registro
      const { data: analysis, error } = await supabase
        .from('vision_analyses')
        .insert({
          organization_id: currentOrganization!.id,
          image_url: imageUrl,
          analysis_type: data.analysisType,
          compare_with_id: data.compareWithId,
          status: 'pending',
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Procesar análisis
      await supabase.functions.invoke('analyze-image', {
        body: { analysis_id: analysis.id },
      });
      
      return analysis as unknown as VisionAnalysis;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vision-analyses'] });
    },
  });
}

export function useCompareTrademark() {
  return useMutation({
    mutationFn: async (data: {
      imageFile: File;
      markName?: string;
      niceClasses?: number[];
    }) => {
      // Simulación: retornar resultados de demo sin llamar a edge function
      // La edge function 'compare-trademark' no está implementada
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simular latencia
      
      const mockResults = {
        similar_marks: data.markName ? [
          {
            mark_id: 'demo-1',
            mark_name: `${data.markName?.toUpperCase() || 'MARCA'} TECH`,
            similarity_score: 0.72,
            similarity_type: 'Visual + Fonética',
          },
          {
            mark_id: 'demo-2', 
            mark_name: `ECO${data.markName?.toUpperCase() || 'MARCA'}`,
            similarity_score: 0.58,
            similarity_type: 'Conceptual',
          },
        ] : [],
        dominant_colors: ['#3B82F6', '#10B981', '#1E293B'],
      };
      
      return mockResults;
    },
  });
}

export function useFindSimilarLogos() {
  return useMutation({
    mutationFn: async (imageUrl: string) => {
      const { data, error } = await supabase.functions.invoke('find-similar-logos', {
        body: { image_url: imageUrl },
      });
      
      if (error) throw error;
      return data;
    },
  });
}

export function useTrademarkVisuals(matterId?: string) {
  const { currentOrganization } = useOrganization();
  
  return useQuery({
    queryKey: ['trademark-visuals', currentOrganization?.id, matterId],
    queryFn: async () => {
      let query = supabase
        .from('trademark_visuals')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (matterId) {
        query = query.eq('matter_id', matterId);
      } else if (currentOrganization?.id) {
        query = query.eq('organization_id', currentOrganization.id);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as TrademarkVisual[];
    },
    enabled: !!currentOrganization?.id || !!matterId,
  });
}

export function useCreateTrademarkVisual() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();
  
  return useMutation({
    mutationFn: async (data: {
      file: File;
      matterId?: string;
      markName?: string;
      niceClasses?: number[];
      isTextMark?: boolean;
      isDeviceMark?: boolean;
      isCombination?: boolean;
    }) => {
      // Calcular hash
      const imageHash = await calculateImageHash(data.file);
      
      // Subir imagen
      const filePath = `trademarks/${currentOrganization!.id}/${Date.now()}_${data.file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, data.file);
      
      if (uploadError) throw uploadError;
      
      const { data: urlData } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);
      
      // Crear registro
      const { data: visual, error } = await supabase
        .from('trademark_visuals')
        .insert({
          organization_id: currentOrganization!.id,
          matter_id: data.matterId,
          image_url: urlData.publicUrl,
          image_hash: imageHash,
          mark_name: data.markName,
          nice_classes: data.niceClasses,
          is_text_mark: data.isTextMark ?? false,
          is_device_mark: data.isDeviceMark ?? true,
          is_combination: data.isCombination ?? false,
        })
        .select()
        .single();
      
      if (error) throw error;
      return visual as unknown as TrademarkVisual;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trademark-visuals'] });
    },
  });
}

export function useDeleteVisionAnalysis() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('vision_analyses')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vision-analyses'] });
    },
  });
}

// Helper
async function calculateImageHash(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
