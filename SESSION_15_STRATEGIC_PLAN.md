# Session 15: Strategic Coverage Push - Reality Check & Plan

## Current Reality
- **Current Coverage**: 21.84%
- **Target**: 50%
- **Gap**: 28.16% (MASSIVE)
- **Sessions Remaining**: 1 (this one)

## Honest Assessment
**The 50% target is NOT achievable in one session.** We need to be strategic about what IS achievable.

## High-Impact Targets Identified

### Tier 1: HUGE Files with 0% Coverage (600+ lines each)
1. **OnboardingScreen.js** - 859 lines, 0% coverage
2. **BottomToolbar.js** - 754 lines, 2% coverage
3. **BottomSheetMenu.js** - 685 lines, 0% coverage
4. **UnifiedApp.js** - 598 lines, 0% coverage
5. **QuickInfoManager.js** - 584 lines, 0% coverage

### Reality: Testing Complexity
These large files are complex React components with:
- Heavy UI logic
- Multiple state interactions
- Platform-specific code
- External dependencies

## Revised Strategic Approach

### Option 1: Smoke Tests for Large Files
Create minimal smoke tests for 3-4 large files:
- Just test they render without crashing
- Mock all dependencies heavily
- Target: 10-20% coverage per file
- Potential gain: +5-8% overall

### Option 2: Focus on Medium Files
Target 10-15 medium-sized files (100-300 lines) with 0% coverage:
- Easier to test comprehensively
- Can achieve 50-70% coverage per file
- Potential gain: +3-5% overall

### Option 3: Utility & Service Files
Focus on pure functions and services:
- utils/validation.js (503 lines, likely 0%)
- utils/platform.js (666 lines, partial coverage)
- Easier to test, no UI complexity
- Potential gain: +2-4% overall

## Recommended Approach: Hybrid Strategy

### Phase 1: Quick Smoke Tests (30 mins)
Create render-only tests for:
- OnboardingScreen
- BottomToolbar
- UnifiedApp

### Phase 2: Utility Functions (30 mins)
Test pure functions in:
- utils/validation.js
- Helper functions in other utils

### Phase 3: Service Layer (30 mins)
Add tests for:
- Any remaining service files
- API utilities
- Data transformers

## Realistic Session 15 Goals
- **Achievable Target**: 25-27% coverage (+3-5%)
- **Test Count**: 50-70 simple tests
- **Files Touched**: 8-12 files
- **Focus**: Breadth over depth

## Post-Session Reality
After Session 15, we'll have:
- ~25-27% coverage (best case)
- Still 23-25% short of 50% target
- Need to reassess strategy for reaching 50%

## Execution Plan
1. Create smoke tests for 3 large components
2. Add utility function tests
3. Fill in service layer gaps
4. Measure results
5. Document learnings for future approach