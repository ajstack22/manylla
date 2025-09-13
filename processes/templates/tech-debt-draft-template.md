# Tech Debt Draft: [Topic]

## Discovery Context
- **Date**: YYYY-MM-DD
- **Discovered During**: [Story/Epic/Testing/Review]
- **Discovered By**: [Role/Name]
- **Current Workaround**: [Describe any temporary solution in place]

## Problem Description
[Detailed description of the technical debt issue. Be specific about what's wrong, where it exists, and why it's a problem]

## Impact Analysis
- **User Impact**: [None/Low/Medium/High] - [Explanation]
- **Developer Impact**: [None/Low/Medium/High] - [Explanation]
- **System Impact**: [None/Low/Medium/High] - [Explanation]
- **Risk if Unaddressed**: [What happens if we don't fix this?]

## Proposed Solution
[High-level approach to addressing this tech debt. Include:
- Main approach
- Alternative approaches considered
- Why this approach is recommended]

## Acceptance Criteria
- [ ] [Specific measurable outcome]
- [ ] [Specific measurable outcome]
- [ ] [Tests that should pass]
- [ ] [Performance metrics to meet]

## Effort Estimate
- **Research**: [X hours] - [What needs to be researched]
- **Implementation**: [X hours] - [What needs to be built]
- **Testing**: [X hours] - [What needs to be tested]
- **Total**: [S/M/L] - [Small: <8hrs, Medium: 8-24hrs, Large: >24hrs]

## Priority Scoring
- **Urgency**: [1-5] - [1=Can wait, 5=Critical now]
- **Value**: [1-5] - [1=Nice to have, 5=Major improvement]
- **Effort**: [1-5] - [1=Trivial, 5=Very complex]
- **Score**: [Urgency × Value ÷ Effort]

## Dependencies
- [Components that need to be updated]
- [Team members who need to be involved]
- [External dependencies or blockers]
- [Required knowledge or skills]

## Code References
```javascript
// Example of current problematic code
// File: src/path/to/file.js:LineNumber
```

## Verification Commands
```bash
# Commands to verify the issue exists
grep -r "pattern" src/ --include="*.js"

# Commands to verify when fixed
npm run test:specific
npm run build:check
```

## Notes
[Additional context, links to documentation, related issues, etc.]

## Related Items
- Related stories: [Links]
- Related debt: [Links]
- Documentation: [Links]

---
*Draft created: [Date]*
*Status: Draft*