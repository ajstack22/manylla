# Manylla Development Working Agreements

## Purpose
This document defines the "how" of development on the Manylla project - our agreed-upon standards, processes, and practices that ensure consistency, quality, and maintainability.

## Table of Contents
1. [Core Principles](#core-principles)
2. [Role-Based Structure](#role-based-structure)
3. [Architecture Standards](#architecture-standards)
4. [Prompt Pack Creation](#prompt-pack-creation)
5. [Adversarial Review Process](#adversarial-review-process)
6. [Code Style & Conventions](#code-style--conventions)
7. [Testing Requirements](#testing-requirements)
8. [Development Workflow](#development-workflow)
9. [Documentation Standards](#documentation-standards)

## Core Principles

### 1. Unified Codebase
- **Single source of truth**: One .js file per component
- **No platform-specific files**: Use Platform.select() for differences
- **JavaScript only**: No TypeScript in this project
- **React Native Web**: Not Material-UI directly

### 2. Manila Envelope Aesthetic
- Primary color: `#A08670` (manila brown)
- Off-white background: `#FAF9F6`
- Warm, paper-like design language
- Consistent shadow/elevation patterns

### 3. Zero-Knowledge Architecture
- Client-side encryption only
- Server never sees plaintext
- 32-character hex recovery phrases
- No user accounts required

## Role-Based Structure

### Defined Roles
The project operates with four distinct roles, each with specific responsibilities and boundaries:

#### 1. Project Manager (PM)
**Identity**: Manages workflow and priorities
**Responsibilities**:
- Create and prioritize prompt packs
- Assign work to Developer
- Request reviews from Peer Reviewer
- Track progress and maintain backlog
- Update documentation and working agreements

**Key Actions**:
```bash
./scripts/create-prompt-pack.sh [priority] [name]
mv docs/prompts/active/[file].md docs/prompts/archive/
```

**Reference**: `/docs/roles/PM_ROLE_AND_LEARNINGS.md`

#### 2. Peer Reviewer (Fury Mode)
**Identity**: Adversarial quality gatekeeper
**Responsibilities**:
- Conduct brutal code reviews
- Verify architecture compliance
- Test edge cases
- Reject work with ANY violations
- Document technical debt

**Review Standards**:
- ZERO TypeScript tolerance
- ZERO platform-specific files
- 100% documentation requirement
- No partial credit given

**Reference**: `/docs/roles/PEER_REVIEWER_ROLE_AND_LEARNINGS.md`

#### 3. Developer
**Identity**: Code implementer
**Responsibilities**:
- Execute prompt packs exactly
- Write JavaScript only (NO TypeScript)
- Follow unified architecture
- Update documentation during development
- Run validations before completion

**Key Validations**:
```bash
find src -name "*.tsx" -o -name "*.ts" | wc -l  # Must be 0
npm run build:web  # Must succeed
npx prettier --check 'src/**/*.js'  # Must pass
```

**Reference**: `/docs/roles/DEVELOPER_ROLE_AND_LEARNINGS.md`

#### 4. Admin
**Identity**: System manager
**Responsibilities**:
- Manage development environment
- Start/stop servers (port 3000)
- Handle deployment operations
- Troubleshoot technical issues
- Answer system questions

**Common Tasks**:
```bash
npm run web  # Start dev server
lsof -i :3000  # Check port usage
./scripts/deploy-qual.sh  # Deploy when authorized
```

**Reference**: `/docs/roles/ADMIN_ROLE_AND_LEARNINGS.md`

### Role Interaction Matrix

| From/To | PM | Peer Reviewer | Developer | Admin |
|---------|-----|--------------|-----------|--------|
| **PM** | - | Request reviews | Assign work | Request deployment |
| **Peer Reviewer** | Report findings | - | No direct | Verify environment |
| **Developer** | Report completion | Receive feedback | - | Request help |
| **Admin** | Status updates | Provide environment | Assist setup | - |

### Role Assignment Protocol

When starting a new session, explicitly declare your role:
```
"I am taking the [ROLE] role for this session."
```

Roles should remain consistent within a session to maintain context and responsibility boundaries.

### Escalation Path
1. **Developer** → PM (for blockers)
2. **PM** → User (for decisions)
3. **Peer Reviewer** → PM (for verdict)
4. **Admin** → PM (for system issues)

## Architecture Standards

### File Organization
```
src/
├── components/      # UI components (unified .js)
├── context/        # React Context providers
├── services/       # Business logic & encryption
├── hooks/          # Custom React hooks
├── screens/        # Screen components
├── types/          # Data type definitions
└── utils/          # Utility functions
```

### Component Structure
```javascript
// CORRECT: Single unified component
// src/components/Example.js
import { Platform, StyleSheet } from 'react-native';

const Example = () => {
  // Shared logic for all platforms
  
  return (
    <View style={styles.container}>
      {Platform.OS === 'web' ? (
        // Web-specific rendering
      ) : (
        // Mobile rendering
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: Platform.select({
      web: 20,
      default: 16
    })
  }
});
```

### WRONG Patterns to Avoid
```
❌ Example.tsx (no TypeScript)
❌ Example.web.js (no platform files)
❌ Example.native.js (no platform files)
❌ Multiple versions of same component
```

## Prompt Pack Creation

### Structure Requirements
Every prompt pack must include:

1. **Clear Objective**
   - Single, focused goal
   - Measurable success criteria
   - Time estimate

2. **Context Section**
   - Current state description
   - Tech stack details
   - Relevant file locations
   - Color/design specifications

3. **Implementation Steps**
   - Numbered, sequential tasks
   - Code examples where helpful
   - Platform considerations

4. **Testing Checklist**
   - Specific items to verify
   - Platform-specific tests
   - Performance metrics

5. **Success Metrics**
   - Quantifiable when possible
   - Clear pass/fail criteria
   - No partial credit

### Severity Levels

#### Standard Development
- Clear requirements
- Professional tone
- Helpful examples

#### Important Changes
- Add emphasis on critical points
- Include warnings for common mistakes
- Highlight breaking changes

#### Critical/Blocking Issues
- **URGENT** labels
- Adversarial review warnings
- Consequences of failure
- "Hell's fury" level severity when appropriate
- Example: "Your implementation will undergo BRUTAL adversarial review"

### Session Planning
- Complex tasks: Split into 2+ sessions
- Session 1: Infrastructure/foundation
- Session 2: Features/polish
- Each session: 4-6 hours of work max

## Adversarial Review Process

### When to Apply
- Architecture changes
- Critical bug fixes
- Performance optimizations
- Security implementations
- File consolidations

### Review Criteria
1. **Compliance Check**
   ```bash
   # Must pass ALL checks
   find src -name "*.tsx" | wc -l          # Must be 0
   find src -name "*.native.*" | wc -l     # Must be 0
   npm run build:web                       # Must succeed
   ```

2. **Functional Testing**
   - Core flows work
   - No regressions
   - Performance maintained
   - Cross-platform parity

3. **Code Quality**
   - Follows patterns
   - No unnecessary complexity
   - Proper error handling
   - Clean git history

### Review Outcomes
- **PASS**: All criteria met
- **FAIL**: Any criterion not met
- **No partial credit**: Fix everything or start over

### Review Documentation
```markdown
## 🎯 ADVERSARIAL REVIEW RESULTS

### ✅ PASS/❌ FAIL: [CRITERION NAME]
- Expected: [requirement]
- Found: [actual result]
- Verdict: [PASS/FAIL]

### 📊 FINAL VERDICT: [PASS/FAIL]
[Summary of findings]
```

## Code Style & Conventions

### JavaScript Standards
- ES6+ features
- Functional components (no class components)
- React Hooks for state
- Async/await over promises

### Naming Conventions
- Components: PascalCase (`ProfileCard.js`)
- Hooks: camelCase starting with 'use' (`useHeaderTransition.js`)
- Utils: camelCase (`formatDate.js`)
- Constants: UPPER_SNAKE_CASE (`HEADER_HEIGHT`)

### Import Order
```javascript
// 1. React imports
import React, { useState, useEffect } from 'react';

// 2. React Native imports
import { View, Text, Platform } from 'react-native';

// 3. Third-party libraries
import AsyncStorage from '@react-native-async-storage/async-storage';

// 4. Local imports (absolute paths)
import { useTheme } from '../../context/ThemeContext';

// 5. Relative imports
import ProfileCard from './ProfileCard';
```

### Platform-Specific Code
```javascript
// PREFERRED: Platform.select()
const padding = Platform.select({
  web: 20,
  ios: 16,
  android: 16
});

// ACCEPTABLE: Conditional rendering
{Platform.OS === 'web' ? (
  <WebComponent />
) : (
  <MobileComponent />
)}

// NEVER: Separate files
// ❌ Component.web.js
// ❌ Component.native.js
```

## Testing Requirements

### Pre-Deployment Checklist
1. **Architecture Validation**
   ```bash
   find src -name "*.tsx" -o -name "*.ts" | wc -l  # Must be 0
   find src -name "*.native.*" -o -name "*.web.*" | wc -l  # Must be 0
   ```

2. **Build Validation**
   ```bash
   npm run build:web  # Must succeed
   ```

3. **Lint & Format**
   ```bash
   npm run lint       # No errors
   npm run format     # Code formatted
   npx prettier --check 'src/**/*.js'  # Must pass
   ```

4. **Functional Tests**
   - Create profile
   - Add/edit entries
   - Switch themes
   - Share functionality
   - Sync between devices

5. **Cross-Platform**
   - Web (Chrome, Safari, Firefox)
   - iOS (simulator minimum)
   - Android (if applicable)

6. **Documentation**
   - Release notes updated
   - Architecture docs current
   - Component docs accurate

### Performance Standards
- 60fps scrolling
- < 3s initial load
- < 500ms interaction response
- Zero layout shifts

## Development Workflow

### 1. Task Initiation
- Review requirements/prompt pack
- Use TodoWrite tool for task tracking
- Check existing patterns in codebase

### 2. Implementation
- Follow unified architecture
- Test incrementally
- Commit logical chunks
- Update todos as you progress

### 3. Testing
- Run build validation
- Test all platforms
- Check performance
- Verify no regressions

### 4. Review Preparation
- Self-review against criteria
- Run compliance scripts
- Document any issues
- Clean up debug code

### 5. Deployment Process

#### Critical Deployment Rules
1. **ALWAYS use the deployment script**: `./scripts/deploy-qual.sh`
2. **NEVER manually deploy** except in documented emergencies
3. **Release notes MUST be added for NEW version** (script auto-increments)
4. **Build output is in `web/build/`** NOT `build/`
5. **Use `.htaccess.manylla-qual`** NOT `.htaccess.qual`

#### Script Behavior
```bash
# ONLY approved deployment method
./scripts/deploy-qual.sh

# Version auto-increment logic:
# - Reads current version from package.json (e.g., 2025.09.10.5)
# - Calculates NEXT version (e.g., 2025.09.10.6)
# - Expects release notes for NEXT version
# - Updates package.json after validation passes

# Process flow:
# 1. Local commits (required - must be clean)
# 2. Release notes for NEXT version (not current)
# 3. Script runs all validations:
#    - Prettier (auto-fixes if needed)
#    - No critical vulnerabilities
#    - ESLint (0 errors allowed)
#    - TypeScript check
#    - Max 20 TODOs, 5 console.logs, 0 debuggers
# 4. If validation passes: Updates version & commits
# 5. GitHub push (creates rollback point)
# 6. Build web application with NODE_OPTIONS=--max-old-space-size=8192
# 7. Deploy to qual server from web/build/

# Important:
# - GitHub push happens AFTER validation but BEFORE deployment
# - This ensures GitHub always has validated code
# - Never bypass validation
# - Never deploy from build/ (use web/build/)
# - Add release notes for NEXT version before running
```

#### Pre-Deployment Checklist
- [ ] All code committed and pushed
- [ ] Tests passing
- [ ] No TypeScript errors
- [ ] Release notes updated for NEXT version (script will increment)
- [ ] Maximum 20 TODOs in codebase
- [ ] Maximum 5 console.logs in src/
- [ ] No debugger statements
- [ ] No critical npm vulnerabilities

#### Common Deployment Issues
- **"Release notes not updated"**: Add notes for NEXT version, not current
- **"Uncommitted changes"**: Commit or stash all changes first
- **"Too many console.logs"**: Remove debug statements (max 5)
- **Memory errors**: Script uses 8GB, increase if needed

See `/docs/roles/ADMIN_ROLE_AND_LEARNINGS.md` for detailed troubleshooting.

## Documentation Standards

### Role Documentation
Each role has a consolidated file combining definition and learnings:
- `/docs/roles/PM_ROLE_AND_LEARNINGS.md` - Project Manager role and experience
- `/docs/roles/DEVELOPER_ROLE_AND_LEARNINGS.md` - Developer role and patterns
- `/docs/roles/ADMIN_ROLE_AND_LEARNINGS.md` - Admin role and infrastructure
- `/docs/roles/PEER_REVIEWER_ROLE_AND_LEARNINGS.md` - Peer Reviewer role and standards

**Important**: Update the learnings section of your role file after significant sessions or discoveries.

### Required Documentation
1. **Code Comments**
   - Complex logic only
   - No obvious comments
   - Focus on "why" not "what"

2. **Component Documentation**
   ```javascript
   /**
    * ProfileCard - Displays user profile with photo and name
    * @param {Object} profile - User profile data
    * @param {Function} onEdit - Edit callback
    */
   ```

3. **README Updates**
   - New features
   - Changed requirements
   - Breaking changes

### Prompt Pack Documentation
- Store in `/docs/prompts/`
- Naming: `feature-session-N-description.md`
- Include completion status
- Update after implementation

### Architecture Documentation
- Major changes need architecture doc updates
- Located in `/docs/architecture/`
- Include diagrams when helpful
- Update UNIFIED_APP_ARCHITECTURE.md when needed

## Version Control

### Commit Messages
```
feat: Add profile transition to header
fix: Resolve scroll performance issue
refactor: Consolidate platform-specific files
docs: Update working agreements
```

### Branch Strategy
- Work on main branch for small changes
- Feature branches for large changes
- No long-lived branches
- Squash commits when merging

## Prompt Pack Management

### Directory Structure
```
/docs/prompts/
├── active/          # Current work items
│   ├── 01-critical-*.md    # Blocking issues
│   ├── 02-high-*.md        # High priority
│   ├── 03-medium-*.md      # Medium priority
│   └── 04-low-*.md         # Low priority
└── archive/         # Completed work
```

### Prompt Pack Naming Convention
- **Format**: `{priority}-{description}.md`
- **Priority Prefixes**:
  - `01-critical-` : Blocking user functionality
  - `02-high-` : Major issues affecting core features
  - `03-medium-` : Enhancements and polish
  - `04-low-` : Nice-to-have improvements

### Priority Reordering Process
When new critical issues arise:
1. Assess severity against existing priorities
2. Rename files to adjust sort order
3. Communicate priority changes clearly
4. Update related tracking documents

### Prompt Pack Creation Guidelines
- **Use Template Script**: Run `./scripts/create-prompt-pack.sh [priority] [name]`
- **Single Responsibility**: One focused issue per pack
- **Session-Sized**: 2-4 hours of work maximum
- **Complete Context**: Include all necessary information
- **Clear Success Criteria**: Measurable outcomes
- **Combine Related Work**: Update existing packs when beneficial
- **Include All Validations**: Architecture checks must be in every pack
- **Documentation Requirements**: Must specify docs to update

### Adversarial Review Adaptation
Reviews should match issue severity:
- **Critical Issues**: Focus on immediate functionality restoration
- **Architecture Work**: Full compliance verification required
- **Enhancement Work**: Balance quality with pragmatism

### Conditional Pass Criteria
For non-critical work, a "Conditional Pass" may be granted when:
1. Core objectives are met
2. Violations are outside the defined scope
3. Issues are documented for future work
4. No regression in existing functionality

## Enforcement

### Automated Checks
- Build must succeed
- Lint must pass
- No TypeScript files
- No platform-specific files

### Manual Reviews
- Adversarial review for critical changes
- Peer review for architecture changes
- Self-review checklist for all changes

### Consequences
- Failed review = start over (for architecture work)
- Conditional pass allowed for non-blocking issues
- No exceptions to core standards
- Documentation required for deviations

## Updates to This Document

This is a living document. Updates require:
1. Clear justification
2. Team agreement
3. Update all related documentation
4. Communicate changes clearly

---

*Last Updated: September 2025*
*Version: 1.3*

### Change Log
- v1.3 (Sept 2025): Added Role-Based Structure with PM, Peer Reviewer, Developer, and Admin roles
- v1.2 (Sept 2025): Added documentation requirements, template script, architecture validation in testing
- v1.1 (Sept 2025): Added Prompt Pack Management section, Conditional Pass criteria
- v1.0 (Sept 2025): Initial version