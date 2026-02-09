import { FileSignature, FileText, Wand2 } from 'lucide-react';
import { ArticleLayout } from '../ArticleLayout';
import { ArticleSection } from '../ArticleSection';
import { StepByStep } from '../StepByStep';
import { InfoCallout } from '../InfoCallout';
import { FeatureGrid } from '../FeatureGrid';
import { IllustrationDocuments } from '../illustrations';
const ACCENT = '#14B8A6';
export function Filing006Content() {
  return (
    <ArticleLayout title="Plantillas de solicitud" subtitle="Usa las plantillas prediseñadas para generar documentación profesional." icon={FileSignature} accentColor={ACCENT} category="Registro y Filing" categorySlug="filing" readTime="4 min" lastUpdated="Febrero 2026" tags={['plantillas','documentos','generar','solicitud']} tocSections={[{id:'plantillas',title:'Plantillas disponibles'},{id:'generar',title:'Cómo generar'}]} relatedArticles={[{title:'Preparar solicitud',path:'/app/help/article/preparar-solicitud',readTime:'6 min'}]}>
      <div className="flex justify-center mb-8"><IllustrationDocuments size={150} /></div>
      <p className="text-[15px] text-foreground/80 leading-relaxed">IP-NEXUS incluye plantillas profesionales para generar documentos de solicitud <strong>con un click</strong>.</p>
      <ArticleSection id="plantillas" title="Plantillas disponibles" icon={FileText} accentColor={ACCENT} variant="highlighted">
        <FeatureGrid features={[
          {emoji:'📝',title:'Solicitud de marca',description:'Formulario oficial pre-rellenado con datos del expediente.',accentColor:'#3B82F6'},
          {emoji:'📜',title:'Poder notarial',description:'Documento de representación adaptado por jurisdicción.',accentColor:'#8B5CF6'},
          {emoji:'📋',title:'Lista de productos',description:'Descripción de clases formateada según estándares oficiales.',accentColor:'#10B981'},
          {emoji:'📄',title:'Informe de anterioridades',description:'Informe profesional generado por NEXUS Genius.',accentColor:'#F59E0B'},
        ]} />
      </ArticleSection>
      <ArticleSection id="generar" title="Cómo generar documentos" icon={Wand2} accentColor={ACCENT}>
        <StepByStep accentColor={ACCENT} steps={[
          {title:'Abre el expediente',description:'Navega al expediente para el que quieres generar documentos.'},
          {title:'Ve a Documentos → Generar',description:'Selecciona la plantilla que necesitas del catálogo.',tip:'Las plantillas se rellenan automáticamente con los datos del expediente.'},
          {title:'Revisa y descarga',description:'Revisa el documento generado, edita si es necesario y descarga en PDF o DOCX.'},
        ]} />
      </ArticleSection>
    </ArticleLayout>
  );
}
