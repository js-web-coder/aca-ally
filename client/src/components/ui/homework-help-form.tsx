import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getPreferredAIForSubject, getIntegratedHomeworkHelp } from "@/lib/homeworkHelpService";

const SUBJECTS = [
  "Math",
  "Physics",
  "Chemistry",
  "Biology",
  "Computer Science",
  "History",
  "Literature",
  "Economics",
  "Psychology",
  "Philosophy",
  "Geography",
  "Political Science",
  "Statistics",
  "Foreign Languages",
  "Art History",
  "Music Theory",
  "Other"
];

interface HomeworkHelpFormProps {
  onResponseReceived?: (response: string) => void;
  className?: string;
}

export function HomeworkHelpForm({ onResponseReceived, className = "" }: HomeworkHelpFormProps) {
  const [subject, setSubject] = useState<string>("");
  const [question, setQuestion] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<string>("");
  const [aiSource, setAiSource] = useState<string>("");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subject) {
      toast({
        title: "Subject required",
        description: "Please select a subject for your question.",
        variant: "destructive",
      });
      return;
    }
    
    if (!question.trim()) {
      toast({
        title: "Question required",
        description: "Please enter your homework question.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    setResponse("");
    setAiSource("");
    
    try {
      // Show recommended AI model based on subject
      const preferredAI = getPreferredAIForSubject(subject);
      toast({
        title: `Using ${preferredAI} for ${subject}`,
        description: `${preferredAI} is selected as the best AI for this subject.`,
      });
      
      // Get response from our integrated service
      const result = await getIntegratedHomeworkHelp(subject, question);
      
      // Update UI with response
      setResponse(result.assistantMessage.content);
      setAiSource(result.assistantMessage.source || "AI");
      
      // Callback for parent component if needed
      if (onResponseReceived) {
        onResponseReceived(result.assistantMessage.content);
      }
    } catch (error) {
      console.error("Error getting homework help:", error);
      toast({
        title: "Error",
        description: "Failed to get homework help. Please try again.",
        variant: "destructive",
      });
      
      setResponse("I'm having trouble processing your question right now. Please try again in a moment.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center">
          <BookOpen className="h-5 w-5 text-primary mr-2" />
          <CardTitle>Homework Help</CardTitle>
        </div>
        <CardDescription>
          Get step-by-step guidance on any academic subject
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="subject" className="text-sm font-medium">
              Subject
            </label>
            <Select 
              value={subject} 
              onValueChange={setSubject}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a subject" />
              </SelectTrigger>
              <SelectContent>
                {SUBJECTS.map((subj) => (
                  <SelectItem key={subj} value={subj}>
                    {subj}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="question" className="text-sm font-medium">
              Your Question
            </label>
            <Textarea
              id="question"
              placeholder="Enter your homework question here..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full"
            disabled={isLoading || !subject || !question.trim()}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Getting help...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Get Help
              </>
            )}
          </Button>
        </form>
        
        {response && (
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Answer</h3>
              {aiSource && (
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                  Powered by {aiSource}
                </span>
              )}
            </div>
            <div className="text-sm whitespace-pre-wrap">
              {response}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}