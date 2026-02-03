/**
 * Market Ticker Component
 * Horizontal scrolling ticker showing recent market activity
 * Bloomberg/financial terminal style - USES REAL DATA
 */

import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useMarketTicker, type TickerItem } from '@/hooks/use-market-requests';

interface MarketTickerProps {
  items?: TickerItem[];
  speed?: number; // pixels per second
  className?: string;
}

const TYPE_CONFIG = {
  trademark: { color: 'text-emerald-400', bg: 'bg-emerald-500/20', icon: '®️', label: 'Marca' },
  patent: { color: 'text-blue-400', bg: 'bg-blue-500/20', icon: '📜', label: 'Patente' },
  design: { color: 'text-amber-400', bg: 'bg-amber-500/20', icon: '🎨', label: 'Diseño' },
  domain: { color: 'text-purple-400', bg: 'bg-purple-500/20', icon: '🌐', label: 'Dominio' },
  other: { color: 'text-gray-400', bg: 'bg-gray-500/20', icon: '📄', label: 'Otro' },
};

const ACTION_CONFIG = {
  new: { symbol: '▲', color: 'text-emerald-400' },
  bid: { symbol: '◆', color: 'text-blue-400' },
  completed: { symbol: '✓', color: 'text-green-400' },
  update: { symbol: '●', color: 'text-amber-400' },
};

export function MarketTicker({ 
  items: externalItems,
  speed = 50,
  className 
}: MarketTickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Use hook if no external items provided
  const { data: hookItems } = useMarketTicker(15);
  const items = externalItems ?? hookItems ?? [];

  useEffect(() => {
    if (!contentRef.current || items.length === 0) return;

    const content = contentRef.current;
    let animationId: number;
    let position = 0;
    const contentWidth = content.scrollWidth / 2;

    const animate = () => {
      if (!isPaused && contentWidth > 0) {
        position -= speed / 60;
        if (Math.abs(position) >= contentWidth) {
          position = 0;
        }
        content.style.transform = `translateX(${position}px)`;
      }
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationId);
  }, [isPaused, speed, items.length]);

  // Empty state - show static message
  if (items.length === 0) {
    return (
      <div 
        className={cn(
          'terminal-bg border-y terminal-border overflow-hidden py-3',
          className
        )}
      >
        <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
          <span className="text-lg">📊</span>
          <span>Sin actividad reciente en el marketplace</span>
        </div>
      </div>
    );
  }

  const renderItem = (item: TickerItem, index: number) => {
    const typeConfig = TYPE_CONFIG[item.type] || TYPE_CONFIG.other;
    const actionConfig = ACTION_CONFIG[item.action] || ACTION_CONFIG.new;

    return (
      <Link
        key={`${item.id}-${index}`}
        to={`/app/market/rfq/${item.id}`}
        className={cn(
          'inline-flex items-center gap-2 px-4 py-2 mx-1 rounded-md',
          'hover:bg-white/10 transition-colors cursor-pointer',
          typeConfig.bg
        )}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <span className={actionConfig.color}>{actionConfig.symbol}</span>
        <span className="text-lg">{typeConfig.icon}</span>
        <span className={cn('font-mono text-sm font-medium', typeConfig.color)}>
          {typeConfig.label}
        </span>
        <span className="terminal-text font-medium text-sm truncate max-w-[150px]">
          {item.title}
        </span>
        <span className="terminal-text-muted text-xs font-mono">{item.jurisdiction}</span>
        <span className="terminal-text-dim text-xs">
          {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true, locale: es })}
        </span>
      </Link>
    );
  };

  const allItems = [...items, ...items]; // Duplicate for seamless loop

  return (
    <div 
      ref={containerRef}
      className={cn(
        'terminal-bg border-y terminal-border overflow-hidden',
        className
      )}
    >
      <div 
        ref={contentRef}
        className="inline-flex whitespace-nowrap py-2"
      >
        {allItems.map((item, i) => renderItem(item, i))}
      </div>
    </div>
  );
}
