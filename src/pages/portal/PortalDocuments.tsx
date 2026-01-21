/**
 * Portal Documents
 * Lista de documentos compartidos con el cliente
 */

import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  FileSpreadsheet
} from 'lucide-react';

// Mock data
const mockDocuments = [
  {
    id: '1',
    name: 'Solicitud de registro marca NEXUS',
    matter: 'TM-2025-001',
    matterTitle: 'Marca NEXUS',
    type: 'pdf',
    size: '245 KB',
    date: '2025-01-15',
    category: 'application',
  },
  {
    id: '2',
    name: 'Poder de representación firmado',
    matter: 'TM-2025-001',
    matterTitle: 'Marca NEXUS',
    type: 'pdf',
    size: '156 KB',
    date: '2025-01-14',
    category: 'power',
  },
  {
    id: '3',
    name: 'Acuse de recibo OEPM',
    matter: 'TM-2025-001',
    matterTitle: 'Marca NEXUS',
    type: 'pdf',
    size: '89 KB',
    date: '2025-01-16',
    category: 'receipt',
  },
  {
    id: '4',
    name: 'Memoria descriptiva patente',
    matter: 'PT-2025-003',
    matterTitle: 'Patente IoT Device',
    type: 'pdf',
    size: '1.2 MB',
    date: '2025-02-20',
    category: 'application',
  },
  {
    id: '5',
    name: 'Dibujos técnicos',
    matter: 'PT-2025-003',
    matterTitle: 'Patente IoT Device',
    type: 'image',
    size: '3.4 MB',
    date: '2025-02-18',
    category: 'drawings',
  },
  {
    id: '6',
    name: 'Informe de costes Q1 2025',
    matter: null,
    matterTitle: null,
    type: 'xlsx',
    size: '67 KB',
    date: '2025-04-01',
    category: 'report',
  },
];

export default function PortalDocuments() {
  const { slug } = useParams<{ slug: string }>();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filteredDocs = mockDocuments.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-500" />;
      case 'image':
        return <FileImage className="w-5 h-5 text-blue-500" />;
      case 'xlsx':
        return <FileSpreadsheet className="w-5 h-5 text-green-500" />;
      default:
        return <File className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      application: 'Solicitud',
      power: 'Poder',
      receipt: 'Acuse',
      drawings: 'Dibujos',
      report: 'Informe',
    };
    return labels[category] || category;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Documentos</h1>
        <p className="text-muted-foreground">
          Documentos compartidos contigo por tu asesor
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar documentos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="application">Solicitudes</SelectItem>
                <SelectItem value="power">Poderes</SelectItem>
                <SelectItem value="receipt">Acuses</SelectItem>
                <SelectItem value="drawings">Dibujos</SelectItem>
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
                No se encontraron documentos
              </div>
            ) : (
              filteredDocs.map((doc) => (
                <div 
                  key={doc.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      {getFileIcon(doc.type)}
                    </div>
                    <div className="space-y-1 min-w-0">
                      <p className="font-medium truncate">{doc.name}</p>
                      <div className="flex items-center gap-2 flex-wrap text-sm text-muted-foreground">
                        {doc.matterTitle && (
                          <>
                            <span>{doc.matterTitle}</span>
                            <span>•</span>
                          </>
                        )}
                        <span>{doc.size}</span>
                        <span>•</span>
                        <span>{new Date(doc.date).toLocaleDateString('es')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:ml-auto">
                    <Badge variant="outline">{getCategoryLabel(doc.category)}</Badge>
                    <Button size="sm" variant="ghost">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Download className="w-4 h-4" />
                    </Button>
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
