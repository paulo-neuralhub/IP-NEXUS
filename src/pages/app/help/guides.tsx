/**
 * IP-NEXUS Help Center - Quick Guides Page
 * Step-by-step tutorials for common tasks
 */

import { Link } from 'react-router-dom';
import { 
  Rocket, Radar, Mail, Sparkles, Clock, ChevronRight,
  CheckCircle, PlayCircle, ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QUICK_GUIDES } from '@/lib/constants/help-content';

const ICON_MAP: Record<string, React.ElementType> = {
  settings: Rocket,
  radar: Radar,
  mail: Mail,
  sparkles: Sparkles,
};

export default function GuidesPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Guías Rápidas</h1>
        <p className="text-muted-foreground">
          Tutoriales paso a paso para sacar el máximo partido a IP-NEXUS
        </p>
      </div>

      {/* Guides Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {QUICK_GUIDES.map((guide) => {
          const Icon = ICON_MAP[guide.icon] || Rocket;
          
          return (
            <Card key={guide.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {guide.duration}
                  </Badge>
                </div>
                <CardTitle className="text-lg mt-3">{guide.title}</CardTitle>
                <CardDescription>{guide.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  {guide.steps.map((step, index) => (
                    <div key={index} className="flex items-start gap-3 text-sm">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                        {index + 1}
                      </div>
                      <span className="text-muted-foreground">{step}</span>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full group">
                  Ver guía completa
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Start Tour CTA */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="flex items-center justify-between p-6">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-full bg-primary/20">
              <PlayCircle className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">¿Primera vez en IP-NEXUS?</h3>
              <p className="text-muted-foreground">
                Inicia el tour interactivo y descubre todas las funcionalidades
              </p>
            </div>
          </div>
          <Button size="lg">
            <PlayCircle className="w-5 h-5 mr-2" />
            Iniciar Tour
          </Button>
        </CardContent>
      </Card>

      {/* Additional Resources */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link to="/app/help/videos" className="block">
          <Card className="hover:shadow-md transition-shadow h-full">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="p-3 rounded-lg bg-destructive/10">
                <PlayCircle className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <p className="font-medium">Video Tutoriales</p>
                <p className="text-sm text-muted-foreground">
                  Aprende viendo
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground ml-auto" />
            </CardContent>
          </Card>
        </Link>

        <Link to="/app/help/faq" className="block">
          <Card className="hover:shadow-md transition-shadow h-full">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="p-3 rounded-lg bg-primary/10">
                <CheckCircle className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-medium">FAQs</p>
                <p className="text-sm text-muted-foreground">
                  Preguntas frecuentes
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground ml-auto" />
            </CardContent>
          </Card>
        </Link>

        <Link to="/app/help/tickets/new" className="block">
          <Card className="hover:shadow-md transition-shadow h-full">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="p-3 rounded-lg bg-success/10">
                <Mail className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="font-medium">Contactar Soporte</p>
                <p className="text-sm text-muted-foreground">
                  Estamos para ayudarte
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground ml-auto" />
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
