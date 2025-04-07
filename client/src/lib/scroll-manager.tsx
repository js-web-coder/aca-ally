import { useEffect } from 'react';
import { useLocation } from 'wouter';

/**
 * ScrollManager component to control scroll behavior on route changes.
 * 
 * When disableAutoScroll is true, it prevents automatic scrolling to the top
 * of the page when the user navigates to a new route.
 */
export function ScrollManager({ disableAutoScroll = true }: { disableAutoScroll?: boolean }) {
  const [location] = useLocation();

  useEffect(() => {
    // Only run this effect if auto-scrolling is NOT disabled
    if (!disableAutoScroll) {
      window.scrollTo(0, 0);
    }
  }, [location, disableAutoScroll]);

  return null;
}