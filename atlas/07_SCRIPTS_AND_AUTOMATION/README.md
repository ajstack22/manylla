# Atlas Scripts for Claude Code

All scripts in this directory are designed to be executed by Claude Code. They generate structured prompts that leverage Claude's capabilities including TodoWrite, Task tool, parallel execution, and careful reasoning.

## Available Scripts

### 1. `adversarial_workflow.py`
Execute the complete adversarial peer review workflow for a story.

**Usage:**
```bash
# Run complete workflow with Claude
python adversarial_workflow.py stories/S001.md --claude

# Run specific role
python adversarial_workflow.py stories/S001.md --role pm
python adversarial_workflow.py stories/S001.md --role developer
python adversarial_workflow.py stories/S001.md --role reviewer
```

**What it does:**
- PM validates story requirements
- Developer implements with evidence
- Peer Reviewer performs adversarial review
- Integration merges approved changes

### 2. `create_story.py`
Generate prompts for Claude to create well-formed stories.

**Usage:**
```bash
# Create different story types
python create_story.py feature    # User story
python create_story.py bug        # Bug report
python create_story.py epic       # High-level epic
python create_story.py interactive # Guided session
```

**What it does:**
- Provides templates for different story types
- Ensures consistent story format
- Guides through requirements gathering
- Creates testable acceptance criteria

### 3. `troubleshoot.py`
Systematic bug troubleshooting workflow.

**Usage:**
```bash
# Run complete troubleshooting workflow
python troubleshoot.py "path/to/bug-story.md" --claude

# Run specific phase
python troubleshoot.py "path/to/bug-story.md" --phase 1
```

**Phases:**
1. Reproduction - Reproduce the exact issue
2. Diagnosis - Identify root causes
3. Hypothesis Testing - Test potential fixes
4. Implementation - Apply the fix
5. Verification - Confirm resolution

### 4. `update_repository.py`
Update repository documentation and presentation.

**Usage:**
```bash
# Run complete repository update workflow
python update_repository.py --claude
```

**What it does:**
- Audits current repository state
- Plans content strategy
- Creates compelling README
- Updates all documentation
- Optimizes GitHub settings

## How Claude Code Uses These Scripts

1. **User runs a script** with `--claude` flag
2. **Script generates comprehensive prompts** with:
   - Clear role definition
   - TodoWrite integration for task tracking
   - Task tool usage for parallel research
   - Specific Claude trigger words ("think carefully", "research extensively")
   - Structured workflow phases
3. **Claude executes the workflow** systematically
4. **State is saved** in `.atlas/` for continuity

## Key Design Principles

### 1. Prompt Engineering
- Use Claude's native capabilities (TodoWrite, Task, parallel execution)
- Include trigger phrases for deep thinking
- Structure prompts for systematic execution

### 2. Role-Based Execution
- Each script can assume different roles (PM, Developer, Reviewer)
- Roles have distinct responsibilities and perspectives
- Adversarial roles ensure quality

### 3. Evidence-Based Workflow
- Every action requires evidence
- Screenshots, test results, metrics
- Documentation of decisions

### 4. State Management
- Scripts save state to `.atlas/` directories
- Workflows can be resumed
- Progress is tracked

## Adding New Scripts

When creating new scripts for Claude Code:

1. **Generate prompts, not execute code**
   ```python
   def generate_prompt():
       return """
       Use the TodoWrite tool to track tasks...
       Use the Task tool for parallel research...
       Think very carefully about...
       """
   ```

2. **Include Claude triggers**
   - "Use the TodoWrite tool"
   - "Use the Task tool with general-purpose agent"
   - "Research extensively using Grep and Glob"
   - "Think very carefully"
   - "Run these IN PARALLEL"

3. **Structure for systematic execution**
   - Clear phases or stages
   - Explicit success criteria
   - Verification steps

4. **Save state for continuity**
   ```python
   state = {
       'phase': current_phase,
       'status': status,
       'timestamp': datetime.now()
   }
   ```

## Example: Creating a New Script

```python
#!/usr/bin/env python3
"""
My New Atlas Script for Claude Code
"""

class MyWorkflow:
    def generate_claude_prompt(self):
        return """
        ===== MY WORKFLOW =====

        Use the TodoWrite tool immediately to track:
        1. First task
        2. Second task
        3. Third task

        Use the Task tool to research IN PARALLEL:
        - Research task 1
        - Research task 2

        Think very carefully about:
        - Important consideration 1
        - Important consideration 2

        [Detailed instructions...]
        """

    def run(self, mode='claude'):
        if mode == 'claude':
            print(self.generate_claude_prompt())
```

## Integration with Atlas Framework

These scripts work with the broader Atlas framework:
- **Roles** defined in `02_ROLES/`
- **Standards** enforced from `01_STANDARDS_AND_AGREEMENTS/`
- **Stories** created in `09_STORIES/`
- **State** saved in `.atlas/`

All scripts respect the Atlas core principles:
- Quality Over Speed
- Evidence-Based Development
- Elimination Over Addition
- Prevention Over Correction
- Clarity Over Cleverness
