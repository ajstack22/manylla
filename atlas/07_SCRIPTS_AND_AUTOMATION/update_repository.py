#!/usr/bin/env python3
"""
Atlas Repository Update Workflow
Structured conversation with Product Strategist to systematically update repository content
Usage: python update_repository.py [--claude]
"""

import sys
import os
import json
from pathlib import Path
from datetime import datetime

class RepositoryUpdater:
    def __init__(self):
        self.state_dir = Path('.atlas/repository_update')
        self.state_dir.mkdir(parents=True, exist_ok=True)
        self.repo_data = self.analyze_repository()

    def analyze_repository(self):
        """Analyze current repository state"""
        repo = {
            'has_readme': os.path.exists('README.md'),
            'has_license': os.path.exists('LICENSE'),
            'has_contributing': os.path.exists('CONTRIBUTING.md'),
            'has_code_of_conduct': os.path.exists('CODE_OF_CONDUCT.md'),
            'has_docs_dir': os.path.isdir('docs'),
            'has_examples': os.path.isdir('examples'),
            'has_gh_actions': os.path.isdir('.github/workflows'),
            'has_issues_templates': os.path.isdir('.github/ISSUE_TEMPLATE'),
            'git_exists': os.path.isdir('.git')
        }
        return repo

    def generate_product_strategist_conversation(self):
        """Generate structured conversation flow for repository updates"""
        return f"""
===== ATLAS REPOSITORY UPDATE WORKFLOW =====
Role: PRODUCT STRATEGIST

You will now guide a systematic repository update through a structured conversation.
This process ensures all public-facing content tells a cohesive, compelling story.

IMPORTANT INSTRUCTIONS:
1. Use the TodoWrite tool IMMEDIATELY to track all update tasks
2. Use the Task tool for parallel research when needed
3. Think carefully about user experience and first impressions
4. Document all decisions and rationale

Current Repository Analysis:
- README exists: {self.repo_data['has_readme']}
- LICENSE exists: {self.repo_data['has_license']}
- CONTRIBUTING guide exists: {self.repo_data['has_contributing']}
- Documentation directory exists: {self.repo_data['has_docs_dir']}
- Examples directory exists: {self.repo_data['has_examples']}

======================================================================
PHASE 1: DISCOVERY & AUDIT
======================================================================

First, let's understand what we're working with.

Use the Task tool with general-purpose agent to research IN PARALLEL:
1. Analyze current README.md structure and content
2. Review all existing documentation
3. Examine code structure and key features
4. Check current GitHub repository settings (if accessible)

Then answer these strategic questions:
1. What does this product DO? (one sentence)
2. WHO is the target user?
3. WHY should they care? (what problem does it solve?)
4. HOW is it different from alternatives?
5. WHAT is the current onboarding experience like?

Research extensively using Grep and Glob to find:
- All markdown files
- Configuration files that might need documentation
- Example files or test cases that could become examples
- Any existing documentation patterns

Think very carefully about the user journey:
- What would a first-time visitor need to know?
- What questions would they have?
- What would make them want to use this?

======================================================================
PHASE 2: CONTENT STRATEGY
======================================================================

Based on the discovery, we'll plan the content updates.

Use TodoWrite to create tasks for each content piece:

## README.md Structure
The README is your product's front door. It needs:

1. **Hero Section** (Above the fold)
   - Product name and tagline (what it does in 5-10 words)
   - Brief value proposition (1-2 sentences on WHY use this)
   - Quick start or installation (get them using it FAST)
   - Badges (build status, version, license, etc.)

2. **Problem/Solution**
   - What problem does this solve?
   - Who is it for?
   - Key benefits (bullet points)

3. **Features**
   - Core capabilities with brief descriptions
   - Consider using screenshots/GIFs
   - Link to detailed documentation

4. **Getting Started**
   - Prerequisites
   - Installation (multiple methods if applicable)
   - Basic usage example
   - Link to more examples

5. **Documentation**
   - Link to full docs
   - API reference
   - Guides and tutorials

6. **Contributing**
   - How to contribute
   - Development setup
   - Testing guidelines

7. **Support & Community**
   - How to get help
   - Community channels
   - Reporting issues

8. **License & Credits**

## Other Repository Files

Determine what else needs updating:
- CONTRIBUTING.md - contribution guidelines
- CODE_OF_CONDUCT.md - community standards
- .github/ISSUE_TEMPLATE/ - issue templates
- .github/PULL_REQUEST_TEMPLATE.md - PR template
- docs/ - comprehensive documentation
- examples/ - working examples
- CHANGELOG.md - version history
- SECURITY.md - security policy

======================================================================
PHASE 3: CONTENT CREATION
======================================================================

Now we'll create/update the content systematically.

For EACH piece of content:
1. Define the PURPOSE (why does this exist?)
2. Identify the AUDIENCE (who will read this?)
3. Outline the STRUCTURE (what sections are needed?)
4. Write with CLARITY (simple, direct, helpful)
5. Add EXAMPLES where possible
6. Include VISUALS if they help

Writing Guidelines:
- Use active voice
- Keep sentences short and clear
- Lead with benefits, follow with features
- Use examples liberally
- Avoid jargon without explanation
- Be conversational but professional

Think carefully about information architecture:
- Is information easy to find?
- Is there a logical flow?
- Are we answering user questions in order?

======================================================================
PHASE 4: GITHUB OPTIMIZATION
======================================================================

Optimize how the repository appears on GitHub:

Repository Settings to Update:
1. **Description** - Clear, compelling one-liner
2. **Website** - Link to docs or demo
3. **Topics** - Relevant tags for discoverability
4. **Social Preview** - Custom image if applicable

GitHub-Specific Files:
- .github/FUNDING.yml - Sponsorship information
- .github/dependabot.yml - Dependency updates
- .github/workflows/ - CI/CD badges for README

Use the Task tool to research:
- Similar successful repositories
- Current trends in repository presentation
- Best practices for your language/framework

======================================================================
PHASE 5: REVIEW & POLISH
======================================================================

Final review before publishing updates:

Quality Checklist:
□ README answers: What? Why? How? Who?
□ Installation instructions are tested and work
□ Examples run without errors
□ All links are valid
□ Images/GIFs load properly
□ Tone is consistent throughout
□ No typos or grammatical errors
□ Technical claims are accurate
□ Contact/support information is current

User Experience Test:
Imagine you're a new user who just found this repository:
1. Can you understand what it does in 30 seconds?
2. Can you get it running in 5 minutes?
3. Do you know where to get help?
4. Would you want to contribute?

Think VERY carefully:
- Does this tell a compelling story?
- Would YOU use this based on the README?
- What's still confusing or missing?

======================================================================
PHASE 6: IMPLEMENTATION
======================================================================

Execute the updates systematically:

1. Create a branch: update-repository-content
2. Update files in this order:
   - README.md (most important)
   - CONTRIBUTING.md
   - Documentation files
   - GitHub-specific files
   - Examples and demos

3. For each file:
   - Make the changes
   - Preview in GitHub (if possible)
   - Verify all links work
   - Check formatting

4. Create a comprehensive pull request:
   - Title: "Repository Content Update: Improve Documentation and User Experience"
   - List all changes made
   - Include before/after screenshots of README
   - Note any follow-up tasks

======================================================================
FINAL DELIVERABLES
======================================================================

By the end of this workflow, you should have:

1. **Updated README.md** - Compelling, clear, and complete
2. **Contributing Guidelines** - Clear path for contributors
3. **Documentation Structure** - Organized and accessible
4. **GitHub Optimization** - Repository settings and metadata
5. **Examples/Demos** - Working code users can try
6. **Consistent Voice** - All content feels cohesive

Success Metrics:
- New visitors understand the product immediately
- Installation/setup success rate increases
- More contributions and engagement
- Professional, polished appearance
- Clear value proposition

Remember: The goal is to make your repository so clear and compelling that users WANT to use your product and contributors WANT to help build it.
"""

    def save_state(self, phase, status, data=None):
        """Save workflow state"""
        state = {
            'phase': phase,
            'status': status,
            'timestamp': datetime.now().isoformat(),
            'data': data or {}
        }
        state_file = self.state_dir / 'workflow_state.json'
        with open(state_file, 'w') as f:
            json.dump(state, f, indent=2)

    def generate_interactive_prompt(self, phase):
        """Generate prompts for interactive mode"""
        prompts = {
            'discovery': """
DISCOVERY PHASE
Research the repository and answer:
1. What does this product do?
2. Who is the target user?
3. What problem does it solve?
4. What makes it unique?
""",
            'strategy': """
STRATEGY PHASE
Plan which content needs updating:
- README structure
- Documentation organization
- Contributing guidelines
- Examples and demos
""",
            'creation': """
CREATION PHASE
Now create/update the content.
Start with README.md as the highest priority.
""",
            'review': """
REVIEW PHASE
Check all content for:
- Clarity and completeness
- Consistent voice
- Working examples
- Valid links
"""
        }
        return prompts.get(phase, "Invalid phase")

    def run(self, mode='interactive'):
        """Run the repository update workflow"""
        if mode == 'claude':
            # Generate complete workflow for Claude
            print(self.generate_product_strategist_conversation())
            self.save_state('discovery', 'started')
        else:
            # Interactive mode
            print("===== REPOSITORY UPDATE WORKFLOW =====")
            print("\nThis workflow will guide you through systematically updating your repository content.")
            print("\nPhases:")
            print("1. Discovery - Understand current state")
            print("2. Strategy - Plan content updates")
            print("3. Creation - Write/update content")
            print("4. Review - Quality check")
            print("\nRun with --claude flag for Claude Code to execute the complete workflow.")

def main():
    if len(sys.argv) > 1 and sys.argv[1] == '--claude':
        updater = RepositoryUpdater()
        updater.run(mode='claude')
    else:
        updater = RepositoryUpdater()
        updater.run(mode='interactive')

if __name__ == "__main__":
    main()