import { useState } from 'react';
import { Container } from '@/components/layout/container';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HomeworkHelpForm } from '@/components/ui/homework-help-form';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { BookOpen, Brain, Sparkles, Bot } from 'lucide-react';

export default function HomeworkHelp() {
  const { user } = useAuth();
  const [_, navigate] = useLocation();
  
  // Redirect to login if not authenticated
  if (!user) {
    if (typeof window !== 'undefined') {
      navigate('/auth');
    }
    return null;
  }

  return (
    <Container>
      <div className="py-6">
        <h1 className="text-3xl font-bold mb-2">Homework Help</h1>
        <p className="text-muted-foreground mb-6">Get expert assistance with your homework using our triple AI system</p>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <HomeworkHelpForm className="h-full" />
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bot className="mr-2 h-5 w-5 text-primary" />
                  Our Triple AI System
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Your homework questions are analyzed by our smart selection system to choose the best AI model:
                </p>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start">
                    <div className="bg-blue-100 dark:bg-blue-900 p-1 rounded-full mr-2 mt-0.5">
                      <Sparkles className="h-3 w-3 text-blue-600 dark:text-blue-300" />
                    </div>
                    <div>
                      <span className="font-semibold text-blue-600 dark:text-blue-400">Google Gemini</span>
                      <p className="text-gray-600 dark:text-gray-400 text-xs mt-0.5">Excellent at math, science, and technical subjects</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-purple-100 dark:bg-purple-900 p-1 rounded-full mr-2 mt-0.5">
                      <Brain className="h-3 w-3 text-purple-600 dark:text-purple-300" />
                    </div>
                    <div>
                      <span className="font-semibold text-purple-600 dark:text-purple-400">Perplexity AI</span>
                      <p className="text-gray-600 dark:text-gray-400 text-xs mt-0.5">Best for current events, history, and citation-rich answers</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-green-100 dark:bg-green-900 p-1 rounded-full mr-2 mt-0.5">
                      <BookOpen className="h-3 w-3 text-green-600 dark:text-green-300" />
                    </div>
                    <div>
                      <span className="font-semibold text-green-600 dark:text-green-400">OpenAI</span>
                      <p className="text-gray-600 dark:text-gray-400 text-xs mt-0.5">Strong at literature, writing, and philosophical questions</p>
                    </div>
                  </li>
                </ul>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-4">
                  Our system automatically selects the best AI for your question and falls back to alternatives if needed.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="mr-2 h-5 w-5 text-yellow-500" />
                  Study Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="before">
                  <TabsList className="w-full grid grid-cols-3">
                    <TabsTrigger value="before">Before</TabsTrigger>
                    <TabsTrigger value="during">During</TabsTrigger>
                    <TabsTrigger value="after">After</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="before" className="pt-4">
                    <ul className="space-y-2 text-sm">
                      <li>Review class notes before starting homework</li>
                      <li>Create a distraction-free environment</li>
                      <li>Break complex assignments into smaller tasks</li>
                      <li>Gather all necessary resources and references</li>
                    </ul>
                  </TabsContent>
                  
                  <TabsContent value="during" className="pt-4">
                    <ul className="space-y-2 text-sm">
                      <li>Start with easier questions to build momentum</li>
                      <li>Take short breaks every 25-30 minutes</li>
                      <li>Use our AI to understand concepts, not just answers</li>
                      <li>Write down your thought process for complex problems</li>
                    </ul>
                  </TabsContent>
                  
                  <TabsContent value="after" className="pt-4">
                    <ul className="space-y-2 text-sm">
                      <li>Review your answers for accuracy</li>
                      <li>Create flashcards for concepts you struggled with</li>
                      <li>Save helpful explanations from our AI for future reference</li>
                      <li>Reflect on what you learned and areas to improve</li>
                    </ul>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Container>
  );
}