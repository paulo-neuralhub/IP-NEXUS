import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { X, Sparkles, ArrowRight } from 'lucide-react';

import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth-context';
import { useMarkTipSeen } from '@/hooks/useOnboarding';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const CRM_TIP_KEY = 'crm.dashboard.ai_tip';
const COOLDOWN_HOURS = 24;

function hoursBetween(a: Date, b: Date) {
  return Math.abs(a.getTime() - b.getTime()) / (1000 * 60 * 60);
}

export function CrmAiTipCallout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const markTip = useMarkTipSeen();
  const [dismissedLocally, setDismissedLocally] = useState(false);

  const tipRow = useQuery({
    queryKey: ['onboarding-tip', CRM_TIP_KEY],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('onboarding_tips')
        .select('id, tip_key')
        .eq('tip_key', CRM_TIP_KEY)
        .maybeSingle();
      if (error) throw error;
      return data as { id: string; tip_key: string } | null;
    },
  });

  const progress = useQuery({
    queryKey: ['tip-progress', user?.id, tipRow.data?.id],
    queryFn: async () => {
      if (!user?.id || !tipRow.data?.id) return null;
      const { data, error } = await supabase
        .from('user_tip_progress')
        .select('status, dismissed_at')
        .eq('user_id', user.id)
        .eq('tip_id', tipRow.data.id)
        .maybeSingle();
      if (error) throw error;
      return data as { status: string | null; dismissed_at: string | null } | null;
    },
    enabled: !!user?.id && !!tipRow.data?.id,
  });

  const isCoolingDown = useMemo(() => {
    const dismissedAt = progress.data?.dismissed_at;
    if (!dismissedAt) return false;
    const h = hoursBetween(new Date(), new Date(dismissedAt));
    return h < COOLDOWN_HOURS;
  }, [progress.data?.dismissed_at]);

  const shouldHide = dismissedLocally || isCoolingDown;

  const aiTip = useQuery({
    queryKey: ['crm-ai-tip', user?.id, CRM_TIP_KEY],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('crm-tips', {
        body: {
          currentPath: '/app/crm',
          module: 'crm',
          section: 'kanban',
          tipKey: CRM_TIP_KEY,
        },
      });
      if (error) throw error;
      return data as { tip: string };
    },
    enabled: !!user?.id && !!tipRow.data?.id && !shouldHide,
    staleTime: 1000 * 60 * 60, // 1h
  });

  if (!user?.id) return null;
  if (shouldHide) return null;
  if (tipRow.isLoading || progress.isLoading) return null;
  if (!tipRow.data?.id) return null;

  return (
    <Card>
      <CardContent className="p-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">Tip rápido</p>
          </div>
          <div className="mt-2">
            {aiTip.isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-[260px]" />
                <Skeleton className="h-4 w-[220px]" />
              </div>
            ) : aiTip.data?.tip ? (
              <p className="text-sm text-muted-foreground leading-relaxed">{aiTip.data.tip}</p>
            ) : (
              <p className="text-sm text-muted-foreground leading-relaxed">
                Puedes configurar etapas y pipelines en Configuración.
              </p>
            )}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/app/settings')}
            >
              Ir a configuración CRM
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="shrink-0"
          aria-label="Ocultar tip"
          onClick={async () => {
            try {
              setDismissedLocally(true);
              await markTip.mutateAsync({ tipId: tipRow.data!.id, status: 'dismissed' });
            } catch {
              // noop (no toast: non-blocking UI)
            }
          }}
        >
          <X className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
