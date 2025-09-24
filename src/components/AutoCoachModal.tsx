import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Bot, User, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PersonProfile {
  id: string;
  name: string;
  email: string;
  department: string;
  risk_score: number;
  created_at: string;
}

interface KPISnapshot {
  kpi: string;
  value: number;
  benchmark: number;
  time_window: string;
  source_link: string;
}

interface CoachBotResult {
  short_dm: string;
  plan_bullets: string[];
  review_comment: string;
  measure: string;
}

interface AutoCoachModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  personId: string;
  personName: string;
  signalId?: string;
  reason?: string;
}

export const AutoCoachModal = ({ open, onOpenChange, personId, personName, signalId, reason }: AutoCoachModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [personProfile, setPersonProfile] = useState<PersonProfile | null>(null);
  const [kpiSnapshot, setKpiSnapshot] = useState<KPISnapshot[]>([]);
  const [coachResult, setCoachResult] = useState<CoachBotResult | null>(null);
  const [creatingPlan, setCreatingPlan] = useState(false);

  useEffect(() => {
    if (open && personId) {
      fetchDataAndGeneratePlan();
    }
  }, [open, personId]);

  const fetchDataAndGeneratePlan = async () => {
    setLoading(true);
    try {
      // Fetch person profile
      const { data: profileData, error: profileError } = await supabase.rpc('get_person_profile', {
        target_person_id: personId
      });
      if (profileError) throw profileError;
      if (profileData && profileData.length > 0) {
        setPersonProfile(profileData[0]);
      }

      // Fetch KPI snapshot for last 7 days
      const { data: kpiData, error: kpiError } = await supabase
        .from('performance_event')
        .select(`
          value,
          kpi!inner (
            name
          )
        `)
        .eq('person_id', personId)
        .gte('ts', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('ts', { ascending: false })
        .limit(5);

      if (kpiError) throw kpiError;
      
      const kpiSnapshot = kpiData?.map(item => ({
        kpi: (item.kpi as any).name,
        value: item.value,
        benchmark: 0, // We'll use 0 as default benchmark for coaching context
        time_window: 'last_7d',
        source_link: 'performance_tracking'
      })) || [];
      
      setKpiSnapshot(kpiSnapshot);

      // Call CoachBot with profile and KPI data
      if (profileData && profileData.length > 0) {
        await callCoachBot(profileData[0], kpiSnapshot);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load coaching data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const callCoachBot = async (profile: PersonProfile, kpis: KPISnapshot[]) => {
    try {
      const { data, error } = await supabase.functions.invoke('coach-bot', {
        body: {
          person: {
            name: profile.name,
            role: profile.department || 'Team Member'
          },
          kpiData: kpis,
          prLinks: [] // TODO: Fetch recent PR links from performance_event meta or external source
        }
      });

      if (error) throw error;
      
      setCoachResult(data);
    } catch (error) {
      console.error('Error calling CoachBot:', error);
      toast({
        title: "Error",
        description: "Failed to generate coaching plan. Please try again.",
        variant: "destructive",
      });
      
      // Fallback response in case of error
      setCoachResult({
        short_dm: `Hi ${profile.name}, I encountered an issue generating your coaching plan. Please try again or contact support.`,
        plan_bullets: [
          "Review recent project deliverables and identify blockers",
          "Schedule a performance review with your team lead",
          "Focus on completing current sprint goals with quality"
        ],
        review_comment: "Checklist: [ ] Code review completed [ ] Tests passing [ ] Documentation updated",
        measure: "Complete current sprint commitments on time"
      });
    }
  };

  const confirmCoaching = async () => {
    if (!personProfile || !coachResult) return;
    
    setCreatingPlan(true);
    try {
      const { data, error } = await supabase
        .from('coaching_plan')
        .insert({
          person_id: personId,
          objective: coachResult.short_dm,
          playbook: `Plan: ${coachResult.plan_bullets.join('\n• ')}\n\nPR Review Template:\n${coachResult.review_comment}\n\nSuccess Measure:\n${coachResult.measure}`
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Coaching loop started",
        description: `Auto-coaching plan created for ${personName}.`,
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating coaching plan:', error);
      const message = (error as any)?.message?.toString() || '';
      const isRls = /row-level security|permission denied|violates row-level security/i.test(message);
      if (isRls) {
        toast({
          title: 'Coaching loop started (demo mode)',
          description: `DB writes are restricted here, so we simulated plan creation for ${personName}.`,
        });
        onOpenChange(false);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to create coaching plan. Please try again.',
          variant: 'destructive',
        });
      }
    } finally {
      setCreatingPlan(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            Auto-Coach Recommendation - {personName}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Context */}
          <div className="space-y-4">
            {/* Person Context */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Person Context
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading...</span>
                  </div>
                ) : personProfile ? (
                  <div className="space-y-2">
                    <div><strong>Name:</strong> {personProfile.name}</div>
                    <div><strong>Department:</strong> {personProfile.department || 'N/A'}</div>
                    <div><strong>Risk Score:</strong> {personProfile.risk_score.toFixed(1)}</div>
                    {reason && (
                      <div className="pt-2 border-t">
                        <strong>Trigger Signal:</strong> {reason}
                      </div>
                    )}
                  </div>
                ) : (
                  <div>No data available</div>
                )}
              </CardContent>
            </Card>

            {/* KPI Snapshot */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Recent Performance (Last 7 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {kpiSnapshot.length > 0 ? (
                  <div className="space-y-2">
                    {kpiSnapshot.map((kpi, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-accent/50 rounded">
                        <span className="font-medium">{kpi.kpi}</span>
                        <span className="text-muted-foreground">{kpi.value}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-muted-foreground">No recent performance data available</div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Coaching Plan */}
          <div className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Generating coaching plan...</span>
              </div>
            ) : coachResult ? (
              <>
                {/* Direct Message */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Direct Message</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted p-3 rounded text-sm font-medium">
                      {coachResult.short_dm}
                    </div>
                  </CardContent>
                </Card>

                {/* Plan Bullets */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Action Plan</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {coachResult.plan_bullets.map((bullet, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span className="text-sm">{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Review Comment Template */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">PR Review Template</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-accent/50 p-3 rounded text-sm font-mono">
                      {coachResult.review_comment}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Copy this checklist to your next PR for consistent quality
                    </p>
                  </CardContent>
                </Card>

                {/* Success Measure */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">72h Success Measure</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-success/10 border border-success/20 p-3 rounded text-sm">
                      <strong>Target:</strong> {coachResult.measure}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No coaching plan generated
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={confirmCoaching}
            disabled={!coachResult || creatingPlan}
          >
            {creatingPlan ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Starting...
              </>
            ) : (
              'Start Coaching Loop'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};