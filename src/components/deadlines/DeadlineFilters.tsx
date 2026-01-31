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

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      {/* Filter buttons */}
      <div className="flex flex-wrap items-center gap-2">
        {filters.map((f) => (
          <Button
            key={f.key}
            variant={filter === f.key ? 'default' : 'outline'}
            size="sm"
            onClick={() => onFilterChange(f.key)}
            className={cn(f.textColor)}
          >
            {f.label}
            {f.count !== null && (
              <Badge
                variant={
                  filter === f.key
                    ? 'secondary'
                    : f.badgeVariant === 'destructive'
                    ? 'destructive'
                    : 'secondary'
                }
                className="ml-1.5"
              >
                {f.count}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      {/* Sort control */}
      <Select value={sortBy} onValueChange={(v) => onSortChange(v as 'date' | 'priority')}>
        <SelectTrigger className="w-[160px]">
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
