// src/lib/templates/seed-document-templates.ts
// Seeder function to insert all document templates into the database

import { supabase } from '@/integrations/supabase/client';
import { getAllTemplateDefinitions } from './html-templates';

export interface SeedResult {
  success: boolean;
  inserted: number;
  updated: number;
  errors: string[];
}

/**
 * Seeds the document_templates table with all 20 system templates
 * (5 styles × 4 document types)
 */
export async function seedDocumentTemplates(): Promise<SeedResult> {
  const result: SeedResult = {
    success: true,
    inserted: 0,
    updated: 0,
    errors: [],
  };

  const templates = getAllTemplateDefinitions();

  for (const template of templates) {
    try {
      // Check if template already exists
      const { data: existing } = await supabase
        .from('document_templates')
        .select('id')
        .eq('code', template.code)
        .is('organization_id', null)
        .single();

      const templateData = {
        code: template.code,
        name: template.name,
        description: template.description,
        document_type: template.document_type,
        style: template.style,
        category: template.category,
        content_html: template.content_html,
        template_content: template.content_html, // Required field
        is_system_template: true,
        is_active: true,
        is_default: template.style === 'classic', // Classic is default
        organization_id: null,
        layout: template.style,
        show_logo: true,
        show_header: true,
        show_footer: true,
      };

      if (existing) {
        // Update existing template
        const { error } = await supabase
          .from('document_templates')
          .update({
            ...templateData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);

        if (error) {
          result.errors.push(`Update ${template.code}: ${error.message}`);
        } else {
          result.updated++;
        }
      } else {
        // Insert new template
        const { error } = await supabase
          .from('document_templates')
          .insert(templateData);

        if (error) {
          result.errors.push(`Insert ${template.code}: ${error.message}`);
        } else {
          result.inserted++;
        }
      }
    } catch (err) {
      result.errors.push(`${template.code}: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }

  result.success = result.errors.length === 0;
  return result;
}

/**
 * Clears all system templates (for re-seeding)
 */
export async function clearSystemTemplates(): Promise<{ success: boolean; deleted: number }> {
  const { data, error } = await supabase
    .from('document_templates')
    .delete()
    .eq('is_system_template', true)
    .is('organization_id', null)
    .select('id');

  if (error) {
    console.error('Error clearing templates:', error);
    return { success: false, deleted: 0 };
  }

  return { success: true, deleted: data?.length || 0 };
}

/**
 * Resets and re-seeds all templates
 */
export async function resetAndSeedTemplates(): Promise<SeedResult> {
  await clearSystemTemplates();
  return seedDocumentTemplates();
}
