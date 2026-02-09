import { FileText, Upload, FolderOpen, Search } from 'lucide-react';
import { ArticleLayout } from '../ArticleLayout';
import { ArticleSection } from '../ArticleSection';
import { StepByStep } from '../StepByStep';
import { InfoCallout } from '../InfoCallout';
import { DataTable } from '../DataTable';
import { IllustrationDocuments } from '../illustrations';

const ACCENT = '#0EA5E9';

export function Docket004Content() {
  return (
    <ArticleLayout title="Añadir y gestionar documentos" subtitle="Sube, organiza y busca documentos dentro de tus expedientes." icon={FileText} accentColor={ACCENT} category="IP-Docket" categorySlug="portfolio" readTime="3 min" lastUpdated="Febrero 2026" tags={['documentos','subir','archivos','PDF']} tocSections={[{id:'subir',title:'Subir documentos'},{id:'formatos',title:'Formatos soportados'},{id:'organizar',title:'Organizar'}]} relatedArticles={[{title:'Crear expediente',path:'/app/help/article/crear-expediente',readTime:'6 min'},{title:'Exportar informes',path:'/app/help/article/exportar-informes',readTime:'3 min'}]}>
      <div className="flex justify-center mb-8"><IllustrationDocuments size={150} /></div>
      <p className="text-[15px] text-foreground/80 leading-relaxed">Cada expediente puede tener <strong>documentos adjuntos</strong>: logos, memorias, poderes, escritos y cualquier archivo relevante.</p>

      <ArticleSection id="subir" title="Subir documentos" icon={Upload} accentColor={ACCENT} variant="highlighted">
        <StepByStep accentColor={ACCENT} steps={[
          {title:'Abre la pestaña Documentos',description:'Dentro del expediente, haz click en la pestaña "Documentos".'},
          {title:'Arrastra o selecciona',description:'Arrastra archivos al área de subida o haz click en "Subir documento" para seleccionar desde tu equipo.',tip:'Puedes subir varios archivos a la vez.'},
          {title:'Añade metadatos',description:'Opcionalmente, añade un nombre descriptivo, categoría y notas al documento.'},
        ]} />
      </ArticleSection>

      <ArticleSection id="formatos" title="Formatos y límites" icon={FileText} accentColor={ACCENT}>
        <DataTable headers={['Formato','Extensiones','Tamaño máx.']} rows={[['Documentos','PDF, DOCX, XLSX, PPTX','50 MB'],['Imágenes','PNG, JPG, TIFF, SVG','50 MB'],['Comprimidos','ZIP, RAR','100 MB']]} />
        <InfoCallout type="warning">Los archivos superiores a 50 MB deben comprimirse antes de subirse.</InfoCallout>
      </ArticleSection>

      <ArticleSection id="organizar" title="Organizar y buscar" icon={Search} accentColor={ACCENT} variant="highlighted">
        <InfoCallout type="tip">Usa la <strong>búsqueda de documentos</strong> para encontrar archivos por nombre, tipo o contenido (OCR disponible para PDFs).</InfoCallout>
        <InfoCallout type="info">Los documentos se versionan automáticamente. Si subes un archivo con el mismo nombre, se crea una nueva versión conservando las anteriores.</InfoCallout>
      </ArticleSection>
    </ArticleLayout>
  );
}
