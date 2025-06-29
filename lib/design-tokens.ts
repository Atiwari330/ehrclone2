/**
 * Design Token System for EHR Transcript Review
 * 
 * Centralized color tokens for consistent theming across all insight components.
 * Follows FAANG-style minimal design principles with single accent colors per type.
 * 
 * Story 6.1 - Create Design Token System
 */

// Base color palette with semantic shades
const colors = {
  red: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  orange: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#f97316',
    600: '#ea580c',
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12',
  },
  yellow: {
    50: '#fefce8',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  green: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  blue: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  purple: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7c3aed',
    800: '#6b21a8',
    900: '#581c87',
  },
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
} as const;

// TypeScript type definitions for type safety
export interface DesignToken {
  name: string;
  accent: string;
  background: string;
  border: string;
  text: string;
  textMuted: string;
  icon: string;
  classes: {
    card: string;
    icon: string;
    text: string;
    textMuted: string;
    badge: string;
    [key: string]: string;
  };
}

export interface ConfidenceToken extends DesignToken {
  range: readonly [number, number];
}

// Insight type tokens - Single accent color per type with neutral backgrounds
export const insightTokens = {
  safety: {
    name: 'Safety',
    accent: colors.red[500],
    background: colors.red[50] + '/50', // 50% opacity for subtle tint
    border: colors.red[200] + '/50',
    text: colors.red[800],
    textMuted: colors.red[700],
    icon: colors.red[500],
    
    // Tailwind CSS classes for easy usage
    classes: {
      card: 'bg-red-50/50 border-red-200/50 shadow-sm',
      icon: 'text-red-500',
      text: 'text-red-800',
      textMuted: 'text-red-700',
      badge: 'bg-red-100 text-red-800 border-red-300',
      button: 'bg-red-500 hover:bg-red-600 text-white',
      buttonOutline: 'border-red-500 text-red-500 hover:bg-red-50',
    },
  },
  
  billing: {
    name: 'Billing',
    accent: colors.green[500],
    background: colors.green[50] + '/50',
    border: colors.green[200] + '/50',
    text: colors.green[800],
    textMuted: colors.green[700],
    icon: colors.green[500],
    
    classes: {
      card: 'bg-green-50/50 border-green-200/50 shadow-sm',
      icon: 'text-green-500',
      text: 'text-green-800',
      textMuted: 'text-green-700',
      badge: 'bg-green-100 text-green-800 border-green-300',
      button: 'bg-green-500 hover:bg-green-600 text-white',
      buttonOutline: 'border-green-500 text-green-500 hover:bg-green-50',
    },
  },
  
  progress: {
    name: 'Progress',
    accent: colors.blue[500],
    background: colors.blue[50] + '/50',
    border: colors.blue[200] + '/50',
    text: colors.blue[800],
    textMuted: colors.blue[700],
    icon: colors.blue[500],
    
    classes: {
      card: 'bg-blue-50/50 border-blue-200/50 shadow-sm',
      icon: 'text-blue-500',
      text: 'text-blue-800',
      textMuted: 'text-blue-700',
      badge: 'bg-blue-100 text-blue-800 border-blue-300',
      button: 'bg-blue-500 hover:bg-blue-600 text-white',
      buttonOutline: 'border-blue-500 text-blue-500 hover:bg-blue-50',
    },
  },
} as const;

// Severity level tokens - Used across all insight types
export const severityTokens = {
  critical: {
    name: 'Critical',
    accent: colors.red[500],
    background: colors.red[50] + '/50',
    border: colors.red[200] + '/50',
    text: colors.red[800],
    textMuted: colors.red[700],
    icon: colors.red[500],
    
    classes: {
      card: 'bg-red-50/50 border-red-200/50 shadow-sm',
      icon: 'text-red-500',
      text: 'text-red-800',
      textMuted: 'text-red-700',
      badge: 'bg-red-100 text-red-800 border-red-300',
      progressBar: 'bg-red-500',
    },
  },
  
  high: {
    name: 'High',
    accent: colors.orange[500],
    background: colors.orange[50] + '/50',
    border: colors.orange[200] + '/50',
    text: colors.orange[800],
    textMuted: colors.orange[700],
    icon: colors.orange[500],
    
    classes: {
      card: 'bg-orange-50/50 border-orange-200/50 shadow-sm',
      icon: 'text-orange-500',
      text: 'text-orange-800',
      textMuted: 'text-orange-700',
      badge: 'bg-orange-100 text-orange-800 border-orange-300',
      progressBar: 'bg-orange-500',
    },
  },
  
  medium: {
    name: 'Medium',
    accent: colors.yellow[500],
    background: colors.yellow[50] + '/50',
    border: colors.yellow[200] + '/50',
    text: colors.yellow[800],
    textMuted: colors.yellow[700],
    icon: colors.yellow[500],
    
    classes: {
      card: 'bg-yellow-50/50 border-yellow-200/50 shadow-sm',
      icon: 'text-yellow-500',
      text: 'text-yellow-800',
      textMuted: 'text-yellow-700',
      badge: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      progressBar: 'bg-yellow-500',
    },
  },
  
  low: {
    name: 'Low',
    accent: colors.blue[500],
    background: colors.blue[50] + '/50',
    border: colors.blue[200] + '/50',
    text: colors.blue[800],
    textMuted: colors.blue[700],
    icon: colors.blue[500],
    
    classes: {
      card: 'bg-blue-50/50 border-blue-200/50 shadow-sm',
      icon: 'text-blue-500',
      text: 'text-blue-800',
      textMuted: 'text-blue-700',
      badge: 'bg-blue-100 text-blue-800 border-blue-300',
      progressBar: 'bg-blue-500',
    },
  },
  
  info: {
    name: 'Info',
    accent: colors.gray[500],
    background: colors.gray[50] + '/50',
    border: colors.gray[200] + '/50',
    text: colors.gray[800],
    textMuted: colors.gray[700],
    icon: colors.gray[500],
    
    classes: {
      card: 'bg-gray-50/50 border-gray-200/50 shadow-sm',
      icon: 'text-gray-500',
      text: 'text-gray-800',
      textMuted: 'text-gray-700',
      badge: 'bg-gray-100 text-gray-800 border-gray-300',
      progressBar: 'bg-gray-500',
    },
  },
} as const;

// Confidence level tokens - Used for billing and other confidence-based features
export const confidenceTokens = {
  high: {
    name: 'High Confidence',
    range: [0.8, 1.0] as const,
    accent: colors.green[500],
    background: colors.green[50] + '/50',
    border: colors.green[200] + '/50',
    text: colors.green[800],
    textMuted: colors.green[700],
    icon: colors.green[500],
    
    classes: {
      card: 'bg-green-50/50 border-green-200/50 shadow-sm',
      icon: 'text-green-500',
      text: 'text-green-800',
      textMuted: 'text-green-700',
      badge: 'bg-green-100 text-green-800 border-green-300',
      progressBar: 'bg-green-500',
    },
  },
  
  medium: {
    name: 'Medium Confidence',
    range: [0.6, 0.8] as const,
    accent: colors.yellow[500],
    background: colors.yellow[50] + '/50',
    border: colors.yellow[200] + '/50',
    text: colors.yellow[800],
    textMuted: colors.yellow[700],
    icon: colors.yellow[500],
    
    classes: {
      card: 'bg-yellow-50/50 border-yellow-200/50 shadow-sm',
      icon: 'text-yellow-500',
      text: 'text-yellow-800',
      textMuted: 'text-yellow-700',
      badge: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      progressBar: 'bg-yellow-500',
    },
  },
  
  low: {
    name: 'Low Confidence',
    range: [0, 0.6] as const,
    accent: colors.gray[500],
    background: colors.gray[50] + '/50',
    border: colors.gray[200] + '/50',
    text: colors.gray[800],
    textMuted: colors.gray[700],
    icon: colors.gray[500],
    
    classes: {
      card: 'bg-gray-50/50 border-gray-200/50 shadow-sm',
      icon: 'text-gray-500',
      text: 'text-gray-800',
      textMuted: 'text-gray-700',
      badge: 'bg-gray-100 text-gray-800 border-gray-300',
      progressBar: 'bg-gray-500',
    },
  },
} as const;

// Status tokens - Used for various status indicators
export const statusTokens = {
  success: {
    name: 'Success',
    accent: colors.green[500],
    background: colors.green[50] + '/50',
    border: colors.green[200] + '/50',
    text: colors.green[800],
    textMuted: colors.green[700],
    icon: colors.green[500],
    
    classes: {
      card: 'bg-green-50/50 border-green-200/50 shadow-sm',
      icon: 'text-green-500',
      text: 'text-green-800',
      textMuted: 'text-green-700',
      badge: 'bg-green-100 text-green-800 border-green-300',
      button: 'bg-green-500 hover:bg-green-600 text-white',
    },
  },
  
  warning: {
    name: 'Warning',
    accent: colors.yellow[500],
    background: colors.yellow[50] + '/50',
    border: colors.yellow[200] + '/50',
    text: colors.yellow[800],
    textMuted: colors.yellow[700],
    icon: colors.yellow[500],
    
    classes: {
      card: 'bg-yellow-50/50 border-yellow-200/50 shadow-sm',
      icon: 'text-yellow-500',
      text: 'text-yellow-800',
      textMuted: 'text-yellow-700',
      badge: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      button: 'bg-yellow-500 hover:bg-yellow-600 text-white',
    },
  },
  
  error: {
    name: 'Error',
    accent: colors.red[500],
    background: colors.red[50] + '/50',
    border: colors.red[200] + '/50',
    text: colors.red[800],
    textMuted: colors.red[700],
    icon: colors.red[500],
    
    classes: {
      card: 'bg-red-50/50 border-red-200/50 shadow-sm',
      icon: 'text-red-500',
      text: 'text-red-800',
      textMuted: 'text-red-700',
      badge: 'bg-red-100 text-red-800 border-red-300',
      button: 'bg-red-500 hover:bg-red-600 text-white',
    },
  },
  
  info: {
    name: 'Info',
    accent: colors.blue[500],
    background: colors.blue[50] + '/50',
    border: colors.blue[200] + '/50',
    text: colors.blue[800],
    textMuted: colors.blue[700],
    icon: colors.blue[500],
    
    classes: {
      card: 'bg-blue-50/50 border-blue-200/50 shadow-sm',
      icon: 'text-blue-500',
      text: 'text-blue-800',
      textMuted: 'text-blue-700',
      badge: 'bg-blue-100 text-blue-800 border-blue-300',
      button: 'bg-blue-500 hover:bg-blue-600 text-white',
    },
  },
} as const;

// Specialized tokens for billing features
export const billingTokens = {
  approved: {
    name: 'Approved',
    accent: colors.green[500],
    background: colors.green[50] + '/50',
    border: colors.green[200] + '/50',
    text: colors.green[800],
    textMuted: colors.green[700],
    icon: colors.green[500],
    
    classes: {
      card: 'bg-green-50/50 border-green-200/50 shadow-sm',
      icon: 'text-green-500',
      text: 'text-green-800',
      textMuted: 'text-green-700',
      badge: 'bg-green-100 text-green-800 border-green-300',
      button: 'bg-green-500 hover:bg-green-600 text-white',
    },
  },
  
  pending: {
    name: 'Pending Review',
    accent: colors.yellow[500],
    background: colors.yellow[50] + '/50',
    border: colors.yellow[200] + '/50',
    text: colors.yellow[800],
    textMuted: colors.yellow[700],
    icon: colors.yellow[500],
    
    classes: {
      card: 'bg-yellow-50/50 border-yellow-200/50 shadow-sm',
      icon: 'text-yellow-500',
      text: 'text-yellow-800',
      textMuted: 'text-yellow-700',
      badge: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      button: 'bg-yellow-500 hover:bg-yellow-600 text-white',
    },
  },
  
  rejected: {
    name: 'Rejected',
    accent: colors.red[500],
    background: colors.red[50] + '/50',
    border: colors.red[200] + '/50',
    text: colors.red[800],
    textMuted: colors.red[700],
    icon: colors.red[500],
    
    classes: {
      card: 'bg-red-50/50 border-red-200/50 shadow-sm',
      icon: 'text-red-500',
      text: 'text-red-800',
      textMuted: 'text-red-700',
      badge: 'bg-red-100 text-red-800 border-red-300',
      button: 'bg-red-500 hover:bg-red-600 text-white',
    },
  },
  
  optimization: {
    name: 'Optimization',
    accent: colors.purple[500],
    background: colors.purple[50] + '/50',
    border: colors.purple[200] + '/50',
    text: colors.purple[800],
    textMuted: colors.purple[700],
    icon: colors.purple[500],
    
    classes: {
      card: 'bg-purple-50/50 border-purple-200/50 shadow-sm',
      icon: 'text-purple-500',
      text: 'text-purple-800',
      textMuted: 'text-purple-700',
      badge: 'bg-purple-100 text-purple-800 border-purple-300',
      button: 'bg-purple-500 hover:bg-purple-600 text-white',
    },
  },
} as const;

// TypeScript type definitions for type safety
export type InsightType = keyof typeof insightTokens;
export type SeverityLevel = keyof typeof severityTokens;
export type ConfidenceLevel = keyof typeof confidenceTokens;
export type StatusType = keyof typeof statusTokens;
export type BillingStatus = keyof typeof billingTokens;

// Utility functions for token usage
export function getInsightToken(type: InsightType): DesignToken {
  console.log('[DesignTokens] Getting insight token:', {
    type,
    token: insightTokens[type],
    timestamp: Date.now()
  });
  
  return insightTokens[type];
}

export function getSeverityToken(severity: SeverityLevel): DesignToken {
  console.log('[DesignTokens] Getting severity token:', {
    severity,
    token: severityTokens[severity],
    timestamp: Date.now()
  });
  
  return severityTokens[severity];
}

export function getConfidenceToken(confidence: number): ConfidenceToken {
  let level: ConfidenceLevel;
  
  if (confidence >= 0.8) {
    level = 'high';
  } else if (confidence >= 0.6) {
    level = 'medium';
  } else {
    level = 'low';
  }
  
  console.log('[DesignTokens] Getting confidence token:', {
    confidence,
    level,
    token: confidenceTokens[level],
    timestamp: Date.now()
  });
  
  return confidenceTokens[level];
}

export function getStatusToken(status: StatusType): DesignToken {
  console.log('[DesignTokens] Getting status token:', {
    status,
    token: statusTokens[status],
    timestamp: Date.now()
  });
  
  return statusTokens[status];
}

export function getBillingToken(status: BillingStatus): DesignToken {
  console.log('[DesignTokens] Getting billing token:', {
    status,
    token: billingTokens[status],
    timestamp: Date.now()
  });
  
  return billingTokens[status];
}

// Utility function to get appropriate token based on context
export function getContextualToken(
  type: 'insight' | 'severity' | 'confidence' | 'status' | 'billing',
  value: string | number
): DesignToken | ConfidenceToken {
  console.log('[DesignTokens] Getting contextual token:', {
    type,
    value,
    timestamp: Date.now()
  });

  switch (type) {
    case 'insight':
      return getInsightToken(value as InsightType);
    case 'severity':
      return getSeverityToken(value as SeverityLevel);
    case 'confidence':
      return getConfidenceToken(value as number);
    case 'status':
      return getStatusToken(value as StatusType);
    case 'billing':
      return getBillingToken(value as BillingStatus);
    default:
      console.warn('[DesignTokens] Unknown token type, returning info token:', {
        type,
        value,
        timestamp: Date.now()
      });
      return statusTokens.info;
  }
}

// Design system constants
export const designSystem = {
  // Shadows (FAANG-style minimal)
  shadows: {
    subtle: 'shadow-sm',
    card: 'shadow-sm hover:shadow-md',
    elevated: 'shadow-md',
    overlay: 'shadow-lg',
  },
  
  // Border radius
  radius: {
    small: 'rounded',
    medium: 'rounded-lg',
    large: 'rounded-xl',
  },
  
  // Spacing
  spacing: {
    card: 'p-3',
    cardCompact: 'p-2',
    cardContent: 'p-4',
    section: 'space-y-3',
    sectionCompact: 'space-y-2',
  },
  
  // Typography
  typography: {
    cardTitle: 'text-base font-medium',
    cardTitleCompact: 'text-sm font-medium',
    cardDescription: 'text-sm text-muted-foreground',
    cardDescriptionCompact: 'text-xs text-muted-foreground',
    badge: 'text-xs',
    confidence: 'text-sm text-muted-foreground',
  },
  
  // Animations
  animations: {
    tab: 'transition-all duration-150 ease-in-out',
    card: 'transition-all duration-200 ease-in-out',
    hover: 'hover:transition-all hover:duration-150',
  },
} as const;

console.log('[DesignTokens] Design token system initialized:', {
  insightTypes: Object.keys(insightTokens),
  severityLevels: Object.keys(severityTokens),
  confidenceLevels: Object.keys(confidenceTokens),
  statusTypes: Object.keys(statusTokens),
  billingStatuses: Object.keys(billingTokens),
  timestamp: Date.now()
});
