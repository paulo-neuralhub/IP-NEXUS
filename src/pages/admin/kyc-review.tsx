// src/pages/admin/kyc-review.tsx
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
  Shield, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Eye,
  User,
  FileText,
  ExternalLink
} from 'lucide-react';
import { useReviewVerification } from '@/hooks/market/useModeration';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

function useKycQueue(status: string) {
  return useQuery({
    queryKey: ['kyc-queue', status],
    queryFn: async () => {
      const statusMap: Record<string, string[]> = {
        pending: ['pending', 'in_review'],
        in_review: ['in_review'],
        approved: ['approved'],
        rejected: ['rejected'],
      };
      
      const { data, error } = await (supabase
        .from('market_verifications' as any)
        .select(`
          *,
          documents:market_verification_documents(*)
        `)
        .in('status', statusMap[status] || ['pending'])
        .order('submitted_at', { ascending: true })
        .limit(50) as any);

      if (error) throw error;
      return data || [];
    },
  });
}

export default function KycReviewPage() {
  const [selectedVerification, setSelectedVerification] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [filter, setFilter] = useState('pending');
  
  const { data: queue = [], isLoading } = useKycQueue(filter);
  const reviewMutation = useReviewVerification();

  const handleApprove = async (id: string) => {
    await reviewMutation.mutateAsync({ verificationId: id, decision: 'approve' });
    setSelectedVerification(null);
  };

  const handleReject = async (id: string) => {
    await reviewMutation.mutateAsync({ 
      verificationId: id, 
      decision: 'reject', 
      rejectionReason 
    });
    setSelectedVerification(null);
    setRejectionReason('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Revisión KYC
          </h1>
          <p className="text-muted-foreground">
            Revisa y aprueba las verificaciones de usuarios
          </p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar usuario..." className="pl-9 w-64" />
        </div>
      </div>

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="h-4 w-4" />
            Pendientes
          </TabsTrigger>
          <TabsTrigger value="in_review" className="gap-2">
            <Eye className="h-4 w-4" />
            En Revisión
          </TabsTrigger>
          <TabsTrigger value="approved" className="gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Aprobadas
          </TabsTrigger>
          <TabsTrigger value="rejected" className="gap-2">
            <XCircle className="h-4 w-4" />
            Rechazadas
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
                  No hay verificaciones {filter === 'pending' ? 'pendientes' : ''}
                </div>
              ) : (
                <div className="divide-y">
                  {queue.map((item: any) => (
                    <div 
                      key={item.id}
                      className="p-4 flex items-center justify-between hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                          <User className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">{item.user_id?.substring(0, 8) || 'Usuario'}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Badge variant="outline">{item.type}</Badge>
                            <span>•</span>
                            <span>
                              {item.submitted_at && format(new Date(item.submitted_at), 'dd MMM yyyy HH:mm', { locale: es })}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedVerification(item)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Revisar
                        </Button>
                        {filter === 'pending' && (
                          <>
                            <Button 
                              variant="default" 
                              size="sm"
                              onClick={() => handleApprove(item.id)}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Aprobar
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => setSelectedVerification(item)}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Rechazar
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Detail Sheet */}
      <Sheet open={!!selectedVerification} onOpenChange={() => setSelectedVerification(null)}>
        <SheetContent className="w-[500px] sm:max-w-[500px]">
          <SheetHeader>
            <SheetTitle>Detalle de Verificación</SheetTitle>
          </SheetHeader>
          
          {selectedVerification && (
            <div className="mt-6 space-y-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Tipo</p>
                <Badge>{selectedVerification.type}</Badge>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Datos enviados</p>
                <pre className="p-3 bg-muted rounded-lg text-xs overflow-auto">
                  {JSON.stringify(selectedVerification.metadata, null, 2)}
                </pre>
              </div>

              {selectedVerification.documents?.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Documentos</p>
                  <div className="space-y-2">
                    {selectedVerification.documents.map((doc: any) => (
                      <a
                        key={doc.id}
                        href={doc.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2 bg-muted rounded hover:bg-muted/80"
                      >
                        <FileText className="h-4 w-4" />
                        <span className="text-sm flex-1">{doc.file_name}</span>
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {filter === 'pending' && (
                <div className="space-y-4 pt-4 border-t">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Motivo de rechazo (opcional)</p>
                    <Textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Especifica el motivo si vas a rechazar..."
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      className="flex-1"
                      onClick={() => handleApprove(selectedVerification.id)}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Aprobar
                    </Button>
                    <Button 
                      variant="destructive"
                      className="flex-1"
                      onClick={() => handleReject(selectedVerification.id)}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Rechazar
                    </Button>
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
