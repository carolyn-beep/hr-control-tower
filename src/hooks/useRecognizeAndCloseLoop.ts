import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface RecognizeAndCloseLoopRequest {
  personId: string;
}

export const useRecognizeAndCloseLoop = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ personId }: RecognizeAndCloseLoopRequest) => {
      // Step 1: Update coaching_plan to completed
      const { error: coachingError } = await supabase
        .from('coaching_plan')
        .update({ status: 'completed' })
        .eq('person_id', personId)
        .eq('status', 'active');

      if (coachingError) {
        throw new Error(`Failed to update coaching plan: ${coachingError.message}`);
      }

      // Step 2: Insert new signal
      const { error: signalError } = await supabase
        .from('signal')
        .insert({
          person_id: personId,
          ts: new Date().toISOString(),
          level: 'info',
          reason: 'Coaching loop completed',
          score_delta: -2
        });

      if (signalError) {
        throw new Error(`Failed to insert signal: ${signalError.message}`);
      }

      // Step 3: Call /message endpoint
      const { error: messageError } = await supabase.functions.invoke('message', {
        body: { text: 'Great job—risk down and loop closed.' }
      });

      if (messageError) {
        console.warn('Message function call failed:', messageError);
        // Don't throw error for message failure as the main actions succeeded
      }

      return { success: true };
    },
    onSuccess: () => {
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: ['individual-recent-signals'] });
      queryClient.invalidateQueries({ queryKey: ['active-coaching-plan'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
      
      toast({
        title: "Loop completed successfully",
        description: "Coaching plan completed and positive signal recorded.",
        duration: 3000,
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to complete loop",
        description: error.message,
        variant: "destructive",
        duration: 5000,
      });
    },
  });
};