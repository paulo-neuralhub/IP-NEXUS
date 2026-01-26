/**
 * Portal Documents
 * Lista de documentos compartidos con el cliente - DATOS REALES
 */

import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usePortalDocuments, useDownloadDocument, useViewDocument } from '@/hooks/use-portal-documents';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Search, 
  FileText, 
  Download,
  Eye,
  Filter,
  File,
  FileImage,
  FileSpreadsheet,
  FilePen,
  CheckCircle2
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function PortalDocuments() {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const { data: documents, isLoading, error } = usePortalDocuments(categoryFilter);
  const downloadMutation = useDownloadDocument();
  const viewMutation = useViewDocument();

  const filteredDocs = useMemo(() => {
    if (!documents) return [];
    return documents.filter((doc) => {
      return doc.name.toLowerCase().includes(search.toLowerCase());
    });
  }, [documents, search]);

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) {
      return <FileText className="w-5 h-5 text-red-500" />;
    }
    if (mimeType.includes('image')) {
      return <FileImage className="w-5 h-5 text-blue-500" />;
    }
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) {
      return <FileSpreadsheet className="w-5 h-5 text-green-500" />;
    }
    if (mimeType.includes('word') || mimeType.includes('document')) {
      return <FilePen className="w-5 h-5 text-blue-600" />;
    }
    return <File className="w-5 h-5 text-muted-foreground" />;
  };

  const handleDownload = (doc: typeof filteredDocs[0]) => {
    downloadMutation.mutate({
      sharedContentId: doc.id,
      filePath: doc.file_path,
      fileName: doc.name,
    });
  };

  const handleView = (doc: typeof filteredDocs[0]) => {
    viewMutation.mutate(doc.id);
    // Aquí se podría abrir un modal de preview
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <Card>
          <CardContent className="pt-6">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 mb-3" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('portal.documents.title')}</h1>
        <p className="text-muted-foreground">
          {t('portal.documents.subtitle')}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-sm text-muted-foreground">Total documentos</p>
            <p className="text-2xl font-bold mt-1">{documents?.length || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-sm text-muted-foreground">Sin ver</p>
            <p className="text-2xl font-bold mt-1 text-amber-600">
              {documents?.filter(d => !d.viewed_at).length || 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-sm text-muted-foreground">Descargados</p>
            <p className="text-2xl font-bold mt-1 text-green-600">
              {documents?.filter(d => d.download_count > 0).length || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t('common.search')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder={t('common.filter')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.all')}</SelectItem>
                <SelectItem value="application">Solicitudes</SelectItem>
                <SelectItem value="power">Poderes</SelectItem>
                <SelectItem value="receipt">Acuses</SelectItem>
                <SelectItem value="official">Oficiales</SelectItem>
                <SelectItem value="report">Informes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {/* Documents List */}
          <div className="space-y-3">
            {filteredDocs.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto opacity-30 mb-4" />
                <p className="font-medium">{t('portal.documents.no_documents')}</p>
                <p className="text-sm">No hay documentos compartidos contigo</p>
              </div>
            ) : (
              filteredDocs.map((doc) => (
                <div 
                  key={doc.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      {getFileIcon(doc.mime_type)}
                    </div>
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{doc.name}</p>
                        {!doc.viewed_at && (
                          <Badge className="bg-amber-100 text-amber-700 border-amber-200 shrink-0">
                            Nuevo
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap text-sm text-muted-foreground">
                        {doc.matter_title && (
                          <>
                            <span className="truncate max-w-[200px]">{doc.matter_title}</span>
                            <span>•</span>
                          </>
                        )}
                        <span>{formatFileSize(doc.file_size)}</span>
                        <span>•</span>
                        <span>{format(new Date(doc.shared_at), 'd MMM yyyy', { locale: es })}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:ml-auto">
                    {doc.category && (
                      <Badge variant="outline">{doc.category}</Badge>
                    )}
                    {doc.viewed_at && (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    )}
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => handleView(doc)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    {doc.can_download && (
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleDownload(doc)}
                        disabled={downloadMutation.isPending}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
