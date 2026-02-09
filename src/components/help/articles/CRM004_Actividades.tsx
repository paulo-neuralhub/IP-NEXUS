import { Phone, Mail, Calendar } from 'lucide-react';
import { ArticleLayout } from '../ArticleLayout';
import { ArticleSection } from '../ArticleSection';
import { FeatureGrid } from '../FeatureGrid';
import { StepByStep } from '../StepByStep';
import { InfoCallout } from '../InfoCallout';
import { IllustrationCRM } from '../illustrations';
const ACCENT = '#EC4899';
export function CRM004Content() {
  return (
    <ArticleLayout title="Actividades: llamadas, emails y reuniones" subtitle="Registra todas las interacciones con tus contactos." icon={Phone} accentColor={ACCENT} category="CRM" categorySlug="crm" readTime="3 min" lastUpdated="Febrero 2026" tags={['actividades','llamadas','emails','reuniones']} tocSections={[{id:'tipos',title:'Tipos de actividad'},{id:'registrar',title:'Registrar actividad'}]} relatedArticles={[{title:'Pipeline de ventas',path:'/app/help/article/pipeline-ventas',readTime:'4 min'}]}>
      <div className="flex justify-center mb-8"><IllustrationCRM size={150} /></div>
      <p className="text-[15px] text-foreground/80 leading-relaxed">El timeline de actividades mantiene un <strong>historial completo</strong> de toda interacción con cada contacto.</p>
      <ArticleSection id="tipos" title="Tipos de actividad" icon={Phone} accentColor={ACCENT} variant="highlighted">
        <FeatureGrid features={[
          {emoji:'📞',title:'Llamada',description:'Registra llamadas con notas, duración y resultado.',accentColor:'#3B82F6'},
          {emoji:'📧',title:'Email',description:'Emails enviados y recibidos sincronizados.',accentColor:'#10B981'},
          {emoji:'📅',title:'Reunión',description:'Reuniones con fecha, asistentes y acta.',accentColor:'#8B5CF6'},
          {emoji:'📝',title:'Nota',description:'Notas internas sobre el contacto o deal.',accentColor:'#F59E0B'},
          {emoji:'💬',title:'WhatsApp',description:'Mensajes de WhatsApp Business.',accentColor:'#22C55E'},
          {emoji:'📋',title:'Tarea',description:'Tareas pendientes con fecha y asignado.',accentColor:'#EF4444'},
        ]} />
      </ArticleSection>
      <ArticleSection id="registrar" title="Registrar una actividad" icon={Calendar} accentColor={ACCENT}>
        <StepByStep accentColor={ACCENT} steps={[
          {title:'Abre el contacto o deal',description:'Navega a la ficha del contacto o deal.'},
          {title:'Haz click en "Nueva actividad"',description:'Selecciona el tipo y completa los detalles.'},
          {title:'Guarda',description:'La actividad aparece en el timeline del contacto y del deal vinculado.',tip:'Las actividades se muestran en orden cronológico con iconos de color para cada tipo.'},
        ]} />
        <InfoCallout type="tip">Si tienes conectado tu <strong>email o calendario</strong>, las actividades se registran automáticamente.</InfoCallout>
      </ArticleSection>
    </ArticleLayout>
  );
}
