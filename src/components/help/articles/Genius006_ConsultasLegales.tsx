import { Scale, BookOpen, Globe } from 'lucide-react';
import { ArticleLayout } from '../ArticleLayout';
import { ArticleSection } from '../ArticleSection';
import { FeatureGrid } from '../FeatureGrid';
import { InfoCallout } from '../InfoCallout';
import { IllustrationAI } from '../illustrations';
const ACCENT = '#F59E0B';
export function Genius006Content() {
  return (
    <ArticleLayout title="Consultas legales de PI" subtitle="Haz preguntas sobre legislación y recibe respuestas fundamentadas." icon={Scale} accentColor={ACCENT} category="Genius AI" categorySlug="genius" readTime="3 min" lastUpdated="Febrero 2026" tags={['legal','consulta','legislación','ley']} tocSections={[{id:'temas',title:'Temas disponibles'},{id:'jurisdicciones',title:'Jurisdicciones'},{id:'limitaciones',title:'Limitaciones'}]} relatedArticles={[{title:'¿Qué es Genius?',path:'/app/help/article/que-es-genius',readTime:'3 min'}]}>
      <div className="flex justify-center mb-8"><IllustrationAI size={150} /></div>
      <p className="text-[15px] text-foreground/80 leading-relaxed">NEXUS Legal es el agente especializado en <strong>legislación de propiedad intelectual</strong>. Responde con fuentes y referencias legales.</p>
      <ArticleSection id="temas" title="Temas que cubre" icon={BookOpen} accentColor={ACCENT} variant="highlighted">
        <FeatureGrid features={[
          {emoji:'🏷️',title:'Marcas',description:'Registro, oposiciones, nulidad, renovaciones, uso obligatorio.',accentColor:'#3B82F6'},
          {emoji:'📋',title:'Patentes',description:'Requisitos de patentabilidad, anualidades, licencias.',accentColor:'#10B981'},
          {emoji:'🎨',title:'Diseños',description:'Protección, registro, novedad, divulgación.',accentColor:'#8B5CF6'},
          {emoji:'⚖️',title:'Litigios',description:'Infracciones, medidas cautelares, daños y perjuicios.',accentColor:'#EF4444'},
        ]} />
      </ArticleSection>
      <ArticleSection id="jurisdicciones" title="Jurisdicciones disponibles" icon={Globe} accentColor={ACCENT}>
        <InfoCallout type="info">NEXUS Legal cubre legislación de <strong>España, Unión Europea y normativa internacional</strong> (OMPI/WIPO). La cobertura de otros países depende del plan Genius contratado.</InfoCallout>
      </ArticleSection>
      <ArticleSection id="limitaciones" title="Limitaciones" icon={Scale} accentColor={ACCENT} variant="highlighted">
        <InfoCallout type="warning">NEXUS Legal proporciona <strong>información legal orientativa</strong>. No sustituye al asesoramiento profesional. Las respuestas se basan en la legislación indexada y pueden no reflejar cambios recientes.</InfoCallout>
        <InfoCallout type="tip">Para máxima fiabilidad, verifica siempre las citas legales con las fuentes oficiales.</InfoCallout>
      </ArticleSection>
    </ArticleLayout>
  );
}
