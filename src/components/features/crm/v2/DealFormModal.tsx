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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCreateCRMDeal, useUpdateCRMDeal, useCRMDeals } from "@/hooks/crm/v2/deals";
import { useCRMAccounts } from "@/hooks/crm/v2/accounts";
import { useCRMContacts } from "@/hooks/crm/v2/contacts";
import { useCRMPipelines, type CRMPipelineStage } from "@/hooks/crm/v2/pipelines";
import { useTeamMembers } from "@/hooks/crm/v2/team-members";

const dealSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  account_id: z.string().min(1, "La cuenta es obligatoria"),
  contact_id: z.string().optional(),
  pipeline_id: z.string().min(1, "El pipeline es obligatorio"),
  stage_id: z.string().min(1, "La etapa es obligatoria"),
  amount: z.string().optional(),
  expected_close_date: z.string().optional(),
  notes: z.string().optional(),
  assigned_to: z.string().optional(),
});

type DealFormValues = z.infer<typeof dealSchema>;

interface Props {
  open: boolean;
  onClose: () => void;
  dealId?: string | null; // If provided, edit mode
  defaultAccountId?: string;
  defaultPipelineId?: string;
  defaultStageId?: string;
}

type AccountLite = { id: string; name?: string | null };
type ContactLite = { id: string; account_id?: string | null; full_name?: string | null };

export function DealFormModal({
  open,
  onClose,
  dealId,
  defaultAccountId,
  defaultPipelineId,
  defaultStageId,
}: Props) {
  const createDeal = useCreateCRMDeal();
  const updateDeal = useUpdateCRMDeal();
  const { data: allDeals = [] } = useCRMDeals();
  const existingDeal = dealId ? allDeals.find((d: any) => d.id === dealId) : null;
  const isEdit = !!existingDeal;
  const { data: accounts = [] } = useCRMAccounts();
  const { data: contacts = [] } = useCRMContacts();
  const { data: pipelines = [] } = useCRMPipelines();
  const { data: teamMembers = [] } = useTeamMembers();

  const defaultPipeline =
    pipelines.find((p) => p.id === defaultPipelineId) || pipelines.find((p) => p.is_default) || pipelines[0];
  const defaultStage =
    (defaultPipeline?.stages ?? []).find((s) => s.id === defaultStageId) || (defaultPipeline?.stages ?? [])[0];

  const form = useForm<DealFormValues>({
    resolver: zodResolver(dealSchema),
    defaultValues: {
      name: "",
      account_id: defaultAccountId ?? "",
      contact_id: "",
      pipeline_id: defaultPipeline?.id ?? "",
      stage_id: defaultStage?.id ?? "",
      amount: "",
      expected_close_date: "",
      notes: "",
      assigned_to: "",
    },
  });

  useEffect(() => {
    if (!open) return;
    if (isEdit && existingDeal) {
      form.reset({
        name: (existingDeal as any).name ?? "",
        account_id: (existingDeal as any).account_id ?? "",
        contact_id: (existingDeal as any).contact_id ?? "",
        pipeline_id: (existingDeal as any).pipeline_id ?? "",
        stage_id: (existingDeal as any).stage_id ?? "",
        amount: (existingDeal as any).amount?.toString() ?? "",
        expected_close_date: (existingDeal as any).expected_close_date ?? "",
        notes: ((existingDeal as any).metadata as any)?.notes ?? "",
        assigned_to: (existingDeal as any).assigned_to ?? "",
      });
    } else {
      if (defaultAccountId) form.setValue("account_id", defaultAccountId);
      if (defaultPipeline?.id) form.setValue("pipeline_id", defaultPipeline.id);
      if (defaultStage?.id) form.setValue("stage_id", defaultStage.id);
    }
  }, [open, isEdit, existingDeal, defaultAccountId, defaultPipeline?.id, defaultStage?.id, form]);

  const onSubmit = async (values: DealFormValues) => {
    const pipeline = pipelines.find((p) => p.id === values.pipeline_id);
    const stage = (pipeline?.stages ?? []).find((s) => s.id === values.stage_id);

    const payload: Record<string, unknown> = {
      name: values.name,
      account_id: values.account_id,
      pipeline_id: values.pipeline_id,
      stage_id: values.stage_id,
      stage: stage?.name ?? "",
      opportunity_type: "sales",
      stage_entered_at: new Date().toISOString(),
    };

    if (values.contact_id) payload.contact_id = values.contact_id;
    if (values.amount) {
      const numAmount = parseFloat(values.amount);
      payload.amount = numAmount;
      const prob = stage?.probability ?? 50;
      payload.weighted_amount = Math.round((numAmount * Number(prob)) / 100);
    }
    if (values.expected_close_date) payload.expected_close_date = values.expected_close_date;
    if (values.notes) payload.metadata = { notes: values.notes };
    if (values.assigned_to) payload.assigned_to = values.assigned_to;

    if (isEdit && dealId) {
      await updateDeal.mutateAsync({ id: dealId, data: payload });
    } else {
      await createDeal.mutateAsync(payload);
    }
    form.reset();
    onClose();
  };

  const selectedAccount = form.watch("account_id");
  const availableContacts = (contacts as ContactLite[]).filter((c) => c.account_id === selectedAccount);

  const selectedPipelineId = form.watch("pipeline_id");
  const selectedPipeline = pipelines.find((p) => p.id === selectedPipelineId) ?? defaultPipeline;
  const stageOptions = (selectedPipeline?.stages ?? []) as CRMPipelineStage[];

  useEffect(() => {
    // Si cambias pipeline, forzamos primera etapa
    if (!open) return;
    const currentStageId = form.getValues("stage_id");
    const stillValid = stageOptions.some((s) => s.id === currentStageId);
    if (!stillValid) {
      const first = stageOptions[0];
      if (first?.id) form.setValue("stage_id", first.id);
    }
  }, [open, selectedPipelineId, stageOptions, form]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar Deal" : "Nuevo Deal"}</DialogTitle>
          <DialogDescription>{isEdit ? "Modifica los datos de la oportunidad" : "Crea una nueva oportunidad en el CRM"}</DialogDescription>
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
                {(accounts as AccountLite[]).map((a) => (
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
                {availableContacts.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="pipeline_id">Pipeline</Label>
              <Select value={form.watch("pipeline_id")} onValueChange={(v) => form.setValue("pipeline_id", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar pipeline" />
                </SelectTrigger>
                <SelectContent>
                  {pipelines.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="stage_id">Etapa</Label>
              <Select
                value={form.watch("stage_id")}
                onValueChange={(v) => form.setValue("stage_id", v)}
                disabled={!selectedPipelineId || stageOptions.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={stageOptions.length === 0 ? "Sin etapas" : "Seleccionar etapa"} />
                </SelectTrigger>
                <SelectContent>
                  {stageOptions.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="expected_close_date">Fecha estimada cierre</Label>
              <Input id="expected_close_date" type="date" {...form.register("expected_close_date")} />
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
            <Textarea id="notes" {...form.register("notes")} placeholder="Detalles adicionales..." rows={3} />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createDeal.isPending || updateDeal.isPending}>
              {(createDeal.isPending || updateDeal.isPending) ? (isEdit ? "Guardando..." : "Creando...") : (isEdit ? "Guardar cambios" : "Crear Deal")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
