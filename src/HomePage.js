import React, { useEffect } from 'react';

function HomePage() {
  useEffect(() => {
    // Load the LaunchList widget script
    const script = document.createElement('script');
    script.src = 'https://getlaunchlist.com/js/widget.js';
    script.defer = true;
    document.head.appendChild(script);

    // Cleanup function to remove script when component unmounts
    return () => {
      document.head.removeChild(script);
    };
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