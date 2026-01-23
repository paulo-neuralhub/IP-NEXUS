import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useIsBackofficeStaff() {
  return useQuery({
    queryKey: ["is-backoffice-staff"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("is_backoffice_staff");
      if (error) throw error;
      return !!data;
    },
  });
}
