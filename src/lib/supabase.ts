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

type FromReturn = ReturnType<typeof supabase.from>;

export function fromTable(table: string): FromReturn {
  return (supabase as unknown as { from: (t: string) => FromReturn }).from(table);
}

type RpcReturn = ReturnType<typeof supabase.rpc>;

export function rpcFn(fn: string, args?: Record<string, unknown>): RpcReturn {
  return (supabase as unknown as { rpc: (f: string, a?: Record<string, unknown>) => RpcReturn }).rpc(fn, args);
}
