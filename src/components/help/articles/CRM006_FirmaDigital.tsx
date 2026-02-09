import { PenTool, Send, CheckCircle } from 'lucide-react';
import { ArticleLayout } from '../ArticleLayout';
import { ArticleSection } from '../ArticleSection';
import { StepByStep } from '../StepByStep';
import { InfoCallout } from '../InfoCallout';
import { IllustrationDocuments } from '../illustrations';
const ACCENT = '#EC4899';
export function CRM006Content() {
  return (
    <ArticleLayout title="Firma digital de documentos" subtitle="Envía documentos a firmar y recibe la firma digital directamente." icon={PenTool} accentColor={ACCENT} category="CRM" categorySlug="crm" readTime="3 min" lastUpdated="Febrero 2026" tags={['firma','digital','documento','firmar']} tocSections={[{id:'como',title:'Cómo funciona'},{id:'enviar',title:'Enviar a firmar'}]} relatedArticles={[{title:'Portal de cliente',path:'/app/help/article/portal-cliente',readTime:'4 min'}]}>
      <div className="flex justify-center mb-8"><IllustrationDocuments size={150} /></div>
      <p className="text-[15px] text-foreground/80 leading-relaxed">La firma digital integrada permite <strong>enviar documentos a firmar</strong> y recibir el documento firmado sin salir de IP-NEXUS.</p>
      <ArticleSection id="como" title="Cómo funciona" icon={CheckCircle} accentColor={ACCENT}>
        <InfoCallout type="info">IP-NEXUS integra firma digital con validez legal. El firmante recibe un email con un enlace para firmar desde cualquier dispositivo.</InfoCallout>
      </ArticleSection>
      <ArticleSection id="enviar" title="Enviar a firmar" icon={Send} accentColor={ACCENT} variant="highlighted">
        <StepByStep accentColor={ACCENT} steps={[
          {title:'Sube o selecciona el documento',description:'Abre el documento desde el expediente o CRM.'},
          {title:'Haz click en "Enviar a firmar"',description:'Selecciona los firmantes (del CRM) y los campos de firma.'},
          {title:'El firmante recibe el enlace',description:'Firma desde su dispositivo con firma biométrica o digital.'},
          {title:'Documento firmado disponible',description:'El documento firmado se archiva automáticamente en el expediente.',tip:'Recibes una notificación cuando todos los firmantes han completado la firma.'},
        ]} />
        <InfoCallout type="warning">La firma digital tiene <strong>validez legal</strong> según el reglamento eIDAS en la Unión Europea.</InfoCallout>
      </ArticleSection>
    </ArticleLayout>
  );
}
