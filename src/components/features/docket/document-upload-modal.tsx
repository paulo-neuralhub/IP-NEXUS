import { useState, useRef } from 'react';
import { Upload, FileText, Loader2 } from 'lucide-react';
import { useUploadDocument } from '@/hooks/use-matter-files';
import { DOCUMENT_CATEGORIES } from '@/lib/constants/matters';
import { formatFileSize } from '@/lib/utils';
import { ALLOWED_DOCUMENT_TYPES } from '@/types/matters';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Props {
  open: boolean;
  onClose: () => void;
  matterId: string;
}

export function DocumentUploadModal({ open, onClose, matterId }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState('other');
  const [description, setDescription] = useState('');
  const [isOfficial, setIsOfficial] = useState(false);
  const [documentDate, setDocumentDate] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useUploadDocument();
  
  const handleSubmit = async () => {
    if (!file) return;
    
    await uploadMutation.mutateAsync({
      matterId,
      file,
      category,
      description: description || undefined,
      isOfficial,
      documentDate: documentDate || undefined,
    });
    
    // Reset and close
    resetForm();
    onClose();
  };
  
  const resetForm = () => {
    setFile(null);
    setCategory('other');
    setDescription('');
    setIsOfficial(false);
    setDocumentDate('');
  };
  
  const handleClose = () => {
    resetForm();
    onClose();
  };
  
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Subir documento</DialogTitle>
          <DialogDescription>
            Adjunta un documento a este expediente
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Dropzone */}
          {!file ? (
            <div
              onClick={() => inputRef.current?.click()}
              className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-8 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
            >
              <Upload className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Haz clic para seleccionar un archivo
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                PDF, Word, imágenes. Máximo 10MB.
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <FileText className="h-8 w-8 text-primary" />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{file.name}</p>
                <p className="text-sm text-muted-foreground">{formatFileSize(file.size)}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setFile(null)}>
                Cambiar
              </Button>
            </div>
          )}
          
          <input
            ref={inputRef}
            type="file"
            accept={ALLOWED_DOCUMENT_TYPES.join(',')}
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="hidden"
          />
          
          {/* Category */}
          <div className="space-y-2">
            <Label>Categoría</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar categoría" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(DOCUMENT_CATEGORIES).map(([key, config]) => (
                  <SelectItem key={key} value={key}>{config.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Description */}
          <div className="space-y-2">
            <Label>Descripción (opcional)</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej: Certificado de registro original"
            />
          </div>
          
          {/* Document date */}
          <div className="space-y-2">
            <Label>Fecha del documento (opcional)</Label>
            <Input
              type="date"
              value={documentDate}
              onChange={(e) => setDocumentDate(e.target.value)}
            />
          </div>
          
          {/* Is official */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isOfficial"
              checked={isOfficial}
              onCheckedChange={(checked) => setIsOfficial(checked as boolean)}
            />
            <Label htmlFor="isOfficial" className="text-sm font-normal cursor-pointer">
              Documento oficial de oficina de PI
            </Label>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!file || uploadMutation.isPending}
          >
            {uploadMutation.isPending && (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            )}
            Subir documento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
