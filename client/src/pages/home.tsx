import { Container } from "@/components/layout/container";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Sparkles, BookOpen, Lightbulb, PenTool, BarChart4, ChevronRight } from "lucide-react";
import { AIChatWidget } from "@/components/ui/ai-chat-widget";
import { useLocation } from "wouter";

export default function Home() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  return (
    <Container>
      <div className="space-y-6">
        {/* Welcome section */}
        <section className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            {user ? `Welcome back, ${user.displayName || user.username}!` : 'Welcome to Aca.Ally!'}
          </h1>
          <p className="text-muted-foreground">
            Your personalized educational assistant and community
          </p>
        </section>

        {/* Stats cards for logged in users */}
        {user && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Learning Streak</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3 days</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Keep it up!
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">AI Chats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Questions answered
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Posts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">5</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Created by you
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Points</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">275</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Level 2 Scholar
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Feature highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="overflow-hidden border-t-4 border-t-purple-500">
            <CardHeader>
              <div className="flex items-center">
                <Sparkles className="h-5 w-5 text-purple-500 mr-2" />
                <CardTitle>AI Learning Assistant</CardTitle>
              </div>
              <CardDescription>
                Get help with homework and understand complex topics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Our AI assistant is trained on educational content and can explain concepts, help with homework, and answer your questions in a conversational way.
              </p>
              <div>
                <Button variant="outline" className="group" onClick={() => navigate('/chat')}>
                  <span>Start chatting</span>
                  <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-t-4 border-t-blue-500">
            <CardHeader>
              <div className="flex items-center">
                <BookOpen className="h-5 w-5 text-blue-500 mr-2" />
                <CardTitle>Personalized Content</CardTitle>
              </div>
              <CardDescription>
                Learning materials tailored to your interests
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Discover educational content that matches your interests and learning style. Our recommendation engine adapts to your preferences over time.
              </p>
              <div>
                <Button variant="outline" className="group" onClick={() => navigate('/explore')}>
                  <span>Explore content</span>
                  <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-t-4 border-t-green-500">
            <CardHeader>
              <div className="flex items-center">
                <PenTool className="h-5 w-5 text-green-500 mr-2" />
                <CardTitle>Create & Share</CardTitle>
              </div>
              <CardDescription>
                Build your own educational content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Create study guides, notes, and educational posts to share with the community. Collaborate with others and get feedback.
              </p>
              <div>
                <Button variant="outline" className="group" onClick={() => navigate('/account/new')}>
                  <span>Create a post</span>
                  <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-t-4 border-t-amber-500">
            <CardHeader>
              <div className="flex items-center">
                <BarChart4 className="h-5 w-5 text-amber-500 mr-2" />
                <CardTitle>Track Progress</CardTitle>
              </div>
              <CardDescription>
                Monitor your learning journey
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Keep track of your learning progress, set goals, and earn points as you complete activities. Unlock badges and achievements.
              </p>
              <div>
                <Button variant="outline" className="group" onClick={() => navigate('/account/edit')}>
                  <span>View profile</span>
                  <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick AI Chat Widget */}
        <div className="pt-4">
          <AIChatWidget minimal />
        </div>
      </div>
    </Container>
  );
}