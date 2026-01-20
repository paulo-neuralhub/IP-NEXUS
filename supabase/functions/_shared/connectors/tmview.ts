import { IConnector, ConnectorConfig, SearchParams, ConnectorResponse, SearchResult } from './types.ts';

// =====================================================
// TMVIEW API CONNECTOR
// Búsqueda en la base de datos TMView de EUIPO
// =====================================================

export class TMViewConnector implements IConnector {
  config: ConnectorConfig = {
    code: 'tmview',
    name: 'TMView (EUIPO)',
    baseUrl: 'https://www.tmdn.org/tmview/api/search',
    rateLimit: { requests: 100, windowMs: 60000 },
    timeout: 30000,
    retries: 3,
    tier: 'basic'
  };

  async search(params: SearchParams): Promise<ConnectorResponse> {
    const startTime = Date.now();

    try {
      const query = this.buildQuery(params);
      
      const response = await fetch(`${this.config.baseUrl}/trademark`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(query),
        signal: AbortSignal.timeout(this.config.timeout)
      });

      if (!response.ok) {
        throw new Error(`TMView API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const results = this.parseResults(data);

      return {
        success: true,
        results,
        total: data.totalResults || results.length,
        hasMore: (data.totalResults || 0) > (params.offset || 0) + results.length,
        executionTimeMs: Date.now() - startTime
      };

    } catch (error) {
      console.error('TMView search error:', error);
      return {
        success: false,
        results: [],
        total: 0,
        hasMore: false,
        executionTimeMs: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private buildQuery(params: SearchParams): Record<string, unknown> {
    const query: Record<string, unknown> = {
      basicSearch: params.term,
      pageNumber: Math.floor((params.offset || 0) / (params.limit || 50)) + 1,
      pageSize: params.limit || 50,
      sortByField: 'applicationDate',
      sortOrder: 'desc'
    };

    if (params.niceClasses?.length) {
      query.niceClasses = params.niceClasses;
    }

    if (params.jurisdiction?.length) {
      query.territories = params.jurisdiction.map(j => this.mapJurisdiction(j));
    }

    if (params.dateFrom) {
      query.applicationDateFrom = params.dateFrom;
    }

    if (params.dateTo) {
      query.applicationDateTo = params.dateTo;
    }

    if (params.status?.length) {
      query.tmStatus = params.status.map(s => this.mapStatus(s));
    }

    if (params.owner) {
      query.applicantName = params.owner;
    }

    return query;
  }

  private parseResults(data: Record<string, unknown>): SearchResult[] {
    const trademarks = (data.trademarks || []) as Array<Record<string, unknown>>;

    return trademarks.map(tm => ({
      source: 'tmview',
      applicationNumber: tm.applicationNumber as string || '',
      registrationNumber: tm.registrationNumber as string,
      trademark: tm.tmName as string || tm.wordElement as string || '',
      status: this.normalizeStatus(tm.tmStatus as string),
      owner: tm.applicantName as string,
      filingDate: tm.applicationDate as string,
      registrationDate: tm.registrationDate as string,
      expiryDate: tm.expiryDate as string,
      niceClasses: this.parseNiceClasses(tm.niceClasses),
      jurisdiction: tm.tmOffice as string || 'EU',
      imageUrl: tm.tmImage as string,
      description: tm.goodsAndServices as string,
      rawData: tm
    }));
  }

  private mapJurisdiction(jurisdiction: string): string {
    const mapping: Record<string, string> = {
      'EU': 'EM', 'EUIPO': 'EM', 'ES': 'ES', 'SPAIN': 'ES',
      'DE': 'DE', 'FR': 'FR', 'IT': 'IT', 'PT': 'PT', 'WIPO': 'WO'
    };
    return mapping[jurisdiction.toUpperCase()] || jurisdiction;
  }

  private mapStatus(status: string): string {
    const mapping: Record<string, string> = {
      'pending': 'Filed', 'registered': 'Registered',
      'published': 'Published', 'opposed': 'Opposed',
      'expired': 'Expired', 'withdrawn': 'Withdrawn'
    };
    return mapping[status.toLowerCase()] || status;
  }

  private normalizeStatus(status: string): string {
    const statusLower = (status || '').toLowerCase();
    if (statusLower.includes('register')) return 'registered';
    if (statusLower.includes('filed') || statusLower.includes('pending')) return 'pending';
    if (statusLower.includes('publish')) return 'published';
    if (statusLower.includes('oppos')) return 'opposed';
    if (statusLower.includes('expir')) return 'expired';
    if (statusLower.includes('withdraw')) return 'withdrawn';
    return status.toLowerCase();
  }

  private parseNiceClasses(classes: unknown): number[] {
    if (!classes) return [];
    if (Array.isArray(classes)) {
      return classes.map(c => parseInt(String(c), 10)).filter(n => !isNaN(n));
    }
    if (typeof classes === 'string') {
      return classes.split(',').map(c => parseInt(c.trim(), 10)).filter(n => !isNaN(n));
    }
    return [];
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(this.config.baseUrl, {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000)
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}
