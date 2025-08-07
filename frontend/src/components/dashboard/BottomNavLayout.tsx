import React from 'react';
import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';

interface BottomNavLayoutProps {
  children?: React.ReactNode;
}

export const BottomNavLayout: React.FC<BottomNavLayoutProps> = ({ children }) => {
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [startY, setStartY] = React.useState<number | null>(null);
  const [pullDistance, setPullDistance] = React.useState(0);
  const contentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const contentElement = contentRef.current;
    if (!contentElement) return;

    const handleTouchStart = (e: TouchEvent) => {
      // Only trigger if at the top of the content
      if (window.scrollY === 0) {
        setStartY(e.touches[0].clientY);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (startY !== null) {
        const currentY = e.touches[0].clientY;
        const distance = currentY - startY;
        if (distance > 0) {
          setPullDistance(distance);
          // Prevent default scrolling if pulling down
          e.preventDefault();
        }
      }
    };

    const handleTouchEnd = () => {
      if (pullDistance > 80) { // Threshold for refresh
        setIsRefreshing(true);
        // Simulate refresh action (replace with actual data fetch logic)
        setTimeout(() => {
          setIsRefreshing(false);
        }, 1500); // Simulate a 1.5s refresh delay
      }
      setStartY(null);
      setPullDistance(0);
    };

    contentElement.addEventListener('touchstart', handleTouchStart, { passive: true });
    contentElement.addEventListener('touchmove', handleTouchMove, { passive: false });
    contentElement.addEventListener('touchend', handleTouchEnd);

    return () => {
      contentElement.removeEventListener('touchstart', handleTouchStart);
      contentElement.removeEventListener('touchmove', handleTouchMove);
      contentElement.removeEventListener('touchend', handleTouchEnd);
    };
  }, [startY, pullDistance]);

  return (
    <div className="min-h-screen flex flex-col relative">
      <div
        className="flex-1 pb-20 w-full pt-4 relative"
        ref={contentRef}
        style={{
          overscrollBehaviorY: pullDistance > 0 ? 'none' : 'auto',
          transition: 'transform 0.3s ease-out',
          transform: `translateY(${pullDistance > 0 ? pullDistance / 3 : 0}px)`,
        }}
      >
        {isRefreshing && (
          <div className="absolute top-0 left-0 right-0 flex justify-center items-center py-4 bg-blue-100 dark:bg-blue-900 z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-blue-800 dark:text-blue-200">Refreshing...</span>
          </div>
        )}
        <main className="w-full">
          {children || <Outlet />}
        </main>
      </div>
      <BottomNav className="fixed bottom-0 left-0 right-0 z-50" />
    </div>
  );
};