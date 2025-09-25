import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PersonOverview {
  id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  risk_score: number;
  status: string;
  last_signal_ts: string | null;
}

export const usePeopleOverview = () => {
  return useQuery({
    queryKey: ['people-overview'],
    queryFn: async (): Promise<PersonOverview[]> => {
      const { data, error } = await supabase
        .from('v_person_overview')
        .select('*')
        .order('risk_score', { ascending: false, nullsFirst: false });

      if (error) {
        throw error;
      }

      return (data || []).map(item => ({
        ...item,
        department: (item as any).department || 'Unknown'
      }));
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};