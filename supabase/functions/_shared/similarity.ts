// Shared Similarity Engine for Spider and Genius
// Based on PROMPT 51 specifications

export interface SimilarityResult {
  phonetic: number;
  visual: number;
  conceptual: number;
  overall: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  details: {
    levenshtein: number;
    soundex: boolean;
    metaphone: boolean;
    trigrams: number;
  };
}

export function calculateSimilarity(term1: string, term2: string): SimilarityResult {
  const t1 = normalize(term1);
  const t2 = normalize(term2);
  
  // Visual similarity (character-based)
  const levenshtein = levenshteinSimilarity(t1, t2);
  const trigrams = trigramSimilarity(t1, t2);
  const visual = (levenshtein * 0.6 + trigrams * 0.4);
  
  // Phonetic similarity
  const soundexMatch = soundex(t1) === soundex(t2);
  const metaphoneMatch = metaphone(t1) === metaphone(t2);
  const phonetic = (soundexMatch ? 0.5 : 0) + (metaphoneMatch ? 0.5 : 0);
  
  // Conceptual similarity (word-based)
  const conceptual = wordOverlapSimilarity(t1, t2);
  
  // Overall weighted score
  const overall = (visual * 0.4 + phonetic * 0.35 + conceptual * 0.25) * 100;
  
  // Risk level
  let riskLevel: SimilarityResult['riskLevel'];
  if (overall >= 85) riskLevel = 'critical';
  else if (overall >= 70) riskLevel = 'high';
  else if (overall >= 50) riskLevel = 'medium';
  else riskLevel = 'low';
  
  return {
    phonetic: Math.round(phonetic * 100),
    visual: Math.round(visual * 100),
    conceptual: Math.round(conceptual * 100),
    overall: Math.round(overall),
    riskLevel,
    details: {
      levenshtein: Math.round(levenshtein * 100),
      soundex: soundexMatch,
      metaphone: metaphoneMatch,
      trigrams: Math.round(trigrams * 100)
    }
  };
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s]/g, '') // Keep only alphanumeric and spaces
    .trim();
}

function levenshteinSimilarity(s1: string, s2: string): number {
  const distance = levenshteinDistance(s1, s2);
  const maxLen = Math.max(s1.length, s2.length);
  return maxLen > 0 ? 1 - distance / maxLen : 1;
}

function levenshteinDistance(s1: string, s2: string): number {
  const m = s1.length;
  const n = s2.length;
  
  if (m === 0) return n;
  if (n === 0) return m;
  
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
  
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,      // Deletion
        dp[i][j - 1] + 1,      // Insertion
        dp[i - 1][j - 1] + cost // Substitution
      );
    }
  }
  
  return dp[m][n];
}

function trigramSimilarity(s1: string, s2: string): number {
  const trigrams1 = getTrigrams(s1);
  const trigrams2 = getTrigrams(s2);
  
  const intersection = trigrams1.filter(t => trigrams2.includes(t)).length;
  const union = new Set([...trigrams1, ...trigrams2]).size;
  
  return union > 0 ? intersection / union : 0;
}

function getTrigrams(s: string): string[] {
  const padded = `  ${s} `;
  const trigrams: string[] = [];
  
  for (let i = 0; i < padded.length - 2; i++) {
    trigrams.push(padded.substring(i, i + 3));
  }
  
  return trigrams;
}

function soundex(s: string): string {
  if (!s) return '';
  
  const chars = s.toUpperCase().split('');
  const codes: Record<string, string> = {
    'B': '1', 'F': '1', 'P': '1', 'V': '1',
    'C': '2', 'G': '2', 'J': '2', 'K': '2', 'Q': '2', 'S': '2', 'X': '2', 'Z': '2',
    'D': '3', 'T': '3',
    'L': '4',
    'M': '5', 'N': '5',
    'R': '6'
  };
  
  let result = chars[0];
  let prevCode = codes[chars[0]] || '';
  
  for (let i = 1; i < chars.length && result.length < 4; i++) {
    const code = codes[chars[i]] || '';
    if (code && code !== prevCode) {
      result += code;
    }
    prevCode = code || prevCode;
  }
  
  return (result + '000').substring(0, 4);
}

function metaphone(s: string): string {
  if (!s) return '';
  
  let result = s.toUpperCase();
  
  // Simplified metaphone rules
  result = result
    .replace(/^KN|^GN|^PN|^AE|^WR/, '')
    .replace(/MB$/, 'M')
    .replace(/X/g, 'KS')
    .replace(/PH/g, 'F')
    .replace(/CK/g, 'K')
    .replace(/GH/g, 'F')
    .replace(/WH/g, 'W')
    .replace(/[AEIOU]/g, '')
    .replace(/(.)\1+/g, '$1'); // Remove doubles
  
  return result.substring(0, 4);
}

function wordOverlapSimilarity(s1: string, s2: string): number {
  const words1 = new Set(s1.split(/\s+/).filter(w => w.length > 2));
  const words2 = new Set(s2.split(/\s+/).filter(w => w.length > 2));
  
  if (words1.size === 0 || words2.size === 0) return 0;
  
  let matchCount = 0;
  for (const word of words1) {
    if (words2.has(word)) matchCount++;
  }
  
  return matchCount / Math.max(words1.size, words2.size);
}

// Jaro-Winkler for additional precision
export function jaroWinklerSimilarity(s1: string, s2: string): number {
  if (s1 === s2) return 1;
  if (!s1.length || !s2.length) return 0;
  
  const matchWindow = Math.floor(Math.max(s1.length, s2.length) / 2) - 1;
  const s1Matches = new Array(s1.length).fill(false);
  const s2Matches = new Array(s2.length).fill(false);
  
  let matches = 0;
  let transpositions = 0;
  
  for (let i = 0; i < s1.length; i++) {
    const start = Math.max(0, i - matchWindow);
    const end = Math.min(i + matchWindow + 1, s2.length);
    
    for (let j = start; j < end; j++) {
      if (s2Matches[j] || s1[i] !== s2[j]) continue;
      s1Matches[i] = true;
      s2Matches[j] = true;
      matches++;
      break;
    }
  }
  
  if (matches === 0) return 0;
  
  let k = 0;
  for (let i = 0; i < s1.length; i++) {
    if (!s1Matches[i]) continue;
    while (!s2Matches[k]) k++;
    if (s1[i] !== s2[k]) transpositions++;
    k++;
  }
  
  const jaro = (matches / s1.length + matches / s2.length + (matches - transpositions / 2) / matches) / 3;
  
  // Winkler modification
  let prefix = 0;
  for (let i = 0; i < Math.min(4, Math.min(s1.length, s2.length)); i++) {
    if (s1[i] === s2[i]) prefix++;
    else break;
  }
  
  return jaro + prefix * 0.1 * (1 - jaro);
}
