// ============================================================
// IP-NEXUS HELP - RULES ENGINE HOOKS
// Prompt 48: Knowledge Base & Rules Engine
// ============================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Json } from '@/integrations/supabase/types';

// ==========================================
// TYPES
// ==========================================

export interface HelpRule {
  id: string;
  code: string;
  name: string;
  description: string | null;
  rule_type: 'contextual' | 'proactive' | 'onboarding' | 'error';
  priority: number;
  is_active: boolean;
  conditions: Json;
  target_article_id: string | null;
  target_url: string | null;
  custom_content: string | null;
  custom_title: string | null;
  display_type: 'tooltip' | 'modal' | 'banner' | 'sidebar' | 'floating';
  display_delay_ms: number;
  display_duration_ms: number | null;
  max_displays_per_user: number;
  max_displays_per_session: number;
  cooldown_hours: number;
  created_at: string;
  updated_at: string;
  triggers?: HelpRuleTrigger[];
}

export interface HelpRuleTrigger {
  id: string;
  rule_id: string;
  trigger_type: string;
  trigger_target: string | null;
  trigger_config: Json;
  created_at: string;
}

export interface HelpRuleExecution {
  id: string;
  rule_id: string;
  user_id: string;
  organization_id: string | null;
  trigger_type: string | null;
  trigger_context: Json;
  action_taken: string;
  created_at: string;
}

// ==========================================
// RULES FETCHING
// ==========================================

export function useHelpRules(options?: { type?: string; activeOnly?: boolean }) {
  return useQuery({
    queryKey: ['help-rules', options],
    queryFn: async () => {
      let query = supabase
        .from('help_rules')
        .select('*, triggers:help_rule_triggers(*)')
        .order('priority', { ascending: false });

      if (options?.activeOnly !== false) {
        query = query.eq('is_active', true);
      }
      if (options?.type) {
        query = query.eq('rule_type', options.type);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as HelpRule[];
    },
  });
}

export function useHelpRule(ruleId: string) {
  return useQuery({
    queryKey: ['help-rule', ruleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('help_rules')
        .select('*, triggers:help_rule_triggers(*)')
        .eq('id', ruleId)
        .single();

      if (error) throw error;
      return data as HelpRule;
    },
    enabled: !!ruleId,
  });
}

// ==========================================
// RULE EXECUTION TRACKING
// ==========================================

export function useLogRuleExecution() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      ruleId,
      actionTaken,
      triggerType,
      triggerContext,
      organizationId,
    }: {
      ruleId: string;
      actionTaken: string;
      triggerType?: string;
      triggerContext?: Record<string, unknown>;
      organizationId?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase.from('help_rule_execution_log').insert([{
        rule_id: ruleId,
        user_id: user?.id,
        organization_id: organizationId,
        trigger_type: triggerType,
        trigger_context: (triggerContext || {}) as Json,
        action_taken: actionTaken,
      }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['help-rule-executions'] });
    },
  });
}

// ==========================================
// CONTEXTUAL RULES ENGINE
// ==========================================

export function useContextualHelp() {
  const location = useLocation();
  const { data: rules } = useHelpRules({ activeOnly: true });
  const logExecution = useLogRuleExecution();

  const [state, setState] = useState<{
    activeRule: HelpRule | null;
    isVisible: boolean;
    dismissedRules: Set<string>;
  }>({
    activeRule: null,
    isVisible: false,
    dismissedRules: new Set(),
  });

  const sessionKey = 'ip-nexus-help-session';
  
  const getSessionData = useCallback(() => {
    try {
      const data = sessionStorage.getItem(sessionKey);
      return data ? JSON.parse(data) : { displayedRules: {} };
    } catch {
      return { displayedRules: {} };
    }
  }, []);

  const matchesConditions = useCallback((rule: HelpRule): boolean => {
    const conditions = rule.conditions as Record<string, string>;
    if (!conditions) return false;
    
    if (conditions.page && !location.pathname.includes(conditions.page)) {
      return false;
    }
    if (conditions.module) {
      const modulePath = `/app/${conditions.module}`;
      if (!location.pathname.startsWith(modulePath)) {
        return false;
      }
    }
    return Object.keys(conditions).length > 0;
  }, [location.pathname]);

  useEffect(() => {
    if (!rules || state.activeRule) return;

    const applicableRules = rules.filter((rule) => {
      if (state.dismissedRules.has(rule.id)) return false;
      const sessionData = getSessionData();
      if ((sessionData.displayedRules[rule.id] || 0) >= rule.max_displays_per_session) return false;
      return matchesConditions(rule);
    }).sort((a, b) => b.priority - a.priority);

    if (applicableRules.length > 0) {
      const topRule = applicableRules[0];
      const timeout = setTimeout(() => {
        setState(prev => ({ ...prev, activeRule: topRule, isVisible: true }));
        logExecution.mutate({ ruleId: topRule.id, actionTaken: 'displayed', triggerType: 'page_visit' });
        
        const data = getSessionData();
        data.displayedRules[topRule.id] = (data.displayedRules[topRule.id] || 0) + 1;
        sessionStorage.setItem(sessionKey, JSON.stringify(data));
      }, topRule.display_delay_ms);

      return () => clearTimeout(timeout);
    }
  }, [rules, location.pathname, state.activeRule, state.dismissedRules, matchesConditions, getSessionData, logExecution]);

  const dismiss = useCallback(() => {
    if (state.activeRule) {
      logExecution.mutate({ ruleId: state.activeRule.id, actionTaken: 'dismissed' });
      setState(prev => ({
        ...prev,
        activeRule: null,
        isVisible: false,
        dismissedRules: new Set([...prev.dismissedRules, prev.activeRule?.id || '']),
      }));
    }
  }, [state.activeRule, logExecution]);

  const complete = useCallback(() => {
    if (state.activeRule) {
      logExecution.mutate({ ruleId: state.activeRule.id, actionTaken: 'completed' });
      setState(prev => ({ ...prev, activeRule: null, isVisible: false }));
    }
  }, [state.activeRule, logExecution]);

  return { activeRule: state.activeRule, isVisible: state.isVisible, dismiss, complete };
}

// ==========================================
// ADMIN: RULE MANAGEMENT
// ==========================================

export function useCreateHelpRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rule: { code: string; name: string; [key: string]: unknown }) => {
      const { data, error } = await supabase
        .from('help_rules')
        .insert([{
          code: rule.code,
          name: rule.name,
          description: rule.description as string,
          rule_type: (rule.rule_type as string) || 'contextual',
          priority: (rule.priority as number) || 50,
          is_active: rule.is_active !== false,
          conditions: (rule.conditions || {}) as Json,
          custom_content: rule.custom_content as string,
          custom_title: rule.custom_title as string,
          display_type: (rule.display_type as string) || 'tooltip',
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Regla creada');
      queryClient.invalidateQueries({ queryKey: ['help-rules'] });
    },
    onError: () => {
      toast.error('Error al crear regla');
    },
  });
}

export function useUpdateHelpRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; [key: string]: unknown }) => {
      const { data, error } = await supabase
        .from('help_rules')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Regla actualizada');
      queryClient.invalidateQueries({ queryKey: ['help-rules'] });
    },
  });
}

export function useDeleteHelpRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('help_rules').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Regla eliminada');
      queryClient.invalidateQueries({ queryKey: ['help-rules'] });
    },
  });
}
