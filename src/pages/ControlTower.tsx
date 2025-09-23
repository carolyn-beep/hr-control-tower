import ManagerlessHeader from "@/components/ManagerlessHeader";
import ManagerlessSidebar from "@/components/ManagerlessSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  Bot, 
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  UserCheck,
  Play,
  RefreshCw
} from "lucide-react";
import heroImage from "@/assets/hr-hero.jpg";
import { useDashboardMetrics } from "@/hooks/useDashboardMetrics";
import { useRecentSignalsWithPerson } from "@/hooks/useRecentSignalsWithPerson";
import { useRiskTrend } from "@/hooks/useRiskTrend";
import { useRefreshDemoData } from "@/hooks/useRefreshDemoData";
import { ReleaseEvaluationModal } from "@/components/ReleaseEvaluationModal";
import { AutoCoachModal } from "@/components/AutoCoachModal";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useToast } from "@/hooks/use-toast";

const riskMetrics = [
  {
    title: "Active Signals",
    value: "23",
    change: "+5",
    trend: "up",
    icon: AlertTriangle,
    color: "text-destructive",
    bgColor: "bg-destructive/10"
  },
  {
    title: "Auto-Coaches Active",
    value: "156",
    change: "+12", 
    trend: "up",
    icon: Bot,
    color: "text-primary",
    bgColor: "bg-primary/10"
  },
  {
    title: "Risk Score",
    value: "Medium",
    change: "-2%",
    trend: "down",
    icon: Activity,
    color: "text-warning",
    bgColor: "bg-warning/10"
  },
  {
    title: "Automated Actions",
    value: "47",
    change: "+18%",
    trend: "up", 
    icon: CheckCircle,
    color: "text-success",
    bgColor: "bg-success/10"
  },
];

const recentSignals = [
  { 
    employee: "Sarah Chen", 
    signal: "Productivity Drop", 
    severity: "High", 
    status: "Auto-Coaching", 
    time: "2h ago",
    action: "coaching" 
  },
  { 
    employee: "Mike Rodriguez", 
    signal: "Engagement Decline", 
    severity: "Medium", 
    status: "Monitoring", 
    time: "4h ago",
    action: "monitoring" 
  },
  { 
    employee: "Lisa Park", 
    signal: "Performance Issue", 
    severity: "Critical", 
    status: "Manager Alert", 
    time: "6h ago",
    action: "alert" 
  },
  { 
    employee: "David Kim", 
    signal: "Collaboration Drop", 
    severity: "Low", 
    status: "Resolved", 
    time: "1d ago",
    action: "resolved" 
  },
];

const ControlTower = () => {
  const { data: metrics, isLoading, error } = useDashboardMetrics();
  const { data: recentSignals, isLoading: signalsLoading } = useRecentSignalsWithPerson();
  const { data: riskTrend, isLoading: riskTrendLoading } = useRiskTrend();
  const navigate = useNavigate();
  const { toast } = useToast();
  const refreshDemoData = useRefreshDemoData();
  const [selectedPersonId, setSelectedPersonId] = useState<string>('');
  const [selectedPersonName, setSelectedPersonName] = useState<string>('');
  const [selectedSignalId, setSelectedSignalId] = useState<string>('');
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [modalOpen, setModalOpen] = useState(false);
  const [autoCoachModalOpen, setAutoCoachModalOpen] = useState(false);

  // Create dynamic risk metrics based on real data
  const riskMetrics = [
    {
      title: "Critical Signals",
      value: isLoading ? "..." : (metrics?.criticalSignals.toString() || "0"),
      change: "+2",
      trend: "up",
      icon: AlertTriangle,
      color: "text-destructive",
      bgColor: "bg-destructive/10"
    },
    {
      title: "Risk Signals",
      value: isLoading ? "..." : (metrics?.riskSignals.toString() || "0"),
      change: "+1", 
      trend: "up",
      icon: Activity,
      color: "text-warning",
      bgColor: "bg-warning/10"
    },
    {
      title: "Active Coaching",
      value: isLoading ? "..." : (metrics?.activeCoachingPlans.toString() || "0"),
      change: "+3",
      trend: "up",
      icon: Bot,
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      title: "Avg Risk Score",
      value: isLoading ? "..." : (metrics?.avgRiskScore.toString() || "0.0"),
      change: "-0.2",
      trend: "down", 
      icon: CheckCircle,
      color: "text-success",
      bgColor: "bg-success/10"
    },
  ];

  if (error) {
    console.error('Dashboard metrics error:', error);
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <ManagerlessSidebar />
        
        <div className="flex-1">
          <ManagerlessHeader />
          
          <main className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-xl shadow-dashboard animate-fade-in">
              <div 
                className="h-56 bg-gradient-hero rounded-xl flex items-center justify-between px-8 relative"
                style={{ 
                  backgroundImage: `linear-gradient(135deg, hsla(241, 79%, 52%, 0.95), hsla(260, 85%, 60%, 0.95)), url(${heroImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                {/* Animated background elements */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent animate-pulse"></div>
                <div className="absolute top-4 right-4 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-glow"></div>
                <div className="absolute bottom-4 left-4 w-24 h-24 bg-primary-glow/20 rounded-full blur-2xl animate-pulse"></div>
                
                <div className="text-primary-foreground relative z-10 animate-slide-up">
                  <h1 className="text-4xl font-bold mb-3">Managerless HR Control Tower</h1>
                  <p className="text-lg opacity-90 mb-4">AI-powered risk detection and automated coaching without traditional management</p>
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
                      <span>All Systems Operational</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Bot className="h-4 w-4" />
                      <span>AI Active</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-3 relative z-10 animate-bounce-in">
                  <Button 
                    variant="glass" 
                    className="bg-white/20 text-white border-white/30 hover:bg-white/30 hover:scale-105 transition-all duration-300"
                    onClick={() => navigate('/signals')}
                  >
                    <Activity className="mr-2 h-4 w-4" />
                    View Signals
                  </Button>
                  <Button 
                    variant="glass" 
                    className="bg-white/20 text-white border-white/30 hover:bg-white/30 hover:scale-105 transition-all duration-300"
                    onClick={() => {
                      toast({
                        title: "AI Insights",
                        description: "Advanced risk analytics: Pattern detection active across 5 performance vectors. Current risk trend shows 12% improvement over last month.",
                      });
                    }}
                  >
                    <Bot className="mr-2 h-4 w-4" />
                    AI Insights
                  </Button>
                </div>
              </div>
            </div>

            {/* Risk Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {riskMetrics.map((metric, index) => (
                <Card 
                  key={index} 
                  className={`relative bg-gradient-card border-border shadow-card hover:shadow-dashboard transition-all duration-500 group hover-lift animate-slide-up cursor-pointer`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {metric.title}
                    </CardTitle>
                    <div className={`p-3 rounded-xl ${metric.bgColor} group-hover:scale-110 transition-all duration-300 shadow-soft`}>
                      <metric.icon className={`h-5 w-5 ${metric.color}`} />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-3xl font-bold text-foreground mb-2 group-hover:scale-105 transition-transform duration-300">
                      {metric.value}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {metric.trend === "up" ? (
                          <TrendingUp className="h-4 w-4 text-success mr-2 animate-bounce" />
                        ) : (
                          <TrendingUp className="h-4 w-4 text-success mr-2 rotate-180 animate-bounce" />
                        )}
                        <span 
                          className={`text-sm font-medium ${
                            metric.trend === "up" ? "text-success" : "text-success"
                          }`}
                        >
                          {metric.change}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground bg-accent px-2 py-1 rounded-full">today</span>
                    </div>
                  </CardContent>
                  
                  {/* Animated border glow on hover */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-primary opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none" />
                  
                  {/* Interactive shine effect */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
                </Card>
              ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Quick Actions */}
              <Card className="bg-gradient-card border-border shadow-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-foreground flex items-center">
                    <Activity className="mr-2 h-4 w-4 text-primary" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button className="w-full justify-start bg-gradient-primary text-primary-foreground hover:opacity-90 group h-10">
                    <AlertTriangle className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                    <span className="font-medium">Review High Signals</span>
                  </Button>
                  <Button variant="outline" className="w-full justify-start hover:bg-primary/5 group h-10">
                    <Bot className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                    <span className="font-medium">Launch Auto-Coach</span>
                  </Button>
                  <Button variant="outline" className="w-full justify-start hover:bg-primary/5 group h-10">
                    <Activity className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                    <span className="font-medium">Analyze Trends</span>
                  </Button>
                  <Button variant="outline" className="w-full justify-start hover:bg-primary/5 group h-10">
                    <TrendingUp className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                    <span className="font-medium">Generate Report</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start hover:bg-primary/5 group h-10"
                    onClick={() => refreshDemoData.mutate()}
                    disabled={refreshDemoData.isPending}
                  >
                    <RefreshCw className={`mr-2 h-4 w-4 group-hover:scale-110 transition-transform ${
                      refreshDemoData.isPending ? 'animate-spin' : ''
                    }`} />
                    <span className="font-medium">
                      {refreshDemoData.isPending ? 'Refreshing...' : 'Refresh Demo Data'}
                    </span>
                  </Button>
                </CardContent>
              </Card>

              {/* AI Automation Status */}
              <Card className="lg:col-span-2 bg-gradient-card border-border shadow-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-foreground flex items-center">
                    <Bot className="mr-2 h-4 w-4 text-primary" />
                    AI Automation Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { system: "Risk Detection Engine", status: "Active", processes: "247 signals processed", type: "success", icon: AlertTriangle },
                      { system: "Auto-Coach Generator", status: "Active", processes: "56 coaching sessions", type: "success", icon: Bot },
                      { system: "Performance Analyzer", status: "Training", processes: "Learning new patterns", type: "warning", icon: Activity },
                      { system: "Workflow Automation", status: "Active", processes: "23 workflows triggered", type: "success", icon: CheckCircle }
                    ].map((automation, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-accent/50 rounded-lg hover:bg-accent transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${
                            automation.type === 'success' ? 'bg-success/10' : 
                            automation.type === 'warning' ? 'bg-warning/10' : 'bg-primary/10'
                          }`}>
                            <automation.icon className={`h-4 w-4 ${
                              automation.type === 'success' ? 'text-success' : 
                              automation.type === 'warning' ? 'text-warning' : 'text-primary'
                            }`} />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{automation.system}</p>
                            <p className="text-sm text-muted-foreground">{automation.processes}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${
                            automation.type === 'success' ? 'bg-success animate-pulse' : 
                            automation.type === 'warning' ? 'bg-warning animate-pulse' : 'bg-primary animate-pulse'
                          }`}></div>
                          <Badge 
                            variant={automation.status === 'Active' ? 'default' : 'secondary'}
                            className={`text-xs ${
                              automation.type === 'success' ? 'bg-success/10 text-success border-success/20' :
                              automation.type === 'warning' ? 'bg-warning/10 text-warning border-warning/20' : ''
                            }`}
                          >
                            {automation.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Risk Half-Life Chart */}
            <Card className="bg-gradient-card border-border shadow-card">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-foreground flex items-center">
                  <Activity className="mr-2 h-4 w-4 text-primary" />
                  Risk Half-Life (coaching impact)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {riskTrendLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-pulse flex flex-col items-center space-y-2">
                      <div className="w-6 h-6 bg-muted rounded-full"></div>
                      <p className="text-muted-foreground">Loading trend data...</p>
                    </div>
                  </div>
                ) : !riskTrend || riskTrend.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No risk trend data available</p>
                    <p className="text-sm">Data will appear as risk scores are tracked over time</p>
                  </div>
                ) : (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={riskTrend} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis 
                          dataKey="day" 
                          tickFormatter={(value) => new Date(value).toLocaleDateString()}
                          className="text-xs"
                        />
                        <YAxis 
                          domain={['dataMin - 0.5', 'dataMax + 0.5']}
                          className="text-xs"
                        />
                        <Tooltip 
                          labelFormatter={(value) => `Date: ${new Date(value).toLocaleDateString()}`}
                          formatter={(value) => [`${value}`, 'Avg Risk Score']}
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--background))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '6px'
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="avg_risk" 
                          stroke="hsl(var(--primary))" 
                          strokeWidth={2}
                          dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
                          name="Avg Risk Score"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Signals */}
            <Card className="bg-gradient-card border-border shadow-card">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-foreground">Recent Signals</CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="hover:bg-primary/5 shadow-soft hover:shadow-dashboard transition-all duration-200 hover:scale-105"
                    onClick={() => navigate('/signals?level=risk,critical&sort=ts_desc')}
                  >
                    View All Signals
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {signalsLoading ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <div className="animate-pulse flex flex-col items-center space-y-2">
                        <div className="w-6 h-6 bg-muted rounded-full"></div>
                        <p>Loading signals...</p>
                      </div>
                    </div>
                  ) : !recentSignals || recentSignals.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No recent signals</p>
                      <p className="text-sm">All systems are running smoothly</p>
                    </div>
                  ) : (
                    recentSignals.map((signal, index) => {
                      const getBadgeVariant = (level: string) => {
                        switch (level.toLowerCase()) {
                          case 'critical': return 'destructive';
                          case 'risk': return 'default';
                          case 'warn': return 'secondary';
                          case 'info': return 'outline';
                          default: return 'outline';
                        }
                      };

                      const getBadgeColor = (level: string) => {
                        switch (level.toLowerCase()) {
                          case 'critical': return 'text-destructive border-destructive bg-destructive/10';
                          case 'risk': return 'text-warning border-warning bg-warning/10';
                          case 'warn': return 'text-primary border-primary bg-primary/10';
                          case 'info': return 'text-muted-foreground border-muted-foreground bg-muted/10';
                          default: return 'text-muted-foreground border-muted-foreground bg-muted/10';
                        }
                      };

                      const getButtonText = (level: string) => {
                        return ['risk', 'critical'].includes(level.toLowerCase()) 
                          ? 'Evaluate for Release' 
                          : 'Start Auto-Coach';
                      };

                      const getButtonIcon = (level: string) => {
                        return ['risk', 'critical'].includes(level.toLowerCase()) 
                          ? <UserCheck className="h-4 w-4 mr-2" />
                          : <Play className="h-4 w-4 mr-2" />;
                      };

                      return (
                        <div 
                          key={signal.id} 
                          className="flex items-center justify-between p-4 rounded-lg border bg-accent/30 hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex items-center space-x-4 flex-1">
                            <Badge 
                              variant="outline" 
                              className={`font-bold ${getBadgeColor(signal.level)}`}
                            >
                              {signal.level.toUpperCase()}
                            </Badge>
                            <div className="flex-1">
                              <div className="font-semibold text-foreground">{signal.person}</div>
                              <div className="text-sm text-muted-foreground">{signal.reason}</div>
                            </div>
                          </div>
                          
                          <Button 
                            variant={['risk', 'critical'].includes(signal.level.toLowerCase()) ? "gradient" : "outline"}
                            size="sm"
                            className="shadow-soft hover:shadow-dashboard transition-all duration-200 hover:scale-105"
                            onClick={() => {
                              setSelectedPersonId(signal.person_id);
                              setSelectedPersonName(signal.person);
                              setSelectedSignalId(signal.id);
                              setSelectedReason(signal.reason);
                              
                              if (['risk', 'critical'].includes(signal.level.toLowerCase())) {
                                setModalOpen(true);
                              } else {
                                setAutoCoachModalOpen(true);
                              }
                            }}
                          >
                            {getButtonIcon(signal.level)}
                            {getButtonText(signal.level)}
                          </Button>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
      
      <ReleaseEvaluationModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        personId={selectedPersonId}
        personName={selectedPersonName}
        signalId={selectedSignalId}
        reason={selectedReason}
      />
      
      <AutoCoachModal
        open={autoCoachModalOpen}
        onOpenChange={setAutoCoachModalOpen}
        personId={selectedPersonId}
        personName={selectedPersonName}
        signalId={selectedSignalId}
        reason={selectedReason}
      />
    </div>
  );
};

export default ControlTower;