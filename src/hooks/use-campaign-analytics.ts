import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useCampaignAnalytics(campaignId: string) {
  return useQuery({
    queryKey: ['campaign-analytics', campaignId],
    queryFn: async () => {
      // Get campaign
      const { data: campaign, error: campaignError } = await supabase
        .from('email_campaigns')
        .select('*')
        .eq('id', campaignId)
        .single();
      
      if (campaignError) throw campaignError;
      
      // Get sends with contact details
      const { data: sends } = await supabase
        .from('email_sends')
        .select('*, contact:contacts(name, email)')
        .eq('campaign_id', campaignId);
      
      // Get clicks grouped by URL
      const { data: clicks } = await supabase
        .from('email_clicks')
        .select('url, clicked_at, device_type')
        .eq('campaign_id', campaignId);
      
      // Calculate clicks by link
      const clicksByLinkMap = clicks?.reduce((acc, click) => {
        acc[click.url] = (acc[click.url] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};
      
      // Calculate clicks by device
      const clicksByDevice = clicks?.reduce((acc, click) => {
        const device = click.device_type || 'unknown';
        acc[device] = (acc[device] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};
      
      // Calculate opens by hour
      const opensByHour = sends
        ?.filter(s => s.first_opened_at)
        .reduce((acc, send) => {
          const hour = new Date(send.first_opened_at!).getHours();
          acc[hour] = (acc[hour] || 0) + 1;
          return acc;
        }, {} as Record<number, number>) || {};
      
      const totalSent = campaign?.total_sent || 0;
      const totalDelivered = campaign?.total_delivered || 0;
      const totalOpened = campaign?.total_opened || 0;
      const totalClicked = campaign?.total_clicked || 0;
      const totalBounced = campaign?.total_bounced || 0;
      const totalUnsubscribed = campaign?.total_unsubscribed || 0;
      const totalComplained = campaign?.total_complained || 0;
      
      return {
        campaign,
        sends: sends || [],
        clicksByLink: Object.entries(clicksByLinkMap)
          .map(([url, count]) => ({ url, clicks: count as number }))
          .sort((a, b) => b.clicks - a.clicks),
        clicksByDevice,
        opensByHour,
        metrics: {
          sent: totalSent,
          delivered: totalDelivered,
          opened: totalOpened,
          clicked: totalClicked,
          bounced: totalBounced,
          unsubscribed: totalUnsubscribed,
          complained: totalComplained,
          openRate: totalSent > 0 ? ((totalOpened / totalSent) * 100).toFixed(1) : '0',
          clickRate: totalSent > 0 ? ((totalClicked / totalSent) * 100).toFixed(1) : '0',
          deliveryRate: totalSent > 0 ? ((totalDelivered / totalSent) * 100).toFixed(1) : '0',
          bounceRate: totalSent > 0 ? ((totalBounced / totalSent) * 100).toFixed(1) : '0',
          unsubscribeRate: totalDelivered > 0 ? ((totalUnsubscribed / totalDelivered) * 100).toFixed(1) : '0',
        },
      };
    },
    enabled: !!campaignId,
  });
}

export function useCampaignSends(campaignId: string, status?: string) {
  return useQuery({
    queryKey: ['campaign-sends', campaignId, status],
    queryFn: async () => {
      let query = supabase
        .from('email_sends')
        .select('*, contact:contacts(id, name, email)')
        .eq('campaign_id', campaignId)
        .order('sent_at', { ascending: false });
      
      if (status) {
        if (status === 'opened') {
          query = query.gt('open_count', 0);
        } else if (status === 'clicked') {
          query = query.gt('click_count', 0);
        } else {
          query = query.eq('status', status);
        }
      }
      
      const { data, error } = await query.limit(100);
      if (error) throw error;
      return data || [];
    },
    enabled: !!campaignId,
  });
}
