import { MessageSquare, Lightbulb, Sparkles } from 'lucide-react';
import { ArticleLayout } from '../ArticleLayout';
import { ArticleSection } from '../ArticleSection';
import { StepByStep } from '../StepByStep';
import { InfoCallout } from '../InfoCallout';
import { FeatureGrid } from '../FeatureGrid';
import { IllustrationAI } from '../illustrations';
const ACCENT = '#F59E0B';
export function Genius002Content() {
  return (
    <ArticleLayout title="Tu primer chat con IP-Genius" subtitle="Aprende a interactuar con la IA para obtener los mejores resultados." icon={MessageSquare} accentColor={ACCENT} category="Genius AI" categorySlug="genius" readTime="3 min" lastUpdated="Febrero 2026" tags={['chat','consulta','prompt','IA']} tocSections={[{id:'empezar',title:'Cómo empezar'},{id:'tips',title:'Tips para mejores resultados'},{id:'ejemplos',title:'Ejemplos'}]} relatedArticles={[{title:'¿Qué es Genius?',path:'/app/help/article/que-es-genius',readTime:'3 min'}]}>
      <div className="flex justify-center mb-8"><IllustrationAI size={150} /></div>
      <p className="text-[15px] text-foreground/80 leading-relaxed">IP-Genius es tu <strong>asistente legal de IA</strong>. Puedes hacerle preguntas en lenguaje natural sobre PI, pedirle análisis o generar documentos.</p>
      <ArticleSection id="empezar" title="Cómo empezar" icon={MessageSquare} accentColor={ACCENT} variant="highlighted">
        <StepByStep accentColor={ACCENT} steps={[
          {title:'Abre Genius',description:'Haz click en el icono de Genius en el sidebar o usa Ctrl+J.'},
          {title:'Escribe tu consulta',description:'Escribe tu pregunta en lenguaje natural. Sé específico para obtener mejores respuestas.',tip:'Ejemplo: "¿Cuál es el plazo de oposición para una marca europea?"'},
          {title:'Revisa la respuesta',description:'Genius responde con fuentes citadas. Puedes pedir que profundice o reformule.'},
        ]} />
      </ArticleSection>
      <ArticleSection id="tips" title="Tips para mejores resultados" icon={Lightbulb} accentColor={ACCENT}>
        <FeatureGrid features={[
          {emoji:'🎯',title:'Sé específico',description:'Incluye jurisdicción, tipo de PI y contexto.',accentColor:'#3B82F6'},
          {emoji:'📋',title:'Da contexto',description:'Menciona si es marca, patente o diseño.',accentColor:'#10B981'},
          {emoji:'🔄',title:'Itera',description:'Pide aclaraciones o más detalle sobre la respuesta.',accentColor:'#8B5CF6'},
          {emoji:'📎',title:'Adjunta docs',description:'Sube documentos para que Genius los analice.',accentColor:'#F59E0B'},
        ]} />
      </ArticleSection>
      <ArticleSection id="ejemplos" title="Ejemplos de consultas" icon={Sparkles} accentColor={ACCENT} variant="highlighted">
        <InfoCallout type="info">"¿Puedo registrar la marca NEXUS en clase 9 en España si ya existe NEXOS?"</InfoCallout>
        <InfoCallout type="info">"Analiza este documento de oposición y resume los argumentos principales."</InfoCallout>
        <InfoCallout type="info">"¿Cuáles son las tasas actuales de renovación en la EUIPO?"</InfoCallout>
      </ArticleSection>
    </ArticleLayout>
  );
}
