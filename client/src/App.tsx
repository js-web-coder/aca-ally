import { Switch, Route } from "wouter";
import { Suspense, lazy } from "react";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import About from "@/pages/about";
import Contact from "@/pages/contact";
import FAQ from "@/pages/faq";
import Terms from "@/pages/terms";
import AuthPage from "@/pages/auth-page";
import EditProfile from "@/pages/account/edit";
import NewPost from "@/pages/account/new";
import Settings from "@/pages/account/settings";
import Analytics from "@/pages/account/analytics";
import Chat from "@/pages/chat";
import HomeworkHelp from "@/pages/homework";
import UserProfile from "@/pages/view/user";
import Explore from "@/pages/explore";
import { ProtectedRoute } from "@/lib/protected-route";
import { Header } from "@/components/layout/header";
import { Toaster } from "@/components/ui/toaster";
import { ScrollManager } from "@/lib/scroll-manager";

// Lazy load some pages that might not be immediately required
const PostView = lazy(() => import("@/pages/post/[id]"));

function App() {
  return (
    <>
      <Header />
      <ScrollManager disableAutoScroll={true} />
      <main className="min-h-[calc(100vh-4rem)]">
        <Suspense fallback={<div className="w-full h-screen flex items-center justify-center">Loading...</div>}>
          <Switch>
            {/* Public pages */}
            <ProtectedRoute path="/" component={Home} />
            <Route path="/about" component={About} />
            <Route path="/contact" component={Contact} />
            <Route path="/faq" component={FAQ} />
            <Route path="/terms" component={Terms} />
            
            {/* Authentication */}
            <Route path="/auth" component={AuthPage} />
            
            {/* User account - protected */}
            <ProtectedRoute path="/account/edit" component={EditProfile} />
            <ProtectedRoute path="/account/new" component={NewPost} />
            <ProtectedRoute path="/account/settings" component={Settings} />
            <ProtectedRoute path="/account/analytics" component={Analytics} />
            
            {/* Content */}
            <Route path="/post/:id">
              {params => <PostView id={params.id} />}
            </Route>
            <Route path="/view/user/:username">
              {params => <UserProfile username={params.username} />}
            </Route>
            
            {/* AI Features - protected */}
            <ProtectedRoute path="/chat" component={Chat} />
            <ProtectedRoute path="/homework" component={HomeworkHelp} />
            
            {/* Explore */}
            <Route path="/explore" component={Explore} />
            
            {/* Fallback to 404 */}
            <Route component={NotFound} />
          </Switch>
        </Suspense>
      </main>
      <Toaster />
    </>
  );
}

export default App;
