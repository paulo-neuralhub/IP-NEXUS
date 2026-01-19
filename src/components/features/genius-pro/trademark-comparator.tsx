import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Scale, Eye, Ear, Brain, Package, AlertTriangle, CheckCircle, Info, Loader2 } from 'lucide-react';
import { useCompareTrademarks } from '@/hooks/genius/useGeniusPro';
import type { TrademarkMark, TrademarkComparison } from '@/types/genius-pro.types';
import { RISK_LEVEL_CONFIG } from '@/lib/constants/genius-pro';

interface MarkInputProps {
  label: string;
  mark: TrademarkMark;
  onChange: (mark: TrademarkMark) => void;
}

function MarkInput({ label, mark, onChange }: MarkInputProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{label}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Denominación</Label>
          <Input
            value={mark.text}
            onChange={(e) => onChange({ ...mark, text: e.target.value })}
            placeholder="Ej: NEXUS"
          />
        </div>
        <div>
          <Label>URL de imagen (opcional)</Label>
          <Input
            value={mark.imageUrl || ''}
            onChange={(e) => onChange({ ...mark, imageUrl: e.target.value })}
            placeholder="https://..."
          />
        </div>
        <div>
          <Label>Clases Niza (separadas por coma)</Label>
          <Input
            value={mark.classes?.join(', ') || ''}
            onChange={(e) => onChange({ 
              ...mark, 
              classes: e.target.value.split(',').map(c => parseInt(c.trim())).filter(Boolean)
            })}
            placeholder="9, 35, 42"
          />
        </div>
        <div>
          <Label>Productos/Servicios</Label>
          <Textarea
            value={mark.goods?.join('\n') || ''}
            onChange={(e) => onChange({ 
              ...mark, 
              goods: e.target.value.split('\n').filter(Boolean)
            })}
            placeholder="Software de gestión&#10;Servicios de consultoría"
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function RiskBadge({ level }: { level: string }) {
  const config = RISK_LEVEL_CONFIG[level as keyof typeof RISK_LEVEL_CONFIG] || RISK_LEVEL_CONFIG.low;
  
  return (
    <Badge 
      variant="outline" 
      className="text-sm px-3 py-1"
      style={{ 
        backgroundColor: `${config.color}20`,
        borderColor: config.color,
        color: config.color
      }}
    >
      {config.label}
    </Badge>
  );
}

function ScoreBar({ score, label, icon: Icon }: { score: number; label: string; icon: React.ElementType }) {
  const color = score >= 70 ? 'bg-red-500' : score >= 40 ? 'bg-amber-500' : 'bg-green-500';
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Icon className="h-4 w-4" />
          {label}
        </div>
        <span className="text-sm font-bold">{score}%</span>
      </div>
      <Progress value={score} className={`h-2 [&>div]:${color}`} />
    </div>
  );
}

function ComparisonResult({ comparison }: { comparison: TrademarkComparison }) {
  const { analysis, overall } = comparison;
  
  return (
    <div className="space-y-6">
      {/* Overall Result */}
      <Card className="border-2" style={{ borderColor: RISK_LEVEL_CONFIG[overall.riskLevel as keyof typeof RISK_LEVEL_CONFIG]?.color }}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-1">Resultado Global</h3>
              <p className="text-muted-foreground">{overall.recommendation}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold mb-2">{overall.score}%</div>
              <RiskBadge level={overall.riskLevel} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analysis Tabs */}
      <Tabs defaultValue="visual">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="visual" className="gap-2">
            <Eye className="h-4 w-4" /> Visual
          </TabsTrigger>
          <TabsTrigger value="phonetic" className="gap-2">
            <Ear className="h-4 w-4" /> Fonético
          </TabsTrigger>
          <TabsTrigger value="conceptual" className="gap-2">
            <Brain className="h-4 w-4" /> Conceptual
          </TabsTrigger>
          <TabsTrigger value="goods" className="gap-2">
            <Package className="h-4 w-4" /> P/S
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="visual" className="mt-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <ScoreBar score={analysis.visual.score} label="Similitud Visual" icon={Eye} />
              <p className="text-sm text-muted-foreground">{analysis.visual.analysis}</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="phonetic" className="mt-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <ScoreBar score={analysis.phonetic.score} label="Similitud Fonética" icon={Ear} />
              <p className="text-sm text-muted-foreground">{analysis.phonetic.analysis}</p>
              {analysis.phonetic.algorithms && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="text-lg font-bold">{analysis.phonetic.algorithms.levenshtein}%</div>
                    <div className="text-xs text-muted-foreground">Levenshtein</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold">{analysis.phonetic.algorithms.soundex ? '✓' : '✗'}</div>
                    <div className="text-xs text-muted-foreground">Soundex</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold">{analysis.phonetic.algorithms.metaphone ? '✓' : '✗'}</div>
                    <div className="text-xs text-muted-foreground">Metaphone</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold">{analysis.phonetic.algorithms.syllableMatch}%</div>
                    <div className="text-xs text-muted-foreground">Sílabas</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="conceptual" className="mt-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <ScoreBar score={analysis.conceptual.score} label="Similitud Conceptual" icon={Brain} />
              <p className="text-sm text-muted-foreground">{analysis.conceptual.analysis}</p>
              {analysis.conceptual.concepts && Object.keys(analysis.conceptual.concepts).length > 0 && (
                <div className="flex flex-wrap gap-2 pt-4 border-t">
                  {Object.entries(analysis.conceptual.concepts).map(([key, value]) => (
                    <Badge key={key} variant="secondary">{key}: {String(value)}</Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="goods" className="mt-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <ScoreBar score={analysis.goods.score} label="Similitud Productos/Servicios" icon={Package} />
              <p className="text-sm text-muted-foreground">{analysis.goods.analysis}</p>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <h4 className="text-sm font-medium mb-2">Clases idénticas</h4>
                  <div className="flex flex-wrap gap-1">
                    {analysis.goods.identicalClasses?.map(c => (
                      <Badge key={c} variant="destructive">{c}</Badge>
                    ))}
                    {(!analysis.goods.identicalClasses || analysis.goods.identicalClasses.length === 0) && (
                      <span className="text-sm text-muted-foreground">Ninguna</span>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2">Clases similares</h4>
                  <div className="flex flex-wrap gap-1">
                    {analysis.goods.similarClasses?.map(c => (
                      <Badge key={c} variant="secondary">{c}</Badge>
                    ))}
                    {(!analysis.goods.similarClasses || analysis.goods.similarClasses.length === 0) && (
                      <span className="text-sm text-muted-foreground">Ninguna</span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Disclaimer */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Este análisis es orientativo y no constituye asesoramiento legal. 
          Consulte con un profesional para decisiones sobre registro o litigio de marcas.
        </AlertDescription>
      </Alert>
    </div>
  );
}

export function TrademarkComparator() {
  const [markA, setMarkA] = useState<TrademarkMark>({ text: '', classes: [], goods: [] });
  const [markB, setMarkB] = useState<TrademarkMark>({ text: '', classes: [], goods: [] });
  const [result, setResult] = useState<TrademarkComparison | null>(null);
  
  const compareMutation = useCompareTrademarks();
  
  const handleCompare = async () => {
    if (!markA.text || !markB.text) return;
    
    const comparison = await compareMutation.mutateAsync({ markA, markB });
    setResult(comparison);
  };
  
  const canCompare = markA.text.length > 0 && markB.text.length > 0;
  
  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="grid md:grid-cols-2 gap-6">
        <MarkInput label="Marca A (referencia)" mark={markA} onChange={setMarkA} />
        <MarkInput label="Marca B (a comparar)" mark={markB} onChange={setMarkB} />
      </div>
      
      {/* Compare Button */}
      <div className="flex justify-center">
        <Button
          size="lg"
          onClick={handleCompare}
          disabled={!canCompare || compareMutation.isPending}
          className="gap-2 px-8"
        >
          {compareMutation.isPending ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Analizando...
            </>
          ) : (
            <>
              <Scale className="h-5 w-5" />
              Comparar Marcas
            </>
          )}
        </Button>
      </div>
      
      {/* Results */}
      {result && <ComparisonResult comparison={result} />}
    </div>
  );
}
