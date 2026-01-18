import { supabase } from '@/integrations/supabase/client';

interface TMViewSearchParams {
  query?: string;
  trademark_name?: string;
  phonetic_search?: boolean;
  applicant_name?: string;
  nice_classes?: number[];
  offices?: string[];  // 'EM', 'ES', 'US', 'CN', etc.
  status?: 'all' | 'registered' | 'pending' | 'expired';
  page?: number;
  page_size?: number;
}

interface TMViewTrademark {
  tm_number: string;
  office: string;
  mark_name: string;
  mark_type: string;
  nice_classes: number[];
  applicant: string;
  status: string;
  filing_date: string;
  registration_date?: string;
  expiry_date?: string;
  image_url?: string;
  similarity_score?: number;
}

interface TMViewSearchResult {
  trademarks: TMViewTrademark[];
  total_count: number;
  page: number;
}

class TMViewService {
  async search(params: TMViewSearchParams): Promise<TMViewSearchResult> {
    const { data, error } = await supabase.functions.invoke('tmview-search', {
      body: params,
    });
    
    if (error) throw error;
    return data;
  }
  
  async getDetails(tmNumber: string, office: string): Promise<TMViewTrademark | null> {
    const { data, error } = await supabase.functions.invoke('tmview-details', {
      body: { tm_number: tmNumber, office },
    });
    
    if (error) throw error;
    return data;
  }
  
  async findSimilar(markName: string, options?: {
    nice_classes?: number[];
    offices?: string[];
    phonetic?: boolean;
  }): Promise<TMViewTrademark[]> {
    const { data, error } = await supabase.functions.invoke('tmview-similar', {
      body: {
        mark_name: markName,
        ...options,
      },
    });
    
    if (error) throw error;
    return data.trademarks || [];
  }
  
  // Búsqueda fonética
  async phoneticSearch(markName: string, offices?: string[]): Promise<TMViewTrademark[]> {
    return this.search({
      trademark_name: markName,
      phonetic_search: true,
      offices,
      page_size: 50,
    }).then(r => r.trademarks);
  }
}

export const tmviewService = new TMViewService();
export type { TMViewSearchParams, TMViewTrademark, TMViewSearchResult };
