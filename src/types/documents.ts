// Document types for the storage system

export type DocumentType = 
  | 'application'
  | 'certificate'
  | 'logo'
  | 'correspondence'
  | 'invoice'
  | 'contract'
  | 'power_of_attorney'
  | 'search_report'
  | 'office_action'
  | 'response'
  | 'other';

export type EntityType = 'matter' | 'client' | 'deal';

export interface Document {
  id: string;
  organization_id: string;
  matter_id?: string | null;
  client_id?: string | null;
  storage_bucket: string;
  storage_path: string;
  original_filename: string;
  mime_type?: string | null;
  file_size?: number | null;
  document_type: DocumentType;
  title?: string | null;
  description?: string | null;
  version: number;
  is_current_version: boolean;
  previous_version_id?: string | null;
  uploaded_by?: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  uploader?: {
    full_name?: string | null;
    email?: string | null;
  } | null;
}

export interface UploadingFile {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  documentType: DocumentType;
}

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  application: 'Solicitud',
  certificate: 'Certificado',
  logo: 'Logo',
  correspondence: 'Correspondencia',
  invoice: 'Factura',
  contract: 'Contrato',
  power_of_attorney: 'Poder',
  search_report: 'Informe de búsqueda',
  office_action: 'Acción de oficina',
  response: 'Respuesta',
  other: 'Otro',
};

export const DOCUMENT_TYPE_ICONS: Record<DocumentType, string> = {
  application: 'FileText',
  certificate: 'Award',
  logo: 'Image',
  correspondence: 'Mail',
  invoice: 'Receipt',
  contract: 'FileSignature',
  power_of_attorney: 'Scale',
  search_report: 'Search',
  office_action: 'Building2',
  response: 'Reply',
  other: 'File',
};

export const ALLOWED_MIME_TYPES = {
  documents: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  images: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
  ],
  all: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
  ],
};

export function getBucketForEntity(entityType: EntityType): string {
  switch (entityType) {
    case 'matter':
      return 'matter-documents';
    case 'client':
      return 'client-documents';
    case 'deal':
      return 'client-documents'; // Deals use client-documents bucket
    default:
      return 'matter-documents';
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function getMimeTypeIcon(mimeType?: string | null): string {
  if (!mimeType) return 'File';
  if (mimeType.startsWith('image/')) return 'Image';
  if (mimeType === 'application/pdf') return 'FileText';
  if (mimeType.includes('word')) return 'FileType';
  return 'File';
}
