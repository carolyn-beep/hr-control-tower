import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface IndividualRecentSignal {
  id: string;
  person_id: string;
  ts: string;
  person: string;
  email: string;
  level: string;
  reason: string;
  score_delta: number | null;
}

export const useIndividualRecentSignals = () => {
  return useQuery({
    queryKey: ['individual-recent-signals'],
    queryFn: async (): Promise<IndividualRecentSignal[]> => {
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
        .limit(8);

      if (error) throw error;

      const signals = data?.map(signal => ({
        id: signal.id,
        person_id: signal.person_id,
        ts: signal.ts,
        person: (signal.person as any).name,
        email: (signal.person as any).email,
        level: signal.level,
        reason: signal.reason,
        score_delta: signal.score_delta
      })) || [];

      // Custom sort: critical > risk > warn > info, then ts desc
      const levelOrder = { 'critical': 0, 'risk': 1, 'warning': 2, 'warn': 2, 'info': 3 };
      
      return signals.sort((a, b) => {
        const aLevel = levelOrder[a.level as keyof typeof levelOrder] ?? 4;
        const bLevel = levelOrder[b.level as keyof typeof levelOrder] ?? 4;
        
        if (aLevel !== bLevel) {
          return aLevel - bLevel;
        }
        
        // If same level, sort by timestamp descending
        return new Date(b.ts).getTime() - new Date(a.ts).getTime();
      });
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};