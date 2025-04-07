/**
 * Service to handle chat message storage in local storage
 * This provides offline capability for the AI chat feature
 */

// Define the key for chat history in local storage
const CHAT_STORAGE_KEY = '109ghntacaally12cht47.json';

// Types
export interface ChatMessage {
  id: string;
  userId: number;
  content: string;
  role: 'user' | 'assistant';
  createdAt: string;
}

export interface ChatSession {
  userId: number;
  messages: ChatMessage[];
  lastUpdated: string;
}

/**
 * Load chat history from local storage
 */
export function loadChatHistoryFromStorage(userId: number): ChatMessage[] {
  try {
    const storedData = localStorage.getItem(CHAT_STORAGE_KEY);
    if (!storedData) return [];

    const sessions = JSON.parse(storedData) as ChatSession[];
    const userSession = sessions.find(session => session.userId === userId);
    
    return userSession?.messages || [];
  } catch (error) {
    console.error('Error loading chat history from storage:', error);
    return [];
  }
}

/**
 * Save chat message to local storage
 */
export function saveChatMessageToStorage(
  userId: number, 
  message: { role: 'user' | 'assistant', content: string, userId?: number }
): ChatMessage {
  try {
    // Make sure userId is included in the message
    const messageWithUserId = {
      ...message,
      userId: userId
    };
    
    // Generate a new message with ID and timestamp
    const newMessage: ChatMessage = {
      id: generateUniqueId(),
      userId: messageWithUserId.userId,
      content: messageWithUserId.content,
      role: messageWithUserId.role,
      createdAt: new Date().toISOString()
    };
    
    // Get existing chat data from local storage
    const storedData = localStorage.getItem(CHAT_STORAGE_KEY);
    let sessions: ChatSession[] = [];
    
    if (storedData) {
      sessions = JSON.parse(storedData) as ChatSession[];
    }
    
    // Find user's session or create a new one
    let userSession = sessions.find(session => session.userId === userId);
    
    if (userSession) {
      // Add message to existing session
      userSession.messages.push(newMessage);
      userSession.lastUpdated = new Date().toISOString();
    } else {
      // Create new session for user
      userSession = {
        userId,
        messages: [newMessage],
        lastUpdated: new Date().toISOString()
      };
      sessions.push(userSession);
    }
    
    // Save back to local storage
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(sessions));
    
    // Submit to server in background (if available)
    submitChatMessageToServer(newMessage).catch(err => 
      console.warn('Failed to submit chat message to server:', err)
    );
    
    return newMessage;
  } catch (error) {
    console.error('Error saving chat message to storage:', error);
    
    // Return a fallback message in case of error
    return {
      id: generateUniqueId(),
      userId,
      content: message.content,
      role: message.role,
      createdAt: new Date().toISOString()
    };
  }
}

/**
 * Clear chat history for a user
 */
export function clearChatHistory(userId: number): void {
  try {
    const storedData = localStorage.getItem(CHAT_STORAGE_KEY);
    if (!storedData) return;
    
    let sessions = JSON.parse(storedData) as ChatSession[];
    
    // Filter out the user's session
    sessions = sessions.filter(session => session.userId !== userId);
    
    // Save back to local storage
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(sessions));
    
    // Try to sync with server
    fetch('/api/chat/clear', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    }).catch(err => console.warn('Failed to clear chat history on server:', err));
  } catch (error) {
    console.error('Error clearing chat history:', error);
  }
}

/**
 * Generate a unique ID for chat messages
 */
function generateUniqueId(): string {
  return Date.now().toString() + Math.random().toString(36).substring(2, 9);
}

/**
 * Submit a chat message to the server for persistence
 * This is a background operation that won't block the UI
 */
async function submitChatMessageToServer(message: ChatMessage): Promise<void> {
  try {
    await fetch('/api/chat/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
  } catch (error) {
    // Just log the error, local storage is our source of truth
    console.warn('Failed to submit chat message to server:', error);
  }
}