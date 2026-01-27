// ============================================================
// IP-NEXUS - Edit Matter Page (Legacy matters mapped to V2 UI)
// Fixes missing /app/expedientes/:id/editar route.
// ============================================================

import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "@/contexts/organization-context";
import { useMatterV2 } from "@/hooks/use-matters-v2";
import { usePageTitle } from "@/contexts/page-context";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  status: z.string().min(1, "Selecciona un estado"),
  mark_name: z.string().optional(),
  nice_classes: z.string().optional(),
  goods_services: z.string().optional(),
  internal_notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const STATUS_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "draft", label: "Borrador" },
  { value: "pending", label: "Pendiente" },
  { value: "filed", label: "Presentado" },
  { value: "published", label: "Publicado" },
  { value: "granted", label: "Concedido" },
  { value: "active", label: "Activo" },
  { value: "opposed", label: "En oposición" },
  { value: "expired", label: "Expirado" },
  { value: "abandoned", label: "Abandonado" },
  { value: "cancelled", label: "Cancelado" },
];

export default function EditMatterPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();

  const { data: matter, isLoading, error } = useMatterV2(id!);

  usePageTitle(matter ? `Editar ${matter.matter_number}` : "Editar expediente");

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      status: "",
      mark_name: "",
      nice_classes: "",
      goods_services: "",
      internal_notes: "",
    },
  });

  useEffect(() => {
    if (!matter) return;
    form.reset({
      title: matter.title || "",
      status: matter.status || "draft",
      mark_name: matter.mark_name || "",
      nice_classes: matter.nice_classes?.join(", ") || "",
      goods_services: matter.goods_services || "",
      internal_notes: matter.internal_notes || "",
    });
  }, [matter, form]);

  const onSubmit = async (data: FormData) => {
    if (!id || !currentOrganization?.id) return;

    const niceClasses = data.nice_classes
      ? data.nice_classes
          .split(",")
          .map((c) => parseInt(c.trim(), 10))
          .filter((n) => Number.isFinite(n))
      : [];

    try {
      const { error: updateError } = await supabase
        .from("matters")
        .update({
          title: data.title,
          status: data.status,
          mark_name: data.mark_name?.trim() ? data.mark_name.trim() : null,
          nice_classes: niceClasses.length ? niceClasses : null,
          goods_services: data.goods_services?.trim() ? data.goods_services.trim() : null,
          internal_notes: data.internal_notes?.trim() ? data.internal_notes.trim() : null,
          // Mantener compatibilidad con datos que estén usando `notes`
          notes: data.internal_notes?.trim() ? data.internal_notes.trim() : null,
        })
        .eq("id", id)
        .eq("organization_id", currentOrganization.id);

      if (updateError) throw updateError;

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["matters-v2"] }),
        queryClient.invalidateQueries({ queryKey: ["matter-v2", id] }),
      ]);

      toast({ title: "Expediente actualizado" });
      navigate(`/app/expedientes/${id}`);
    } catch (e) {
      toast({
        title: "Error al guardar",
        description: e instanceof Error ? e.message : "Error desconocido",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-[420px] w-full" />
      </div>
    );
  }

  if (error || !matter) {
    return (
      <div className="p-6">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">Error al cargar el expediente</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => navigate("/app/expedientes")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isSaving = form.formState.isSubmitting;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/app/expedientes/${id}`)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Editar expediente</h1>
          <p className="text-muted-foreground">{matter.matter_number}</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Datos principales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Registro de marca ACME" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado *</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona estado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {STATUS_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Información IP</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="mark_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marca (si aplica)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: TECHVERDE" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nice_classes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Clases Nice</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: 9, 35, 42" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="goods_services"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Productos/Servicios</FormLabel>
                    <FormControl>
                      <Textarea rows={4} placeholder="Describe productos/servicios..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notas internas</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="internal_notes"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea rows={6} placeholder="Notas internas..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/app/expedientes/${id}`)}
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
