#!/bin/bash

echo "=== Migrating to @platform imports ==="
echo ""

# Count current state
BEFORE_COUNT=$(grep -r "from.*platform" src/ --include="*.js" | grep -v "__tests__" | grep -v "@platform" | wc -l | tr -d ' ')
echo "Found $BEFORE_COUNT relative platform imports to migrate"
echo ""

# Find all files with relative platform imports
FILES=$(grep -r "from.*[\"'].*utils/platform[\"']" src/ --include="*.js" -l | grep -v "__tests__")

MIGRATED=0
for file in $FILES; do
  echo "Updating $file"
  
  # Replace various relative import patterns with @platform
  # Pattern 1: from "../utils/platform"
  sed -i '' "s|from [\"']\.\./utils/platform[\"']|from \"@platform\"|g" "$file"
  
  # Pattern 2: from "../../utils/platform"
  sed -i '' "s|from [\"']\.\./\.\./utils/platform[\"']|from \"@platform\"|g" "$file"
  
  # Pattern 3: from "../../../utils/platform"
  sed -i '' "s|from [\"']\.\./\.\./\.\./utils/platform[\"']|from \"@platform\"|g" "$file"
  
  # Pattern 4: from "./platform" (in utils directory)
  if [[ "$file" == *"src/utils/"* ]]; then
    sed -i '' "s|from [\"']\./platform[\"']|from \"@platform\"|g" "$file"
  fi
  
  MIGRATED=$((MIGRATED + 1))
done

echo ""
echo "=== Migration Summary ==="
echo "Files updated: $MIGRATED"

# Count after migration
AFTER_COUNT=$(grep -r "from.*@platform" src/ --include="*.js" | grep -v "__tests__" | wc -l | tr -d ' ')
REMAINING=$(grep -r "from.*platform" src/ --include="*.js" | grep -v "__tests__" | grep -v "@platform" | wc -l | tr -d ' ')

echo "Files now using @platform: $AFTER_COUNT"
echo "Remaining relative imports: $REMAINING"

if [ "$REMAINING" -eq 0 ]; then
  echo ""
  echo "✅ Migration complete! All platform imports now use @platform alias"
else
  echo ""
  echo "⚠️  Warning: $REMAINING relative imports still remain"
  echo "Files with remaining relative imports:"
  grep -r "from.*platform" src/ --include="*.js" | grep -v "__tests__" | grep -v "@platform" | cut -d: -f1 | sort -u
fi