#!/bin/bash

echo "Fixing corrupted font sizes and dimensions..."

# Fix specific font sizes (100+ divided by 10)
FILES=(
  "src/components/Sharing/ShareDialogOptimized.js"
  "src/components/Sharing/QRCodeModal.js"
  "src/components/Common/UnifiedModal.js"
  "src/components/Sync/SyncDialog.js"
  "src/components/Settings/UnifiedCategoryManager.js"
  "src/components/Settings/QuickInfoManager.js"
  "src/components/Sharing/SharedView.js"
  "src/components/Sharing/PrintPreview.js"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "Fixing $file..."
    # Fix specific font sizes
    sed -i '' \
      -e 's/fontSize: 124/fontSize: 24/g' \
      -e 's/fontSize: 120/fontSize: 20/g' \
      -e 's/fontSize: 118/fontSize: 18/g' \
      -e 's/fontSize: 116/fontSize: 16/g' \
      -e 's/fontSize: 114/fontSize: 14/g' \
      -e 's/fontSize: 113/fontSize: 13/g' \
      -e 's/fontSize: 112/fontSize: 12/g' \
      -e 's/fontSize: 111/fontSize: 11/g' \
      -e 's/fontSize: 110/fontSize: 10/g' \
      "$file"
  fi
done

echo "Done!"