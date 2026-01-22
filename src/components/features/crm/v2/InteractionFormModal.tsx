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
import { useCreateCRMInteraction } from "@/hooks/crm/v2/interactions";
import { useCRMAccounts } from "@/hooks/crm/v2/accounts";
import { useCRMContacts } from "@/hooks/crm/v2/contacts";

const schema = z.object({
  account_id: z.string().min(1, "La cuenta es obligatoria"),
  contact_id: z.string().optional(),
  channel: z.string().min(1, "El canal es obligatorio"),
  direction: z.string().min(1, "La dirección es obligatoria"),
  subject: z.string().optional(),
  content: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

type Props = {
  open: boolean;
  onClose: () => void;
  defaultAccountId?: string;
};

const CHANNELS = [
  { value: "email", label: "Email" },
  { value: "call", label: "Llamada" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "meeting", label: "Reunión" },
  { value: "note", label: "Nota" },
];

const DIRECTIONS = [
  { value: "inbound", label: "Entrante" },
  { value: "outbound", label: "Saliente" },
];

export function InteractionFormModal({ open, onClose, defaultAccountId }: Props) {
  const create = useCreateCRMInteraction();
  const { data: accounts = [] } = useCRMAccounts();
  const { data: contacts = [] } = useCRMContacts();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      account_id: defaultAccountId ?? "",
      contact_id: "",
      channel: "email",
      direction: "outbound",
      subject: "",
      content: "",
    },
  });

  useEffect(() => {
    if (open && defaultAccountId) form.setValue("account_id", defaultAccountId);
  }, [open, defaultAccountId, form]);

  const onSubmit = async (values: FormValues) => {
    const payload: Record<string, unknown> = {
      account_id: values.account_id,
      channel: values.channel,
      direction: values.direction,
    };
    if (values.contact_id) payload.contact_id = values.contact_id;
    if (values.subject) payload.subject = values.subject;
    if (values.content) payload.content = values.content;

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
          <DialogTitle>Nueva Interacción</DialogTitle>
          <DialogDescription>Registra una comunicación con cuenta/contacto</DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
              <Label htmlFor="channel">Canal *</Label>
              <Select value={form.watch("channel")} onValueChange={(v) => form.setValue("channel", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CHANNELS.map((ch) => (
                    <SelectItem key={ch.value} value={ch.value}>
                      {ch.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="direction">Dirección *</Label>
              <Select value={form.watch("direction")} onValueChange={(v) => form.setValue("direction", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DIRECTIONS.map((d) => (
                    <SelectItem key={d.value} value={d.value}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="subject">Asunto</Label>
            <Input id="subject" {...form.register("subject")} placeholder="Asunto breve..." />
          </div>

          <div>
            <Label htmlFor="content">Contenido</Label>
            <Textarea id="content" {...form.register("content")} placeholder="Detalles..." rows={4} />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending ? "Creando..." : "Crear Interacción"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
