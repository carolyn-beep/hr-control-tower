import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// KPI configurations for different roles
const KPI_CONFIG = {
  'Senior Developer': {
    'PRs/week': { target: 4, unit: 'count' },
    'Review turnaround': { target: 24, unit: 'hours' },
    'Lead time': { target: 48, unit: 'hours' },
    'Bug reopen rate': { target: 5, unit: 'percent' }
  },
  'Frontend Developer': {
    'PRs/week': { target: 3, unit: 'count' },
    'Review turnaround': { target: 36, unit: 'hours' },
    'Lead time': { target: 72, unit: 'hours' },
    'Bug reopen rate': { target: 8, unit: 'percent' }
  },
  'Product Manager': {
    'Features/week': { target: 2, unit: 'count' },
    'Spec turnaround': { target: 48, unit: 'hours' },
    'Stakeholder meetings': { target: 8, unit: 'count' },
    'Bug reopen rate': { target: 3, unit: 'percent' }
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting dev signal cron job...');

    // Step 1: Import latest GitHub/Jira/CI events (stub data)
    await importEvents();
    
    // Step 2: Recompute signals using performance thresholds
    await recomputeSignals();
    
    // Step 3: Upsert risk scores based on new signals
    await updateRiskScores();

    console.log('Dev signal cron job completed successfully');

    return new Response(JSON.stringify({
      success: true,
      message: 'Dev signal cron job completed successfully',
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in dev signal cron job:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function importEvents() {
  console.log('Importing latest events...');
  
  // Get all active persons
  const { data: persons, error: personsError } = await supabase
    .from('person')
    .select('id, name, role')
    .eq('status', 'active');

  if (personsError) throw personsError;

  // Get existing KPIs
  const { data: kpis, error: kpisError } = await supabase
    .from('kpi')
    .select('*');

  if (kpisError) throw kpisError;

  const events = [];
  const now = new Date();

  // Generate performance events for each person
  for (const person of persons || []) {
    const roleConfig = KPI_CONFIG[person.role as keyof typeof KPI_CONFIG];
    
    if (!roleConfig) continue;

    for (const [kpiName, config] of Object.entries(roleConfig)) {
      const kpi = kpis?.find(k => k.name === kpiName);
      if (!kpi) continue;

      // Generate realistic performance values with some variance
      const baseValue = config.target;
      const variance = baseValue * 0.3; // 30% variance
      const actualValue = Math.max(0, baseValue + (Math.random() - 0.5) * 2 * variance);

      events.push({
        person_id: person.id,
        kpi_id: kpi.id,
        value: Number(actualValue.toFixed(2)),
        ts: now.toISOString(),
        source: `${kpiName.includes('PR') ? 'github' : kpiName.includes('Bug') ? 'jira' : 'ci'}_api`,
        meta: {
          imported_by: 'dev_signal_cron',
          simulated: true,
          role: person.role
        }
      });
    }
  }

  if (events.length > 0) {
    const { error } = await supabase
      .from('performance_event')
      .insert(events);

    if (error) throw error;
    console.log(`Inserted ${events.length} performance events`);
  }
}

async function recomputeSignals() {
  console.log('Recomputing signals...');
  
  // Get all persons with recent performance events
  const { data: persons, error: personsError } = await supabase
    .from('person')
    .select(`
      id, 
      name, 
      role,
      performance_event!inner (
        value,
        ts,
        kpi!inner (name, direction)
      )
    `)
    .gte('performance_event.ts', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

  if (personsError) throw personsError;

  const signals = [];
  const now = new Date();

  for (const person of persons || []) {
    const events = person.performance_event as any[];
    
    // Analyze performance patterns
    const kpiPerformance: Record<string, number[]> = {};
    
    events.forEach(event => {
      const kpiName = event.kpi.name;
      if (!kpiPerformance[kpiName]) {
        kpiPerformance[kpiName] = [];
      }
      kpiPerformance[kpiName].push(event.value);
    });

    // Generate signals based on performance patterns
    for (const [kpiName, values] of Object.entries(kpiPerformance)) {
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      const roleConfig = KPI_CONFIG[person.role as keyof typeof KPI_CONFIG];
      
      if (!roleConfig || !roleConfig[kpiName as keyof typeof roleConfig]) continue;
      
      const target = roleConfig[kpiName as keyof typeof roleConfig].target;
      const performance = avg / target;
      
      let level: string;
      let reason: string;
      let scoreDelta: number;

      if (performance <= 0.6) {
        level = 'critical';
        reason = `${kpiName} critically below target: ${avg.toFixed(1)} vs ${target} target`;
        scoreDelta = 2.5;
      } else if (performance <= 0.8) {
        level = 'risk';
        reason = `${kpiName} below target: ${avg.toFixed(1)} vs ${target} target`;
        scoreDelta = 1.5;
      } else if (performance <= 0.95) {
        level = 'warn';
        reason = `${kpiName} slightly below target: ${avg.toFixed(1)} vs ${target} target`;
        scoreDelta = 0.8;
      } else if (performance >= 1.2) {
        level = 'info';
        reason = `${kpiName} exceeding target: ${avg.toFixed(1)} vs ${target} target`;
        scoreDelta = -1.0;
      } else {
        continue; // Normal performance, no signal
      }

      signals.push({
        person_id: person.id,
        level,
        reason,
        score_delta: scoreDelta,
        ts: now.toISOString(),
        meta: {
          kpi: kpiName,
          actual_value: avg,
          target_value: target,
          performance_ratio: performance,
          generated_by: 'dev_signal_cron'
        }
      });
    }
  }

  if (signals.length > 0) {
    const { error } = await supabase
      .from('signal')
      .insert(signals);

    if (error) throw error;
    console.log(`Generated ${signals.length} new signals`);
  }
}

async function updateRiskScores() {
  console.log('Updating risk scores...');
  
  // Get current risk scores and new signals
  const { data: newSignals, error: signalsError } = await supabase
    .from('signal')
    .select('person_id, score_delta')
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

  if (signalsError) throw signalsError;

  if (!newSignals || newSignals.length === 0) {
    console.log('No new signals to process');
    return;
  }

  // Group signals by person and calculate total delta
  const personDeltas: Record<string, number> = {};
  newSignals.forEach(signal => {
    if (signal.score_delta) {
      personDeltas[signal.person_id] = (personDeltas[signal.person_id] || 0) + signal.score_delta;
    }
  });

  // Update or insert risk scores
  for (const [personId, totalDelta] of Object.entries(personDeltas)) {
    // Get current risk score
    const { data: currentScore } = await supabase
      .from('risk_score')
      .select('score')
      .eq('person_id', personId)
      .order('calculated_at', { ascending: false })
      .limit(1)
      .single();

    const currentRisk = currentScore?.score || 0;
    const newRisk = Math.max(0, Math.min(10, currentRisk + totalDelta));

    // Insert new risk score
    const { error } = await supabase
      .from('risk_score')
      .insert({
        person_id: personId,
        score: newRisk,
        calculated_at: new Date().toISOString()
      });

    if (error) throw error;
  }

  console.log(`Updated risk scores for ${Object.keys(personDeltas).length} persons`);
}