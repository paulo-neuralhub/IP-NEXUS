/**
 * Generic file upload hook for Supabase Storage
 * Supports multiple buckets, progress tracking, and signed URLs
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import { toast } from 'sonner';

// Bucket configurations
export const BUCKET_CONFIG = {
  'documents': {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/png',
    ],
    public: false,
  },
  'images': {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/svg+xml',
    ],
    public: true,
  },
  'matter-documents': {
    maxSize: 10 * 1024 * 1024,
    allowedTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
    ],
    public: false,
  },
  'client-documents': {
    maxSize: 10 * 1024 * 1024,
    allowedTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
    ],
    public: false,
  },
  'invoices': {
    maxSize: 10 * 1024 * 1024,
    allowedTypes: ['application/pdf'],
    public: false,
  },
  'logos': {
    maxSize: 5 * 1024 * 1024,
    allowedTypes: [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/svg+xml',
    ],
    public: true,
  },
  'templates': {
    maxSize: 10 * 1024 * 1024,
    allowedTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    public: false,
  },
} as const;

export type BucketName = keyof typeof BUCKET_CONFIG;

interface UploadResult {
  path: string;
  publicUrl?: string;
}

interface UseFileUploadReturn {
  upload: (file: File, path: string, bucket: BucketName) => Promise<UploadResult>;
  uploadMultiple: (files: File[], basePath: string, bucket: BucketName) => Promise<UploadResult[]>;
  deleteFile: (path: string, bucket: BucketName) => Promise<void>;
  getPublicUrl: (path: string, bucket: BucketName) => string;
  getSignedUrl: (path: string, bucket: BucketName, expiresIn?: number) => Promise<string | null>;
  isUploading: boolean;
  progress: number;
  error: Error | null;
}

export function useFileUpload(): UseFileUploadReturn {
  const { currentOrganization } = useOrganization();
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<Error | null>(null);

  // Validate file against bucket config
  const validateFile = useCallback((file: File, bucket: BucketName): string | null => {
    const config = BUCKET_CONFIG[bucket];
    
    if (!config) {
      return `Bucket "${bucket}" no configurado`;
    }
    
    if (file.size > config.maxSize) {
      return `El archivo excede el tamaño máximo de ${Math.round(config.maxSize / 1024 / 1024)}MB`;
    }
    
    const allowedTypes = config.allowedTypes as readonly string[];
    if (!allowedTypes.includes(file.type)) {
      return `Tipo de archivo no permitido: ${file.type}`;
    }
    
    return null;
  }, []);

  // Generate unique filename
  const generateFilename = useCallback((originalName: string): string => {
    const timestamp = Date.now();
    const sanitized = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
    return `${timestamp}-${sanitized}`;
  }, []);

  // Upload single file
  const upload = useCallback(async (
    file: File, 
    path: string, 
    bucket: BucketName
  ): Promise<UploadResult> => {
    if (!currentOrganization?.id) {
      throw new Error('No hay organización seleccionada');
    }

    const validationError = validateFile(file, bucket);
    if (validationError) {
      throw new Error(validationError);
    }

    setIsUploading(true);
    setProgress(0);
    setError(null);

    try {
      const filename = generateFilename(file.name);
      const fullPath = `${currentOrganization.id}/${path}/${filename}`;

      setProgress(10);

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fullPath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      setProgress(90);

      // Get public URL if bucket is public
      let publicUrl: string | undefined;
      const config = BUCKET_CONFIG[bucket];
      if (config.public) {
        const { data } = supabase.storage.from(bucket).getPublicUrl(fullPath);
        publicUrl = data.publicUrl;
      }

      setProgress(100);

      return { path: fullPath, publicUrl };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error al subir archivo');
      setError(error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  }, [currentOrganization?.id, validateFile, generateFilename]);

  // Upload multiple files
  const uploadMultiple = useCallback(async (
    files: File[], 
    basePath: string, 
    bucket: BucketName
  ): Promise<UploadResult[]> => {
    setIsUploading(true);
    setProgress(0);
    setError(null);

    const results: UploadResult[] = [];
    const totalFiles = files.length;

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const result = await upload(file, basePath, bucket);
        results.push(result);
        setProgress(Math.round(((i + 1) / totalFiles) * 100));
      }

      return results;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error al subir archivos');
      setError(error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  }, [upload]);

  // Delete file
  const deleteFile = useCallback(async (path: string, bucket: BucketName): Promise<void> => {
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) throw error;
  }, []);

  // Get public URL (for public buckets)
  const getPublicUrl = useCallback((path: string, bucket: BucketName): string => {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }, []);

  // Get signed URL (for private buckets)
  const getSignedUrl = useCallback(async (
    path: string, 
    bucket: BucketName, 
    expiresIn: number = 3600
  ): Promise<string | null> => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (error) {
      console.error('Error getting signed URL:', error);
      return null;
    }

    return data.signedUrl;
  }, []);

  return {
    upload,
    uploadMultiple,
    deleteFile,
    getPublicUrl,
    getSignedUrl,
    isUploading,
    progress,
    error,
  };
}

// Utility: Format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

// Utility: Get file icon name based on mime type
export function getFileIcon(mimeType?: string): string {
  if (!mimeType) return 'File';
  if (mimeType.startsWith('image/')) return 'Image';
  if (mimeType === 'application/pdf') return 'FileText';
  if (mimeType.includes('word')) return 'FileType';
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'Table';
  return 'File';
}

// Utility: Check if file can be previewed
export function canPreviewFile(mimeType?: string): boolean {
  if (!mimeType) return false;
  return mimeType.startsWith('image/') || mimeType === 'application/pdf';
}
