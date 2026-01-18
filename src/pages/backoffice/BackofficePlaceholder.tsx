import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Construction, ArrowLeft, Shield } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

const BackofficePlaceholder = () => {
  return (
    <div className="min-h-screen bg-secondary flex flex-col">
      {/* Header */}
      <header className="w-full py-4 px-6 border-b border-secondary-light">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-backoffice-ai flex items-center justify-center">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-secondary-foreground">IP-NEXUS BACKOFFICE</span>
          </div>
          <Button asChild variant="ghost" size="sm" className="text-secondary-foreground hover:bg-secondary-light">
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al inicio
            </Link>
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="bg-background-card rounded-2xl p-12 shadow-lg">
          <EmptyState
            icon={<Construction className="h-12 w-12" />}
            title="Backoffice en Construcción"
            description="El panel de administración interna está siendo desarrollado. Aquí gestionarás tenants, facturación, IA y más."
            action={
              <Button asChild>
                <Link to="/">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver al inicio
                </Link>
              </Button>
            }
          />
        </div>
      </main>
    </div>
  );
};

export default BackofficePlaceholder;
