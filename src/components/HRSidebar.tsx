import { 
  Users, 
  BarChart3, 
  Calendar, 
  FileText, 
  DollarSign, 
  Trophy,
  Clock,
  UserPlus
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navigationItems = [
  { icon: BarChart3, label: "Dashboard", active: true },
  { icon: Users, label: "Employees", badge: "156" },
  { icon: UserPlus, label: "Recruitment" },
  { icon: Calendar, label: "Time & Attendance" },
  { icon: DollarSign, label: "Payroll" },
  { icon: Trophy, label: "Performance" },
  { icon: FileText, label: "Documents" },
  { icon: Clock, label: "Leave Management" },
];

const HRSidebar = () => {
  return (
    <aside className="w-64 bg-card border-r border-border h-screen shadow-card">
      <div className="p-6">
        <nav className="space-y-2">
          {navigationItems.map((item, index) => (
            <Button
              key={index}
              variant={item.active ? "default" : "ghost"}
              className={`w-full justify-start ${
                item.active 
                  ? "bg-gradient-primary text-primary-foreground shadow-dashboard" 
                  : "hover:bg-accent"
              }`}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.label}
              {item.badge && (
                <span className="ml-auto bg-accent text-accent-foreground px-2 py-0.5 rounded-full text-xs">
                  {item.badge}
                </span>
              )}
            </Button>
          ))}
        </nav>
      </div>
      
      <div className="absolute bottom-6 left-6 right-6">
        <div className="bg-gradient-card p-4 rounded-lg border border-border">
          <h4 className="font-semibold text-foreground mb-2">Need help?</h4>
          <p className="text-sm text-muted-foreground mb-3">
            Contact our HR support team
          </p>
          <Button size="sm" className="w-full">
            Get Support
          </Button>
        </div>
      </div>
    </aside>
  );
};

export default HRSidebar;