// ============================================================
// src/components/features/documents/CreateClientFromDocument.tsx
// Crear cliente a partir de un documento escaneado
// ============================================================

import React, { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/hooks/useOrganization';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, Sparkles, Building2, Loader2, FileText, Check } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ExtractedClientData {
  name: string | null;
  tax_id: string | null;
  address: string | null;
  email: string | null;
  phone: string | null;
  contact_person: string | null;
}

interface Props {
  onClientCreated?: (clientId: string) => void;
}

export function CreateClientFromDocument({ onClientCreated }: Props) {
  const { organizationId } = useOrganization();
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedClientData | null>(null);
  const [editedData, setEditedData] = useState<ExtractedClientData | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState('');

  const processDocument = async (file: File) => {
    setIsProcessing(true);
    setUploadedFileName(file.name);
    
    try {
      // 1. Subir archivo temporalmente
      const fileName = `temp/${organizationId}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('client-documents')
        .upload(fileName, file);
      
      if (uploadError) throw uploadError;

      // 2. Llamar a Edge Function para extraer datos
      const { data, error } = await supabase.functions.invoke('extract-document-data', {
        body: {
          storage_path: fileName,
          organization_id: organizationId,
          document_source: 'client_documents',
          file_name: file.name
        }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      // 3. Usar datos de cliente extraídos
      if (data.client_data && Object.values(data.client_data).some(v => v)) {
        setExtractedData(data.client_data);
        setEditedData(data.client_data);
        toast.success('Datos extraídos del documento');
      } else {
        // Si no hay datos de cliente, intentar usar entidades
        const entities = data.extracted_entities || {};
        const clientData: ExtractedClientData = {
          name: entities.company_names?.[0] || entities.person_names?.[0] || null,
          tax_id: entities.vat_numbers?.[0] || null,
          email: entities.emails?.[0] || null,
          phone: entities.phones?.[0] || null,
          address: entities.addresses?.[0] || null,
          contact_person: entities.person_names?.[0] || null
        };
        
        if (Object.values(clientData).some(v => v)) {
          setExtractedData(clientData);
          setEditedData(clientData);
          toast.success('Datos extraídos del documento');
        } else {
          toast.info('No se detectaron datos de cliente. Introduce los datos manualmente.');
          setExtractedData({ name: null, tax_id: null, address: null, email: null, phone: null, contact_person: null });
          setEditedData({ name: null, tax_id: null, address: null, email: null, phone: null, contact_person: null });
        }
      }

    } catch (error: any) {
      console.error('Error processing document:', error);
      toast.error('Error procesando documento: ' + error.message);
      // Permitir entrada manual
      setExtractedData({ name: null, tax_id: null, address: null, email: null, phone: null, contact_person: null });
      setEditedData({ name: null, tax_id: null, address: null, email: null, phone: null, contact_person: null });
    } finally {
      setIsProcessing(false);
    }
  };

  const createClient = useMutation({
    mutationFn: async () => {
      if (!editedData?.name) throw new Error('El nombre es obligatorio');
      
      const { data, error } = await supabase
        .from('contacts')
        .insert({
          organization_id: organizationId,
          name: editedData.name,
          company_name: editedData.name,
          vat_number: editedData.tax_id,
          address: editedData.address ? { street: editedData.address } : null,
          email: editedData.email,
          phone: editedData.phone,
          type: 'company',
          is_client: true
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Cliente "${data.name}" creado`);
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      handleClose();
      onClientCreated?.(data.id);
    },
    onError: (error: any) => {
      toast.error('Error: ' + error.message);
    },
  });

  const handleClose = () => {
    setIsOpen(false);
    setExtractedData(null);
    setEditedData(null);
    setUploadedFileName('');
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processDocument(file);
    }
  };

  return (
    <>
      <Button variant="outline" onClick={() => setIsOpen(true)}>
        <Sparkles className="h-4 w-4 mr-2 text-amber-500" />
        Crear desde Documento
      </Button>

      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Crear Cliente desde Documento
            </DialogTitle>
          </DialogHeader>

          {!extractedData ? (
            <div className="py-6">
              <div
                onClick={() => !isProcessing && inputRef.current?.click()}
                className={cn(
                  'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all',
                  isProcessing 
                    ? 'border-amber-300 bg-amber-50 dark:bg-amber-950/20' 
                    : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                )}
              >
                {isProcessing ? (
                  <div className="space-y-3">
                    <Loader2 className="h-10 w-10 mx-auto text-amber-500 animate-spin" />
                    <p className="font-medium">Analizando documento con IA...</p>
                    <p className="text-sm text-muted-foreground">{uploadedFileName}</p>
                  </div>
                ) : (
                  <>
                    <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                    <p className="font-medium">Sube un documento con datos del cliente</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Pedido, tarjeta de visita, email, solicitud...
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      PDF, imagen, documento escaneado
                    </p>
                  </>
                )}
              </div>
              <input
                ref={inputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp,.tiff,.bmp"
                onChange={handleFileChange}
                className="hidden"
                disabled={isProcessing}
              />
            </div>
          ) : (
            <div className="space-y-4 py-2">
              <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
                <CardContent className="py-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  <span className="text-sm">Datos extraídos automáticamente - revisa y edita si es necesario</span>
                </CardContent>
              </Card>

              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>Nombre de la empresa *</Label>
                  <div className="relative">
                    <Input
                      value={editedData?.name || ''}
                      onChange={(e) => setEditedData({ ...editedData!, name: e.target.value })}
                      placeholder="Nombre del cliente"
                    />
                    {extractedData?.name && extractedData.name === editedData?.name && (
                      <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>NIF/CIF</Label>
                  <Input
                    value={editedData?.tax_id || ''}
                    onChange={(e) => setEditedData({ ...editedData!, tax_id: e.target.value })}
                    placeholder="B12345678"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Dirección</Label>
                  <Input
                    value={editedData?.address || ''}
                    onChange={(e) => setEditedData({ ...editedData!, address: e.target.value })}
                    placeholder="Dirección completa"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={editedData?.email || ''}
                      onChange={(e) => setEditedData({ ...editedData!, email: e.target.value })}
                      placeholder="email@empresa.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Teléfono</Label>
                    <Input
                      value={editedData?.phone || ''}
                      onChange={(e) => setEditedData({ ...editedData!, phone: e.target.value })}
                      placeholder="+34 600 000 000"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Persona de contacto</Label>
                  <Input
                    value={editedData?.contact_person || ''}
                    onChange={(e) => setEditedData({ ...editedData!, contact_person: e.target.value })}
                    placeholder="Nombre del contacto"
                  />
                </div>
              </div>
            </div>
          )}

          {extractedData && (
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setExtractedData(null);
                setEditedData(null);
                if (inputRef.current) inputRef.current.value = '';
              }}>
                Subir otro documento
              </Button>
              <Button 
                onClick={() => createClient.mutate()}
                disabled={createClient.isPending || !editedData?.name}
              >
                {createClient.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creando...
                  </>
                ) : (
                  <>
                    <Building2 className="h-4 w-4 mr-2" />
                    Crear Cliente
                  </>
                )}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
