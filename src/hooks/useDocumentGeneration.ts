// src/hooks/useDocumentGeneration.ts
// Hook for generating professional PDFs from documents

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type DocumentType = 'invoice' | 'quote' | 'certificate' | 'letter';

interface PdfResult {
  pdfUrl: string;
  pdfBase64: string;
}

interface GenerateOptions {
  format?: 'A4' | 'Letter';
  language?: 'es' | 'en';
}

export function useDocumentGeneration() {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate PDF for any document type
  const generatePdf = useCallback(async (
    documentType: DocumentType,
    documentId: string,
    templateId?: string,
    options?: GenerateOptions
  ): Promise<PdfResult | null> => {
    setIsGenerating(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('generate-document-pdf', {
        body: {
          documentType,
          documentId,
          templateId,
          options,
        },
      });

      if (fnError) throw fnError;
      
      if (!data.pdfUrl && !data.pdfBase64) {
        throw new Error('No PDF generated');
      }

      toast({
        title: 'PDF generado',
        description: 'El documento se ha generado correctamente.',
      });

      return data as PdfResult;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al generar PDF';
      setError(message);
      toast({
        title: 'Error al generar PDF',
        description: message,
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [toast]);

  // Convenience methods for each document type
  const generateInvoicePdf = useCallback(
    (invoiceId: string, templateId?: string, options?: GenerateOptions) =>
      generatePdf('invoice', invoiceId, templateId, options),
    [generatePdf]
  );

  const generateQuotePdf = useCallback(
    (quoteId: string, templateId?: string, options?: GenerateOptions) =>
      generatePdf('quote', quoteId, templateId, options),
    [generatePdf]
  );

  const generateCertificatePdf = useCallback(
    (matterId: string, templateId?: string, options?: GenerateOptions) =>
      generatePdf('certificate', matterId, templateId, options),
    [generatePdf]
  );

  const generateLetterPdf = useCallback(
    (matterId: string, templateId?: string, options?: GenerateOptions) =>
      generatePdf('letter', matterId, templateId, options),
    [generatePdf]
  );

  // Download the generated PDF
  const downloadPdf = useCallback(async (
    documentType: DocumentType,
    documentId: string,
    fileName?: string,
    templateId?: string,
    options?: GenerateOptions
  ): Promise<boolean> => {
    const result = await generatePdf(documentType, documentId, templateId, options);
    
    if (!result) return false;

    try {
      // Prefer URL download if available
      if (result.pdfUrl) {
        const link = document.createElement('a');
        link.href = result.pdfUrl;
        link.download = fileName || `${documentType}_${documentId}.pdf`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return true;
      }

      // Fallback to base64
      if (result.pdfBase64) {
        const link = document.createElement('a');
        link.href = result.pdfBase64;
        link.download = fileName || `${documentType}_${documentId}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return true;
      }

      return false;
    } catch (err) {
      console.error('Download error:', err);
      toast({
        title: 'Error al descargar',
        description: 'No se pudo descargar el PDF.',
        variant: 'destructive',
      });
      return false;
    }
  }, [generatePdf, toast]);

  // Open PDF in new tab for preview
  const previewPdf = useCallback(async (
    documentType: DocumentType,
    documentId: string,
    templateId?: string,
    options?: GenerateOptions
  ): Promise<boolean> => {
    const result = await generatePdf(documentType, documentId, templateId, options);
    
    if (!result) return false;

    try {
      if (result.pdfUrl) {
        window.open(result.pdfUrl, '_blank');
        return true;
      }

      if (result.pdfBase64) {
        // Create blob URL from base64
        const base64Data = result.pdfBase64.split(',')[1];
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, '_blank');
        return true;
      }

      return false;
    } catch (err) {
      console.error('Preview error:', err);
      toast({
        title: 'Error al previsualizar',
        description: 'No se pudo abrir el PDF.',
        variant: 'destructive',
      });
      return false;
    }
  }, [generatePdf, toast]);

  // Get PDF as blob for embedding
  const getPdfBlob = useCallback(async (
    documentType: DocumentType,
    documentId: string,
    templateId?: string,
    options?: GenerateOptions
  ): Promise<Blob | null> => {
    const result = await generatePdf(documentType, documentId, templateId, options);
    
    if (!result?.pdfBase64) return null;

    try {
      const base64Data = result.pdfBase64.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      return new Blob([byteArray], { type: 'application/pdf' });
    } catch (err) {
      console.error('Blob conversion error:', err);
      return null;
    }
  }, [generatePdf]);

  return {
    // State
    isGenerating,
    error,
    
    // Generic method
    generatePdf,
    
    // Type-specific methods
    generateInvoicePdf,
    generateQuotePdf,
    generateCertificatePdf,
    generateLetterPdf,
    
    // Utility methods
    downloadPdf,
    previewPdf,
    getPdfBlob,
  };
}
