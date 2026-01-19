// supabase/functions/filing-validate/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ValidationError {
  field: string;
  code: string;
  message: string;
}

interface ValidationWarning {
  field: string;
  code: string;
  message: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { filingId } = await req.json();

    if (!filingId) {
      return new Response(
        JSON.stringify({ error: 'filingId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get filing with trademark data
    const { data: filing, error: filingError } = await supabase
      .from('filing_applications')
      .select(`
        *,
        trademark_data:filing_trademark_data(*)
      `)
      .eq('id', filingId)
      .single();

    if (filingError || !filing) {
      return new Response(
        JSON.stringify({ error: 'Filing not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    const tmData = filing.trademark_data?.[0];
    const applicant = filing.applicant_data;

    // ============================================
    // COMMON VALIDATIONS
    // ============================================

    // Applicant validations
    if (!applicant?.name?.trim()) {
      errors.push({
        field: 'applicant.name',
        code: 'REQUIRED_FIELD',
        message: 'El nombre del solicitante es obligatorio',
      });
    }

    if (!applicant?.country) {
      errors.push({
        field: 'applicant.country',
        code: 'REQUIRED_FIELD',
        message: 'El país del solicitante es obligatorio',
      });
    }

    // ============================================
    // TRADEMARK VALIDATIONS
    // ============================================

    if (filing.ip_type === 'trademark') {
      if (!tmData) {
        errors.push({
          field: 'trademark_data',
          code: 'REQUIRED_FIELD',
          message: 'Faltan los datos de la marca',
        });
      } else {
        // Mark type
        const validMarkTypes = ['word', 'figurative', 'combined', 'shape_3d', 'sound', 'motion', 'multimedia', 'hologram', 'position', 'pattern', 'color'];
        if (!validMarkTypes.includes(tmData.mark_type)) {
          errors.push({
            field: 'mark_type',
            code: 'INVALID_VALUE',
            message: 'Tipo de marca no válido',
          });
        }

        // Text required for word marks
        if (['word', 'combined'].includes(tmData.mark_type) && !tmData.mark_text?.trim()) {
          errors.push({
            field: 'mark_text',
            code: 'REQUIRED_FIELD',
            message: 'El texto de la marca es obligatorio para este tipo',
          });
        }

        // Image required for figurative
        if (['figurative', 'combined', 'shape_3d'].includes(tmData.mark_type) && !tmData.mark_image_file_id) {
          errors.push({
            field: 'mark_image',
            code: 'REQUIRED_FIELD',
            message: 'La imagen es obligatoria para este tipo de marca',
          });
        }

        // Nice classes
        if (!tmData.nice_classes?.length) {
          errors.push({
            field: 'nice_classes',
            code: 'REQUIRED_FIELD',
            message: 'Debe seleccionar al menos una clase Nice',
          });
        }

        // Goods/services per class
        for (const classNum of tmData.nice_classes || []) {
          if (!tmData.goods_services?.[classNum]?.trim()) {
            errors.push({
              field: `goods_services.${classNum}`,
              code: 'REQUIRED_FIELD',
              message: `Debe especificar productos/servicios para la clase ${classNum}`,
            });
          }
        }

        // ============================================
        // OFFICE-SPECIFIC VALIDATIONS
        // ============================================

        // EUIPO specific
        if (filing.office_code === 'EM') {
          if (!tmData.second_language) {
            errors.push({
              field: 'second_language',
              code: 'REQUIRED_FIELD',
              message: 'EUIPO requiere un segundo idioma',
            });
          }
        }

        // OEPM specific
        if (filing.office_code === 'ES') {
          if (applicant.country === 'ES' && !applicant.tax_id) {
            errors.push({
              field: 'applicant.tax_id',
              code: 'REQUIRED_FIELD',
              message: 'El NIF/CIF es obligatorio para solicitantes españoles',
            });
          }
        }

        // Warnings
        if (tmData.nice_classes?.length > 3) {
          warnings.push({
            field: 'nice_classes',
            code: 'MULTIPLE_CLASSES',
            message: 'Más de 3 clases incrementará las tasas significativamente',
          });
        }

        if (!filing.representative_data) {
          warnings.push({
            field: 'representative',
            code: 'NO_REPRESENTATIVE',
            message: 'Se recomienda designar un representante para el seguimiento',
          });
        }
      }
    }

    // ============================================
    // UPDATE FILING
    // ============================================

    const isValid = errors.length === 0;

    await supabase
      .from('filing_applications')
      .update({
        validation_status: isValid ? 'passed' : 'failed',
        validation_errors: errors,
        validation_warnings: warnings,
        validated_at: new Date().toISOString(),
        status: isValid ? 'ready' : 'draft',
      })
      .eq('id', filingId);

    console.log(`Validation for ${filingId}: ${isValid ? 'PASSED' : 'FAILED'} (${errors.length} errors, ${warnings.length} warnings)`);

    return new Response(
      JSON.stringify({
        isValid,
        errors,
        warnings,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Validation error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
