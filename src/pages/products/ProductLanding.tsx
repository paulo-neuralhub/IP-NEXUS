// ============================================
// src/pages/products/ProductLanding.tsx
// ============================================

import { useParams, useNavigate } from 'react-router-dom';
import { useLandingPage } from '@/hooks/useLandingPage';
import { 
  LandingHero, 
  LandingFeatures, 
  LandingPricing, 
  LandingTestimonials,
  LandingFaq,
  LandingCta 
} from '@/components/landing';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';

// Header simple para landing pages
function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white font-bold">
            IP
          </div>
          <span className="font-bold text-xl">IP-NEXUS</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/products/spider" className="text-sm text-muted-foreground hover:text-foreground transition">
            Spider
          </Link>
          <Link to="/products/genius" className="text-sm text-muted-foreground hover:text-foreground transition">
            Genius
          </Link>
          <Link to="/products/docket" className="text-sm text-muted-foreground hover:text-foreground transition">
            Docket
          </Link>
          <Link to="/products/finance" className="text-sm text-muted-foreground hover:text-foreground transition">
            Finance
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link to="/auth/login">Iniciar sesión</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/auth/register">Registrarse</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

// Footer simple para landing pages
function LandingFooter() {
  return (
    <footer className="bg-muted/50 border-t py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white font-bold">
                IP
              </div>
              <span className="font-bold text-xl">IP-NEXUS</span>
            </div>
            <p className="text-sm text-muted-foreground">
              La plataforma integral para la gestión de propiedad intelectual.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Productos</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/products/spider" className="hover:text-foreground">Spider - Vigilancia</Link></li>
              <li><Link to="/products/genius" className="hover:text-foreground">Genius - IA Legal</Link></li>
              <li><Link to="/products/docket" className="hover:text-foreground">Docket - Expedientes</Link></li>
              <li><Link to="/products/finance" className="hover:text-foreground">Finance - Valoración</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/legal/privacy" className="hover:text-foreground">Privacidad</Link></li>
              <li><Link to="/legal/terms" className="hover:text-foreground">Términos</Link></li>
              <li><Link to="/legal/cookies" className="hover:text-foreground">Cookies</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Contacto</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>info@ip-nexus.com</li>
              <li>+34 91 123 45 67</li>
              <li>Madrid, España</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} IP-NEXUS. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}

// Loading skeleton
function LandingSkeleton() {
  return (
    <div className="min-h-screen">
      <LandingHeader />
      <div className="py-20">
        <div className="container mx-auto px-4">
          <Skeleton className="h-16 w-3/4 mx-auto mb-6" />
          <Skeleton className="h-8 w-1/2 mx-auto mb-8" />
          <div className="flex justify-center gap-4">
            <Skeleton className="h-12 w-40" />
            <Skeleton className="h-12 w-40" />
          </div>
        </div>
      </div>
      <div className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Error state
function LandingNotFound({ slug }: { slug: string }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen">
      <LandingHeader />
      <div className="py-32">
        <div className="container mx-auto px-4 text-center">
          <AlertTriangle className="w-16 h-16 mx-auto text-amber-500 mb-6" />
          <h1 className="text-3xl font-bold mb-4">Página no encontrada</h1>
          <p className="text-muted-foreground mb-8">
            El producto "{slug}" no existe o no está disponible.
          </p>
          <Button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </div>
      </div>
      <LandingFooter />
    </div>
  );
}

export default function ProductLanding() {
  const { slug } = useParams<{ slug: string }>();
  const { data: page, isLoading, error } = useLandingPage(slug || '');

  // Update document title
  useEffect(() => {
    if (page?.title) {
      document.title = page.title;
    }
  }, [page?.title]);

  // Update meta description
  useEffect(() => {
    if (page?.meta_description) {
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', page.meta_description);
    }
  }, [page?.meta_description]);

  if (isLoading) {
    return <LandingSkeleton />;
  }

  if (error || !page) {
    return <LandingNotFound slug={slug || ''} />;
  }

  return (
    <div className="min-h-screen">
      <LandingHeader />
      
      <main>
        {/* Hero Section */}
        <LandingHero
          title={page.hero_title}
          subtitle={page.hero_subtitle}
          ctaText={page.hero_cta_text}
          ctaUrl={page.hero_cta_url}
          secondaryCtaText={page.hero_secondary_cta_text}
          secondaryCtaUrl={page.hero_secondary_cta_url}
          imageUrl={page.hero_image_url}
          videoUrl={page.hero_video_url}
          moduleCode={page.module_code}
        />

        {/* Features Section */}
        {page.features.length > 0 && (
          <LandingFeatures features={page.features} moduleCode={page.module_code} />
        )}

        {/* Pricing Section */}
        {page.pricing_plans.length > 0 && (
          <LandingPricing plans={page.pricing_plans} moduleCode={page.module_code} />
        )}

        {/* Testimonials Section */}
        {page.testimonials.length > 0 && (
          <LandingTestimonials testimonials={page.testimonials} />
        )}

        {/* FAQ Section */}
        {page.faqs.length > 0 && (
          <LandingFaq faqs={page.faqs} />
        )}

        {/* Final CTA */}
        <LandingCta
          title={page.final_cta_title}
          subtitle={page.final_cta_subtitle}
          type={page.final_cta_type}
          moduleCode={page.module_code}
        />
      </main>

      <LandingFooter />
    </div>
  );
}
