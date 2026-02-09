import { Bell, Settings, Mail } from 'lucide-react';
import { ArticleLayout } from '../ArticleLayout';
import { ArticleSection } from '../ArticleSection';
import { StepByStep } from '../StepByStep';
import { InfoCallout } from '../InfoCallout';
import { DataTable } from '../DataTable';
import { IllustrationDashboard } from '../illustrations';
const ACCENT = '#0EA5E9';
export function Docket008Content() {
  return (
    <ArticleLayout title="Alertas automáticas de vencimiento" subtitle="Configura cuándo y cómo recibir alertas antes de que venzan tus plazos." icon={Bell} accentColor={ACCENT} category="Docket & Deadlines" categorySlug="docket" readTime="3 min" lastUpdated="Febrero 2026" tags={['alertas','automáticas','notificaciones','vencimiento']} tocSections={[{id:'canales',title:'Canales de alerta'},{id:'configurar',title:'Configurar'},{id:'escalado',title:'Escalado'}]} relatedArticles={[{title:'Plazos y vencimientos',path:'/app/help/article/plazos-vencimientos',readTime:'3 min'}]}>
      <div className="flex justify-center mb-8"><IllustrationDashboard size={150} /></div>
      <p className="text-[15px] text-foreground/80 leading-relaxed">Las alertas automáticas garantizan que <strong>nunca pierdas un plazo</strong>. Configura los canales y la antelación para cada tipo.</p>
      <ArticleSection id="canales" title="Canales de alerta" icon={Mail} accentColor={ACCENT} variant="highlighted">
        <DataTable headers={['Canal','Descripción','Recomendado para']} rows={[['In-app','Notificación en la plataforma','Plazos internos'],['Email','Correo al responsable','Todos los plazos'],['Push','Notificación del navegador','Plazos urgentes']]} />
      </ArticleSection>
      <ArticleSection id="configurar" title="Configurar alertas" icon={Settings} accentColor={ACCENT}>
        <StepByStep accentColor={ACCENT} steps={[
          {title:'Ve a Configuración → Notificaciones',description:'Encontrarás la sección "Plazos y alertas" con las reglas globales.'},
          {title:'Define la antelación',description:'Selecciona cuántos días antes quieres el aviso. Recomendamos: 30, 7 y 1 día.',tip:'Para renovaciones de marca, añade un recordatorio a 90 días para tener tiempo de contactar al cliente.'},
          {title:'Elige los canales',description:'Selecciona email, in-app o ambos para cada nivel de antelación.'},
        ]} />
      </ArticleSection>
      <ArticleSection id="escalado" title="Escalado automático" icon={Bell} accentColor={ACCENT} variant="highlighted">
        <InfoCallout type="tip">Activa el <strong>escalado</strong> para que si un plazo no se atiende en 48h, se notifique automáticamente al manager del equipo.</InfoCallout>
        <InfoCallout type="warning">El escalado solo funciona si hay un <strong>manager o admin</strong> configurado en la organización.</InfoCallout>
      </ArticleSection>
    </ArticleLayout>
  );
}
