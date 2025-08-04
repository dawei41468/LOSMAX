import React, { useEffect, useRef } from 'react';

interface ThemeTransitionProps {
  children: React.ReactNode;
}

export const ThemeTransition: React.FC<ThemeTransitionProps> = ({ children }) => {
  const transitionRef = useRef<HTMLDivElement>(null);
  const [isTransitioning, setIsTransitioning] = React.useState(false);

  const triggerThemeTransition = (event?: MouseEvent) => {
    if (!transitionRef.current) return;

    const transition = transitionRef.current;
    const rect = transition.getBoundingClientRect();
    
    // Calculate starting position from click or center
    let x = rect.width / 2;
    let y = rect.height / 2;
    
    if (event) {
      x = event.clientX - rect.left;
      y = event.clientY - rect.top;
    }

    // Create ripple effect
    const ripple = document.createElement('div');
    ripple.className = 'theme-ripple';
    ripple.style.cssText = `
      position: absolute;
      border-radius: 50%;
      background: var(--theme-ripple-color);
      transform: scale(0);
      animation: themeRipple 0.6s ease-out forwards;
      pointer-events: none;
      z-index: 9999;
      left: ${x}px;
      top: ${y}px;
      width: 100px;
      height: 100px;
      margin-left: -50px;
      margin-top: -50px;
    `;

    transition.appendChild(ripple);
    setIsTransitioning(true);

    // Remove ripple after animation
    setTimeout(() => {
      if (ripple.parentNode) {
        ripple.parentNode.removeChild(ripple);
      }
      setIsTransitioning(false);
    }, 600);
  };

  // Listen for theme changes
  useEffect(() => {
    const handleThemeChange = (event: CustomEvent) => {
      triggerThemeTransition(event.detail?.clickEvent);
    };

    window.addEventListener('theme-change', handleThemeChange as EventListener);
    
    return () => {
      window.removeEventListener('theme-change', handleThemeChange as EventListener);
    };
  }, []);

  return (
    <div className="theme-transition-container">
      <div
        ref={transitionRef}
        className={`theme-transition-overlay ${isTransitioning ? 'transitioning' : ''}`}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          pointerEvents: isTransitioning ? 'auto' : 'none',
          zIndex: 9998,
        }}
      />
      {children}
      
      <style>{`
        @keyframes themeRipple {
          0% {
            transform: scale(0);
            opacity: 1;
          }
          100% {
            transform: scale(20);
            opacity: 0;
          }
        }
        
        .theme-transition-overlay.transitioning {
          background: var(--theme-transition-bg);
          animation: fadeOut 0.3s ease-out 0.3s forwards;
        }
        
        @keyframes fadeOut {
          0% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};
