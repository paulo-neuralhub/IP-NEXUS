import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';
import type { Document } from '@/types/documents';
import { useDownloadDocument } from '@/hooks/use-documents';

interface DocumentPreviewModalProps {
  open: boolean;
  onClose: () => void;
  document: Document;
  url: string;
}

export function DocumentPreviewModal({
  open,
  onClose,
  document,
  url,
}: DocumentPreviewModalProps) {
  const { download, isDownloading } = useDownloadDocument();
  const isImage = document.mime_type?.startsWith('image/');
  const isPdf = document.mime_type === 'application/pdf';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="p-4 border-b flex-row items-center justify-between space-y-0">
          <DialogTitle className="truncate pr-4">
            {document.title || document.original_filename}
          </DialogTitle>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => download(document)}
              disabled={isDownloading}
            >
              <Download className="h-4 w-4 mr-2" />
              Descargar
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto p-4 bg-muted/30">
          {isImage && (
            <img
              src={url}
              alt={document.original_filename}
              className="max-w-full h-auto mx-auto rounded-lg shadow-lg"
            />
          )}

          {isPdf && (
            <iframe
              src={url}
              title={document.original_filename}
              className="w-full h-[70vh] rounded-lg border bg-white"
            />
          )}

          {!isImage && !isPdf && (
            <div className="text-center py-12 text-muted-foreground">
              <p>Vista previa no disponible para este tipo de archivo.</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => download(document)}
              >
                <Download className="h-4 w-4 mr-2" />
                Descargar archivo
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
