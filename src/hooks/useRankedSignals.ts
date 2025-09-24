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
}

interface UseRankedSignalsProps {
  levelFilter?: string;
  startDate?: string;
  endDate?: string;
  multipleLevels?: string[];
}

export const useRankedSignals = ({ levelFilter, startDate, endDate, multipleLevels }: UseRankedSignalsProps = {}) => {
  console.log('useRankedSignals called with:', { levelFilter, startDate, endDate, multipleLevels });
  
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

      console.log('Raw signal data:', data?.length, 'signals');
      console.log('First few signals:', data?.slice(0, 3));

      if (error) {
        console.error('Error fetching signals:', error);
        throw error;
      }

      // Transform signals to match SQL structure and check safeguards
      const uniquePersonIds = [...new Set(data.map(signal => signal.person_id))];
      
      // Fetch safeguards for all unique persons in parallel
      const safeguardsPromises = uniquePersonIds.map(async (personId) => {
        try {
          const { data: safeguardData } = await supabase.rpc('release_safeguards', {
            target_person_id: personId
          });
          return { personId, safeguards: safeguardData?.[0] || null };
        } catch (error) {
          console.error(`Error fetching safeguards for person ${personId}:`, error);
          return { personId, safeguards: null };
        }
      });

      const safeguardsResults = await Promise.all(safeguardsPromises);
      const safeguardsMap = new Map(
        safeguardsResults.map(result => [result.personId, result.safeguards])
      );

      const signals = (data || []).map(signal => {
        const safeguards = safeguardsMap.get(signal.person_id);
        const actionInfo = getActionTypeWithSafeguards(signal.level, safeguards);
        
        return {
          id: signal.id,
          ts: signal.ts,
          person_id: signal.person_id,
          person: (signal.person as any).name,
          email: (signal.person as any).email,
          level: signal.level,
          reason: signal.reason,
          score_delta: signal.score_delta ?? 0,
          action_type: actionInfo.type,
          action_disabled: actionInfo.disabled,
          action_reason: actionInfo.reason
        };
      });

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

      console.log('Before filtering - signals count:', result.length);
      console.log('Filter params:', { multipleLevels, levelFilter });

      if (multipleLevels && multipleLevels.length > 0) {
        console.log('Filtering with multipleLevels:', multipleLevels);
        result = result.filter(signal => multipleLevels.includes(signal.level));
        console.log('After multipleLevels filter:', result.length);
      } else if (levelFilter && levelFilter !== 'all') {
        console.log('Filtering with levelFilter:', levelFilter);
        result = result.filter(signal => signal.level === levelFilter);
        console.log('After levelFilter:', result.length);
      }

      // Sort by priority and timestamp (matching SQL ORDER BY)
      const sortedResult = result.sort((a, b) => {
        const levelPriority = { 'critical': 1, 'risk': 2, 'warn': 3, 'info': 4 };
        const aPriority = levelPriority[a.level as keyof typeof levelPriority] || 5;
        const bPriority = levelPriority[b.level as keyof typeof levelPriority] || 5;
        
        if (aPriority !== bPriority) {
          return aPriority - bPriority;
        }
        
        return new Date(b.ts).getTime() - new Date(a.ts).getTime();
      });

      console.log('Final result:', sortedResult.length, 'signals');
      console.log('Final signals preview:', sortedResult.slice(0, 3));
      return sortedResult;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};

function getActionTypeWithSafeguards(level: string, safeguards: any): { 
  type: 'release' | 'coach' | 'kudos' | 'none', 
  disabled: boolean, 
  reason?: string 
} {
  if (level === 'critical' || level === 'risk') {
    if (!safeguards) {
      return { type: 'release', disabled: true, reason: 'Safeguard data unavailable' };
    }
    
    const isDisabled = !safeguards.tenure_ok || !safeguards.data_ok;
    let reason = '';
    
    if (!safeguards.tenure_ok && !safeguards.data_ok) {
      reason = 'Tenure < 21 days AND insufficient evidence';
    } else if (!safeguards.tenure_ok) {
      reason = 'Tenure < 21 days';
    } else if (!safeguards.data_ok) {
      reason = 'Insufficient evidence (< 3 data points in 14 days)';
    }
    
    return { type: 'release', disabled: isDisabled, reason };
  }
  
  if (level === 'warn') {
    return { type: 'coach', disabled: false };
  }
  
  if (level === 'info') {
    return { type: 'kudos', disabled: false };
  }
  
  return { type: 'none', disabled: false };
}