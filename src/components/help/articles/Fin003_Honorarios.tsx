import { DollarSign, Settings, Calculator } from 'lucide-react';
import { ArticleLayout } from '../ArticleLayout';
import { ArticleSection } from '../ArticleSection';
import { StepByStep } from '../StepByStep';
import { InfoCallout } from '../InfoCallout';
import { IllustrationFinance } from '../illustrations';
const ACCENT = '#14B8A6';
export function Fin003Content() {
  return (
    <ArticleLayout title="Gestionar honorarios por expediente" subtitle="Asocia honorarios y costes a cada expediente de PI." icon={DollarSign} accentColor={ACCENT} category="Costes" categorySlug="costes" readTime="3 min" lastUpdated="Febrero 2026" tags={['honorarios','costes','expediente','precio']} tocSections={[{id:'asociar',title:'Asociar costes'},{id:'tarifas',title:'Tablas de tarifas'}]} relatedArticles={[{title:'Crear facturas',path:'/app/help/article/crear-facturas',readTime:'4 min'}]}>
      <div className="flex justify-center mb-8"><IllustrationFinance size={150} /></div>
      <p className="text-[15px] text-foreground/80 leading-relaxed">Registra honorarios, tasas oficiales y desembolsos <strong>por expediente</strong> para un control de costes total.</p>
      <ArticleSection id="asociar" title="Asociar costes a un expediente" icon={Calculator} accentColor={ACCENT} variant="highlighted">
        <StepByStep accentColor={ACCENT} steps={[
          {title:'Abre la pestaña Costes',description:'Dentro del expediente, ve a la pestaña "Costes" o "Finance".'},
          {title:'Añade un coste',description:'Haz click en "Añadir coste". Selecciona tipo: honorarios, tasas oficiales o desembolsos.'},
          {title:'Define importe y estado',description:'Indica el importe, moneda y si está facturado o pendiente.',tip:'Los costes pendientes aparecen en el panel de cobros pendientes.'},
        ]} />
      </ArticleSection>
      <ArticleSection id="tarifas" title="Tablas de tarifas" icon={Settings} accentColor={ACCENT}>
        <InfoCallout type="tip">Configura tus <strong>tablas de tarifas</strong> en Configuración → Finance. IP-NEXUS aplicará automáticamente los precios al registrar servicios.</InfoCallout>
        <InfoCallout type="info">Puedes tener tarifas diferentes por <strong>tipo de servicio, jurisdicción y cliente</strong>.</InfoCallout>
      </ArticleSection>
    </ArticleLayout>
  );
}
