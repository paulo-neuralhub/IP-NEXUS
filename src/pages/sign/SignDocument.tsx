/**
 * Página pública para firmar documentos
 * Ruta: /sign/:token (sin autenticación)
 */

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import SignaturePad from 'react-signature-canvas';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import {
  FileSignature, Check, X, Loader2, AlertCircle,
  Download, RefreshCw, CheckCircle, Building
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Json } from '@/integrations/supabase/types';

interface SignerInfo {
  id: string;
  name: string;
  email: string;
  role: string;
  signed_at: string | null;
  sign_token: string;
}

interface RequestInfo {
  id: string;
  document_name: string;
  document_url: string;
  email_message: string | null;
  expires_at: string;
  organization: {
    name: string;
    logo_url: string | null;
  } | null;
}

export default function SignDocument() {
  const { token } = useParams<{ token: string }>();
  const signaturePadRef = useRef<SignaturePad>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [request, setRequest] = useState<RequestInfo | null>(null);
  const [signer, setSigner] = useState<SignerInfo | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [accepted, setAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeclineDialog, setShowDeclineDialog] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (token) {
      loadSignatureRequest();
    }
  }, [token]);

  const loadSignatureRequest = async () => {
    try {
      // Buscar la solicitud con este token de firmante
      const { data: requests, error: fetchError } = await supabase
        .from('signature_requests')
        .select(`
          id, document_name, document_url, email_message, expires_at, signers,
          organization:organizations(name)
        `)
        .not('status', 'in', '("completed","voided","expired")');

      if (fetchError) throw fetchError;

      // Encontrar el firmante con este token
      let foundRequest: RequestInfo | null = null;
      let foundSigner: SignerInfo | null = null;

      for (const req of requests || []) {
        const signers = (req.signers as unknown as SignerInfo[]) || [];
        const matchingSigner = signers.find(s => s.sign_token === token);
        if (matchingSigner) {
          const org = req.organization as { name: string } | null;
          foundRequest = {
            id: req.id,
            document_name: req.document_name,
            document_url: req.document_url,
            email_message: req.email_message,
            expires_at: req.expires_at,
            organization: org ? { name: org.name, logo_url: null } : null,
          };
          foundSigner = matchingSigner;
          break;
        }
      }

      if (!foundRequest || !foundSigner) {
        setError('Este enlace de firma no es válido o ha expirado.');
        return;
      }

      // Verificar expiración
      if (new Date(foundRequest.expires_at) < new Date()) {
        setError('Este enlace de firma ha expirado.');
        return;
      }

      setRequest(foundRequest);
      setSigner(foundSigner);

      // Registrar visualización si no ha firmado
      if (!foundSigner.signed_at) {
        await registerView(foundRequest.id, foundSigner);
      }
    } catch (err) {
      console.error('Error loading signature request:', err);
      setError('Error al cargar la solicitud de firma.');
    } finally {
      setIsLoading(false);
    }
  };

  const registerView = async (requestId: string, signerInfo: SignerInfo) => {
    try {
      // Obtener solicitud actual
      const { data: currentRequest } = await supabase
        .from('signature_requests')
        .select('signers, status')
        .eq('id', requestId)
        .single();

      if (!currentRequest) return;

      const signers = (currentRequest.signers as unknown as SignerInfo[]) || [];
      const updatedSigners = signers.map(s => {
        if (s.sign_token === token && !s.signed_at) {
          return { ...s, viewed_at: new Date().toISOString() };
        }
        return s;
      });

      // Actualizar
      await supabase
        .from('signature_requests')
        .update({
          signers: updatedSigners as unknown as Json,
          status: currentRequest.status === 'sent' ? 'viewed' : currentRequest.status,
        })
        .eq('id', requestId);

      // Audit log
      await supabase.from('signature_audit_log').insert({
        signature_request_id: requestId,
        action: 'viewed',
        actor_type: 'signer',
        actor_email: signerInfo.email,
        actor_name: signerInfo.name,
      });
    } catch (err) {
      console.error('Error registering view:', err);
    }
  };

  const handleSign = async () => {
    if (!signature || !request || !signer) return;

    setIsSubmitting(true);
    try {
      // Obtener solicitud actual
      const { data: currentRequest } = await supabase
        .from('signature_requests')
        .select('signers')
        .eq('id', request.id)
        .single();

      if (!currentRequest) throw new Error('Request not found');

      const signers = (currentRequest.signers as unknown as SignerInfo[]) || [];
      const updatedSigners = signers.map(s => {
        if (s.sign_token === token) {
          return {
            ...s,
            signed_at: new Date().toISOString(),
            signature_data: signature,
            ip_address: 'browser',
            user_agent: navigator.userAgent,
          };
        }
        return s;
      });

      // Verificar si todos han firmado
      const allSigned = updatedSigners
        .filter(s => s.role !== 'cc')
        .every(s => s.signed_at);

      const newStatus = allSigned ? 'completed' : 'partially_signed';

      // Actualizar
      await supabase
        .from('signature_requests')
        .update({
          signers: updatedSigners as unknown as Json,
          status: newStatus,
          ...(allSigned ? { completed_at: new Date().toISOString() } : {}),
        })
        .eq('id', request.id);

      // Audit log
      await supabase.from('signature_audit_log').insert({
        signature_request_id: request.id,
        action: 'signed',
        actor_type: 'signer',
        actor_email: signer.email,
        actor_name: signer.name,
      });

      if (allSigned) {
        await supabase.from('signature_audit_log').insert({
          signature_request_id: request.id,
          action: 'completed',
          actor_type: 'system',
        });
      }

      setCompleted(true);
    } catch (err) {
      console.error('Error signing:', err);
      setError('Error al procesar la firma. Por favor, inténtelo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDecline = async () => {
    if (!request || !signer) return;

    setIsSubmitting(true);
    try {
      // Obtener solicitud actual
      const { data: currentRequest } = await supabase
        .from('signature_requests')
        .select('signers')
        .eq('id', request.id)
        .single();

      if (!currentRequest) throw new Error('Request not found');

      const signers = (currentRequest.signers as unknown as SignerInfo[]) || [];
      const updatedSigners = signers.map(s => {
        if (s.sign_token === token) {
          return {
            ...s,
            declined_at: new Date().toISOString(),
            decline_reason: declineReason || null,
          };
        }
        return s;
      });

      // Actualizar
      await supabase
        .from('signature_requests')
        .update({
          signers: updatedSigners as unknown as Json,
          status: 'declined',
        })
        .eq('id', request.id);

      // Audit log
      await supabase.from('signature_audit_log').insert({
        signature_request_id: request.id,
        action: 'declined',
        actor_type: 'signer',
        actor_email: signer.email,
        actor_name: signer.name,
        details: { reason: declineReason } as unknown as Json,
      });

      setShowDeclineDialog(false);
      setError('Ha rechazado firmar este documento. El remitente será notificado.');
    } catch (err) {
      console.error('Error declining:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearSignature = () => {
    signaturePadRef.current?.clear();
    setSignature(null);
  };

  // Estados de carga y error
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Cargando documento...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
              <h2 className="text-xl font-semibold mb-2">Error</h2>
              <p className="text-muted-foreground">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
              <h2 className="text-2xl font-semibold mb-2">¡Documento firmado!</h2>
              <p className="text-muted-foreground mb-6">
                Su firma ha sido registrada correctamente.
                Recibirá una copia del documento firmado por email.
              </p>
              <Button variant="outline" onClick={() => window.close()}>
                Cerrar esta ventana
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (signer?.signed_at) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
              <h2 className="text-xl font-semibold mb-2">Documento ya firmado</h2>
              <p className="text-muted-foreground">
                Este documento ya fue firmado el {format(new Date(signer.signed_at), 'dd MMMM yyyy', { locale: es })}.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-background border-b py-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileSignature className="w-6 h-6 text-primary" />
            <span className="font-semibold">Firma de documento</span>
          </div>
          {request?.organization && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Building className="w-4 h-4" />
              <span>{request.organization.name}</span>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Info del documento */}
          <Card>
            <CardHeader>
              <CardTitle>Documento a firmar</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-muted-foreground">Documento</dt>
                  <dd className="font-medium">{request?.document_name}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Firmante</dt>
                  <dd className="font-medium">{signer?.name}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Email</dt>
                  <dd className="font-medium">{signer?.email}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Expira</dt>
                  <dd className="font-medium">
                    {request?.expires_at && format(new Date(request.expires_at), 'dd MMMM yyyy', { locale: es })}
                  </dd>
                </div>
              </dl>
              {request?.email_message && (
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">{request.email_message}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Preview del documento */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Vista previa del documento</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="border-t">
                <iframe
                  src={request?.document_url}
                  className="w-full h-[500px]"
                  title="Documento a firmar"
                />
              </div>
            </CardContent>
            <CardFooter className="justify-center border-t">
              <Button variant="outline" size="sm" asChild>
                <a href={request?.document_url} target="_blank" rel="noopener noreferrer">
                  <Download className="w-4 h-4 mr-2" />
                  Descargar documento
                </a>
              </Button>
            </CardFooter>
          </Card>

          {/* Área de firma */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Su firma</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Dibuje su firma en el área de abajo usando el ratón o su dedo (en pantallas táctiles).
              </p>

              <div className="border-2 border-dashed rounded-lg p-2 bg-white">
                <SignaturePad
                  ref={signaturePadRef}
                  canvasProps={{
                    className: 'w-full h-40 cursor-crosshair',
                  }}
                  onEnd={() => {
                    if (signaturePadRef.current) {
                      setSignature(signaturePadRef.current.toDataURL());
                    }
                  }}
                />
              </div>

              <div className="flex justify-end">
                <Button variant="ghost" size="sm" onClick={clearSignature}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Limpiar firma
                </Button>
              </div>

              {/* Términos */}
              <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                <Checkbox
                  id="accept"
                  checked={accepted}
                  onCheckedChange={(checked) => setAccepted(checked as boolean)}
                />
                <Label htmlFor="accept" className="text-sm font-normal leading-relaxed">
                  Confirmo que he leído y entendido el documento. Acepto que mi firma
                  electrónica es legalmente vinculante y tiene el mismo efecto que
                  una firma manuscrita según la legislación aplicable.
                </Label>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-6">
              <Button
                variant="outline"
                onClick={() => setShowDeclineDialog(true)}
              >
                <X className="w-4 h-4 mr-2" />
                Rechazar
              </Button>
              <Button
                onClick={handleSign}
                disabled={!signature || !accepted || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Firmando...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Firmar documento
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>

      {/* Dialog de rechazo */}
      <Dialog open={showDeclineDialog} onOpenChange={setShowDeclineDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rechazar firma</DialogTitle>
            <DialogDescription>
              ¿Está seguro de que desea rechazar firmar este documento?
              Esta acción notificará al remitente.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Motivo del rechazo (opcional)</Label>
            <Textarea
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              placeholder="Indique por qué rechaza firmar..."
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeclineDialog(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDecline} disabled={isSubmitting}>
              {isSubmitting ? 'Procesando...' : 'Confirmar rechazo'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
