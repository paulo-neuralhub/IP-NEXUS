import { BarChart3, TrendingUp, PieChart } from 'lucide-react';
import { ArticleLayout } from '../ArticleLayout';
import { ArticleSection } from '../ArticleSection';
import { FeatureGrid } from '../FeatureGrid';
import { InfoCallout } from '../InfoCallout';
import { IllustrationFinance } from '../illustrations';
const ACCENT = '#14B8A6';
export function Fin001Content() {
  return (
    <ArticleLayout title="Panel financiero general" subtitle="Visión general de ingresos, gastos, honorarios pendientes y flujo de caja." icon={BarChart3} accentColor={ACCENT} category="Costes" categorySlug="costes" readTime="3 min" lastUpdated="Febrero 2026" tags={['finanzas','ingresos','gastos','balance']} tocSections={[{id:'metricas',title:'Métricas clave'},{id:'graficos',title:'Gráficos'},{id:'acciones',title:'Acciones rápidas'}]} relatedArticles={[{title:'Crear facturas',path:'/app/help/article/crear-facturas',readTime:'4 min'},{title:'Honorarios',path:'/app/help/article/honorarios',readTime:'3 min'}]}>
      <div className="flex justify-center mb-8"><IllustrationFinance size={150} /></div>
      <p className="text-[15px] text-foreground/80 leading-relaxed">El panel financiero te da una <strong>visión completa</strong> de la salud económica de tu despacho de PI.</p>
      <ArticleSection id="metricas" title="Métricas clave" icon={TrendingUp} accentColor={ACCENT} variant="highlighted">
        <FeatureGrid features={[
          {emoji:'💰',title:'Ingresos',description:'Total facturado en el período seleccionado.',accentColor:'#10B981'},
          {emoji:'💸',title:'Gastos',description:'Tasas oficiales, proveedores y costes operativos.',accentColor:'#EF4444'},
          {emoji:'⏳',title:'Pendiente cobro',description:'Facturas emitidas pero no cobradas.',accentColor:'#F59E0B'},
          {emoji:'📊',title:'Margen',description:'Diferencia entre ingresos y costes por expediente.',accentColor:'#3B82F6'},
        ]} />
      </ArticleSection>
      <ArticleSection id="graficos" title="Gráficos disponibles" icon={PieChart} accentColor={ACCENT}>
        <InfoCallout type="info">El panel incluye gráficos de <strong>evolución mensual, distribución por tipo de PI, top clientes</strong> y desglose de costes.</InfoCallout>
        <InfoCallout type="tip">Filtra los datos por <strong>periodo, cliente, tipo de expediente</strong> o responsable para análisis más específicos.</InfoCallout>
      </ArticleSection>
      <ArticleSection id="acciones" title="Acciones rápidas" icon={BarChart3} accentColor={ACCENT} variant="highlighted">
        <InfoCallout type="tip">Desde el panel puedes <strong>crear facturas, registrar pagos</strong> y generar informes financieros con un click.</InfoCallout>
      </ArticleSection>
    </ArticleLayout>
  );
}
