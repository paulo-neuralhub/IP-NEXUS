// =====================================================
// Quote to Matter Summary - Post-creation summary
// =====================================================

import { CheckCircle2, ExternalLink, FileText, FolderOpen, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Matter } from '@/types/matters';
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Props {
  quoteNumber: string;
  invoiceNumber?: string;
  createdMatters: Matter[];
  onClose: () => void;
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500',
  filed: 'bg-blue-500',
  granted: 'bg-green-500',
  active: 'bg-green-500',
};

const TYPE_LABELS: Record<string, string> = {
  trademark: 'Marca',
  patent: 'Patente',
  design: 'Diseño',
  copyright: 'Derechos de autor',
  domain: 'Dominio',
  other: 'Otro',
};

export function QuoteToMatterSummary({
  quoteNumber,
  invoiceNumber,
  createdMatters,
  onClose,
}: Props) {
  const navigate = useNavigate();

  const handleOpenMatter = (matterId: string) => {
    navigate(`/app/docket/${matterId}`);
    onClose();
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-500" />
          Expedientes Creados
        </DialogTitle>
        <DialogDescription>
          Se han creado {createdMatters.length} expediente(s) correctamente
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-4">
        {/* Created matters list */}
        <div className="space-y-2">
          {createdMatters.map(matter => (
            <div
              key={matter.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${STATUS_COLORS[matter.status] || 'bg-gray-500'}`} />
                <div>
                  <p className="font-medium">{matter.reference}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{matter.mark_name || matter.title}</span>
                    <span>│</span>
                    <Badge variant="outline" className="text-xs">
                      {TYPE_LABELS[matter.type] || matter.type}
                    </Badge>
                    {matter.jurisdiction_code && (
                      <Badge variant="secondary" className="text-xs">
                        {matter.jurisdiction_code}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleOpenMatter(matter.id)}
              >
                Abrir
                <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
            </div>
          ))}
        </div>

        {/* Linked documents */}
        <div className="p-4 bg-muted/30 rounded-lg space-y-2">
          <p className="text-sm font-medium">Vinculados a:</p>
          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              <span>Presupuesto {quoteNumber}</span>
            </div>
            {invoiceNumber && (
              <div className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                <span>Factura {invoiceNumber}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogFooter>
    </>
  );
}
