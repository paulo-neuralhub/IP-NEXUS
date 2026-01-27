// ============================================================
// IP-NEXUS AI BRAIN - TEST SUITES HOOKS (PHASE 5)
// ============================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { 
  AITestSuite, 
  AITestSuiteWithStats,
  AITestCase, 
  AITestRun, 
  AITestResult,
  TestSuiteFormData,
  TestCaseFormData,
  QualityGateResult
} from '@/types/ai-evaluation.types';

// ============================================================
// TEST SUITES
// ============================================================

export function useAITestSuites() {
  return useQuery({
    queryKey: ['ai-test-suites'],
    queryFn: async (): Promise<AITestSuiteWithStats[]> => {
      const { data: suites, error } = await supabase
        .from('ai_test_suites')
        .select(`
          *,
          task:ai_task_assignments(task_code, task_name)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Get stats for each suite
      const suitesWithStats = await Promise.all(
        (suites || []).map(async (suite) => {
          const { data: cases } = await supabase
            .from('ai_test_cases')
            .select('id, is_golden')
            .eq('suite_id', suite.id)
            .eq('is_active', true);
          
          const { data: latestRun } = await supabase
            .from('ai_test_runs')
            .select('*')
            .eq('suite_id', suite.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
          
          return {
            ...suite,
            total_cases: cases?.length || 0,
            golden_cases: cases?.filter(c => c.is_golden).length || 0,
            latest_run: latestRun as AITestRun | null,
          } as AITestSuiteWithStats;
        })
      );
      
      return suitesWithStats;
    },
  });
}

export function useAITestSuite(id: string | undefined) {
  return useQuery({
    queryKey: ['ai-test-suite', id],
    queryFn: async (): Promise<AITestSuite | null> => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('ai_test_suites')
        .select(`
          *,
          task:ai_task_assignments(task_code, task_name)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as AITestSuite;
    },
    enabled: !!id,
  });
}

export function useCreateTestSuite() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: TestSuiteFormData) => {
      const { error } = await supabase
        .from('ai_test_suites')
        .insert({
          name: data.name,
          description: data.description || null,
          task_id: data.task_id,
          is_required_for_publish: data.is_required_for_publish,
          pass_threshold: data.pass_threshold,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-test-suites'] });
      toast.success('Test suite created');
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
}

export function useUpdateTestSuite() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<TestSuiteFormData> }) => {
      const { error } = await supabase
        .from('ai_test_suites')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['ai-test-suites'] });
      queryClient.invalidateQueries({ queryKey: ['ai-test-suite', id] });
      toast.success('Test suite updated');
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
}

export function useDeleteTestSuite() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('ai_test_suites')
        .update({ is_active: false })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-test-suites'] });
      toast.success('Test suite deleted');
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
}

// ============================================================
// TEST CASES
// ============================================================

export function useAITestCases(suiteId: string | undefined) {
  return useQuery({
    queryKey: ['ai-test-cases', suiteId],
    queryFn: async (): Promise<AITestCase[]> => {
      if (!suiteId) return [];
      
      const { data, error } = await supabase
        .from('ai_test_cases')
        .select('*')
        .eq('suite_id', suiteId)
        .eq('is_active', true)
        .order('priority', { ascending: false });

      if (error) throw error;
      return (data || []) as AITestCase[];
    },
    enabled: !!suiteId,
  });
}

export function useCreateTestCase() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ suiteId, data }: { suiteId: string; data: TestCaseFormData }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const insertData: any = {
        suite_id: suiteId,
        name: data.name,
        description: data.description || null,
        input_variables: data.input_variables,
        expected_contains: data.expected_contains,
        expected_not_contains: data.expected_not_contains || [],
        expected_format: data.expected_format || null,
        expected_min_length: data.expected_min_length || null,
        expected_max_length: data.expected_max_length || null,
        reference_output: data.reference_output || null,
        similarity_threshold: data.similarity_threshold || 0.7,
        is_golden: data.is_golden,
        priority: data.priority || 5,
        tags: data.tags || [],
      };
      
      const { error } = await supabase
        .from('ai_test_cases')
        .insert([insertData]);
      
      if (error) throw error;
    },
    onSuccess: (_, { suiteId }) => {
      queryClient.invalidateQueries({ queryKey: ['ai-test-cases', suiteId] });
      queryClient.invalidateQueries({ queryKey: ['ai-test-suites'] });
      toast.success('Test case created');
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
}

export function useUpdateTestCase() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, suiteId, data }: { id: string; suiteId: string; data: Partial<TestCaseFormData> }) => {
      // Convert to database-compatible format
      const updateData: Record<string, unknown> = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.input_variables !== undefined) updateData.input_variables = data.input_variables;
      if (data.expected_contains !== undefined) updateData.expected_contains = data.expected_contains;
      if (data.is_golden !== undefined) updateData.is_golden = data.is_golden;
      if (data.priority !== undefined) updateData.priority = data.priority;
      
      const { error } = await supabase
        .from('ai_test_cases')
        .update(updateData)
        .eq('id', id);
      
      if (error) throw error;
      return { suiteId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['ai-test-cases', result.suiteId] });
      toast.success('Test case updated');
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
}

export function useDeleteTestCase() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, suiteId }: { id: string; suiteId: string }) => {
      const { error } = await supabase
        .from('ai_test_cases')
        .update({ is_active: false })
        .eq('id', id);
      
      if (error) throw error;
      return { suiteId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['ai-test-cases', result.suiteId] });
      queryClient.invalidateQueries({ queryKey: ['ai-test-suites'] });
      toast.success('Test case deleted');
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
}

// ============================================================
// TEST RUNS
// ============================================================

export function useAITestRuns(suiteId: string | undefined) {
  return useQuery({
    queryKey: ['ai-test-runs', suiteId],
    queryFn: async (): Promise<AITestRun[]> => {
      if (!suiteId) return [];
      
      const { data, error } = await supabase
        .from('ai_test_runs')
        .select('*')
        .eq('suite_id', suiteId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return (data || []) as AITestRun[];
    },
    enabled: !!suiteId,
  });
}

export function useStartTestRun() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ suiteId, modelCode }: { suiteId: string; modelCode?: string }) => {
      const { data, error } = await supabase.rpc('start_test_run', {
        p_suite_id: suiteId,
        p_triggered_by: 'manual',
        p_model_code: modelCode || null,
      });
      
      if (error) throw error;
      return data as string;
    },
    onSuccess: (_, { suiteId }) => {
      queryClient.invalidateQueries({ queryKey: ['ai-test-runs', suiteId] });
      queryClient.invalidateQueries({ queryKey: ['ai-test-suites'] });
      toast.info('Test run started');
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
}

export function useCompleteTestRun() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ runId, suiteId }: { runId: string; suiteId: string }) => {
      const { data, error } = await supabase.rpc('complete_test_run', {
        p_run_id: runId,
      });
      
      if (error) throw error;
      return { passed: data as boolean, suiteId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['ai-test-runs', result.suiteId] });
      queryClient.invalidateQueries({ queryKey: ['ai-test-suites'] });
      toast.success(result.passed ? 'All tests passed!' : 'Some tests failed');
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
}

// ============================================================
// TEST RESULTS
// ============================================================

export function useAITestResults(runId: string | undefined) {
  return useQuery({
    queryKey: ['ai-test-results', runId],
    queryFn: async (): Promise<AITestResult[]> => {
      if (!runId) return [];
      
      const { data, error } = await supabase
        .from('ai_test_results')
        .select(`
          *,
          test_case:ai_test_cases(name, is_golden)
        `)
        .eq('run_id', runId)
        .order('created_at');

      if (error) throw error;
      
      // Map database response to typed results
      return (data || []).map((result) => ({
        ...result,
        validations: (result.validations as unknown as AITestResult['validations']) || [],
      })) as unknown as AITestResult[];
    },
    enabled: !!runId,
  });
}

// ============================================================
// QUALITY GATE
// ============================================================

export function useCheckQualityGate(taskId: string | undefined) {
  return useQuery({
    queryKey: ['quality-gate', taskId],
    queryFn: async (): Promise<QualityGateResult | null> => {
      if (!taskId) return null;
      
      const { data, error } = await supabase.rpc('can_task_publish', {
        p_task_id: taskId,
      });
      
      if (error) throw error;
      return data?.[0] as QualityGateResult | null;
    },
    enabled: !!taskId,
  });
}
