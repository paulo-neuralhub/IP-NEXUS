// ============================================
// EDIT CLIENT COMPANY DIALOG - Full Form with Tabs
// ============================================

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "@/contexts/organization-context";
import { useTeamMembers } from "@/hooks/crm/v2/team-members";
import { toast } from "sonner";
import { Building2, MapPin, User, FileText, Star } from "lucide-react";
import { cn } from "@/lib/utils";

const schema = z.object({
  // General
  name: z.string().min(1, "Nombre comercial obligatorio"),
  legal_name: z.string().optional(),
  tax_id: z.string().optional(),
  tax_id_type: z.string().optional(),
  account_type: z.string().optional(),
  status: z.string().optional(),
  tier: z.string().optional(),
  rating_stars: z.number().min(0).max(5).optional(),
  assigned_to: z.string().optional(),
  // Contact
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  website: z.string().optional(),
  // Address
  address_line1: z.string().optional(),
  address_line2: z.string().optional(),
  city: z.string().optional(),
  state_province: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().optional(),
  // Internal
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const STATUSES = [
  { value: "active", label: "Activo" },
  { value: "inactive", label: "Inactivo" },
  { value: "prospect", label: "Prospecto" },
  { value: "churned", label: "Baja" },
];

const TIERS = [
  { value: "bronze", label: "Bronze" },
  { value: "silver", label: "Silver" },
  { value: "gold", label: "Gold" },
  { value: "platinum", label: "Platinum" },
];

const ACCOUNT_TYPES = [
  { value: "direct", label: "Cliente Directo" },
  { value: "agent", label: "Agente PI" },
  { value: "law_firm", label: "Despacho" },
  { value: "corporation", label: "Corporación" },
];

const TAX_ID_TYPES = [
  { value: "CIF", label: "CIF" },
  { value: "NIF", label: "NIF" },
  { value: "NIE", label: "NIE" },
  { value: "VAT", label: "VAT" },
  { value: "EIN", label: "EIN (US)" },
  { value: "OTHER", label: "Otro" },
];

export function EditClientCompanyDialog({
  open,
  onOpenChange,
  clientId,
  initialValues,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  initialValues: Partial<FormValues>;
}) {
  const { currentOrganization } = useOrganization();
  const queryClient = useQueryClient();
  const { data: teamMembers = [] } = useTeamMembers();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      legal_name: "",
      tax_id: "",
      tax_id_type: "CIF",
      account_type: "direct",
      status: "active",
      tier: "",
      rating_stars: 0,
      assigned_to: "",
      email: "",
      phone: "",
      website: "",
      address_line1: "",
      address_line2: "",
      city: "",
      state_province: "",
      postal_code: "",
      country: "ES",
      notes: "",
      ...initialValues,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: "",
        legal_name: "",
        tax_id: "",
        tax_id_type: "CIF",
        account_type: "direct",
        status: "active",
        tier: "",
        rating_stars: 0,
        assigned_to: "",
        email: "",
        phone: "",
        website: "",
        address_line1: "",
        address_line2: "",
        city: "",
        state_province: "",
        postal_code: "",
        country: "ES",
        notes: "",
        ...initialValues,
      });
    }
  }, [open, initialValues, form]);

  const onSubmit = async (values: FormValues) => {
    if (!currentOrganization?.id) {
      toast.error("No hay organización activa");
      return;
    }

    const { error } = await supabase
      .from("crm_accounts")
      .update({
        name: values.name,
        legal_name: values.legal_name || null,
        tax_id: values.tax_id || null,
        account_type: values.account_type || "direct",
        status: values.status || "active",
        tier: values.tier || null,
        rating_stars: values.rating_stars || null,
        assigned_to: values.assigned_to || null,
        email: values.email || null,
        phone: values.phone || null,
        website: values.website || null,
        address_line1: values.address_line1 || null,
        address_line2: values.address_line2 || null,
        city: values.city || null,
        state_province: values.state_province || null,
        postal_code: values.postal_code || null,
        country: values.country || null,
        metadata: values.notes ? { notes: values.notes } : null,
      })
      .eq("id", clientId)
      .eq("organization_id", currentOrganization.id);

    if (error) {
      toast.error("No se pudo guardar", { description: error.message });
      return;
    }

    toast.success("Cliente actualizado");
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["client-detail", clientId] }),
      queryClient.invalidateQueries({ queryKey: ["crm-account", currentOrganization.id, clientId] }),
      queryClient.invalidateQueries({ queryKey: ["crm-accounts"] }),
    ]);
    onOpenChange(false);
  };

  const ratingValue = form.watch("rating_stars") || 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Editar Cliente
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Tabs defaultValue="general" className="space-y-4">
            <TabsList className="w-full justify-start bg-muted/50">
              <TabsTrigger value="general" className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4" />
                General
              </TabsTrigger>
              <TabsTrigger value="address" className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                Dirección
              </TabsTrigger>
              <TabsTrigger value="contact" className="flex items-center gap-1.5">
                <User className="w-4 h-4" />
                Contacto
              </TabsTrigger>
              <TabsTrigger value="notes" className="flex items-center gap-1.5">
                <FileText className="w-4 h-4" />
                Notas
              </TabsTrigger>
            </TabsList>

            {/* TAB: GENERAL */}
            <TabsContent value="general" className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre comercial *</Label>
                  <Input id="name" {...form.register("name")} placeholder="Ej: Acme Corp" />
                  {form.formState.errors.name?.message && (
                    <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="legal_name">Razón social</Label>
                  <Input id="legal_name" {...form.register("legal_name")} placeholder="Ej: Acme Corporation S.L." />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tax_id_type">Tipo ID fiscal</Label>
                  <Select value={form.watch("tax_id_type") ?? "CIF"} onValueChange={(v) => form.setValue("tax_id_type", v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TAX_ID_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tax_id">Número identificación</Label>
                  <Input id="tax_id" {...form.register("tax_id")} placeholder="B12345678" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="account_type">Tipo de cliente</Label>
                  <Select value={form.watch("account_type") ?? "direct"} onValueChange={(v) => form.setValue("account_type", v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ACCOUNT_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Estado</Label>
                  <Select value={form.watch("status") ?? "active"} onValueChange={(v) => form.setValue("status", v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tier">Nivel</Label>
                  <Select value={form.watch("tier") ?? ""} onValueChange={(v) => form.setValue("tier", v || undefined)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar nivel..." />
                    </SelectTrigger>
                    <SelectContent>
                      {TIERS.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Valoración</Label>
                  <div className="flex items-center gap-1 pt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => form.setValue("rating_stars", star === ratingValue ? 0 : star)}
                        className="focus:outline-none"
                      >
                        <Star
                          className={cn(
                            "w-6 h-6 cursor-pointer transition-colors",
                            star <= ratingValue
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-muted-foreground/30 hover:text-yellow-300"
                          )}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="assigned_to">Responsable</Label>
                  <Select
                    value={form.watch("assigned_to") ?? ""}
                    onValueChange={(v) => form.setValue("assigned_to", v || undefined)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar responsable..." />
                    </SelectTrigger>
                    <SelectContent>
                      {teamMembers.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-5 w-5">
                              <AvatarImage src={member.avatar_url ?? undefined} />
                              <AvatarFallback className="text-xs">
                                {member.full_name?.split(" ").map((n) => n[0]).join("").slice(0, 2) ?? "?"}
                              </AvatarFallback>
                            </Avatar>
                            <span>{member.full_name ?? member.email}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            {/* TAB: ADDRESS */}
            <TabsContent value="address" className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address_line1">Dirección línea 1</Label>
                  <Input id="address_line1" {...form.register("address_line1")} placeholder="Calle, número, piso" />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address_line2">Dirección línea 2</Label>
                  <Input id="address_line2" {...form.register("address_line2")} placeholder="Edificio, oficina, etc." />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">Ciudad</Label>
                  <Input id="city" {...form.register("city")} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state_province">Provincia/Estado</Label>
                  <Input id="state_province" {...form.register("state_province")} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postal_code">Código postal</Label>
                  <Input id="postal_code" {...form.register("postal_code")} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">País</Label>
                  <Input id="country" {...form.register("country")} placeholder="ES" maxLength={2} />
                </div>
              </div>
            </TabsContent>

            {/* TAB: CONTACT */}
            <TabsContent value="contact" className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">Email principal</Label>
                  <Input id="email" type="email" {...form.register("email")} placeholder="info@empresa.com" />
                  {form.formState.errors.email?.message && (
                    <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input id="phone" {...form.register("phone")} placeholder="+34 612 345 678" />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="website">Sitio web</Label>
                  <Input id="website" {...form.register("website")} placeholder="https://www.empresa.com" />
                </div>
              </div>
            </TabsContent>

            {/* TAB: NOTES */}
            <TabsContent value="notes" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="notes">Notas internas</Label>
                <Textarea
                  id="notes"
                  {...form.register("notes")}
                  placeholder="Información interna sobre este cliente..."
                  rows={6}
                />
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Guardando..." : "Guardar cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
