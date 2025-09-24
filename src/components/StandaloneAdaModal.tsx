import { useState } from "react";
import { Button } from "@/components/ui/button";
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
import { Bot, Send, Lightbulb, MessageCircle, Loader2, Code, BookOpen, Zap } from "lucide-react";

interface AdaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface AdaResponse {
  reply: string;
  tips: string[];
  error?: string;
}

export const StandaloneAdaModal = ({ open, onOpenChange }: AdaModalProps) => {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [adaResponse, setAdaResponse] = useState<AdaResponse | null>(null);

  const handleAskAda = async () => {
    if (!question.trim()) return;

    setLoading(true);
    try {
      // Call Ada without specific person context for general development help
      const { data, error } = await supabase.functions.invoke('ada-coach', {
        body: {
          question: question.trim(),
          devContext: {
            type: 'general_learning',
            timestamp: new Date().toISOString()
          }
        }
      });

      if (error) throw error;

      setAdaResponse(data);
    } catch (error) {
      console.error('Error calling Ada:', error);
      setAdaResponse({
        reply: "I'm having trouble connecting right now. Please try again in a moment, or feel free to ask me about coding best practices, debugging techniques, or development workflows!",
        tips: [
          "Check your internet connection",
          "Try rephrasing your question",
          "Ask about specific programming concepts or debugging strategies"
        ],
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSampleQuestion = (sample: string) => {
    setQuestion(sample);
  };

  const handleClose = () => {
    setQuestion("");
    setAdaResponse(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col bg-gradient-card border-2 border-primary/20 shadow-dashboard">
        <DialogHeader className="relative">
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-primary opacity-20 rounded-full blur-2xl animate-pulse"></div>
          <DialogTitle className="flex items-center space-x-3 text-xl font-bold relative z-10">
            <div className="p-2 rounded-lg bg-primary">
              <Bot className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-foreground">
              Ask Ada - Your AI Development Assistant
            </span>
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground relative z-10">
            Get instant help with coding, debugging, best practices, and development workflows
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 relative">
          {/* Question Input */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground flex items-center space-x-2">
              <MessageCircle className="h-4 w-4 text-primary" />
              <span>What can Ada help you with?</span>
            </label>
            <div className="space-y-3">
              <Textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask about coding best practices, debugging techniques, performance optimization, architecture decisions, or any development challenge..."
                className="min-h-[100px] resize-none border border-border bg-background rounded-lg transition-all duration-200 text-sm"
                disabled={loading}
              />
              <Button 
                onClick={handleAskAda}
                disabled={!question.trim() || loading}
                className="w-full bg-primary text-primary-foreground hover:opacity-90 transition-all duration-200"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    <span>Ada is thinking...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    <span>Ask Ada</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Ada's Response */}
          {adaResponse && (
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <div className="p-2 rounded-lg bg-primary">
                    <MessageCircle className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <span className="text-foreground">
                    Ada's Response
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-accent/50 rounded-lg p-4 border border-border">
                  <p className="text-sm leading-6 whitespace-pre-wrap text-foreground">
                    {adaResponse.reply}
                  </p>
                </div>

                {adaResponse.tips && adaResponse.tips.length > 0 && (
                  <div className="bg-accent rounded-lg p-4 border border-border">
                    <h4 className="flex items-center space-x-2 font-medium text-sm mb-3">
                      <div className="p-1.5 rounded-lg bg-warning">
                        <Lightbulb className="h-3 w-3 text-warning-foreground" />
                      </div>
                      <span className="text-foreground">Pro Tips</span>
                    </h4>
                    <ul className="space-y-2">
                      {adaResponse.tips.map((tip, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-start space-x-2">
                          <div className="w-1 h-1 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {adaResponse.error && (
                  <div className="text-xs text-destructive bg-accent rounded-lg p-3 border border-destructive/20">
                    <span className="font-medium">Technical details:</span> {adaResponse.error}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Sample Questions */}
          {!adaResponse && !loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-card border-border hover:shadow-soft transition-all duration-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center space-x-2 font-medium">
                    <div className="p-1.5 rounded-lg bg-primary">
                      <Code className="h-3 w-3 text-primary-foreground" />
                    </div>
                    <span>Coding & Debugging</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {[
                      "How do I debug a React component that's not re-rendering?",
                      "What are the best practices for error handling in async functions?",
                      "How can I optimize the performance of this code snippet?"
                    ].map((sample, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        size="sm"
                        className="text-left justify-start h-auto py-2 px-3 text-xs w-full whitespace-normal break-words hover:bg-accent"
                        onClick={() => handleSampleQuestion(sample)}
                        disabled={loading}
                      >
                        <div className="w-1 h-1 rounded-full bg-primary mr-2 flex-shrink-0"></div>
                        <span>{sample}</span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border hover:shadow-soft transition-all duration-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center space-x-2 font-medium">
                    <div className="p-1.5 rounded-lg bg-secondary">
                      <BookOpen className="h-3 w-3 text-secondary-foreground" />
                    </div>
                    <span>Architecture & Best Practices</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {[
                      "What's the difference between useState and useReducer?",
                      "How should I structure my React components for scalability?",
                      "When should I use custom hooks vs regular functions?"
                    ].map((sample, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        size="sm"
                        className="text-left justify-start h-auto py-2 px-3 text-xs w-full whitespace-normal break-words hover:bg-accent"
                        onClick={() => handleSampleQuestion(sample)}
                        disabled={loading}
                      >
                        <div className="w-1 h-1 rounded-full bg-secondary mr-2 flex-shrink-0"></div>
                        <span>{sample}</span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Ada Capabilities */}
          {!adaResponse && !loading && (
            <Card className="bg-accent border-border">
              <CardContent className="pt-4">
                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-lg bg-primary">
                    <Zap className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm mb-2 text-foreground">Ada can help you with:</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-muted-foreground">
                      {[
                        "Code review and optimization suggestions",
                        "Debugging complex issues and error patterns", 
                        "Best practices for React, TypeScript, and web development",
                        "Architecture decisions and design patterns",
                        "Performance optimization techniques",
                        "Learning new technologies and frameworks"
                      ].map((capability, index) => (
                        <div key={index} className="flex items-center space-x-1">
                          <div className="w-1 h-1 rounded-full bg-primary flex-shrink-0"></div>
                          <span>{capability}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t border-border">
          <Button 
            variant="outline" 
            onClick={handleClose}
          >
            Close
          </Button>
          {adaResponse && (
            <Button 
              onClick={() => {
                setAdaResponse(null);
                setQuestion("");
              }}
              className="bg-primary text-primary-foreground hover:opacity-90"
            >
              Ask Another Question
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};