// src/pages/admin/moderation.tsx
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle 
} from '@/components/ui/sheet';
import { 
  AlertTriangle, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Eye,
  Flag,
  MessageSquare,
  Package,
  User
} from 'lucide-react';
import { useResolveReport } from '@/hooks/market/useModeration';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const REPORT_TYPE_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
  spam: { label: 'Spam', icon: MessageSquare, color: 'bg-gray-100 text-gray-700' },
  fraud: { label: 'Fraude', icon: AlertTriangle, color: 'bg-red-100 text-red-700' },
  counterfeit: { label: 'Falsificación', icon: Package, color: 'bg-orange-100 text-orange-700' },
  inappropriate_content: { label: 'Contenido inapropiado', icon: Flag, color: 'bg-yellow-100 text-yellow-700' },
  copyright_violation: { label: 'Violación copyright', icon: AlertTriangle, color: 'bg-purple-100 text-purple-700' },
  misleading_info: { label: 'Info engañosa', icon: AlertTriangle, color: 'bg-blue-100 text-blue-700' },
  harassment: { label: 'Acoso', icon: User, color: 'bg-red-100 text-red-700' },
  other: { label: 'Otro', icon: Flag, color: 'bg-gray-100 text-gray-700' },
};

function useModerationList(status: string) {
  return useQuery({
    queryKey: ['moderation-list', status],
    queryFn: async () => {
      const statusMap: Record<string, string[]> = {
        pending: ['pending'],
        under_review: ['under_review'],
        resolved_valid: ['resolved_valid'],
        resolved_invalid: ['resolved_invalid'],
        escalated: ['escalated'],
      };
      
      const { data, error } = await (supabase
        .from('market_content_reports' as any)
        .select('*')
        .in('status', statusMap[status] || ['pending'])
        .order('created_at', { ascending: true })
        .limit(50) as any);

      if (error) throw error;
      return data || [];
    },
  });
}

export default function ModerationPage() {
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [filter, setFilter] = useState('pending');
  
  const { data: queue = [], isLoading } = useModerationList(filter);
  const resolveMutation = useResolveReport();

  const handleResolve = async (id: string, valid: boolean, action: 'none' | 'warning' | 'content_removed' | 'user_suspended' | 'user_banned') => {
    await resolveMutation.mutateAsync({ 
      reportId: id, 
      resolution: valid ? 'valid' : 'invalid',
      action,
      notes: resolutionNotes 
    });
    setSelectedReport(null);
    setResolutionNotes('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Flag className="h-6 w-6" />
            Moderación
          </h1>
          <p className="text-muted-foreground">
            Gestiona reportes de contenido y usuarios
          </p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar..." className="pl-9 w-64" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">12</div>
            <p className="text-sm text-muted-foreground">Pendientes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">5</div>
            <p className="text-sm text-muted-foreground">En revisión</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">48</div>
            <p className="text-sm text-muted-foreground">Resueltos (7d)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">2</div>
            <p className="text-sm text-muted-foreground">Escalados</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="h-4 w-4" />
            Pendientes
          </TabsTrigger>
          <TabsTrigger value="under_review" className="gap-2">
            <Eye className="h-4 w-4" />
            En Revisión
          </TabsTrigger>
          <TabsTrigger value="resolved_valid" className="gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Válidos
          </TabsTrigger>
          <TabsTrigger value="resolved_invalid" className="gap-2">
            <XCircle className="h-4 w-4" />
            Inválidos
          </TabsTrigger>
          <TabsTrigger value="escalated" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            Escalados
          </TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-4">
          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-8 text-center text-muted-foreground">
                  Cargando...
                </div>
              ) : queue.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  No hay reportes en esta categoría
                </div>
              ) : (
                <div className="divide-y">
                  {queue.map((item: any) => {
                    const config = REPORT_TYPE_CONFIG[item.report_type] || REPORT_TYPE_CONFIG.other;
                    const Icon = config.icon;
                    
                    return (
                      <div 
                        key={item.id}
                        className="p-4 flex items-center justify-between hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${config.color}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={config.color}>
                                {config.label}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {item.reported_entity_type}
                              </span>
                            </div>
                            <p className="text-sm mt-1 line-clamp-1">
                              {item.description}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {item.created_at && format(new Date(item.created_at), 'dd MMM yyyy HH:mm', { locale: es })}
                            </p>
                          </div>
                        </div>

                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedReport(item)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Revisar
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Detail Sheet */}
      <Sheet open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
        <SheetContent className="w-[500px] sm:max-w-[500px]">
          <SheetHeader>
            <SheetTitle>Detalle del Reporte</SheetTitle>
          </SheetHeader>
          
          {selectedReport && (
            <div className="mt-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Tipo</p>
                  <Badge className={REPORT_TYPE_CONFIG[selectedReport.report_type]?.color}>
                    {REPORT_TYPE_CONFIG[selectedReport.report_type]?.label}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Entidad</p>
                  <p className="font-medium">{selectedReport.reported_entity_type}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Descripción</p>
                <p className="text-sm bg-muted p-3 rounded-lg">
                  {selectedReport.description}
                </p>
              </div>

              {selectedReport.evidence_urls?.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Evidencia</p>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedReport.evidence_urls.map((url: string, i: number) => (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block aspect-video bg-muted rounded overflow-hidden"
                      >
                        <img src={url} alt="" className="w-full h-full object-cover" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {filter === 'pending' && (
                <div className="space-y-4 pt-4 border-t">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Notas de resolución</p>
                    <Textarea
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                      placeholder="Documenta tu decisión..."
                    />
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Acciones</p>
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        variant="outline"
                        onClick={() => handleResolve(selectedReport.id, false, 'none')}
                      >
                        Reporte inválido
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => handleResolve(selectedReport.id, true, 'warning')}
                      >
                        Enviar aviso
                      </Button>
                      <Button 
                        variant="destructive"
                        onClick={() => handleResolve(selectedReport.id, true, 'content_removed')}
                      >
                        Eliminar contenido
                      </Button>
                      <Button 
                        variant="destructive"
                        onClick={() => handleResolve(selectedReport.id, true, 'user_suspended')}
                      >
                        Suspender usuario
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
