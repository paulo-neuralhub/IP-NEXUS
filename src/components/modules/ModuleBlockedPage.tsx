// =============================================
// COMPONENTE: ModuleBlockedPage
// Página completa cuando se accede a módulo bloqueado
// src/components/modules/ModuleBlockedPage.tsx
// =============================================

import { useNavigate } from 'react-router-dom';
import { 
  Lock, 
  Check, 
  ArrowLeft, 
  Gift, 
  Zap,
  Star,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useModulesContext } from '@/contexts/ModulesContext';
import { cn } from '@/lib/utils';
import type { ModuleWithStatus } from '@/types/modules';

interface ModuleBlockedPageProps {
  moduleCode: string;
}

export function ModuleBlockedPage({ moduleCode }: ModuleBlockedPageProps) {
  const navigate = useNavigate();
  const { 
    modulesWithStatus, 
    showActivationPopup,
    startModuleTrial,
    isStartingTrial,
    canActivateModule,
  } = useModulesContext();

  const module = modulesWithStatus.find(m => m.code === moduleCode);

  if (!module) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Módulo no encontrado</h1>
          <Button onClick={() => navigate(-1)} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>
      </div>
    );
  }

  const canActivate = canActivateModule(moduleCode);

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Hero Section */}
      <div 
        className="relative py-16 px-6"
        style={{ 
          background: `linear-gradient(135deg, ${module.color}15 0%, ${module.color}05 100%)` 
        }}
      >
        {/* Botón volver */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 text-muted-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>

        <div className="max-w-2xl mx-auto text-center">
          {/* Icono con candado */}
          <div className="relative inline-block mb-6">
            <div 
              className="w-24 h-24 rounded-2xl flex items-center justify-center text-4xl"
              style={{ backgroundColor: `${module.color}20` }}
            >
              {module.icon}
            </div>
            <div 
              className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-muted flex items-center justify-center"
            >
              <Lock className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          {/* Título y descripción */}
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {module.name}
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            {module.tagline}
          </p>

          {/* Badges */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {module.is_popular && (
              <Badge className="bg-warning/20 text-warning border-warning/30">
                <Star className="h-3 w-3 mr-1 fill-current" />
                Popular
              </Badge>
            )}
            <Badge variant="outline">
              {module.category === 'standalone' ? 'Módulo base' : 
               module.category === 'addon' ? 'Add-on' : 'Transversal'}
            </Badge>
            {module.effective_price && (
              <Badge variant="secondary">
                €{module.effective_price}/mes
              </Badge>
            )}
          </div>

          {/* CTAs principales */}
          {canActivate.can_activate && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                size="lg"
                onClick={() => startModuleTrial(moduleCode)}
                disabled={isStartingTrial}
                className="shadow-lg"
                style={{ backgroundColor: module.color }}
              >
                <Gift className="h-5 w-5 mr-2" />
                Probar 14 días gratis
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => showActivationPopup(moduleCode)}
              >
                <Zap className="h-5 w-5 mr-2" />
                Suscribirse
              </Button>
            </div>
          )}

          {/* Mensaje si no puede activar */}
          {!canActivate.can_activate && (
            <div className="max-w-md mx-auto p-4 bg-warning/10 border border-warning/30 rounded-lg text-left">
              {canActivate.reason === 'missing_dependencies' && (
                <>
                  <p className="text-sm font-medium text-warning-foreground">
                    Este módulo requiere:
                  </p>
                  <p className="text-sm text-warning-foreground font-bold mt-1">
                    {canActivate.missing_modules?.join(' + ')}
                  </p>
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 h-auto mt-2 text-warning-foreground"
                    onClick={() => {
                      const firstMissing = module.missing_dependencies[0];
                      if (firstMissing) showActivationPopup(firstMissing);
                    }}
                  >
                    Activar módulos requeridos →
                  </Button>
                </>
              )}
              {canActivate.reason === 'addon_limit_reached' && (
                <>
                  <p className="text-sm font-medium text-warning-foreground">
                    Has alcanzado el límite de add-ons
                  </p>
                  <p className="text-sm text-warning-foreground mt-1">
                    Tu plan permite {canActivate.max_addons} add-ons.
                  </p>
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 h-auto mt-2 text-warning-foreground"
                    onClick={() => navigate('/pricing')}
                  >
                    Mejorar mi plan →
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Grid de features */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-foreground mb-6 text-center">
            ¿Qué incluye {module.short_name || module.name}?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {module.features.map((feature, idx) => (
              <Card key={idx} className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${module.color}15` }}
                    >
                      <Check className="h-4 w-4" style={{ color: module.color }} />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {feature.title}
                      </p>
                      {feature.description && (
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {feature.description}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Módulos relacionados */}
        <RelatedModulesSection 
          currentModule={module} 
          onModuleClick={(code) => navigate(`/app/${code}`)}
        />

        {/* CTA final */}
        {canActivate.can_activate && (
          <div className="text-center mt-12 p-8 bg-card rounded-xl border">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              ¿Listo para empezar?
            </h3>
            <Button
              size="lg"
              onClick={() => startModuleTrial(moduleCode)}
              disabled={isStartingTrial}
              style={{ backgroundColor: module.color }}
            >
              <Gift className="h-5 w-5 mr-2" />
              Comenzar prueba gratuita de 14 días
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// =============================================
// Subcomponente: Módulos relacionados
// =============================================

interface RelatedModulesSectionProps {
  currentModule: ModuleWithStatus;
  onModuleClick: (code: string) => void;
}

function RelatedModulesSection({ currentModule, onModuleClick }: RelatedModulesSectionProps) {
  const { modulesWithStatus } = useModulesContext();
  
  // Módulos de la misma sección que no están activos
  const relatedModules = modulesWithStatus
    .filter(m => 
      m.code !== currentModule.code && 
      m.sidebar_section === currentModule.sidebar_section &&
      !m.is_accessible &&
      m.visual_status !== 'coming_soon'
    )
    .slice(0, 4);

  if (relatedModules.length === 0) return null;

  return (
    <div className="mb-12">
      <h3 className="text-lg font-semibold text-foreground mb-4 text-center">
        Otros módulos que te pueden interesar
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {relatedModules.map(m => (
          <button
            key={m.code}
            onClick={() => onModuleClick(m.code)}
            className={cn(
              'p-4 bg-card border rounded-xl text-left',
              'hover:border-primary/30 hover:shadow-md transition-all',
              'group'
            )}
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{m.icon}</span>
              <div>
                <p className="font-medium text-foreground text-sm">
                  {m.short_name || m.name}
                </p>
                {m.effective_price && (
                  <p className="text-xs text-muted-foreground">
                    €{m.effective_price}/mes
                  </p>
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {m.tagline}
            </p>
            <div className="mt-2 text-xs text-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              Ver más
              <ArrowRight className="h-3 w-3" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
