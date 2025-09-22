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
                <Card key={index} className="bg-gradient-card border-border shadow-card hover:shadow-dashboard transition-all duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {metric.title}
                    </CardTitle>
                    <div className={`p-2 rounded-md ${metric.bgColor}`}>
                      <metric.icon className={`h-4 w-4 ${metric.color}`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground">{metric.value}</div>
                    <div className="flex items-center mt-2">
                      {metric.trend === "up" ? (
                        <TrendingUp className="h-4 w-4 text-success mr-1" />
                      ) : (
                        <TrendingUp className="h-4 w-4 text-success mr-1 rotate-180" />
                      )}
                      <span 
                        className={`text-sm ${
                          metric.trend === "up" ? "text-success" : "text-success"
                        }`}
                      >
                        {metric.change}
                      </span>
                      <span className="text-sm text-muted-foreground ml-1">today</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Quick Actions */}
              <Card className="bg-gradient-card border-border shadow-card">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-foreground">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start bg-gradient-primary text-primary-foreground hover:opacity-90">
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Review High Signals
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Bot className="mr-2 h-4 w-4" />
                    Launch Auto-Coach
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Activity className="mr-2 h-4 w-4" />
                    Analyze Trends
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Generate Report
                  </Button>
                </CardContent>
              </Card>

              {/* AI Automation Status */}
              <Card className="lg:col-span-2 bg-gradient-card border-border shadow-card">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-foreground">AI Automation Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { system: "Risk Detection Engine", status: "Active", processes: "247 signals processed", type: "success" },
                      { system: "Auto-Coach Generator", status: "Active", processes: "56 coaching sessions", type: "success" },
                      { system: "Performance Analyzer", status: "Training", processes: "Learning new patterns", type: "warning" },
                      { system: "Workflow Automation", status: "Active", processes: "23 workflows triggered", type: "success" }
                    ].map((automation, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-accent rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className={`w-2 h-2 rounded-full ${
                            automation.type === 'success' ? 'bg-success' : 
                            automation.type === 'warning' ? 'bg-warning' : 'bg-primary'
                          }`}></div>
                          <div>
                            <p className="font-medium text-foreground">{automation.system}</p>
                            <p className="text-sm text-muted-foreground">{automation.processes}</p>
                          </div>
                        </div>
                        <Badge variant={automation.status === 'Active' ? 'default' : 'secondary'}>
                          {automation.status}
                        </Badge>
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
                  {recentSignals.map((signal, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-accent rounded-lg hover:bg-accent/80 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className={`w-3 h-3 rounded-full ${
                          signal.severity === 'Critical' ? 'bg-destructive' :
                          signal.severity === 'High' ? 'bg-warning' :
                          signal.severity === 'Medium' ? 'bg-primary' : 'bg-muted-foreground'
                        }`}></div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-foreground">{signal.employee}</span>
                            <span className="text-sm text-muted-foreground">•</span>
                            <span className="text-sm text-foreground">{signal.signal}</span>
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {signal.severity}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{signal.time}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge 
                          variant={signal.action === 'resolved' ? 'default' : 'secondary'}
                          className={`${
                            signal.action === 'coaching' ? 'bg-primary text-primary-foreground' :
                            signal.action === 'alert' ? 'bg-destructive text-destructive-foreground' :
                            signal.action === 'resolved' ? 'bg-success text-success-foreground' : ''
                          }`}
                        >
                          {signal.status}
                        </Badge>
                        {signal.action === 'resolved' ? (
                          <CheckCircle className="h-4 w-4 text-success" />
                        ) : signal.action === 'alert' ? (
                          <XCircle className="h-4 w-4 text-destructive" />
                        ) : (
                          <Clock className="h-4 w-4 text-warning" />
                        )}
                      </div>
                    </div>
                  ))}
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