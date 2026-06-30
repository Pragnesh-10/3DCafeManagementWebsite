import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Link } from 'react-router';

export function ConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('dpdp_consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('dpdp_consent', 'accepted');
    document.cookie = "dpdp_consent=accepted; path=/; max-age=31536000; SameSite=Lax";
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('dpdp_consent', 'declined');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg z-50 border-gray-200">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-sm text-gray-700 flex-1">
          <p>
            We use cookies and collect personal data to improve your experience and process orders. 
            By continuing to use our site, you consent to our data practices as described in our{' '}
            <a href="/privacy-policy" className="text-blue-600 hover:underline">
              Privacy Policy
            </a>
            . You can manage your data via our{' '}
            <a href="/data-management" className="text-blue-600 hover:underline">
              Data Management
            </a>{' '}
            page.
          </p>
        </div>
        <div className="flex gap-3 flex-shrink-0">
          <Button variant="outline" onClick={handleDecline}>
            Decline All
          </Button>
          <Button onClick={handleAccept}>
            Accept & Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
