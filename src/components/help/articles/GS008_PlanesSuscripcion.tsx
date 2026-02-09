import { CreditCard, Star, ArrowUpCircle, HelpCircle } from 'lucide-react';
import { ArticleLayout } from '../ArticleLayout';
import { ArticleSection } from '../ArticleSection';
import { DataTable } from '../DataTable';
import { InfoCallout } from '../InfoCallout';
import { FeatureGrid } from '../FeatureGrid';
import { IllustrationPlans } from '../illustrations';

const ACCENT = '#F59E0B';

export function GS008Content() {
  return (
    <ArticleLayout title="Planes y suscripción" subtitle="Compara los planes disponibles y elige el que mejor se adapta a tu despacho." icon={CreditCard} accentColor={ACCENT} category="Primeros Pasos" categorySlug="getting-started" readTime="3 min" lastUpdated="Febrero 2026" tags={['planes','precio','suscripción','upgrade']} tocSections={[{id:'planes',title:'Planes disponibles'},{id:'comparativa',title:'Comparativa'},{id:'addons',title:'Add-ons'},{id:'faq',title:'Preguntas frecuentes'}]} relatedArticles={[{title:'Cambiar de plan',path:'/app/help/article/cambiar-plan',readTime:'2 min'},{title:'Métodos de pago',path:'/app/help/article/metodos-pago',readTime:'2 min'}]}>
      <div className="flex justify-center mb-8"><IllustrationPlans size={150} /></div>
      <p className="text-[15px] text-foreground/80 leading-relaxed">IP-NEXUS ofrece planes flexibles que crecen con tu despacho. Todos incluyen los módulos core; los planes superiores desbloquean funcionalidades avanzadas.</p>

      <ArticleSection id="planes" title="Planes disponibles" icon={Star} accentColor={ACCENT} variant="highlighted">
        <FeatureGrid features={[
          {emoji:'🚀',title:'Starter — €99/mes',description:'Ideal para empezar.',items:['50 expedientes','2 usuarios','Data Hub básico','Soporte email'],accentColor:'#3B82F6'},
          {emoji:'⭐',title:'Professional — €249/mes',description:'Para despachos en crecimiento.',items:['500 expedientes','10 usuarios','Spider avanzado','API access'],accentColor:'#F59E0B'},
          {emoji:'🏢',title:'Business — €499/mes',description:'Para equipos grandes.',items:['2.000 expedientes','25 usuarios','CRM + Marketing','Soporte prioritario'],accentColor:'#8B5CF6'},
          {emoji:'🌐',title:'Enterprise — Personalizado',description:'Solución a medida.',items:['Ilimitado','Todos los módulos','SLA garantizado','Account manager'],accentColor:'#10B981'},
        ]} />
      </ArticleSection>

      <ArticleSection id="comparativa" title="Comparativa detallada" icon={CreditCard} accentColor={ACCENT}>
        <DataTable headers={['Característica','Starter','Professional','Business','Enterprise']} rows={[['Expedientes','50','500','2.000','∞'],['Usuarios','2','10','25','∞'],['Genius AI','10 consultas/mes','Ilimitado','Ilimitado','Ilimitado'],['CRM','❌','Básico','Completo','Completo'],['Marketing','❌','❌','✅','✅'],['Soporte','Email','Chat','Prioritario','Dedicado']]} />
      </ArticleSection>

      <ArticleSection id="addons" title="Add-ons disponibles" icon={ArrowUpCircle} accentColor={ACCENT} variant="highlighted">
        <DataTable headers={['Add-on','Precio','Descripción']} rows={[['CRM','+€99/mes','Gestión avanzada de contactos y pipelines'],['Marketing','+€149/mes','Email marketing y automatizaciones'],['Market','+€49/mes','Acceso al marketplace de servicios'],['Genius España','+€79/mes','IA con conocimiento legal español'],['Genius Europa','+€149/mes','IA con conocimiento legal europeo'],['Genius Global','+€249/mes','IA con conocimiento legal global']]} />
        <InfoCallout type="tip">Los add-ons se pueden activar y desactivar en cualquier momento desde <strong>Configuración → Suscripción</strong>.</InfoCallout>
      </ArticleSection>

      <ArticleSection id="faq" title="Preguntas frecuentes" icon={HelpCircle} accentColor={ACCENT}>
        <InfoCallout type="info">¿Puedo cambiar de plan? — <strong>Sí</strong>, puedes upgradar o downgradar en cualquier momento. El cambio se aplica de forma prorrateada.</InfoCallout>
        <InfoCallout type="info">¿Hay compromiso? — <strong>No</strong>. Todos los planes son mensuales sin permanencia. También hay opción anual con 2 meses gratis.</InfoCallout>
        <InfoCallout type="info">¿Hay descuento por ONG/Academia? — <strong>Sí</strong>. Contacta con ventas para tarifas especiales.</InfoCallout>
      </ArticleSection>
    </ArticleLayout>
  );
}
