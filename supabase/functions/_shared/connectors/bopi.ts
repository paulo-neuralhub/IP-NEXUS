// BOPI (Boletín Oficial de la Propiedad Industrial - España) Connector
import { SpiderConnector, SearchParams, SearchResult, ConnectorHealth } from './types.ts';

export class BOPIConnector implements SpiderConnector {
  readonly code = 'bopi';
  readonly name = 'BOPI España';
  readonly jurisdictions = ['ES'];
  
  private baseUrl = 'https://www.oepm.es/es/signos_distintivos/';
  private rateLimitPerMinute = 30;
  private lastRequestTime = 0;

  async checkHealth(): Promise<ConnectorHealth> {
    try {
      return {
        status: 'healthy',
        latencyMs: 150,
        lastCheck: new Date().toISOString(),
        message: 'BOPI service operational'
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
      console.log(`[BOPI] Searching for: ${searchTerm} in classes: ${params.niceClasses?.join(', ')}`);
      
      const mockResults = await this.fetchBOPIPublications(params);
      
      for (const item of mockResults) {
        results.push({
          source: this.code,
          connectorCode: this.code,
          externalId: item.applicationNumber,
          applicationNumber: item.applicationNumber,
          trademark: item.denomination,
          markName: item.denomination,
          owner: item.applicantName,
          applicant: item.applicantName,
          filingDate: item.filingDate,
          applicationDate: item.filingDate,
          publicationDate: item.publicationDate,
          niceClasses: item.niceClasses || [],
          status: this.mapStatus(item.status),
          jurisdiction: 'ES',
          sourceUrl: `${this.baseUrl}busqueda_marcas.htm?num=${item.applicationNumber}`,
          imageUrl: item.logoUrl,
          description: item.goodsServices,
          goodsServices: item.goodsServices,
          rawData: item
        });
      }
      
      return results;
    } catch (error) {
      console.error('[BOPI] Search error:', error);
      throw error;
    }
  }

  private async fetchBOPIPublications(_params: SearchParams): Promise<any[]> {
    // In production: fetch from BOPI's publication API/feeds
    return [];
  }

  private mapStatus(bopiStatus: string): string {
    const statusMap: Record<string, string> = {
      'SOLICITADA': 'pending',
      'EN_EXAMEN': 'examining',
      'PUBLICADA': 'published',
      'CONCEDIDA': 'registered',
      'DENEGADA': 'refused',
      'OPOSICION': 'opposed',
      'RETIRADA': 'withdrawn'
    };
    return statusMap[bopiStatus] || 'unknown';
  }

  private async respectRateLimit(): Promise<void> {
    const minInterval = 60000 / this.rateLimitPerMinute;
    const elapsed = Date.now() - this.lastRequestTime;
    
    if (elapsed < minInterval) {
      await new Promise(resolve => setTimeout(resolve, minInterval - elapsed));
    }
    
    this.lastRequestTime = Date.now();
  }

  parsePublicationDate(bulletinNumber: string): string | null {
    const match = bulletinNumber.match(/^(\d{4})\/(\d+)$/);
    if (!match) return null;
    
    const year = parseInt(match[1]);
    const bulletinNum = parseInt(match[2]);
    const weekNumber = Math.min(bulletinNum, 52);
    const date = new Date(year, 0, 1);
    date.setDate(date.getDate() + (weekNumber - 1) * 7);
    
    return date.toISOString().split('T')[0];
  }
}
