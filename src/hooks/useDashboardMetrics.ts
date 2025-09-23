import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface DashboardMetrics {
  criticalSignals: number;
  riskSignals: number;
  activeCoachingPlans: number;
  avgRiskScore: number;
}

export const useDashboardMetrics = () => {
  return useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: async (): Promise<DashboardMetrics> => {
      // Get critical signals count (last 7 days)
      const { data: criticalData, error: criticalError } = await supabase
        .from('signal')
        .select('*', { count: 'exact', head: true })
        .eq('level', 'critical')
        .gte('ts', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      if (criticalError) throw criticalError;

      // Get risk signals count (last 7 days)
      const { data: riskData, error: riskError } = await supabase
        .from('signal')
        .select('*', { count: 'exact', head: true })
        .eq('level', 'risk')
        .gte('ts', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      if (riskError) throw riskError;

      // Get active coaching plans count
      const { data: coachingData, error: coachingError } = await supabase
        .from('coaching_plan')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      if (coachingError) throw coachingError;

      // Get average risk score
      const { data: riskScoreData, error: riskScoreError } = await supabase
        .from('risk_score')
        .select('score');

      if (riskScoreError) throw riskScoreError;

      const avgRiskScore = riskScoreData && riskScoreData.length > 0
        ? Math.round(riskScoreData.reduce((sum, item) => sum + Number(item.score), 0) / riskScoreData.length * 10) / 10
        : 0;

      return {
        criticalSignals: criticalData?.length || 0,
        riskSignals: riskData?.length || 0,
        activeCoachingPlans: coachingData?.length || 0,
        avgRiskScore
      };
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};