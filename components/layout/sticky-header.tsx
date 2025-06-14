'use client';

import * as React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { AIInsightsProgressBanner } from '@/components/ai-insights-progress-banner';
import type { AIInsightsState } from '@/lib/types/ai-insights';

interface StickyHeaderProps {
  children: React.ReactNode;           // Breadcrumb content
  progress?: number;                   // AI analysis progress (0-100)
  isCollapsed?: boolean;               // Progress banner collapse state
  onToggleCollapse?: () => void;       // Toggle banner collapse
  primaryAction?: React.ReactNode;     // Primary CTA (Generate Note)
  secondaryActions?: React.ReactNode;  // Secondary actions menu
  aiInsights?: AIInsightsState;        // AI insights data for banner
  activeInsightTab?: 'safety' | 'billing' | 'progress'; // Current active tab
  onInsightTabClick?: (tab: 'safety' | 'billing' | 'progress') => void; // Tab click handler
  className?: string;
}

export function StickyHeader({
  children,
  progress = 0,
  isCollapsed = false,
  onToggleCollapse,
  primaryAction,
  secondaryActions,
  aiInsights,
  activeInsightTab = 'safety',
  onInsightTabClick,
  className
}: StickyHeaderProps) {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [headerHeight, setHeaderHeight] = React.useState(0);
  const headerRef = React.useRef<HTMLDivElement>(null);

  // Track scroll position for shadow effect
  React.useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const newIsScrolled = scrollTop > 10;
      
      if (newIsScrolled !== isScrolled) {
        setIsScrolled(newIsScrolled);
        
        console.log('[StickyHeader] Scroll state changed:', {
          scrollTop,
          isScrolled: newIsScrolled,
          timestamp: Date.now()
        });
      }
    };

    // Debounced scroll handler for performance
    let ticking = false;
    const debouncedHandleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', debouncedHandleScroll, { passive: true });
    
    // Initial check
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', debouncedHandleScroll);
    };
  }, [isScrolled]);

  // Track header height for layout calculations
  React.useEffect(() => {
    const updateHeight = () => {
      if (headerRef.current) {
        const height = headerRef.current.offsetHeight;
        setHeaderHeight(height);
        
        console.log('[StickyHeader] Height updated:', {
          height,
          isCollapsed,
          timestamp: Date.now()
        });
      }
    };

    updateHeight();
    
    // Update on window resize
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, [isCollapsed, progress]);

  // Handle banner collapse toggle
  const handleToggleCollapse = React.useCallback(() => {
    console.log('[StickyHeader] Banner toggle:', {
      wasCollapsed: isCollapsed,
      willBeCollapsed: !isCollapsed,
      progress,
      timestamp: Date.now()
    });
    
    onToggleCollapse?.();
  }, [isCollapsed, progress, onToggleCollapse]);

  // Log component mount for debugging
  React.useEffect(() => {
    console.log('[StickyHeader] Component mounted:', {
      progress,
      isCollapsed,
      hasProgress: progress > 0,
      timestamp: Date.now()
    });

    return () => {
      console.log('[StickyHeader] Component unmounted:', {
        timestamp: Date.now()
      });
    };
  }, []);

  // Show progress banner if there's progress or AI insights data
  const showProgressBanner = (progress > 0 && progress < 100) || !!aiInsights;
  const shouldShowBanner = showProgressBanner && !isCollapsed;

  return (
    <>
      <header
        ref={headerRef}
        className={cn(
          'sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-200',
          isScrolled && 'shadow-sm border-b border-border/40',
          className
        )}
      >
        {/* Main Header Content */}
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Left: Breadcrumb Navigation */}
            <div className="flex-1 min-w-0">
              {children}
            </div>
            
            {/* Right: Actions */}
            <div className="flex items-center space-x-3 ml-4">
              {secondaryActions}
              {primaryAction}
            </div>
          </div>
        </div>

        {/* AI Progress Banner */}
        {showProgressBanner && (
          <div 
            className={cn(
              'border-t border-border/20 bg-muted/30 transition-all duration-300 ease-in-out overflow-hidden',
              shouldShowBanner ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'
            )}
          >
            <div className="container mx-auto px-6">
              <div className="flex items-center justify-between py-3">
                <div className="flex-1">
                  {/* AI Insights Progress Banner */}
                  {aiInsights ? (
                    <AIInsightsProgressBanner
                      insights={aiInsights}
                      activeInsightTab={activeInsightTab}
                      onMetricClick={onInsightTabClick}
                    />
                  ) : (
                    /* Fallback to traditional progress display */
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">
                          AI Analysis Progress
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {Math.round(progress)}%
                        </span>
                      </div>
                      <Progress 
                        value={progress} 
                        className="h-2 w-full"
                      />
                    </div>
                  )}
                </div>
                
                {/* Collapse Toggle */}
                {onToggleCollapse && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleToggleCollapse}
                    className="ml-4 h-8 w-8 p-0"
                    aria-label={isCollapsed ? 'Expand progress banner' : 'Collapse progress banner'}
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Collapsed Progress Indicator */}
        {showProgressBanner && isCollapsed && (
          <div className="border-t border-border/20 bg-muted/20">
            <div className="container mx-auto px-6">
              <div className="flex items-center justify-between py-1">
                <div className="flex-1">
                  <Progress 
                    value={progress} 
                    className="h-1 w-full"
                  />
                </div>
                
                {onToggleCollapse && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleToggleCollapse}
                    className="ml-4 h-6 w-6 p-0"
                    aria-label="Expand progress banner"
                  >
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Spacer to prevent content jump */}
      <div 
        style={{ height: headerHeight }} 
        className="shrink-0"
        aria-hidden="true"
      />
    </>
  );
}

// Mobile-optimized variant
export function MobileStickyHeader({
  children,
  progress = 0,
  primaryAction,
  className
}: Omit<StickyHeaderProps, 'isCollapsed' | 'onToggleCollapse' | 'secondaryActions'>) {
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 10);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-200',
        isScrolled && 'shadow-sm border-b border-border/40',
        className
      )}
    >
      {/* Compact mobile header */}
      <div className="px-4">
        <div className="flex items-center justify-between h-14">
          <div className="flex-1 min-w-0 text-sm">
            {children}
          </div>
          
          {primaryAction && (
            <div className="ml-3">
              {primaryAction}
            </div>
          )}
        </div>

        {/* Mobile progress bar */}
        {progress > 0 && progress < 100 && (
          <div className="pb-2">
            <Progress value={progress} className="h-1 w-full" />
          </div>
        )}
      </div>
    </header>
  );
}

// Hook for accessing header height in other components
export function useStickyHeaderHeight() {
  const [height, setHeight] = React.useState(0);

  React.useEffect(() => {
    const updateHeight = () => {
      const header = document.querySelector('[data-sticky-header]') as HTMLElement;
      if (header) {
        setHeight(header.offsetHeight);
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    
    // Use ResizeObserver if available for more accurate tracking
    if (typeof ResizeObserver !== 'undefined') {
      const header = document.querySelector('[data-sticky-header]') as HTMLElement;
      if (header) {
        const observer = new ResizeObserver(updateHeight);
        observer.observe(header);
        
        return () => {
          observer.disconnect();
          window.removeEventListener('resize', updateHeight);
        };
      }
    }
    
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  return height;
}
