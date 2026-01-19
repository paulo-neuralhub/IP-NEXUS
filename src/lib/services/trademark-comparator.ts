// src/lib/services/trademark-comparator.ts
// Trademark comparison service with phonetic, visual, conceptual analysis

import type { TrademarkMark, TrademarkComparison, PhoneticDetails, RiskLevel } from '@/types/genius-pro.types';
import { supabase } from '@/integrations/supabase/client';

/**
 * Levenshtein distance algorithm
 */
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

/**
 * Soundex algorithm for phonetic similarity
 */
function soundex(str: string): string {
  const a = str.toLowerCase().split('');
  const codes: Record<string, string> = {
    a: '', e: '', i: '', o: '', u: '', y: '', h: '', w: '',
    b: '1', f: '1', p: '1', v: '1',
    c: '2', g: '2', j: '2', k: '2', q: '2', s: '2', x: '2', z: '2',
    d: '3', t: '3',
    l: '4',
    m: '5', n: '5',
    r: '6',
  };
  
  const first = a.shift() || '';
  const result = first.toUpperCase() + a
    .map(char => codes[char] || '')
    .filter((code, i, arr) => code && code !== arr[i - 1])
    .join('')
    .slice(0, 3);
  
  return result.padEnd(4, '0');
}

/**
 * Simple Metaphone implementation
 */
function metaphone(str: string): string[] {
  const s = str.toUpperCase().replace(/[^A-Z]/g, '');
  let primary = '';
  
  // Simplified metaphone - handles common patterns
  for (let i = 0; i < s.length && primary.length < 4; i++) {
    const char = s[i];
    const next = s[i + 1] || '';
    
    if ('AEIOU'.includes(char)) {
      if (i === 0) primary += char;
      continue;
    }
    
    // Handle special consonant combinations
    if (char === 'C') {
      if (next === 'H') { primary += 'X'; i++; }
      else if ('EIY'.includes(next)) primary += 'S';
      else primary += 'K';
    } else if (char === 'G') {
      if (next === 'H') { i++; }
      else if ('EIY'.includes(next)) primary += 'J';
      else primary += 'K';
    } else if (char === 'P' && next === 'H') {
      primary += 'F'; i++;
    } else if (char === 'Q') {
      primary += 'K';
    } else if (char === 'X') {
      primary += 'KS';
    } else if (char === 'Z') {
      primary += 'S';
    } else if (!'HW'.includes(char)) {
      primary += char;
    }
  }
  
  return [primary.slice(0, 4), primary.slice(0, 4)];
}

/**
 * Spanish syllabification
 */
function syllabify(word: string): string[] {
  const vowels = 'aeiouáéíóúüAEIOUÁÉÍÓÚÜ';
  const syllables: string[] = [];
  let current = '';
  
  for (let i = 0; i < word.length; i++) {
    current += word[i];
    
    if (vowels.includes(word[i])) {
      // Check if next char is consonant followed by vowel
      if (i < word.length - 2 && !vowels.includes(word[i + 1]) && vowels.includes(word[i + 2])) {
        syllables.push(current);
        current = '';
      } else if (i < word.length - 1 && vowels.includes(word[i + 1])) {
        // Consecutive vowels might be same syllable or diphthong
        continue;
      } else if (i === word.length - 1 || (i < word.length - 1 && !vowels.includes(word[i + 1]))) {
        syllables.push(current);
        current = '';
      }
    }
  }
  
  if (current) {
    if (syllables.length > 0) {
      syllables[syllables.length - 1] += current;
    } else {
      syllables.push(current);
    }
  }
  
  return syllables.filter(s => s.length > 0);
}

/**
 * Analyze phonetic similarity between two marks
 */
export function analyzePhonetic(markA: string, markB: string): {
  score: number;
  analysis: string;
  details: PhoneticDetails;
} {
  const a = markA.toLowerCase().trim();
  const b = markB.toLowerCase().trim();
  
  // Levenshtein distance
  const levDistance = levenshteinDistance(a, b);
  const maxLen = Math.max(a.length, b.length);
  const levenshteinScore = maxLen > 0 ? (1 - levDistance / maxLen) * 100 : 100;
  
  // Soundex
  const soundexA = soundex(a);
  const soundexB = soundex(b);
  const soundexMatch = soundexA === soundexB;
  
  // Metaphone
  const metaphoneA = metaphone(a);
  const metaphoneB = metaphone(b);
  const metaphoneMatch = metaphoneA[0] === metaphoneB[0];
  
  // Syllable analysis
  const syllablesA = syllabify(a);
  const syllablesB = syllabify(b);
  const commonSyllables = syllablesA.filter(s => 
    syllablesB.some(sb => sb.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(sb.toLowerCase()))
  );
  const syllableScore = Math.max(syllablesA.length, syllablesB.length) > 0
    ? (commonSyllables.length / Math.max(syllablesA.length, syllablesB.length)) * 100
    : 0;
  
  // Combined score (weighted)
  const score = Math.round(
    levenshteinScore * 0.30 +
    (soundexMatch ? 100 : 30) * 0.25 +
    (metaphoneMatch ? 100 : 30) * 0.25 +
    syllableScore * 0.20
  );
  
  // Generate analysis text
  let analysis = '';
  if (score >= 80) {
    analysis = `Las marcas "${markA}" y "${markB}" presentan una similitud fonética MUY ALTA (${score}%). `;
    analysis += `Comparten ${commonSyllables.length} sílabas comunes (${commonSyllables.join(', ')}). `;
    if (soundexMatch) analysis += 'El análisis Soundex indica pronunciación idéntica. ';
  } else if (score >= 60) {
    analysis = `Las marcas presentan una similitud fonética MEDIA-ALTA (${score}%). `;
    analysis += 'Existen elementos fonéticos comunes que pueden causar confusión oral.';
  } else if (score >= 40) {
    analysis = `Las marcas presentan una similitud fonética MODERADA (${score}%). `;
    analysis += 'Algunos elementos fonéticos son similares, pero hay diferencias notables.';
  } else {
    analysis = `Las marcas presentan BAJA similitud fonética (${score}%). `;
    analysis += 'Las diferencias en pronunciación son sustanciales.';
  }
  
  return {
    score,
    analysis,
    details: {
      levenshtein: levDistance,
      soundex: { a: soundexA, b: soundexB, match: soundexMatch },
      metaphone: { a: metaphoneA, b: metaphoneB, match: metaphoneMatch },
      syllables: { a: syllablesA, b: syllablesB, common: commonSyllables },
    },
  };
}

/**
 * Analyze conceptual similarity using AI
 */
export async function analyzeConceptual(
  markA: string, 
  markB: string
): Promise<{ score: number; analysis: string; concepts: { a: string[]; b: string[]; overlap: string[] } }> {
  try {
    const { data, error } = await supabase.functions.invoke('genius-conceptual-analysis', {
      body: { markA, markB },
    });
    
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Conceptual analysis failed, using fallback:', err);
    
    // Fallback: basic word similarity
    const wordsA = markA.toLowerCase().split(/\s+/);
    const wordsB = markB.toLowerCase().split(/\s+/);
    const overlap = wordsA.filter(w => wordsB.includes(w));
    const score = overlap.length > 0 ? Math.min(50 + overlap.length * 20, 80) : 20;
    
    return {
      score,
      analysis: overlap.length > 0 
        ? `Las marcas comparten conceptos comunes: ${overlap.join(', ')}`
        : 'No se detectaron conceptos comunes evidentes.',
      concepts: { a: wordsA, b: wordsB, overlap },
    };
  }
}

/**
 * Analyze visual similarity (placeholder - requires vision AI)
 */
export async function analyzeVisual(
  imageUrlA?: string,
  imageUrlB?: string
): Promise<{ score: number; analysis: string; factors: string[] }> {
  if (!imageUrlA || !imageUrlB) {
    return {
      score: 0,
      analysis: 'No se proporcionaron imágenes para comparación visual.',
      factors: [],
    };
  }
  
  try {
    const { data, error } = await supabase.functions.invoke('genius-visual-analysis', {
      body: { imageUrlA, imageUrlB },
    });
    
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Visual analysis failed:', err);
    return {
      score: 50,
      analysis: 'Análisis visual no disponible. Revise manualmente las imágenes.',
      factors: ['Requiere revisión manual'],
    };
  }
}

/**
 * Analyze goods/services similarity
 */
export function analyzeGoods(
  goodsA: string,
  classesA: number[],
  goodsB: string,
  classesB: number[]
): { score: number; analysis: string; identicalClasses: number[]; similarClasses: number[] } {
  // Find identical classes
  const identicalClasses = classesA.filter(c => classesB.includes(c));
  
  // Find similar classes (related industries)
  const classGroups = [
    [1, 2, 3, 4, 5], // Chemicals, paints, cosmetics, fuels, pharma
    [6, 7, 8, 9, 10, 11], // Metal, machines, tools, electronics, medical, appliances
    [12, 13], // Vehicles, firearms
    [14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28], // Various goods
    [29, 30, 31, 32, 33, 34], // Food & beverages
    [35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45], // Services
  ];
  
  const similarClasses: number[] = [];
  classesA.forEach(cA => {
    const group = classGroups.find(g => g.includes(cA));
    if (group) {
      classesB.forEach(cB => {
        if (group.includes(cB) && cA !== cB && !identicalClasses.includes(cB)) {
          similarClasses.push(cB);
        }
      });
    }
  });
  
  // Calculate score
  let score = 0;
  if (identicalClasses.length > 0) {
    score = 70 + Math.min(identicalClasses.length * 10, 30);
  } else if (similarClasses.length > 0) {
    score = 40 + Math.min(similarClasses.length * 10, 30);
  } else {
    score = 20;
  }
  
  // Check for overlapping terms in goods descriptions
  const wordsA = goodsA.toLowerCase().split(/\s+/);
  const wordsB = goodsB.toLowerCase().split(/\s+/);
  const commonWords = wordsA.filter(w => w.length > 4 && wordsB.includes(w));
  if (commonWords.length > 0) {
    score = Math.min(score + commonWords.length * 5, 100);
  }
  
  // Generate analysis
  let analysis = '';
  if (identicalClasses.length > 0) {
    analysis = `Las marcas comparten ${identicalClasses.length} clase(s) idéntica(s): ${identicalClasses.join(', ')}. `;
    analysis += 'Esto indica un alto riesgo de confusión en cuanto a productos/servicios.';
  } else if (similarClasses.length > 0) {
    analysis = `No hay clases idénticas, pero hay ${similarClasses.length} clase(s) relacionada(s): ${similarClasses.join(', ')}. `;
    analysis += 'Existe riesgo moderado por cercanía de sectores.';
  } else {
    analysis = 'Las clases de productos/servicios son diferentes y no relacionadas. ';
    analysis += 'El principio de especialidad podría aplicar.';
  }
  
  return {
    score,
    analysis,
    identicalClasses,
    similarClasses: [...new Set(similarClasses)],
  };
}

/**
 * Complete trademark comparison
 */
export async function compareTrademarks(
  markA: TrademarkMark,
  markB: TrademarkMark
): Promise<TrademarkComparison> {
  // Run analyses (phonetic is sync, others can be parallel)
  const phonetic = analyzePhonetic(markA.text, markB.text);
  const goods = analyzeGoods(
    Array.isArray(markA.goods) ? markA.goods.join(', ') : markA.goods,
    markA.classes,
    Array.isArray(markB.goods) ? markB.goods.join(', ') : markB.goods,
    markB.classes
  );
  
  // Run async analyses in parallel
  const [conceptual, visual] = await Promise.all([
    analyzeConceptual(markA.text, markB.text),
    analyzeVisual(markA.imageUrl, markB.imageUrl),
  ]);
  
  // Calculate overall score (weighted average)
  const hasVisual = markA.imageUrl && markB.imageUrl;
  const weights = {
    visual: hasVisual ? 0.25 : 0,
    phonetic: hasVisual ? 0.25 : 0.35,
    conceptual: hasVisual ? 0.25 : 0.35,
    goods: hasVisual ? 0.25 : 0.30,
  };
  
  const overallScore = Math.round(
    visual.score * weights.visual +
    phonetic.score * weights.phonetic +
    conceptual.score * weights.conceptual +
    goods.score * weights.goods
  );
  
  // Determine risk level
  let riskLevel: RiskLevel;
  let recommendation: string;
  
  if (overallScore >= 80) {
    riskLevel = 'critical';
    recommendation = 'ALTO RIESGO de confusión. Se recomienda presentar oposición urgente o requerir el cese inmediato.';
  } else if (overallScore >= 60) {
    riskLevel = 'high';
    recommendation = 'Riesgo significativo de confusión. Considerar oposición, carta de cese o negociación de coexistencia.';
  } else if (overallScore >= 40) {
    riskLevel = 'medium';
    recommendation = 'Riesgo moderado. Evaluar estrategia de coexistencia, vigilancia activa o contacto preventivo.';
  } else {
    riskLevel = 'low';
    recommendation = 'Bajo riesgo de confusión. Mantener vigilancia preventiva. No se recomienda acción inmediata.';
  }
  
  return {
    markA,
    markB,
    analysis: {
      visual: {
        score: visual.score,
        analysis: visual.analysis,
        factors: visual.factors,
      },
      phonetic: {
        score: phonetic.score,
        analysis: phonetic.analysis,
        syllables: { a: phonetic.details.syllables.a, b: phonetic.details.syllables.b },
        algorithms: phonetic.details,
      },
      conceptual: {
        score: conceptual.score,
        analysis: conceptual.analysis,
        concepts: conceptual.concepts,
        overlap: conceptual.concepts.overlap,
      },
      goods: {
        score: goods.score,
        analysis: goods.analysis,
        identicalClasses: goods.identicalClasses,
        similarClasses: goods.similarClasses,
      },
    },
    overall: {
      riskLevel,
      score: overallScore,
      recommendation,
    },
  };
}
