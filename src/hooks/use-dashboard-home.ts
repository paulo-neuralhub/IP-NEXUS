import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import { useAuth } from '@/contexts/auth-context';

export interface DashboardHomeData {
  // Counts
  totalMatters: number;
  activeWatchlists: number;
  pendingDeals: number;
  marketListings: number;
  
  // Financial
  portfolioValue: number;
  portfolioChange: number;
  portfolioCurrency: string;
  portfolioBreakdown: {
    trademarks: number;
    patents: number;
    designs: number;
    copyrights: number;
    other: number;
  };
  
  // Alerts
  criticalAlerts: number;
  highAlerts: number;
  upcomingDeadlines: number;
  expiringMatters: number;
  
  // Activity
  recentActivity: ActivityItem[];
  
  // Deadlines
  deadlines: DeadlineItem[];
  
  // Market
  marketNotifications: number;
  pendingOffers: number;
  
  // AI
  aiCreditsUsed: number;
  aiCreditsTotal: number;
  
  // CRM
  totalContacts: number;
  openDeals: number;
  dealsPipeline: number;
}

export interface ActivityItem {
  id: string;
  type: string;
  title: string;
  description: string | null;
  module: string;
  timestamp: string;
  link?: string;
}

export interface DeadlineItem {
  id: string;
  title: string;
  dueDate: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  type: string;
  matterId?: string;
  matterRef?: string;
}

export function useDashboardHome() {
  const { currentOrganization } = useOrganization();
  const { user } = useAuth();

  return useQuery({
    queryKey: ['dashboard-home', currentOrganization?.id],
    queryFn: async (): Promise<DashboardHomeData> => {
      if (!currentOrganization?.id || !user?.id) {
        throw new Error('No organization context');
      }

      const orgId = currentOrganization.id;
      const now = new Date().toISOString();
      const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      const ninetyDaysFromNow = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();

      // Parallel queries for performance
      const [
        mattersResult,
        watchlistsResult,
        dealsResult,
        contactsResult,
        portfoliosResult,
        criticalAlertsResult,
        highAlertsResult,
        activitiesResult,
        deadlinesResult,
        expiringResult,
        aiUsageResult,
      ] = await Promise.all([
        // Total matters
        supabase
          .from('matters')
          .select('id', { count: 'exact', head: true })
          .eq('organization_id', orgId),

        // Active watchlists
        supabase
          .from('watchlists')
          .select('id', { count: 'exact', head: true })
          .eq('organization_id', orgId)
          .eq('is_active', true),

        // Open deals (CRM V2 - crm_deals)
        supabase
          .from('crm_deals')
          .select('id, amount', { count: 'exact' })
          .eq('organization_id', orgId)
          .is('won', null), // not won/lost yet

        // Total contacts
        supabase
          .from('contacts')
          .select('id', { count: 'exact', head: true })
          .eq('organization_id', orgId),

        // Portfolio data
        supabase
          .from('finance_portfolios')
          .select('total_value, currency, total_cost, unrealized_gain')
          .eq('organization_id', orgId),

        // Critical alerts
        supabase
          .from('spider_alerts')
          .select('id', { count: 'exact', head: true })
          .eq('organization_id', orgId)
          .eq('severity', 'critical')
          .eq('status', 'unread'),

        // High alerts
        supabase
          .from('spider_alerts')
          .select('id', { count: 'exact', head: true })
          .eq('organization_id', orgId)
          .eq('severity', 'high')
          .eq('status', 'unread'),

        // Recent activities (from activity_log which has broader coverage)
        supabase
          .from('activity_log')
          .select('id, action, title, description, entity_type, created_at, matter_id, deal_id, client_id')
          .eq('organization_id', orgId)
          .order('created_at', { ascending: false })
          .limit(10),

        // Upcoming deadlines (matter_deadlines)
        supabase
          .from('matter_deadlines')
          .select('id, title, deadline_date, priority, deadline_type, status, matter_id, matters(reference)')
          .eq('organization_id', orgId)
          .gte('deadline_date', now)
          .lte('deadline_date', thirtyDaysFromNow)
          .neq('status', 'completed')
          .order('deadline_date', { ascending: true })
          .limit(10),

        // Expiring matters (next 90 days)
        supabase
          .from('matters')
          .select('id', { count: 'exact', head: true })
          .eq('organization_id', orgId)
          .gte('expiry_date', now)
          .lte('expiry_date', ninetyDaysFromNow),

        // AI usage this month - skip if table doesn't exist
        Promise.resolve({ data: [], error: null }),
      ]);

      // Calculate portfolio totals
      const portfolioData = portfoliosResult.data || [];
      const totalPortfolioValue = portfolioData.reduce((sum, p) => sum + (p.total_value || 0), 0);
      const totalCost = portfolioData.reduce((sum, p) => sum + (p.total_cost || 0), 0);
      const portfolioChange = totalCost > 0 
        ? ((totalPortfolioValue - totalCost) / totalCost) * 100 
        : 0;

      // Get portfolio breakdown by asset type
      const { data: assetsData } = await supabase
        .from('finance_portfolio_assets')
        .select('asset_type, current_value, portfolio:finance_portfolios!inner(organization_id)')
        .eq('portfolio.organization_id', orgId);

      const breakdown = {
        trademarks: 0,
        patents: 0,
        designs: 0,
        copyrights: 0,
        other: 0,
      };

      (assetsData || []).forEach(asset => {
        const value = asset.current_value || 0;
        switch (asset.asset_type) {
          case 'trademark': breakdown.trademarks += value; break;
          case 'patent': breakdown.patents += value; break;
          case 'design': breakdown.designs += value; break;
          case 'copyright': breakdown.copyrights += value; break;
          default: breakdown.other += value;
        }
      });

      // Calculate deal pipeline value (crm_deals uses 'amount' not 'value')
      const dealsPipeline = (dealsResult.data || []).reduce(
        (sum, d) => sum + ((d as any).amount || 0),
        0
      );

      // Calculate AI usage (from activity_log or fallback to 0)
      const aiCreditsUsed = 0;

      // Map activities (activity_log has different fields)
      const recentActivity: ActivityItem[] = (activitiesResult.data || []).map((a: any) => ({
        id: a.id,
        type: a.action || a.entity_type || 'activity',
        title: a.title || 'Actividad',
        description: a.description,
        module: a.matter_id ? 'docket' : a.deal_id ? 'crm' : a.client_id ? 'crm' : 'system',
        timestamp: a.created_at || new Date().toISOString(),
        link: a.matter_id 
          ? `/app/docket/${a.matter_id}` 
          : a.deal_id 
            ? `/app/crm/deals` 
            : undefined,
      }));

      // Map deadlines (matter_deadlines uses 'deadline_date' not 'event_date')
      const deadlines: DeadlineItem[] = ((deadlinesResult.data as any[]) || []).map((d: any) => ({
        id: d.id,
        title: d.title || 'Plazo',
        dueDate: d.deadline_date,
        priority: (d.priority || 'medium') as 'critical' | 'high' | 'medium' | 'low',
        type: d.deadline_type || 'deadline',
        matterId: d.matter_id || undefined,
        matterRef: d.matters?.reference || undefined,
      }));

      return {
        totalMatters: mattersResult.count || 0,
        activeWatchlists: watchlistsResult.count || 0,
        pendingDeals: dealsResult.count || 0,
        marketListings: 0,
        
        portfolioValue: totalPortfolioValue,
        portfolioChange: Math.round(portfolioChange * 100) / 100,
        portfolioCurrency: 'EUR',
        portfolioBreakdown: breakdown,
        
        criticalAlerts: criticalAlertsResult.count || 0,
        highAlerts: highAlertsResult.count || 0,
        upcomingDeadlines: deadlinesResult.data?.length || 0,
        expiringMatters: expiringResult.count || 0,
        
        recentActivity,
        deadlines,
        
        marketNotifications: 0,
        pendingOffers: 0,
        
        aiCreditsUsed,
        aiCreditsTotal: 500,
        
        totalContacts: contactsResult.count || 0,
        openDeals: dealsResult.count || 0,
        dealsPipeline,
      };
    },
    enabled: !!currentOrganization?.id && !!user?.id,
    refetchInterval: 60000,
    staleTime: 30000,
  });
}
