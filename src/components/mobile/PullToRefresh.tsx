import { ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePullToRefresh } from '@/hooks/use-mobile';

interface PullToRefreshProps {
  children: ReactNode;
  onRefresh: () => Promise<void>;
  threshold?: number;
  className?: string;
}

export function PullToRefresh({ 
  children, 
  onRefresh,
  threshold = 80,
  className 
}: PullToRefreshProps) {
  const { isPulling, isRefreshing, pullDistance, progress } = usePullToRefresh(onRefresh, threshold);

  return (
    <div className={cn('relative', className)}>
      {/* Pull indicator */}
      <div 
        className={cn(
          'absolute left-0 right-0 flex items-center justify-center',
          'transition-transform duration-200 pointer-events-none'
        )}
        style={{ 
          top: -60,
          transform: `translateY(${Math.min(pullDistance, 60)}px)`,
          opacity: progress
        }}
      >
        <div 
          className={cn(
            'w-10 h-10 rounded-full bg-background shadow-lg',
            'flex items-center justify-center border border-border'
          )}
        >
          <RefreshCw 
            className={cn(
              'h-5 w-5 text-primary transition-transform',
              isRefreshing && 'animate-spin'
            )}
            style={{ 
              transform: !isRefreshing ? `rotate(${progress * 360}deg)` : undefined
            }}
          />
        </div>
      </div>

      {/* Content */}
      <div 
        className="transition-transform duration-200"
        style={{ 
          transform: isPulling || isRefreshing 
            ? `translateY(${Math.min(pullDistance, 60)}px)` 
            : 'translateY(0)'
        }}
      >
        {children}
      </div>
    </div>
  );
}
