#!/bin/bash

echo "Fixing ALL style issues across the codebase..."

# All files that need fixing
FILES=(
  "src/components/Common/ThemeSwitcher.js"
  "src/components/Common/UnifiedModal.js"
  "src/components/DatePicker/DatePicker.js"
  "src/components/Forms/EntryForm.js"
  "src/components/Layout/Header.js"
  "src/components/Loading/LoadingOverlay.js"
  "src/components/Loading/LoadingSpinner.js"
  "src/components/Onboarding/OnboardingWizard.js"
  "src/components/Profile/ProfileCard.js"
  "src/components/Profile/ProfileOverview.rn.js"
  "src/components/Settings/CategoryManager.js"
  "src/components/Settings/QuickInfoManager.js"
  "src/components/Settings/UnifiedCategoryManager.js"
  "src/components/Sharing/PrintPreview.js"
  "src/components/Sharing/QRCodeModal.js"
  "src/components/Sharing/SharedProfileView.js"
  "src/components/Sync/SyncDialog.js"
  "src/components/Toast/ThemedToast.js"
  "src/components/UnifiedApp.js"
  "src/components/Forms/MarkdownField.js"
  "src/components/Forms/SmartTextInput.js"
  "src/components/Forms/MarkdownRenderer.js"
  "src/components/Profile/ProfileEditDialog.js"
  "src/components/Profile/ProfileCreateDialog.js"
  "src/components/Profile/CategorySection.js"
  "src/components/Dialogs/UnifiedAddDialog.js"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "Fixing $file..."
    # Fix font sizes (divide by 10)
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
      
    # Fix padding values (divide by 10)
    sed -i '' \
      -e 's/padding: 106/padding: 16/g' \
      -e 's/padding: 102/padding: 12/g' \
      -e 's/padding: 204/padding: 24/g' \
      -e 's/padding: 200/padding: 20/g' \
      -e 's/padding: 302/padding: 32/g' \
      -e 's/paddingHorizontal: 0,/paddingHorizontal: 20,/g' \
      -e 's/paddingVertical: 6,/paddingVertical: 16,/g' \
      "$file"
      
    # Fix gap values (divide by 10)
    sed -i '' \
      -e 's/gap: 106/gap: 16/g' \
      -e 's/gap: 102/gap: 12/g' \
      -e 's/gap: 80/gap: 8/g' \
      -e 's/gap: 40/gap: 4/g' \
      "$file"
      
    # Fix lineHeight values (divide by 10)
    sed -i '' \
      -e 's/lineHeight: 220/lineHeight: 20/g' \
      -e 's/lineHeight: 222/lineHeight: 22/g' \
      -e 's/lineHeight: 218/lineHeight: 18/g' \
      -e 's/lineHeight: 216/lineHeight: 16/g' \
      -e 's/lineHeight: 214/lineHeight: 14/g' \
      "$file"
      
    # Fix width/height values
    sed -i '' \
      -e 's/width: 0,/width: 10,/g' \
      -e 's/height: 0,/height: 10,/g' \
      -e 's/width: 4,/height: 24,/g' \
      -e 's/height: 4,/height: 24,/g' \
      -e 's/width20,/width: 20,/g' \
      -e 's/width00,/width: 200,/g' \
      "$file"
      
    # Fix margin values
    sed -i '' \
      -e 's/marginHorizontal6,/marginHorizontal: 6,/g' \
      -e 's/marginRight2,/marginRight: 12,/g' \
      -e 's/marginVertical,$/marginVertical: 8,/g' \
      -e 's/marginHorizontal,$/marginHorizontal: 12,/g' \
      "$file"
  fi
done

echo "Fixing any remaining specific issues..."

# Fix specific files with known issues
if [ -f "src/components/Profile/CategorySection.js" ]; then
  sed -i '' -e 's/^  color,$/  color: colors.text.primary,/g' "src/components/Profile/CategorySection.js"
fi

if [ -f "src/components/Forms/MarkdownRenderer.js" ]; then
  sed -i '' \
    -e 's/paddingLeft,$/paddingLeft: 12,/g' \
    -e 's/marginRight,$/marginRight: 8,/g' \
    "src/components/Forms/MarkdownRenderer.js"
fi

echo "Done! All style issues fixed."