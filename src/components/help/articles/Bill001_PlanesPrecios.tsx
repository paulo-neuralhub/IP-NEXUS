import { CreditCard, Star, Zap } from 'lucide-react';
import { ArticleLayout } from '../ArticleLayout';
import { ArticleSection } from '../ArticleSection';
import { DataTable } from '../DataTable';
import { FeatureGrid } from '../FeatureGrid';
import { InfoCallout } from '../InfoCallout';
import { IllustrationPlans } from '../illustrations';
const ACCENT = '#F59E0B';
export function Bill001Content() {
  return (
    <ArticleLayout title="Planes y precios" subtitle="Compara los planes Starter, Professional, Business y Enterprise." icon={CreditCard} accentColor={ACCENT} category="Facturación" categorySlug="facturacion" readTime="3 min" lastUpdated="Febrero 2026" tags={['planes','precios','starter','professional']} tocSections={[{id:'planes',title:'Planes'},{id:'comparativa',title:'Comparativa'}]} relatedArticles={[{title:'Cambiar de plan',path:'/app/help/article/cambiar-plan',readTime:'2 min'},{title:'Métodos de pago',path:'/app/help/article/metodos-pago',readTime:'2 min'}]}>
      <div className="flex justify-center mb-8"><IllustrationPlans size={150} /></div>
      <p className="text-[15px] text-foreground/80 leading-relaxed">IP-NEXUS ofrece planes <strong>flexibles y sin permanencia</strong> para todo tipo de despachos.</p>
      <ArticleSection id="planes" title="Planes disponibles" icon={Star} accentColor={ACCENT} variant="highlighted">
        <FeatureGrid features={[
          {emoji:'🚀',title:'Starter — €99/mes',description:'Para empezar.',items:['50 expedientes','2 usuarios','Soporte email'],accentColor:'#3B82F6'},
          {emoji:'⭐',title:'Professional — €249/mes',description:'Para crecer.',items:['500 expedientes','10 usuarios','API access'],accentColor:'#F59E0B'},
          {emoji:'🏢',title:'Business — €499/mes',description:'Para equipos.',items:['2.000 expedientes','25 usuarios','CRM + Marketing'],accentColor:'#8B5CF6'},
          {emoji:'🌐',title:'Enterprise',description:'A medida.',items:['Ilimitado','SLA garantizado','Account manager'],accentColor:'#10B981'},
        ]} />
      </ArticleSection>
      <ArticleSection id="comparativa" title="Comparativa" icon={CreditCard} accentColor={ACCENT}>
        <DataTable headers={['','Starter','Professional','Business','Enterprise']} rows={[['Precio','€99/mes','€249/mes','€499/mes','Custom'],['Expedientes','50','500','2.000','∞'],['Usuarios','2','10','25','∞'],['CRM','❌','Básico','Completo','Completo'],['Soporte','Email','Chat','Prioritario','Dedicado']]} />
        <InfoCallout type="tip">Ahorra <strong>2 meses gratis</strong> con la facturación anual.</InfoCallout>
      </ArticleSection>
    </ArticleLayout>
  );
}
