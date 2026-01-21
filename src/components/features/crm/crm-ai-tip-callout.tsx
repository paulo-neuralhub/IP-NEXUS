import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { X, Sparkles, ArrowRight } from 'lucide-react';

import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth-context';
import { useMarkTipSeen } from '@/hooks/useOnboarding';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

const CRM_TIP_KEY = 'crm.dashboard.ai_tip';
const COOLDOWN_HOURS = 24;

function hoursBetween(a: Date, b: Date) {
  return Math.abs(a.getTime() - b.getTime()) / (1000 * 60 * 60);
}

export function CrmAiTipCallout({
  variant = 'block',
  className,
}: {
  variant?: 'block' | 'inline';
  className?: string;
}) {
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

  const containerClass =
    variant === 'inline'
      ? 'bg-background-warm border-warning/30 py-1 px-2 pr-8 max-w-[560px] h-8 flex items-center'
      : 'bg-background-warm border-warning/30 py-2 px-3 pr-10 max-w-[520px]';

  return (
    <Alert className={[containerClass, className].filter(Boolean).join(' ')}>
      <Sparkles className="h-4 w-4 text-warning" />
      <div className="min-w-0">
        <AlertDescription className="text-xs text-muted-foreground flex items-center gap-2 min-w-0">
          <span className="font-medium text-foreground shrink-0">Tip:</span>
          {aiTip.isLoading ? (
            <span className="inline-flex items-center gap-2">
              <Skeleton className="h-3 w-40" />
            </span>
          ) : (
            <>
              <span className="min-w-0 flex-1 truncate">
                {aiTip.data?.tip || 'Puedes configurar etapas y pipelines en Configuración.'}
              </span>
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0 text-xs shrink-0"
                onClick={() => navigate('/app/settings')}
              >
                Configurar
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </>
          )}
        </AlertDescription>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className={variant === 'inline' ? 'absolute right-0.5 top-0.5 h-7 w-7' : 'absolute right-1 top-1 h-7 w-7'}
        aria-label="Ocultar tip"
        onClick={async () => {
          try {
            setDismissedLocally(true);
            await markTip.mutateAsync({ tipId: tipRow.data!.id, status: 'dismissed' });
          } catch {
            // noop
          }
        }}
      >
        <X className="h-4 w-4" />
      </Button>
    </Alert>
  );
}
