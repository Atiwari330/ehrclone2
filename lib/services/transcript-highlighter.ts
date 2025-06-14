/**
 * Transcript Highlighting Engine
 * 
 * High-performance service for highlighting transcript sections based on AI insights.
 * Optimized for 1000+ transcript entries with intelligent caching and color management.
 */

import { 
  TranscriptHighlight, 
  HighlightConfig, 
  DEFAULT_HIGHLIGHT_CONFIG,
  SafetyInsights,
  BillingInsights,
  ProgressInsights,
  AIInsightsState,
  InsightSeverity
} from '@/lib/types/ai-insights';
import type { TranscriptEntry } from '@/lib/types/transcription';

// Performance optimization interfaces
interface HighlightCache {
  highlights: Map<string, TranscriptHighlight[]>;
  lastUpdated: number;
  version: string;
}

interface HighlightMetrics {
  calculationTime: number;
  cacheHits: number;
  cacheMisses: number;
  totalHighlights: number;
  entriesProcessed: number;
}

// Search configuration for finding insight references in transcript
interface InsightSearchConfig {
  minMatchLength: number;
  fuzzyMatchThreshold: number;
  contextWindow: number; // Characters before/after match
  maxMatches: number;
}

// Default search configuration optimized for medical transcripts
const DEFAULT_SEARCH_CONFIG: InsightSearchConfig = {
  minMatchLength: 3,
  fuzzyMatchThreshold: 0.8,
  contextWindow: 50,
  maxMatches: 10
};

export class TranscriptHighlighter {
  private cache: HighlightCache;
  private config: HighlightConfig;
  private searchConfig: InsightSearchConfig;
  private metrics: HighlightMetrics;

  constructor(
    config: HighlightConfig = DEFAULT_HIGHLIGHT_CONFIG,
    searchConfig: InsightSearchConfig = DEFAULT_SEARCH_CONFIG
  ) {
    this.config = config;
    this.searchConfig = searchConfig;
    this.cache = {
      highlights: new Map(),
      lastUpdated: 0,
      version: '1.0.0'
    };
    this.metrics = {
      calculationTime: 0,
      cacheHits: 0,
      cacheMisses: 0,
      totalHighlights: 0,
      entriesProcessed: 0
    };

    console.log('[TranscriptHighlighter] Initialized:', {
      config: this.config,
      searchConfig: this.searchConfig,
      timestamp: Date.now()
    });
  }

  /**
   * Generate highlights for transcript entries based on AI insights
   */
  public generateHighlights(
    transcriptEntries: TranscriptEntry[],
    insights: AIInsightsState,
    forceRefresh = false
  ): TranscriptHighlight[] {
    const startTime = performance.now();
    const cacheKey = this.generateCacheKey(transcriptEntries, insights);

    console.log('[TranscriptHighlighter] Starting highlight generation:', {
      transcriptEntries: transcriptEntries.length,
      cacheKey,
      forceRefresh,
      hasCache: this.cache.highlights.has(cacheKey),
      timestamp: Date.now()
    });

    // Check cache first (unless forced refresh)
    if (!forceRefresh && this.cache.highlights.has(cacheKey)) {
      this.metrics.cacheHits++;
      const cachedHighlights = this.cache.highlights.get(cacheKey)!;
      
      console.log('[TranscriptHighlighter] Cache hit:', {
        cacheKey,
        highlightCount: cachedHighlights.length,
        cacheAge: Date.now() - this.cache.lastUpdated,
        metrics: this.metrics
      });

      return cachedHighlights;
    }

    this.metrics.cacheMisses++;
    this.metrics.entriesProcessed = transcriptEntries.length;

    // Generate new highlights
    const highlights: TranscriptHighlight[] = [];

    // Process safety insights
    if (insights.safety.status === 'success' && insights.safety.data) {
      const safetyHighlights = this.processSafetyInsights(
        transcriptEntries,
        insights.safety.data
      );
      highlights.push(...safetyHighlights);
      
      console.log('[TranscriptHighlighter] Safety highlights generated:', {
        count: safetyHighlights.length,
        alerts: insights.safety.data.alerts.length
      });
    }

    // Process billing insights
    if (insights.billing.status === 'success' && insights.billing.data) {
      const billingHighlights = this.processBillingInsights(
        transcriptEntries,
        insights.billing.data
      );
      highlights.push(...billingHighlights);
      
      console.log('[TranscriptHighlighter] Billing highlights generated:', {
        count: billingHighlights.length,
        cptCodes: insights.billing.data.cptCodes.length,
        icdCodes: insights.billing.data.icd10Codes.length
      });
    }

    // Process progress insights
    if (insights.progress.status === 'success' && insights.progress.data) {
      const progressHighlights = this.processProgressInsights(
        transcriptEntries,
        insights.progress.data
      );
      highlights.push(...progressHighlights);
      
      console.log('[TranscriptHighlighter] Progress highlights generated:', {
        count: progressHighlights.length,
        goals: insights.progress.data.goalProgress.length
      });
    }

    // Sort highlights by entry position and priority
    const sortedHighlights = this.sortAndDeduplicateHighlights(highlights);
    
    // Cache results
    this.cache.highlights.set(cacheKey, sortedHighlights);
    this.cache.lastUpdated = Date.now();

    // Update metrics
    const endTime = performance.now();
    this.metrics.calculationTime = endTime - startTime;
    this.metrics.totalHighlights = sortedHighlights.length;

    console.log('[TranscriptHighlighter] Highlight generation complete:', {
      totalHighlights: sortedHighlights.length,
      calculationTime: this.metrics.calculationTime,
      cacheKey,
      metrics: this.metrics,
      performance: {
        avgTimePerEntry: this.metrics.calculationTime / transcriptEntries.length,
        highlightsPerEntry: sortedHighlights.length / transcriptEntries.length
      }
    });

    return sortedHighlights;
  }

  /**
   * Process safety insights to create highlights
   */
  private processSafetyInsights(
    transcriptEntries: TranscriptEntry[],
    safetyInsights: SafetyInsights
  ): TranscriptHighlight[] {
    const highlights: TranscriptHighlight[] = [];

    console.log('[TranscriptHighlighter] Processing safety insights:', {
      alertCount: safetyInsights.alerts.length,
      overallRisk: safetyInsights.riskAssessment.overallRisk
    });

    for (const alert of safetyInsights.alerts) {
      // Use provided transcript references if available
      if (alert.transcriptReferences && alert.transcriptReferences.length > 0) {
        for (const ref of alert.transcriptReferences) {
          const entry = transcriptEntries.find(e => e.id === ref.entryId);
          if (entry) {
            highlights.push({
              entryId: ref.entryId,
              startIndex: ref.startIndex,
              endIndex: ref.endIndex,
              type: 'safety',
              severity: alert.severity,
              insightId: alert.id,
              color: this.getSafetyColor(alert.severity),
              tooltip: `${alert.title}: ${alert.description.substring(0, 100)}...`
            });
          }
        }
      } else {
        // Search for relevant text in transcript
        const matches = this.findTextMatches(
          transcriptEntries,
          alert.title,
          alert.description
        );
        
        for (const match of matches) {
          highlights.push({
            entryId: match.entryId,
            startIndex: match.startIndex,
            endIndex: match.endIndex,
            type: 'safety',
            severity: alert.severity,
            insightId: alert.id,
            color: this.getSafetyColor(alert.severity),
            tooltip: `${alert.title}: ${alert.description.substring(0, 100)}...`
          });
        }
      }
    }

    return highlights;
  }

  /**
   * Process billing insights to create highlights
   */
  private processBillingInsights(
    transcriptEntries: TranscriptEntry[],
    billingInsights: BillingInsights
  ): TranscriptHighlight[] {
    const highlights: TranscriptHighlight[] = [];

    console.log('[TranscriptHighlighter] Processing billing insights:', {
      cptCount: billingInsights.cptCodes?.length || 0,
      icdCount: billingInsights.icd10Codes?.length || 0,
      sessionType: billingInsights.sessionType?.detected || 'N/A'
    });

    // Process CPT codes
    if (billingInsights.cptCodes && billingInsights.cptCodes.length > 0) {
      for (const code of billingInsights.cptCodes) {
        const matches = this.findTextMatches(
          transcriptEntries,
          code.description,
          code.documentation || ''
        );
        
        for (const match of matches) {
          highlights.push({
            entryId: match.entryId,
            startIndex: match.startIndex,
            endIndex: match.endIndex,
            type: 'billing',
            severity: this.mapConfidenceToSeverity(code.confidence),
            insightId: `billing-cpt-${code.code}`,
            color: this.getBillingColor(code.category),
            tooltip: `CPT ${code.code}: ${code.description} (${Math.round(code.confidence * 100)}% confidence)`
          });
        }
      }
    }

    // Process ICD-10 codes
    if (billingInsights.icd10Codes && billingInsights.icd10Codes.length > 0) {
      for (const code of billingInsights.icd10Codes) {
        const matches = this.findTextMatches(
          transcriptEntries,
          code.description,
          code.documentation || ''
        );
        
        for (const match of matches) {
          highlights.push({
            entryId: match.entryId,
            startIndex: match.startIndex,
            endIndex: match.endIndex,
            type: 'billing',
            severity: this.mapConfidenceToSeverity(code.confidence),
            insightId: `billing-icd-${code.code}`,
            color: this.getBillingColor(code.category),
            tooltip: `ICD-10 ${code.code}: ${code.description} (${Math.round(code.confidence * 100)}% confidence)`
          });
        }
      }
    }

    return highlights;
  }

  /**
   * Process progress insights to create highlights
   */
  private processProgressInsights(
    transcriptEntries: TranscriptEntry[],
    progressInsights: ProgressInsights
  ): TranscriptHighlight[] {
    const highlights: TranscriptHighlight[] = [];

    console.log('[TranscriptHighlighter] Processing progress insights:', {
      goalCount: progressInsights.goalProgress?.length || 0,
      effectiveness: progressInsights.overallTreatmentEffectiveness?.rating || 'N/A'
    });

    if (progressInsights.goalProgress && progressInsights.goalProgress.length > 0) {
      for (const goal of progressInsights.goalProgress) {
        // Skip if goal doesn't have required fields
        if (!goal || !goal.goalDescription) continue;
        
        // Search for goal-related text
        const matches = this.findTextMatches(
          transcriptEntries,
          goal.goalDescription,
          ...(goal.evidence || []),
          ...(goal.barriers || [])
        );
        
        for (const match of matches) {
          highlights.push({
            entryId: match.entryId,
            startIndex: match.startIndex,
            endIndex: match.endIndex,
            type: 'progress',
            severity: this.mapProgressStatusToSeverity(goal.currentStatus || 'not_started'),
            insightId: goal.goalId || 'unknown',
            color: this.getProgressColor(goal.currentStatus || 'not_started'),
            tooltip: `Goal: ${(goal.goalDescription || 'Unknown goal').substring(0, 80)}... (${goal.progressPercentage || 0}% complete)`
          });
        }
      }
    }

    return highlights;
  }

  /**
   * Find text matches in transcript entries using fuzzy search
   */
  private findTextMatches(
    transcriptEntries: TranscriptEntry[],
    ...searchTerms: string[]
  ): Array<{ entryId: string; startIndex: number; endIndex: number }> {
    const matches: Array<{ entryId: string; startIndex: number; endIndex: number }> = [];
    
    for (const term of searchTerms) {
      if (!term || term.length < this.searchConfig.minMatchLength) continue;
      
      // Extract keywords from the term (remove common words)
      const keywords = this.extractKeywords(term);
      
      for (const entry of transcriptEntries) {
        const text = entry.text.toLowerCase();
        
        for (const keyword of keywords) {
          const keywordLower = keyword.toLowerCase();
          let startIndex = 0;
          let matchCount = 0;
          
          while (matchCount < this.searchConfig.maxMatches) {
            const index = text.indexOf(keywordLower, startIndex);
            if (index === -1) break;
            
            matches.push({
              entryId: entry.id,
              startIndex: index,
              endIndex: index + keyword.length
            });
            
            startIndex = index + 1;
            matchCount++;
          }
        }
      }
    }
    
    return matches;
  }

  /**
   * Extract meaningful keywords from text
   */
  private extractKeywords(text: string): string[] {
    const commonWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
      'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
      'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those'
    ]);
    
    return text
      .split(/\s+/)
      .map(word => word.replace(/[^\w]/g, ''))
      .filter(word => word.length >= this.searchConfig.minMatchLength)
      .filter(word => !commonWords.has(word.toLowerCase()))
      .slice(0, 5); // Limit to top 5 keywords for performance
  }

  /**
   * Sort highlights and remove duplicates
   */
  private sortAndDeduplicateHighlights(highlights: TranscriptHighlight[]): TranscriptHighlight[] {
    // Sort by priority (safety > billing > progress) and then by position
    const priorityMap = { safety: 3, billing: 2, progress: 1 };
    const severityMap = { critical: 4, high: 3, medium: 2, low: 1 };
    
    return highlights
      .sort((a, b) => {
        // First by type priority
        const priorityDiff = priorityMap[b.type] - priorityMap[a.type];
        if (priorityDiff !== 0) return priorityDiff;
        
        // Then by severity
        const severityDiff = severityMap[b.severity] - severityMap[a.severity];
        if (severityDiff !== 0) return severityDiff;
        
        // Then by position
        if (a.entryId !== b.entryId) return a.entryId.localeCompare(b.entryId);
        return a.startIndex - b.startIndex;
      })
      .filter((highlight, index, array) => {
        // Remove duplicates based on position and type
        return index === 0 || !(
          array[index - 1].entryId === highlight.entryId &&
          array[index - 1].startIndex === highlight.startIndex &&
          array[index - 1].type === highlight.type
        );
      });
  }

  /**
   * Generate cache key for highlights
   */
  private generateCacheKey(
    transcriptEntries: TranscriptEntry[],
    insights: AIInsightsState
  ): string {
    const transcriptHash = this.hashTranscript(transcriptEntries);
    const insightsHash = this.hashInsights(insights);
    return `${transcriptHash}-${insightsHash}`;
  }

  /**
   * Generate hash for transcript entries
   */
  private hashTranscript(entries: TranscriptEntry[]): string {
    if (entries.length === 0) return 'empty';
    
    // Use first/last entry IDs and total count for performance
    const first = entries[0].id;
    const last = entries[entries.length - 1].id;
    const count = entries.length;
    
    return `${first}-${last}-${count}`;
  }

  /**
   * Generate hash for insights state
   */
  private hashInsights(insights: AIInsightsState): string {
    const parts = [
      insights.safety.status,
      insights.billing.status,
      insights.progress.status,
      insights.lastUpdated.toString()
    ];
    
    return parts.join('-');
  }

  /**
   * Get color for safety severity
   */
  private getSafetyColor(severity: InsightSeverity): string {
    return this.config.safety[severity].color;
  }

  /**
   * Get color for billing category
   */
  private getBillingColor(category: string): string {
    switch (category) {
      case 'primary':
        return this.config.billing.primary.color;
      case 'secondary':
        return this.config.billing.secondary.color;
      default:
        return this.config.billing.suggested.color;
    }
  }

  /**
   * Get color for progress status
   */
  private getProgressColor(status: string): string {
    switch (status) {
      case 'achieved':
        return this.config.progress.achieved.color;
      case 'in_progress':
      case 'partially_met':
        return this.config.progress.in_progress.color;
      default:
        return this.config.progress.barriers.color;
    }
  }

  /**
   * Map confidence score to severity
   */
  private mapConfidenceToSeverity(confidence: number): InsightSeverity {
    if (confidence >= 0.9) return 'high';
    if (confidence >= 0.7) return 'medium';
    return 'low';
  }

  /**
   * Map progress status to severity
   */
  private mapProgressStatusToSeverity(status: string): InsightSeverity {
    switch (status) {
      case 'achieved':
        return 'high';
      case 'in_progress':
      case 'partially_met':
        return 'medium';
      default:
        return 'low';
    }
  }

  /**
   * Get performance metrics
   */
  public getMetrics(): HighlightMetrics {
    return { ...this.metrics };
  }

  /**
   * Clear cache
   */
  public clearCache(): void {
    console.log('[TranscriptHighlighter] Clearing cache:', {
      cacheSize: this.cache.highlights.size,
      timestamp: Date.now()
    });
    
    this.cache.highlights.clear();
    this.cache.lastUpdated = 0;
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<HighlightConfig>): void {
    console.log('[TranscriptHighlighter] Updating configuration:', {
      oldConfig: this.config,
      newConfig,
      timestamp: Date.now()
    });
    
    this.config = { ...this.config, ...newConfig };
    this.clearCache(); // Clear cache when config changes
  }
}

// Singleton instance for application-wide use
export const transcriptHighlighter = new TranscriptHighlighter();

// Export factory function for custom configurations
export function createTranscriptHighlighter(
  config?: HighlightConfig,
  searchConfig?: InsightSearchConfig
): TranscriptHighlighter {
  return new TranscriptHighlighter(config, searchConfig);
}

// Utility functions for quick highlighting operations
export function highlightTranscriptEntries(
  transcriptEntries: TranscriptEntry[],
  insights: AIInsightsState,
  config?: HighlightConfig
): TranscriptHighlight[] {
  const highlighter = config ? 
    createTranscriptHighlighter(config) : 
    transcriptHighlighter;
    
  return highlighter.generateHighlights(transcriptEntries, insights);
}

export function clearHighlightCache(): void {
  transcriptHighlighter.clearCache();
}
