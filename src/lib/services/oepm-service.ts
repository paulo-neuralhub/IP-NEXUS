// =====================================================
// OEPM (Oficina Española de Patentes y Marcas) Service
// =====================================================

import { supabase } from '@/integrations/supabase/client';

interface OEPMSearchParams {
  query?: string;
  trademark_name?: string;
  applicant_name?: string;
  nice_classes?: number[];
  status?: string;
  filing_date_from?: string;
  filing_date_to?: string;
  mark_type?: 'word' | 'figurative' | 'combined' | 'sound' | '3d';
  page?: number;
  page_size?: number;
}

export interface OEPMTrademark {
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
  status_es: string;
  image_url?: string;
  source_url?: string;
}

export interface OEPMSearchResult {
  trademarks: OEPMTrademark[];
  total_count: number;
  page: number;
  page_size: number;
}

export interface OEPMPatent {
  application_number: string;
  publication_number?: string;
  grant_number?: string;
  title: string;
  abstract?: string;
  applicant_name: string;
  inventor_names?: string[];
  filing_date: string;
  publication_date?: string;
  grant_date?: string;
  ipc_codes?: string[];
  status: string;
}

class OEPMService {
  private baseUrl = 'https://consultas2.oepm.es';
  
  /**
   * Buscar marcas en OEPM
   * Nota: OEPM requiere certificado digital para acceso API completo
   * Este servicio usa la Edge Function que puede usar mock o web scraping
   */
  async searchTrademarks(params: OEPMSearchParams): Promise<OEPMSearchResult> {
    const { data, error } = await supabase.functions.invoke('oepm-search', {
      body: { ...params, search_type: 'trademark' },
    });
    
    if (error) throw error;
    return data;
  }
  
  /**
   * Buscar patentes en OEPM
   */
  async searchPatents(params: OEPMSearchParams): Promise<{ patents: OEPMPatent[]; total_count: number }> {
    const { data, error } = await supabase.functions.invoke('oepm-search', {
      body: { ...params, search_type: 'patent' },
    });
    
    if (error) throw error;
    return data;
  }
  
  /**
   * Obtener detalles de una marca por número de solicitud
   */
  async getTrademarkDetails(applicationNumber: string): Promise<OEPMTrademark | null> {
    const { data, error } = await supabase.functions.invoke('oepm-details', {
      body: { application_number: applicationNumber, type: 'trademark' },
    });
    
    if (error) throw error;
    return data;
  }
  
  /**
   * Obtener estado actual de un expediente
   */
  async getApplicationStatus(applicationNumber: string, type: 'trademark' | 'patent' = 'trademark'): Promise<{
    status: string;
    status_es: string;
    status_date?: string;
    next_action?: string;
    pending_fees?: boolean;
  } | null> {
    const { data, error } = await supabase.functions.invoke('oepm-status', {
      body: { application_number: applicationNumber, type },
    });
    
    if (error) throw error;
    return data;
  }
  
  /**
   * Obtener documentos asociados a un expediente
   */
  async getDocuments(applicationNumber: string, type: 'trademark' | 'patent' = 'trademark'): Promise<Array<{
    id: string;
    title: string;
    date: string;
    type: string;
    downloadable: boolean;
    url?: string;
  }>> {
    const { data, error } = await supabase.functions.invoke('oepm-documents', {
      body: { application_number: applicationNumber, type },
    });
    
    if (error) throw error;
    return data?.documents || [];
  }
  
  /**
   * Calcular tasas oficiales para una solicitud
   */
  async calculateFees(params: {
    type: 'trademark' | 'patent' | 'design';
    nice_classes?: number[];
    claims?: number;
    pages?: number;
    fast_track?: boolean;
  }): Promise<{
    base_fee: number;
    additional_fees: Array<{ concept: string; amount: number }>;
    total: number;
    currency: string;
    valid_until?: string;
  }> {
    const { data, error } = await supabase.functions.invoke('oepm-fees', {
      body: params,
    });
    
    if (error) throw error;
    return data;
  }
  
  /**
   * Verificar si hay conflictos con marcas similares
   */
  async checkConflicts(markName: string, niceClasses: number[]): Promise<{
    potential_conflicts: OEPMTrademark[];
    risk_level: 'low' | 'medium' | 'high';
    recommendation?: string;
  }> {
    const results = await this.searchTrademarks({
      trademark_name: markName,
      nice_classes: niceClasses,
      page_size: 50,
    });
    
    // Calcular nivel de riesgo basado en resultados
    const exactMatches = results.trademarks.filter(
      tm => tm.mark_name.toLowerCase() === markName.toLowerCase()
    );
    const similarMatches = results.trademarks.filter(
      tm => tm.mark_name.toLowerCase().includes(markName.toLowerCase()) ||
            markName.toLowerCase().includes(tm.mark_name.toLowerCase())
    );
    
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (exactMatches.length > 0) {
      riskLevel = 'high';
    } else if (similarMatches.length > 3) {
      riskLevel = 'medium';
    }
    
    return {
      potential_conflicts: [...exactMatches, ...similarMatches.slice(0, 10)],
      risk_level: riskLevel,
      recommendation: riskLevel === 'high' 
        ? 'Se recomienda consultar con un agente de PI antes de proceder'
        : riskLevel === 'medium'
        ? 'Existen marcas similares, revisar alcance de protección'
        : 'No se han encontrado conflictos significativos',
    };
  }
  
  /**
   * URL directa al buscador de OEPM
   */
  getSearchUrl(applicationNumber: string): string {
    return `${this.baseUrl}/LocalizadorWeb/BusquedaMarcas?numExp=${applicationNumber}`;
  }
}

export const oepmService = new OEPMService();
