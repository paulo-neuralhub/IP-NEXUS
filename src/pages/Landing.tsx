import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, Briefcase, Sparkles, Store } from "lucide-react";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="w-full py-4 px-6 border-b border-border bg-background-card">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-secondary">IP-NEXUS</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="text-center max-w-2xl animate-fade-in">
          {/* Logo & Title */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center h-20 w-20 rounded-2xl bg-primary mb-6 shadow-lg">
              <Shield className="h-10 w-10 text-primary-foreground" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-secondary tracking-tight">
              IP-NEXUS
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Plataforma de Gestión de Propiedad Intelectual
            </p>
          </div>

          {/* Features Pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-light text-primary text-sm font-medium">
              <Briefcase className="h-4 w-4" />
              Enterprise SaaS
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-module-spider/10 text-module-spider text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              Potenciado por IA
            </div>
            <Link 
              to="/market" 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-market/10 text-market text-sm font-medium hover:bg-market/20 transition-colors"
            >
              <Store className="h-4 w-4" />
              IP Market
            </Link>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="min-w-[200px]">
              <Link to="/app">
                <Briefcase className="mr-2 h-5 w-5" />
                Acceder a la APP
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="min-w-[200px]">
              <Link to="/backoffice">
                <Shield className="mr-2 h-5 w-5" />
                Acceder al Backoffice
              </Link>
            </Button>
          </div>

          {/* Version Badge */}
          <p className="mt-12 text-sm text-muted-foreground">
            Versión en desarrollo
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-6 border-t border-border">
        <div className="max-w-7xl mx-auto text-center text-sm text-muted-foreground">
          © 2026 IP-NEXUS. Gestión Integral de Propiedad Intelectual.
        </div>
      </footer>
    </div>
  );
};

export default Landing;
