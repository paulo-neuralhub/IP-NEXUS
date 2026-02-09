import { Search, Shield, AlertTriangle } from 'lucide-react';
import { ArticleLayout } from '../ArticleLayout';
import { ArticleSection } from '../ArticleSection';
import { StepByStep } from '../StepByStep';
import { InfoCallout } from '../InfoCallout';
import { IllustrationSearch } from '../illustrations';
const ACCENT = '#F59E0B';
export function Genius003Content() {
  return (
    <ArticleLayout title="Análisis automático de anterioridades" subtitle="Usa la IA para detectar conflictos antes de registrar tu marca." icon={Search} accentColor={ACCENT} category="Genius AI" categorySlug="genius" readTime="4 min" lastUpdated="Febrero 2026" tags={['anterioridades','análisis','riesgo','similitud']} tocSections={[{id:'que-es',title:'Qué es'},{id:'como',title:'Cómo funciona'},{id:'interpretar',title:'Interpretar resultados'}]} relatedArticles={[{title:'Preparar solicitud',path:'/app/help/article/preparar-solicitud',readTime:'6 min'}]}>
      <div className="flex justify-center mb-8"><IllustrationSearch size={150} /></div>
      <p className="text-[15px] text-foreground/80 leading-relaxed">El análisis de anterioridades detecta marcas <strong>similares ya registradas</strong> que podrían bloquear tu solicitud.</p>
      <ArticleSection id="que-es" title="¿Qué es una búsqueda de anterioridades?" icon={Shield} accentColor={ACCENT}>
        <InfoCallout type="info">Es una búsqueda en las bases de datos de PI para identificar marcas idénticas o similares que puedan generar oposición o denegación.</InfoCallout>
      </ArticleSection>
      <ArticleSection id="como" title="Cómo funciona en IP-NEXUS" icon={Search} accentColor={ACCENT} variant="highlighted">
        <StepByStep accentColor={ACCENT} steps={[
          {title:'Introduce la denominación',description:'Escribe el nombre de la marca que quieres registrar.'},
          {title:'Selecciona jurisdicción y clases',description:'Elige dónde y en qué clases quieres buscar.'},
          {title:'Genius analiza',description:'La IA busca en bases de datos oficiales y aplica algoritmos de similitud fonética, visual y conceptual.',tip:'El análisis tarda entre 30 segundos y 2 minutos según la amplitud de la búsqueda.'},
          {title:'Revisa el informe',description:'Recibes un informe con las marcas encontradas, nivel de riesgo y recomendaciones.'},
        ]} />
      </ArticleSection>
      <ArticleSection id="interpretar" title="Interpretar los resultados" icon={AlertTriangle} accentColor={ACCENT}>
        <InfoCallout type="tip"><strong>Riesgo alto</strong> (rojo): Marca idéntica o muy similar en la misma clase. Considera cambiar la denominación.</InfoCallout>
        <InfoCallout type="info"><strong>Riesgo medio</strong> (amarillo): Similitud parcial. Consulta con un profesional antes de presentar.</InfoCallout>
        <InfoCallout type="tip"><strong>Riesgo bajo</strong> (verde): No se encontraron conflictos relevantes. Puedes proceder con la solicitud.</InfoCallout>
        <InfoCallout type="warning">Este análisis es orientativo. Para decisiones críticas, consulta siempre con un profesional de PI.</InfoCallout>
      </ArticleSection>
    </ArticleLayout>
  );
}
