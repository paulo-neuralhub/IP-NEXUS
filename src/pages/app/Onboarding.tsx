import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth-context";
import { useOrganization } from "@/contexts/organization-context";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { slugify } from "@/lib/utils";
import { Shield, Building2, Users, Loader2, Ticket } from "lucide-react";

const Onboarding = () => {
  const [step, setStep] = useState<"choice" | "create" | "invite">("choice");
  const [orgName, setOrgName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { user, profile } = useAuth();
  const { refreshMemberships } = useOrganization();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleCreateOrg = async () => {
    if (!orgName.trim() || !user) return;

    setIsLoading(true);

    const slug = slugify(orgName);

    // Create organization
    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .insert({
        name: orgName.trim(),
        slug,
        plan: "starter",
        status: "active",
      })
      .select()
      .single();

    if (orgError) {
      console.error("Error creating organization:", orgError);
      let message = "No se pudo crear la organización";
      if (orgError.message.includes("duplicate")) {
        message = "Ya existe una organización con ese nombre";
      }
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Create membership with owner role
    const { error: membershipError } = await supabase
      .from("memberships")
      .insert({
        user_id: user.id,
        organization_id: org.id,
        role: "owner",
      });

    if (membershipError) {
      console.error("Error creating membership:", membershipError);
      toast({
        title: "Error",
        description: "No se pudo asociar tu cuenta a la organización",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Refresh memberships and navigate
    await refreshMemberships();

    toast({
      title: "¡Organización creada!",
      description: `Bienvenido a ${orgName}`,
    });

    navigate("/app/dashboard", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary mb-4 shadow-lg">
            <Shield className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-secondary">
            ¡Bienvenido a IP-NEXUS{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}!
          </h1>
          <p className="mt-2 text-muted-foreground">
            Vamos a configurar tu cuenta para empezar
          </p>
        </div>

        {step === "choice" && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Create Organization */}
            <Card 
              className="cursor-pointer transition-all hover:shadow-lg hover:border-primary"
              onClick={() => setStep("create")}
            >
              <CardHeader className="text-center pb-2">
                <div className="mx-auto h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-2">
                  <Building2 className="h-7 w-7 text-primary" />
                </div>
                <CardTitle className="text-lg">Crear organización</CardTitle>
                <CardDescription>
                  Crea tu propia organización y empieza a gestionar tu cartera de PI
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button className="w-full">
                  Crear nueva organización
                </Button>
              </CardContent>
            </Card>

            {/* Join with Invitation */}
            <Card 
              className="cursor-pointer transition-all hover:shadow-lg hover:border-primary opacity-75"
              onClick={() => setStep("invite")}
            >
              <CardHeader className="text-center pb-2">
                <div className="mx-auto h-14 w-14 rounded-2xl bg-module-market/10 flex items-center justify-center mb-2">
                  <Users className="h-7 w-7 text-module-market" />
                </div>
                <CardTitle className="text-lg">Tengo una invitación</CardTitle>
                <CardDescription>
                  Únete a una organización existente con un código de invitación
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button variant="outline" className="w-full">
                  Introducir código
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {step === "create" && (
          <Card>
            <CardHeader>
              <CardTitle>Crear nueva organización</CardTitle>
              <CardDescription>
                Este será el nombre de tu empresa o despacho. Podrás cambiarlo más tarde.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="orgName">Nombre de la organización</Label>
                <Input
                  id="orgName"
                  placeholder="Mi Empresa S.L."
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                />
                {orgName && (
                  <p className="text-sm text-muted-foreground">
                    URL: <code className="bg-muted px-1 rounded">{slugify(orgName)}.ip-nexus.com</code>
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep("choice")}
                  disabled={isLoading}
                >
                  Volver
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleCreateOrg}
                  disabled={!orgName.trim() || isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creando...
                    </>
                  ) : (
                    "Crear organización"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === "invite" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ticket className="h-5 w-5" />
                Código de invitación
              </CardTitle>
              <CardDescription>
                Introduce el código de invitación que te han proporcionado
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-warning-light border border-warning rounded-lg p-4 text-center">
                <p className="text-sm text-warning-foreground">
                  Esta funcionalidad estará disponible próximamente.
                  <br />
                  Por ahora, puedes crear tu propia organización.
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep("choice")}
                  className="flex-1"
                >
                  Volver
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
