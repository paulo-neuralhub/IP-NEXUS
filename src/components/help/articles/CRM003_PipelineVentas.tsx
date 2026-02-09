import { TrendingUp, Settings, Kanban } from 'lucide-react';
import { ArticleLayout } from '../ArticleLayout';
import { ArticleSection } from '../ArticleSection';
import { PipelineVisual } from '../PipelineVisual';
import { StepByStep } from '../StepByStep';
import { InfoCallout } from '../InfoCallout';
import { IllustrationCRM } from '../illustrations';
const ACCENT = '#EC4899';
export function CRM003Content() {
  return (
    <ArticleLayout title="Pipeline de ventas" subtitle="Configura etapas y mueve deals por las fases de venta." icon={TrendingUp} accentColor={ACCENT} category="CRM" categorySlug="crm" readTime="4 min" lastUpdated="Febrero 2026" tags={['pipeline','ventas','deals','oportunidades']} tocSections={[{id:'pipeline',title:'Pipeline predefinido'},{id:'crear',title:'Crear deals'},{id:'personalizar',title:'Personalizar etapas'}]} relatedArticles={[{title:'Gestionar contactos',path:'/app/help/article/gestionar-contactos',readTime:'3 min'}]}>
      <div className="flex justify-center mb-8"><IllustrationCRM size={150} /></div>
      <p className="text-[15px] text-foreground/80 leading-relaxed">El pipeline te permite <strong>visualizar y gestionar</strong> tus oportunidades de negocio desde el primer contacto hasta el cierre.</p>
      <ArticleSection id="pipeline" title="Pipeline predefinido" icon={TrendingUp} accentColor={ACCENT} variant="highlighted">
        <PipelineVisual title="Pipeline de registro de marca" accentColor={ACCENT} stages={[{emoji:'📝',label:'Solicitud'},{emoji:'🔍',label:'Búsqueda'},{emoji:'📄',label:'Preparación'},{emoji:'📤',label:'Presentación'},{emoji:'⏳',label:'Examen'},{emoji:'✅',label:'Concedida'}]} />
      </ArticleSection>
      <ArticleSection id="crear" title="Crear un deal" icon={Kanban} accentColor={ACCENT}>
        <StepByStep accentColor={ACCENT} steps={[
          {title:'Ve a CRM → Pipeline',description:'Verás el tablero Kanban con las etapas.'},
          {title:'Haz click en "Nuevo deal"',description:'Rellena título, valor estimado, contacto asociado y fecha esperada de cierre.'},
          {title:'Arrastra para avanzar',description:'Mueve las tarjetas entre etapas arrastrándolas en el tablero.',tip:'Cada cambio de etapa se registra en el timeline del deal.'},
        ]} />
      </ArticleSection>
      <ArticleSection id="personalizar" title="Personalizar etapas" icon={Settings} accentColor={ACCENT} variant="highlighted">
        <InfoCallout type="tip">Crea pipelines personalizados en <strong>CRM → Configuración → Pipelines</strong>. Puedes tener pipelines separados para marcas, patentes y litigios.</InfoCallout>
        <InfoCallout type="info">Cada etapa puede tener una <strong>probabilidad de cierre</strong> asociada para calcular el pipeline ponderado.</InfoCallout>
      </ArticleSection>
    </ArticleLayout>
  );
}
