import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PersonKPI {
  kpi: string;
  value: number;
  unit: string;
  ts: string;
}

export interface KPIBenchmark {
  kpi: string;
  role: string;
  median_14d: number;
}

export const usePersonKPIs = (personId: string | null) => {
  return useQuery({
    queryKey: ['person-kpis', personId],
    queryFn: async (): Promise<PersonKPI[]> => {
      if (!personId) return [];
      
      const { data, error } = await supabase
        .from('performance_event')
        .select(`
          value,
          ts,
          kpi!inner (
            name,
            unit
          )
        `)
        .eq('person_id', personId)
        .gte('ts', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString())
        .order('ts', { ascending: true });

      if (error) throw error;

      return (data || []).map(item => ({
        kpi: (item.kpi as any).name,
        value: item.value || 0,
        unit: (item.kpi as any).unit,
        ts: item.ts
      }));
    },
    enabled: !!personId,
    refetchInterval: 30000,
  });
};

export const useKPIBenchmarks = (role: string | null) => {
  return useQuery({
    queryKey: ['kpi-benchmarks', role],
    queryFn: async (): Promise<KPIBenchmark[]> => {
      if (!role) return [];
      
      const { data, error } = await supabase
        .from('v_kpi_benchmarks')
        .select('*')
        .eq('role', role);

      if (error) throw error;

      return data || [];
    },
    enabled: !!role,
    refetchInterval: 300000, // Refresh every 5 minutes
  });
};