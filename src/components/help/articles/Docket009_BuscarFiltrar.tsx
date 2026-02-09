import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import { ArticleLayout } from '../ArticleLayout';
import { ArticleSection } from '../ArticleSection';
import { StepByStep } from '../StepByStep';
import { InfoCallout } from '../InfoCallout';
import { FeatureGrid } from '../FeatureGrid';
import { IllustrationSearch } from '../illustrations';
const ACCENT = '#0EA5E9';
export function Docket009Content() {
  return (
    <ArticleLayout title="Buscar y filtrar expedientes" subtitle="Usa la búsqueda avanzada y filtros para encontrar cualquier expediente al instante." icon={Search} accentColor={ACCENT} category="IP-Docket" categorySlug="portfolio" readTime="3 min" lastUpdated="Febrero 2026" tags={['buscar','filtrar','búsqueda','avanzada']} tocSections={[{id:'busqueda',title:'Búsqueda rápida'},{id:'filtros',title:'Filtros avanzados'},{id:'guardar',title:'Guardar vistas'}]} relatedArticles={[{title:'Vistas: lista, tabla y kanban',path:'/app/help/article/vistas',readTime:'2 min'}]}>
      <div className="flex justify-center mb-8"><IllustrationSearch size={150} /></div>
      <p className="text-[15px] text-foreground/80 leading-relaxed">Con cientos de expedientes, encontrar lo que buscas debe ser <strong>instantáneo</strong>. IP-NEXUS ofrece búsqueda inteligente y filtros combinables.</p>
      <ArticleSection id="busqueda" title="Búsqueda rápida" icon={Search} accentColor={ACCENT}>
        <StepByStep accentColor={ACCENT} steps={[
          {title:'Usa Ctrl+K',description:'Abre la búsqueda global desde cualquier pantalla. Busca por referencia, denominación, titular o cualquier texto.'},
          {title:'Resultados instantáneos',description:'Los resultados aparecen mientras escribes, organizados por tipo: expedientes, contactos, documentos.',tip:'Escribe al menos 2 caracteres para activar la búsqueda.'},
        ]} />
      </ArticleSection>
      <ArticleSection id="filtros" title="Filtros avanzados" icon={Filter} accentColor={ACCENT} variant="highlighted">
        <FeatureGrid features={[
          {emoji:'📋',title:'Por tipo',description:'Marca, patente, diseño, litigio.',accentColor:'#3B82F6'},
          {emoji:'🏷️',title:'Por estado',description:'Borrador, presentado, concedido, etc.',accentColor:'#10B981'},
          {emoji:'🌍',title:'Por jurisdicción',description:'OEPM, EUIPO, WIPO, USPTO...',accentColor:'#8B5CF6'},
          {emoji:'👤',title:'Por asignado',description:'Filtrar por miembro del equipo.',accentColor:'#EC4899'},
          {emoji:'📅',title:'Por fecha',description:'Solicitud, concesión, vencimiento.',accentColor:'#F59E0B'},
          {emoji:'🏢',title:'Por titular',description:'Persona física o jurídica.',accentColor:'#14B8A6'},
        ]} />
      </ArticleSection>
      <ArticleSection id="guardar" title="Guardar vistas personalizadas" icon={SlidersHorizontal} accentColor={ACCENT}>
        <InfoCallout type="tip">Combina filtros y <strong>guárdalos como vista personalizada</strong> para acceder con un click. Ejemplo: "Marcas UE pendientes de renovación".</InfoCallout>
        <InfoCallout type="info">Las vistas guardadas son privadas por defecto. Puedes compartirlas con tu equipo desde el menú de la vista.</InfoCallout>
      </ArticleSection>
    </ArticleLayout>
  );
}
