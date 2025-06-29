'use client';

import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { motion, AnimatePresence } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { Badge } from '@/components/ui/badge';
import { useAnimationConfig } from '@/hooks/use-reduced-motion';

import { cn } from '@/lib/utils';

const tabsListVariants = cva(
  'inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground',
  {
    variants: {
      variant: {
        default: 'bg-muted',
        underline: 'bg-transparent border-b border-border h-auto p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> &
    VariantProps<typeof tabsListVariants>
>(({ className, variant, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(tabsListVariants({ variant }), className)}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const tabsTriggerVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm',
        underline: 'border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-4 py-2',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

interface TabsTriggerProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>,
    VariantProps<typeof tabsTriggerVariants> {
  badge?: number | string;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  TabsTriggerProps
>(({ className, variant, badge, badgeVariant = 'secondary', children, onClick, ...props }, ref) => {
  // Log tab interactions for analytics
  const handleClick = React.useCallback((event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    console.log('[Tabs] Tab trigger clicked:', {
      value: props.value,
      hasBadge: !!badge,
      badgeValue: badge,
      timestamp: Date.now()
    });
    
    // Call original onClick if provided
    onClick?.(event);
  }, [props.value, badge, onClick]);

  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(tabsTriggerVariants({ variant }), className)}
      onClick={handleClick}
      {...props}
    >
      <span className="flex items-center gap-2">
        {children}
        {badge !== undefined && badge !== null && badge !== 0 && (
          <Badge 
            variant={badgeVariant} 
            className="ml-1 h-5 min-w-5 text-xs px-1.5 py-0.5 leading-none"
          >
            {badge}
          </Badge>
        )}
      </span>
    </TabsPrimitive.Trigger>
  );
});
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

// Context to track tab animations and direction
interface TabsAnimationContextType {
  activeTab: string | null;
  previousTab: string | null;
  tabOrder: string[];
  registerTab: (value: string) => void;
  setActiveTab: (value: string) => void;
}

const TabsAnimationContext = React.createContext<TabsAnimationContextType | null>(null);

// Hook to use tabs animation context
function useTabsAnimation() {
  const context = React.useContext(TabsAnimationContext);
  if (!context) {
    throw new Error('useTabsAnimation must be used within TabsAnimationProvider');
  }
  return context;
}

// Provider component for tab animation context
function TabsAnimationProvider({ children, currentValue }: { children: React.ReactNode; currentValue?: string }) {
  const [activeTab, setActiveTabState] = React.useState<string | null>(currentValue || null);
  const [previousTab, setPreviousTab] = React.useState<string | null>(null);
  const [tabOrder, setTabOrder] = React.useState<string[]>([]);

  const registerTab = React.useCallback((value: string) => {
    setTabOrder(prev => {
      if (!prev.includes(value)) {
        const newOrder = [...prev, value];
        console.log('[TabsAnimation] Tab registered:', {
          value,
          newOrder,
          timestamp: Date.now()
        });
        return newOrder;
      }
      return prev;
    });
  }, []);

  const setActiveTab = React.useCallback((value: string) => {
    setPreviousTab(activeTab);
    setActiveTabState(value);
    
    console.log('[TabsAnimation] Active tab changed:', {
      previousTab: activeTab,
      newTab: value,
      tabOrder,
      timestamp: Date.now()
    });
  }, [activeTab, tabOrder]);

  // Update active tab when currentValue changes
  React.useEffect(() => {
    if (currentValue && currentValue !== activeTab) {
      setActiveTab(currentValue);
    }
  }, [currentValue, activeTab, setActiveTab]);

  const contextValue = React.useMemo(() => ({
    activeTab,
    previousTab,
    tabOrder,
    registerTab,
    setActiveTab
  }), [activeTab, previousTab, tabOrder, registerTab, setActiveTab]);

  return (
    <TabsAnimationContext.Provider value={contextValue}>
      {children}
    </TabsAnimationContext.Provider>
  );
}

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, children, ...props }, ref) => {
  const animationConfig = useAnimationConfig();
  const animationContext = React.useContext(TabsAnimationContext);
  
  // Register this tab content
  React.useEffect(() => {
    if (animationContext && props.value) {
      animationContext.registerTab(props.value);
    }
  }, [props.value, animationContext]);

  // Determine slide direction based on tab order
  const getSlideDirection = React.useCallback(() => {
    if (!animationContext || !props.value || !animationContext.previousTab) {
      return 0; // No animation for first render
    }

    const currentIndex = animationContext.tabOrder.indexOf(props.value);
    const previousIndex = animationContext.tabOrder.indexOf(animationContext.previousTab);
    
    const direction = currentIndex > previousIndex ? 1 : -1;
    
    console.log('[TabsContent] Calculating slide direction:', {
      currentTab: props.value,
      previousTab: animationContext.previousTab,
      currentIndex,
      previousIndex,
      direction,
      slideDistance: animationConfig.slideDistance * direction,
      timestamp: Date.now()
    });

    return direction;
  }, [props.value, animationContext, animationConfig.slideDistance]);

  // Log tab content visibility for performance monitoring
  React.useEffect(() => {
    console.log('[TabsContent] Tab content lifecycle:', {
      value: props.value,
      action: 'mounted',
      animationsEnabled: animationConfig.enabled,
      timestamp: Date.now()
    });
    
    return () => {
      console.log('[TabsContent] Tab content lifecycle:', {
        value: props.value,
        action: 'unmounted',
        timestamp: Date.now()
      });
    };
  }, [props.value, animationConfig.enabled]);

  const slideDirection = getSlideDirection();
  const slideDistance = animationConfig.slideDistance * slideDirection;

  return (
    <TabsPrimitive.Content
      ref={ref}
      className={cn(
        'ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'overflow-hidden', // Prevent content from showing during slide
        className
      )}
      asChild={animationConfig.enabled}
      {...props}
    >
      {animationConfig.enabled ? (
        <motion.div
          key={props.value} // Force remount on tab change for clean animations
          initial={{ 
            opacity: 0, 
            x: slideDistance,
            willChange: 'transform, opacity'
          }}
          animate={{ 
            opacity: 1, 
            x: 0,
            willChange: 'auto'
          }}
          exit={{ 
            opacity: 0, 
            x: -slideDistance,
            willChange: 'transform, opacity'
          }}
          transition={animationConfig.tabTransition}
          onAnimationStart={() => {
            console.log('[TabsContent] Animation started:', {
              value: props.value,
              slideDirection,
              slideDistance,
              duration: animationConfig.tabTransition.duration,
              timestamp: Date.now()
            });
          }}
          onAnimationComplete={() => {
            console.log('[TabsContent] Animation completed:', {
              value: props.value,
              slideDirection,
              timestamp: Date.now()
            });
          }}
          className="h-full w-full"
        >
          {children}
        </motion.div>
      ) : (
        <div className="h-full w-full">
          {children}
        </div>
      )}
    </TabsPrimitive.Content>
  );
});
TabsContent.displayName = TabsPrimitive.Content.displayName;

// Enhanced TabsList with animated indicator bar
const AnimatedTabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> &
    VariantProps<typeof tabsListVariants> & {
      showIndicator?: boolean;
    }
>(({ className, variant, showIndicator = false, ...props }, ref) => {
  const animationConfig = useAnimationConfig();
  const [indicatorStyle, setIndicatorStyle] = React.useState<React.CSSProperties>({});
  
  // Update indicator position when active tab changes
  React.useEffect(() => {
    if (!showIndicator || !animationConfig.enabled) return;

    const updateIndicator = () => {
      const activeTab = document.querySelector('[role="tab"][data-state="active"]') as HTMLElement;
      if (activeTab) {
        const tabList = activeTab.parentElement;
        if (tabList) {
          const tabListRect = tabList.getBoundingClientRect();
          const activeTabRect = activeTab.getBoundingClientRect();
          
          const left = activeTabRect.left - tabListRect.left;
          const width = activeTabRect.width;
          
          setIndicatorStyle({
            left: `${left}px`,
            width: `${width}px`,
            opacity: 1,
          });
          
          console.log('[AnimatedTabsList] Indicator updated:', {
            left,
            width,
            activeTabValue: activeTab.getAttribute('data-value'),
            timestamp: Date.now()
          });
        }
      }
    };

    // Update immediately
    updateIndicator();
    
    // Update on resize
    const handleResize = () => {
      requestAnimationFrame(updateIndicator);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Use MutationObserver to detect tab state changes
    const observer = new MutationObserver(() => {
      requestAnimationFrame(updateIndicator);
    });
    
    const tabList = document.querySelector('[role="tablist"]');
    if (tabList) {
      observer.observe(tabList, {
        attributes: true,
        attributeFilter: ['data-state'],
        subtree: true
      });
    }
    
    return () => {
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
    };
  }, [showIndicator, animationConfig.enabled]);

  return (
    <div className="relative">
      <TabsPrimitive.List
        ref={ref}
        className={cn(tabsListVariants({ variant }), className)}
        {...props}
      />
      {showIndicator && animationConfig.enabled && (
        <motion.div
          className="absolute bottom-0 h-0.5 bg-primary rounded-full"
          style={indicatorStyle}
          initial={{ opacity: 0 }}
          animate={{ opacity: indicatorStyle.opacity || 0 }}
          transition={animationConfig.indicatorTransition}
          onAnimationStart={() => {
            console.log('[AnimatedTabsList] Indicator animation started:', {
              style: indicatorStyle,
              timestamp: Date.now()
            });
          }}
          onAnimationComplete={() => {
            console.log('[AnimatedTabsList] Indicator animation completed:', {
              timestamp: Date.now()
            });
          }}
        />
      )}
    </div>
  );
});
AnimatedTabsList.displayName = 'AnimatedTabsList';

// Enhanced Tabs root component with animation context
const TabsWithAnalytics = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root>
>(({ onValueChange, children, ...props }, ref) => {
  const animationContext = React.useContext(TabsAnimationContext);
  
  const handleValueChange = React.useCallback((value: string) => {
    console.log('[Tabs] Tab changed:', {
      newValue: value,
      previousValue: props.value || props.defaultValue,
      timestamp: Date.now(),
      method: 'programmatic'
    });
    
    // Update animation context
    if (animationContext) {
      animationContext.setActiveTab(value);
    }
    
    onValueChange?.(value);
  }, [onValueChange, props.value, props.defaultValue, animationContext]);

  // Keyboard navigation enhancement
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle if focus is within tabs
      const activeElement = document.activeElement;
      if (!activeElement?.closest('[role="tablist"]')) return;

      let handled = false;
      
      switch (event.key) {
        case 'ArrowLeft':
        case 'ArrowUp':
          // Move to previous tab
          const prevTrigger = activeElement.previousElementSibling as HTMLElement;
          if (prevTrigger && prevTrigger.getAttribute('role') === 'tab') {
            prevTrigger.focus();
            prevTrigger.click();
            handled = true;
          }
          break;
          
        case 'ArrowRight':
        case 'ArrowDown':
          // Move to next tab
          const nextTrigger = activeElement.nextElementSibling as HTMLElement;
          if (nextTrigger && nextTrigger.getAttribute('role') === 'tab') {
            nextTrigger.focus();
            nextTrigger.click();
            handled = true;
          }
          break;
          
        case 'Home':
          // Move to first tab
          const firstTrigger = activeElement.parentElement?.firstElementChild as HTMLElement;
          if (firstTrigger && firstTrigger.getAttribute('role') === 'tab') {
            firstTrigger.focus();
            firstTrigger.click();
            handled = true;
          }
          break;
          
        case 'End':
          // Move to last tab
          const lastTrigger = activeElement.parentElement?.lastElementChild as HTMLElement;
          if (lastTrigger && lastTrigger.getAttribute('role') === 'tab') {
            lastTrigger.focus();
            lastTrigger.click();
            handled = true;
          }
          break;
      }
      
      if (handled) {
        event.preventDefault();
        console.log('[Tabs] Keyboard navigation:', {
          key: event.key,
          direction: event.key.includes('Left') || event.key.includes('Up') ? 'previous' : 'next',
          timestamp: Date.now()
        });
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <TabsPrimitive.Root
      ref={ref}
      onValueChange={handleValueChange}
      {...props}
    >
      {children}
    </TabsPrimitive.Root>
  );
});
TabsWithAnalytics.displayName = 'Tabs';

// Main Tabs component with animation context wrapper
const Tabs = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root>
>(({ children, ...props }, ref) => {
  const currentValue = props.value || props.defaultValue;
  
  return (
    <TabsAnimationProvider currentValue={currentValue}>
      <TabsWithAnalytics ref={ref} {...props}>
        {children}
      </TabsWithAnalytics>
    </TabsAnimationProvider>
  );
});
Tabs.displayName = 'Tabs';

export { 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent, 
  AnimatedTabsList,
  TabsAnimationProvider,
  useTabsAnimation 
};
export type { TabsTriggerProps };
