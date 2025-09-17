# Manylla Team Agreements & Best Practices

*Compiled from all role learnings and successful patterns*
*Last Updated: 2025-09-16*

## 🎯 Core Mission
Build a zero-knowledge encrypted data management system for special needs information with exceptional user experience across all platforms.

## 🌟 Team Values

### What We Stand For
- **Data integrity** above all else - Data loss is unacceptable
- **Quality over speed** - No shortcuts on critical features
- **Evidence over assumptions** - Measure, document, verify
- **User privacy is sacred** - Zero-knowledge architecture non-negotiable
- **Learning from every mistake** - Post-mortems drive improvement
- **Collaboration with constructive conflict** - Honest feedback improves outcomes

## 🏗️ Architecture Principles

### Non-Negotiable Rules
1. **JavaScript ONLY** - No TypeScript files (.ts, .tsx)
2. **Single file per component** - No .native.js, .web.js, .ios.js, .android.js files
3. **Platform.select()** - Handle platform differences inline
4. **Build output directory**: `web/build/` (NOT `build/`)
5. **Package/Bundle IDs**: com.manyllamobile (mobile), manylla.com/qual/ (web)
6. **Primary color**: #A08670 (manila brown, NOT #8B7355)

### Validation Commands (Must All Pass)
```bash
find src -name "*.tsx" -o -name "*.ts" | wc -l          # Must be 0
find src -name "*.native.*" -o -name "*.web.*" | wc -l  # Must be 0
grep -r "console.log" src/ | wc -l                      # Max 5
grep -r "TODO\|FIXME" src/ | wc -l                      # Max 20
npm run build:web                                        # Must succeed
```

## 📝 Development Process

### 1. Before Starting Any Work
```bash
# Verify environment
git pull origin main
find src -name "*.tsx" -o -name "*.ts" | wc -l  # Must be 0
npm run web                                      # Dev server must work

# Check current priorities
cat processes/BACKLOG.md                        # Review work queue

# Trace component usage BEFORE modifying
grep -r "ComponentName" src/ --include="*.js" | grep import
grep -r "<ComponentName" src/ --include="*.js"
```

### 2. During Development

#### Component Discovery Pattern
**CRITICAL LESSON**: Always verify which component is actually being used
```bash
# When changes don't take effect:
1. rm -rf node_modules/.cache/webpack/     # Clear webpack cache
2. grep -n "ComponentName" App.js          # Check imports
3. Check for Platform.OS conditionals
4. Look for local overrides
```

#### True Centralization Pattern
**CRITICAL LESSON**: Centralization means elimination, not addition
```bash
# Centralization checklist:
1. Audit what exists
2. Pick ONE winner
3. Migrate everything to it
4. DELETE all alternatives immediately
5. Verify: grep -r "OldComponent" src/ | wc -l  # Must be 0
```

#### Error Handling Pattern
```javascript
// ✅ CORRECT - Production safe
if (process.env.NODE_ENV === 'development') {
  console.error('Debug:', error);
}

// ❌ WRONG - Exposed in production
console.error('Error:', error);
```

#### React Native Web Override Pattern
```javascript
// ✅ CORRECT - Inline style overrides RNW classes
<View style={[styles.header, { backgroundColor: color }]} />

// ❌ WRONG - Can be overridden by RNW
<View style={styles.header} />
```

### 3. Incremental Progress
- **Small, logical commits** - Easy to review and revert
- **Test after each change** - Catch issues early
- **Complete current task before starting new** - No partial work
- **Fix as you go** - Don't accumulate technical debt

### 4. Testing & Validation

#### Test Skip Policy (Temporary)
**When working on any component with skipped tests:**
1. Remove all .skip directives from that component's tests
2. Fix or rewrite tests as needed
3. Achieve >80% coverage for the component
4. Include test updates in the PR

**Tracking:** See `docs/development/SKIPPED_TESTS.md` for current skips (Story S057)

#### Pre-Deployment Checklist
```bash
npm run build:web                               # Build must succeed
npx prettier --check 'src/**/*.js'             # Format check
npx eslint src/ --ext .js,.jsx                 # Lint check
grep -r 'console.error' src/ | grep -v "NODE_ENV" | wc -l  # Must be 0
git status                                      # Must be clean
```

#### Cross-Platform Testing Matrix
| Feature | iOS | Android | Web |
|---------|-----|---------|-----|
| Core Functionality | Real device preferred | Emulator + Device | All browsers |
| Performance | < 800ms cold start | < 1000ms cold start | Lighthouse > 90 |
| Edge Cases | Safe areas, keyboard | Permissions, back button | RNW overrides |

#### Adversarial Testing Mindset
- **Assume everything is broken** until proven otherwise
- **Try to break it** - Edge cases, empty data, massive data
- **Test hostile scenarios** - Rapid clicks, offline mode, memory pressure
- **Verify all claims** - Run commands yourself, test independently

### 5. Code Review Process

#### Automatic Rejection Triggers
1. TypeScript syntax in .js files
2. Platform-specific files (.native.js, .web.js)
3. Build failures
4. Wrong primary color (#8B7355 instead of #A08670)
5. Material-UI imports in new code
6. Console.error without NODE_ENV check
7. Direct Modal imports (use ThemedModal)

#### Review Commands
```bash
# Start every review with:
find src -name "*.tsx" -name "*.ts" | wc -l
npm run build:web
npx prettier --check 'src/**/*.js'

# Verify claimed fixes:
git diff HEAD~1
grep -n "PATTERN_OF_FIX" affected_files
```

## 🚀 Deployment Process

### THE ONLY Way to Deploy
```bash
./scripts/deploy-qual.sh
```

**This script enforces (in order):**
1. Git status clean
2. Release notes for NEXT version
3. ESLint passes
4. Prettier passes
5. Build succeeds
6. Console.log ≤ 5
7. TODO count ≤ 20
8. No secrets exposed
9. Tests pass
10. Git push (rollback point)
11. Deploy to server

### Critical Deployment Facts
- **Build directory**: `web/build/` (NOT `build/`)
- **Correct .htaccess**: `.htaccess.manylla-qual` (NOT `.htaccess.qual`)
- **Server path**: `~/public_html/manylla/qual/` (NOT `~/public_html/qual/`)
- **RewriteBase**: `/manylla/qual/` in .htaccess
- **Release notes**: Add for version+1 (script auto-increments)

## 🎨 UI/UX Standards

### Design System
```javascript
// Color Palette (IMMUTABLE)
const colors = {
  primary: '#A08670',      // Manila brown
  secondary: '#F4E4C1',    // Manila paper
  background: '#FAF9F6',   // Off-white
  text: '#2C2C2C',        // Dark gray
  error: '#D32F2F',       // Red
  success: '#388E3C',     // Green
};

// Spacing (8px grid)
const spacing = {
  xs: 4, sm: 8, md: 16, lg: 24, xl: 32
};

// Typography
const sizes = {
  xs: 12, sm: 14, base: 16, lg: 18, xl: 20
};
```

### Modal System
- **Use ThemedModal** - The ONLY modal component
- **Never import Modal directly** from react-native
- **Backdrop**: rgba(0,0,0,0.5)
- **Max width**: 600px web, 90% mobile

### Accessibility Requirements
- All buttons must have aria-label/accessibilityLabel
- Touch targets ≥ 44px
- Focus indicators required
- Keyboard navigation support

## 📱 Platform-Specific Guidelines

### Web (Webpack)
```bash
npm run web                    # Dev server port 3000
npm run build:web             # Production build to web/build/
NODE_OPTIONS=--max-old-space-size=8192 npm run build:web  # If memory issues
```

**Performance Targets:**
- Bundle size: < 200KB gzipped
- Lighthouse score: > 90
- First Contentful Paint: < 1.5s

### iOS
```bash
cd ios && pod install && cd ..
npx react-native run-ios --simulator="iPhone 16"
```

**Requirements:**
- Xcode 16+
- iOS 14.0 minimum
- Bundle ID: com.manyllamobile
- Safe area handling required

### Android
```bash
export JAVA_HOME=/path/to/java17  # MUST be Java 17
cd android && ./gradlew assembleDebug
```

**Requirements:**
- Java 17 (not 11, not 21)
- API 24+ (Android 7.0)
- Package: com.manyllamobile
- Cold start < 1000ms target

## 🔍 Debugging Patterns

### Component Not Updating
```bash
1. Clear webpack cache: rm -rf node_modules/.cache/webpack/
2. Trace imports: grep -n "Component" App.js
3. Check for Platform.OS conditionals
4. Verify no duplicate components exist
```

### Style Not Applying (React Native Web)
```javascript
// Check DOM for r-[property]-[hash] classes
// Use inline styles to force override
<View style={[styles.base, { backgroundColor: color }]} />
```

### Build/Deploy Failures
```bash
# Memory issues
NODE_OPTIONS=--max-old-space-size=8192 npm run build:web

# Clean everything
rm -rf node_modules web/build
npm install
npm run build:web

# Deployment blocked
Check: console.logs, uncommitted changes, release notes
```

## 📊 Quality Metrics

### Code Quality
- ESLint: 0 errors
- Prettier: 100% formatted
- Console.logs: ≤ 5 in src/
- TODOs: ≤ 20
- Test coverage: ≥ 30%

### Performance
- Web bundle: < 200KB gzipped
- iOS cold start: < 800ms
- Android cold start: < 1000ms
- Memory usage: < 100MB

### User Experience
- No hardcoded colors (use theme)
- All modals use ThemedModal
- Accessibility labels on all interactive elements
- Works on all supported platforms/browsers

## 🚨 Common Pitfalls & Prevention

### 1. Wrong Component Modified
**Prevention**: Always trace imports first
```bash
grep -n "ComponentName" App.js
```

### 2. Multiple "Unified" Components
**Prevention**: True unification = one component, zero alternatives

### 3. Console.error in Production
**Prevention**: Always wrap with NODE_ENV check

### 4. Platform-Specific Files
**Prevention**: Use Platform.select() in single .js file

### 5. Dead Code Accumulation
**Prevention**: Regular audits
```bash
for file in $(find src -name "*.js"); do
  usage=$(grep -r "$(basename $file .js)" src/ | wc -l)
  [ $usage -eq 1 ] && echo "DEAD CODE: $file"
done
```

## 🔐 Security & Privacy

### Zero-Knowledge Architecture
- All data encrypted client-side (TweetNaCl.js)
- 32-character hex recovery phrases
- 100,000 nacl.hash iterations
- Server never sees plaintext

### Security Rules
- Never commit secrets/keys
- No user accounts required
- All API endpoints must be secured
- Error messages must not expose internals

## 📚 Documentation Standards

### Always Document
- Tech debt in processes/tech-debt/drafts/
- Release notes BEFORE deployment
- Known limitations in TECH_DEBT.md
- Breaking changes prominently

### Code Comments
- Explain WHY, not WHAT
- Document workarounds
- Mark development-only code
- NO comments unless necessary

## 🎯 Success Metrics

### Development Velocity
- Story completion within estimate
- < 2 review cycles per feature
- Zero "wrong component" incidents
- Clean deployment on first attempt

### Code Health
- Zero TypeScript files
- Zero platform-specific files
- Single modal system (ThemedModal)
- All validation commands pass

### User Impact
- Cross-platform consistency
- Accessibility compliance
- Performance targets met
- Zero-knowledge privacy maintained

## 🤝 Team Collaboration

### Role Responsibilities
- **PM**: Priorities, acceptance, deployment timing
- **Developer**: Implementation, testing, documentation
- **Peer Reviewer**: Validation, architecture compliance
- **Admin**: Environment, deployment, monitoring
- **UI/UX**: Design consistency, accessibility
- **Platform Experts**: iOS/Android/Web optimization

### Communication Patterns
- Document tech debt immediately
- Verify before claiming completion
- Use exact commands for validation
- Provide screenshots for UI issues
- Be specific about error conditions

### Evidence Requirements for Features
```markdown
## Implementation Report
### Requirements Completed
✅ Requirement 1: [What was done]
   Evidence: [Screenshot/Output]
   Command: `npm test`

### Performance Impact
- Bundle size: Before → After
- Load time: Before → After
- Memory: Before → After

### Platform Results
- Chrome: ✅ [Test details]
- Safari: ✅ [Test details]
- iOS: ✅ [Device/Simulator]
- Android: ✅ [Device/Emulator]
```

### Conflict Resolution Process
1. **Requirements unclear** → PM clarifies, updates story
2. **"Good enough" debate** → Requirements are binary (100% or not done)
3. **Platform limitations** → Find workaround or document in TECH_DEBT.md
4. **"Fix later" promises** → Current story must be complete

### Escalation Triggers
- 3+ review cycles without approval
- Security concerns identified
- Architecture disputes
- Performance degradation > 20%
- Data integrity questions

## 📊 Sprint & Priority Management

### Priority Levels
- **P0 Critical**: Data loss, security breach, system down (< 24h fix)
- **P1 High**: Major features broken, blocking users (< 1 week)
- **P2 Medium**: QoL improvements, non-critical bugs (< 1 month)
- **P3 Low**: Nice-to-have, optimizations (as capacity allows)

### Story Sizing
- **S (< 1 day)**: Simple fixes, config changes, documentation
- **M (1-3 days)**: Single component changes, isolated features
- **L (3-5 days)**: Multi-component features, complex logic
- **XL (1-2 weeks)**: Architecture changes, major features

### Sprint Success Metrics
- **First-time approval rate**: Target > 30%
- **Zero regressions**: No bugs reintroduced
- **Performance maintained**: No degradation
- **All platforms work**: 100% cross-platform

## 🚨 Emergency Procedures

### P0 Critical Response Protocol
```bash
1. ASSESS - Scope and user impact
2. STOP - All current work
3. FIX - Minimal change required
4. TEST - All platforms immediately
5. DEPLOY - Using emergency procedure
6. MONITOR - 24 hours minimum
7. POST-MORTEM - Document learnings
```

### Data Loss Response
```bash
1. STOP all writes immediately
2. Backup current state
3. Identify corruption scope
4. Restore from backups if available
5. Validate data integrity
6. Implement prevention measures
7. Full incident report with timeline
```

### Emergency Deployment (P0 Only)
```bash
# Only when deploy-qual.sh fails for P0
npm run build:web
rsync -avz web/build/ stackmap-cpanel:~/public_html/manylla/qual/
# Document why normal process was bypassed
```

## 🔄 Continuous Improvement

### After Each Sprint
1. Review tech debt accumulation
2. Audit for dead code
3. Check performance metrics
4. Update documentation
5. Refine processes based on failures

### Learning from Failures
- Every production bug → New validation check
- Every confused review → Better documentation
- Every deployment failure → Script improvement
- Every performance issue → New metric

### Post-Mortem Template
```markdown
## Incident: [Title]
Date: [YYYY-MM-DD]
Severity: P0/P1/P2

### Timeline
- [HH:MM] Issue detected
- [HH:MM] Root cause identified
- [HH:MM] Fix deployed
- [HH:MM] Verified resolved

### Root Cause
[What actually went wrong]

### Impact
- Users affected: [number]
- Data loss: [yes/no]
- Duration: [time]

### Lessons Learned
1. [What we learned]
2. [Process improvements]

### Action Items
- [ ] Update validation checks
- [ ] Add monitoring
- [ ] Document in CLAUDE.md
```

## 📋 Quick Reference

### Essential Commands
```bash
# Development
npm run web                          # Start dev server
npm run build:web                    # Production build
./scripts/deploy-qual.sh             # Deploy to qual

# Validation
find src -name "*.tsx" -o -name "*.ts" | wc -l    # Must be 0
grep -r "console.log" src/ | wc -l                # Max 5
npx prettier --check 'src/**/*.js'                # Format check

# Debugging
rm -rf node_modules/.cache/webpack/               # Clear cache
grep -n "Component" App.js                        # Trace imports
git diff HEAD~1                                   # Check changes

# Emergency
NODE_OPTIONS=--max-old-space-size=8192 npm run build:web
pkill -f node                                      # Kill all Node
```

### File Locations
```
/Users/adamstack/manylla/        # Project root
./web/build/                     # Build output (NOT ./build/)
./processes/BACKLOG.md           # Current priorities
./docs/TECH_DEBT.md             # Known issues
./docs/RELEASE_NOTES.md         # Version history
./scripts/deploy-qual.sh        # Deployment script
```

### Key URLs
- Development: http://localhost:3000
- Qual: https://manylla.com/qual/
- API: https://manylla.com/qual/api/

## 🎯 Decision Frameworks

### Performance vs Features Trade-offs
```
< 10% performance hit → Accept for critical features
10-20% performance hit → Feature must be essential
> 20% performance hit → Reject or optimize first
```

### Quality vs Speed Trade-offs
- Quality always wins for data operations
- No data integrity compromises ever
- No known data loss bugs to production
- Security vulnerabilities block all releases

### Technical Debt Decisions
- Document immediately when deferring work
- P0/P1 bugs before new features
- Debt ratio should be < 20% of sprint capacity
- Architecture debt takes priority over feature debt

## ✨ Core Values

1. **Verification Over Assumption** - Measure, don't guess
2. **Elimination Over Addition** - True centralization removes alternatives
3. **Prevention Over Correction** - Catch issues before production
4. **Clarity Over Cleverness** - Simple, maintainable solutions
5. **User Privacy Above All** - Zero-knowledge architecture is sacred
6. **Data Integrity Is Non-Negotiable** - No shortcuts on data operations
7. **Quality Enables Velocity** - Do it right the first time

---

*"If you can't measure it, it's not complete"*
*"True centralization is about elimination, not addition"*
*"Verify imports BEFORE modifying"*

---

**Remember**: These agreements come from real production failures and successes. Following them prevents the pain others have already experienced.