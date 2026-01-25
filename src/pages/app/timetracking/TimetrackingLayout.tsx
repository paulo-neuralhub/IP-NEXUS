/**
 * Timetracking Module Layout
 * P57: Time Tracking Module
 */

import { Outlet, NavLink } from 'react-router-dom';
import { Clock, BarChart3, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import { InlineHelp } from '@/components/help';

const navItems = [
  { to: '/app/timetracking', icon: Clock, label: 'Timesheet', end: true },
  { to: '/app/timetracking/reports', icon: BarChart3, label: 'Reportes' },
  { to: '/app/timetracking/rates', icon: DollarSign, label: 'Tarifas' },
];

export default function TimetrackingLayout() {
  return (
    <div className="flex h-full">
      {/* Sidebar de navegación */}
      <div className="w-56 border-r bg-muted/30 flex-shrink-0">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-semibold text-foreground">Tiempo</h2>
            <InlineHelp text="Control de tiempo trabajado por expediente/cliente. Registra horas, genera reportes y configura tarifas para facturación." />
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )
                }
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}
