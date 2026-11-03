import React, { useEffect, useRef } from 'react';

const AdBanner: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Intercept focus events inside the ad container to prevent the page from auto-scrolling to the bottom on load
    const originalFocus = HTMLElement.prototype.focus;
    HTMLElement.prototype.focus = function (options?: FocusOptions) {
      if (this.closest && this.closest('#container-aeac7f334cacab836e2a1410776a2f17')) {
        return originalFocus.call(this, { ...options, preventScroll: true });
      }
      return originalFocus.apply(this, arguments as any);
    };

    if (containerRef.current) {
      // Clear container first
      containerRef.current.innerHTML = '';

      // Create container div
      const containerDiv = document.createElement('div');
      containerDiv.id = 'container-aeac7f334cacab836e2a1410776a2f17';
      containerDiv.style.width = '100%';
      containerDiv.style.minHeight = '90px';
      
      // Create script element
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.async = true;
      script.setAttribute('data-cfasync', 'false');
      script.src = 'https://pl29670348.effectivecpmnetwork.com/aeac7f334cacab836e2a1410776a2f17/invoke.js';
      
      containerRef.current.appendChild(containerDiv);
      containerRef.current.appendChild(script);
    }

    return () => {
      // Restore original focus method on unmount
      HTMLElement.prototype.focus = originalFocus;
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      style={{ 
        width: '100%', 
        margin: '1.5rem 0', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center',
        minHeight: '100px',
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: '16px',
        padding: '0.75rem',
        boxSizing: 'border-box'
      }} 
    />
  );
};

export default AdBanner;
