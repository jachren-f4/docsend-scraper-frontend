import React, { useEffect, useRef } from 'react';

function HomePage() {
  const hasInitialized = useRef(false);
  const widgetRef = useRef(null);

  useEffect(() => {
    // Only run once per component lifecycle
    if (hasInitialized.current) return;
    hasInitialized.current = true;
    
    // Remove any existing widgets to prevent duplicates
    const existingWidgets = document.querySelectorAll('.launchlist-widget');
    if (existingWidgets.length > 1) {
      // Keep only the first one, remove others
      for (let i = 1; i < existingWidgets.length; i++) {
        existingWidgets[i].remove();
      }
    }

    // Check if script already exists
    const existingScript = document.querySelector('script[src="https://getlaunchlist.com/js/widget.js"]');
    if (existingScript) {
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://getlaunchlist.com/js/widget.js';
    script.defer = true;
    document.head.appendChild(script);
  }, []);

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      fontSize: '48px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
      padding: '20px',
      width: '100%'
    }}>
      <div style={{ marginBottom: '40px', textAlign: 'center' }}>
        Join the course waitlist.
      </div>
      <div 
        ref={widgetRef}
        className="launchlist-widget" 
        data-key-id="MryCoB" 
        data-height="180px"
        style={{
          width: '100%',
          maxWidth: '500px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      ></div>
    </div>
  );
}

export default HomePage;