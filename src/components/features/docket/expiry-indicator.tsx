import { formatDate } from '@/lib/utils';
import { NeoBadge } from '@/components/ui/neo-badge';

interface ExpiryIndicatorProps {
  date: string | null | undefined;
}

// Urgency color mapping (hex)
const URGENCY_COLORS = {
  overdue: '#ef4444',  // red
  today: '#ef4444',    // red
  week: '#f97316',     // orange
  month: '#eab308',    // yellow
  ok: '#22c55e',       // green
};

export function ExpiryIndicator({ date }: ExpiryIndicatorProps) {
  if (!date) {
    return <span className="text-muted-foreground">—</span>;
  }
  
  const days = Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  
  // Determine urgency level and color
  let urgencyKey: keyof typeof URGENCY_COLORS = 'ok';
  let displayValue: string | number = days;
  let label = 'd';
  
  if (days <= 0) {
    urgencyKey = 'overdue';
    displayValue = '!';
    label = '';
  } else if (days <= 7) {
    urgencyKey = 'week';
  } else if (days <= 30) {
    urgencyKey = 'month';
  }
  
  const color = URGENCY_COLORS[urgencyKey];
  
  // For non-urgent (>90 days), show simple text
  if (days > 90) {
    return (
      <span className="text-green-600 text-sm">
        {formatDate(date)}
      </span>
    );
  }
  
  // For urgent items, show neumorphic badge
  return (
    <div className="flex items-center gap-2">
      <NeoBadge 
        value={displayValue}
        color={color}
        size="sm"
        label={label}
      />
      <span className="text-xs text-muted-foreground">
        {formatDate(date)}
      </span>
    </div>
  );
}
