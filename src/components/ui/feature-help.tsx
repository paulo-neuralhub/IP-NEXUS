import { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export interface FeatureHelpProps {
  title: string;
  description: string;
  tips?: readonly string[] | string[];
  learnMoreUrl?: string;
  size?: 'sm' | 'md';
}

/**
 * Reusable contextual help component.
 * Shows a help icon that opens a popover with feature description and tips.
 * Can be used throughout the app for inline help.
 */
export function FeatureHelp({ 
  title, 
  description, 
  tips, 
  learnMoreUrl,
  size = 'sm' 
}: FeatureHelpProps) {
  const [open, setOpen] = useState(false);
  
  const iconSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
  const buttonSize = size === 'sm' ? 'h-6 w-6' : 'h-8 w-8';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`${buttonSize} rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10`}
          onClick={(e) => e.stopPropagation()}
        >
          <HelpCircle className={iconSize} />
          <span className="sr-only">Ayuda sobre {title}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-4" 
        side="bottom" 
        align="start"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-3">
          <div className="space-y-1">
            <h4 className="font-semibold text-foreground">{title}</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {description}
            </p>
          </div>
          
          {tips && tips.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Tips
              </p>
              <ul className="space-y-1">
                {tips.map((tip, index) => (
                  <li 
                    key={index} 
                    className="text-sm text-muted-foreground flex items-start gap-2"
                  >
                    <span className="text-primary mt-1">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {learnMoreUrl && (
            <a
              href={learnMoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm text-primary hover:underline"
            >
              Saber más →
            </a>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Predefined help content for common features
export const FEATURE_HELP_CONTENT = {
  smartTasks: {
    title: 'Smart Tasks',
    description: 'Sistema inteligente de tareas con "Date Trident" - gestión automática de fechas de activación, recordatorio y vencimiento. Las tareas se generan automáticamente según las reglas de jurisdicción.',
    tips: [
      'Las tareas vencidas se marcan en rojo automáticamente',
      'Usa filtros para ver solo tareas pendientes o urgentes',
      'El sistema calcula días hábiles excluyendo festivos'
    ]
  },
  portfolios: {
    title: 'Portfolios',
    description: 'Organiza tus expedientes en carpetas jerárquicas. Agrupa por cliente, tipo de activo, jurisdicción o cualquier criterio que necesites.',
    tips: [
      'Crea sub-portfolios para organización granular',
      'Asigna colores para identificar rápidamente',
      'Arrastra expedientes entre portfolios'
    ]
  },
  emailIngestion: {
    title: 'Ingesta de Emails',
    description: 'Sistema de IA que procesa automáticamente emails de oficinas de PI, extrae información relevante y la vincula a expedientes existentes o crea nuevos.',
    tips: [
      'Los emails se procesan automáticamente al llegar',
      'Revisa los que requieren revisión manual',
      'El nivel de confianza indica la certeza del análisis'
    ]
  },
  jurisdictionRules: {
    title: 'Reglas de Jurisdicción',
    description: 'Configura reglas automáticas por jurisdicción: plazos, días hábiles, festivos y acciones automáticas cuando ocurren eventos específicos.',
    tips: [
      'Las reglas del sistema son predefinidas y no editables',
      'Crea reglas personalizadas para casos especiales',
      'Asocia reglas a tipos de expediente específicos'
    ]
  },
  familyTree: {
    title: 'Árbol Familiar',
    description: 'Visualiza las relaciones entre expedientes: prioridades, divisionales, continuaciones y extensiones territoriales en un diagrama interactivo.',
    tips: [
      'Haz zoom para ver detalles o el panorama completo',
      'Click en un nodo para ver detalles del expediente',
      'Los colores indican el tipo de relación'
    ]
  }
} as const;
