// ============================================================
// IP-NEXUS - NICE STATISTICS PANEL
// Dashboard showing Nice classification data status
// ============================================================

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Package, Briefcase, Database, Tag, RefreshCw, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { NICE_CLASS_ICONS } from '@/types/nice-classification';
import { cn } from '@/lib/utils';

interface ClassStatus {
  class_number: number;
  class_type: string;
  title: string;
  items_count: number;
  imported: boolean;
}

export function NiceStatisticsPanel() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [classStatus, setClassStatus] = useState<ClassStatus[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);

  const loadData = async () => {
    setLoading(true);
    
    // Get all classes
    const { data: classes } = await supabase
      .from('nice_classes')
      .select('class_number, class_type, title_en, title_es')
      .order('class_number');
    
    // Get product counts per class
    const { data: productCounts } = await supabase
      .from('nice_products')
      .select('class_number');
    
    // Count products per class
    const counts: Record<number, number> = {};
    let total = 0;
    productCounts?.forEach(p => {
      counts[p.class_number] = (counts[p.class_number] || 0) + 1;
      total++;
    });
    
    setTotalProducts(total);
    
    // Build status array
    const statusData: ClassStatus[] = (classes || []).map(c => ({
      class_number: c.class_number,
      class_type: c.class_type || 'product',
      title: c.title_es || c.title_en || '',
      items_count: counts[c.class_number] || 0,
      imported: (counts[c.class_number] || 0) > 0
    }));
    
    setClassStatus(statusData);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const importedClasses = classStatus.filter(c => c.items_count > 0).length;
  const productClasses = classStatus.filter(c => c.class_type === 'product').length;
  const serviceClasses = classStatus.filter(c => c.class_type === 'service').length;
  const importProgress = (importedClasses / 45) * 100;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Database className="h-4 w-4" />
              Clases Totales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">45</p>
            <p className="text-xs text-muted-foreground">
              {productClasses} productos + {serviceClasses} servicios
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Con Datos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{importedClasses}/45</p>
            <Progress value={importProgress} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Productos/Servicios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalProducts.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">
              términos indexados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Package className="h-4 w-4" />
              Versión
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">NCL 13</p>
            <p className="text-xs text-muted-foreground">
              2024 - WIPO
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Class Grid */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Estado por Clase</CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={cn("h-4 w-4 mr-2", refreshing && "animate-spin")} />
              Actualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 sm:grid-cols-9 md:grid-cols-15 gap-2">
            {classStatus.map((c) => (
              <div
                key={c.class_number}
                className={cn(
                  "aspect-square flex flex-col items-center justify-center rounded-lg border-2 text-center cursor-default transition-colors",
                  c.items_count > 0 
                    ? "bg-green-50 border-green-300 dark:bg-green-950 dark:border-green-700" 
                    : "bg-muted/30 border-dashed border-muted-foreground/30"
                )}
                title={`Clase ${c.class_number}: ${c.title} (${c.items_count} items)`}
              >
                <span className="text-lg">{NICE_CLASS_ICONS[c.class_number] || '📦'}</span>
                <span className="text-xs font-medium">{c.class_number}</span>
                {c.items_count > 0 && (
                  <Badge variant="secondary" className="text-[10px] px-1 py-0 mt-0.5">
                    {c.items_count}
                  </Badge>
                )}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 pt-4 border-t text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-50 border-2 border-green-300 dark:bg-green-950 dark:border-green-700" />
              <span>Con datos ({importedClasses})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-muted/30 border-2 border-dashed border-muted-foreground/30" />
              <span>Pendiente ({45 - importedClasses})</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products vs Services */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Package className="h-4 w-4 text-blue-500" />
              Clases de Productos (1-34)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1">
              {classStatus.filter(c => c.class_type === 'product').map(c => (
                <Badge 
                  key={c.class_number}
                  variant={c.items_count > 0 ? 'default' : 'outline'}
                  className="text-xs"
                >
                  {NICE_CLASS_ICONS[c.class_number]} {c.class_number}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-purple-500" />
              Clases de Servicios (35-45)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1">
              {classStatus.filter(c => c.class_type === 'service').map(c => (
                <Badge 
                  key={c.class_number}
                  variant={c.items_count > 0 ? 'secondary' : 'outline'}
                  className="text-xs"
                >
                  {NICE_CLASS_ICONS[c.class_number]} {c.class_number}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
