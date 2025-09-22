import ManagerlessHeader from "@/components/ManagerlessHeader";
import ManagerlessSidebar from "@/components/ManagerlessSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  Search, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  CheckCircle,
  Bot,
  Activity
} from "lucide-react";

const people = [
  {
    id: 1,
    name: "Sarah Chen",
    role: "Senior Developer",
    department: "Engineering",
    riskScore: 85,
    trend: "down",
    status: "At Risk",
    signals: 3,
    coaching: "Active",
    avatar: "/placeholder.svg",
    metrics: {
      productivity: 45,
      engagement: 60,
      collaboration: 70
    },
    lastActivity: "2 hours ago"
  },
  {
    id: 2,
    name: "Mike Rodriguez",
    role: "Marketing Manager", 
    department: "Marketing",
    riskScore: 67,
    trend: "stable",
    status: "Monitoring",
    signals: 1,
    coaching: "Scheduled",
    avatar: "/placeholder.svg",
    metrics: {
      productivity: 75,
      engagement: 65,
      collaboration: 80
    },
    lastActivity: "4 hours ago"
  },
  {
    id: 3,
    name: "Lisa Park",
    role: "Sales Representative",
    department: "Sales", 
    riskScore: 92,
    trend: "down",
    status: "Critical",
    signals: 4,
    coaching: "Escalated",
    avatar: "/placeholder.svg",
    metrics: {
      productivity: 30,
      engagement: 40,
      collaboration: 35
    },
    lastActivity: "6 hours ago"
  },
  {
    id: 4,
    name: "David Kim",
    role: "Frontend Developer",
    department: "Engineering",
    riskScore: 34,
    trend: "up", 
    status: "Healthy",
    signals: 0,
    coaching: "None",
    avatar: "/placeholder.svg",
    metrics: {
      productivity: 85,
      engagement: 90,
      collaboration: 75
    },
    lastActivity: "1 hour ago"
  },
  {
    id: 5,
    name: "Amanda Foster",
    role: "UX Designer",
    department: "Design",
    riskScore: 78,
    trend: "down",
    status: "At Risk", 
    signals: 2,
    coaching: "Active",
    avatar: "/placeholder.svg",
    metrics: {
      productivity: 50,
      engagement: 55,
      collaboration: 60
    },
    lastActivity: "3 hours ago"
  },
  {
    id: 6,
    name: "John Wilson",
    role: "Product Manager",
    department: "Product",
    riskScore: 25,
    trend: "up",
    status: "Thriving",
    signals: 0, 
    coaching: "None",
    avatar: "/placeholder.svg",
    metrics: {
      productivity: 95,
      engagement: 85,
      collaboration: 90
    },
    lastActivity: "30 minutes ago"
  }
];

const People = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <ManagerlessSidebar />
        
        <div className="flex-1">
          <ManagerlessHeader />
          
          <main className="p-6">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">People Overview</h1>
              <p className="text-muted-foreground">Risk assessment and automated coaching status for all team members</p>
            </div>

            {/* Search & Filters */}
            <Card className="mb-6 bg-gradient-card border-border shadow-card">
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, role, or department..."
                      className="pl-10"
                    />
                  </div>
                  <Button variant="outline">Filter by Risk</Button>
                  <Button variant="outline">Filter by Department</Button>
                </div>
              </CardContent>
            </Card>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
              <Card className="bg-gradient-card border-border shadow-card">
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-destructive">2</p>
                    <p className="text-sm text-muted-foreground">Critical Risk</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-card border-border shadow-card">
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-warning">2</p>
                    <p className="text-sm text-muted-foreground">At Risk</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-card border-border shadow-card">
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">1</p>
                    <p className="text-sm text-muted-foreground">Monitoring</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-card border-border shadow-card">
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-success">1</p>
                    <p className="text-sm text-muted-foreground">Thriving</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-card border-border shadow-card">
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-foreground">3</p>
                    <p className="text-sm text-muted-foreground">Active Coaching</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* People Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {people.map((person) => (
                <Card key={person.id} className="bg-gradient-card border-border shadow-card hover:shadow-dashboard transition-all duration-300">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={person.avatar} alt={person.name} />
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {person.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-foreground">{person.name}</h3>
                          <p className="text-sm text-muted-foreground">{person.role}</p>
                          <p className="text-xs text-muted-foreground">{person.department}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center space-x-1 mb-1">
                          <span className="text-xs text-muted-foreground">Risk:</span>
                          <span className={`text-sm font-bold ${
                            person.riskScore >= 80 ? 'text-destructive' :
                            person.riskScore >= 60 ? 'text-warning' :
                            person.riskScore >= 40 ? 'text-primary' :
                            'text-success'
                          }`}>
                            {person.riskScore}
                          </span>
                          {person.trend === 'up' ? (
                            <TrendingUp className="h-3 w-3 text-success" />
                          ) : person.trend === 'down' ? (
                            <TrendingDown className="h-3 w-3 text-destructive" />
                          ) : null}
                        </div>
                        <Badge 
                          variant="outline"
                          className={`text-xs ${
                            person.status === 'Critical' ? 'border-destructive text-destructive' :
                            person.status === 'At Risk' ? 'border-warning text-warning' :
                            person.status === 'Monitoring' ? 'border-primary text-primary' :
                            person.status === 'Thriving' ? 'border-success text-success' :
                            'border-muted-foreground text-muted-foreground'
                          }`}
                        >
                          {person.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Metrics */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Productivity</span>
                        <span className="text-xs font-medium">{person.metrics.productivity}%</span>
                      </div>
                      <Progress value={person.metrics.productivity} className="h-2" />
                      
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Engagement</span>
                        <span className="text-xs font-medium">{person.metrics.engagement}%</span>
                      </div>
                      <Progress value={person.metrics.engagement} className="h-2" />
                      
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Collaboration</span>
                        <span className="text-xs font-medium">{person.metrics.collaboration}%</span>
                      </div>
                      <Progress value={person.metrics.collaboration} className="h-2" />
                    </div>

                    {/* Status Items */}
                    <div className="space-y-2 pt-2 border-t border-border">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Active Signals:</span>
                        <div className="flex items-center space-x-1">
                          {person.signals > 0 && <AlertTriangle className="h-3 w-3 text-warning" />}
                          <span className="text-xs font-medium">{person.signals}</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">AI Coaching:</span>
                        <div className="flex items-center space-x-1">
                          {person.coaching === 'Active' && <Bot className="h-3 w-3 text-primary" />}
                          {person.coaching === 'None' && <CheckCircle className="h-3 w-3 text-success" />}
                          <span className="text-xs font-medium">{person.coaching}</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Last Activity:</span>
                        <span className="text-xs font-medium">{person.lastActivity}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2 pt-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Activity className="h-3 w-3 mr-1" />
                        View Details
                      </Button>
                      {person.signals > 0 && (
                        <Button size="sm" className="flex-1 bg-gradient-primary">
                          <Bot className="h-3 w-3 mr-1" />
                          Coach
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default People;