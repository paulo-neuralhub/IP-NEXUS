// src/components/features/genius/legal-translator.tsx
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Languages, 
  ArrowRightLeft, 
  AlertTriangle, 
  Copy, 
  Download,
  Loader2,
  FileText,
  BookOpen,
  CheckCircle
} from 'lucide-react';
import { useTranslate, useGlossaries } from '@/hooks/ai/useTranslation';
import { 
  TRANSLATION_DISCLAIMER, 
  SUPPORTED_LANGUAGES, 
  DOCUMENT_TYPES 
} from '@/lib/constants/translation';
import { toast } from 'sonner';

export function LegalTranslator() {
  const [sourceText, setSourceText] = useState('');
  const [sourceLang, setSourceLang] = useState('es');
  const [targetLang, setTargetLang] = useState('en');
  const [documentType, setDocumentType] = useState('contract');
  const [selectedGlossary, setSelectedGlossary] = useState<string>('__auto__');
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [result, setResult] = useState<string>('');
  const [termsUsed, setTermsUsed] = useState<Array<{ source: string; target: string }>>([]);

  const translate = useTranslate();
  const { data: glossaries } = useGlossaries(sourceLang, targetLang);

  const handleSwap = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setSourceText(result);
    setResult(sourceText);
    setTermsUsed([]);
  };

  const handleTranslate = async () => {
    if (!disclaimerAccepted) {
      toast.error('Debe aceptar el aviso legal');
      return;
    }

    try {
      const data = await translate.mutateAsync({
        sourceText,
        sourceLanguage: sourceLang,
        targetLanguage: targetLang,
        documentType,
        glossaryId: selectedGlossary === '__auto__' ? undefined : selectedGlossary,
        disclaimerAccepted,
      });

      setResult(data.translatedText);
      setTermsUsed(data.termsUsed);
      toast.success(`Traducción completada en ${(data.processingTime / 1000).toFixed(1)}s`);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleCopy = () => {
    const disclaimer = TRANSLATION_DISCLAIMER[targetLang as keyof typeof TRANSLATION_DISCLAIMER] || TRANSLATION_DISCLAIMER.en;
    const textWithDisclaimer = `${disclaimer}\n\n---\n\n${result}`;
    navigator.clipboard.writeText(textWithDisclaimer);
    toast.success('Copiado con aviso legal');
  };

  const handleDownload = () => {
    const disclaimer = TRANSLATION_DISCLAIMER[targetLang as keyof typeof TRANSLATION_DISCLAIMER] || TRANSLATION_DISCLAIMER.en;
    const content = `${disclaimer}\n\n---\n\n${result}`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `traduccion_${documentType}_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const sourceLangInfo = SUPPORTED_LANGUAGES.find(l => l.code === sourceLang);
  const targetLangInfo = SUPPORTED_LANGUAGES.find(l => l.code === targetLang);

  return (
    <div className="space-y-6">
      {/* DISCLAIMER - SIEMPRE VISIBLE */}
      <Alert variant="default" className="border-amber-500 bg-amber-50 dark:bg-amber-950/30">
        <AlertTriangle className="h-5 w-5 text-amber-600" />
        <AlertTitle className="text-amber-800 dark:text-amber-200 text-lg">
          Aviso Legal Importante - Lea Atentamente
        </AlertTitle>
        <AlertDescription>
          <ScrollArea className="h-48 mt-4">
            <pre className="text-sm text-amber-700 dark:text-amber-300 whitespace-pre-wrap font-sans">
              {TRANSLATION_DISCLAIMER.es}
            </pre>
          </ScrollArea>
          <div className="flex items-center space-x-2 mt-4 pt-4 border-t border-amber-300 dark:border-amber-700">
            <Checkbox
              id="disclaimer"
              checked={disclaimerAccepted}
              onCheckedChange={(c) => setDisclaimerAccepted(!!c)}
              className="border-amber-600"
            />
            <label 
              htmlFor="disclaimer" 
              className="text-sm font-medium text-amber-800 dark:text-amber-200 cursor-pointer"
            >
              He leído, comprendo y acepto las limitaciones de este servicio de traducción
            </label>
          </div>
        </AlertDescription>
      </Alert>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Source */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Languages className="h-5 w-5" />
                Texto Original
              </CardTitle>
              <Select value={sourceLang} onValueChange={setSourceLang}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_LANGUAGES.map(lang => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.flag} {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              placeholder="Pegue o escriba el texto a traducir..."
              className="min-h-[300px] font-mono text-sm"
            />
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>{sourceText.split(/\s+/).filter(Boolean).length} palabras</span>
              <span>{sourceText.length} caracteres</span>
            </div>
          </CardContent>
        </Card>

        {/* Target */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Traducción</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={handleSwap} title="Intercambiar idiomas">
                  <ArrowRightLeft className="h-4 w-4" />
                </Button>
                <Select value={targetLang} onValueChange={setTargetLang}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SUPPORTED_LANGUAGES.filter(l => l.code !== sourceLang).map(lang => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.flag} {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              value={result}
              readOnly
              placeholder="La traducción aparecerá aquí..."
              className="min-h-[300px] font-mono text-sm bg-muted/50"
            />
            {result && (
              <div className="flex justify-end gap-2 mt-2">
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  <Copy className="h-4 w-4 mr-1" /> Copiar
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-1" /> Descargar
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Options and Translate button */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Tipo de documento
              </Label>
              <Select value={documentType} onValueChange={setDocumentType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPES.map(doc => (
                    <SelectItem key={doc.id} value={doc.id}>
                      {doc.label.es}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Glosario especializado
              </Label>
              <Select value={selectedGlossary} onValueChange={setSelectedGlossary}>
                <SelectTrigger>
                  <SelectValue placeholder="Automático" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__auto__">Automático (recomendado)</SelectItem>
                  {glossaries?.map(g => (
                    <SelectItem key={g.id} value={g.id}>
                      {g.is_official && '⭐ '}{g.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <Button
                onClick={handleTranslate}
                disabled={!sourceText.trim() || !disclaimerAccepted || translate.isPending}
                className="w-full"
                size="lg"
              >
                {translate.isPending ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Traduciendo...
                  </>
                ) : (
                  <>
                    <Languages className="h-5 w-5 mr-2" />
                    Traducir documento
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Terms used */}
      {termsUsed.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Términos especializados aplicados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {termsUsed.map((term, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {term.source} → {term.target}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success message */}
      {result && (
        <Alert className="bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800 dark:text-green-200">
            Traducción completada
          </AlertTitle>
          <AlertDescription className="text-green-700 dark:text-green-300">
            Recuerde: Esta traducción es meramente informativa. Para usos oficiales, 
            consulte con un traductor jurado certificado.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
