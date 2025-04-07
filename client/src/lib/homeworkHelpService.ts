import { loadUserFromLocalStorage } from './localAuth';
import { saveChatMessageToStorage } from './chatStorageService';
import { apiRequest } from './queryClient';
import { getGeminiHomeworkHelp } from './geminiService';
import { getPerplexityHomeworkHelp } from './perplexityService';
import { getHomeworkHelp as getOpenAIHomeworkHelp } from './openai';

interface ChatResponse {
  message: string;
  id: string;
  createdAt: string;
}

/**
 * Get integrated homework help using all three AI systems
 * First tries Gemini, then Perplexity, then OpenAI as fallbacks
 * @param subject The academic subject
 * @param question The specific homework question
 * @returns Object containing both user and assistant messages
 */
export async function getIntegratedHomeworkHelp(subject: string, question: string) {
  const user = loadUserFromLocalStorage();
  
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  // Save user message to local storage
  const userMessage = saveChatMessageToStorage(user.id, {
    role: 'user',
    content: `[${subject}] ${question}`,
    userId: user.id
  });
  
  try {
    // Try Gemini first
    const geminiResponse = await getGeminiHomeworkHelp(subject, question);
    
    // Add source attribution
    const message = `${geminiResponse.assistantMessage.content}\n\n(Powered by Google Gemini)`;
    
    // Save assistant message to local storage with attribution
    const assistantMessage = saveChatMessageToStorage(user.id, {
      role: 'assistant',
      content: message,
      userId: user.id
    });
    
    return {
      userMessage,
      assistantMessage: {
        ...assistantMessage,
        content: message,
        source: 'Gemini'
      }
    };
  } catch (geminiError) {
    console.warn('Gemini homework help failed, falling back to Perplexity', geminiError);
    
    try {
      // Try Perplexity next
      const perplexityResponse = await getPerplexityHomeworkHelp(subject, question);
      
      // Add source attribution
      const message = `${perplexityResponse.assistantMessage.content}\n\n(Powered by Perplexity AI)`;
      
      // Save assistant message to local storage with attribution
      const assistantMessage = saveChatMessageToStorage(user.id, {
        role: 'assistant',
        content: message,
        userId: user.id
      });
      
      return {
        userMessage,
        assistantMessage: {
          ...assistantMessage,
          content: message,
          source: 'Perplexity'
        }
      };
    } catch (perplexityError) {
      console.warn('Perplexity homework help failed, falling back to OpenAI', perplexityError);
      
      // Finally, try OpenAI as last resort
      try {
        const openaiResponse = await getOpenAIHomeworkHelp(subject, question);
        
        // Save assistant message to local storage
        const assistantMessage = saveChatMessageToStorage(user.id, {
          role: 'assistant',
          content: openaiResponse.assistantMessage.content,
          userId: user.id
        });
        
        return {
          userMessage,
          assistantMessage: {
            ...assistantMessage,
            content: openaiResponse.assistantMessage.content,
            source: 'OpenAI'
          }
        };
      } catch (openaiError) {
        console.error('All AI services failed for homework help', openaiError);
        
        // If all services fail, provide a graceful error message
        const errorMessage = "I'm sorry, but I'm having trouble connecting to my knowledge services right now. Please try again in a few moments, or try rephrasing your question.";
        
        const assistantMessage = saveChatMessageToStorage(user.id, {
          role: 'assistant',
          content: errorMessage,
          userId: user.id
        });
        
        return {
          userMessage,
          assistantMessage: {
            ...assistantMessage,
            content: errorMessage,
            source: 'Error'
          }
        };
      }
    }
  }
}

/**
 * Determine which AI system is likely best for a given subject
 * This allows for future optimization of AI selection based on subject expertise
 * @param subject The academic subject
 * @returns The preferred AI system name
 */
export function getPreferredAIForSubject(subject: string): 'Gemini' | 'Perplexity' | 'OpenAI' {
  subject = subject.toLowerCase();
  
  // Subjects that Gemini excels at
  if (subject.includes('math') || 
      subject.includes('physics') || 
      subject.includes('computer science')) {
    return 'Gemini';
  }
  
  // Subjects where Perplexity's real-time knowledge is beneficial
  if (subject.includes('current events') || 
      subject.includes('history') || 
      subject.includes('news') ||
      subject.includes('politics')) {
    return 'Perplexity';
  }
  
  // Subjects where OpenAI might do better
  if (subject.includes('literature') || 
      subject.includes('writing') || 
      subject.includes('philosophy')) {
    return 'OpenAI';
  }
  
  // Default to Gemini as our primary model
  return 'Gemini';
}