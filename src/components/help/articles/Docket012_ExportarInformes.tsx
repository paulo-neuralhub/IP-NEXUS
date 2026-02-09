import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import { ArticleLayout } from '../ArticleLayout';
import { ArticleSection } from '../ArticleSection';
import { StepByStep } from '../StepByStep';
import { InfoCallout } from '../InfoCallout';
import { FeatureGrid } from '../FeatureGrid';
import { IllustrationDocuments } from '../illustrations';
const ACCENT = '#0EA5E9';
export function Docket012Content() {
  return (
    <ArticleLayout title="Exportar datos e informes" subtitle="Genera y descarga informes de tus expedientes en PDF o Excel." icon={Download} accentColor={ACCENT} category="IP-Docket" categorySlug="portfolio" readTime="3 min" lastUpdated="Febrero 2026" tags={['exportar','informes','PDF','Excel']} tocSections={[{id:'formatos',title:'Formatos'},{id:'exportar',title:'Cómo exportar'}]} relatedArticles={[{title:'Buscar y filtrar',path:'/app/help/article/buscar-filtrar',readTime:'3 min'}]}>
      <div className="flex justify-center mb-8"><IllustrationDocuments size={150} /></div>
      <p className="text-[15px] text-foreground/80 leading-relaxed">Exporta datos de tu portfolio para <strong>informes, auditorías o backups</strong>. IP-NEXUS genera documentos profesionales con tu branding.</p>
      <ArticleSection id="formatos" title="Formatos de exportación" icon={FileSpreadsheet} accentColor={ACCENT} variant="highlighted">
        <FeatureGrid features={[
          {emoji:'📊',title:'Excel (.xlsx)',description:'Datos completos con filtros. Ideal para análisis y reporting.',accentColor:'#10B981'},
          {emoji:'📄',title:'PDF',description:'Informe profesional con logo y formato. Para clientes y presentaciones.',accentColor:'#EF4444'},
          {emoji:'📋',title:'CSV',description:'Datos planos separados por comas. Para integración con otros sistemas.',accentColor:'#3B82F6'},
        ]} columns={3} />
      </ArticleSection>
      <ArticleSection id="exportar" title="Cómo exportar" icon={Download} accentColor={ACCENT}>
        <StepByStep accentColor={ACCENT} steps={[
          {title:'Filtra los expedientes',description:'Aplica los filtros necesarios para seleccionar qué expedientes exportar.'},
          {title:'Haz click en "Exportar"',description:'En la barra de acciones, haz click en el botón de exportar y selecciona el formato.'},
          {title:'Descarga el archivo',description:'El archivo se genera y se descarga automáticamente.',tip:'Para informes PDF personalizados con tu branding, ve a Configuración → Plantillas de documentos.'},
        ]} />
      </ArticleSection>
    </ArticleLayout>
  );
}
