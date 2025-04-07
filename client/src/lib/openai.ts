import { ChatMessage, saveChatMessageToStorage, loadChatHistoryFromStorage } from './chatStorageService';
import { loadUserFromLocalStorage } from './localAuth';

// Define a constant for the API endpoint
const API_URL = '/api/chat/message';

// OpenAI chat completion function that uses both server API and fallback to local storage
export async function sendChatMessage(message: string) {
  const user = loadUserFromLocalStorage();
  
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  try {
    // First try server API
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, userId: user.id }),
    });
    
    if (!response.ok) {
      throw new Error('Server API failed');
    }
    
    const data = await response.json();
    
    // Save both messages to local storage for persistence
    const userMessage = saveChatMessageToStorage(user.id, {
      role: 'user',
      content: message,
      userId: user.id
    });
    
    const assistantMessage = saveChatMessageToStorage(user.id, {
      role: 'assistant',
      content: data.message,
      userId: user.id
    });
    
    return {
      userMessage,
      assistantMessage
    };
  } catch (error) {
    console.warn('Server API failed, using local fallback', error);
    
    // Use fallback - save user message to local storage
    const userMessage = saveChatMessageToStorage(user.id, {
      role: 'user',
      content: message,
      userId: user.id
    });
    
    // Generate local fallback response
    const responseText = generateLocalResponse(message);
    
    // Save assistant message to local storage
    const assistantMessage = saveChatMessageToStorage(user.id, {
      role: 'assistant',
      content: responseText,
      userId: user.id
    });
    
    return {
      userMessage,
      assistantMessage
    };
  }
}

// Function to get chat history for the current user
export async function getChatHistory(): Promise<ChatMessage[]> {
  const user = loadUserFromLocalStorage();
  
  if (!user) {
    return [];
  }
  
  try {
    // First attempt to get from server
    const response = await fetch('/api/chat/history');
    
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.warn('Failed to fetch chat history from server', error);
  }
  
  // Fallback to local storage
  return loadChatHistoryFromStorage(user.id);
}

// Function to get homework help with subject-specific knowledge
export async function getHomeworkHelp(subject: string, question: string) {
  const user = loadUserFromLocalStorage();
  
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  try {
    // Try server API first
    const response = await fetch('/api/homework/help', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        subject, 
        question,
        userId: user.id 
      }),
    });
    
    if (!response.ok) {
      throw new Error('Server API failed');
    }
    
    const data = await response.json();
    
    // Save both messages to local storage
    const userMessage = saveChatMessageToStorage(user.id, {
      role: 'user',
      content: `[${subject}] ${question}`,
      userId: user.id
    });
    
    const assistantMessage = saveChatMessageToStorage(user.id, {
      role: 'assistant',
      content: data.answer,
      userId: user.id
    });
    
    return {
      userMessage,
      assistantMessage
    };
  } catch (error) {
    console.warn('Server API failed, using local fallback', error);
    
    // Use fallback - save user message to local storage
    const userMessage = saveChatMessageToStorage(user.id, {
      role: 'user',
      content: `[${subject}] ${question}`,
      userId: user.id
    });
    
    // Generate subject-specific local fallback response
    const responseText = generateHomeworkHelp(subject, question);
    
    // Save assistant message to local storage
    const assistantMessage = saveChatMessageToStorage(user.id, {
      role: 'assistant',
      content: responseText,
      userId: user.id
    });
    
    return {
      userMessage,
      assistantMessage
    };
  }
}

// Function to analyze content and provide insights
export async function analyzeContent(content: string) {
  const user = loadUserFromLocalStorage();
  
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  try {
    // Try server API first
    const response = await fetch('/api/analyze/content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        content,
        userId: user.id 
      }),
    });
    
    if (!response.ok) {
      throw new Error('Server API failed');
    }
    
    return await response.json();
  } catch (error) {
    console.warn('Server API failed, using local fallback', error);
    
    // Generate local fallback analysis
    return {
      summary: generateSummary(content),
      keyPoints: extractKeyPoints(content),
      readabilityScore: calculateReadabilityScore(content),
      suggestions: generateSuggestions(content)
    };
  }
}

// --- Local fallback functions ---

// Function to generate a local response when server is unavailable
function generateLocalResponse(message: string): string {
  message = message.toLowerCase();
  
  // Check for common question patterns
  if (message.includes('hello') || message.includes('hi ') || message.includes('hey')) {
    return "Hello! I'm your educational assistant. How can I help you with your studies today?";
  }
  
  if (message.includes('how are you')) {
    return "I'm functioning well and ready to assist with your educational needs. What can I help you with?";
  }
  
  if (message.includes('help with') || message.includes('homework') || message.includes('assignment')) {
    return "I'd be happy to help with your assignment. Could you provide some more details about the specific subject and question?";
  }
  
  if (message.includes('math') || message.includes('equation') || message.includes('solve')) {
    return "For math problems, I'd normally work through the solution step by step. To better assist you, could you write out the complete problem you're trying to solve?";
  }
  
  if (message.includes('history') || message.includes('historical')) {
    return "History questions are fascinating. Could you specify which historical period, event, or figure you're asking about?";
  }
  
  if (message.includes('science') || message.includes('scientific') || message.includes('physics') || message.includes('chemistry') || message.includes('biology')) {
    return "For science questions, I can help explain concepts, processes, or theories. Could you clarify which specific scientific topic you're interested in?";
  }
  
  if (message.includes('literature') || message.includes('book') || message.includes('novel') || message.includes('poem')) {
    return "Literature analysis is one of my specialties. Which work are you studying, and what aspects would you like to explore?";
  }
  
  if (message.includes('thank')) {
    return "You're welcome! Don't hesitate to ask if you need any more assistance with your studies.";
  }
  
  // Default response for other queries
  return "I'm here to help with your educational questions. To provide the most relevant assistance, could you specify which subject you're studying and what specific question you have?";
}

// Generate subject-specific homework help
function generateHomeworkHelp(subject: string, question: string): string {
  subject = subject.toLowerCase();
  
  if (subject.includes('math')) {
    return "For this math problem, I would normally break it down step by step, identifying the key concepts needed and walking through the solution process. Since we're operating offline right now, I recommend applying relevant formulas, checking your work, and comparing with similar examples in your textbook.";
  }
  
  if (subject.includes('physics')) {
    return "This physics question likely involves understanding key principles, identifying relevant equations, and methodically working through the problem. When online, I could provide more specific guidance about force, energy, momentum, or other physics topics relevant to your question.";
  }
  
  if (subject.includes('chemistry')) {
    return "Chemistry questions often involve understanding reactions, molecular structures, or chemical properties. I would typically walk you through the concepts, balancing equations if needed, and explaining the underlying principles.";
  }
  
  if (subject.includes('biology')) {
    return "In biology, understanding processes, systems, and relationships is key. Your question likely involves cellular processes, ecological relationships, or physiological systems. I would normally explain the relevant concepts and how they apply to your specific question.";
  }
  
  if (subject.includes('history')) {
    return "Historical analysis involves understanding context, causes, effects, and perspectives. When examining historical events or figures, consider the economic, social, political, and cultural factors involved. Primary and secondary sources would help provide a more complete picture.";
  }
  
  if (subject.includes('literature') || subject.includes('english')) {
    return "Literary analysis involves examining themes, characters, symbolism, and context. Consider the author's purpose, the historical context, and how literary devices contribute to meaning. Look for textual evidence to support your interpretations.";
  }
  
  if (subject.includes('language') || subject.includes('spanish') || subject.includes('french')) {
    return "Language learning involves vocabulary, grammar rules, and cultural context. Practice is essential, as is understanding how the grammatical structures differ from your native language. Context and usage examples can help solidify your understanding.";
  }
  
  // Default response
  return "To address this homework question effectively, I'd break down the problem, identify key concepts, and work through a step-by-step solution. When we're back online, I can provide more specific guidance tailored to your exact question.";
}

// Function to generate a simple summary of text content
function generateSummary(content: string): string {
  if (content.length < 100) {
    return content;
  }
  
  // Very basic summarization - first few sentences
  const sentences = content.split(/[.!?]/).filter(s => s.trim().length > 0);
  const summaryLength = Math.min(3, Math.ceil(sentences.length / 3));
  return sentences.slice(0, summaryLength).join('. ') + '.';
}

// Extract key points from text
function extractKeyPoints(content: string): string[] {
  const sentences = content.split(/[.!?]/).filter(s => s.trim().length > 0);
  const keywordIndicators = ['important', 'significant', 'key', 'essential', 'critical', 'crucial', 'primary', 'major'];
  
  return sentences
    .filter(sentence => {
      return keywordIndicators.some(keyword => sentence.toLowerCase().includes(keyword));
    })
    .map(sentence => sentence.trim())
    .slice(0, 5);
}

// Calculate simple readability score
function calculateReadabilityScore(content: string): number {
  const words = content.split(/\s+/).filter(w => w.length > 0);
  const sentences = content.split(/[.!?]/).filter(s => s.trim().length > 0);
  const avgWordsPerSentence = words.length / Math.max(1, sentences.length);
  
  // Simple formula - higher score for shorter sentences (max 100)
  return Math.min(100, Math.max(0, 100 - (avgWordsPerSentence - 10) * 5));
}

// Generate suggestions for content improvement
function generateSuggestions(content: string): string[] {
  const suggestions = [];
  
  if (content.split(/\s+/).filter(w => w.length > 0).length < 100) {
    suggestions.push("Consider adding more detail to fully develop your ideas.");
  }
  
  if (content.split(/[.!?]/).filter(s => s.trim().length > 0).length < 5) {
    suggestions.push("Breaking your content into more sentences could improve readability.");
  }
  
  if (!content.includes(',')) {
    suggestions.push("Using commas appropriately can add clarity to your sentences.");
  }
  
  if (content.toUpperCase() === content) {
    suggestions.push("Avoid using all capital letters as it can be perceived as shouting.");
  }
  
  // Always provide at least one suggestion
  if (suggestions.length === 0) {
    suggestions.push("Consider reviewing your content for clarity and coherence.");
  }
  
  return suggestions;
}