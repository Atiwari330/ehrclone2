'use client';

import { useState, useEffect, useCallback } from 'react';

export type LayoutMode = 'split' | 'stacked' | 'mobile';

interface UseResponsiveLayoutReturn {
  mode: LayoutMode;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  breakpoint: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  viewport: {
    width: number;
    height: number;
  };
  triggerResize: () => void;
}

interface ResponsiveLayoutConfig {
  mobileBreakpoint?: number;    // 0-767px
  tabletBreakpoint?: number;    // 768-1023px
  desktopBreakpoint?: number;   // 1024px+
  debounceMs?: number;          // Debounce resize events
}

export function useResponsiveLayout({
  mobileBreakpoint = 768,
  tabletBreakpoint = 1024,
  desktopBreakpoint = 1024,
  debounceMs = 150
}: ResponsiveLayoutConfig = {}): UseResponsiveLayoutReturn {
  const [viewport, setViewport] = useState({
    width: 1200, // Default desktop width for SSR
    height: 800
  });

  const [mode, setMode] = useState<LayoutMode>('split');

  // Calculate layout mode based on viewport width
  const calculateLayoutMode = useCallback((width: number): LayoutMode => {
    if (width < mobileBreakpoint) {
      return 'mobile';
    } else if (width < tabletBreakpoint) {
      return 'stacked';
    } else {
      return 'split';
    }
  }, [mobileBreakpoint, tabletBreakpoint]);

  // Update viewport and layout mode
  const updateLayout = useCallback(() => {
    if (typeof window === 'undefined') return;

    const newViewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    const newMode = calculateLayoutMode(newViewport.width);

    // Only update state if values actually changed
    setViewport(prevViewport => {
      if (
        prevViewport.width !== newViewport.width ||
        prevViewport.height !== newViewport.height
      ) {
        console.log('[ResponsiveLayout] Viewport updated:', {
          oldViewport: prevViewport,
          newViewport,
          timestamp: Date.now()
        });
        return newViewport;
      }
      return prevViewport;
    });

    setMode(prevMode => {
      if (prevMode !== newMode) {
        console.log('[ResponsiveLayout] Layout mode changed:', {
          oldMode: prevMode,
          newMode,
          viewport: newViewport,
          breakpoints: {
            mobile: mobileBreakpoint,
            tablet: tabletBreakpoint,
            desktop: desktopBreakpoint
          },
          timestamp: Date.now()
        });
        return newMode;
      }
      return prevMode;
    });
  }, [calculateLayoutMode, mobileBreakpoint, tabletBreakpoint, desktopBreakpoint]);

  // Debounced resize handler
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Initial calculation
    updateLayout();

    let timeoutId: NodeJS.Timeout;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateLayout, debounceMs);
    };

    // Add event listener
    window.addEventListener('resize', debouncedResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', debouncedResize);
      clearTimeout(timeoutId);
    };
  }, [updateLayout, debounceMs]);

  // Manual trigger for testing or forced updates
  const triggerResize = useCallback(() => {
    console.log('[ResponsiveLayout] Manual resize triggered:', {
      currentMode: mode,
      currentViewport: viewport,
      timestamp: Date.now()
    });
    updateLayout();
  }, [updateLayout, mode, viewport]);

  // Log component lifecycle
  useEffect(() => {
    console.log('[ResponsiveLayout] Hook initialized:', {
      initialMode: mode,
      initialViewport: viewport,
      config: {
        mobileBreakpoint,
        tabletBreakpoint,
        desktopBreakpoint,
        debounceMs
      },
      timestamp: Date.now()
    });

    return () => {
      console.log('[ResponsiveLayout] Hook cleanup:', {
        finalMode: mode,
        finalViewport: viewport,
        timestamp: Date.now()
      });
    };
  }, []); // Only on mount/unmount

  // Derived boolean flags for convenience
  const isMobile = mode === 'mobile';
  const isTablet = mode === 'stacked';
  const isDesktop = mode === 'split';

  return {
    mode,
    isMobile,
    isTablet,
    isDesktop,
    breakpoint: {
      mobile: mobileBreakpoint,
      tablet: tabletBreakpoint,
      desktop: desktopBreakpoint
    },
    viewport,
    triggerResize
  };
}

// Hook for media query matching (alternative approach)
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(query);
    
    // Set initial value
    setMatches(mediaQuery.matches);

    // Create event listener
    const handler = (event: MediaQueryListEvent) => {
      console.log('[MediaQuery] Query match changed:', {
        query,
        matches: event.matches,
        timestamp: Date.now()
      });
      setMatches(event.matches);
    };

    // Add listener
    mediaQuery.addEventListener('change', handler);

    // Cleanup
    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

// Hook for tracking orientation changes
export function useOrientation() {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateOrientation = () => {
      const newOrientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
      
      setOrientation(prevOrientation => {
        if (prevOrientation !== newOrientation) {
          console.log('[Orientation] Changed:', {
            oldOrientation: prevOrientation,
            newOrientation,
            viewport: {
              width: window.innerWidth,
              height: window.innerHeight
            },
            timestamp: Date.now()
          });
        }
        return newOrientation;
      });
    };

    // Initial check
    updateOrientation();

    // Listen for resize events
    window.addEventListener('resize', updateOrientation);
    
    // Listen for orientation change events (mobile)
    window.addEventListener('orientationchange', updateOrientation);

    return () => {
      window.removeEventListener('resize', updateOrientation);
      window.removeEventListener('orientationchange', updateOrientation);
    };
  }, []);

  return orientation;
}

// Hook for detecting touch devices
export function useTouchDevice(): boolean {
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkTouchSupport = () => {
      const hasTouch = (
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        // @ts-ignore
        navigator.msMaxTouchPoints > 0
      );

      console.log('[TouchDevice] Detection result:', {
        hasTouch,
        maxTouchPoints: navigator.maxTouchPoints,
        userAgent: navigator.userAgent,
        timestamp: Date.now()
      });

      setIsTouchDevice(hasTouch);
    };

    checkTouchSupport();
  }, []);

  return isTouchDevice;
}

// Comprehensive responsive hook that combines all responsive utilities
export function useResponsive(config: ResponsiveLayoutConfig = {}) {
  const layout = useResponsiveLayout(config);
  const orientation = useOrientation();
  const isTouchDevice = useTouchDevice();
  
  // Common media queries
  const isSmallMobile = useMediaQuery('(max-width: 480px)');
  const isMediumMobile = useMediaQuery('(max-width: 640px)');
  const isTabletPortrait = useMediaQuery('(max-width: 768px) and (orientation: portrait)');
  const isTabletLandscape = useMediaQuery('(max-width: 1024px) and (orientation: landscape)');
  const isLargeDesktop = useMediaQuery('(min-width: 1440px)');
  const isUltraWide = useMediaQuery('(min-width: 1920px)');
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  return {
    ...layout,
    orientation,
    isTouchDevice,
    queries: {
      isSmallMobile,
      isMediumMobile,
      isTabletPortrait,
      isTabletLandscape,
      isLargeDesktop,
      isUltraWide,
      prefersReducedMotion,
      prefersDarkMode
    }
  };
}

// Constants for common breakpoints
export const BREAKPOINTS = {
  xs: 0,      // Extra small devices
  sm: 640,    // Small devices
  md: 768,    // Medium devices  
  lg: 1024,   // Large devices
  xl: 1280,   // Extra large devices
  '2xl': 1536 // 2X Extra large devices
} as const;

// Utility function to get breakpoint name from width
export function getBreakpointName(width: number): keyof typeof BREAKPOINTS {
  if (width >= BREAKPOINTS['2xl']) return '2xl';
  if (width >= BREAKPOINTS.xl) return 'xl';
  if (width >= BREAKPOINTS.lg) return 'lg';
  if (width >= BREAKPOINTS.md) return 'md';
  if (width >= BREAKPOINTS.sm) return 'sm';
  return 'xs';
}

// CSS-in-JS helper for responsive styles
export function responsive<T>(
  breakpoints: Partial<Record<keyof typeof BREAKPOINTS, T>>,
  currentWidth: number
): T | undefined {
  const currentBreakpoint = getBreakpointName(currentWidth);
  
  // Find the appropriate value for current breakpoint or smaller
  const breakpointOrder: (keyof typeof BREAKPOINTS)[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
  const currentIndex = breakpointOrder.indexOf(currentBreakpoint);
  
  for (let i = currentIndex; i >= 0; i--) {
    const breakpoint = breakpointOrder[i];
    if (breakpoints[breakpoint] !== undefined) {
      return breakpoints[breakpoint];
    }
  }
  
  return undefined;
}
