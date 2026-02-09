import { Users, UserPlus, Search } from 'lucide-react';
import { ArticleLayout } from '../ArticleLayout';
import { ArticleSection } from '../ArticleSection';
import { StepByStep } from '../StepByStep';
import { InfoCallout } from '../InfoCallout';
import { FeatureGrid } from '../FeatureGrid';
import { IllustrationCRM } from '../illustrations';
const ACCENT = '#EC4899';
export function CRM002Content() {
  return (
    <ArticleLayout title="Crear y gestionar contactos" subtitle="Añade contactos, empresas y clientes con toda su información." icon={Users} accentColor={ACCENT} category="CRM" categorySlug="crm" readTime="3 min" lastUpdated="Febrero 2026" tags={['contactos','crear','empresa','cliente']} tocSections={[{id:'crear',title:'Crear contacto'},{id:'tipos',title:'Tipos'},{id:'importar',title:'Importar'}]} relatedArticles={[{title:'Introducción al CRM',path:'/app/help/article/introduccion-crm',readTime:'3 min'}]}>
      <div className="flex justify-center mb-8"><IllustrationCRM size={150} /></div>
      <p className="text-[15px] text-foreground/80 leading-relaxed">Los contactos son la base de tu CRM. Crea personas y empresas, vincula expedientes y mantén <strong>toda la información centralizada</strong>.</p>
      <ArticleSection id="crear" title="Crear un contacto" icon={UserPlus} accentColor={ACCENT} variant="highlighted">
        <StepByStep accentColor={ACCENT} steps={[
          {title:'Ve a CRM → Contactos',description:'Haz click en "Nuevo contacto" o usa el atajo Ctrl+Shift+C.'},
          {title:'Elige el tipo',description:'Selecciona si es una persona física o una empresa/organización.'},
          {title:'Rellena los datos',description:'Nombre, email, teléfono, empresa, cargo. Solo el nombre es obligatorio.',tip:'Añade etiquetas para segmentar fácilmente: "Cliente VIP", "Lead", "Proveedor", etc.'},
        ]} />
      </ArticleSection>
      <ArticleSection id="tipos" title="Tipos de contacto" icon={Users} accentColor={ACCENT}>
        <FeatureGrid features={[
          {emoji:'👤',title:'Persona',description:'Persona física con datos de contacto individuales.',accentColor:'#3B82F6'},
          {emoji:'🏢',title:'Empresa',description:'Organización con personas asociadas.',accentColor:'#10B981'},
        ]} columns={2} />
      </ArticleSection>
      <ArticleSection id="importar" title="Importar contactos" icon={Search} accentColor={ACCENT} variant="highlighted">
        <InfoCallout type="tip">Importa contactos masivamente desde <strong>CSV o Excel</strong> en CRM → Contactos → Importar.</InfoCallout>
        <InfoCallout type="info">Los contactos duplicados se detectan automáticamente por email y se fusionan.</InfoCallout>
      </ArticleSection>
    </ArticleLayout>
  );
}
