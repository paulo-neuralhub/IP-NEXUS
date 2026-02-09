import { FileText, Download, Settings } from 'lucide-react';
import { ArticleLayout } from '../ArticleLayout';
import { ArticleSection } from '../ArticleSection';
import { StepByStep } from '../StepByStep';
import { InfoCallout } from '../InfoCallout';
import { FeatureGrid } from '../FeatureGrid';
import { IllustrationDocuments } from '../illustrations';
const ACCENT = '#F59E0B';
export function Genius004Content() {
  return (
    <ArticleLayout title="Generar informes automáticos" subtitle="Crea informes profesionales con un click usando IA." icon={FileText} accentColor={ACCENT} category="Genius AI" categorySlug="genius" readTime="4 min" lastUpdated="Febrero 2026" tags={['informes','automáticos','PDF','IA']} tocSections={[{id:'tipos',title:'Tipos de informe'},{id:'generar',title:'Cómo generar'}]} relatedArticles={[{title:'Análisis de anterioridades',path:'/app/help/article/analisis-anterioridades',readTime:'4 min'}]}>
      <div className="flex justify-center mb-8"><IllustrationDocuments size={150} /></div>
      <p className="text-[15px] text-foreground/80 leading-relaxed">Genius genera informes profesionales <strong>listos para enviar a tus clientes</strong>, con tu branding y formato legal.</p>
      <ArticleSection id="tipos" title="Tipos de informe" icon={FileText} accentColor={ACCENT} variant="highlighted">
        <FeatureGrid features={[
          {emoji:'🔍',title:'Anterioridades',description:'Informe completo de búsqueda con análisis de riesgo por marca encontrada.',accentColor:'#EF4444'},
          {emoji:'📊',title:'Portfolio',description:'Resumen del estado de todos los expedientes de un cliente.',accentColor:'#3B82F6'},
          {emoji:'⚖️',title:'Vigilancia',description:'Alertas detectadas y análisis de riesgo periódico.',accentColor:'#8B5CF6'},
          {emoji:'💰',title:'Costes',description:'Desglose de tasas, honorarios y presupuestos por expediente.',accentColor:'#14B8A6'},
        ]} />
      </ArticleSection>
      <ArticleSection id="generar" title="Cómo generar un informe" icon={Download} accentColor={ACCENT}>
        <StepByStep accentColor={ACCENT} steps={[
          {title:'Selecciona el tipo de informe',description:'Ve a Genius → Informes y elige el tipo que necesitas.'},
          {title:'Configura los parámetros',description:'Selecciona el expediente, cliente o rango de fechas.'},
          {title:'Genera y descarga',description:'Genius genera el informe en PDF con tu logo y datos de contacto.',tip:'Los informes se guardan automáticamente en la pestaña Documentos del expediente.'},
        ]} />
        <InfoCallout type="tip">Personaliza las plantillas de informe en <strong>Configuración → Plantillas de documentos</strong>.</InfoCallout>
      </ArticleSection>
    </ArticleLayout>
  );
}
