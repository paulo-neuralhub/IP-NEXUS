import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import { toast } from 'sonner';
import type { Portfolio, PortfolioFilters, CreatePortfolioDTO } from '@/types/docket-god-mode';
import type { Json } from '@/integrations/supabase/types';

export function usePortfolios(filters?: PortfolioFilters) {
  const { currentOrganization } = useOrganization();

  return useQuery({
    queryKey: ['portfolios', currentOrganization?.id, filters],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];

      let query = supabase
        .from('portfolios')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .order('name');

      if (filters?.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }

      if (filters?.isActive !== undefined) {
        query = query.eq('is_active', filters.isActive);
      }

      if (filters?.parentId) {
        query = query.eq('parent_portfolio_id', filters.parentId);
      } else if (filters?.parentId === null) {
        query = query.is('parent_portfolio_id', null);
      }

      if (filters?.ownerId) {
        query = query.eq('owner_id', filters.ownerId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Portfolio[];
    },
    enabled: !!currentOrganization?.id,
  });
}

export function usePortfolio(id: string) {
  return useQuery({
    queryKey: ['portfolio', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('portfolios')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Portfolio;
    },
    enabled: !!id,
  });
}

export function usePortfolioWithMatters(id: string) {
  return useQuery({
    queryKey: ['portfolio-matters', id],
    queryFn: async () => {
      // Get portfolio
      const { data: portfolio, error: pError } = await supabase
        .from('portfolios')
        .select('*')
        .eq('id', id)
        .single();

      if (pError) throw pError;

      // Get matters count
      const { count, error: mError } = await supabase
        .from('matters')
        .select('id', { count: 'exact', head: true })
        .eq('portfolio_id', id);

      if (mError) throw mError;

      return {
        ...portfolio,
        matter_count: count || 0,
      } as Portfolio;
    },
    enabled: !!id,
  });
}

export function useCreatePortfolio() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();

  return useMutation({
    mutationFn: async (dto: CreatePortfolioDTO) => {
      if (!currentOrganization?.id) throw new Error('No organization');

      const insertData = {
        name: dto.name,
        description: dto.description,
        color: dto.color,
        icon: dto.icon,
        parent_portfolio_id: dto.parent_portfolio_id,
        owner_id: dto.owner_id,
        settings: dto.settings as Json,
        organization_id: currentOrganization.id,
      };

      const { data, error } = await supabase
        .from('portfolios')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolios'] });
      toast.success('Portfolio creado');
    },
    onError: (error) => {
      toast.error('Error al crear portfolio: ' + error.message);
    },
  });
}

export function useUpdatePortfolio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...dto }: Partial<CreatePortfolioDTO> & { id: string }) => {
      const updateData: Record<string, unknown> = {};
      
      if (dto.name !== undefined) updateData.name = dto.name;
      if (dto.description !== undefined) updateData.description = dto.description;
      if (dto.color !== undefined) updateData.color = dto.color;
      if (dto.icon !== undefined) updateData.icon = dto.icon;
      if (dto.parent_portfolio_id !== undefined) updateData.parent_portfolio_id = dto.parent_portfolio_id;
      if (dto.owner_id !== undefined) updateData.owner_id = dto.owner_id;
      if (dto.settings !== undefined) updateData.settings = dto.settings as Json;

      const { data, error } = await supabase
        .from('portfolios')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['portfolios'] });
      queryClient.invalidateQueries({ queryKey: ['portfolio', id] });
      toast.success('Portfolio actualizado');
    },
    onError: (error) => {
      toast.error('Error: ' + error.message);
    },
  });
}

export function useDeletePortfolio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('portfolios')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolios'] });
      toast.success('Portfolio eliminado');
    },
    onError: (error) => {
      toast.error('Error: ' + error.message);
    },
  });
}

export function usePortfolioTree() {
  const { data: portfolios } = usePortfolios({ isActive: true });

  // Build hierarchical tree
  const buildTree = (items: Portfolio[], parentId?: string): Portfolio[] => {
    return items
      .filter((p) => p.parent_portfolio_id === parentId)
      .map((p) => ({
        ...p,
        children: buildTree(items, p.id),
      }));
  };

  return portfolios ? buildTree(portfolios, undefined) : [];
}
