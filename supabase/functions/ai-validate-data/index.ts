import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ValidationError {
  row: number;
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: string[];
  validRecords: number;
  invalidRecords: number;
  suggestions: string[];
}

// Validation rules by entity and field
const VALIDATION_RULES: Record<string, Record<string, {
  required?: boolean;
  type?: string;
  pattern?: RegExp;
  maxLength?: number;
  enum?: string[];
}>> = {
  matters: {
    reference: { required: true, maxLength: 100 },
    title: { required: true, maxLength: 500 },
    ip_type: { enum: ['patent', 'trademark', 'design', 'copyright', 'domain', 'trade_secret'] },
    status: { enum: ['draft', 'pending', 'active', 'granted', 'expired', 'abandoned'] },
    filing_date: { type: 'date' },
    grant_date: { type: 'date' },
    expiry_date: { type: 'date' },
    application_number: { maxLength: 100 },
    registration_number: { maxLength: 100 },
    country_code: { maxLength: 3, pattern: /^[A-Z]{2,3}$/ },
  },
  contacts: {
    name: { required: true, maxLength: 255 },
    email: { type: 'email', pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    phone: { maxLength: 50 },
    company_name: { maxLength: 255 },
  },
  costs: {
    description: { required: true, maxLength: 500 },
    amount: { required: true, type: 'number' },
    currency: { maxLength: 3 },
    cost_type: { enum: ['official_fee', 'attorney_fee', 'translation', 'renewal', 'other'] },
    status: { enum: ['pending', 'paid', 'cancelled'] },
  },
  deadlines: {
    title: { required: true, maxLength: 255 },
    due_date: { required: true, type: 'date' },
    deadline_type: { enum: ['official', 'internal', 'renewal', 'response', 'payment'] },
    priority: { enum: ['low', 'medium', 'high', 'critical'] },
    status: { enum: ['pending', 'completed', 'overdue', 'cancelled'] },
  },
};

function isValidDate(value: unknown): boolean {
  if (!value) return false;
  const date = new Date(String(value));
  return !isNaN(date.getTime());
}

function isValidEmail(value: unknown): boolean {
  if (!value) return true; // Optional field
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value));
}

function validateRecord(
  record: Record<string, unknown>,
  mapping: Record<string, string>,
  targetEntity: string,
  rowIndex: number
): ValidationError[] {
  const errors: ValidationError[] = [];
  const entityRules = VALIDATION_RULES[targetEntity] || {};
  
  // Check mapped fields against rules
  for (const [sourceField, targetField] of Object.entries(mapping)) {
    const value = record[sourceField];
    const rules = entityRules[targetField];
    
    if (!rules) continue;
    
    // Required check
    if (rules.required && (value === null || value === undefined || value === '')) {
      errors.push({
        row: rowIndex,
        field: sourceField,
        message: `El campo "${targetField}" es requerido`,
        severity: 'error'
      });
      continue;
    }
    
    if (value === null || value === undefined || value === '') continue;
    
    // Type checks
    if (rules.type === 'date' && !isValidDate(value)) {
      errors.push({
        row: rowIndex,
        field: sourceField,
        message: `Formato de fecha inválido: "${value}"`,
        severity: 'error'
      });
    }
    
    if (rules.type === 'email' && !isValidEmail(value)) {
      errors.push({
        row: rowIndex,
        field: sourceField,
        message: `Formato de email inválido: "${value}"`,
        severity: 'error'
      });
    }
    
    if (rules.type === 'number' && isNaN(Number(value))) {
      errors.push({
        row: rowIndex,
        field: sourceField,
        message: `Se esperaba un número: "${value}"`,
        severity: 'error'
      });
    }
    
    // Max length check
    if (rules.maxLength && String(value).length > rules.maxLength) {
      errors.push({
        row: rowIndex,
        field: sourceField,
        message: `Excede longitud máxima (${rules.maxLength}): ${String(value).length} caracteres`,
        severity: 'warning'
      });
    }
    
    // Enum check
    if (rules.enum) {
      const normalizedValue = String(value).toLowerCase();
      if (!rules.enum.includes(normalizedValue)) {
        errors.push({
          row: rowIndex,
          field: sourceField,
          message: `Valor inválido "${value}". Valores permitidos: ${rules.enum.join(', ')}`,
          severity: 'warning'
        });
      }
    }
    
    // Pattern check
    if (rules.pattern && !rules.pattern.test(String(value))) {
      errors.push({
        row: rowIndex,
        field: sourceField,
        message: `Formato inválido: "${value}"`,
        severity: 'warning'
      });
    }
  }
  
  return errors;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { data, mapping, targetEntity } = await req.json();
    
    if (!data || !Array.isArray(data)) {
      throw new Error('Data must be an array');
    }
    
    if (!mapping || typeof mapping !== 'object') {
      throw new Error('Mapping must be provided');
    }
    
    if (!targetEntity) {
      throw new Error('Target entity must be specified');
    }

    console.log(`Validating ${data.length} records for entity ${targetEntity}`);

    const allErrors: ValidationError[] = [];
    let validRecords = 0;
    let invalidRecords = 0;
    
    // Validate each record
    for (let i = 0; i < data.length; i++) {
      const errors = validateRecord(data[i], mapping, targetEntity, i + 1);
      
      if (errors.some(e => e.severity === 'error')) {
        invalidRecords++;
      } else {
        validRecords++;
      }
      
      allErrors.push(...errors);
    }
    
    // Generate warnings and suggestions
    const warnings: string[] = [];
    const suggestions: string[] = [];
    
    // Check for duplicate values in key fields
    const referenceField = Object.entries(mapping).find(([_, target]) => target === 'reference');
    if (referenceField) {
      const references = data.map(r => r[referenceField[0]]).filter(Boolean);
      const duplicates = references.filter((item, index) => references.indexOf(item) !== index);
      if (duplicates.length > 0) {
        warnings.push(`Se encontraron ${duplicates.length} referencias duplicadas`);
        suggestions.push('Revisa las referencias duplicadas antes de migrar');
      }
    }
    
    // Check for high error rate
    const errorRate = invalidRecords / data.length;
    if (errorRate > 0.3) {
      warnings.push(`${Math.round(errorRate * 100)}% de registros tienen errores`);
      suggestions.push('Considera limpiar los datos de origen antes de continuar');
    }
    
    // Check for missing required fields
    const requiredFieldsMissing = allErrors.filter(e => 
      e.severity === 'error' && e.message.includes('requerido')
    );
    if (requiredFieldsMissing.length > 0) {
      const affectedFields = [...new Set(requiredFieldsMissing.map(e => e.field))];
      suggestions.push(`Asegúrate de mapear los campos requeridos: ${affectedFields.join(', ')}`);
    }

    const result: ValidationResult = {
      isValid: invalidRecords === 0,
      errors: allErrors.slice(0, 100), // Limit to first 100 errors
      warnings,
      validRecords,
      invalidRecords,
      suggestions
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
