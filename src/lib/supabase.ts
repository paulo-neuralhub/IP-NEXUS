// ============================================================
// IP-NEXUS - Supabase client re-export
// This file exists for compatibility with modules that import `@/lib/supabase`.
// ============================================================

import { supabase } from "@/integrations/supabase/client";

// Re-export
export { supabase };

// ============================================================
// Compatibility helpers
// Some newly-created tables may not yet be reflected in the generated
// Supabase types file in the repo, which can cause TS overload failures.
// These helpers keep strict typing out of the call sites.
// ============================================================

// NOTE: We intentionally return `any` here.
// Reason: Supabase's generated types can become huge unions when table/function
// names are dynamic strings, causing TS2589 (deep/infinite instantiation).
// Call sites should cast `data` to their domain types.
export function fromTable(table: string): any {
  // Ensure the *expression* is also typed as `any` so TS doesn't attempt to
  // resolve Postgrest generic types for unknown tables.
  const client: any = supabase;
  return client.from(table);
}

export function rpcFn(fn: string, args?: Record<string, unknown>): any {
  const client: any = supabase;
  return client.rpc(fn, args);
}
