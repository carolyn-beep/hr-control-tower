import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ReleaseOpenData {
  id: string;
  name: string;
  email: string;
  opened_at: string;
  reason: string;
  status: string;
  risk_score: number;
}

export const useReleaseOpen = () => {
  return useQuery({
    queryKey: ['release-open'],
    queryFn: async (): Promise<ReleaseOpenData[]> => {
      const { data, error } = await supabase
        .from('v_release_open')
        .select('*');

      if (error) throw error;

      return data || [];
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};