// ============================================================
// IP-NEXUS - HOLIDAY CALENDARS HOOK
// Manage holiday calendars for deadline calculations
// ============================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import { toast } from 'sonner';

export interface HolidayEntry {
  id: string;
  country_code: string;
  region?: string | null;
  year: number;
  date: string;
  name: string | null;
  is_national: boolean | null;
  is_active: boolean | null;
  organization_id?: string | null;
  created_at?: string | null;
  // Computed field
  type: 'national' | 'regional' | 'custom';
}

export interface CreateHolidayDTO {
  country_code: string;
  region?: string;
  year: number;
  date: string;
  name: string;
  is_national?: boolean;
}

// Available countries
export const COUNTRIES = [
  { code: 'ES', name: 'España', flag: '🇪🇸' },
  { code: 'EU', name: 'Unión Europea (EUIPO)', flag: '🇪🇺' },
  { code: 'US', name: 'Estados Unidos (USPTO)', flag: '🇺🇸' },
  { code: 'GB', name: 'Reino Unido', flag: '🇬🇧' },
  { code: 'DE', name: 'Alemania', flag: '🇩🇪' },
  { code: 'FR', name: 'Francia', flag: '🇫🇷' },
  { code: 'IT', name: 'Italia', flag: '🇮🇹' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
  { code: 'MX', name: 'México', flag: '🇲🇽' },
  { code: 'BR', name: 'Brasil', flag: '🇧🇷' },
  { code: 'CN', name: 'China', flag: '🇨🇳' },
  { code: 'JP', name: 'Japón', flag: '🇯🇵' },
  { code: 'KR', name: 'Corea del Sur', flag: '🇰🇷' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'WIPO', name: 'WIPO', flag: '🌐' },
] as const;

// Get holidays for a country/year
export function useHolidayCalendar(countryCode: string, year: number) {
  const { currentOrganization } = useOrganization();

  return useQuery({
    queryKey: ['holiday-calendar', countryCode, year, currentOrganization?.id],
    queryFn: async () => {
      let query = supabase
        .from('holiday_calendars')
        .select('*')
        .eq('country_code', countryCode)
        .eq('year', year)
        .order('date');

      // Include system holidays and org-specific holidays
      if (currentOrganization?.id) {
        query = query.or(`organization_id.eq.${currentOrganization.id},organization_id.is.null`);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map(h => ({
        ...h,
        type: h.organization_id ? 'custom' : (h.is_national ? 'national' : 'regional'),
      } as HolidayEntry));
    },
    enabled: !!countryCode && !!year,
  });
}

// Get available years with data
export function useAvailableHolidayYears(countryCode: string) {
  return useQuery({
    queryKey: ['holiday-years', countryCode],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('holiday_calendars')
        .select('year')
        .eq('country_code', countryCode)
        .order('year', { ascending: false });

      if (error) throw error;

      const years = [...new Set((data || []).map(h => h.year))];
      return years.length > 0 ? years : [new Date().getFullYear(), new Date().getFullYear() + 1];
    },
    enabled: !!countryCode,
  });
}

// Add custom holiday
export function useAddHoliday() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();

  return useMutation({
    mutationFn: async (dto: CreateHolidayDTO) => {
      if (!currentOrganization?.id) throw new Error('No organization');

      const insertData = {
        organization_id: currentOrganization.id,
        country_code: dto.country_code,
        region: dto.region,
        year: dto.year,
        date: dto.date,
        name: dto.name,
        is_national: dto.is_national ?? false,
        is_active: true,
      };

      const { data, error } = await supabase
        .from('holiday_calendars')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { country_code, year }) => {
      queryClient.invalidateQueries({ queryKey: ['holiday-calendar', country_code, year] });
      queryClient.invalidateQueries({ queryKey: ['holidays'] });
      toast.success('Festivo añadido');
    },
    onError: (error: Error) => {
      toast.error('Error: ' + error.message);
    },
  });
}

// Toggle holiday active status
export function useToggleHoliday() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { data, error } = await supabase
        .from('holiday_calendars')
        .update({ is_active: isActive })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['holiday-calendar', data.country_code, data.year] });
      queryClient.invalidateQueries({ queryKey: ['holidays'] });
      toast.success(data.is_active ? 'Festivo activado' : 'Festivo desactivado');
    },
    onError: (error: Error) => {
      toast.error('Error: ' + error.message);
    },
  });
}

// Delete custom holiday
export function useDeleteHoliday() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!currentOrganization?.id) throw new Error('No organization');

      // Only delete org-specific holidays
      const { error } = await supabase
        .from('holiday_calendars')
        .delete()
        .eq('id', id)
        .eq('organization_id', currentOrganization.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holiday-calendar'] });
      queryClient.invalidateQueries({ queryKey: ['holidays'] });
      toast.success('Festivo eliminado');
    },
    onError: (error: Error) => {
      toast.error('Error: ' + error.message);
    },
  });
}

// Import holidays from file
export function useImportHolidays() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();

  return useMutation({
    mutationFn: async ({ 
      holidays, 
      countryCode, 
      year 
    }: { 
      holidays: Array<{ date: string; name: string }>; 
      countryCode: string; 
      year: number;
    }) => {
      if (!currentOrganization?.id) throw new Error('No organization');

      const insertData = holidays.map(h => ({
        organization_id: currentOrganization.id,
        country_code: countryCode,
        year,
        date: h.date,
        name: h.name,
        is_national: false,
        is_active: true,
      }));

      const { data, error } = await supabase
        .from('holiday_calendars')
        .insert(insertData)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { countryCode, year }) => {
      queryClient.invalidateQueries({ queryKey: ['holiday-calendar', countryCode, year] });
      queryClient.invalidateQueries({ queryKey: ['holidays'] });
      toast.success('Festivos importados correctamente');
    },
    onError: (error: Error) => {
      toast.error('Error al importar: ' + error.message);
    },
  });
}
