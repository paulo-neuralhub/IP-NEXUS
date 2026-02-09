import { CreditCard, Shield, AlertTriangle } from 'lucide-react';
import { ArticleLayout } from '../ArticleLayout';
import { ArticleSection } from '../ArticleSection';
import { StepByStep } from '../StepByStep';
import { InfoCallout } from '../InfoCallout';
import { IllustrationTroubleshooting } from '../illustrations';
const ACCENT = '#EF4444';
export function Fix005Content() {
  return (
    <ArticleLayout title="Problemas con pagos en IP-Market" subtitle="Soluciones para problemas de pago y disputas." icon={CreditCard} accentColor={ACCENT} category="Solución de Problemas" categorySlug="troubleshooting" readTime="3 min" lastUpdated="Febrero 2026" tags={['pago','market','disputa','reembolso']} tocSections={[{id:'comunes',title:'Problemas comunes'},{id:'disputas',title:'Disputas'}]} relatedArticles={[{title:'Contactar soporte',path:'/app/help/article/contactar-soporte',readTime:'1 min'}]}>
      <div className="flex justify-center mb-8"><IllustrationTroubleshooting size={150} /></div>
      <p className="text-[15px] text-foreground/80 leading-relaxed">Si tienes un problema con un pago en IP-Market, sigue estos pasos.</p>
      <ArticleSection id="comunes" title="Problemas comunes" icon={AlertTriangle} accentColor={ACCENT} variant="highlighted">
        <StepByStep accentColor={ACCENT} steps={[
          {title:'Pago rechazado',description:'Verifica que tu tarjeta tiene fondos suficientes y no está bloqueada para compras online.'},
          {title:'Pago duplicado',description:'Espera 24h — los pagos duplicados se detectan y reembolsan automáticamente.',tip:'Si no se reembolsa en 48h, abre un ticket de soporte.'},
          {title:'No recibí el servicio',description:'Contacta primero con el proveedor del servicio desde el detalle de la transacción.'},
        ]} />
      </ArticleSection>
      <ArticleSection id="disputas" title="Abrir una disputa" icon={Shield} accentColor={ACCENT}>
        <InfoCallout type="info">IP-Market ofrece <strong>pago protegido</strong>: el dinero se retiene hasta que confirmes la entrega del servicio.</InfoCallout>
        <InfoCallout type="warning">Para abrir una disputa, ve a <strong>Market → Mis transacciones → Abrir disputa</strong>. Tienes 14 días desde la fecha de pago.</InfoCallout>
      </ArticleSection>
    </ArticleLayout>
  );
}
