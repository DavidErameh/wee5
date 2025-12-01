import { useState, useEffect } from 'react';

export const useAnimation = () => {
  // Check if user prefers reduced motion
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  // Get appropriate variants based on reduced motion preference
  const getVariants = (defaultVariants: any) => {
    if (prefersReducedMotion) {
      // Return variants with minimal animation
      const reducedMotionVariants = { ...defaultVariants };
      
      // Remove all animation properties
      for (const key in reducedMotionVariants) {
        if (reducedMotionVariants[key].transition) {
          reducedMotionVariants[key].transition = { duration: 0.01 };
        }
      }
      
      return reducedMotionVariants;
    }
    
    return defaultVariants;
  };

  return {
    prefersReducedMotion,
    getVariants,
  };
};

export default useAnimation;