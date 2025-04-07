import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { getAIChatResponse, getHomeworkHelp, summarizeContent } from "./openai";
import { getPerplexityResponse, getHomeworkHelp as getPerplexityHomeworkHelp, streamPerplexityResponse, analyzeEducationalContent } from "./perplexity";
import { getGeminiResponse, getHomeworkHelp as getGeminiHomeworkHelp, analyzeEducationalContent as analyzeWithGemini } from "./gemini";
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { 
  insertUserSchema, 
  insertProfileSchema, 
  insertPostSchema, 
  insertLikeSchema, 
  insertFollowSchema, 
  insertSaveSchema, 
  insertChatMessageSchema 
} from '@shared/schema';
import { setupAuth } from "./auth";

import fs from 'fs';
import path from 'path';

// Load subjects.json for reference
const subjectsFilePath = path.join(import.meta.dirname, '..', 'shared', 'subjects.json');
const subjects = JSON.parse(fs.readFileSync(subjectsFilePath, 'utf8'));

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);
  
  // API routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Get subjects
  app.get('/api/subjects', (req, res) => {
    res.json(subjects);
  });

  app.get('/api/users/:username', async (req, res) => {
    const username = req.params.username;
    
    const user = await storage.getUserByUsername(username);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const { password, ...userWithoutPassword } = user;
    
    // Get user profile
    const profile = await storage.getProfile(user.id);
    
    // Get user posts (only public posts for non-authenticated users)
    const posts = await storage.getUserPosts(user.id);
    const publicPosts = posts.filter(post => post.visibility === 'public');
    
    // Get follower/following counts
    const followers = await storage.getFollowersByUser(user.id);
    const following = await storage.getFollowingByUser(user.id);
    
    res.json({
      user: userWithoutPassword,
      profile,
      posts: publicPosts,
      followerCount: followers.length,
      followingCount: following.length
    });
  });

  // Profile routes
  app.get('/api/profiles/me', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const profile = await storage.getProfile(req.user.id);
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    
    res.json(profile);
  });

  app.post('/api/profiles', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    try {
      // Check if profile already exists
      const existingProfile = await storage.getProfile(req.user.id);
      if (existingProfile) {
        return res.status(400).json({ message: 'Profile already exists' });
      }
      
      const profileData = insertProfileSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const profile = await storage.createProfile(profileData);
      res.status(201).json(profile);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });

  app.put('/api/profiles/me', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    try {
      const updatedProfile = await storage.updateProfile(req.user.id, req.body);
      if (!updatedProfile) {
        return res.status(404).json({ message: 'Profile not found' });
      }
      
      res.json(updatedProfile);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });

  // Post routes
  app.get('/api/posts', async (req, res) => {
    const { subject, search } = req.query;
    
    if (search) {
      const searchResults = await storage.searchPosts(
        search as string,
        subject as string | undefined
      );
      return res.json(searchResults);
    }
    
    if (subject) {
      const posts = await storage.getPostsBySubject(subject as string);
      return res.json(posts);
    }
    
    const recentPosts = await storage.getRecentPosts();
    res.json(recentPosts);
  });

  app.get('/api/posts/trending', async (req, res) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const trendingPosts = await storage.getTrendingPosts(limit);
    res.json(trendingPosts);
  });
  
  app.get('/api/posts/recent', async (req, res) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const recentPosts = await storage.getRecentPosts(limit);
    res.json(recentPosts);
  });

  app.get('/api/posts/:id', async (req, res) => {
    const postId = parseInt(req.params.id);
    const post = await storage.getPost(postId);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Increment view count
    await storage.incrementPostViews(postId);
    
    res.json(post);
  });

  app.post('/api/posts', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    try {
      const postData = insertPostSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const post = await storage.createPost(postData);
      res.status(201).json(post);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });

  app.put('/api/posts/:id', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const postId = parseInt(req.params.id);
    const post = await storage.getPost(postId);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    if (post.userId !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    try {
      const updatedPost = await storage.updatePost(postId, req.body);
      res.json(updatedPost);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });

  app.delete('/api/posts/:id', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const postId = parseInt(req.params.id);
    const post = await storage.getPost(postId);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    if (post.userId !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    await storage.deletePost(postId);
    res.json({ message: 'Post deleted successfully' });
  });

  // Social interaction routes
  app.post('/api/posts/:id/like', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const postId = parseInt(req.params.id);
    const userId = req.user.id;
    
    // Check if post exists
    const post = await storage.getPost(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Check if already liked
    const existingLike = await storage.getLike(userId, postId);
    if (existingLike) {
      return res.status(400).json({ message: 'Post already liked' });
    }
    
    // Create like
    const like = await storage.createLike({ userId, postId });
    res.status(201).json(like);
  });

  app.delete('/api/posts/:id/like', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const postId = parseInt(req.params.id);
    const userId = req.user.id;
    
    // Delete like
    const result = await storage.deleteLike(userId, postId);
    if (!result) {
      return res.status(404).json({ message: 'Like not found' });
    }
    
    res.json({ message: 'Like removed successfully' });
  });

  app.post('/api/posts/:id/save', async (req, res) => {
    if (!req.session?.isLoggedIn) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const postId = parseInt(req.params.id);
    
    // Check if user ID is available from the session
    if (!req.session.userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const userId = req.session.userId as number;
    
    // Check if post exists
    const post = await storage.getPost(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Check if already saved
    const existingSave = await storage.getSave(userId, postId);
    if (existingSave) {
      return res.status(400).json({ message: 'Post already saved' });
    }
    
    // Create save
    const save = await storage.createSave({ userId, postId });
    res.status(201).json(save);
  });

  app.delete('/api/posts/:id/save', async (req, res) => {
    if (!req.session?.isLoggedIn || !req.session.userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const postId = parseInt(req.params.id);
    const userId = Number(req.session.userId);
    
    // Delete save
    const result = await storage.deleteSave(userId, postId);
    if (!result) {
      return res.status(404).json({ message: 'Save not found' });
    }
    
    res.json({ message: 'Save removed successfully' });
  });

  app.post('/api/users/:id/follow', async (req, res) => {
    if (!req.session?.isLoggedIn || !req.session.userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const followedId = parseInt(req.params.id);
    const followerId = Number(req.session.userId);
    
    // Check if user exists
    const user = await storage.getUser(followedId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Can't follow yourself
    if (followedId === followerId) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }
    
    // Check if already following
    const existingFollow = await storage.getFollow(followerId, followedId);
    if (existingFollow) {
      return res.status(400).json({ message: 'Already following this user' });
    }
    
    // Create follow
    const follow = await storage.createFollow({ followerId, followedId });
    res.status(201).json(follow);
  });

  app.delete('/api/users/:id/follow', async (req, res) => {
    if (!req.session?.isLoggedIn || !req.session.userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const followedId = parseInt(req.params.id);
    const followerId = Number(req.session.userId);
    
    // Delete follow
    const result = await storage.deleteFollow(followerId, followedId);
    if (!result) {
      return res.status(404).json({ message: 'Follow not found' });
    }
    
    res.json({ message: 'Unfollowed successfully' });
  });

  // AI Chat routes
  app.post('/api/chat', async (req, res) => {
    if (!req.session?.isLoggedIn || !req.session.userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    try {
      const messageSchema = z.object({
        message: z.string().min(1),
      });
      
      const { message } = messageSchema.parse(req.body);
      const userId = Number(req.session.userId);
      
      // Save user message
      await storage.createChatMessage({ 
        userId, 
        message, 
        isUser: true 
      });
      
      // Get AI response
      const aiResponse = await getAIChatResponse(message);
      
      // Save AI response
      const savedMessage = await storage.createChatMessage({ 
        userId, 
        message: aiResponse, 
        isUser: false 
      });
      
      res.json(savedMessage);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });

  app.post('/api/chat/homework-help', async (req, res) => {
    if (!req.session?.isLoggedIn || !req.session.userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    try {
      const homeworkSchema = z.object({
        subject: z.string().min(1),
        question: z.string().min(1),
      });
      
      const { subject, question } = homeworkSchema.parse(req.body);
      const userId = Number(req.session.userId);
      
      // Save user message
      await storage.createChatMessage({ 
        userId, 
        message: `[${subject}] ${question}`, 
        isUser: true 
      });
      
      // Get AI help
      const aiResponse = await getHomeworkHelp(subject, question);
      
      // Save AI response
      const savedMessage = await storage.createChatMessage({ 
        userId, 
        message: aiResponse, 
        isUser: false 
      });
      
      res.json(savedMessage);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });

  app.get('/api/chat/history', async (req, res) => {
    if (!req.session?.isLoggedIn || !req.session.userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const userId = Number(req.session.userId);
    const messages = await storage.getChatMessagesByUser(userId);
    
    res.json(messages);
  });

  // Content analysis route for SEO and post improvements
  app.post('/api/content/analyze', async (req, res) => {
    if (!req.session?.isLoggedIn) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    try {
      const contentSchema = z.object({
        content: z.string().min(10),
      });
      
      const { content } = contentSchema.parse(req.body);
      
      const analysis = await summarizeContent(content);
      res.json(analysis);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });

  // Perplexity API Routes
  app.post('/api/perplexity/chat', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    try {
      const messageSchema = z.object({
        message: z.string().min(1),
        systemInstruction: z.string().optional(),
      });
      
      const { message, systemInstruction } = messageSchema.parse(req.body);
      const userId = req.user.id;
      
      // Get Perplexity response
      const aiResponse = await getPerplexityResponse(message, systemInstruction);
      
      // Save messages to DB (first user message, then AI response)
      await storage.createChatMessage({ 
        userId, 
        message, 
        isUser: true 
      });
      
      const savedMessage = await storage.createChatMessage({ 
        userId, 
        message: aiResponse, 
        isUser: false 
      });
      
      res.json({
        message: aiResponse,
        id: savedMessage.id,
        createdAt: savedMessage.createdAt
      });
    } catch (error) {
      console.error('Perplexity API error:', error);
      res.status(500).json({ message: (error as Error).message });
    }
  });

  // Streaming chat route with Perplexity
  app.post('/api/perplexity/chat/stream', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    try {
      const messageSchema = z.object({
        message: z.string().min(1),
        systemInstruction: z.string().optional(),
      });
      
      const { message, systemInstruction } = messageSchema.parse(req.body);
      
      // Save user message to DB
      await storage.createChatMessage({ 
        userId: req.user.id, 
        message, 
        isUser: true 
      });
      
      // Stream the response back to the client
      await streamPerplexityResponse(message, res, systemInstruction);
      
      // Note: We don't save the AI response here since we're streaming it
      // The client should handle saving the complete response
    } catch (error) {
      console.error('Perplexity streaming error:', error);
      res.status(500).json({ message: (error as Error).message });
    }
  });

  // Homework help with Perplexity
  app.post('/api/perplexity/homework', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    try {
      const homeworkSchema = z.object({
        subject: z.string().min(1),
        question: z.string().min(1),
      });
      
      const { subject, question } = homeworkSchema.parse(req.body);
      const userId = req.user.id;
      
      // Save user message
      await storage.createChatMessage({ 
        userId, 
        message: `[${subject}] ${question}`, 
        isUser: true 
      });
      
      // Get Perplexity homework help
      const aiResponse = await getPerplexityHomeworkHelp(subject, question);
      
      // Save AI response
      const savedMessage = await storage.createChatMessage({ 
        userId, 
        message: aiResponse, 
        isUser: false 
      });
      
      res.json({
        message: aiResponse,
        id: savedMessage.id,
        createdAt: savedMessage.createdAt
      });
    } catch (error) {
      console.error('Perplexity homework help error:', error);
      res.status(500).json({ message: (error as Error).message });
    }
  });

  // Content analysis with Perplexity
  app.post('/api/perplexity/analyze', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    try {
      const contentSchema = z.object({
        content: z.string().min(10),
      });
      
      const { content } = contentSchema.parse(req.body);
      
      // Get analysis from Perplexity
      const analysis = await analyzeEducationalContent(content);
      res.json(analysis);
    } catch (error) {
      console.error('Perplexity content analysis error:', error);
      res.status(500).json({ message: (error as Error).message });
    }
  });

  // Gemini API Routes
  app.post('/api/gemini/chat', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    try {
      const messageSchema = z.object({
        message: z.string().min(1),
        systemInstruction: z.string().optional(),
      });
      
      const { message, systemInstruction } = messageSchema.parse(req.body);
      const userId = req.user.id;
      
      // Get Gemini response
      const aiResponse = await getGeminiResponse(message, systemInstruction);
      
      // Save messages to DB (first user message, then AI response)
      await storage.createChatMessage({ 
        userId, 
        message, 
        isUser: true 
      });
      
      const savedMessage = await storage.createChatMessage({ 
        userId, 
        message: aiResponse, 
        isUser: false 
      });
      
      res.json({
        message: aiResponse,
        id: savedMessage.id,
        createdAt: savedMessage.createdAt
      });
    } catch (error) {
      console.error('Gemini API error:', error);
      res.status(500).json({ message: (error as Error).message });
    }
  });

  // Homework help with Gemini
  app.post('/api/gemini/homework', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    try {
      const homeworkSchema = z.object({
        subject: z.string().min(1),
        question: z.string().min(1),
      });
      
      const { subject, question } = homeworkSchema.parse(req.body);
      const userId = req.user.id;
      
      // Get Gemini homework help
      const aiResponse = await getGeminiHomeworkHelp(subject, question);
      
      // Save messages to DB
      await storage.createChatMessage({ 
        userId, 
        message: `[${subject}] ${question}`, 
        isUser: true 
      });
      
      const savedMessage = await storage.createChatMessage({ 
        userId, 
        message: aiResponse, 
        isUser: false 
      });
      
      res.json({
        message: aiResponse,
        id: savedMessage.id,
        createdAt: savedMessage.createdAt
      });
    } catch (error) {
      console.error('Gemini homework help error:', error);
      res.status(500).json({ message: (error as Error).message });
    }
  });

  // Content analysis with Gemini
  app.post('/api/gemini/analyze', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    try {
      const contentSchema = z.object({
        content: z.string().min(10),
      });
      
      const { content } = contentSchema.parse(req.body);
      
      // Get analysis from Gemini
      const analysis = await analyzeWithGemini(content);
      res.json(analysis);
    } catch (error) {
      console.error('Gemini content analysis error:', error);
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  // Analytics routes
  app.get('/api/analytics/posts', async (req, res) => {
    if (!req.session?.isLoggedIn || !req.session.userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    try {
      const userId = Number(req.session.userId);
      
      // Get performance metrics for user's posts
      const postMetrics = await storage.getPostAnalytics(userId);
      
      res.json(postMetrics);
    } catch (error) {
      console.error('Post analytics error:', error);
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  app.get('/api/analytics/trending', async (req, res) => {
    try {
      // Get trending posts with analytics data
      const trendingPosts = await storage.getTrendingPostsWithMetrics(10);
      
      res.json(trendingPosts);
    } catch (error) {
      console.error('Trending posts analytics error:', error);
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  app.get('/api/analytics/user-engagement/:id', async (req, res) => {
    if (!req.session?.isLoggedIn || !req.session.userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    try {
      const postId = parseInt(req.params.id);
      if (isNaN(postId)) {
        return res.status(400).json({ message: 'Invalid post ID' });
      }
      
      // Get detailed engagement metrics for a specific post
      const engagementMetrics = await storage.getPostEngagementMetrics(postId);
      
      res.json(engagementMetrics);
    } catch (error) {
      console.error('Post engagement analytics error:', error);
      res.status(500).json({ message: (error as Error).message });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
