// =============================================
// COMPONENTE: ClientFolderPicker
// Selector de documentos desde carpetas del cliente
// =============================================

import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
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
  Folder,
  FileText,
  Search,
  ChevronRight,
  ChevronDown,
  Check,
  Building,
  User,
  Paperclip
} from 'lucide-react';
import { fromTable } from '@/lib/supabase';
import { useOrganization } from '@/contexts/organization-context';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface ClientFolderPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (documents: FolderDocument[]) => void;
  clientId?: string;
}

interface Client {
  id: string;
  name: string;
  company_name?: string | null;
  type: string;
}

interface ClientFolder {
  id: string;
  name: string;
  folder_type: string;
  documents: FolderDocument[];
}

interface FolderDocument {
  id: string;
  name: string;
  file_type: string | null;
  file_url: string | null;
  file_size: number | null;
  created_at: string;
  folder_name?: string;
}

const FOLDER_ICONS: Record<string, string> = {
  'contratos': '📝',
  'cartas': '✉️',
  'informes': '📊',
  'facturas': '🧾',
  'documentos_oficiales': '🏛️',
  'otros': '📁',
};

export function ClientFolderPicker({
  open,
  onOpenChange,
  onSelect,
  clientId: initialClientId,
}: ClientFolderPickerProps) {
  const { currentOrganization } = useOrganization();
  const [selectedClientId, setSelectedClientId] = useState(initialClientId || '');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedDocs(new Set());
      setSearchQuery('');
      if (initialClientId) {
        setSelectedClientId(initialClientId);
      }
    }
  }, [open, initialClientId]);

  // Fetch clients
  const { data: clients = [] } = useQuery({
    queryKey: ['clients-for-folders', currentOrganization?.id],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];
      const { data, error } = await fromTable('contacts')
        .select('id, name, company_name, type')
        .eq('organization_id', currentOrganization.id)
        .in('type', ['company', 'person'])
        .order('name');
      if (error) throw error;
      return (data || []) as Client[];
    },
    enabled: open && !!currentOrganization?.id,
  });

  // Fetch folders with documents
  const { data: folders = [], isLoading: isLoadingFolders } = useQuery({
    queryKey: ['client-folders', selectedClientId],
    queryFn: async () => {
      if (!selectedClientId) return [];
      
      // Get folders
      const { data: foldersData, error: foldersError } = await fromTable('client_folders')
        .select('id, name, folder_type')
        .eq('client_id', selectedClientId)
        .order('name');
      
      if (foldersError) throw foldersError;
      if (!foldersData?.length) return [];

      // Get documents for all folders
      const folderIds = foldersData.map((f: any) => f.id);
      const { data: docsData, error: docsError } = await fromTable('client_folder_documents')
        .select('id, name, file_type, file_url, file_size, created_at, folder_id')
        .in('folder_id', folderIds)
        .order('created_at', { ascending: false });
      
      if (docsError) throw docsError;

      // Map documents to folders
      return foldersData.map((folder: any) => ({
        ...folder,
        documents: (docsData || []).filter((doc: any) => doc.folder_id === folder.id),
      })) as ClientFolder[];
    },
    enabled: !!selectedClientId,
  });

  const toggleFolder = useCallback((folderId: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  }, []);

  const toggleDocument = useCallback((docId: string) => {
    setSelectedDocs(prev => {
      const next = new Set(prev);
      if (next.has(docId)) {
        next.delete(docId);
      } else {
        next.add(docId);
      }
      return next;
    });
  }, []);

  const handleConfirm = useCallback(() => {
    const selectedDocuments: FolderDocument[] = [];
    folders.forEach(folder => {
      folder.documents.forEach(doc => {
        if (selectedDocs.has(doc.id)) {
          selectedDocuments.push({
            ...doc,
            folder_name: folder.name,
          });
        }
      });
    });
    onSelect(selectedDocuments);
    onOpenChange(false);
  }, [folders, selectedDocs, onSelect, onOpenChange]);

  // Filter folders/documents by search
  const filteredFolders = folders.map(folder => ({
    ...folder,
    documents: folder.documents.filter(doc =>
      doc.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(folder => 
    searchQuery === '' || folder.documents.length > 0
  );

  const totalDocs = folders.reduce((acc, f) => acc + f.documents.length, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Folder className="w-5 h-5 text-primary" />
            Seleccionar documentos del cliente
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {/* Client selector */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground w-16">Cliente:</span>
            <Select value={selectedClientId} onValueChange={setSelectedClientId}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Selecciona un cliente" />
              </SelectTrigger>
              <SelectContent>
                {clients.map(client => (
                  <SelectItem key={client.id} value={client.id}>
                    <div className="flex items-center gap-2">
                      {client.type === 'company' ? (
                        <Building className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <User className="w-4 h-4 text-muted-foreground" />
                      )}
                      {client.company_name || client.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Search */}
          {selectedClientId && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar documentos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          )}
        </div>

        {/* Folders and documents list */}
        <ScrollArea className="flex-1 min-h-[300px] border rounded-lg">
          {!selectedClientId ? (
            <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
              <Building className="w-12 h-12 mb-3 opacity-30" />
              <p>Selecciona un cliente para ver sus documentos</p>
            </div>
          ) : isLoadingFolders ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="w-5 h-5" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </div>
          ) : filteredFolders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
              <FileText className="w-12 h-12 mb-3 opacity-30" />
              <p>No hay documentos en las carpetas</p>
              {totalDocs === 0 && (
                <p className="text-sm text-muted-foreground/70 mt-1">
                  Los documentos se añadirán aquí automáticamente
                </p>
              )}
            </div>
          ) : (
            <div className="p-2">
              {filteredFolders.map(folder => (
                <div key={folder.id} className="mb-1">
                  {/* Folder header */}
                  <button
                    type="button"
                    onClick={() => toggleFolder(folder.id)}
                    className={cn(
                      "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium",
                      "hover:bg-muted transition-colors"
                    )}
                  >
                    {expandedFolders.has(folder.id) ? (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    )}
                    <span>{FOLDER_ICONS[folder.folder_type] || '📁'}</span>
                    <span>{folder.name}</span>
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {folder.documents.length}
                    </Badge>
                  </button>

                  {/* Documents */}
                  {expandedFolders.has(folder.id) && folder.documents.length > 0 && (
                    <div className="ml-6 pl-4 border-l space-y-1 py-1">
                      {folder.documents.map(doc => (
                        <label
                          key={doc.id}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer",
                            "hover:bg-muted/50 transition-colors",
                            selectedDocs.has(doc.id) && "bg-primary/5"
                          )}
                        >
                          <Checkbox
                            checked={selectedDocs.has(doc.id)}
                            onCheckedChange={() => toggleDocument(doc.id)}
                          />
                          <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <span className="flex-1 truncate text-sm">{doc.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(doc.created_at), { addSuffix: true, locale: es })}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <DialogFooter>
          <div className="flex items-center justify-between w-full">
            <span className="text-sm text-muted-foreground">
              {selectedDocs.size} documento(s) seleccionado(s)
            </span>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button onClick={handleConfirm} disabled={selectedDocs.size === 0}>
                <Paperclip className="w-4 h-4 mr-2" />
                Adjuntar seleccionados
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
