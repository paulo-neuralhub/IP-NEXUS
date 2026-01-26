// =============================================
// PÁGINA: ModulesManagementPage
// Gestión de módulos y add-ons - Versión reorganizada
// src/pages/app/settings/modules/index.tsx
// =============================================

import { useState } from 'react';
import { 
  Search,
  Package,
  Puzzle,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TooltipProvider } from '@/components/ui/tooltip';
import { PlanSummaryCard } from '@/components/modules/PlanSummaryCard';
import { ModulesGrid } from '@/components/modules/ModulesGrid';
import { AddonsSection } from '@/components/modules/AddonsSection';
import { PageContainer } from '@/components/layout/PageContainer';

export default function ModulesManagementPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'modules' | 'addons'>('modules');

  return (
    <TooltipProvider>
      <PageContainer className="py-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Módulos y Add-ons
            </h1>
            <p className="text-muted-foreground">
              Gestiona las funcionalidades activas de tu organización
            </p>
          </div>

          {/* Plan Summary */}
          <PlanSummaryCard />

          {/* Tabs */}
          <Tabs 
            value={activeTab} 
            onValueChange={(v) => setActiveTab(v as 'modules' | 'addons')}
            className="space-y-4"
          >
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <TabsList className="bg-muted/50">
                <TabsTrigger value="modules" className="gap-2">
                  <Package className="h-4 w-4" />
                  Módulos
                </TabsTrigger>
                <TabsTrigger value="addons" className="gap-2">
                  <Puzzle className="h-4 w-4" />
                  Add-ons
                </TabsTrigger>
              </TabsList>

              {/* Búsqueda */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-background"
                />
              </div>
            </div>

            {/* Tab: Módulos */}
            <TabsContent value="modules" className="mt-6">
              <ModulesGrid searchQuery={searchQuery} />
            </TabsContent>

            {/* Tab: Add-ons */}
            <TabsContent value="addons" className="mt-6">
              <AddonsSection searchQuery={searchQuery} />
            </TabsContent>
          </Tabs>
        </div>
      </PageContainer>
    </TooltipProvider>
  );
}
