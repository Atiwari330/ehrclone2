'use client';

/**
 * Hook to detect user's motion preferences
 * 
 * Respects prefers-reduced-motion media query for accessibility.
 * Used across all animated components to ensure inclusive design.
 * 
 * Story 6.4 - Implement Smooth Animations (Accessibility)
 */

import { useState, useEffect } from 'react';

export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      return;
    }

    // Create media query for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    // Set initial state
    setPrefersReducedMotion(mediaQuery.matches);
    
    console.log('[useReducedMotion] Initial motion preference detected:', {
      prefersReducedMotion: mediaQuery.matches,
      mediaQuerySupported: true,
      timestamp: Date.now()
    });

    // Listen for changes
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
      
      console.log('[useReducedMotion] Motion preference changed:', {
        prefersReducedMotion: event.matches,
        timestamp: Date.now()
      });
    };

    // Add listener (use newer addEventListener if available, fallback to addListener)
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange);
    }

    // Cleanup
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        // Fallback for older browsers
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  return prefersReducedMotion;
}

/**
 * Hook to get animation configuration based on motion preferences
 * 
 * Returns optimized animation settings that respect user preferences
 * and provide consistent timing across the application.
 */
export function useAnimationConfig() {
  const prefersReducedMotion = useReducedMotion();

  const config = {
    // Tab transitions
    tabTransition: prefersReducedMotion 
      ? { duration: 0, ease: 'linear' as const }
      : { duration: 0.15, ease: 'easeInOut' as const },
    
    // Card expand/collapse
    cardTransition: prefersReducedMotion
      ? { duration: 0, ease: 'linear' as const }
      : { duration: 0.2, ease: 'easeInOut' as const },
    
    // Indicator bar animation
    indicatorTransition: prefersReducedMotion
      ? { duration: 0, ease: 'linear' as const }
      : { duration: 0.2, ease: 'easeOut' as const },
    
    // Slide animation distance
    slideDistance: prefersReducedMotion ? 0 : 20,
    
    // Whether animations are enabled
    enabled: !prefersReducedMotion,
  };

  console.log('[useAnimationConfig] Animation configuration:', {
    prefersReducedMotion,
    tabDuration: config.tabTransition.duration,
    cardDuration: config.cardTransition.duration,
    animationsEnabled: config.enabled,
    timestamp: Date.now()
  });

  return config;
}
