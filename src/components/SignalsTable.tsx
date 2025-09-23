import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Filter, Loader2, UserCheck, AlertTriangle, Activity } from "lucide-react";
import { useSignalsData } from "@/hooks/useSignalsData";
import { ReleaseEvaluationModal } from "@/components/ReleaseEvaluationModal";
import { useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";

const SignalsTable = () => {
  const [searchParams] = useSearchParams();
  
  // Get initial filters from URL parameters
  const getInitialLevelFilter = () => {
    const levelParam = searchParams.get('level');
    if (levelParam) {
      // Handle multiple levels like "risk,critical"
      const levels = levelParam.split(',');
      if (levels.length === 1) {
        return levels[0];
      } else if (levels.includes('risk') && levels.includes('critical')) {
        return 'risk_critical'; // Special value for risk+critical combo
      }
    }
    return 'all';
  };

  const [levelFilter, setLevelFilter] = useState<string>(getInitialLevelFilter());
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [selectedPersonId, setSelectedPersonId] = useState<string>('');
  const [selectedPersonName, setSelectedPersonName] = useState<string>('');
  const [modalOpen, setModalOpen] = useState(false);

  // Modify levelFilter for API call
  const getApiLevelFilter = () => {
    if (levelFilter === 'risk_critical') {
      return 'risk'; // We'll handle multiple levels in the hook
    }
    return levelFilter;
  };

  const { data: signals, isLoading, error } = useSignalsData({
    levelFilter: getApiLevelFilter(),
    startDate: startDate?.toISOString(),
    endDate: endDate?.toISOString(),
    multipleLevels: levelFilter === 'risk_critical' ? ['risk', 'critical'] : undefined
  });

  const getBadgeVariant = (level: string) => {
    switch (level.toLowerCase()) {
      case 'critical':
        return 'destructive';
      case 'risk':
        return 'default';
      case 'warn':
        return 'secondary';
      case 'info':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getBadgeColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'critical':
        return 'border-destructive text-destructive';
      case 'risk':
        return 'border-warning text-warning';
      case 'warn':
        return 'border-primary text-primary';
      case 'info':
        return 'border-muted-foreground text-muted-foreground';
      default:
        return 'border-muted-foreground text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="bg-gradient-card border-border shadow-card">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Signal Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="risk">Risk</SelectItem>
                <SelectItem value="risk_critical">Risk + Critical</SelectItem>
                <SelectItem value="warn">Warning</SelectItem>
                <SelectItem value="info">Info</SelectItem>
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-48 justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP") : "Start date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-48 justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PPP") : "End date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Button 
              variant="outline" 
              onClick={() => {
                setLevelFilter('all');
                setStartDate(undefined);
                setEndDate(undefined);
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Signals Table */}
      <Card className="bg-gradient-card border-border shadow-card">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-foreground">Signals</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-primary/20 rounded-full animate-spin"></div>
                <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-primary rounded-full animate-spin"></div>
              </div>
              <div className="text-center space-y-2">
                <p className="text-lg font-medium text-foreground animate-pulse">Loading signals...</p>
                <p className="text-sm text-muted-foreground">Analyzing risk patterns</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4 animate-fade-in">
              <div className="p-4 bg-destructive/10 rounded-full">
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-lg font-semibold text-destructive">Failed to load signals</p>
                <p className="text-sm text-muted-foreground">Please check your connection and try again</p>
                <Button 
                  variant="outline" 
                  onClick={() => window.location.reload()} 
                  className="mt-4 hover:bg-destructive/10"
                >
                  Try Again
                </Button>
              </div>
            </div>
          ) : signals && signals.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Person</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead className="text-right">Score Delta</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                  {signals.map((signal, index) => (
                    <TableRow 
                      key={signal.id} 
                      className="hover:bg-accent/50 transition-colors duration-200 animate-fade-in hover-lift"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                    <TableCell className="font-mono text-sm">
                      {format(new Date(signal.ts), "MMM dd, yyyy HH:mm")}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{signal.person}</div>
                        <div className="text-sm text-muted-foreground">{signal.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={getBadgeColor(signal.level)}
                      >
                        {signal.level}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-md">
                      <div className="truncate" title={signal.reason}>
                        {signal.reason}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {signal.score_delta !== null ? (
                        <span className={signal.score_delta > 0 ? "text-destructive" : "text-success"}>
                          {signal.score_delta > 0 ? "+" : ""}{signal.score_delta}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="gradient" 
                        size="sm"
                        className="shadow-soft hover:shadow-dashboard"
                        onClick={() => {
                          setSelectedPersonId(signal.person_id);
                          setSelectedPersonName(signal.person);
                          setModalOpen(true);
                        }}
                      >
                        <UserCheck className="h-4 w-4 mr-2" />
                        Evaluate for Release
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 space-y-4 animate-fade-in">
              <div className="relative">
                <div className="p-4 bg-accent rounded-full">
                  <Activity className="h-12 w-12 text-muted-foreground" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-primary/20 rounded-full animate-ping"></div>
              </div>
              <div className="text-center space-y-2 max-w-md">
                <h3 className="text-lg font-semibold text-foreground">No signals detected</h3>
                <p className="text-sm text-muted-foreground">
                  Your AI monitoring system is running smoothly. No risk signals match the current filters.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setLevelFilter('all');
                    setStartDate(undefined);
                    setEndDate(undefined);
                  }}
                  className="mt-4 hover:bg-primary/5"
                >
                  Clear All Filters
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <ReleaseEvaluationModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        personId={selectedPersonId}
        personName={selectedPersonName}
      />
    </div>
  );
};

export default SignalsTable;