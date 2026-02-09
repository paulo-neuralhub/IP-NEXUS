import { UserPlus, Users, Bell } from 'lucide-react';
import { ArticleLayout } from '../ArticleLayout';
import { ArticleSection } from '../ArticleSection';
import { StepByStep } from '../StepByStep';
import { InfoCallout } from '../InfoCallout';
import { IllustrationCRM } from '../illustrations';

const ACCENT = '#0EA5E9';

export function Docket005Content() {
  return (
    <ArticleLayout title="Asignar expediente a un miembro" subtitle="Asigna responsables para que tu equipo sepa quién gestiona qué." icon={UserPlus} accentColor={ACCENT} category="IP-Docket" categorySlug="portfolio" readTime="2 min" lastUpdated="Febrero 2026" tags={['asignar','equipo','responsable']} tocSections={[{id:'asignar',title:'Cómo asignar'},{id:'permisos',title:'Permisos'}]} relatedArticles={[{title:'Invitar a tu equipo',path:'/app/help/article/invitar-equipo',readTime:'3 min'},{title:'Equipo y permisos',path:'/app/help/article/equipo-permisos',readTime:'4 min'}]}>
      <div className="flex justify-center mb-8"><IllustrationCRM size={150} /></div>
      <p className="text-[15px] text-foreground/80 leading-relaxed">Asignar expedientes a miembros del equipo mejora la <strong>organización y responsabilidad</strong>. El responsable recibe las notificaciones de plazos.</p>

      <ArticleSection id="asignar" title="Cómo asignar un expediente" icon={UserPlus} accentColor={ACCENT} variant="highlighted">
        <StepByStep accentColor={ACCENT} steps={[
          {title:'Abre el expediente',description:'Navega al expediente que quieres asignar.'},
          {title:'Edita el campo "Asignado a"',description:'En la sección de datos generales, haz click en el campo "Asignado a" y selecciona un miembro del equipo.'},
          {title:'Confirma la asignación',description:'El miembro recibirá una notificación y verá el expediente en su lista de "Mis expedientes".',tip:'Puedes asignar expedientes masivamente desde la vista de tabla.'},
        ]} />
      </ArticleSection>

      <ArticleSection id="permisos" title="Permisos de los asignados" icon={Users} accentColor={ACCENT}>
        <InfoCallout type="info">Los miembros con rol <strong>Member</strong> solo pueden ver y editar los expedientes que tienen asignados. Los roles superiores ven todos.</InfoCallout>
        <InfoCallout type="tip">Configura <strong>alertas de equipo</strong> para que el manager reciba también las notificaciones de plazos de los expedientes asignados a su equipo.</InfoCallout>
      </ArticleSection>
    </ArticleLayout>
  );
}
