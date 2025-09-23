import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DemoDataResult {
  success: boolean;
  signals_inserted: number;
  risk_scores_updated: number;
  people: Array<{
    name: string;
    id: string;
  }>;
}

export const useRefreshDemoData = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      // Only allow in development/demo environments
      const isProduction = window.location.hostname.includes('production') || 
                          window.location.hostname.includes('prod');
      
      if (isProduction) {
        throw new Error('Demo data refresh is not available in production');
      }

      const { data, error } = await supabase.rpc('refresh_demo_data');
      
      if (error) throw error;
      
      return data as unknown as DemoDataResult;
    },
    onSuccess: (data) => {
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['recent-signals-with-person'] });
      queryClient.invalidateQueries({ queryKey: ['signals'] });
      queryClient.invalidateQueries({ queryKey: ['risk-trend'] });
      
      toast({
        title: "Demo data refreshed",
        description: `Added ${data.signals_inserted} new signals and updated ${data.risk_scores_updated} risk scores.`,
        duration: 3000,
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to refresh demo data",
        description: error.message,
        variant: "destructive",
        duration: 5000,
      });
    },
  });
};