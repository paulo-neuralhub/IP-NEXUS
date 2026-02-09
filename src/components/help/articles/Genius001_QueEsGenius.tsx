import { HelpCallout } from '../HelpCallout';
import { Brain, MessageSquare, FileText, Search, Scale, BarChart3 } from 'lucide-react';

export function Genius001Content() {
  return (
    <>
      <p>
        <strong>IP-Genius</strong> es la suite de inteligencia artificial integrada en IP-NEXUS.
        No es un único asistente, sino un conjunto de agentes especializados, cada uno diseñado
        para una tarea concreta de la gestión de PI.
      </p>

      <HelpCallout type="info">
        IP-Genius está disponible en los planes Professional y superiores. En el plan Starter
        puedes usar NEXUS Guide (asistente de ayuda) de forma ilimitada.
      </HelpCallout>

      <h2 className="text-lg font-semibold text-foreground mt-8 mb-4">Agentes disponibles</h2>

      <div className="grid gap-4 md:grid-cols-2 mb-6">
        {[
          { icon: MessageSquare, name: 'NEXUS Guide', desc: 'Asistente de ayuda. Responde preguntas sobre cómo usar IP-NEXUS y te guía por la aplicación.', color: '#0EA5E9' },
          { icon: Scale, name: 'NEXUS Legal', desc: 'Consultas de legislación IP. Responde preguntas sobre normativa de marcas, patentes y diseños.', color: '#8B5CF6' },
          { icon: Search, name: 'NEXUS Watch', desc: 'Análisis de alertas de vigilancia. Evalúa el riesgo de marcas similares detectadas por Spider.', color: '#F59E0B' },
          { icon: FileText, name: 'NEXUS Ops', desc: 'Automatización de tareas. Completa campos, sugiere clasificaciones y genera documentos.', color: '#10B981' },
          { icon: BarChart3, name: 'NEXUS Analyst', desc: 'Análisis estratégico. Evalúa tu portfolio y sugiere oportunidades de protección.', color: '#EC4899' },
          { icon: Brain, name: 'NEXUS Strategist', desc: 'Estrategia de PI. Recomienda jurisdicciones, timing y enfoque de protección.', color: '#F97316' },
        ].map((agent) => (
          <div key={agent.name} className="p-4 rounded-xl border border-border bg-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${agent.color}15` }}>
                <agent.icon className="w-4.5 h-4.5" style={{ color: agent.color }} />
              </div>
              <span className="text-sm font-semibold text-foreground">{agent.name}</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{agent.desc}</p>
          </div>
        ))}
      </div>

      <h2 className="text-lg font-semibold text-foreground mt-8 mb-4">¿Cómo funciona?</h2>
      <ol className="list-decimal list-inside text-sm text-foreground/80 space-y-2 mb-6">
        <li>Abre el chat de Genius desde el botón flotante o el sidebar</li>
        <li>Selecciona el agente adecuado (o deja que el sistema elija automáticamente)</li>
        <li>Escribe tu consulta en lenguaje natural</li>
        <li>Recibe una respuesta contextualizada con fuentes y referencias</li>
      </ol>

      <HelpCallout type="tip">
        Para obtener mejores resultados, sé específico en tus consultas. En lugar de "¿puedo registrar esto?",
        prueba con "¿Puedo registrar la marca AURORA en clase 9 en la UE si ya existe una marca AURA registrada?".
      </HelpCallout>

      <HelpCallout type="warning">
        IP-Genius es una herramienta de asistencia, no sustituye el asesoramiento legal profesional.
        Siempre revisa las respuestas y consulta con un abogado para decisiones importantes.
      </HelpCallout>
    </>
  );
}
