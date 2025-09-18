#!/usr/bin/env python3
"""
Atlas Troubleshooting Framework
Drop this into any project and run: python atlas/troubleshoot.py path/to/bug-story.md
"""

import sys
import os
import re
import json
from pathlib import Path
from datetime import datetime

class BugTroubleshooter:
    def __init__(self, bug_story_path):
        self.bug_story_path = Path(bug_story_path)
        self.bug_data = self.parse_bug_story()
        self.state_dir = Path('.atlas/troubleshooting')
        self.state_dir.mkdir(parents=True, exist_ok=True)

    def parse_bug_story(self):
        """Parse the markdown bug story into structured data"""
        with open(self.bug_story_path, 'r') as f:
            content = f.read()

        bug = {
            'id': self.extract_bug_id(content),
            'severity': self.extract_field(content, 'Severity'),
            'priority': self.extract_field(content, 'Priority'),
            'status': self.extract_field(content, 'Status'),
            'description': self.extract_section(content, 'Description'),
            'steps_to_reproduce': self.extract_section(content, 'Steps to Reproduce'),
            'expected_behavior': self.extract_section(content, 'Expected Behavior'),
            'actual_behavior': self.extract_section(content, 'Actual Behavior'),
            'environment': self.extract_section(content, 'Environment'),
            'error_logs': self.extract_code_blocks(content, 'Error Messages/Logs'),
            'root_cause_analysis': self.extract_section(content, 'Root Cause Analysis'),
            'proposed_fixes': self.extract_section(content, 'Proposed Fix'),
            'verification_steps': self.extract_code_blocks(content, 'Verification Steps'),
            'acceptance_criteria': self.extract_checklist(content, 'Acceptance Criteria'),
            'related_files': self.extract_files(content)
        }
        return bug

    def extract_bug_id(self, content):
        """Extract bug ID from filename or content"""
        # Try filename first
        filename = self.bug_story_path.stem
        match = re.search(r'B\d+', filename)
        if match:
            return match.group()
        # Fall back to content
        match = re.search(r'\*Bug ID:\s*(B\d+)\*', content)
        return match.group(1) if match else 'UNKNOWN'

    def extract_field(self, content, field_name):
        """Extract a field value like Severity: Critical"""
        pattern = rf'\*\*{field_name}\*\*:\s*(\S+)'
        match = re.search(pattern, content)
        return match.group(1) if match else 'Unknown'

    def extract_section(self, content, section_name):
        """Extract content under a ## Section header"""
        pattern = rf'## {section_name}\s*\n(.*?)(?=\n## |\Z)'
        match = re.search(pattern, content, re.DOTALL)
        return match.group(1).strip() if match else ''

    def extract_code_blocks(self, content, section_name):
        """Extract code blocks from a section"""
        section = self.extract_section(content, section_name)
        code_blocks = re.findall(r'```(?:\w+)?\n(.*?)\n```', section, re.DOTALL)
        return '\n'.join(code_blocks)

    def extract_checklist(self, content, section_name):
        """Extract checklist items from a section"""
        section = self.extract_section(content, section_name)
        items = re.findall(r'- \[([ x])\] (.+)', section)
        return [{'checked': x == 'x', 'item': item} for x, item in items]

    def extract_files(self, content):
        """Extract file paths mentioned in the content"""
        # Look for paths starting with / or containing /
        paths = re.findall(r'`([/\w\-\.]+/[\w\-\.]+)`', content)
        return list(set(paths))

    def generate_phase_1_reproduction(self):
        """Generate Claude prompt for reproduction phase"""
        return f"""
===== TROUBLESHOOTING {self.bug_data['id']}: PHASE 1 - REPRODUCTION =====

Severity: {self.bug_data['severity']} | Priority: {self.bug_data['priority']} | Status: {self.bug_data['status']}

OBJECTIVE: Reproduce the exact issue described in the bug report.

Use the TodoWrite tool to track these steps:
1. Set up environment matching bug report
2. Follow reproduction steps exactly
3. Document actual behavior
4. Capture error logs and screenshots
5. Confirm reproduction success/failure

ENVIRONMENT TO MATCH:
{self.bug_data['environment']}

STEPS TO REPRODUCE:
{self.bug_data['steps_to_reproduce']}

EXPECTED BEHAVIOR:
{self.bug_data['expected_behavior']}

REPORTED ACTUAL BEHAVIOR:
{self.bug_data['actual_behavior']}

KNOWN ERROR MESSAGES:
```
{self.bug_data['error_logs']}
```

RELATED FILES TO EXAMINE:
{chr(10).join('- ' + f for f in self.bug_data['related_files'])}

INSTRUCTIONS:
1. First, use the Task tool with general-purpose agent to research the codebase and understand the current implementation
2. Set up the exact environment specified
3. Execute each reproduction step carefully
4. Use Bash commands IN PARALLEL to gather diagnostic information
5. Document whether you can reproduce the issue exactly as described

Think very carefully: Are you seeing the EXACT same issue? If not, what's different?
"""

    def generate_phase_2_diagnosis(self):
        """Generate Claude prompt for diagnosis phase"""
        return f"""
===== TROUBLESHOOTING {self.bug_data['id']}: PHASE 2 - DIAGNOSIS =====

The issue has been reproduced. Now we need to identify the root cause.

Use the TodoWrite tool to track diagnostic steps:
1. Analyze error messages and stack traces
2. Investigate recent code changes
3. Check system dependencies and configurations
4. Review related component interactions
5. Identify potential root causes

ROOT CAUSE ANALYSIS FROM REPORT:
{self.bug_data['root_cause_analysis']}

PROPOSED FIXES TO INVESTIGATE:
{self.bug_data['proposed_fixes']}

DIAGNOSTIC TASKS:
Use the Task tool to launch multiple agents IN PARALLEL:

1. Error Analysis Agent:
   - Deep dive into the error messages
   - Search for similar errors in codebase
   - Check if error handling is missing

2. Code History Agent:
   - Find when this last worked (git log)
   - Identify recent changes to related files
   - Check for dependency updates

3. Configuration Agent:
   - Verify all configuration files
   - Check environment-specific settings
   - Look for missing or incorrect configs

Research extensively using Grep and Glob IN PARALLEL:
- Search for all occurrences of the error message keywords
- Find all files that import or use the affected components
- Look for similar patterns that might have the same issue

Think VERY carefully about the symptoms:
- Why would {self.bug_data['description'][:200]}...
- What system component is failing?
- Is this a regression or a new issue?
"""

    def generate_phase_3_hypothesis(self):
        """Generate Claude prompt for hypothesis testing"""
        return f"""
===== TROUBLESHOOTING {self.bug_data['id']}: PHASE 3 - HYPOTHESIS TESTING =====

Based on diagnosis, we'll systematically test potential fixes.

Use the TodoWrite tool to create a hypothesis test plan:
1. List each hypothesis to test
2. Design minimal test for each
3. Execute tests one at a time
4. Document results
5. Identify working solution

PROPOSED FIXES FROM BUG REPORT:
{self.bug_data['proposed_fixes']}

HYPOTHESIS TESTING PROTOCOL:
For EACH potential fix:
1. State the hypothesis clearly
2. Make ONLY the minimal change needed to test it
3. Run these verification steps:
```
{self.bug_data['verification_steps']}
```
4. Document: FIXED, PARTIAL, NO_CHANGE, or WORSE
5. Revert if not successful
6. Move to next hypothesis

IMPORTANT:
- Test ONE change at a time
- Always revert failed attempts
- Keep detailed notes on what you tried
- Think scientifically - isolate variables

After finding a working hypothesis, think carefully:
- Does this fix the root cause or just mask symptoms?
- Could this break anything else?
- Is there a better solution?
"""

    def generate_phase_4_implementation(self):
        """Generate Claude prompt for implementation phase"""
        return f"""
===== TROUBLESHOOTING {self.bug_data['id']}: PHASE 4 - IMPLEMENTATION =====

We've identified the fix. Now implement it properly.

Use the TodoWrite tool to track implementation:
1. Create fix branch
2. Implement the complete solution
3. Add tests to prevent regression
4. Update documentation
5. Verify all acceptance criteria

ACCEPTANCE CRITERIA TO MEET:
{chr(10).join(f"{'✓' if ac['checked'] else '☐'} {ac['item']}" for ac in self.bug_data['acceptance_criteria'])}

IMPLEMENTATION CHECKLIST:
1. Create branch: fix/{self.bug_data['id'].lower()}-{self.bug_data['severity'].lower()}
2. Implement the verified fix comprehensively
3. Add unit tests covering the bug scenario
4. Add integration tests if applicable
5. Update any affected documentation
6. Run full test suite
7. Verify on all affected platforms

VERIFICATION REQUIRED:
Before marking complete, you MUST:
- Run all original reproduction steps and confirm they pass
- Check every acceptance criterion
- Run existing test suite to ensure no regressions
- Document the fix with before/after evidence

Think carefully about edge cases:
- What related code might have the same issue?
- Should this fix be applied elsewhere?
- Have we addressed the root cause, not just symptoms?
"""

    def generate_phase_5_verification(self):
        """Generate Claude prompt for final verification"""
        return f"""
===== TROUBLESHOOTING {self.bug_data['id']}: PHASE 5 - VERIFICATION =====

Final verification before closing the bug.

Use the TodoWrite tool for final checklist:
1. Re-test original reproduction steps
2. Verify all acceptance criteria
3. Run regression tests
4. Document the resolution
5. Update bug status

FINAL VERIFICATION CHECKLIST:
Run these tests IN PARALLEL using Bash:
- Original reproduction steps (should now pass)
- Full test suite
- Platform-specific tests
- Performance benchmarks

ACCEPTANCE CRITERIA VERIFICATION:
Verify EACH criterion is met:
{chr(10).join(f"☐ {ac['item']}" for ac in self.bug_data['acceptance_criteria'])}

DOCUMENTATION REQUIREMENTS:
Create a resolution summary including:
1. Root cause identified
2. Fix implemented
3. Tests added
4. Verification completed
5. Lessons learned

Only after ALL checks pass:
1. Update bug story with resolution
2. Mark status as RESOLVED
3. Add fix version and date
4. Document any follow-up tasks

IMPORTANT: Do NOT close this bug unless you have concrete evidence that every acceptance criterion is met.
"""

    def save_state(self, phase, status):
        """Save current troubleshooting state"""
        state = {
            'bug_id': self.bug_data['id'],
            'phase': phase,
            'status': status,
            'timestamp': datetime.now().isoformat(),
            'bug_file': str(self.bug_story_path)
        }
        state_file = self.state_dir / f"{self.bug_data['id']}_state.json"
        with open(state_file, 'w') as f:
            json.dump(state, f, indent=2)

    def generate_claude_instructions(self):
        """Generate initial instructions for Claude Code"""
        return f"""
===== ATLAS TROUBLESHOOTING FRAMEWORK =====
Bug ID: {self.bug_data['id']} | Severity: {self.bug_data['severity']} | Priority: {self.bug_data['priority']}

You will now work through a systematic troubleshooting process with 5 phases.
Each phase builds on the previous one. Complete each phase thoroughly before moving to the next.

IMPORTANT INSTRUCTIONS:
1. Use the TodoWrite tool immediately to track all phases
2. Work through each phase sequentially
3. Document all findings and evidence
4. Use Task tool agents for parallel research
5. Think carefully and be systematic

After reading these instructions, begin with Phase 1.
"""

    def generate_all_phases(self):
        """Generate all phases for Claude to work through"""
        output = []
        output.append(self.generate_claude_instructions())
        output.append("\n" + "="*70 + "\n")

        # Phase 1
        output.append(self.generate_phase_1_reproduction())
        output.append("\nWhen Phase 1 is complete, continue to Phase 2.")
        output.append("\n" + "="*70 + "\n")

        # Phase 2
        output.append(self.generate_phase_2_diagnosis())
        output.append("\nWhen diagnosis is complete, continue to Phase 3.")
        output.append("\n" + "="*70 + "\n")

        # Phase 3
        output.append(self.generate_phase_3_hypothesis())
        output.append("\nOnce you've identified a working fix, continue to Phase 4.")
        output.append("\n" + "="*70 + "\n")

        # Phase 4
        output.append(self.generate_phase_4_implementation())
        output.append("\nAfter implementation, continue to Phase 5 for final verification.")
        output.append("\n" + "="*70 + "\n")

        # Phase 5
        output.append(self.generate_phase_5_verification())
        output.append("\n" + "="*70 + "\n")

        output.append("""
FINAL INSTRUCTIONS:
After completing all phases, provide a summary of:
1. Root cause identified
2. Fix implemented
3. Verification results
4. Any remaining issues or follow-up tasks

Remember: Be thorough, systematic, and document everything.
""")

        return '\n'.join(output)

    def run(self, phase=None, mode='interactive'):
        """Run the troubleshooting workflow"""
        phases = {
            1: ('Reproduction', self.generate_phase_1_reproduction),
            2: ('Diagnosis', self.generate_phase_2_diagnosis),
            3: ('Hypothesis Testing', self.generate_phase_3_hypothesis),
            4: ('Implementation', self.generate_phase_4_implementation),
            5: ('Verification', self.generate_phase_5_verification)
        }

        if mode == 'claude':
            # Generate all phases for Claude Code to work through
            print(self.generate_all_phases())
            self.save_state(1, 'started')
        elif phase:
            if phase in phases:
                name, generator = phases[phase]
                self.save_state(phase, 'in_progress')
                print(generator())
            else:
                print(f"Invalid phase: {phase}. Use 1-5.")
        else:
            # Start from phase 1 in interactive mode
            self.save_state(1, 'in_progress')
            print(self.generate_phase_1_reproduction())
            print("\n" + "="*70)
            print("After completing this phase, run:")
            print(f"  python {sys.argv[0]} {sys.argv[1]} --phase 2")
            print("="*70)

def main():
    if len(sys.argv) < 2:
        print("Usage: python troubleshoot.py <bug-story.md> [options]")
        print("Options:")
        print("  --phase N    Run specific phase (1-5)")
        print("  --claude     Generate all phases for Claude Code")
        print("Example: python troubleshoot.py 'Stories/B010-React Native.md' --claude")
        sys.exit(1)

    bug_story_path = sys.argv[1]

    if not os.path.exists(bug_story_path):
        print(f"Error: Bug story file not found: {bug_story_path}")
        sys.exit(1)

    phase = None
    mode = 'interactive'

    # Parse command line arguments
    if len(sys.argv) > 2:
        if sys.argv[2] == '--claude':
            mode = 'claude'
        elif sys.argv[2] == '--phase' and len(sys.argv) > 3:
            phase = int(sys.argv[3])

    troubleshooter = BugTroubleshooter(bug_story_path)
    troubleshooter.run(phase, mode)

if __name__ == "__main__":
    main()