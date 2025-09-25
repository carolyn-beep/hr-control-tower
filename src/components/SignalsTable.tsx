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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CalendarIcon, Filter, Loader2, UserCheck, AlertTriangle, Activity, Bot, CheckCircle, Users, Copy, Eye, X } from "lucide-react";
import { useRankedSignals } from "@/hooks/useRankedSignals";
import { useRecognizeAndCloseLoop } from "@/hooks/useRecognizeAndCloseLoop";
import { useCloseCoachingLoop } from "@/hooks/useCloseCoachingLoop";
import { ReleaseEvaluationModal } from "@/components/ReleaseEvaluationModal";
import { AutoCoachModal } from "@/components/AutoCoachModal";
import { EvidenceModal } from "@/components/EvidenceModal";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function SignalsTable() {
  // Get initial filter values from URL
  const getInitialLevelFilter = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get('level') || 'all';
  };

  const getInitialSortMode = () => {
    const params = new URLSearchParams(window.location.search);
    return (params.get('sort') as 'ts_desc' | 'ts_asc' | 'priority') || 'priority';
  };

  const getApiLevelFilter = (levelFilter: string) => {
    if (levelFilter === 'all') return undefined;
    if (levelFilter === 'risk+critical') return ['risk', 'critical'];
    return levelFilter;
  };

  // State management
  const [modalOpen, setModalOpen] = useState(false);
  const [autoCoachOpen, setAutoCoachOpen] = useState(false);
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const [selectedSignalId, setSelectedSignalId] = useState("");
  const [selectedPersonId, setSelectedPersonId] = useState("");
  const [selectedPersonName, setSelectedPersonName] = useState("");
  const [selectedSignalReason, setSelectedSignalReason] = useState("");
  const [evidenceData, setEvidenceData] = useState<any[]>([]);

  // Filter states
  const [levelFilter, setLevelFilter] = useState<string>(() => getInitialLevelFilter());
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [sortMode, setSortMode] = useState<'ts_desc' | 'ts_asc' | 'priority'>(() => getInitialSortMode());
  const [searchTerm, setSearchTerm] = useState("");
  const [onlyActionable, setOnlyActionable] = useState(false);

  // Data fetching
  const apiLevelFilter = getApiLevelFilter(levelFilter);
  const { data: signals, isLoading, error } = useRankedSignals({
    levelFilter: Array.isArray(apiLevelFilter) ? undefined : apiLevelFilter,
    multipleLevels: Array.isArray(apiLevelFilter) ? apiLevelFilter : undefined,
    startDate: startDate?.toISOString(),
    endDate: endDate?.toISOString(),
    sortMode
  });

  // Hooks
  const { toast } = useToast();
  const recognizeAndCloseLoop = useRecognizeAndCloseLoop();
  const closeCoachingLoop = useCloseCoachingLoop();

  // Filter signals based on search, level, and actionable toggle
  const filteredSignals = signals?.filter(signal => {
    const matchesSearch = searchTerm === "" || 
      signal.person.toLowerCase().includes(searchTerm.toLowerCase()) ||
      signal.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      signal.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const isActionable = onlyActionable ? (
      (signal.action_type === 'release' && signal.tenure_ok && signal.evidence_ok) ||
      (signal.action_type === 'coach' && !signal.coach_active) ||
      (signal.action_type === 'kudos')
    ) : true;
    
    return matchesSearch && isActionable;
  }) || [];

  const levelFilters = [
    { key: 'all', label: 'All', color: 'bg-muted text-muted-foreground' },
    { key: 'critical', label: 'Critical', color: 'bg-destructive/10 text-destructive border-destructive/20' },
    { key: 'risk', label: 'Risk', color: 'bg-warning/10 text-warning border-warning/20' },
    { key: 'warn', label: 'Warn', color: 'bg-warning/10 text-warning border-warning/20' },
    { key: 'info', label: 'Recovered', color: 'bg-success/10 text-success border-success/20' }
  ];

  function getBadgeVariant(level: string): "default" | "secondary" | "destructive" | "outline" {
    switch (level) {
      case 'critical': return 'destructive';
      case 'risk': return 'destructive';
      case 'warn': return 'default';
      case 'info': return 'secondary';
      default: return 'outline';
    }
  }

  function getBadgeColor(level: string): string {
    switch (level) {
      case 'critical': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'risk': return 'bg-warning/10 text-warning border-warning/20';
      case 'warn': return 'bg-warning/10 text-warning border-warning/20';
      case 'info': return 'bg-success/10 text-success border-success/20';
      default: return 'bg-muted text-muted-foreground border-muted';
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        description: "Reason copied to clipboard",
        duration: 2000,
      });
    });
  };

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    
    if (levelFilter && levelFilter !== 'all') {
      params.set('level', levelFilter);
    } else {
      params.delete('level');
    }
    
    if (sortMode !== 'priority') {
      params.set('sort', sortMode);
    } else {
      params.delete('sort');
    }
    
    const newUrl = params.toString() ? `${window.location.pathname}?${params}` : window.location.pathname;
    window.history.replaceState({}, '', newUrl);
  }, [levelFilter, sortMode]);

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center space-y-4">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto" />
          <div>
            <h3 className="text-lg font-semibold">Error Loading Signals</h3>
            <p className="text-muted-foreground">Failed to fetch signal data. Please try again.</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Filters Card */}
        <Card className="bg-gradient-card border-border shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              AI Signal Detection
            </CardTitle>
            
            {/* Filter chips and actionable toggle */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              {levelFilters.map(filter => (
                <button
                  key={filter.key}
                  onClick={() => setLevelFilter(filter.key)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                    levelFilter === filter.key 
                      ? filter.color 
                      : 'bg-transparent text-muted-foreground border-border hover:bg-accent'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
              <div className="ml-4 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="actionable-toggle"
                  checked={onlyActionable}
                  onChange={(e) => setOnlyActionable(e.target.checked)}
                  className="rounded border-border"
                />
                <label htmlFor="actionable-toggle" className="text-sm text-muted-foreground cursor-pointer">
                  Only actionable
                </label>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search by person name, reason, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>

              <Select value={sortMode} onValueChange={(value: 'ts_desc' | 'ts_asc' | 'priority') => setSortMode(value)}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="priority">Priority</SelectItem>
                  <SelectItem value="ts_desc">Newest first</SelectItem>
                  <SelectItem value="ts_asc">Oldest first</SelectItem>
                </SelectContent>
              </Select>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-auto justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "MMM dd") : "Start date"}
                    {startDate && endDate && " - "}
                    {endDate ? format(endDate, "MMM dd") : ""}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <div className="p-3 space-y-2">
                    <div className="font-medium text-sm">Start Date</div>
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      className="rounded-md border"
                    />
                    <div className="font-medium text-sm pt-2">End Date</div>
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      className="rounded-md border"
                    />
                  </div>
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
                  setOnlyActionable(false);
                }}
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Signals Table */}
        <Card className="bg-gradient-card border-border shadow-card">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="relative">
                  <div className="w-12 h-12 border-4 border-primary/20 rounded-full animate-spin"></div>
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">Processing signals...</h3>
                  <p className="text-sm text-muted-foreground">AI is analyzing the latest performance data</p>
                </div>
              </div>
            ) : filteredSignals && filteredSignals.length > 0 ? (
              <div>
                {/* Desktop Table View */}
                <div className="hidden lg:block">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="font-semibold text-foreground">Timestamp</TableHead>
                        <TableHead className="font-semibold text-foreground">Person</TableHead>
                        <TableHead className="font-semibold text-foreground">Level</TableHead>
                        <TableHead className="font-semibold text-foreground">Reason</TableHead>
                        <TableHead className="font-semibold text-foreground text-right">Score Delta</TableHead>
                        <TableHead className="font-semibold text-foreground text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSignals.map((signal) => (
                        <TableRow key={signal.id} className="hover:bg-muted/30 transition-colors">
                          <TableCell className="font-mono text-sm text-muted-foreground">
                            {format(new Date(signal.ts), "MMM dd, HH:mm")}
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
                            <div className="flex items-center gap-2">
                              <div className="truncate" title={signal.reason}>
                                {signal.reason}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(signal.reason)}
                                className="p-1 h-auto text-muted-foreground hover:text-foreground"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {signal.score_delta !== null && signal.score_delta !== 0 ? (
                              <span className={`text-sm font-semibold ${
                                signal.score_delta < 0 
                                  ? 'text-success' 
                                  : signal.level === 'critical' || signal.level === 'risk'
                                    ? 'text-destructive'
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
                            {/* Conditional buttons based on level */}
                            {['risk', 'critical'].includes((signal.level || '').toLowerCase()) ? (
                              <Button 
                                variant="outline"
                                size="sm"
                                className="shadow-soft transition-all duration-200 hover:shadow-dashboard hover:scale-105 bg-destructive/10 border-destructive/20 text-destructive hover:bg-destructive/20"
                                onClick={() => {
                                  setSelectedSignalId(signal.id);
                                  setSelectedPersonId(signal.person_id);
                                  setSelectedPersonName(signal.person);
                                  setSelectedSignalReason(signal.reason);
                                  setModalOpen(true);
                                }}
                              >
                                <UserCheck className="h-4 w-4 mr-2" />
                                Evaluate for Release
                              </Button>
                            ) : ['warn', 'warning'].includes((signal.level || '').toLowerCase()) ? (
                              <Button 
                                variant="outline"
                                size="sm"
                                className="shadow-soft transition-all duration-200 hover:shadow-dashboard hover:scale-105 bg-warning/10 border-warning/20 text-warning hover:bg-warning/20"
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
                            ) : (signal.level || '').toLowerCase() === 'info' ? (
                              <Button 
                                variant="outline"
                                size="sm"
                                className="shadow-soft hover:shadow-dashboard transition-all duration-200 hover:scale-105 bg-success/10 border-success/20 text-success hover:bg-success/20"
                                onClick={() => closeCoachingLoop.mutate({ personId: signal.person_id })}
                                disabled={closeCoachingLoop.isPending}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                {closeCoachingLoop.isPending ? 'Processing...' : 'Recognize & Close Loop'}
                              </Button>
                            ) : (
                              <Button 
                                variant="outline"
                                size="sm"
                                className="shadow-soft transition-all duration-200 hover:shadow-dashboard hover:scale-105 bg-destructive/10 border-destructive/20 text-destructive hover:bg-destructive/20"
                                onClick={() => {
                                  setSelectedSignalId(signal.id);
                                  setSelectedPersonId(signal.person_id);
                                  setSelectedPersonName(signal.person);
                                  setSelectedSignalReason(signal.reason);
                                  setModalOpen(true);
                                }}
                              >
                                <UserCheck className="h-4 w-4 mr-2" />
                                Evaluate for Release
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Card View */}
                <div className="lg:hidden p-4 space-y-4">
                  {filteredSignals.map((signal) => (
                    <Card 
                      key={signal.id} 
                      className="bg-card border-border hover:shadow-soft transition-shadow cursor-pointer"
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
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground font-mono">
                              {format(new Date(signal.ts), "MMM dd, HH:mm")}
                            </span>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Users className="w-3 h-3" />
                              <span>{signal.evidence_count} events</span>
                            </div>
                            {signal.coach_active && (
                              <Badge variant="outline" className="text-xs">
                                Coaching
                              </Badge>
                            )}
                          </div>
                          {signal.score_delta !== null && signal.score_delta !== 0 && (
                           <span className={`font-semibold ${
                             signal.score_delta < 0 
                               ? 'text-success' 
                               : signal.level === 'critical' || signal.level === 'risk'
                                 ? 'text-destructive'
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
                          {/* Evaluate for Release - Destructive - Critical/Risk levels */}
                          {['risk', 'critical'].includes((signal.level || '').toLowerCase()) && (
                            <Button 
                              variant="outline"
                              size="sm"
                              className="w-full shadow-soft transition-all duration-200 hover:shadow-dashboard bg-destructive/10 border-destructive/20 text-destructive hover:bg-destructive/20"
                              onClick={() => {
                                setSelectedSignalId(signal.id);
                                setSelectedPersonId(signal.person_id);
                                setSelectedPersonName(signal.person);
                                setSelectedSignalReason(signal.reason);
                                setModalOpen(true);
                              }}
                            >
                              <UserCheck className="h-4 w-4 mr-2" />
                              Evaluate for Release
                            </Button>
                          )}
                          
                          {/* Start Auto-Coach - Primary - Warn/Warning levels */}
                          {['warn', 'warning'].includes((signal.level || '').toLowerCase()) && (
                            <Button 
                              variant="outline"
                              size="sm"
                              className="w-full shadow-soft transition-all duration-200 hover:shadow-dashboard bg-primary/10 border-primary/20 text-primary hover:bg-primary/20"
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
                          
                          {/* Recognize & Close Loop - Success - Info level */}
                          {(signal.level || '').toLowerCase() === 'info' && (
                            <Button 
                              variant="outline"
                              size="sm"
                              className="w-full shadow-soft hover:shadow-dashboard transition-all duration-200 bg-success/10 border-success/20 text-success hover:bg-success/20"
                              onClick={() => closeCoachingLoop.mutate({ personId: signal.person_id })}
                              disabled={closeCoachingLoop.isPending}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              {closeCoachingLoop.isPending ? 'Processing...' : 'Recognize & Close Loop'}
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
                      setOnlyActionable(false);
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
          signalId={selectedSignalId}
          reason={selectedSignalReason}
        />
        
        <AutoCoachModal
          open={autoCoachOpen}
          onOpenChange={setAutoCoachOpen}
          personId={selectedPersonId}
          personName={selectedPersonName}
          reason={selectedSignalReason}
        />

        <EvidenceModal
          isOpen={evidenceOpen}
          onClose={() => setEvidenceOpen(false)}
          evidence={evidenceData}
          personName={selectedPersonName}
        />
      </div>
    </TooltipProvider>
  );
}