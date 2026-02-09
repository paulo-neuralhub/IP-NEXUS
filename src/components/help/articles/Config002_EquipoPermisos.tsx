import { Shield, Users, Lock } from 'lucide-react';
import { ArticleLayout } from '../ArticleLayout';
import { ArticleSection } from '../ArticleSection';
import { DataTable } from '../DataTable';
import { InfoCallout } from '../InfoCallout';
import { IllustrationSettings } from '../illustrations';
const ACCENT = '#64748B';
export function Config002Content() {
  return (
    <ArticleLayout title="Gestionar equipo y permisos" subtitle="Administra los miembros, roles y permisos de acceso." icon={Shield} accentColor={ACCENT} category="Configuración" categorySlug="configuracion" readTime="4 min" lastUpdated="Febrero 2026" tags={['equipo','permisos','roles','admin']} tocSections={[{id:'roles',title:'Roles disponibles'},{id:'permisos',title:'Permisos granulares'}]} relatedArticles={[{title:'Invitar al equipo',path:'/app/help/article/invitar-equipo',readTime:'2 min'}]}>
      <div className="flex justify-center mb-8"><IllustrationSettings size={150} /></div>
      <p className="text-[15px] text-foreground/80 leading-relaxed">Cada miembro puede tener un <strong>rol con permisos específicos</strong> que controlan qué puede ver y hacer.</p>
      <ArticleSection id="roles" title="Roles disponibles" icon={Users} accentColor={ACCENT} variant="highlighted">
        <DataTable headers={['Rol','Descripción','Acceso']} rows={[['Owner','Propietario de la organización','Todo + facturación'],['Admin','Administrador','Todo excepto facturación'],['Manager','Gestor de equipo','CRUD expedientes + CRM + reportes'],['Member','Miembro','Ver/editar expedientes asignados'],['Viewer','Solo lectura','Ver expedientes y dashboards'],['External','Portal cliente','Solo sus expedientes']]} />
      </ArticleSection>
      <ArticleSection id="permisos" title="Permisos granulares" icon={Lock} accentColor={ACCENT}>
        <InfoCallout type="info">Además de los roles predefinidos, puedes crear <strong>permisos personalizados</strong> por módulo: Docket, CRM, Finance, Spider, Marketing.</InfoCallout>
        <InfoCallout type="tip">Ejemplo: un miembro puede tener acceso de lectura a todos los expedientes pero solo edición en los que tenga asignados.</InfoCallout>
        <InfoCallout type="warning">Los permisos granulares están disponibles a partir del plan <strong>Professional</strong>.</InfoCallout>
      </ArticleSection>
    </ArticleLayout>
  );
}
