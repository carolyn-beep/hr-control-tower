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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col bg-gradient-to-br from-background via-background to-muted/30 border-primary/20 shadow-2xl">
        <DialogHeader className="relative">
          <div className="absolute -top-4 -right-4 w-32 h-32 bg-gradient-primary opacity-10 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute -bottom-2 -left-4 w-24 h-24 bg-gradient-to-r from-primary/10 to-transparent rounded-full blur-xl"></div>
          <DialogTitle className="flex items-center space-x-3 text-2xl font-bold relative z-10">
            <div className="p-2 rounded-xl bg-gradient-primary">
              <Bot className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Ask Ada - Your AI Development Assistant
            </span>
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground relative z-10">
            Get instant help with coding, debugging, best practices, and development workflows
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 relative">
          {/* Question Input */}
          <div className="space-y-4">
            <label className="text-base font-semibold text-foreground flex items-center space-x-2">
              <MessageCircle className="h-4 w-4 text-primary" />
              <span>What can Ada help you with?</span>
            </label>
            <div className="space-y-4">
              <div className="relative">
                <Textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ask about coding best practices, debugging techniques, performance optimization, architecture decisions, or any development challenge..."
                  className="min-h-[120px] resize-none border-2 border-primary/20 focus:border-primary/40 bg-gradient-to-br from-background to-muted/20 rounded-xl shadow-inner transition-all duration-300 text-sm leading-relaxed"
                  disabled={loading}
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-primary opacity-0 blur-sm transition-opacity duration-300 pointer-events-none" 
                     style={{ opacity: question.length > 0 ? '0.05' : '0' }} />
              </div>
              <Button 
                onClick={handleAskAda}
                disabled={!question.trim() || loading}
                className="w-full bg-gradient-primary hover:opacity-90 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] text-primary-foreground font-semibold"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                    <span>Ada is thinking...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5 mr-3" />
                    <span>Ask Ada</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Ada's Response */}
          {adaResponse && (
            <Card className="bg-gradient-to-br from-primary/5 via-background to-muted/10 border-2 border-primary/20 shadow-xl">
              <CardHeader className="pb-4 relative">
                <div className="absolute -top-2 -right-2 w-16 h-16 bg-gradient-primary opacity-10 rounded-full blur-xl"></div>
                <CardTitle className="flex items-center space-x-3 text-xl relative z-10">
                  <div className="p-2 rounded-lg bg-gradient-primary">
                    <MessageCircle className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <span className="bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent font-bold">
                    Ada's Response
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="bg-gradient-to-br from-background/80 to-muted/30 rounded-xl p-5 border border-primary/10 shadow-inner">
                  <p className="text-sm leading-7 whitespace-pre-wrap text-foreground/90">
                    {adaResponse.reply}
                  </p>
                </div>

                {adaResponse.tips && adaResponse.tips.length > 0 && (
                  <div className="bg-gradient-to-r from-warning/10 to-warning/5 rounded-xl p-4 border border-warning/20">
                    <h4 className="flex items-center space-x-2 font-semibold text-base mb-3">
                      <div className="p-1.5 rounded-lg bg-gradient-to-r from-warning to-warning/80">
                        <Lightbulb className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-warning-foreground">Pro Tips</span>
                    </h4>
                    <ul className="space-y-2">
                      {adaResponse.tips.map((tip, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-start space-x-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-gradient-primary mt-2.5 flex-shrink-0"></div>
                          <span className="leading-relaxed">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {adaResponse.error && (
                  <div className="text-xs text-destructive bg-gradient-to-r from-destructive/10 to-destructive/5 rounded-lg p-3 border border-destructive/20">
                    <span className="font-medium">Technical details:</span> {adaResponse.error}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Sample Questions */}
          {!adaResponse && !loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-gradient-to-br from-primary/5 to-primary/2 border-primary/20 hover:border-primary/30 transition-all duration-300 hover:shadow-lg group">
                <CardHeader className="pb-3 relative">
                  <div className="absolute -top-1 -right-1 w-8 h-8 bg-gradient-primary opacity-20 rounded-full blur-lg group-hover:opacity-30 transition-opacity"></div>
                  <CardTitle className="text-base flex items-center space-x-2 font-semibold relative z-10">
                    <div className="p-1.5 rounded-lg bg-gradient-primary">
                      <Code className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <span>Coding & Debugging</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[
                      "How do I debug a React component that's not re-rendering?",
                      "What are the best practices for error handling in async functions?",
                      "How can I optimize the performance of this code snippet?"
                    ].map((sample, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        size="sm"
                        className="text-left justify-start h-auto py-3 px-4 text-xs w-full hover:bg-primary/10 hover:text-foreground transition-all duration-200 rounded-lg border border-transparent hover:border-primary/20"
                        onClick={() => handleSampleQuestion(sample)}
                        disabled={loading}
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mr-3 flex-shrink-0"></div>
                        <span className="leading-relaxed">{sample}</span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-secondary/5 to-secondary/2 border-secondary/20 hover:border-secondary/30 transition-all duration-300 hover:shadow-lg group">
                <CardHeader className="pb-3 relative">
                  <div className="absolute -top-1 -right-1 w-8 h-8 bg-gradient-to-r from-secondary to-secondary/80 opacity-20 rounded-full blur-lg group-hover:opacity-30 transition-opacity"></div>
                  <CardTitle className="text-base flex items-center space-x-2 font-semibold relative z-10">
                    <div className="p-1.5 rounded-lg bg-gradient-to-r from-secondary to-secondary/80">
                      <BookOpen className="h-4 w-4 text-secondary-foreground" />
                    </div>
                    <span>Architecture & Best Practices</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[
                      "What's the difference between useState and useReducer?",
                      "How should I structure my React components for scalability?",
                      "When should I use custom hooks vs regular functions?"
                    ].map((sample, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        size="sm"
                        className="text-left justify-start h-auto py-3 px-4 text-xs w-full hover:bg-secondary/10 hover:text-foreground transition-all duration-200 rounded-lg border border-transparent hover:border-secondary/20"
                        onClick={() => handleSampleQuestion(sample)}
                        disabled={loading}
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-secondary mr-3 flex-shrink-0"></div>
                        <span className="leading-relaxed">{sample}</span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Ada Capabilities */}
          {!adaResponse && !loading && (
            <Card className="bg-gradient-to-r from-primary/8 via-primary/5 to-primary/8 border-2 border-primary/20 shadow-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-pulse"></div>
              <CardContent className="pt-6 relative z-10">
                <div className="flex items-start space-x-4">
                  <div className="p-3 rounded-xl bg-gradient-primary shadow-lg">
                    <Zap className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-lg mb-3 text-foreground">Ada can help you with:</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[
                        "Code review and optimization suggestions",
                        "Debugging complex issues and error patterns", 
                        "Best practices for React, TypeScript, and web development",
                        "Architecture decisions and design patterns",
                        "Performance optimization techniques",
                        "Learning new technologies and frameworks"
                      ].map((capability, index) => (
                        <div key={index} className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <div className="w-1.5 h-1.5 rounded-full bg-gradient-primary flex-shrink-0"></div>
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

        <div className="flex justify-end space-x-3 pt-6 border-t border-primary/10">
          <Button 
            variant="outline" 
            onClick={handleClose}
            className="hover:bg-muted/50 transition-all duration-200"
          >
            Close
          </Button>
          {adaResponse && (
            <Button 
              onClick={() => {
                setAdaResponse(null);
                setQuestion("");
              }}
              className="bg-gradient-primary hover:opacity-90 text-primary-foreground transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Ask Another Question
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};