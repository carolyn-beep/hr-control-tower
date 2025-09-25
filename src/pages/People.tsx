import ManagerlessHeader from "@/components/ManagerlessHeader";
import ManagerlessSidebar from "@/components/ManagerlessSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { PersonDrawer } from "@/components/PersonDrawer";
import { usePeopleOverview, PersonOverview } from "@/hooks/usePeopleOverview";
import { 
  Search, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  CheckCircle,
  Bot,
  Activity
} from "lucide-react";
import { useState } from "react";

const People = () => {
  const { data: people = [], isLoading, error } = usePeopleOverview();
  const [selectedPerson, setSelectedPerson] = useState<{
    id: string;
    name: string;
    email: string;
    role: string;
    department: string;
    riskScore: number;
    status: string;
    avatar?: string;
  } | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleViewDetails = (person: PersonOverview) => {
    setSelectedPerson({
      id: person.id,
      name: person.name,
      email: person.email,
      role: person.role || 'Unknown',
      department: person.department || 'Unknown',
      riskScore: person.risk_score || 0,
      status: person.status || 'Unknown',
    });
    setDrawerOpen(true);
  };

  const getStatusFromRisk = (riskScore: number) => {
    if (riskScore >= 80) return 'Critical';
    if (riskScore >= 60) return 'At Risk';
    if (riskScore >= 40) return 'Monitoring';
    if (riskScore >= 20) return 'Healthy';
    return 'Thriving';
  };

  const getTrendFromRisk = (riskScore: number) => {
    // Simulate trend based on risk score for now
    if (riskScore >= 70) return 'down';
    if (riskScore >= 40) return 'stable';
    return 'up';
  };

  const getMetricsFromRisk = (riskScore: number) => {
    // Simulate metrics based on risk score
    const baseProductivity = Math.max(10, 100 - riskScore);
    return {
      productivity: baseProductivity + Math.random() * 20 - 10,
      engagement: baseProductivity + Math.random() * 15 - 7.5,
      collaboration: baseProductivity + Math.random() * 10 - 5,
    };
  };

  const getSignalsCount = (riskScore: number) => {
    if (riskScore >= 80) return Math.floor(Math.random() * 3) + 2; // 2-4 signals
    if (riskScore >= 60) return Math.floor(Math.random() * 2) + 1; // 1-2 signals
    if (riskScore >= 40) return Math.random() > 0.5 ? 1 : 0; // 0-1 signals
    return 0;
  };

  const getCoachingStatus = (riskScore: number) => {
    if (riskScore >= 80) return 'Escalated';
    if (riskScore >= 60) return 'Active';
    if (riskScore >= 40) return 'Scheduled';
    return 'None';
  };

  // Calculate summary stats
  const criticalCount = people.filter(p => (p.risk_score || 0) >= 80).length;
  const atRiskCount = people.filter(p => (p.risk_score || 0) >= 60 && (p.risk_score || 0) < 80).length;
  const monitoringCount = people.filter(p => (p.risk_score || 0) >= 40 && (p.risk_score || 0) < 60).length;
  const thrivingCount = people.filter(p => (p.risk_score || 0) < 40).length;
  const activeCoachingCount = people.filter(p => (p.risk_score || 0) >= 60).length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex">
          <ManagerlessSidebar />
          <div className="flex-1">
            <ManagerlessHeader />
            <main className="p-6">
              <div className="text-center py-8">
                <div className="animate-pulse">Loading people data...</div>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('People overview error:', error);
  }

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
                    <p className="text-2xl font-bold text-destructive">{criticalCount}</p>
                    <p className="text-sm text-muted-foreground">Critical Risk</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-card border-border shadow-card">
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-warning">{atRiskCount}</p>
                    <p className="text-sm text-muted-foreground">At Risk</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-card border-border shadow-card">
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{monitoringCount}</p>
                    <p className="text-sm text-muted-foreground">Monitoring</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-card border-border shadow-card">
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-success">{thrivingCount}</p>
                    <p className="text-sm text-muted-foreground">Thriving</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-card border-border shadow-card">
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-foreground">{activeCoachingCount}</p>
                    <p className="text-sm text-muted-foreground">Active Coaching</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* People Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {people.map((person, index) => {
                const riskScore = person.risk_score || 0;
                const status = getStatusFromRisk(riskScore);
                const trend = getTrendFromRisk(riskScore);
                const metrics = getMetricsFromRisk(riskScore);
                const signals = getSignalsCount(riskScore);
                const coaching = getCoachingStatus(riskScore);
                const lastActivity = person.last_signal_ts 
                  ? new Date(person.last_signal_ts).toLocaleString() 
                  : 'No recent activity';

                return (
                  <Card 
                    key={person.id} 
                    className={`bg-gradient-card border-border shadow-card hover:shadow-glow transition-all duration-500 hover-lift interactive-card animate-slide-up`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <Avatar className="h-14 w-14 ring-2 ring-border hover:ring-primary/50 transition-all duration-300">
                            <AvatarImage src="/placeholder.svg" alt={person.name} />
                            <AvatarFallback className="bg-gradient-primary text-primary-foreground font-semibold">
                              {person.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          {/* Status indicator */}
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-card ${
                            status === 'Critical' ? 'bg-destructive animate-pulse' :
                            status === 'At Risk' ? 'bg-warning animate-pulse' :
                            status === 'Monitoring' ? 'bg-primary animate-pulse' :
                            status === 'Thriving' ? 'bg-success' :
                            'bg-muted-foreground'
                          }`}></div>
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground text-base hover:text-primary transition-colors cursor-pointer">
                            {person.name}
                          </h3>
                          <p className="text-sm text-muted-foreground font-medium">{person.role || 'Unknown Role'}</p>
                          <p className="text-xs text-muted-foreground bg-accent px-2 py-1 rounded-full mt-1 inline-block">
                            {person.department || 'Unknown Dept'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-xs text-muted-foreground">Risk Score</span>
                          <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                            riskScore >= 80 ? 'bg-destructive/10 text-destructive' :
                            riskScore >= 60 ? 'bg-warning/10 text-warning' :
                            riskScore >= 40 ? 'bg-primary/10 text-primary' :
                            'bg-success/10 text-success'
                          } animate-bounce-in`}>
                            {Math.round(riskScore)}
                          </div>
                          {trend === 'up' ? (
                            <TrendingUp className="h-4 w-4 text-success animate-bounce" />
                          ) : trend === 'down' ? (
                            <TrendingDown className="h-4 w-4 text-destructive animate-bounce" />
                          ) : null}
                        </div>
                        <Badge 
                          variant="outline"
                          className={`text-xs font-semibold px-3 py-1 ${
                            status === 'Critical' ? 'border-destructive text-destructive bg-destructive/5' :
                            status === 'At Risk' ? 'border-warning text-warning bg-warning/5' :
                            status === 'Monitoring' ? 'border-primary text-primary bg-primary/5' :
                            status === 'Thriving' ? 'border-success text-success bg-success/5' :
                            'border-muted-foreground text-muted-foreground bg-muted/5'
                          } animate-fade-in`}
                        >
                          {status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Metrics */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Productivity</span>
                        <span className="text-xs font-medium">{Math.round(metrics.productivity)}%</span>
                      </div>
                      <Progress value={metrics.productivity} className="h-2" />
                      
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Engagement</span>
                        <span className="text-xs font-medium">{Math.round(metrics.engagement)}%</span>
                      </div>
                      <Progress value={metrics.engagement} className="h-2" />
                      
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Collaboration</span>
                        <span className="text-xs font-medium">{Math.round(metrics.collaboration)}%</span>
                      </div>
                      <Progress value={metrics.collaboration} className="h-2" />
                    </div>

                    {/* Status Items */}
                    <div className="space-y-2 pt-2 border-t border-border">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Active Signals:</span>
                        <div className="flex items-center space-x-1">
                          {signals > 0 && <AlertTriangle className="h-3 w-3 text-warning" />}
                          <span className="text-xs font-medium">{signals}</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">AI Coaching:</span>
                        <div className="flex items-center space-x-1">
                          {coaching === 'Active' && <Bot className="h-3 w-3 text-primary" />}
                          {coaching === 'None' && <CheckCircle className="h-3 w-3 text-success" />}
                          <span className="text-xs font-medium">{coaching}</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Last Activity:</span>
                        <span className="text-xs font-medium">{lastActivity}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2 pt-3">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1 hover:bg-primary/5 hover:border-primary/20 hover:scale-105 transition-all duration-200"
                        onClick={() => handleViewDetails(person)}
                      >
                        <Activity className="h-3 w-3 mr-1" />
                        View Details
                      </Button>
                      {signals > 0 && (
                        <Button 
                          size="sm" 
                          variant="gradient"
                          className="flex-1 shadow-glow hover:scale-105 transition-all duration-200"
                          onClick={() => handleViewDetails(person)}
                        >
                          <Bot className="h-3 w-3 mr-1" />
                          Coach
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
                );
              })}
            </div>
          </main>
        </div>
      </div>

      <PersonDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        person={selectedPerson}
      />
    </div>
  );
};

export default People;