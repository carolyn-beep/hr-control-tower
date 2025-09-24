import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Search, Bot, MessageSquare, UserCheck, AlertTriangle } from "lucide-react";

interface Person {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  risk_score?: number;
}

interface PersonSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPersonSelect: (person: Person, action: 'coach' | 'ada' | 'release') => void;
}

export const PersonSelectionModal = ({ open, onOpenChange, onPersonSelect }: PersonSelectionModalProps) => {
  const [people, setPeople] = useState<Person[]>([]);
  const [filteredPeople, setFilteredPeople] = useState<Person[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchPeople();
    }
  }, [open]);

  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = people.filter(person => 
        person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.department.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPeople(filtered);
    } else {
      setFilteredPeople(people);
    }
  }, [searchTerm, people]);

  const fetchPeople = async () => {
    setLoading(true);
    try {
      // Get people with their latest risk scores
      const { data: personsData, error: personsError } = await supabase
        .from('person')
        .select('id, name, email, role, department, status')
        .eq('status', 'active')
        .order('name');

      if (personsError) throw personsError;

      // Get risk scores for each person
      const peopleWithRisk: Person[] = [];
      for (const person of personsData || []) {
        const { data: riskData } = await supabase
          .from('risk_score')
          .select('score')
          .eq('person_id', person.id)
          .order('calculated_at', { ascending: false })
          .limit(1)
          .single();

        peopleWithRisk.push({
          ...person,
          risk_score: riskData?.score || 0
        });
      }

      setPeople(peopleWithRisk);
      setFilteredPeople(peopleWithRisk);
    } catch (error) {
      console.error('Error fetching people:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePersonAction = (person: Person, action: 'coach' | 'ada' | 'release') => {
    onPersonSelect(person, action);
    onOpenChange(false);
  };

  const getRiskBadgeColor = (riskScore: number) => {
    if (riskScore >= 8) return "bg-destructive/10 text-destructive border-destructive/20";
    if (riskScore >= 6) return "bg-warning/10 text-warning border-warning/20";
    if (riskScore >= 4) return "bg-primary/10 text-primary border-primary/20";
    return "bg-success/10 text-success border-success/20";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Select Person for Coaching</DialogTitle>
          <DialogDescription>
            Choose a team member to start coaching or evaluation
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, role, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* People List */}
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading team members...
            </div>
          ) : filteredPeople.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? 'No matching team members found' : 'No team members available'}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPeople.map((person) => (
                <div 
                  key={person.id}
                  className="border border-border rounded-lg p-4 space-y-3 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="" alt={person.name} />
                        <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                          {person.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium text-foreground">{person.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {person.role} • {person.department}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant="outline" 
                        className={getRiskBadgeColor(person.risk_score || 0)}
                      >
                        Risk: {(person.risk_score || 0).toFixed(1)}
                      </Badge>
                      
                      {(person.risk_score || 0) >= 6 && (
                        <AlertTriangle className="h-4 w-4 text-warning" />
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handlePersonAction(person, 'coach')}
                    >
                      <Bot className="h-3 w-3 mr-1" />
                      DevCoach
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handlePersonAction(person, 'ada')}
                    >
                      <MessageSquare className="h-3 w-3 mr-1" />
                      Ask Ada
                    </Button>
                    {(person.risk_score || 0) >= 6 && (
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handlePersonAction(person, 'release')}
                      >
                        <UserCheck className="h-3 w-3 mr-1" />
                        Evaluate
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};