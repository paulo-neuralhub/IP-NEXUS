import { Landmark, Globe, Search } from 'lucide-react';
import { ArticleLayout } from '../ArticleLayout';
import { ArticleSection } from '../ArticleSection';
import { DataTable } from '../DataTable';
import { InfoCallout } from '../InfoCallout';
import { IllustrationFinance } from '../illustrations';
const ACCENT = '#14B8A6';
export function Fin005Content() {
  return (
    <ArticleLayout title="Tasas de oficinas IP" subtitle="Consulta las tasas oficiales de OEPM, EUIPO, WIPO y más." icon={Landmark} accentColor={ACCENT} category="Costes" categorySlug="costes" readTime="5 min" lastUpdated="Febrero 2026" tags={['tasas','oficinas','OEPM','EUIPO','WIPO']} tocSections={[{id:'espana',title:'España (OEPM)'},{id:'europa',title:'Europa (EUIPO)'},{id:'internacional',title:'Internacional (WIPO)'}]} relatedArticles={[{title:'Jurisdicciones',path:'/app/help/article/jurisdicciones',readTime:'5 min'}]}>
      <div className="flex justify-center mb-8"><IllustrationFinance size={150} /></div>
      <p className="text-[15px] text-foreground/80 leading-relaxed">IP-NEXUS mantiene actualizadas las <strong>tasas oficiales</strong> de las principales oficinas de PI.</p>
      <ArticleSection id="espana" title="España (OEPM)" icon={Landmark} accentColor={ACCENT} variant="highlighted">
        <DataTable headers={['Concepto','Tasa','Notas']} rows={[['Solicitud de marca (1 clase)','~€145','Online, reducción 15%'],['Clase adicional','~€98','Por cada clase extra'],['Renovación (10 años)','~€162','Online'],['Oposición','~€398','']]} />
      </ArticleSection>
      <ArticleSection id="europa" title="Europa (EUIPO)" icon={Globe} accentColor={ACCENT}>
        <DataTable headers={['Concepto','Tasa','Notas']} rows={[['Solicitud de marca (1 clase)','€850','Online'],['2ª clase','€50',''],['3ª clase y sucesivas','€150','Por cada clase'],['Renovación (10 años)','€850','1 clase']]} />
      </ArticleSection>
      <ArticleSection id="internacional" title="Internacional (WIPO)" icon={Globe} accentColor={ACCENT} variant="highlighted">
        <InfoCallout type="info">Las tasas de WIPO varían según los <strong>países designados</strong>. IP-NEXUS calcula automáticamente el coste total basándose en tu selección de jurisdicciones.</InfoCallout>
        <InfoCallout type="warning">Las tasas se actualizan periódicamente. Las mostradas son orientativas; consulta siempre la web oficial de cada oficina.</InfoCallout>
      </ArticleSection>
    </ArticleLayout>
  );
}
