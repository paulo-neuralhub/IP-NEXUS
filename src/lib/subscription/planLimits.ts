import { z } from "zod";
import type { PlanLimits } from "@/types/backoffice";

// Normaliza/valida el JSONB `limits` que viene de Supabase.
// Si faltan campos, aplica defaults seguros para mantener el tipado.

const planLimitsSchema = z
  .object({
    max_users: z.number(),
    max_matters: z.number(),
    max_storage_gb: z.number(),
    max_contacts: z.number(),
    max_ai_messages_day: z.number(),
    max_ai_docs_month: z.number(),
    max_email_campaigns_month: z.number(),
    max_watchlists: z.number(),
  })
  .passthrough();

const defaultPlanLimits: PlanLimits = {
  max_users: -1,
  max_matters: -1,
  max_storage_gb: -1,
  max_contacts: -1,
  max_ai_messages_day: -1,
  max_ai_docs_month: -1,
  max_email_campaigns_month: -1,
  max_watchlists: -1,
};

export function coercePlanLimits(input: unknown): PlanLimits {
  const direct = planLimitsSchema.safeParse(input);
  if (direct.success) return direct.data as PlanLimits;

  const obj = (typeof input === "object" && input !== null ? input : {}) as Record<string, unknown>;
  const merged: Record<string, unknown> = { ...defaultPlanLimits, ...obj };
  const mergedParsed = planLimitsSchema.safeParse(merged);
  if (mergedParsed.success) return mergedParsed.data as PlanLimits;

  return defaultPlanLimits;
}
