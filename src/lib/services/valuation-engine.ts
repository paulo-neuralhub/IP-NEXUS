// src/lib/services/valuation-engine.ts
// IP Asset Valuation Engine - Implements Cost, Market, and Income approaches

import type { ValuationInput, ValuationMethod, ValuationParameters } from '@/types/ip-finance.types';

/**
 * COST APPROACH (Enfoque de Costos)
 * Valor = (Costos de desarrollo + Costos legales + Costos de mantenimiento) * Multiplicador
 * Ajustado por factores de calidad
 */
export function calculateCostApproach(input: ValuationInput, params: ValuationParameters | null): number {
  const developmentCost = input.acquisitionCost || 0;
  const legalCost = params?.legal_cost_base || 5000;
  const maintenanceCost = (params?.maintenance_cost_annual || 1000) * 5; // 5 years
  
  const multiplier = params?.development_cost_multiplier || 1.5;
  
  let value = (developmentCost + legalCost + maintenanceCost) * multiplier;
  
  // Adjustments based on quality factors
  if (input.brandStrength) {
    value *= 1 + (input.brandStrength / 100) * 0.5;
  }
  if (input.legalStrength) {
    value *= 1 + (input.legalStrength / 100) * 0.3;
  }
  
  return Math.round(Math.max(value, 0));
}

/**
 * MARKET APPROACH (Enfoque de Mercado)
 * Valor = Base value * Market multiplier
 * Ajustado por posición de mercado
 */
export function calculateMarketApproach(input: ValuationInput, params: ValuationParameters | null): number {
  // Use acquisition cost as base or default
  const baseValue = input.acquisitionCost || 10000;
  const multiplier = params?.market_multiplier_mid || 3.0;
  
  let value = baseValue * multiplier;
  
  // Adjust for market position
  if (input.marketPosition) {
    value *= 1 + (input.marketPosition - 50) / 100 * 0.5;
  }
  
  // Adjust for brand strength
  if (input.brandStrength) {
    value *= 1 + (input.brandStrength - 50) / 100 * 0.3;
  }
  
  return Math.round(Math.max(value, 0));
}

/**
 * INCOME APPROACH (Enfoque de Ingresos) - Relief from Royalty Method
 * Valor = Σ (Ingresos × Tasa de Royalty × Factor de Descuento) para cada año
 */
export function calculateIncomeApproach(input: ValuationInput, params: ValuationParameters | null): number {
  const revenue = input.projectedRevenue || 100000;
  const royaltyRate = params?.royalty_rate_mid || 0.03;
  const discountRate = params?.discount_rate || 0.10;
  const growthRate = params?.growth_rate || 0.02;
  const usefulLife = params?.useful_life_years || 10;
  
  // Relief from Royalty method - DCF of royalty savings
  let totalValue = 0;
  let currentRevenue = revenue;
  
  for (let year = 1; year <= usefulLife; year++) {
    const royaltyIncome = currentRevenue * royaltyRate;
    const discountFactor = Math.pow(1 + discountRate, -year);
    totalValue += royaltyIncome * discountFactor;
    currentRevenue *= (1 + growthRate);
  }
  
  // Adjustments for quality factors
  if (input.brandStrength) {
    totalValue *= 1 + (input.brandStrength / 100) * 0.3;
  }
  if (input.competitiveAdvantage) {
    totalValue *= 1 + (input.competitiveAdvantage / 100) * 0.2;
  }
  
  return Math.round(Math.max(totalValue, 0));
}

/**
 * Calculate confidence level based on input quality and method consistency
 */
export function calculateConfidence(results: Record<string, number>, input: ValuationInput): number {
  const values = Object.values(results);
  if (values.length === 0) return 0.3;
  
  // Calculate coefficient of variation
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  if (avg === 0) return 0.3;
  
  const variance = values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);
  const cv = stdDev / avg;
  
  // Lower CV = higher confidence (methods agree more)
  let confidence = 1 - Math.min(cv, 1);
  
  // Adjust for input quality - more data = more confidence
  if (input.brandStrength !== undefined) confidence += 0.05;
  if (input.projectedRevenue) confidence += 0.1;
  if (input.acquisitionCost) confidence += 0.05;
  if (input.marketPosition !== undefined) confidence += 0.05;
  if (input.legalStrength !== undefined) confidence += 0.05;
  
  // Clamp between 0.3 and 0.95
  return Math.min(Math.max(confidence, 0.3), 0.95);
}

/**
 * Determine primary valuation method based on results
 */
export function determinePrimaryMethod(results: Record<string, number>): ValuationMethod {
  // Prefer income approach if available (most reliable for revenue-generating assets)
  if (results.income && results.income > 0) return 'income';
  // Then market (real market data)
  if (results.market && results.market > 0) return 'market';
  // Default to cost
  return 'cost';
}

/**
 * Format currency for display
 */
export function formatValuationCurrency(value: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}
