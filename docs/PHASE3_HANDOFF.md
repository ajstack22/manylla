# Phase 3 Handoff: Entry Dialog Integration for File Attachments

**Date**: November 6, 2024
**Current Status**: Backend (Phase 1) ✅ | Client Services (Phase 2) ✅ | UI Integration Needed
**Story**: S002 - Zero-Knowledge File Attachments

---

## 🎯 Quick Start for Next Session

```
I need to implement Phase 3 of the file attachments feature for Manylla.

Phases 1-2 are complete (backend API and client services). I need to create an entry dialog that integrates the file attachment components to enable full end-to-end testing.

Please read:
- /Users/adamstack/manylla/docs/PHASE3_HANDOFF.md (this file)
- /Users/adamstack/manylla/src/components/Forms/FileAttachmentList.js (ready to use)
- /Users/adamstack/manylla/src/context/ProfileContext.js (has addEntry, updateEntry)

The main task is to create an EntryDialog component that allows users to create/edit entries with file attachments.
```

---

## ✅ What's Already Complete

### Phase 1: Backend API (100% Complete)
- `api/file_validate.php` - Pre-upload validation
- `api/file_upload.php` - Chunked uploads
- `api/file_download.php` - Streaming downloads
- Database table: `file_metadata`
- Storage: `/public_html/manylla/qual/user-files/`

### Phase 2: Client Implementation (100% Complete)

#### Core Services Created:
- `src/services/ChunkedEncryptionService.js` - Streaming encryption (1MB chunks)
- `src/services/fileAttachmentService.js` - Full API integration
- `src/utils/fileValidation.js` - File validation utilities
- `src/services/sync/conflictResolver.js` - Enhanced with attachment deduplication

#### UI Components Ready to Use:
- `src/components/Forms/FileAttachmentButton.js` - Upload button with progress
- `src/components/Forms/FileAttachmentChip.js` - File display chip
- `src/components/Forms/FileAttachmentList.js` - **Main component to integrate**
- `src/components/Profile/EntryAttachments.js` - For viewing attached files

#### Data Layer Updated:
- `src/context/ProfileContext.js` - Has `addEntry`, `updateEntry`, `deleteEntry` methods
- `src/types/ChildProfile.js` - Entry type includes `attachments` array field
- `src/config/featureFlags.js` - Feature toggle system

---

## 🎯 What Needs to Be Done (Phase 3)

### Primary Goal: Create Entry Dialog
Create a dialog component that allows users to:
1. Add/edit journal entries
2. Attach files to entries
3. View/remove attached files
4. Save entries with attachments

### Required Component: `EntryDialog.js`

**Location**: `src/components/Dialogs/EntryDialog.js`

**Key Features Needed**:
```javascript
// Component should include:
- Title input field
- Description/content field (with Markdown support)
- Category selector
- Date picker
- FileAttachmentList component (already built)
- Save/Cancel buttons
- Edit mode support (for existing entries)
```

**Integration Points**:
```javascript
import FileAttachmentList from '../Forms/FileAttachmentList';
import { useProfiles } from '../../context/ProfileContext';
import { useSync } from '../../context/SyncContext';

// Use these ProfileContext methods:
const { addEntry, updateEntry, currentProfile } = useProfiles();
```

---

## 📝 Implementation Guide

### Step 1: Create EntryDialog Component

```javascript
// src/components/Dialogs/EntryDialog.js

import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert
} from 'react-native';
import FileAttachmentList from '../Forms/FileAttachmentList';
import { MarkdownField } from '../Forms/MarkdownField';
import { useProfiles } from '../../context/ProfileContext';
import { useSync } from '../../context/SyncContext';
import { useTheme } from '../../context/ThemeContext';
import { isFeatureEnabled } from '../../config/featureFlags';

const EntryDialog = ({
  open,
  onClose,
  entry = null, // null for new, existing entry for edit
  profileId,
  category = 'general'
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());
  const [attachments, setAttachments] = useState([]);
  const [saving, setSaving] = useState(false);

  const { addEntry, updateEntry } = useProfiles();
  const { syncId } = useSync();
  const { theme } = useTheme();

  useEffect(() => {
    if (entry) {
      // Populate fields for edit mode
      setTitle(entry.title || '');
      setDescription(entry.description || '');
      setDate(new Date(entry.date));
      setAttachments(entry.attachments || []);
    }
  }, [entry]);

  const handleSave = async () => {
    const entryData = {
      title,
      description,
      date: date.toISOString(),
      category,
      attachments
    };

    try {
      setSaving(true);
      if (entry) {
        await updateEntry(profileId, entry.id, entryData);
      } else {
        await addEntry(profileId, entryData);
      }
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to save entry');
    } finally {
      setSaving(false);
    }
  };

  const handleAddAttachment = (attachment) => {
    setAttachments([...attachments, attachment]);
  };

  const handleDeleteAttachment = (attachmentId) => {
    setAttachments(attachments.filter(a => a.id !== attachmentId));
  };

  // ... render modal with form fields and FileAttachmentList
};
```

### Step 2: Add Entry Management UI

Look for existing profile/category views and add:
1. "Add Entry" button that opens EntryDialog
2. Entry list showing titles with attachment indicators
3. Edit capability for existing entries

**Files to check/modify**:
- Look for `CategorySection`, `ProfileView`, or similar components
- Add entry management UI if missing

### Step 3: Wire Up Navigation

Ensure users can:
1. Navigate to a profile
2. See categories/sections
3. Add new entries with attachments
4. Edit existing entries

---

## 🧪 Testing Checklist

After implementing the dialog:

### Functional Tests
- [ ] Can open dialog to create new entry
- [ ] Can add title, description, date
- [ ] Can attach files (FileAttachmentButton works)
- [ ] Can see attached files (FileAttachmentChip displays)
- [ ] Can remove attached files before saving
- [ ] Can save entry with attachments
- [ ] Entry appears in profile with attachments
- [ ] Can edit existing entry and modify attachments
- [ ] Can view/download attachments from saved entries

### Edge Cases
- [ ] Attachment persists if dialog closed/reopened
- [ ] Error handling for failed uploads
- [ ] Quota exceeded warning appears
- [ ] Feature flag disables file UI when false

### Platform Tests
- [ ] Web: File picker works
- [ ] Web: Drag-drop works (if implemented)
- [ ] iOS Simulator: Basic UI works (file picker won't work in simulator)
- [ ] Android Emulator: Basic UI works

---

## 🔧 Existing Code Reference

### ProfileContext Methods
```javascript
// src/context/ProfileContext.js

// Add new entry
await addEntry(profileId, {
  title: "Entry Title",
  description: "Content",
  category: "general",
  date: new Date().toISOString(),
  attachments: [
    {
      id: "uuid",
      fileHash: "hash",
      size: 1234,
      encryptedMeta: "...",
      uploadDate: "...",
      version: 1
    }
  ]
});

// Update existing entry
await updateEntry(profileId, entryId, updatedData);

// Delete entry
await deleteEntry(profileId, entryId);
```

### FileAttachmentList Usage
```javascript
// Component is fully self-contained
<FileAttachmentList
  attachments={attachments}           // Array of attachment objects
  onAdd={handleAddAttachment}        // Called when file uploaded
  onDelete={handleDeleteAttachment}  // Called when file deleted
  maxFiles={10}                      // Maximum files (default 10)
  editable={true}                    // Allow add/delete
/>
```

### Entry Type Structure
```javascript
// src/types/ChildProfile.js
Entry = {
  id: string,
  category: string,
  title: string,
  description: string,
  date: Date,
  updatedAt: Date (optional),
  attachments: Array<{
    id: string,
    fileHash: string,
    size: number,
    encryptedMeta: string,
    uploadDate: string,
    version: number
  }>
}
```

---

## 🚨 Important Constraints

### Must Follow
1. **No TypeScript** - Use .js files only (team agreement)
2. **Feature Flag** - Respect `isFeatureEnabled('ENABLE_FILE_ATTACHMENTS')`
3. **Console Logs** - Remove all console.log before commit
4. **Sync Required** - File operations need syncId to be set

### API Configuration
- Base URL: `https://manylla.com/qual/api/`
- Already configured in `fileAttachmentService.js`

### Current Limitations
- iOS/Android file pickers need real device testing
- 50MB max file size
- 500MB total quota per user

---

## 🚀 Deployment After Implementation

1. **Test locally**:
   ```bash
   npm run web
   ```

2. **Update release notes** if adding new user-facing features

3. **Deploy to QUAL**:
   ```bash
   ./scripts/deploy-qual.sh
   ```

4. **Verify on QUAL**:
   - https://manylla.com/qual/
   - Test full workflow end-to-end

---

## 📊 Success Criteria

The implementation is complete when:

1. ✅ Users can create entries with file attachments
2. ✅ Users can edit entries and modify attachments
3. ✅ Users can view/download attached files
4. ✅ Files are encrypted before upload (verify in network tab)
5. ✅ Sync works with entries containing attachments
6. ✅ Feature can be toggled on/off via flag

---

## 🆘 Troubleshooting

### If file upload fails
- Check browser console for errors
- Verify backend API is responding: `curl https://manylla.com/qual/api/file_validate.php`
- Check network tab for failed requests

### If components don't appear
- Verify feature flag is enabled in `src/config/featureFlags.js`
- Check that syncId is set (required for file operations)

### If build fails
- Run `npm install` (react-native-document-picker should be installed)
- Check for TypeScript files (not allowed)

---

## 📚 Additional Context Files

**Review these if needed**:
- `/Users/adamstack/manylla/docs/features/FEAT-file-attachments-plan-REVISED.md` - Full implementation plan
- `/Users/adamstack/manylla/processes/backlog/S002-zero-knowledge-file-attachments.md` - Original story
- `/Users/adamstack/manylla/docs/PHASE2_HANDOFF.md` - Previous phase details
- `/Users/adamstack/manylla/src/components/Dialogs/UnifiedAddDialog.js` - Example dialog pattern

---

## ✨ Quick Wins

If short on time, prioritize:
1. **Basic EntryDialog** - Just title, description, and FileAttachmentList
2. **Add Entry button** - Somewhere in the UI to open the dialog
3. **Save functionality** - Ensure entries save with attachments

Polish can come later:
- Date picker
- Category selector
- Markdown preview
- Entry list with edit capability

---

## 🎬 Next Steps Summary

1. **Create EntryDialog component** with FileAttachmentList
2. **Find/create entry list view** with add button
3. **Test full workflow** locally
4. **Deploy to QUAL** for integration testing
5. **Document any remaining work**

The feature is 80% complete. This dialog is the key missing piece to enable full end-to-end testing and validation.

---

**Last Updated**: November 6, 2024
**Phase 2 Status**: ✅ Complete
**Phase 3 Status**: 🔨 Ready to implement
**Estimated Time**: 1-2 hours for basic implementation