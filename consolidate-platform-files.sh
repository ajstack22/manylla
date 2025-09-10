#!/bin/bash

echo "=== CONSOLIDATING REMAINING PLATFORM-SPECIFIC FILES ==="

# Function to merge platform files into unified JS
merge_platform_files() {
  local base_path=$1
  local web_file="${base_path}.web.js"
  local native_file="${base_path}.native.js"
  local unified_file="${base_path}.js"
  
  echo "Merging $base_path..."
  
  # Create unified file with Platform.select
  cat > "$unified_file" << 'EOF'
import { Platform } from 'react-native';

// Unified component that works across all platforms
EOF

  # If both web and native exist, create Platform.select version
  if [[ -f "$web_file" ]] && [[ -f "$native_file" ]]; then
    echo "const Component = Platform.select({" >> "$unified_file"
    echo "  web: require('./${base_path##*/}.web').default," >> "$unified_file"
    echo "  default: require('./${base_path##*/}.native').default," >> "$unified_file"
    echo "});" >> "$unified_file"
    echo "" >> "$unified_file"
    echo "export default Component;" >> "$unified_file"
    
    # Keep the platform files for now, will delete after verification
  elif [[ -f "$web_file" ]]; then
    # Only web version exists
    cp "$web_file" "$unified_file"
  elif [[ -f "$native_file" ]]; then
    # Only native version exists
    cp "$native_file" "$unified_file"
  fi
}

# 1. DatePicker
echo "Consolidating DatePicker..."
cat > src/components/DatePicker/DatePicker.js << 'EOF'
import React from 'react';
import { Platform, View, Text, TouchableOpacity, TextInput } from 'react-native';

const DatePicker = ({ value, onChange, label, ...props }) => {
  if (Platform.OS === 'web') {
    // Web implementation - use HTML5 date input
    return (
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          padding: '12px 15px',
          fontSize: '16px',
          borderRadius: '8px',
          border: '1px solid #E0E0E0',
          backgroundColor: '#FFFFFF',
          width: '100%',
        }}
        {...props}
      />
    );
  } else {
    // Native implementation - use TextInput for now
    // Could integrate with @react-native-community/datetimepicker
    return (
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="MM/DD/YYYY"
        style={{
          padding: 12,
          fontSize: 16,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: '#E0E0E0',
          backgroundColor: '#FFFFFF',
        }}
        {...props}
      />
    );
  }
};

export default DatePicker;
EOF
rm -f src/components/DatePicker/DatePicker.web.js src/components/DatePicker/DatePicker.native.js

# 2. UnifiedAddDialog
echo "Consolidating UnifiedAddDialog..."
if [[ -f "src/components/Dialogs/UnifiedAddDialog.js" ]]; then
  # Already has unified version, just remove native
  rm -f src/components/Dialogs/UnifiedAddDialog.native.js
else
  # Move native to unified
  mv src/components/Dialogs/UnifiedAddDialog.native.js src/components/Dialogs/UnifiedAddDialog.js
fi

# 3. OnboardingWrapper
echo "Consolidating OnboardingWrapper..."
mv src/components/Onboarding/OnboardingWrapper.native.js src/components/Onboarding/OnboardingWrapper.js

# 4. Profile Components
echo "Consolidating Profile components..."
for file in CategorySection ProfileCard ProfileCreateDialog ProfileEditDialog ProfileOverview; do
  if [[ -f "src/components/Profile/${file}.js" ]]; then
    # Unified version exists, remove native
    rm -f "src/components/Profile/${file}.native.js"
  else
    # Move native to unified
    mv "src/components/Profile/${file}.native.js" "src/components/Profile/${file}.js"
  fi
done

# 5. SyncDialog
echo "Consolidating SyncDialog..."
if [[ -f "src/components/Sync/SyncDialog.js" ]]; then
  rm -f src/components/Sync/SyncDialog.native.js
else
  mv src/components/Sync/SyncDialog.native.js src/components/Sync/SyncDialog.js
fi

# 6. ThemedToast
echo "Consolidating ThemedToast..."
if [[ -f "src/components/Toast/ThemedToast.js" ]]; then
  rm -f src/components/Toast/ThemedToast.native.js
else
  mv src/components/Toast/ThemedToast.native.js src/components/Toast/ThemedToast.js
fi

# 7. Service files - these might need special handling
echo "Consolidating service files..."

# Storage service
if [[ -f "src/services/storage/storageService.js" ]]; then
  rm -f src/services/storage/storageService.native.js
else
  mv src/services/storage/storageService.native.js src/services/storage/storageService.js
fi

# Sync services - create unified versions
echo "Creating unified sync services..."

# manyllaEncryptionService
if [[ -f "src/services/sync/manyllaEncryptionService.js" ]]; then
  rm -f src/services/sync/manyllaEncryptionService.web.js
else
  mv src/services/sync/manyllaEncryptionService.web.js src/services/sync/manyllaEncryptionService.js
fi

# manyllaMinimalSyncService - merge web and native
cat > src/services/sync/manyllaMinimalSyncService.js << 'EOF'
import { Platform } from 'react-native';

// Unified sync service
const manyllaMinimalSyncService = (() => {
  if (Platform.OS === 'web') {
    // Web-specific implementation
    return require('./manyllaMinimalSyncService.web.bak').default;
  } else {
    // Native implementation
    return require('./manyllaMinimalSyncService.native.bak').default;
  }
})();

export default manyllaMinimalSyncService;
EOF

# Backup originals before removal
mv src/services/sync/manyllaMinimalSyncService.web.js src/services/sync/manyllaMinimalSyncService.web.bak
mv src/services/sync/manyllaMinimalSyncService.native.js src/services/sync/manyllaMinimalSyncService.native.bak

# 8. Polyfills - keep web polyfill but in unified structure
echo "Handling polyfills..."
if [[ -f "src/polyfills/getRandomValues.web.js" ]]; then
  cat > src/polyfills/getRandomValues.js << 'EOF'
import { Platform } from 'react-native';

// Only apply polyfill on web
if (Platform.OS === 'web' && typeof globalThis.crypto === 'undefined') {
  globalThis.crypto = {
    getRandomValues: (array) => {
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
      return array;
    }
  };
}
EOF
  rm -f src/polyfills/getRandomValues.web.js
fi

echo "=== PLATFORM FILE CONSOLIDATION COMPLETE ==="

# Verify
echo ""
echo "Remaining platform-specific files:"
find src -name "*.native.*" -o -name "*.web.*" -o -name "*.ios.*" -o -name "*.android.*" | grep -v ".bak"