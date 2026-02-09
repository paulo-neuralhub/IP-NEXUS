import { Receipt, Send, FileText } from 'lucide-react';
import { ArticleLayout } from '../ArticleLayout';
import { ArticleSection } from '../ArticleSection';
import { StepByStep } from '../StepByStep';
import { InfoCallout } from '../InfoCallout';
import { IllustrationFinance } from '../illustrations';
const ACCENT = '#14B8A6';
export function Fin002Content() {
  return (
    <ArticleLayout title="Crear y enviar facturas" subtitle="Genera facturas profesionales y envíalas a tus clientes." icon={Receipt} accentColor={ACCENT} category="Costes" categorySlug="costes" readTime="4 min" lastUpdated="Febrero 2026" tags={['facturas','crear','enviar','cobrar']} tocSections={[{id:'crear',title:'Crear factura'},{id:'enviar',title:'Enviar al cliente'}]} relatedArticles={[{title:'Panel financiero',path:'/app/help/article/panel-financiero',readTime:'3 min'},{title:'Cobros pendientes',path:'/app/help/article/cobros-pendientes',readTime:'3 min'}]}>
      <div className="flex justify-center mb-8"><IllustrationFinance size={150} /></div>
      <p className="text-[15px] text-foreground/80 leading-relaxed">IP-NEXUS genera <strong>facturas profesionales</strong> vinculadas a expedientes, con tu logo y datos fiscales.</p>
      <ArticleSection id="crear" title="Crear una factura" icon={FileText} accentColor={ACCENT} variant="highlighted">
        <StepByStep accentColor={ACCENT} steps={[
          {title:'Ve a Finance → Facturas',description:'Haz click en "Nueva factura".'},
          {title:'Selecciona el cliente',description:'Elige un contacto del CRM. Sus datos fiscales se rellenan automáticamente.'},
          {title:'Añade líneas',description:'Añade conceptos: honorarios, tasas oficiales, desembolsos. Vincula a expedientes si aplica.',tip:'Puedes importar líneas desde los costes registrados en un expediente.'},
          {title:'Revisa y guarda',description:'Verifica importes, IVA y total. La factura se guarda como borrador.'},
        ]} />
      </ArticleSection>
      <ArticleSection id="enviar" title="Enviar al cliente" icon={Send} accentColor={ACCENT}>
        <StepByStep accentColor={ACCENT} steps={[
          {title:'Revisa el PDF',description:'Previsualiza la factura en formato PDF con tu branding.'},
          {title:'Haz click en "Enviar"',description:'La factura se envía por email al cliente con el PDF adjunto.',tip:'Puedes programar el envío para una fecha futura.'},
        ]} />
        <InfoCallout type="info">Las facturas enviadas cambian a estado <strong>"Enviada"</strong> y se activa el seguimiento de cobro.</InfoCallout>
      </ArticleSection>
    </ArticleLayout>
  );
}
