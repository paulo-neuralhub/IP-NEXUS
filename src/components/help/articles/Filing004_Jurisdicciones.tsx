import { Globe, MapPin, Scale } from 'lucide-react';
import { ArticleLayout } from '../ArticleLayout';
import { ArticleSection } from '../ArticleSection';
import { FeatureGrid } from '../FeatureGrid';
import { InfoCallout } from '../InfoCallout';
import { DataTable } from '../DataTable';
import { IllustrationSearch } from '../illustrations';
const ACCENT = '#14B8A6';
export function Filing004Content() {
  return (
    <ArticleLayout title="Jurisdicciones: dónde registrar" subtitle="Diferencias entre registro nacional, europeo e internacional." icon={Globe} accentColor={ACCENT} category="Registro y Filing" categorySlug="filing" readTime="5 min" lastUpdated="Febrero 2026" tags={['jurisdicciones','OEPM','EUIPO','WIPO']} tocSections={[{id:'opciones',title:'Opciones'},{id:'comparativa',title:'Comparativa'},{id:'estrategia',title:'Estrategia'}]} relatedArticles={[{title:'Proceso de registro',path:'/app/help/article/proceso-registro',readTime:'5 min'}]}>
      <div className="flex justify-center mb-8"><IllustrationSearch size={150} /></div>
      <p className="text-[15px] text-foreground/80 leading-relaxed">Elegir <strong>dónde registrar</strong> tu marca es tan importante como elegir qué registrar. Cada jurisdicción tiene sus ventajas, costes y plazos.</p>
      <ArticleSection id="opciones" title="Opciones de registro" icon={MapPin} accentColor={ACCENT} variant="highlighted">
        <FeatureGrid features={[
          {emoji:'🇪🇸',title:'Nacional (OEPM)',description:'Protección solo en España. Más económico.',items:['Tasa base ~€150','6-8 meses','Ideal para negocios locales'],accentColor:'#EF4444'},
          {emoji:'🇪🇺',title:'Europeo (EUIPO)',description:'Protección en toda la UE con una solicitud.',items:['Tasa base ~€850','4-6 meses','27 países con una marca'],accentColor:'#3B82F6'},
          {emoji:'🌍',title:'Internacional (WIPO)',description:'Protección en múltiples países seleccionados.',items:['Tasa variable por país','12-18 meses','Flexible y escalable'],accentColor:'#10B981'},
        ]} columns={3} />
      </ArticleSection>
      <ArticleSection id="comparativa" title="Comparativa detallada" icon={Scale} accentColor={ACCENT}>
        <DataTable headers={['Aspecto','OEPM','EUIPO','WIPO']} rows={[['Cobertura','España','27 países UE','Países seleccionados'],['Coste (1 clase)','~€150','~€850','Variable'],['Plazo medio','6-8 meses','4-6 meses','12-18 meses'],['Renovación','Cada 10 años','Cada 10 años','Cada 10 años'],['Examen fondo','No','No','Variable por país']]} />
      </ArticleSection>
      <ArticleSection id="estrategia" title="Estrategia de registro" icon={Globe} accentColor={ACCENT} variant="highlighted">
        <InfoCallout type="tip">Para negocios en España, empieza con la <strong>OEPM</strong>. Si planeas expandirte a Europa, solicita directamente en la <strong>EUIPO</strong>.</InfoCallout>
        <InfoCallout type="info">Puedes usar la <strong>prioridad unionista</strong> (6 meses) para extender un registro nacional a nivel europeo o internacional manteniendo la fecha original.</InfoCallout>
      </ArticleSection>
    </ArticleLayout>
  );
}
