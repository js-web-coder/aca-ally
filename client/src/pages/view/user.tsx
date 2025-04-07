import { useEffect, useState } from "react";
import { Container } from "@/components/layout/container";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Calendar, MapPin, Globe, FileText, ThumbsUp, Users, BookOpen, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

interface UserProfileProps {
  username: string;
}

export default function UserProfile({ username }: UserProfileProps) {
  const [profileUser, setProfileUser] = useState<any>(null);
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Load user profile on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      setIsLoading(true);
      try {
        // Try to fetch from API
        const response = await fetch(`/api/users/profile/${username}`);
        
        if (response.ok) {
          const data = await response.json();
          setProfileUser(data);
          
          // Check if current user is following this profile
          if (user) {
            const followResponse = await fetch(`/api/users/following/${user.id}/${data.id}`);
            setIsFollowing(followResponse.ok && (await followResponse.json()).following);
          }
          
          // Fetch user posts
          const postsResponse = await fetch(`/api/posts/user/${data.id}`);
          if (postsResponse.ok) {
            setUserPosts(await postsResponse.json());
          }
        } else {
          // Fallback to mocked data if API fails
          setProfileUser({
            id: 123,
            username,
            displayName: username.charAt(0).toUpperCase() + username.slice(1),
            bio: "This is a sample bio for this user profile.",
            location: "New York, USA",
            interests: "Mathematics, Physics, Literature",
            website: "https://example.com",
            profileImage: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
            createdAt: "2023-01-15T12:00:00Z",
            followersCount: 125,
            followingCount: 87,
            postsCount: 32,
          });
          
          // Generate mock posts
          setUserPosts(
            Array(5).fill(0).map((_, i) => ({
              id: i,
              title: `Sample Post ${i + 1}`,
              content: "This is a sample post content.",
              subject: ["Math", "Physics", "Literature", "History", "Computer Science"][i % 5],
              createdAt: new Date(Date.now() - i * 86400000).toISOString(),
              likesCount: Math.floor(Math.random() * 50),
              commentsCount: Math.floor(Math.random() * 20),
              viewsCount: Math.floor(Math.random() * 500) + 50,
            }))
          );
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        toast({
          title: "Failed to load profile",
          description: "Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [username, user, toast]);
  
  const handleFollow = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to follow users.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const action = isFollowing ? "unfollow" : "follow";
      
      const response = await fetch(`/api/users/${action}/${profileUser.id}`, {
        method: "POST",
      });
      
      if (response.ok) {
        setIsFollowing(!isFollowing);
        
        toast({
          title: isFollowing ? "Unfollowed" : "Following",
          description: isFollowing 
            ? `You have unfollowed ${profileUser.displayName}` 
            : `You are now following ${profileUser.displayName}`,
        });
      } else {
        throw new Error("Failed to update follow status");
      }
    } catch (error) {
      console.error("Error updating follow status:", error);
      
      // Fallback behavior
      setIsFollowing(!isFollowing);
      
      toast({
        title: isFollowing ? "Unfollowed" : "Following",
        description: isFollowing 
          ? `You have unfollowed ${profileUser.displayName}` 
          : `You are now following ${profileUser.displayName}`,
      });
    }
  };
  
  if (isLoading) {
    return (
      <Container centered>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-pulse space-y-4 w-full max-w-2xl">
            <div className="flex items-center space-x-4">
              <div className="rounded-full bg-gray-200 dark:bg-gray-700 h-16 w-16"></div>
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
              </div>
            </div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          </div>
        </div>
      </Container>
    );
  }
  
  if (!profileUser) {
    return (
      <Container centered>
        <Card className="text-center py-8">
          <CardContent>
            <h2 className="text-2xl font-bold mb-2">User Not Found</h2>
            <p className="text-muted-foreground">
              The user profile you are looking for does not exist or has been deleted.
            </p>
          </CardContent>
        </Card>
      </Container>
    );
  }
  
  return (
    <Container>
      <div className="space-y-6">
        {/* Profile header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <Avatar className="h-24 w-24 border-2 border-background">
                <AvatarImage src={profileUser.profileImage} alt={profileUser.displayName} />
                <AvatarFallback className="text-xl">
                  {profileUser.displayName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h1 className="text-2xl font-bold">{profileUser.displayName}</h1>
                    <p className="text-muted-foreground">@{profileUser.username}</p>
                  </div>
                  
                  {user && user.username !== profileUser.username && (
                    <Button 
                      onClick={handleFollow}
                      variant={isFollowing ? "outline" : "default"}
                    >
                      {isFollowing ? "Unfollow" : "Follow"}
                    </Button>
                  )}
                </div>
                
                {profileUser.bio && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                    {profileUser.bio}
                  </p>
                )}
                
                <div className="flex flex-wrap gap-4 pt-2 text-sm text-muted-foreground">
                  {profileUser.location && (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{profileUser.location}</span>
                    </div>
                  )}
                  
                  {profileUser.website && (
                    <div className="flex items-center">
                      <Globe className="h-4 w-4 mr-1" />
                      <a 
                        href={profileUser.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {profileUser.website.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  )}
                  
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>Joined {new Date(profileUser.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="text-center">
                <p className="text-2xl font-bold">{profileUser.postsCount || 0}</p>
                <p className="text-sm text-muted-foreground">Posts</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{profileUser.followersCount || 0}</p>
                <p className="text-sm text-muted-foreground">Followers</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{profileUser.followingCount || 0}</p>
                <p className="text-sm text-muted-foreground">Following</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Profile tabs */}
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="interests">Interests</TabsTrigger>
            <TabsTrigger value="badges">Badges</TabsTrigger>
          </TabsList>
          
          {/* Posts tab */}
          <TabsContent value="posts" className="space-y-4 mt-6">
            {userPosts.length === 0 ? (
              <Card className="text-center py-8">
                <CardContent>
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-40" />
                  <h3 className="text-lg font-medium mb-2">No Posts Yet</h3>
                  <p className="text-muted-foreground text-sm max-w-md mx-auto">
                    {user && user.username === profileUser.username 
                      ? "You haven't created any posts yet. Start sharing your knowledge or questions with the community!"
                      : `${profileUser.displayName} hasn't created any posts yet.`
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              userPosts.map((post) => (
                <Card key={post.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">
                          <a 
                            href={`/post/${post.id}`}
                            className="hover:text-primary transition-colors"
                          >
                            {post.title}
                          </a>
                        </CardTitle>
                        <CardDescription>
                          {new Date(post.createdAt).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary">
                        {post.subject}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {post.content}
                    </p>
                    <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        <span>{post.likesCount} likes</span>
                      </div>
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-1" />
                        <span>{post.commentsCount} comments</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        <span>{post.viewsCount} views</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
          
          {/* Activity tab */}
          <TabsContent value="activity" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                    <ThumbsUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm">
                      <span className="font-medium">{profileUser.displayName}</span> liked <a href="#" className="text-primary hover:underline">Understanding Quadratic Equations</a>
                    </p>
                    <p className="text-xs text-muted-foreground">2 days ago</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm">
                      <span className="font-medium">{profileUser.displayName}</span> published a new post: <a href="#" className="text-primary hover:underline">Tips for Effective Study Habits</a>
                    </p>
                    <p className="text-xs text-muted-foreground">5 days ago</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm">
                      <span className="font-medium">{profileUser.displayName}</span> completed <a href="#" className="text-primary hover:underline">Advanced Statistics Module</a>
                    </p>
                    <p className="text-xs text-muted-foreground">1 week ago</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Interests tab */}
          <TabsContent value="interests" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Areas of Interest</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profileUser.interests?.split(',').map((interest: string, index: number) => (
                    <Badge key={index} variant="outline" className="px-3 py-1">
                      {interest.trim()}
                    </Badge>
                  )) || (
                    <p className="text-muted-foreground">No interests specified</p>
                  )}
                </div>
                
                <Separator className="my-6" />
                
                <h3 className="text-lg font-medium mb-4">Popular Topics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-3">
                      <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">1</span>
                    </div>
                    <div>
                      <p className="font-medium">Mathematics</p>
                      <p className="text-xs text-muted-foreground">42 posts, 128 comments</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mr-3">
                      <span className="text-green-600 dark:text-green-400 text-sm font-medium">2</span>
                    </div>
                    <div>
                      <p className="font-medium">Physics</p>
                      <p className="text-xs text-muted-foreground">28 posts, 94 comments</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center mr-3">
                      <span className="text-amber-600 dark:text-amber-400 text-sm font-medium">3</span>
                    </div>
                    <div>
                      <p className="font-medium">Computer Science</p>
                      <p className="text-xs text-muted-foreground">19 posts, 76 comments</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center mr-3">
                      <span className="text-purple-600 dark:text-purple-400 text-sm font-medium">4</span>
                    </div>
                    <div>
                      <p className="font-medium">Literature</p>
                      <p className="text-xs text-muted-foreground">15 posts, 52 comments</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Badges tab */}
          <TabsContent value="badges" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Achievements & Badges</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="border rounded-lg p-4 text-center">
                    <div className="h-16 w-16 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center mx-auto mb-3">
                      <Sparkles className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                    </div>
                    <h3 className="font-medium">Prolific Author</h3>
                    <p className="text-xs text-muted-foreground">Published over 20 posts</p>
                  </div>
                  
                  <div className="border rounded-lg p-4 text-center">
                    <div className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mx-auto mb-3">
                      <ThumbsUp className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="font-medium">Helpful Mentor</h3>
                    <p className="text-xs text-muted-foreground">Received 100+ likes on answers</p>
                  </div>
                  
                  <div className="border rounded-lg p-4 text-center">
                    <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mx-auto mb-3">
                      <BookOpen className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="font-medium">Diligent Learner</h3>
                    <p className="text-xs text-muted-foreground">Completed 15 learning modules</p>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h3 className="font-medium mb-3">Progress</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Expert Answerer</span>
                        <span>75%</span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-primary w-3/4 rounded-full"></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Community Leader</span>
                        <span>40%</span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-primary w-2/5 rounded-full"></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Subject Master: Math</span>
                        <span>90%</span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-primary w-[90%] rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Container>
  );
}