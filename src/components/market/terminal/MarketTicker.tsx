/**
 * Market Ticker Component
 * Horizontal scrolling ticker showing recent market activity
 * Bloomberg/financial terminal style
 */

import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface TickerItem {
  id: string;
  type: 'trademark' | 'patent' | 'design' | 'domain' | 'other';
  title: string;
  jurisdiction: string;
  timestamp: string;
  action: 'new' | 'bid' | 'completed' | 'update';
}

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

// Mock data for demo
const MOCK_ITEMS: TickerItem[] = [
  { id: '1', type: 'trademark', title: 'TechBrand', jurisdiction: 'ES', timestamp: new Date(Date.now() - 5 * 60000).toISOString(), action: 'new' },
  { id: '2', type: 'patent', title: 'Solar Panel System', jurisdiction: 'EU', timestamp: new Date(Date.now() - 15 * 60000).toISOString(), action: 'bid' },
  { id: '3', type: 'design', title: 'Furniture Collection', jurisdiction: 'US', timestamp: new Date(Date.now() - 30 * 60000).toISOString(), action: 'new' },
  { id: '4', type: 'trademark', title: 'GreenLife', jurisdiction: 'EU', timestamp: new Date(Date.now() - 45 * 60000).toISOString(), action: 'completed' },
  { id: '5', type: 'domain', title: 'crypto-tech.com', jurisdiction: 'INT', timestamp: new Date(Date.now() - 60 * 60000).toISOString(), action: 'new' },
  { id: '6', type: 'patent', title: 'AI Algorithm', jurisdiction: 'CN', timestamp: new Date(Date.now() - 90 * 60000).toISOString(), action: 'bid' },
  { id: '7', type: 'trademark', title: 'FreshFood', jurisdiction: 'JP', timestamp: new Date(Date.now() - 120 * 60000).toISOString(), action: 'update' },
  { id: '8', type: 'design', title: 'Watch Face', jurisdiction: 'CH', timestamp: new Date(Date.now() - 150 * 60000).toISOString(), action: 'new' },
];

export function MarketTicker({ 
  items = MOCK_ITEMS, 
  speed = 50,
  className 
}: MarketTickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!contentRef.current) return;

    const content = contentRef.current;
    let animationId: number;
    let position = 0;
    const contentWidth = content.scrollWidth / 2;

    const animate = () => {
      if (!isPaused) {
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
  }, [isPaused, speed]);

  const renderItem = (item: TickerItem, index: number) => {
    const typeConfig = TYPE_CONFIG[item.type];
    const actionConfig = ACTION_CONFIG[item.action];

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
        <span className="text-white/90 font-medium text-sm truncate max-w-[150px]">
          {item.title}
        </span>
        <span className="text-white/60 text-xs font-mono">{item.jurisdiction}</span>
        <span className="text-white/40 text-xs">
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
        'bg-[#0a0a0f] border-y border-white/10 overflow-hidden',
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
