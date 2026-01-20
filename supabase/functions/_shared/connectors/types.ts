// =====================================================
// SPIDER CONNECTOR TYPES
// =====================================================

export interface ConnectorConfig {
  code: string;
  name: string;
  baseUrl: string;
  rateLimit: {
    requests: number;
    windowMs: number;
  };
  timeout: number;
  retries: number;
  tier: 'basic' | 'pro' | 'enterprise';
}

export interface SearchParams {
  term: string;
  niceClasses?: number[];
  jurisdiction?: string[];
  dateFrom?: string;
  dateTo?: string;
  status?: string[];
  owner?: string;
  limit?: number;
  offset?: number;
}

export interface SearchResult {
  source: string;
  applicationNumber: string;
  registrationNumber?: string;
  trademark: string;
  status: string;
  owner?: string;
  filingDate?: string;
  registrationDate?: string;
  expiryDate?: string;
  niceClasses: number[];
  jurisdiction: string;
  imageUrl?: string;
  description?: string;
  rawData?: Record<string, unknown>;
}

export interface ConnectorResponse {
  success: boolean;
  results: SearchResult[];
  total: number;
  hasMore: boolean;
  executionTimeMs: number;
  error?: string;
  fromCache?: boolean;
}

export interface IConnector {
  config: ConnectorConfig;
  search(params: SearchParams): Promise<ConnectorResponse>;
  healthCheck(): Promise<boolean>;
}

export interface MultiSearchResult {
  results: SearchResult[];
  sources: Array<{
    code: string;
    success: boolean;
    count: number;
    executionTimeMs: number;
    error?: string;
  }>;
  totalResults: number;
  executionTimeMs: number;
}
