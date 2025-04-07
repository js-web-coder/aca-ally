import { useState, useEffect, useRef } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { sendChatMessage, getChatHistory } from "@/lib/openai";
import { sendPerplexityMessage } from "@/lib/perplexityService";
import { sendGeminiMessage } from "@/lib/geminiService";
import { Bot, Send, User, Loader2, ExternalLink, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Define component props for ReactMarkdown
const markdownComponents = {
  // Add any custom component renderers here if needed
};

interface AIChatWidgetProps {
  minimal?: boolean;
  className?: string;
}

interface Message {
  id: number;
  userId: number;
  message: string;
  isUser: boolean;
  createdAt: string;
}

export function AIChatWidget({ minimal = false, className = "" }: AIChatWidgetProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages only when needed
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Only scroll on new messages, not on page load
    if (messages.length > 0 && isLoading === false) {
      // Get the last message
      const lastMessage = messages[messages.length - 1];
      
      // Check if this is a new message (less than 2 seconds old)
      const isNewMessage = new Date().getTime() - new Date(lastMessage.createdAt).getTime() < 2000;
      
      // Only scroll if it's a new message
      if (isNewMessage) {
        scrollToBottom();
      }
    }
  }, [messages, isLoading]);

  // Load chat history on component mount
  useEffect(() => {
    if (user || minimal) {
      loadChatHistory();
    } else {
      setIsLoadingHistory(false);
    }
  }, [user, minimal]);

  // Load chat history from server or local storage
  const loadChatHistory = async () => {
    if (!user && !minimal) return;
    
    setIsLoadingHistory(true);
    try {
      const history = await getChatHistory();
      
      // Convert to UI message format
      const uiMessages = history.map(msg => ({
        id: parseInt(msg.id.toString()),
        userId: msg.userId,
        message: msg.content,
        isUser: msg.role === 'user',
        createdAt: msg.createdAt
      }));
      
      setMessages(minimal ? uiMessages.slice(-3) : uiMessages);
    } catch (error) {
      console.error('Error loading chat history:', error);
      if (!minimal) {
        toast({
          title: 'Failed to load chat history',
          description: 'Please try again later.',
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputMessage.trim()) return;
    
    if (!user && !minimal) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to use the AI chat feature.',
        variant: 'destructive',
      });
      return;
    }
    
    // Create user message for UI
    const userMessage: Message = {
      id: Date.now(),
      userId: user?.id || 0,
      message: inputMessage,
      isUser: true,
      createdAt: new Date().toISOString(),
    };
    
    // Add message to UI immediately for better UX
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    
    try {
      if (minimal && !user) {
        // For minimal widget without auth, just add a simulated response
        setTimeout(() => {
          const aiResponse: Message = {
            id: Date.now() + 1,
            userId: 0,
            message: "I'd be happy to help! For more detailed assistance, please sign in to your account.",
            isUser: false,
            createdAt: new Date().toISOString(),
          };
          setMessages(prev => [...prev, aiResponse]);
          setIsLoading(false);
        }, 1000);
        return;
      }
      
      // Variables to store the response
      let responseMessage = "";
      let responseId = Date.now() + 1;
      let responseDate = new Date().toISOString();
      let responseSource = "OpenAI";
      
      const systemInstruction = "You are a helpful educational AI assistant. Provide clear, accurate, and informative responses to help students learn and understand academic concepts.";
      
      // Try Gemini API first
      try {
        const geminiResponse = await sendGeminiMessage(inputMessage, systemInstruction);
        
        responseMessage = geminiResponse.assistantMessage.content;
        responseId = parseInt(geminiResponse.assistantMessage.id);
        responseDate = geminiResponse.assistantMessage.createdAt;
        responseSource = "Gemini";
      } catch (geminiError) {
        console.warn('Gemini API failed, falling back to Perplexity:', geminiError);
        
        // If Gemini fails, try Perplexity API
        try {
          const perplexityResponse = await sendPerplexityMessage(inputMessage, systemInstruction);
          
          responseMessage = perplexityResponse.assistantMessage.content;
          responseId = parseInt(perplexityResponse.assistantMessage.id);
          responseDate = perplexityResponse.assistantMessage.createdAt;
          responseSource = "Perplexity";
        } catch (perplexityError) {
          // If Perplexity fails, fall back to OpenAI
          console.warn('Perplexity API failed, falling back to OpenAI:', perplexityError);
          
          const openaiResponse = await sendChatMessage(inputMessage);
          responseMessage = openaiResponse.assistantMessage.content;
          responseId = parseInt(openaiResponse.assistantMessage.id);
          responseDate = openaiResponse.assistantMessage.createdAt;
        }
      }
      
      // Create assistant message with source attribution
      const assistantMessage: Message = {
        id: responseId,
        userId: user?.id || 0,
        message: responseSource === "Perplexity" 
          ? `${responseMessage}\n\n(Powered by Perplexity AI)` 
          : responseSource === "Gemini"
            ? `${responseMessage}\n\n(Powered by Google Gemini)`
            : responseMessage,
        isUser: false,
        createdAt: responseDate
      };
      
      // Update UI with assistant's response
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Failed to send message',
        description: 'Please try again later.',
        variant: 'destructive',
      });
      
      // Add error message to chat
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          userId: user?.id || 0,
          message: "I'm having trouble connecting to my knowledge base right now. Please try again later.",
          isUser: false,
          createdAt: new Date().toISOString(),
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (minimal) {
    return (
      <Card className={`shadow-sm border ${className}`}>
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-primary">
              <Bot className="h-5 w-5 mr-2" />
              <CardTitle className="text-lg">AI Study Assistant</CardTitle>
            </div>
            {!user && (
              <Button variant="ghost" size="sm" asChild>
                <a href="/chat" className="text-primary text-sm flex items-center">
                  <span>Full Chat</span>
                  <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </Button>
            )}
            {user && (
              <Button variant="ghost" size="sm" asChild>
                <a href="/chat" className="text-primary text-sm">Full Chat</a>
              </Button>
            )}
          </div>
          <CardDescription>
            Ask a question to get homework help or clarify concepts.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div 
            ref={chatContainerRef}
            className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 max-h-40 overflow-y-auto mb-3"
          >
            {isLoadingHistory ? (
              <div className="flex justify-center p-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              messages.slice(-3).map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex items-start gap-2 mb-2 ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!msg.isUser && <Bot className="h-4 w-4 text-gray-500 flex-shrink-0" />}
                  <div 
                    className={`text-sm p-2 rounded-lg max-w-[80%] ${
                      msg.isUser 
                        ? 'bg-primary text-white ml-auto' 
                        : 'bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {msg.isUser ? (
                      <span className="whitespace-pre-wrap break-words">{msg.message}</span>
                    ) : (
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown components={markdownComponents} 
                           remarkPlugins={[remarkGfm]}>
                          {msg.message}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                  {msg.isUser && <User className="h-4 w-4 text-gray-500 flex-shrink-0" />}
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              type="text"
              placeholder="Ask a question..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              type="submit" 
              size="icon" 
              disabled={isLoading || inputMessage.trim() === ''}
              className="bg-primary hover:bg-primary/90 text-white rounded-lg px-3 py-2"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  // Full chat view
  return (
    <Card className={`flex flex-col h-full ${className}`}>
      <CardHeader>
        <div className="flex items-center">
          <Bot className="h-6 w-6 text-primary mr-2" />
          <CardTitle>AI Educational Assistant</CardTitle>
        </div>
        <CardDescription>
          Ask questions about any subject, get homework help, or brainstorm ideas for your next project.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <div 
          ref={chatContainerRef}
          className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-800 rounded-lg p-4"
        >
          {isLoadingHistory ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <Bot className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Welcome to the AI Educational Assistant</h3>
              <p className="text-muted-foreground max-w-md">
                Ask me anything related to your studies, homework problems, or concepts you'd like to understand better.
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex items-start gap-3 mb-4 ${msg.isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!msg.isUser && (
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-5 w-5 text-primary" />
                  </div>
                )}
                <div 
                  className={`p-3 rounded-lg max-w-[80%] ${
                    msg.isUser 
                      ? 'bg-primary text-white' 
                      : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600'
                  }`}
                >
                  {msg.isUser ? (
                    <p className="text-white whitespace-pre-wrap break-words">
                      {msg.message}
                    </p>
                  ) : (
                    <div className="prose prose-sm dark:prose-invert max-w-none markdown-content">
                      <ReactMarkdown components={markdownComponents} 
                          remarkPlugins={[remarkGfm]}>
                        {msg.message}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
                {msg.isUser && (
                  <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                    <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  </div>
                )}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <form onSubmit={handleSubmit} className="flex gap-2 w-full">
          <Input
            type="text"
            placeholder="Type your question here..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={isLoading}
            className="flex-1"
          />
          <Button 
            type="submit" 
            disabled={isLoading || inputMessage.trim() === ''}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Send
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}