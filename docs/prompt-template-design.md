# Prompt Template System Design

## Overview

The Prompt Template System provides a centralized, versioned approach to managing AI prompts across the EHR application. This system enables consistent prompt management, version control, and easy testing of AI interactions.

## Architecture

### Core Components

1. **PromptTemplate Interface** - The main data structure for storing prompts
2. **PromptRegistry** - Central storage and retrieval system
3. **PromptRenderer** - Handles variable substitution and validation
4. **PromptVersionManager** - Manages versioning and deprecation

### Key Design Decisions

#### 1. Versioning Strategy

We use **Semantic Versioning (SemVer)** for prompt templates:
- **MAJOR**: Breaking changes to output schema or required variables
- **MINOR**: New features, optional variables, or backward-compatible changes
- **PATCH**: Bug fixes, typo corrections, or minor improvements

Example: `1.2.3` where:
- `1` = Major version
- `2` = Minor version
- `3` = Patch version

#### 2. Category Organization

Prompts are organized into categories for easy discovery:
- **SAFETY**: Risk assessment and patient safety checks
- **BILLING**: CPT codes, ICD-10 diagnosis extraction
- **CLINICAL**: Treatment progress, clinical insights
- **ADMINISTRATIVE**: Documentation, scheduling
- **CHAT**: Interactive patient chart queries
- **ANALYSIS**: General analysis and insights

#### 3. Variable System

Templates use double-brace syntax for variables: `{{variableName}}`

Features:
- Required vs optional variables
- Default values
- Zod schema validation
- Type-safe rendering

#### 4. Output Schema Validation

All prompts include Zod schemas for output validation:
- Ensures structured responses
- Type safety for downstream processing
- Automatic parsing and validation

## Implementation Plan

### Phase 1: Core Infrastructure
1. Create PromptRegistry class with Map storage
2. Implement version resolution logic
3. Build template rendering engine

### Phase 2: Prompt Templates
1. Safety check prompts
2. Billing automation prompts
3. Treatment progress prompts
4. General analysis prompts

### Phase 3: Testing & Validation
1. Unit tests for each component
2. Integration tests with LLM
3. A/B testing framework

## Registry Storage Structure

```typescript
// Internal storage structure
Map<string, Map<string, PromptRegistryEntry>>
// promptId -> version -> entry
```

## Version Resolution Algorithm

1. **Latest Strategy** (default)
   - Always use highest version number
   - Skip deprecated versions

2. **Exact Strategy**
   - Requires exact version match
   - Throws error if not found

3. **Compatible Strategy**
   - Same major version
   - Highest minor/patch within major

4. **Any Strategy**
   - First matching prompt
   - Used for testing/debugging

## Template Rendering Process

1. **Validation Phase**
   - Check all required variables present
   - Validate against Zod schemas
   - Check token limits

2. **Substitution Phase**
   - Replace {{variables}} with values
   - Apply default values
   - Handle escaping

3. **Post-Processing**
   - Calculate actual tokens
   - Log rendering details
   - Return RenderedPrompt

## Error Handling

### Registry Errors
- `PromptNotFoundError`: No matching prompt
- `VersionConflictError`: Version resolution failed
- `DeprecatedPromptError`: Attempting to use deprecated

### Rendering Errors
- `MissingVariableError`: Required variable not provided
- `ValidationError`: Variable validation failed
- `TokenLimitError`: Rendered prompt exceeds limits

## Logging Strategy

All operations include comprehensive logging:
```typescript
console.log('[PromptRegistry] Registering template:', {
  id: template.metadata.id,
  version: template.metadata.version,
  category: template.metadata.category,
  estimatedTokens: template.metadata.estimatedTokens
});
```

## Performance Considerations

1. **Caching**: Frequently used prompts cached in memory
2. **Lazy Loading**: Templates loaded on first use
3. **Token Estimation**: Pre-calculate token ranges
4. **Async Operations**: Non-blocking registry operations

## Testing Strategy

### Unit Tests
- Registry CRUD operations
- Version resolution logic
- Template rendering
- Error handling

### Integration Tests
- LLM response validation
- Output schema compliance
- Token usage verification
- Performance benchmarks

### A/B Testing
- Compare prompt versions
- Track success metrics
- Automatic rollback on failures

## Migration Path

For existing prompts:
1. Convert to PromptTemplate format
2. Assign version 1.0.0
3. Add to registry
4. Update references to use registry

## Security Considerations

1. **Input Sanitization**: Prevent prompt injection
2. **Access Control**: Who can modify prompts
3. **Audit Trail**: Track all prompt changes
4. **Validation**: Strict input/output validation

## Future Enhancements

1. **Prompt Marketplace**: Share prompts between organizations
2. **Auto-Optimization**: ML-based prompt improvement
3. **Multi-Language**: Localized prompt versions
4. **Visual Editor**: GUI for prompt creation
5. **Analytics Dashboard**: Usage and performance metrics

## Example Usage

```typescript
// Register a prompt
registry.register(safetyCheckPrompt);

// Get latest version
const prompt = await registry.get('safety-check');

// Render with variables
const rendered = renderer.render(prompt, {
  patientContext: context,
  sessionTranscript: transcript
});

// Execute with LLM
const result = await llm.execute(rendered.prompt);

// Validate output
const validated = prompt.outputSchema.parse(result);
```

## Best Practices

1. **Version Incrementing**
   - Breaking changes = major version
   - New features = minor version
   - Fixes = patch version

2. **Documentation**
   - Clear descriptions
   - Example inputs/outputs
   - Migration guides for major versions

3. **Testing**
   - Test all variables
   - Verify output schemas
   - Check edge cases

4. **Deprecation**
   - Set deprecation date
   - Provide migration path
   - Log warnings when used

5. **Token Management**
   - Estimate conservatively
   - Monitor actual usage
   - Optimize for cost/performance

## Conclusion

This prompt template system provides a robust foundation for managing AI prompts in the EHR application. The versioning strategy ensures backward compatibility while allowing for evolution. The registry pattern enables centralized management and easy testing. With comprehensive logging and error handling, the system is production-ready and maintainable.
