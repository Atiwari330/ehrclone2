'use client';

/**
 * Smart Action Bar Component
 * 
 * Displays contextual AI-powered action recommendations in a floating bar
 * with priority-based ordering and type-specific styling
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Separator } from '@/components/ui/separator';
import { 
  AlertTriangle,
  DollarSign,
  TrendingUp,
  FileText,
  ChevronRight,
  ChevronLeft,
  X,
  Loader2,
  CheckCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { 
  SmartAction, 
  AIInsightsState 
} from '@/lib/types/ai-insights';
import { smartActionsEngine } from '@/lib/services/smart-actions-engine';
import { cn } from '@/lib/utils';

// Icon mapping for dynamic icons
const ICON_MAP: Record<string, React.ComponentType<any>> = {
  AlertTriangle,
  Phone: AlertTriangle, // Using AlertTriangle as placeholder
  Shield: AlertTriangle,
  Pill: FileText,
  AlertCircle: AlertTriangle,
  Calendar: Clock,
  CheckCircle,
  Eye: CheckCircle,
  DollarSign,
  Trophy: TrendingUp,
  Target: TrendingUp,
  RefreshCw: TrendingUp,
  Plus: TrendingUp,
  Users: TrendingUp,
  FileText
};

interface SmartActionBarProps {
  insights: AIInsightsState;
  maxActions?: number;
  className?: string;
  onActionExecute?: (action: SmartAction) => void;
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  autoHide?: boolean;
  urgencyThreshold?: number;
}

export function SmartActionBar({
  insights,
  maxActions = 5,
  className,
  onActionExecute,
  position = 'bottom-right',
  autoHide = true,
  urgencyThreshold = 7
}: SmartActionBarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHidden, setIsHidden] = useState(autoHide);
  const [executingActionId, setExecutingActionId] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<SmartAction | null>(null);
  const [completedActions, setCompletedActions] = useState<Set<string>>(new Set());

  // Generate smart actions using the engine
  const actions = useMemo(() => {
    console.log('[SmartActionBar] Generating actions from insights:', {
      safetyStatus: insights.safety.status,
      billingStatus: insights.billing.status,
      progressStatus: insights.progress.status,
      safetyData: insights.safety.data,
      billingData: insights.billing.data,
      progressData: insights.progress.data,
      hasAnyData: !!(insights.safety.data || insights.billing.data || insights.progress.data),
      timestamp: Date.now()
    });

    const generatedActions = smartActionsEngine.generateActions(insights);
    
    console.log('[SmartActionBar] Actions generated:', {
      totalActions: generatedActions.length,
      urgentActions: generatedActions.filter(a => a.priority >= urgencyThreshold).length,
      actionTypes: generatedActions.reduce((acc, a) => {
        acc[a.type] = (acc[a.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      timestamp: Date.now()
    });

    // Filter out completed actions and limit to maxActions
    return generatedActions
      .filter(action => !completedActions.has(action.id))
      .slice(0, maxActions);
  }, [insights, maxActions, completedActions, urgencyThreshold]);

  // Auto-hide logic
  useEffect(() => {
    if (autoHide) {
      const hasActions = actions.length > 0;
      setIsHidden(!hasActions);
      
      console.log('[SmartActionBar] Auto-hide state updated:', {
        hasActions,
        isHidden: !hasActions,
        actionCount: actions.length,
        timestamp: Date.now()
      });
    }
  }, [actions.length, autoHide]);

  // Component mount/unmount logging
  useEffect(() => {
    console.log('[SmartActionBar] Component mounted:', {
      position,
      maxActions,
      autoHide,
      urgencyThreshold,
      timestamp: Date.now()
    });

    return () => {
      console.log('[SmartActionBar] Component unmounted:', {
        timestamp: Date.now()
      });
    };
  }, []);

  // Handle action execution
  const handleActionClick = async (action: SmartAction) => {
    console.log('[SmartActionBar] Action clicked:', {
      actionId: action.id,
      actionType: action.type,
      actionTitle: action.title,
      requiresConfirmation: action.requiresConfirmation,
      priority: action.priority,
      timestamp: Date.now()
    });

    if (action.requiresConfirmation) {
      setConfirmAction(action);
    } else {
      await executeAction(action);
    }
  };

  const executeAction = async (action: SmartAction) => {
    console.log('[SmartActionBar] Executing action:', {
      actionId: action.id,
      actionType: action.type,
      estimatedTime: action.estimatedTime,
      timestamp: Date.now()
    });

    setExecutingActionId(action.id);

    try {
      // Execute the action
      await action.action();
      
      // Mark as completed
      setCompletedActions(prev => new Set([...prev, action.id]));
      
      // Call the callback if provided
      if (onActionExecute) {
        onActionExecute(action);
      }

      console.log('[SmartActionBar] Action executed successfully:', {
        actionId: action.id,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('[SmartActionBar] Action execution failed:', {
        actionId: action.id,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      });
    } finally {
      setExecutingActionId(null);
      setConfirmAction(null);
    }
  };

  // Get position classes
  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-left':
        return 'bottom-6 left-6';
      case 'bottom-center':
        return 'bottom-6 left-1/2 -translate-x-1/2';
      case 'bottom-right':
      default:
        return 'bottom-6 right-6';
    }
  };

  // Get action type styling
  const getActionTypeStyles = (type: SmartAction['type']) => {
    switch (type) {
      case 'safety':
        return {
          buttonVariant: 'destructive' as const,
          badgeClass: 'bg-red-100 text-red-800 border-red-200',
          iconClass: 'text-red-600'
        };
      case 'billing':
        return {
          buttonVariant: 'default' as const,
          badgeClass: 'bg-green-100 text-green-800 border-green-200',
          iconClass: 'text-green-600'
        };
      case 'progress':
        return {
          buttonVariant: 'secondary' as const,
          badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
          iconClass: 'text-blue-600'
        };
      case 'note':
      default:
        return {
          buttonVariant: 'outline' as const,
          badgeClass: 'bg-gray-100 text-gray-800 border-gray-200',
          iconClass: 'text-gray-600'
        };
    }
  };

  // Get action icon component
  const getActionIcon = (iconName: string) => {
    const IconComponent = ICON_MAP[iconName] || FileText;
    return IconComponent;
  };

  // Don't render if hidden
  if (isHidden && actions.length === 0) {
    return null;
  }

  const urgentActions = actions.filter(a => a.priority >= urgencyThreshold);
  const hasUrgentActions = urgentActions.length > 0;

  return (
    <>
      <motion.div
        className={cn(
          'fixed z-50',
          getPositionClasses(),
          className
        )}
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <Card className={cn(
          'shadow-xl border-2',
          hasUrgentActions && 'border-red-200 animate-pulse'
        )}>
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-semibold">Smart Actions</span>
              {hasUrgentActions && (
                <Badge variant="destructive" className="text-xs">
                  {urgentActions.length} Urgent
                </Badge>
              )}
            </div>
            
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsCollapsed(!isCollapsed);
                  console.log('[SmartActionBar] Toggle collapsed:', {
                    isCollapsed: !isCollapsed,
                    timestamp: Date.now()
                  });
                }}
                className="h-8 w-8 p-0"
              >
                {isCollapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
              
              {autoHide && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsHidden(true);
                    console.log('[SmartActionBar] Manually hidden:', {
                      timestamp: Date.now()
                    });
                  }}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Actions List */}
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="p-3 space-y-2 max-w-sm">
                  {actions.length === 0 ? (
                    <div className="text-sm text-muted-foreground text-center py-4">
                      No actions available
                    </div>
                  ) : (
                    actions.map((action, index) => {
                      const styles = getActionTypeStyles(action.type);
                      const IconComponent = getActionIcon(action.icon);
                      const isExecuting = executingActionId === action.id;
                      const isCompleted = completedActions.has(action.id);

                      return (
                        <motion.div
                          key={action.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Button
                            variant={styles.buttonVariant}
                            size="sm"
                            className={cn(
                              'w-full justify-start h-auto py-2 px-3',
                              isCompleted && 'opacity-50'
                            )}
                            onClick={() => handleActionClick(action)}
                            disabled={isExecuting || isCompleted}
                          >
                            <div className="flex items-center w-full">
                              {isExecuting ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : isCompleted ? (
                                <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                              ) : (
                                <IconComponent className={cn('h-4 w-4 mr-2', styles.iconClass)} />
                              )}
                              
                              <div className="flex-1 text-left">
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm font-medium">{action.title}</span>
                                  {action.priority >= urgencyThreshold && (
                                    <Badge variant="destructive" className="text-xs px-1 py-0">
                                      !
                                    </Badge>
                                  )}
                                </div>
                                {action.estimatedTime && (
                                  <div className="flex items-center space-x-1 text-xs opacity-70 mt-0.5">
                                    <Clock className="h-3 w-3" />
                                    <span>{action.estimatedTime}s</span>
                                  </div>
                                )}
                              </div>
                              
                              <Badge className={cn('ml-2 text-xs', styles.badgeClass)}>
                                {action.type}
                              </Badge>
                            </div>
                          </Button>
                          
                          {index < actions.length - 1 && <Separator className="mt-2" />}
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>

      {/* Confirmation Dialog */}
      <AlertDialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Action</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmAction && executeAction(confirmAction)}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// Export variations for different use cases
export function UrgentSmartActionBar(props: Omit<SmartActionBarProps, 'urgencyThreshold'>) {
  return <SmartActionBar {...props} urgencyThreshold={7} maxActions={3} />;
}

export function CompactSmartActionBar(props: Omit<SmartActionBarProps, 'maxActions'>) {
  return <SmartActionBar {...props} maxActions={3} />;
}

export default SmartActionBar;
