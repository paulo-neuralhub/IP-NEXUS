import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { connectionId, projectId, entities, options } = await req.json();

    if (!connectionId || !projectId) {
      throw new Error('connectionId and projectId are required');
    }

    console.log(`Starting live migration from connection: ${connectionId}`);
    console.log(`Project: ${projectId}, Entities: ${entities?.join(', ')}`);

    // Get connection details
    const { data: connection, error: connError } = await supabase
      .from('migration_connections')
      .select('*')
      .eq('id', connectionId)
      .single();

    if (connError || !connection) {
      throw new Error('Connection not found');
    }

    // Get project
    const { data: project, error: projError } = await supabase
      .from('migration_projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (projError || !project) {
      throw new Error('Project not found');
    }

    // Update project status
    await supabase
      .from('migration_projects')
      .update({ 
        status: 'in_progress',
        started_at: new Date().toISOString()
      })
      .eq('id', projectId);

    // Log migration start
    await supabase
      .from('migration_logs')
      .insert({
        project_id: projectId,
        log_type: 'info',
        message: `Live migration started from ${connection.name}`,
        details: { entities, options }
      });

    // Simulate live data extraction
    const extractedData = await simulateLiveExtraction(
      connection.system_type,
      entities || ['matters', 'contacts'],
      options
    );

    // Process and insert data
    let totalProcessed = 0;
    let totalCreated = 0;
    let totalFailed = 0;

    for (const entity of Object.keys(extractedData)) {
      const items = extractedData[entity];
      console.log(`Processing ${items.length} ${entity}...`);

      for (const item of items) {
        try {
          totalProcessed++;

          if (entity === 'matters') {
            // Transform and insert matter
            const { error } = await supabase
              .from('matters')
              .insert({
                organization_id: project.organization_id,
                reference: item.reference || `MIG-${Date.now()}-${totalProcessed}`,
                title: item.title || item.name || 'Migrated Matter',
                type: mapMatterType(item.type),
                status: mapMatterStatus(item.status),
                filing_date: item.filing_date,
                registration_number: item.registration_number,
                nice_classes: item.classes || [],
                jurisdictions: item.jurisdictions || [item.country || 'ES'],
                metadata: { source: connection.system_type, original: item }
              });

            if (error) {
              console.error(`Error inserting matter: ${error.message}`);
              totalFailed++;
            } else {
              totalCreated++;
            }
          } else if (entity === 'contacts') {
            // Transform and insert contact
            const { error } = await supabase
              .from('contacts')
              .insert({
                organization_id: project.organization_id,
                owner_type: 'tenant',
                name: item.name || 'Unknown Contact',
                email: item.email,
                phone: item.phone,
                company_name: item.company,
                type: item.is_company ? 'company' : 'person',
                custom_fields: { source: connection.system_type, original: item }
              });

            if (error) {
              console.error(`Error inserting contact: ${error.message}`);
              totalFailed++;
            } else {
              totalCreated++;
            }
          }
        } catch (itemError) {
          console.error(`Error processing item: ${itemError}`);
          totalFailed++;
        }
      }

      // Log progress
      await supabase
        .from('migration_logs')
        .insert({
          project_id: projectId,
          log_type: 'info',
          message: `Processed ${items.length} ${entity}`,
          details: { entity, processed: items.length }
        });
    }

    // Update project with final stats
    await supabase
      .from('migration_projects')
      .update({
        status: totalFailed === 0 ? 'completed' : 'completed_with_errors',
        completed_at: new Date().toISOString(),
        stats: {
          total_records: totalProcessed,
          migrated: totalCreated,
          failed: totalFailed,
          skipped: 0
        }
      })
      .eq('id', projectId);

    // Log completion
    await supabase
      .from('migration_logs')
      .insert({
        project_id: projectId,
        log_type: totalFailed === 0 ? 'success' : 'warning',
        message: `Live migration completed. ${totalCreated} records created, ${totalFailed} failed.`,
        details: { total: totalProcessed, created: totalCreated, failed: totalFailed }
      });

    return new Response(JSON.stringify({
      success: true,
      message: 'Live migration completed',
      stats: {
        total_records: totalProcessed,
        migrated: totalCreated,
        failed: totalFailed
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: unknown) {
    console.error('Error in live migration:', error);
    const errorMessage = error instanceof Error ? error.message : 'Live migration failed';
    return new Response(JSON.stringify({ 
      success: false, 
      message: errorMessage
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

// =====================================================
// HELPER FUNCTIONS
// =====================================================

async function simulateLiveExtraction(
  systemType: string, 
  entities: string[], 
  options?: any
): Promise<Record<string, any[]>> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  const limit = options?.limit || 100;
  const result: Record<string, any[]> = {};

  for (const entity of entities) {
    if (entity === 'matters') {
      result.matters = generateSampleMatters(Math.min(limit, 50), systemType);
    } else if (entity === 'contacts') {
      result.contacts = generateSampleContacts(Math.min(limit, 30), systemType);
    } else if (entity === 'deadlines') {
      result.deadlines = generateSampleDeadlines(Math.min(limit, 20), systemType);
    }
  }

  return result;
}

function generateSampleMatters(count: number, source: string): any[] {
  const types = ['trademark', 'patent', 'design', 'copyright'];
  const statuses = ['active', 'pending', 'registered', 'expired'];
  const countries = ['ES', 'US', 'EP', 'CN', 'JP', 'GB', 'DE', 'FR'];

  return Array.from({ length: count }, (_, i) => ({
    reference: `${source.toUpperCase()}-${Date.now()}-${i + 1}`,
    title: `Migrated ${types[i % types.length]} ${i + 1}`,
    type: types[i % types.length],
    status: statuses[i % statuses.length],
    filing_date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000 * 5).toISOString(),
    registration_number: i % 3 === 0 ? `REG-${100000 + i}` : null,
    country: countries[i % countries.length],
    classes: [Math.floor(Math.random() * 45) + 1]
  }));
}

function generateSampleContacts(count: number, source: string): any[] {
  const names = ['John Smith', 'Maria García', 'Hans Mueller', 'Yuki Tanaka', 'Pierre Dubois'];
  const companies = ['TechCorp Inc', 'Innovation Labs', 'Global IP Services', 'Legal Partners', 'Patent Holdings'];

  return Array.from({ length: count }, (_, i) => ({
    name: names[i % names.length] + ` (${i + 1})`,
    email: `contact${i + 1}@example.com`,
    phone: `+1-555-${String(1000 + i).padStart(4, '0')}`,
    company: companies[i % companies.length],
    is_company: i % 4 === 0
  }));
}

function generateSampleDeadlines(count: number, source: string): any[] {
  return Array.from({ length: count }, (_, i) => ({
    title: `Deadline ${i + 1}`,
    due_date: new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    type: i % 2 === 0 ? 'renewal' : 'filing',
    priority: i % 3 === 0 ? 'high' : 'medium'
  }));
}

function mapMatterType(type: string): string {
  const typeMap: Record<string, string> = {
    'TM': 'trademark',
    'TRADEMARK': 'trademark',
    'PAT': 'patent',
    'PATENT': 'patent',
    'DES': 'design',
    'DESIGN': 'design',
    'CR': 'copyright',
    'COPYRIGHT': 'copyright'
  };
  return typeMap[type?.toUpperCase()] || type?.toLowerCase() || 'trademark';
}

function mapMatterStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'ACT': 'active',
    'ACTIVE': 'active',
    'PND': 'pending',
    'PENDING': 'pending',
    'REG': 'registered',
    'REGISTERED': 'registered',
    'EXP': 'expired',
    'EXPIRED': 'expired',
    'ABN': 'abandoned',
    'ABANDONED': 'abandoned'
  };
  return statusMap[status?.toUpperCase()] || status?.toLowerCase() || 'pending';
}
