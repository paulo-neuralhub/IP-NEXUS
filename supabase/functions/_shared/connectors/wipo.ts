// WIPO Global Brand Database Connector
import { SpiderConnector, SearchParams, SearchResult, ConnectorHealth } from './types.ts';

export class WIPOConnector implements SpiderConnector {
  readonly code = 'wipo';
  readonly name = 'WIPO Global Brand Database';
  readonly jurisdictions = ['INT', 'WO'];
  
  private baseUrl = 'https://branddb.wipo.int';
  private rateLimitPerMinute = 30;
  private lastRequestTime = 0;

  async checkHealth(): Promise<ConnectorHealth> {
    try {
      const start = Date.now();
      const response = await fetch(`${this.baseUrl}/branddb/en/`, { method: 'HEAD' });
      
      return {
        status: response.ok ? 'healthy' : 'degraded',
        latencyMs: Date.now() - start,
        lastCheck: new Date().toISOString(),
        message: response.ok ? 'WIPO Global Brand Database operational' : 'Service issues'
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        latencyMs: 0,
        lastCheck: new Date().toISOString(),
        message: error instanceof Error ? error.message : 'Health check failed'
      };
    }
  }

  async search(params: SearchParams): Promise<SearchResult[]> {
    await this.respectRateLimit();
    
    const results: SearchResult[] = [];
    const searchTerm = params.query || params.term;
    
    try {
      console.log(`[WIPO] Searching Global Brand Database for: ${searchTerm}`);
      
      const searchResults = await this.searchGlobalBrandDB(params);
      
      for (const item of searchResults) {
        results.push({
          source: this.code,
          connectorCode: this.code,
          externalId: item.id,
          applicationNumber: item.applicationNumber || item.id,
          registrationNumber: item.registrationNumber,
          trademark: item.markName || '',
          markName: item.markName,
          owner: item.holderName,
          applicant: item.holderName,
          filingDate: item.applicationDate,
          applicationDate: item.applicationDate,
          registrationDate: item.registrationDate,
          expiryDate: item.expiryDate,
          niceClasses: item.niceClasses || [],
          status: this.mapStatus(item.status),
          jurisdiction: item.designatedCountries?.[0] || 'INT',
          designatedCountries: item.designatedCountries,
          sourceUrl: `${this.baseUrl}/branddb/en/#brandId=${item.id}`,
          imageUrl: item.imageUrl,
          description: item.goodsAndServices,
          goodsServices: item.goodsAndServices,
          rawData: item
        });
      }
      
      return results;
    } catch (error) {
      console.error('[WIPO] Search error:', error);
      throw error;
    }
  }

  private async searchGlobalBrandDB(params: SearchParams): Promise<any[]> {
    const searchTerm = params.query || params.term;
    
    const searchParams = new URLSearchParams({
      brandName: searchTerm,
      rows: '100',
      sort: 'applicationDate desc'
    });
    
    if (params.niceClasses?.length) {
      searchParams.set('niceClass', params.niceClasses.join(','));
    }
    
    const jurisdictions = params.jurisdictions || params.jurisdiction;
    if (jurisdictions?.length && !jurisdictions.includes('INT')) {
      searchParams.set('designation', jurisdictions[0]);
    }

    // In production: Execute actual API call
    return [];
  }

  async searchPhonetic(term: string, options?: Partial<SearchParams>): Promise<SearchResult[]> {
    return this.search({
      term,
      query: term,
      searchType: 'phonetic',
      ...options
    });
  }

  async searchByViennaCodes(_codes: string[], _options?: Partial<SearchParams>): Promise<SearchResult[]> {
    await this.respectRateLimit();
    return [];
  }

  async getMadridDesignations(_registrationNumber: string): Promise<string[]> {
    await this.respectRateLimit();
    return [];
  }

  private mapStatus(wipoStatus: string): string {
    const statusMap: Record<string, string> = {
      'REGISTERED': 'registered',
      'PENDING': 'pending',
      'REFUSED': 'refused',
      'WITHDRAWN': 'withdrawn',
      'EXPIRED': 'expired',
      'CANCELLED': 'cancelled',
      'PROTECTED': 'protected',
      'PROVISIONALLY_REFUSED': 'opposed'
    };
    
    return statusMap[wipoStatus?.toUpperCase()] || 'unknown';
  }

  private async respectRateLimit(): Promise<void> {
    const minInterval = 60000 / this.rateLimitPerMinute;
    const elapsed = Date.now() - this.lastRequestTime;
    
    if (elapsed < minInterval) {
      await new Promise(resolve => setTimeout(resolve, minInterval - elapsed));
    }
    
    this.lastRequestTime = Date.now();
  }
}
