import { Receipt, Download, FileText } from 'lucide-react';
import { ArticleLayout } from '../ArticleLayout';
import { ArticleSection } from '../ArticleSection';
import { StepByStep } from '../StepByStep';
import { InfoCallout } from '../InfoCallout';
import { IllustrationBilling } from '../illustrations';
const ACCENT = '#F59E0B';
export function Bill004Content() {
  return (
    <ArticleLayout title="Facturas y recibos" subtitle="Accede a tus facturas, descarga recibos y configura datos fiscales." icon={Receipt} accentColor={ACCENT} category="Facturación" categorySlug="facturacion" readTime="2 min" lastUpdated="Febrero 2026" tags={['facturas','recibos','descargar','fiscal']} tocSections={[{id:'acceder',title:'Acceder a facturas'},{id:'fiscal',title:'Datos fiscales'}]} relatedArticles={[{title:'Suscripción y facturación',path:'/app/help/article/suscripcion-config',readTime:'3 min'}]}>
      <div className="flex justify-center mb-8"><IllustrationBilling size={150} /></div>
      <p className="text-[15px] text-foreground/80 leading-relaxed">Todas tus facturas de IP-NEXUS están disponibles <strong>en PDF</strong> para descarga inmediata.</p>
      <ArticleSection id="acceder" title="Acceder a tus facturas" icon={Download} accentColor={ACCENT} variant="highlighted">
        <StepByStep accentColor={ACCENT} steps={[
          {title:'Ve a Configuración → Suscripción',description:'En la sección "Historial de pagos" verás todas tus facturas.'},
          {title:'Descarga en PDF',description:'Haz click en el icono de descarga para obtener el PDF.',tip:'También puedes recibir las facturas por email automáticamente.'},
        ]} />
      </ArticleSection>
      <ArticleSection id="fiscal" title="Datos fiscales" icon={FileText} accentColor={ACCENT}>
        <InfoCallout type="tip">Configura tu <strong>CIF/NIF, razón social y dirección fiscal</strong> en Configuración → Organización. Se incluirán automáticamente en todas las facturas.</InfoCallout>
        <InfoCallout type="info">Si necesitas modificar los datos fiscales de una factura ya emitida, contacta con soporte.</InfoCallout>
      </ArticleSection>
    </ArticleLayout>
  );
}
