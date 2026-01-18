import { useEffect } from 'react';
import { usePageTitle } from '@/contexts/page-context';
import { SimilarityAnalyzer } from '@/components/features/spider/similarity-analyzer';

export default function AnalyzePage() {
  const { setTitle } = usePageTitle();
  
  useEffect(() => {
    setTitle('Analizador de Similitud');
  }, [setTitle]);
  
  return (
    <div className="py-6 px-4 md:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Analizador de Similitud</h1>
        <p className="text-muted-foreground mt-1">
          Compara términos o logos para evaluar riesgo de conflicto
        </p>
      </div>
      
      <SimilarityAnalyzer />
    </div>
  );
}
