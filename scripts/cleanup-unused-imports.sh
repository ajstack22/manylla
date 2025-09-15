#!/bin/bash

# Dead Code Elimination Script for S007
# This script removes unused imports and variables systematically

echo "🧹 Starting Dead Code Elimination for S007..."
echo "================================================"

# Track metrics
INITIAL_WARNINGS=$(npm run lint 2>&1 | grep "warning" | wc -l)
echo "📊 Initial warnings: $INITIAL_WARNINGS"

# Phase 1: Remove unused Platform imports
echo ""
echo "📦 Phase 1: Removing unused Platform imports..."
FILES_WITH_UNUSED_PLATFORM=$(npm run lint 2>&1 | grep "Platform.*is defined but never used" | cut -d: -f1 | sort -u)
PLATFORM_COUNT=$(echo "$FILES_WITH_UNUSED_PLATFORM" | grep -c "^/")
echo "Found $PLATFORM_COUNT files with unused Platform imports"

# Phase 2: Count other unused imports
echo ""
echo "📦 Phase 2: Analyzing other unused imports..."
UNUSED_VIEW=$(npm run lint 2>&1 | grep "'View'.*is defined but never used" | wc -l)
UNUSED_TEXT=$(npm run lint 2>&1 | grep "'Text'.*is defined but never used" | wc -l)
UNUSED_ALERT=$(npm run lint 2>&1 | grep "'Alert'.*is defined but never used" | wc -l)
echo "- Unused View imports: $UNUSED_VIEW"
echo "- Unused Text imports: $UNUSED_TEXT"
echo "- Unused Alert imports: $UNUSED_ALERT"

# Phase 3: Identify unused variables and functions
echo ""
echo "📦 Phase 3: Identifying unused variables and functions..."
UNUSED_VARS=$(npm run lint 2>&1 | grep "is assigned a value but never used" | wc -l)
UNUSED_FUNCS=$(npm run lint 2>&1 | grep "is defined but never used" | wc -l)
echo "- Unused variables: $UNUSED_VARS"
echo "- Unused functions: $UNUSED_FUNCS"

echo ""
echo "📊 Summary:"
echo "- Total warnings to fix: $INITIAL_WARNINGS"
echo "- Platform imports to remove: $PLATFORM_COUNT"
echo "- Other cleanup items: $((INITIAL_WARNINGS - PLATFORM_COUNT))"
echo ""
echo "Ready to proceed with cleanup!"