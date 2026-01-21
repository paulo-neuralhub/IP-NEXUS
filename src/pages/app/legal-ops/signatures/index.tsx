/**
 * Lista global de solicitudes de firma
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Search, MoreHorizontal, FileSignature, Eye, Download, Bell,
  XCircle, ExternalLink, Loader2
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  useSignatureRequests,
  useVoidSignatureRequest,
  useSendReminder
} from '@/hooks/signatures/useSignatureRequests';
import { SignatureStatusBadge } from '@/components/signatures/SignatureStatusBadge';
import { SignerProgress } from '@/components/signatures/SignerProgress';

export default function SignatureRequestsList() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: requests, isLoading } = useSignatureRequests({
    status: statusFilter,
  });

  const voidRequest = useVoidSignatureRequest();
  const sendReminder = useSendReminder();

  const filteredRequests = requests?.filter(r =>
    r.document_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.matter?.reference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.matter?.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendReminder = async (requestId: string) => {
    await sendReminder.mutateAsync(requestId);
  };

  const handleVoid = async (requestId: string) => {
    if (!confirm('¿Seguro que quieres anular esta solicitud? Los firmantes ya no podrán firmar.')) return;
    await voidRequest.mutateAsync({ id: requestId });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Firmas electrónicas</h1>
        <p className="text-muted-foreground">
          Gestiona las solicitudes de firma de documentos
        </p>
      </div>

      {/* Filtros */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por documento o expediente..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-52">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="pending">Pendientes</SelectItem>
            <SelectItem value="completed">Completados</SelectItem>
            <SelectItem value="declined">Rechazados</SelectItem>
            <SelectItem value="expired">Expirados</SelectItem>
            <SelectItem value="voided">Anulados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lista */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredRequests?.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileSignature className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="font-medium text-lg mb-1">No hay solicitudes de firma</h3>
              <p className="text-sm text-muted-foreground">
                Las solicitudes de firma se crean desde los documentos de cada expediente.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredRequests?.map((request) => {
            const signedCount = request.signers.filter(s => s.signed_at).length;
            const totalSigners = request.signers.filter(s => s.role !== 'cc').length;
            const isPending = ['sent', 'viewed', 'partially_signed'].includes(request.status);

            return (
              <Card key={request.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <FileSignature className="w-5 h-5 text-muted-foreground shrink-0" />
                        <span className="font-medium truncate">{request.document_name}</span>
                      </div>

                      {request.matter && (
                        <Link
                          to={`/app/legal-ops/matters/${request.matter.id}`}
                          className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1"
                        >
                          Expediente: {request.matter.reference}
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}

                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <span>{signedCount}/{totalSigners} firmantes</span>
                        <span>•</span>
                        <span>
                          Creado {formatDistanceToNow(new Date(request.created_at), { locale: es, addSuffix: true })}
                        </span>
                        {request.expires_at && isPending && (
                          <>
                            <span>•</span>
                            <span>
                              Expira {format(new Date(request.expires_at), 'dd MMM yyyy', { locale: es })}
                            </span>
                          </>
                        )}
                        {request.completed_at && (
                          <>
                            <span>•</span>
                            <span className="text-green-600">
                              Completado {format(new Date(request.completed_at), 'dd MMM yyyy', { locale: es })}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <SignatureStatusBadge status={request.status} />

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => navigate(`/app/legal-ops/signatures/${request.id}`)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Ver detalles
                          </DropdownMenuItem>

                          {request.status === 'completed' && request.signed_document_url && (
                            <DropdownMenuItem asChild>
                              <a href={request.signed_document_url} target="_blank" rel="noopener noreferrer">
                                <Download className="w-4 h-4 mr-2" />
                                Descargar firmado
                              </a>
                            </DropdownMenuItem>
                          )}

                          {isPending && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleSendReminder(request.id)}
                                disabled={sendReminder.isPending}
                              >
                                <Bell className="w-4 h-4 mr-2" />
                                Enviar recordatorio
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                onClick={() => handleVoid(request.id)}
                                className="text-destructive"
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Anular solicitud
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Progress de firmantes */}
                  <div className="mt-4 pt-4 border-t">
                    <SignerProgress signers={request.signers} />
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
