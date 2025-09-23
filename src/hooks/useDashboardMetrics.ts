import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface DashboardMetrics {
  criticalSignals: number;
  criticalSignalsChange: number;
  riskSignals: number;
  riskSignalsChange: number;
  activeCoachingPlans: number;
  activeCoachingPlansChange: number;
  avgRiskScore: number;
  avgRiskScoreChange: number;
  cohortMedianRiskScore: number;
}

export const useDashboardMetrics = () => {
  return useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: async (): Promise<DashboardMetrics> => {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();

      // Get critical signals count (last 7 days vs previous 7 days)
      const [{ count: criticalCount }, { count: criticalCountPrev }] = await Promise.all([
        supabase
          .from('signal')
          .select('*', { count: 'exact', head: true })
          .eq('level', 'critical')
          .gte('ts', sevenDaysAgo),
        supabase
          .from('signal')
          .select('*', { count: 'exact', head: true })
          .eq('level', 'critical')
          .gte('ts', fourteenDaysAgo)
          .lt('ts', sevenDaysAgo)
      ]);

      // Get risk signals count (last 7 days vs previous 7 days)
      const [{ count: riskCount }, { count: riskCountPrev }] = await Promise.all([
        supabase
          .from('signal')
          .select('*', { count: 'exact', head: true })
          .eq('level', 'risk')
          .gte('ts', sevenDaysAgo),
        supabase
          .from('signal')
          .select('*', { count: 'exact', head: true })
          .eq('level', 'risk')
          .gte('ts', fourteenDaysAgo)
          .lt('ts', sevenDaysAgo)
      ]);

      // Get active coaching plans count vs last week
      const [{ count: coachingCount }, { count: coachingCountPrev }] = await Promise.all([
        supabase
          .from('coaching_plan')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active'),
        supabase
          .from('coaching_plan')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active')
          .lt('created_at', sevenDaysAgo)
      ]);

      // Get current and previous week's average risk scores
      const [{ data: currentRiskScores }, { data: prevRiskScores }, { data: allRiskScores }] = await Promise.all([
        supabase
          .from('risk_score')
          .select('score')
          .gte('calculated_at', sevenDaysAgo),
        supabase
          .from('risk_score')
          .select('score')
          .gte('calculated_at', fourteenDaysAgo)
          .lt('calculated_at', sevenDaysAgo),
        supabase
          .from('risk_score')
          .select('score')
      ]);

      const currentAvg = currentRiskScores?.length ? 
        Math.round(currentRiskScores.reduce((sum, item) => sum + Number(item.score), 0) / currentRiskScores.length * 10) / 10 : 0;
      
      const prevAvg = prevRiskScores?.length ? 
        Math.round(prevRiskScores.reduce((sum, item) => sum + Number(item.score), 0) / prevRiskScores.length * 10) / 10 : 0;

      // Calculate cohort median
      const allScores = allRiskScores?.map(item => Number(item.score)).sort((a, b) => a - b) || [];
      const cohortMedian = allScores.length ? 
        allScores.length % 2 === 0 
          ? Math.round(((allScores[allScores.length / 2 - 1] + allScores[allScores.length / 2]) / 2) * 10) / 10
          : Math.round(allScores[Math.floor(allScores.length / 2)] * 10) / 10
        : 0;

      return {
        criticalSignals: criticalCount || 0,
        criticalSignalsChange: (criticalCount || 0) - (criticalCountPrev || 0),
        riskSignals: riskCount || 0,
        riskSignalsChange: (riskCount || 0) - (riskCountPrev || 0),
        activeCoachingPlans: coachingCount || 0,
        activeCoachingPlansChange: (coachingCount || 0) - (coachingCountPrev || 0),
        avgRiskScore: currentAvg,
        avgRiskScoreChange: Math.round((currentAvg - prevAvg) * 10) / 10,
        cohortMedianRiskScore: cohortMedian
      };
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};