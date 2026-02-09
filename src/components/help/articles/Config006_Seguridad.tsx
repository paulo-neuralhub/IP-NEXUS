import { Lock, Shield, Key } from 'lucide-react';
import { ArticleLayout } from '../ArticleLayout';
import { ArticleSection } from '../ArticleSection';
import { StepByStep } from '../StepByStep';
import { InfoCallout } from '../InfoCallout';
import { IllustrationSettings } from '../illustrations';
const ACCENT = '#64748B';
export function Config006Content() {
  return (
    <ArticleLayout title="Seguridad y autenticación" subtitle="Protege tu cuenta con 2FA y revisa la configuración de seguridad." icon={Lock} accentColor={ACCENT} category="Configuración" categorySlug="configuracion" readTime="3 min" lastUpdated="Febrero 2026" tags={['seguridad','2FA','contraseña','autenticación']} tocSections={[{id:'2fa',title:'Autenticación 2FA'},{id:'sesiones',title:'Sesiones activas'}]} relatedArticles={[{title:'No puedo acceder',path:'/app/help/article/no-puedo-acceder',readTime:'2 min'}]}>
      <div className="flex justify-center mb-8"><IllustrationSettings size={150} /></div>
      <p className="text-[15px] text-foreground/80 leading-relaxed">La seguridad de tus datos de PI es <strong>prioridad máxima</strong>. Configura las opciones de protección.</p>
      <ArticleSection id="2fa" title="Autenticación en dos factores (2FA)" icon={Key} accentColor={ACCENT} variant="highlighted">
        <StepByStep accentColor={ACCENT} steps={[
          {title:'Ve a Configuración → Seguridad',description:'Encontrarás las opciones de autenticación.'},
          {title:'Activa 2FA',description:'Escanea el código QR con tu app de autenticación (Google Authenticator, Authy, etc.).'},
          {title:'Guarda los códigos de recuperación',description:'Anota los códigos de respaldo en un lugar seguro.',warning:'Sin códigos de recuperación, perderás acceso si pierdes tu dispositivo 2FA.'},
        ]} />
      </ArticleSection>
      <ArticleSection id="sesiones" title="Sesiones activas" icon={Shield} accentColor={ACCENT}>
        <InfoCallout type="info">En <strong>Configuración → Seguridad → Sesiones</strong> puedes ver todos los dispositivos con sesión activa y cerrar las que no reconozcas.</InfoCallout>
        <InfoCallout type="tip">Si sospechas de un acceso no autorizado, <strong>cierra todas las sesiones</strong> y cambia tu contraseña inmediatamente.</InfoCallout>
      </ArticleSection>
    </ArticleLayout>
  );
}
