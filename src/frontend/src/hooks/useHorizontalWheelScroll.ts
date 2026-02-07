import { useEffect, RefObject } from 'react';

export function useHorizontalWheelScroll(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleWheel = (e: WheelEvent) => {
      // Only convert vertical scroll to horizontal if:
      // 1. The element can scroll horizontally
      // 2. The scroll is primarily vertical (not already horizontal)
      // 3. The target is not an interactive element
      const target = e.target as HTMLElement;
      const isInteractive = target.tagName === 'BUTTON' || 
                           target.tagName === 'A' || 
                           target.closest('button') || 
                           target.closest('a');
      
      if (isInteractive) return;

      const canScrollHorizontally = element.scrollWidth > element.clientWidth;
      const isVerticalScroll = Math.abs(e.deltaY) > Math.abs(e.deltaX);

      if (canScrollHorizontally && isVerticalScroll) {
        e.preventDefault();
        element.scrollLeft += e.deltaY;
      }
    };

    element.addEventListener('wheel', handleWheel, { passive: false });
    return () => element.removeEventListener('wheel', handleWheel);
  }, [ref]);
}
