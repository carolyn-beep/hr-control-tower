import ManagerlessHeader from "@/components/ManagerlessHeader";
import ManagerlessSidebar from "@/components/ManagerlessSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EvidenceModal } from "@/components/EvidenceModal";
import { useReleaseOpen } from "@/hooks/useReleaseOpen";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { 
  GitBranch, 
  Play, 
  Pause, 
  Settings, 
  Bot,
  Clock,
  CheckCircle,
  AlertTriangle,
  Users,
  TrendingUp,
  Eye,
  Zap
} from "lucide-react";

const workflows = [
  {
    id: 1,
    name: "Performance Decline Response",
    description: "Automated coaching sequence for productivity drops",
    status: "Active",
    triggers: 47,
    success_rate: 78,
    steps: [
      { name: "Signal Detection", status: "completed", duration: "< 1min" },
      { name: "Initial Assessment", status: "completed", duration: "5min" },
      { name: "Auto-Coach Generation", status: "active", duration: "15min" },
      { name: "Peer Feedback Request", status: "pending", duration: "2h" },
      { name: "Manager Notification", status: "pending", duration: "24h" }
    ],
    metrics: {
      avg_resolution_time: "2.3 days",
      coaching_effectiveness: 85,
      escalation_rate: 22
    }
  },
  {
    id: 2,
    name: "Burnout Prevention Protocol",
    description: "Early intervention for burnout indicators",
    status: "Active", 
    triggers: 23,
    success_rate: 92,
    steps: [
      { name: "Stress Signal Detection", status: "completed", duration: "< 1min" },
      { name: "Workload Analysis", status: "completed", duration: "10min" },
      { name: "Wellness Check-in", status: "completed", duration: "30min" },
      { name: "Workload Redistribution", status: "active", duration: "2h" },
      { name: "Follow-up Schedule", status: "pending", duration: "1 week" }
    ],
    metrics: {
      avg_resolution_time: "1.8 days",
      coaching_effectiveness: 92,
      escalation_rate: 8
    }
  },
  {
    id: 3,
    name: "Engagement Recovery",
    description: "Re-engagement workflow for disengaged employees",
    status: "Paused",
    triggers: 12,
    success_rate: 65,
    steps: [
      { name: "Engagement Assessment", status: "completed", duration: "< 1min" },
      { name: "Interest Profiling", status: "completed", duration: "20min" },
      { name: "Project Matching", status: "paused", duration: "1h" },
      { name: "Mentor Assignment", status: "pending", duration: "4h" },
      { name: "Progress Tracking", status: "pending", duration: "2 weeks" }
    ],
    metrics: {
      avg_resolution_time: "5.2 days", 
      coaching_effectiveness: 65,
      escalation_rate: 35
    }
  },
  {
    id: 4,
    name: "Critical Performance Escalation",
    description: "Rapid response for severe performance issues",
    status: "Active",
    triggers: 8,
    success_rate: 45,
    steps: [
      { name: "Critical Alert", status: "completed", duration: "< 1min" },
      { name: "Immediate Assessment", status: "completed", duration: "15min" },
      { name: "Emergency Coaching", status: "completed", duration: "30min" },
      { name: "Manager Escalation", status: "active", duration: "1h" },
      { name: "Performance Plan", status: "pending", duration: "24h" },
      { name: "Legal Review", status: "pending", duration: "48h" }
    ],
    metrics: {
      avg_resolution_time: "7.8 days",
      coaching_effectiveness: 45,
      escalation_rate: 55
    }
  }
];

const Workflows = () => {
  const { data: releaseCases, isLoading, refetch } = useReleaseOpen();
  const { toast } = useToast();
  const [selectedEvidence, setSelectedEvidence] = useState<any>(null);
  const [selectedPersonName, setSelectedPersonName] = useState<string>("");
  const [evidenceModalOpen, setEvidenceModalOpen] = useState(false);

  const handleViewEvidence = async (releaseId: string, personName: string) => {
    try {
      const { data, error } = await supabase
        .from('release_case')
        .select('evidence')
        .eq('id', releaseId)
        .single();

      if (error) throw error;

      setSelectedEvidence(data.evidence);
      setSelectedPersonName(personName);
      setEvidenceModalOpen(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load evidence",
        variant: "destructive",
      });
    }
  };

  const handleExecute = async (releaseId: string) => {
    try {
      const { error } = await supabase
        .from('release_case')
        .update({ status: 'executed' })
        .eq('id', releaseId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Release case executed successfully",
      });
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to execute release case",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <ManagerlessSidebar />
        
        <div className="flex-1">
          <ManagerlessHeader />
          
          <main className="p-6">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">Automated Workflows</h1>
              <p className="text-muted-foreground">AI-powered coaching and intervention workflows</p>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card className="bg-gradient-card border-border shadow-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Active Workflows</p>
                      <p className="text-2xl font-bold text-success">3</p>
                    </div>
                    <GitBranch className="h-8 w-8 text-success" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-card border-border shadow-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Triggers</p>
                      <p className="text-2xl font-bold text-primary">90</p>
                    </div>
                    <Play className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-card border-border shadow-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Success Rate</p>
                      <p className="text-2xl font-bold text-success">70%</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-success" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-card border-border shadow-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Resolution</p>
                      <p className="text-2xl font-bold text-foreground">3.8d</p>
                    </div>
                    <Clock className="h-8 w-8 text-foreground" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Release Cases */}
            <Card className="mb-8 bg-gradient-card border-border shadow-card">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-foreground">Release Cases</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-4">Loading...</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Opened At</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Risk Score</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {releaseCases?.map((releaseCase) => (
                        <TableRow key={releaseCase.id}>
                          <TableCell className="font-medium">{releaseCase.name}</TableCell>
                          <TableCell>{releaseCase.email}</TableCell>
                          <TableCell>{new Date(releaseCase.opened_at).toLocaleDateString()}</TableCell>
                          <TableCell>{releaseCase.reason}</TableCell>
                          <TableCell>{releaseCase.risk_score}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                releaseCase.status === 'approved' ? 'default' : 
                                releaseCase.status === 'executed' ? 'secondary' : 
                                'outline'
                              }
                              className={
                                releaseCase.status === 'approved' ? 'bg-success text-success-foreground' :
                                releaseCase.status === 'executed' ? 'bg-secondary text-secondary-foreground' :
                                ''
                              }
                            >
                              {releaseCase.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewEvidence(releaseCase.id, releaseCase.name)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Evidence
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={releaseCase.status !== 'approved'}
                                onClick={() => handleExecute(releaseCase.id)}
                                className={releaseCase.status === 'approved' ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''}
                              >
                                <Zap className="h-4 w-4 mr-1" />
                                Execute
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Workflows */}
            <div className="space-y-6">
              {workflows.map((workflow) => (
                <Card key={workflow.id} className="bg-gradient-card border-border shadow-card">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <CardTitle className="text-xl font-semibold text-foreground">
                            {workflow.name}
                          </CardTitle>
                          <Badge 
                            variant={workflow.status === 'Active' ? 'default' : 'secondary'}
                            className={workflow.status === 'Active' ? 'bg-success text-success-foreground' : ''}
                          >
                            {workflow.status}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground">{workflow.description}</p>
                      </div>
                      
                      <div className="flex space-x-2">
                        {workflow.status === 'Active' ? (
                          <Button variant="outline" size="sm">
                            <Pause className="h-4 w-4 mr-1" />
                            Pause
                          </Button>
                        ) : (
                          <Button size="sm" className="bg-gradient-primary">
                            <Play className="h-4 w-4 mr-1" />
                            Start
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4 mr-1" />
                          Configure
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Workflow Steps */}
                      <div className="lg:col-span-2">
                        <h4 className="font-semibold text-foreground mb-4">Workflow Steps</h4>
                        <div className="space-y-3">
                          {workflow.steps.map((step, index) => (
                            <div key={index} className="flex items-center space-x-4 p-3 bg-accent rounded-lg">
                              <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-border">
                                {step.status === 'completed' ? (
                                  <CheckCircle className="h-4 w-4 text-success" />
                                ) : step.status === 'active' ? (
                                  <Bot className="h-4 w-4 text-primary" />
                                ) : step.status === 'paused' ? (
                                  <Pause className="h-4 w-4 text-warning" />
                                ) : (
                                  <Clock className="h-4 w-4 text-muted-foreground" />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium text-foreground">{step.name}</span>
                                  <span className="text-sm text-muted-foreground">{step.duration}</span>
                                </div>
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs mt-1 ${
                                    step.status === 'completed' ? 'border-success text-success' :
                                    step.status === 'active' ? 'border-primary text-primary' :
                                    step.status === 'paused' ? 'border-warning text-warning' :
                                    'border-muted-foreground text-muted-foreground'
                                  }`}
                                >
                                  {step.status}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Metrics */}
                      <div>
                        <h4 className="font-semibold text-foreground mb-4">Performance Metrics</h4>
                        <div className="space-y-4">
                          <div className="p-3 bg-accent rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm text-muted-foreground">Success Rate</span>
                              <span className="text-sm font-semibold">{workflow.success_rate}%</span>
                            </div>
                            <Progress value={workflow.success_rate} className="h-2" />
                          </div>
                          
                          <div className="p-3 bg-accent rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm text-muted-foreground">Coaching Effectiveness</span>
                              <span className="text-sm font-semibold">{workflow.metrics.coaching_effectiveness}%</span>
                            </div>
                            <Progress value={workflow.metrics.coaching_effectiveness} className="h-2" />
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Total Triggers:</span>
                              <span className="text-sm font-semibold">{workflow.triggers}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Avg Resolution:</span>
                              <span className="text-sm font-semibold">{workflow.metrics.avg_resolution_time}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Escalation Rate:</span>
                              <span className="text-sm font-semibold">{workflow.metrics.escalation_rate}%</span>
                            </div>
                          </div>

                          <Button className="w-full mt-4" variant="outline">
                            <AlertTriangle className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Create New Workflow */}
            <Card className="mt-8 bg-gradient-card border-border shadow-card border-dashed">
              <CardContent className="p-8 text-center">
                <GitBranch className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Create New Workflow</h3>
                <p className="text-muted-foreground mb-4">Design custom automation workflows for your team's needs</p>
                <Button className="bg-gradient-primary">
                  <Play className="h-4 w-4 mr-2" />
                  Create Workflow
                </Button>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
      
      <EvidenceModal
        isOpen={evidenceModalOpen}
        onClose={() => setEvidenceModalOpen(false)}
        evidence={selectedEvidence}
        personName={selectedPersonName}
      />
    </div>
  );
};

export default Workflows;