import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Schema de IP-NEXUS para referencia
const IP_NEXUS_SCHEMA = {
  matters: [
    { name: 'reference', type: 'string', description: 'Referencia única del expediente' },
    { name: 'title', type: 'string', description: 'Título del expediente' },
    { name: 'ip_type', type: 'enum', values: ['patent', 'trademark', 'design', 'copyright', 'domain', 'trade_secret'] },
    { name: 'status', type: 'enum', values: ['draft', 'pending', 'active', 'granted', 'expired', 'abandoned'] },
    { name: 'filing_date', type: 'date', description: 'Fecha de presentación' },
    { name: 'grant_date', type: 'date', description: 'Fecha de concesión' },
    { name: 'expiry_date', type: 'date', description: 'Fecha de expiración' },
    { name: 'application_number', type: 'string', description: 'Número de solicitud' },
    { name: 'registration_number', type: 'string', description: 'Número de registro' },
    { name: 'priority_date', type: 'date', description: 'Fecha de prioridad' },
    { name: 'priority_number', type: 'string', description: 'Número de prioridad' },
    { name: 'country_code', type: 'string', description: 'Código de país ISO' },
    { name: 'classes', type: 'array', description: 'Clases de Niza (marcas) o CIP (patentes)' },
    { name: 'description', type: 'text', description: 'Descripción detallada' },
    { name: 'notes', type: 'text', description: 'Notas internas' },
  ],
  contacts: [
    { name: 'name', type: 'string', description: 'Nombre completo' },
    { name: 'email', type: 'email', description: 'Email' },
    { name: 'phone', type: 'string', description: 'Teléfono' },
    { name: 'company_name', type: 'string', description: 'Empresa' },
    { name: 'job_title', type: 'string', description: 'Puesto/Rol' },
    { name: 'address_line1', type: 'text', description: 'Dirección' },
    { name: 'country', type: 'string', description: 'País' },
    { name: 'tax_id', type: 'string', description: 'NIF/CIF' },
  ],
  deadlines: [
    { name: 'title', type: 'string', description: 'Título del plazo' },
    { name: 'due_date', type: 'date', description: 'Fecha de vencimiento' },
    { name: 'deadline_type', type: 'enum', values: ['official', 'internal', 'renewal', 'response', 'payment'] },
    { name: 'priority', type: 'enum', values: ['low', 'medium', 'high', 'critical'] },
    { name: 'status', type: 'enum', values: ['pending', 'completed', 'overdue', 'cancelled'] },
    { name: 'reminder_days', type: 'number', description: 'Días de anticipación para recordatorio' },
  ],
  costs: [
    { name: 'description', type: 'string', description: 'Descripción del coste' },
    { name: 'amount', type: 'decimal', description: 'Importe' },
    { name: 'currency', type: 'string', description: 'Moneda' },
    { name: 'cost_type', type: 'enum', values: ['official_fee', 'attorney_fee', 'translation', 'renewal', 'other'] },
    { name: 'date', type: 'date', description: 'Fecha del coste' },
    { name: 'invoice_number', type: 'string', description: 'Número de factura' },
    { name: 'status', type: 'enum', values: ['pending', 'paid', 'cancelled'] },
  ],
};

// Common field name mappings for heuristic matching
const COMMON_MAPPINGS: Record<string, { entity: string; field: string }> = {
  // Matters
  'reference': { entity: 'matters', field: 'reference' },
  'ref': { entity: 'matters', field: 'reference' },
  'case_ref': { entity: 'matters', field: 'reference' },
  'case_reference': { entity: 'matters', field: 'reference' },
  'matter_ref': { entity: 'matters', field: 'reference' },
  'title': { entity: 'matters', field: 'title' },
  'name': { entity: 'matters', field: 'title' },
  'matter_name': { entity: 'matters', field: 'title' },
  'type': { entity: 'matters', field: 'ip_type' },
  'ip_type': { entity: 'matters', field: 'ip_type' },
  'matter_type': { entity: 'matters', field: 'ip_type' },
  'status': { entity: 'matters', field: 'status' },
  'legal_status': { entity: 'matters', field: 'status' },
  'filing_date': { entity: 'matters', field: 'filing_date' },
  'application_date': { entity: 'matters', field: 'filing_date' },
  'filed': { entity: 'matters', field: 'filing_date' },
  'grant_date': { entity: 'matters', field: 'grant_date' },
  'registration_date': { entity: 'matters', field: 'grant_date' },
  'granted': { entity: 'matters', field: 'grant_date' },
  'expiry_date': { entity: 'matters', field: 'expiry_date' },
  'expiration': { entity: 'matters', field: 'expiry_date' },
  'expires': { entity: 'matters', field: 'expiry_date' },
  'next_renewal': { entity: 'matters', field: 'expiry_date' },
  'application_number': { entity: 'matters', field: 'application_number' },
  'app_no': { entity: 'matters', field: 'application_number' },
  'registration_number': { entity: 'matters', field: 'registration_number' },
  'reg_no': { entity: 'matters', field: 'registration_number' },
  'country': { entity: 'matters', field: 'country_code' },
  'country_code': { entity: 'matters', field: 'country_code' },
  'jurisdiction': { entity: 'matters', field: 'country_code' },
  'classes': { entity: 'matters', field: 'classes' },
  'nice_classes': { entity: 'matters', field: 'classes' },
  'class': { entity: 'matters', field: 'classes' },
  'description': { entity: 'matters', field: 'description' },
  'notes': { entity: 'matters', field: 'notes' },
  'comments': { entity: 'matters', field: 'notes' },
  
  // Contacts
  'contact_name': { entity: 'contacts', field: 'name' },
  'full_name': { entity: 'contacts', field: 'name' },
  'client_name': { entity: 'contacts', field: 'name' },
  'owner_name': { entity: 'contacts', field: 'name' },
  'applicant': { entity: 'contacts', field: 'name' },
  'email': { entity: 'contacts', field: 'email' },
  'email_address': { entity: 'contacts', field: 'email' },
  'phone': { entity: 'contacts', field: 'phone' },
  'telephone': { entity: 'contacts', field: 'phone' },
  'tel': { entity: 'contacts', field: 'phone' },
  'company': { entity: 'contacts', field: 'company_name' },
  'company_name': { entity: 'contacts', field: 'company_name' },
  'organization': { entity: 'contacts', field: 'company_name' },
  'role': { entity: 'contacts', field: 'job_title' },
  'job_title': { entity: 'contacts', field: 'job_title' },
  'position': { entity: 'contacts', field: 'job_title' },
  'address': { entity: 'contacts', field: 'address_line1' },
  'tax_id': { entity: 'contacts', field: 'tax_id' },
  'vat': { entity: 'contacts', field: 'tax_id' },
  'nif': { entity: 'contacts', field: 'tax_id' },
  'cif': { entity: 'contacts', field: 'tax_id' },
};

function inferFieldType(values: unknown[]): string {
  const nonEmpty = values.filter(v => v !== null && v !== undefined && v !== '');
  if (nonEmpty.length === 0) return 'string';
  
  const sample = nonEmpty[0];
  
  // Check if all values are numbers
  if (nonEmpty.every(v => !isNaN(Number(v)))) {
    return 'number';
  }
  
  // Check if values look like dates
  const datePatterns = [
    /^\d{4}-\d{2}-\d{2}/,
    /^\d{2}\/\d{2}\/\d{4}/,
    /^\d{2}-\d{2}-\d{4}/,
  ];
  if (nonEmpty.every(v => datePatterns.some(p => p.test(String(v))))) {
    return 'date';
  }
  
  // Check if it's a boolean
  if (nonEmpty.every(v => ['true', 'false', '0', '1', 'yes', 'no', 'si', 'sí'].includes(String(v).toLowerCase()))) {
    return 'boolean';
  }
  
  // Check if it's an array
  if (Array.isArray(sample)) {
    return 'array';
  }
  
  // Check if values contain commas (might be a list)
  if (nonEmpty.some(v => String(v).includes(','))) {
    return 'array';
  }
  
  return 'string';
}

function analyzeFields(sourceData: Record<string, unknown>[]): {
  fields: Array<{
    sourceField: string;
    sourceType: string;
    sampleValues: string[];
    suggestedMapping: {
      targetEntity: string;
      targetField: string;
      confidence: number;
      reasoning: string;
    };
    alternativeMappings: Array<{
      targetEntity: string;
      targetField: string;
      confidence: number;
    }>;
    transformationRequired: boolean;
    suggestedTransformation?: {
      type: string;
      config: Record<string, unknown>;
    };
    warnings: string[];
  }>;
  overallConfidence: number;
  unmappedFields: string[];
  potentialIssues: Array<{
    severity: 'low' | 'medium' | 'high';
    message: string;
    affectedFields: string[];
    suggestion: string;
  }>;
  estimatedMigrationTime: number;
  dataQualityScore: number;
} {
  if (!sourceData || sourceData.length === 0) {
    return {
      fields: [],
      overallConfidence: 0,
      unmappedFields: [],
      potentialIssues: [{ severity: 'high', message: 'No hay datos para analizar', affectedFields: [], suggestion: 'Carga datos válidos' }],
      estimatedMigrationTime: 0,
      dataQualityScore: 0
    };
  }

  const columns = Object.keys(sourceData[0] || {});
  const fields: ReturnType<typeof analyzeFields>['fields'] = [];
  const unmappedFields: string[] = [];
  const potentialIssues: ReturnType<typeof analyzeFields>['potentialIssues'] = [];
  let totalConfidence = 0;
  let nullCount = 0;
  let totalValues = 0;

  for (const col of columns) {
    const values = sourceData.map(row => row[col]);
    const nonEmptyValues = values.filter(v => v !== null && v !== undefined && v !== '');
    const sampleValues = [...new Set(nonEmptyValues.map(v => String(v).substring(0, 50)))].slice(0, 5);
    const fieldType = inferFieldType(values);
    
    // Track data quality
    totalValues += values.length;
    nullCount += values.length - nonEmptyValues.length;

    // Normalize column name for matching
    const normalizedCol = col.toLowerCase().replace(/[^a-z0-9]/g, '_');
    
    // Find best match
    let bestMatch: { entity: string; field: string } | null = null;
    let confidence = 0;
    let reasoning = '';
    const warnings: string[] = [];
    const alternativeMappings: Array<{ targetEntity: string; targetField: string; confidence: number }> = [];

    // Check exact match in common mappings
    if (COMMON_MAPPINGS[normalizedCol]) {
      bestMatch = COMMON_MAPPINGS[normalizedCol];
      confidence = 0.95;
      reasoning = `Coincidencia exacta del nombre del campo "${col}" con el campo estándar "${bestMatch.field}"`;
    } else {
      // Check partial matches
      for (const [key, mapping] of Object.entries(COMMON_MAPPINGS)) {
        if (normalizedCol.includes(key) || key.includes(normalizedCol)) {
          const matchConfidence = 0.7;
          if (!bestMatch || matchConfidence > confidence) {
            if (bestMatch) {
              alternativeMappings.push({
                targetEntity: bestMatch.entity,
                targetField: bestMatch.field,
                confidence
              });
            }
            bestMatch = mapping;
            confidence = matchConfidence;
            reasoning = `Coincidencia parcial: "${col}" contiene "${key}"`;
          } else if (matchConfidence > 0.5) {
            alternativeMappings.push({
              targetEntity: mapping.entity,
              targetField: mapping.field,
              confidence: matchConfidence
            });
          }
        }
      }
    }

    // Check by field type patterns
    if (!bestMatch) {
      if (fieldType === 'date' && normalizedCol.includes('fecha')) {
        bestMatch = { entity: 'matters', field: 'filing_date' };
        confidence = 0.5;
        reasoning = 'Campo de tipo fecha detectado';
        alternativeMappings.push(
          { targetEntity: 'matters', targetField: 'grant_date', confidence: 0.4 },
          { targetEntity: 'matters', targetField: 'expiry_date', confidence: 0.4 }
        );
      } else if (fieldType === 'number' && (normalizedCol.includes('importe') || normalizedCol.includes('amount') || normalizedCol.includes('coste'))) {
        bestMatch = { entity: 'costs', field: 'amount' };
        confidence = 0.7;
        reasoning = 'Campo numérico relacionado con importes';
      }
    }

    // Add warnings
    if (nonEmptyValues.length / values.length < 0.5) {
      warnings.push(`Más del 50% de valores vacíos (${Math.round((1 - nonEmptyValues.length / values.length) * 100)}%)`);
    }
    if (sampleValues.length === 1 && values.length > 10) {
      warnings.push('Todos los valores son iguales');
    }

    if (bestMatch) {
      totalConfidence += confidence;
      
      // Check if transformation is needed
      let transformationRequired = false;
      let suggestedTransformation: { type: string; config: Record<string, unknown> } | undefined;
      
      if (bestMatch.field === 'ip_type' || bestMatch.field === 'status') {
        transformationRequired = true;
        suggestedTransformation = {
          type: 'value_map',
          config: { mappings: {} }
        };
      }

      fields.push({
        sourceField: col,
        sourceType: fieldType,
        sampleValues,
        suggestedMapping: {
          targetEntity: bestMatch.entity,
          targetField: bestMatch.field,
          confidence,
          reasoning
        },
        alternativeMappings: alternativeMappings.slice(0, 3),
        transformationRequired,
        suggestedTransformation,
        warnings
      });
    } else {
      unmappedFields.push(col);
      fields.push({
        sourceField: col,
        sourceType: fieldType,
        sampleValues,
        suggestedMapping: {
          targetEntity: '',
          targetField: '',
          confidence: 0,
          reasoning: 'No se encontró un campo destino apropiado'
        },
        alternativeMappings: [],
        transformationRequired: false,
        warnings
      });
    }
  }

  // Add potential issues
  if (unmappedFields.length > columns.length * 0.3) {
    potentialIssues.push({
      severity: 'medium',
      message: `${unmappedFields.length} campos no pudieron ser mapeados automáticamente`,
      affectedFields: unmappedFields.slice(0, 5),
      suggestion: 'Revisa estos campos manualmente o considera si son necesarios'
    });
  }

  if (nullCount / totalValues > 0.3) {
    potentialIssues.push({
      severity: 'low',
      message: 'Alto porcentaje de valores vacíos en los datos',
      affectedFields: [],
      suggestion: 'Considera limpiar los datos antes de migrar'
    });
  }

  const mappedCount = fields.filter(f => f.suggestedMapping.confidence > 0).length;
  const overallConfidence = mappedCount > 0 ? totalConfidence / mappedCount : 0;
  const dataQualityScore = Math.round((1 - nullCount / totalValues) * 100);
  const estimatedMigrationTime = Math.ceil(sourceData.length / 100) + 5; // Rough estimate

  return {
    fields,
    overallConfidence,
    unmappedFields,
    potentialIssues,
    estimatedMigrationTime,
    dataQualityScore
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { sourceSystem, sourceData } = await req.json();

    console.log(`Analyzing mapping for ${sourceSystem} with ${sourceData?.length || 0} rows`);

    // Try to use OpenAI if available, otherwise use heuristic
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (openaiApiKey && sourceData?.length > 0) {
      try {
        // Extract columns and sample values
        const columns = Object.keys(sourceData[0] || {});
        const samplesByColumn: Record<string, string[]> = {};
        
        columns.forEach(col => {
          const values = sourceData
            .slice(0, 10)
            .map((row: Record<string, unknown>) => row[col])
            .filter((v: unknown) => v !== null && v !== undefined && v !== '')
            .map((v: unknown) => String(v).substring(0, 100));
          samplesByColumn[col] = [...new Set(values as string[])].slice(0, 5);
        });

        const prompt = `Eres un experto en migración de datos de propiedad intelectual. Analiza los campos de origen y sugiere el mejor mapeo hacia el schema de IP-NEXUS.

## Sistema origen: ${sourceSystem}

## Campos a analizar:
${columns.map(col => `- **${col}**: Ejemplos: [${samplesByColumn[col].join(', ')}]`).join('\n')}

## Schema de IP-NEXUS:
${JSON.stringify(IP_NEXUS_SCHEMA, null, 2)}

Responde con un JSON válido con esta estructura:
{
  "fields": [
    {
      "sourceField": "nombre_campo_origen",
      "sourceType": "string|number|date|boolean|array",
      "sampleValues": ["valor1", "valor2"],
      "suggestedMapping": {
        "targetEntity": "matters|contacts|deadlines|costs",
        "targetField": "nombre_campo_destino",
        "confidence": 0.95,
        "reasoning": "Explicación breve"
      },
      "alternativeMappings": [],
      "transformationRequired": false,
      "warnings": []
    }
  ],
  "overallConfidence": 0.85,
  "unmappedFields": [],
  "potentialIssues": [],
  "estimatedMigrationTime": 15,
  "dataQualityScore": 85
}`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4-turbo-preview',
            messages: [
              { role: 'system', content: 'Eres un asistente de migración de datos. Responde solo con JSON válido.' },
              { role: 'user', content: prompt },
            ],
            temperature: 0.3,
            response_format: { type: 'json_object' },
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const result = JSON.parse(data.choices[0].message.content || '{}');
          
          return new Response(JSON.stringify(result), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      } catch (aiError) {
        console.error('AI analysis failed, falling back to heuristic:', aiError);
      }
    }

    // Fallback to heuristic analysis
    const result = analyzeFields(sourceData || []);

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
