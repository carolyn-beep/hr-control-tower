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
  action_disabled?: boolean;
  action_reason?: string;
  start_date?: string;
  tenure_ok: boolean;
  evidence_ok: boolean;
  coach_active: boolean;
  evidence_count: number;
}

interface UseRankedSignalsProps {
  levelFilter?: string;
  startDate?: string;
  endDate?: string;
  multipleLevels?: string[];
  sortMode?: 'ts_desc' | 'ts_asc' | 'priority';
}

export const useRankedSignals = ({ levelFilter, startDate, endDate, multipleLevels, sortMode = 'priority' }: UseRankedSignalsProps = {}) => {
  return useQuery({
    queryKey: ['ranked-signals', levelFilter, startDate, endDate, multipleLevels, sortMode],
    queryFn: async (): Promise<RankedSignalData[]> => {
      // Date filter - default to last 30 days if no dates specified
      const thirtyDaysAgo = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const endDateTime = endDate || new Date().toISOString();

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
            email,
            start_date
          )
        `)
        .gte('ts', thirtyDaysAgo)
        .lte('ts', endDateTime)
        .order('ts', { ascending: false });

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      if (!data) return [];

      // Get all unique person IDs for batch fetching
      const personIds = [...new Set(data.map(s => s.person_id))];
      
      // Fetch evidence counts (performance events in last 14 days)
      const evidencePromises = personIds.map(async (personId) => {
        const { count } = await supabase
          .from('performance_event')
          .select('*', { count: 'exact', head: true })
          .eq('person_id', personId)
          .gte('ts', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString());
        return { personId, evidenceCount: count || 0 };
      });

      // Check for active coaching plans
      const coachingPromises = personIds.map(async (personId) => {
        const { data } = await supabase
          .from('coaching_plan')
          .select('id')
          .eq('person_id', personId)
          .eq('status', 'active')
          .limit(1);
        return { personId, coachActive: (data?.length || 0) > 0 };
      });

      const [evidenceResults, coachingResults] = await Promise.all([
        Promise.all(evidencePromises),
        Promise.all(coachingPromises)
      ]);

      const evidenceMap = new Map(
        evidenceResults.map(({ personId, evidenceCount }) => [personId, evidenceCount])
      );
      const coachingMap = new Map(
        coachingResults.map(({ personId, coachActive }) => [personId, coachActive])
      );

      // Transform raw data
      const transformedData = data.map(signal => {
        const person = signal.person as any;
        const evidenceCount = evidenceMap.get(signal.person_id) || 0;
        const coachActive = coachingMap.get(signal.person_id) || false;
        
        // Calculate safeguard status
        const startDate = person.start_date ? new Date(person.start_date) : null;
        const tenureOk = startDate ? (Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24) >= 21 : false;
        const evidenceOk = evidenceCount >= 3;
        
        // Determine action type by level
        let action_type: 'release' | 'coach' | 'kudos' | 'none' = 'none';
        if (['risk', 'critical'].includes(signal.level)) action_type = 'release';
        else if (signal.level === 'warn') action_type = 'coach';
        else if (signal.level === 'info') action_type = 'kudos';
        
        // Calculate disable reason for release actions
        let action_disabled = false;
        let action_reason = '';
        
        if (action_type === 'release') {
          const reasons = [];
          if (!tenureOk) reasons.push('Tenure < 21 days');
          if (!evidenceOk) reasons.push('Insufficient evidence');
          
          action_disabled = reasons.length > 0;
          action_reason = reasons.join(' AND ');
        }

        return {
          id: signal.id,
          ts: signal.ts,
          person: person.name,
          email: person.email,
          level: signal.level,
          reason: signal.reason,
          score_delta: signal.score_delta,
          person_id: signal.person_id,
          action_type,
          action_disabled,
          action_reason,
          start_date: person.start_date,
          tenure_ok: tenureOk,
          evidence_ok: evidenceOk,
          coach_active: coachActive,
          evidence_count: evidenceCount
        };
      });

      // Rank by person and level (keep most recent)
      const ranked = new Map<string, RankedSignalData>();
      transformedData.forEach((signal) => {
        const key = `${signal.person_id}_${signal.level}`;
        const existing = ranked.get(key);
        if (!existing || new Date(signal.ts) > new Date(existing.ts)) {
          ranked.set(key, signal);
        }
      });

      // Convert back to array and apply level filters
      let result = Array.from(ranked.values());

      // Apply level filters
      if (multipleLevels && multipleLevels.length > 0) {
        result = result.filter(signal => multipleLevels.includes(signal.level));
      } else if (levelFilter && levelFilter !== 'all') {
        result = result.filter(signal => signal.level === levelFilter);
      }

      // Sort based on sortMode
      let sortedResult: RankedSignalData[] = [];
      if (sortMode === 'ts_desc') {
        sortedResult = result.sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime());
      } else if (sortMode === 'ts_asc') {
        sortedResult = result.sort((a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime());
      } else {
        // Default: priority then timestamp
        sortedResult = result.sort((a, b) => {
          const levelPriority = { 'critical': 1, 'risk': 2, 'warn': 3, 'info': 4 };
          const aPriority = levelPriority[a.level as keyof typeof levelPriority] || 5;
          const bPriority = levelPriority[b.level as keyof typeof levelPriority] || 5;
          if (aPriority !== bPriority) return aPriority - bPriority;
          return new Date(b.ts).getTime() - new Date(a.ts).getTime();
        });
      }

      return sortedResult;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};
