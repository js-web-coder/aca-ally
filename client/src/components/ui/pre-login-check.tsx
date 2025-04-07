import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';

export function PreLoginCheck() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [showLoading, setShowLoading] = useState(true);
  
  // Only show loading spinner for a short time to avoid flickering
  // if the auth check completes quickly
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Redirect authenticated users to the home page
  useEffect(() => {
    if (!isLoading && user) {
      setLocation('/');
    }
  }, [isLoading, user, setLocation]);
  
  if (isLoading && showLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  // Return null to render nothing - the parent component will render
  // once we've determined the user isn't logged in
  return null;
}