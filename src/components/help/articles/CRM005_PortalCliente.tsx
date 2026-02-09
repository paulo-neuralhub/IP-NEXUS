import { ExternalLink, Shield, Eye } from 'lucide-react';
import { ArticleLayout } from '../ArticleLayout';
import { ArticleSection } from '../ArticleSection';
import { StepByStep } from '../StepByStep';
import { InfoCallout } from '../InfoCallout';
import { FeatureGrid } from '../FeatureGrid';
import { IllustrationCRM } from '../illustrations';
const ACCENT = '#EC4899';
export function CRM005Content() {
  return (
    <ArticleLayout title="Portal de cliente" subtitle="Ofrece a tus clientes un portal donde ver el estado de sus expedientes." icon={ExternalLink} accentColor={ACCENT} category="CRM" categorySlug="crm" readTime="4 min" lastUpdated="Febrero 2026" tags={['portal','cliente','acceso','seguimiento']} tocSections={[{id:'que-es',title:'Qué es'},{id:'activar',title:'Cómo activar'},{id:'funciones',title:'Funciones'}]} relatedArticles={[{title:'Introducción al CRM',path:'/app/help/article/introduccion-crm',readTime:'3 min'}]}>
      <div className="flex justify-center mb-8"><IllustrationCRM size={150} /></div>
      <p className="text-[15px] text-foreground/80 leading-relaxed">El portal de cliente permite que tus clientes <strong>consulten el estado de sus expedientes</strong> sin tener que contactarte.</p>
      <ArticleSection id="que-es" title="¿Qué es el portal?" icon={Eye} accentColor={ACCENT}>
        <InfoCallout type="info">Es un espacio seguro donde tus clientes ven sus expedientes, documentos compartidos y actualizaciones. <strong>No necesitan licencia de IP-NEXUS</strong>.</InfoCallout>
      </ArticleSection>
      <ArticleSection id="activar" title="Cómo activar el portal" icon={Shield} accentColor={ACCENT} variant="highlighted">
        <StepByStep accentColor={ACCENT} steps={[
          {title:'Ve a Configuración → Portal de cliente',description:'Activa el portal y personaliza el aspecto con tu logo.'},
          {title:'Invita a un cliente',description:'Desde la ficha del contacto, haz click en "Invitar al portal". Recibirá un email con acceso.'},
          {title:'Configura la visibilidad',description:'Elige qué información ve cada cliente: expedientes, documentos, plazos, costes.',tip:'Puedes personalizar la visibilidad por contacto o aplicar reglas globales.'},
        ]} />
      </ArticleSection>
      <ArticleSection id="funciones" title="Qué ve el cliente" icon={ExternalLink} accentColor={ACCENT}>
        <FeatureGrid features={[
          {emoji:'📁',title:'Expedientes',description:'Estado actual y timeline de sus marcas/patentes.',accentColor:'#0EA5E9'},
          {emoji:'📎',title:'Documentos',description:'Documentos que tú compartas con ellos.',accentColor:'#10B981'},
          {emoji:'💬',title:'Mensajes',description:'Canal de comunicación directo contigo.',accentColor:'#8B5CF6'},
          {emoji:'📅',title:'Plazos',description:'Próximos vencimientos y renovaciones.',accentColor:'#F59E0B'},
        ]} />
      </ArticleSection>
    </ArticleLayout>
  );
}
