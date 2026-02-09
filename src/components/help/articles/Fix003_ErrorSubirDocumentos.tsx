import { UploadCloud, FileWarning, CheckCircle } from 'lucide-react';
import { ArticleLayout } from '../ArticleLayout';
import { ArticleSection } from '../ArticleSection';
import { StepByStep } from '../StepByStep';
import { InfoCallout } from '../InfoCallout';
import { DataTable } from '../DataTable';
import { IllustrationTroubleshooting } from '../illustrations';
const ACCENT = '#EF4444';
export function Fix003Content() {
  return (
    <ArticleLayout title="Error al subir documentos" subtitle="Soluciones cuando la carga de documentos falla." icon={UploadCloud} accentColor={ACCENT} category="Solución de Problemas" categorySlug="troubleshooting" readTime="2 min" lastUpdated="Febrero 2026" tags={['error','subir','documentos','upload']} tocSections={[{id:'causas',title:'Causas comunes'},{id:'soluciones',title:'Soluciones'}]} relatedArticles={[{title:'Documentos en expedientes',path:'/app/help/article/documentos',readTime:'3 min'}]}>
      <div className="flex justify-center mb-8"><IllustrationTroubleshooting size={150} /></div>
      <p className="text-[15px] text-foreground/80 leading-relaxed">Si un documento no se sube correctamente, revisa estas <strong>causas comunes</strong>.</p>
      <ArticleSection id="causas" title="Causas comunes" icon={FileWarning} accentColor={ACCENT} variant="highlighted">
        <DataTable headers={['Problema','Solución']} rows={[['Archivo demasiado grande (>50MB)','Comprime el archivo o divídelo en partes'],['Formato no soportado','Usa PDF, DOCX, XLSX, PNG, JPG o ZIP'],['Nombre con caracteres especiales','Renombra sin acentos ni símbolos'],['Conexión interrumpida','Reintenta en una red estable']]} />
      </ArticleSection>
      <ArticleSection id="soluciones" title="Soluciones adicionales" icon={CheckCircle} accentColor={ACCENT}>
        <StepByStep accentColor={ACCENT} steps={[
          {title:'Verifica el formato y tamaño',description:'Consulta los límites en la documentación de documentos.'},
          {title:'Prueba con otro navegador',description:'Si el error persiste, prueba desde Chrome actualizado.'},
          {title:'Contacta soporte',description:'Si nada funciona, abre un ticket con el archivo y el error.',tip:'Incluye una captura de pantalla del error para agilizar la resolución.'},
        ]} />
      </ArticleSection>
    </ArticleLayout>
  );
}
