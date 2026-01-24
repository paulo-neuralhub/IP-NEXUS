import { FileText, Clock, Users, Shield, Zap, Globe, Database, Bell } from 'lucide-react';
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

export default function DocketLanding() {
  return (
    <div className="landing-page">
      <LandingNavbar moduleCode="docket" moduleName="Docket" />
      
      <HeroSection
        moduleCode="docket"
        headline="Gestión de expedientes PI. Simple y potente."
        subheadline="Centraliza marcas, patentes y diseños en una plataforma intuitiva. Control total de plazos, documentos y comunicaciones."
        ctaPrimary={{ text: 'Empezar prueba gratis', href: '/register' }}
        ctaSecondary={{ text: 'Ver demo', href: '/demo' }}
        features={['Plazos automáticos', 'Documentos centralizados', 'Multi-jurisdicción']}
      />

      <SocialProofBar
        stats={[
          { value: '50K+', label: 'Expedientes gestionados' },
          { value: '99.9%', label: 'Uptime garantizado' },
          { value: '0', label: 'Plazos perdidos' },
          { value: '4.9/5', label: 'Valoración clientes' },
        ]}
      />

      <ProblemSolution
        moduleCode="docket"
        sectionTitle="Todo bajo control"
        problems={[
          { icon: Clock, title: 'Nunca pierdas un plazo', description: 'Sistema de alertas inteligente que te avisa con antelación de todos los vencimientos críticos.' },
          { icon: FileText, title: 'Documentos centralizados', description: 'Toda la documentación de tus expedientes organizada y accesible desde cualquier lugar.' },
          { icon: Users, title: 'Colaboración en equipo', description: 'Asigna tareas, comparte expedientes y mantén a todo el equipo sincronizado.' },
        ]}
      />

      <FeatureShowcase
        moduleCode="docket"
        features={[
          { icon: Database, title: 'Base de datos completa', description: 'Gestiona marcas, patentes, diseños y nombres de dominio en un solo lugar.', bullets: ['Campos personalizables', 'Búsqueda avanzada', 'Exportación masiva'] },
          { icon: Bell, title: 'Alertas inteligentes', description: 'Sistema de notificaciones configurable para no perder ningún plazo importante.', bullets: ['Alertas por email', 'Recordatorios escalonados', 'Calendario integrado'] },
          { icon: Globe, title: 'Multi-jurisdicción', description: 'Soporta oficinas de PI de todo el mundo con flujos adaptados.', bullets: ['150+ oficinas', 'Plazos automáticos', 'Tasas actualizadas'] },
        ]}
      />

      <IntegrationsBar moduleCode="docket" />

      <PricingSection
        moduleCode="docket"
        plans={[
          { name: 'Starter', description: 'Para pequeños despachos', priceMonthly: 99, priceYearly: 950, features: ['100 expedientes', '2 usuarios', 'Alertas básicas', 'Soporte email'], cta: { text: 'Empezar', href: '/register' } },
          { name: 'Professional', description: 'Para despachos medianos', priceMonthly: 249, priceYearly: 2390, features: ['1000 expedientes', '10 usuarios', 'Alertas avanzadas', 'API access', 'Portal cliente'], cta: { text: 'Empezar', href: '/register' }, isPopular: true },
          { name: 'Enterprise', description: 'Para grandes organizaciones', priceMonthly: null, priceYearly: null, features: ['Expedientes ilimitados', 'Usuarios ilimitados', 'Integraciones custom', 'Account manager', 'SLA garantizado'], cta: { text: 'Contactar', href: '/contact' } },
        ]}
      />

      <TestimonialsCarousel
        moduleCode="docket"
        testimonials={[
          { quote: 'Desde que usamos IP-DOCKET no hemos perdido ni un solo plazo. Es increíblemente fiable.', author: 'Pedro Sánchez', role: 'Director', company: 'Elzaburu', rating: 5 },
          { quote: 'La interfaz es intuitiva y potente. Nuestro equipo la adoptó inmediatamente.', author: 'Laura Fernández', role: 'IP Counsel', company: 'Inditex', rating: 5 },
          { quote: 'El portal de cliente ha mejorado nuestra comunicación con los titulares.', author: 'Miguel Ángel', role: 'Socio', company: 'ABG IP', rating: 5 },
        ]}
      />

      <FaqAccordion
        moduleCode="docket"
        faqs={[
          { question: '¿Puedo importar mis expedientes actuales?', answer: 'Sí, ofrecemos herramientas de importación desde Excel, XML y conexión directa con otras plataformas de gestión de PI.' },
          { question: '¿Cómo se calculan los plazos?', answer: 'Nuestro sistema tiene reglas actualizadas para cada oficina de PI, calculando automáticamente todos los plazos y alertándote con antelación.' },
          { question: '¿Hay portal para clientes?', answer: 'Sí, el plan Professional incluye portal cliente donde tus titulares pueden ver sus expedientes y documentos.' },
          { question: '¿Se integra con mi sistema de facturación?', answer: 'Sí, ofrecemos integraciones con los principales sistemas de facturación y ERP.' },
        ]}
      />

      <FinalCta moduleCode="docket" />
      <LandingFooter moduleCode="docket" moduleName="Docket" />
      <ChatbotWidget moduleCode="docket" />
    </div>
  );
}
