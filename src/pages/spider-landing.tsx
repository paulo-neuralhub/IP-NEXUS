import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Eye,
  Shield,
  Zap,
  Globe,
  Bell,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Play,
  Building2,
  Scale,
  Briefcase,
  Clock,
  Target,
  TrendingUp,
  Lock,
  Database,
  Cpu,
} from 'lucide-react';

const features = [
  {
    icon: Eye,
    title: 'Vigilancia 24/7',
    description: 'Monitoreo continuo de registros oficiales, dominios y marketplaces en tiempo real.',
  },
  {
    icon: Shield,
    title: 'Detección de Conflictos',
    description: 'Algoritmos avanzados de similitud fonética, visual y conceptual para marcas.',
  },
  {
    icon: Zap,
    title: 'Alertas Instantáneas',
    description: 'Notificaciones inmediatas cuando se detectan amenazas potenciales.',
  },
  {
    icon: Globe,
    title: 'Cobertura Global',
    description: 'Más de 200 jurisdicciones y fuentes oficiales monitoreadas.',
  },
  {
    icon: BarChart3,
    title: 'Análisis de Riesgo',
    description: 'Puntuación automática de amenazas con recomendaciones de acción.',
  },
  {
    icon: Bell,
    title: 'Plazos Críticos',
    description: 'Seguimiento de ventanas de oposición y fechas de renovación.',
  },
];

const tiers = [
  {
    name: 'Starter',
    price: '99',
    description: 'Para pequeños despachos y startups',
    features: [
      '5 watchlists activas',
      '100 términos monitoreados',
      '3 jurisdicciones',
      'Alertas por email',
      'Soporte estándar',
    ],
    cta: 'Comenzar gratis',
    highlighted: false,
  },
  {
    name: 'Professional',
    price: '299',
    description: 'Para despachos medianos',
    features: [
      '25 watchlists activas',
      '500 términos monitoreados',
      '15 jurisdicciones',
      'Alertas multicanal',
      'API access',
      'Análisis de similitud avanzado',
      'Soporte prioritario',
    ],
    cta: 'Prueba 14 días gratis',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'Para grandes organizaciones',
    features: [
      'Watchlists ilimitadas',
      'Términos ilimitados',
      'Todas las jurisdicciones',
      'Conectores personalizados',
      'White-label disponible',
      'SLA garantizado',
      'Account manager dedicado',
    ],
    cta: 'Contactar ventas',
    highlighted: false,
  },
];

const useCases = [
  {
    icon: Building2,
    title: 'Despachos de PI',
    description: 'Gestiona la vigilancia de cientos de marcas de tus clientes desde un solo panel.',
  },
  {
    icon: Scale,
    title: 'Departamentos Legales',
    description: 'Protege el portfolio de marcas de tu empresa con monitoreo proactivo.',
  },
  {
    icon: Briefcase,
    title: 'Agentes de Marcas',
    description: 'Ofrece servicios de vigilancia profesional a tus clientes.',
  },
];

const stats = [
  { value: '200+', label: 'Jurisdicciones' },
  { value: '50M+', label: 'Marcas monitoreadas' },
  { value: '99.9%', label: 'Uptime garantizado' },
  { value: '<1min', label: 'Tiempo de alerta' },
];

export default function SpiderLandingPage() {
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
              <Eye className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">Spider Pro</span>
            <Badge variant="secondary" className="ml-2">
              by IP-NEXUS
            </Badge>
          </div>
          <nav className="hidden items-center gap-6 md:flex">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground">
              Características
            </a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground">
              Precios
            </a>
            <a href="#use-cases" className="text-sm text-muted-foreground hover:text-foreground">
              Casos de uso
            </a>
          </nav>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost">Iniciar sesión</Button>
            </Link>
            <Link to="/register">
              <Button>Prueba gratis</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-500/5 via-transparent to-transparent" />
        <div className="container relative mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-4xl text-center"
          >
            <Badge className="mb-6 bg-violet-500/10 text-violet-600 hover:bg-violet-500/20">
              Motor de Vigilancia de PI #1 en Europa
            </Badge>
            <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl">
              Protege tu{' '}
              <span className="bg-gradient-to-r from-violet-500 to-purple-600 bg-clip-text text-transparent">
                Propiedad Intelectual
              </span>{' '}
              con IA
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground md:text-xl">
              Detecta conflictos de marcas, monitorea dominios y marketplaces, y recibe alertas
              instantáneas antes de que sea demasiado tarde.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to="/register">
                <Button size="lg" className="gap-2 bg-violet-600 hover:bg-violet-700">
                  Comenzar prueba gratuita
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="gap-2"
                onClick={() => setIsVideoOpen(true)}
              >
                <Play className="h-4 w-4" />
                Ver demo
              </Button>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-8 md:grid-cols-4"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-violet-600 md:text-4xl">{stat.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Todo lo que necesitas para vigilancia de PI
            </h2>
            <p className="text-lg text-muted-foreground">
              Herramientas profesionales para proteger marcas, patentes y nombres de dominio.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardHeader>
                    <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-violet-500/10">
                      <feature.icon className="h-6 w-6 text-violet-600" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">Cómo funciona</h2>
            <p className="text-lg text-muted-foreground">
              Tres simples pasos para proteger tu propiedad intelectual.
            </p>
          </div>
          <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
            {[
              {
                step: '01',
                icon: Target,
                title: 'Configura tu vigilancia',
                description:
                  'Define los términos, clases y jurisdicciones que quieres monitorear.',
              },
              {
                step: '02',
                icon: Cpu,
                title: 'Spider trabaja 24/7',
                description:
                  'Nuestros algoritmos escanean continuamente todas las fuentes oficiales.',
              },
              {
                step: '03',
                icon: Bell,
                title: 'Recibe alertas inteligentes',
                description: 'Te notificamos solo cuando hay amenazas reales que requieren acción.',
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.15 }}
                viewport={{ once: true }}
                className="relative text-center"
              >
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-violet-500/10">
                  <item.icon className="h-8 w-8 text-violet-600" />
                </div>
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-6xl font-bold text-violet-500/10">
                  {item.step}
                </div>
                <h3 className="mb-2 text-xl font-semibold">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section id="use-cases" className="border-t bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">Diseñado para profesionales</h2>
            <p className="text-lg text-muted-foreground">
              Spider Pro se adapta a las necesidades de cualquier organización.
            </p>
          </div>
          <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-3">
            {useCases.map((useCase, index) => (
              <motion.div
                key={useCase.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10">
                  <useCase.icon className="h-8 w-8 text-violet-600" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">{useCase.title}</h3>
                <p className="text-muted-foreground">{useCase.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">Precios transparentes</h2>
            <p className="text-lg text-muted-foreground">
              Elige el plan que mejor se adapte a tus necesidades. Sin sorpresas.
            </p>
          </div>
          <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
            {tiers.map((tier, index) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card
                  className={`relative h-full ${tier.highlighted ? 'border-violet-500 shadow-lg shadow-violet-500/10' : ''}`}
                >
                  {tier.highlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-violet-600">Más popular</Badge>
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-2xl">{tier.name}</CardTitle>
                    <CardDescription>{tier.description}</CardDescription>
                    <div className="mt-4">
                      {tier.price === 'Custom' ? (
                        <span className="text-4xl font-bold">Personalizado</span>
                      ) : (
                        <>
                          <span className="text-4xl font-bold">€{tier.price}</span>
                          <span className="text-muted-foreground">/mes</span>
                        </>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="mb-6 space-y-3">
                      {tier.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      className={`w-full ${tier.highlighted ? 'bg-violet-600 hover:bg-violet-700' : ''}`}
                      variant={tier.highlighted ? 'default' : 'outline'}
                    >
                      {tier.cta}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="border-t bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto grid max-w-4xl gap-12 md:grid-cols-3">
            {[
              {
                icon: Lock,
                title: 'Seguridad Enterprise',
                description: 'Datos encriptados, SOC 2 Type II, cumplimiento GDPR.',
              },
              {
                icon: Database,
                title: 'Datos Oficiales',
                description: 'Conexión directa con EUIPO, WIPO, USPTO y más.',
              },
              {
                icon: TrendingUp,
                title: '99.9% Uptime',
                description: 'SLA garantizado con monitoreo 24/7.',
              },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-violet-500/10">
                  <item.icon className="h-6 w-6 text-violet-600" />
                </div>
                <div>
                  <h3 className="mb-1 font-semibold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="mx-auto max-w-4xl rounded-3xl bg-gradient-to-r from-violet-500 to-purple-600 p-12 text-center text-white"
          >
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Comienza a proteger tu PI hoy
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-white/80">
              Únete a cientos de despachos y empresas que confían en Spider Pro para vigilar su
              propiedad intelectual.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to="/register">
                <Button size="lg" variant="secondary" className="gap-2">
                  Prueba 14 días gratis
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Button
                size="lg"
                variant="ghost"
                className="text-white hover:bg-white/10 hover:text-white"
              >
                Hablar con ventas
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600">
                <Eye className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold">Spider Pro</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground">
                Términos
              </a>
              <a href="#" className="hover:text-foreground">
                Privacidad
              </a>
              <a href="#" className="hover:text-foreground">
                Contacto
              </a>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2026 IP-NEXUS. Todos los derechos reservados.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
