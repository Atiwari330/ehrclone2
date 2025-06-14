'use client';

import * as React from 'react';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import { GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SplitPaneProps {
  defaultSizes: [number, number];           // [60, 40] default percentages
  minSize?: number;                         // Minimum panel size (percentage)
  maxSize?: number;                         // Maximum panel size (percentage)
  direction?: 'horizontal' | 'vertical';    // Split direction
  persistSizes?: boolean;                   // Save sizes to localStorage
  storageKey?: string;                      // localStorage key for persistence
  onResize?: (sizes: number[]) => void;     // Callback for resize events
  className?: string;
  children: [React.ReactNode, React.ReactNode]; // Exactly two children
}

export function SplitPane({
  defaultSizes,
  minSize = 20,
  maxSize = 80,
  direction = 'horizontal',
  persistSizes = true,
  storageKey = 'split-pane-sizes',
  onResize,
  className,
  children
}: SplitPaneProps) {
  const [sizes, setSizes] = React.useState<number[]>(defaultSizes);
  const [isResizing, setIsResizing] = React.useState(false);
  const lastValidSizes = React.useRef<number[]>(defaultSizes);

  // Load saved sizes from localStorage
  React.useEffect(() => {
    if (!persistSizes) return;

    try {
      const savedSizes = localStorage.getItem(storageKey);
      if (savedSizes) {
        const parsedSizes = JSON.parse(savedSizes);
        if (Array.isArray(parsedSizes) && parsedSizes.length === 2) {
          // Validate sizes are within bounds
          const validatedSizes = parsedSizes.map((size, index) => {
            const clampedSize = Math.max(minSize, Math.min(maxSize, size));
            return clampedSize;
          });

          // Ensure sizes add up to 100%
          const totalSize = validatedSizes.reduce((sum, size) => sum + size, 0);
          if (Math.abs(totalSize - 100) < 1) {
            setSizes(validatedSizes);
            lastValidSizes.current = validatedSizes;
            
            console.log('[SplitPane] Loaded saved sizes:', {
              storageKey,
              sizes: validatedSizes,
              timestamp: Date.now()
            });
          }
        }
      }
    } catch (error) {
      console.warn('[SplitPane] Failed to load saved sizes:', error);
    }
  }, [persistSizes, storageKey, minSize, maxSize]);

  // Save sizes to localStorage with debouncing
  const saveSizes = React.useMemo(() => {
    if (!persistSizes) return () => {};

    let timeoutId: NodeJS.Timeout;
    
    return (newSizes: number[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        try {
          localStorage.setItem(storageKey, JSON.stringify(newSizes));
          console.log('[SplitPane] Saved sizes to localStorage:', {
            storageKey,
            sizes: newSizes,
            timestamp: Date.now()
          });
        } catch (error) {
          console.warn('[SplitPane] Failed to save sizes:', error);
        }
      }, 500); // 500ms debounce
    };
  }, [persistSizes, storageKey]);

  // Handle panel resize
  const handleResize = React.useCallback((newSizes: number[]) => {
    // Validate sizes
    const validatedSizes = newSizes.map(size => 
      Math.max(minSize, Math.min(maxSize, size))
    );

    setSizes(validatedSizes);
    lastValidSizes.current = validatedSizes;
    
    // Log resize event
    console.log('[SplitPane] Panel resized:', {
      oldSizes: sizes,
      newSizes: validatedSizes,
      direction,
      isResizing,
      timestamp: Date.now()
    });

    // Save to localStorage
    saveSizes(validatedSizes);
    
    // Call external callback
    onResize?.(validatedSizes);
  }, [sizes, minSize, maxSize, direction, isResizing, saveSizes, onResize]);

  // Handle resize start
  const handleResizeStart = React.useCallback(() => {
    setIsResizing(true);
    
    console.log('[SplitPane] Resize started:', {
      currentSizes: sizes,
      timestamp: Date.now()
    });
  }, [sizes]);

  // Handle resize end
  const handleResizeEnd = React.useCallback(() => {
    setIsResizing(false);
    
    console.log('[SplitPane] Resize ended:', {
      finalSizes: lastValidSizes.current,
      timestamp: Date.now()
    });
  }, []);

  // Reset to default sizes
  const resetToDefault = React.useCallback(() => {
    setSizes(defaultSizes);
    lastValidSizes.current = defaultSizes;
    saveSizes(defaultSizes);
    onResize?.(defaultSizes);
    
    console.log('[SplitPane] Reset to default sizes:', {
      defaultSizes,
      storageKey,
      timestamp: Date.now()
    });
  }, [defaultSizes, saveSizes, onResize, storageKey]);

  // Keyboard shortcuts for panel resizing
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle if Ctrl/Cmd is pressed
      if (!(event.ctrlKey || event.metaKey)) return;

      let handled = false;
      const step = 5; // 5% step size

      switch (event.key) {
        case 'ArrowLeft':
          if (direction === 'horizontal') {
            const newFirst = Math.max(minSize, sizes[0] - step);
            const newSecond = 100 - newFirst;
            if (newSecond >= minSize && newSecond <= maxSize) {
              handleResize([newFirst, newSecond]);
              handled = true;
            }
          }
          break;

        case 'ArrowRight':
          if (direction === 'horizontal') {
            const newFirst = Math.min(maxSize, sizes[0] + step);
            const newSecond = 100 - newFirst;
            if (newSecond >= minSize && newSecond <= maxSize) {
              handleResize([newFirst, newSecond]);
              handled = true;
            }
          }
          break;

        case 'ArrowUp':
          if (direction === 'vertical') {
            const newFirst = Math.max(minSize, sizes[0] - step);
            const newSecond = 100 - newFirst;
            if (newSecond >= minSize && newSecond <= maxSize) {
              handleResize([newFirst, newSecond]);
              handled = true;
            }
          }
          break;

        case 'ArrowDown':
          if (direction === 'vertical') {
            const newFirst = Math.min(maxSize, sizes[0] + step);
            const newSecond = 100 - newFirst;
            if (newSecond >= minSize && newSecond <= maxSize) {
              handleResize([newFirst, newSecond]);
              handled = true;
            }
          }
          break;

        case '0':
          // Reset to default on Ctrl/Cmd + 0
          resetToDefault();
          handled = true;
          break;
      }

      if (handled) {
        event.preventDefault();
        console.log('[SplitPane] Keyboard resize:', {
          key: event.key,
          newSizes: sizes,
          direction,
          timestamp: Date.now()
        });
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [sizes, direction, minSize, maxSize, handleResize, resetToDefault]);

  // Log component mount
  React.useEffect(() => {
    console.log('[SplitPane] Component mounted:', {
      defaultSizes,
      direction,
      persistSizes,
      storageKey,
      timestamp: Date.now()
    });

    return () => {
      console.log('[SplitPane] Component unmounted:', {
        finalSizes: lastValidSizes.current,
        timestamp: Date.now()
      });
    };
  }, []);

  return (
    <PanelGroup
      direction={direction}
      className={cn(
        'h-full w-full',
        isResizing && 'select-none', // Prevent text selection during resize
        className
      )}
      onLayout={handleResize}
    >
      {/* First Panel */}
      <Panel
        defaultSize={sizes[0]}
        minSize={minSize}
        maxSize={maxSize}
        className="relative"
      >
        {children[0]}
      </Panel>

      {/* Resize Handle */}
      <PanelResizeHandle
        className={cn(
          'group relative flex items-center justify-center transition-colors',
          direction === 'horizontal' 
            ? 'w-2 cursor-col-resize hover:bg-border/50' 
            : 'h-2 cursor-row-resize hover:bg-border/50',
          isResizing && 'bg-border/70'
        )}
        onDragging={(isDragging) => {
          if (isDragging && !isResizing) {
            handleResizeStart();
          } else if (!isDragging && isResizing) {
            handleResizeEnd();
          }
          setIsResizing(isDragging);
        }}
      >
        <div
          className={cn(
            'rounded-sm bg-border/60 transition-all group-hover:bg-border group-active:bg-border',
            direction === 'horizontal' 
              ? 'h-10 w-1' 
              : 'h-1 w-10'
          )}
        >
          <GripVertical 
            className={cn(
              'opacity-0 group-hover:opacity-100 transition-opacity',
              direction === 'horizontal' 
                ? 'h-4 w-4 rotate-90' 
                : 'h-4 w-4'
            )} 
          />
        </div>
      </PanelResizeHandle>

      {/* Second Panel */}
      <Panel
        defaultSize={sizes[1]}
        minSize={minSize}
        maxSize={maxSize}
        className="relative"
      >
        {children[1]}
      </Panel>
    </PanelGroup>
  );
}

// Hook for external components to access current split pane sizes
export function useSplitPaneSizes(storageKey: string = 'split-pane-sizes') {
  const [sizes, setSizes] = React.useState<number[]>([60, 40]);

  React.useEffect(() => {
    try {
      const savedSizes = localStorage.getItem(storageKey);
      if (savedSizes) {
        const parsedSizes = JSON.parse(savedSizes);
        if (Array.isArray(parsedSizes) && parsedSizes.length === 2) {
          setSizes(parsedSizes);
        }
      }
    } catch (error) {
      console.warn('[useSplitPaneSizes] Failed to load sizes:', error);
    }

    // Listen for storage changes
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === storageKey && event.newValue) {
        try {
          const newSizes = JSON.parse(event.newValue);
          if (Array.isArray(newSizes) && newSizes.length === 2) {
            setSizes(newSizes);
          }
        } catch (error) {
          console.warn('[useSplitPaneSizes] Failed to parse updated sizes:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [storageKey]);

  return sizes;
}

// Responsive variant that stacks panels on small screens
export function ResponsiveSplitPane({
  breakpoint = 1024,
  stackedClassName = 'flex flex-col',
  ...props
}: SplitPaneProps & {
  breakpoint?: number;
  stackedClassName?: string;
}) {
  const [isStacked, setIsStacked] = React.useState(false);

  React.useEffect(() => {
    const checkViewport = () => {
      const shouldStack = window.innerWidth < breakpoint;
      if (shouldStack !== isStacked) {
        setIsStacked(shouldStack);
        
        console.log('[ResponsiveSplitPane] Layout mode changed:', {
          isStacked: shouldStack,
          viewport: window.innerWidth,
          breakpoint,
          timestamp: Date.now()
        });
      }
    };

    checkViewport();
    
    let timeoutId: NodeJS.Timeout;
    const debouncedCheck = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkViewport, 150);
    };

    window.addEventListener('resize', debouncedCheck);
    return () => {
      window.removeEventListener('resize', debouncedCheck);
      clearTimeout(timeoutId);
    };
  }, [breakpoint, isStacked]);

  if (isStacked) {
    return (
      <div className={cn('h-full w-full', stackedClassName)}>
        <div className="flex-1 min-h-0">
          {props.children[0]}
        </div>
        <div className="flex-1 min-h-0">
          {props.children[1]}
        </div>
      </div>
    );
  }

  return <SplitPane {...props} />;
}
