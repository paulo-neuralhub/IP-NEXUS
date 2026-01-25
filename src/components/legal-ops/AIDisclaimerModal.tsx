import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';

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
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [signatureType, setSignatureType] = useState<SignatureType>('checkbox');
  const [checked, setChecked] = useState(false);
  const [typedName, setTypedName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const content = useMemo(
    () =>
      [
        '# Aviso Legal - Funcionalidades de IA',
        '',
        '- IA como herramienta de asistencia, no reemplazo profesional',
        '- Verificar siempre información con fuentes oficiales',
        '- No garantía de exactitud al 100%',
        '- Datos procesados según política de privacidad',
        '- Usuario responsable de decisiones finales',
      ].join('\n'),
    []
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: fnError } = await supabase.functions.invoke('check-legal-acceptance', {
          body: { documentCode: 'ai_disclaimer', featureType: 'ai' },
        });

        if (fnError) throw fnError;

        const st = (data?.document?.signature_type as SignatureType | null) ?? 'checkbox';
        if (!cancelled) setSignatureType(st);
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Error al cargar el aviso legal');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const canAccept = checked && (signatureType !== 'typed_name' || typedName.trim().length >= 2);

  const handleAccept = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const contentHash = await sha256Hex(content);

      const signatureData =
        signatureType === 'typed_name'
          ? {
              typed_name: typedName.trim(),
            }
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
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-2xl" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Aviso Legal - Funcionalidades de IA</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <ScrollArea className="h-[360px] rounded-lg border bg-card p-4">
            <div className="space-y-3 text-sm text-foreground">
              <p className="font-medium">Puntos clave:</p>
              <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                <li>IA como herramienta de asistencia, no reemplazo profesional</li>
                <li>Verificar siempre información con fuentes oficiales</li>
                <li>No garantía de exactitud al 100%</li>
                <li>Datos procesados según política de privacidad</li>
                <li>Usuario responsable de decisiones finales</li>
              </ul>
            </div>
          </ScrollArea>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Checkbox id="ai-disclaimer-accept" checked={checked} onCheckedChange={(v) => setChecked(Boolean(v))} />
              <Label htmlFor="ai-disclaimer-accept">He leído y acepto los términos</Label>
            </div>

            {signatureType === 'typed_name' && (
              <div className="space-y-2">
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
            {loading && <p className="text-sm text-muted-foreground">Cargando…</p>}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onDecline} disabled={submitting}>
            Cancelar
          </Button>
          <Button onClick={handleAccept} disabled={!canAccept || submitting || loading}>
            Aceptar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
