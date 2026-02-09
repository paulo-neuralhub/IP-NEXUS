import { FileText, Palette, Download } from 'lucide-react';
import { ArticleLayout } from '../ArticleLayout';
import { ArticleSection } from '../ArticleSection';
import { StepByStep } from '../StepByStep';
import { InfoCallout } from '../InfoCallout';
import { IllustrationSettings } from '../illustrations';
const ACCENT = '#64748B';
export function Config004Content() {
  return (
    <ArticleLayout title="Plantillas de documentos" subtitle="Crea y personaliza plantillas para tus documentos profesionales." icon={FileText} accentColor={ACCENT} category="Configuración" categorySlug="configuracion" readTime="4 min" lastUpdated="Febrero 2026" tags={['plantillas','documentos','personalizar']} tocSections={[{id:'tipos',title:'Plantillas disponibles'},{id:'personalizar',title:'Personalizar'}]} relatedArticles={[{title:'Ajustes de organización',path:'/app/help/article/ajustes-organizacion',readTime:'3 min'}]}>
      <div className="flex justify-center mb-8"><IllustrationSettings size={150} /></div>
      <p className="text-[15px] text-foreground/80 leading-relaxed">Las plantillas permiten generar documentos <strong>con tu branding</strong> de forma consistente.</p>
      <ArticleSection id="tipos" title="Plantillas disponibles" icon={FileText} accentColor={ACCENT} variant="highlighted">
        <InfoCallout type="info">IP-NEXUS incluye plantillas para: <strong>facturas, presupuestos, informes de marca, poderes notariales, cartas de encargo</strong> y más.</InfoCallout>
      </ArticleSection>
      <ArticleSection id="personalizar" title="Personalizar plantillas" icon={Palette} accentColor={ACCENT}>
        <StepByStep accentColor={ACCENT} steps={[
          {title:'Ve a Configuración → Plantillas',description:'Verás el catálogo de plantillas disponibles.'},
          {title:'Selecciona y edita',description:'Abre una plantilla y personaliza: logo, colores, textos, campos dinámicos.'},
          {title:'Guarda como plantilla propia',description:'Guarda tu versión personalizada para uso futuro.',tip:'Las variables dinámicas (nombre cliente, nº expediente, etc.) se sustituyen automáticamente al generar el documento.'},
        ]} />
      </ArticleSection>
    </ArticleLayout>
  );
}
