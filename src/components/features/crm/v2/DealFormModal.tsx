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
import { useCreateCRMDeal } from "@/hooks/crm/v2/deals";
import { useCRMAccounts } from "@/hooks/crm/v2/accounts";
import { useCRMContacts } from "@/hooks/crm/v2/contacts";

const dealSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  account_id: z.string().min(1, "La cuenta es obligatoria"),
  contact_id: z.string().optional(),
  stage: z.string().default("lead_in"),
  amount: z.string().optional(),
  expected_close_date: z.string().optional(),
  notes: z.string().optional(),
});

type DealFormValues = z.infer<typeof dealSchema>;

interface Props {
  open: boolean;
  onClose: () => void;
  defaultAccountId?: string;
}

const STAGE_OPTIONS = [
  { value: "lead_in", label: "Lead Entrante" },
  { value: "contact", label: "Contacto Inicial" },
  { value: "needs", label: "Análisis de Necesidades" },
  { value: "proposal", label: "Propuesta Enviada" },
  { value: "negotiation", label: "Negociación" },
  { value: "won", label: "Ganado" },
  { value: "lost", label: "Perdido" },
];

export function DealFormModal({ open, onClose, defaultAccountId }: Props) {
  const createDeal = useCreateCRMDeal();
  const { data: accounts = [] } = useCRMAccounts();
  const { data: contacts = [] } = useCRMContacts();

  const form = useForm<DealFormValues>({
    resolver: zodResolver(dealSchema),
    defaultValues: {
      name: "",
      account_id: defaultAccountId ?? "",
      contact_id: "",
      stage: "lead_in",
      amount: "",
      expected_close_date: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (open && defaultAccountId) {
      form.setValue("account_id", defaultAccountId);
    }
  }, [open, defaultAccountId, form]);

  const onSubmit = async (values: DealFormValues) => {
    const payload: Record<string, unknown> = {
      name: values.name,
      account_id: values.account_id,
      stage: values.stage,
      opportunity_type: "sales",
      stage_entered_at: new Date().toISOString(),
    };

    if (values.contact_id) payload.contact_id = values.contact_id;
    if (values.amount) {
      const numAmount = parseFloat(values.amount);
      payload.amount = numAmount;
      const prob = STAGE_PROBABILITY[values.stage] ?? 50;
      payload.weighted_amount = Math.round((numAmount * prob) / 100);
    }
    if (values.expected_close_date) payload.expected_close_date = values.expected_close_date;
    if (values.notes) payload.metadata = { notes: values.notes };

    await createDeal.mutateAsync(payload);
    form.reset();
    onClose();
  };

  const selectedAccount = form.watch("account_id");
  const availableContacts = contacts.filter((c: any) => c.account_id === selectedAccount);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Nuevo Deal</DialogTitle>
          <DialogDescription>Crea una nueva oportunidad en el CRM</DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Nombre del deal *</Label>
            <Input id="name" {...form.register("name")} placeholder="Ej: Registro marca global" />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="account_id">Cuenta *</Label>
            <Select value={form.watch("account_id")} onValueChange={(v) => form.setValue("account_id", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar cuenta" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((a: any) => (
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
              <Label htmlFor="stage">Etapa inicial</Label>
              <Select value={form.watch("stage")} onValueChange={(v) => form.setValue("stage", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STAGE_OPTIONS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="amount">Valor (€)</Label>
              <Input id="amount" type="number" {...form.register("amount")} placeholder="0" />
            </div>
          </div>

          <div>
            <Label htmlFor="expected_close_date">Fecha estimada cierre</Label>
            <Input id="expected_close_date" type="date" {...form.register("expected_close_date")} />
          </div>

          <div>
            <Label htmlFor="notes">Notas</Label>
            <Textarea id="notes" {...form.register("notes")} placeholder="Detalles adicionales..." rows={3} />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createDeal.isPending}>
              {createDeal.isPending ? "Creando..." : "Crear Deal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

const STAGE_PROBABILITY: Record<string, number> = {
  lead_in: 10,
  contact: 20,
  needs: 35,
  proposal: 55,
  negotiation: 75,
  won: 100,
  lost: 0,
};
