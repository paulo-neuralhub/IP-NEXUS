import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type SystemLogSeverity = "debug" | "info" | "warning" | "error" | "critical";

export type SystemLogsFilters = {
  search?: string;
  category?: string | null;
  severity?: SystemLogSeverity | null;
};

const PAGE_SIZE = 50;

export function useSystemLogs(filters: SystemLogsFilters = {}) {
  return useInfiniteQuery({
    queryKey: ["backoffice-system-logs", filters],
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      const from = Number(pageParam) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      let query = supabase
        .from("system_events_log")
        .select(
          "id,occurred_at,category,event_type,severity,organization_id,title,description,event_data,requires_action"
        )
        .order("occurred_at", { ascending: false })
        .range(from, to);

      if (filters.category) query = query.eq("category", filters.category);
      if (filters.severity) query = query.eq("severity", filters.severity);

      if (filters.search?.trim()) {
        const s = filters.search.trim();
        query = query.or(`title.ilike.%${s}%,description.ilike.%${s}%,event_type.ilike.%${s}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      return {
        rows: data ?? [],
        nextPage: (data?.length ?? 0) < PAGE_SIZE ? null : Number(pageParam) + 1,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });
}
