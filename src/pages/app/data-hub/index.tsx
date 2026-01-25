import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Database, Upload, Download, RefreshCw, 
  Plus, FileSpreadsheet, FileJson, FileText,
  Clock, CheckCircle, XCircle, Loader2,
  Settings, Plug, BarChart3, ArrowRightLeft, Globe
} from 'lucide-react';
import { useImports, useDataConnectors, useSyncJobs, useTestConnector, useSyncConnector } from '@/hooks/use-data-hub';
import { IMPORT_STATUSES, IMPORT_TYPES, CONNECTOR_TYPES, CONNECTION_STATUSES } from '@/lib/constants/data-hub';
import type { Import, DataConnector, SyncJob, ImportStatus, ConnectionStatus } from '@/types/data-hub';
import { ImportWizardModal } from './components/import-wizard-modal';
import { ExportModal } from './components/export-modal';
import { ConnectorModal } from './components/connector-modal';
import { MigratorTab } from './migrator-tab';
import { UniversalTab } from './universal-tab';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { InlineHelp } from '@/components/help';

export default function DataHubPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';
  const setActiveTab = (tab: string) => setSearchParams({ tab });
  
  const [showImportWizard, setShowImportWizard] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showConnectorModal, setShowConnectorModal] = useState(false);
  
  const { data: imports = [] } = useImports();
  const { data: connectors = [] } = useDataConnectors();
  const { data: syncJobs = [] } = useSyncJobs();
  
  // Stats
  const stats = {
    totalImports: imports.length,
    completedImports: imports.filter(i => i.status === 'completed').length,
    totalRecordsImported: imports.reduce((sum, i) => sum + (i.success_rows || 0), 0),
    activeConnectors: connectors.filter(c => c.connection_status === 'connected').length,
    totalConnectors: connectors.length,
    totalSyncJobs: syncJobs.length,
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Database className="h-8 w-8 text-slate-600" />
            Data Hub
            <InlineHelp text="Centro de datos para importar, exportar, migrar y sincronizar información desde múltiples fuentes. Conecta con oficinas de PI, archivos Excel/CSV o sistemas externos." />
          </h1>
          <p className="text-muted-foreground mt-1">
            Centraliza, importa, migra y sincroniza todos tus datos
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowExportModal(true)}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={() => setShowImportWizard(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Importar
          </Button>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Importaciones</p>
                <p className="text-2xl font-bold">{stats.completedImports}/{stats.totalImports}</p>
              </div>
              <Upload className="h-8 w-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Registros Importados</p>
                <p className="text-2xl font-bold">{stats.totalRecordsImported.toLocaleString()}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conectores Activos</p>
                <p className="text-2xl font-bold">{stats.activeConnectors}/{stats.totalConnectors}</p>
              </div>
              <Plug className="h-8 w-8 text-purple-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sincronizaciones</p>
                <p className="text-2xl font-bold">{stats.totalSyncJobs}</p>
              </div>
              <RefreshCw className="h-8 w-8 text-orange-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Tabs - Consolidated */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-6 w-full max-w-3xl">
          <TabsTrigger value="overview">Vista General</TabsTrigger>
          <TabsTrigger value="imports">Importaciones</TabsTrigger>
          <TabsTrigger value="connectors">Conectores</TabsTrigger>
          <TabsTrigger value="sync">Sincronización</TabsTrigger>
          <TabsTrigger value="migrator" className="flex items-center gap-1">
            <ArrowRightLeft className="h-3 w-3" />
            Migrator
          </TabsTrigger>
          <TabsTrigger value="universal" className="flex items-center gap-1">
            <Globe className="h-3 w-3" />
            Universal
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <OverviewTab 
            imports={imports} 
            connectors={connectors}
            onImport={() => setShowImportWizard(true)}
            onExport={() => setShowExportModal(true)}
            onAddConnector={() => setShowConnectorModal(true)}
          />
        </TabsContent>
        
        <TabsContent value="imports">
          <ImportsTab imports={imports} onNewImport={() => setShowImportWizard(true)} />
        </TabsContent>
        
        <TabsContent value="connectors">
          <ConnectorsTab connectors={connectors} onAddConnector={() => setShowConnectorModal(true)} />
        </TabsContent>
        
        <TabsContent value="sync">
          <SyncJobsTab syncJobs={syncJobs} />
        </TabsContent>
        
        <TabsContent value="migrator">
          <MigratorTab />
        </TabsContent>
        
        <TabsContent value="universal">
          <UniversalTab />
        </TabsContent>
      </Tabs>
      
      {/* Modals */}
      <ImportWizardModal 
        open={showImportWizard} 
        onOpenChange={setShowImportWizard} 
      />
      
      <ExportModal 
        open={showExportModal} 
        onOpenChange={setShowExportModal} 
      />
      
      <ConnectorModal 
        open={showConnectorModal} 
        onOpenChange={setShowConnectorModal} 
      />
    </div>
  );
}

// Overview Tab
function OverviewTab({ 
  imports, 
  connectors, 
  onImport, 
  onExport, 
  onAddConnector 
}: {
  imports: Import[];
  connectors: DataConnector[];
  onImport: () => void;
  onExport: () => void;
  onAddConnector: () => void;
}) {
  const recentImports = imports.slice(0, 5);
  const activeConnectors = connectors.filter(c => c.connection_status === 'connected');
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
          <CardDescription>Importa o exporta datos rápidamente</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="h-24 flex-col" onClick={onImport}>
              <FileSpreadsheet className="h-8 w-8 mb-2 text-green-600" />
              <span>Importar Excel</span>
            </Button>
            <Button variant="outline" className="h-24 flex-col" onClick={onImport}>
              <FileText className="h-8 w-8 mb-2 text-blue-600" />
              <span>Importar CSV</span>
            </Button>
            <Button variant="outline" className="h-24 flex-col" onClick={onExport}>
              <Download className="h-8 w-8 mb-2 text-orange-600" />
              <span>Exportar Todo</span>
            </Button>
            <Button variant="outline" className="h-24 flex-col" onClick={onAddConnector}>
              <Plug className="h-8 w-8 mb-2 text-purple-600" />
              <span>Nuevo Conector</span>
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Recent Imports */}
      <Card>
        <CardHeader>
          <CardTitle>Importaciones Recientes</CardTitle>
          <CardDescription>Últimas 5 importaciones</CardDescription>
        </CardHeader>
        <CardContent>
          {recentImports.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Upload className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay importaciones recientes</p>
              <Button variant="link" onClick={onImport}>
                Crear primera importación
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentImports.map(imp => (
                <div key={imp.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <ImportStatusIcon status={imp.status} />
                    <div>
                      <p className="font-medium text-sm">{imp.file_name || 'Sin nombre'}</p>
                      <p className="text-xs text-muted-foreground">
                        {imp.success_rows} de {imp.total_rows} registros
                      </p>
                    </div>
                  </div>
                  <ImportStatusBadge status={imp.status} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Active Connectors */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Conectores Activos</CardTitle>
          <CardDescription>Integraciones sincronizando datos</CardDescription>
        </CardHeader>
        <CardContent>
          {activeConnectors.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Plug className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay conectores activos</p>
              <Button variant="link" onClick={onAddConnector}>
                Configurar conector
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {activeConnectors.map(conn => {
                const connectorInfo = CONNECTOR_TYPES[conn.connector_type as keyof typeof CONNECTOR_TYPES];
                const ConnectorIcon = connectorInfo?.icon;
                return (
                  <div key={conn.id} className="flex items-center gap-3 p-4 border rounded-lg">
                    {ConnectorIcon && <ConnectorIcon className="h-6 w-6" style={{ color: connectorInfo?.color }} />}
                    <div className="flex-1">
                      <p className="font-medium">{conn.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Última sync: {conn.last_sync_at ? format(new Date(conn.last_sync_at), 'dd/MM HH:mm') : 'Nunca'}
                      </p>
                    </div>
                    <ConnectorStatusBadge status={conn.connection_status} />
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Imports Tab
function ImportsTab({ imports, onNewImport }: { imports: Import[]; onNewImport: () => void }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Historial de Importaciones</CardTitle>
          <CardDescription>Todas las importaciones realizadas</CardDescription>
        </div>
        <Button onClick={onNewImport}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Importación
        </Button>
      </CardHeader>
      <CardContent>
        {imports.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Upload className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg">No hay importaciones</p>
            <p className="text-sm">Importa expedientes, contactos, costes y más</p>
          </div>
        ) : (
          <div className="space-y-4">
            {imports.map(imp => {
              const importTypeInfo = IMPORT_TYPES[imp.import_type as keyof typeof IMPORT_TYPES];
              const ImportIcon = importTypeInfo?.icon;
              return (
                <div key={imp.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    {ImportIcon && (
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${importTypeInfo?.color}20` }}
                      >
                        <ImportIcon className="h-5 w-5" style={{ color: importTypeInfo?.color }} />
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{imp.file_name || 'Importación'}</p>
                      <p className="text-sm text-muted-foreground">
                        {importTypeInfo?.label} • {format(new Date(imp.created_at), 'dd/MM/yyyy HH:mm')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right text-sm">
                      <p className="font-medium">{imp.success_rows}/{imp.total_rows}</p>
                      <p className="text-muted-foreground">registros</p>
                    </div>
                    <ImportStatusBadge status={imp.status} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Connectors Tab
function ConnectorsTab({ connectors, onAddConnector }: { connectors: DataConnector[]; onAddConnector: () => void }) {
  const { mutate: testConnector, isPending: isTesting } = useTestConnector();
  const { mutate: syncConnector, isPending: isSyncing } = useSyncConnector();
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Conectores de Datos</CardTitle>
          <CardDescription>Integraciones con fuentes externas</CardDescription>
        </div>
        <Button onClick={onAddConnector}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Conector
        </Button>
      </CardHeader>
      <CardContent>
        {connectors.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Plug className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg">No hay conectores configurados</p>
            <p className="text-sm">Conecta con EUIPO, WIPO, Google Sheets y más</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {connectors.map(conn => {
              const connectorInfo = CONNECTOR_TYPES[conn.connector_type as keyof typeof CONNECTOR_TYPES];
              const ConnectorIcon = connectorInfo?.icon;
              return (
                <Card key={conn.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {ConnectorIcon && (
                          <div 
                            className="w-12 h-12 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: `${connectorInfo?.color}20` }}
                          >
                            <ConnectorIcon className="h-6 w-6" style={{ color: connectorInfo?.color }} />
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{conn.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {connectorInfo?.label}
                          </p>
                        </div>
                      </div>
                      <ConnectorStatusBadge status={conn.connection_status} />
                    </div>
                    
                    <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Última sync</p>
                        <p className="font-medium">
                          {conn.last_sync_at ? format(new Date(conn.last_sync_at), 'dd/MM HH:mm') : 'Nunca'}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Frecuencia</p>
                        <p className="font-medium capitalize">{conn.sync_frequency || 'Manual'}</p>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => testConnector(conn.id)}
                        disabled={isTesting}
                      >
                        <Settings className="h-4 w-4 mr-1" />
                        Test
                      </Button>
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => syncConnector({ connectorId: conn.id, syncType: 'incremental' })}
                        disabled={isSyncing}
                      >
                        <RefreshCw className={cn("h-4 w-4 mr-1", isSyncing && "animate-spin")} />
                        Sync
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Sync Jobs Tab
function SyncJobsTab({ syncJobs }: { syncJobs: SyncJob[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de Sincronizaciones</CardTitle>
        <CardDescription>Registro de todas las sincronizaciones</CardDescription>
      </CardHeader>
      <CardContent>
        {syncJobs.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <RefreshCw className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg">No hay sincronizaciones</p>
            <p className="text-sm">Las sincronizaciones aparecerán aquí</p>
          </div>
        ) : (
          <div className="space-y-4">
            {syncJobs.map(job => (
              <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <RefreshCw className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium">{job.connector?.name || 'Conector'}</p>
                    <p className="text-sm text-muted-foreground">
                      {job.sync_type} • {job.started_at ? format(new Date(job.started_at), 'dd/MM/yyyy HH:mm') : 'Pendiente'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right text-sm">
                    <p className="font-medium">{job.new_items + job.updated_items}</p>
                    <p className="text-muted-foreground">registros</p>
                  </div>
                  <Badge variant={job.status === 'completed' ? 'default' : job.status === 'failed' ? 'destructive' : 'secondary'}>
                    {job.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Helper Components
function ImportStatusIcon({ status }: { status: ImportStatus }) {
  switch (status) {
    case 'completed':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'failed':
      return <XCircle className="h-5 w-5 text-red-500" />;
    case 'validating':
    case 'importing':
      return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
    default:
      return <Clock className="h-5 w-5 text-gray-400" />;
  }
}

function ImportStatusBadge({ status }: { status: ImportStatus }) {
  const statusInfo = IMPORT_STATUSES[status];
  return (
    <Badge 
      variant={status === 'completed' ? 'default' : status === 'failed' ? 'destructive' : 'secondary'}
      style={{ backgroundColor: statusInfo?.bgColor, color: statusInfo?.color }}
    >
      {statusInfo?.label || status}
    </Badge>
  );
}

function ConnectorStatusBadge({ status }: { status: ConnectionStatus }) {
  const statusInfo = CONNECTION_STATUSES[status];
  return (
    <Badge 
      variant={status === 'connected' ? 'default' : status === 'error' ? 'destructive' : 'secondary'}
      style={{ backgroundColor: statusInfo?.bgColor, color: statusInfo?.color }}
    >
      {statusInfo?.label || status}
    </Badge>
  );
}
