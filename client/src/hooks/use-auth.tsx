import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  loadUserFromLocalStorage, 
  saveUserToLocalStorage, 
  removeUserFromLocalStorage,
  createMockUser, 
  type LocalUser 
} from '@/lib/localAuth';
import { trackUserActivity } from '@/lib/userTrackingService';

interface AuthContextType {
  user: LocalUser | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, username: string, password: string) => Promise<void>;
  refreshAuth: () => Promise<void>;
  updateUserProfile: (profileData: Partial<LocalUser>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [, navigate] = useLocation();

  useEffect(() => {
    // Check if user is logged in on initial load
    refreshAuth();
  }, []);

  const refreshAuth = async () => {
    try {
      setIsLoading(true);
      
      // Try to load user from local storage first
      const localUser = loadUserFromLocalStorage();
      
      if (localUser?.isAuthenticated) {
        setUser(localUser);
        setIsLoading(false);
        return;
      }
      
      // Fallback to API if local storage doesn't have authenticated user
      try {
        const response = await fetch('/api/users/me', {
          method: 'GET',
          credentials: 'include',
        });
        
        if (response.ok) {
          const userData = await response.json();
          // Save to local storage for future use
          const localUser: LocalUser = {
            ...userData,
            isAuthenticated: true
          };
          saveUserToLocalStorage(localUser);
          setUser(localUser);
        } else {
          // Not authenticated, that's okay
          setUser(null);
        }
      } catch (error) {
        console.error('Error refreshing auth from API:', error);
        setUser(null);
      }
    } catch (error) {
      console.error('Error refreshing auth:', error);
      setError('Failed to load user information');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Try to login with API first
      try {
        const response = await apiRequest('POST', '/api/auth/login', { email, password });
        
        if (response.ok) {
          const userData = await response.json();
          const localUser: LocalUser = {
            ...userData,
            isAuthenticated: true
          };
          
          // Save to local storage
          saveUserToLocalStorage(localUser);
          setUser(localUser);
          
          // Track login activity to remote server
          await trackUserActivity('login', localUser);
          
          toast({
            title: 'Login successful',
            description: `Welcome back, ${userData.username}!`,
          });
          
          // Redirect to profile edit page
          navigate('/account/edit');
          
          setIsLoading(false);
          return;
        }
      } catch (error) {
        console.log('Server login failed, falling back to local storage');
      }
      
      // Fallback to local file if API fails
      let localUser = loadUserFromLocalStorage();
      
      if (!localUser) {
        // If local file doesn't exist, create a mock user for testing
        localUser = createMockUser();
      } else {
        // Update authentication status and save back to local storage
        localUser.isAuthenticated = true;
        saveUserToLocalStorage(localUser);
      }
      
      setUser(localUser);
      
      // Track login activity to remote server
      await trackUserActivity('login', localUser);
      
      toast({
        title: 'Login successful (local)',
        description: `Welcome back, ${localUser.username}!`,
      });
      
      // Redirect to profile edit page
      navigate('/account/edit');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to login';
      setError(message);
      toast({
        title: 'Login failed',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      
      // Track logout activity before we remove the user
      if (user) {
        await trackUserActivity('logout', user);
      }
      
      // Try to logout from API first
      try {
        await apiRequest('POST', '/api/auth/logout');
      } catch (error) {
        console.log('Server logout failed, using local method');
      }
      
      // Always remove from local storage
      removeUserFromLocalStorage();
      setUser(null);
      
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out.',
      });
      
      // Redirect to home page after logout
      navigate('/');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to logout';
      setError(message);
      toast({
        title: 'Logout failed',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, username: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Try to register with API first
      try {
        const response = await apiRequest('POST', '/api/auth/register', {
          email,
          username,
          password,
        });
        
        if (response.ok) {
          const userData = await response.json();
          const localUser: LocalUser = {
            ...userData,
            isAuthenticated: true
          };
          
          // Save to local storage
          saveUserToLocalStorage(localUser);
          setUser(localUser);
          
          // Track signup activity to remote server
          await trackUserActivity('signup', localUser);
          
          toast({
            title: 'Registration successful',
            description: `Welcome to Aca.Ally, ${userData.username}!`,
          });
          
          // Redirect to profile edit page
          navigate('/account/edit');
          
          setIsLoading(false);
          return;
        }
      } catch (error) {
        console.log('Server registration failed, using local method');
      }
      
      // Fallback to creating a local user if API fails
      const localUser: LocalUser = {
        id: Date.now(), // Use timestamp as ID
        username,
        email,
        isAuthenticated: true,
        displayName: username,
        profileImage: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`
      };
      
      saveUserToLocalStorage(localUser);
      setUser(localUser);
      
      // Track signup activity to remote server
      await trackUserActivity('signup', localUser);
      
      toast({
        title: 'Registration successful (local)',
        description: `Welcome to Aca.Ally, ${username}!`,
      });
      
      // Redirect to profile edit page
      navigate('/account/edit');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to signup';
      setError(message);
      toast({
        title: 'Signup failed',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // New function to update user profile
  const updateUserProfile = async (profileData: Partial<LocalUser>) => {
    if (!user) {
      setError('Cannot update profile: Not logged in');
      toast({
        title: 'Profile update failed',
        description: 'You must be logged in to update your profile',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Try to update profile on server first
      try {
        const response = await apiRequest('PATCH', '/api/users/me', profileData);
        
        if (response.ok) {
          console.log('Profile updated on server successfully');
        }
      } catch (error) {
        console.log('Server profile update failed, using local storage only');
      }
      
      // Always update local storage
      const updatedUser: LocalUser = {
        ...user,
        ...profileData,
      };
      
      saveUserToLocalStorage(updatedUser);
      setUser(updatedUser);
      
      // Track profile update to remote server
      await trackUserActivity('profile_update', updatedUser);
      
      toast({
        title: 'Profile updated',
        description: 'Your profile has been successfully updated',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update profile';
      setError(message);
      toast({
        title: 'Profile update failed',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isLoading,
    error,
    login,
    logout,
    signup,
    refreshAuth,
    updateUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
