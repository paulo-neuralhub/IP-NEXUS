import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Construction, ArrowLeft, LayoutDashboard } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

const AppPlaceholder = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="w-full py-4 px-6 border-b border-border bg-background-card">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <LayoutDashboard className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-secondary">IP-NEXUS APP</span>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al inicio
            </Link>
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-6">
        <EmptyState
          icon={Construction}
          title="APP en Construcción"
          description="La aplicación principal para clientes está siendo desarrollada. Aquí gestionarás expedientes, patentes, marcas y más."
          action={
            <Button asChild>
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al inicio
              </Link>
            </Button>
          }
        />
      </main>
    </div>
  );
};

export default AppPlaceholder;
