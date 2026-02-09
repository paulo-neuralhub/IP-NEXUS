import { Headphones, MessageSquare, Mail } from 'lucide-react';
import { ArticleLayout } from '../ArticleLayout';
import { ArticleSection } from '../ArticleSection';
import { FeatureGrid } from '../FeatureGrid';
import { InfoCallout } from '../InfoCallout';
import { IllustrationTroubleshooting } from '../illustrations';
const ACCENT = '#EF4444';
export function Fix006Content() {
  return (
    <ArticleLayout title="Contactar soporte técnico" subtitle="Todas las formas de contactar con nuestro equipo." icon={Headphones} accentColor={ACCENT} category="Solución de Problemas" categorySlug="troubleshooting" readTime="1 min" lastUpdated="Febrero 2026" tags={['soporte','contactar','ayuda','ticket']} tocSections={[{id:'canales',title:'Canales de soporte'}]} relatedArticles={[{title:'Página carga lento',path:'/app/help/article/pagina-lenta',readTime:'3 min'}]}>
      <div className="flex justify-center mb-8"><IllustrationTroubleshooting size={150} /></div>
      <p className="text-[15px] text-foreground/80 leading-relaxed">Estamos aquí para ayudarte. Elige el canal que mejor se adapte a tu necesidad.</p>
      <ArticleSection id="canales" title="Canales de soporte" icon={MessageSquare} accentColor={ACCENT} variant="highlighted">
        <FeatureGrid features={[
          {emoji:'💬',title:'Chat en vivo',description:'Disponible L-V de 9:00 a 18:00 (CET). Respuesta media: 2 minutos.',items:['Professional, Business y Enterprise'],accentColor:'#3B82F6'},
          {emoji:'📧',title:'Email',description:'soporte@ip-nexus.com. Respuesta en menos de 24h laborables.',items:['Todos los planes'],accentColor:'#10B981'},
          {emoji:'🎫',title:'Ticket de soporte',description:'Desde Ayuda → Nuevo ticket. Seguimiento detallado del caso.',items:['Todos los planes'],accentColor:'#8B5CF6'},
          {emoji:'📞',title:'Teléfono',description:'Línea directa con tu Account Manager.',items:['Solo Enterprise'],accentColor:'#F59E0B'},
        ]} />
      </ArticleSection>
      <InfoCallout type="tip">Para una resolución más rápida, incluye: <strong>capturas de pantalla, URL del error</strong> y pasos para reproducir el problema.</InfoCallout>
    </ArticleLayout>
  );
}
