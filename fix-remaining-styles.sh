#!/bin/bash

echo "Fixing remaining style issues..."

# Files to fix
FILES=(
  "src/components/Settings/UnifiedCategoryManager.js"
  "src/components/Settings/QuickInfoManager.js"
  "src/components/Sharing/ShareDialogOptimized.js"
  "src/components/Sharing/QRCodeModal.js"
  "src/components/Sharing/SharedView.js"
  "src/components/Sharing/PrintPreview.js"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "Fixing $file..."
    # Fix padding values
    sed -i '' \
      -e 's/padding: 106/padding: 16/g' \
      -e 's/padding: 102/padding: 12/g' \
      -e 's/padding: 204/padding: 24/g' \
      -e 's/padding: 200/padding: 20/g' \
      -e 's/padding: 302/padding: 32/g' \
      -e 's/gap: 106/gap: 16/g' \
      -e 's/gap: 102/gap: 12/g' \
      -e 's/gap: 80/gap: 8/g' \
      -e 's/lineHeight: 220/lineHeight: 20/g' \
      -e 's/lineHeight: 222/lineHeight: 22/g' \
      -e 's/lineHeight: 218/lineHeight: 18/g' \
      -e 's/lineHeight: 216/lineHeight: 16/g' \
      -e 's/width: 0,/width: 10,/g' \
      "$file"
  fi
done

echo "Done!"