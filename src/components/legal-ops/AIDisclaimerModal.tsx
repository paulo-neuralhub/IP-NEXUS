import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ExternalLink } from 'lucide-react';
import { useLegalDocumentContent } from '@/hooks/legal/useLegalDocumentContent';
import { FullLegalTextModal } from './FullLegalTextModal';
import ReactMarkdown from 'react-markdown';

type SignatureType = 'checkbox' | 'typed_name';

interface Props {
  onAccept: () => void;
  onDecline: () => void;
}

async function sha256Hex(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function AIDisclaimerModal({ onAccept, onDecline }: Props) {
  const [isOpen, setIsOpen] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [signatureType] = useState<SignatureType>('checkbox');
  const [checked, setChecked] = useState(false);
  const [typedName, setTypedName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showFullText, setShowFullText] = useState(false);

  const { data: legalDoc, isLoading: loadingDoc } = useLegalDocumentContent('ai_disclaimer');

  // Fallback content if DB fetch fails
  const fallbackContent = {
    title: 'Aviso Legal - Asistente IA',
    short_summary: '**Puntos clave:**\n• La IA es una herramienta de asistencia, no sustituye al asesoramiento profesional\n• Los resultados deben verificarse siempre con fuentes oficiales\n• No se garantiza exactitud al 100%\n• El usuario es responsable de las decisiones finales',
    checkbox_text: 'He leído y acepto el Aviso Legal del Asistente con IA. Entiendo que no presta asesoramiento profesional y que debo verificar los resultados con fuentes oficiales antes de actuar.',
    full_content: '# Aviso Legal\n\nTexto completo del aviso legal...',
    link_text: 'Leer condiciones completas',
  };

  const content = legalDoc || fallbackContent;
  const canAccept = checked && (signatureType !== 'typed_name' || typedName.trim().length >= 2);

  const handleAccept = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const contentHash = await sha256Hex(content.full_content);

      const signatureData =
        signatureType === 'typed_name'
          ? { typed_name: typedName.trim() }
          : null;

      const acceptanceMethod = signatureType === 'typed_name' ? 'typed_name' : 'checkbox';

      const { error: fnError } = await supabase.functions.invoke('legal-accept', {
        body: {
          documentCode: 'ai_disclaimer',
          featureType: 'ai',
          contentHash,
          acceptanceMethod,
          signatureData,
        },
      });

      if (fnError) throw fnError;
      setIsOpen(false);
      onAccept();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'No se pudo registrar la aceptación');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    onDecline();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="max-w-xl" onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>{content.title}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Short Summary */}
            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown>{content.short_summary}</ReactMarkdown>
              </div>
            </div>

            {/* Checkbox with acceptance text */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="ai-disclaimer-accept"
                  checked={checked}
                  onCheckedChange={(v) => setChecked(Boolean(v))}
                  className="mt-1"
                />
                <div className="space-y-1">
                  <Label htmlFor="ai-disclaimer-accept" className="text-sm leading-relaxed cursor-pointer">
                    {content.checkbox_text}
                  </Label>
                  <button
                    type="button"
                    onClick={() => setShowFullText(true)}
                    className="flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" />
                    {content.link_text}
                  </button>
                </div>
              </div>

              {signatureType === 'typed_name' && (
                <div className="space-y-2 pl-7">
                  <Label htmlFor="ai-disclaimer-typed-name">Nombre y apellidos</Label>
                  <Input
                    id="ai-disclaimer-typed-name"
                    value={typedName}
                    onChange={(e) => setTypedName(e.target.value)}
                    placeholder="Escribe tu nombre"
                    disabled={!checked}
                  />
                </div>
              )}

              {error && <p className="text-sm text-destructive">{error}</p>}
              {loadingDoc && (
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Cargando…
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleClose} disabled={submitting}>
              Cancelar
            </Button>
            <Button onClick={handleAccept} disabled={!canAccept || submitting || loadingDoc}>
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Aceptar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Full Legal Text Modal */}
      <FullLegalTextModal
        open={showFullText}
        onClose={() => setShowFullText(false)}
        title={content.title}
        content={content.full_content}
      />
    </>
  );
}
