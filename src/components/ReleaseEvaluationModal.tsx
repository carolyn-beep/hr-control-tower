import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Copy, Check } from "lucide-react";
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

interface Evidence {
  kpi: string;
  value: number;
  benchmark: number;
  time_window: string;
  source_link: string;
}

interface CoachingHistory {
  id: string;
  objective: string;
  playbook: string;
  status: string;
  created_at: string;
}

interface SafeguardResult {
  tenure_ok: boolean;
  data_ok: boolean;
  coach_ok: boolean;
  messages: string[];
}

interface AIResult {
  decision: string;
  rationale: string[];
  communication: string;
  checklist: string[];
}

interface ReleaseEvaluationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  personId: string;
  personName: string;
  signalId?: string;
  reason?: string;
}

export const ReleaseEvaluationModal = ({ open, onOpenChange, personId, personName, signalId, reason }: ReleaseEvaluationModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [personProfile, setPersonProfile] = useState<PersonProfile | null>(null);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [coachingHistory, setCoachingHistory] = useState<CoachingHistory[]>([]);
  const [safeguards, setSafeguards] = useState<SafeguardResult | null>(null);
  const [aiResult, setAiResult] = useState<AIResult | null>(null);
  const [emailCopied, setEmailCopied] = useState(false);
  const [checkedItems, setCheckedItems] = useState<boolean[]>([]);
  const [creatingCase, setCreatingCase] = useState(false);

  useEffect(() => {
    if (open && personId) {
      fetchData();
    }
  }, [open, personId]);

  const fetchData = async () => {
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

      // Fetch evidence
      const { data: evidenceData, error: evidenceError } = await supabase.rpc('get_evidence', {
        target_person_id: personId
      });
      if (evidenceError) throw evidenceError;
      setEvidence(evidenceData || []);

      // Fetch coaching history
      const { data: coachingData, error: coachingError } = await supabase.rpc('get_coaching_history', {
        target_person_id: personId
      });
      if (coachingError) throw coachingError;
      setCoachingHistory(coachingData || []);

      // Fetch safeguards
      const { data: safeguardData, error: safeguardError } = await supabase.rpc('release_safeguards', {
        target_person_id: personId
      });
      if (safeguardError) throw safeguardError;
      if (safeguardData && safeguardData.length > 0) {
        setSafeguards(safeguardData[0]);
      }

      // Call AI for evaluation
      if (profileData && profileData.length > 0) {
        await callReleaseBot(profileData[0], evidenceData || [], coachingData || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load evaluation data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const callReleaseBot = async (profile: PersonProfile, evidenceData: Evidence[], coachingData: CoachingHistory[]) => {
    try {
      const payload = {
        person_profile: profile,
        evidence_table: evidenceData,
        coaching_history: coachingData,
        risk_score: profile.risk_score,
        signal_context: {
          signal_id: signalId,
          reason: reason
        },
        policy_excerpt: "Decisions require objective evidence and at least 1 completed coaching loop unless severe breach."
      };

      // Mock AI response for now - in real implementation, you'd call your AI endpoint
      const mockAiResult: AIResult = {
        decision: evidenceData.length > 0 ? "extend_coaching" : "retain",
        rationale: [
          "Performance metrics show improvement trend",
          "Coaching engagement is positive",
          "Risk factors are manageable with continued support"
        ],
        communication: `Hi ${profile.name},\n\nFollowing our performance review, we've decided to continue with the current coaching plan. Your recent progress shows positive momentum, and we believe continued support will help you reach your full potential.\n\nBest regards,\nHR Team`,
        checklist: [
          "Manager notified of decision",
          "Coaching plan updated",
          "Follow-up scheduled in 30 days",
          "Performance metrics tracking enabled"
        ]
      };

      setAiResult(mockAiResult);
      setCheckedItems(new Array(mockAiResult.checklist.length).fill(false));
    } catch (error) {
      console.error('Error calling AI:', error);
    }
  };

  const getDecisionBadgeVariant = (decision: string) => {
    switch (decision) {
      case 'release': return 'destructive';
      case 'extend_coaching': return 'default';
      case 'retain': return 'secondary';
      default: return 'outline';
    }
  };

  const copyEmail = async () => {
    if (aiResult?.communication) {
      await navigator.clipboard.writeText(aiResult.communication);
      setEmailCopied(true);
      setTimeout(() => setEmailCopied(false), 2000);
      toast({
        title: "Copied!",
        description: "Email draft copied to clipboard.",
      });
    }
  };

  const handleCheckboxChange = (index: number, checked: boolean) => {
    const newCheckedItems = [...checkedItems];
    newCheckedItems[index] = checked;
    setCheckedItems(newCheckedItems);
  };

  const canCreateReleaseCase = () => {
    if (!safeguards || !aiResult) return false;
    
    // Check if safeguards allow creation
    if (!safeguards.tenure_ok || !safeguards.data_ok) return false;
    
    // If decision is release and coaching not complete, show warning but allow
    return true;
  };

  const getValidationMessages = () => {
    if (!safeguards) return [];
    return safeguards.messages.filter(msg => msg !== null);
  };

  const createReleaseCase = async () => {
    if (!personProfile || !aiResult) return;
    
    setCreatingCase(true);
    try {
      const evidenceData = JSON.parse(JSON.stringify({
        person_profile: personProfile,
        evidence_table: evidence,
        coaching_history: coachingHistory,
        ai_decision: aiResult
      }));

      const { data, error } = await supabase.rpc('insert_release_case', {
        person_id: personId,
        reason: aiResult.rationale.join('; '),
        evidence_json: evidenceData,
        risk_score: personProfile.risk_score,
        decision: aiResult.decision
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Release case created successfully.",
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating release case:', error);
      toast({
        title: "Error",
        description: "Failed to create release case. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCreatingCase(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Release Evaluation - {personName}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Inputs */}
          <div className="space-y-4">
            {/* Person Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Person Information</CardTitle>
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
                    <div><strong>Email:</strong> {personProfile.email}</div>
                    <div><strong>Department:</strong> {personProfile.department || 'N/A'}</div>
                    <div><strong>Risk Score:</strong> {personProfile.risk_score.toFixed(1)}</div>
                    <div><strong>Tenure:</strong> {format(new Date(personProfile.created_at), 'MMM dd, yyyy')}</div>
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

            {/* Evidence Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Performance Evidence (Last 14 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                {evidence.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>KPI</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>Benchmark</TableHead>
                        <TableHead>Source</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {evidence.slice(0, 5).map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.kpi}</TableCell>
                          <TableCell>{item.value}</TableCell>
                          <TableCell>{item.benchmark.toFixed(2)}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{item.source_link}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-muted-foreground">No performance data available</div>
                )}
              </CardContent>
            </Card>

            {/* Coaching History */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Coaching History (Last 2 Plans)</CardTitle>
              </CardHeader>
              <CardContent>
                {coachingHistory.length > 0 ? (
                  <div className="space-y-3">
                    {coachingHistory.map((plan) => (
                      <div key={plan.id} className="border rounded p-3">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline">{plan.status}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(plan.created_at), 'MMM dd, yyyy')}
                          </span>
                        </div>
                        <div><strong>Objective:</strong> {plan.objective}</div>
                        <div><strong>Playbook:</strong> {plan.playbook}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-muted-foreground">No coaching history available</div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - AI Results */}
          <div className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Evaluating...</span>
              </div>
            ) : aiResult ? (
              <>
                {/* Decision */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">AI Recommendation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge variant={getDecisionBadgeVariant(aiResult.decision)} className="text-lg px-4 py-2">
                      {aiResult.decision.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </CardContent>
                </Card>

                {/* Rationale */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Rationale</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {aiResult.rationale.map((point, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Email Draft */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      Email Draft
                      <Button variant="outline" size="sm" onClick={copyEmail}>
                        {emailCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted p-3 rounded text-sm whitespace-pre-wrap">
                      {aiResult.communication}
                    </div>
                  </CardContent>
                </Card>

                {/* Checklist */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Action Checklist</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {aiResult.checklist.map((item, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Checkbox
                            id={`check-${index}`}
                            checked={checkedItems[index]}
                            onCheckedChange={(checked) => handleCheckboxChange(index, checked as boolean)}
                          />
                          <label htmlFor={`check-${index}`} className="text-sm">
                            {item}
                          </label>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No AI evaluation available
              </div>
            )}
          </div>
        </div>

        {/* Validation Messages */}
        {getValidationMessages().length > 0 && (
          <Card className="mt-4">
            <CardContent className="pt-4">
              <div className="space-y-2">
                {getValidationMessages().map((message, index) => (
                  <div key={index} className="text-sm text-warning flex items-center gap-2">
                    <span>⚠️</span>
                    <span>{message}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={createReleaseCase}
            disabled={!canCreateReleaseCase() || creatingCase}
          >
            {creatingCase ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Release Case'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};