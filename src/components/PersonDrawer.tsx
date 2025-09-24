import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePersonKPIs, useKPIBenchmarks } from "@/hooks/usePersonKPIs";
import { Bot, UserCheck, X, TrendingUp, TrendingDown, MessageSquare } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { AutoCoachModal } from "./AutoCoachModal";
import { AdaCoachModal } from "./AdaCoachModal";
import { ReleaseEvaluationModal } from "./ReleaseEvaluationModal";

interface PersonDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  person?: {
    id: string;
    name: string;
    email: string;
    role: string;
    department: string;
    riskScore: number;
    status: string;
    avatar?: string;
  } | null;
}

const TARGET_KPIS = ['PRs/week', 'Review turnaround', 'Lead time', 'Bug reopen rate'];

export const PersonDrawer = ({ open, onOpenChange, person }: PersonDrawerProps) => {
  const [autoCoachOpen, setAutoCoachOpen] = useState(false);
  const [adaCoachOpen, setAdaCoachOpen] = useState(false);
  const [releaseEvalOpen, setReleaseEvalOpen] = useState(false);
  
  const { data: kpiData = [], isLoading: kpiLoading } = usePersonKPIs(person?.id || null);
  const { data: benchmarks = [], isLoading: benchmarkLoading } = useKPIBenchmarks(person?.role || null);

  if (!person) return null;

  // Group KPI data by KPI name and prepare chart data
  const getKPIChartData = (kpiName: string) => {
    const kpiPoints = kpiData
      .filter(item => item.kpi.toLowerCase().includes(kpiName.toLowerCase().split('/')[0]))
      .map(item => ({
        date: new Date(item.ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: item.value,
      }));
    
    return kpiPoints.length > 0 ? kpiPoints : [];
  };

  const getLatestKPIValue = (kpiName: string) => {
    const kpiPoints = kpiData.filter(item => 
      item.kpi.toLowerCase().includes(kpiName.toLowerCase().split('/')[0])
    );
    return kpiPoints.length > 0 ? kpiPoints[kpiPoints.length - 1].value : 0;
  };

  const getBenchmark = (kpiName: string) => {
    const benchmark = benchmarks.find(b => 
      b.kpi.toLowerCase().includes(kpiName.toLowerCase().split('/')[0])
    );
    return benchmark?.median_14d || 0;
  };

  const renderKPICard = (kpiName: string) => {
    const chartData = getKPIChartData(kpiName);
    const currentValue = getLatestKPIValue(kpiName);
    const benchmark = getBenchmark(kpiName);
    const isAboveBenchmark = currentValue > benchmark;
    const isGoodDirection = kpiName.includes('reopen rate') ? !isAboveBenchmark : isAboveBenchmark;

    return (
      <Card key={kpiName} className="bg-gradient-card border-border">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">{kpiName}</CardTitle>
            {isGoodDirection ? (
              <TrendingUp className="h-4 w-4 text-success" />
            ) : (
              <TrendingDown className="h-4 w-4 text-destructive" />
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <div>
                <div className="text-lg font-bold text-foreground">{currentValue.toFixed(1)}</div>
                <div className="text-xs text-muted-foreground">
                  vs {benchmark.toFixed(1)} median
                </div>
              </div>
            </div>
            
            {chartData.length > 0 && (
              <div className="h-16 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <XAxis 
                      dataKey="date" 
                      hide 
                    />
                    <YAxis hide />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke={isGoodDirection ? "hsl(var(--success))" : "hsl(var(--destructive))"}
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
            
            {chartData.length === 0 && (
              <div className="h-16 flex items-center justify-center text-xs text-muted-foreground">
                No data available
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <>
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader className="border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={person.avatar} alt={person.name} />
                  <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                    {person.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <DrawerTitle className="text-xl">{person.name}</DrawerTitle>
                  <p className="text-sm text-muted-foreground">
                    {person.role} • {person.department}
                  </p>
                  <p className="text-xs text-muted-foreground">{person.email}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Risk Score</div>
                  <div className={`text-lg font-bold ${
                    person.riskScore >= 80 ? 'text-destructive' :
                    person.riskScore >= 60 ? 'text-warning' :
                    person.riskScore >= 40 ? 'text-primary' :
                    'text-success'
                  }`}>
                    {person.riskScore}
                  </div>
                </div>
                
                <Badge 
                  variant="outline"
                  className={`${
                    person.status === 'Critical' ? 'border-destructive text-destructive bg-destructive/5' :
                    person.status === 'At Risk' ? 'border-warning text-warning bg-warning/5' :
                    person.status === 'Monitoring' ? 'border-primary text-primary bg-primary/5' :
                    person.status === 'Thriving' ? 'border-success text-success bg-success/5' :
                    'border-muted-foreground text-muted-foreground bg-muted/5'
                  }`}
                >
                  {person.status}
                </Badge>
                
                <DrawerClose asChild>
                  <Button variant="ghost" size="sm">
                    <X className="h-4 w-4" />
                  </Button>
                </DrawerClose>
              </div>
            </div>
          </DrawerHeader>

          <div className="p-6 space-y-6 overflow-y-auto">
            {/* KPI Mini-Charts Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Performance Metrics (Last 14 days)</h3>
              {kpiLoading || benchmarkLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {TARGET_KPIS.map(kpi => (
                    <Card key={kpi} className="bg-gradient-card border-border">
                      <CardContent className="p-4">
                        <div className="animate-pulse space-y-2">
                          <div className="h-4 bg-muted rounded"></div>
                          <div className="h-8 bg-muted rounded"></div>
                          <div className="h-16 bg-muted rounded"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {TARGET_KPIS.map(renderKPICard)}
                </div>
              )}
            </div>
          </div>

          <DrawerFooter className="border-t border-border">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button 
                onClick={() => setAutoCoachOpen(true)}
                variant="outline"
              >
                <Bot className="h-4 w-4 mr-2" />
                DevCoachBot
              </Button>
              <Button 
                onClick={() => setAdaCoachOpen(true)}
                variant="outline"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Ask Ada
              </Button>
              <Button 
                onClick={() => setReleaseEvalOpen(true)}
                variant="default"
              >
                <UserCheck className="h-4 w-4 mr-2" />
                Evaluate Release
              </Button>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <AutoCoachModal
        open={autoCoachOpen}
        onOpenChange={setAutoCoachOpen}
        personId={person.id}
        personName={person.name}
      />

      <AdaCoachModal
        open={adaCoachOpen}
        onOpenChange={setAdaCoachOpen}
        personId={person.id}
        personName={person.name}
      />

      <ReleaseEvaluationModal
        open={releaseEvalOpen}
        onOpenChange={setReleaseEvalOpen}
        personId={person.id}
        personName={person.name}
      />
    </>
  );
};