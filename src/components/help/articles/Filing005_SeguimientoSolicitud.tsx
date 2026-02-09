import { Activity, Eye, RefreshCw } from 'lucide-react';
import { ArticleLayout } from '../ArticleLayout';
import { ArticleSection } from '../ArticleSection';
import { PipelineVisual } from '../PipelineVisual';
import { InfoCallout } from '../InfoCallout';
import { IllustrationDashboard } from '../illustrations';
const ACCENT = '#14B8A6';
export function Filing005Content() {
  return (
    <ArticleLayout title="Seguimiento del estado" subtitle="Cómo ver y entender el estado de tus solicitudes en IP-NEXUS." icon={Activity} accentColor={ACCENT} category="Registro y Filing" categorySlug="filing" readTime="3 min" lastUpdated="Febrero 2026" tags={['seguimiento','estado','solicitud','tracking']} tocSections={[{id:'estados',title:'Estados posibles'},{id:'datahub',title:'Data Hub'}]} relatedArticles={[{title:'Proceso de registro',path:'/app/help/article/proceso-registro',readTime:'5 min'}]}>
      <div className="flex justify-center mb-8"><IllustrationDashboard size={150} /></div>
      <p className="text-[15px] text-foreground/80 leading-relaxed">IP-NEXUS actualiza el estado de tus solicitudes <strong>automáticamente</strong> si tienes conectada la oficina en Data Hub.</p>
      <ArticleSection id="estados" title="Estados de solicitud" icon={Eye} accentColor={ACCENT} variant="highlighted">
        <PipelineVisual title="Flujo de una solicitud" accentColor={ACCENT} stages={[{emoji:'📝',label:'Borrador'},{emoji:'📤',label:'Presentada'},{emoji:'🔍',label:'En examen'},{emoji:'📢',label:'Publicada'},{emoji:'⏳',label:'Oposición'},{emoji:'✅',label:'Concedida'}]} />
      </ArticleSection>
      <ArticleSection id="datahub" title="Actualización via Data Hub" icon={RefreshCw} accentColor={ACCENT}>
        <InfoCallout type="tip">Conecta tu cuenta de la <strong>oficina de PI</strong> en Data Hub para que IP-NEXUS sincronice automáticamente los estados y documentos oficiales.</InfoCallout>
        <InfoCallout type="info">Si no tienes Data Hub conectado, puedes actualizar los estados <strong>manualmente</strong> desde la ficha del expediente.</InfoCallout>
      </ArticleSection>
    </ArticleLayout>
  );
}
