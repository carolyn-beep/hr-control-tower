import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface RecentSignal {
  ts: string;
  name: string;
  level: string;
  reason: string;
}

export const useRecentSignals = () => {
  return useQuery({
    queryKey: ['recent-signals'],
    queryFn: async (): Promise<RecentSignal[]> => {
      const { data, error } = await supabase
        .from('signal')
        .select(`
          ts,
          level,
          reason,
          person:person_id (
            name
          )
        `)
        .order('ts', { ascending: false })
        .limit(5);

      if (error) throw error;

      // Transform the data to match our interface
      return data.map(item => ({
        ts: item.ts,
        name: (item.person as any)?.name || 'Unknown',
        level: item.level,
        reason: item.reason
      }));
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};