# Tech Debt Management Process

## Overview
This process captures, tracks, and converts technical debt identified during development into actionable stories.

## Tech Debt Lifecycle

```
Discovery → Draft → Evaluation → Story → Implementation → Resolution
```

## 1. Discovery & Collection

### During Execution
When implementing stories, collect tech debt items as they're discovered:

```markdown
## TECH DEBT IDENTIFIED

### Item 1: [Brief Title]
**Context**: Where/when discovered
**Issue**: What's wrong or missing
**Impact**: How it affects the system
**Suggested Fix**: Potential approach
**Priority**: P0/P1/P2/P3
**Effort**: S/M/L
**Tags**: #performance #security #architecture #ux #testing

### Item 2: [Brief Title]
...
```

### Collection Points
- **During Development**: Code smell, missing abstraction, workaround
- **During Review**: Reviewer identifies improvement opportunity
- **During Testing**: Performance issue, edge case not handled
- **During Integration**: Component coupling, missing interface
- **Post-Deployment**: Monitoring reveals issue

## 2. Draft Format

Save to `processes/tech-debt/drafts/YYYY-MM-DD-[topic].md`:

```markdown
# Tech Debt Draft: [Topic]

## Discovery Context
- **Date**: YYYY-MM-DD
- **Discovered During**: [Story/Epic name]
- **Discovered By**: [Role]
- **Current Workaround**: [If any]

## Problem Description
[Detailed description of the issue]

## Impact Analysis
- **User Impact**: [None/Low/Medium/High]
- **Developer Impact**: [None/Low/Medium/High]
- **System Impact**: [None/Low/Medium/High]
- **Risk if Unaddressed**: [Description]

## Proposed Solution
[High-level approach to fix]

## Acceptance Criteria
- [ ] [Specific measurable outcome]
- [ ] [Specific measurable outcome]

## Effort Estimate
- **Research**: [Hours]
- **Implementation**: [Hours]
- **Testing**: [Hours]
- **Total**: [S/M/L]

## Priority Scoring
- **Urgency**: [1-5]
- **Value**: [1-5]
- **Effort**: [1-5]
- **Score**: [Urgency × Value ÷ Effort]

## Dependencies
- [Related components]
- [Required knowledge]
- [Prerequisite work]

## Notes
[Additional context, links, references]
```

## 3. Evaluation Process

### Weekly Tech Debt Review
1. Review all drafts in `drafts/` folder
2. Score and prioritize using matrix
3. Convert high-priority items to stories
4. Archive low-priority items

### Priority Matrix

| Score | Action | Timeline |
|-------|--------|----------|
| > 4.0 | Create story immediately | This sprint |
| 2.0-4.0 | Create story | Next sprint |
| 1.0-2.0 | Keep as draft | Quarterly review |
| < 1.0 | Archive | Annual review |

## 4. Story Conversion

### Automated Conversion Script
Run: `./scripts/tech-debt-to-story.sh drafts/[draft-file].md`

Creates story in `docs/development/stories/tech-debt/[story-name].md`

### Manual Conversion Template
```markdown
# Story: Fix [Tech Debt Item]

## Overview
[From draft problem description]

## Background
Originally discovered: [Date]
During: [Context]
Current state: [Workaround or issue]

## Requirements
[From draft acceptance criteria]

## Success Metrics
```bash
# Verification commands
[Specific commands to verify fix]
```

## Implementation Guidelines
[From draft proposed solution]

## Risk Mitigation
[From draft impact analysis]

## Priority
[From draft scoring]

## Estimated Effort
[From draft estimate]

---
*Converted from tech debt draft: [date]*
*Original discovery: [date]*
```

## 5. Tracking & Metrics

### Tech Debt Registry
Maintain in `docs/development/tech-debt/REGISTRY.md`:

```markdown
# Tech Debt Registry

## Active Debt (In Progress)
| ID | Title | Priority | Status | Assigned | ETA |
|----|-------|----------|--------|----------|-----|
| TD-001 | [Title] | P0 | In Progress | Developer | 2025-09-15 |

## Pending Debt (Stories Created)
| ID | Title | Priority | Score | Created | Blocker |
|----|-------|----------|-------|---------|---------|
| TD-002 | [Title] | P1 | 3.5 | 2025-09-12 | None |

## Draft Debt (Not Yet Stories)
| ID | Title | Impact | Effort | Score | Discovered |
|----|-------|--------|--------|-------|------------|
| TD-003 | [Title] | Medium | Large | 1.8 | 2025-09-11 |

## Resolved Debt
| ID | Title | Resolution | Date | Impact |
|----|-------|------------|------|--------|
| TD-000 | [Title] | [How fixed] | 2025-09-10 | [Result] |
```

## 6. Integration with Development Process

### Updated Execution Process

When executing any story, include tech debt collection:

```markdown
## Developer Report
Implementation complete: [Details]

### Tech Debt Identified
1. **Missing error boundary in Toast component**
   - Impact: Medium
   - Effort: Small
   - Priority: P2
   
2. **Platform detection could be cached**
   - Impact: Low
   - Effort: Small
   - Priority: P3

[Save these as draft in tech-debt/drafts/]
```

### Peer Review Process Addition

Reviewers should identify tech debt:

```markdown
## Review Verdict
✅ APPROVED (with tech debt noted)

### Tech Debt Identified During Review
1. **Bundle size optimization needed**
   - Current: 7.71 MB
   - Target: < 5 MB
   - Priority: P1
```

## 7. Automation Scripts

### Create Draft Script
`scripts/create-tech-debt-draft.sh`:
```bash
#!/bin/bash
# Creates tech debt draft from template
# Usage: ./create-tech-debt-draft.sh "Title" "P1" "Medium"
```

### Convert to Story Script
`scripts/tech-debt-to-story.sh`:
```bash
#!/bin/bash
# Converts draft to actionable story
# Usage: ./tech-debt-to-story.sh drafts/file.md
```

### Generate Report Script
`scripts/tech-debt-report.sh`:
```bash
#!/bin/bash
# Generates tech debt summary report
# Shows: Total debt, by priority, by age, by component
```

## 8. Best Practices

### DO
- ✅ Capture debt immediately when discovered
- ✅ Include specific verification commands
- ✅ Estimate effort realistically
- ✅ Link to code locations
- ✅ Consider user impact

### DON'T
- ❌ Use tech debt as excuse for poor initial implementation
- ❌ Create debt without proposed solution
- ❌ Ignore high-priority debt
- ❌ Let drafts accumulate without review
- ❌ Fix debt without creating story first

## 9. Tech Debt Categories

### Architecture Debt
- Missing abstractions
- Tight coupling
- Pattern violations

### Performance Debt
- Unoptimized queries
- Large bundle sizes
- Inefficient algorithms

### Testing Debt
- Missing tests
- Inadequate coverage
- No integration tests

### Documentation Debt
- Missing documentation
- Outdated examples
- No API docs

### Security Debt
- Unencrypted data
- Missing validation
- Exposed secrets

### UX Debt
- Inconsistent behavior
- Missing feedback
- Poor error messages

## 10. Reporting

### Monthly Tech Debt Report
```markdown
## Tech Debt Report - [Month Year]

### Summary
- New debt identified: X items
- Debt resolved: Y items
- Total outstanding: Z items

### By Priority
- P0 (Critical): X items
- P1 (High): Y items
- P2 (Medium): Z items
- P3 (Low): W items

### By Age
- > 90 days: X items
- 30-90 days: Y items
- < 30 days: Z items

### By Component
- Platform: X items
- UI/UX: Y items
- Backend: Z items

### Recommendations
1. [High priority item to address]
2. [Resource allocation suggestion]
3. [Process improvement]
```

---
*Process Version: 1.0*
*Last Updated: 2025-09-12*