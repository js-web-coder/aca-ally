import { useState, useEffect } from 'react';
import { Container } from '@/components/layout/container';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { analyzeContent } from '@/lib/openai';

// Import subjects data
import subjectsData from '@shared/subjects.json';

const postSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title must be less than 100 characters'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  subject: z.string().optional(),
  visibility: z.enum(['public', 'private', 'followers']),
});

type PostFormValues = z.infer<typeof postSchema>;

export default function NewPost() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editorContent, setEditorContent] = useState('');
  const [contentAnalysis, setContentAnalysis] = useState<{ summary?: string, keywords?: string[], readingLevel?: string } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const [_, navigate] = useLocation();

  const form = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: '',
      content: '',
      subject: '',
      visibility: 'public',
    },
  });

  // If not logged in, redirect to login page
  useEffect(() => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to create a post.',
        variant: 'destructive',
      });
      navigate('/accounts/login');
    }
  }, [user, navigate, toast]);

  // Update the form value when editor content changes
  useEffect(() => {
    form.setValue('content', editorContent, { shouldValidate: true });
  }, [editorContent, form]);

  const handleEditorChange = (value: string) => {
    setEditorContent(value);
  };

  const analyzePostContent = async () => {
    if (editorContent.length < 100) {
      toast({
        title: 'Content too short',
        description: 'Please add more content before analyzing.',
        variant: 'destructive',
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const analysis = await analyzeContent(editorContent);
      setContentAnalysis(analysis);
      toast({
        title: 'Analysis complete',
        description: 'Your content has been analyzed successfully.',
      });
    } catch (error) {
      console.error('Error analyzing content:', error);
      toast({
        title: 'Analysis failed',
        description: 'Failed to analyze your content. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const onSubmit = async (data: PostFormValues) => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      const response = await apiRequest('POST', '/api/posts', {
        ...data,
        userId: user.id,
      });

      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      
      toast({
        title: 'Post created!',
        description: 'Your post has been published successfully.',
      });
      
      navigate(`/post/${response.id}`);
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: 'Failed to create post',
        description: 'There was an error publishing your post. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return null; // Don't render anything if not logged in (will redirect)
  }

  return (
    <Container>
      <div className="max-w-4xl mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Create a New Post</h1>
        
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Post Details</CardTitle>
              <CardDescription>
                Create educational content to share with the community
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Enter a descriptive title for your post"
                  {...form.register('title')}
                  disabled={isSubmitting}
                />
                {form.formState.errors.title && (
                  <p className="text-sm text-red-500 mt-1">{form.formState.errors.title.message}</p>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Select
                    value={form.watch('subject')}
                    onValueChange={(value) => form.setValue('subject', value)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjectsData.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Visibility</Label>
                  <RadioGroup
                    defaultValue={form.watch('visibility')}
                    onValueChange={(value) => form.setValue('visibility', value as 'public' | 'private' | 'followers')}
                    className="flex flex-col space-y-1 mt-2"
                    disabled={isSubmitting}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="public" id="public" />
                      <Label htmlFor="public" className="cursor-pointer">Public</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="followers" id="followers" />
                      <Label htmlFor="followers" className="cursor-pointer">Followers Only</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="private" id="private" />
                      <Label htmlFor="private" className="cursor-pointer">Private</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
              
              <div>
                <Label>Content</Label>
                <RichTextEditor 
                  value={editorContent} 
                  onChange={handleEditorChange}
                  error={form.formState.errors.content?.message}
                />
              </div>
            </CardContent>
          </Card>
          
          {contentAnalysis && (
            <Card className="mb-6 bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800">
              <CardHeader>
                <CardTitle>Content Analysis</CardTitle>
                <CardDescription>
                  AI-powered insights to improve your post
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {contentAnalysis.summary && (
                    <div>
                      <h3 className="font-semibold">Summary</h3>
                      <p className="text-gray-700 dark:text-gray-300">{contentAnalysis.summary}</p>
                    </div>
                  )}
                  
                  {contentAnalysis.keywords && contentAnalysis.keywords.length > 0 && (
                    <div>
                      <h3 className="font-semibold">Keywords</h3>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {contentAnalysis.keywords.map((keyword, index) => (
                          <span key={index} className="px-2 py-1 bg-primary-100 dark:bg-primary-800 rounded-full text-xs">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {contentAnalysis.readingLevel && (
                    <div>
                      <h3 className="font-semibold">Reading Level</h3>
                      <p className="text-gray-700 dark:text-gray-300">{contentAnalysis.readingLevel}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
          
          <div className="flex justify-between mt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={analyzePostContent}
              disabled={isSubmitting || isAnalyzing || editorContent.length < 100}
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze Content'}
            </Button>
            
            <div className="space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/')}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Publishing...' : 'Publish Post'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Container>
  );
}
