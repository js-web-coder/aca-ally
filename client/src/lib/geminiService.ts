import { GoogleGenerativeAI } from '@google/generative-ai';
import { loadUserFromLocalStorage } from './localAuth';
import { saveChatMessageToStorage } from './chatStorageService';
import { apiRequest } from './queryClient';

interface ChatResponse {
  message: string;
  id: string;
  createdAt: string;
}

/**
 * Helper function to extract bullet points from text
 */
function extractBulletPoints(text: string): string[] {
  if (!text) return [];
  
  // Remove section headers
  const cleanText = text.replace(/^[a-zA-Z\s]+:[\s]*/g, '');
  
  // Split by bullet points (various formats)
  const bulletPoints = cleanText
    .split(/[\n\r]+/)
    .map(line => line.trim())
    .filter(line => line.match(/^[-•*]\s+/) || line.match(/^\d+[.)]\s+/))
    .map(line => line.replace(/^[-•*]\s+/, '').replace(/^\d+[.)]\s+/, ''))
    .filter(Boolean);
  
  // If no bullet points found, try to split by newlines
  if (bulletPoints.length === 0) {
    return cleanText.split(/[\n\r]+/).map(line => line.trim()).filter(Boolean);
  }
  
  return bulletPoints;
}

// Function to get the API key from settings (localStorage) or use the default
function getGeminiApiKey(): string {
  // Try to get user-provided API key from localStorage
  const userProvidedKey = localStorage.getItem('gemini_api_key');
  if (userProvidedKey) return userProvidedKey;
  
  // Fall back to the default key if it exists
  return 'AIzaSyCDGxTm05gW22cXVriugLT0QoVxronv3B8';
}

// Initialize the Gemini client with the user's API key
function initializeGeminiClient() {
  const apiKey = getGeminiApiKey();
  return new GoogleGenerativeAI(apiKey);
}

// Get the user's preferred AI model from settings
function getPreferredAIModel(): 'gemini' | 'openai' | 'perplexity' {
  const defaultModel = localStorage.getItem('default_ai_model');
  return (defaultModel as 'gemini' | 'openai' | 'perplexity') || 'gemini';
}

/**
 * Send a message to Gemini AI and get a response
 * @param message User's message
 * @param systemInstruction Optional system instruction to guide the model
 * @returns Object containing both user and assistant messages
 */
export async function sendGeminiMessage(message: string, systemInstruction?: string) {
  const user = loadUserFromLocalStorage();
  
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  try {
    // First try to use the server API
    try {
      const response = await apiRequest('POST', '/api/gemini/chat', {
        message,
        systemInstruction
      });
      
      if (!response.ok) {
        throw new Error('Failed to get response from server Gemini API');
      }
      
      const data = await response.json() as ChatResponse;
      
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
    } catch (serverError) {
      console.warn('Server API failed, using client-side Gemini API directly', serverError);
      
      // If server fails, use the client-side API directly with the user's API key
      const genAI = initializeGeminiClient();
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      const chat = model.startChat({
        generationConfig: {
          temperature: 0.2,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 1024,
        }
      });
      
      // Add system instruction if provided
      if (systemInstruction) {
        await chat.sendMessage(systemInstruction);
      }
      
      // Send the actual message
      const result = await chat.sendMessage(message);
      const aiResponse = result.response.text();
      
      // Save both messages to local storage
      const userMessage = saveChatMessageToStorage(user.id, {
        role: 'user',
        content: message,
        userId: user.id
      });
      
      const assistantMessage = saveChatMessageToStorage(user.id, {
        role: 'assistant',
        content: aiResponse,
        userId: user.id
      });
      
      return {
        userMessage,
        assistantMessage
      };
    }
  } catch (error) {
    console.warn('Gemini API failed completely, falling back to other AI services', error);
    
    // Falls back to other AI services
    throw error;
  }
}

/**
 * Get homework help from Gemini AI
 * @param subject The academic subject
 * @param question The specific homework question
 * @returns Object containing both user and assistant messages
 */
export async function getGeminiHomeworkHelp(subject: string, question: string) {
  const user = loadUserFromLocalStorage();
  
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  try {
    // First try to use the server API
    try {
      const response = await apiRequest('POST', '/api/gemini/homework', {
        subject, 
        question
      });
      
      if (!response.ok) {
        throw new Error('Failed to get homework help from server Gemini API');
      }
      
      const data = await response.json() as ChatResponse;
      
      // Save both messages to local storage for persistence
      const userMessage = saveChatMessageToStorage(user.id, {
        role: 'user',
        content: `[${subject}] ${question}`,
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
    } catch (serverError) {
      console.warn('Server API failed, using client-side Gemini API directly', serverError);
      
      // If server fails, use the client-side API directly with the user's API key
      const genAI = initializeGeminiClient();
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      
      // Create system instruction for educational context
      const systemInstruction = `You are a knowledgeable educational assistant specializing in ${subject}. 
      Provide detailed, accurate, and helpful explanations that enable learning.
      Include relevant equations, concepts, and step-by-step solutions when appropriate.
      Your responses should be educational and help students understand concepts, not just give answers.`;
      
      const prompt = `I need help with this ${subject} question: ${question}`;
      
      // Start a chat and prime it with the system instruction
      const chat = model.startChat({
        generationConfig: {
          temperature: 0.2,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 1024,
        }
      });
      
      // Prime with system instruction
      await chat.sendMessage(systemInstruction);
      
      // Send the actual question
      const result = await chat.sendMessage(prompt);
      const aiResponse = result.response.text();
      
      // Save both messages to local storage
      const userMessage = saveChatMessageToStorage(user.id, {
        role: 'user',
        content: `[${subject}] ${question}`,
        userId: user.id
      });
      
      const assistantMessage = saveChatMessageToStorage(user.id, {
        role: 'assistant',
        content: aiResponse,
        userId: user.id
      });
      
      return {
        userMessage,
        assistantMessage
      };
    }
  } catch (error) {
    console.warn('Gemini homework help failed completely, falling back to other AI services', error);
    
    // Falls back to other AI services
    throw error;
  }
}

/**
 * Analyze content with Gemini AI
 * @param content The content to analyze
 * @returns Analysis results with summary, key points, suggestions, etc.
 */
export async function analyzeContentWithGemini(content: string) {
  const user = loadUserFromLocalStorage();
  
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  try {
    // First try to use the server API
    try {
      const response = await apiRequest('POST', '/api/gemini/analyze', {
        content
      });
      
      if (!response.ok) {
        throw new Error('Failed to analyze content with server Gemini API');
      }
      
      return await response.json();
    } catch (serverError) {
      console.warn('Server API failed, using client-side Gemini API directly', serverError);
      
      // If server fails, use the client-side API directly with the user's API key
      const genAI = initializeGeminiClient();
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      
      // Create system instruction for content analysis
      const systemInstruction = `You are an educational content analyst. Analyze the provided text and return a structured response with these elements:
      1. A concise summary (2-3 sentences)
      2. Key concepts identified (maximum 5 bullet points)
      3. Suggested improvements or areas to explore further
      4. A readability assessment
      
      Format your response in clear sections.`;
      
      // Start a chat and prime it with the system instruction
      const chat = model.startChat({
        generationConfig: {
          temperature: 0.2,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 1024,
        }
      });
      
      // Prime with system instruction
      await chat.sendMessage(systemInstruction);
      
      // Send the content to analyze
      const result = await chat.sendMessage(content);
      const response = result.response.text();
      
      // Parse the response into sections
      const sections = response.split('\n\n');
      
      return {
        summary: sections[0] || '',
        keyConcepts: extractBulletPoints(sections[1] || ''),
        suggestions: extractBulletPoints(sections[2] || ''),
        readabilityAssessment: sections[3] || ''
      };
    }
  } catch (error) {
    console.warn('Gemini content analysis failed completely, falling back to other AI services', error);
    
    // Falls back to other AI services
    throw error;
  }
}

/**
 * Gets a full lesson on a specific topic using Gemini AI
 * @param topic The topic to get a lesson on
 * @returns Detailed lesson content
 */
export async function getFullLessonContent(topic: string) {
  const user = loadUserFromLocalStorage();
  
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  try {
    // First try to use the server API (if it exists)
    try {
      const response = await apiRequest('POST', '/api/gemini/lesson', {
        topic
      });
      
      if (!response.ok) {
        throw new Error('Failed to get lesson from server Gemini API');
      }
      
      const data = await response.json();
      return data.content;
    } catch (serverError) {
      console.warn('Server API failed or not available, using client-side Gemini API directly', serverError);
      
      // Use the client-side API directly with the user's API key
      const genAI = initializeGeminiClient();
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      
      // Create system instruction for educational content
      const systemInstruction = `You are an expert educator. Create a comprehensive lesson on the requested topic.
      The lesson should include:
      
      1. A clear introduction to the topic
      2. Key concepts and principles explained in detail
      3. Examples or case studies where appropriate
      4. Practice exercises or questions for self-assessment
      5. A summary of main points
      
      Make your explanations clear, accurate, and engaging. Format your content with appropriate headings and sections.`;
      
      // Start a chat and prime it with the system instruction
      const chat = model.startChat({
        generationConfig: {
          temperature: 0.3,
          topP: 0.9,
          topK: 40,
          maxOutputTokens: 2048,
        }
      });
      
      // Prime with system instruction
      await chat.sendMessage(systemInstruction);
      
      // Send the topic request
      const result = await chat.sendMessage(`Create a lesson on: ${topic}`);
      return result.response.text();
    }
  } catch (error) {
    console.warn('Getting lesson failed completely', error);
    throw new Error('Failed to generate lesson content');
  }
}