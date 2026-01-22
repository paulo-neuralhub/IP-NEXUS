import { z } from "zod";
import type { Subscription, SubscriptionPlan } from "@/types/backoffice";
import { coercePlanLimits } from "@/lib/subscription/planLimits";

const featuresSchema = z.array(z.string());

export function mapSubscriptionPlanRow(row: unknown): SubscriptionPlan {
  const r = (typeof row === "object" && row !== null ? row : {}) as Record<string, unknown>;

  // Nota: aquí tipamos el resto de campos por “shape” esperado, pero solo normalizamos
  // lo que nos estaba rompiendo TS (limits/features). El resto viene ya desde Supabase.
  return {
    ...(r as unknown as SubscriptionPlan),
    limits: coercePlanLimits(r.limits),
    features: featuresSchema.safeParse(r.features).success
      ? (r.features as string[])
      : [],
  };
}

const billingCycleSchema = z.enum(["monthly", "yearly"]);
const subscriptionStatusSchema = z.enum([
  "trialing",
  "active",
  "past_due",
  "canceled",
  "unpaid",
  "paused",
]);

export function mapSubscriptionRow(row: unknown): Subscription {
  const r = (typeof row === "object" && row !== null ? row : {}) as Record<string, unknown>;

  const plan = r.plan ? mapSubscriptionPlanRow(r.plan) : undefined;

  // Coerciones mínimas para evitar incompatibilidades de string -> union.
  const billing_cycle = billingCycleSchema.safeParse(r.billing_cycle).success
    ? (r.billing_cycle as Subscription["billing_cycle"])
    : "monthly";

  const status = subscriptionStatusSchema.safeParse(r.status).success
    ? (r.status as Subscription["status"])
    : "active";

  return {
    ...(r as unknown as Subscription),
    billing_cycle,
    status,
    plan,
  };
}
