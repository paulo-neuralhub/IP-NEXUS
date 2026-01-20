// =====================================================
// SPIDER CONNECTOR TYPES
// =====================================================

export interface ConnectorHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  latencyMs: number;
  lastCheck: string;
  message?: string;
  details?: Record<string, unknown>;
}

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
  query?: string; // Alias for term
  searchType?: 'exact' | 'phonetic' | 'fuzzy' | 'contains';
  niceClasses?: number[];
  jurisdiction?: string[];
  jurisdictions?: string[]; // Alias
  dateFrom?: string;
  dateTo?: string;
  status?: string[];
  owner?: string;
  applicant?: string; // Alias for owner
  limit?: number;
  offset?: number;
}

export interface SearchResult {
  source: string;
  connectorCode?: string; // Alias for source
  externalId?: string;
  applicationNumber: string;
  registrationNumber?: string;
  trademark: string;
  markName?: string; // Alias for trademark
  status: string;
  owner?: string;
  applicant?: string; // Alias for owner
  filingDate?: string;
  applicationDate?: string; // Alias for filingDate
  registrationDate?: string;
  publicationDate?: string;
  expiryDate?: string;
  niceClasses: number[];
  jurisdiction: string;
  designatedCountries?: string[];
  imageUrl?: string;
  sourceUrl?: string;
  description?: string;
  goodsServices?: string; // Alias for description
  similarityScore?: number;
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

// New SpiderConnector interface for simplified connectors
export interface SpiderConnector {
  readonly code: string;
  readonly name: string;
  readonly jurisdictions: string[];
  
  checkHealth(): Promise<ConnectorHealth>;
  search(params: SearchParams): Promise<SearchResult[]>;
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

// Rate limit configuration
export interface RateLimitConfig {
  requestsPerMinute: number;
  requestsPerHour?: number;
  requestsPerDay?: number;
  burstLimit?: number;
}

// Job execution context
export interface JobContext {
  jobId: string;
  organizationId: string;
  watchlistId: string;
  startedAt: string;
  connectors: string[];
  searchTerms: string[];
  niceClasses?: number[];
  jurisdictions?: string[];
}

// Job result
export interface JobResult {
  jobId: string;
  status: 'completed' | 'partial' | 'failed';
  resultsFound: number;
  resultsNew: number;
  alertsCreated: number;
  connectorResults: Record<string, {
    success: boolean;
    count: number;
    error?: string;
    duration: number;
  }>;
  duration: number;
  completedAt: string;
}
