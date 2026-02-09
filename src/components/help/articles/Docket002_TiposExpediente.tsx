import { Layers, Tag, Lightbulb, Palette, Scale } from 'lucide-react';
import { ArticleLayout } from '../ArticleLayout';
import { ArticleSection } from '../ArticleSection';
import { FeatureGrid } from '../FeatureGrid';
import { InfoCallout } from '../InfoCallout';
import { DataTable } from '../DataTable';
import { IllustrationNewMatter } from '../illustrations';

const ACCENT = '#0EA5E9';

export function Docket002Content() {
  return (
    <ArticleLayout title="Tipos de expediente" subtitle="Marca, patente, diseño y litigio — cuándo usar cada uno y qué campos incluyen." icon={Layers} accentColor={ACCENT} category="IP-Docket" categorySlug="portfolio" readTime="5 min" lastUpdated="Febrero 2026" tags={['tipos','marca','patente','diseño','litigio']} tocSections={[{id:'tipos',title:'Los 4 tipos'},{id:'diferencias',title:'Diferencias clave'},{id:'elegir',title:'Cómo elegir'}]} relatedArticles={[{title:'Crear expediente',path:'/app/help/article/crear-expediente',readTime:'6 min'},{title:'Estructura de un expediente',path:'/app/help/article/estructura-expediente',readTime:'5 min'}]}>
      <div className="flex justify-center mb-8"><IllustrationNewMatter size={150} /></div>
      <p className="text-[15px] text-foreground/80 leading-relaxed">IP-NEXUS soporta cuatro tipos de expedientes de PI. Cada tipo tiene <strong>campos y flujos específicos</strong> adaptados a sus necesidades.</p>

      <ArticleSection id="tipos" title="Los 4 tipos de expediente" icon={Layers} accentColor={ACCENT} variant="highlighted">
        <FeatureGrid features={[
          {emoji:'🏷️',title:'Marca',description:'Signos distintivos que identifican productos o servicios.',items:['Denominativa, figurativa, mixta','Clases de Niza','Renovación cada 10 años'],accentColor:'#3B82F6'},
          {emoji:'📋',title:'Patente',description:'Invenciones técnicas con protección temporal.',items:['Invención o modelo de utilidad','Reivindicaciones','Anualidades'],accentColor:'#10B981'},
          {emoji:'🎨',title:'Diseño',description:'Apariencia externa de productos industriales.',items:['Dibujos y modelos','Fotografías/representaciones','Renovación cada 5 años'],accentColor:'#8B5CF6'},
          {emoji:'⚖️',title:'Litigio',description:'Procedimientos contenciosos relacionados con PI.',items:['Oposiciones','Nulidades y cancelaciones','Infracciones'],accentColor:'#EF4444'},
        ]} />
      </ArticleSection>

      <ArticleSection id="diferencias" title="Diferencias clave" icon={Tag} accentColor={ACCENT}>
        <DataTable headers={['Aspecto','Marca','Patente','Diseño','Litigio']} rows={[['Duración','10 años (renovable)','20 años','25 años máx.','Variable'],['Clases/CPC','Niza','IPC/CPC','Locarno','N/A'],['Renovación','Cada 10 años','Anualidades','Cada 5 años','N/A'],['Examen fondo','Variable','Sí','No (UE)','N/A']]} />
      </ArticleSection>

      <ArticleSection id="elegir" title="¿Cómo elegir el tipo correcto?" icon={Lightbulb} accentColor={ACCENT} variant="highlighted">
        <InfoCallout type="tip">Si estás registrando un <strong>nombre o logo</strong>, elige Marca. Si proteges una <strong>invención técnica</strong>, elige Patente. Si proteges la <strong>apariencia</strong> de un producto, elige Diseño.</InfoCallout>
        <InfoCallout type="warning">Si no estás seguro del tipo, consulta con <strong>NEXUS Genius</strong> — el agente legal puede ayudarte a clasificar tu caso.</InfoCallout>
      </ArticleSection>
    </ArticleLayout>
  );
}
