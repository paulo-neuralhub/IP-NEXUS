// src/components/backoffice/ipo/LegalLibraryTab.tsx

import { useState, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Scale,
  FileText,
  Globe,
  DollarSign,
  FileCheck,
  Upload,
  RefreshCw,
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  Clock,
  Search,
  Download,
  Loader2,
  BookOpen,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  useLegalDocuments, 
  useTreatyStatus, 
  useOfficialForms,
  useLegalChangeAlerts,
  useSyncWIPO,
  useRunCrawler,
  useUploadLegalDocument,
  useLegalLibraryStats,
} from '@/hooks/backoffice/useLegalLibrary';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { 
  STATUS_LABELS, 
  RELIABILITY_LABELS, 
  IMPACT_LEVELS,
  TREATIES,
  DOCUMENT_TYPES,
} from '@/types/legal-library.types';

interface LegalLibraryTabProps {
  officeId: string;
  officeName: string;
}

export function LegalLibraryTab({ officeId, officeName }: LegalLibraryTabProps) {
  const [activeSection, setActiveSection] = useState('primary');
  const [searchQuery, setSearchQuery] = useState('');
  const { data: stats } = useLegalLibraryStats(officeId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Biblioteca Legal: {officeName}
          </h3>
          <p className="text-sm text-muted-foreground">
            {stats?.totalDocuments || 0} documentos • {stats?.treatiesMember || 0} tratados • {stats?.activeAlerts || 0} alertas activas
          </p>
        </div>
        <div className="flex gap-2">
          <SyncWIPOButton officeId={officeId} />
          <RunCrawlerButton officeId={officeId} />
          <UploadDocumentButton officeId={officeId} />
        </div>
      </div>

      {/* Alertas de cambio */}
      <ChangeAlerts officeId={officeId} />

      {/* Búsqueda */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar en la biblioteca legal..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Secciones */}
      <Tabs value={activeSection} onValueChange={setActiveSection}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="primary" className="flex items-center gap-2">
            <Scale className="h-4 w-4" />
            Normativa Primaria
          </TabsTrigger>
          <TabsTrigger value="secondary" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Guías y Manuales
          </TabsTrigger>
          <TabsTrigger value="operational" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Tasas y Formularios
          </TabsTrigger>
          <TabsTrigger value="treaties" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Tratados
          </TabsTrigger>
        </TabsList>

        <TabsContent value="primary">
          <PrimaryLegislation officeId={officeId} searchQuery={searchQuery} />
        </TabsContent>

        <TabsContent value="secondary">
          <SecondaryDocuments officeId={officeId} searchQuery={searchQuery} />
        </TabsContent>

        <TabsContent value="operational">
          <OperationalDocuments officeId={officeId} searchQuery={searchQuery} />
        </TabsContent>

        <TabsContent value="treaties">
          <TreatyStatusSection officeId={officeId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ============================================
// PRIMARY LEGISLATION
// ============================================

function PrimaryLegislation({ officeId, searchQuery }: { officeId: string; searchQuery: string }) {
  const { data: documents, isLoading } = useLegalDocuments(officeId, { 
    level: 'primary',
    search: searchQuery || undefined,
  });

  if (isLoading) {
    return <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Leyes y Decretos Vigentes</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Número</TableHead>
              <TableHead>Vigencia</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fuente</TableHead>
              <TableHead>Indexado</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents?.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{doc.title}</p>
                    {doc.title_english && (
                      <p className="text-xs text-muted-foreground">{doc.title_english}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {doc.official_number || '-'}
                </TableCell>
                <TableCell className="text-sm">
                  {format(new Date(doc.effective_date), 'dd/MM/yyyy')}
                </TableCell>
                <TableCell>
                  <StatusBadge status={doc.status} />
                </TableCell>
                <TableCell>
                  <ReliabilityBadge reliability={doc.source_reliability} />
                </TableCell>
                <TableCell>
                  {doc.is_indexed ? (
                    <Badge className="bg-green-100 text-green-700">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {doc.chunk_count} chunks
                    </Badge>
                  ) : (
                    <Badge variant="outline">
                      <Clock className="h-3 w-3 mr-1" />
                      Pendiente
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {doc.source_url && (
                      <Button variant="ghost" size="icon" asChild>
                        <a href={doc.source_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    <Button variant="ghost" size="icon">
                      <FileText className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {documents?.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  No hay documentos de normativa primaria
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// ============================================
// SECONDARY DOCUMENTS
// ============================================

function SecondaryDocuments({ officeId, searchQuery }: { officeId: string; searchQuery: string }) {
  const { data: documents, isLoading } = useLegalDocuments(officeId, { 
    level: 'secondary',
    search: searchQuery || undefined,
  });

  if (isLoading) {
    return <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Manuales de Examen y Guías de Práctica</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-3">
            {documents?.map((doc) => (
              <div key={doc.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium">{doc.title}</h4>
                    {doc.title_english && (
                      <p className="text-sm text-muted-foreground">{doc.title_english}</p>
                    )}
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline">{DOCUMENT_TYPES[doc.document_type] || doc.document_type}</Badge>
                      <StatusBadge status={doc.status} />
                      {doc.ip_types?.map((type) => (
                        <Badge key={type} variant="secondary">{type}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <p>Actualizado: {format(new Date(doc.updated_at), 'dd/MM/yyyy')}</p>
                    <p>Verificado: {doc.last_verified_at ? format(new Date(doc.last_verified_at), 'dd/MM/yyyy') : 'Nunca'}</p>
                  </div>
                </div>
                {doc.content_summary && (
                  <p className="text-sm text-muted-foreground mt-2">{doc.content_summary}</p>
                )}
              </div>
            ))}
            {documents?.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                No hay guías o manuales
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

// ============================================
// OPERATIONAL DOCUMENTS (Fees & Forms)
// ============================================

function OperationalDocuments({ officeId, searchQuery }: { officeId: string; searchQuery: string }) {
  return (
    <div className="grid grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Tasas Oficiales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FeeScheduleTable officeId={officeId} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileCheck className="h-4 w-4" />
            Formularios Oficiales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FormsTable officeId={officeId} />
        </CardContent>
      </Card>
    </div>
  );
}

function FeeScheduleTable({ officeId }: { officeId: string }) {
  const { data: fees, isLoading } = useQuery({
    queryKey: ['ipo-fees', officeId],
    queryFn: async () => {
      const { data } = await (supabase
        .from('ipo_official_fees' as any)
        .select('*')
        .eq('office_id', officeId)
        .order('fee_type') as any);
      return data || [];
    },
    enabled: !!officeId,
  });
    return <div className="flex items-center justify-center py-8"><Loader2 className="h-4 w-4 animate-spin" /></div>;
  }

  return (
    <ScrollArea className="h-[300px]">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Concepto</TableHead>
            <TableHead>Tipo IP</TableHead>
            <TableHead className="text-right">Importe</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fees?.map((fee) => (
            <TableRow key={fee.id}>
              <TableCell>
                <span className="font-medium">{fee.fee_type}</span>
                {fee.per_class && (
                  <Badge variant="outline" className="ml-2 text-xs">por clase</Badge>
                )}
              </TableCell>
              <TableCell>{fee.ip_type}</TableCell>
              <TableCell className="text-right font-mono">
                {fee.amount} {fee.currency}
              </TableCell>
            </TableRow>
          ))}
          {(!fees || fees.length === 0) && (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-muted-foreground py-4">
                No hay tasas configuradas
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </ScrollArea>
  );
}

function FormsTable({ officeId }: { officeId: string }) {
  const { data: forms, isLoading } = useOfficialForms(officeId);

  if (isLoading) {
    return <div className="flex items-center justify-center py-8"><Loader2 className="h-4 w-4 animate-spin" /></div>;
  }

  return (
    <ScrollArea className="h-[300px]">
      <div className="space-y-2">
        {forms?.map((form) => (
          <div key={form.id} className="flex items-center justify-between p-2 border rounded">
            <div>
              <p className="font-medium text-sm">{form.form_name}</p>
              <div className="flex gap-1 mt-1">
                <Badge variant="outline" className="text-xs">{form.form_type}</Badge>
                {form.file_format && (
                  <Badge variant="secondary" className="text-xs">{form.file_format}</Badge>
                )}
              </div>
            </div>
            <Button variant="ghost" size="icon">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        ))}
        {(!forms || forms.length === 0) && (
          <div className="text-center text-muted-foreground py-4">
            No hay formularios configurados
          </div>
        )}
      </div>
    </ScrollArea>
  );
}

// ============================================
// TREATY STATUS
// ============================================

function TreatyStatusSection({ officeId }: { officeId: string }) {
  const { data: treaties, isLoading } = useTreatyStatus(officeId);

  if (isLoading) {
    return <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  const treatyGroups: Record<string, typeof TREATIES> = {
    'Protección de Marcas': TREATIES.filter(t => t.category === 'trademarks'),
    'Protección de Patentes': TREATIES.filter(t => t.category === 'patents'),
    'Protección de Diseños': TREATIES.filter(t => t.category === 'designs'),
    'Clasificación': TREATIES.filter(t => t.category === 'classification'),
    'General': TREATIES.filter(t => t.category === 'general'),
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Estado de Adhesión a Tratados Internacionales</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-6">
          {Object.entries(treatyGroups).map(([group, groupTreaties]) => (
            <div key={group}>
              <h4 className="font-medium text-sm mb-3">{group}</h4>
              <div className="space-y-2">
                {groupTreaties.map((treaty) => {
                  const status = treaties?.find((t) => t.treaty_code === treaty.code);
                  return (
                    <div key={treaty.code} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">{treaty.name}</span>
                      {status?.status === 'member' ? (
                        <Badge className="bg-green-100 text-green-700">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Miembro
                        </Badge>
                      ) : status?.status === 'signatory' ? (
                        <Badge className="bg-blue-100 text-blue-700">
                          Signatario
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">
                          No miembro
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// AUXILIARY COMPONENTS
// ============================================

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_LABELS[status as keyof typeof STATUS_LABELS] || { label: status, color: 'bg-gray-100 text-gray-700' };
  return <Badge className={config.color}>{config.label}</Badge>;
}

function ReliabilityBadge({ reliability }: { reliability: string }) {
  const config = RELIABILITY_LABELS[reliability as keyof typeof RELIABILITY_LABELS] || { label: reliability, color: 'bg-gray-100 text-gray-700' };
  return <Badge className={config.color}>{config.label}</Badge>;
}

function ChangeAlerts({ officeId }: { officeId: string }) {
  const { data: alerts } = useLegalChangeAlerts(officeId, 'active');

  if (!alerts?.length) return null;

  return (
    <div className="space-y-2">
      {alerts.slice(0, 5).map((alert) => {
        const impactConfig = IMPACT_LEVELS[alert.impact_level as keyof typeof IMPACT_LEVELS];
        return (
          <div
            key={alert.id}
            className={`p-3 rounded-lg border flex items-start gap-3 ${impactConfig?.bgColor || 'bg-gray-50 border-gray-200'}`}
          >
            <AlertTriangle className={`h-5 w-5 mt-0.5 ${impactConfig?.color || 'text-gray-600'}`} />
            <div className="flex-1">
              <p className="font-medium">{alert.title}</p>
              {alert.summary && (
                <p className="text-sm text-muted-foreground">{alert.summary}</p>
              )}
            </div>
            <Button variant="outline" size="sm">Revisar</Button>
          </div>
        );
      })}
    </div>
  );
}

function SyncWIPOButton({ officeId }: { officeId: string }) {
  const mutation = useSyncWIPO();

  return (
    <Button 
      variant="outline" 
      onClick={() => mutation.mutate(officeId)} 
      disabled={mutation.isPending}
    >
      {mutation.isPending ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Globe className="h-4 w-4 mr-2" />
      )}
      Sync WIPO
    </Button>
  );
}

function RunCrawlerButton({ officeId }: { officeId: string }) {
  const mutation = useRunCrawler();

  return (
    <Button 
      variant="outline" 
      onClick={() => mutation.mutate(officeId)} 
      disabled={mutation.isPending}
    >
      <RefreshCw className={`h-4 w-4 mr-2 ${mutation.isPending ? 'animate-spin' : ''}`} />
      Detectar Cambios
    </Button>
  );
}

function UploadDocumentButton({ officeId }: { officeId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const uploadMutation = useUploadLegalDocument();

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      uploadMutation.mutate({ officeId, file }, {
        onSuccess: () => setIsOpen(false),
      });
    }
  }, [officeId, uploadMutation]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadMutation.mutate({ officeId, file }, {
        onSuccess: () => setIsOpen(false),
      });
    }
  }, [officeId, uploadMutation]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Upload className="h-4 w-4 mr-2" />
          Subir Documento
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Subir Documento Legal</DialogTitle>
          <DialogDescription>
            La IA etiquetará y clasificará automáticamente el documento
          </DialogDescription>
        </DialogHeader>
        <div 
          className={`p-8 border-2 border-dashed rounded-lg text-center transition-colors ${
            isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
          }`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          {uploadMutation.isPending ? (
            <>
              <Loader2 className="h-12 w-12 mx-auto text-primary mb-4 animate-spin" />
              <p className="text-muted-foreground">Procesando documento...</p>
            </>
          ) : (
            <>
              <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Arrastra un documento PDF, DOCX o HTML
              </p>
              <p className="text-xs text-muted-foreground mt-2 mb-4">
                o haz clic para seleccionar
              </p>
              <input
                type="file"
                accept=".pdf,.docx,.doc,.html"
                onChange={handleFileSelect}
                className="hidden"
                id="legal-doc-upload"
              />
              <Button variant="outline" asChild>
                <label htmlFor="legal-doc-upload" className="cursor-pointer">
                  Seleccionar archivo
                </label>
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
