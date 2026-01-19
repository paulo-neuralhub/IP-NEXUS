import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Upload, 
  Download, 
  RefreshCw, 
  FileText, 
  Plus, 
  Clock, 
  CheckCircle2,
  XCircle,
  Loader2,
  MoreHorizontal,
  Eye,
  RotateCcw,
  Trash2,
  Database,
  ArrowRightLeft
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ImportWizard } from '@/components/import-export/import-wizard';
import { ExportWizard } from '@/components/import-export/export-wizard';
import { MigrationWizard } from '@/components/import-export/migration-wizard';
import { useImportJobsV2, useExportJobs, useMigrationJobs } from '@/hooks/import-export';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const ENTITY_TYPES = [
  { value: 'asset', label: 'Activos / Expedientes' },
  { value: 'contact', label: 'Contactos' },
  { value: 'deadline', label: 'Plazos / Vencimientos' },
  { value: 'cost', label: 'Costes' }
];

export default function ImportExportPage() {
  const [importWizardOpen, setImportWizardOpen] = useState(false);
  const [exportWizardOpen, setExportWizardOpen] = useState(false);
  const [migrationWizardOpen, setMigrationWizardOpen] = useState(false);
  const [selectedEntityType, setSelectedEntityType] = useState('asset');

  const { data: importJobs, isLoading: loadingImports } = useImportJobsV2();
  const { data: exportJobs, isLoading: loadingExports } = useExportJobs();
  const { data: migrationJobs, isLoading: loadingMigrations } = useMigrationJobs();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
          <CheckCircle2 className="h-3 w-3 mr-1" />Completado
        </Badge>;
      case 'processing':
        return <Badge className="bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400">
          <Loader2 className="h-3 w-3 mr-1 animate-spin" />Procesando
        </Badge>;
      case 'failed':
        return <Badge variant="destructive">
          <XCircle className="h-3 w-3 mr-1" />Fallido
        </Badge>;
      case 'pending':
        return <Badge variant="outline">
          <Clock className="h-3 w-3 mr-1" />Pendiente
        </Badge>;
      case 'completed_with_errors':
        return <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
          Parcial
        </Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Import / Export</h1>
          <p className="text-muted-foreground">
            Gestiona la importación, exportación y migración de datos
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setMigrationWizardOpen(true)}>
            <ArrowRightLeft className="h-4 w-4 mr-2" />
            Migración
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setImportWizardOpen(true)}>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Importar datos</h3>
              <p className="text-sm text-muted-foreground">CSV, Excel, JSON, XML</p>
            </div>
            <Plus className="h-5 w-5 text-muted-foreground" />
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setExportWizardOpen(true)}>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <Download className="h-6 w-6 text-emerald-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Exportar datos</h3>
              <p className="text-sm text-muted-foreground">Descarga tus datos</p>
            </div>
            <Plus className="h-5 w-5 text-muted-foreground" />
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setMigrationWizardOpen(true)}>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="h-12 w-12 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
              <Database className="h-6 w-6 text-violet-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Migrar sistema</h3>
              <p className="text-sm text-muted-foreground">Desde otro software</p>
            </div>
            <Plus className="h-5 w-5 text-muted-foreground" />
          </CardContent>
        </Card>
      </div>

      {/* Entity Type Selector */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">Tipo de entidad:</span>
        <Select value={selectedEntityType} onValueChange={setSelectedEntityType}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ENTITY_TYPES.map(type => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tabs for Jobs */}
      <Tabs defaultValue="imports" className="w-full">
        <TabsList>
          <TabsTrigger value="imports" className="gap-2">
            <Upload className="h-4 w-4" />
            Importaciones
            {importJobs && importJobs.length > 0 && (
              <Badge variant="secondary" className="ml-1">{importJobs.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="exports" className="gap-2">
            <Download className="h-4 w-4" />
            Exportaciones
            {exportJobs && exportJobs.length > 0 && (
              <Badge variant="secondary" className="ml-1">{exportJobs.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="migrations" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Migraciones
            {migrationJobs && migrationJobs.length > 0 && (
              <Badge variant="secondary" className="ml-1">{migrationJobs.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Import Jobs */}
        <TabsContent value="imports" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Historial de importaciones</CardTitle>
              <CardDescription>Trabajos de importación recientes</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingImports ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : !importJobs || importJobs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay importaciones recientes</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setImportWizardOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva importación
                  </Button>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {importJobs.map((job: any) => (
                      <div 
                        key={job.id} 
                        className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <FileText className="h-8 w-8 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{job.source_file_name || job.file_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {job.entity_type} • {job.total_rows} registros
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {getStatusBadge(job.status)}
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(job.created_at), "d MMM yyyy HH:mm", { locale: es })}
                          </span>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                Ver detalles
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <RotateCcw className="h-4 w-4 mr-2" />
                                Rollback
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Export Jobs */}
        <TabsContent value="exports" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Historial de exportaciones</CardTitle>
              <CardDescription>Archivos exportados recientemente</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingExports ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : !exportJobs || exportJobs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Download className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay exportaciones recientes</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setExportWizardOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva exportación
                  </Button>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {exportJobs.map((job: any) => (
                      <div 
                        key={job.id} 
                        className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <Download className="h-8 w-8 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{job.entity_type}.{job.target_format}</p>
                            <p className="text-sm text-muted-foreground">
                              {job.total_records || 0} registros
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {getStatusBadge(job.status)}
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(job.created_at), "d MMM yyyy HH:mm", { locale: es })}
                          </span>
                          {job.file_url && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => window.open(job.file_url, '_blank')}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Migration Jobs */}
        <TabsContent value="migrations" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Historial de migraciones</CardTitle>
              <CardDescription>Migraciones de sistemas externos</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingMigrations ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : !migrationJobs || migrationJobs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay migraciones recientes</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setMigrationWizardOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva migración
                  </Button>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {migrationJobs.map((job: any) => (
                      <div 
                        key={job.id} 
                        className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <RefreshCw className="h-8 w-8 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Migración #{String(job.id).slice(0, 8)}</p>
                            <p className="text-sm text-muted-foreground">
                              {job.stats ? (Object.values(job.stats as any) as any[]).reduce((acc: number, s: any) => acc + (s.processed || 0), 0) : 0} registros procesados
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {getStatusBadge(job.status)}
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(job.created_at), "d MMM yyyy HH:mm", { locale: es })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Wizards */}
      <ImportWizard 
        open={importWizardOpen} 
        onOpenChange={setImportWizardOpen}
        entityType={selectedEntityType}
      />
      <ExportWizard 
        open={exportWizardOpen} 
        onOpenChange={setExportWizardOpen}
        entityType={selectedEntityType}
      />
      <MigrationWizard 
        open={migrationWizardOpen} 
        onOpenChange={setMigrationWizardOpen}
      />
    </div>
  );
}
