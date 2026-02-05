// ============================================================
// IP-NEXUS - DEADLINE FILTERS COMPONENT
// L125: Filter tabs and sort controls
// ============================================================

import { ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface DeadlineFiltersProps {
  filter: string;
  sortBy: 'date' | 'priority';
  stats: {
    total: number;
    overdue: number;
    urgent: number;
    completed: number;
  };
  onFilterChange: (filter: string) => void;
  onSortChange: (sort: 'date' | 'priority') => void;
}

export function DeadlineFilters({
  filter,
  sortBy,
  stats,
  onFilterChange,
  onSortChange,
}: DeadlineFiltersProps) {
  const filters = [
    {
      key: 'all',
      label: 'Todos',
      count: stats.total,
      color: '',
      textColor: '',
    },
    {
      key: 'overdue',
      label: '🔴 Vencidos',
      count: stats.overdue,
      color: stats.overdue > 0 ? 'text-red-600' : '',
      textColor: stats.overdue > 0 ? 'text-red-600' : '',
      badgeVariant: stats.overdue > 0 ? 'destructive' : 'secondary',
    },
    {
      key: 'urgent',
      label: '🟠 Urgentes',
      count: stats.urgent,
      color: stats.urgent > 0 ? 'text-orange-600' : '',
      textColor: stats.urgent > 0 ? 'text-orange-600' : '',
    },
    {
      key: 'upcoming',
      label: '🟡 Próximos',
      count: null,
      color: '',
      textColor: '',
    },
    {
      key: 'completed',
      label: '✅ Completados',
      count: stats.completed,
      color: '',
      textColor: '',
    },
  ];

  // Get badge color based on filter type
  const getBadgeColor = (key: string) => {
    switch (key) {
      case 'overdue': return '#ef4444';
      case 'urgent': return '#f59e0b';
      case 'upcoming': return '#00b4d8';
      case 'completed': return '#22c55e';
      default: return '#64748b';
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      {/* Filter buttons */}
      <div className="flex flex-wrap items-center gap-2">
        {filters.map((f) => {
          const isActive = filter === f.key;
          const badgeColor = getBadgeColor(f.key);
          
          return (
            <Button
              key={f.key}
              variant={isActive ? 'default' : 'outline'}
              size="sm"
              onClick={() => onFilterChange(f.key)}
              className={cn(
                'flex items-center gap-2 transition-all',
                !isActive && 'bg-white hover:bg-slate-50'
              )}
              style={{
                borderRadius: '10px',
              }}
            >
              <span>{f.label}</span>
              {f.count !== null && (
                <span
                  className="px-1.5 py-0.5 rounded text-[10px] font-bold"
                  style={{
                    background: isActive 
                      ? 'rgba(255,255,255,0.2)' 
                      : `${badgeColor}15`,
                    color: isActive ? 'white' : badgeColor,
                    boxShadow: isActive 
                      ? 'inset 0 1px 2px rgba(0,0,0,0.1)' 
                      : 'inset 0 1px 1px rgba(255,255,255,0.9)',
                  }}
                >
                  {f.count}
                </span>
              )}
            </Button>
          );
        })}
      </div>

      {/* Sort control */}
      <Select value={sortBy} onValueChange={(v) => onSortChange(v as 'date' | 'priority')}>
        <SelectTrigger 
          className="w-[160px]"
          style={{
            background: '#f1f4f9',
            borderRadius: '10px',
            border: '1px solid rgba(0,0,0,0.06)',
          }}
        >
          <ArrowUpDown className="h-4 w-4 mr-2" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="date">Por fecha</SelectItem>
          <SelectItem value="priority">Por urgencia</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
