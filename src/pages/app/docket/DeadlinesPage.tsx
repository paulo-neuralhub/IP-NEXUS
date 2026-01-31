// ============================================================
// IP-NEXUS - DEADLINES PAGE (Redesigned)
// L125: Expert-level UX with semantic colors, grouping, and actions
// ============================================================

import { useState, useMemo } from 'react';
import { Calendar, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDeadlines, useDeadlineStats } from '@/hooks/useDeadlines';
import { usePageTitle } from '@/hooks/use-page-title';
import { useNavigate } from 'react-router-dom';
import { differenceInDays, addDays } from 'date-fns';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { DeadlineCalendar } from '@/components/deadlines/DeadlineCalendar';
import { DeadlineKPIs } from '@/components/deadlines/DeadlineKPIs';
import { DeadlineFilters } from '@/components/deadlines/DeadlineFilters';
import { DeadlineGroupedList } from '@/components/deadlines/DeadlineGroupedList';

export default function DeadlinesPage() {
  usePageTitle('Plazos y Deadlines');
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [filter, setFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'priority'>('date');

  // Fetch deadlines and stats
  const { deadlines = [], isLoading, markAsCompleted, extendDeadline } = useDeadlines({});
  const { data: stats, isLoading: statsLoading } = useDeadlineStats();

  // Calculate local stats for filters
  const filterStats = useMemo(() => {
    const overdue = deadlines.filter(
      (d) => d.status !== 'completed' && differenceInDays(new Date(d.deadline_date), new Date()) < 0
    ).length;
    const urgent = deadlines.filter((d) => {
      if (d.status === 'completed') return false;
      const days = differenceInDays(new Date(d.deadline_date), new Date());
      return days >= 0 && days <= 7;
    }).length;
    const completed = deadlines.filter((d) => d.status === 'completed').length;

    return { total: deadlines.length, overdue, urgent, completed };
  }, [deadlines]);

  // Filter and sort deadlines
  const filteredDeadlines = useMemo(() => {
    let result = [...deadlines];

    switch (filter) {
      case 'overdue':
        result = result.filter(
          (d) => d.status !== 'completed' && differenceInDays(new Date(d.deadline_date), new Date()) < 0
        );
        break;
      case 'urgent':
        result = result.filter((d) => {
          if (d.status === 'completed') return false;
          const days = differenceInDays(new Date(d.deadline_date), new Date());
          return days >= 0 && days <= 7;
        });
        break;
      case 'upcoming':
        result = result.filter((d) => {
          if (d.status === 'completed') return false;
          const days = differenceInDays(new Date(d.deadline_date), new Date());
          return days > 7;
        });
        break;
      case 'completed':
        result = result.filter((d) => d.status === 'completed');
        break;
      case 'thisMonth':
        result = result.filter((d) => {
          if (d.status === 'completed') return false;
          const date = new Date(d.deadline_date);
          const now = new Date();
          return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        });
        break;
    }

    // Sort
    if (sortBy === 'date') {
      result.sort((a, b) => new Date(a.deadline_date).getTime() - new Date(b.deadline_date).getTime());
    } else {
      const priorityOrder: Record<string, number> = { critical: 0, high: 1, normal: 2, low: 3 };
      result.sort((a, b) => {
        const pa = priorityOrder[a.priority || 'normal'] ?? 2;
        const pb = priorityOrder[b.priority || 'normal'] ?? 2;
        return pa - pb;
      });
    }

    return result;
  }, [deadlines, filter, sortBy]);

  // Handle complete
  const handleComplete = (id: string) => {
    markAsCompleted(id);
  };

  // Handle postpone
  const handlePostpone = async (id: string, days: number) => {
    const deadline = deadlines.find((d) => d.id === id);
    if (!deadline) return;

    const newDate = addDays(new Date(deadline.deadline_date), days).toISOString();
    extendDeadline(id, newDate, `Pospuesto ${days} días`);
  };

  // Navigate to matter
  const handleView = (matterId: string) => {
    navigate(`/app/docket/${matterId}`);
  };

  // KPI stats
  const kpiStats = {
    overdue: stats?.overdue || 0,
    urgent: stats?.urgent || 0,
    upcoming: stats?.upcoming || 0,
    thisMonth: stats?.thisMonth || 0,
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Plazos y Deadlines</h1>
          <p className="text-muted-foreground">Gestiona todos los plazos de tus expedientes</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={view === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('list')}
          >
            <List className="h-4 w-4 mr-2" />
            Lista
          </Button>
          <Button
            variant={view === 'calendar' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('calendar')}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Calendario
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <DeadlineKPIs
        stats={kpiStats}
        isLoading={statsLoading}
        activeFilter={filter}
        onFilterChange={setFilter}
      />

      {/* Main Content */}
      {view === 'calendar' ? (
        <DeadlineCalendar />
      ) : (
        <div className="space-y-4">
          {/* Filters */}
          <DeadlineFilters
            filter={filter}
            sortBy={sortBy}
            stats={filterStats}
            onFilterChange={setFilter}
            onSortChange={setSortBy}
          />

          {/* Grouped List */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : (
            <DeadlineGroupedList
              deadlines={filteredDeadlines}
              onComplete={handleComplete}
              onPostpone={handlePostpone}
              onView={handleView}
            />
          )}
        </div>
      )}
    </div>
  );
}
