import { Plug, Globe, Zap } from 'lucide-react';
import { ArticleLayout } from '../ArticleLayout';
import { ArticleSection } from '../ArticleSection';
import { FeatureGrid } from '../FeatureGrid';
import { InfoCallout } from '../InfoCallout';
import { IllustrationIntegrations } from '../illustrations';
const ACCENT = '#8B5CF6';
export function Int001Content() {
  return (
    <ArticleLayout title="Integraciones disponibles" subtitle="Conecta IP-NEXUS con tus herramientas favoritas." icon={Plug} accentColor={ACCENT} category="Integraciones" categorySlug="integraciones" readTime="3 min" lastUpdated="Febrero 2026" tags={['integraciones','conectar','servicios','API']} tocSections={[{id:'disponibles',title:'Integraciones'},{id:'solicitar',title:'Solicitar nueva'}]} relatedArticles={[{title:'Google Workspace',path:'/app/help/article/google-workspace',readTime:'3 min'},{title:'API y webhooks',path:'/app/help/article/api-webhooks',readTime:'5 min'}]}>
      <div className="flex justify-center mb-8"><IllustrationIntegrations size={150} /></div>
      <p className="text-[15px] text-foreground/80 leading-relaxed">IP-NEXUS se conecta con las herramientas que ya usas para <strong>automatizar y centralizar</strong> tu flujo de trabajo.</p>
      <ArticleSection id="disponibles" title="Integraciones disponibles" icon={Globe} accentColor={ACCENT} variant="highlighted">
        <FeatureGrid features={[
          {emoji:'📧',title:'Google Workspace',description:'Gmail, Calendar, Drive. Sincronización bidireccional.',accentColor:'#EA4335'},
          {emoji:'📅',title:'Microsoft 365',description:'Outlook, Teams, OneDrive. Email y calendario.',accentColor:'#0078D4'},
          {emoji:'💳',title:'Stripe',description:'Pagos y facturación automática.',accentColor:'#635BFF'},
          {emoji:'⚡',title:'n8n / Zapier',description:'Automatizaciones con +1000 herramientas.',accentColor:'#FF6D5A'},
          {emoji:'💬',title:'WhatsApp Business',description:'Comunicación con clientes desde el CRM.',accentColor:'#25D366'},
          {emoji:'🔌',title:'API REST',description:'Integración personalizada con tu software.',accentColor:'#8B5CF6'},
        ]} />
      </ArticleSection>
      <ArticleSection id="solicitar" title="Solicitar una nueva integración" icon={Zap} accentColor={ACCENT}>
        <InfoCallout type="tip">¿Necesitas una integración que no existe? <strong>Contacta con soporte</strong> o usa la API REST para crear tu propia conexión.</InfoCallout>
      </ArticleSection>
    </ArticleLayout>
  );
}
