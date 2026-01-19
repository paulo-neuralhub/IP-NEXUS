import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Plus,
  PenTool,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  Download
} from 'lucide-react';
import { usePortalUsers, useCreateSignatureRequest, useCancelSignatureRequest } from '@/hooks/collab';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface PortalSignaturesTabProps {
  portalId: string;
  signatures: any[];
}

const DOCUMENT_TYPES = [
  { value: 'power_of_attorney', label: 'Poder de representación' },
  { value: 'assignment', label: 'Cesión' },
  { value: 'license', label: 'Licencia' },
  { value: 'contract', label: 'Contrato' },
  { value: 'declaration', label: 'Declaración' },
  { value: 'authorization', label: 'Autorización' },
  { value: 'custom', label: 'Otro' }
];

export default function PortalSignaturesTab({ portalId, signatures }: PortalSignaturesTabProps) {
  const { data: portalUsers = [] } = usePortalUsers(portalId);
  const createSignature = useCreateSignatureRequest();
  const cancelSignature = useCancelSignatureRequest();
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [formData, setFormData] = useState({
    document_type: '',
    title: '',
    description: '',
    signers: [] as string[],
    expires_in_days: '30'
  });
  
  const approversAndAdmins = portalUsers.filter(u => 
    u.status === 'active' && ['admin', 'approver'].includes(u.role)
  );
  
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const signers = formData.signers.map(userId => {
      const user = portalUsers.find(u => u.id === userId);
      return {
        user_id: userId,
        name: user?.name || '',
        email: user?.email || '',
        role: 'Firmante autorizado'
      };
    });
    
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + parseInt(formData.expires_in_days));
    
    try {
      await createSignature.mutateAsync({
        portal_id: portalId,
        document_type: formData.document_type,
        title: formData.title,
        description: formData.description || undefined,
        signers,
        expires_at: expiresAt.toISOString()
      });
      
      setShowCreateDialog(false);
      setFormData({
        document_type: '',
        title: '',
        description: '',
        signers: [],
        expires_in_days: '30'
      });
    } catch (error) {
      // Handled by mutation
    }
  };
  
  const getStatusConfig = (status: string) => {
    const configs: Record<string, { icon: any; label: string; color: string }> = {
      pending: { icon: Clock, label: 'Pendiente', color: 'text-amber-600' },
      partially_signed: { icon: PenTool, label: 'Parcialmente firmado', color: 'text-blue-600' },
      completed: { icon: CheckCircle, label: 'Completado', color: 'text-green-600' },
      declined: { icon: XCircle, label: 'Rechazado', color: 'text-red-600' },
      expired: { icon: Clock, label: 'Expirado', color: 'text-muted-foreground' },
      cancelled: { icon: XCircle, label: 'Cancelado', color: 'text-muted-foreground' }
    };
    return configs[status] || configs.pending;
  };
  
  const getSignerProgress = (signers: any[]) => {
    if (!signers?.length) return 0;
    const signed = signers.filter(s => s.status === 'signed').length;
    return (signed / signers.length) * 100;
  };
  
  const pendingSignatures = signatures.filter(s => ['pending', 'partially_signed'].includes(s.status));
  const completedSignatures = signatures.filter(s => !['pending', 'partially_signed'].includes(s.status));

  return (
    <div className="space-y-6">
      {/* Pending */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Firmas Pendientes</CardTitle>
            <CardDescription>
              Documentos esperando firma del cliente
            </CardDescription>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Solicitar Firma
          </Button>
        </CardHeader>
        <CardContent>
          {pendingSignatures.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay firmas pendientes
            </div>
          ) : (
            <div className="space-y-4">
              {pendingSignatures.map((sig) => {
                const status = getStatusConfig(sig.status);
                const StatusIcon = status.icon;
                const signers = sig.signers || [];
                const signedCount = signers.filter((s: any) => s.status === 'signed').length;
                
                return (
                  <div
                    key={sig.id}
                    className="p-4 border rounded-lg space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline">
                              {DOCUMENT_TYPES.find(t => t.value === sig.document_type)?.label || sig.document_type}
                            </Badge>
                            <span className={`text-sm ${status.color}`}>
                              <StatusIcon className="h-4 w-4 inline mr-1" />
                              {status.label}
                            </span>
                          </div>
                          <h4 className="font-medium">{sig.title}</h4>
                          {sig.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {sig.description}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => cancelSignature.mutate(sig.id)}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                    
                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progreso de firmas</span>
                        <span>{signedCount} de {signers.length}</span>
                      </div>
                      <Progress value={getSignerProgress(signers)} className="h-2" />
                      
                      {/* Signers list */}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {signers.map((signer: any, idx: number) => (
                          <Badge
                            key={idx}
                            variant={signer.status === 'signed' ? 'default' : 'secondary'}
                          >
                            {signer.status === 'signed' && <CheckCircle className="h-3 w-3 mr-1" />}
                            {signer.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>
                        Enviado: {format(new Date(sig.sent_at), 'dd MMM yyyy', { locale: es })}
                      </span>
                      {sig.expires_at && (
                        <span className="text-amber-600">
                          Expira: {format(new Date(sig.expires_at), 'dd MMM yyyy', { locale: es })}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Completed */}
      {completedSignatures.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Historial de Firmas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {completedSignatures.map((sig) => {
                const status = getStatusConfig(sig.status);
                const StatusIcon = status.icon;
                
                return (
                  <div
                    key={sig.id}
                    className="flex items-center justify-between p-3 border rounded-lg bg-muted/30"
                  >
                    <div className="flex items-center gap-3">
                      <StatusIcon className={`h-5 w-5 ${status.color}`} />
                      <div>
                        <p className="font-medium">{sig.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {status.label}
                          {sig.completed_at && (
                            <> · {format(new Date(sig.completed_at), 'dd MMM yyyy', { locale: es })}</>
                          )}
                        </p>
                      </div>
                    </div>
                    
                    {sig.status === 'completed' && sig.signed_document_url && (
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        Descargar
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Solicitar Firma</DialogTitle>
            <DialogDescription>
              Envía un documento para que el cliente lo firme
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo de documento *</Label>
              <Select
                value={formData.document_type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, document_type: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Título *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ej: Poder de representación para marca ACME"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label>Descripción</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Instrucciones o contexto para el firmante..."
                rows={2}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Firmantes *</Label>
              <Select
                value={formData.signers[0] || ''}
                onValueChange={(value) => setFormData(prev => ({ 
                  ...prev, 
                  signers: prev.signers.includes(value) 
                    ? prev.signers.filter(s => s !== value)
                    : [...prev.signers, value]
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar firmantes..." />
                </SelectTrigger>
                <SelectContent>
                  {approversAndAdmins.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formData.signers.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {formData.signers.map(id => {
                    const user = portalUsers.find(u => u.id === id);
                    return (
                      <Badge key={id} variant="secondary" className="cursor-pointer" onClick={() => 
                        setFormData(prev => ({ ...prev, signers: prev.signers.filter(s => s !== id) }))
                      }>
                        {user?.name} ×
                      </Badge>
                    );
                  })}
                </div>
              )}
              {approversAndAdmins.length === 0 && (
                <p className="text-sm text-amber-600">
                  No hay usuarios con permisos de firma. Invita usuarios con rol Administrador o Aprobador.
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label>Expira en (días)</Label>
              <Select
                value={formData.expires_in_days}
                onValueChange={(value) => setFormData(prev => ({ ...prev, expires_in_days: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 días</SelectItem>
                  <SelectItem value="14">14 días</SelectItem>
                  <SelectItem value="30">30 días</SelectItem>
                  <SelectItem value="60">60 días</SelectItem>
                  <SelectItem value="90">90 días</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={createSignature.isPending || formData.signers.length === 0}
              >
                {createSignature.isPending ? 'Creando...' : 'Solicitar Firma'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
