import { useEffect, useState } from 'react';
import { useLocation, Link } from 'wouter';
import { Container } from '@/components/layout/container';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { Heart, MessageSquare, Bookmark, Share2, ArrowLeft, Eye } from 'lucide-react';
import { format } from 'date-fns';

interface Post {
  id: number;
  title: string;
  content: string;
  subject?: string;
  visibility: string;
  createdAt: string;
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
}

interface PostViewProps {
  id: string;
}

export default function PostView({ id }: PostViewProps) {
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [saveCount, setSaveCount] = useState(0);
  const { toast } = useToast();
  const { user } = useAuth();
  const [_, navigate] = useLocation();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/posts/${id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch post data');
        }
        
        const data = await response.json();
        setPost(data);
        setLikeCount(data.likes);
        setSaveCount(data.saves);
        
        // Check if user has liked or saved this post
        if (user) {
          try {
            const likesResponse = await fetch(`/api/users/me/likes`);
            const savesResponse = await fetch(`/api/users/me/saves`);
            
            if (likesResponse.ok && savesResponse.ok) {
              const likesData = await likesResponse.json();
              const savesData = await savesResponse.json();
              
              setIsLiked(likesData.some((like: any) => like.postId === parseInt(id)));
              setIsSaved(savesData.some((save: any) => save.postId === parseInt(id)));
            }
          } catch (error) {
            console.error('Error checking like/save status:', error);
          }
        }
      } catch (error) {
        console.error('Error fetching post:', error);
        toast({
          title: 'Error',
          description: 'Failed to load post. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPost();
  }, [id, toast, user]);

  const toggleLike = async () => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to like posts',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      // Optimistic update
      setIsLiked(!isLiked);
      setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
      
      if (isLiked) {
        await apiRequest('DELETE', `/api/posts/${id}/like`);
      } else {
        await apiRequest('POST', `/api/posts/${id}/like`);
      }
      
      // Invalidate post query to reflect updated like count
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${id}`] });
    } catch (error) {
      // Revert on error
      setIsLiked(!isLiked);
      setLikeCount(isLiked ? likeCount + 1 : likeCount - 1);
      
      toast({
        title: 'Action failed',
        description: 'Failed to update like status. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  const toggleSave = async () => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to save posts',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      // Optimistic update
      setIsSaved(!isSaved);
      setSaveCount(isSaved ? saveCount - 1 : saveCount + 1);
      
      if (isSaved) {
        await apiRequest('DELETE', `/api/posts/${id}/save`);
      } else {
        await apiRequest('POST', `/api/posts/${id}/save`);
      }
      
      // Invalidate post query to reflect updated save count
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${id}`] });
    } catch (error) {
      // Revert on error
      setIsSaved(!isSaved);
      setSaveCount(isSaved ? saveCount + 1 : saveCount - 1);
      
      toast({
        title: 'Action failed',
        description: 'Failed to update save status. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  const sharePost = () => {
    if (navigator.share) {
      navigator.share({
        title: post?.title || 'EduConnect post',
        text: post?.title || 'Check out this post on EduConnect',
        url: window.location.href
      }).catch(error => {
        console.error('Error sharing post:', error);
      });
    } else {
      // Fallback for browsers that don't support navigator.share
      navigator.clipboard.writeText(window.location.href);
      
      toast({
        title: 'Link copied',
        description: 'Post link copied to clipboard'
      });
    }
  };

  if (isLoading) {
    return (
      <Container>
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <Skeleton className="h-8 w-24" />
          </div>
          
          <Skeleton className="h-12 w-4/5 mb-4" />
          
          <div className="flex items-center mb-8">
            <Skeleton className="h-10 w-10 rounded-full mr-3" />
            <div>
              <Skeleton className="h-5 w-32 mb-1" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          
          <div className="mb-6">
            <Skeleton className="h-6 w-full mb-4" />
            <Skeleton className="h-6 w-full mb-4" />
            <Skeleton className="h-6 w-full mb-4" />
            <Skeleton className="h-6 w-4/5 mb-4" />
          </div>
          
          <Skeleton className="h-64 w-full mb-8" />
          
          <div className="flex justify-between">
            <div className="flex space-x-6">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
      </Container>
    );
  }

  if (!post) {
    return (
      <Container>
        <div className="max-w-3xl mx-auto text-center py-16">
          <h2 className="text-2xl font-bold mb-4">Post not found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The post you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild>
            <Link href="/">Return to Home</Link>
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)} className="flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
        
        <article>
          <header className="mb-8">
            <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Avatar className="h-10 w-10 mr-3">
                  <AvatarImage src={post.user?.profileImage} alt={post.user?.username} />
                  <AvatarFallback>
                    {post.user?.username ? post.user.username[0].toUpperCase() : 'U'}
                  </AvatarFallback>
                </Avatar>
                
                <div>
                  <Link href={`/view/user/${post.user?.username}`} className="font-semibold hover:text-primary-500">
                    {post.user?.displayName || post.user?.username || 'Anonymous'}
                  </Link>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {format(new Date(post.createdAt), 'PPP')}
                  </p>
                </div>
              </div>
              
              {post.subject && (
                <Badge className="bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300">
                  {post.subject}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
              <div className="flex items-center mr-4">
                <Eye className="h-4 w-4 mr-1" />
                <span>{post.views} views</span>
              </div>
              <div className="flex items-center">
                <Heart className={`h-4 w-4 mr-1 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                <span>{likeCount} likes</span>
              </div>
            </div>
          </header>
          
          <div className="prose dark:prose-invert max-w-none mb-8">
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-8">
            <div className="flex justify-between">
              <div className="flex space-x-6">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`flex items-center ${isLiked ? 'text-red-500' : 'text-gray-500 dark:text-gray-400 hover:text-red-500'}`}
                  onClick={toggleLike}
                >
                  <Heart className={`h-5 w-5 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                  <span>{likeCount}</span>
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  className={`flex items-center ${isSaved ? 'text-yellow-500' : 'text-gray-500 dark:text-gray-400 hover:text-yellow-500'}`}
                  onClick={toggleSave}
                >
                  <Bookmark className={`h-5 w-5 mr-2 ${isSaved ? 'fill-current' : ''}`} />
                  <span>{saveCount}</span>
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  <MessageSquare className="h-5 w-5 mr-2" />
                  <span>0</span>
                </Button>
              </div>
              
              <Button 
                variant="ghost" 
                size="sm"
                className="flex items-center text-gray-500 dark:text-gray-400 hover:text-primary-500"
                onClick={sharePost}
              >
                <Share2 className="h-5 w-5 mr-2" />
                <span>Share</span>
              </Button>
            </div>
          </div>
          
          {post.user && post.user.username && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mt-8">
              <h3 className="text-lg font-bold mb-4">About the Author</h3>
              <div className="flex items-start">
                <Avatar className="h-12 w-12 mr-4">
                  <AvatarImage src={post.user.profileImage} alt={post.user.username} />
                  <AvatarFallback>
                    {post.user.username[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Link href={`/view/user/${post.user.username}`} className="font-semibold hover:text-primary-500">
                    {post.user.displayName || post.user.username}
                  </Link>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    View more posts from this author
                  </p>
                </div>
              </div>
            </div>
          )}
        </article>
      </div>
    </Container>
  );
}
