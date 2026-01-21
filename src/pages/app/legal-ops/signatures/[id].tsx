/**
 * Detalle de solicitud de firma con timeline
 */

import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft, FileSignature, Download, Bell, XCircle, ExternalLink,
  Clock, CheckCircle, Eye, Send, AlertCircle, Loader2, Mail,
  User, Calendar, FileText
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  useSignatureRequest,
  useSignatureAuditLog,
  useVoidSignatureRequest,
  useSendReminder
} from '@/hooks/signatures/useSignatureRequests';
import { SignatureStatusBadge } from '@/components/signatures/SignatureStatusBadge';
import { SignerProgress } from '@/components/signatures/SignerProgress';
import { cn } from '@/lib/utils';

const auditActionConfig: Record<string, { icon: React.ElementType; label: string; color: string }> = {
  created: { icon: FileSignature, label: 'Solicitud creada', color: 'text-muted-foreground' },
  sent: { icon: Send, label: 'Enviado a firmantes', color: 'text-blue-600' },
  viewed: { icon: Eye, label: 'Documento visualizado', color: 'text-blue-600' },
  signed: { icon: CheckCircle, label: 'Documento firmado', color: 'text-green-600' },
  declined: { icon: XCircle, label: 'Firma rechazada', color: 'text-destructive' },
  reminder_sent: { icon: Bell, label: 'Recordatorio enviado', color: 'text-amber-600' },
  expired: { icon: Clock, label: 'Solicitud expirada', color: 'text-muted-foreground' },
  voided: { icon: AlertCircle, label: 'Solicitud anulada', color: 'text-destructive' },
  completed: { icon: CheckCircle, label: 'Proceso completado', color: 'text-green-600' },
  document_downloaded: { icon: Download, label: 'Documento descargado', color: 'text-muted-foreground' },
};

const roleLabels = {
  signer: 'Firmante',
  approver: 'Aprobador',
  cc: 'Copia',
};

export default function SignatureRequestDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: request, isLoading } = useSignatureRequest(id);
  const { data: auditLog } = useSignatureAuditLog(id);
  const voidRequest = useVoidSignatureRequest();
  const sendReminder = useSendReminder();

  const handleSendReminder = async () => {
    if (id) await sendReminder.mutateAsync(id);
  };

  const handleVoid = async () => {
    if (!id || !confirm('¿Seguro que quieres anular esta solicitud?')) return;
    await voidRequest.mutateAsync({ id });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Solicitud no encontrada</p>
        <Button variant="link" onClick={() => navigate(-1)}>Volver</Button>
      </div>
    );
  }

  const isPending = ['sent', 'viewed', 'partially_signed'].includes(request.status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold">{request.document_name}</h1>
              <SignatureStatusBadge status={request.status} />
            </div>
            {request.matter && (
              <Link
                to={`/app/legal-ops/matters/${request.matter.id}`}
                className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1"
              >
                Expediente: {request.matter.reference} - {request.matter.title}
                <ExternalLink className="w-3 h-3" />
              </Link>
            )}
          </div>
        </div>

        {isPending && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleSendReminder}
              disabled={sendReminder.isPending}
            >
              <Bell className="w-4 h-4 mr-2" />
              Recordatorio
            </Button>
            <Button
              variant="outline"
              onClick={handleVoid}
              disabled={voidRequest.isPending}
              className="text-destructive"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Anular
            </Button>
          </div>
        )}

        {request.status === 'completed' && request.signed_document_url && (
          <Button asChild>
            <a href={request.signed_document_url} target="_blank" rel="noopener noreferrer">
              <Download className="w-4 h-4 mr-2" />
              Descargar firmado
            </a>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Firmantes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Firmantes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {request.signers.map((signer, index) => {
                const isSigned = !!signer.signed_at;
                const isViewed = !!signer.viewed_at;
                const isDeclined = !!signer.declined_at;

                return (
                  <div
                    key={signer.id}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-lg border",
                      isDeclined
                        ? "bg-destructive/5 border-destructive/20"
                        : isSigned
                          ? "bg-green-50 border-green-200"
                          : isViewed
                            ? "bg-blue-50 border-blue-200"
                            : "bg-muted/30"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center font-medium",
                      isDeclined
                        ? "bg-destructive/10 text-destructive"
                        : isSigned
                          ? "bg-green-100 text-green-700"
                          : isViewed
                            ? "bg-blue-100 text-blue-700"
                            : "bg-muted text-muted-foreground"
                    )}>
                      {isDeclined ? '✗' : isSigned ? '✓' : index + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{signer.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {roleLabels[signer.role]}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{signer.email}</p>
                    </div>

                    <div className="text-right text-sm">
                      {isDeclined ? (
                        <span className="text-destructive">
                          Rechazado {format(new Date(signer.declined_at!), 'dd/MM/yy HH:mm')}
                        </span>
                      ) : isSigned ? (
                        <span className="text-green-600">
                          Firmado {format(new Date(signer.signed_at!), 'dd/MM/yy HH:mm')}
                        </span>
                      ) : isViewed ? (
                        <span className="text-blue-600">
                          Visto {format(new Date(signer.viewed_at!), 'dd/MM/yy HH:mm')}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Pendiente</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Timeline de auditoría */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Historial de actividad</CardTitle>
            </CardHeader>
            <CardContent>
              {auditLog && auditLog.length > 0 ? (
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
                  <div className="space-y-4">
                    {auditLog.map((event, index) => {
                      const config = auditActionConfig[event.action] || {
                        icon: FileSignature,
                        label: event.action,
                        color: 'text-muted-foreground'
                      };
                      const Icon = config.icon;

                      return (
                        <div key={event.id} className="flex gap-4 relative">
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center bg-background border z-10",
                            config.color
                          )}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 pt-1">
                            <p className="font-medium">{config.label}</p>
                            {event.actor_email && (
                              <p className="text-sm text-muted-foreground">
                                {event.actor_name || event.actor_email}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                              {format(new Date(event.created_at), 'dd MMM yyyy HH:mm', { locale: es })}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No hay eventos registrados
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Información</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Documento</p>
                  <a
                    href={request.document_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    Ver original
                  </a>
                </div>
              </div>

              <Separator />

              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Fecha de envío</p>
                  <p className="text-sm">
                    {request.sent_at
                      ? format(new Date(request.sent_at), 'dd MMM yyyy HH:mm', { locale: es })
                      : 'No enviado'}
                  </p>
                </div>
              </div>

              {request.expires_at && (
                <>
                  <Separator />
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Expira</p>
                      <p className="text-sm">
                        {format(new Date(request.expires_at), 'dd MMM yyyy', { locale: es })}
                      </p>
                    </div>
                  </div>
                </>
              )}

              {request.created_by_user && (
                <>
                  <Separator />
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Creado por</p>
                      <p className="text-sm">{request.created_by_user.full_name}</p>
                    </div>
                  </div>
                </>
              )}

              {request.reminder_sent_count > 0 && (
                <>
                  <Separator />
                  <div className="flex items-center gap-3">
                    <Bell className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Recordatorios enviados</p>
                      <p className="text-sm">{request.reminder_sent_count}</p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Mensaje */}
          {request.email_message && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Mensaje para firmantes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {request.email_message}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Progreso visual */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Progreso</CardTitle>
            </CardHeader>
            <CardContent>
              <SignerProgress signers={request.signers} size="lg" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
