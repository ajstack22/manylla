#!/bin/bash

# SonarCloud to Atlas Automation
# Intelligently processes SonarCloud issues and feeds them into Atlas workflow
# - Critical/High issues → Atlas Standard workflow execution
# - Medium/Low issues → Tech debt stories (with duplicate detection)

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║     SonarCloud → Atlas Automation                         ║${NC}"
echo -e "${CYAN}║     Smart Issue Processing & Story Generation             ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"

if [ ! -f "$HOME/.manylla-env" ]; then
    echo -e "${RED}❌ Error: ~/.manylla-env not found${NC}"
    echo "Please create it with: SONAR_TOKEN=\"your-token\""
    exit 1
fi

source "$HOME/.manylla-env"

if [ -z "$SONAR_TOKEN" ]; then
    echo -e "${RED}❌ Error: SONAR_TOKEN not set in ~/.manylla-env${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites OK${NC}"
echo ""

# ============================================================================
# PHASE 1: FETCH SONARCLOUD ISSUES
# ============================================================================

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}Phase 1: Fetching SonarCloud Issues${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Fetch all issue types
echo -e "${YELLOW}→ Fetching all issues from SonarCloud...${NC}"

# Bugs (all severities)
curl -s -u "$SONAR_TOKEN:" "https://sonarcloud.io/api/issues/search?componentKeys=ajstack22_manylla&types=BUG&statuses=OPEN,CONFIRMED&ps=500" | python3 -m json.tool > /tmp/sonar-bugs.json

# Code Smells (all severities)
curl -s -u "$SONAR_TOKEN:" "https://sonarcloud.io/api/issues/search?componentKeys=ajstack22_manylla&types=CODE_SMELL&statuses=OPEN,CONFIRMED&ps=500" | python3 -m json.tool > /tmp/sonar-code-smells.json

# Security Hotspots
curl -s -u "$SONAR_TOKEN:" "https://sonarcloud.io/api/hotspots/search?projectKey=ajstack22_manylla&statuses=TO_REVIEW&ps=100" | python3 -m json.tool > /tmp/sonar-hotspots.json

# Vulnerabilities (just in case)
curl -s -u "$SONAR_TOKEN:" "https://sonarcloud.io/api/issues/search?componentKeys=ajstack22_manylla&types=VULNERABILITY&statuses=OPEN,CONFIRMED&ps=100" | python3 -m json.tool > /tmp/sonar-vulnerabilities.json

echo -e "${GREEN}✅ Issues fetched successfully${NC}"
echo ""

# ============================================================================
# PHASE 2: CATEGORIZE AND PRIORITIZE ISSUES
# ============================================================================

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}Phase 2: Categorizing Issues by Priority${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Parse and categorize using Python for better JSON handling
python3 << 'PYTHON_SCRIPT'
import json
import os
from collections import defaultdict

# Load all issue files
with open('/tmp/sonar-bugs.json') as f:
    bugs_data = json.load(f)

with open('/tmp/sonar-code-smells.json') as f:
    smells_data = json.load(f)

with open('/tmp/sonar-hotspots.json') as f:
    hotspots_data = json.load(f)

with open('/tmp/sonar-vulnerabilities.json') as f:
    vulns_data = json.load(f)

# Categorize issues
categorized = {
    'critical': [],      # BLOCKER + CRITICAL severity OR bugs
    'high': [],          # MAJOR severity + security hotspots
    'medium': [],        # MINOR severity
    'low': []           # INFO severity
}

# Process bugs (always high priority)
for issue in bugs_data.get('issues', []):
    issue['category'] = 'BUG'
    if issue.get('severity') in ['BLOCKER', 'CRITICAL']:
        categorized['critical'].append(issue)
    else:
        categorized['high'].append(issue)

# Process vulnerabilities (always critical)
for issue in vulns_data.get('issues', []):
    issue['category'] = 'VULNERABILITY'
    categorized['critical'].append(issue)

# Process security hotspots (high priority)
for hotspot in hotspots_data.get('hotspots', []):
    hotspot['category'] = 'SECURITY_HOTSPOT'
    hotspot['severity'] = hotspot.get('vulnerabilityProbability', 'MEDIUM')
    categorized['high'].append(hotspot)

# Process code smells by severity
for issue in smells_data.get('issues', []):
    issue['category'] = 'CODE_SMELL'
    severity = issue.get('severity', 'INFO')

    if severity == 'BLOCKER':
        categorized['critical'].append(issue)
    elif severity == 'CRITICAL':
        categorized['critical'].append(issue)
    elif severity == 'MAJOR':
        categorized['high'].append(issue)
    elif severity == 'MINOR':
        categorized['medium'].append(issue)
    else:
        categorized['low'].append(issue)

# Save categorized issues
with open('/tmp/sonar-categorized.json', 'w') as f:
    json.dump(categorized, f, indent=2)

# Generate summary
summary = {
    'critical': len(categorized['critical']),
    'high': len(categorized['high']),
    'medium': len(categorized['medium']),
    'low': len(categorized['low']),
    'total': sum(len(v) for v in categorized.values())
}

with open('/tmp/sonar-summary.json', 'w') as f:
    json.dump(summary, f, indent=2)

print(f"Categorized {summary['total']} issues:")
print(f"  Critical: {summary['critical']}")
print(f"  High: {summary['high']}")
print(f"  Medium: {summary['medium']}")
print(f"  Low: {summary['low']}")
PYTHON_SCRIPT

echo -e "${GREEN}✅ Issues categorized${NC}"
echo ""

# Read summary
SUMMARY=$(cat /tmp/sonar-summary.json)
CRITICAL_COUNT=$(echo "$SUMMARY" | jq '.critical')
HIGH_COUNT=$(echo "$SUMMARY" | jq '.high')
MEDIUM_COUNT=$(echo "$SUMMARY" | jq '.medium')
LOW_COUNT=$(echo "$SUMMARY" | jq '.low')
TOTAL_COUNT=$(echo "$SUMMARY" | jq '.total')

echo -e "${BLUE}Summary:${NC}"
echo -e "${RED}  Critical: $CRITICAL_COUNT${NC} (Bugs, Blockers, Vulnerabilities)"
echo -e "${YELLOW}  High: $HIGH_COUNT${NC} (Major code smells, Security hotspots)"
echo -e "${CYAN}  Medium: $MEDIUM_COUNT${NC} (Minor code smells)"
echo -e "${GREEN}  Low: $LOW_COUNT${NC} (Info-level issues)"
echo -e "${BLUE}  Total: $TOTAL_COUNT${NC}"
echo ""

# ============================================================================
# PHASE 3: CHECK FOR EXISTING STORIES (DUPLICATE DETECTION)
# ============================================================================

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}Phase 3: Checking for Existing Stories (Duplicate Detection)${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check backlog and existing stories
python3 << 'PYTHON_SCRIPT'
import json
import os
import re
import glob

# Load categorized issues
with open('/tmp/sonar-categorized.json') as f:
    issues = json.load(f)

# Load existing stories from backlog
existing_stories = []

# Check BACKLOG.md
backlog_file = 'processes/BACKLOG.md'
if os.path.exists(backlog_file):
    with open(backlog_file) as f:
        backlog_content = f.read()
        # Extract story titles
        story_matches = re.findall(r'\[([^\]]+)\]', backlog_content)
        existing_stories.extend(story_matches)

# Check individual story files
story_files = glob.glob('processes/backlog/*.md') + glob.glob('atlas/09_STORIES/*.md')
for story_file in story_files:
    with open(story_file) as f:
        content = f.read()
        # Extract title from first H1 or filename
        title_match = re.search(r'^#\s+(.+)$', content, re.MULTILINE)
        if title_match:
            existing_stories.append(title_match.group(1))
        else:
            # Use filename as fallback
            filename = os.path.basename(story_file).replace('.md', '').replace('-', ' ')
            existing_stories.append(filename)

# Create searchable patterns from existing stories (normalize for matching)
existing_patterns = set()
for story in existing_stories:
    # Normalize: lowercase, remove special chars, extract key words
    normalized = re.sub(r'[^a-z0-9\s]', '', story.lower())
    # Extract key words (3+ chars)
    words = [w for w in normalized.split() if len(w) >= 3]
    if words:
        existing_patterns.add(' '.join(words[:5]))  # Use first 5 significant words

# Check which issues already have stories
issues_needing_stories = {'critical': [], 'high': [], 'medium': [], 'low': []}

for priority in ['critical', 'high', 'medium', 'low']:
    for issue in issues[priority]:
        # Create searchable pattern from issue
        message = issue.get('message', '')
        rule = issue.get('rule', '')

        # Normalize issue message
        normalized = re.sub(r'[^a-z0-9\s]', '', message.lower())
        words = [w for w in normalized.split() if len(w) >= 3]
        issue_pattern = ' '.join(words[:5])

        # Check if similar story exists
        has_existing_story = False
        for existing in existing_patterns:
            # Simple similarity check: if 60%+ words match
            issue_words = set(issue_pattern.split())
            existing_words = set(existing.split())
            if issue_words and existing_words:
                overlap = len(issue_words & existing_words)
                similarity = overlap / max(len(issue_words), len(existing_words))
                if similarity > 0.6:
                    has_existing_story = True
                    issue['existing_story'] = existing
                    break

        if not has_existing_story:
            issues_needing_stories[priority].append(issue)
        else:
            print(f"  ℹ️  Skipping duplicate: {message[:60]}... (matches: {issue.get('existing_story', 'unknown')})")

# Save filtered issues
with open('/tmp/sonar-needs-stories.json', 'w') as f:
    json.dump(issues_needing_stories, f, indent=2)

# Summary
total_needing = sum(len(v) for v in issues_needing_stories.values())
total_existing = sum(len(v) for v in issues.values()) - total_needing

print(f"\n✅ Duplicate detection complete:")
print(f"  - {total_existing} issues already have stories")
print(f"  - {total_needing} issues need new stories")
PYTHON_SCRIPT

echo -e "${GREEN}✅ Duplicate detection complete${NC}"
echo ""

# ============================================================================
# PHASE 4: FEED CRITICAL/HIGH INTO ATLAS WORKFLOW
# ============================================================================

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}Phase 4: Creating Atlas Workflow for Critical/High Issues${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Load issues needing action
NEEDS_STORIES=$(cat /tmp/sonar-needs-stories.json)
CRITICAL_NEW=$(echo "$NEEDS_STORIES" | jq '.critical | length')
HIGH_NEW=$(echo "$NEEDS_STORIES" | jq '.high | length')

if [ "$CRITICAL_NEW" -gt "0" ] || [ "$HIGH_NEW" -gt "0" ]; then
    echo -e "${YELLOW}→ Generating Atlas prompt for critical/high issues...${NC}"

    # Generate Atlas-ready prompt
    python3 << 'PYTHON_SCRIPT'
import json
from datetime import datetime

with open('/tmp/sonar-needs-stories.json') as f:
    issues = json.load(f)

critical_issues = issues.get('critical', [])
high_issues = issues.get('high', [])

if not critical_issues and not high_issues:
    print("No critical/high issues to process")
    exit(0)

# Generate Atlas prompt
prompt = f"""# Atlas Auto-Generated: Fix SonarCloud Critical & High Priority Issues

**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
**Workflow:** Atlas Standard (5 phases)
**Auto-generated:** Yes (from SonarCloud API)

## 🎯 Issues to Address

### Critical Issues ({len(critical_issues)})
"""

for i, issue in enumerate(critical_issues[:10], 1):  # Limit to top 10
    file_path = issue.get('component', '').split(':')[-1]
    line = issue.get('line', 'N/A')
    message = issue.get('message', 'No description')
    rule = issue.get('rule', 'unknown')
    category = issue.get('category', 'UNKNOWN')

    prompt += f"""
#### {i}. {category}: {message[:80]}
- **File:** `{file_path}:{line}`
- **Rule:** {rule}
- **Severity:** {issue.get('severity', 'UNKNOWN')}
- **Type:** {issue.get('type', category)}
"""

prompt += f"""
### High Priority Issues ({len(high_issues)})
"""

for i, issue in enumerate(high_issues[:10], 1):  # Limit to top 10
    file_path = issue.get('component', '').split(':')[-1] if 'component' in issue else 'unknown'
    line = issue.get('line', 'N/A')
    message = issue.get('message', 'No description')
    rule = issue.get('rule', 'unknown')
    category = issue.get('category', 'UNKNOWN')

    prompt += f"""
#### {i}. {category}: {message[:80]}
- **File:** `{file_path}:{line}`
- **Rule:** {rule}
- **Severity:** {issue.get('severity', issue.get('vulnerabilityProbability', 'UNKNOWN'))}
"""

prompt += """

## 📋 Execution Plan

**Use Atlas Standard workflow:**

### Phase 1: Research (15 min)
- Review each issue above
- Understand the root cause
- Check test coverage for affected areas

### Phase 2: Plan (15 min)
- Prioritize by impact (critical first)
- Identify dependencies between fixes
- Estimate effort for each fix

### Phase 3: Implement (1-3 hours)
- Fix critical issues first (blocks quality gate)
- Then address high priority issues
- Ensure tests pass after each fix
- Run: `npm run test:critical` and `npm run test:important`

### Phase 4: Review (20 min)
- Verify all fixes with local SonarCloud scan
- Run: `npm run sonar`
- Check quality gate status
- Ensure no regressions

### Phase 5: Deploy (20 min)
- Commit with proper message
- Deploy to qual: `./scripts/deploy-qual.sh`
- Verify quality gate: PASSING ✅

## ✅ Success Criteria

- [ ] All critical issues resolved
- [ ] All high priority issues resolved
- [ ] Quality gate: PASSING
- [ ] All tests passing
- [ ] No regressions introduced

---

*Auto-generated by sonarcloud-to-atlas.sh*
*See: /tmp/sonar-needs-stories.json for full details*
"""

# Save prompt
output_file = 'atlas/prompts/SONARCLOUD_AUTO_FIXES.md'
with open(output_file, 'w') as f:
    f.write(prompt)

print(f"✅ Atlas prompt generated: {output_file}")
PYTHON_SCRIPT

    echo -e "${GREEN}✅ Atlas prompt created: atlas/prompts/SONARCLOUD_AUTO_FIXES.md${NC}"
else
    echo -e "${GREEN}✅ No new critical/high issues - Atlas prompt not needed${NC}"
fi

echo ""

# ============================================================================
# PHASE 5: CREATE TECH DEBT STORIES FOR MEDIUM/LOW ISSUES
# ============================================================================

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}Phase 5: Creating Tech Debt Stories for Medium/Low Issues${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

MEDIUM_NEW=$(echo "$NEEDS_STORIES" | jq '.medium | length')
LOW_NEW=$(echo "$NEEDS_STORIES" | jq '.low | length')

if [ "$MEDIUM_NEW" -gt "0" ] || [ "$LOW_NEW" -gt "0" ]; then
    echo -e "${YELLOW}→ Creating tech debt stories for medium/low priority issues...${NC}"

    python3 << 'PYTHON_SCRIPT'
import json
import os
from datetime import datetime
from collections import defaultdict

with open('/tmp/sonar-needs-stories.json') as f:
    issues = json.load(f)

# Group issues by rule (to create consolidated stories)
medium_by_rule = defaultdict(list)
low_by_rule = defaultdict(list)

for issue in issues.get('medium', []):
    rule = issue.get('rule', 'unknown')
    medium_by_rule[rule].append(issue)

for issue in issues.get('low', []):
    rule = issue.get('rule', 'unknown')
    low_by_rule[rule].append(issue)

created_stories = []

# Create stories for medium issues (grouped by rule)
for rule, rule_issues in medium_by_rule.items():
    if len(rule_issues) == 0:
        continue

    # Get rule description from first issue
    first_issue = rule_issues[0]
    rule_name = rule.split(':')[-1] if ':' in rule else rule

    # Create story file
    story_id = f"TD-SONAR-{rule_name.upper()[:20]}"
    story_file = f"processes/backlog/{story_id}.md"

    # Don't overwrite existing files
    if os.path.exists(story_file):
        print(f"  ℹ️  Story already exists: {story_id}")
        continue

    story_content = f"""# {story_id}: Fix {len(rule_issues)} SonarCloud Code Smell(s) - {rule_name}

**Type:** Tech Debt
**Priority:** P3 (Medium)
**Created:** {datetime.now().strftime('%Y-%m-%d')}
**Auto-generated:** Yes (SonarCloud)

## Description

SonarCloud has identified {len(rule_issues)} instance(s) of code smell: **{rule_name}**

**Rule:** {rule}
**Message:** {first_issue.get('message', 'No description')}

## Affected Files

"""

    for issue in rule_issues[:10]:  # Limit to top 10
        file_path = issue.get('component', '').split(':')[-1]
        line = issue.get('line', 'N/A')
        story_content += f"- `{file_path}:{line}`\n"

    if len(rule_issues) > 10:
        story_content += f"\n... and {len(rule_issues) - 10} more files\n"

    story_content += f"""
## Fix Strategy

1. Review the SonarCloud rule documentation
2. Apply the recommended fix pattern to all instances
3. Ensure tests still pass after fixes
4. Run local SonarCloud scan to verify

## Acceptance Criteria

- [ ] All {len(rule_issues)} instances of this code smell are fixed
- [ ] Tests pass: `npm run test:important`
- [ ] No regressions introduced
- [ ] SonarCloud scan shows issue resolved

## Reference

- SonarCloud Rule: https://rules.sonarsource.com/javascript/RSPEC-{rule_name.replace('javascript:', '')}
- Issue details: /tmp/sonar-needs-stories.json

---

*Auto-generated by sonarcloud-to-atlas.sh on {datetime.now().strftime('%Y-%m-%d')}*
"""

    with open(story_file, 'w') as f:
        f.write(story_content)

    created_stories.append({'id': story_id, 'file': story_file, 'count': len(rule_issues)})
    print(f"  ✅ Created: {story_id} ({len(rule_issues)} instances)")

# Create stories for low priority issues (only if many instances)
for rule, rule_issues in low_by_rule.items():
    if len(rule_issues) < 5:  # Only create story if 5+ instances
        continue

    first_issue = rule_issues[0]
    rule_name = rule.split(':')[-1] if ':' in rule else rule

    story_id = f"TD-SONAR-LOW-{rule_name.upper()[:20]}"
    story_file = f"processes/backlog/{story_id}.md"

    if os.path.exists(story_file):
        print(f"  ℹ️  Story already exists: {story_id}")
        continue

    story_content = f"""# {story_id}: Fix {len(rule_issues)} Low Priority SonarCloud Issue(s) - {rule_name}

**Type:** Tech Debt
**Priority:** P4 (Low)
**Created:** {datetime.now().strftime('%Y-%m-%d')}
**Auto-generated:** Yes (SonarCloud)
**Defer:** Can be addressed in maintenance windows

## Description

{len(rule_issues)} low-priority code quality issues detected.

**Rule:** {rule}
**Message:** {first_issue.get('message', 'No description')}

## Affected Files

"""

    for issue in rule_issues[:5]:
        file_path = issue.get('component', '').split(':')[-1]
        line = issue.get('line', 'N/A')
        story_content += f"- `{file_path}:{line}`\n"

    if len(rule_issues) > 5:
        story_content += f"\n... and {len(rule_issues) - 5} more files\n"

    story_content += f"""
## Notes

This is a low-priority issue that can be addressed during:
- Code cleanup sprints
- Maintenance windows
- When working on related files

Not urgent, but good to address for long-term code health.

---

*Auto-generated by sonarcloud-to-atlas.sh on {datetime.now().strftime('%Y-%m-%d')}*
"""

    with open(story_file, 'w') as f:
        f.write(story_content)

    created_stories.append({'id': story_id, 'file': story_file, 'count': len(rule_issues)})
    print(f"  ✅ Created: {story_id} ({len(rule_issues)} instances)")

# Save summary
with open('/tmp/sonar-created-stories.json', 'w') as f:
    json.dump(created_stories, f, indent=2)

print(f"\n✅ Created {len(created_stories)} new tech debt stories")
PYTHON_SCRIPT

    echo -e "${GREEN}✅ Tech debt stories created${NC}"
else
    echo -e "${GREEN}✅ No new medium/low issues - no tech debt stories needed${NC}"
fi

echo ""

# ============================================================================
# PHASE 6: SUMMARY AND NEXT STEPS
# ============================================================================

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}Summary & Next Steps${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${BLUE}📊 Processing Summary:${NC}"
echo ""
echo -e "${RED}Critical Issues: $CRITICAL_COUNT total, $CRITICAL_NEW need action${NC}"
echo -e "${YELLOW}High Priority:   $HIGH_COUNT total, $HIGH_NEW need action${NC}"
echo -e "${CYAN}Medium Priority: $MEDIUM_COUNT total, $MEDIUM_NEW need stories${NC}"
echo -e "${GREEN}Low Priority:    $LOW_COUNT total, $LOW_NEW need stories${NC}"
echo ""

if [ -f "/tmp/sonar-created-stories.json" ]; then
    STORIES_CREATED=$(cat /tmp/sonar-created-stories.json | jq 'length')
    echo -e "${GREEN}✅ Created $STORIES_CREATED new tech debt stories${NC}"
    echo ""
fi

echo -e "${BLUE}📁 Files Generated:${NC}"
echo "  - /tmp/sonar-categorized.json (all issues categorized)"
echo "  - /tmp/sonar-needs-stories.json (issues needing action)"
if [ -f "atlas/prompts/SONARCLOUD_AUTO_FIXES.md" ]; then
    echo "  - atlas/prompts/SONARCLOUD_AUTO_FIXES.md (Atlas workflow prompt)"
fi
if [ -f "/tmp/sonar-created-stories.json" ]; then
    echo "  - processes/backlog/TD-SONAR-*.md (tech debt stories)"
fi
echo ""

echo -e "${YELLOW}🚀 Next Steps:${NC}"
echo ""

if [ "$CRITICAL_NEW" -gt "0" ] || [ "$HIGH_NEW" -gt "0" ]; then
    echo -e "${RED}1. IMMEDIATE: Fix Critical/High Issues${NC}"
    echo "   Execute the auto-generated Atlas workflow:"
    echo "   ${CYAN}cat atlas/prompts/SONARCLOUD_AUTO_FIXES.md${NC}"
    echo ""
    echo "   Or use in your development session:"
    echo "   ${CYAN}# Claude, please execute the workflow in atlas/prompts/SONARCLOUD_AUTO_FIXES.md${NC}"
    echo ""
fi

if [ "$MEDIUM_NEW" -gt "0" ] || [ "$LOW_NEW" -gt "0" ]; then
    echo -e "${YELLOW}2. LATER: Review Tech Debt Stories${NC}"
    echo "   Check created stories in: processes/backlog/"
    echo "   Add to backlog: processes/BACKLOG.md"
    echo ""
fi

echo -e "${GREEN}3. MONITOR: Run this automation regularly${NC}"
echo "   Add to cron or run before deployments:"
echo "   ${CYAN}./scripts/sonarcloud-to-atlas.sh${NC}"
echo ""

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ SonarCloud to Atlas Automation Complete!${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

exit 0
