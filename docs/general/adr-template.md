# ADR Template

This template should be used for all Architecture Decision Records (ADRs) across the Hyperbaric monorepo. ADRs help document significant architectural decisions, their context, and their consequences.

## File Naming Convention

ADR files should be named using the following format:
```
YYYY-MM-DD-brief-description.md
```

Examples:
- `2024-01-15-choose-better-auth-for-authentication.md`
- `2024-02-20-migrate-to-turborepo-monorepo.md`
- `2024-03-10-implement-shared-ui-component-library.md`

## ADR Number Assignment

ADRs should be numbered sequentially within each project:
- **General ADRs**: `ADR-001`, `ADR-002`, etc. (stored in `/docs/general/adrs/`)
- **Project ADRs**: `NH-001`, `CHR-001`, `PF-001`, etc. (stored in respective project ADR folders)

## Template Structure

Copy the template below for new ADRs:

---

# ADR-XXX: [Brief Decision Title]

## Status

**Status**: [Proposed | Accepted | Rejected | Deprecated | Superseded by ADR-XXX]  
**Date**: YYYY-MM-DD  
**Authors**: [Name(s)]  
**Reviewers**: [Name(s)]  

## Context

Describe the architectural challenge or problem that needs to be addressed. Include:

- What is the issue that we're seeing that is motivating this decision or change?
- What are the business requirements driving this decision?
- What constraints exist (technical, organizational, timeline, etc.)?
- What assumptions are we making?

## Decision

State the architecture decision clearly and concisely. 

- What exactly are we going to do?
- What alternative approaches were considered?
- Why is this the best choice given the context and constraints?

## Rationale

Explain the reasoning behind the decision:

- What factors influenced this decision?
- What are the trade-offs we're making?
- How does this align with our architectural principles?
- What evidence supports this decision?

## Consequences

Document the expected outcomes of this decision:

### Positive Consequences
- What benefits do we expect?
- How does this improve the system/process?
- What new capabilities does this enable?

### Negative Consequences
- What downsides or risks are we accepting?
- What technical debt might this create?
- What ongoing maintenance burden does this add?

### Neutral Consequences
- What other changes will this require?
- What teams/systems will be affected?
- What training or documentation is needed?

## Implementation

Outline the plan for implementing this decision:

- What are the key implementation steps?
- What is the timeline?
- Who is responsible for implementation?
- What resources are required?
- How will we measure success?

## Alternatives Considered

Document the other options that were evaluated:

### Alternative 1: [Name]
- Description of the alternative
- Pros and cons
- Why it was not chosen

### Alternative 2: [Name]
- Description of the alternative
- Pros and cons
- Why it was not chosen

## References

Include relevant links and references:

- Related ADRs
- External documentation
- Research papers or articles
- Tool documentation
- Discussion threads or meetings

## Notes

Any additional information that doesn't fit in the above sections:

- Implementation notes
- Lessons learned
- Future considerations
- Related work

---

## ADR Writing Guidelines

### Best Practices

1. **Be Concise but Complete**: ADRs should be comprehensive but not verbose
2. **Use Clear Language**: Avoid jargon and explain technical terms
3. **Include Rationale**: Always explain why, not just what
4. **Document Alternatives**: Show that options were considered
5. **Update Status**: Keep the status current as decisions evolve
6. **Link Related ADRs**: Create a network of related decisions

### Common Mistakes to Avoid

- Writing ADRs after implementation (they should guide decisions, not just document them)
- Focusing only on technical aspects without business context
- Not documenting alternatives that were considered
- Making the ADR too detailed or too high-level
- Forgetting to update the status when decisions change

### Review Process

1. **Draft**: Author creates initial ADR draft
2. **Review**: Relevant stakeholders review and provide feedback
3. **Discussion**: Team discusses and refines the decision
4. **Approval**: ADR status is updated to "Accepted"
5. **Implementation**: Decision is implemented according to the plan
6. **Maintenance**: ADR is updated as needed over time

### When to Write an ADR

Write an ADR when making decisions about:

- Architecture patterns and frameworks
- Technology choices (languages, databases, tools)
- API design approaches
- Security patterns
- Performance optimization strategies
- Integration patterns
- Development workflow changes
- Deployment and infrastructure decisions

### ADR Categories by Project

#### General ADRs (Monorepo-wide)
- Monorepo structure and tooling
- Shared package decisions
- Cross-cutting concerns (auth, logging, etc.)
- Development workflow and standards

#### Null Horizon ADRs
- Financial data modeling
- Security and compliance decisions
- Performance optimization for financial calculations
- Integration with financial APIs

#### Chronicler ADRs
- RSS feed processing architecture
- AI/ML integration decisions
- Content storage and retrieval
- Real-time update mechanisms

#### Portfolio ADRs
- Content management approach
- Static site generation decisions
- Performance optimization
- SEO and accessibility choices