import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface RecentSignalWithPerson {
  id: string;
  person_id: string;
  ts: string;
  person: string;
  email: string;
  level: string;
  reason: string;
  score_delta: number | null;
}

export const useRecentSignalsWithPerson = () => {
  return useQuery({
    queryKey: ['recent-signals-with-person'],
    queryFn: async (): Promise<RecentSignalWithPerson[]> => {
      const { data, error } = await supabase
        .from('signal')
        .select(`
          id,
          person_id,
          ts,
          level,
          reason,
          score_delta,
          person!inner (
            name,
            email
          )
        `)
        .order('ts', { ascending: false })
        .limit(5);

      if (error) throw error;

      return data?.map(signal => ({
        id: signal.id,
        person_id: signal.person_id,
        ts: signal.ts,
        person: (signal.person as any).name,
        email: (signal.person as any).email,
        level: signal.level,
        reason: signal.reason,
        score_delta: signal.score_delta
      })) || [];
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};