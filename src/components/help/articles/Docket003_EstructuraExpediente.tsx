import { LayoutGrid, FileText, Clock, DollarSign, Activity } from 'lucide-react';
import { ArticleLayout } from '../ArticleLayout';
import { ArticleSection } from '../ArticleSection';
import { FeatureGrid } from '../FeatureGrid';
import { InfoCallout } from '../InfoCallout';
import { IllustrationDashboard } from '../illustrations';

const ACCENT = '#0EA5E9';

export function Docket003Content() {
  return (
    <ArticleLayout title="Estructura de un expediente" subtitle="Recorre cada pestaña y sección para entender toda la información disponible." icon={LayoutGrid} accentColor={ACCENT} category="IP-Docket" categorySlug="portfolio" readTime="5 min" lastUpdated="Febrero 2026" tags={['estructura','pestañas','secciones','expediente']} tocSections={[{id:'pestanas',title:'Pestañas principales'},{id:'detalle',title:'Detalle de cada pestaña'}]} relatedArticles={[{title:'Crear expediente',path:'/app/help/article/crear-expediente',readTime:'6 min'},{title:'Estados y flujo',path:'/app/help/article/estados-flujo',readTime:'4 min'}]}>
      <div className="flex justify-center mb-8"><IllustrationDashboard size={150} /></div>
      <p className="text-[15px] text-foreground/80 leading-relaxed">Cada expediente en IP-NEXUS está organizado en <strong>pestañas temáticas</strong> que agrupan la información de forma lógica y accesible.</p>

      <ArticleSection id="pestanas" title="Pestañas principales" icon={LayoutGrid} accentColor={ACCENT} variant="highlighted">
        <FeatureGrid features={[
          {emoji:'📋',title:'Datos generales',description:'Información básica: tipo, denominación, titular, estado, jurisdicción y fechas clave.',accentColor:'#3B82F6'},
          {emoji:'📎',title:'Documentos',description:'Archivos adjuntos, versiones y control de cambios. Compartir con portal cliente.',accentColor:'#0EA5E9'},
          {emoji:'⏰',title:'Plazos',description:'Todos los plazos legales e internos. Recordatorios configurables y escalado.',accentColor:'#F59E0B'},
          {emoji:'💰',title:'Costes',description:'Tasas oficiales, honorarios, presupuestos y facturas vinculadas.',accentColor:'#14B8A6'},
          {emoji:'📊',title:'Actividad',description:'Timeline completo de cambios, notas internas y comunicaciones.',accentColor:'#8B5CF6'},
          {emoji:'👥',title:'Contactos',description:'Titular, representante, abogados y terceros vinculados al caso.',accentColor:'#EC4899'},
        ]} />
      </ArticleSection>

      <ArticleSection id="detalle" title="Navegación entre pestañas" icon={Activity} accentColor={ACCENT}>
        <InfoCallout type="tip">Usa los atajos <strong>1-6</strong> para cambiar rápidamente entre pestañas cuando estés dentro de un expediente.</InfoCallout>
        <InfoCallout type="info">Los cambios en cualquier pestaña se guardan automáticamente. Verás un indicador de guardado en la esquina superior.</InfoCallout>
      </ArticleSection>
    </ArticleLayout>
  );
}
