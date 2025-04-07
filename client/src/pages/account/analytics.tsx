import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowUpRight, Eye, ThumbsUp, Bookmark, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import PageLayout from '../../components/layout/page-layout';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function AnalyticsPage() {
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Fetch user posts with analytics data
  const { data: postsData, isLoading: postsLoading, error: postsError } = useQuery({
    queryKey: ['/api/analytics/posts'],
    queryFn: async () => {
      const response = await fetch('/api/analytics/posts');
      if (!response.ok) {
        throw new Error('Failed to fetch post analytics');
      }
      return response.json();
    },
    enabled: !!user,
  });
  
  // Fetch trending posts
  const { data: trendingData, isLoading: trendingLoading } = useQuery({
    queryKey: ['/api/analytics/trending'],
    queryFn: async () => {
      const response = await fetch('/api/analytics/trending');
      if (!response.ok) {
        throw new Error('Failed to fetch trending posts');
      }
      return response.json();
    },
  });
  
  // Fetch detailed engagement data for a specific post when selected
  const { data: engagementData, isLoading: engagementLoading } = useQuery({
    queryKey: ['/api/analytics/user-engagement', selectedPostId],
    queryFn: async () => {
      if (!selectedPostId) return null;
      const response = await fetch(`/api/analytics/user-engagement/${selectedPostId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch post engagement data');
      }
      return response.json();
    },
    enabled: !!selectedPostId,
  });
  
  if (postsError) {
    toast({
      title: "Error loading analytics",
      description: postsError.message,
      variant: "destructive",
    });
  }
  
  // Format post data for charts
  const formatPostsForChart = () => {
    if (!postsData) return [];
    
    return postsData.map((post: any) => ({
      name: post.title.length > 20 ? post.title.substring(0, 20) + '...' : post.title,
      views: post.views || 0,
      likes: post.likes || 0,
      saves: post.saves || 0,
      comments: post.comments || 0,
      id: post.id,
    }));
  };
  
  // Format engagement data for pie chart
  const formatEngagementForPieChart = () => {
    if (!engagementData) return [];
    
    const { interactionBreakdown } = engagementData;
    return [
      { name: 'Views', value: interactionBreakdown.views },
      { name: 'Likes', value: interactionBreakdown.likes },
      { name: 'Saves', value: interactionBreakdown.saves },
      { name: 'Comments', value: interactionBreakdown.comments },
    ].filter(item => item.value > 0);
  };
  
  const handlePostClick = (postId: number) => {
    setSelectedPostId(postId);
  };
  
  return (
    <PageLayout>
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
          <p className="text-muted-foreground mb-6">Monitor your post performance and user engagement metrics</p>
        
          <Tabs defaultValue="posts" className="w-full">
            <TabsList className="w-full max-w-md mb-4">
              <TabsTrigger value="posts">My Posts</TabsTrigger>
              <TabsTrigger value="trending">Trending</TabsTrigger>
              {selectedPostId && <TabsTrigger value="details">Post Details</TabsTrigger>}
            </TabsList>
            
            <TabsContent value="posts" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>My Post Performance</CardTitle>
                  <CardDescription>
                    Click on any post to see detailed engagement metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {postsLoading ? (
                    <div className="flex justify-center items-center h-64">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  ) : postsData && postsData.length > 0 ? (
                    <div className="h-96">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={formatPostsForChart()}
                          margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
                          onClick={(data) => {
                            if (data && data.activePayload && data.activePayload[0]) {
                              const postId = data.activePayload[0].payload.id;
                              handlePostClick(postId);
                            }
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="views" fill="#8884d8" name="Views" />
                          <Bar dataKey="likes" fill="#82ca9d" name="Likes" />
                          <Bar dataKey="saves" fill="#ffc658" name="Saves" />
                          <Bar dataKey="comments" fill="#ff8042" name="Comments" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64">
                      <p className="text-muted-foreground mb-4">No post data available yet</p>
                      <Button variant="outline" asChild>
                        <a href="/post/create">Create Your First Post</a>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {postsData && postsData.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {postsData.map((post: any) => (
                    <Card key={post.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handlePostClick(post.id)}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{post.title}</CardTitle>
                        <CardDescription>{new Date(post.createdAt).toLocaleDateString()}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex items-center gap-2">
                            <Eye className="h-4 w-4 text-muted-foreground" />
                            <span>{post.views || 0} views</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <ThumbsUp className="h-4 w-4 text-muted-foreground" />
                            <span>{post.likes || 0} likes</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Bookmark className="h-4 w-4 text-muted-foreground" />
                            <span>{post.saves || 0} saves</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                            <span>{post.comments || 0} comments</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="trending">
              <Card>
                <CardHeader>
                  <CardTitle>Trending Posts</CardTitle>
                  <CardDescription>
                    Top performing posts across the platform
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {trendingLoading ? (
                    <div className="flex justify-center items-center h-64">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  ) : trendingData && trendingData.length > 0 ? (
                    <div className="space-y-4">
                      {trendingData.map((post: any, index: number) => (
                        <div key={post.id} className="flex items-center p-4 border rounded-lg hover:bg-accent">
                          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground mr-4">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{post.title}</h4>
                            <p className="text-sm text-muted-foreground">by {post.displayName || post.username}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1" title="Views">
                              <Eye className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{post.views || 0}</span>
                            </div>
                            <div className="flex items-center gap-1" title="Likes">
                              <ThumbsUp className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{post.likes || 0}</span>
                            </div>
                            <div className="flex items-center gap-1" title="Saves">
                              <Bookmark className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{post.saves || 0}</span>
                            </div>
                            <ArrowUpRight className="h-5 w-5 text-muted-foreground" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex justify-center items-center h-64">
                      <p className="text-muted-foreground">No trending posts available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {selectedPostId && (
              <TabsContent value="details">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Post Engagement Overview</CardTitle>
                      <CardDescription>
                        {engagementData?.post?.title}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {engagementLoading ? (
                        <div className="flex justify-center items-center h-64">
                          <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                      ) : engagementData ? (
                        <div className="space-y-6">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Card>
                              <CardHeader className="p-4 pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Views</CardTitle>
                              </CardHeader>
                              <CardContent className="p-4 pt-0">
                                <div className="text-2xl font-bold flex items-center">
                                  <Eye className="mr-2 h-4 w-4 text-muted-foreground" />
                                  {engagementData.interactionBreakdown.views}
                                </div>
                              </CardContent>
                            </Card>
                            <Card>
                              <CardHeader className="p-4 pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Likes</CardTitle>
                              </CardHeader>
                              <CardContent className="p-4 pt-0">
                                <div className="text-2xl font-bold flex items-center">
                                  <ThumbsUp className="mr-2 h-4 w-4 text-muted-foreground" />
                                  {engagementData.interactionBreakdown.likes}
                                </div>
                              </CardContent>
                            </Card>
                            <Card>
                              <CardHeader className="p-4 pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Saves</CardTitle>
                              </CardHeader>
                              <CardContent className="p-4 pt-0">
                                <div className="text-2xl font-bold flex items-center">
                                  <Bookmark className="mr-2 h-4 w-4 text-muted-foreground" />
                                  {engagementData.interactionBreakdown.saves}
                                </div>
                              </CardContent>
                            </Card>
                            <Card>
                              <CardHeader className="p-4 pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Comments</CardTitle>
                              </CardHeader>
                              <CardContent className="p-4 pt-0">
                                <div className="text-2xl font-bold flex items-center">
                                  <MessageSquare className="mr-2 h-4 w-4 text-muted-foreground" />
                                  {engagementData.interactionBreakdown.comments}
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                          
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-lg">Engagement Rate</CardTitle>
                              <CardDescription>{engagementData.engagementRate}%</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm text-muted-foreground">
                                Calculated as (likes + saves + comments) / views * 100
                              </p>
                            </CardContent>
                          </Card>
                        </div>
                      ) : (
                        <p>No engagement data available</p>
                      )}
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Interaction Distribution</CardTitle>
                      <CardDescription>
                        Breakdown of user interactions with your post
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {engagementLoading ? (
                        <div className="flex justify-center items-center h-64">
                          <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                      ) : engagementData ? (
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={formatEngagementForPieChart()}
                                cx="50%"
                                cy="50%"
                                labelLine={true}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {formatEngagementForPieChart().map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <p>No interaction data available</p>
                      )}
                    </CardContent>
                  </Card>
                  
                  {engagementData && (
                    <>
                      <Card className="lg:col-span-2">
                        <CardHeader>
                          <CardTitle>Recent Likes</CardTitle>
                          <CardDescription>Users who liked this post</CardDescription>
                        </CardHeader>
                        <CardContent>
                          {engagementData.likeDetails.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {engagementData.likeDetails.slice(0, 6).map((like: any) => (
                                <div key={like.id} className="flex items-center space-x-4 p-2 border rounded-lg">
                                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    {like.displayName?.charAt(0) || like.username.charAt(0)}
                                  </div>
                                  <div>
                                    <p className="font-medium">{like.displayName || like.username}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {new Date(like.createdAt).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-muted-foreground">No likes yet</p>
                          )}
                        </CardContent>
                      </Card>
                      
                      <Card className="lg:col-span-2">
                        <CardHeader>
                          <CardTitle>Recent Saves</CardTitle>
                          <CardDescription>Users who saved this post</CardDescription>
                        </CardHeader>
                        <CardContent>
                          {engagementData.saveDetails.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {engagementData.saveDetails.slice(0, 6).map((save: any) => (
                                <div key={save.id} className="flex items-center space-x-4 p-2 border rounded-lg">
                                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    {save.displayName?.charAt(0) || save.username.charAt(0)}
                                  </div>
                                  <div>
                                    <p className="font-medium">{save.displayName || save.username}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {new Date(save.createdAt).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-muted-foreground">No saves yet</p>
                          )}
                        </CardContent>
                      </Card>
                    </>
                  )}
                </div>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </PageLayout>
  );
}