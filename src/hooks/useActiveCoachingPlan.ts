import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ActiveCoachingPlan {
  id: string;
  person_id: string;
  objective: string;
  status: string;
  created_at: string;
}

export const useActiveCoachingPlan = (personId: string | null) => {
  return useQuery({
    queryKey: ['active-coaching-plan', personId],
    queryFn: async (): Promise<ActiveCoachingPlan | null> => {
      if (!personId) return null;
      
      const { data, error } = await supabase
        .from('coaching_plan')
        .select('*')
        .eq('person_id', personId)
        .eq('status', 'active')
        .maybeSingle();

      if (error) throw error;

      return data;
    },
    enabled: !!personId,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};