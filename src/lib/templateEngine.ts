// ============================================================
// IP-NEXUS - TEMPLATE ENGINE
// Handlebars-like template processor
// ============================================================

/**
 * Simple template engine supporting:
 * - {{variable}} - variable interpolation
 * - {{#if condition}}...{{else}}...{{/if}} - conditionals
 * - {{#unless condition}}...{{/unless}} - negative conditionals
 * - {{#each items}}...{{/each}} - loops
 * - {{this.property}} - item properties in loops
 * - {{@index}}, {{@first}}, {{@last}} - loop metadata
 */

export function renderTemplate(template: string, data: Record<string, unknown>): string {
  let result = template;
  
  // 1. Process {{#each items}}...{{/each}} blocks
  result = processEachBlocks(result, data);
  
  // 2. Process {{#if condition}}...{{else}}...{{/if}} blocks
  result = processIfBlocks(result, data);
  
  // 3. Process {{#unless condition}}...{{/unless}} blocks
  result = processUnlessBlocks(result, data);
  
  // 4. Replace simple variables {{variable}}
  result = replaceVariables(result, data);
  
  return result;
}

// =====================================================
// EACH BLOCKS
// =====================================================

function processEachBlocks(template: string, data: Record<string, unknown>): string {
  const eachRegex = /\{\{#each\s+([\w.]+)\}\}([\s\S]*?)\{\{\/each\}\}/g;
  
  return template.replace(eachRegex, (match, arrayPath, content) => {
    const array = getNestedValue(data, arrayPath);
    if (!Array.isArray(array) || array.length === 0) return '';
    
    return array.map((item, index) => {
      let itemContent = content;
      
      // Replace {{this.property}} with item values
      if (typeof item === 'object' && item !== null) {
        itemContent = itemContent.replace(
          /\{\{this\.([\w.]+)\}\}/g,
          (m: string, prop: string) => {
            const value = getNestedValue(item as Record<string, unknown>, prop);
            return formatValue(value);
          }
        );
      }
      
      // Replace {{this}} for primitive arrays
      if (typeof item !== 'object') {
        itemContent = itemContent.replace(/\{\{this\}\}/g, String(item));
      }
      
      // Replace loop metadata
      itemContent = itemContent.replace(/\{\{@index\}\}/g, String(index));
      itemContent = itemContent.replace(/\{\{@first\}\}/g, String(index === 0));
      itemContent = itemContent.replace(/\{\{@last\}\}/g, String(index === array.length - 1));
      
      return itemContent;
    }).join('');
  });
}

// =====================================================
// IF BLOCKS
// =====================================================

function processIfBlocks(template: string, data: Record<string, unknown>): string {
  // Handle {{#if condition}}...{{else}}...{{/if}}
  const ifElseRegex = /\{\{#if\s+([\w.]+)\}\}([\s\S]*?)\{\{else\}\}([\s\S]*?)\{\{\/if\}\}/g;
  
  let result = template.replace(ifElseRegex, (match, condition, ifContent, elseContent) => {
    const value = getNestedValue(data, condition);
    return isTruthy(value) ? ifContent : elseContent;
  });
  
  // Handle {{#if condition}}...{{/if}} (without else)
  const ifOnlyRegex = /\{\{#if\s+([\w.]+)\}\}([\s\S]*?)\{\{\/if\}\}/g;
  
  result = result.replace(ifOnlyRegex, (match, condition, content) => {
    const value = getNestedValue(data, condition);
    return isTruthy(value) ? content : '';
  });
  
  return result;
}

// =====================================================
// UNLESS BLOCKS
// =====================================================

function processUnlessBlocks(template: string, data: Record<string, unknown>): string {
  const unlessRegex = /\{\{#unless\s+([\w.]+)\}\}([\s\S]*?)\{\{\/unless\}\}/g;
  
  return template.replace(unlessRegex, (match, condition, content) => {
    const value = getNestedValue(data, condition);
    return !isTruthy(value) ? content : '';
  });
}

// =====================================================
// VARIABLE REPLACEMENT
// =====================================================

function replaceVariables(template: string, data: Record<string, unknown>): string {
  return template.replace(/\{\{([\w.]+)\}\}/g, (match, path) => {
    const value = getNestedValue(data, path);
    return formatValue(value);
  });
}

// =====================================================
// HELPERS
// =====================================================

function getNestedValue(obj: unknown, path: string): unknown {
  if (!obj || typeof obj !== 'object' || !path) return undefined;
  
  return path.split('.').reduce((current: unknown, key: string) => {
    if (current && typeof current === 'object' && key in (current as Record<string, unknown>)) {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

function isTruthy(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value.trim() !== '';
  if (typeof value === 'number') return value !== 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number') {
    // Format numbers with Spanish locale
    return new Intl.NumberFormat('es-ES', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  }
  if (typeof value === 'boolean') return value ? 'Sí' : 'No';
  if (value instanceof Date) {
    return value.toLocaleDateString('es-ES');
  }
  if (Array.isArray(value)) return value.join(', ');
  return String(value);
}

// =====================================================
// VALIDATION
// =====================================================

export interface TemplateVariable {
  key: string;
  label_es?: string;
  label_en?: string;
  source?: string;
  type?: 'text' | 'date' | 'number' | 'boolean' | 'array';
  required?: boolean;
}

/**
 * Validate that all variables in a template are defined
 */
export function validateTemplate(template: string, variables: TemplateVariable[]): string[] {
  const errors: string[] = [];
  const varPattern = /\{\{([\w.]+)\}\}/g;
  let match;
  
  const knownVars = new Set(variables.map(v => v.key));
  const systemVars = new Set(['@index', '@first', '@last', 'this']);
  
  while ((match = varPattern.exec(template)) !== null) {
    const varName = match[1];
    const baseName = varName.split('.')[0];
    
    // Skip system vars and this references
    if (systemVars.has(baseName)) continue;
    
    // Check if variable is known
    if (!knownVars.has(varName)) {
      // Also check if parent is known (for nested props like client.name)
      const isNestedOfKnown = Array.from(knownVars).some(k => varName.startsWith(k + '.'));
      if (!isNestedOfKnown) {
        errors.push(`Variable desconocida: {{${varName}}}`);
      }
    }
  }
  
  return errors;
}

/**
 * Extract all variables used in a template
 */
export function extractVariables(template: string): string[] {
  const variables = new Set<string>();
  const varPattern = /\{\{([\w.]+)\}\}/g;
  const systemVars = new Set(['@index', '@first', '@last', 'this']);
  let match;
  
  while ((match = varPattern.exec(template)) !== null) {
    const varName = match[1];
    const baseName = varName.split('.')[0];
    
    if (!systemVars.has(baseName) && !varName.startsWith('this.')) {
      variables.add(varName);
    }
  }
  
  return Array.from(variables);
}

/**
 * Preview template with placeholder values for missing data
 */
export function previewTemplate(template: string, data: Record<string, unknown>): string {
  const variables = extractVariables(template);
  const previewData = { ...data };
  
  // Fill in missing variables with placeholder
  variables.forEach(varName => {
    if (getNestedValue(previewData, varName) === undefined) {
      setNestedValue(previewData, varName, `[${varName}]`);
    }
  });
  
  return renderTemplate(template, previewData);
}

function setNestedValue(obj: Record<string, unknown>, path: string, value: unknown): void {
  const parts = path.split('.');
  let current = obj;
  
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i];
    if (!(key in current) || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key] as Record<string, unknown>;
  }
  
  current[parts[parts.length - 1]] = value;
}
