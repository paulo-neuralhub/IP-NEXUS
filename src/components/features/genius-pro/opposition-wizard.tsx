import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, ChevronRight, ChevronLeft, Check, AlertTriangle, 
  Scale, Building, FileCheck, Loader2, Download, Copy, Info
} from 'lucide-react';
import { useGenerateOpposition, useOfficialFees } from '@/hooks/genius/useGeniusPro';
import { OPPOSITION_GROUNDS, IP_OFFICES, DOCUMENT_TONES, GENIUS_PRO_DISCLAIMERS } from '@/lib/constants/genius-pro';
import type { OppositionInput, GeneratedDocument } from '@/types/genius-pro.types';
import { toast } from 'sonner';

const STEPS = [
  { id: 'opponent', title: 'Oponente', icon: Building },
  { id: 'marks', title: 'Marcas', icon: Scale },
  { id: 'grounds', title: 'Motivos', icon: FileCheck },
  { id: 'options', title: 'Opciones', icon: FileText },
];

interface StepProps {
  input: OppositionInput;
  onChange: (input: OppositionInput) => void;
}

function OpponentStep({ input, onChange }: StepProps) {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label>Nombre del oponente *</Label>
          <Input
            value={input.opponent.name}
            onChange={(e) => onChange({
              ...input,
              opponent: { ...input.opponent, name: e.target.value }
            })}
            placeholder="Empresa S.L."
          />
        </div>
        <div>
          <Label>NIF/CIF</Label>
          <Input
            value={input.opponent.taxId || ''}
            onChange={(e) => onChange({
              ...input,
              opponent: { ...input.opponent, taxId: e.target.value }
            })}
            placeholder="B12345678"
          />
        </div>
      </div>
      
      <div>
        <Label>Dirección</Label>
        <Input
          value={input.opponent.address || ''}
          onChange={(e) => onChange({
            ...input,
            opponent: { ...input.opponent, address: e.target.value }
          })}
          placeholder="Calle Ejemplo 123, 28001 Madrid"
        />
      </div>
      
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label>Email de contacto</Label>
          <Input
            type="email"
            value={input.opponent.email || ''}
            onChange={(e) => onChange({
              ...input,
              opponent: { ...input.opponent, email: e.target.value }
            })}
            placeholder="legal@empresa.com"
          />
        </div>
        <div>
          <Label>Representante legal</Label>
          <Input
            value={input.opponent.representative || ''}
            onChange={(e) => onChange({
              ...input,
              opponent: { ...input.opponent, representative: e.target.value }
            })}
            placeholder="Juan García López"
          />
        </div>
      </div>
    </div>
  );
}

function MarksStep({ input, onChange }: StepProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Marca anterior (base de oposición)</CardTitle>
          <CardDescription>La marca registrada que se opone</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Denominación *</Label>
              <Input
                value={input.earlierMark.text}
                onChange={(e) => onChange({
                  ...input,
                  earlierMark: { ...input.earlierMark, text: e.target.value }
                })}
                placeholder="NEXUS"
              />
            </div>
            <div>
              <Label>Número de registro</Label>
              <Input
                value={input.earlierMark.registrationNumber || ''}
                onChange={(e) => onChange({
                  ...input,
                  earlierMark: { ...input.earlierMark, registrationNumber: e.target.value }
                })}
                placeholder="M1234567"
              />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Clases Niza (separadas por coma)</Label>
              <Input
                value={input.earlierMark.classes?.join(', ') || ''}
                onChange={(e) => onChange({
                  ...input,
                  earlierMark: {
                    ...input.earlierMark,
                    classes: e.target.value.split(',').map(c => parseInt(c.trim())).filter(Boolean)
                  }
                })}
                placeholder="9, 35, 42"
              />
            </div>
            <div>
              <Label>Fecha de registro</Label>
              <Input
                type="date"
                value={input.earlierMark.registrationDate || ''}
                onChange={(e) => onChange({
                  ...input,
                  earlierMark: { ...input.earlierMark, registrationDate: e.target.value }
                })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Marca impugnada (solicitud a oponerse)</CardTitle>
          <CardDescription>La marca cuyo registro se pretende impedir</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Denominación *</Label>
              <Input
                value={input.contestedMark.text}
                onChange={(e) => onChange({
                  ...input,
                  contestedMark: { ...input.contestedMark, text: e.target.value }
                })}
                placeholder="NEXOS"
              />
            </div>
            <div>
              <Label>Número de solicitud</Label>
              <Input
                value={input.contestedMark.applicationNumber || ''}
                onChange={(e) => onChange({
                  ...input,
                  contestedMark: { ...input.contestedMark, applicationNumber: e.target.value }
                })}
                placeholder="M9876543"
              />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Clases Niza</Label>
              <Input
                value={input.contestedMark.classes?.join(', ') || ''}
                onChange={(e) => onChange({
                  ...input,
                  contestedMark: {
                    ...input.contestedMark,
                    classes: e.target.value.split(',').map(c => parseInt(c.trim())).filter(Boolean)
                  }
                })}
                placeholder="9, 35"
              />
            </div>
            <div>
              <Label>Titular</Label>
              <Input
                value={input.contestedMark.applicant || ''}
                onChange={(e) => onChange({
                  ...input,
                  contestedMark: { ...input.contestedMark, applicant: e.target.value }
                })}
                placeholder="Otra Empresa S.A."
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function GroundsStep({ input, onChange }: StepProps) {
  const toggleGround = (groundId: string) => {
    const current = input.grounds || [];
    const updated = current.includes(groundId)
      ? current.filter(g => g !== groundId)
      : [...current, groundId];
    onChange({ ...input, grounds: updated });
  };

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base">Motivos de oposición *</Label>
        <p className="text-sm text-muted-foreground mb-4">
          Selecciona los motivos legales en los que se basa la oposición
        </p>
        
        <div className="grid gap-3">
          {OPPOSITION_GROUNDS.map((ground) => (
            <div
              key={ground.id}
              className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                input.grounds?.includes(ground.id)
                  ? 'border-primary bg-primary/5'
                  : 'hover:bg-muted/50'
              }`}
              onClick={() => toggleGround(ground.id)}
            >
              <Checkbox
                checked={input.grounds?.includes(ground.id)}
                onCheckedChange={() => toggleGround(ground.id)}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{ground.label}</span>
                  <Badge variant="outline" className="text-xs">{ground.article}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{ground.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <Label>Argumentos adicionales</Label>
        <Textarea
          value={input.additionalArguments || ''}
          onChange={(e) => onChange({ ...input, additionalArguments: e.target.value })}
          placeholder="Incluya cualquier argumento adicional, jurisprudencia relevante, o circunstancias específicas del caso..."
          rows={4}
        />
      </div>
    </div>
  );
}

function OptionsStep({ input, onChange }: StepProps) {
  const { data: fees } = useOfficialFees(input.office, 'opposition');
  
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label>Oficina de PI *</Label>
          <Select
            value={input.office}
            onValueChange={(value) => onChange({ ...input, office: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar oficina" />
            </SelectTrigger>
            <SelectContent>
              {IP_OFFICES.map((office) => (
                <SelectItem key={office.code} value={office.code}>
                  {office.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label>Tono del documento</Label>
          <Select
            value={input.tone || 'formal'}
            onValueChange={(value) => onChange({ ...input, tone: value as any })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DOCUMENT_TONES.map((tone) => (
                <SelectItem key={tone.id} value={tone.id}>
                  {tone.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div>
        <Label>Idioma del documento</Label>
        <Select
          value={input.language || 'es'}
          onValueChange={(value) => onChange({ ...input, language: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="es">Español</SelectItem>
            <SelectItem value="en">Inglés</SelectItem>
            <SelectItem value="fr">Francés</SelectItem>
            <SelectItem value="de">Alemán</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {fees && fees.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Tasas oficiales estimadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {fees.map((fee) => (
                <div key={fee.id} className="flex justify-between text-sm">
                  <span>{fee.fee_name}</span>
                  <span className="font-medium">{fee.amount} {fee.currency}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              * Las tasas pueden variar. Consulte la web oficial de la oficina.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function GeneratedDocumentView({ document }: { document: GeneratedDocument }) {
  const handleCopy = () => {
    navigator.clipboard.writeText(document.contentMarkdown);
    toast.success('Documento copiado al portapapeles');
  };
  
  return (
    <div className="space-y-6">
      <Alert variant="default" className="bg-amber-50 border-amber-200">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800">
          {GENIUS_PRO_DISCLAIMERS.opposition.es}
        </AlertDescription>
      </Alert>
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{document.title}</CardTitle>
              <CardDescription>Generado el {new Date().toLocaleDateString('es-ES')}</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCopy}>
                <Copy className="h-4 w-4 mr-2" />
                Copiar
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Descargar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div 
            className="prose prose-sm max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: document.contentHtml }}
          />
        </CardContent>
      </Card>
      
      {document.citations && document.citations.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Citas y referencias</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {document.citations.map((citation, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <Badge variant="outline" className="shrink-0">{idx + 1}</Badge>
                  <div>
                    <span className="font-medium">{citation.reference}</span>
                    {citation.url && (
                      <a href={citation.url} target="_blank" rel="noopener" className="text-primary ml-2">
                        [ver]
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export function OppositionWizard() {
  const [step, setStep] = useState(0);
  const [input, setInput] = useState<OppositionInput>({
    opponent: { name: '' },
    earlierMark: { text: '', classes: [] },
    contestedMark: { text: '', classes: [] },
    grounds: [],
    office: 'OEPM',
    language: 'es',
    tone: 'formal',
  });
  const [generatedDoc, setGeneratedDoc] = useState<GeneratedDocument | null>(null);
  
  const generateMutation = useGenerateOpposition();
  
  const canProceed = () => {
    switch (step) {
      case 0: return input.opponent.name.length > 0;
      case 1: return input.earlierMark.text.length > 0 && input.contestedMark.text.length > 0;
      case 2: return input.grounds && input.grounds.length > 0;
      case 3: return input.office.length > 0;
      default: return false;
    }
  };
  
  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    }
  };
  
  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };
  
  const handleGenerate = async () => {
    const doc = await generateMutation.mutateAsync(input);
    setGeneratedDoc(doc);
  };
  
  if (generatedDoc) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={() => setGeneratedDoc(null)}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Crear otra oposición
        </Button>
        <GeneratedDocumentView document={generatedDoc} />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, idx) => {
          const Icon = s.icon;
          const isActive = idx === step;
          const isCompleted = idx < step;
          
          return (
            <div key={s.id} className="flex items-center">
              <div
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-primary text-primary-foreground' 
                    : isCompleted 
                      ? 'bg-primary/20 text-primary' 
                      : 'bg-muted text-muted-foreground'
                }`}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
                <span className="text-sm font-medium hidden sm:inline">{s.title}</span>
              </div>
              {idx < STEPS.length - 1 && (
                <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground" />
              )}
            </div>
          );
        })}
      </div>
      
      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>{STEPS[step].title}</CardTitle>
          <CardDescription>
            {step === 0 && 'Datos del oponente que presenta la oposición'}
            {step === 1 && 'Información sobre las marcas involucradas'}
            {step === 2 && 'Selecciona los motivos legales de la oposición'}
            {step === 3 && 'Configura las opciones del documento'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 0 && <OpponentStep input={input} onChange={setInput} />}
          {step === 1 && <MarksStep input={input} onChange={setInput} />}
          {step === 2 && <GroundsStep input={input} onChange={setInput} />}
          {step === 3 && <OptionsStep input={input} onChange={setInput} />}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleBack} disabled={step === 0}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Anterior
          </Button>
          
          {step < STEPS.length - 1 ? (
            <Button onClick={handleNext} disabled={!canProceed()}>
              Siguiente
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleGenerate} disabled={!canProceed() || generateMutation.isPending}>
              {generateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Generar borrador
                </>
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
      
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          El documento generado es un borrador que debe ser revisado por un profesional legal antes de su presentación.
        </AlertDescription>
      </Alert>
    </div>
  );
}
