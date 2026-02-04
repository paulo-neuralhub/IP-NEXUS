/**
 * FilingDetailModal - Modal para ver detalle de presentación
 */

import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ExternalLink, Calendar, FileText, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

interface Filing {
  id: string;
  matter_id: string;
  jurisdiction_code: string;
  office_id?: string;
  application_number?: string;
  registration_number?: string;
  filing_date?: string;
  registration_date?: string;
  expiry_date?: string;
  publication_date?: string;
  status: string;
  notes?: string;
}

interface FilingDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filing: Filing;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  filed: { label: 'Presentada', color: 'bg-blue-100 text-blue-700' },
  pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-700' },
  examining: { label: 'En examen', color: 'bg-orange-100 text-orange-700' },
  published: { label: 'Publicada', color: 'bg-purple-100 text-purple-700' },
  granted: { label: 'Concedida', color: 'bg-green-100 text-green-700' },
  registered: { label: 'Registrada', color: 'bg-green-100 text-green-700' },
  rejected: { label: 'Denegada', color: 'bg-red-100 text-red-700' },
  withdrawn: { label: 'Retirada', color: 'bg-gray-100 text-gray-700' },
  expired: { label: 'Expirada', color: 'bg-gray-100 text-gray-700' },
};

const JURISDICTION_LINKS: Record<string, string> = {
  ES: 'https://consultas2.oepm.es/localexmarcas/vistaxml.html?aplicacion=0&expediente=',
  EU: 'https://euipo.europa.eu/eSearch/#details/trademarks/',
  EP: 'https://register.epo.org/application?number=',
  WO: 'https://patentscope.wipo.int/search/en/detail.jsf?docId=',
  US: 'https://tsdr.uspto.gov/#caseNumber=',
};

export function FilingDetailModal({ open, onOpenChange, filing }: FilingDetailModalProps) {
  const status = STATUS_CONFIG[filing.status] || { label: filing.status, color: 'bg-gray-100 text-gray-700' };
  
  const getExternalLink = () => {
    const base = JURISDICTION_LINKS[filing.jurisdiction_code];
    if (!base) return null;
    const number = filing.application_number || filing.registration_number;
    if (!number) return null;
    return base + number.replace(/[^a-zA-Z0-9]/g, '');
  };

  const externalLink = getExternalLink();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-3">
              <Badge variant="outline" className="text-lg px-3 py-1">
                {filing.jurisdiction_code}
              </Badge>
              Detalle de Presentación
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Estado:</span>
            <Badge className={status.color}>{status.label}</Badge>
          </div>

          <Separator />

          {/* Numbers */}
          <div className="grid grid-cols-2 gap-4">
            {filing.application_number && (
              <div>
                <span className="text-sm text-muted-foreground block">Nº Solicitud</span>
                <p className="font-medium">{filing.application_number}</p>
              </div>
            )}
            {filing.registration_number && (
              <div>
                <span className="text-sm text-muted-foreground block">Nº Registro</span>
                <p className="font-medium">{filing.registration_number}</p>
              </div>
            )}
          </div>

          <Separator />

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            {filing.filing_date && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <span className="text-sm text-muted-foreground block">Fecha presentación</span>
                  <p className="font-medium">{format(new Date(filing.filing_date), 'dd/MM/yyyy')}</p>
                </div>
              </div>
            )}
            {filing.registration_date && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <span className="text-sm text-muted-foreground block">Fecha registro</span>
                  <p className="font-medium">{format(new Date(filing.registration_date), 'dd/MM/yyyy')}</p>
                </div>
              </div>
            )}
            {filing.publication_date && (
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <div>
                  <span className="text-sm text-muted-foreground block">Fecha publicación</span>
                  <p className="font-medium">{format(new Date(filing.publication_date), 'dd/MM/yyyy')}</p>
                </div>
              </div>
            )}
            {filing.expiry_date && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <span className="text-sm text-muted-foreground block">Vencimiento</span>
                  <p className="font-medium">{format(new Date(filing.expiry_date), 'dd/MM/yyyy')}</p>
                </div>
              </div>
            )}
          </div>

          {filing.notes && (
            <>
              <Separator />
              <div>
                <span className="text-sm text-muted-foreground block mb-1">Notas</span>
                <p className="text-sm">{filing.notes}</p>
              </div>
            </>
          )}

          {externalLink && (
            <>
              <Separator />
              <Button asChild variant="outline" className="w-full">
                <a href={externalLink} target="_blank" rel="noopener noreferrer">
                  <Building2 className="h-4 w-4 mr-2" />
                  Ver en registro oficial
                  <ExternalLink className="h-4 w-4 ml-2" />
                </a>
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
