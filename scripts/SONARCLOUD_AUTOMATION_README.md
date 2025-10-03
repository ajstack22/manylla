# SonarCloud → Atlas Automation

**Smart, automated integration between SonarCloud quality reports and Atlas development workflow**

## 🎯 What It Does

This automation intelligently processes SonarCloud issues and:

1. **Fetches** all issues from SonarCloud via API
2. **Categorizes** by priority (Critical → High → Medium → Low)
3. **Detects duplicates** - won't create stories for issues already tracked
4. **Feeds critical/high issues** directly into Atlas workflow (auto-generates prompt)
5. **Creates tech debt stories** for medium/low priority issues

**Result:** Zero manual work to keep your codebase quality on track!

---

## 🚀 Quick Start

### Run the Automation

```bash
./scripts/sonarcloud-to-atlas.sh
```

### What Happens

```
Phase 1: Fetches all SonarCloud issues (bugs, code smells, hotspots)
Phase 2: Categorizes by severity/priority
Phase 3: Checks existing stories (duplicate detection)
Phase 4: Generates Atlas workflow for critical/high issues
Phase 5: Creates tech debt stories for medium/low issues
```

### Output Files

**Immediate Action (Critical/High):**
- `atlas/prompts/SONARCLOUD_AUTO_FIXES.md` - Ready-to-execute Atlas workflow

**Tech Debt Stories (Medium/Low):**
- `processes/backlog/TD-SONAR-*.md` - Individual story files
- Grouped by SonarCloud rule (avoids story spam)

**Debug/Reference:**
- `/tmp/sonar-categorized.json` - All issues categorized
- `/tmp/sonar-needs-stories.json` - Issues needing action

---

## 📋 Priority Categories

### Critical (Red - Fix Immediately)
- **Bugs** (all severities)
- **Vulnerabilities**
- **BLOCKER** code smells
- **CRITICAL** code smells

**Action:** Auto-generates Atlas workflow → Fix ASAP

### High (Yellow - Fix Soon)
- **Security Hotspots** (need review)
- **MAJOR** code smells

**Action:** Auto-generates Atlas workflow → Prioritize this sprint

### Medium (Cyan - Tech Debt)
- **MINOR** code smells

**Action:** Creates tech debt stories → Address in maintenance windows

### Low (Green - Track Only)
- **INFO** level issues

**Action:** Creates tech debt stories only if 5+ instances

---

## 🔍 Duplicate Detection

**Smart algorithm prevents story spam:**

1. Scans existing stories in:
   - `processes/BACKLOG.md`
   - `processes/backlog/*.md`
   - `atlas/09_STORIES/*.md`

2. Normalizes story titles and issue messages

3. Checks for 60%+ word overlap

4. Skips creating duplicate stories

**Example:**
```
Issue: "Refactor function to reduce cognitive complexity"
Existing: "Reduce cognitive complexity in authentication"
Result: ✅ Duplicate detected - skipped
```

---

## 🎯 Using the Generated Atlas Workflow

### Option 1: Execute in Claude Code Session

```bash
# In your Claude Code session:
cat atlas/prompts/SONARCLOUD_AUTO_FIXES.md
```

Then say:
> "Please execute the Atlas Standard workflow defined in atlas/prompts/SONARCLOUD_AUTO_FIXES.md"

Claude will:
1. Review all critical/high issues
2. Create fix plan
3. Implement fixes systematically
4. Verify with tests
5. Deploy to qual

### Option 2: Manual Execution

Follow the 5-phase Atlas Standard workflow:

```bash
# Phase 1: Research (review issues)
cat atlas/prompts/SONARCLOUD_AUTO_FIXES.md

# Phase 2: Plan (create strategy)
# ... review and plan fixes

# Phase 3: Implement (fix issues)
# ... make changes

# Phase 4: Review (verify)
npm run test:critical
npm run sonar

# Phase 5: Deploy
./scripts/deploy-qual.sh
```

---

## 📚 Tech Debt Story Format

Auto-generated stories follow this template:

```markdown
# TD-SONAR-[RULE]: Fix N instances of [Issue Type]

**Type:** Tech Debt
**Priority:** P3/P4
**Created:** YYYY-MM-DD
**Auto-generated:** Yes

## Description
[Issue description and SonarCloud rule]

## Affected Files
- file1.js:line
- file2.js:line
... (up to 10 shown)

## Fix Strategy
[Recommended approach]

## Acceptance Criteria
- [ ] All instances fixed
- [ ] Tests pass
- [ ] SonarCloud scan shows resolved

## Reference
- SonarCloud Rule: [link]
```

---

## 🔄 Automation Workflow

```
┌─────────────────┐
│  SonarCloud API │
└────────┬────────┘
         │
         ↓
┌─────────────────────┐
│ Fetch All Issues    │
│ - Bugs              │
│ - Code Smells       │
│ - Security Hotspots │
│ - Vulnerabilities   │
└────────┬────────────┘
         │
         ↓
┌─────────────────────────┐
│ Categorize by Priority  │
│ Critical → High → Med   │
└────────┬────────────────┘
         │
         ↓
┌────────────────────────────┐
│ Check Existing Stories     │
│ (Duplicate Detection)      │
└────────┬───────────────────┘
         │
         ↓
┌────────┴────────┐
│                 │
↓                 ↓
┌─────────────────────────┐  ┌──────────────────────┐
│ Critical/High Issues    │  │ Medium/Low Issues    │
│                         │  │                      │
│ → Atlas Workflow Prompt │  │ → Tech Debt Stories  │
│   SONARCLOUD_AUTO_FIXES │  │   TD-SONAR-*.md      │
└─────────────────────────┘  └──────────────────────┘
```

---

## 🛠️ Configuration

### Prerequisites

1. **SonarCloud Token** in `~/.manylla-env`:
   ```bash
   SONAR_TOKEN="your-sonarcloud-token-here"
   ```

2. **Python 3** installed (for JSON processing)

3. **jq** installed (for JSON parsing):
   ```bash
   brew install jq  # macOS
   # or
   sudo apt install jq  # Linux
   ```

### Customization

Edit `scripts/sonarcloud-to-atlas.sh` to adjust:

- **Priority thresholds** (line ~50)
- **Duplicate detection sensitivity** (line ~180)
- **Story grouping rules** (line ~400)
- **Low priority threshold** (line ~450 - currently 5+ instances)

---

## 📊 Example Output

```
╔════════════════════════════════════════════════════════════╗
║     SonarCloud → Atlas Automation                         ║
║     Smart Issue Processing & Story Generation             ║
╚════════════════════════════════════════════════════════════╝

✅ Prerequisites OK

Phase 1: Fetching SonarCloud Issues
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
→ Fetching all issues from SonarCloud...
✅ Issues fetched successfully

Phase 2: Categorizing Issues by Priority
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Categorized 507 issues:
  Critical: 16
  High: 348
  Medium: 143
  Low: 0

Phase 3: Checking for Existing Stories (Duplicate Detection)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ℹ️  Skipping duplicate: Refactor function... (matches: cognitive complexity)
  ℹ️  Skipping duplicate: Remove unused import... (matches: clean imports)

✅ Duplicate detection complete:
  - 12 issues already have stories
  - 495 issues need new stories

Phase 4: Creating Atlas Workflow for Critical/High Issues
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Atlas prompt created: atlas/prompts/SONARCLOUD_AUTO_FIXES.md

Phase 5: Creating Tech Debt Stories for Medium/Low Issues
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✅ Created: TD-SONAR-S2486 (17 instances)
  ✅ Created: TD-SONAR-S7764 (57 instances)
  ... [12 more stories]

✅ Created 14 new tech debt stories

Summary & Next Steps
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Processing Summary:
Critical Issues: 16 total, 16 need action
High Priority:   348 total, 340 need action
Medium Priority: 143 total, 139 need stories

🚀 Next Steps:

1. IMMEDIATE: Fix Critical/High Issues
   Execute: cat atlas/prompts/SONARCLOUD_AUTO_FIXES.md

2. LATER: Review Tech Debt Stories
   Check: processes/backlog/TD-SONAR-*.md

3. MONITOR: Run this automation regularly
   Command: ./scripts/sonarcloud-to-atlas.sh
```

---

## 🔁 Recommended Usage

### Before Every Deployment
```bash
./scripts/sonarcloud-to-atlas.sh
# Review critical/high issues
# Fix if any are blocking
```

### Weekly Quality Check
```bash
# Monday morning ritual:
./scripts/sonarcloud-to-atlas.sh
# Review new tech debt stories
# Add to sprint planning
```

### Post-Feature Development
```bash
# After completing a feature:
git push
npm run sonar  # Push to SonarCloud
sleep 30  # Wait for processing
./scripts/sonarcloud-to-atlas.sh  # Generate action items
```

### Automated (CI/CD)
```yaml
# .github/workflows/sonarcloud-automation.yml
name: SonarCloud Automation

on:
  schedule:
    - cron: '0 9 * * 1'  # Every Monday 9 AM

jobs:
  process-issues:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run SonarCloud to Atlas
        env:
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
        run: |
          echo "SONAR_TOKEN=$SONAR_TOKEN" > ~/.manylla-env
          ./scripts/sonarcloud-to-atlas.sh
      - name: Create PR with new stories
        # ... commit and PR logic
```

---

## 🐛 Troubleshooting

### "SONAR_TOKEN not found"
```bash
# Add to ~/.manylla-env
echo 'SONAR_TOKEN="your-token-here"' > ~/.manylla-env
```

### "jq: command not found"
```bash
brew install jq  # macOS
sudo apt install jq  # Linux
```

### "No issues found"
- Check if SonarCloud has analyzed your branch
- Verify SONAR_TOKEN has correct permissions
- Run: `npm run sonar` to trigger new analysis

### "Too many tech debt stories created"
- Adjust grouping threshold in script
- Stories are grouped by rule (prevents spam)
- Low priority only creates story if 5+ instances

---

## 📈 Benefits

**Before Automation:**
- ❌ Manual SonarCloud review required
- ❌ Issues get lost/forgotten
- ❌ No systematic tracking
- ❌ Duplicate work creating stories
- ❌ No Atlas integration

**After Automation:**
- ✅ Automatic issue discovery
- ✅ Priority-based action items
- ✅ Atlas workflow integration
- ✅ Duplicate detection
- ✅ Tech debt tracking
- ✅ Zero manual work!

---

## 🎉 Success Metrics

**Quality Gate Achievement:**
- Auto-detects blocking issues
- Generates immediate action plan
- Feeds directly into development workflow
- Achieves PASSING status faster

**Tech Debt Management:**
- All issues tracked automatically
- Grouped by pattern (no spam)
- Prioritized correctly
- Never lost or forgotten

**Developer Experience:**
- Run one command
- Get actionable tasks
- Use familiar Atlas workflow
- Deploy with confidence

---

*Smart automation for smarter development* 🚀

*Last Updated: 2025-10-03*
