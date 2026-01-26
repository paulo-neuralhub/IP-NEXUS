// =============================================
// SendInvoiceDialog - Modal para enviar facturas
// Opciones: email, SII, TicketBAI, VERI*FACTU
// =============================================

import { useState } from 'react';
import { Mail, Send, FileText, CheckCircle, Loader2 } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { useFiscalSettings } from '@/hooks/finance/useFiscalSettings';
import { useSendInvoice } from '@/hooks/use-finance';
import { useSubmitSII, useSubmitTicketBAI, useSubmitVeriFactu } from '@/hooks/finance/useRegulatorySubmissions';
import type { Invoice } from '@/types/finance';
import { toast } from 'sonner';

interface SendInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: Invoice;
  onSuccess?: () => void;
}

export function SendInvoiceDialog({ 
  open, 
  onOpenChange, 
  invoice,
  onSuccess 
}: SendInvoiceDialogProps) {
  const fiscalSettingsQuery = useFiscalSettings();
  const fiscalSettings = fiscalSettingsQuery.data;
  const sendInvoice = useSendInvoice();
  const submitSII = useSubmitSII();
  const submitTicketBAI = useSubmitTicketBAI();
  const submitVerifactu = useSubmitVeriFactu();
  
  const [isSending, setIsSending] = useState(false);
  const [emailTo, setEmailTo] = useState(invoice.sent_to_email || '');
  const [subject, setSubject] = useState(`Factura ${invoice.invoice_number}`);
  const [message, setMessage] = useState(`Adjunto encontrará la factura ${invoice.invoice_number} correspondiente a nuestros servicios.\n\nQuedamos a su disposición para cualquier consulta.`);
  
  const [sendEmail, setSendEmail] = useState(true);
  const [attachPDF, setAttachPDF] = useState(true);
  const [attachXML, setAttachXML] = useState(false);
  const [submitToSII, setSubmitToSII] = useState(fiscalSettings?.sii_enabled ?? false);
  const [submitToTBAI, setSubmitToTBAI] = useState(fiscalSettings?.tbai_enabled ?? false);
  const [submitToVerifactu, setSubmitToVerifactu] = useState(fiscalSettings?.verifactu_enabled ?? false);

  const handleSend = async () => {
    if (sendEmail && !emailTo) {
      toast.error('Introduce un email válido');
      return;
    }

    setIsSending(true);
    let errors: string[] = [];

    try {
      // 1. Enviar por email
      if (sendEmail) {
        await sendInvoice.mutateAsync(invoice.id);
      }

      // 2. Enviar a SII
      if (submitToSII && fiscalSettings?.sii_enabled) {
        try {
          await submitSII.mutateAsync({ invoiceId: invoice.id, testMode: fiscalSettings.sii_test_mode });
        } catch (e) {
          errors.push('SII');
        }
      }

      // 3. Enviar a TicketBAI
      if (submitToTBAI && fiscalSettings?.tbai_enabled) {
        try {
          await submitTicketBAI.mutateAsync({ invoiceId: invoice.id });
        } catch (e) {
          errors.push('TicketBAI');
        }
      }

      // 4. Enviar a VERI*FACTU
      if (submitToVerifactu && fiscalSettings?.verifactu_enabled) {
        try {
          await submitVerifactu.mutateAsync({ invoiceId: invoice.id });
        } catch (e) {
          errors.push('VERI*FACTU');
        }
      }

      if (errors.length > 0) {
        toast.warning(`Factura enviada con errores en: ${errors.join(', ')}`);
      } else {
        toast.success('Factura enviada correctamente');
      }
      
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Send error:', error);
      toast.error('Error al enviar la factura');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Enviar factura {invoice.invoice_number}
          </DialogTitle>
          <DialogDescription>
            Configura las opciones de envío para esta factura.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Email Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="sendEmail" 
                checked={sendEmail} 
                onCheckedChange={(checked) => setSendEmail(!!checked)}
              />
              <Label htmlFor="sendEmail" className="flex items-center gap-2 font-medium">
                <Mail className="h-4 w-4" />
                Enviar por email al cliente
              </Label>
            </div>
            
            {sendEmail && (
              <div className="pl-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="emailTo">Email del destinatario</Label>
                  <Input
                    id="emailTo"
                    type="email"
                    placeholder="cliente@ejemplo.com"
                    value={emailTo}
                    onChange={(e) => setEmailTo(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="subject">Asunto</Label>
                  <Input
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="message">Mensaje</Label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                  />
                </div>
                
                <div className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="attachPDF" 
                      checked={attachPDF} 
                      onCheckedChange={(checked) => setAttachPDF(!!checked)}
                    />
                    <Label htmlFor="attachPDF" className="text-sm">Adjuntar PDF</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="attachXML" 
                      checked={attachXML} 
                      onCheckedChange={(checked) => setAttachXML(!!checked)}
                    />
                    <Label htmlFor="attachXML" className="text-sm">Adjuntar XML Facturae</Label>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Regulatory Submissions */}
          {(fiscalSettings?.sii_enabled || fiscalSettings?.tbai_enabled || fiscalSettings?.verifactu_enabled) && (
            <>
              <Separator />
              
              <div className="space-y-4">
                <Label className="text-sm font-medium text-muted-foreground">
                  Comunicaciones obligatorias
                </Label>
                
                {fiscalSettings?.sii_enabled && (
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="submitSII" 
                      checked={submitToSII} 
                      onCheckedChange={(checked) => setSubmitToSII(!!checked)}
                    />
                    <Label htmlFor="submitSII" className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-500" />
                      Enviar a SII (AEAT)
                      {fiscalSettings.sii_test_mode && (
                        <span className="text-xs text-orange-500">(modo pruebas)</span>
                      )}
                    </Label>
                  </div>
                )}
                
                {fiscalSettings?.tbai_enabled && (
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="submitTBAI" 
                      checked={submitToTBAI} 
                      onCheckedChange={(checked) => setSubmitToTBAI(!!checked)}
                    />
                    <Label htmlFor="submitTBAI" className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-green-500" />
                      Enviar a TicketBAI ({fiscalSettings.tbai_territory})
                    </Label>
                  </div>
                )}
                
                {fiscalSettings?.verifactu_enabled && (
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="submitVerifactu" 
                      checked={submitToVerifactu} 
                      onCheckedChange={(checked) => setSubmitToVerifactu(!!checked)}
                    />
                    <Label htmlFor="submitVerifactu" className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-purple-500" />
                      Enviar a VERI*FACTU
                    </Label>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSending}>
            Cancelar
          </Button>
          <Button onClick={handleSend} disabled={isSending}>
            {isSending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Enviar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
