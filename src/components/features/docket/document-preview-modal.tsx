import { useState, useEffect } from 'react';
import { X, Download, ExternalLink, Loader2 } from 'lucide-react';
import { useDownloadDocument, getSignedUrl } from '@/hooks/use-matter-files';
import type { MatterDocument } from '@/types/matters';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Props {
  doc: MatterDocument;
  onClose: () => void;
}

export function DocumentPreviewModal({ doc, onClose }: Props) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const downloadMutation = useDownloadDocument();
  
  useEffect(() => {
    const loadUrl = async () => {
      setLoading(true);
      const url = await getSignedUrl(doc.file_path);
      setSignedUrl(url);
      setLoading(false);
    };
    loadUrl();
  }, [doc.file_path]);
  
  const handleDownload = () => {
    downloadMutation.mutate({ filePath: doc.file_path, fileName: doc.name });
  };
  
  const isImage = doc.mime_type?.startsWith('image/');
  const isPdf = doc.mime_type === 'application/pdf';
  
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="truncate pr-4">{doc.name}</DialogTitle>
            <div className="flex items-center gap-2">
              {signedUrl && (
                <Button variant="ghost" size="icon" asChild>
                  <a href={signedUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={handleDownload}>
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="p-4 overflow-auto" style={{ maxHeight: 'calc(90vh - 80px)' }}>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : signedUrl ? (
            <>
              {isImage && (
                <img 
                  src={signedUrl} 
                  alt={doc.name}
                  className="max-w-full h-auto mx-auto rounded-lg"
                />
              )}
              {isPdf && (
                <iframe
                  src={signedUrl}
                  title={doc.name}
                  className="w-full h-[70vh] rounded-lg border"
                />
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              No se pudo cargar la vista previa
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
