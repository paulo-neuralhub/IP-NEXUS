import { supabase } from '@/integrations/supabase/client';

interface WIPOSearchParams {
  query?: string;
  mark_name?: string;
  holder_name?: string;
  designated_countries?: string[];
  nice_classes?: number[];
  page?: number;
}

interface WIPOMadridMark {
  int_reg_number: string;
  mark_name: string;
  holder_name: string;
  holder_country: string;
  origin_office: string;
  int_reg_date: string;
  expiry_date: string;
  designated_countries: string[];
  nice_classes: number[];
  status: string;
  image_url?: string;
}

interface WIPOSearchResult {
  marks: WIPOMadridMark[];
  total: number;
  page: number;
}

interface WIPOFeeCalculation {
  basic_fee: number;
  complementary_fee: number;
  supplementary_fees: number;
  individual_fees: Record<string, number>;
  total: number;
  currency: string;
}

class WIPOService {
  // Madrid System - Marcas internacionales
  async searchMadrid(params: WIPOSearchParams): Promise<WIPOSearchResult> {
    const { data, error } = await supabase.functions.invoke('wipo-madrid-search', {
      body: params,
    });
    
    if (error) throw error;
    return data;
  }
  
  async getMadridDetails(intRegNumber: string): Promise<WIPOMadridMark | null> {
    const { data, error } = await supabase.functions.invoke('wipo-madrid-details', {
      body: { int_reg_number: intRegNumber },
    });
    
    if (error) throw error;
    return data;
  }
  
  // Global Brand Database
  async searchGlobalBrand(params: WIPOSearchParams): Promise<WIPOSearchResult> {
    const { data, error } = await supabase.functions.invoke('wipo-gbd-search', {
      body: params,
    });
    
    if (error) throw error;
    return data;
  }
  
  // Calcular tasas Madrid
  async calculateMadridFees(params: {
    origin_office: string;
    designated_countries: string[];
    nice_classes: number[];
    is_color: boolean;
  }): Promise<WIPOFeeCalculation> {
    const { data, error } = await supabase.functions.invoke('wipo-calculate-fees', {
      body: params,
    });
    
    if (error) throw error;
    return data;
  }
}

export const wipoService = new WIPOService();
export type { WIPOSearchParams, WIPOMadridMark, WIPOSearchResult, WIPOFeeCalculation };
