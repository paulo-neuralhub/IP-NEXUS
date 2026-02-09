import { Building, Image, FileText } from 'lucide-react';
import { ArticleLayout } from '../ArticleLayout';
import { ArticleSection } from '../ArticleSection';
import { StepByStep } from '../StepByStep';
import { InfoCallout } from '../InfoCallout';
import { IllustrationSettings } from '../illustrations';
const ACCENT = '#64748B';
export function Config001Content() {
  return (
    <ArticleLayout title="Ajustes de organización" subtitle="Modifica el nombre, logo, datos fiscales y preferencias." icon={Building} accentColor={ACCENT} category="Configuración" categorySlug="configuracion" readTime="3 min" lastUpdated="Febrero 2026" tags={['configuración','organización','logo','nombre']} tocSections={[{id:'datos',title:'Datos básicos'},{id:'branding',title:'Branding'}]} relatedArticles={[{title:'Equipo y permisos',path:'/app/help/article/equipo-permisos',readTime:'4 min'}]}>
      <div className="flex justify-center mb-8"><IllustrationSettings size={150} /></div>
      <p className="text-[15px] text-foreground/80 leading-relaxed">Configura tu organización para que IP-NEXUS refleje la <strong>identidad de tu despacho</strong>.</p>
      <ArticleSection id="datos" title="Datos básicos" icon={Building} accentColor={ACCENT} variant="highlighted">
        <StepByStep accentColor={ACCENT} steps={[
          {title:'Ve a Configuración → Organización',description:'Encontrarás los datos generales de tu organización.'},
          {title:'Edita los campos',description:'Nombre, dirección, teléfono, email de contacto, CIF/NIF, datos fiscales.'},
          {title:'Guarda los cambios',description:'Los cambios se aplican inmediatamente en toda la plataforma.',tip:'Los datos fiscales se usan automáticamente en las facturas que generes.'},
        ]} />
      </ArticleSection>
      <ArticleSection id="branding" title="Logo y branding" icon={Image} accentColor={ACCENT}>
        <InfoCallout type="tip">Sube tu <strong>logo en formato PNG o SVG</strong> (fondo transparente recomendado). Se usará en facturas, informes, portal de cliente y emails.</InfoCallout>
        <InfoCallout type="info">Puedes personalizar los <strong>colores de la interfaz</strong> para que coincidan con tu identidad corporativa (disponible en plan Business+).</InfoCallout>
      </ArticleSection>
    </ArticleLayout>
  );
}
