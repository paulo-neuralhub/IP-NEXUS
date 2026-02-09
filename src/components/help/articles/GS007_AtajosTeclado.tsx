import { Keyboard, Command, Zap } from 'lucide-react';
import { ArticleLayout } from '../ArticleLayout';
import { ArticleSection } from '../ArticleSection';
import { DataTable } from '../DataTable';
import { InfoCallout } from '../InfoCallout';
import { IllustrationKeyboard } from '../illustrations';

const ACCENT = '#3B82F6';

export function GS007Content() {
  return (
    <ArticleLayout title="Atajos de teclado" subtitle="Trabaja más rápido con los atajos de teclado de IP-NEXUS." icon={Keyboard} accentColor={ACCENT} category="Primeros Pasos" categorySlug="getting-started" readTime="2 min" lastUpdated="Febrero 2026" tags={['atajos','teclado','shortcuts','productividad']} tocSections={[{id:'globales',title:'Atajos globales'},{id:'expedientes',title:'En expedientes'},{id:'navegacion',title:'Navegación'}]} relatedArticles={[{title:'Entender la navegación',path:'/app/help/article/navegacion-ipnexus',readTime:'3 min'}]}>
      <div className="flex justify-center mb-8"><IllustrationKeyboard size={150} /></div>
      <p className="text-[15px] text-foreground/80 leading-relaxed">Los atajos de teclado te permiten navegar y ejecutar acciones sin tocar el ratón. Aprende los más <strong>útiles</strong> para multiplicar tu productividad.</p>

      <ArticleSection id="globales" title="Atajos globales" icon={Command} accentColor={ACCENT} variant="highlighted">
        <DataTable headers={['Atajo','Acción']} rows={[['⌘/Ctrl + K','Búsqueda global'],['⌘/Ctrl + N','Nuevo expediente'],['⌘/Ctrl + J','Abrir Genius AI'],['⌘/Ctrl + B','Toggle sidebar'],['⌘/Ctrl + ,','Configuración'],['Esc','Cerrar modal/panel']]} />
      </ArticleSection>

      <ArticleSection id="expedientes" title="Dentro de un expediente" icon={Keyboard} accentColor={ACCENT}>
        <DataTable headers={['Atajo','Acción']} rows={[['E','Editar campo seleccionado'],['D','Ir a documentos'],['T','Ir a timeline'],['N','Añadir nota rápida'],['⌘/Ctrl + S','Guardar cambios']]} />
        <InfoCallout type="tip">Puedes ver todos los atajos disponibles pulsando <strong>⌘/Ctrl + /</strong> desde cualquier página.</InfoCallout>
      </ArticleSection>

      <ArticleSection id="navegacion" title="Navegación rápida" icon={Zap} accentColor={ACCENT} variant="highlighted">
        <DataTable headers={['Atajo','Destino']} rows={[['G + D','Dashboard'],['G + E','Expedientes'],['G + C','CRM'],['G + S','Spider'],['G + A','Genius AI']]} />
        <InfoCallout type="info">Los atajos de navegación requieren pulsar <strong>G</strong> seguido de la letra correspondiente en rápida sucesión.</InfoCallout>
      </ArticleSection>
    </ArticleLayout>
  );
}
