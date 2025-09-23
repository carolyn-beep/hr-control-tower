import { Bell, Search, Settings, User, AlertTriangle, Command } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

const ManagerlessHeader = () => {
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <header className="bg-gradient-subtle border-b border-border px-6 py-4 shadow-soft backdrop-blur-sm sticky top-0 z-50">
      <div className="flex items-center justify-between animate-fade-in">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow animate-glow">
              <span className="text-primary-foreground font-bold text-sm">ML</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-text">Managerless HR</h1>
              <p className="text-xs text-muted-foreground">Control Tower</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4 flex-1 max-w-2xl ml-8">
          <div className={`relative flex-1 transition-all duration-300 ${searchFocused ? 'transform scale-105' : ''}`}>
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground transition-colors duration-200" />
            <Command className="absolute right-3 top-3 h-4 w-4 text-muted-foreground opacity-50" />
            <Input
              placeholder="Search signals, people, workflows... (⌘K)"
              className={`pl-10 pr-10 bg-background/80 border-border backdrop-blur-sm transition-all duration-300 ${
                searchFocused ? 'shadow-dashboard border-primary/50' : 'hover:shadow-soft'
              }`}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative hover-lift hover:bg-warning/10"
          >
            <AlertTriangle className="h-5 w-5 text-warning" />
            <Badge className="absolute -top-1 -right-1 w-5 h-5 text-xs bg-destructive text-destructive-foreground flex items-center justify-center p-0 animate-pulse">
              3
            </Badge>
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative hover-lift hover:bg-primary/10"
          >
            <Bell className="h-5 w-5 transition-transform duration-200 hover:scale-110" />
            <Badge className="absolute -top-1 -right-1 w-5 h-5 text-xs bg-primary text-primary-foreground flex items-center justify-center p-0 animate-bounce-in">
              8
            </Badge>
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="hover-lift transition-all duration-200 hover:bg-accent hover:rotate-90"
          >
            <Settings className="h-5 w-5" />
          </Button>
          
          <Button 
            variant="glass" 
            size="icon" 
            className="hover-lift shadow-soft hover:shadow-dashboard"
          >
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default ManagerlessHeader;