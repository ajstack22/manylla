#!/bin/bash

# Fix for RCT-Folly coroutine issue
echo "Fixing RCT-Folly Expected.h file..."

EXPECTED_FILE="Pods/RCT-Folly/folly/Expected.h"

if [ -f "$EXPECTED_FILE" ]; then
    # Comment out the problematic coroutine include
    sed -i '' '1587s/^#include/#ifdef FOLLY_HAS_COROUTINES_DISABLED\n\/\/ #include/' "$EXPECTED_FILE"
    sed -i '' '1588a\
#endif' "$EXPECTED_FILE"
    
    echo "Fixed $EXPECTED_FILE"
else
    echo "Warning: $EXPECTED_FILE not found"
fi

echo "Folly fix applied!"