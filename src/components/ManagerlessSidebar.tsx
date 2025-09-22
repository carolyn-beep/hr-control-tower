import { 
  BarChart3, 
  Users, 
  Activity, 
  GitBranch,
  AlertTriangle,
  TrendingUp,
  Bot,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavLink, useLocation } from "react-router-dom";

const navigationItems = [
  { icon: BarChart3, label: "Control Tower", path: "/" },
  { icon: Activity, label: "Signals", path: "/signals", badge: "12" },
  { icon: Users, label: "People", path: "/people" },
  { icon: GitBranch, label: "Workflows", path: "/workflows", badge: "4" },
];

const ManagerlessSidebar = () => {
  const location = useLocation();

  return (
    <aside className="w-64 bg-card border-r border-border h-screen shadow-card">
      <div className="p-6">
        <nav className="space-y-2">
          {navigationItems.map((item, index) => (
            <NavLink key={index} to={item.path}>
              <Button
                variant={location.pathname === item.path ? "default" : "ghost"}
                className={`w-full justify-start ${
                  location.pathname === item.path
                    ? "bg-gradient-primary text-primary-foreground shadow-dashboard" 
                    : "hover:bg-accent"
                }`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.label}
                {item.badge && (
                  <span className="ml-auto bg-destructive text-destructive-foreground px-2 py-0.5 rounded-full text-xs font-semibold">
                    {item.badge}
                  </span>
                )}
              </Button>
            </NavLink>
          ))}
        </nav>

        <div className="mt-8 space-y-4">
          <div className="border-t border-border pt-4">
            <h4 className="text-sm font-semibold text-muted-foreground mb-3">AI AUTOMATION</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-accent rounded-md">
                <div className="flex items-center space-x-2">
                  <Bot className="h-4 w-4 text-primary" />
                  <span className="text-sm text-foreground">Auto-Coach</span>
                </div>
                <div className="w-2 h-2 bg-success rounded-full"></div>
              </div>
              <div className="flex items-center justify-between p-2 bg-accent rounded-md">
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-warning" />
                  <span className="text-sm text-foreground">Risk Engine</span>
                </div>
                <div className="w-2 h-2 bg-success rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-6 left-6 right-6">
        <div className="bg-gradient-card p-4 rounded-lg border border-border">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="h-4 w-4 text-success" />
            <h4 className="font-semibold text-foreground">System Health</h4>
          </div>
          <p className="text-sm text-success mb-3">
            All systems operational
          </p>
          <Button size="sm" variant="outline" className="w-full">
            View Details
          </Button>
        </div>
      </div>
    </aside>
  );
};

export default ManagerlessSidebar;