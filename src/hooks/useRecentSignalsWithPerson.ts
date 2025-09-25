import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface RecentSignalWithPerson {
  id: string;
  person_id: string;
  ts: string;
  person: string;
  email: string;
  level: string;
  reason: string;
  score_delta: number | null;
}

const LEVEL_PRIORITY: Record<string, number> = {
  critical: 1,
  risk: 2,
  warn: 3,
  warning: 3,
  info: 4,
};

export const useRecentSignalsWithPerson = () => {
  return useQuery({
    queryKey: ['recent-signals-with-person-v2'],
    queryFn: async (): Promise<RecentSignalWithPerson[]> => {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

      const { data, error } = await supabase
        .from('signal')
        .select(`
          id,
          person_id,
          ts,
          level,
          reason,
          score_delta,
          person!inner (
            name,
            email
          )
        `)
        .gte('ts', thirtyDaysAgo)
        .order('ts', { ascending: false })
        .limit(500);

      if (error) throw error;

      const mapped = (data || []).map((s: any) => ({
        id: s.id,
        person_id: s.person_id,
        ts: s.ts,
        person: s.person?.name ?? 'Unknown',
        email: s.person?.email ?? '',
        level: s.level,
        reason: s.reason,
        score_delta: s.score_delta ?? 0,
      }));

      // One row per person per level (keep most recent)
      const ranked = new Map<string, RecentSignalWithPerson>();
      mapped.forEach((s) => {
        const key = `${s.person_id}_${s.level}`;
        const existing = ranked.get(key);
        if (!existing || new Date(s.ts) > new Date(existing.ts)) {
          ranked.set(key, s);
        }
      });

      // Sort by level priority then ts desc
      const result = Array.from(ranked.values()).sort((a, b) => {
        const ap = LEVEL_PRIORITY[a.level?.toLowerCase()] ?? 5;
        const bp = LEVEL_PRIORITY[b.level?.toLowerCase()] ?? 5;
        if (ap !== bp) return ap - bp;
        return new Date(b.ts).getTime() - new Date(a.ts).getTime();
      });

      // Limit to a reasonable number for the widget
      return result.slice(0, 8);
    },
    refetchInterval: 30000,
  });
};