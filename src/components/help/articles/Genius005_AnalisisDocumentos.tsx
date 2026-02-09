import { Scan, Upload, FileSearch } from 'lucide-react';
import { ArticleLayout } from '../ArticleLayout';
import { ArticleSection } from '../ArticleSection';
import { StepByStep } from '../StepByStep';
import { InfoCallout } from '../InfoCallout';
import { IllustrationAI } from '../illustrations';
const ACCENT = '#F59E0B';
export function Genius005Content() {
  return (
    <ArticleLayout title="Análisis de documentos con IA" subtitle="Sube un documento y deja que la IA extraiga y analice la información." icon={Scan} accentColor={ACCENT} category="Genius AI" categorySlug="genius" readTime="3 min" lastUpdated="Febrero 2026" tags={['documentos','análisis','OCR','PDF']} tocSections={[{id:'formatos',title:'Formatos soportados'},{id:'como',title:'Cómo analizar'}]} relatedArticles={[{title:'Primer chat con Genius',path:'/app/help/article/primer-chat-genius',readTime:'3 min'}]}>
      <div className="flex justify-center mb-8"><IllustrationAI size={150} /></div>
      <p className="text-[15px] text-foreground/80 leading-relaxed">Genius puede <strong>leer y analizar documentos</strong> de PI: solicitudes, oposiciones, resoluciones, certificados y más.</p>
      <ArticleSection id="formatos" title="Formatos soportados" icon={FileSearch} accentColor={ACCENT}>
        <InfoCallout type="info">Genius acepta <strong>PDF, DOCX, imágenes (JPG/PNG)</strong> y documentos escaneados (con OCR automático).</InfoCallout>
        <InfoCallout type="warning">El tamaño máximo por documento es de <strong>25 MB</strong>. Para documentos más grandes, divídelos en partes.</InfoCallout>
      </ArticleSection>
      <ArticleSection id="como" title="Cómo analizar un documento" icon={Upload} accentColor={ACCENT} variant="highlighted">
        <StepByStep accentColor={ACCENT} steps={[
          {title:'Abre Genius',description:'Inicia una conversación con Genius (Ctrl+J).'},
          {title:'Adjunta el documento',description:'Haz click en el icono de clip para adjuntar el archivo o arrástralo directamente al chat.'},
          {title:'Haz tu pregunta',description:'Escribe qué quieres que analice. Ejemplo: "Resume los argumentos de esta oposición" o "Extrae las fechas clave de este certificado".',tip:'Puedes hacer múltiples preguntas sobre el mismo documento en la conversación.'},
        ]} />
        <InfoCallout type="tip">Los documentos analizados se guardan en el historial de la conversación para referencia futura.</InfoCallout>
      </ArticleSection>
    </ArticleLayout>
  );
}
