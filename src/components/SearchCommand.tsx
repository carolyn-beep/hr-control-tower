import React, { useState, useEffect } from "react";
import { Search, User, AlertTriangle, TrendingUp, FileText } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useSignalsData } from "@/hooks/useSignalsData";

interface SearchCommandProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const SearchCommand: React.FC<SearchCommandProps> = ({ open, setOpen }) => {
  const navigate = useNavigate();
  const { data: signals } = useSignalsData();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(!open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, setOpen]);

  // Get unique people from signals
  const people = signals ? Array.from(
    new Map(
      signals.map(signal => [
        signal.person_id,
        { id: signal.person_id, name: signal.person, email: signal.email }
      ])
    ).values()
  ) : [];

  const handleSelect = (value: string) => {
    if (value.startsWith('signal-')) {
      navigate('/signals');
    } else if (value.startsWith('person-')) {
      navigate('/people');
    } else if (value.startsWith('workflow-')) {
      navigate('/workflows');
    } else if (value.startsWith('page-')) {
      const page = value.replace('page-', '');
      navigate(`/${page}`);
    }
    setOpen(false);
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'risk':
        return <TrendingUp className="h-4 w-4 text-warning" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <FileText className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'critical':
        return 'bg-destructive text-destructive-foreground';
      case 'risk':
        return 'bg-warning text-warning-foreground';
      case 'warning':
        return 'bg-yellow-500 text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search signals, people, workflows..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        <CommandGroup heading="Pages">
          <CommandItem
            value="page-"
            onSelect={() => handleSelect('page-')}
          >
            <FileText className="mr-2 h-4 w-4" />
            <span>Control Tower</span>
          </CommandItem>
          <CommandItem
            value="page-signals"
            onSelect={() => handleSelect('page-signals')}
          >
            <AlertTriangle className="mr-2 h-4 w-4" />
            <span>Signals</span>
          </CommandItem>
          <CommandItem
            value="page-people"
            onSelect={() => handleSelect('page-people')}
          >
            <User className="mr-2 h-4 w-4" />
            <span>People</span>
          </CommandItem>
          <CommandItem
            value="page-workflows"
            onSelect={() => handleSelect('page-workflows')}
          >
            <TrendingUp className="mr-2 h-4 w-4" />
            <span>Workflows</span>
          </CommandItem>
        </CommandGroup>

        {people.length > 0 && (
          <CommandGroup heading="People">
            {people.slice(0, 5).map((person: any) => (
              <CommandItem
                key={`person-${person.id}`}
                value={`person-${person.id} ${person.name} ${person.email}`}
                onSelect={() => handleSelect(`person-${person.id}`)}
              >
                <User className="mr-2 h-4 w-4" />
                <div className="flex flex-col">
                  <span>{person.name}</span>
                  <span className="text-xs text-muted-foreground">{person.email}</span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {signals && signals.length > 0 && (
          <CommandGroup heading="Recent Signals">
            {signals.slice(0, 8).map((signal) => (
              <CommandItem
                key={`signal-${signal.id}`}
                value={`signal-${signal.id} ${signal.reason} ${signal.person}`}
                onSelect={() => handleSelect(`signal-${signal.id}`)}
              >
                {getLevelIcon(signal.level)}
                <div className="ml-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate">{signal.reason}</span>
                    <Badge variant="outline" className={`text-xs ${getLevelColor(signal.level)}`}>
                      {signal.level}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">{signal.person}</span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        <CommandGroup heading="Workflows">
          <CommandItem
            value="workflow-coaching"
            onSelect={() => handleSelect('workflow-coaching')}
          >
            <TrendingUp className="mr-2 h-4 w-4" />
            <span>Auto-Coach</span>
          </CommandItem>
          <CommandItem
            value="workflow-release"
            onSelect={() => handleSelect('workflow-release')}
          >
            <AlertTriangle className="mr-2 h-4 w-4" />
            <span>Release Evaluation</span>
          </CommandItem>
          <CommandItem
            value="workflow-recognition"
            onSelect={() => handleSelect('workflow-recognition')}
          >
            <User className="mr-2 h-4 w-4" />
            <span>Recognition & Close Loop</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};

export default SearchCommand;