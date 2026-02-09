import { Mail, Calendar, HardDrive } from 'lucide-react';
import { ArticleLayout } from '../ArticleLayout';
import { ArticleSection } from '../ArticleSection';
import { StepByStep } from '../StepByStep';
import { InfoCallout } from '../InfoCallout';
import { IllustrationIntegrations } from '../illustrations';
const ACCENT = '#8B5CF6';
export function Int002Content() {
  return (
    <ArticleLayout title="Conectar con Google Workspace" subtitle="Sincroniza calendario, emails y documentos de Google." icon={Mail} accentColor={ACCENT} category="Integraciones" categorySlug="integraciones" readTime="3 min" lastUpdated="Febrero 2026" tags={['google','gmail','calendar','drive']} tocSections={[{id:'conectar',title:'Cómo conectar'},{id:'funciones',title:'Qué se sincroniza'}]} relatedArticles={[{title:'Integraciones disponibles',path:'/app/help/article/integraciones-disponibles',readTime:'3 min'}]}>
      <div className="flex justify-center mb-8"><IllustrationIntegrations size={150} /></div>
      <p className="text-[15px] text-foreground/80 leading-relaxed">Conecta tu cuenta de Google para sincronizar <strong>emails, calendario y documentos</strong> con IP-NEXUS.</p>
      <ArticleSection id="conectar" title="Cómo conectar" icon={Mail} accentColor={ACCENT} variant="highlighted">
        <StepByStep accentColor={ACCENT} steps={[
          {title:'Ve a Configuración → Integraciones',description:'Busca "Google Workspace" en la lista.'},
          {title:'Haz click en "Conectar"',description:'Inicia sesión con tu cuenta de Google y autoriza los permisos.'},
          {title:'Selecciona qué sincronizar',description:'Elige si quieres sincronizar Gmail, Calendar, Drive o todos.',tip:'Puedes conectar varias cuentas de Google (personal y profesional).'},
        ]} />
      </ArticleSection>
      <ArticleSection id="funciones" title="Qué se sincroniza" icon={Calendar} accentColor={ACCENT}>
        <InfoCallout type="info"><strong>Gmail</strong>: Emails con contactos del CRM aparecen en su timeline.</InfoCallout>
        <InfoCallout type="info"><strong>Calendar</strong>: Reuniones y plazos se sincronizan bidireccionalmente.</InfoCallout>
        <InfoCallout type="info"><strong>Drive</strong>: Adjunta documentos de Drive directamente a expedientes.</InfoCallout>
      </ArticleSection>
    </ArticleLayout>
  );
}
