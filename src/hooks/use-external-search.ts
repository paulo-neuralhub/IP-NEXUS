import { useQuery, useMutation } from '@tanstack/react-query';
import { euipoService, type EUIPOSearchResult } from '@/lib/services/euipo-service';
import { tmviewService, type TMViewSearchResult } from '@/lib/services/tmview-service';
import { wipoService, type WIPOSearchResult } from '@/lib/services/wipo-service';
import { oepmService, type OEPMSearchResult, type OEPMTrademark } from '@/lib/services/oepm-service';

// ===== EUIPO =====
export function useEUIPOSearch(params: {
  query?: string;
  nice_classes?: number[];
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: ['euipo-search', params.query, params.nice_classes],
    queryFn: () => euipoService.search({
      trademark_name: params.query,
      nice_classes: params.nice_classes,
    }),
    enabled: params.enabled !== false && !!params.query,
  });
}

export function useEUIPODetails(applicationNumber: string) {
  return useQuery({
    queryKey: ['euipo-details', applicationNumber],
    queryFn: () => euipoService.getTrademarkDetails(applicationNumber),
    enabled: !!applicationNumber,
  });
}

export function useEUIPOSimilar(markName: string, niceClasses: number[]) {
  return useQuery({
    queryKey: ['euipo-similar', markName, niceClasses],
    queryFn: () => euipoService.getSimilarMarks(markName, niceClasses),
    enabled: !!markName,
  });
}

// ===== TMVIEW =====
export function useTMViewSearch(params: {
  query?: string;
  offices?: string[];
  nice_classes?: number[];
  phonetic?: boolean;
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: ['tmview-search', params],
    queryFn: () => tmviewService.search({
      trademark_name: params.query,
      phonetic_search: params.phonetic,
      offices: params.offices,
      nice_classes: params.nice_classes,
    }),
    enabled: params.enabled !== false && !!params.query,
  });
}

export function useTMViewSimilar(markName: string, options?: {
  nice_classes?: number[];
  offices?: string[];
}) {
  return useQuery({
    queryKey: ['tmview-similar', markName, options],
    queryFn: () => tmviewService.findSimilar(markName, options),
    enabled: !!markName,
  });
}

// ===== WIPO =====
export function useWIPOMadridSearch(params: {
  query?: string;
  designated_countries?: string[];
  nice_classes?: number[];
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: ['wipo-madrid-search', params],
    queryFn: () => wipoService.searchMadrid({
      mark_name: params.query,
      designated_countries: params.designated_countries,
      nice_classes: params.nice_classes,
    }),
    enabled: params.enabled !== false && !!params.query,
  });
}

export function useWIPOCalculateFees() {
  return useMutation({
    mutationFn: (params: {
      origin_office: string;
      designated_countries: string[];
      nice_classes: number[];
      is_color: boolean;
    }) => wipoService.calculateMadridFees(params),
  });
}

// ===== OEPM =====
export function useOEPMSearch(params: {
  query?: string;
  nice_classes?: number[];
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: ['oepm-search', params.query, params.nice_classes],
    queryFn: () => oepmService.searchTrademarks({
      trademark_name: params.query,
      nice_classes: params.nice_classes,
    }),
    enabled: params.enabled !== false && !!params.query,
  });
}

export function useOEPMDetails(applicationNumber: string) {
  return useQuery({
    queryKey: ['oepm-details', applicationNumber],
    queryFn: () => oepmService.getTrademarkDetails(applicationNumber),
    enabled: !!applicationNumber,
  });
}

export function useOEPMConflictCheck(markName: string, niceClasses: number[]) {
  return useQuery({
    queryKey: ['oepm-conflicts', markName, niceClasses],
    queryFn: () => oepmService.checkConflicts(markName, niceClasses),
    enabled: !!markName && niceClasses.length > 0,
  });
}

// ===== BÚSQUEDA UNIFICADA =====
export type TrademarkSource = 'euipo' | 'tmview' | 'wipo' | 'oepm';

export interface UnifiedTrademarkResult {
  source: TrademarkSource;
  mark_name: string;
  applicant_name?: string;
  applicant?: string;
  holder_name?: string;
  application_number?: string;
  tm_number?: string;
  int_reg_number?: string;
  nice_classes?: number[];
  status: string;
  filing_date?: string;
  int_reg_date?: string;
  expiry_date?: string;
  image_url?: string;
  similarity_score?: number;
}

export function useUnifiedTrademarkSearch(params: {
  query: string;
  sources?: TrademarkSource[];
  nice_classes?: number[];
  offices?: string[];
}) {
  const sources = params.sources || ['euipo', 'tmview'];
  
  const euipo = useEUIPOSearch({
    query: params.query,
    nice_classes: params.nice_classes,
    enabled: sources.includes('euipo'),
  });
  
  const tmview = useTMViewSearch({
    query: params.query,
    nice_classes: params.nice_classes,
    offices: params.offices,
    enabled: sources.includes('tmview'),
  });
  
  const wipo = useWIPOMadridSearch({
    query: params.query,
    nice_classes: params.nice_classes,
    enabled: sources.includes('wipo'),
  });
  
  const oepm = useOEPMSearch({
    query: params.query,
    nice_classes: params.nice_classes,
    enabled: sources.includes('oepm'),
  });
  
  const isLoading = euipo.isLoading || tmview.isLoading || wipo.isLoading || oepm.isLoading;
  const error = euipo.error || tmview.error || wipo.error || oepm.error;
  
  // Combinar y deduplicar resultados
  const results: UnifiedTrademarkResult[] = [
    ...(euipo.data?.trademarks?.map(t => ({ ...t, source: 'euipo' as const })) || []),
    ...(tmview.data?.trademarks?.map(t => ({ 
      ...t, 
      source: 'tmview' as const,
      applicant_name: t.applicant,
    })) || []),
    ...(wipo.data?.marks?.map(m => ({ 
      ...m, 
      source: 'wipo' as const,
      mark_name: m.mark_name,
      applicant_name: m.holder_name,
    })) || []),
    ...(oepm.data?.trademarks?.map(t => ({ 
      ...t, 
      source: 'oepm' as const,
    })) || []),
  ];
  
  return {
    results,
    isLoading,
    error,
    sources: {
      euipo: euipo.data as EUIPOSearchResult | undefined,
      tmview: tmview.data as TMViewSearchResult | undefined,
      wipo: wipo.data as WIPOSearchResult | undefined,
      oepm: oepm.data as OEPMSearchResult | undefined,
    },
  };
}
