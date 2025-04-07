import { loadUserFromLocalStorage } from './localAuth';
import { saveChatMessageToStorage } from './chatStorageService';
import { apiRequest } from './queryClient';

interface ChatResponse {
  message: string;
  id: string;
  createdAt: string;
}

/**
 * Send a message to Perplexity AI and get a response
 * @param message User's message
 * @param systemInstruction Optional system instruction to guide the model
 * @returns Object containing both user and assistant messages
 */
export async function sendPerplexityMessage(message: string, systemInstruction?: string) {
  const user = loadUserFromLocalStorage();
  
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  try {
    // Send request to server API
    const response = await apiRequest('POST', '/api/perplexity/chat', {
      message,
      systemInstruction
    });
    
    if (!response.ok) {
      throw new Error('Failed to get response from Perplexity API');
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
  } catch (error) {
    console.warn('Perplexity API failed, falling back to OpenAI', error);
    
    // Falls back to OpenAI service - add your fallback logic here
    throw error;
  }
}

/**
 * Get homework help from Perplexity AI
 * @param subject The academic subject
 * @param question The specific homework question
 * @returns Object containing both user and assistant messages
 */
export async function getPerplexityHomeworkHelp(subject: string, question: string) {
  const user = loadUserFromLocalStorage();
  
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  try {
    // Send request to server API
    const response = await apiRequest('POST', '/api/perplexity/homework', {
      subject, 
      question
    });
    
    if (!response.ok) {
      throw new Error('Failed to get homework help from Perplexity API');
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
  } catch (error) {
    console.warn('Perplexity homework help failed, falling back to OpenAI', error);
    
    // Falls back to OpenAI service - add your fallback logic here
    throw error;
  }
}

/**
 * Analyze content with Perplexity AI
 * @param content The content to analyze
 * @returns Analysis results with summary, key points, suggestions, etc.
 */
export async function analyzeContentWithPerplexity(content: string) {
  const user = loadUserFromLocalStorage();
  
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  try {
    // Send request to server API
    const response = await apiRequest('POST', '/api/perplexity/analyze', {
      content
    });
    
    if (!response.ok) {
      throw new Error('Failed to analyze content with Perplexity API');
    }
    
    return await response.json();
  } catch (error) {
    console.warn('Perplexity content analysis failed, falling back to OpenAI', error);
    
    // Falls back to OpenAI service - add your fallback logic here
    throw error;
  }
}

/**
 * Stream chat with Perplexity AI
 * @param message User's message
 * @param systemInstruction Optional system instruction to guide the model
 * @param onChunk Callback for each chunk of the streamed response
 * @param onComplete Callback for when streaming is complete
 * @returns Promise that resolves when streaming is complete
 */
export async function streamPerplexityChat(
  message: string,
  systemInstruction?: string,
  onChunk?: (chunk: string) => void,
  onComplete?: (fullResponse: string) => void
) {
  const user = loadUserFromLocalStorage();
  
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  try {
    // Save user message to local storage
    saveChatMessageToStorage(user.id, {
      role: 'user',
      content: message,
      userId: user.id
    });
    
    // Start streaming request
    const response = await fetch('/api/perplexity/chat/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message,
        systemInstruction
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to stream response from Perplexity API');
    }
    
    // Handle stream
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Failed to get response stream');
    }
    
    let fullResponse = '';
    
    // Read and process the stream
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      // Process each chunk of data
      const chunk = new TextDecoder().decode(value);
      const textChunk = chunk.replace(/^data: /, '').trim();
      
      if (textChunk && onChunk) {
        onChunk(textChunk);
      }
      
      fullResponse += textChunk;
    }
    
    // Save the complete response
    saveChatMessageToStorage(user.id, {
      role: 'assistant',
      content: fullResponse,
      userId: user.id
    });
    
    if (onComplete) {
      onComplete(fullResponse);
    }
    
    return fullResponse;
  } catch (error) {
    console.warn('Perplexity streaming failed', error);
    throw error;
  }
}