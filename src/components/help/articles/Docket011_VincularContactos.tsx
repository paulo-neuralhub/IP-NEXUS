import { Users, Link, UserPlus } from 'lucide-react';
import { ArticleLayout } from '../ArticleLayout';
import { ArticleSection } from '../ArticleSection';
import { StepByStep } from '../StepByStep';
import { InfoCallout } from '../InfoCallout';
import { IllustrationCRM } from '../illustrations';
const ACCENT = '#0EA5E9';
export function Docket011Content() {
  return (
    <ArticleLayout title="Vincular contactos a un expediente" subtitle="Asocia clientes, representantes y terceros a tus expedientes." icon={Users} accentColor={ACCENT} category="IP-Docket" categorySlug="portfolio" readTime="2 min" lastUpdated="Febrero 2026" tags={['contactos','vincular','cliente','representante']} tocSections={[{id:'vincular',title:'Cómo vincular'},{id:'roles',title:'Roles de contacto'}]} relatedArticles={[{title:'Gestionar contactos',path:'/app/help/article/gestionar-contactos',readTime:'3 min'}]}>
      <div className="flex justify-center mb-8"><IllustrationCRM size={150} /></div>
      <p className="text-[15px] text-foreground/80 leading-relaxed">Vincula contactos del CRM a tus expedientes para mantener <strong>toda la información conectada</strong>.</p>
      <ArticleSection id="vincular" title="Cómo vincular un contacto" icon={Link} accentColor={ACCENT} variant="highlighted">
        <StepByStep accentColor={ACCENT} steps={[
          {title:'Abre la pestaña Contactos',description:'Dentro del expediente, ve a la pestaña "Contactos" o "Partes".'},
          {title:'Añade un contacto',description:'Haz click en "Vincular contacto" y busca por nombre o email. Selecciona el rol: titular, representante, oponente, etc.'},
          {title:'Confirma',description:'El contacto aparecerá vinculado y podrás ver el expediente desde su ficha del CRM.',tip:'Un contacto puede estar vinculado a múltiples expedientes con diferentes roles.'},
        ]} />
      </ArticleSection>
      <ArticleSection id="roles" title="Roles de contacto" icon={UserPlus} accentColor={ACCENT}>
        <InfoCallout type="info">Los roles disponibles son: <strong>Titular</strong>, <strong>Representante</strong>, <strong>Inventor</strong>, <strong>Oponente</strong>, <strong>Licenciatario</strong> y <strong>Tercero</strong>.</InfoCallout>
        <InfoCallout type="tip">Si usas el <strong>portal de cliente</strong>, los contactos con rol Titular podrán ver el estado de sus expedientes.</InfoCallout>
      </ArticleSection>
    </ArticleLayout>
  );
}
