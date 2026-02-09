import { Bell, Mail, Smartphone } from 'lucide-react';
import { ArticleLayout } from '../ArticleLayout';
import { ArticleSection } from '../ArticleSection';
import { DataTable } from '../DataTable';
import { InfoCallout } from '../InfoCallout';
import { IllustrationSettings } from '../illustrations';
const ACCENT = '#64748B';
export function Config005Content() {
  return (
    <ArticleLayout title="Notificaciones y preferencias" subtitle="Configura qué notificaciones recibir y por qué canal." icon={Bell} accentColor={ACCENT} category="Configuración" categorySlug="configuracion" readTime="2 min" lastUpdated="Febrero 2026" tags={['notificaciones','preferencias','email','alertas']} tocSections={[{id:'tipos',title:'Tipos de notificación'},{id:'canales',title:'Canales'}]} relatedArticles={[{title:'Alertas de vencimiento',path:'/app/help/article/alertas-vencimiento',readTime:'3 min'}]}>
      <div className="flex justify-center mb-8"><IllustrationSettings size={150} /></div>
      <p className="text-[15px] text-foreground/80 leading-relaxed">Controla <strong>qué notificaciones recibes</strong> para no perderte nada importante sin saturarte.</p>
      <ArticleSection id="tipos" title="Tipos de notificación" icon={Bell} accentColor={ACCENT} variant="highlighted">
        <DataTable headers={['Tipo','Descripción','Default']} rows={[['Plazos','Vencimientos próximos','✅ Email + App'],['Expedientes','Cambios de estado','✅ App'],['CRM','Nuevas actividades','✅ App'],['Equipo','Menciones y asignaciones','✅ Email + App'],['Sistema','Actualizaciones, mantenimiento','✅ Email']]} />
      </ArticleSection>
      <ArticleSection id="canales" title="Canales disponibles" icon={Mail} accentColor={ACCENT}>
        <InfoCallout type="info">Canales disponibles: <strong>In-app, Email y Push del navegador</strong>. Configura cada tipo individualmente.</InfoCallout>
        <InfoCallout type="tip">Ve a <strong>Configuración → Notificaciones</strong> para activar/desactivar cada combinación de tipo y canal.</InfoCallout>
      </ArticleSection>
    </ArticleLayout>
  );
}
