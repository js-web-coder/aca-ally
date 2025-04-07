import { useState, useEffect } from 'react';

type ConsentStatus = 'accepted' | 'rejected' | null;

export function useCookieConsent() {
  const [consent, setConsent] = useState<ConsentStatus>(() => {
    if (typeof window !== 'undefined') {
      const storedConsent = localStorage.getItem('cookieConsent');
      if (storedConsent === 'accepted') return 'accepted';
      if (storedConsent === 'rejected') return 'rejected';
    }
    return null;
  });

  useEffect(() => {
    if (consent !== null) {
      localStorage.setItem('cookieConsent', consent);
    }
  }, [consent]);

  const acceptCookies = () => {
    setConsent('accepted');
    
    // Trigger any analytics or tracking that relies on consent
    if (typeof window !== 'undefined') {
      // In a real app, we might initialize analytics libraries here
      console.log('Cookies accepted, analytics enabled');
    }
  };

  const rejectCookies = () => {
    setConsent('rejected');
    
    // Ensure any tracking is disabled
    if (typeof window !== 'undefined') {
      // In a real app, we might disable or remove analytics cookies here
      console.log('Cookies rejected, analytics disabled');
    }
  };

  const resetConsent = () => {
    localStorage.removeItem('cookieConsent');
    setConsent(null);
  };

  return {
    consent,
    acceptCookies,
    rejectCookies,
    resetConsent,
  };
}
