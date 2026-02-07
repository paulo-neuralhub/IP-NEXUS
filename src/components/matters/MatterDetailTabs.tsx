/**
 * MatterDetailTabs - Tabs matching Client360Page format
 * All tabs in a single row inside TabsList (inside card)
 * Sub-tabs rendered by each tab content component (outside card)
 */

import * as React from 'react';
import { 
  FileText, Building2, Users, FolderOpen, Calendar, Mail,
  CheckSquare, Receipt, History, Briefcase
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

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

const ALL_TABS = [
  { id: 'general', label: 'General', icon: FileText, counterKey: null },
  { id: 'filings', label: 'Presentaciones', icon: Building2, counterKey: 'filings' },
  { id: 'deadlines', label: 'Plazos', icon: Calendar, counterKey: 'deadlines' },
  { id: 'parties', label: 'Partes', icon: Users, counterKey: 'parties' },
  { id: 'tasks', label: 'Tareas', icon: CheckSquare, counterKey: 'tasks' },
  { id: 'communications', label: 'Comunicaciones', icon: Mail, counterKey: 'communications' },
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
    <div className="mb-4">
      <Tabs value={activeTab} onValueChange={onTabChange}>
        <TabsList className="w-full justify-start bg-muted/50 h-auto flex-wrap p-1">
          {ALL_TABS.map((tab) => {
            const Icon = tab.icon;
            const count = tab.counterKey ? (counters[tab.counterKey as keyof TabCounters] || 0) : 0;
            
            return (
              <TabsTrigger key={tab.id} value={tab.id} className="gap-1.5">
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
                {tab.counterKey && count > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                    {count}
                  </Badge>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>
    </div>
  );
};

export default MatterDetailTabs;
