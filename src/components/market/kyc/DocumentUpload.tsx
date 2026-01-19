// src/components/market/kyc/DocumentUpload.tsx
import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  FileText, 
  Image, 
  X, 
  CheckCircle2, 
  AlertCircle,
  Loader2 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DocumentType, DOCUMENT_TYPES } from '@/types/kyc.types';
import { toast } from 'sonner';

interface UploadedFile {
  file: File;
  preview?: string;
  status: 'uploading' | 'uploaded' | 'error';
  progress: number;
}

interface DocumentUploadProps {
  documentType: DocumentType;
  onFilesChange: (files: { file: File; documentType: string }[]) => void;
  maxFiles?: number;
  disabled?: boolean;
}

export function DocumentUpload({ 
  documentType, 
  onFilesChange, 
  maxFiles = 5,
  disabled = false 
}: DocumentUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const config = DOCUMENT_TYPES[documentType];

  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles || disabled) return;

    const validFiles: UploadedFile[] = [];

    Array.from(newFiles).forEach((file) => {
      // Check file type
      if (!config.acceptedFormats.includes(file.type)) {
        toast.error(`Formato no válido para ${file.name}`);
        return;
      }

      // Check file size (MB)
      if (file.size > config.maxSize * 1024 * 1024) {
        toast.error(`${file.name} excede el tamaño máximo de ${config.maxSize}MB`);
        return;
      }

      // Check max files
      if (files.length + validFiles.length >= maxFiles) {
        toast.error(`Máximo ${maxFiles} archivos permitidos`);
        return;
      }

      const preview = file.type.startsWith('image/') 
        ? URL.createObjectURL(file) 
        : undefined;

      validFiles.push({
        file,
        preview,
        status: 'uploaded',
        progress: 100,
      });
    });

    const updatedFiles = [...files, ...validFiles];
    setFiles(updatedFiles);
    onFilesChange(updatedFiles.map(f => ({ file: f.file, documentType })));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const removeFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    onFilesChange(updatedFiles.map(f => ({ file: f.file, documentType })));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{config.label.es}</CardTitle>
        <CardDescription>{config.description.es}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Drop Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !disabled && inputRef.current?.click()}
          className={cn(
            'border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer',
            isDragOver && 'border-primary bg-primary/5',
            disabled && 'opacity-50 cursor-not-allowed',
            !isDragOver && !disabled && 'border-muted-foreground/25 hover:border-primary/50'
          )}
        >
          <input
            ref={inputRef}
            type="file"
            multiple
            accept={config.acceptedFormats.join(',')}
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
            disabled={disabled}
          />
          
          <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            Arrastra archivos aquí o <span className="text-primary font-medium">haz clic para seleccionar</span>
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Formatos: {config.acceptedFormats.map(f => f.split('/')[1].toUpperCase()).join(', ')} • 
            Máx. {config.maxSize}MB
          </p>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="space-y-2">
            {files.map((uploadedFile, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
              >
                {uploadedFile.preview ? (
                  <img 
                    src={uploadedFile.preview} 
                    alt={uploadedFile.file.name}
                    className="w-10 h-10 object-cover rounded"
                  />
                ) : (
                  <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{uploadedFile.file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(uploadedFile.file.size)}
                  </p>
                  {uploadedFile.status === 'uploading' && (
                    <Progress value={uploadedFile.progress} className="h-1 mt-1" />
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {uploadedFile.status === 'uploading' && (
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  )}
                  {uploadedFile.status === 'uploaded' && (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  )}
                  {uploadedFile.status === 'error' && (
                    <AlertCircle className="w-4 h-4 text-destructive" />
                  )}
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(index);
                    }}
                    disabled={disabled || uploadedFile.status === 'uploading'}
                    className="h-8 w-8"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
