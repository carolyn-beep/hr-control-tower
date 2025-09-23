import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ReleaseSafeguards {
  tenure_ok: boolean;
  data_ok: boolean;
  coach_ok: boolean;
  messages: string[];
}

export const useReleaseSafeguards = (personId: string | null) => {
  return useQuery({
    queryKey: ['release-safeguards', personId],
    queryFn: async (): Promise<ReleaseSafeguards | null> => {
      if (!personId) return null;
      
      const { data, error } = await supabase.rpc('release_safeguards', {
        target_person_id: personId
      });

      if (error) throw error;

      return data?.[0] || null;
    },
    enabled: !!personId,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};