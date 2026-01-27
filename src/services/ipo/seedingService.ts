// src/services/ipo/seedingService.ts
import { supabase } from '@/integrations/supabase/client';
import { ALL_IPO_SEED_DATA } from '@/data/ipo-seed-data';

interface SeedingProgress {
  phase: string;
  current: number;
  total: number;
  message: string;
}

export class IPOSeedingService {
  private onProgress?: (progress: SeedingProgress) => void;

  constructor(onProgress?: (progress: SeedingProgress) => void) {
    this.onProgress = onProgress;
  }

  async runFullSeeding(): Promise<{ success: boolean; stats: { officesCreated: number; officesSkipped: number; errorsCount: number } }> {
    const stats = { officesCreated: 0, officesSkipped: 0, errorsCount: 0 };

    try {
      this.updateProgress('base_data', 0, ALL_IPO_SEED_DATA.length, 'Iniciando importación...');
      
      for (let i = 0; i < ALL_IPO_SEED_DATA.length; i++) {
        const office = ALL_IPO_SEED_DATA[i] as any;
        const result = await this.insertOffice(office);
        
        if (result.created) stats.officesCreated++;
        else if (result.skipped) stats.officesSkipped++;
        else stats.errorsCount++;

        this.updateProgress('base_data', i + 1, ALL_IPO_SEED_DATA.length, `Procesando ${office.code}...`);
      }

      return { success: true, stats };
    } catch (error) {
      console.error('Seeding error:', error);
      return { success: false, stats };
    }
  }

  private async insertOffice(data: any): Promise<{ created?: boolean; skipped?: boolean; error?: boolean }> {
    const { data: existing } = await (supabase
      .from('ipo_offices' as any)
      .select('id')
      .eq('code', data.code)
      .single() as any);

    if (existing) return { skipped: true };

    const { error } = await (supabase
      .from('ipo_offices' as any)
      .insert({
        code: data.code,
        code_alt: data.codeAlt,
        name_official: data.nameOfficial,
        name_short: data.nameShort,
        country_code: data.countryCode,
        country_name: data.countryName,
        flag_emoji: data.flagEmoji,
        region: data.region,
        office_type: data.officeType,
        ip_types: data.ipTypes,
        timezone: data.timezone,
        languages: data.languages,
        currency: data.currency,
        tier: data.tier,
        automation_level: data.automationLevel,
        automation_percentage: data.automationPercentage,
        website_official: data.websiteOfficial,
        website_search: data.websiteSearch,
        has_api: data.hasApi,
        api_type: data.apiType,
        e_filing_available: data.eFilingAvailable,
        online_payment: data.onlinePayment,
        capabilities: data.capabilities,
        status: 'active',
        priority_score: data.tier === 1 ? 90 : data.tier === 2 ? 60 : 30,
      }) as any);

    if (error) {
      console.error(`Error inserting ${data.code}:`, error);
      return { error: true };
    }

    return { created: true };
  }

  private updateProgress(phase: string, current: number, total: number, message: string) {
    if (this.onProgress) {
      this.onProgress({ phase, current, total, message });
    }
  }
}
