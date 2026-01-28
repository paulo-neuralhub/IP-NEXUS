import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCreateCRMAccount } from "@/hooks/crm/v2/accounts";
import { useTeamMembers } from "@/hooks/crm/v2/team-members";

const schema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  legal_name: z.string().optional(),
  status: z.string().default("active"),
  tier: z.string().optional(),
  notes: z.string().optional(),
  assigned_to: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

type Props = {
  open: boolean;
  onClose: () => void;
};

const STATUSES = [
  { value: "active", label: "Activo" },
  { value: "inactive", label: "Inactivo" },
  { value: "prospect", label: "Prospecto" },
];

const TIERS = [
  { value: "bronze", label: "Bronze" },
  { value: "silver", label: "Silver" },
  { value: "gold", label: "Gold" },
  { value: "platinum", label: "Platinum" },
];

export function AccountFormModal({ open, onClose }: Props) {
  const create = useCreateCRMAccount();
  const { data: teamMembers = [] } = useTeamMembers();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      legal_name: "",
      status: "active",
      tier: "",
      notes: "",
      assigned_to: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    const payload: Record<string, unknown> = {
      name: values.name,
      status: values.status,
    };
    if (values.legal_name) payload.legal_name = values.legal_name;
    if (values.tier) payload.tier = values.tier;
    if (values.notes) payload.metadata = { notes: values.notes };
    if (values.assigned_to) payload.assigned_to = values.assigned_to;

    await create.mutateAsync(payload);
    form.reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Nueva Cuenta / Cliente</DialogTitle>
          <DialogDescription>Crea una nueva cuenta de cliente en el CRM</DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nombre comercial *</Label>
              <Input id="name" {...form.register("name")} placeholder="Ej: Acme Corp" />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive mt-1">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="legal_name">Razón social</Label>
              <Input id="legal_name" {...form.register("legal_name")} placeholder="Ej: Acme Corporation S.L." />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Estado</Label>
              <Select value={form.watch("status")} onValueChange={(v) => form.setValue("status", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="tier">Nivel</Label>
              <Select
                value={form.watch("tier") ?? ""}
                onValueChange={(v) => form.setValue("tier", v || undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar nivel..." />
                </SelectTrigger>
                <SelectContent>
                  {TIERS.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="assigned_to">Asignar a</Label>
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

          <div>
            <Label htmlFor="notes">Notas</Label>
            <Textarea id="notes" {...form.register("notes")} placeholder="Información adicional..." rows={3} />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending ? "Creando..." : "Crear Cuenta"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
