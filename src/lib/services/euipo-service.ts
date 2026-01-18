import { supabase } from '@/integrations/supabase/client';

interface EUIPOSearchParams {
  query?: string;
  trademark_name?: string;
  applicant_name?: string;
  representative_name?: string;
  nice_classes?: number[];
  status?: string;
  filing_date_from?: string;
  filing_date_to?: string;
  page?: number;
  page_size?: number;
}

interface EUIPOTrademark {
  application_number: string;
  registration_number?: string;
  mark_name: string;
  mark_type: string;
  nice_classes: number[];
  applicant_name: string;
  applicant_country: string;
  representative_name?: string;
  filing_date: string;
  registration_date?: string;
  expiry_date?: string;
  status: string;
  image_url?: string;
}

interface EUIPOSearchResult {
  trademarks: EUIPOTrademark[];
  total_count: number;
  page: number;
  page_size: number;
}

class EUIPOService {
  private baseUrl = 'https://euipo.europa.eu/copla/api/v1';
  
  async search(params: EUIPOSearchParams): Promise<EUIPOSearchResult> {
    const { data, error } = await supabase.functions.invoke('euipo-search', {
      body: params,
    });
    
    if (error) throw error;
    return data;
  }
  
  async getTrademarkDetails(applicationNumber: string): Promise<EUIPOTrademark | null> {
    const { data, error } = await supabase.functions.invoke('euipo-details', {
      body: { application_number: applicationNumber },
    });
    
    if (error) throw error;
    return data;
  }
  
  async getSimilarMarks(markName: string, niceClasses: number[]): Promise<EUIPOTrademark[]> {
    const { data, error } = await supabase.functions.invoke('euipo-similar', {
      body: { mark_name: markName, nice_classes: niceClasses },
    });
    
    if (error) throw error;
    return data.trademarks || [];
  }
  
  async monitorMark(applicationNumber: string): Promise<{ subscribed: boolean }> {
    const { data, error } = await supabase.functions.invoke('euipo-monitor', {
      body: { application_number: applicationNumber, action: 'subscribe' },
    });
    
    if (error) throw error;
    return data;
  }
}

export const euipoService = new EUIPOService();
export type { EUIPOSearchParams, EUIPOTrademark, EUIPOSearchResult };
