import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useOrganization } from "@/contexts/organization-context";
import { Loader2 } from "lucide-react";

interface OrgGuardProps {
  children: ReactNode;
}

export function OrgGuard({ children }: OrgGuardProps) {
  const { currentOrganization, isLoading, needsOnboarding } = useOrganization();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Cargando organización...</p>
        </div>
      </div>
    );
  }

  if (needsOnboarding || !currentOrganization) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}
