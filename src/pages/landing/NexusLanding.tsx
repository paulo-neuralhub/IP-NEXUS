import { Shield, Zap, Brain, Globe, Users, FileText, Radar, DollarSign } from 'lucide-react';
import '@/styles/landing.css';
import {
  LandingNavbar,
  HeroSection,
  SocialProofBar,
  ProblemSolution,
  FeatureShowcase,
  IntegrationsBar,
  PricingSection,
  TestimonialsCarousel,
  FaqAccordion,
  FinalCta,
  LandingFooter,
  ChatbotWidget,
} from '@/components/landing-pro';

export default function NexusLanding() {
  return (
    <div className="landing-page">
      <LandingNavbar moduleCode="nexus" moduleName="NEXUS" />
      
      <HeroSection
        moduleCode="nexus"
        headline="La suite completa para gestión de PI"
        subheadline="Expedientes, vigilancia, CRM, finanzas y marketing en una plataforma unificada. Todo lo que necesita tu despacho de Propiedad Intelectual."
        ctaPrimary={{ text: 'Empezar prueba gratis', href: '/register' }}
        ctaSecondary={{ text: 'Solicitar demo', href: '/demo' }}
        features={['Suite completa', 'IA integrada', 'Multi-jurisdicción', 'Portal cliente']}
      />

      <SocialProofBar
        stats={[
          { value: '500+', label: 'Despachos activos' },
          { value: '100K+', label: 'Expedientes gestionados' },
          { value: '50+', label: 'Países cubiertos' },
          { value: '24/7', label: 'Soporte disponible' },
        ]}
      />

      <ProblemSolution
        moduleCode="nexus"
        sectionTitle="Una plataforma, infinitas posibilidades"
        problems={[
          { icon: Zap, title: 'Productividad máxima', description: 'Automatiza tareas repetitivas y céntrate en lo que realmente importa: tus clientes.' },
          { icon: Brain, title: 'IA que trabaja para ti', description: 'Asistentes especializados en PI que te ayudan con análisis, redacción y estrategia.' },
          { icon: Globe, title: 'Sin fronteras', description: 'Gestiona expedientes en cualquier jurisdicción del mundo desde una única plataforma.' },
        ]}
      />

      <FeatureShowcase
        moduleCode="nexus"
        sectionTitle="Módulos integrados"
        features={[
          { icon: FileText, title: 'DOCKET - Expedientes', description: 'Gestiona marcas, patentes y diseños con control total de plazos y documentos.', bullets: ['Plazos automáticos', 'Portal cliente', 'Documentos centralizados'] },
          { icon: Radar, title: 'SPIDER - Vigilancia', description: 'Monitorea tu cartera y detecta conflictos con inteligencia artificial.', bullets: ['150+ jurisdicciones', 'Alertas en tiempo real', 'Análisis de riesgo'] },
          { icon: Users, title: 'CRM - Clientes', description: 'Gestiona relaciones comerciales, pipelines y comunicaciones.', bullets: ['Pipelines personalizables', 'Timeline de actividad', 'Automatizaciones'] },
          { icon: DollarSign, title: 'FINANCE - Finanzas', description: 'Control de costes, facturación y rentabilidad de tu cartera.', bullets: ['Facturación automática', 'Control de renovaciones', 'Informes financieros'] },
        ]}
      />

      <IntegrationsBar moduleCode="nexus" title="Conecta con todo tu ecosistema" />

      <PricingSection
        moduleCode="nexus"
        sectionSubtitle="Planes adaptados a cada tamaño de despacho"
        plans={[
          { name: 'Starter', description: 'Para empezar', priceMonthly: 149, priceYearly: 1430, features: ['Docket + Spider básico', '100 expedientes', '3 usuarios', 'Soporte email'], cta: { text: 'Empezar', href: '/register' } },
          { name: 'Professional', description: 'Lo más popular', priceMonthly: 399, priceYearly: 3830, features: ['Suite completa', '1000 expedientes', '15 usuarios', 'Portal cliente', 'API access'], cta: { text: 'Empezar', href: '/register' }, isPopular: true },
          { name: 'Enterprise', description: 'Sin límites', priceMonthly: null, priceYearly: null, features: ['Todo ilimitado', 'Usuarios ilimitados', 'Integraciones custom', 'Account manager dedicado', 'SLA 99.9%'], cta: { text: 'Contactar ventas', href: '/contact' } },
        ]}
      />

      <TestimonialsCarousel
        moduleCode="nexus"
        testimonials={[
          { quote: 'IP-NEXUS ha transformado completamente nuestra forma de trabajar. Antes usábamos 5 herramientas diferentes.', author: 'Isabel Rodríguez', role: 'Socia Directora', company: 'Cuatrecasas IP', rating: 5 },
          { quote: 'La integración de todos los módulos es perfecta. Ahorro horas cada semana.', author: 'Javier Martín', role: 'IP Manager', company: 'Banco Santander', rating: 5 },
          { quote: 'El mejor software de gestión de PI que hemos probado en 20 años.', author: 'Rosa García', role: 'Directora', company: 'Pons IP', rating: 5 },
        ]}
      />

      <FaqAccordion
        moduleCode="nexus"
        faqs={[
          { question: '¿Puedo empezar solo con algunos módulos?', answer: 'Sí, puedes empezar con los módulos que necesites y añadir más cuando quieras. Todos se integran perfectamente.' },
          { question: '¿Cómo funciona la migración de datos?', answer: 'Ofrecemos servicio de migración asistida. Importamos tus expedientes, clientes y documentos desde cualquier sistema.' },
          { question: '¿Hay formación incluida?', answer: 'Sí, todos los planes incluyen onboarding y formación. Los planes superiores incluyen formación continua.' },
          { question: '¿Puedo probar antes de comprar?', answer: '¡Por supuesto! Ofrecemos 14 días de prueba gratuita con acceso completo a todas las funcionalidades.' },
        ]}
      />

      <FinalCta moduleCode="nexus" title="Empieza a transformar tu despacho hoy" />
      <LandingFooter moduleCode="nexus" moduleName="NEXUS" />
      <ChatbotWidget moduleCode="nexus" />
    </div>
  );
}
