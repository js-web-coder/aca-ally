import React from 'react';
// Don't use the Header component in PageLayout as it's already in App.tsx
import { cn } from '@/lib/utils';

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children, className }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <main className={cn("flex-1 pb-8", className)}>
        {children}
      </main>
    </div>
  );
};

export default PageLayout;