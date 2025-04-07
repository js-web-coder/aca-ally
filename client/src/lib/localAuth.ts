// Local storage authentication helper
import { User } from "@shared/schema";

const LOCAL_STORAGE_KEY = '1290ghbhbhacaally78.json';

export interface LocalUser extends Partial<User> {
  id: number;
  username: string;
  email: string;
  isAuthenticated: boolean;
  displayName?: string;
  profileImage?: string;
  bio?: string;
  location?: string;
  interests?: string;
  website?: string;
  lastLoginAt?: string;
  lastUpdatedAt?: string;
  phone?: string;
}

// Load user data from local storage
export function loadUserFromLocalStorage(): LocalUser | null {
  try {
    const userData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!userData) return null;
    
    const user = JSON.parse(userData) as LocalUser;
    return user;
  } catch (error) {
    console.error('Failed to load user data from local storage:', error);
    return null;
  }
}

// Save user data to local storage
export function saveUserToLocalStorage(user: LocalUser): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Failed to save user data to local storage:', error);
  }
}

// Remove user data from local storage
export function removeUserFromLocalStorage(): void {
  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to remove user data from local storage:', error);
  }
}

// Create a mock user for testing purposes
export function createMockUser(): LocalUser {
  const mockUser: LocalUser = {
    id: Date.now(),
    username: 'testuser',
    email: 'test@example.com',
    isAuthenticated: true,
    displayName: 'Test User',
    profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=testuser',
    bio: 'This is a demo account created for testing purposes.',
    location: 'Demo City',
    interests: 'Math, Science, Literature',
    website: 'https://example.com',
    lastLoginAt: new Date().toISOString(),
    lastUpdatedAt: new Date().toISOString()
  };
  
  saveUserToLocalStorage(mockUser);
  return mockUser;
}