import { useState, useEffect, useRef } from 'react';
import { Container } from '@/components/layout/container';
import { AIChatWidget } from '@/components/ui/ai-chat-widget';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { Lightbulb, Brain, BookOpen } from 'lucide-react';

export default function Chat() {
  const { user } = useAuth();
  const [_, navigate] = useLocation();
  
  useEffect(() => {
    // Check if user is authenticated
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <Container>
      <div className="py-6">
        <h1 className="text-3xl font-bold mb-6">AI Educational Assistant</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-[calc(100vh-240px)]">
            <AIChatWidget />
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lightbulb className="mr-2 h-5 w-5 text-yellow-500" />
                  How to Use
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>
                    <span className="font-semibold">Ask questions</span> about any educational topic or subject
                  </li>
                  <li>
                    <span className="font-semibold">Get homework help</span> with step-by-step explanations
                  </li>
                  <li>
                    <span className="font-semibold">Learn concepts</span> with clear, concise explanations
                  </li>
                  <li>
                    <span className="font-semibold">Brainstorm ideas</span> for your projects and assignments
                  </li>
                  <li>
                    <span className="font-semibold">Prepare for exams</span> with practice questions and reviews
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="mr-2 h-5 w-5 text-primary-500" />
                  Example Questions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="math">
                  <TabsList className="w-full grid grid-cols-3">
                    <TabsTrigger value="math">Math</TabsTrigger>
                    <TabsTrigger value="science">Science</TabsTrigger>
                    <TabsTrigger value="humanities">Humanities</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="math" className="pt-4">
                    <ul className="space-y-2 text-sm">
                      <li>"How do I solve quadratic equations?"</li>
                      <li>"Explain the concept of derivatives in calculus"</li>
                      <li>"What's the difference between permutation and combination?"</li>
                      <li>"Help me understand trigonometric functions"</li>
                    </ul>
                  </TabsContent>
                  
                  <TabsContent value="science" className="pt-4">
                    <ul className="space-y-2 text-sm">
                      <li>"Explain the process of photosynthesis"</li>
                      <li>"What are Newton's laws of motion?"</li>
                      <li>"How does DNA replication work?"</li>
                      <li>"Explain the periodic table and element groups"</li>
                    </ul>
                  </TabsContent>
                  
                  <TabsContent value="humanities" className="pt-4">
                    <ul className="space-y-2 text-sm">
                      <li>"Analyze the themes in Shakespeare's Macbeth"</li>
                      <li>"What were the main causes of World War II?"</li>
                      <li>"Explain different economic systems"</li>
                      <li>"Help me understand philosophical concepts like existentialism"</li>
                    </ul>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="mr-2 h-5 w-5 text-secondary-500" />
                  AI Capabilities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Our AI assistant is powered by a triple AI system combining Google Gemini, Perplexity AI, and OpenAI models:
                </p>
                <ul className="space-y-2 text-sm">
                  <li><span className="font-semibold">Google Gemini:</span> Exceptional at educational content and conceptual understanding</li>
                  <li><span className="font-semibold">Perplexity AI:</span> Provides up-to-date information with citations</li>
                  <li><span className="font-semibold">OpenAI:</span> Strong problem-solving and detailed explanations</li>
                </ul>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 mb-2">
                  Our system features:
                </p>
                <ul className="space-y-2 text-sm">
                  <li>Automatic AI selection based on your question type</li>
                  <li>Intelligent fallback system for reliability</li>
                  <li>Step-by-step problem-solving guidance</li>
                  <li>Conceptual explanations adapted to different learning levels</li>
                  <li>Study strategies and learning resources</li>
                </ul>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-4">
                  Note: While our AI strives for accuracy, always verify important information with official sources.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Container>
  );
}
