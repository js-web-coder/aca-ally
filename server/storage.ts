import { 
  users, type User, type InsertUser,
  profiles, type Profile, type InsertProfile,
  posts, type Post, type InsertPost,
  likes, type Like, type InsertLike,
  follows, type Follow, type InsertFollow,
  saves, type Save, type InsertSave,
  chatMessages, type ChatMessage, type InsertChatMessage
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, like, or, sql } from "drizzle-orm";

// Define the storage interface
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  verifyUserEmail(userId: number): Promise<User | undefined>;
  
  // Profile methods
  getProfile(userId: number): Promise<Profile | undefined>;
  createProfile(profile: InsertProfile): Promise<Profile>;
  updateProfile(userId: number, profile: Partial<Profile>): Promise<Profile | undefined>;
  
  // Post methods
  getPost(id: number): Promise<Post | undefined>;
  createPost(post: InsertPost): Promise<Post>;
  updatePost(id: number, post: Partial<Post>): Promise<Post | undefined>;
  deletePost(id: number): Promise<boolean>;
  getUserPosts(userId: number): Promise<Post[]>;
  getTrendingPosts(limit?: number): Promise<Post[]>;
  getRecentPosts(limit?: number): Promise<Post[]>;
  getPostsBySubject(subject: string, limit?: number): Promise<Post[]>;
  incrementPostViews(postId: number): Promise<Post | undefined>;
  searchPosts(query: string, subject?: string): Promise<Post[]>;
  
  // Like methods
  getLike(userId: number, postId: number): Promise<Like | undefined>;
  createLike(like: InsertLike): Promise<Like>;
  deleteLike(userId: number, postId: number): Promise<boolean>;
  getLikesByPost(postId: number): Promise<Like[]>;
  getLikesByUser(userId: number): Promise<Like[]>;
  
  // Follow methods
  getFollow(followerId: number, followedId: number): Promise<Follow | undefined>;
  createFollow(follow: InsertFollow): Promise<Follow>;
  deleteFollow(followerId: number, followedId: number): Promise<boolean>;
  getFollowersByUser(userId: number): Promise<Follow[]>;
  getFollowingByUser(userId: number): Promise<Follow[]>;
  
  // Save methods
  getSave(userId: number, postId: number): Promise<Save | undefined>;
  createSave(save: InsertSave): Promise<Save>;
  deleteSave(userId: number, postId: number): Promise<boolean>;
  getSavesByUser(userId: number): Promise<Save[]>;
  
  // Chat methods
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getChatMessagesByUser(userId: number, limit?: number): Promise<ChatMessage[]>;
  
  // Analytics methods
  getPostAnalytics(userId: number): Promise<any[]>;
  getTrendingPostsWithMetrics(limit?: number): Promise<any[]>;
  getPostEngagementMetrics(postId: number): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  async verifyUserEmail(userId: number): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ emailVerified: true })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }
  
  // Profile methods
  async getProfile(userId: number): Promise<Profile | undefined> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.userId, userId));
    return profile;
  }
  
  async createProfile(insertProfile: InsertProfile): Promise<Profile> {
    const [profile] = await db
      .insert(profiles)
      .values(insertProfile)
      .returning();
    return profile;
  }
  
  async updateProfile(userId: number, profileUpdate: Partial<Profile>): Promise<Profile | undefined> {
    const [profile] = await db
      .update(profiles)
      .set(profileUpdate)
      .where(eq(profiles.userId, userId))
      .returning();
    return profile;
  }
  
  // Post methods
  async getPost(id: number): Promise<Post | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.id, id));
    return post;
  }
  
  async createPost(insertPost: InsertPost): Promise<Post> {
    const [post] = await db
      .insert(posts)
      .values(insertPost)
      .returning();
    return post;
  }
  
  async updatePost(id: number, postUpdate: Partial<Post>): Promise<Post | undefined> {
    const [post] = await db
      .update(posts)
      .set(postUpdate)
      .where(eq(posts.id, id))
      .returning();
    return post;
  }
  
  async deletePost(id: number): Promise<boolean> {
    const result = await db
      .delete(posts)
      .where(eq(posts.id, id));
    return result.count > 0;
  }
  
  async getUserPosts(userId: number): Promise<Post[]> {
    return await db
      .select()
      .from(posts)
      .where(eq(posts.userId, userId))
      .orderBy(desc(posts.createdAt));
  }
  
  async getTrendingPosts(limit: number = 10): Promise<Post[]> {
    // Using a SQL expression to calculate trending score
    const trendingScore = sql`(${posts.likes} * 2 + ${posts.views} + ${posts.saves} * 3)`;
    
    return await db
      .select()
      .from(posts)
      .where(eq(posts.visibility, 'public'))
      .orderBy(desc(trendingScore))
      .limit(limit);
  }
  
  async getRecentPosts(limit: number = 10): Promise<Post[]> {
    return await db
      .select()
      .from(posts)
      .where(eq(posts.visibility, 'public'))
      .orderBy(desc(posts.createdAt))
      .limit(limit);
  }
  
  async getPostsBySubject(subject: string, limit: number = 10): Promise<Post[]> {
    return await db
      .select()
      .from(posts)
      .where(and(
        eq(posts.visibility, 'public'),
        eq(posts.subject, subject)
      ))
      .orderBy(desc(posts.createdAt))
      .limit(limit);
  }
  
  async incrementPostViews(postId: number): Promise<Post | undefined> {
    const [post] = await db
      .update(posts)
      .set({ views: sql`${posts.views} + 1` })
      .where(eq(posts.id, postId))
      .returning();
    return post;
  }
  
  async searchPosts(query: string, subject?: string): Promise<Post[]> {
    const conditions = [
      eq(posts.visibility, 'public'),
      or(
        like(posts.title, `%${query}%`),
        like(posts.content, `%${query}%`)
      )
    ];
    
    if (subject) {
      conditions.push(eq(posts.subject, subject));
    }
    
    return await db
      .select()
      .from(posts)
      .where(and(...conditions))
      .orderBy(desc(posts.createdAt));
  }
  
  // Like methods
  async getLike(userId: number, postId: number): Promise<Like | undefined> {
    const [like] = await db
      .select()
      .from(likes)
      .where(and(
        eq(likes.userId, userId),
        eq(likes.postId, postId)
      ));
    return like;
  }
  
  async createLike(insertLike: InsertLike): Promise<Like> {
    const [like] = await db
      .insert(likes)
      .values(insertLike)
      .returning();
      
    // Update post like count
    await db
      .update(posts)
      .set({ likes: sql`${posts.likes} + 1` })
      .where(eq(posts.id, insertLike.postId));
      
    return like;
  }
  
  async deleteLike(userId: number, postId: number): Promise<boolean> {
    const result = await db
      .delete(likes)
      .where(and(
        eq(likes.userId, userId),
        eq(likes.postId, postId)
      ));
      
    if (result.count > 0) {
      // Update post like count
      await db
        .update(posts)
        .set({ likes: sql`${posts.likes} - 1` })
        .where(and(
          eq(posts.id, postId),
          sql`${posts.likes} > 0`
        ));
      return true;
    }
    
    return false;
  }
  
  async getLikesByPost(postId: number): Promise<Like[]> {
    return await db
      .select()
      .from(likes)
      .where(eq(likes.postId, postId));
  }
  
  async getLikesByUser(userId: number): Promise<Like[]> {
    return await db
      .select()
      .from(likes)
      .where(eq(likes.userId, userId));
  }
  
  // Follow methods
  async getFollow(followerId: number, followedId: number): Promise<Follow | undefined> {
    const [follow] = await db
      .select()
      .from(follows)
      .where(and(
        eq(follows.followerId, followerId),
        eq(follows.followedId, followedId)
      ));
    return follow;
  }
  
  async createFollow(insertFollow: InsertFollow): Promise<Follow> {
    const [follow] = await db
      .insert(follows)
      .values(insertFollow)
      .returning();
    return follow;
  }
  
  async deleteFollow(followerId: number, followedId: number): Promise<boolean> {
    const result = await db
      .delete(follows)
      .where(and(
        eq(follows.followerId, followerId),
        eq(follows.followedId, followedId)
      ));
    return result.count > 0;
  }
  
  async getFollowersByUser(userId: number): Promise<Follow[]> {
    return await db
      .select()
      .from(follows)
      .where(eq(follows.followedId, userId));
  }
  
  async getFollowingByUser(userId: number): Promise<Follow[]> {
    return await db
      .select()
      .from(follows)
      .where(eq(follows.followerId, userId));
  }
  
  // Save methods
  async getSave(userId: number, postId: number): Promise<Save | undefined> {
    const [save] = await db
      .select()
      .from(saves)
      .where(and(
        eq(saves.userId, userId),
        eq(saves.postId, postId)
      ));
    return save;
  }
  
  async createSave(insertSave: InsertSave): Promise<Save> {
    const [save] = await db
      .insert(saves)
      .values(insertSave)
      .returning();
      
    // Update post save count
    await db
      .update(posts)
      .set({ saves: sql`${posts.saves} + 1` })
      .where(eq(posts.id, insertSave.postId));
      
    return save;
  }
  
  async deleteSave(userId: number, postId: number): Promise<boolean> {
    const result = await db
      .delete(saves)
      .where(and(
        eq(saves.userId, userId),
        eq(saves.postId, postId)
      ));
      
    if (result.count > 0) {
      // Update post save count
      await db
        .update(posts)
        .set({ saves: sql`${posts.saves} - 1` })
        .where(and(
          eq(posts.id, postId),
          sql`${posts.saves} > 0`
        ));
      return true;
    }
    
    return false;
  }
  
  async getSavesByUser(userId: number): Promise<Save[]> {
    return await db
      .select()
      .from(saves)
      .where(eq(saves.userId, userId));
  }
  
  // Chat methods
  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const [message] = await db
      .insert(chatMessages)
      .values(insertMessage)
      .returning();
    return message;
  }
  
  async getChatMessagesByUser(userId: number, limit: number = 50): Promise<ChatMessage[]> {
    return await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.userId, userId))
      .orderBy(chatMessages.createdAt)
      .limit(limit);
  }
  
  // Analytics methods
  async getPostAnalytics(userId: number): Promise<any[]> {
    const userPosts = await db
      .select({
        id: posts.id,
        title: posts.title,
        subject: posts.subject,
        createdAt: posts.createdAt,
        views: posts.views,
        likes: posts.likes,
        saves: posts.saves,
        comments: posts.comments
      })
      .from(posts)
      .where(eq(posts.userId, userId))
      .orderBy(desc(posts.createdAt));
      
    return userPosts;
  }
  
  async getTrendingPostsWithMetrics(limit: number = 10): Promise<any[]> {
    return await db
      .select({
        id: posts.id,
        title: posts.title,
        subject: posts.subject,
        createdAt: posts.createdAt,
        views: posts.views,
        likes: posts.likes,
        saves: posts.saves,
        comments: posts.comments,
        username: users.username,
        displayName: users.displayName
      })
      .from(posts)
      .innerJoin(users, eq(posts.userId, users.id))
      .orderBy(desc(sql`(${posts.views} + ${posts.likes} * 2 + ${posts.saves} * 3)`))
      .limit(limit);
  }
  
  async getPostEngagementMetrics(postId: number): Promise<any> {
    // Get the post with basic metrics
    const [post] = await db
      .select({
        id: posts.id,
        title: posts.title,
        subject: posts.subject,
        content: posts.content,
        createdAt: posts.createdAt,
        userId: posts.userId,
        views: posts.views,
        likes: posts.likes,
        saves: posts.saves,
        comments: posts.comments
      })
      .from(posts)
      .where(eq(posts.id, postId));
      
    if (!post) {
      throw new Error('Post not found');
    }
    
    // Get like details
    const likeDetails = await db
      .select({
        id: likes.id,
        userId: likes.userId,
        createdAt: likes.createdAt,
        username: users.username,
        displayName: users.displayName
      })
      .from(likes)
      .innerJoin(users, eq(likes.userId, users.id))
      .where(eq(likes.postId, postId))
      .orderBy(desc(likes.createdAt));
      
    // Get save details
    const saveDetails = await db
      .select({
        id: saves.id,
        userId: saves.userId,
        createdAt: saves.createdAt,
        username: users.username,
        displayName: users.displayName
      })
      .from(saves)
      .innerJoin(users, eq(saves.userId, users.id))
      .where(eq(saves.postId, postId))
      .orderBy(desc(saves.createdAt));
      
    // Calculate engagement rate (total interactions / views * 100)
    const totalInteractions = (post.likes || 0) + (post.saves || 0) + (post.comments || 0);
    const engagementRate = (post.views || 0) > 0 ? (totalInteractions / (post.views || 1) * 100).toFixed(2) : 0;
    
    return {
      post,
      likeDetails,
      saveDetails,
      engagementRate,
      interactionBreakdown: {
        likes: post.likes || 0,
        saves: post.saves || 0,
        comments: post.comments || 0,
        views: post.views || 0
      }
    };
  }
}

export const storage = new DatabaseStorage();
