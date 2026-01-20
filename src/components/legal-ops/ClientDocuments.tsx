// ============================================
// src/components/legal-ops/ClientDocuments.tsx
// ============================================

import { useClientDocuments } from '@/hooks/legal-ops/useDocumentNER';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  FileText, Upload, Search, MoreHorizontal, Eye, Download,
  Trash2, Brain, CheckCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useState } from 'react';
import { DocumentValidityBadge } from './DocumentValidityBadge';
import { DocValidityStatus } from '@/types/legal-ops';

interface ClientDocumentsProps {
  clientId: string;
}

const DOC_TYPE_LABELS: Record<string, string> = {
  poder_general: 'Poder General',
  poder_especial: 'Poder Especial',
  escritura_constitucion: 'Escritura Constitución',
  certificado_registro: 'Certificado Registro',
  contrato: 'Contrato',
  notificacion_oficial: 'Notificación Oficial',
  poderes: 'Poderes',
  contratos: 'Contratos',
  identificacion: 'Identificación',
  correspondencia: 'Correspondencia',
  otro: 'Otro'
};

export function ClientDocuments({ clientId }: ClientDocumentsProps) {
  const { data: documents, isLoading } = useClientDocuments(clientId);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDocuments = documents?.filter(doc => 
    doc.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.file_name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">
            Documentos ({documents?.length || 0})
          </CardTitle>
          <Button size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Subir documento
          </Button>
        </div>
        
        {/* Buscador */}
        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar documentos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-6 text-center text-muted-foreground">
            Cargando documentos...
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="p-6 text-center">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">
              {searchQuery ? 'No se encontraron documentos' : 'No hay documentos'}
            </p>
            <Button variant="outline" size="sm" className="mt-3">
              <Upload className="w-4 h-4 mr-2" />
              Subir primer documento
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Documento</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Vigencia</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocuments.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium truncate">
                          {doc.title || doc.file_name}
                        </p>
                        {doc.title && (
                          <p className="text-xs text-muted-foreground truncate">
                            {doc.file_name}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {DOC_TYPE_LABELS[doc.doc_type || 'otro'] || doc.doc_type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DocumentValidityBadge
                      status={(doc.validity_status || 'pending_verification') as DocValidityStatus}
                      daysRemaining={doc.valid_until 
                        ? Math.ceil((new Date(doc.valid_until).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                        : null
                      }
                      verified={doc.validity_verified || false}
                    />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(doc.created_at), 'dd MMM yyyy', { locale: es })}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="w-4 h-4 mr-2" />
                          Ver documento
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="w-4 h-4 mr-2" />
                          Descargar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Brain className="w-4 h-4 mr-2" />
                          Extraer entidades (NER)
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Verificar vigencia
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
