#!/bin/bash

echo "Safely fixing known style corruptions..."

# Define files to process
FILES=(
  "src/components/Common/ThemeSwitcher.js"
  "src/components/Common/UnifiedModal.js"
  "src/components/DatePicker/DatePicker.js"
  "src/components/Forms/EntryForm.js"
  "src/components/Loading/LoadingOverlay.js"
  "src/components/Loading/LoadingSpinner.js"
  "src/components/Onboarding/OnboardingWizard.js"
  "src/components/Profile/ProfileCard.js"
  "src/components/Profile/ProfileOverview.rn.js"
  "src/components/Settings/CategoryManager.js"
  "src/components/Sharing/SharedProfileView.js"
  "src/components/Sync/SyncDialog.js"
  "src/components/Toast/ThemedToast.js"
  "src/components/UnifiedApp.js"
  "src/components/Forms/MarkdownField.js"
  "src/components/Forms/SmartTextInput.js"
  "src/components/Profile/ProfileEditDialog.js"
  "src/components/Profile/ProfileCreateDialog.js"
  "src/components/Profile/CategorySection.js"
  "src/components/Dialogs/UnifiedAddDialog.js"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "Processing $file..."
    
    # ONLY fix the exact corrupted patterns we know about
    # Font sizes that are clearly wrong (100+ should be 10+)
    sed -i '' \
      -e 's/fontSize: 128/fontSize: 28/g' \
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
      
    # Padding that's clearly wrong (100+ should be 10+)
    sed -i '' \
      -e 's/padding: 100/padding: 10/g' \
      -e 's/padding: 105/padding: 15/g' \
      -e 's/padding: 106/padding: 16/g' \
      -e 's/padding: 102/padding: 12/g' \
      -e 's/padding: 200/padding: 20/g' \
      -e 's/padding: 204/padding: 24/g' \
      -e 's/padding: 302/padding: 32/g' \
      "$file"
      
    # Gap values that are clearly wrong
    sed -i '' \
      -e 's/gap: 80/gap: 8/g' \
      -e 's/gap: 102/gap: 12/g' \
      -e 's/gap: 106/gap: 16/g' \
      "$file"
      
    # LineHeight that's clearly wrong (200+ should be 20+)
    sed -i '' \
      -e 's/lineHeight: 220/lineHeight: 20/g' \
      -e 's/lineHeight: 222/lineHeight: 22/g' \
      -e 's/lineHeight: 218/lineHeight: 18/g' \
      -e 's/lineHeight: 216/lineHeight: 16/g' \
      -e 's/lineHeight: 214/lineHeight: 14/g' \
      "$file"
  fi
done

echo "Done with safe fixes!"
echo "Files that may still need manual review:"
echo "- Files with complex corruptions like 'width0' or 'colorategoryColor'"
echo "- These need careful manual fixing to avoid further corruption"