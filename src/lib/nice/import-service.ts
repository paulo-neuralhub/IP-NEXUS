// ============================================================
// IP-NEXUS - Nice Classification Import Service
// Handles importing data from WIPO into Supabase
// ============================================================

import { supabase } from '@/integrations/supabase/client';
import { parseWIPOText, splitMultipleClasses, validateParsedClass } from './wipo-parser';
import type { NiceImportResult, NiceClassWithCount } from '@/types/nice-classification';

/**
 * Import a single Nice class from raw WIPO text
 */
export async function importNiceClass(rawText: string): Promise<NiceImportResult> {
  const parsed = parseWIPOText(rawText);
  
  if (!parsed) {
    return {
      success: false,
      class_number: 0,
      items_imported: 0,
      errors: ['No se pudo parsear el texto. Verifica el formato WIPO.']
    };
  }
  
  // Validate parsed data
  const validationErrors = validateParsedClass(parsed);
  if (validationErrors.length > 0 && parsed.items.length === 0) {
    return {
      success: false,
      class_number: parsed.class_number,
      items_imported: 0,
      errors: validationErrors
    };
  }
  
  try {
    // Update class with explanatory note and includes/excludes
    const { error: classError } = await supabase
      .from('nice_classes')
      .update({
        explanatory_note_en: parsed.explanatory_note || null,
        includes_en: parsed.includes.length > 0 ? parsed.includes : null,
        excludes_en: parsed.excludes.length > 0 ? parsed.excludes : null,
        updated_at: new Date().toISOString()
      })
      .eq('class_number', parsed.class_number);
    
    if (classError) {
      console.warn('Error updating class metadata:', classError);
    }
    
    // Prepare items for upsert
    const itemsToInsert = parsed.items.map(item => ({
      class_number: parsed.class_number,
      item_code: item.code,
      item_name_en: item.name,
      alternate_names: item.alternate_names.length > 0 ? item.alternate_names : null,
      is_generic_term: item.is_generic
    }));
    
    // Insert in batches to avoid timeouts
    let totalInserted = 0;
    const batchSize = 100;
    const errors: string[] = [];
    
    for (let i = 0; i < itemsToInsert.length; i += batchSize) {
      const batch = itemsToInsert.slice(i, i + batchSize);
      
      const { data, error } = await supabase
        .from('nice_class_items')
        .upsert(batch, { onConflict: 'class_number,item_code' })
        .select('id');
      
      if (error) {
        errors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${error.message}`);
      } else {
        totalInserted += data?.length || batch.length;
      }
    }
    
    // Log the import
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('nice_import_log').insert({
      class_number: parsed.class_number,
      items_imported: totalInserted,
      status: errors.length > 0 ? 'partial' : 'completed',
      imported_by: user?.id,
      metadata: {
        validation_errors: validationErrors,
        import_errors: errors
      }
    });
    
    return {
      success: errors.length === 0,
      class_number: parsed.class_number,
      items_imported: totalInserted,
      errors: [...validationErrors.filter(e => e !== 'No se encontraron productos/servicios'), ...errors]
    };
    
  } catch (error: any) {
    return {
      success: false,
      class_number: parsed.class_number,
      items_imported: 0,
      errors: [`Error inesperado: ${error.message}`]
    };
  }
}

/**
 * Import multiple classes from a single text block
 */
export async function importMultipleClasses(rawText: string): Promise<NiceImportResult[]> {
  const sections = splitMultipleClasses(rawText);
  const results: NiceImportResult[] = [];
  
  for (const section of sections) {
    const result = await importNiceClass(section);
    results.push(result);
    
    // Small delay between classes to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return results;
}

/**
 * Get import status for all classes
 */
export async function getImportStatus(): Promise<NiceClassWithCount[]> {
  // Get all classes
  const { data: classes, error: classesError } = await supabase
    .from('nice_classes')
    .select('id, class_number, class_type, title_en, title_es')
    .order('class_number');
  
  if (classesError) {
    console.error('Error fetching classes:', classesError);
    return [];
  }
  
  // Get item counts per class
  const { data: items, error: itemsError } = await supabase
    .from('nice_class_items')
    .select('class_number');
  
  if (itemsError) {
    console.error('Error fetching items:', itemsError);
  }
  
  // Count items per class
  const counts: Record<number, number> = {};
  items?.forEach(item => {
    counts[item.class_number] = (counts[item.class_number] || 0) + 1;
  });
  
  // Combine data
  return (classes || []).map(c => ({
    ...c,
    includes_en: [],
    includes_es: [],
    excludes_en: [],
    excludes_es: [],
    created_at: '',
    updated_at: '',
    items_count: counts[c.class_number] || 0,
    imported: (counts[c.class_number] || 0) > 0
  })) as NiceClassWithCount[];
}

/**
 * Get import history for a class
 */
export async function getImportHistory(classNumber?: number) {
  let query = supabase
    .from('nice_import_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);
  
  if (classNumber) {
    query = query.eq('class_number', classNumber);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching import history:', error);
    return [];
  }
  
  return data || [];
}

/**
 * Clear all items for a class (for re-import)
 */
export async function clearClassItems(classNumber: number): Promise<boolean> {
  const { error } = await supabase
    .from('nice_class_items')
    .delete()
    .eq('class_number', classNumber);
  
  if (error) {
    console.error('Error clearing class items:', error);
    return false;
  }
  
  return true;
}
