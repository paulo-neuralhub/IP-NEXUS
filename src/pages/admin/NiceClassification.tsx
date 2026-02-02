// ============================================================
// IP-NEXUS - NICE CLASSIFICATION PAGE
// Admin page for managing Nice classification system
// ============================================================

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Search, Lightbulb, BarChart3 } from 'lucide-react';
import { NiceImporter } from '@/components/nice/NiceImporter';
import { NiceClassBrowser } from '@/components/nice/NiceClassBrowser';
import { NiceClassSuggester } from '@/components/nice/NiceClassSuggester';
import { NiceStatisticsPanel } from '@/components/nice/NiceStatisticsPanel';
import { NiceSearchBox } from '@/components/nice/NiceSearchBox';
import { useToast } from '@/hooks/use-toast';

export default function NiceClassificationPage() {
  const { toast } = useToast();

  const handleSearchSelect = (item: any) => {
    toast({
      title: `Clase ${item.class_number}`,
      description: item.item_name_en
    });
  };

  const handleClassSelect = (classNumber: number) => {
    toast({
      title: 'Clase seleccionada',
      description: `Has seleccionado la Clase ${classNumber}`
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Clasificación de Niza</h1>
          <p className="text-muted-foreground">
            Gestión de clases para registro de marcas (NCL 13-2024)
          </p>
        </div>
        <div className="w-full md:w-80">
          <NiceSearchBox 
            onSelect={handleSearchSelect}
            placeholder="Buscar productos o servicios..." 
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="statistics" className="w-full">
        <TabsList className="grid w-full grid-cols-4 md:w-auto md:inline-grid">
          <TabsTrigger value="statistics" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Estadísticas</span>
          </TabsTrigger>
          <TabsTrigger value="browse" className="gap-2">
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Explorar</span>
          </TabsTrigger>
          <TabsTrigger value="suggest" className="gap-2">
            <Lightbulb className="h-4 w-4" />
            <span className="hidden sm:inline">Sugerir</span>
          </TabsTrigger>
          <TabsTrigger value="import" className="gap-2">
            <Upload className="h-4 w-4" />
            <span className="hidden sm:inline">Importar</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="statistics" className="mt-6">
          <NiceStatisticsPanel />
        </TabsContent>

        <TabsContent value="browse" className="mt-6">
          <NiceClassBrowser />
        </TabsContent>

        <TabsContent value="suggest" className="mt-6">
          <div className="max-w-2xl mx-auto">
            <NiceClassSuggester onSelectClass={handleClassSelect} />
          </div>
        </TabsContent>

        <TabsContent value="import" className="mt-6">
          <div className="max-w-2xl mx-auto">
            <NiceImporter />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
