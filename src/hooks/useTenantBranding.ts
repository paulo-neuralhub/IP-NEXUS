// src/hooks/useTenantBranding.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

// Use database type directly
type OrganizationBrandingRow = Database['public']['Tables']['organization_branding']['Row'];

export interface TenantBranding extends OrganizationBrandingRow {
  // Alias for easier access
}

const DEFAULT_BRANDING = {
  logo_width: 180,
  logo_position: 'left',
  primary_color: '#2563eb',
  secondary_color: '#1e40af',
  accent_color: '#f59e0b',
  font_family: 'Inter',
  heading_font_family: 'Inter',
  company_legal_name: null,
  company_tax_id: null,
  company_address: null,
  company_city: null,
  company_postal_code: null,
  company_country: 'España',
  company_phone: null,
  company_email: null,
  company_website: null,
  bank_name: null,
  bank_iban: null,
  bank_swift: null,
  registry_info: null,
  footer_text: null,
};

export function useTenantBranding() {
  const { currentOrganization } = useOrganization();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const orgId = currentOrganization?.id;

  // Fetch branding
  const { data: branding, isLoading, error } = useQuery({
    queryKey: ['tenant-branding', orgId],
    queryFn: async () => {
      if (!orgId) return null;
      
      const { data, error } = await supabase
        .from('organization_branding')
        .select('*')
        .eq('organization_id', orgId)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!orgId,
  });

  // Update branding
  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<OrganizationBrandingRow>) => {
      if (!orgId) throw new Error('No organization');

      const { error } = await supabase
        .from('organization_branding')
        .upsert({
          organization_id: orgId,
          ...updates,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'organization_id' });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-branding', orgId] });
      toast({ title: 'Identidad de marca guardada' });
    },
    onError: (error) => {
      toast({
        title: 'Error al guardar',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Upload logo
  const uploadLogoMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!orgId) throw new Error('No organization');

      const ext = file.name.split('.').pop();
      const fileName = `${orgId}/document-logo-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('logos')
        .getPublicUrl(fileName);

      // Update branding with new logo URL
      await updateMutation.mutateAsync({ logo_url: publicUrl });

      return publicUrl;
    },
    onError: (error) => {
      toast({
        title: 'Error al subir logo',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Merge defaults with actual branding
  const mergedBranding = branding ? {
    ...DEFAULT_BRANDING,
    ...branding,
  } : null;

  return {
    branding: mergedBranding,
    isLoading,
    error,
    updateBranding: updateMutation.mutateAsync,
    uploadLogo: uploadLogoMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    isUploadingLogo: uploadLogoMutation.isPending,
  };
}
