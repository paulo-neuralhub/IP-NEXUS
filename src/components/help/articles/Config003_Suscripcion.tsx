import { CreditCard, ArrowUpCircle, Receipt } from 'lucide-react';
import { ArticleLayout } from '../ArticleLayout';
import { ArticleSection } from '../ArticleSection';
import { StepByStep } from '../StepByStep';
import { InfoCallout } from '../InfoCallout';
import { IllustrationBilling } from '../illustrations';
const ACCENT = '#64748B';
export function Config003Content() {
  return (
    <ArticleLayout title="Suscripción y facturación" subtitle="Gestiona tu plan, método de pago y accede a tus facturas." icon={CreditCard} accentColor={ACCENT} category="Configuración" categorySlug="configuracion" readTime="3 min" lastUpdated="Febrero 2026" tags={['suscripción','facturación','plan','pago']} tocSections={[{id:'plan',title:'Tu plan actual'},{id:'pago',title:'Método de pago'},{id:'facturas',title:'Tus facturas'}]} relatedArticles={[{title:'Planes y precios',path:'/app/help/article/planes-precios',readTime:'3 min'}]}>
      <div className="flex justify-center mb-8"><IllustrationBilling size={150} /></div>
      <p className="text-[15px] text-foreground/80 leading-relaxed">Gestiona tu suscripción a IP-NEXUS desde <strong>Configuración → Suscripción</strong>.</p>
      <ArticleSection id="plan" title="Tu plan actual" icon={ArrowUpCircle} accentColor={ACCENT} variant="highlighted">
        <StepByStep accentColor={ACCENT} steps={[
          {title:'Ve a Configuración → Suscripción',description:'Verás tu plan actual, fecha de renovación y uso.'},
          {title:'Cambiar de plan',description:'Haz click en "Cambiar plan" para ver las opciones disponibles.',tip:'Los upgrades se aplican inmediatamente. Los downgrades al final del período de facturación.'},
        ]} />
      </ArticleSection>
      <ArticleSection id="pago" title="Método de pago" icon={CreditCard} accentColor={ACCENT}>
        <InfoCallout type="info">IP-NEXUS acepta <strong>tarjeta de crédito/débito</strong> (Visa, Mastercard, Amex) y <strong>domiciliación SEPA</strong> (para planes anuales).</InfoCallout>
      </ArticleSection>
      <ArticleSection id="facturas" title="Tus facturas" icon={Receipt} accentColor={ACCENT} variant="highlighted">
        <InfoCallout type="tip">Descarga tus facturas en PDF desde <strong>Configuración → Suscripción → Historial de pagos</strong>.</InfoCallout>
        <InfoCallout type="info">Las facturas incluyen los datos fiscales de tu organización automáticamente.</InfoCallout>
      </ArticleSection>
    </ArticleLayout>
  );
}
