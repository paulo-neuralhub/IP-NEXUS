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
import { useCreateCRMLead } from "@/hooks/crm/v2/leads";
import { useCRMAccounts } from "@/hooks/crm/v2/accounts";
import { useTeamMembers } from "@/hooks/crm/v2/team-members";

const schema = z.object({
  full_name: z.string().min(1, "El nombre es obligatorio"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  account_id: z.string().optional(),
  lead_status: z.string().default("new"),
  notes: z.string().optional(),
  assigned_to: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

type Props = {
  open: boolean;
  onClose: () => void;
  defaultAccountId?: string;
};

const LEAD_STATUSES = [
  { value: "new", label: "Nuevo" },
  { value: "contacted", label: "Contactado" },
  { value: "qualified", label: "Cualificado" },
  { value: "proposal", label: "Propuesta" },
];

export function LeadFormModal({ open, onClose, defaultAccountId }: Props) {
  const create = useCreateCRMLead();
  const { data: accounts = [] } = useCRMAccounts();
  const { data: teamMembers = [] } = useTeamMembers();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      account_id: defaultAccountId ?? "",
      lead_status: "new",
      notes: "",
      assigned_to: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    const payload: Record<string, unknown> = {
      full_name: values.full_name,
      lead_status: values.lead_status,
    };
    if (values.email) payload.email = values.email;
    if (values.phone) payload.phone = values.phone;
    if (values.account_id) payload.account_id = values.account_id;
    if (values.notes) payload.notes = values.notes;
    if (values.assigned_to) payload.assigned_to = values.assigned_to;

    await create.mutateAsync(payload);
    form.reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Nuevo Lead</DialogTitle>
          <DialogDescription>Crea un nuevo lead en el CRM</DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="full_name">Nombre completo *</Label>
              <Input id="full_name" {...form.register("full_name")} placeholder="Ej: Juan García" />
              {form.formState.errors.full_name && (
                <p className="text-sm text-destructive mt-1">{form.formState.errors.full_name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...form.register("email")} placeholder="juan@ejemplo.com" />
              {form.formState.errors.email && (
                <p className="text-sm text-destructive mt-1">{form.formState.errors.email.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Teléfono</Label>
              <Input id="phone" {...form.register("phone")} placeholder="+34 600 000 000" />
            </div>

            <div>
              <Label htmlFor="account_id">Cuenta (opcional)</Label>
              <Select
                value={form.watch("account_id") ?? ""}
                onValueChange={(v) => form.setValue("account_id", v || undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar cuenta..." />
                </SelectTrigger>
                <SelectContent>
                  {(accounts as any[]).map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="lead_status">Estado</Label>
              <Select value={form.watch("lead_status")} onValueChange={(v) => form.setValue("lead_status", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LEAD_STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              {create.isPending ? "Creando..." : "Crear Lead"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
