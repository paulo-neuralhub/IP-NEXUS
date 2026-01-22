import { useEffect } from "react";
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
import { useCreateCRMTask } from "@/hooks/crm/v2/tasks";
import { useCRMAccounts } from "@/hooks/crm/v2/accounts";
import { useCRMContacts } from "@/hooks/crm/v2/contacts";

const schema = z.object({
  title: z.string().min(1, "El título es obligatorio"),
  account_id: z.string().min(1, "La cuenta es obligatoria"),
  contact_id: z.string().optional(),
  status: z.string().default("pending"),
  due_date: z.string().optional(),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

type Props = {
  open: boolean;
  onClose: () => void;
  defaultAccountId?: string;
};

const STATUSES = [
  { value: "pending", label: "Pendiente" },
  { value: "in_progress", label: "En Progreso" },
  { value: "completed", label: "Completada" },
];

export function TaskFormModal({ open, onClose, defaultAccountId }: Props) {
  const create = useCreateCRMTask();
  const { data: accounts = [] } = useCRMAccounts();
  const { data: contacts = [] } = useCRMContacts();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      account_id: defaultAccountId ?? "",
      contact_id: "",
      status: "pending",
      due_date: "",
      description: "",
    },
  });

  useEffect(() => {
    if (open && defaultAccountId) form.setValue("account_id", defaultAccountId);
  }, [open, defaultAccountId, form]);

  const onSubmit = async (values: FormValues) => {
    const payload: Record<string, unknown> = {
      title: values.title,
      account_id: values.account_id,
      status: values.status,
    };
    if (values.contact_id) payload.contact_id = values.contact_id;
    if (values.due_date) payload.due_date = values.due_date;
    if (values.description) payload.description = values.description;

    await create.mutateAsync(payload);
    form.reset();
    onClose();
  };

  const selectedAccount = form.watch("account_id");
  const availableContacts = (contacts as any[]).filter((c) => c.account_id === selectedAccount);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Nueva Tarea</DialogTitle>
          <DialogDescription>Crea una nueva tarea vinculada a cuenta/contacto</DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="title">Título *</Label>
            <Input id="title" {...form.register("title")} placeholder="Ej: Preparar docs para registro" />
            {form.formState.errors.title && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.title.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="account_id">Cuenta *</Label>
            <Select value={form.watch("account_id")} onValueChange={(v) => form.setValue("account_id", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar cuenta" />
              </SelectTrigger>
              <SelectContent>
                {(accounts as any[]).map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.account_id && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.account_id.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="contact_id">Contacto (opcional)</Label>
            <Select
              value={form.watch("contact_id") ?? ""}
              onValueChange={(v) => form.setValue("contact_id", v || undefined)}
              disabled={!selectedAccount || availableContacts.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder={availableContacts.length === 0 ? "Sin contactos" : "Seleccionar contacto"} />
              </SelectTrigger>
              <SelectContent>
                {availableContacts.map((c: any) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
              <Label htmlFor="due_date">Fecha vencimiento</Label>
              <Input id="due_date" type="date" {...form.register("due_date")} />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Descripción</Label>
            <Textarea id="description" {...form.register("description")} placeholder="Detalles..." rows={3} />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending ? "Creando..." : "Crear Tarea"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
