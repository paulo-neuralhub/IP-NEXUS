// ============================================================
// IP-NEXUS - DEADLINES PAGE (Redesigned)
// L125/L126: Expert-level UX with unified data source
// ============================================================

import { useState, useMemo, useEffect } from 'react';
import { Calendar, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDeadlines } from '@/hooks/useDeadlines';
import { usePageTitle } from '@/hooks/use-page-title';
import { useNavigate } from 'react-router-dom';
import { differenceInDays, addDays } from 'date-fns';
import { DeadlineCalendar } from '@/components/deadlines/DeadlineCalendar';
import { DeadlineKPIs } from '@/components/deadlines/DeadlineKPIs';
import { DeadlineFilters } from '@/components/deadlines/DeadlineFilters';
import { DeadlineGroupedList } from '@/components/deadlines/DeadlineGroupedList';

export default function DeadlinesPage() {
  usePageTitle('Plazos y Deadlines');
  const navigate = useNavigate();
  
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [filter, setFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'priority'>('date');

  // Single source of truth - fetch all deadlines
  const { deadlines = [], isLoading, markAsCompleted, extendDeadline } = useDeadlines({});

  // Calculate ALL stats from the same data source
  const stats = useMemo(() => {
    const now = new Date();
    const activeDeadlines = deadlines.filter(d => d.status !== 'completed');
    
    const overdue = activeDeadlines.filter(d => {
      const days = differenceInDays(new Date(d.deadline_date), now);
      return days < 0;
    }).length;
    
    const today = activeDeadlines.filter(d => {
      const days = differenceInDays(new Date(d.deadline_date), now);
      return days === 0;
    }).length;
    
    const urgent = activeDeadlines.filter(d => {
      const days = differenceInDays(new Date(d.deadline_date), now);
      return days >= 0 && days <= 7;
    }).length;
    
    const upcoming = activeDeadlines.filter(d => {
      const days = differenceInDays(new Date(d.deadline_date), now);
      return days > 7 && days <= 30;
    }).length;
    
    const thisMonth = activeDeadlines.filter(d => {
      const date = new Date(d.deadline_date);
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length;
    
    const completed = deadlines.filter(d => d.status === 'completed').length;

    return { 
      total: deadlines.length, 
      overdue, 
      today,
      urgent, 
      upcoming, 
      thisMonth,
      completed 
    };
  }, [deadlines]);

  // Filter deadlines based on selected filter - using same logic as stats
  const filteredDeadlines = useMemo(() => {
    const now = new Date();
    let result = [...deadlines];

    switch (filter) {
      case 'overdue':
        result = result.filter(d => {
          if (d.status === 'completed') return false;
          const days = differenceInDays(new Date(d.deadline_date), now);
          return days < 0;
        });
        break;
      case 'urgent':
        result = result.filter(d => {
          if (d.status === 'completed') return false;
          const days = differenceInDays(new Date(d.deadline_date), now);
          return days >= 0 && days <= 7;
        });
        break;
      case 'upcoming':
        result = result.filter(d => {
          if (d.status === 'completed') return false;
          const days = differenceInDays(new Date(d.deadline_date), now);
          return days > 7;
        });
        break;
      case 'completed':
        result = result.filter(d => d.status === 'completed');
        break;
      case 'thisMonth':
        result = result.filter(d => {
          if (d.status === 'completed') return false;
          const date = new Date(d.deadline_date);
          return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        });
        break;
      case 'all':
      default:
        // Return all, but sort completed at the end
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

  // Navigate to matter deadlines tab
  const handleView = (matterId: string) => {
    navigate(`/app/expedientes/${matterId}?tab=plazos`);
  };

  // KPI stats for the cards - use unified stats
  const kpiStats = {
    overdue: stats.overdue,
    urgent: stats.urgent,
    upcoming: stats.upcoming,
    thisMonth: stats.thisMonth,
  };

  // Filter stats for the filter buttons - use unified stats
  const filterStats = {
    total: stats.total,
    overdue: stats.overdue,
    urgent: stats.urgent,
    completed: stats.completed,
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
        isLoading={isLoading}
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
