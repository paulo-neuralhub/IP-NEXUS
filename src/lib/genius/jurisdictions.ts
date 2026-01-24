import { GENIUS_JURISDICTIONS } from "@/components/genius/JurisdictionSelect";

export type GeniusPlanCode = "starter" | "professional" | "business" | "enterprise";

export function normalizePlanCode(input: unknown): GeniusPlanCode | null {
  if (typeof input !== "string") return null;
  const v = input.toLowerCase();

  if (v.includes("starter")) return "starter";
  if (v.includes("professional") || v.includes("pro")) return "professional";
  if (v.includes("business")) return "business";
  if (v.includes("enterprise")) return "enterprise";

  // Algunos proyectos usan códigos como: "plan_starter" / "tier_business".
  if (v.includes("starter")) return "starter";
  if (v.includes("professional")) return "professional";
  if (v.includes("business")) return "business";
  if (v.includes("enterprise")) return "enterprise";

  return null;
}

export function getAllowedGeniusJurisdictionsByPlan(planCode: GeniusPlanCode | null) {
  // Starter: sin acceso a Genius (el ModuleGate debería bloquear; aquí devolvemos vacío por seguridad)
  if (!planCode || planCode === "starter") return [];

  // Professional: solo ES y EUIPO (si tiene módulo)
  if (planCode === "professional") return ["ES", "EUIPO"];

  // Business: set ampliado
  if (planCode === "business") {
    return ["ES", "EUIPO", "EP", "US", "CN", "JP", "KR", "MX", "BR"];
  }

  // Enterprise: todas
  return [...GENIUS_JURISDICTIONS];
}
