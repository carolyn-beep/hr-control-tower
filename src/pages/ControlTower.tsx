import ManagerlessHeader from "@/components/ManagerlessHeader";
import ManagerlessSidebar from "@/components/ManagerlessSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  Bot, 
  Activity,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react";
import heroImage from "@/assets/hr-hero.jpg";
import { useDashboardMetrics } from "@/hooks/useDashboardMetrics";
import { useRecentSignals } from "@/hooks/useRecentSignals";

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
  const { data: recentSignals, isLoading: signalsLoading } = useRecentSignals();

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
          
          <main className="p-6">
            {/* Hero Section */}
            <div className="mb-8 relative overflow-hidden rounded-lg">
              <div 
                className="h-48 bg-gradient-hero rounded-lg flex items-center justify-between px-8"
                style={{ 
                  backgroundImage: `linear-gradient(135deg, hsla(241, 79%, 52%, 0.9), hsla(260, 85%, 60%, 0.9)), url(${heroImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                <div className="text-primary-foreground">
                  <h2 className="text-3xl font-bold mb-2">Managerless HR Control Tower</h2>
                  <p className="text-lg opacity-90">AI-powered risk detection and automated coaching without traditional management</p>
                </div>
                <div className="flex space-x-3">
                  <Button variant="secondary" className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                    <Activity className="mr-2 h-4 w-4" />
                    View Signals
                  </Button>
                  <Button variant="secondary" className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                    <Bot className="mr-2 h-4 w-4" />
                    AI Insights
                  </Button>
                </div>
              </div>
            </div>

            {/* Risk Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {riskMetrics.map((metric, index) => (
                <Card key={index} className="relative bg-gradient-card border-border shadow-card hover:shadow-dashboard transition-all duration-300 group">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {metric.title}
                    </CardTitle>
                    <div className={`p-2.5 rounded-lg ${metric.bgColor} group-hover:scale-110 transition-transform duration-200`}>
                      <metric.icon className={`h-5 w-5 ${metric.color}`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-foreground mb-2">{metric.value}</div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {metric.trend === "up" ? (
                          <TrendingUp className="h-4 w-4 text-success mr-1" />
                        ) : (
                          <TrendingUp className="h-4 w-4 text-success mr-1 rotate-180" />
                        )}
                        <span 
                          className={`text-sm font-medium ${
                            metric.trend === "up" ? "text-success" : "text-success"
                          }`}
                        >
                          {metric.change}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">today</span>
                    </div>
                  </CardContent>
                  {/* Subtle hover gradient */}
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </Card>
              ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Quick Actions */}
              <Card className="bg-gradient-card border-border shadow-card">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-foreground flex items-center">
                    <Activity className="mr-2 h-5 w-5 text-primary" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start bg-gradient-primary text-primary-foreground hover:opacity-90 group">
                    <AlertTriangle className="mr-3 h-4 w-4 group-hover:scale-110 transition-transform" />
                    <span className="font-medium">Review High Signals</span>
                  </Button>
                  <Button variant="outline" className="w-full justify-start hover:bg-primary/5 group">
                    <Bot className="mr-3 h-4 w-4 group-hover:scale-110 transition-transform" />
                    <span className="font-medium">Launch Auto-Coach</span>
                  </Button>
                  <Button variant="outline" className="w-full justify-start hover:bg-primary/5 group">
                    <Activity className="mr-3 h-4 w-4 group-hover:scale-110 transition-transform" />
                    <span className="font-medium">Analyze Trends</span>
                  </Button>
                  <Button variant="outline" className="w-full justify-start hover:bg-primary/5 group">
                    <TrendingUp className="mr-3 h-4 w-4 group-hover:scale-110 transition-transform" />
                    <span className="font-medium">Generate Report</span>
                  </Button>
                </CardContent>
              </Card>

              {/* AI Automation Status */}
              <Card className="lg:col-span-2 bg-gradient-card border-border shadow-card">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-foreground flex items-center">
                    <Bot className="mr-2 h-5 w-5 text-primary" />
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
                      <div key={index} className="flex items-center justify-between p-4 bg-accent/50 rounded-lg hover:bg-accent transition-colors group">
                        <div className="flex items-center space-x-4">
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
                            className={`${
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

            {/* Recent Signals */}
            <Card className="bg-gradient-card border-border shadow-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-semibold text-foreground">Recent Signals</CardTitle>
                  <Button variant="outline">View All Signals</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {signalsLoading ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <div className="animate-pulse">Loading signals...</div>
                    </div>
                  ) : !recentSignals || recentSignals.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No recent signals</p>
                    </div>
                  ) : (
                    recentSignals.map((signal, index) => {
                      // Calculate time ago
                      const timeAgo = new Date(signal.ts);
                      const now = new Date();
                      const diffHours = Math.floor((now.getTime() - timeAgo.getTime()) / (1000 * 60 * 60));
                      const timeString = diffHours < 1 ? "< 1h ago" : 
                                       diffHours < 24 ? `${diffHours}h ago` : 
                                       `${Math.floor(diffHours / 24)}d ago`;

                      // Determine status based on level
                      const getStatus = (level: string) => {
                        switch(level) {
                          case 'critical': return 'Manager Alert';
                          case 'risk': return 'Auto-Coaching';
                          case 'warning': return 'Monitoring';
                          default: return 'Monitoring';
                        }
                      };

                      const getSeverityConfig = (level: string) => {
                        switch(level) {
                          case 'critical': return {
                            color: 'bg-destructive',
                            textColor: 'text-destructive',
                            badgeVariant: 'destructive' as const,
                            priority: 'CRITICAL'
                          };
                          case 'risk': return {
                            color: 'bg-warning',
                            textColor: 'text-warning',
                            badgeVariant: 'secondary' as const,
                            priority: 'HIGH'
                          };
                          case 'warning': return {
                            color: 'bg-primary',
                            textColor: 'text-primary',
                            badgeVariant: 'outline' as const,
                            priority: 'MEDIUM'
                          };
                          default: return {
                            color: 'bg-muted-foreground',
                            textColor: 'text-muted-foreground',
                            badgeVariant: 'outline' as const,
                            priority: 'LOW'
                          };
                        }
                      };

                      const getStatusConfig = (level: string) => {
                        switch(level) {
                          case 'critical': return {
                            variant: 'destructive' as const,
                            icon: <XCircle className="h-4 w-4" />,
                            actionable: true
                          };
                          case 'risk': return {
                            variant: 'default' as const,
                            icon: <Clock className="h-4 w-4" />,
                            actionable: true
                          };
                          default: return {
                            variant: 'secondary' as const,
                            icon: <Clock className="h-4 w-4" />,
                            actionable: false
                          };
                        }
                      };

                      const severityConfig = getSeverityConfig(signal.level);
                      const statusConfig = getStatusConfig(signal.level);

                      return (
                        <div 
                          key={index} 
                          className={`group relative p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
                            signal.level === 'critical' 
                              ? 'bg-destructive/5 border-destructive/20 hover:bg-destructive/10' 
                              : signal.level === 'risk'
                              ? 'bg-warning/5 border-warning/20 hover:bg-warning/10'
                              : 'bg-accent hover:bg-accent/80 border-border'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-4 flex-1">
                              {/* Enhanced severity indicator */}
                              <div className="flex flex-col items-center space-y-1 mt-1">
                                <div className={`w-4 h-4 rounded-full ${severityConfig.color} shadow-sm`}></div>
                                <div className={`text-xs font-medium ${severityConfig.textColor} rotate-90 whitespace-nowrap`}>
                                  {severityConfig.priority}
                                </div>
                              </div>
                              
                              <div className="flex-1 space-y-2">
                                {/* Employee and reason */}
                                <div>
                                  <div className="flex items-center space-x-2 mb-1">
                                    <span className="font-semibold text-foreground text-lg">{signal.name}</span>
                                    <span className="text-muted-foreground">•</span>
                                    <span className="text-foreground font-medium">{signal.reason}</span>
                                  </div>
                                  
                                  {/* Enhanced badges and time */}
                                  <div className="flex items-center space-x-3">
                                    <Badge 
                                      variant={severityConfig.badgeVariant}
                                      className="text-xs font-semibold px-2 py-1"
                                    >
                                      {signal.level.toUpperCase()}
                                    </Badge>
                                    <span className="text-sm text-muted-foreground flex items-center">
                                      <Clock className="h-3 w-3 mr-1" />
                                      {timeString}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Enhanced status and actions */}
                            <div className="flex items-center space-x-3 ml-4">
                              <div className="text-right space-y-2">
                                <Badge 
                                  variant={statusConfig.variant}
                                  className="flex items-center space-x-1 px-3 py-1"
                                >
                                  {statusConfig.icon}
                                  <span className="ml-1">{getStatus(signal.level)}</span>
                                </Badge>
                                
                                {/* Action button for critical/risk signals */}
                                {statusConfig.actionable && (
                                  <Button 
                                    size="sm" 
                                    variant={signal.level === 'critical' ? 'destructive' : 'default'}
                                    className="w-full"
                                  >
                                    {signal.level === 'critical' ? 'Review Alert' : 'View Details'}
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {/* Subtle hover effect */}
                          <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
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
    </div>
  );
};

export default ControlTower;