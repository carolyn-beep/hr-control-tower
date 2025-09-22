import HRHeader from "@/components/HRHeader";
import HRSidebar from "@/components/HRSidebar";
import HRDashboardCards from "@/components/HRDashboardCards";
import HREmployeeTable from "@/components/HREmployeeTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, TrendingUp, Users, Clock } from "lucide-react";
import heroImage from "@/assets/hr-hero.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <HRSidebar />
        
        <div className="flex-1">
          <HRHeader />
          
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
                  <h2 className="text-3xl font-bold mb-2">Welcome to HR Control Tower</h2>
                  <p className="text-lg opacity-90">Manage your workforce efficiently with our comprehensive HR platform</p>
                </div>
                <div className="flex space-x-3">
                  <Button variant="secondary" className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                    <Users className="mr-2 h-4 w-4" />
                    Add Employee
                  </Button>
                  <Button variant="secondary" className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                    <Calendar className="mr-2 h-4 w-4" />
                    Schedule Meeting
                  </Button>
                </div>
              </div>
            </div>

            {/* Dashboard Cards */}
            <HRDashboardCards />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Quick Actions */}
              <Card className="bg-gradient-card border-border shadow-card">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-foreground">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start bg-gradient-primary text-primary-foreground hover:opacity-90">
                    <Users className="mr-2 h-4 w-4" />
                    Add New Employee
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="mr-2 h-4 w-4" />
                    Schedule Interview
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Clock className="mr-2 h-4 w-4" />
                    Process Timesheet
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Generate Report
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Activities */}
              <Card className="lg:col-span-2 bg-gradient-card border-border shadow-card">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-foreground">Recent Activities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { action: "New employee onboarded", person: "Sarah Johnson", time: "2 hours ago", type: "success" },
                      { action: "Leave request submitted", person: "Michael Chen", time: "4 hours ago", type: "warning" },
                      { action: "Performance review completed", person: "Emma Williams", time: "1 day ago", type: "primary" },
                      { action: "Payroll processed", person: "HR System", time: "2 days ago", type: "success" }
                    ].map((activity, index) => (
                      <div key={index} className="flex items-center space-x-4 p-3 bg-accent rounded-lg">
                        <div className={`w-2 h-2 rounded-full ${
                          activity.type === 'success' ? 'bg-success' : 
                          activity.type === 'warning' ? 'bg-warning' : 'bg-primary'
                        }`}></div>
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{activity.action}</p>
                          <p className="text-sm text-muted-foreground">{activity.person} • {activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Employee Table */}
            <HREmployeeTable />
          </main>
        </div>
      </div>
    </div>
  );
};

export default Index;