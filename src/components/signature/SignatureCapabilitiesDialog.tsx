// ============================================================
// IP-NEXUS - SIGNATURE CAPABILITIES DIALOG
// PROMPT 22: Tabla de capacidades con disclaimer legal
// ============================================================

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  HelpCircle,
  FileText,
  Scale,
  Briefcase,
  Building2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SignatureCapabilitiesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Status = 'valid' | 'partial' | 'invalid';

interface RowData {
  doc: string;
  l1: Status;
  l2: Status;
  note: string;
  highlight?: boolean;
  danger?: boolean;
}

function StatusIcon({ status }: { status: Status }) {
  switch (status) {
    case 'valid':
      return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    case 'partial':
      return <HelpCircle className="h-4 w-4 text-amber-500" />;
    case 'invalid':
      return <XCircle className="h-4 w-4 text-red-500" />;
  }
}

function Row({ doc, l1, l2, note, highlight, danger }: RowData) {
  return (
    <tr className={cn(
      "border-b border-border/50",
      highlight && "bg-amber-50 dark:bg-amber-950/30",
      danger && "bg-red-50 dark:bg-red-950/30"
    )}>
      <td className="px-3 py-2 text-sm font-medium">{doc}</td>
      <td className="px-3 py-2 text-center">
        <StatusIcon status={l1} />
      </td>
      <td className="px-3 py-2 text-center">
        <StatusIcon status={l2} />
      </td>
      <td className="px-3 py-2 text-xs text-muted-foreground">
        {note}
      </td>
    </tr>
  );
}

export function SignatureCapabilitiesDialog({ open, onOpenChange }: SignatureCapabilitiesDialogProps) {
  const commercialDocs: RowData[] = [
    { doc: 'Documento de encargo', l1: 'valid', l2: 'valid', note: 'Válido en UE y mayoría de jurisdicciones' },
    { doc: 'Presupuesto', l1: 'valid', l2: 'valid', note: 'Sin restricciones conocidas' },
    { doc: 'NDA / Confidencialidad', l1: 'valid', l2: 'valid', note: 'Válido en UE y mayoría de jurisdicciones' },
    { doc: 'Instrucciones', l1: 'valid', l2: 'valid', note: 'Sin restricciones conocidas' },
    { doc: 'Autorización de pago', l1: 'valid', l2: 'valid', note: 'Sin restricciones conocidas' },
  ];

  const powerDocs: RowData[] = [
    { doc: 'EUIPO (Marcas UE)', l1: 'valid', l2: 'valid', note: 'Acepta firma electrónica estándar' },
    { doc: 'OEPM (España)', l1: 'valid', l2: 'valid', note: 'Acepta firma electrónica avanzada' },
    { doc: 'USPTO (EE.UU.)', l1: 'valid', l2: 'valid', note: 'Acepta desde marzo 2024' },
    { doc: 'UKIPO (Reino Unido)', l1: 'valid', l2: 'valid', note: 'Acepta firma electrónica' },
    { doc: 'IMPI (México)', l1: 'valid', l2: 'valid', note: 'Acepta firma electrónica' },
    { doc: 'EPO (Patentes EU)', l1: 'partial', l2: 'valid', note: 'Requiere QES o manuscrita', highlight: true },
    { doc: 'WIPO', l1: 'partial', l2: 'valid', note: 'Requisitos variables por trámite', highlight: true },
    { doc: 'Alemania (DPMA)', l1: 'partial', l2: 'valid', note: 'BGB exige forma escrita', highlight: true },
    { doc: 'Japón (JPO)', l1: 'partial', l2: 'partial', note: 'Ley de Firma Electrónica estricta', highlight: true },
    { doc: 'China (CNIPA)', l1: 'invalid', l2: 'invalid', note: 'Requiere firma manuscrita + sello físico', danger: true },
    { doc: 'Brasil (INPI)', l1: 'invalid', l2: 'invalid', note: 'Requiere certificado ICP-Brasil', danger: true },
  ];

  const assignmentDocs: RowData[] = [
    { doc: 'Cesión general', l1: 'valid', l2: 'valid', note: 'Recomendado QES para alto valor' },
    { doc: 'Cesión EPO', l1: 'partial', l2: 'valid', note: 'EPO requiere QES o manuscrita', highlight: true },
    { doc: 'Licencia exclusiva', l1: 'valid', l2: 'valid', note: 'Recomendado QES por implicaciones' },
    { doc: 'Licencia no exclusiva', l1: 'valid', l2: 'valid', note: 'Firma estándar generalmente suficiente' },
    { doc: 'Sublicencia', l1: 'valid', l2: 'valid', note: 'Según contrato principal' },
  ];

  const contractDocs: RowData[] = [
    { doc: 'Contrato con agente', l1: 'valid', l2: 'valid', note: 'Firma estándar válida' },
    { doc: 'Contrato corresponsal EPO', l1: 'partial', l2: 'valid', note: 'Recomendado QES', highlight: true },
    { doc: 'Acuerdo de coexistencia', l1: 'valid', l2: 'valid', note: 'QES si riesgo de litigio' },
    { doc: 'Settlement/Transacción', l1: 'valid', l2: 'valid', note: 'Recomendado QES por valor legal' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary" />
            Capacidades de Firma Electrónica
          </DialogTitle>
          <DialogDescription>
            Guía orientativa sobre validez de firmas electrónicas por tipo de documento
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[70vh] pr-4">
          {/* DISCLAIMER LEGAL - MUY IMPORTANTE */}
          <Alert variant="destructive" className="mb-6 border-2">
            <AlertTriangle className="h-5 w-5" />
            <AlertDescription className="text-sm">
              <strong>⚠️ AVISO LEGAL IMPORTANTE:</strong> Esta información es{' '}
              <strong>únicamente orientativa</strong> y no constituye asesoramiento legal. 
              La validez de las firmas electrónicas depende de múltiples factores y puede cambiar. 
              IP-NEXUS <strong>NO GARANTIZA</strong> la aceptación de documentos por oficinas de PI 
              ni terceros. <strong>Consulte siempre con un profesional legal</strong> para casos específicos.
            </AlertDescription>
          </Alert>

          <Tabs defaultValue="commercial" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-4">
              <TabsTrigger value="commercial" className="text-xs gap-1">
                <FileText className="h-3 w-3" />
                Comerciales
              </TabsTrigger>
              <TabsTrigger value="powers" className="text-xs gap-1">
                <Briefcase className="h-3 w-3" />
                Poderes
              </TabsTrigger>
              <TabsTrigger value="assignments" className="text-xs gap-1">
                <Scale className="h-3 w-3" />
                Cesiones
              </TabsTrigger>
              <TabsTrigger value="contracts" className="text-xs gap-1">
                <Building2 className="h-3 w-3" />
                Contratos
              </TabsTrigger>
            </TabsList>

            {/* DOCUMENTOS COMERCIALES */}
            <TabsContent value="commercial">
              <table className="w-full border rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="px-3 py-2 text-left text-sm font-medium">Documento</th>
                    <th className="px-3 py-2 text-center text-sm font-medium">Nivel 1</th>
                    <th className="px-3 py-2 text-center text-sm font-medium">Nivel 2</th>
                    <th className="px-3 py-2 text-left text-sm font-medium">Notas</th>
                  </tr>
                </thead>
                <tbody>
                  {commercialDocs.map((row, i) => (
                    <Row key={i} {...row} />
                  ))}
                </tbody>
              </table>
            </TabsContent>

            {/* PODERES */}
            <TabsContent value="powers">
              <table className="w-full border rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="px-3 py-2 text-left text-sm font-medium">Oficina</th>
                    <th className="px-3 py-2 text-center text-sm font-medium">Nivel 1</th>
                    <th className="px-3 py-2 text-center text-sm font-medium">Nivel 2</th>
                    <th className="px-3 py-2 text-left text-sm font-medium">Notas</th>
                  </tr>
                </thead>
                <tbody>
                  {powerDocs.map((row, i) => (
                    <Row key={i} {...row} />
                  ))}
                </tbody>
              </table>
            </TabsContent>

            {/* CESIONES */}
            <TabsContent value="assignments">
              <table className="w-full border rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="px-3 py-2 text-left text-sm font-medium">Tipo</th>
                    <th className="px-3 py-2 text-center text-sm font-medium">Nivel 1</th>
                    <th className="px-3 py-2 text-center text-sm font-medium">Nivel 2</th>
                    <th className="px-3 py-2 text-left text-sm font-medium">Recomendación</th>
                  </tr>
                </thead>
                <tbody>
                  {assignmentDocs.map((row, i) => (
                    <Row key={i} {...row} />
                  ))}
                </tbody>
              </table>
            </TabsContent>

            {/* CONTRATOS */}
            <TabsContent value="contracts">
              <table className="w-full border rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="px-3 py-2 text-left text-sm font-medium">Tipo</th>
                    <th className="px-3 py-2 text-center text-sm font-medium">Nivel 1</th>
                    <th className="px-3 py-2 text-center text-sm font-medium">Nivel 2</th>
                    <th className="px-3 py-2 text-left text-sm font-medium">Notas</th>
                  </tr>
                </thead>
                <tbody>
                  {contractDocs.map((row, i) => (
                    <Row key={i} {...row} />
                  ))}
                </tbody>
              </table>
            </TabsContent>
          </Tabs>

          {/* Leyenda */}
          <div className="flex items-center gap-6 mt-6 p-3 bg-muted/30 rounded-lg text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span>Válido</span>
            </div>
            <div className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-amber-500" />
              <span>Parcial/Riesgo</span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <span>No válido</span>
            </div>
          </div>

          {/* Notas adicionales */}
          <div className="mt-4 p-4 border rounded-lg space-y-2 text-xs text-muted-foreground">
            <p><strong>Nivel 1 (Estándar):</strong> Firma Electrónica Avanzada (AES) con email + OTP. Incluida en suscripción.</p>
            <p><strong>Nivel 2 (Cualificada):</strong> Firma Electrónica Cualificada (QES) con verificación de identidad. Premium.</p>
            <p className="pt-2 border-t">
              <strong>QES:</strong> Equivalente legal a firma manuscrita en UE (Reglamento eIDAS). 
              Requiere certificado cualificado emitido por prestador de servicios de confianza.
            </p>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
