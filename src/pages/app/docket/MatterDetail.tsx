import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Pencil, MoreHorizontal, Trash2, Copy, 
  Calendar, DollarSign, User, Tag, FileText, History,
  Upload, Download, File, X, Clock, MessageSquare, Users, Building2
} from 'lucide-react';
import { useMatter, useMatterDocuments, useMatterEvents, useDeleteMatter } from '@/hooks/use-matters';
import { MatterTimeWidget } from '@/components/timetracking';
import { useOrganization } from '@/contexts/organization-context';
import { MatterStatusBadge, MatterTypeBadge, ExpiryIndicator, DocumentList } from '@/components/features/docket';
import { MatterPresence, MatterComments, MatterActivityFeed } from '@/components/collaboration';
import { MatterOfficialTab, MatterOfficeWidget } from '@/components/matters';
import { MATTER_TYPES, MATTER_STATUSES, MARK_TYPES, JURISDICTIONS } from '@/lib/constants/matters';
import type { MatterType, MatterStatus, MarkType, Matter } from '@/types/matters';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function MatterDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentOrganization } = useOrganization();
  const deleteMatter = useDeleteMatter();
  
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  
  const { data: matter, isLoading, error } = useMatter(id!);
  const { data: documents } = useMatterDocuments(id!);
  const { data: events } = useMatterEvents(id!);
  
  const handleDelete = async () => {
    try {
      await deleteMatter.mutateAsync(id!);
      toast({ title: 'Expediente eliminado' });
      navigate('/app/docket');
    } catch {
      toast({ title: 'Error al eliminar', variant: 'destructive' });
    }
  };

  const handleDownloadDocument = async (filePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('matter-documents')
        .download(filePath);
      
      if (error) throw error;
      
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast({ title: 'Error al descargar', variant: 'destructive' });
    }
  };
  
  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-48" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Skeleton className="h-96 w-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !matter) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <EmptyState
              icon={<FileText className="h-8 w-8" />}
              title="Expediente no encontrado"
              description="El expediente que buscas no existe o no tienes acceso."
              action={
                <Button onClick={() => navigate('/app/docket')}>
                  Volver a la lista
                </Button>
              }
            />
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const jurisdiction = JURISDICTIONS.find(j => j.code === matter.jurisdiction_code);
  
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/app/docket')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <p className="text-sm text-muted-foreground">{matter.reference}</p>
            <h1 className="text-2xl font-bold">{matter.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <MatterTypeBadge type={matter.type as MatterType} />
              {jurisdiction && (
                <Badge variant="outline">{jurisdiction.code}</Badge>
              )}
              <MatterStatusBadge status={matter.status as MatterStatus} />
            </div>
          </div>
        </div>
        
        {/* Presence indicators + Actions */}
        <div className="flex items-center gap-4">
          <MatterPresence matterId={id!} />
          
          <div className="flex items-center gap-2">
            <Button onClick={() => navigate(`/app/docket/${id}/edit`)}>
              <Pencil className="h-4 w-4 mr-2" />
              Editar
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => toast({ title: 'Duplicar', description: 'Próximamente' })}>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-destructive focus:text-destructive"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="info">
                <FileText className="h-4 w-4 mr-2" />
                Información
              </TabsTrigger>
              <TabsTrigger value="official">
                <Building2 className="h-4 w-4 mr-2" />
                Oficial
              </TabsTrigger>
              <TabsTrigger value="documents">
                <Upload className="h-4 w-4 mr-2" />
                Documentos ({documents?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="history">
                <History className="h-4 w-4 mr-2" />
                Historial
              </TabsTrigger>
              <TabsTrigger value="time">
                <Clock className="h-4 w-4 mr-2" />
                Tiempo
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="info" className="space-y-4 mt-4">
              {/* Datos generales */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Datos Generales</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <dt className="text-muted-foreground">Referencia</dt>
                      <dd className="font-medium">{matter.reference}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Título</dt>
                      <dd className="font-medium">{matter.title}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Tipo</dt>
                      <dd><MatterTypeBadge type={matter.type as MatterType} /></dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Estado</dt>
                      <dd><MatterStatusBadge status={matter.status as MatterStatus} /></dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Jurisdicción</dt>
                      <dd className="font-medium">{jurisdiction?.name || matter.jurisdiction || '—'}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
              
              {/* Datos de Marca */}
              {matter.type === 'trademark' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Datos de Marca</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Mark Image */}
                    {(matter as Matter).mark_image_url && (
                      <div className="flex justify-center">
                        <img 
                          src={(matter as Matter).mark_image_url!} 
                          alt={matter.mark_name || matter.title}
                          className="max-w-full max-h-48 rounded-lg border object-contain bg-muted"
                        />
                      </div>
                    )}
                    <dl className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <dt className="text-muted-foreground">Nombre de marca</dt>
                        <dd className="font-medium">{matter.mark_name || '—'}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Tipo de marca</dt>
                        <dd className="font-medium">
                          {matter.mark_type ? MARK_TYPES[matter.mark_type as MarkType] : '—'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Nº Solicitud</dt>
                        <dd className="font-medium">{matter.application_number || '—'}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Nº Registro</dt>
                        <dd className="font-medium">{matter.registration_number || '—'}</dd>
                      </div>
                      <div className="col-span-2">
                        <dt className="text-muted-foreground">Clases Niza</dt>
                        <dd className="flex flex-wrap gap-1 mt-1">
                          {matter.nice_classes?.length ? (
                            matter.nice_classes.map(c => (
                              <Badge key={c} variant="secondary">Clase {c}</Badge>
                            ))
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </dd>
                      </div>
                      {matter.goods_services && (
                        <div className="col-span-2">
                          <dt className="text-muted-foreground">Productos/Servicios</dt>
                          <dd className="font-medium mt-1">{matter.goods_services}</dd>
                        </div>
                      )}
                    </dl>
                  </CardContent>
                </Card>
              )}
              
              {/* Titular */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Titular</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-medium">{matter.owner_name || 'No especificado'}</p>
                </CardContent>
              </Card>
              
              {/* Notas */}
              {matter.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Notas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm whitespace-pre-wrap">{matter.notes}</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="official" className="mt-4">
              <MatterOfficialTab matterId={id!} />
            </TabsContent>
            
            <TabsContent value="documents" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  <DocumentList matterId={id!} />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="history" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Historial de Eventos</CardTitle>
                </CardHeader>
                <CardContent>
                  {!events?.length ? (
                    <EmptyState
                      icon={<History className="h-8 w-8" />}
                      title="Sin eventos"
                      description="No hay eventos registrados para este expediente."
                    />
                  ) : (
                    <div className="relative pl-6 border-l-2 border-muted space-y-6">
                      {events.map((event, i) => (
                        <div key={event.id} className="relative">
                          <div className="absolute -left-[25px] w-4 h-4 rounded-full bg-primary border-2 border-background" />
                          <div>
                            <p className="text-sm font-medium">{event.title}</p>
                            {event.description && (
                              <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                              {event.event_date ? formatDate(event.event_date) : formatDate(event.created_at)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="time" className="mt-4">
              <MatterTimeWidget 
                matterId={id!}
                matterReference={matter.reference}
                matterTitle={matter.title}
              />
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-4">
          {/* Fechas clave */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Fechas Clave
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Presentación</span>
                <span className="font-medium">
                  {matter.filing_date ? formatDate(matter.filing_date) : '—'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Registro</span>
                <span className="font-medium">
                  {matter.registration_date ? formatDate(matter.registration_date) : '—'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Vencimiento</span>
                <ExpiryIndicator date={matter.expiry_date} />
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Próx. renovación</span>
                <span className="font-medium">
                  {matter.next_renewal_date ? formatDate(matter.next_renewal_date) : '—'}
                </span>
              </div>
            </CardContent>
          </Card>
          
          {/* Costes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Costes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tasas oficiales</span>
                <span className="font-medium">
                  {formatCurrency(matter.official_fees || 0, matter.currency || 'EUR')}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Honorarios</span>
                <span className="font-medium">
                  {formatCurrency(matter.professional_fees || 0, matter.currency || 'EUR')}
                </span>
              </div>
              <div className="border-t pt-2 flex justify-between text-sm">
                <span className="font-medium">Total</span>
                <span className="font-bold text-primary">
                  {formatCurrency(matter.total_cost || 0, matter.currency || 'EUR')}
                </span>
              </div>
            </CardContent>
          </Card>
          
          {/* Office Status Widget */}
          <MatterOfficeWidget 
            matterId={id!} 
            onViewDetail={() => setActiveTab('official')}
          />
          
          {/* Tags */}
          {matter.tags && matter.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Tags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {matter.tags.map(tag => (
                    <Badge key={tag} variant="secondary">#{tag}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Comments - Real-time collaboration */}
          <MatterComments matterId={id!} />
          
          {/* Activity Feed */}
          <MatterActivityFeed matterId={id!} />
        </div>
      </div>
      
      {/* Delete confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar expediente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminarán todos los documentos y eventos asociados a "{matter.reference}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
