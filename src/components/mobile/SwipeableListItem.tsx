import { useRef, useState, ReactNode } from 'react';
import { Trash2, Archive, Check, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useHaptic } from '@/hooks/use-mobile';

interface SwipeableListItemProps {
  children: ReactNode;
  onDelete?: () => void;
  onArchive?: () => void;
  onComplete?: () => void;
  threshold?: number;
  className?: string;
}

export function SwipeableListItem({
  children,
  onDelete,
  onArchive,
  onComplete,
  threshold = 80,
  className,
}: SwipeableListItemProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const { mediumTap } = useHaptic();
  
  const startXRef = useRef(0);
  const currentOffsetRef = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
    currentOffsetRef.current = offset;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;

    const currentX = e.touches[0].clientX;
    const diff = currentX - startXRef.current;
    let newOffset = currentOffsetRef.current + diff;

    // Limit offset based on available actions
    const maxLeft = onDelete ? -threshold : 0;
    const maxRight = (onComplete || onArchive) ? threshold : 0;

    newOffset = Math.max(maxLeft, Math.min(maxRight, newOffset));
    setOffset(newOffset);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);

    if (Math.abs(offset) >= threshold * 0.6) {
      // Snap to action position
      if (offset < 0 && onDelete) {
        setOffset(-threshold);
        mediumTap();
      } else if (offset > 0) {
        setOffset(threshold);
        mediumTap();
      }
    } else {
      // Snap back
      setOffset(0);
    }
  };

  const handleAction = (action: (() => void) | undefined) => {
    if (action) {
      mediumTap();
      action();
      setOffset(0);
    }
  };

  const resetPosition = () => {
    setOffset(0);
  };

  return (
    <div 
      ref={containerRef}
      className={cn('relative overflow-hidden', className)}
    >
      {/* Left actions (Complete/Archive) */}
      <div 
        className="absolute inset-y-0 left-0 flex items-stretch"
        style={{ width: threshold }}
      >
        {onComplete && (
          <button
            className="flex-1 flex items-center justify-center bg-green-500 text-white"
            onClick={() => handleAction(onComplete)}
          >
            <Check className="h-6 w-6" />
          </button>
        )}
        {onArchive && !onComplete && (
          <button
            className="flex-1 flex items-center justify-center bg-amber-500 text-white"
            onClick={() => handleAction(onArchive)}
          >
            <Archive className="h-6 w-6" />
          </button>
        )}
      </div>

      {/* Right actions (Delete) */}
      <div 
        className="absolute inset-y-0 right-0 flex items-stretch"
        style={{ width: threshold }}
      >
        {onDelete && (
          <button
            className="flex-1 flex items-center justify-center bg-red-500 text-white"
            onClick={() => handleAction(onDelete)}
          >
            <Trash2 className="h-6 w-6" />
          </button>
        )}
      </div>

      {/* Content */}
      <div
        className={cn(
          'relative bg-background transition-transform',
          !isDragging && 'duration-200'
        )}
        style={{ transform: `translateX(${offset}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={offset !== 0 ? resetPosition : undefined}
      >
        {children}
      </div>
    </div>
  );
}
