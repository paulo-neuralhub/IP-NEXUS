/**
 * Generic File Uploader Component
 * Supports drag & drop, multiple files, progress tracking
 */

import { useState, useCallback, useRef } from 'react';
import { Upload, X, FileText, Image, Loader2, AlertCircle, File, Table } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useFileUpload, BUCKET_CONFIG, formatFileSize, type BucketName } from '@/hooks/useFileUpload';
import { toast } from 'sonner';

interface UploadingFile {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  resultPath?: string;
}

interface FileUploaderProps {
  bucket: BucketName;
  folder: string;
  entityId?: string;
  accept?: string;
  maxSize?: number; // MB
  multiple?: boolean;
  onUpload: (paths: string[]) => void;
  onError?: (error: Error) => void;
  className?: string;
}

export function FileUploader({
  bucket,
  folder,
  entityId = '',
  accept,
  maxSize,
  multiple = true,
  onUpload,
  onError,
  className,
}: FileUploaderProps) {
  const [files, setFiles] = useState<UploadingFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { upload, isUploading } = useFileUpload();

  const config = BUCKET_CONFIG[bucket];
  const effectiveMaxSize = maxSize || Math.round(config.maxSize / 1024 / 1024);
  const effectiveAccept = accept || config.allowedTypes.join(',');

  const validateFile = (file: File): string | null => {
    const allowedTypes = config.allowedTypes as readonly string[];
    if (!allowedTypes.includes(file.type)) {
      return `Tipo de archivo no permitido`;
    }
    if (file.size > effectiveMaxSize * 1024 * 1024) {
      return `Excede ${effectiveMaxSize}MB`;
    }
    return null;
  };

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const filesToAdd: UploadingFile[] = Array.from(newFiles).map((file) => {
      const error = validateFile(file);
      return {
        id: crypto.randomUUID(),
        file,
        progress: 0,
        status: error ? 'error' as const : 'pending' as const,
        error: error || undefined,
      };
    });

    setFiles((prev) => (multiple ? [...prev, ...filesToAdd] : filesToAdd));
  }, [multiple, effectiveMaxSize]);

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

  const uploadFiles = async () => {
    const pendingFiles = files.filter((f) => f.status === 'pending');
    const uploadedPaths: string[] = [];
    
    for (const uploadFile of pendingFiles) {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadFile.id ? { ...f, status: 'uploading', progress: 10 } : f
        )
      );

      try {
        const path = entityId ? `${folder}/${entityId}` : folder;
        const result = await upload(uploadFile.file, path, bucket);
        
        uploadedPaths.push(result.path);
        
        setFiles((prev) =>
          prev.map((f) =>
            f.id === uploadFile.id 
              ? { ...f, status: 'success', progress: 100, resultPath: result.path } 
              : f
          )
        );
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Error al subir');
        setFiles((prev) =>
          prev.map((f) =>
            f.id === uploadFile.id
              ? { ...f, status: 'error', error: err.message }
              : f
          )
        );
        onError?.(err);
      }
    }

    if (uploadedPaths.length > 0) {
      toast.success(`${uploadedPaths.length} archivo${uploadedPaths.length > 1 ? 's' : ''} subido${uploadedPaths.length > 1 ? 's' : ''}`);
      onUpload(uploadedPaths);
      
      // Clear successful uploads after delay
      setTimeout(() => {
        setFiles((prev) => prev.filter((f) => f.status !== 'success'));
      }, 1500);
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return Image;
    if (mimeType === 'application/pdf') return FileText;
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return Table;
    return File;
  };

  const pendingCount = files.filter((f) => f.status === 'pending').length;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          multiple={multiple}
          accept={effectiveAccept}
          onChange={handleFileSelect}
          className="hidden"
        />
        <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
        <p className="text-sm font-medium">
          Arrastra archivos o haz clic para seleccionar
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Máximo {effectiveMaxSize}MB por archivo
        </p>
      </div>

      {/* Files list */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((uploadFile) => {
            const IconComponent = getFileIcon(uploadFile.file.type);
            
            return (
              <div
                key={uploadFile.id}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg border',
                  uploadFile.status === 'error' && 'border-destructive/50 bg-destructive/5',
                  uploadFile.status === 'success' && 'border-primary/50 bg-primary/5'
                )}
              >
                <IconComponent className="h-5 w-5 text-muted-foreground shrink-0" />

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {uploadFile.file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(uploadFile.file.size)}
                  </p>

                  {uploadFile.status === 'uploading' && (
                    <Progress value={uploadFile.progress} className="h-1 mt-2" />
                  )}

                  {uploadFile.status === 'error' && uploadFile.error && (
                    <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {uploadFile.error}
                    </p>
                  )}
                </div>

                {uploadFile.status === 'uploading' && (
                  <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />
                )}

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
            );
          })}

          {pendingCount > 0 && (
            <Button
              onClick={uploadFiles}
              disabled={isUploading}
              className="w-full"
            >
              {isUploading ? (
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
