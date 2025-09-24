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
import { CalendarIcon, Filter, Loader2, UserCheck, AlertTriangle, Activity, MoreHorizontal, Bot, FileText, Eye, Clock as ClockIcon, CheckCircle2, CheckCircle } from "lucide-react";
import { useRankedSignals } from "@/hooks/useRankedSignals";
import { useRecognizeAndCloseLoop } from "@/hooks/useRecognizeAndCloseLoop";
import { ReleaseEvaluationModal } from "@/components/ReleaseEvaluationModal";
import { AutoCoachModal } from "@/components/AutoCoachModal";
import { EvidenceModal } from "@/components/EvidenceModal";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const SignalsTable = () => {
  const [searchParams] = useSearchParams();
  
  // Get initial filters from URL parameters
  const getInitialLevelFilter = () => {
    const levelParam = searchParams.get('level');
    console.log('URL level param:', levelParam);
    if (levelParam) {
      // Handle multiple levels like "risk,critical"
      const levels = levelParam.split(',').map(l => l.trim());
      console.log('Parsed levels:', levels);
      if (levels.length === 1) {
        return levels[0];
      } else if (levels.includes('risk') && levels.includes('critical')) {
        return 'risk_critical'; // Special value for risk+critical combo
      }
    }
    return 'all';
  };

  const [levelFilter, setLevelFilter] = useState<string>(getInitialLevelFilter());
  const getInitialSortMode = () => {
    const sortParam = searchParams.get('sort');
    if (sortParam === 'ts_desc' || sortParam === 'ts_asc' || sortParam === 'priority') return sortParam;
    return 'priority';
  };
  const [sortMode, setSortMode] = useState<'ts_desc' | 'ts_asc' | 'priority'>(getInitialSortMode());
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [selectedPersonId, setSelectedPersonId] = useState<string>('');
  const [selectedPersonName, setSelectedPersonName] = useState<string>('');
  const [selectedSignalReason, setSelectedSignalReason] = useState<string>('');
  const [modalOpen, setModalOpen] = useState(false);
  const [autoCoachOpen, setAutoCoachOpen] = useState(false);
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const [evidenceData, setEvidenceData] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  // Modify levelFilter for API call
  const getApiLevelFilter = () => {
    console.log('Current levelFilter:', levelFilter);
    if (levelFilter === 'risk_critical') {
      return 'risk'; // We'll handle multiple levels in the hook
    }
    return levelFilter;
  };

  const multipleLevelsParam = levelFilter === 'risk_critical' ? ['risk', 'critical'] : undefined;
  console.log('Query params:', { 
    levelFilter: getApiLevelFilter(), 
    multipleLevels: multipleLevelsParam,
    startDate: startDate?.toISOString(),
    endDate: endDate?.toISOString(),
    sortMode,
  });

  const { data: signals, isLoading, error } = useRankedSignals({
    levelFilter: getApiLevelFilter(),
    startDate: startDate?.toISOString(),
    endDate: endDate?.toISOString(),
    multipleLevels: multipleLevelsParam,
    sortMode,
  });

  const recognizeAndCloseLoop = useRecognizeAndCloseLoop();

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
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-full sm:w-48">
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
                    "w-full sm:w-48 justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "MMM dd") : "Start date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full sm:w-48 justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "MMM dd") : "End date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>

            <Button 
              variant="outline" 
              size="sm"
              className="w-full sm:w-auto"
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
            <div className="space-y-4">
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
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
                          {signal.score_delta !== null && signal.score_delta !== 0 ? (
                           <span className={`text-sm font-semibold ${
                              signal.score_delta < 0 
                                ? 'text-success' 
                                : signal.level === 'critical' 
                                  ? 'text-destructive'
                                  : signal.level === 'risk'
                                    ? 'text-warning'
                                    : signal.level === 'warn'
                                      ? 'text-warning'
                                      : 'text-warning'
                            }`}>
                              {signal.score_delta > 0 
                                ? `+${Math.round(signal.score_delta * 10) / 10} Risk ↑`
                                : `–${Math.abs(Math.round(signal.score_delta * 10) / 10)} Risk ↓`
                              }
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {signal.action_type === 'release' && (
                            <div className="space-y-1">
                               <Button 
                                variant="outline"
                                size="sm"
                                className="shadow-soft hover:shadow-dashboard transition-all duration-200 hover:scale-105 bg-destructive/10 border-destructive/20 text-destructive hover:bg-destructive/20"
                                onClick={() => {
                                  setSelectedPersonId(signal.person_id);
                                  setSelectedPersonName(signal.person);
                                  setSelectedSignalReason(signal.reason);
                                  setModalOpen(true);
                                }}
                                disabled={signal.action_disabled}
                                title={signal.action_disabled ? signal.action_reason : undefined}
                              >
                                <UserCheck className="h-4 w-4 mr-2" />
                                Evaluate for Release
                              </Button>
                              {signal.action_disabled && signal.action_reason && (
                                <div className="text-xs text-muted-foreground max-w-32 text-right">
                                  {signal.action_reason}
                                </div>
                              )}
                            </div>
                          )}
                          {signal.action_type === 'coach' && (
                             <Button 
                              variant="outline"
                              size="sm"
                              className="shadow-soft hover:shadow-dashboard transition-all duration-200 hover:scale-105 bg-primary/10 border-primary/20 text-primary hover:bg-primary/20"
                              onClick={() => {
                                setSelectedPersonId(signal.person_id);
                                setSelectedPersonName(signal.person);
                                setSelectedSignalReason(signal.reason);
                                setAutoCoachOpen(true);
                              }}
                            >
                              <Bot className="h-4 w-4 mr-2" />
                              Start Auto-Coach
                            </Button>
                          )}
                          {signal.action_type === 'kudos' && (
                             <Button 
                              variant="outline"
                              size="sm"
                              className="shadow-soft hover:shadow-dashboard transition-all duration-200 hover:scale-105 bg-success/10 border-success/20 text-success hover:bg-success/20"
                              onClick={() => recognizeAndCloseLoop.mutate({ personId: signal.person_id })}
                              disabled={recognizeAndCloseLoop.isPending}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              {recognizeAndCloseLoop.isPending ? 'Processing...' : 'Recognize & Close Loop'}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden space-y-3">
                {signals.map((signal, index) => (
                  <Card 
                    key={signal.id} 
                    className="bg-gradient-card border-border shadow-card animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{signal.person}</div>
                          <div className="text-xs text-muted-foreground truncate">{signal.email}</div>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={`${getBadgeColor(signal.level)} text-xs`}
                        >
                          {signal.level}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-foreground line-clamp-2" title={signal.reason}>
                        {signal.reason}
                      </div>
                      
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground font-mono">
                          {format(new Date(signal.ts), "MMM dd, HH:mm")}
                        </span>
                         {signal.score_delta !== null && signal.score_delta !== 0 && (
                          <span className={`font-semibold ${
                            signal.score_delta < 0 
                              ? 'text-success' 
                              : signal.level === 'critical' 
                                ? 'text-destructive'
                                : signal.level === 'risk'
                                  ? 'text-warning'
                                  : signal.level === 'warn'
                                    ? 'text-warning'
                                    : 'text-warning'
                          }`}>
                            {signal.score_delta > 0 
                              ? `+${Math.round(signal.score_delta * 10) / 10} Risk ↑`
                              : `–${Math.abs(Math.round(signal.score_delta * 10) / 10)} Risk ↓`
                            }
                          </span>
                        )}
                      </div>
                      
                      <div className="pt-2">
                        {signal.action_type === 'release' && (
                          <div className="space-y-2">
                            <Button 
                              variant="outline"
                              size="sm"
                              className="w-full shadow-soft hover:shadow-dashboard transition-all duration-200 bg-destructive/10 border-destructive/20 text-destructive hover:bg-destructive/20"
                              onClick={() => {
                                setSelectedPersonId(signal.person_id);
                                setSelectedPersonName(signal.person);
                                setSelectedSignalReason(signal.reason);
                                setModalOpen(true);
                              }}
                              disabled={signal.action_disabled}
                              title={signal.action_disabled ? signal.action_reason : undefined}
                            >
                              <UserCheck className="h-4 w-4 mr-2" />
                              Evaluate for Release
                            </Button>
                            {signal.action_disabled && signal.action_reason && (
                              <div className="text-xs text-muted-foreground text-center">
                                {signal.action_reason}
                              </div>
                            )}
                          </div>
                        )}
                        {signal.action_type === 'coach' && (
                          <Button 
                            variant="outline"
                            size="sm"
                            className="w-full shadow-soft hover:shadow-dashboard transition-all duration-200 bg-primary/10 border-primary/20 text-primary hover:bg-primary/20"
                            onClick={() => {
                              setSelectedPersonId(signal.person_id);
                              setSelectedPersonName(signal.person);
                              setSelectedSignalReason(signal.reason);
                              setAutoCoachOpen(true);
                            }}
                          >
                            <Bot className="h-4 w-4 mr-2" />
                            Start Auto-Coach
                          </Button>
                        )}
                        {signal.action_type === 'kudos' && (
                          <Button 
                            variant="outline"
                            size="sm"
                            className="w-full shadow-soft hover:shadow-dashboard transition-all duration-200 bg-success/10 border-success/20 text-success hover:bg-success/20"
                            onClick={() => recognizeAndCloseLoop.mutate({ personId: signal.person_id })}
                            disabled={recognizeAndCloseLoop.isPending}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            {recognizeAndCloseLoop.isPending ? 'Processing...' : 'Recognize & Close Loop'}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
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
        reason={selectedSignalReason}
      />
      
      <AutoCoachModal
        open={autoCoachOpen}
        onOpenChange={setAutoCoachOpen}
        personId={selectedPersonId}
        personName={selectedPersonName}
        reason={selectedSignalReason}
      />
    </div>
  );
};

export default SignalsTable;