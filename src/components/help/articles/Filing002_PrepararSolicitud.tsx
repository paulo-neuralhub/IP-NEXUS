import { ClipboardList, CheckSquare, FileText } from 'lucide-react';
import { ArticleLayout } from '../ArticleLayout';
import { ArticleSection } from '../ArticleSection';
import { StepByStep } from '../StepByStep';
import { InfoCallout } from '../InfoCallout';
import { InteractiveChecklist } from '../InteractiveChecklist';
import { IllustrationDocuments } from '../illustrations';
const ACCENT = '#14B8A6';
export function Filing002Content() {
  return (
    <ArticleLayout title="Preparar una solicitud de marca" subtitle="Checklist completo para preparar la documentación antes de solicitar." icon={ClipboardList} accentColor={ACCENT} category="Registro y Filing" categorySlug="filing" readTime="6 min" lastUpdated="Febrero 2026" tags={['solicitud','preparar','documentación','checklist']} tocSections={[{id:'checklist',title:'Checklist'},{id:'pasos',title:'Paso a paso'}]} relatedArticles={[{title:'Proceso de registro',path:'/app/help/article/proceso-registro',readTime:'5 min'},{title:'Clases Niza',path:'/app/help/article/clases-niza',readTime:'7 min'}]}>
      <div className="flex justify-center mb-8"><IllustrationDocuments size={150} /></div>
      <p className="text-[15px] text-foreground/80 leading-relaxed">Una buena preparación evita rechazos y retrasos. Usa este <strong>checklist</strong> para asegurarte de tener todo listo.</p>
      <ArticleSection id="checklist" title="Checklist de preparación" icon={CheckSquare} accentColor={ACCENT} variant="highlighted">
        <InteractiveChecklist items={[
          {label:'Denominación de marca definida'},
          {label:'Logo en formato vectorial (si aplica)'},
          {label:'Clases de Niza seleccionadas'},
          {label:'Descripción de productos/servicios'},
          {label:'Datos del titular completos'},
          {label:'Representante designado'},
          {label:'Búsqueda de anterioridades realizada'},
          {label:'Poder notarial firmado (si aplica)'},
        ]} />
      </ArticleSection>
      <ArticleSection id="pasos" title="Paso a paso" icon={FileText} accentColor={ACCENT}>
        <StepByStep accentColor={ACCENT} steps={[
          {title:'Define la marca',description:'Decide si será denominativa (solo texto), figurativa (logo) o mixta. Esto afecta a los documentos necesarios.'},
          {title:'Busca anterioridades',description:'Usa NEXUS Genius para un análisis automático o consulta las bases de datos de las oficinas.',warning:'Presentar sin buscar anterioridades es muy arriesgado. Puedes perder las tasas de solicitud.'},
          {title:'Selecciona clases',description:'Elige las clases de Niza que cubren tus productos/servicios. IP-NEXUS sugiere clases basándose en tu descripción.'},
          {title:'Reúne documentos',description:'Prepara logo, poder notarial, documentos de prioridad (si aplica) y cualquier anexo necesario.'},
          {title:'Revisa todo',description:'Verifica que toda la información es correcta. Una vez presentada, no se pueden modificar las clases.',tip:'Pide a un colega que revise la solicitud antes de enviarla.'},
        ]} />
      </ArticleSection>
    </ArticleLayout>
  );
}
