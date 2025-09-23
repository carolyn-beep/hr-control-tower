import ManagerlessHeader from "@/components/ManagerlessHeader";
import ManagerlessSidebar from "@/components/ManagerlessSidebar";
import SignalsTable from "@/components/SignalsTable";
import { Card, CardContent } from "@/components/ui/card";
import { 
  AlertTriangle, 
  TrendingDown, 
  Users, 
  Clock
} from "lucide-react";

const Signals = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <div className="hidden lg:block">
          <ManagerlessSidebar />
        </div>
        
        <div className="flex-1 min-w-0">
          <ManagerlessHeader />
          
          <main className="p-3 sm:p-4 lg:p-6">
            {/* Header */}
            <div className="mb-6 lg:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Signal Detection</h1>
              <p className="text-sm sm:text-base text-muted-foreground">AI-powered risk signals and automated interventions</p>
            </div>

            {/* Signals Summary */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 lg:mb-8">
              <Card className="bg-gradient-card border-border shadow-card">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">Critical Signals</p>
                      <p className="text-xl sm:text-2xl font-bold text-destructive">1</p>
                    </div>
                    <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 text-destructive" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-card border-border shadow-card">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">High Priority</p>
                      <p className="text-xl sm:text-2xl font-bold text-warning">2</p>
                    </div>
                    <TrendingDown className="h-6 w-6 sm:h-8 sm:w-8 text-warning" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-card border-border shadow-card">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">Active Monitoring</p>
                      <p className="text-xl sm:text-2xl font-bold text-primary">2</p>
                    </div>
                    <Users className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-card border-border shadow-card">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">Avg. Response</p>
                      <p className="text-xl sm:text-2xl font-bold text-success">2.3h</p>
                    </div>
                    <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-success" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Signals Table */}
            <SignalsTable />
          </main>
        </div>
      </div>
    </div>
  );
};

export default Signals;