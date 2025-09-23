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
      const payload = {
        name: profile.name,
        role: profile.department || 'Team Member',
        kpi_snapshot: kpis,
        signal_context: {
          signal_id: signalId,
          reason: reason
        },
        coaching_directive: "Generate a supportive coaching plan to address performance gaps and enhance engagement."
      };

      // Mock CoachBot response for now - in real implementation, you'd call your AI endpoint
      const mockCoachResult: CoachBotResult = {
        short_dm: `Hi ${profile.name}, I've noticed some areas where we can help you succeed even more. Let's work together on a focused improvement plan that builds on your strengths.`,
        plan_bullets: [
          "Weekly 1:1 check-ins to discuss progress and challenges",
          "Skill development in key performance areas identified",
          "Peer mentorship pairing for collaborative learning",
          "Clear milestone tracking with regular feedback loops",
          "Resource access for professional development tools"
        ]
      };

      setCoachResult(mockCoachResult);
    } catch (error) {
      console.error('Error calling CoachBot:', error);
      toast({
        title: "Error",
        description: "Failed to generate coaching plan. Please try again.",
        variant: "destructive",
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
          playbook: coachResult.plan_bullets.join('\n• ')
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
      toast({
        title: "Error",
        description: "Failed to create coaching plan. Please try again.",
        variant: "destructive",
      });
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
                    <CardTitle className="text-lg">Initial Message</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted p-3 rounded text-sm">
                      {coachResult.short_dm}
                    </div>
                  </CardContent>
                </Card>

                {/* Plan Bullets */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Coaching Plan</CardTitle>
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