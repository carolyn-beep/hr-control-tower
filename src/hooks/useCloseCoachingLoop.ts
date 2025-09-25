import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CloseLoopParams {
  personId: string;
}

export const useCloseCoachingLoop = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ personId }: CloseLoopParams) => {
      // Update coaching plan to completed
      const { error: updateError } = await supabase
        .from('coaching_plan')
        .update({ status: 'completed' })
        .eq('person_id', personId)
        .eq('status', 'active');

      if (updateError) throw updateError;

      // Insert completion signal
      const { error: insertError } = await supabase
        .from('signal')
        .insert({
          person_id: personId,
          ts: new Date().toISOString(),
          level: 'info',
          reason: 'Coaching loop completed',
          score_delta: -2
        });

      if (insertError) throw insertError;

      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Loop closed — kudos sent",
        description: "Coaching cycle completed successfully",
      });
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['ranked-signals'] });
      queryClient.invalidateQueries({ queryKey: ['recent-signals'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to close coaching loop",
        variant: "destructive"
      });
      console.error('Error closing coaching loop:', error);
    }
  });
};