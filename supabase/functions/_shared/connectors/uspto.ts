// USPTO (United States Patent and Trademark Office) Connector
import { SpiderConnector, SearchParams, SearchResult, ConnectorHealth } from './types.ts';

export class USPTOConnector implements SpiderConnector {
  readonly code = 'uspto';
  readonly name = 'USPTO TESS';
  readonly jurisdictions = ['US'];
  
  private baseUrl = 'https://tsdrapi.uspto.gov';
  private rateLimitPerMinute = 20;
  private lastRequestTime = 0;

  async checkHealth(): Promise<ConnectorHealth> {
    try {
      const start = Date.now();
      const response = await fetch(`${this.baseUrl}/ts/cd/status`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      
      const latency = Date.now() - start;
      
      return {
        status: response.ok ? 'healthy' : 'degraded',
        latencyMs: latency,
        lastCheck: new Date().toISOString(),
        message: response.ok ? 'USPTO TSDR API operational' : 'USPTO API issues detected'
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
      console.log(`[USPTO] Searching for: ${searchTerm}`);
      
      const tessResults = await this.searchTESS(params);
      
      for (const item of tessResults) {
        results.push({
          source: this.code,
          connectorCode: this.code,
          externalId: item.serialNumber,
          applicationNumber: item.serialNumber,
          registrationNumber: item.registrationNumber,
          trademark: item.markLiteralElements || item.markDescription || '',
          markName: item.markLiteralElements || item.markDescription,
          owner: item.ownerName,
          applicant: item.ownerName,
          filingDate: item.filingDate,
          applicationDate: item.filingDate,
          publicationDate: item.publicationDate,
          registrationDate: item.registrationDate,
          niceClasses: this.parseClasses(item.internationalClasses),
          status: this.mapStatus(item.markCurrentStatusExternalDescriptionText),
          jurisdiction: 'US',
          sourceUrl: `https://tsdr.uspto.gov/#caseNumber=${item.serialNumber}&caseSearchType=US_APPLICATION&caseType=DEFAULT`,
          imageUrl: item.markImageUrl,
          description: item.goodsAndServicesDescription,
          goodsServices: item.goodsAndServicesDescription,
          rawData: item
        });
      }
      
      return results;
    } catch (error) {
      console.error('[USPTO] Search error:', error);
      throw error;
    }
  }

  private async searchTESS(_params: SearchParams): Promise<any[]> {
    // In production: Use USPTO's TESS search API
    return [];
  }

  async getTrademarkDetails(serialNumber: string): Promise<any> {
    await this.respectRateLimit();
    
    try {
      const response = await fetch(
        `${this.baseUrl}/ts/cd/casestatus/${serialNumber}/info.json`,
        { headers: { 'Accept': 'application/json' } }
      );
      
      if (!response.ok) {
        throw new Error(`TSDR API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('[USPTO] TSDR fetch error:', error);
      throw error;
    }
  }

  private parseClasses(classString: string | string[]): number[] {
    if (Array.isArray(classString)) {
      return classString.map(c => parseInt(c)).filter(n => !isNaN(n));
    }
    if (!classString) return [];
    
    const matches = classString.match(/\d+/g);
    return matches ? matches.map(m => parseInt(m)) : [];
  }

  private mapStatus(usptoStatus: string): string {
    const statusMap: Record<string, string> = {
      'LIVE': 'active',
      'REGISTERED': 'registered',
      'PENDING': 'pending',
      'PUBLISHED FOR OPPOSITION': 'published',
      'ABANDONED': 'abandoned',
      'CANCELLED': 'cancelled',
      'EXPIRED': 'expired',
      'OPPOSED': 'opposed'
    };
    
    for (const [key, value] of Object.entries(statusMap)) {
      if (usptoStatus?.toUpperCase().includes(key)) {
        return value;
      }
    }
    
    return 'unknown';
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
