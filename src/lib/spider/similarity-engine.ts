import { supabase } from '@/integrations/supabase/client';

export interface SimilarityResult {
  overall: number;
  phonetic: number;
  visual: number;
  conceptual: number;
  exact_match: boolean;
  contains_match: boolean;
  details: {
    levenshtein_similarity: number;
    trigram_similarity: number;
    soundex_match: boolean;
    soundex_a: string;
    soundex_b: string;
    metaphone_match: boolean;
    metaphone_a: string;
    metaphone_b: string;
    common_prefix_length: number;
    length_diff: number;
  };
}

// Calcular similitud usando función SQL
export async function calculateSimilarity(
  termA: string,
  termB: string
): Promise<SimilarityResult> {
  const { data, error } = await supabase.rpc('calculate_trademark_similarity', {
    term_a: termA,
    term_b: termB,
  });

  if (error) throw error;

  const result = data as any;
  return {
    overall: result?.overall_score ?? 0,
    phonetic: result?.phonetic_score ?? 0,
    visual: result?.visual_score ?? 0,
    conceptual: result?.conceptual_score ?? 0,
    exact_match: result?.exact_match ?? false,
    contains_match: result?.contains_match ?? false,
    details: result?.analysis ?? {} as any,
  };
}

// Calcular similitud localmente (para UI sin latencia)
export function calculateSimilarityLocal(termA: string, termB: string): SimilarityResult {
  const a = termA.toLowerCase().trim();
  const b = termB.toLowerCase().trim();

  // Exact match
  const exact_match = a === b;
  const contains_match = a.includes(b) || b.includes(a);

  // Levenshtein
  const levenshteinDist = levenshteinDistance(a, b);
  const maxLen = Math.max(a.length, b.length);
  const levenshtein_similarity = maxLen > 0 ? Math.round((1 - levenshteinDist / maxLen) * 100) : 100;

  // Soundex
  const soundex_a = soundex(a);
  const soundex_b = soundex(b);
  const soundex_match = soundex_a === soundex_b;

  // Metaphone (simplified)
  const metaphone_a = simpleMetaphone(a);
  const metaphone_b = simpleMetaphone(b);
  const metaphone_match = metaphone_a === metaphone_b;

  // Common prefix
  let common_prefix_length = 0;
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    if (a[i] === b[i]) common_prefix_length++;
    else break;
  }

  // Trigram similarity
  const trigram_similarity = trigramSimilarity(a, b);

  // Calculate scores
  const phonetic = Math.min(100, Math.round(
    levenshtein_similarity * 0.4 +
    (soundex_match ? 100 : trigram_similarity) * 0.3 +
    (metaphone_match ? 100 : trigram_similarity) * 0.3 +
    (common_prefix_length / Math.max(a.length, 1)) * 20
  ));

  const visual = Math.round(trigram_similarity);

  const conceptual = Math.min(100, Math.round(
    exact_match ? 100 : contains_match ? 80 : trigram_similarity * 0.7
  ));

  let overall = Math.min(100, Math.round(
    phonetic * 0.5 + visual * 0.2 + conceptual * 0.3
  ));

  if (exact_match) {
    overall = 100;
  }

  return {
    overall,
    phonetic,
    visual,
    conceptual,
    exact_match,
    contains_match,
    details: {
      levenshtein_similarity,
      trigram_similarity,
      soundex_match,
      soundex_a,
      soundex_b,
      metaphone_match,
      metaphone_a,
      metaphone_b,
      common_prefix_length,
      length_diff: Math.abs(a.length - b.length),
    },
  };
}

// Levenshtein distance
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
      if (b[i - 1] === a[j - 1]) {
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

// Soundex algorithm
function soundex(str: string): string {
  const a = str.toUpperCase().split('');
  const firstLetter = a.shift() || '';
  const codes: Record<string, string> = {
    B: '1', F: '1', P: '1', V: '1',
    C: '2', G: '2', J: '2', K: '2', Q: '2', S: '2', X: '2', Z: '2',
    D: '3', T: '3',
    L: '4',
    M: '5', N: '5',
    R: '6',
  };

  const encoded = a
    .map(char => codes[char] || '')
    .join('')
    .replace(/(.)\1+/g, '$1');

  return (firstLetter + encoded + '000').slice(0, 4);
}

// Simplified metaphone
function simpleMetaphone(str: string): string {
  return str
    .toUpperCase()
    .replace(/[AEIOU]/g, '')
    .replace(/[^A-Z]/g, '')
    .slice(0, 6);
}

// Trigram similarity (Jaccard index)
function trigramSimilarity(a: string, b: string): number {
  const getTrigrams = (s: string): Set<string> => {
    const padded = `  ${s} `;
    const trigrams = new Set<string>();
    for (let i = 0; i < padded.length - 2; i++) {
      trigrams.add(padded.slice(i, i + 3));
    }
    return trigrams;
  };

  const trigramsA = getTrigrams(a);
  const trigramsB = getTrigrams(b);

  let intersection = 0;
  trigramsA.forEach(t => {
    if (trigramsB.has(t)) intersection++;
  });

  const union = trigramsA.size + trigramsB.size - intersection;

  return union > 0 ? Math.round((intersection / union) * 100) : 0;
}

// Clasificar nivel de similitud
export function getSimilarityLevel(score: number): {
  level: 'low' | 'medium' | 'high' | 'critical';
  label: string;
  color: string;
} {
  if (score >= 85) return { level: 'critical', label: 'Crítica', color: 'hsl(var(--destructive))' };
  if (score >= 70) return { level: 'high', label: 'Alta', color: '#F97316' };
  if (score >= 50) return { level: 'medium', label: 'Media', color: '#F59E0B' };
  return { level: 'low', label: 'Baja', color: 'hsl(var(--success))' };
}

// Generar variaciones de dominio
export function generateDomainVariations(term: string): string[] {
  const clean = term.toLowerCase().replace(/[^a-z0-9]/g, '');
  const tlds = ['.com', '.net', '.org', '.es', '.eu', '.io', '.co'];
  
  const variations: string[] = [];
  
  for (const tld of tlds) {
    variations.push(clean + tld);
    if (clean.length > 3) {
      variations.push(clean.slice(0, -1) + tld); // Sin última letra
      variations.push(clean + clean[clean.length - 1] + tld); // Letra duplicada
    }
  }

  return [...new Set(variations)].slice(0, 20);
}
