import { useState, useEffect } from "react";
import { useCookieConsent } from "@/hooks/use-cookie-consent";
import { Button } from "@/components/ui/button";

export function CookieConsent() {
  const { consent, acceptCookies, rejectCookies } = useCookieConsent();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show the banner if consent hasn't been given or rejected yet
    if (consent === null) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000); // Show after 1 second

      return () => clearTimeout(timer);
    }
  }, [consent]);

  if (!isVisible || consent !== null) {
    return null;
  }

  return (
    <div className="fixed bottom-0 inset-x-0 pb-2 sm:pb-5 z-50 animate-in slide-in-from-bottom duration-300">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="p-4 rounded-lg bg-white dark:bg-gray-800 shadow-lg sm:p-5 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap items-center justify-between">
            <div className="flex items-center flex-1">
              <span className="flex-shrink-0 h-6 w-6 text-gray-500 dark:text-gray-400 mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
                </svg>
              </span>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.
                <a href="/terms" className="ml-1 text-primary-500 hover:underline">Learn more</a>
              </p>
            </div>
            <div className="mt-4 sm:mt-0 sm:flex sm:items-center sm:space-x-3">
              <Button 
                variant="outline"
                onClick={rejectCookies}
                className="flex w-full sm:w-auto justify-center items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium"
              >
                Reject All
              </Button>
              <Button 
                onClick={acceptCookies}
                className="mt-3 sm:mt-0 flex w-full sm:w-auto justify-center"
              >
                Accept All
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
