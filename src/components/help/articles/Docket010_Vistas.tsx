import { LayoutGrid, List, Kanban } from 'lucide-react';
import { ArticleLayout } from '../ArticleLayout';
import { ArticleSection } from '../ArticleSection';
import { FeatureGrid } from '../FeatureGrid';
import { InfoCallout } from '../InfoCallout';
import { IllustrationDashboard } from '../illustrations';
const ACCENT = '#0EA5E9';
export function Docket010Content() {
  return (
    <ArticleLayout title="Vistas: lista, tabla y kanban" subtitle="Cambia entre vistas para organizar tus expedientes de la forma que prefieras." icon={LayoutGrid} accentColor={ACCENT} category="IP-Docket" categorySlug="portfolio" readTime="2 min" lastUpdated="Febrero 2026" tags={['vistas','lista','tabla','kanban']} tocSections={[{id:'vistas',title:'Vistas disponibles'},{id:'cambiar',title:'Cómo cambiar'}]} relatedArticles={[{title:'Buscar y filtrar',path:'/app/help/article/buscar-filtrar',readTime:'3 min'}]}>
      <div className="flex justify-center mb-8"><IllustrationDashboard size={150} /></div>
      <p className="text-[15px] text-foreground/80 leading-relaxed">IP-NEXUS ofrece varias vistas para adaptarse a tu forma de trabajar. Cambia entre ellas <strong>sin perder filtros ni contexto</strong>.</p>
      <ArticleSection id="vistas" title="Vistas disponibles" icon={LayoutGrid} accentColor={ACCENT} variant="highlighted">
        <FeatureGrid features={[
          {emoji:'📋',title:'Lista',description:'Vista compacta con una fila por expediente. Ideal para revisión rápida y acciones masivas.',accentColor:'#3B82F6'},
          {emoji:'📊',title:'Tabla',description:'Columnas configurables con ordenación y filtros inline. Perfecta para gestión detallada.',accentColor:'#0EA5E9'},
          {emoji:'📌',title:'Kanban',description:'Tarjetas organizadas por estado. Arrastra para cambiar de fase. Visual e intuitivo.',accentColor:'#8B5CF6'},
        ]} columns={3} />
      </ArticleSection>
      <ArticleSection id="cambiar" title="Cómo cambiar de vista" icon={List} accentColor={ACCENT}>
        <InfoCallout type="tip">Usa los iconos en la esquina superior derecha de la lista de expedientes para cambiar entre vistas. Tu preferencia se guarda automáticamente.</InfoCallout>
        <InfoCallout type="info">En la vista <strong>Kanban</strong>, puedes arrastrar expedientes entre columnas para cambiar su estado.</InfoCallout>
      </ArticleSection>
    </ArticleLayout>
  );
}
