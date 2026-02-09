import { MailX, Settings, CheckCircle } from 'lucide-react';
import { ArticleLayout } from '../ArticleLayout';
import { ArticleSection } from '../ArticleSection';
import { StepByStep } from '../StepByStep';
import { InfoCallout } from '../InfoCallout';
import { IllustrationTroubleshooting } from '../illustrations';
const ACCENT = '#EF4444';
export function Fix004Content() {
  return (
    <ArticleLayout title="No recibo notificaciones por email" subtitle="Verifica tu configuración y revisa el spam." icon={MailX} accentColor={ACCENT} category="Solución de Problemas" categorySlug="troubleshooting" readTime="2 min" lastUpdated="Febrero 2026" tags={['email','notificaciones','spam']} tocSections={[{id:'verificar',title:'Verificar'},{id:'soluciones',title:'Soluciones'}]} relatedArticles={[{title:'Notificaciones',path:'/app/help/article/notificaciones-config',readTime:'2 min'}]}>
      <div className="flex justify-center mb-8"><IllustrationTroubleshooting size={150} /></div>
      <p className="text-[15px] text-foreground/80 leading-relaxed">Si no recibes emails de IP-NEXUS, sigue estos pasos para <strong>diagnosticar el problema</strong>.</p>
      <ArticleSection id="verificar" title="Qué verificar" icon={Settings} accentColor={ACCENT} variant="highlighted">
        <StepByStep accentColor={ACCENT} steps={[
          {title:'Revisa la carpeta de spam/correo no deseado',description:'Los emails de IP-NEXUS pueden haber sido filtrados.'},
          {title:'Añade noreply@ip-nexus.com a contactos',description:'Esto evita que futuros emails caigan en spam.'},
          {title:'Verifica tu email en Configuración',description:'Asegúrate de que el email registrado es correcto.',tip:'Si cambiaste de email recientemente, actualízalo en tu perfil.'},
          {title:'Comprueba las preferencias de notificación',description:'Ve a Configuración → Notificaciones y verifica que el email está activado.'},
        ]} />
      </ArticleSection>
      <ArticleSection id="soluciones" title="Si sigue sin funcionar" icon={CheckCircle} accentColor={ACCENT}>
        <InfoCallout type="tip">Pide a tu equipo de IT que añada <strong>ip-nexus.com</strong> a la lista blanca de su servidor de email.</InfoCallout>
        <InfoCallout type="info">Si usas un email corporativo con filtros estrictos, contacta con soporte para verificar el estado de entrega.</InfoCallout>
      </ArticleSection>
    </ArticleLayout>
  );
}
