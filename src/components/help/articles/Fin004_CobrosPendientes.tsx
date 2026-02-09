import { AlertCircle, Bell, CheckCircle } from 'lucide-react';
import { ArticleLayout } from '../ArticleLayout';
import { ArticleSection } from '../ArticleSection';
import { StepByStep } from '../StepByStep';
import { InfoCallout } from '../InfoCallout';
import { IllustrationFinance } from '../illustrations';
const ACCENT = '#14B8A6';
export function Fin004Content() {
  return (
    <ArticleLayout title="Control de cobros pendientes" subtitle="Monitoriza facturas pendientes y envía recordatorios." icon={AlertCircle} accentColor={ACCENT} category="Costes" categorySlug="costes" readTime="3 min" lastUpdated="Febrero 2026" tags={['cobros','pendientes','impagados','recordatorio']} tocSections={[{id:'panel',title:'Panel de cobros'},{id:'recordatorios',title:'Recordatorios'}]} relatedArticles={[{title:'Crear facturas',path:'/app/help/article/crear-facturas',readTime:'4 min'}]}>
      <div className="flex justify-center mb-8"><IllustrationFinance size={150} /></div>
      <p className="text-[15px] text-foreground/80 leading-relaxed">El panel de cobros pendientes te ayuda a <strong>cobrar a tiempo</strong> con recordatorios automáticos.</p>
      <ArticleSection id="panel" title="Panel de cobros" icon={AlertCircle} accentColor={ACCENT} variant="highlighted">
        <InfoCallout type="info">Ve todas las facturas pendientes organizadas por <strong>antigüedad</strong>: al día, 1-30 días, 31-60 días y más de 60 días.</InfoCallout>
        <InfoCallout type="warning">Las facturas con más de 60 días se marcan como <strong>en riesgo</strong> y se destacan en rojo.</InfoCallout>
      </ArticleSection>
      <ArticleSection id="recordatorios" title="Enviar recordatorios" icon={Bell} accentColor={ACCENT}>
        <StepByStep accentColor={ACCENT} steps={[
          {title:'Selecciona facturas pendientes',description:'Marca las facturas a las que quieres enviar recordatorio.'},
          {title:'Haz click en "Enviar recordatorio"',description:'Se envía un email al cliente con el detalle de las facturas pendientes.',tip:'Configura recordatorios automáticos en Configuración → Finance → Recordatorios.'},
        ]} />
        <InfoCallout type="tip">Los recordatorios automáticos se envían a los <strong>7, 15 y 30 días</strong> de vencimiento. Puedes personalizar estos plazos.</InfoCallout>
      </ArticleSection>
    </ArticleLayout>
  );
}
