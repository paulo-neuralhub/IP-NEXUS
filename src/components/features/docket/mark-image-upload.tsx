import { useState, useRef, useEffect } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useUploadMarkImage, useDeleteMarkImage } from '@/hooks/use-matter-files';
import { cn } from '@/lib/utils';
import { ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE } from '@/types/matters';
import { Button } from '@/components/ui/button';

interface Props {
  matterId: string;
  currentImageUrl?: string | null;
  onUpload?: (url: string) => void;
  onDelete?: () => void;
}

export function MarkImageUpload({ matterId, currentImageUrl, onUpload, onDelete }: Props) {
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useUploadMarkImage();
  const deleteMutation = useDeleteMarkImage();
  
  useEffect(() => {
    setPreview(currentImageUrl || null);
  }, [currentImageUrl]);
  
  const handleFile = async (file: File) => {
    // Validate type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      alert('Tipo de archivo no permitido. Use JPG, PNG, GIF, WebP o SVG.');
      return;
    }
    
    // Validate size
    if (file.size > MAX_FILE_SIZE) {
      alert('El archivo es demasiado grande. Máximo 10MB.');
      return;
    }
    
    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
    
    // Upload
    const url = await uploadMutation.mutateAsync({ matterId, file });
    onUpload?.(url);
  };
  
  const handleDelete = async () => {
    await deleteMutation.mutateAsync({ matterId });
    setPreview(null);
    if (inputRef.current) inputRef.current.value = '';
    onDelete?.();
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };
  
  const isLoading = uploadMutation.isPending || deleteMutation.isPending;
  
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-foreground">
        Imagen de la marca
      </label>
      
      {preview ? (
        <div className="relative inline-block">
          <img 
            src={preview} 
            alt="Marca" 
            className="max-w-xs max-h-48 rounded-lg border object-contain bg-muted"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-6 w-6"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {deleteMutation.isPending ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <X className="h-3 w-3" />
            )}
          </Button>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors",
            isDragging 
              ? "border-primary bg-primary/5" 
              : "border-muted-foreground/25 hover:border-muted-foreground/50"
          )}
        >
          {uploadMutation.isPending ? (
            <Loader2 className="h-10 w-10 mx-auto mb-2 text-primary animate-spin" />
          ) : (
            <ImageIcon className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
          )}
          <p className="text-sm text-muted-foreground mb-1">
            {uploadMutation.isPending 
              ? 'Subiendo imagen...' 
              : 'Arrastra una imagen o haz clic para seleccionar'
            }
          </p>
          <p className="text-xs text-muted-foreground/70">
            JPG, PNG, GIF, WebP o SVG. Máximo 10MB.
          </p>
        </div>
      )}
      
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_IMAGE_TYPES.join(',')}
        onChange={handleChange}
        className="hidden"
        disabled={isLoading}
      />
    </div>
  );
}
