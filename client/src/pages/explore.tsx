import { useState, useEffect } from 'react';
import { Container } from '@/components/layout/container';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Eye, Heart, Bookmark, Share2, User2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

// Define the Post type based on our schema
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

export default function Explore() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [trendingPosts, setTrendingPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch recent posts
        const recentResponse = await fetch('/api/posts/recent');
        const recentData = await recentResponse.json();
        setRecentPosts(recentData);

        // Fetch trending posts
        const trendingResponse = await fetch('/api/posts/trending');
        const trendingData = await trendingResponse.json();
        setTrendingPosts(trendingData);

        // Set initial posts to trending by default
        setPosts(trendingData);
      } catch (error) {
        console.error('Error fetching posts:', error);
        toast({
          title: 'Error',
          description: 'Failed to load posts. Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [toast]);

  const handleTabChange = (value: string) => {
    if (value === 'recent') {
      setPosts(recentPosts);
    } else if (value === 'trending') {
      setPosts(trendingPosts);
    }
  };

  return (
    <Container>
      <div className="py-10">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Explore Content</h1>
          <p className="text-muted-foreground text-lg">
            Discover educational content shared by the Aca.Ally community
          </p>
        </div>

        <Tabs defaultValue="trending" onValueChange={handleTabChange} className="mb-8">
          <TabsList>
            <TabsTrigger value="trending">Trending</TabsTrigger>
            <TabsTrigger value="recent">Recent</TabsTrigger>
          </TabsList>
          <TabsContent value="trending">
            <h2 className="text-2xl font-semibold mb-4">Trending Posts</h2>
          </TabsContent>
          <TabsContent value="recent">
            <h2 className="text-2xl font-semibold mb-4">Recent Posts</h2>
          </TabsContent>
        </Tabs>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-3">
                  <div className="h-5 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="h-4 bg-muted rounded w-full mb-2"></div>
                  <div className="h-4 bg-muted rounded w-full mb-2"></div>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                </CardContent>
                <CardFooter>
                  <div className="h-8 bg-muted rounded w-full"></div>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Card key={post.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-xl line-clamp-1">{post.title}</CardTitle>
                    {post.subject && (
                      <Badge variant="outline" className="ml-2">
                        {post.subject}
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="flex items-center text-sm">
                    <User2 className="h-3 w-3 mr-1" />
                    {post.user?.displayName || post.user?.username || 'Anonymous'}
                    <span className="mx-2">•</span>
                    {new Date(post.createdAt).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-3">
                  <p className="line-clamp-3 text-muted-foreground">
                    {post.content.replace(/<[^>]*>/g, '')}
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between pt-3 border-t">
                  <div className="flex items-center space-x-4 text-muted-foreground text-sm">
                    <span className="flex items-center">
                      <Eye className="h-4 w-4 mr-1" />
                      {post.views}
                    </span>
                    <span className="flex items-center">
                      <Heart className="h-4 w-4 mr-1" />
                      {post.likes}
                    </span>
                    <span className="flex items-center">
                      <Bookmark className="h-4 w-4 mr-1" />
                      {post.saves}
                    </span>
                    <span className="flex items-center">
                      <Share2 className="h-4 w-4 mr-1" />
                      {post.shares}
                    </span>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/post/${post.id}`}>View</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold mb-2">No posts found</h3>
            <p className="text-muted-foreground mb-6">
              Be the first to share educational content with the community!
            </p>
            {user ? (
              <Button asChild>
                <Link href="/post/new">Create Post</Link>
              </Button>
            ) : (
              <Button asChild>
                <Link href="/auth">Login to Post</Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </Container>
  );
}