import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface RecoveredMetrics {
  recoveredCount: number;
  recoveredCountChange: number;
}

export const useRecoveredSignals = () => {
  return useQuery({
    queryKey: ['recovered-signals'],
    queryFn: async (): Promise<RecoveredMetrics> => {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();

      // Get recovered signals count (last 7 days vs previous 7 days)
      const [{ count: recoveredCount }, { count: recoveredCountPrev }] = await Promise.all([
        supabase
          .from('signal')
          .select('*', { count: 'exact', head: true })
          .eq('level', 'info')
          .gte('ts', sevenDaysAgo),
        supabase
          .from('signal')
          .select('*', { count: 'exact', head: true })
          .eq('level', 'info')
          .gte('ts', fourteenDaysAgo)
          .lt('ts', sevenDaysAgo)
      ]);

      return {
        recoveredCount: recoveredCount || 0,
        recoveredCountChange: (recoveredCount || 0) - (recoveredCountPrev || 0)
      };
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};