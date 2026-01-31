// ============================================================
// IP-NEXUS - DUPLICATE CHECKER COMPONENT
// L132: Automatic duplicate detection before matter creation
// ============================================================

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import { AlertTriangle, CheckCircle2, Info, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface DuplicateCheck {
  name: string;
  severity: 'high' | 'medium' | 'low';
  passed: boolean;
  message?: string;
  matchingMatters?: Array<{
    id: string;
    reference: string;
    title: string;
  }>;
}

interface DuplicateCheckerProps {
  // Data to check against
  markName?: string;
  clientId?: string;
  jurisdiction?: string;
  niceClasses?: number[];
  priorityNumber?: string;
  priorityCountry?: string;
  priorityDate?: string;
  matterType?: string;
  // Display options
  compact?: boolean;
  showOnlyIssues?: boolean;
}

export function DuplicateChecker({
  markName,
  clientId,
  jurisdiction,
  niceClasses,
  priorityNumber,
  priorityCountry,
  priorityDate,
  matterType,
  compact = false,
  showOnlyIssues = false,
}: DuplicateCheckerProps) {
  const { currentOrganization } = useOrganization();

  // Query for existing matters to check against
  const { data: existingMatters, isLoading } = useQuery({
    queryKey: [
      'duplicate-check',
      currentOrganization?.id,
      markName,
      clientId,
      jurisdiction,
      niceClasses,
      priorityNumber,
    ],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];

      const { data, error } = await supabase
        .from('matters')
        .select('id, reference, title, type, status, mark_name, client_id, jurisdiction_code, nice_classes, priority_number, priority_country, priority_date, filing_date, created_at')
        .eq('organization_id', currentOrganization.id)
        .not('status', 'eq', 'cancelled')
        .order('created_at', { ascending: false })
        .limit(500);

      if (error) throw error;
      return data || [];
    },
    enabled: !!currentOrganization?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Run duplicate checks
  const checks = useMemo((): DuplicateCheck[] => {
    if (!existingMatters || existingMatters.length === 0) return [];

    const results: DuplicateCheck[] = [];

    // 1. Check: Same sign + owner + jurisdiction
    if (markName && clientId && jurisdiction) {
      const matches = existingMatters.filter(
        (m) =>
          m.mark_name?.toLowerCase() === markName.toLowerCase() &&
          m.client_id === clientId &&
          m.jurisdiction_code === jurisdiction
      );

      results.push({
        name: 'Mismo signo + titular + jurisdicción',
        severity: 'high',
        passed: matches.length === 0,
        message: matches.length > 0
          ? `⚠️ Ya existe un expediente similar: ${matches[0].reference}`
          : '✓ No se encontraron expedientes duplicados',
        matchingMatters: matches.map((m) => ({
          id: m.id,
          reference: m.reference,
          title: m.title || m.mark_name || 'Sin título',
        })),
      });
    }

    // 2. Check: Same priority number
    if (priorityNumber && priorityCountry) {
      const matches = existingMatters.filter(
        (m) =>
          m.priority_number === priorityNumber &&
          m.priority_country === priorityCountry
      );

      results.push({
        name: 'Mismo número de prioridad',
        severity: 'high',
        passed: matches.length === 0,
        message: matches.length > 0
          ? `⚠️ Esta prioridad ya está reivindicada en: ${matches[0].reference}`
          : '✓ Prioridad no reivindicada anteriormente',
        matchingMatters: matches.map((m) => ({
          id: m.id,
          reference: m.reference,
          title: m.title || m.mark_name || 'Sin título',
        })),
      });
    }

    // 3. Check: Same Nice classes in last 6 months
    if (niceClasses && niceClasses.length > 0 && clientId) {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const matches = existingMatters.filter((m) => {
        if (m.client_id !== clientId) return false;
        if (!m.created_at || new Date(m.created_at) < sixMonthsAgo) return false;
        
        const matterClasses = m.nice_classes || [];
        const hasOverlap = niceClasses.some((cls) =>
          matterClasses.includes(cls)
        );
        return hasOverlap;
      });

      results.push({
        name: 'Mismas clases Nice en últimos 6 meses',
        severity: 'medium',
        passed: matches.length === 0,
        message: matches.length > 0
          ? `💡 Expediente reciente con mismas clases: ${matches[0].reference}`
          : '✓ Sin expedientes recientes con estas clases',
        matchingMatters: matches.map((m) => ({
          id: m.id,
          reference: m.reference,
          title: m.title || m.mark_name || 'Sin título',
        })),
      });
    }

    // 4. Check: Same sign in same jurisdiction (any client)
    if (markName && jurisdiction) {
      const matches = existingMatters.filter(
        (m) =>
          m.mark_name?.toLowerCase() === markName.toLowerCase() &&
          m.jurisdiction_code === jurisdiction &&
          m.client_id !== clientId // Different client
      );

      if (matches.length > 0) {
        results.push({
          name: 'Mismo signo en jurisdicción (otro cliente)',
          severity: 'low',
          passed: true, // Just informational
          message: `ℹ️ Otro cliente tiene marca similar: ${matches[0].reference}`,
          matchingMatters: matches.slice(0, 3).map((m) => ({
            id: m.id,
            reference: m.reference,
            title: m.title || m.mark_name || 'Sin título',
          })),
        });
      }
    }

    return results;
  }, [existingMatters, markName, clientId, jurisdiction, niceClasses, priorityNumber, priorityCountry]);

  // Filter checks if needed
  const visibleChecks = showOnlyIssues
    ? checks.filter((c) => !c.passed)
    : checks;

  // Summary
  const hasHighSeverity = checks.some((c) => !c.passed && c.severity === 'high');
  const hasMediumSeverity = checks.some((c) => !c.passed && c.severity === 'medium');
  const allPassed = checks.every((c) => c.passed);

  if (isLoading) {
    return (
      <Card className={cn(compact && 'border-0 shadow-none')}>
        <CardContent className={cn('flex items-center gap-2 text-muted-foreground', compact ? 'p-3' : 'p-4')}>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Verificando duplicados...</span>
        </CardContent>
      </Card>
    );
  }

  if (checks.length === 0) {
    return (
      <Card className={cn(compact && 'border-0 shadow-none')}>
        <CardContent className={cn('flex items-center gap-2 text-muted-foreground', compact ? 'p-3' : 'p-4')}>
          <Info className="h-4 w-4" />
          <span className="text-sm">Complete los datos para verificar duplicados</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      compact && 'border-0 shadow-none',
      hasHighSeverity && 'border-destructive/50 bg-destructive/5',
      hasMediumSeverity && !hasHighSeverity && 'border-warning/50 bg-warning/5',
      allPassed && 'border-success/30 bg-success/5'
    )}>
      <CardHeader className={cn('pb-2', compact && 'px-3 pt-3')}>
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2">
            {hasHighSeverity ? (
              <AlertTriangle className="h-4 w-4 text-destructive" />
            ) : hasMediumSeverity ? (
              <AlertTriangle className="h-4 w-4 text-warning" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-success" />
            )}
            Detección de Duplicados
          </span>
          <Badge
            variant={hasHighSeverity ? 'destructive' : hasMediumSeverity ? 'secondary' : 'default'}
            className={cn(
              allPassed && 'bg-success/10 text-success'
            )}
          >
            {visibleChecks.filter((c) => !c.passed).length} / {checks.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className={cn('space-y-2', compact && 'px-3 pb-3')}>
        {visibleChecks.map((check, idx) => (
          <div
            key={idx}
            className={cn(
              'flex items-start gap-2 p-2 rounded-md text-sm',
              !check.passed && check.severity === 'high' && 'bg-destructive/10',
              !check.passed && check.severity === 'medium' && 'bg-warning/10',
              !check.passed && check.severity === 'low' && 'bg-muted/50',
              check.passed && 'bg-muted/30'
            )}
          >
            <div className="shrink-0 mt-0.5">
              {!check.passed && check.severity === 'high' ? (
                <AlertTriangle className="h-4 w-4 text-destructive" />
              ) : !check.passed && check.severity === 'medium' ? (
                <AlertTriangle className="h-4 w-4 text-warning" />
              ) : !check.passed && check.severity === 'low' ? (
                <Info className="h-4 w-4 text-muted-foreground" />
              ) : (
                <CheckCircle2 className="h-4 w-4 text-success" />
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium">{check.name}</p>
              <p className="text-xs text-muted-foreground">{check.message}</p>
              {check.matchingMatters && check.matchingMatters.length > 0 && !check.passed && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {check.matchingMatters.slice(0, 2).map((m) => (
                    <Badge key={m.id} variant="outline" className="text-xs">
                      {m.reference}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {allPassed && (
          <p className="text-sm text-success flex items-center gap-2 mt-2">
            <CheckCircle2 className="h-4 w-4" />
            No se encontraron expedientes similares
          </p>
        )}
      </CardContent>
    </Card>
  );
}
