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
  const [insufficientData, setInsufficientData] = useState(false);
  const [usingFallback, setUsingFallback] = useState(false);

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

      // Check for insufficient data first
      if (!evidenceData || evidenceData.length === 0) {
        setInsufficientData(true);
        setAiResult(null);
        return;
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

  const computeRuleBasedDecision = (evidenceData: Evidence[]): AIResult => {
    // Extract KPI values for rule-based logic
    let prsPerWeek = 0;
    let bugReopenRate = 0;
    let leadTime = 0;

    // Find relevant KPIs in evidence data
    evidenceData.forEach(item => {
      if (item.kpi.toLowerCase().includes('pr')) {
        prsPerWeek = item.value * 2; // Convert from 2-week period to weekly
      } else if (item.kpi.toLowerCase().includes('bug')) {
        bugReopenRate = (item.value / item.benchmark) * 100; // Convert to percentage vs benchmark
      } else if (item.kpi.toLowerCase().includes('lead')) {
        leadTime = item.value;
      }
    });

    // Apply rule-based decision logic
    const shouldRelease = prsPerWeek < 2 && (bugReopenRate >= 15 || leadTime >= 60);
    const decision = shouldRelease ? "release" : "extend_coaching";

    // Generate rationale based on failing KPIs
    const rationale: string[] = [];
    
    evidenceData.forEach(item => {
      const performanceRatio = item.value / item.benchmark;
      if (performanceRatio < 0.8) { // Significantly below benchmark
        rationale.push(`${item.kpi}: ${item.value} (${(performanceRatio * 100).toFixed(0)}% of benchmark ${item.benchmark.toFixed(1)})`);
      }
    });

    if (rationale.length === 0) {
      rationale.push("Performance metrics are within acceptable ranges");
    }

    if (shouldRelease) {
      rationale.push("Multiple performance indicators suggest coaching effectiveness is limited");
    } else {
      rationale.push("Performance issues are addressable through continued coaching support");
    }

    return {
      decision,
      rationale,
      communication: `Hi ${personName},\n\nBased on our performance review, we've decided to ${decision === 'release' ? 'proceed with release from the program' : 'continue with the current coaching plan'}. ${decision === 'release' ? 'We believe this transition will best support your career development.' : 'Your recent data shows areas where continued support will help you reach your full potential.'}\n\nBest regards,\nHR Team`,
      checklist: [
        "Manager notified of decision",
        decision === 'release' ? "Release documentation prepared" : "Coaching plan updated",
        decision === 'release' ? "Transition plan created" : "Follow-up scheduled in 30 days",
        "Performance metrics tracking enabled"
      ]
    };
  };

  const callReleaseBot = async (profile: PersonProfile, evidenceData: Evidence[], coachingData: CoachingHistory[]) => {
    try {
      // First compute rule-based fallback
      const fallbackResult = computeRuleBasedDecision(evidenceData);

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

        console.log('Calling AI release-bot function...');
        
        // Call the actual AI edge function
        const { data: aiResponse, error: functionError } = await supabase.functions.invoke('release-bot', {
          body: payload
        });

        if (functionError) {
          throw new Error(`Function error: ${functionError.message}`);
        }

        if (aiResponse.error) {
          throw new Error(`AI error: ${aiResponse.error}`);
        }

        // Validate AI response structure
        if (!aiResponse.decision || !Array.isArray(aiResponse.rationale) || !aiResponse.communication || !Array.isArray(aiResponse.checklist)) {
          throw new Error('Invalid AI response structure');
        }

        setAiResult(aiResponse);
        setUsingFallback(false);
        setCheckedItems(new Array(aiResponse.checklist.length).fill(false));
        
        console.log('AI evaluation completed successfully');
      } catch (aiError) {
        console.error('AI call failed, using rule-based fallback:', aiError);
        // Use rule-based fallback if AI fails
        setAiResult(fallbackResult);
        setUsingFallback(true);
        setCheckedItems(new Array(fallbackResult.checklist.length).fill(false));
      }
    } catch (error) {
      console.error('Error in evaluation logic:', error);
      // Final fallback to prevent crashes
      const emergencyFallback = computeRuleBasedDecision(evidenceData);
      setAiResult(emergencyFallback);
      setUsingFallback(true);
      setCheckedItems(new Array(emergencyFallback.checklist.length).fill(false));
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
      const { data, error } = await supabase.rpc('insert_release_case', {
        person_id: personId,
        reason: reason || 'Sustained PR shortfall',
        evidence_json: JSON.parse(JSON.stringify(evidence)),
        risk_score: personProfile.risk_score,
        decision: aiResult.decision
      });

      if (error) throw error;

      toast({
        title: "Release case created",
        description: "The release case has been successfully created.",
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
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto" aria-describedby="release-evaluation-description">
        <DialogHeader>
          <DialogTitle>Release Evaluation - {personName}</DialogTitle>
          <div id="release-evaluation-description" className="sr-only">
            AI-powered evaluation for release decision based on performance evidence and coaching history
          </div>
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
            ) : insufficientData ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Evaluation Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 space-y-4">
                    <div className="text-warning text-lg font-semibold">⚠️ Insufficient Data</div>
                    <p className="text-muted-foreground">
                      No performance evidence available for evaluation. Please ensure the person has recent activity data before proceeding.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : aiResult ? (
              <>
                {/* Decision */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {usingFallback ? "Rule-Based Recommendation" : "AI Recommendation"}
                      {usingFallback && (
                        <Badge variant="outline" className="text-xs">
                          AI unavailable, using rules
                        </Badge>
                      )}
                    </CardTitle>
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
            disabled={!canCreateReleaseCase() || creatingCase || insufficientData}
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