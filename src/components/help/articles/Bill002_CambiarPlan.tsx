import { ArrowUpCircle, Settings, RefreshCw } from 'lucide-react';
import { ArticleLayout } from '../ArticleLayout';
import { ArticleSection } from '../ArticleSection';
import { StepByStep } from '../StepByStep';
import { InfoCallout } from '../InfoCallout';
import { IllustrationBilling } from '../illustrations';
const ACCENT = '#F59E0B';
export function Bill002Content() {
  return (
    <ArticleLayout title="Cambiar de plan" subtitle="Cómo upgradar, downgradar o cambiar de facturación." icon={ArrowUpCircle} accentColor={ACCENT} category="Facturación" categorySlug="facturacion" readTime="2 min" lastUpdated="Febrero 2026" tags={['cambiar','plan','upgrade','downgrade']} tocSections={[{id:'upgrade',title:'Upgrade'},{id:'downgrade',title:'Downgrade'}]} relatedArticles={[{title:'Planes y precios',path:'/app/help/article/planes-precios',readTime:'3 min'}]}>
      <div className="flex justify-center mb-8"><IllustrationBilling size={150} /></div>
      <p className="text-[15px] text-foreground/80 leading-relaxed">Puedes cambiar de plan <strong>en cualquier momento</strong>, sin compromiso.</p>
      <ArticleSection id="upgrade" title="Upgradar tu plan" icon={ArrowUpCircle} accentColor={ACCENT} variant="highlighted">
        <StepByStep accentColor={ACCENT} steps={[
          {title:'Ve a Configuración → Suscripción',description:'Haz click en "Cambiar plan".'},
          {title:'Selecciona el nuevo plan',description:'Elige el plan superior. El cambio se aplica inmediatamente.'},
          {title:'Pago prorrateado',description:'Solo pagas la diferencia proporcional hasta el final del ciclo.',tip:'Las nuevas funcionalidades están disponibles al instante.'},
        ]} />
      </ArticleSection>
      <ArticleSection id="downgrade" title="Downgradar" icon={RefreshCw} accentColor={ACCENT}>
        <InfoCallout type="info">El downgrade se aplica al <strong>final del período de facturación actual</strong>. No pierdes acceso hasta entonces.</InfoCallout>
        <InfoCallout type="warning">Si tienes más expedientes o usuarios de los que permite el plan inferior, deberás <strong>reducirlos antes</strong> de que se aplique el cambio.</InfoCallout>
      </ArticleSection>
    </ArticleLayout>
  );
}
