/**
 * MatterDetailTabs - Organized tabs with two rows
 * Primary tabs (first row): General | Presentaciones | Partes | Documentos | Plazos | Comunicaciones
 * Secondary tabs (second row, smaller): Tareas | Facturas | Timeline
 * Each tab with NeoBadge counter if has elements
 */

import * as React from 'react';
import { 
  FileText, Building2, Users, FolderOpen, Calendar, Mail,
  CheckSquare, Receipt, History
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TabCounters {
  filings?: number;
  parties?: number;
  documents?: number;
  deadlines?: number;
  communications?: number;
  tasks?: number;
  tasksUrgent?: number;
  invoices?: number;
  invoicesUnpaid?: number;
  timeline?: number;
}

interface MatterDetailTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  counters: TabCounters;
}

// Tab counter badge component with NeoBadge style
const TabCounter: React.FC<{ count: number; isUrgent?: boolean }> = ({ count, isUrgent = false }) => {
  if (count === 0) return null;
  
  return (
    <span 
      className={cn(
        "ml-1.5 h-5 min-w-5 px-1.5 text-[10px] font-bold rounded-full flex items-center justify-center transition-all duration-200",
        isUrgent 
          ? "text-white" 
          : "text-slate-600"
      )}
      style={{ 
        background: isUrgent 
          ? 'linear-gradient(135deg, #ef4444, #dc2626)' 
          : 'linear-gradient(135deg, #f1f4f9, #e8ebf0)',
        boxShadow: isUrgent 
          ? '0 2px 4px rgba(239, 68, 68, 0.3)' 
          : 'inset 0 1px 2px rgba(0,0,0,0.05), 2px 2px 4px #cdd1dc, -1px -1px 3px #ffffff'
      }}
    >
      {count}
    </span>
  );
};

// Primary tab configuration
const PRIMARY_TABS = [
  { id: 'general', label: 'General', icon: FileText, counterKey: null },
  { id: 'filings', label: 'Presentaciones', icon: Building2, counterKey: 'filings' },
  { id: 'deadlines', label: 'Plazos', icon: Calendar, counterKey: 'deadlines' },
  { id: 'parties', label: 'Partes', icon: Users, counterKey: 'parties' },
  { id: 'tasks', label: 'Tareas', icon: CheckSquare, counterKey: 'tasks', urgentKey: 'tasksUrgent' },
] as const;

// Secondary tab configuration
const SECONDARY_TABS = [
  { id: 'timeline', label: 'Timeline', icon: History, counterKey: 'timeline' },
  { id: 'invoices', label: 'Facturas', icon: Receipt, counterKey: 'invoices' },
  { id: 'documents', label: 'Documentos', icon: FolderOpen, counterKey: 'documents' },
] as const;

export const MatterDetailTabs: React.FC<MatterDetailTabsProps> = ({
  activeTab,
  onTabChange,
  counters,
}) => {
  return (
    <div className="space-y-2 mb-4">
      {/* Primary Tabs Row */}
      <div 
        className="flex flex-wrap gap-1 p-1.5 rounded-xl"
        style={{
          background: '#f1f4f9',
          boxShadow: 'inset 2px 2px 5px #cdd1dc, inset -2px -2px 5px #ffffff',
        }}
      >
        {PRIMARY_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          const count = tab.counterKey ? (counters[tab.counterKey as keyof TabCounters] || 0) : 0;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "relative flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2",
                isActive 
                  ? "text-slate-900" 
                  : "text-slate-500 hover:text-slate-700 hover:bg-white/40"
              )}
              style={isActive ? {
                background: '#f1f4f9',
                boxShadow: '3px 3px 7px #cdd1dc, -3px -3px 7px #ffffff',
              } : undefined}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
              {tab.counterKey && <TabCounter count={count} />}
              
              {/* Accent line for active tab */}
              {isActive && (
                <span 
                  className="absolute bottom-1 left-[30%] right-[30%] h-0.5 rounded-full"
                  style={{ 
                    background: 'linear-gradient(90deg, #00b4d8, #00d4aa)',
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Secondary Tabs Row - Smaller */}
      <div 
        className="flex flex-wrap gap-1 p-1 rounded-lg"
        style={{
          background: 'rgba(241, 244, 249, 0.6)',
          boxShadow: 'inset 1px 1px 3px rgba(205, 209, 220, 0.5), inset -1px -1px 3px rgba(255, 255, 255, 0.5)',
        }}
      >
        {SECONDARY_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          const count = tab.counterKey ? (counters[tab.counterKey as keyof TabCounters] || 0) : 0;
          const urgentCount = 'urgentKey' in tab && tab.urgentKey 
            ? (counters[tab.urgentKey as keyof TabCounters] || 0) 
            : 0;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "relative flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-1",
                isActive 
                  ? "text-slate-800" 
                  : "text-slate-500 hover:text-slate-600 hover:bg-white/40"
              )}
              style={isActive ? {
                background: '#f1f4f9',
                boxShadow: '2px 2px 4px #cdd1dc, -2px -2px 4px #ffffff',
              } : undefined}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
              {tab.counterKey && (
                <TabCounter 
                  count={count} 
                  isUrgent={urgentCount > 0} 
                />
              )}
              
              {/* Accent line for active tab */}
              {isActive && (
                <span 
                  className="absolute bottom-0.5 left-[30%] right-[30%] h-0.5 rounded-full"
                  style={{ 
                    background: 'linear-gradient(90deg, #00b4d8, #00d4aa)',
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MatterDetailTabs;
