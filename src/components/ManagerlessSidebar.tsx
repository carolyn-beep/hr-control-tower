import { 
  BarChart3, 
  Users, 
  Activity, 
  GitBranch,
  AlertTriangle,
  Bot,
  Zap,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavLink, useLocation } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

const navigationItems = [
  { icon: BarChart3, label: "Dashboard", path: "/", description: "Overview & Analytics" },
  { icon: Activity, label: "Signals", path: "/signals", badge: "12", description: "Risk Detection" },
  { icon: Users, label: "People", path: "/people", description: "Team Members" },
  { icon: GitBranch, label: "Workflows", path: "/workflows", badge: "4", description: "Automation" },
];

const ManagerlessSidebar = () => {
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  return (
    <aside className="w-72 bg-gradient-subtle border-r border-border h-screen shadow-dashboard backdrop-blur-sm">
      <div className="p-6 animate-slide-up">
        {/* Logo Section */}
        <div className="mb-8 p-4 bg-gradient-accent rounded-xl border border-border/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow">
              <span className="text-primary-foreground font-bold text-sm">CO</span>
            </div>
            <div>
              <h2 className="font-bold text-foreground">Managerless</h2>
              <p className="text-xs text-muted-foreground">HR Platform</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-2 mb-8">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Navigation</p>
          {navigationItems.map((item, index) => (
            <Button
              key={index}
              asChild
              variant={location.pathname === item.path ? "gradient" : "ghost"}
              className={`w-full justify-start group relative transition-all duration-300 hover:translate-x-1 ${
                location.pathname === item.path
                  ? "shadow-glow" 
                  : "hover:bg-accent hover:shadow-soft"
              } h-12`}
              onMouseEnter={() => setHoveredItem(item.path)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <NavLink to={item.path} className="flex items-center">
                <item.icon className={`mr-3 h-5 w-5 transition-all duration-200 ${
                  location.pathname === item.path ? 'text-primary-foreground' : 'group-hover:scale-110'
                }`} />
                <div className="flex-1 text-left">
                  <div className={`font-medium ${location.pathname === item.path ? 'text-primary-foreground' : ''}`}>
                    {item.label}
                  </div>
                  <div className={`text-xs transition-opacity duration-200 ${
                    hoveredItem === item.path || location.pathname === item.path 
                      ? 'opacity-100' : 'opacity-0'
                  } ${location.pathname === item.path ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                    {item.description}
                  </div>
                </div>
                {item.badge && (
                  <Badge className="bg-destructive text-destructive-foreground text-xs animate-pulse ml-2">
                    {item.badge}
                  </Badge>
                )}
                <ChevronRight className={`h-4 w-4 ml-auto transition-all duration-200 ${
                  location.pathname === item.path 
                    ? 'opacity-100 text-primary-foreground' 
                    : 'opacity-0 group-hover:opacity-100'
                }`} />
              </NavLink>
            </Button>
          ))}
        </nav>

        {/* AI Status Section */}
        <div className="space-y-4">
          <div className="border-t border-border pt-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">AI Systems</h4>
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-success rounded-full animate-pulse delay-150"></div>
                <div className="w-2 h-2 bg-success rounded-full animate-pulse delay-300"></div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="group p-3 bg-gradient-accent rounded-lg hover:shadow-soft transition-all duration-200 hover:scale-105 interactive-card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-foreground">Auto-Coach</span>
                      <div className="text-xs text-muted-foreground">Active Learning</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                    <span className="text-xs text-success font-semibold">Online</span>
                  </div>
                </div>
              </div>
              
              <div className="group p-3 bg-gradient-accent rounded-lg hover:shadow-soft transition-all duration-200 hover:scale-105 interactive-card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-warning/10 rounded-lg group-hover:bg-warning/20 transition-colors">
                      <Zap className="h-4 w-4 text-warning" />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-foreground">Risk Engine</span>
                      <div className="text-xs text-muted-foreground">Processing Signals</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                    <span className="text-xs text-success font-semibold">Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default ManagerlessSidebar;