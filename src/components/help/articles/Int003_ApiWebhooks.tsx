import { Code, Key, Webhook } from 'lucide-react';
import { ArticleLayout } from '../ArticleLayout';
import { ArticleSection } from '../ArticleSection';
import { DataTable } from '../DataTable';
import { InfoCallout } from '../InfoCallout';
import { IllustrationIntegrations } from '../illustrations';
const ACCENT = '#8B5CF6';
export function Int003Content() {
  return (
    <ArticleLayout title="API y webhooks" subtitle="Documentación de la API REST de IP-NEXUS." icon={Code} accentColor={ACCENT} category="Integraciones" categorySlug="integraciones" readTime="5 min" lastUpdated="Febrero 2026" tags={['API','webhooks','desarrollo','REST']} tocSections={[{id:'api',title:'API REST'},{id:'webhooks',title:'Webhooks'},{id:'auth',title:'Autenticación'}]} relatedArticles={[{title:'Automatizaciones n8n',path:'/app/help/article/automatizaciones-n8n',readTime:'5 min'}]}>
      <div className="flex justify-center mb-8"><IllustrationIntegrations size={150} /></div>
      <p className="text-[15px] text-foreground/80 leading-relaxed">La API de IP-NEXUS te permite <strong>integrar tu software</strong> con la plataforma y automatizar operaciones.</p>
      <ArticleSection id="api" title="API REST" icon={Code} accentColor={ACCENT} variant="highlighted">
        <DataTable headers={['Endpoint','Método','Descripción']} rows={[['/api/v1/matters','GET/POST','Listar/crear expedientes'],['/api/v1/contacts','GET/POST','Listar/crear contactos'],['/api/v1/deals','GET/POST','Listar/crear deals'],['/api/v1/documents','GET/POST','Listar/subir documentos'],['/api/v1/deadlines','GET','Listar plazos']]} />
        <InfoCallout type="info">La documentación completa con ejemplos está disponible en <strong>app.ip-nexus.com/api/docs</strong>.</InfoCallout>
      </ArticleSection>
      <ArticleSection id="webhooks" title="Webhooks" icon={Webhook} accentColor={ACCENT}>
        <InfoCallout type="info">Configura webhooks en <strong>Configuración → Integraciones → Webhooks</strong>. Recibe notificaciones en tu servidor cuando ocurren eventos: nuevo expediente, cambio de estado, plazo vencido, etc.</InfoCallout>
      </ArticleSection>
      <ArticleSection id="auth" title="Autenticación" icon={Key} accentColor={ACCENT} variant="highlighted">
        <InfoCallout type="warning">La API usa <strong>API Keys</strong>. Genera tu clave en Configuración → Integraciones → API. Nunca compartas tu API Key públicamente.</InfoCallout>
        <InfoCallout type="info">Las API Keys están disponibles a partir del plan <strong>Professional</strong>.</InfoCallout>
      </ArticleSection>
    </ArticleLayout>
  );
}
