import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Bot, Send, Lightbulb, MessageCircle, Loader2 } from "lucide-react";

interface AdaCoachModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  personId: string;
  personName: string;
}

interface AdaResponse {
  reply: string;
  tips: string[];
  error?: string;
}

export const AdaCoachModal = ({ open, onOpenChange, personId, personName }: AdaCoachModalProps) => {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [adaResponse, setAdaResponse] = useState<AdaResponse | null>(null);

  const handleAskAda = async () => {
    if (!question.trim()) return;

    setLoading(true);
    try {
      // Fetch person context for Ada
      const { data: personData } = await supabase
        .from('person')
        .select('name, role, department')
        .eq('id', personId)
        .single();

      // Get recent signals for context
      const { data: signalsData } = await supabase
        .from('signal')
        .select('level, reason, score_delta, ts')
        .eq('person_id', personId)
        .order('ts', { ascending: false })
        .limit(5);

      // Get latest risk score
      const { data: riskData } = await supabase
        .from('risk_score')
        .select('score, calculated_at')
        .eq('person_id', personId)
        .order('calculated_at', { ascending: false })
        .limit(1);

      const devContext = {
        person: personData,
        recentSignals: signalsData,
        currentRisk: riskData?.[0],
        timestamp: new Date().toISOString()
      };

      const { data, error } = await supabase.functions.invoke('ada-coach', {
        body: {
          question: question.trim(),
          devContext
        }
      });

      if (error) throw error;

      setAdaResponse(data);
    } catch (error) {
      console.error('Error calling Ada coach:', error);
      setAdaResponse({
        reply: "I encountered an issue while processing your question. Please try again or use DevCoachBot.",
        tips: [
          "Check your internet connection",
          "Try rephrasing your question",
          "Use the DevCoachBot option as an alternative"
        ],
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setQuestion("");
    setAdaResponse(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Bot className="h-5 w-5 text-primary" />
            <span>Ada AI Coach</span>
          </DialogTitle>
          <DialogDescription>
            Ask Ada about signals, risk scores, and coaching strategies for {personName}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4">
          {/* Question Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Your Question</label>
            <div className="flex space-x-2">
              <Textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask Ada about this developer's signals, risk patterns, or coaching strategies..."
                className="flex-1 min-h-[80px]"
                disabled={loading}
              />
            </div>
            <Button 
              onClick={handleAskAda}
              disabled={!question.trim() || loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Ada is thinking...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Ask Ada
                </>
              )}
            </Button>
          </div>

          {/* Ada's Response */}
          {adaResponse && (
            <div className="space-y-4">
              <Card className="bg-gradient-card border-primary/20">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2 text-lg">
                    <MessageCircle className="h-5 w-5 text-primary" />
                    <span>Ada's Response</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-background/50 rounded-lg p-4">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {adaResponse.reply}
                    </p>
                  </div>

                  {adaResponse.tips && adaResponse.tips.length > 0 && (
                    <div>
                      <h4 className="flex items-center space-x-2 font-medium text-sm mb-2">
                        <Lightbulb className="h-4 w-4 text-warning" />
                        <span>Ada's Tips</span>
                      </h4>
                      <ul className="space-y-1">
                        {adaResponse.tips.map((tip, index) => (
                          <li key={index} className="text-sm text-muted-foreground flex items-start space-x-2">
                            <span className="text-primary mt-0.5">•</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {adaResponse.error && (
                    <div className="text-xs text-destructive bg-destructive/10 rounded p-2">
                      Technical details: {adaResponse.error}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Sample Questions */}
          {!adaResponse && !loading && (
            <Card className="bg-muted/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Sample Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    "What do the recent critical signals mean for this developer?",
                    "How should I interpret their risk score trend?",
                    "What coaching approach would be most effective?",
                    "Are there any patterns in their performance signals?"
                  ].map((sample, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      className="text-left justify-start h-auto py-2 px-3 text-xs"
                      onClick={() => setQuestion(sample)}
                      disabled={loading}
                    >
                      {sample}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={handleClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};