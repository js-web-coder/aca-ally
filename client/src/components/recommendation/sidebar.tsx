import { useState, useEffect } from "react";
import { 
  loadRecommendations, 
  refreshRecommendations,
  rateRecommendation,
  isRecommendationLiked,
  type Recommendation 
} from "@/lib/recommendationService";
import { getFullLessonContent } from "@/lib/geminiService";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { 
  ThumbsUp, 
  ThumbsDown, 
  RefreshCw, 
  Clock, 
  Sparkles, 
  ChevronRight, 
  BookOpen,
  Loader2
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface RecommendationSidebarProps {
  className?: string;
}

export function RecommendationSidebar({ className = "" }: RecommendationSidebarProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lessonContent, setLessonContent] = useState<string>("");
  const [currentLesson, setCurrentLesson] = useState<string>("");
  const [lessonLoading, setLessonLoading] = useState(false);
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Load recommendations on component mount
  useEffect(() => {
    if (user) {
      loadUserRecommendations();
    }
  }, [user]);

  const loadUserRecommendations = () => {
    setIsLoading(true);
    try {
      const items = loadRecommendations();
      setRecommendations(items);
    } catch (error) {
      console.error("Error loading recommendations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    if (!user) return;
    
    setRefreshing(true);
    try {
      const newItems = refreshRecommendations();
      setRecommendations(newItems);
      
      toast({
        title: "Recommendations refreshed",
        description: "We've updated your personalized content suggestions.",
      });
    } catch (error) {
      console.error("Error refreshing recommendations:", error);
      
      toast({
        title: "Failed to refresh",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  const handleRate = (id: string, rating: 'like' | 'dislike') => {
    if (!user) return;
    
    try {
      rateRecommendation(id, rating);
      
      // Update UI
      setRecommendations(prev => 
        prev.map(rec => 
          rec.id === id 
            ? { ...rec, userRating: rating } 
            : rec
        )
      );
      
      toast({
        title: rating === 'like' ? "You liked this content" : "You disliked this content",
        description: "Thanks for your feedback. We'll use it to improve your recommendations.",
      });
    } catch (error) {
      console.error("Error rating recommendation:", error);
    }
  };
  
  // Handler to view a lesson with Gemini
  const handleViewLesson = async (recommendation: Recommendation) => {
    if (!user) return;
    
    setCurrentLesson(recommendation.title);
    setLessonContent("");
    setLessonLoading(true);
    setLessonDialogOpen(true);
    
    try {
      // Get lesson content from Gemini AI
      const content = await getFullLessonContent(recommendation.title);
      setLessonContent(content);
      
      // If they view the lesson, automatically like it if not already rated
      if (!recommendation.userRating) {
        handleRate(recommendation.id, 'like');
      }
    } catch (error) {
      console.error("Error fetching lesson content:", error);
      setLessonContent("Sorry, we couldn't generate the lesson content at this time. Please try again later.");
      
      toast({
        title: "Error loading lesson",
        description: "Failed to generate lesson content. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLessonLoading(false);
    }
  };

  // Get category badge color
  const getCategoryColor = (category: string) => {
    const colorMap: Record<string, string> = {
      math: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      science: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      literature: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      history: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
      languages: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
      arts: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
      programming: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
    };
    
    return colorMap[category] || "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
  };

  // Get difficulty badge color
  const getDifficultyColor = (difficulty: string) => {
    const colorMap: Record<string, string> = {
      beginner: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      intermediate: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
      advanced: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    };
    
    return colorMap[difficulty] || "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
  };

  // Render recommendation cards
  const renderRecommendationCards = () => {
    if (isLoading) {
      return Array(3).fill(0).map((_, i) => (
        <div key={i} className="mb-3">
          <Skeleton className="h-36 w-full rounded-md" />
        </div>
      ));
    }

    if (recommendations.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-20" />
          <p>No recommendations available</p>
        </div>
      );
    }

    return recommendations.map((recommendation) => (
      <Card 
        key={recommendation.id} 
        className="mb-3 overflow-hidden group transition-all duration-300 hover:shadow-md"
      >
        <CardContent className="p-3">
          <div className="flex justify-between items-start">
            <h3 className="font-medium text-sm group-hover:text-primary transition-colors duration-300">
              {recommendation.title}
            </h3>
            <div className="flex flex-shrink-0 ml-2">
              <Button
                size="icon"
                variant="ghost"
                className={`h-5 w-5 ${recommendation.userRating === 'like' 
                  ? 'text-red-500' 
                  : 'text-muted-foreground opacity-0 group-hover:opacity-100'} transition-all duration-300`}
                onClick={() => handleRate(recommendation.id, 'like')}
              >
                <ThumbsUp className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                onClick={() => handleRate(recommendation.id, 'dislike')}
              >
                <ThumbsDown className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {recommendation.description}
          </p>
          
          <div className="flex flex-wrap gap-1 mt-2">
            <Badge variant="outline" className={`text-xs ${getCategoryColor(recommendation.category)}`}>
              {recommendation.category}
            </Badge>
            <Badge variant="outline" className={`text-xs ${getDifficultyColor(recommendation.difficulty)}`}>
              {recommendation.difficulty}
            </Badge>
          </div>
          
          <div className="flex justify-between items-center mt-3 text-xs text-muted-foreground">
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              <span>{recommendation.estimatedMinutes} min</span>
            </div>
            <div className="flex items-center">
              <Sparkles className="h-3 w-3 mr-1 text-amber-500" />
              <span>{recommendation.relevanceScore}% match</span>
            </div>
          </div>
          
          <div className="w-full text-right mt-2">
            <Button
              variant="link"
              size="sm"
              className="h-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              onClick={() => handleViewLesson(recommendation)}
            >
              View lesson
              <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    ));
  };

  if (!user) {
    return null;
  }

  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold flex items-center">
          <Sparkles className="h-4 w-4 mr-2 text-amber-500" />
          AI Recommendations
        </h2>
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs"
          onClick={handleRefresh}
          disabled={refreshing || isLoading}
        >
          {refreshing ? (
            <>
              <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
              Refreshing...
            </>
          ) : (
            <>
              <RefreshCw className="h-3 w-3 mr-1" />
              Refresh
            </>
          )}
        </Button>
      </div>

      <div>
        {renderRecommendationCards()}
      </div>
      
      {/* Lesson content dialog */}
      <Dialog open={lessonDialogOpen} onOpenChange={setLessonDialogOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              {currentLesson}
            </DialogTitle>
            <DialogDescription>
              Generated by Gemini AI
            </DialogDescription>
          </DialogHeader>
          
          {lessonLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-center text-muted-foreground">
                Generating comprehensive lesson content...
                <br />
                <span className="text-sm">This may take a few moments</span>
              </p>
            </div>
          ) : (
            <div className="mt-4 prose prose-sm dark:prose-invert max-w-none">
              {lessonContent.split('\n').map((paragraph, i) => {
                // Handle headings
                if (paragraph.startsWith('# ')) {
                  return <h1 key={i} className="text-xl font-bold mt-6 mb-4">{paragraph.replace('# ', '')}</h1>;
                } else if (paragraph.startsWith('## ')) {
                  return <h2 key={i} className="text-lg font-bold mt-5 mb-3">{paragraph.replace('## ', '')}</h2>;
                } else if (paragraph.startsWith('### ')) {
                  return <h3 key={i} className="text-md font-bold mt-4 mb-2">{paragraph.replace('### ', '')}</h3>;
                }
                
                // Handle bullet points
                if (paragraph.trim().startsWith('- ')) {
                  return <li key={i} className="ml-5 mb-1">{paragraph.replace('- ', '')}</li>;
                }
                
                // Handle empty lines
                if (paragraph.trim() === '') {
                  return <br key={i} />;
                }
                
                // Regular paragraphs
                return <p key={i} className="mb-4">{paragraph}</p>;
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}