// =============================================
// PÁGINA: SignaturesPage
// Gestión de firmas de email
// =============================================

import { useState } from 'react';
import {
  Mail,
  Plus,
  Pencil,
  Trash2,
  Star,
  MoreVertical,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  useEmailSignatures,
  EmailSignature,
} from '@/hooks/communications/useEmailSignatures';
import { cn } from '@/lib/utils';

export default function SignaturesPage() {
  const { signatures, isLoading, saveSignature, deleteSignature, setDefault } = useEmailSignatures();
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingSignature, setEditingSignature] = useState<EmailSignature | null>(null);

  const handleCreate = () => {
    setEditingSignature(null);
    setIsEditorOpen(true);
  };

  const handleEdit = (signature: EmailSignature) => {
    setEditingSignature(signature);
    setIsEditorOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Firmas de Email</h2>
          <p className="text-sm text-muted-foreground">
            Gestiona tus firmas personalizadas para emails
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Firma
        </Button>
      </div>

      {/* Grid de firmas */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : signatures && signatures.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-4">
          {signatures.map((signature) => (
            <SignatureCard
              key={signature.id}
              signature={signature}
              onEdit={() => handleEdit(signature)}
              onDelete={() => deleteSignature.mutate(signature.id)}
              onSetDefault={() => setDefault.mutate(signature.id)}
            />
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Mail className="w-12 h-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground mb-4">No tienes firmas configuradas</p>
            <Button onClick={handleCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Crear primera firma
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Editor Dialog */}
      <SignatureEditor
        open={isEditorOpen}
        onOpenChange={setIsEditorOpen}
        signature={editingSignature}
        onSave={(data) => {
          saveSignature.mutate(data, {
            onSuccess: () => setIsEditorOpen(false),
          });
        }}
        isSaving={saveSignature.isPending}
      />
    </div>
  );
}

// =============================================
// SignatureCard
// =============================================

interface SignatureCardProps {
  signature: EmailSignature;
  onEdit: () => void;
  onDelete: () => void;
  onSetDefault: () => void;
}

function SignatureCard({ signature, onEdit, onDelete, onSetDefault }: SignatureCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Mail className="w-4 h-4 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-medium">{signature.name}</h3>
                {signature.is_default && (
                  <Badge variant="secondary" className="text-xs">
                    <Star className="w-3 h-3 mr-1 fill-current" />
                    Predeterminada
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Pencil className="w-4 h-4 mr-2" />
                Editar
              </DropdownMenuItem>
              {!signature.is_default && (
                <DropdownMenuItem onClick={onSetDefault}>
                  <Star className="w-4 h-4 mr-2" />
                  Predeterminada
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Preview */}
        <div
          className="text-sm text-muted-foreground border rounded-lg p-3 bg-muted/30 max-h-24 overflow-hidden"
          dangerouslySetInnerHTML={{ __html: signature.content_html }}
        />
      </CardContent>
    </Card>
  );
}

// =============================================
// SignatureEditor
// =============================================

interface SignatureEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  signature: EmailSignature | null;
  onSave: (data: Partial<EmailSignature>) => void;
  isSaving: boolean;
}

function SignatureEditor({
  open,
  onOpenChange,
  signature,
  onSave,
  isSaving,
}: SignatureEditorProps) {
  const [name, setName] = useState('');
  const [contentHtml, setContentHtml] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  // Reset form when opening
  useState(() => {
    if (open) {
      if (signature) {
        setName(signature.name);
        setContentHtml(signature.content_html);
        setIsDefault(signature.is_default);
      } else {
        setName('');
        setContentHtml('');
        setIsDefault(false);
      }
    }
  });

  // Update form when signature changes
  if (signature && name !== signature.name && contentHtml !== signature.content_html) {
    setName(signature.name);
    setContentHtml(signature.content_html);
    setIsDefault(signature.is_default);
  }

  const insertPlaceholder = (placeholder: string) => {
    setContentHtml(prev => prev + placeholder);
  };

  const handleSave = () => {
    if (!name.trim() || !contentHtml.trim()) return;
    onSave({
      id: signature?.id,
      name: name.trim(),
      content_html: contentHtml,
      is_default: isDefault,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {signature ? 'Editar Firma' : 'Nueva Firma'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Nombre */}
          <div className="space-y-1">
            <Label>Nombre</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Mi firma profesional"
            />
          </div>

          {/* Botones de inserción rápida */}
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Insertar:</Label>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => insertPlaceholder('<strong>Tu Nombre</strong>')}
              >
                Nombre
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => insertPlaceholder('<br/><em>Cargo</em>')}
              >
                Cargo
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => insertPlaceholder('<br/>📞 +34 XXX XXX XXX')}
              >
                Teléfono
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => insertPlaceholder('<br/>✉️ email@ejemplo.com')}
              >
                Email
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => insertPlaceholder('<br/>🌐 www.ejemplo.com')}
              >
                Web
              </Button>
            </div>
          </div>

          {/* Editor HTML */}
          <div className="space-y-1">
            <Label>Contenido HTML</Label>
            <Textarea
              value={contentHtml}
              onChange={(e) => setContentHtml(e.target.value)}
              placeholder="<strong>Tu Nombre</strong><br/>Cargo<br/>empresa@ejemplo.com"
              rows={8}
              className="font-mono text-sm"
            />
          </div>

          {/* Preview */}
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Vista previa:</Label>
            <div
              className="border rounded-lg p-4 bg-muted/30 min-h-[80px] prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: contentHtml || '<em>Sin contenido</em>' }}
            />
          </div>

          {/* Predeterminada */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="is-default"
              checked={isDefault}
              onCheckedChange={(checked) => setIsDefault(!!checked)}
            />
            <label htmlFor="is-default" className="text-sm cursor-pointer">
              Establecer como firma predeterminada
            </label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={!name.trim() || !contentHtml.trim() || isSaving}
          >
            {isSaving ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}