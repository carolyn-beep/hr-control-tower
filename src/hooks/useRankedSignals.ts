import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface RankedSignalData {
  id: string;
  ts: string;
  person_id: string;
  person: string;
  email: string;
  level: string;
  reason: string;
  score_delta: number | null;
  action_type: 'release' | 'coach' | 'kudos' | 'none';
}

interface UseRankedSignalsProps {
  levelFilter?: string;
  startDate?: string;
  endDate?: string;
  multipleLevels?: string[];
}

export const useRankedSignals = ({ levelFilter, startDate, endDate, multipleLevels }: UseRankedSignalsProps = {}) => {
  return useQuery({
    queryKey: ['ranked-signals', levelFilter, startDate, endDate, multipleLevels],
    queryFn: async (): Promise<RankedSignalData[]> => {
      // Fetch all signals with person data
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

      // Transform signals to match SQL structure
      const signals = (data || []).map(signal => ({
        id: signal.id,
        ts: signal.ts,
        person_id: signal.person_id,
        person: (signal.person as any).name,
        email: (signal.person as any).email,
        level: signal.level,
        reason: signal.reason,
        score_delta: signal.score_delta ?? 0,
        action_type: getActionType(signal.level)
      }));

      // Group by person_id and level, then get most recent (ROW_NUMBER() OVER logic)
      const ranked = new Map<string, RankedSignalData>();
      
      signals.forEach(signal => {
        const key = `${signal.person_id}_${signal.level}`;
        const existing = ranked.get(key);
        
        if (!existing || new Date(signal.ts) > new Date(existing.ts)) {
          ranked.set(key, signal);
        }
      });

      // Convert back to array and apply level filters
      let result = Array.from(ranked.values());

      if (multipleLevels && multipleLevels.length > 0) {
        result = result.filter(signal => multipleLevels.includes(signal.level));
      } else if (levelFilter && levelFilter !== 'all') {
        result = result.filter(signal => signal.level === levelFilter);
      }

      // Sort by priority and timestamp (matching SQL ORDER BY)
      return result.sort((a, b) => {
        const levelPriority = { 'critical': 1, 'risk': 2, 'warn': 3, 'info': 4 };
        const aPriority = levelPriority[a.level as keyof typeof levelPriority] || 5;
        const bPriority = levelPriority[b.level as keyof typeof levelPriority] || 5;
        
        if (aPriority !== bPriority) {
          return aPriority - bPriority;
        }
        
        return new Date(b.ts).getTime() - new Date(a.ts).getTime();
      });
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