import React, { useEffect } from 'react';

function HomePage() {
  useEffect(() => {
    // Check if the LaunchList script is already loaded
    const existingScript = document.querySelector('script[src="https://getlaunchlist.com/js/widget.js"]');
    
    if (!existingScript) {
      // Load the LaunchList widget script only if it doesn't exist
      const script = document.createElement('script');
      script.src = 'https://getlaunchlist.com/js/widget.js';
      script.defer = true;
      script.id = 'launchlist-widget-script';
      document.head.appendChild(script);

      // Cleanup function to remove script when component unmounts
      return () => {
        const scriptElement = document.getElementById('launchlist-widget-script');
        if (scriptElement) {
          document.head.removeChild(scriptElement);
        }
      };
    }
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
      padding: '20px'
    }}>
      <div style={{ marginBottom: '40px', textAlign: 'center' }}>
        Join the course waitlist.
      </div>
      <div className="launchlist-widget" data-key-id="MryCoB" data-height="180px"></div>
    </div>
  );
}

export default HomePage;