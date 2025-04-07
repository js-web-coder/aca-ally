import { loadUserFromLocalStorage } from './localAuth';

// Local storage keys
const RECOMMENDATIONS_STORAGE_KEY = '129ghm6bacacllyrc18.json';
const RECOMMENDATION_LIKES_KEY = '129ghm6bacacllyrc19.json';

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  category: 'math' | 'science' | 'literature' | 'history' | 'languages' | 'arts' | 'programming';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedMinutes: number;
  relevanceScore: number; // 0-100
  thumbnailUrl?: string;
  tags: string[];
  createdAt: string;
  userRating?: 'like' | 'dislike'; // User's rating
}

export interface RecommendationSet {
  userId: number;
  recommendations: Recommendation[];
  lastUpdated: string;
}

/**
 * Generate a set of mock recommendations based on user interests
 * In a real app, this would call an AI service
 */
function generateRecommendations(userId: number, interests?: string): Recommendation[] {
  // Parse interests if provided
  const interestArray = interests ? 
    interests.split(',').map(i => i.trim().toLowerCase()) : 
    ['math', 'science'];
  
  // Generate recommendations based on interests
  const recommendations: Recommendation[] = [];
  
  // Mock recommendation templates
  const templates = [
    {
      category: 'math',
      items: [
        { title: 'Mastering Algebra Fundamentals', difficulty: 'beginner', minutes: 30 },
        { title: 'Calculus: Derivatives and Integrals', difficulty: 'intermediate', minutes: 45 },
        { title: 'Advanced Probability Theory', difficulty: 'advanced', minutes: 60 },
      ]
    },
    {
      category: 'science',
      items: [
        { title: 'Introduction to Physics', difficulty: 'beginner', minutes: 35 },
        { title: 'Chemistry Lab Techniques', difficulty: 'intermediate', minutes: 40 },
        { title: 'Quantum Mechanics: Core Concepts', difficulty: 'advanced', minutes: 55 },
      ]
    },
    {
      category: 'literature',
      items: [
        { title: 'Literary Analysis Basics', difficulty: 'beginner', minutes: 25 },
        { title: 'Shakespeare: Themes and Motifs', difficulty: 'intermediate', minutes: 40 },
        { title: 'Postmodern Literature Critique', difficulty: 'advanced', minutes: 50 },
      ]
    },
    {
      category: 'history',
      items: [
        { title: 'Ancient Civilizations Overview', difficulty: 'beginner', minutes: 30 },
        { title: 'World War II: Causes and Effects', difficulty: 'intermediate', minutes: 45 },
        { title: 'Analyzing Historical Primary Sources', difficulty: 'advanced', minutes: 35 },
      ]
    },
    {
      category: 'languages',
      items: [
        { title: 'Spanish for Beginners', difficulty: 'beginner', minutes: 20 },
        { title: 'French Grammar and Vocabulary', difficulty: 'intermediate', minutes: 35 },
        { title: 'Advanced Mandarin Conversation', difficulty: 'advanced', minutes: 40 },
      ]
    },
    {
      category: 'arts',
      items: [
        { title: 'Drawing Basics: Shapes and Lines', difficulty: 'beginner', minutes: 25 },
        { title: 'Color Theory in Painting', difficulty: 'intermediate', minutes: 30 },
        { title: 'Advanced Composition Techniques', difficulty: 'advanced', minutes: 45 },
      ]
    },
    {
      category: 'programming',
      items: [
        { title: 'Introduction to Python', difficulty: 'beginner', minutes: 40 },
        { title: 'Data Structures and Algorithms', difficulty: 'intermediate', minutes: 55 },
        { title: 'Building Neural Networks', difficulty: 'advanced', minutes: 65 },
      ]
    },
  ];
  
  // For each interest category, add recommendations
  for (const interest of interestArray) {
    const template = templates.find(t => t.category === interest) || templates[0];
    
    for (const item of template.items) {
      recommendations.push({
        id: `rec_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        title: item.title,
        description: `Learn about ${item.title.toLowerCase()} through interactive lessons and exercises.`,
        category: template.category as any,
        difficulty: item.difficulty as any,
        estimatedMinutes: item.minutes,
        relevanceScore: Math.floor(70 + Math.random() * 30), // 70-100
        thumbnailUrl: `https://api.dicebear.com/7.x/shapes/svg?seed=${template.category}_${item.difficulty}`,
        tags: [template.category, item.difficulty, 'educational'],
        createdAt: new Date().toISOString()
      });
    }
  }
  
  // Sort by relevance score
  return recommendations.sort((a, b) => b.relevanceScore - a.relevanceScore).slice(0, 6);
}

/**
 * Load recommendations from local storage or generate new ones
 */
export function loadRecommendations(): Recommendation[] {
  const user = loadUserFromLocalStorage();
  if (!user) return [];
  
  try {
    // First try to get from local storage
    const storedData = localStorage.getItem(RECOMMENDATIONS_STORAGE_KEY);
    let recommendations: Recommendation[] = [];
    
    if (storedData) {
      const storedSets = JSON.parse(storedData) as RecommendationSet[];
      const userSet = storedSets.find(set => set.userId === user.id);
      
      if (userSet) {
        // Check if recommendations are recent (less than 24 hours old)
        const lastUpdated = new Date(userSet.lastUpdated).getTime();
        const now = new Date().getTime();
        const hoursSinceUpdate = (now - lastUpdated) / (1000 * 60 * 60);
        
        if (hoursSinceUpdate < 24) {
          recommendations = userSet.recommendations;
        }
      }
    }
    
    // If not in storage or expired, generate new recommendations
    if (recommendations.length === 0) {
      recommendations = generateRecommendations(user.id, user.interests);
      saveRecommendations(user.id, recommendations);
    }
    
    // Add liked status to each recommendation
    return recommendations.map(rec => ({
      ...rec,
      userRating: isRecommendationLiked(rec.id) ? 'like' : undefined
    }));
  } catch (error) {
    console.error('Error loading recommendations:', error);
    return [];
  }
}

/**
 * Save recommendations to local storage
 */
export function saveRecommendations(userId: number, recommendations: Recommendation[]): void {
  try {
    // Get existing data
    const storedData = localStorage.getItem(RECOMMENDATIONS_STORAGE_KEY);
    let storedSets: RecommendationSet[] = [];
    
    if (storedData) {
      storedSets = JSON.parse(storedData) as RecommendationSet[];
    }
    
    // Find user's set or create new one
    const userSetIndex = storedSets.findIndex(set => set.userId === userId);
    const newSet: RecommendationSet = {
      userId,
      recommendations,
      lastUpdated: new Date().toISOString()
    };
    
    if (userSetIndex >= 0) {
      storedSets[userSetIndex] = newSet;
    } else {
      storedSets.push(newSet);
    }
    
    // Save back to storage
    localStorage.setItem(RECOMMENDATIONS_STORAGE_KEY, JSON.stringify(storedSets));
  } catch (error) {
    console.error('Error saving recommendations:', error);
  }
}

/**
 * Generate new recommendations for the current user
 */
export function refreshRecommendations(): Recommendation[] {
  const user = loadUserFromLocalStorage();
  if (!user) return [];
  
  const newRecommendations = generateRecommendations(user.id, user.interests);
  saveRecommendations(user.id, newRecommendations);
  
  // Add liked status to each recommendation
  return newRecommendations.map(rec => ({
    ...rec,
    userRating: isRecommendationLiked(rec.id) ? 'like' : undefined
  }));
}

/**
 * Rate a recommendation to improve future suggestions
 */
export function rateRecommendation(recommendationId: string, rating: 'like' | 'dislike'): void {
  const user = loadUserFromLocalStorage();
  if (!user) return;
  
  // In a real app, this would send the rating to an AI service
  console.log(`User ${user.id} ${rating}d recommendation ${recommendationId}`);
  
  try {
    // Save to likes storage specifically
    if (rating === 'like') {
      saveLikedRecommendation(recommendationId);
    } else {
      removeLikedRecommendation(recommendationId);
    }
    
    // Also save to general feedback storage
    const feedbackKey = '129ghm6bacacllyfd28.json';
    const storedFeedback = localStorage.getItem(feedbackKey) || '{}';
    const feedback = JSON.parse(storedFeedback);
    
    // Add this rating
    if (!feedback[user.id]) {
      feedback[user.id] = {};
    }
    feedback[user.id][recommendationId] = rating;
    
    // Save back to storage
    localStorage.setItem(feedbackKey, JSON.stringify(feedback));
  } catch (error) {
    console.error('Error saving recommendation feedback:', error);
  }
}

/**
 * Save a recommendation ID to the user's liked recommendations
 */
export function saveLikedRecommendation(recommendationId: string): void {
  const user = loadUserFromLocalStorage();
  if (!user) return;
  
  try {
    // Get existing liked recommendations
    const storedData = localStorage.getItem(RECOMMENDATION_LIKES_KEY) || '{}';
    const likedRecommendations = JSON.parse(storedData);
    
    // Initialize user's liked recommendations if needed
    if (!likedRecommendations[user.id]) {
      likedRecommendations[user.id] = [];
    }
    
    // Add recommendation ID if not already in the list
    if (!likedRecommendations[user.id].includes(recommendationId)) {
      likedRecommendations[user.id].push(recommendationId);
    }
    
    // Save back to storage
    localStorage.setItem(RECOMMENDATION_LIKES_KEY, JSON.stringify(likedRecommendations));
  } catch (error) {
    console.error('Error saving liked recommendation:', error);
  }
}

/**
 * Remove a recommendation ID from the user's liked recommendations
 */
export function removeLikedRecommendation(recommendationId: string): void {
  const user = loadUserFromLocalStorage();
  if (!user) return;
  
  try {
    // Get existing liked recommendations
    const storedData = localStorage.getItem(RECOMMENDATION_LIKES_KEY) || '{}';
    const likedRecommendations = JSON.parse(storedData);
    
    // Remove recommendation ID if present
    if (likedRecommendations[user.id]) {
      likedRecommendations[user.id] = likedRecommendations[user.id].filter(
        (id: string) => id !== recommendationId
      );
    }
    
    // Save back to storage
    localStorage.setItem(RECOMMENDATION_LIKES_KEY, JSON.stringify(likedRecommendations));
  } catch (error) {
    console.error('Error removing liked recommendation:', error);
  }
}

/**
 * Check if a recommendation is liked by the current user
 */
export function isRecommendationLiked(recommendationId: string): boolean {
  const user = loadUserFromLocalStorage();
  if (!user) return false;
  
  try {
    // Get existing liked recommendations
    const storedData = localStorage.getItem(RECOMMENDATION_LIKES_KEY) || '{}';
    const likedRecommendations = JSON.parse(storedData);
    
    // Check if recommendation ID is in the liked list
    return likedRecommendations[user.id] && 
           likedRecommendations[user.id].includes(recommendationId);
  } catch (error) {
    console.error('Error checking liked recommendation:', error);
    return false;
  }
}