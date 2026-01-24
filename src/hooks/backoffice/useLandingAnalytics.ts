// ============================================
// src/hooks/backoffice/useLandingAnalytics.ts
// Hooks for landing page analytics
// ============================================

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { subDays, format, startOfDay, endOfDay } from 'date-fns';

export interface LandingStats {
  totalVisits: number;
  totalLeads: number;
  conversionRate: number;
  demosScheduled: number;
  visitsTrend: number;
  leadsTrend: number;
  conversionTrend: number;
  demosTrend: number;
}

export interface VisitsByLanding {
  slug: string;
  name: string;
  visits: number;
  leads: number;
  conversionRate: number;
}

export interface DailyVisits {
  date: string;
  visits: number;
  leads: number;
}

export interface TrafficSource {
  source: string;
  visits: number;
  percentage: number;
}

export interface ChatbotStats {
  totalConversations: number;
  leadsCaptures: number;
  captureRate: number;
  demosScheduled: number;
  avgMessages: number;
}

export interface FunnelStep {
  name: string;
  count: number;
  percentage: number;
}

// Main analytics hook
export function useLandingAnalytics(days: number = 30) {
  const startDate = format(subDays(new Date(), days), 'yyyy-MM-dd');
  const prevStartDate = format(subDays(new Date(), days * 2), 'yyyy-MM-dd');
  const prevEndDate = format(subDays(new Date(), days), 'yyyy-MM-dd');

  return useQuery({
    queryKey: ['landing-analytics', days],
    queryFn: async () => {
      // Get current period visits
      const { data: currentVisits } = await supabase
        .from('landing_visits')
        .select('id, landing_id, opened_chatbot, converted, created_at')
        .gte('created_at', startDate);

      // Get previous period visits for trend
      const { data: prevVisits } = await supabase
        .from('landing_visits')
        .select('id')
        .gte('created_at', prevStartDate)
        .lt('created_at', prevEndDate);

      // Get current period leads
      const { data: currentLeads } = await supabase
        .from('chatbot_leads')
        .select('id, status, demo_scheduled_at, created_at')
        .gte('created_at', startDate);

      // Get previous period leads for trend
      const { data: prevLeads } = await supabase
        .from('chatbot_leads')
        .select('id')
        .gte('created_at', prevStartDate)
        .lt('created_at', prevEndDate);

      // Calculate stats
      const totalVisits = currentVisits?.length || 0;
      const totalLeads = currentLeads?.length || 0;
      const conversionRate = totalVisits > 0 ? (totalLeads / totalVisits) * 100 : 0;
      const demosScheduled = currentLeads?.filter(l => l.demo_scheduled_at).length || 0;

      // Calculate trends (percentage change)
      const prevTotalVisits = prevVisits?.length || 0;
      const prevTotalLeads = prevLeads?.length || 0;
      const prevConversionRate = prevTotalVisits > 0 ? (prevTotalLeads / prevTotalVisits) * 100 : 0;

      const visitsTrend = prevTotalVisits > 0 ? ((totalVisits - prevTotalVisits) / prevTotalVisits) * 100 : 0;
      const leadsTrend = prevTotalLeads > 0 ? ((totalLeads - prevTotalLeads) / prevTotalLeads) * 100 : 0;
      const conversionTrend = prevConversionRate > 0 ? conversionRate - prevConversionRate : 0;

      const stats: LandingStats = {
        totalVisits,
        totalLeads,
        conversionRate,
        demosScheduled,
        visitsTrend,
        leadsTrend,
        conversionTrend,
        demosTrend: 0, // Would need previous demos data
      };

      return stats;
    },
  });
}

// Visits by landing page
export function useVisitsByLanding(days: number = 30) {
  const startDate = format(subDays(new Date(), days), 'yyyy-MM-dd');

  return useQuery({
    queryKey: ['visits-by-landing', days],
    queryFn: async (): Promise<VisitsByLanding[]> => {
      // Get landing pages
      const { data: landings } = await supabase
        .from('landing_pages')
        .select('id, slug, name, total_visits, total_leads');

      // Get visits grouped by landing
      const { data: visits } = await supabase
        .from('landing_visits')
        .select('landing_id')
        .gte('created_at', startDate);

      // Get leads grouped by landing (via conversation)
      const { data: leads } = await supabase
        .from('chatbot_leads')
        .select('conversation:chatbot_conversations(landing_slug)')
        .gte('created_at', startDate);

      // Aggregate
      const visitsByLanding: Record<string, number> = {};
      visits?.forEach(v => {
        if (v.landing_id) {
          visitsByLanding[v.landing_id] = (visitsByLanding[v.landing_id] || 0) + 1;
        }
      });

      const leadsBySlug: Record<string, number> = {};
      leads?.forEach(l => {
        const slug = (l.conversation as { landing_slug?: string })?.landing_slug;
        if (slug) {
          leadsBySlug[slug] = (leadsBySlug[slug] || 0) + 1;
        }
      });

      return (landings || []).map(landing => ({
        slug: landing.slug,
        name: landing.name || `IP-${landing.slug.toUpperCase()}`,
        visits: visitsByLanding[landing.id] || landing.total_visits || 0,
        leads: leadsBySlug[landing.slug] || landing.total_leads || 0,
        conversionRate: 0, // Calculated below
      })).map(l => ({
        ...l,
        conversionRate: l.visits > 0 ? (l.leads / l.visits) * 100 : 0,
      })).sort((a, b) => b.visits - a.visits);
    },
  });
}

// Daily visits chart data
export function useDailyVisits(days: number = 30) {
  const startDate = format(subDays(new Date(), days), 'yyyy-MM-dd');

  return useQuery({
    queryKey: ['daily-visits', days],
    queryFn: async (): Promise<DailyVisits[]> => {
      const { data: visits } = await supabase
        .from('landing_visits')
        .select('created_at')
        .gte('created_at', startDate)
        .order('created_at', { ascending: true });

      const { data: leads } = await supabase
        .from('chatbot_leads')
        .select('created_at')
        .gte('created_at', startDate);

      // Group by date
      const visitsByDate: Record<string, number> = {};
      const leadsByDate: Record<string, number> = {};

      visits?.forEach(v => {
        const date = format(new Date(v.created_at), 'yyyy-MM-dd');
        visitsByDate[date] = (visitsByDate[date] || 0) + 1;
      });

      leads?.forEach(l => {
        const date = format(new Date(l.created_at), 'yyyy-MM-dd');
        leadsByDate[date] = (leadsByDate[date] || 0) + 1;
      });

      // Generate all dates in range
      const result: DailyVisits[] = [];
      for (let i = days; i >= 0; i--) {
        const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
        result.push({
          date,
          visits: visitsByDate[date] || 0,
          leads: leadsByDate[date] || 0,
        });
      }

      return result;
    },
  });
}

// Traffic sources
export function useTrafficSources(days: number = 30) {
  const startDate = format(subDays(new Date(), days), 'yyyy-MM-dd');

  return useQuery({
    queryKey: ['traffic-sources', days],
    queryFn: async (): Promise<TrafficSource[]> => {
      const { data } = await supabase
        .from('landing_visits')
        .select('utm_source, referrer_domain')
        .gte('created_at', startDate);

      const sourceCount: Record<string, number> = {};
      let total = 0;

      data?.forEach(v => {
        const source = v.utm_source || v.referrer_domain || 'direct';
        sourceCount[source] = (sourceCount[source] || 0) + 1;
        total++;
      });

      return Object.entries(sourceCount)
        .map(([source, visits]) => ({
          source,
          visits,
          percentage: total > 0 ? (visits / total) * 100 : 0,
        }))
        .sort((a, b) => b.visits - a.visits)
        .slice(0, 10);
    },
  });
}

// Chatbot performance
export function useChatbotPerformance(days: number = 30) {
  const startDate = format(subDays(new Date(), days), 'yyyy-MM-dd');

  return useQuery({
    queryKey: ['chatbot-performance', days],
    queryFn: async (): Promise<ChatbotStats> => {
      // Conversations
      const { data: conversations } = await supabase
        .from('chatbot_conversations')
        .select('id')
        .gte('started_at', startDate);

      // Leads
      const { data: leads } = await supabase
        .from('chatbot_leads')
        .select('id, demo_scheduled_at')
        .gte('created_at', startDate);

      // Messages (for avg)
      const { data: messages } = await supabase
        .from('chatbot_messages')
        .select('conversation_id')
        .gte('created_at', startDate);

      const totalConversations = conversations?.length || 0;
      const leadsCaptures = leads?.length || 0;
      const demosScheduled = leads?.filter(l => l.demo_scheduled_at).length || 0;

      // Calculate avg messages per conversation
      const msgByConv: Record<string, number> = {};
      messages?.forEach(m => {
        if (m.conversation_id) {
          msgByConv[m.conversation_id] = (msgByConv[m.conversation_id] || 0) + 1;
        }
      });
      const avgMessages = Object.keys(msgByConv).length > 0
        ? Object.values(msgByConv).reduce((a, b) => a + b, 0) / Object.keys(msgByConv).length
        : 0;

      return {
        totalConversations,
        leadsCaptures,
        captureRate: totalConversations > 0 ? (leadsCaptures / totalConversations) * 100 : 0,
        demosScheduled,
        avgMessages,
      };
    },
  });
}

// Conversion funnel
export function useConversionFunnel(days: number = 30) {
  const startDate = format(subDays(new Date(), days), 'yyyy-MM-dd');

  return useQuery({
    queryKey: ['conversion-funnel', days],
    queryFn: async (): Promise<FunnelStep[]> => {
      // Total visits
      const { count: visitsCount } = await supabase
        .from('landing_visits')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate);

      // Opened chatbot
      const { count: chatbotOpened } = await supabase
        .from('landing_visits')
        .select('*', { count: 'exact', head: true })
        .eq('opened_chatbot', true)
        .gte('created_at', startDate);

      // Conversations with messages
      const { count: conversationsCount } = await supabase
        .from('chatbot_conversations')
        .select('*', { count: 'exact', head: true })
        .gte('started_at', startDate);

      // Leads captured
      const { count: leadsCount } = await supabase
        .from('chatbot_leads')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate);

      // Demos scheduled
      const { count: demosCount } = await supabase
        .from('chatbot_leads')
        .select('*', { count: 'exact', head: true })
        .not('demo_scheduled_at', 'is', null)
        .gte('created_at', startDate);

      // Converted to client
      const { count: clientsCount } = await supabase
        .from('chatbot_leads')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'converted')
        .gte('created_at', startDate);

      const visits = visitsCount || 0;

      return [
        { name: 'Visitas', count: visits, percentage: 100 },
        { name: 'Abrió chat', count: chatbotOpened || 0, percentage: visits > 0 ? ((chatbotOpened || 0) / visits) * 100 : 0 },
        { name: 'Interactuó', count: conversationsCount || 0, percentage: visits > 0 ? ((conversationsCount || 0) / visits) * 100 : 0 },
        { name: 'Dio email', count: leadsCount || 0, percentage: visits > 0 ? ((leadsCount || 0) / visits) * 100 : 0 },
        { name: 'Agendó demo', count: demosCount || 0, percentage: visits > 0 ? ((demosCount || 0) / visits) * 100 : 0 },
        { name: 'Se hizo cliente', count: clientsCount || 0, percentage: visits > 0 ? ((clientsCount || 0) / visits) * 100 : 0 },
      ];
    },
  });
}

// Recent leads for dashboard
export function useRecentLeads(limit: number = 5) {
  return useQuery({
    queryKey: ['recent-leads', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chatbot_leads')
        .select(`
          id,
          email,
          name,
          company,
          lead_score,
          status,
          created_at,
          conversation:chatbot_conversations(landing_slug)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    },
  });
}
