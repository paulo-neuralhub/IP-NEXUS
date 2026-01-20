// ============================================
// Step 4: Electronic Signature
// ============================================

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Pen, RotateCcw, Check } from 'lucide-react';
import type { OnboardingFormData } from '@/hooks/legal-ops/useClientOnboarding';

interface Step4Props {
  formData: OnboardingFormData;
  onChange: (data: Partial<OnboardingFormData>) => void;
}

export function Step4Signature({ formData, onChange }: Step4Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);

    // Set drawing style
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Fill with white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent): { x: number; y: number } | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const coords = getCoordinates(e);
    if (!coords) return;

    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const coords = getCoordinates(e);
    if (!coords) return;

    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    if (isDrawing && hasSignature) {
      saveSignature();
    }
    setIsDrawing(false);
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const signatureData = canvas.toDataURL('image/png');
    onChange({ signature_data: signatureData });
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    onChange({ signature_data: undefined });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-2">
        <h2 className="text-xl font-semibold">Firma electrónica</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Dibuje su firma para aceptar los términos
        </p>
      </div>

      {/* Summary of what's being signed */}
      <Card className="bg-muted/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Documentos a firmar:</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <ul className="text-sm space-y-1">
            <li className="flex items-center gap-2">
              {formData.tos_accepted ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              )}
              Términos de Servicio
            </li>
            <li className="flex items-center gap-2">
              {formData.dpa_accepted ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              )}
              Acuerdo de Procesamiento de Datos (DPA)
            </li>
            <li className="flex items-center gap-2">
              {formData.ai_disclosure_understood ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              )}
              Declaración de IA (EU AI Act)
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Signature pad */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Pen className="w-4 h-4" />
            Dibuje su firma aquí
          </Label>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearSignature}
            disabled={!hasSignature}
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Limpiar
          </Button>
        </div>

        <div className="border-2 border-dashed rounded-lg p-2 bg-white">
          <canvas
            ref={canvasRef}
            className="w-full h-[200px] cursor-crosshair rounded touch-none"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
        </div>

        <p className="text-xs text-muted-foreground text-center">
          {hasSignature 
            ? '✅ Firma capturada. Pulse "Limpiar" para volver a firmar.'
            : 'Utilice el ratón o el dedo (en dispositivos táctiles) para dibujar su firma'
          }
        </p>
      </div>

      {/* Legal notice */}
      <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-xs text-blue-800 dark:text-blue-200">
          <strong>Nota legal:</strong> Al firmar, declara que es usted quien realiza 
          esta acción y acepta que esta firma electrónica simple (SES) tiene la misma 
          validez que su firma manuscrita para los documentos indicados. Se registrarán 
          la fecha, hora, IP y navegador como evidencia.
        </p>
      </div>
    </div>
  );
}
