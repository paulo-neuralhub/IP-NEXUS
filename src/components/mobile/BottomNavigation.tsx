import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Folder, 
  Calendar, 
  Search, 
  Menu 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useHaptic } from '@/hooks/use-mobile';

interface NavItem {
  href: string;
  icon: typeof LayoutDashboard;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/app/dashboard', icon: LayoutDashboard, label: 'Inicio' },
  { href: '/app/docket', icon: Folder, label: 'Docket' },
  { href: '/app/docket/deadlines', icon: Calendar, label: 'Plazos' },
  { href: '/app/search', icon: Search, label: 'Buscar' },
  { href: '/app/menu', icon: Menu, label: 'Más' },
];

export function BottomNavigation() {
  const location = useLocation();
  const { lightTap } = useHaptic();

  const isActive = (href: string) => {
    if (href === '/app/dashboard') {
      return location.pathname === '/app/dashboard' || location.pathname === '/app';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border safe-area-bottom">
      <div 
        className="flex justify-around items-center h-14"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => lightTap()}
              className={cn(
                'flex flex-col items-center justify-center min-w-[64px] min-h-[48px] px-3 py-1',
                'transition-colors duration-200',
                active 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <item.icon className={cn(
                'h-5 w-5 mb-0.5',
                active && 'text-primary'
              )} />
              <span className={cn(
                'text-[10px] font-medium leading-tight',
                active && 'text-primary'
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
