import { TrendingUp, TrendingDown, Users, UserPlus, Clock, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const dashboardMetrics = [
  {
    title: "Total Employees",
    value: "1,247",
    change: "+12%",
    trend: "up",
    icon: Users,
    color: "text-primary",
  },
  {
    title: "New Hires (Month)",
    value: "24",
    change: "+8%", 
    trend: "up",
    icon: UserPlus,
    color: "text-success",
  },
  {
    title: "Attendance Rate",
    value: "94.2%",
    change: "-2.1%",
    trend: "down",
    icon: Clock,
    color: "text-warning",
  },
  {
    title: "Payroll (Month)",
    value: "$2.8M",
    change: "+5.2%",
    trend: "up", 
    icon: DollarSign,
    color: "text-primary",
  },
];

const HRDashboardCards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {dashboardMetrics.map((metric, index) => (
        <Card key={index} className="bg-gradient-card border-border shadow-card hover:shadow-dashboard transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {metric.title}
            </CardTitle>
            <metric.icon className={`h-5 w-5 ${metric.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{metric.value}</div>
            <div className="flex items-center mt-2">
              {metric.trend === "up" ? (
                <TrendingUp className="h-4 w-4 text-success mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-destructive mr-1" />
              )}
              <span 
                className={`text-sm ${
                  metric.trend === "up" ? "text-success" : "text-destructive"
                }`}
              >
                {metric.change}
              </span>
              <span className="text-sm text-muted-foreground ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default HRDashboardCards;