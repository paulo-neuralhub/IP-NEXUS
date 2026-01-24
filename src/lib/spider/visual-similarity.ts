/**
 * Calculate color similarity between two color palettes
 * Uses LAB color space for perceptual accuracy
 */
export function calculateColorSimilarity(colorsA: string[], colorsB: string[]): number {
  if (!colorsA.length || !colorsB.length) return 0;

  // Convert hex to RGB
  const hexToRgb = (hex: string): [number, number, number] => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return [0, 0, 0];
    return [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16),
    ];
  };

  // RGB to LAB (simplified conversion)
  const rgbToLab = (r: number, g: number, b: number): [number, number, number] => {
    // Normalize to 0-1
    r /= 255; g /= 255; b /= 255;

    // Apply gamma correction
    r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
    g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
    b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

    // Convert to XYZ
    const x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
    const y = (r * 0.2126 + g * 0.7152 + b * 0.0722);
    const z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;

    // Convert to LAB
    const f = (t: number) => t > 0.008856 ? Math.pow(t, 1/3) : (7.787 * t) + 16/116;
    
    const L = (116 * f(y)) - 16;
    const a = 500 * (f(x) - f(y));
    const bVal = 200 * (f(y) - f(z));

    return [L, a, bVal];
  };

  // Delta E 2000 (simplified)
  const deltaE = (lab1: [number, number, number], lab2: [number, number, number]): number => {
    const [L1, a1, b1] = lab1;
    const [L2, a2, b2] = lab2;
    
    const dL = L2 - L1;
    const da = a2 - a1;
    const db = b2 - b1;
    
    return Math.sqrt(dL * dL + da * da + db * db);
  };

  // Convert all colors to LAB
  const labA = colorsA.map(c => {
    const [r, g, b] = hexToRgb(c);
    return rgbToLab(r, g, b);
  });
  
  const labB = colorsB.map(c => {
    const [r, g, b] = hexToRgb(c);
    return rgbToLab(r, g, b);
  });

  // Find best matches for each color in A to colors in B
  let totalSimilarity = 0;
  
  for (const colorA of labA) {
    let minDelta = Infinity;
    for (const colorB of labB) {
      const delta = deltaE(colorA, colorB);
      if (delta < minDelta) minDelta = delta;
    }
    // Convert delta to similarity (0-1), max delta ~100 for opposite colors
    const similarity = Math.max(0, 1 - (minDelta / 100));
    totalSimilarity += similarity;
  }

  return totalSimilarity / labA.length;
}

/**
 * Calculate cosine similarity between two embeddings
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
  if (magnitude === 0) return 0;

  return dotProduct / magnitude;
}

/**
 * Calculate combined visual score
 */
export function calculateCombinedScore(
  visualSimilarity: number,
  colorSimilarity: number,
  visualWeight = 0.7,
  colorWeight = 0.3
): number {
  return (visualSimilarity * visualWeight) + (colorSimilarity * colorWeight);
}

/**
 * Determine priority based on visual similarity
 */
export function getVisualPriority(combinedScore: number): 'low' | 'medium' | 'high' | 'critical' {
  if (combinedScore >= 0.85) return 'critical';
  if (combinedScore >= 0.7) return 'high';
  if (combinedScore >= 0.5) return 'medium';
  return 'low';
}
