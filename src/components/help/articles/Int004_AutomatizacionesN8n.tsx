import { Zap, Settings, Play } from 'lucide-react';
import { ArticleLayout } from '../ArticleLayout';
import { ArticleSection } from '../ArticleSection';
import { StepByStep } from '../StepByStep';
import { InfoCallout } from '../InfoCallout';
import { FeatureGrid } from '../FeatureGrid';
import { IllustrationIntegrations } from '../illustrations';
const ACCENT = '#8B5CF6';
export function Int004Content() {
  return (
    <ArticleLayout title="Automatizaciones con n8n" subtitle="Crea workflows automáticos conectando IP-NEXUS con otras herramientas." icon={Zap} accentColor={ACCENT} category="Integraciones" categorySlug="integraciones" readTime="5 min" lastUpdated="Febrero 2026" tags={['n8n','automatización','workflows']} tocSections={[{id:'que-es',title:'Qué es n8n'},{id:'ejemplos',title:'Ejemplos'},{id:'configurar',title:'Cómo configurar'}]} relatedArticles={[{title:'API y webhooks',path:'/app/help/article/api-webhooks',readTime:'5 min'}]}>
      <div className="flex justify-center mb-8"><IllustrationIntegrations size={150} /></div>
      <p className="text-[15px] text-foreground/80 leading-relaxed">n8n es una plataforma de automatización que permite conectar IP-NEXUS con <strong>+1000 herramientas</strong> sin código.</p>
      <ArticleSection id="que-es" title="¿Qué es n8n?" icon={Zap} accentColor={ACCENT}>
        <InfoCallout type="info">n8n es un herramienta de automatización open source. Crea workflows visuales que conectan IP-NEXUS con Gmail, Slack, Notion, Google Sheets y cientos más.</InfoCallout>
      </ArticleSection>
      <ArticleSection id="ejemplos" title="Ejemplos de automatización" icon={Play} accentColor={ACCENT} variant="highlighted">
        <FeatureGrid features={[
          {emoji:'📧',title:'Email + Expediente',description:'Cuando recibes un email de un cliente, crear una nota en su expediente.',accentColor:'#3B82F6'},
          {emoji:'📊',title:'Informe semanal',description:'Enviar automáticamente un resumen de plazos por Slack cada lunes.',accentColor:'#10B981'},
          {emoji:'💾',title:'Backup automático',description:'Exportar expedientes nuevos a Google Sheets diariamente.',accentColor:'#F59E0B'},
          {emoji:'🔔',title:'Alertas externas',description:'Enviar alertas de vencimiento por Telegram o SMS.',accentColor:'#EF4444'},
        ]} />
      </ArticleSection>
      <ArticleSection id="configurar" title="Cómo configurar" icon={Settings} accentColor={ACCENT}>
        <StepByStep accentColor={ACCENT} steps={[
          {title:'Instala n8n',description:'Usa n8n Cloud (SaaS) o instálalo en tu servidor.'},
          {title:'Configura el nodo IP-NEXUS',description:'Usa tu API Key de IP-NEXUS para conectar n8n.',tip:'IP-NEXUS tiene un nodo oficial en n8n con todas las operaciones disponibles.'},
          {title:'Crea tu workflow',description:'Arrastra nodos y conecta triggers con acciones. Prueba y activa.'},
        ]} />
      </ArticleSection>
    </ArticleLayout>
  );
}
