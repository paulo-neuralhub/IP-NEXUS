import { useState, useCallback, useRef } from 'react';
import { Upload, X, FileText, Image, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useUploadDocument } from '@/hooks/use-documents';
import type { DocumentType, EntityType, UploadingFile } from '@/types/documents';
import { DOCUMENT_TYPE_LABELS, ALLOWED_MIME_TYPES, formatFileSize } from '@/types/documents';

interface DocumentUploaderProps {
  entityType: EntityType;
  entityId: string;
  allowedTypes?: string[];
  maxSize?: number; // MB
  multiple?: boolean;
  onUploadComplete?: () => void;
}

export function DocumentUploader({
  entityType,
  entityId,
  allowedTypes = ALLOWED_MIME_TYPES.all,
  maxSize = 10,
  multiple = true,
  onUploadComplete,
}: DocumentUploaderProps) {
  const [files, setFiles] = useState<UploadingFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useUploadDocument();

  const validateFile = (file: File): string | null => {
    if (!allowedTypes.includes(file.type)) {
      return `Tipo de archivo no permitido: ${file.type}`;
    }
    if (file.size > maxSize * 1024 * 1024) {
      return `El archivo excede el tamaño máximo de ${maxSize}MB`;
    }
    return null;
  };

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const filesToAdd: UploadingFile[] = Array.from(newFiles).map((file) => ({
      id: crypto.randomUUID(),
      file,
      progress: 0,
      status: 'pending' as const,
      documentType: 'other' as DocumentType,
      error: validateFile(file) || undefined,
    }));

    // Mark files with errors
    filesToAdd.forEach((f) => {
      if (f.error) f.status = 'error';
    });

    setFiles((prev) => (multiple ? [...prev, ...filesToAdd] : filesToAdd));
  }, [allowedTypes, maxSize, multiple]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  }, [addFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files);
      e.target.value = '';
    }
  }, [addFiles]);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const updateFileType = useCallback((id: string, documentType: DocumentType) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, documentType } : f))
    );
  }, []);

  const uploadFiles = async () => {
    const pendingFiles = files.filter((f) => f.status === 'pending');
    
    for (const uploadFile of pendingFiles) {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadFile.id ? { ...f, status: 'uploading', progress: 0 } : f
        )
      );

      try {
        await uploadMutation.mutateAsync({
          file: uploadFile.file,
          entityType,
          entityId,
          documentType: uploadFile.documentType,
          onProgress: (progress) => {
            setFiles((prev) =>
              prev.map((f) =>
                f.id === uploadFile.id ? { ...f, progress } : f
              )
            );
          },
        });

        setFiles((prev) =>
          prev.map((f) =>
            f.id === uploadFile.id ? { ...f, status: 'success', progress: 100 } : f
          )
        );
      } catch (error) {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === uploadFile.id
              ? { ...f, status: 'error', error: 'Error al subir' }
              : f
          )
        );
      }
    }

    // Clear successful uploads after delay
    setTimeout(() => {
      setFiles((prev) => prev.filter((f) => f.status !== 'success'));
      onUploadComplete?.();
    }, 1500);
  };

  const pendingCount = files.filter((f) => f.status === 'pending').length;
  const hasErrors = files.some((f) => f.status === 'error');

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          multiple={multiple}
          accept={allowedTypes.join(',')}
          onChange={handleFileSelect}
          className="hidden"
        />
        <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
        <p className="text-sm font-medium">
          Arrastra archivos aquí o haz clic para seleccionar
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Máximo {maxSize}MB por archivo
        </p>
      </div>

      {/* Files list */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((uploadFile) => (
            <div
              key={uploadFile.id}
              className={cn(
                'flex items-center gap-3 p-3 rounded-lg border',
                uploadFile.status === 'error' && 'border-destructive/50 bg-destructive/5',
                uploadFile.status === 'success' && 'border-primary/50 bg-primary/5'
              )}
            >
              {/* Icon */}
              <div className="shrink-0">
                {uploadFile.file.type.startsWith('image/') ? (
                  <Image className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <FileText className="h-5 w-5 text-muted-foreground" />
                )}
              </div>

              {/* File info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {uploadFile.file.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(uploadFile.file.size)}
                </p>

                {/* Progress bar */}
                {uploadFile.status === 'uploading' && (
                  <Progress value={uploadFile.progress} className="h-1 mt-2" />
                )}

                {/* Error message */}
                {uploadFile.status === 'error' && uploadFile.error && (
                  <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {uploadFile.error}
                  </p>
                )}
              </div>

              {/* Document type selector */}
              {uploadFile.status === 'pending' && (
                <Select
                  value={uploadFile.documentType}
                  onValueChange={(value) => updateFileType(uploadFile.id, value as DocumentType)}
                >
                  <SelectTrigger className="w-36 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(DOCUMENT_TYPE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value} className="text-xs">
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {/* Status indicator */}
              {uploadFile.status === 'uploading' && (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              )}

              {/* Remove button */}
              {(uploadFile.status === 'pending' || uploadFile.status === 'error') && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(uploadFile.id);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}

          {/* Upload button */}
          {pendingCount > 0 && (
            <Button
              onClick={uploadFiles}
              disabled={uploadMutation.isPending}
              className="w-full"
            >
              {uploadMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Subiendo...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Subir {pendingCount} archivo{pendingCount > 1 ? 's' : ''}
                </>
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
