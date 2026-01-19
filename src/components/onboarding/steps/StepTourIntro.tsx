import { Button } from '@/components/ui/button';
import {
  ChevronRight,
  Sparkles,
  FolderKanban,
  Eye,
  Bot,
  FileText,
  BarChart3,
} from 'lucide-react';

interface StepTourIntroProps {
  onComplete: () => void;
}

const FEATURES = [
  {
    icon: FolderKanban,
    title: 'Docket',
    description: 'Gestiona expedientes de PI',
    color: 'text-module-docket',
    bg: 'bg-module-docket/10',
  },
  {
    icon: Eye,
    title: 'Spider',
    description: 'Vigilancia de marcas',
    color: 'text-module-spider',
    bg: 'bg-module-spider/10',
  },
  {
    icon: Bot,
    title: 'Genius',
    description: 'Asistente IA',
    color: 'text-module-genius',
    bg: 'bg-module-genius/10',
  },
  {
    icon: FileText,
    title: 'Filing',
    description: 'E-filing directo',
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
  {
    icon: BarChart3,
    title: 'Finance',
    description: 'Costes y valoración',
    color: 'text-module-finance',
    bg: 'bg-module-finance/10',
  },
];

export function StepTourIntro({ onComplete }: StepTourIntroProps) {
  return (
    <div className="text-center py-4">
      <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
        <Sparkles className="h-10 w-10 text-primary-foreground" />
      </div>
      
      <h2 className="text-2xl font-bold mb-2">¡Todo listo!</h2>
      <p className="text-muted-foreground mb-8">
        Tu espacio de trabajo está configurado. Esto es lo que puedes hacer:
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
        {FEATURES.map((feature) => (
          <div key={feature.title} className="text-center">
            <div className={`w-12 h-12 ${feature.bg} rounded-full flex items-center justify-center mx-auto mb-2`}>
              <feature.icon className={`h-6 w-6 ${feature.color}`} />
            </div>
            <p className="text-sm font-medium">{feature.title}</p>
            <p className="text-xs text-muted-foreground hidden sm:block">{feature.description}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-3">
        <Button variant="outline" onClick={onComplete}>
          Saltar tour
        </Button>
        <Button onClick={onComplete}>
          Comenzar a usar IP-NEXUS
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      <p className="text-xs text-muted-foreground mt-6">
        Puedes acceder al tour guiado en cualquier momento desde el menú de Ayuda
      </p>
    </div>
  );
}
