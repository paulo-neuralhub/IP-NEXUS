import { Radar, AlertTriangle, Shield, Bell, Search, Zap } from 'lucide-react';
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
  LandingChatbotWidget,
} from '@/components/landing-pro';

export default function SpiderLanding() {
  return (
    <div className="landing-page">
      <LandingNavbar moduleCode="spider" moduleName="Spider" />
      
      <HeroSection
        moduleCode="spider"
        headline="Vigilancia de marcas con IA. Protege tu marca 24/7."
        subheadline="Detecta infracciones antes de que sea tarde. Monitoreo automático de marcas en más de 150 jurisdicciones con inteligencia artificial."
        ctaPrimary={{ text: 'Empezar prueba gratis', href: '/register' }}
        ctaSecondary={{ text: 'Ver demo', href: '/demo' }}
        features={['IA avanzada', '+150 jurisdicciones', 'Alertas en tiempo real']}
      />

      <SocialProofBar
        stats={[
          { value: '500+', label: 'Despachos activos' },
          { value: '2M+', label: 'Marcas vigiladas' },
          { value: '98%', label: 'Detección de conflictos' },
          { value: '24/7', label: 'Monitoreo continuo' },
        ]}
      />

      <ProblemSolution
        moduleCode="spider"
        sectionTitle="Protege tu marca de forma proactiva"
        problems={[
          { icon: AlertTriangle, title: 'Detecta infracciones', description: 'Identifica solicitudes de marcas similares antes de que se registren y puedan dañar tu negocio.' },
          { icon: Shield, title: 'Análisis inteligente', description: 'Nuestra IA evalúa el riesgo de cada conflicto y te recomienda acciones específicas.' },
          { icon: Bell, title: 'Alertas instantáneas', description: 'Recibe notificaciones en tiempo real cuando detectamos una amenaza potencial.' },
        ]}
      />

      <FeatureShowcase
        moduleCode="spider"
        features={[
          { icon: Radar, title: 'Vigilancia global', description: 'Monitorea marcas en más de 150 oficinas de PI mundiales.', bullets: ['EUIPO, USPTO, WIPO, OEPM', 'Actualizaciones diarias', 'Cobertura completa'] },
          { icon: Search, title: 'Búsqueda por similitud', description: 'Algoritmos fonéticos, visuales y conceptuales para encontrar conflictos ocultos.', bullets: ['Análisis fonético', 'Comparación visual', 'Detección conceptual'] },
          { icon: Zap, title: 'Análisis IA', description: 'Evaluación automática del riesgo con recomendaciones de acción.', bullets: ['Score de riesgo', 'Recomendaciones', 'Priorización automática'] },
        ]}
      />

      <IntegrationsBar moduleCode="spider" />

      <PricingSection
        moduleCode="spider"
        plans={[
          { name: 'Starter', description: 'Para pequeños despachos', priceMonthly: 99, priceYearly: 950, features: ['50 marcas vigiladas', '3 jurisdicciones', 'Alertas email', 'Soporte email'], cta: { text: 'Empezar', href: '/register' } },
          { name: 'Professional', description: 'Para despachos medianos', priceMonthly: 249, priceYearly: 2390, features: ['250 marcas vigiladas', '15 jurisdicciones', 'Análisis IA', 'API access', 'Soporte prioritario'], cta: { text: 'Empezar', href: '/register' }, isPopular: true },
          { name: 'Enterprise', description: 'Para grandes organizaciones', priceMonthly: null, priceYearly: null, features: ['Marcas ilimitadas', 'Jurisdicciones ilimitadas', 'Análisis IA avanzado', 'Account manager', 'SLA garantizado'], cta: { text: 'Contactar', href: '/contact' } },
        ]}
      />

      <TestimonialsCarousel
        moduleCode="spider"
        testimonials={[
          { quote: 'IP-SPIDER nos ha permitido detectar conflictos que antes se nos escapaban. Imprescindible.', author: 'María García', role: 'Directora PI', company: 'Garrigues', rating: 5 },
          { quote: 'La IA reduce drásticamente el tiempo de análisis. Ahora podemos ser proactivos.', author: 'Carlos López', role: 'Socio', company: 'Clarke Modet', rating: 5 },
          { quote: 'El mejor sistema de vigilancia que hemos probado. La integración es perfecta.', author: 'Ana Martínez', role: 'IP Manager', company: 'Telefónica', rating: 5 },
        ]}
      />

      <FaqAccordion
        moduleCode="spider"
        faqs={[
          { question: '¿Cuántas jurisdicciones cubre IP-SPIDER?', answer: 'Actualmente monitoreamos más de 150 oficinas de PI en todo el mundo, incluyendo EUIPO, USPTO, WIPO, y todas las oficinas nacionales europeas.' },
          { question: '¿Cómo funciona el análisis de IA?', answer: 'Nuestra IA analiza similitudes fonéticas, visuales y conceptuales, evaluando el riesgo de cada conflicto y proporcionando recomendaciones de acción.' },
          { question: '¿Puedo integrar IP-SPIDER con mi sistema?', answer: 'Sí, ofrecemos API REST completa y webhooks para integración con cualquier sistema de gestión de PI.' },
          { question: '¿Hay periodo de prueba?', answer: 'Sí, ofrecemos 14 días de prueba gratuita con acceso completo a todas las funcionalidades.' },
        ]}
      />

      <FinalCta moduleCode="spider" />
      <LandingFooter moduleCode="spider" moduleName="Spider" />
      <LandingChatbotWidget moduleCode="spider" landingSlug="spider" />
    </div>
  );
}
