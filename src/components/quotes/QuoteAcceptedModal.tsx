// =====================================================
// Quote Accepted Modal - Post-acceptance flow
// =====================================================

import { useState } from 'react';
import { CheckCircle2, FileText, FolderPlus, ArrowRight } from 'lucide-react';
import { useQuoteToMatter, QuoteItemWithMatterInfo } from '@/hooks/useQuoteToMatter';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { QuoteToMatterForm } from './QuoteToMatterForm';
import { QuoteToMatterSummary } from './QuoteToMatterSummary';
import { Matter } from '@/types/matters';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quoteId: string;
  quoteNumber: string;
  invoiceNumber?: string;
}

type Step = 'selection' | 'form' | 'summary';

export function QuoteAcceptedModal({
  open,
  onOpenChange,
  quoteId,
  quoteNumber,
  invoiceNumber,
}: Props) {
  const { quoteItems, pendingMatterItems, isLoading } = useQuoteToMatter(quoteId);
  const [step, setStep] = useState<Step>('selection');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [createdMatters, setCreatedMatters] = useState<Matter[]>([]);

  const itemsWithMatter = pendingMatterItems;
  const hasItemsToCreate = itemsWithMatter.length > 0;

  const handleItemToggle = (itemId: string) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleStartCreation = () => {
    if (selectedItems.length > 0) {
      setCurrentItemIndex(0);
      setStep('form');
    }
  };

  const handleMatterCreated = (matter: Matter) => {
    setCreatedMatters(prev => [...prev, matter]);
    
    if (currentItemIndex < selectedItems.length - 1) {
      setCurrentItemIndex(prev => prev + 1);
    } else {
      setStep('summary');
    }
  };

  const handleSkipItem = () => {
    // Remove from selected items
    setSelectedItems(prev => prev.filter((_, i) => i !== currentItemIndex));
    
    if (currentItemIndex >= selectedItems.length - 1) {
      if (createdMatters.length > 0) {
        setStep('summary');
      } else {
        onOpenChange(false);
      }
    }
  };

  const handleClose = () => {
    setStep('selection');
    setSelectedItems([]);
    setCurrentItemIndex(0);
    setCreatedMatters([]);
    onOpenChange(false);
  };

  const currentItem = selectedItems[currentItemIndex]
    ? itemsWithMatter.find(i => i.id === selectedItems[currentItemIndex])
    : null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {step === 'selection' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                Presupuesto Aceptado
              </DialogTitle>
              <DialogDescription>
                El presupuesto ha sido aceptado correctamente.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Success info */}
              <div className="space-y-2 p-4 bg-primary/10 rounded-lg">
                <div className="flex items-center gap-2 text-primary">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="font-medium">Presupuesto {quoteNumber} aceptado</span>
                </div>
                {invoiceNumber && (
                  <div className="flex items-center gap-2 text-primary">
                    <FileText className="h-4 w-4" />
                    <span className="font-medium">Factura {invoiceNumber} generada</span>
                  </div>
                )}
              </div>

              {/* Matter creation section */}
              {hasItemsToCreate ? (
                <div className="space-y-4">
                  <div className="border-t pt-4">
                    <h4 className="font-medium flex items-center gap-2 mb-2">
                      <FolderPlus className="h-4 w-4" />
                      Crear Expedientes
                    </h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Este presupuesto incluye servicios que pueden generar expedientes.
                      ¿Deseas crearlos ahora?
                    </p>
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {itemsWithMatter.map(item => (
                      <div
                        key={item.id}
                        className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <Checkbox
                          id={item.id}
                          checked={selectedItems.includes(item.id)}
                          onCheckedChange={() => handleItemToggle(item.id)}
                        />
                        <div className="flex-1 min-w-0">
                          <label
                            htmlFor={item.id}
                            className="font-medium cursor-pointer block truncate"
                          >
                            {item.description}
                          </label>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {item.matter_type === 'trademark' ? 'Marca' :
                               item.matter_type === 'patent' ? 'Patente' :
                               item.matter_type === 'design' ? 'Diseño' :
                               item.matter_type || 'PI'}
                            </Badge>
                            {item.matter_jurisdiction && (
                              <Badge variant="secondary" className="text-xs">
                                {item.matter_jurisdiction}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    {quoteItems.filter(i => !i.generates_matter).length > 0 && (
                      <div className="p-3 border rounded-lg bg-muted/30 opacity-60">
                        <p className="text-sm text-muted-foreground">
                          {quoteItems.filter(i => !i.generates_matter).length} servicio(s) 
                          no requieren expediente (vigilancia, informes, etc.)
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <p>Este presupuesto no incluye servicios que generen expedientes.</p>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                {hasItemsToCreate ? 'Crear más tarde' : 'Cerrar'}
              </Button>
              {hasItemsToCreate && (
                <Button
                  onClick={handleStartCreation}
                  disabled={selectedItems.length === 0}
                >
                  Crear expedientes ({selectedItems.length})
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </DialogFooter>
          </>
        )}

        {step === 'form' && currentItem && (
          <QuoteToMatterForm
            quoteId={quoteId}
            quoteNumber={quoteNumber}
            invoiceNumber={invoiceNumber}
            item={currentItem}
            currentIndex={currentItemIndex}
            totalItems={selectedItems.length}
            onMatterCreated={handleMatterCreated}
            onSkip={handleSkipItem}
            onBack={() => setStep('selection')}
          />
        )}

        {step === 'summary' && (
          <QuoteToMatterSummary
            quoteNumber={quoteNumber}
            invoiceNumber={invoiceNumber}
            createdMatters={createdMatters}
            onClose={handleClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
