import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface PersonSignalsSummary {
  id: string;
  name: string;
  email: string;
  last_signal: string;
  critical_count: number;
  risk_count: number;
  warn_count: number;
  info_count: number;
  risk_score: number;
  cohort_median: number;
}

export const usePersonSignalsSummary = () => {
  return useQuery({
    queryKey: ['person-signals-summary'],
    queryFn: async (): Promise<PersonSignalsSummary[]> => {
      // Fetch signals with person data
      const { data: signalsData, error: signalsError } = await supabase
        .from('signal')
        .select(`
          person_id,
          level,
          ts,
          person!inner(id, name, email)
        `)
        .order('ts', { ascending: false });

      if (signalsError) throw signalsError;

      const { data: riskData, error: riskError } = await supabase
        .from('risk_score')
        .select('person_id, score')
        .order('calculated_at', { ascending: false });

      if (riskError) throw riskError;

      // Group signals by person
      const personMap = new Map<string, PersonSignalsSummary>();
      
      signalsData?.forEach(signal => {
        const personId = signal.person_id;
        const person = signal.person;
        
        if (!personMap.has(personId)) {
          const riskScore = riskData?.find(r => r.person_id === personId)?.score || 0;
          
          personMap.set(personId, {
            id: personId,
            name: person.name,
            email: person.email,
            last_signal: signal.ts,
            critical_count: 0,
            risk_count: 0,
            warn_count: 0,
            info_count: 0,
            risk_score: riskScore,
            cohort_median: 4.0 // Default cohort median
          });
        }
        
        const summary = personMap.get(personId)!;
        
        // Update last signal if more recent
        if (new Date(signal.ts) > new Date(summary.last_signal)) {
          summary.last_signal = signal.ts;
        }
        
        // Count signals by level
        switch (signal.level.toLowerCase()) {
          case 'critical':
            summary.critical_count++;
            break;
          case 'risk':
            summary.risk_count++;
            break;
          case 'warn':
            summary.warn_count++;
            break;
          case 'info':
            summary.info_count++;
            break;
        }
      });

      // Calculate cohort median risk score
      const allRiskScores = Array.from(personMap.values()).map(p => p.risk_score).filter(score => score > 0);
      const cohortMedian = allRiskScores.length > 0 
        ? allRiskScores.sort((a, b) => a - b)[Math.floor(allRiskScores.length / 2)] 
        : 4.0;

      // Update cohort median for all people
      personMap.forEach(person => {
        person.cohort_median = cohortMedian;
      });

      return Array.from(personMap.values())
        .filter(person => person.critical_count + person.risk_count + person.warn_count + person.info_count > 0)
        .sort((a, b) => b.risk_score - a.risk_score)
        .slice(0, 10); // Limit to top 10
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};