// ============================================================
// IP-NEXUS - COMPLIANCE CHECKS HOOKS
// ============================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/hooks/useOrganization';
import type { 
  ComplianceCheck, 
  ComplianceFramework, 
  ComplianceStatus,
  ComplianceStats 
} from '@/types/audit';

// ==========================================
// COMPLIANCE CHECKS
// ==========================================

export function useComplianceChecks(framework?: ComplianceFramework) {
  const { currentOrganization } = useOrganization();

  return useQuery({
    queryKey: ['compliance-checks', currentOrganization?.id, framework],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];

      let query = supabase
        .from('compliance_checks')
        .select('*')
        .eq('organization_id', currentOrganization.id);

      if (framework) {
        query = query.eq('framework', framework);
      }

      const { data, error } = await query.order('check_code');

      if (error) throw error;
      return data as ComplianceCheck[];
    },
    enabled: !!currentOrganization?.id,
  });
}

export function useComplianceCheck(checkId: string | undefined) {
  return useQuery({
    queryKey: ['compliance-check', checkId],
    queryFn: async () => {
      if (!checkId) return null;

      const { data, error } = await supabase
        .from('compliance_checks')
        .select('*')
        .eq('id', checkId)
        .single();

      if (error) throw error;
      return data as ComplianceCheck;
    },
    enabled: !!checkId,
  });
}

export function usePendingReviewChecks() {
  const { currentOrganization } = useOrganization();

  return useQuery({
    queryKey: ['pending-compliance-checks', currentOrganization?.id],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];

      const { data, error } = await supabase
        .from('compliance_checks')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .eq('status', 'pending_review')
        .order('next_review_at');

      if (error) throw error;
      return data as ComplianceCheck[];
    },
    enabled: !!currentOrganization?.id,
  });
}

export function useNonCompliantChecks() {
  const { currentOrganization } = useOrganization();

  return useQuery({
    queryKey: ['non-compliant-checks', currentOrganization?.id],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];

      const { data, error } = await supabase
        .from('compliance_checks')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .in('status', ['non_compliant', 'partial'])
        .order('remediation_due_date');

      if (error) throw error;
      return data as ComplianceCheck[];
    },
    enabled: !!currentOrganization?.id,
  });
}

// ==========================================
// MUTATIONS
// ==========================================

export function useCreateComplianceCheck() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();

  return useMutation({
    mutationFn: async (check: {
      framework: ComplianceFramework;
      check_code: string;
      check_name: string;
      check_description?: string;
      category?: string;
      status?: ComplianceStatus;
    }) => {
      if (!currentOrganization?.id) throw new Error('No organization selected');

      const { data, error } = await supabase
        .from('compliance_checks')
        .insert({
          organization_id: currentOrganization.id,
          framework: check.framework,
          check_code: check.check_code,
          check_name: check.check_name,
          check_description: check.check_description,
          category: check.category,
          status: check.status || 'pending_review',
        })
        .select()
        .single();

      if (error) throw error;
      return data as ComplianceCheck;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compliance-checks'] });
      queryClient.invalidateQueries({ queryKey: ['compliance-stats'] });
    },
  });
}

export function useUpdateComplianceCheck() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<ComplianceCheck> & { id: string }) => {
      const { data, error } = await supabase
        .from('compliance_checks')
        .update({
          ...updates,
          last_checked_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as ComplianceCheck;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['compliance-checks'] });
      queryClient.invalidateQueries({ queryKey: ['compliance-check', data.id] });
      queryClient.invalidateQueries({ queryKey: ['pending-compliance-checks'] });
      queryClient.invalidateQueries({ queryKey: ['non-compliant-checks'] });
      queryClient.invalidateQueries({ queryKey: ['compliance-stats'] });
    },
  });
}

export function useDeleteComplianceCheck() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (checkId: string) => {
      const { error } = await supabase
        .from('compliance_checks')
        .delete()
        .eq('id', checkId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compliance-checks'] });
      queryClient.invalidateQueries({ queryKey: ['compliance-stats'] });
    },
  });
}

// ==========================================
// RUN COMPLIANCE CHECK
// ==========================================

export function useRunComplianceCheck() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();

  return useMutation({
    mutationFn: async (framework: ComplianceFramework) => {
      if (!currentOrganization?.id) throw new Error('No organization selected');

      // Get predefined checks for the framework
      const predefinedChecks = getPredefiedChecks(framework);

      // Upsert checks
      const results: ComplianceCheck[] = [];

      for (const check of predefinedChecks) {
        const { data, error } = await supabase
          .from('compliance_checks')
          .upsert({
            organization_id: currentOrganization.id,
            framework,
            check_code: check.code,
            check_name: check.name,
            check_description: check.description,
            category: check.category,
            status: 'pending_review',
            last_checked_at: new Date().toISOString(),
          }, {
            onConflict: 'organization_id,framework,check_code',
          })
          .select()
          .single();

        if (!error && data) {
          results.push(data as ComplianceCheck);
        }
      }

      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compliance-checks'] });
      queryClient.invalidateQueries({ queryKey: ['compliance-stats'] });
    },
  });
}

// Predefined checks per framework
function getPredefiedChecks(framework: ComplianceFramework) {
  const checks: Record<ComplianceFramework, Array<{ code: string; name: string; description: string; category: string }>> = {
    gdpr: [
      { code: 'GDPR-01', name: 'Consentimiento documentado', description: 'Los usuarios deben proporcionar consentimiento explícito para el tratamiento de datos', category: 'consent' },
      { code: 'GDPR-02', name: 'Derecho de acceso implementado', description: 'Los usuarios pueden acceder a sus datos personales', category: 'rights' },
      { code: 'GDPR-03', name: 'Derecho de borrado implementado', description: 'Los usuarios pueden solicitar la eliminación de sus datos', category: 'rights' },
      { code: 'GDPR-04', name: 'Registro de actividades de tratamiento', description: 'Se mantiene un registro de todas las actividades de tratamiento de datos', category: 'accountability' },
      { code: 'GDPR-05', name: 'Políticas de retención definidas', description: 'Existen políticas claras de retención y eliminación de datos', category: 'data_management' },
      { code: 'GDPR-06', name: 'Notificación de brechas', description: 'Existe un proceso para notificar brechas de seguridad en 72 horas', category: 'security' },
      { code: 'GDPR-07', name: 'DPO designado', description: 'Se ha designado un Delegado de Protección de Datos si es requerido', category: 'organization' },
    ],
    soc2: [
      { code: 'SOC2-CC6.1', name: 'Control de acceso lógico', description: 'Controles de acceso implementados para proteger sistemas', category: 'access' },
      { code: 'SOC2-CC6.2', name: 'Autenticación de usuarios', description: 'Mecanismos robustos de autenticación implementados', category: 'access' },
      { code: 'SOC2-CC6.3', name: 'Gestión de credenciales', description: 'Políticas de contraseñas y credenciales establecidas', category: 'access' },
      { code: 'SOC2-CC7.1', name: 'Detección de incidentes', description: 'Sistemas de detección de incidentes de seguridad', category: 'security' },
      { code: 'SOC2-CC7.2', name: 'Monitoreo de sistemas', description: 'Monitoreo continuo de la infraestructura', category: 'security' },
      { code: 'SOC2-CC8.1', name: 'Gestión de cambios', description: 'Proceso formal de gestión de cambios', category: 'operations' },
    ],
    iso27001: [
      { code: 'ISO-A5', name: 'Políticas de seguridad', description: 'Políticas de seguridad de la información documentadas', category: 'policies' },
      { code: 'ISO-A6', name: 'Organización de la seguridad', description: 'Estructura organizativa de seguridad definida', category: 'organization' },
      { code: 'ISO-A7', name: 'Seguridad de recursos humanos', description: 'Controles de seguridad para empleados', category: 'hr' },
      { code: 'ISO-A8', name: 'Gestión de activos', description: 'Inventario y clasificación de activos', category: 'assets' },
      { code: 'ISO-A9', name: 'Control de acceso', description: 'Políticas y procedimientos de control de acceso', category: 'access' },
      { code: 'ISO-A12', name: 'Seguridad de operaciones', description: 'Procedimientos operativos de seguridad', category: 'operations' },
    ],
    hipaa: [
      { code: 'HIPAA-164.308', name: 'Salvaguardas administrativas', description: 'Políticas y procedimientos administrativos de seguridad', category: 'administrative' },
      { code: 'HIPAA-164.310', name: 'Salvaguardas físicas', description: 'Controles de acceso físico implementados', category: 'physical' },
      { code: 'HIPAA-164.312', name: 'Salvaguardas técnicas', description: 'Controles técnicos de seguridad', category: 'technical' },
    ],
    internal: [
      { code: 'INT-01', name: 'Política de contraseñas', description: 'Política de contraseñas robusta implementada', category: 'access' },
      { code: 'INT-02', name: 'Backups regulares', description: 'Backups automatizados y verificados', category: 'operations' },
      { code: 'INT-03', name: 'Actualizaciones de seguridad', description: 'Proceso de aplicación de parches de seguridad', category: 'security' },
    ],
  };

  return checks[framework] || [];
}

// ==========================================
// COMPLIANCE STATS
// ==========================================

export function useComplianceStats() {
  const { currentOrganization } = useOrganization();

  return useQuery({
    queryKey: ['compliance-stats', currentOrganization?.id],
    queryFn: async (): Promise<ComplianceStats> => {
      if (!currentOrganization?.id) {
        return {
          total_checks: 0,
          compliant: 0,
          non_compliant: 0,
          partial: 0,
          pending_review: 0,
          compliance_percentage: 0,
          by_framework: {},
        };
      }

      const { data: checks } = await supabase
        .from('compliance_checks')
        .select('framework, status')
        .eq('organization_id', currentOrganization.id);

      const stats = {
        total_checks: checks?.length || 0,
        compliant: 0,
        non_compliant: 0,
        partial: 0,
        pending_review: 0,
        by_framework: {} as Record<string, { total: number; compliant: number; percentage: number }>,
      };

      (checks || []).forEach((check) => {
        // Count by status
        if (check.status === 'compliant') stats.compliant++;
        else if (check.status === 'non_compliant') stats.non_compliant++;
        else if (check.status === 'partial') stats.partial++;
        else if (check.status === 'pending_review') stats.pending_review++;

        // Count by framework
        if (!stats.by_framework[check.framework]) {
          stats.by_framework[check.framework] = { total: 0, compliant: 0, percentage: 0 };
        }
        stats.by_framework[check.framework].total++;
        if (check.status === 'compliant') {
          stats.by_framework[check.framework].compliant++;
        }
      });

      // Calculate percentages
      Object.keys(stats.by_framework).forEach((framework) => {
        const fw = stats.by_framework[framework];
        fw.percentage = fw.total > 0 ? Math.round((fw.compliant / fw.total) * 100) : 0;
      });

      const applicableChecks = stats.total_checks - (checks?.filter(c => c.status === 'not_applicable').length || 0);
      stats.compliance_percentage = applicableChecks > 0 
        ? Math.round((stats.compliant / applicableChecks) * 100) 
        : 0;

      return stats;
    },
    enabled: !!currentOrganization?.id,
  });
}
