import { GitBranch, Settings, Zap } from 'lucide-react';
import { ArticleLayout } from '../ArticleLayout';
import { ArticleSection } from '../ArticleSection';
import { PipelineVisual } from '../PipelineVisual';
import { InfoCallout } from '../InfoCallout';
import { DataTable } from '../DataTable';
import { IllustrationDashboard } from '../illustrations';

const ACCENT = '#0EA5E9';

export function Docket006Content() {
  return (
    <ArticleLayout title="Estados y flujo de trabajo" subtitle="Los estados por los que pasa un expediente y cómo configurar tu flujo." icon={GitBranch} accentColor={ACCENT} category="IP-Docket" categorySlug="portfolio" readTime="4 min" lastUpdated="Febrero 2026" tags={['estados','flujo','workflow','proceso']} tocSections={[{id:'flujo',title:'Flujo de estados'},{id:'estados',title:'Tabla de estados'},{id:'automatizar',title:'Automatizaciones'}]} relatedArticles={[{title:'Crear expediente',path:'/app/help/article/crear-expediente',readTime:'6 min'},{title:'Plazos y vencimientos',path:'/app/help/article/plazos-vencimientos',readTime:'3 min'}]}>
      <div className="flex justify-center mb-8"><IllustrationDashboard size={150} /></div>
      <p className="text-[15px] text-foreground/80 leading-relaxed">Cada expediente sigue un <strong>flujo de estados</strong> que refleja su ciclo de vida. IP-NEXUS automatiza las transiciones y acciones asociadas.</p>

      <ArticleSection id="flujo" title="Flujo de estados" icon={GitBranch} accentColor={ACCENT} variant="highlighted">
        <PipelineVisual title="Ciclo de vida de un expediente" accentColor={ACCENT} stages={[
          {emoji:'📝',label:'Borrador'},{emoji:'📤',label:'Presentado'},{emoji:'🔍',label:'En examen'},{emoji:'📢',label:'Publicado'},{emoji:'✅',label:'Concedido'},{emoji:'🔄',label:'Renovación'},
        ]} />
      </ArticleSection>

      <ArticleSection id="estados" title="Tabla de estados" icon={Settings} accentColor={ACCENT}>
        <DataTable headers={['Estado','Descripción','Acción automática']} rows={[['📝 Borrador','En preparación','—'],['📤 Presentado','Solicitud enviada','Crear plazos'],['🔍 En examen','Oficina revisando','Alerta si >6 meses'],['📢 Publicado','En período oposición','Activar vigilancia'],['✅ Concedido','Derecho otorgado','Email al cliente'],['🔄 Renovación','Pendiente renovar','Alertas renovación'],['❌ Denegado','Solicitud rechazada','Notificar cliente'],['📁 Archivado','Expediente cerrado','—']]} />
      </ArticleSection>

      <ArticleSection id="automatizar" title="Automatizaciones" icon={Zap} accentColor={ACCENT} variant="highlighted">
        <InfoCallout type="tip">Configura <strong>acciones automáticas</strong> al cambiar de estado: enviar emails, crear plazos, notificar al equipo o activar vigilancia en Spider.</InfoCallout>
        <InfoCallout type="info">Las automatizaciones se configuran en <strong>Configuración → Workflows → Automatizaciones por estado</strong>.</InfoCallout>
      </ArticleSection>
    </ArticleLayout>
  );
}
