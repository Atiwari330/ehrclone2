# AI Service Class Diagram

## Core Classes and Interfaces

```mermaid
classDiagram
    %% Core Service Interface
    class AIService {
        <<interface>>
        +analyze(pipelineType, options) Promise~AIServiceResult~
        +analyzeBatch(requests) Promise~BatchResult[]~
        +invalidateCache(pattern?) Promise~void~
        +getCacheStats() Promise~CacheStats~
        +healthCheck() Promise~HealthStatus~
    }
    
    %% Main Implementation
    class AIServiceImpl {
        -contextAggregator: PatientContextService
        -promptRegistry: PromptRegistry
        -cache: AICache
        -auditService: AuditService
        -outputParser: OutputParser
        -llmExecutor: LLMExecutor
        -logger: AIServiceLogger
        +constructor(dependencies)
        +analyze(pipelineType, options) Promise~AIServiceResult~
        -executeWithRetry(prompt, config) Promise~LLMResponse~
        -validateOutput(output, schema) Promise~T~
        -compilePrompt(template, variables) CompiledPrompt
    }
    
    %% Cache Interface and Implementations
    class AICache {
        <<interface>>
        +get(key) Promise~CachedItem~
        +set(key, value, ttl) Promise~void~
        +delete(key) Promise~void~
        +clear(pattern?) Promise~void~
        +getStats() Promise~CacheStats~
    }
    
    class InMemoryAICache {
        -cache: Map~string, CachedItem~
        -lru: LRUCache
        +get(key) Promise~CachedItem~
        +set(key, value, ttl) Promise~void~
        -isExpired(item) boolean
    }
    
    class RedisAICache {
        -redis: Redis
        -memoryCache: LRUCache
        +get(key) Promise~CachedItem~
        +set(key, value, ttl) Promise~void~
    }
    
    %% Audit Service
    class AuditService {
        <<interface>>
        +logExecution(entry) Promise~void~
        +getExecutions(filter) Promise~AuditEntry[]~
        +getMetrics(timeRange) Promise~Metrics~
    }
    
    class PostgresAuditService {
        -db: PostgresClient
        +logExecution(entry) Promise~void~
        +getExecutions(filter) Promise~AuditEntry[]~
    }
    
    %% Output Parser
    class OutputParser {
        <<interface>>
        +parse(response, schema) Promise~T~
        +extractJSON(text) object
    }
    
    class StructuredOutputParser {
        +parse(response, schema) Promise~T~
        +extractJSON(text) object
        -cleanResponse(text) string
    }
    
    %% LLM Executor
    class LLMExecutor {
        <<interface>>
        +execute(prompt, config) Promise~LLMResponse~
        +estimateTokens(text) number
    }
    
    class VercelAIExecutor {
        -sdk: VercelAISDK
        +execute(prompt, config) Promise~LLMResponse~
        +estimateTokens(text) number
        -createRetryHandler() RetryHandler
    }
    
    %% Logger
    class AIServiceLogger {
        <<interface>>
        +logExecution(params) void
        +logPerformance(metrics) void
        +logError(error, context) void
    }
    
    %% Error Handling
    class AIServiceError {
        +code: AIErrorCode
        +message: string
        +context: Record~string, any~
        +cause: Error
        +constructor(code, message, context?, cause?)
    }
    
    %% Relationships
    AIService <|.. AIServiceImpl : implements
    AIServiceImpl --> PatientContextService : uses
    AIServiceImpl --> PromptRegistry : uses
    AIServiceImpl --> AICache : uses
    AIServiceImpl --> AuditService : uses
    AIServiceImpl --> OutputParser : uses
    AIServiceImpl --> LLMExecutor : uses
    AIServiceImpl --> AIServiceLogger : uses
    
    AICache <|.. InMemoryAICache : implements
    AICache <|.. RedisAICache : implements
    
    AuditService <|.. PostgresAuditService : implements
    
    OutputParser <|.. StructuredOutputParser : implements
    
    LLMExecutor <|.. VercelAIExecutor : implements
    
    AIServiceImpl ..> AIServiceError : throws
```

## Data Types and Interfaces

```mermaid
classDiagram
    %% Execution Options
    class AIExecutionOptions {
        <<interface>>
        +patientId: string
        +sessionId?: string
        +purpose: PipelineType
        +variables?: Record~string, any~
        +skipCache?: boolean
        +priority?: Priority
        +metadata?: Record~string, any~
    }
    
    %% Service Result
    class AIServiceResult {
        <<interface>>
        +success: boolean
        +data?: T
        +error?: AIServiceError
        +metadata: ExecutionMetadata
    }
    
    class ExecutionMetadata {
        <<interface>>
        +executionId: string
        +pipelineType: string
        +promptVersion: string
        +modelUsed: string
        +tokenUsage: TokenUsage
        +latencyMs: number
        +cacheHit: boolean
        +timestamp: Date
    }
    
    %% Token Usage
    class TokenUsage {
        <<interface>>
        +prompt: number
        +completion: number
        +total: number
    }
    
    %% Cache Types
    class CachedItem {
        <<interface>>
        +key: string
        +value: any
        +metadata: CacheMetadata
        +expiresAt: Date
    }
    
    class CacheMetadata {
        <<interface>>
        +pipelineType: string
        +promptVersion: string
        +patientId: string
        +createdAt: Date
        +hitCount: number
    }
    
    class CacheStats {
        <<interface>>
        +totalKeys: number
        +memoryUsed: number
        +hitRate: number
        +evictions: number
    }
    
    %% Audit Types
    class AuditEntry {
        <<interface>>
        +id: string
        +executionId: string
        +pipelineType: string
        +patientId: string
        +userId: string
        +timestamp: Date
        +duration: number
        +success: boolean
        +error?: string
        +tokenUsage: TokenUsage
        +cacheHit: boolean
        +metadata: Record~string, any~
    }
    
    %% LLM Types
    class CompiledPrompt {
        <<interface>>
        +text: string
        +estimatedTokens: number
        +variables: Record~string, any~
        +metadata: PromptMetadata
    }
    
    class LLMResponse {
        <<interface>>
        +text: string
        +usage: TokenUsage
        +model: string
        +finishReason: string
        +metadata?: Record~string, any~
    }
    
    class ExecutionConfig {
        <<interface>>
        +model: string
        +temperature: number
        +maxTokens: number
        +topP?: number
        +frequencyPenalty?: number
        +presencePenalty?: number
        +stopSequences?: string[]
    }
    
    %% Relationships
    AIServiceResult --> ExecutionMetadata : contains
    ExecutionMetadata --> TokenUsage : contains
    CachedItem --> CacheMetadata : contains
    AuditEntry --> TokenUsage : contains
    CompiledPrompt --> PromptMetadata : contains
    LLMResponse --> TokenUsage : contains
```

## Pipeline Type System

```mermaid
classDiagram
    %% Pipeline Type Enum
    class PipelineType {
        <<enumeration>>
        SAFETY_CHECK
        BILLING_CPT
        BILLING_ICD10
        TREATMENT_PROGRESS
        CHAT_WITH_CHART
    }
    
    %% Type Mapping
    class PipelineTypeMap {
        <<interface>>
        +safety_check: SafetyCheckOutput
        +billing_cpt: BillingCPTOutput
        +billing_icd10: BillingICD10Output
        +treatment_progress: TreatmentProgressOutput
        +chat_with_chart: ChatWithChartOutput
    }
    
    %% Output Types
    class SafetyCheckOutput {
        +flags: SafetyFlag[]
        +overallRisk: RiskLevel
        +recommendations: string[]
        +confidence: number
    }
    
    class BillingCPTOutput {
        +codes: CPTCode[]
        +primaryCode: string
        +confidence: number
    }
    
    class BillingICD10Output {
        +diagnoses: Diagnosis[]
        +primaryDiagnosis: string
        +confidence: number
    }
    
    class TreatmentProgressOutput {
        +progress: ProgressIndicator[]
        +summary: string
        +nextSteps: string[]
        +confidence: number
    }
    
    %% Type Helper
    class InferredOutput~T~ {
        <<type>>
        T extends keyof PipelineTypeMap
        PipelineTypeMap[T]
    }
```

## Factory Pattern

```mermaid
classDiagram
    %% Service Factory
    class AIServiceFactory {
        <<interface>>
        +createAIService(config?) AIService
        +createDevelopmentService() AIService
        +createProductionService() AIService
    }
    
    class DefaultAIServiceFactory {
        -defaultConfig: AIServiceConfig
        +createAIService(config?) AIService
        +createDevelopmentService() AIService
        +createProductionService() AIService
        -createCache(config) AICache
        -createAuditService(config) AuditService
        -createLLMExecutor(config) LLMExecutor
    }
    
    %% Configuration
    class AIServiceConfig {
        <<interface>>
        +cache: CacheConfig
        +audit: AuditConfig
        +llm: LLMConfig
        +performance: PerformanceConfig
        +security: SecurityConfig
    }
    
    class CacheConfig {
        <<interface>>
        +type: 'memory' | 'redis'
        +ttl: Record~string, number~
        +maxSize: number
        +evictionPolicy: string
    }
    
    class AuditConfig {
        <<interface>>
        +enabled: boolean
        +storage: 'postgres' | 'file'
        +retentionDays: number
    }
    
    class LLMConfig {
        <<interface>>
        +provider: 'openai' | 'anthropic'
        +defaultModel: string
        +apiKey: string
        +timeout: number
        +retryAttempts: number
    }
    
    %% Relationships
    AIServiceFactory <|.. DefaultAIServiceFactory : implements
    AIServiceFactory --> AIService : creates
    DefaultAIServiceFactory --> AIServiceConfig : uses
    AIServiceConfig --> CacheConfig : contains
    AIServiceConfig --> AuditConfig : contains
    AIServiceConfig --> LLMConfig : contains
```

## Singleton Pattern for Global Access

```mermaid
classDiagram
    %% Singleton Manager
    class AIServiceManager {
        -instance: AIServiceManager
        -service: AIService
        -factory: AIServiceFactory
        +getInstance() AIServiceManager
        +getService() AIService
        +initialize(config) void
        +shutdown() Promise~void~
    }
    
    %% React Hook
    class useAIService {
        <<hook>>
        +analyze(type, options) Promise~Result~
        +invalidateCache(pattern?) Promise~void~
        +isLoading: boolean
        +error: Error | null
    }
    
    %% Next.js Helper
    class createAIService {
        <<function>>
        +createAIService(config?) AIService
    }
    
    %% Relationships
    AIServiceManager --> AIService : manages
    AIServiceManager --> AIServiceFactory : uses
    useAIService --> AIServiceManager : uses
    createAIService --> AIServiceManager : uses
```

## Summary

This class diagram illustrates the complete AI Service architecture with:

1. **Core Services**: Central AIService interface with comprehensive implementation
2. **Supporting Services**: Cache, Audit, Parser, and Executor abstractions
3. **Data Types**: Complete type system for requests, responses, and metadata
4. **Pipeline Types**: Type-safe mapping of pipeline types to outputs
5. **Factory Pattern**: Flexible service creation for different environments
6. **Integration Points**: Singleton manager and React hooks for easy access

The architecture supports:
- Multiple cache implementations (memory/Redis)
- Pluggable LLM providers
- Comprehensive audit logging
- Type-safe pipeline execution
- Performance monitoring
- Error recovery strategies
