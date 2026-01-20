import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import type { 
  Subscription, 
  SubscriptionPlan, 
  PlanLimits 
} from '@/types/backoffice';

// ===== HELPER: Storage Usage =====
async function getStorageUsage(organizationId: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('matter_documents')
      .select('file_size')
      .eq('organization_id', organizationId);
    
    if (error) return 0;
    
    const totalBytes = (data || []).reduce((sum, doc) => sum + (doc.file_size || 0), 0);
    return Math.round(totalBytes / (1024 * 1024) * 100) / 100; // MB with 2 decimals
  } catch {
    return 0;
  }
}

// ===== PLANES =====
export function useSubscriptionPlans() {
  return useQuery({
    queryKey: ['subscription-plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      if (error) throw error;
      return data as SubscriptionPlan[];
    },
    staleTime: 1000 * 60 * 60, // 1 hora
  });
}

// ===== SUSCRIPCIÓN ACTUAL =====
export function useCurrentSubscription() {
  const { currentOrganization } = useOrganization();
  
  return useQuery({
    queryKey: ['subscription', currentOrganization?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          *,
          plan:subscription_plans(*)
        `)
        .eq('organization_id', currentOrganization!.id)
        .maybeSingle();
      if (error) throw error;
      return data as Subscription | null;
    },
    enabled: !!currentOrganization?.id,
  });
}

// ===== LÍMITES DEL PLAN =====
export function usePlanLimits() {
  const { data: subscription } = useCurrentSubscription();
  
  return useQuery({
    queryKey: ['plan-limits', subscription?.plan_id],
    queryFn: async () => {
      if (!subscription?.plan) return null;
      return subscription.plan.limits as PlanLimits;
    },
    enabled: !!subscription?.plan,
  });
}

// ===== USO ACTUAL =====
export function useCurrentUsage() {
  const { currentOrganization } = useOrganization();
  const currentMonth = new Date().toISOString().slice(0, 7) + '-01';
  
  return useQuery({
    queryKey: ['current-usage', currentOrganization?.id, currentMonth],
    queryFn: async () => {
      const orgId = currentOrganization!.id;
      
      // Contar matters
      const { count: mattersCount } = await supabase
        .from('matters')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', orgId);
      
      // Contar contacts
      const { count: contactsCount } = await supabase
        .from('contacts')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', orgId);
      
      // Contar users
      const { count: usersCount } = await supabase
        .from('memberships')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', orgId);
      
      // Contar watchlists
      const { count: watchlistsCount } = await supabase
        .from('watchlists')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', orgId);
      
      // AI usage este mes
      const { data: aiUsage } = await supabase
        .from('ai_usage')
        .select('*')
        .eq('organization_id', orgId)
        .gte('period_start', currentMonth)
        .maybeSingle();
      
      return {
        matters: mattersCount || 0,
        contacts: contactsCount || 0,
        users: usersCount || 0,
        watchlists: watchlistsCount || 0,
        ai_messages_today: aiUsage?.chat_messages || 0,
        ai_docs_month: aiUsage?.document_generations || 0,
        storage_mb: await getStorageUsage(orgId),
      };
    },
    enabled: !!currentOrganization?.id,
  });
}

// ===== VERIFICAR LÍMITE =====
export function useCheckLimit() {
  const { data: limits } = usePlanLimits();
  const { data: usage } = useCurrentUsage();
  
  const checkLimit = (limitKey: keyof PlanLimits, currentValue?: number): {
    allowed: boolean;
    limit: number;
    current: number;
    remaining: number;
    percentage: number;
  } => {
    if (!limits) return { allowed: true, limit: -1, current: 0, remaining: -1, percentage: 0 };
    
    const limit = limits[limitKey];
    if (limit === -1) return { allowed: true, limit: -1, current: currentValue || 0, remaining: -1, percentage: 0 };
    
    let current = currentValue || 0;
    
    // Mapear límites a usage
    if (!currentValue && usage) {
      const usageMap: Record<string, number> = {
        max_users: usage.users,
        max_matters: usage.matters,
        max_contacts: usage.contacts,
        max_watchlists: usage.watchlists,
        max_ai_messages_day: usage.ai_messages_today,
        max_ai_docs_month: usage.ai_docs_month,
        max_storage_gb: usage.storage_mb / 1024,
      };
      current = usageMap[limitKey] || 0;
    }
    
    const remaining = limit - current;
    const percentage = Math.min(100, (current / limit) * 100);
    
    return {
      allowed: current < limit,
      limit,
      current,
      remaining,
      percentage,
    };
  };
  
  return { checkLimit, limits, usage };
}

// ===== CAMBIAR PLAN =====
export function useChangePlan() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();
  
  return useMutation({
    mutationFn: async ({ planId, billingCycle }: { 
      planId: string; 
      billingCycle: 'monthly' | 'yearly';
    }) => {
      if (!currentOrganization?.id) {
        throw new Error('No organization selected');
      }
      
      // Call Stripe edge function for plan change
      const { data, error } = await supabase.functions.invoke('stripe-change-plan', {
        body: { 
          planId,
          billingCycle,
          organizationId: currentOrganization.id 
        }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
    },
  });
}

// ===== CANCELAR SUSCRIPCIÓN =====
export function useCancelSubscription() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();
  
  return useMutation({
    mutationFn: async (reason?: string) => {
      const { data, error } = await supabase
        .from('subscriptions')
        .update({ 
          cancel_at_period_end: true,
          cancellation_reason: reason,
          updated_at: new Date().toISOString(),
        })
        .eq('organization_id', currentOrganization!.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
    },
  });
}
