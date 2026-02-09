import { Clock, Bell, AlertTriangle } from 'lucide-react';
import { ArticleLayout } from '../ArticleLayout';
import { ArticleSection } from '../ArticleSection';
import { StepByStep } from '../StepByStep';
import { InfoCallout } from '../InfoCallout';
import { DataTable } from '../DataTable';
import { IllustrationDashboard } from '../illustrations';
const ACCENT = '#0EA5E9';
export function Docket007Content() {
  return (
    <ArticleLayout title="Configurar plazos y vencimientos" subtitle="Configura plazos legales, vencimientos y renovaciones en tus expedientes." icon={Clock} accentColor={ACCENT} category="Docket & Deadlines" categorySlug="docket" readTime="3 min" lastUpdated="Febrero 2026" tags={['plazos','vencimientos','renovación','deadline']} tocSections={[{id:'tipos',title:'Tipos de plazos'},{id:'crear',title:'Crear plazos'},{id:'automaticos',title:'Plazos automáticos'}]} relatedArticles={[{title:'Alertas de vencimiento',path:'/app/help/article/alertas-vencimiento',readTime:'3 min'},{title:'Configurar alertas',path:'/app/help/article/configurar-alertas',readTime:'4 min'}]}>
      <div className="flex justify-center mb-8"><IllustrationDashboard size={150} /></div>
      <p className="text-[15px] text-foreground/80 leading-relaxed">Los plazos son el <strong>componente más crítico</strong> de la gestión de PI. IP-NEXUS automatiza su cálculo y seguimiento.</p>
      <ArticleSection id="tipos" title="Tipos de plazos" icon={Clock} accentColor={ACCENT} variant="highlighted">
        <DataTable headers={['Tipo','Descripción','Ejemplo']} rows={[['Legal','Impuesto por ley/oficina','Plazo de oposición'],['Interno','Definido por tu equipo','Revisión de documentos'],['Recurrente','Renovaciones periódicas','Anualidad de patente'],['Urgente','Prioridad alta','Respuesta a requerimiento']]} />
      </ArticleSection>
      <ArticleSection id="crear" title="Crear un plazo" icon={Bell} accentColor={ACCENT}>
        <StepByStep accentColor={ACCENT} steps={[
          {title:'Abre la pestaña Plazos',description:'Dentro del expediente, ve a la pestaña "Plazos".'},
          {title:'Haz click en "Añadir plazo"',description:'Selecciona el tipo, fecha límite y responsable.'},
          {title:'Configura recordatorios',description:'Define cuántos días antes quieres recibir alertas: 30, 15, 7 y 1 día antes.',tip:'Para plazos críticos, activa las alertas por email además de la notificación in-app.'},
        ]} />
      </ArticleSection>
      <ArticleSection id="automaticos" title="Plazos automáticos" icon={AlertTriangle} accentColor={ACCENT} variant="highlighted">
        <InfoCallout type="info">IP-NEXUS calcula automáticamente las fechas de <strong>renovación y anualidades</strong> según la jurisdicción y tipo de PI.</InfoCallout>
        <InfoCallout type="warning">Los plazos automáticos son orientativos. Siempre verifica con la legislación vigente de cada jurisdicción.</InfoCallout>
      </ArticleSection>
    </ArticleLayout>
  );
}
