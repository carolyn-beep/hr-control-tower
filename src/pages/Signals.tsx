import ManagerlessHeader from "@/components/ManagerlessHeader";
import ManagerlessSidebar from "@/components/ManagerlessSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  AlertTriangle, 
  TrendingDown, 
  Users, 
  Clock, 
  Filter,
  Search,
  Eye,
  Play
} from "lucide-react";

const signals = [
  {
    id: 1,
    employee: "Sarah Chen",
    department: "Engineering",
    signal: "Productivity Decline",
    severity: "High",
    description: "40% decrease in commits, 60% increase in meeting time",
    triggered: "2 hours ago",
    lastAction: "Auto-coaching initiated",
    riskScore: 85,
    trend: "worsening"
  },
  {
    id: 2,
    employee: "Mike Rodriguez", 
    department: "Marketing",
    signal: "Engagement Drop",
    severity: "Medium",
    description: "Reduced Slack activity, missing team standups",
    triggered: "4 hours ago", 
    lastAction: "Monitoring phase",
    riskScore: 67,
    trend: "stable"
  },
  {
    id: 3,
    employee: "Lisa Park",
    department: "Sales",
    signal: "Performance Issue",
    severity: "Critical",
    description: "50% below quota for 3 consecutive weeks",
    triggered: "6 hours ago",
    lastAction: "Manager escalation sent", 
    riskScore: 92,
    trend: "worsening"
  },
  {
    id: 4,
    employee: "David Kim",
    department: "Engineering", 
    signal: "Collaboration Decline",
    severity: "Low",
    description: "Fewer code reviews, isolated work patterns",
    triggered: "1 day ago",
    lastAction: "Peer feedback requested",
    riskScore: 34,
    trend: "improving"
  },
  {
    id: 5,
    employee: "Amanda Foster",
    department: "Design",
    signal: "Burnout Indicators",
    severity: "High",
    description: "Working 65+ hours/week, stress indicators in communications",
    triggered: "3 hours ago",
    lastAction: "Workload assessment triggered",
    riskScore: 78,
    trend: "worsening"
  }
];

const Signals = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <ManagerlessSidebar />
        
        <div className="flex-1">
          <ManagerlessHeader />
          
          <main className="p-6">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">Signal Detection</h1>
              <p className="text-muted-foreground">AI-powered risk signals and automated interventions</p>
            </div>

            {/* Filters & Search */}
            <Card className="mb-6 bg-gradient-card border-border shadow-card">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search employees, signals, departments..."
                      className="pl-10"
                    />
                  </div>
                  <Select>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Severities</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      <SelectItem value="engineering">Engineering</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="design">Design</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline">
                    <Filter className="mr-2 h-4 w-4" />
                    More Filters
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Signals Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card className="bg-gradient-card border-border shadow-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Critical Signals</p>
                      <p className="text-2xl font-bold text-destructive">1</p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-destructive" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-card border-border shadow-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">High Priority</p>
                      <p className="text-2xl font-bold text-warning">2</p>
                    </div>
                    <TrendingDown className="h-8 w-8 text-warning" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-card border-border shadow-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Active Monitoring</p>
                      <p className="text-2xl font-bold text-primary">2</p>
                    </div>
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-card border-border shadow-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Avg. Response</p>
                      <p className="text-2xl font-bold text-success">2.3h</p>
                    </div>
                    <Clock className="h-8 w-8 text-success" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Signals List */}
            <Card className="bg-gradient-card border-border shadow-card">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-foreground">Active Signals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {signals.map((signal) => (
                    <div key={signal.id} className="p-4 border border-border rounded-lg bg-card hover:bg-accent transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <Badge 
                              variant="outline"
                              className={`${
                                signal.severity === 'Critical' ? 'border-destructive text-destructive' :
                                signal.severity === 'High' ? 'border-warning text-warning' :
                                signal.severity === 'Medium' ? 'border-primary text-primary' :
                                'border-muted-foreground text-muted-foreground'
                              }`}
                            >
                              {signal.severity}
                            </Badge>
                            <h3 className="font-semibold text-foreground">{signal.employee}</h3>
                            <span className="text-sm text-muted-foreground">•</span>
                            <span className="text-sm text-muted-foreground">{signal.department}</span>
                          </div>
                          
                          <h4 className="font-medium text-foreground mb-1">{signal.signal}</h4>
                          <p className="text-sm text-muted-foreground mb-3">{signal.description}</p>
                          
                          <div className="flex items-center space-x-6">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-muted-foreground">Risk Score:</span>
                              <div className="flex items-center space-x-1">
                                <div className="w-20 h-2 bg-muted rounded-full">
                                  <div 
                                    className={`h-2 rounded-full ${
                                      signal.riskScore >= 80 ? 'bg-destructive' :
                                      signal.riskScore >= 60 ? 'bg-warning' :
                                      'bg-primary'
                                    }`}
                                    style={{ width: `${signal.riskScore}%` }}
                                  />
                                </div>
                                <span className="text-xs font-medium">{signal.riskScore}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-muted-foreground">Triggered:</span>
                              <span className="text-xs font-medium">{signal.triggered}</span>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-muted-foreground">Last Action:</span>
                              <span className="text-xs font-medium">{signal.lastAction}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            Details
                          </Button>
                          <Button size="sm" className="bg-gradient-primary">
                            <Play className="h-4 w-4 mr-1" />
                            Take Action
                          </Button>
                        </div>
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

export default Signals;