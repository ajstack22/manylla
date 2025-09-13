# Story S015: Reorganize Development Folder to Root-Level Processes

## Overview
Reorganized `docs/development/` to `processes/` at root level and cleaned up root directory clutter.

## Status
- **Priority**: P2
- **Status**: COMPLETED
- **Created**: 2025-09-12
- **Completed**: 2025-09-12
- **Assigned**: Claude

## Background
The `docs/development/` folder contained processes, workflows, and operational guides - not documentation. This created confusion about whether these were reference materials or active processes. Additionally, the root folder had accumulated test files, old backups, and temporary scripts that needed cleanup.

## Requirements
1. Clean root folder of unnecessary files
2. Move `docs/development/` to `processes/` at root level
3. Update all references across codebase
4. Ensure scripts continue working after reorganization

## Success Metrics
```bash
# Verification commands
ls processes/BACKLOG.md                    # Expected: File exists
./scripts/create-story.sh "Test" P2        # Expected: Creates story in processes/backlog/
grep -r "docs/development" . --exclude-dir=node_modules | wc -l  # Expected: 0 (no old references)
```

## Implementation Summary

### Phase 1: Root Folder Cleanup
**Files Removed/Moved:**
- Deleted test/debug files: `debug_share_create.php`, `test_share_endpoints.php`, `test-encryption.js`, `test-phase3.js`, `debug-heights.js`
- Archived old docs: `ANDROID_LIBRARY_FIX.md`, `ANDROID_SETUP_ACTUAL_STATUS.md`, `DEPLOYMENT_STATUS.md` → `archives/docs/`
- Moved backups: `*.tar.gz`, `*.zip` → `backups/`
- Moved images: `ellie.png`, `manila-old.png` → `public/assets/`
- Moved reports: `depcheck-results.json`, `license-report.csv` → `reports/`

### Phase 2: Folder Reorganization
```bash
# Main move
mv docs/development processes

# Fixed nested structure issue
mv processes/processes/* processes/
rmdir processes/processes
```

### Phase 3: Update References (19 files)
**Scripts Updated (9):**
- `scripts/update-backlog-priority.sh`: Changed BACKLOG path
- `scripts/apply-role-learnings.sh`: Updated ROLES_DIR and LEARNINGS_DIR
- `scripts/setup-git-conventions.sh`: Updated convention doc path
- `scripts/tech-debt-to-story.sh`: Updated all tech-debt paths
- `scripts/create-story.sh`: Updated BACKLOG and story paths
- `scripts/update-role-definitions.sh`: Updated ROLES_DIR
- `scripts/create-bug.sh`: Updated BACKLOG and bug paths
- `scripts/create-story-interactive.sh`: Updated story lookup path
- `scripts/create-story-with-details.sh`: Updated story lookup path

**Root Files Updated (5):**
- `.gitmessage`: Updated commit convention reference
- `CLAUDE.md`: Updated all process and role references
- `DEPLOYMENT_RULES.md`: Updated GIT conventions path
- `README.md`: Updated link to GIT conventions

**Internal Documentation Updated (6):**
- `processes/ADVERSARIAL_REVIEW_PROCESS.md`: Updated tech-debt path
- `processes/TECH_DEBT_MANAGEMENT.md`: Updated drafts path
- `processes/README.md`: Updated structure diagram
- `processes/roles/PM_ROLE_AND_LEARNINGS.md`: Updated command examples
- `processes/roles/DEVELOPER_ROLE_AND_LEARNINGS.md`: Updated backlog/tech-debt paths
- `processes/roles/PEER_REVIEWER_ROLE_AND_LEARNINGS.md`: Updated review paths

## Acceptance Criteria
- [x] All requirements implemented
- [x] All success metrics pass
- [x] Scripts tested and working
- [x] No broken references
- [x] Documentation updated

## Technical Details
```bash
# Path changes applied
sed -i 's|docs/development|processes|g' [file]

# New structure
/manylla/
├── processes/         # Operational workflows (moved from docs/development/)
│   ├── backlog/
│   ├── roles/
│   ├── tech-debt/
│   └── ...
├── backups/          # Backup archives
├── reports/          # Generated reports
├── archives/         # Old/outdated files
│   └── docs/        # Archived documentation
└── public/
    └── assets/      # Image files
```

## Benefits Achieved
1. **Clearer Structure**: Processes are now clearly operational, not documentation
2. **Cleaner Root**: ~9MB of unnecessary files removed/organized
3. **Better Organization**: Logical separation between docs, processes, and archives
4. **Improved Developer Experience**: Easier to find and understand project structure

## Estimated Effort
- Research: 0.5 hours (finding all references)
- Implementation: 1 hour (moving files, updating paths)
- Testing: 0.5 hours (verifying scripts work)
- **Total**: S (Small - completed in one session)

## Notes
This reorganization makes the codebase structure more intuitive. The `processes/` folder at root level clearly indicates these are active workflows, not reference documentation.

---
*Story ID: S015*
*Created: 2025-09-12*
*Status: COMPLETED*