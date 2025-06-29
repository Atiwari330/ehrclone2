'use client';

/**
 * Insight Summary Card Component
 * 
 * A reusable component for displaying insights with progressive disclosure.
 * Supports collapsed/expanded states with smooth animations and comprehensive logging.
 * 
 * Story 5.1 - Create Insight Summary Card Component
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronDown, 
  ChevronUp,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getSeverityToken, designSystem } from '@/lib/design-tokens';
import { useAnimationConfig } from '@/hooks/use-reduced-motion';

export interface InsightSummaryCardProps {
  // Core content
  id?: string;
  title: string;
  description?: string;
  summary?: string;
  
  // Severity and confidence
  severity?: 'critical' | 'high' | 'medium' | 'low' | 'info';
  confidence?: number; // 0-100
  
  // Visual customization
  icon?: React.ReactNode;
  accentColor?: string;
  badges?: Array<{
    label: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
    className?: string;
  }>;
  
  // State management
  defaultExpanded?: boolean;
  expanded?: boolean;
  onToggleExpanded?: (expanded: boolean) => void;
  
  // Content slots
  children?: React.ReactNode; // Expanded content
  actions?: React.ReactNode; // Action buttons in expanded state
  
  // Event handlers
  onCardClick?: () => void;
  onAction?: (actionId: string, actionData?: any) => void;
  
  // Styling
  className?: string;
  variant?: 'default' | 'compact';
  
  // Accessibility
  'aria-label'?: string;
  'aria-describedby'?: string;
}

export function InsightSummaryCard({
  id,
  title,
  description,
  summary,
  severity = 'info',
  confidence,
  icon,
  accentColor,
  badges = [],
  defaultExpanded = false,
  expanded: controlledExpanded,
  onToggleExpanded,
  children,
  actions,
  onCardClick,
  onAction,
  className,
  variant = 'default',
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  ...props
}: InsightSummaryCardProps) {
  // Animation configuration respecting user preferences
  const animationConfig = useAnimationConfig();
  
  // Internal state for expansion when not controlled
  const [internalExpanded, setInternalExpanded] = React.useState(defaultExpanded);
  
  // Determine if component is controlled or uncontrolled
  const isControlled = controlledExpanded !== undefined;
  const isExpanded = isControlled ? controlledExpanded : internalExpanded;
  
  // Unique ID for this card instance
  const cardId = React.useMemo(() => 
    id || `insight-card-${Math.random().toString(36).substr(2, 9)}`,
    [id]
  );

  console.log('[InsightSummaryCard] Rendering:', {
    cardId,
    title,
    severity,
    confidence,
    isExpanded,
    isControlled,
    hasChildren: !!children,
    hasActions: !!actions,
    timestamp: Date.now()
  });

  // Handle expansion toggle
  const handleToggleExpanded = React.useCallback((event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering onCardClick
    
    const newExpanded = !isExpanded;
    
    console.log('[InsightSummaryCard] Expansion toggled:', {
      cardId,
      title,
      wasExpanded: isExpanded,
      willBeExpanded: newExpanded,
      isControlled,
      timestamp: Date.now()
    });
    
    if (isControlled && onToggleExpanded) {
      onToggleExpanded(newExpanded);
    } else if (!isControlled) {
      setInternalExpanded(newExpanded);
    }
  }, [cardId, title, isExpanded, isControlled, onToggleExpanded]);

  // Handle card click
  const handleCardClick = React.useCallback(() => {
    if (onCardClick) {
      console.log('[InsightSummaryCard] Card clicked:', {
        cardId,
        title,
        severity,
        timestamp: Date.now()
      });
      onCardClick();
    }
  }, [cardId, title, severity, onCardClick]);

  // Get severity styling using design tokens
  const getSeverityStyles = React.useCallback((severity: string) => {
    const token = getSeverityToken(severity as 'critical' | 'high' | 'medium' | 'low' | 'info');
    
    console.log('[InsightSummaryCard] Using design token for severity:', {
      cardId,
      severity,
      tokenClasses: token.classes,
      timestamp: Date.now()
    });
    
    return {
      cardClass: token.classes.card,
      iconColor: token.classes.icon,
      badgeClass: token.classes.badge
    };
  }, [cardId]);

  // Get default icon for severity
  const getDefaultIcon = React.useCallback((severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4" />;
      case 'high':
        return <AlertCircle className="h-4 w-4" />;
      case 'medium':
        return <AlertCircle className="h-4 w-4" />;
      case 'low':
        return <Info className="h-4 w-4" />;
      default:
        return <CheckCircle className="h-4 w-4" />;
    }
  }, []);

  const severityStyles = getSeverityStyles(severity);
  const cardIcon = icon || getDefaultIcon(severity);

  // Component lifecycle logging
  React.useEffect(() => {
    console.log('[InsightSummaryCard] Component mounted:', {
      cardId,
      title,
      severity,
      confidence,
      defaultExpanded,
      timestamp: Date.now()
    });

    return () => {
      console.log('[InsightSummaryCard] Component unmounted:', {
        cardId,
        title,
        finalExpanded: isExpanded,
        timestamp: Date.now()
      });
    };
  }, [cardId, title, severity, confidence, defaultExpanded, isExpanded]);

  // Expansion state change logging
  React.useEffect(() => {
    console.log('[InsightSummaryCard] Expansion state changed:', {
      cardId,
      title,
      isExpanded,
      trigger: isControlled ? 'controlled' : 'internal',
      timestamp: Date.now()
    });
  }, [cardId, title, isExpanded, isControlled]);

  return (
    <div 
      className={cn(
        'rounded-lg border transition-all duration-200 hover:shadow-md',
        severityStyles.cardClass,
        onCardClick && 'cursor-pointer',
        variant === 'compact' && 'text-sm',
        className
      )}
      onClick={handleCardClick}
      aria-label={ariaLabel || `${title} insight card`}
      aria-describedby={ariaDescribedBy}
      aria-expanded={isExpanded}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleToggleExpanded(e as any);
        }
      }}
      {...props}
    >
      {/* Card Header - Always Visible */}
      <div className={cn(
        designSystem.spacing.card,
        variant === 'compact' && designSystem.spacing.cardCompact
      )}>
        <div className="flex items-start justify-between mb-2">
          {/* Left side: Icon, Title, Badges */}
          <div className="flex items-start space-x-2 min-w-0 flex-1">
            {/* Icon */}
            <div className={cn('flex-shrink-0 mt-0.5', severityStyles.iconColor)}>
              {cardIcon}
            </div>
            
            {/* Title and Badges */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h4 className={cn(
                  'font-medium truncate',
                  variant === 'compact' ? 'text-sm' : 'text-base'
                )}>
                  {title}
                </h4>
                
                {/* Severity Badge */}
                <Badge className={cn(
                  'text-xs capitalize border',
                  severityStyles.badgeClass
                )}>
                  {severity}
                </Badge>
                
                {/* Additional Badges */}
                {badges.map((badge, idx) => (
                  <Badge 
                    key={`${cardId}-badge-${idx}`}
                    variant={badge.variant || 'outline'}
                    className={cn('text-xs', badge.className)}
                  >
                    {badge.label}
                  </Badge>
                ))}
              </div>
              
              {/* Description */}
              {description && (
                <p className={cn(
                  'text-muted-foreground',
                  variant === 'compact' ? 'text-xs' : 'text-sm'
                )}>
                  {description}
                </p>
              )}
            </div>
          </div>
          
          {/* Right side: Confidence and Expand Button */}
          <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
            {/* Confidence Score */}
            {confidence !== undefined && (
              <Badge variant="outline" className="text-xs">
                {Math.round(confidence)}% confidence
              </Badge>
            )}
            
            {/* Expand/Collapse Button */}
            {children && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleExpanded}
                className="h-6 w-6 p-0 hover:bg-transparent"
                aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
              >
                {isExpanded ? (
                  <ChevronUp className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
              </Button>
            )}
          </div>
        </div>
        
        {/* Summary - Always visible when provided */}
        {summary && (
          <p className={cn(
            'text-muted-foreground mt-1',
            variant === 'compact' ? 'text-xs' : 'text-sm'
          )}>
            {summary}
          </p>
        )}
      </div>

      {/* Expanded Content - Animated */}
      {animationConfig.enabled ? (
        <AnimatePresence>
          {isExpanded && children && (
            <motion.div
              initial={{ height: 0, opacity: 0, willChange: 'height, opacity' }}
              animate={{ height: 'auto', opacity: 1, willChange: 'auto' }}
              exit={{ height: 0, opacity: 0, willChange: 'height, opacity' }}
              transition={animationConfig.cardTransition}
              className="overflow-hidden"
              onAnimationStart={() => {
                console.log('[InsightSummaryCard] Animation started:', {
                  cardId,
                  title,
                  action: isExpanded ? 'expanding' : 'collapsing',
                  duration: animationConfig.cardTransition.duration,
                  animationsEnabled: animationConfig.enabled,
                  timestamp: Date.now()
                });
              }}
              onAnimationComplete={() => {
                console.log('[InsightSummaryCard] Animation completed:', {
                  cardId,
                  title,
                  action: isExpanded ? 'expanded' : 'collapsed',
                  timestamp: Date.now()
                });
              }}
            >
              <div className={cn("border-t", designSystem.spacing.cardContent)}>
                {children}
                
                {/* Actions */}
                {actions && (
                  <div className="mt-3 pt-2 border-t">
                    {actions}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      ) : (
        // Static expanded content when animations are disabled
        isExpanded && children && (
          <div className="overflow-hidden">
            <div className={cn("border-t", designSystem.spacing.cardContent)}>
              {children}
              
              {/* Actions */}
              {actions && (
                <div className="mt-3 pt-2 border-t">
                  {actions}
                </div>
              )}
            </div>
          </div>
        )
      )}
    </div>
  );
}

// Performance optimization: Memoized version
export const MemoizedInsightSummaryCard = React.memo(InsightSummaryCard, (prevProps, nextProps) => {
  // Custom comparison to prevent unnecessary re-renders
  const shouldSkipRender = (
    prevProps.title === nextProps.title &&
    prevProps.description === nextProps.description &&
    prevProps.summary === nextProps.summary &&
    prevProps.severity === nextProps.severity &&
    prevProps.confidence === nextProps.confidence &&
    prevProps.expanded === nextProps.expanded &&
    prevProps.children === nextProps.children &&
    prevProps.className === nextProps.className
  );

  console.log('[InsightSummaryCard] React.memo comparison:', {
    cardId: prevProps.id || nextProps.id,
    shouldSkipRender,
    titleChanged: prevProps.title !== nextProps.title,
    severityChanged: prevProps.severity !== nextProps.severity,
    expandedChanged: prevProps.expanded !== nextProps.expanded,
    timestamp: Date.now()
  });

  return shouldSkipRender;
});

MemoizedInsightSummaryCard.displayName = 'MemoizedInsightSummaryCard';

// Export both versions
export default InsightSummaryCard;
