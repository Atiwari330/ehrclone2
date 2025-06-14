'use client';

import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cva, type VariantProps } from 'class-variance-authority';
import { Badge } from '@/components/ui/badge';

import { cn } from '@/lib/utils';

const Tabs = TabsPrimitive.Root;

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

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => {
  // Log tab content visibility for performance monitoring
  React.useEffect(() => {
    console.log('[Tabs] Tab content mounted:', {
      value: props.value,
      timestamp: Date.now()
    });
    
    return () => {
      console.log('[Tabs] Tab content unmounted:', {
        value: props.value,
        timestamp: Date.now()
      });
    };
  }, [props.value]);

  return (
    <TabsPrimitive.Content
      ref={ref}
      className={cn(
        'ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        className
      )}
      {...props}
    />
  );
});
TabsContent.displayName = TabsPrimitive.Content.displayName;

// Enhanced Tabs root component with logging and keyboard navigation
const TabsWithAnalytics = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root>
>(({ onValueChange, ...props }, ref) => {
  const handleValueChange = React.useCallback((value: string) => {
    console.log('[Tabs] Tab changed:', {
      newValue: value,
      previousValue: props.value || props.defaultValue,
      timestamp: Date.now(),
      method: 'programmatic'
    });
    
    onValueChange?.(value);
  }, [onValueChange, props.value, props.defaultValue]);

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
    />
  );
});
TabsWithAnalytics.displayName = 'Tabs';

export { TabsWithAnalytics as Tabs, TabsList, TabsTrigger, TabsContent };
export type { TabsTriggerProps };
