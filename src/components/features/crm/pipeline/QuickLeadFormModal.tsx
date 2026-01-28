/**
 * QuickLeadFormModal - Formulario rápido para crear leads en crm_leads
 * Usado desde el Kanban de CRM Pipeline
 */

import { useState } from "react";
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
import { useTeamMembers } from "@/hooks/crm/v2/team-members";
import { useCRMPipelines } from "@/hooks/crm/v2/pipelines";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "@/contexts/organization-context";
import { toast } from "sonner";

const schema = z.object({
  contact_name: z.string().min(1, "El nombre es obligatorio"),
  contact_email: z.string().email("Email inválido").optional().or(z.literal("")),
  contact_phone: z.string().optional(),
  company_name: z.string().optional(),
  estimated_value: z.string().optional(),
  source: z.string().optional(),
  notes: z.string().optional(),
  assigned_to: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const LEAD_SOURCES = [
  { value: "web", label: "Web" },
  { value: "referido", label: "Referido" },
  { value: "llamada", label: "Llamada entrante" },
  { value: "evento", label: "Evento" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "otro", label: "Otro" },
];

type Props = {
  open: boolean;
  onClose: () => void;
  pipelineId?: string;
};

export function QuickLeadFormModal({ open, onClose, pipelineId }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { currentOrganization } = useOrganization();
  const { data: teamMembers = [] } = useTeamMembers();
  const { data: pipelines = [] } = useCRMPipelines();

  // Find lead pipeline and first stage
  const leadPipeline = pipelineId 
    ? pipelines.find(p => p.id === pipelineId)
    : pipelines.find(p => (p as any).entity_type === 'lead') || pipelines[0];
  
  const firstStage = leadPipeline?.stages?.[0];

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      contact_name: "",
      contact_email: "",
      contact_phone: "",
      company_name: "",
      estimated_value: "",
      source: "",
      notes: "",
      assigned_to: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    if (!currentOrganization?.id) {
      toast.error("No se encontró la organización");
      return;
    }

    setIsSubmitting(true);

    try {
      // Get current user for default assignment
      const { data: { user } } = await supabase.auth.getUser();

      const leadData = {
        organization_id: currentOrganization.id,
        contact_name: values.contact_name,
        contact_email: values.contact_email || null,
        contact_phone: values.contact_phone || null,
        company_name: values.company_name || null,
        estimated_value: values.estimated_value ? parseFloat(values.estimated_value) : null,
        source: values.source || null,
        notes: values.notes || null,
        assigned_to: values.assigned_to || user?.id || null,
        status: 'new',
        pipeline_id: leadPipeline?.id || null,
        stage_id: firstStage?.id || null,
        title: values.company_name 
          ? `Lead - ${values.company_name}` 
          : `Lead - ${values.contact_name}`,
      };

      const { error } = await supabase
        .from('crm_leads')
        .insert(leadData);

      if (error) throw error;

      toast.success("Lead creado correctamente");
      form.reset();
      onClose();
    } catch (err: any) {
      console.error("Error creating lead:", err);
      toast.error(`Error al crear lead: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Nuevo Lead</DialogTitle>
          <DialogDescription>
            Crea un nuevo lead en el pipeline de ventas
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Nombre y Empresa */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact_name">Nombre del contacto *</Label>
              <Input 
                id="contact_name" 
                {...form.register("contact_name")} 
                placeholder="Ej: Juan García" 
              />
              {form.formState.errors.contact_name && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.contact_name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="company_name">Empresa</Label>
              <Input 
                id="company_name" 
                {...form.register("company_name")} 
                placeholder="Ej: TechVerde S.L." 
              />
            </div>
          </div>

          {/* Email y Teléfono */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact_email">Email</Label>
              <Input 
                id="contact_email" 
                type="email"
                {...form.register("contact_email")} 
                placeholder="juan@techverde.com" 
              />
              {form.formState.errors.contact_email && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.contact_email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_phone">Teléfono</Label>
              <Input 
                id="contact_phone" 
                {...form.register("contact_phone")} 
                placeholder="+34 600 000 000" 
              />
            </div>
          </div>

          {/* Valor y Origen */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="estimated_value">Valor estimado (€)</Label>
              <Input 
                id="estimated_value" 
                type="number"
                {...form.register("estimated_value")} 
                placeholder="5000" 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="source">Origen</Label>
              <Select 
                value={form.watch("source") || ""} 
                onValueChange={(v) => form.setValue("source", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar origen..." />
                </SelectTrigger>
                <SelectContent>
                  {LEAD_SOURCES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Asignar a */}
          <div className="space-y-2">
            <Label htmlFor="assigned_to">Asignar a</Label>
            <Select
              value={form.watch("assigned_to") || ""}
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

          {/* Notas */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea 
              id="notes" 
              {...form.register("notes")} 
              placeholder="Información adicional sobre el lead..." 
              rows={3} 
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creando..." : "Crear Lead"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
