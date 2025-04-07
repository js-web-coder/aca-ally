import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from "lucide-react";
import { Redirect, Route, RouteProps } from "wouter";

// Helper function to create a route that renders a component
const renderComponent = (Component: React.ComponentType<any>) => {
  // This handles both cases: routes with and without params
  return (props: any) => <Component {...props} />;
};

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: React.ComponentType<any>;
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Route path={path}>
        {() => (
          <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
      </Route>
    );
  }

  if (!user) {
    return (
      <Route path={path}>
        {() => <Redirect to="/auth" />}
      </Route>
    );
  }

  return (
    <Route path={path}>
      {renderComponent(Component)}
    </Route>
  );
}