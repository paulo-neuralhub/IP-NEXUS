import { Wallet, CreditCard, Shield } from 'lucide-react';
import { ArticleLayout } from '../ArticleLayout';
import { ArticleSection } from '../ArticleSection';
import { DataTable } from '../DataTable';
import { InfoCallout } from '../InfoCallout';
import { IllustrationBilling } from '../illustrations';
const ACCENT = '#F59E0B';
export function Bill003Content() {
  return (
    <ArticleLayout title="Métodos de pago" subtitle="Métodos de pago aceptados y cómo actualizar tu información." icon={Wallet} accentColor={ACCENT} category="Facturación" categorySlug="facturacion" readTime="2 min" lastUpdated="Febrero 2026" tags={['pago','tarjeta','SEPA','transferencia']} tocSections={[{id:'metodos',title:'Métodos aceptados'},{id:'actualizar',title:'Actualizar datos'}]} relatedArticles={[{title:'Planes y precios',path:'/app/help/article/planes-precios',readTime:'3 min'}]}>
      <div className="flex justify-center mb-8"><IllustrationBilling size={150} /></div>
      <p className="text-[15px] text-foreground/80 leading-relaxed">IP-NEXUS acepta varios <strong>métodos de pago seguros</strong> para tu comodidad.</p>
      <ArticleSection id="metodos" title="Métodos aceptados" icon={CreditCard} accentColor={ACCENT} variant="highlighted">
        <DataTable headers={['Método','Disponibilidad','Notas']} rows={[['Visa / Mastercard','Todos los planes','Cobro automático mensual'],['American Express','Todos los planes','Cobro automático mensual'],['SEPA (domiciliación)','Planes anuales','Solo zona SEPA'],['Transferencia bancaria','Enterprise','Previa solicitud']]} />
      </ArticleSection>
      <ArticleSection id="actualizar" title="Actualizar datos de pago" icon={Shield} accentColor={ACCENT}>
        <InfoCallout type="tip">Actualiza tu tarjeta en <strong>Configuración → Suscripción → Método de pago</strong>. Los datos están protegidos por encriptación PCI DSS.</InfoCallout>
        <InfoCallout type="warning">Si tu tarjeta caduca, recibirás un aviso 15 días antes para que la actualices sin interrupción del servicio.</InfoCallout>
      </ArticleSection>
    </ArticleLayout>
  );
}
