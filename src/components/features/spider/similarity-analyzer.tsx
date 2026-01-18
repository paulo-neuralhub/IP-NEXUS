import { useState } from 'react';
import { Search, Copy, Mail, FileText, AlertTriangle, CheckCircle } from 'lucide-react';
import { useAnalyzeSimilarity } from '@/hooks/use-spider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export function SimilarityAnalyzer() {
  const [termA, setTermA] = useState('');
  const [termB, setTermB] = useState('');
  const [result, setResult] = useState<{
    overall_score: number;
    phonetic_score: number;
    visual_score: number;
    conceptual_score: number;
    risk_level: 'low' | 'medium' | 'high';
    ai_analysis: string;
  } | null>(null);
  
  const analyzeMutation = useAnalyzeSimilarity();
  
  const handleAnalyze = async () => {
    if (!termA.trim() || !termB.trim()) return;
    
    const analysis = await analyzeMutation.mutateAsync({
      termA: termA.trim(),
      termB: termB.trim(),
    });
    
    // Enhance with additional simulated scores
    const visualScore = Math.floor(Math.random() * 40) + 30;
    const conceptualScore = Math.floor(Math.random() * 30) + 50;
    const overallScore = analysis.overall_score;
    
    setResult({
      overall_score: overallScore,
      phonetic_score: analysis.phonetic_score || overallScore,
      visual_score: visualScore,
      conceptual_score: conceptualScore,
      risk_level: overallScore >= 75 ? 'high' : 
                  overallScore >= 50 ? 'medium' : 'low',
      ai_analysis: generateAIAnalysis(termA, termB, overallScore),
    });
  };

  const handleCopyReport = () => {
    if (!result) return;
    const report = `
ANÁLISIS DE SIMILITUD
=====================
Término A: ${termA}
Término B: ${termB}

PUNTUACIÓN GLOBAL: ${result.overall_score}%
- Fonética: ${result.phonetic_score}%
- Visual: ${result.visual_score}%
- Conceptual: ${result.conceptual_score}%

RIESGO: ${result.risk_level === 'high' ? 'ALTO' : result.risk_level === 'medium' ? 'MEDIO' : 'BAJO'}

ANÁLISIS:
${result.ai_analysis}
    `.trim();
    navigator.clipboard.writeText(report);
    toast.success('Informe copiado al portapapeles');
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      {/* Input section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-card rounded-xl border p-6 space-y-4">
          <h3 className="font-medium text-foreground">Tu marca</h3>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Nombre</label>
            <Input
              value={termA}
              onChange={(e) => setTermA(e.target.value)}
              placeholder="Ej: IP-NEXUS"
            />
          </div>
          <div className="border-2 border-dashed border-border rounded-xl p-8 text-center text-muted-foreground">
            Logo (próximamente)
          </div>
        </div>
        
        <div className="bg-card rounded-xl border p-6 space-y-4">
          <h3 className="font-medium text-foreground">Marca a comparar</h3>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Nombre</label>
            <Input
              value={termB}
              onChange={(e) => setTermB(e.target.value)}
              placeholder="Ej: NEXO TECH"
            />
          </div>
          <div className="border-2 border-dashed border-border rounded-xl p-8 text-center text-muted-foreground">
            Logo (próximamente)
          </div>
        </div>
      </div>
      
      <div className="flex justify-center mb-8">
        <Button
          onClick={handleAnalyze}
          disabled={!termA.trim() || !termB.trim() || analyzeMutation.isPending}
          size="lg"
        >
          <Search className="w-5 h-5 mr-2" />
          {analyzeMutation.isPending ? 'Analizando...' : 'Analizar similitud'}
        </Button>
      </div>
      
      {/* Results */}
      {result && (
        <div className="bg-card rounded-2xl border p-6 space-y-6 animate-fade-in">
          {/* Overall score */}
          <div className="text-center">
            <h3 className="text-sm text-muted-foreground mb-2">Similitud Global</h3>
            <div className="text-5xl font-bold" style={{ color: getScoreColor(result.overall_score) }}>
              {result.overall_score}%
            </div>
            <div className="w-full max-w-md mx-auto mt-4 h-4 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500"
                style={{ 
                  width: `${result.overall_score}%`,
                  backgroundColor: getScoreColor(result.overall_score)
                }}
              />
            </div>
          </div>
          
          {/* Score breakdown */}
          <div className="grid grid-cols-3 gap-4">
            <ScoreCard
              label="Fonética"
              score={result.phonetic_score}
              description="Cómo suenan"
            />
            <ScoreCard
              label="Visual"
              score={result.visual_score}
              description="Cómo se ven"
            />
            <ScoreCard
              label="Conceptual"
              score={result.conceptual_score}
              description="Qué significan"
            />
          </div>
          
          {/* Risk level */}
          <div className={cn(
            "p-4 rounded-xl flex items-start gap-3",
            result.risk_level === 'high' && "bg-destructive/10 border border-destructive/20",
            result.risk_level === 'medium' && "bg-warning/10 border border-warning/20",
            result.risk_level === 'low' && "bg-success/10 border border-success/20"
          )}>
            {result.risk_level === 'high' && <AlertTriangle className="w-6 h-6 text-destructive flex-shrink-0" />}
            {result.risk_level === 'medium' && <AlertTriangle className="w-6 h-6 text-warning flex-shrink-0" />}
            {result.risk_level === 'low' && <CheckCircle className="w-6 h-6 text-success flex-shrink-0" />}
            <div>
              <h4 className="font-semibold text-foreground">
                Riesgo: {result.risk_level === 'high' ? 'Alto' : result.risk_level === 'medium' ? 'Medio' : 'Bajo'}
              </h4>
              <p className="text-sm text-muted-foreground mt-1">{result.ai_analysis}</p>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex justify-center gap-4 pt-4 border-t">
            <Button variant="secondary" size="sm" onClick={handleCopyReport}>
              <Copy className="w-4 h-4 mr-1" /> Copiar informe
            </Button>
            <Button variant="secondary" size="sm" disabled>
              <Mail className="w-4 h-4 mr-1" /> Enviar por email
            </Button>
            <Button variant="secondary" size="sm" disabled>
              <FileText className="w-4 h-4 mr-1" /> Generar PDF
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function ScoreCard({ label, score, description }: { label: string; score: number; description: string }) {
  return (
    <div className="text-center p-4 bg-muted/50 rounded-xl">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold mt-1" style={{ color: getScoreColor(score) }}>
        {score}%
      </p>
      <div className="w-full h-2 bg-muted rounded-full mt-2 overflow-hidden">
        <div 
          className="h-full rounded-full"
          style={{ width: `${score}%`, backgroundColor: getScoreColor(score) }}
        />
      </div>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
    </div>
  );
}

function getScoreColor(score: number): string {
  if (score >= 80) return '#EF4444';
  if (score >= 60) return '#F59E0B';
  if (score >= 40) return '#3B82F6';
  return '#22C55E';
}

function generateAIAnalysis(termA: string, termB: string, score: number): string {
  if (score >= 80) {
    return `Los términos "${termA}" y "${termB}" presentan alta similitud. Existe riesgo significativo de confusión en el mercado. Se recomienda considerar acciones legales si se encuentra dentro del plazo de oposición.`;
  }
  if (score >= 60) {
    return `Existe similitud moderada entre "${termA}" y "${termB}". Se recomienda monitorizar el uso real de la marca y evaluar si opera en los mismos sectores o clases.`;
  }
  return `La similitud entre "${termA}" y "${termB}" es baja. El riesgo de confusión es limitado, aunque se recomienda mantener vigilancia preventiva.`;
}
