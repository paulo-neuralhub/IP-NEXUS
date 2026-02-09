import { Layout, Monitor, Command, Search } from 'lucide-react';
import { ArticleLayout } from '../ArticleLayout';
import { ArticleSection } from '../ArticleSection';
import { FeatureGrid } from '../FeatureGrid';
import { InfoCallout } from '../InfoCallout';
import { DataTable } from '../DataTable';
import { IllustrationNavigation } from '../illustrations';

const ACCENT = '#3B82F6';

export function GS006Content() {
  return (
    <ArticleLayout title="Entender la navegación de IP-NEXUS" subtitle="Domina la interfaz: sidebar, módulos, atajos y búsqueda rápida." icon={Layout} accentColor={ACCENT} category="Primeros Pasos" categorySlug="getting-started" readTime="3 min" lastUpdated="Febrero 2026" tags={['navegación','sidebar','interfaz','módulos']} tocSections={[{id:'sidebar',title:'Sidebar'},{id:'modulos',title:'Módulos'},{id:'atajos',title:'Atajos rápidos'}]} relatedArticles={[{title:'Atajos de teclado',path:'/app/help/article/atajos-teclado-gs',readTime:'2 min'},{title:'Dashboard',path:'/app/help/article/navegacion-dashboard',readTime:'3 min'}]}>
      <div className="flex justify-center mb-8"><IllustrationNavigation size={150} /></div>
      <p className="text-[15px] text-foreground/80 leading-relaxed">IP-NEXUS organiza tu espacio de trabajo en un <strong>sidebar lateral</strong>, un área principal y una barra de acciones rápidas. Aprende a moverte para ser más productivo.</p>

      <ArticleSection id="sidebar" title="El Sidebar" icon={Monitor} accentColor={ACCENT}>
        <p className="text-foreground/80 mb-3">El sidebar izquierdo es tu navegación principal. Puedes colapsarlo con el botón ≡ para ganar espacio.</p>
        <InfoCallout type="tip">Usa <strong>Ctrl+B</strong> para abrir/cerrar el sidebar rápidamente.</InfoCallout>
      </ArticleSection>

      <ArticleSection id="modulos" title="Módulos disponibles" icon={Layout} accentColor={ACCENT} variant="highlighted">
        <FeatureGrid features={[
          {emoji:'📊',title:'Dashboard',description:'Vista general con KPIs, plazos y actividad.',accentColor:'#3B82F6'},
          {emoji:'📁',title:'Expedientes',description:'Gestión completa de PI: marcas, patentes, diseños.',accentColor:'#0EA5E9'},
          {emoji:'🔗',title:'Data Hub',description:'Conexiones con oficinas de PI.',accentColor:'#1E293B'},
          {emoji:'🕷️',title:'Spider',description:'Vigilancia y alertas de marcas.',accentColor:'#8B5CF6'},
          {emoji:'💰',title:'Finance',description:'Costes, facturación y honorarios.',accentColor:'#14B8A6'},
          {emoji:'👥',title:'CRM',description:'Gestión de contactos y clientes.',accentColor:'#EC4899'},
          {emoji:'🧠',title:'Genius',description:'Asistentes de IA para PI.',accentColor:'#F59E0B'},
          {emoji:'🏪',title:'Market',description:'Marketplace de servicios IP.',accentColor:'#10B981'},
        ]} />
      </ArticleSection>

      <ArticleSection id="atajos" title="Acciones rápidas" icon={Command} accentColor={ACCENT}>
        <DataTable headers={['Atajo','Acción']} rows={[['Ctrl+K','Búsqueda global'],['Ctrl+N','Nuevo expediente'],['Ctrl+J','Abrir Genius'],['Ctrl+B','Toggle sidebar'],['Esc','Cerrar modal']]} />
        <InfoCallout type="info">La <strong>búsqueda global</strong> (Ctrl+K) busca en expedientes, contactos, documentos y artículos de ayuda simultáneamente.</InfoCallout>
      </ArticleSection>
    </ArticleLayout>
  );
}
