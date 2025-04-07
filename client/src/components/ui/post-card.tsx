import { useState } from "react";
import { format } from "date-fns";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageSquare, Bookmark, Share2, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

interface PostCardProps {
  post: {
    id: number;
    title: string;
    content: string;
    subject?: string;
    visibility: string;
    createdAt: string | Date;
    likes: number;
    views: number;
    saves: number;
    shares: number;
    userId: number;
    user?: {
      username: string;
      displayName?: string;
      profileImage?: string;
    };
    coverImage?: string;
    isLiked?: boolean;
    isSaved?: boolean;
  };
  variant?: "compact" | "full";
  className?: string;
}

export function PostCard({ post, variant = "compact", className = "" }: PostCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [isSaved, setIsSaved] = useState(post.isSaved || false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [saveCount, setSaveCount] = useState(post.saves);
  
  // Get first image from content if no cover image
  const getFirstImageFromContent = () => {
    if (post.coverImage) return post.coverImage;
    
    // Simple regex to find first image from HTML content
    const imgRegex = /<img.*?src="(.*?)".*?>/;
    const match = post.content.match(imgRegex);
    return match ? match[1] : undefined;
  };
  
  const coverImage = getFirstImageFromContent();
  
  // Get plain text excerpt from HTML content
  const getContentExcerpt = (content: string, maxLength: number = 150) => {
    // Remove HTML tags
    const plainText = content.replace(/<[^>]+>/g, ' ');
    return plainText.length > maxLength 
      ? plainText.substring(0, maxLength) + '...' 
      : plainText;
  };
  
  const contentExcerpt = getContentExcerpt(post.content);
  
  // Format the date
  const formattedDate = typeof post.createdAt === 'string' 
    ? format(new Date(post.createdAt), 'PPP') 
    : format(post.createdAt, 'PPP');
  
  const toggleLike = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to like posts",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Optimistic update
      setIsLiked(!isLiked);
      setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
      
      if (isLiked) {
        await apiRequest('DELETE', `/api/posts/${post.id}/like`);
      } else {
        await apiRequest('POST', `/api/posts/${post.id}/like`);
      }
      
      // Invalidate posts queries to reflect the updated like state
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      
    } catch (error) {
      // Revert on error
      setIsLiked(!isLiked);
      setLikeCount(isLiked ? likeCount + 1 : likeCount - 1);
      
      toast({
        title: "Action failed",
        description: "Failed to update like status. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const toggleSave = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to save posts",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Optimistic update
      setIsSaved(!isSaved);
      setSaveCount(isSaved ? saveCount - 1 : saveCount + 1);
      
      if (isSaved) {
        await apiRequest('DELETE', `/api/posts/${post.id}/save`);
      } else {
        await apiRequest('POST', `/api/posts/${post.id}/save`);
      }
      
      // Invalidate posts queries to reflect the updated save state
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      
    } catch (error) {
      // Revert on error
      setIsSaved(!isSaved);
      setSaveCount(isSaved ? saveCount + 1 : saveCount - 1);
      
      toast({
        title: "Action failed",
        description: "Failed to update save status. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const sharePost = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: contentExcerpt,
        url: `/post/${post.id}`
      }).catch(error => {
        console.error('Error sharing post:', error);
      });
    } else {
      // Fallback for browsers that don't support navigator.share
      const url = `${window.location.origin}/post/${post.id}`;
      navigator.clipboard.writeText(url);
      
      toast({
        title: "Link copied",
        description: "Post link copied to clipboard"
      });
    }
  };
  
  if (variant === "compact") {
    return (
      <Card className={`overflow-hidden transition-transform hover:scale-[1.02] ${className}`}>
        {coverImage && (
          <div className="relative">
            <img 
              src={coverImage}
              alt={post.title} 
              className="w-full h-48 object-cover"
            />
            {post.subject && (
              <div className="absolute top-2 right-2">
                <Badge variant="secondary" className="bg-primary-500 text-white">
                  {post.subject}
                </Badge>
              </div>
            )}
          </div>
        )}
        <CardContent className={`p-4 ${!coverImage ? 'pt-4' : ''}`}>
          <h3 className="font-bold text-lg mb-2 line-clamp-2">
            <Link href={`/post/${post.id}`} className="hover:text-primary-500">
              {post.title}
            </Link>
          </h3>
          
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
            {contentExcerpt}
          </p>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={post.user?.profileImage} alt={post.user?.displayName || post.user?.username} />
                <AvatarFallback>
                  {(post.user?.displayName || post.user?.username || "User")[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {post.user?.displayName || post.user?.username || "Anonymous"}
              </span>
            </div>
            
            <div className="flex items-center space-x-3 text-gray-500 dark:text-gray-400">
              <span className="flex items-center text-xs">
                <Eye className="h-3 w-3 mr-1" />
                {post.views}
              </span>
              <span className="flex items-center text-xs">
                <Heart 
                  className={`h-3 w-3 mr-1 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} 
                />
                {likeCount}
              </span>
              <span className="flex items-center text-xs">
                <Bookmark 
                  className={`h-3 w-3 mr-1 ${isSaved ? 'fill-yellow-500 text-yellow-500' : ''}`} 
                />
                {saveCount}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Full variant
  return (
    <Card className={`p-5 ${className}`}>
      <div className="flex items-start gap-4">
        <Avatar className="h-10 w-10">
          <AvatarImage src={post.user?.profileImage} alt={post.user?.displayName || post.user?.username} />
          <AvatarFallback>
            {(post.user?.displayName || post.user?.username || "User")[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div>
              <Link 
                href={`/view/user/${post.user?.username}`} 
                className="font-semibold text-gray-900 dark:text-white hover:text-primary-500"
              >
                {post.user?.displayName || post.user?.username || "Anonymous"}
              </Link>
              <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">
                {formattedDate}
              </span>
            </div>
            
            {post.subject && (
              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                {post.subject}
              </Badge>
            )}
          </div>
          
          <Link href={`/post/${post.id}`}>
            <h3 className="text-lg font-bold mb-2 hover:text-primary-500">{post.title}</h3>
          </Link>
          
          <div className="text-gray-700 dark:text-gray-300 mb-3">
            {variant === "full" 
              ? <div dangerouslySetInnerHTML={{ __html: post.content }} />
              : <p>{contentExcerpt}</p>
            }
          </div>
          
          {coverImage && (
            <img 
              src={coverImage}
              alt={post.title} 
              className="w-full max-h-96 object-cover rounded-lg mb-3"
            />
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                className={`flex items-center ${isLiked ? 'text-red-500' : 'text-gray-500 dark:text-gray-400 hover:text-red-500'}`}
                onClick={toggleLike}
              >
                <Heart className={`h-4 w-4 mr-1 ${isLiked ? 'fill-current' : ''}`} />
                <span>{likeCount}</span>
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm"
                className="flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                <MessageSquare className="h-4 w-4 mr-1" />
                <span>0</span>
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm"
                className={`flex items-center ${isSaved ? 'text-yellow-500' : 'text-gray-500 dark:text-gray-400 hover:text-yellow-500'}`}
                onClick={toggleSave}
              >
                <Bookmark className={`h-4 w-4 mr-1 ${isSaved ? 'fill-current' : ''}`} />
                <span>{saveCount}</span>
              </Button>
            </div>
            
            <Button 
              variant="ghost" 
              size="sm"
              className="flex items-center text-gray-500 dark:text-gray-400 hover:text-primary-500"
              onClick={sharePost}
            >
              <Share2 className="h-4 w-4 mr-1" />
              <span className="text-sm">Share</span>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
