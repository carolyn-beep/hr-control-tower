import { useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Filter, Loader2 } from "lucide-react";
import { useSignalsData } from "@/hooks/useSignalsData";
import { cn } from "@/lib/utils";

const SignalsTable = () => {
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  const { data: signals, isLoading, error } = useSignalsData({
    levelFilter: levelFilter,
    startDate: startDate?.toISOString(),
    endDate: endDate?.toISOString()
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
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading signals...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-destructive">
              Failed to load signals. Please try again.
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {signals.map((signal) => (
                  <TableRow key={signal.id}>
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No signals found matching the current filters.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SignalsTable;