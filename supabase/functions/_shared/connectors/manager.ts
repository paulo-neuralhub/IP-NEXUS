// Connector Manager - Orchestrates all Spider connectors
import { SpiderConnector, SearchParams, SearchResult, ConnectorHealth } from './types.ts';
import { BOPIConnector } from './bopi.ts';
import { USPTOConnector } from './uspto.ts';
import { WIPOConnector } from './wipo.ts';

export interface ConnectorStatus {
  code: string;
  name: string;
  health: ConnectorHealth;
  jurisdictions: string[];
  enabled: boolean;
}

export interface AggregatedSearchResult {
  results: SearchResult[];
  connectorStatuses: Record<string, { success: boolean; count: number; error?: string }>;
  totalFound: number;
  searchDuration: number;
}

export class ConnectorManager {
  private connectors: Map<string, SpiderConnector> = new Map();
  private healthCache: Map<string, { health: ConnectorHealth; timestamp: number }> = new Map();
  private healthCacheTTL = 5 * 60 * 1000; // 5 minutes

  constructor() {
    // Register SpiderConnector implementations
    this.registerConnector(new BOPIConnector());
    this.registerConnector(new USPTOConnector());
    this.registerConnector(new WIPOConnector());
  }

  registerConnector(connector: SpiderConnector): void {
    this.connectors.set(connector.code, connector);
    console.log(`[ConnectorManager] Registered: ${connector.name}`);
  }

  getConnector(code: string): SpiderConnector | undefined {
    return this.connectors.get(code);
  }

  getAllConnectors(): SpiderConnector[] {
    return Array.from(this.connectors.values());
  }

  getConnectorsByJurisdiction(jurisdiction: string): SpiderConnector[] {
    return this.getAllConnectors().filter(c => 
      c.jurisdictions.includes(jurisdiction) || 
      c.jurisdictions.includes('INT') ||
      (c.jurisdictions.includes('EU') && this.isEUCountry(jurisdiction))
    );
  }

  private isEUCountry(code: string): boolean {
    const euCountries = [
      'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
      'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
      'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'
    ];
    return euCountries.includes(code);
  }

  async checkHealth(connectorCodes?: string[]): Promise<Record<string, ConnectorHealth>> {
    const codes = connectorCodes || Array.from(this.connectors.keys());
    const results: Record<string, ConnectorHealth> = {};

    await Promise.all(
      codes.map(async (code) => {
        const connector = this.connectors.get(code);
        if (!connector) return;

        const cached = this.healthCache.get(code);
        if (cached && Date.now() - cached.timestamp < this.healthCacheTTL) {
          results[code] = cached.health;
          return;
        }

        try {
          const health = await connector.checkHealth();
          results[code] = health;
          this.healthCache.set(code, { health, timestamp: Date.now() });
        } catch (error) {
          results[code] = {
            status: 'unhealthy',
            latencyMs: 0,
            lastCheck: new Date().toISOString(),
            message: error instanceof Error ? error.message : 'Health check failed'
          };
        }
      })
    );

    return results;
  }

  async searchMultiple(
    connectorCodes: string[],
    params: SearchParams
  ): Promise<AggregatedSearchResult> {
    const startTime = Date.now();
    const allResults: SearchResult[] = [];
    const connectorStatuses: Record<string, { success: boolean; count: number; error?: string }> = {};

    await Promise.all(
      connectorCodes.map(async (code) => {
        const connector = this.connectors.get(code);
        if (!connector) {
          connectorStatuses[code] = { success: false, count: 0, error: 'Connector not found' };
          return;
        }

        try {
          const results = await connector.search(params);
          allResults.push(...results);
          connectorStatuses[code] = { success: true, count: results.length };
        } catch (error) {
          console.error(`[ConnectorManager] ${code} search failed:`, error);
          connectorStatuses[code] = { 
            success: false, 
            count: 0, 
            error: error instanceof Error ? error.message : 'Search failed' 
          };
        }
      })
    );

    return {
      results: allResults,
      connectorStatuses,
      totalFound: allResults.length,
      searchDuration: Date.now() - startTime
    };
  }

  async searchByJurisdiction(
    jurisdictions: string[],
    params: SearchParams
  ): Promise<AggregatedSearchResult> {
    const connectorCodes = new Set<string>();
    
    for (const jurisdiction of jurisdictions) {
      const connectors = this.getConnectorsByJurisdiction(jurisdiction);
      connectors.forEach(c => connectorCodes.add(c.code));
    }

    return this.searchMultiple(Array.from(connectorCodes), params);
  }

  async getStatus(): Promise<ConnectorStatus[]> {
    const health = await this.checkHealth();
    
    return this.getAllConnectors().map(connector => ({
      code: connector.code,
      name: connector.name,
      health: health[connector.code],
      jurisdictions: connector.jurisdictions,
      enabled: health[connector.code]?.status !== 'unhealthy'
    }));
  }
}

let managerInstance: ConnectorManager | null = null;

export function getConnectorManager(): ConnectorManager {
  if (!managerInstance) {
    managerInstance = new ConnectorManager();
  }
  return managerInstance;
}
