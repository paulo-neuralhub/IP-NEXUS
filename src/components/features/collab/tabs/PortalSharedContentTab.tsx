import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Plus,
  FolderOpen,
  Briefcase,
  FileText,
  Trash2,
  Eye,
  Download,
  MessageSquare
} from 'lucide-react';
import { useShareContent, useUnshareContent } from '@/hooks/collab';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface PortalSharedContentTabProps {
  portalId: string;
  sharedContent: any[];
}

const CONTENT_TYPES = [
  { value: 'asset', label: 'Activos individuales', icon: Briefcase },
  { value: 'portfolio', label: 'Portfolio completo', icon: FolderOpen },
  { value: 'document', label: 'Documentos', icon: FileText }
];

export default function PortalSharedContentTab({ portalId, sharedContent }: PortalSharedContentTabProps) {
  const shareContent = useShareContent();
  const unshareContent = useUnshareContent();
  
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [shareForm, setShareForm] = useState({
    content_type: 'asset',
    content_ids: [] as string[],
    permissions: {
      can_view: true,
      can_download: true,
      can_comment: true,
      can_approve: false
    }
  });
  
  const handleShare = async () => {
    if (shareForm.content_ids.length === 0) return;
    
    try {
      await shareContent.mutateAsync({
        portal_id: portalId,
        content_type: shareForm.content_type,
        content_ids: shareForm.content_ids,
        permissions: shareForm.permissions
      });
      
      setShowShareDialog(false);
      setShareForm({
        content_type: 'asset',
        content_ids: [],
        permissions: { can_view: true, can_download: true, can_comment: true, can_approve: false }
      });
    } catch (error) {
      // Handled by mutation
    }
  };
  
  const handleUnshare = (id: string) => {
    if (confirm('¿Dejar de compartir este contenido?')) {
      unshareContent.mutate({ id, portalId });
    }
  };
  
  const toggleMatter = (matterId: string) => {
    setShareForm(prev => ({
      ...prev,
      content_ids: prev.content_ids.includes(matterId)
        ? prev.content_ids.filter(id => id !== matterId)
        : [...prev.content_ids, matterId]
    }));
  };
  
  const getContentTypeIcon = (type: string) => {
    const config = CONTENT_TYPES.find(t => t.value === type);
    const Icon = config?.icon || Briefcase;
    return <Icon className="h-4 w-4" />;
  };
  
  const getContentTypeLabel = (type: string) => {
    return CONTENT_TYPES.find(t => t.value === type)?.label || type;
  };
  
  // Group shared content by type
  const groupedContent = sharedContent.reduce((acc, item) => {
    const type = item.content_type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(item);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Contenido Compartido</CardTitle>
            <CardDescription>
              Gestiona qué información puede ver el cliente en su portal
            </CardDescription>
          </div>
          <Button onClick={() => setShowShareDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Compartir Contenido
          </Button>
        </CardHeader>
        <CardContent>
          {sharedContent.length === 0 ? (
            <div className="text-center py-8">
              <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                No hay contenido compartido con este cliente
              </p>
              <Button onClick={() => setShowShareDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Compartir Primer Contenido
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedContent).map(([type, items]) => (
                <div key={type}>
                  <h4 className="font-medium flex items-center gap-2 mb-3">
                    {getContentTypeIcon(type)}
                    {getContentTypeLabel(type)}
                    <Badge variant="secondary">{(items as any[]).length}</Badge>
                  </h4>
                  
                  <div className="space-y-2">
                    {(items as any[]).map((item) => {
                      const permissions = item.permissions || {};
                      
                      return (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            {getContentTypeIcon(item.content_type)}
                            <div>
                              <p className="font-medium">
                                ID: {item.content_id.slice(0, 8)}...
                              </p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>
                                  Compartido: {format(new Date(item.shared_at), 'dd MMM yyyy', { locale: es })}
                                </span>
                                {item.expires_at && (
                                  <span className="text-amber-600">
                                    · Expira: {format(new Date(item.expires_at), 'dd MMM yyyy', { locale: es })}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              {permissions.can_view && (
                                <Badge variant="outline" className="text-xs">
                                  <Eye className="h-3 w-3 mr-1" />
                                  Ver
                                </Badge>
                              )}
                              {permissions.can_download && (
                                <Badge variant="outline" className="text-xs">
                                  <Download className="h-3 w-3 mr-1" />
                                  Descargar
                                </Badge>
                              )}
                              {permissions.can_comment && (
                                <Badge variant="outline" className="text-xs">
                                  <MessageSquare className="h-3 w-3 mr-1" />
                                  Comentar
                                </Badge>
                              )}
                            </div>
                            
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleUnshare(item.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Compartir Contenido</DialogTitle>
            <DialogDescription>
              Selecciona qué contenido quieres compartir con el cliente
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Tipo de contenido</Label>
              <Select
                value={shareForm.content_type}
                onValueChange={(value) => setShareForm(prev => ({ 
                  ...prev, 
                  content_type: value,
                  content_ids: []
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONTENT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <type.icon className="h-4 w-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {shareForm.content_type === 'asset' && (
              <div className="space-y-2">
                <Label>Seleccionar activos</Label>
                <p className="text-sm text-muted-foreground">
                  Usa el ID del activo que deseas compartir.
                </p>
                <Input
                  placeholder="ID del activo..."
                  onChange={(e) => {
                    const value = e.target.value.trim();
                    if (value) {
                      setShareForm(prev => ({
                        ...prev,
                        content_ids: [value]
                      }));
                    }
                  }}
                />
              </div>
            )}
            
            <div className="space-y-3">
              <Label>Permisos</Label>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-2">
                  <Checkbox
                    checked={shareForm.permissions.can_view}
                    onCheckedChange={(checked) => 
                      setShareForm(prev => ({
                        ...prev,
                        permissions: { ...prev.permissions, can_view: !!checked }
                      }))
                    }
                  />
                  <span className="text-sm">Puede ver</span>
                </label>
                <label className="flex items-center gap-2">
                  <Checkbox
                    checked={shareForm.permissions.can_download}
                    onCheckedChange={(checked) => 
                      setShareForm(prev => ({
                        ...prev,
                        permissions: { ...prev.permissions, can_download: !!checked }
                      }))
                    }
                  />
                  <span className="text-sm">Puede descargar</span>
                </label>
                <label className="flex items-center gap-2">
                  <Checkbox
                    checked={shareForm.permissions.can_comment}
                    onCheckedChange={(checked) => 
                      setShareForm(prev => ({
                        ...prev,
                        permissions: { ...prev.permissions, can_comment: !!checked }
                      }))
                    }
                  />
                  <span className="text-sm">Puede comentar</span>
                </label>
                <label className="flex items-center gap-2">
                  <Checkbox
                    checked={shareForm.permissions.can_approve}
                    onCheckedChange={(checked) => 
                      setShareForm(prev => ({
                        ...prev,
                        permissions: { ...prev.permissions, can_approve: !!checked }
                      }))
                    }
                  />
                  <span className="text-sm">Puede aprobar</span>
                </label>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowShareDialog(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleShare}
              disabled={shareForm.content_ids.length === 0 || shareContent.isPending}
            >
              {shareContent.isPending ? 'Compartiendo...' : 'Compartir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
