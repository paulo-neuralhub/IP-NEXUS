// ============================================================
// IP-NEXUS - DEADLINE CONFIGURATION PAGE
// Main page for configuring deadline rules, types, and holidays
// ============================================================

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DeadlineRulesTab } from '@/components/deadlines/config/DeadlineRulesTab';
import { DeadlineTypesTab } from '@/components/deadlines/config/DeadlineTypesTab';
import { HolidaysTab } from '@/components/deadlines/config/HolidaysTab';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Upload } from 'lucide-react';
import { useExportConfig, TEMPLATES } from '@/hooks/useDeadlineConfigExport';

export default function DeadlineConfigPage() {
  const [activeTab, setActiveTab] = useState('rules');
  const exportConfig = useExportConfig();

  const handleExport = () => {
    exportConfig.mutate({
      includeRules: true,
      includeTypes: true,
      includeHolidays: true,
    });
  };

  return (
    <div className="container max-w-6xl py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Configuración de Plazos</h1>
          <p className="text-muted-foreground">
            Personaliza reglas de cálculo, tipos y calendarios festivos
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport} disabled={exportConfig.isPending}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="rules">Reglas</TabsTrigger>
          <TabsTrigger value="types">Tipos de Plazo</TabsTrigger>
          <TabsTrigger value="holidays">Festivos</TabsTrigger>
          <TabsTrigger value="import">Importar/Exportar</TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="mt-6">
          <DeadlineRulesTab />
        </TabsContent>

        <TabsContent value="types" className="mt-6">
          <DeadlineTypesTab />
        </TabsContent>

        <TabsContent value="holidays" className="mt-6">
          <HolidaysTab />
        </TabsContent>

        <TabsContent value="import" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Plantillas Predefinidas</CardTitle>
              <CardDescription>
                Carga configuraciones optimizadas para tu tipo de práctica
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {TEMPLATES.map(t => (
                  <Button key={t.id} variant="outline" className="h-auto py-4 flex-col">
                    <span className="text-2xl mb-2">{t.icon}</span>
                    <span className="font-medium">{t.name}</span>
                    <span className="text-xs text-muted-foreground">{t.description}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
