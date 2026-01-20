import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SpiderJob {
  id: string;
  watchlist_id: string;
  organization_id: string;
  status: string;
  priority: number;
  config: Record<string, unknown>;
  started_at?: string;
}

interface Watchlist {
  id: string;
  name: string;
  type: string;
  watch_terms: string[];
  watch_classes: number[];
  watch_jurisdictions: string[];
  similarity_threshold: number;
  filter_config: Record<string, unknown>;
}

// Similarity calculation functions
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[b.length][a.length];
}

function levenshteinSimilarity(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  return 1 - levenshteinDistance(a.toLowerCase(), b.toLowerCase()) / maxLen;
}

function soundex(str: string): string {
  const s = str.toUpperCase().replace(/[^A-Z]/g, '');
  if (!s) return '';
  
  const codes: Record<string, string> = {
    B: '1', F: '1', P: '1', V: '1',
    C: '2', G: '2', J: '2', K: '2', Q: '2', S: '2', X: '2', Z: '2',
    D: '3', T: '3',
    L: '4',
    M: '5', N: '5',
    R: '6',
  };
  
  let result = s[0];
  let lastCode = codes[s[0]] || '';
  
  for (let i = 1; i < s.length && result.length < 4; i++) {
    const code = codes[s[i]] || '';
    if (code && code !== lastCode) {
      result += code;
      lastCode = code;
    } else if (!code) {
      lastCode = '';
    }
  }
  
  return result.padEnd(4, '0');
}

function soundexSimilarity(a: string, b: string): number {
  const sa = soundex(a);
  const sb = soundex(b);
  if (!sa || !sb) return 0;
  
  let matches = 0;
  for (let i = 0; i < 4; i++) {
    if (sa[i] === sb[i]) matches++;
  }
  return matches / 4;
}

function trigramSimilarity(a: string, b: string): number {
  const getTrigrams = (s: string): Set<string> => {
    const padded = `  ${s.toLowerCase()}  `;
    const trigrams = new Set<string>();
    for (let i = 0; i < padded.length - 2; i++) {
      trigrams.add(padded.slice(i, i + 3));
    }
    return trigrams;
  };
  
  const trigramsA = getTrigrams(a);
  const trigramsB = getTrigrams(b);
  
  let intersection = 0;
  for (const t of trigramsA) {
    if (trigramsB.has(t)) intersection++;
  }
  
  const union = trigramsA.size + trigramsB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

function calculateSimilarity(termA: string, termB: string): {
  overall: number;
  phonetic: number;
  visual: number;
  conceptual: number;
} {
  const phonetic = (soundexSimilarity(termA, termB) * 0.6 + levenshteinSimilarity(termA, termB) * 0.4);
  const visual = levenshteinSimilarity(termA, termB);
  const conceptual = trigramSimilarity(termA, termB);
  
  const overall = phonetic * 0.4 + visual * 0.35 + conceptual * 0.25;
  
  return {
    overall: Math.round(overall * 100),
    phonetic: Math.round(phonetic * 100),
    visual: Math.round(visual * 100),
    conceptual: Math.round(conceptual * 100),
  };
}

// Mock data fetcher for demo (in production, this would call real APIs)
async function fetchMockTrademarkData(jurisdiction: string, _classes: number[]): Promise<Array<{
  title: string;
  applicant_name: string;
  applicant_country: string;
  filing_date: string;
  publication_date: string;
  classes: number[];
  source_id: string;
  source_url: string;
}>> {
  // Simulated trademark filings
  const mockFilings = [
    {
      title: 'NEXUX',
      applicant_name: 'Tech Innovations GmbH',
      applicant_country: 'DE',
      filing_date: new Date().toISOString().split('T')[0],
      publication_date: new Date().toISOString().split('T')[0],
      classes: [9, 42],
      source_id: `${jurisdiction}-2026-${Math.random().toString(36).substr(2, 9)}`,
      source_url: `https://euipo.europa.eu/trademark/${Math.random().toString(36).substr(2, 9)}`,
    },
    {
      title: 'SPYDER WATCH',
      applicant_name: 'Security Solutions Ltd',
      applicant_country: 'UK',
      filing_date: new Date().toISOString().split('T')[0],
      publication_date: new Date().toISOString().split('T')[0],
      classes: [9, 35, 42],
      source_id: `${jurisdiction}-2026-${Math.random().toString(36).substr(2, 9)}`,
      source_url: `https://euipo.europa.eu/trademark/${Math.random().toString(36).substr(2, 9)}`,
    },
    {
      title: 'IP-NEXIS',
      applicant_name: 'Legal Tech Corp',
      applicant_country: 'US',
      filing_date: new Date().toISOString().split('T')[0],
      publication_date: new Date().toISOString().split('T')[0],
      classes: [9, 45],
      source_id: `${jurisdiction}-2026-${Math.random().toString(36).substr(2, 9)}`,
      source_url: `https://euipo.europa.eu/trademark/${Math.random().toString(36).substr(2, 9)}`,
    },
  ];
  
  // Return random subset
  return mockFilings.filter(() => Math.random() > 0.5);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function processWatchlist(
  supabase: SupabaseClient<any>,
  job: SpiderJob,
  watchlist: Watchlist
): Promise<{ resultsFound: number; errors: string[] }> {
  const errors: string[] = [];
  let resultsFound = 0;
  
  console.log(`Processing watchlist: ${watchlist.name} (${watchlist.type})`);
  
  // Process each jurisdiction
  for (const jurisdiction of watchlist.watch_jurisdictions) {
    try {
      // Fetch trademark filings (mock for now)
      const filings = await fetchMockTrademarkData(jurisdiction, watchlist.watch_classes);
      
      // Compare each filing against watch terms
      for (const filing of filings) {
        for (const watchTerm of watchlist.watch_terms) {
          const similarity = calculateSimilarity(watchTerm, filing.title);
          
          // Check if similarity exceeds threshold
          if (similarity.overall >= watchlist.similarity_threshold) {
            // Check if result already exists
            const { data: existing } = await supabase
              .from('watch_results')
              .select('id')
              .eq('watchlist_id', watchlist.id)
              .eq('source_id', filing.source_id)
              .maybeSingle();
            
            if (!existing) {
              // Determine priority based on similarity
              let priority: 'low' | 'medium' | 'high' | 'critical' = 'low';
              if (similarity.overall >= 90) priority = 'critical';
              else if (similarity.overall >= 80) priority = 'high';
              else if (similarity.overall >= 70) priority = 'medium';
              
              // Insert new result
              const { error: insertError } = await supabase
                .from('watch_results')
                .insert({
                  watchlist_id: watchlist.id,
                  organization_id: job.organization_id,
                  result_type: 'trademark_published',
                  title: filing.title,
                  description: `Potential conflict detected with "${watchTerm}"`,
                  source: jurisdiction.toUpperCase(),
                  source_url: filing.source_url,
                  source_id: filing.source_id,
                  applicant_name: filing.applicant_name,
                  applicant_country: filing.applicant_country,
                  filing_date: filing.filing_date,
                  publication_date: filing.publication_date,
                  classes: filing.classes,
                  similarity_score: similarity.overall,
                  similarity_type: 'phonetic',
                  similarity_details: {
                    phonetic_score: similarity.phonetic,
                    visual_score: similarity.visual,
                    conceptual_score: similarity.conceptual,
                    matched_term: watchTerm,
                    analysis: `Matched against "${watchTerm}" with ${similarity.overall}% overall similarity`,
                  },
                  status: 'new',
                  priority,
                  detected_at: new Date().toISOString(),
                } as any);
              
              if (insertError) {
                errors.push(`Failed to insert result for ${filing.title}: ${insertError.message}`);
              } else {
                resultsFound++;
                
                // Create alert if high priority
                if (priority === 'critical' || priority === 'high') {
                  await supabase
                    .from('spider_alerts')
                    .insert({
                      organization_id: job.organization_id,
                      watchlist_id: watchlist.id,
                      alert_type: 'high_similarity',
                      title: `High similarity detected: ${filing.title}`,
                      message: `A new trademark "${filing.title}" has been detected with ${similarity.overall}% similarity to "${watchTerm}".`,
                      severity: priority === 'critical' ? 'critical' : 'high',
                      data: {
                        similarity_score: similarity.overall,
                        matched_term: watchTerm,
                        applicant: filing.applicant_name,
                      },
                      status: 'unread',
                    } as any);
                }
              }
            }
          }
        }
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      errors.push(`Error processing jurisdiction ${jurisdiction}: ${errorMessage}`);
    }
  }
  
  return { resultsFound, errors };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get pending jobs
    const { data: jobs, error: jobsError } = await supabase
      .from('spider_jobs')
      .select('*')
      .eq('status', 'pending')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(5);
    
    if (jobsError) {
      throw new Error(`Failed to fetch jobs: ${jobsError.message}`);
    }
    
    if (!jobs || jobs.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No pending jobs', processed: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const results: Array<{
      jobId: string;
      watchlistId: string;
      resultsFound: number;
      errors: string[];
      status: string;
    }> = [];
    
    for (const job of jobs as SpiderJob[]) {
      // Update job status to running
      await supabase
        .from('spider_jobs')
        .update({ 
          status: 'running', 
          started_at: new Date().toISOString() 
        } as any)
        .eq('id', job.id);
      
      try {
        // Get watchlist
        const { data: watchlist, error: watchlistError } = await supabase
          .from('watchlists')
          .select('*')
          .eq('id', job.watchlist_id)
          .single();
        
        if (watchlistError || !watchlist) {
          throw new Error(`Watchlist not found: ${job.watchlist_id}`);
        }
        
        // Process the watchlist
        const result = await processWatchlist(supabase, job, watchlist as Watchlist);
        
        // Update job as completed
        await supabase
          .from('spider_jobs')
          .update({
            status: result.errors.length > 0 ? 'completed_with_errors' : 'completed',
            completed_at: new Date().toISOString(),
            result_summary: {
              results_found: result.resultsFound,
              errors: result.errors,
            },
          } as any)
          .eq('id', job.id);
        
        // Update watchlist last run
        await supabase
          .from('watchlists')
          .update({
            last_run_at: new Date().toISOString(),
          } as any)
          .eq('id', watchlist.id);
        
        // Log connector run
        await supabase
          .from('spider_connector_runs')
          .insert({
            organization_id: job.organization_id,
            job_id: job.id,
            status: 'completed',
            results_found: result.resultsFound,
            started_at: job.started_at,
            completed_at: new Date().toISOString(),
          } as any);
        
        results.push({
          jobId: job.id,
          watchlistId: job.watchlist_id,
          resultsFound: result.resultsFound,
          errors: result.errors,
          status: 'completed',
        });
        
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        
        // Update job as failed
        await supabase
          .from('spider_jobs')
          .update({
            status: 'failed',
            completed_at: new Date().toISOString(),
            error_message: errorMessage,
          } as any)
          .eq('id', job.id);
        
        results.push({
          jobId: job.id,
          watchlistId: job.watchlist_id,
          resultsFound: 0,
          errors: [errorMessage],
          status: 'failed',
        });
      }
    }
    
    return new Response(
      JSON.stringify({
        message: `Processed ${results.length} jobs`,
        processed: results.length,
        results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Spider job processor error:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
