import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SignalData {
  id: string;
  ts: string;
  person: string;
  email: string;
  level: string;
  reason: string;
  score_delta: number | null;
  person_id: string;
  action_type?: 'release' | 'coach' | 'kudos' | 'none';
}

interface UseSignalsDataProps {
  levelFilter?: string;
  startDate?: string;
  endDate?: string;
  multipleLevels?: string[];
}

export const useSignalsData = ({ levelFilter, startDate, endDate, multipleLevels }: UseSignalsDataProps = {}) => {
  return useQuery({
    queryKey: ['signals', levelFilter, startDate, endDate, multipleLevels],
    queryFn: async (): Promise<SignalData[]> => {
      let query = supabase
        .from('signal')
        .select(`
          id,
          ts,
          level,
          reason,
          score_delta,
          person_id,
          person!inner (
            name,
            email
          )
        `)
        .order('ts', { ascending: false });

      // Apply level filter
      if (multipleLevels && multipleLevels.length > 0) {
        query = query.in('level', multipleLevels);
      } else if (levelFilter && levelFilter !== 'all') {
        query = query.eq('level', levelFilter);
      }

      // Apply date range filters
      if (startDate) {
        query = query.gte('ts', startDate);
      }
      if (endDate) {
        query = query.lte('ts', endDate);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return (data || []).map(signal => ({
        id: signal.id,
        ts: signal.ts,
        person: signal.person.name,
        email: signal.person.email,
        level: signal.level,
        reason: signal.reason,
        score_delta: signal.score_delta,
        person_id: signal.person_id,
        action_type: getActionType(signal.level)
      }));
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};

function getActionType(level: string): 'release' | 'coach' | 'kudos' | 'none' {
  if (level === 'risk' || level === 'critical') return 'release';
  if (level === 'warning' || level === 'warn') return 'coach';
  if (level === 'info') return 'kudos';
  return 'none';
}