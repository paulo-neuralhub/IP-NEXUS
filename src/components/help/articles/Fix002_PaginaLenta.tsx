import { Gauge, RefreshCw, CheckCircle } from 'lucide-react';
import { ArticleLayout } from '../ArticleLayout';
import { ArticleSection } from '../ArticleSection';
import { StepByStep } from '../StepByStep';
import { InfoCallout } from '../InfoCallout';
import { IllustrationTroubleshooting } from '../illustrations';
const ACCENT = '#EF4444';
export function Fix002Content() {
  return (
    <ArticleLayout title="La página carga lento" subtitle="Pasos para diagnosticar y solucionar problemas de rendimiento." icon={Gauge} accentColor={ACCENT} category="Solución de Problemas" categorySlug="troubleshooting" readTime="3 min" lastUpdated="Febrero 2026" tags={['lento','carga','rendimiento','error']} tocSections={[{id:'diagnostico',title:'Diagnóstico'},{id:'soluciones',title:'Soluciones'}]} relatedArticles={[{title:'Contactar soporte',path:'/app/help/article/contactar-soporte',readTime:'1 min'}]}>
      <div className="flex justify-center mb-8"><IllustrationTroubleshooting size={150} /></div>
      <p className="text-[15px] text-foreground/80 leading-relaxed">Si IP-NEXUS carga lento, sigue estos pasos para <strong>diagnosticar y resolver</strong> el problema.</p>
      <ArticleSection id="diagnostico" title="Diagnóstico rápido" icon={Gauge} accentColor={ACCENT} variant="highlighted">
        <StepByStep accentColor={ACCENT} steps={[
          {title:'Verifica tu conexión',description:'Abre otra web para descartar problemas de internet.'},
          {title:'Limpia caché del navegador',description:'Ctrl+Shift+Delete → Borrar archivos en caché → Recargar la página.'},
          {title:'Prueba otro navegador',description:'Prueba con Chrome, Firefox o Edge actualizado.',tip:'IP-NEXUS funciona mejor en Chrome y Firefox actualizados.'},
          {title:'Desactiva extensiones',description:'Algunas extensiones (ad-blockers, VPNs) pueden interferir.'},
        ]} />
      </ArticleSection>
      <ArticleSection id="soluciones" title="Si el problema persiste" icon={CheckCircle} accentColor={ACCENT}>
        <InfoCallout type="info">Si el problema solo ocurre en una sección específica, <strong>repórtalo como bug</strong> indicando la URL y qué estabas haciendo.</InfoCallout>
        <InfoCallout type="tip">Puedes verificar el <strong>estado del servicio</strong> en la sección de ayuda → Estado del sistema.</InfoCallout>
      </ArticleSection>
    </ArticleLayout>
  );
}
