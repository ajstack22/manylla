#!/bin/bash
# FINAL COMPLIANCE CHECK - ALL MUST PASS

echo "========================================="
echo "FINAL ARCHITECTURE COMPLIANCE CHECK"
echo "========================================="

TSX_COUNT=$(find src -name "*.tsx" -o -name "*.ts" | grep -v ".d.ts" | wc -l | tr -d ' ')
PLATFORM_COUNT=$(find src -name "*.native.*" -o -name "*.web.*" -o -name "*.ios.*" -o -name "*.android.*" | wc -l | tr -d ' ')

echo "TypeScript files found: $TSX_COUNT (MUST BE 0)"
echo "Platform-specific files found: $PLATFORM_COUNT (MUST BE 0)"

if [ $TSX_COUNT -gt 0 ]; then
  echo "❌ FAILURE: TypeScript files still exist!"
  find src -name "*.tsx" -o -name "*.ts" | grep -v ".d.ts"
  echo "FIX THESE IMMEDIATELY"
  exit 1
fi

if [ $PLATFORM_COUNT -gt 0 ]; then
  echo "❌ FAILURE: Platform-specific files still exist!"
  find src -name "*.native.*" -o -name "*.web.*"
  echo "FIX THESE IMMEDIATELY"
  exit 1
fi

echo "✅ PASS: Architecture is unified"
echo ""

# Check for duplicate files
echo "Checking for duplicate component files..."
DUPLICATES=0
for f in $(find src -name "*.js" | grep -v node_modules); do
  base="${f%.js}"
  if [ -f "${base}.jsx" ]; then
    echo "ERROR: Duplicate found: ${base}"
    DUPLICATES=$((DUPLICATES + 1))
  fi
done

if [ $DUPLICATES -gt 0 ]; then
  echo "❌ FAILURE: $DUPLICATES duplicate files found"
  exit 1
else
  echo "✅ PASS: No duplicate files"
fi

echo ""
echo "Now testing build..."

# Test the web build
npm run build:web
if [ $? -ne 0 ]; then
  echo "❌ FAILURE: Build failed!"
  echo "YOUR CONSOLIDATION BROKE THE BUILD"
  exit 1
fi

echo ""
echo "✅✅✅ ALL CHECKS PASSED - SUBMIT FOR REVIEW ✅✅✅"
echo ""
echo "SUMMARY:"
echo "- TypeScript files: 0 ✓"
echo "- Platform-specific files: 0 ✓"
echo "- Duplicate files: 0 ✓"
echo "- Web build: SUCCESS ✓"
echo ""
echo "🎉 UNIFIED CODEBASE RESTORATION COMPLETE! 🎉"