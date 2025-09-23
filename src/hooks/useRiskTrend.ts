import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface RiskTrendData {
  day: string;
  avg_risk: number;
}

export const useRiskTrend = () => {
  return useQuery({
    queryKey: ['risk-trend'],
    queryFn: async (): Promise<RiskTrendData[]> => {
      const { data, error } = await supabase
        .from('risk_score')
        .select('calculated_at, score');
      
      if (error) throw error;
      
      // Process data client-side to group by day and calculate averages
      const groupedData: { [key: string]: number[] } = {};
      
      data?.forEach(item => {
        const day = new Date(item.calculated_at).toISOString().split('T')[0];
        if (!groupedData[day]) {
          groupedData[day] = [];
        }
        groupedData[day].push(item.score);
      });
      
      return Object.entries(groupedData).map(([day, scores]) => ({
        day,
        avg_risk: Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
      })).sort((a, b) => a.day.localeCompare(b.day));
    },
    refetchInterval: 300000, // Refresh every 5 minutes
  });
};