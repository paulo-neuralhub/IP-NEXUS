// src/components/market/work/WorkFiles.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  FileText, 
  Image, 
  Download, 
  Upload,
  File,
  FileSpreadsheet,
  FileArchive,
  FolderOpen
} from 'lucide-react';
import { useWorkFiles, type WorkFile } from '@/hooks/market/useWorkflow';

interface WorkFilesProps {
  transactionId: string;
  onUpload?: () => void;
  isReadOnly?: boolean;
}

function getFileIcon(type: string) {
  if (type.startsWith('image/')) return Image;
  if (type.includes('pdf')) return FileText;
  if (type.includes('spreadsheet') || type.includes('excel')) return FileSpreadsheet;
  if (type.includes('zip') || type.includes('archive')) return FileArchive;
  return File;
}

function formatFileSize(bytes: number) {
  if (bytes === 0) return 'N/A';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function WorkFiles({ transactionId, onUpload, isReadOnly = false }: WorkFilesProps) {
  const { data: files = [], isLoading } = useWorkFiles(transactionId);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <FolderOpen className="h-5 w-5" />
          Archivos Compartidos
        </CardTitle>
        {!isReadOnly && onUpload && (
          <Button variant="outline" size="sm" onClick={onUpload}>
            <Upload className="h-4 w-4 mr-2" />
            Subir Archivo
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-10 w-10 bg-muted rounded" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/2" />
                  <div className="h-3 bg-muted rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : files.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FolderOpen className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p>No hay archivos compartidos</p>
            <p className="text-sm">Los archivos adjuntados en los mensajes aparecerán aquí</p>
          </div>
        ) : (
          <div className="space-y-3">
            {files.map(file => {
              const Icon = getFileIcon(file.file_type);
              
              return (
                <div 
                  key={file.id}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center justify-center h-10 w-10 bg-muted rounded shrink-0">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{file.file_name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{formatFileSize(file.file_size)}</span>
                      <span>•</span>
                      <span>{format(new Date(file.created_at), 'dd/MM/yyyy', { locale: es })}</span>
                    </div>
                  </div>

                  {file.uploader && (
                    <Avatar className="h-6 w-6 shrink-0">
                      <AvatarImage src={file.uploader.avatar_url || undefined} />
                      <AvatarFallback className="text-[10px]">
                        {file.uploader.display_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  )}

                  <Button
                    variant="ghost"
                    size="icon"
                    asChild
                    className="shrink-0"
                  >
                    <a href={file.file_path} download target="_blank" rel="noopener noreferrer">
                      <Download className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
