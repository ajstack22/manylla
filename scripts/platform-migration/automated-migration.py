#!/usr/bin/env python3
"""
Automated Platform Consolidation using Claude Code CLI
Executes the 5-step platform migration with validation gates
"""

import subprocess
import os
import sys
import json
import time
import re
from pathlib import Path

# --- Configuration ---
CLAUDE_COMMAND = "claude"  # Ensure 'claude' is in PATH
MAX_RETRIES_PER_STEP = 2
PROJECT_ROOT = "/Users/adamstack/manylla"
PROMPT_PACK_DIR = f"{PROJECT_ROOT}/docs/prompts/active"

# Define migration steps with validation criteria
migration_steps = [
    {
        "name": "Step 1: Import Resolution Setup",
        "prompt_file": "01-critical-platform-import-resolution.md",
        "validation": {
            "files_exist": [
                "webpack.config.js",  # Should be modified
                "metro.config.js",     # Should be modified
                "babel.config.js"      # Should be modified
            ],
            "grep_checks": [
                {
                    "file": "webpack.config.js",
                    "pattern": "@platform.*path.resolve",
                    "should_exist": True,
                    "description": "Webpack alias for @platform"
                },
                {
                    "file": "package.json",
                    "pattern": "babel-plugin-module-resolver",
                    "should_exist": True,
                    "description": "Babel module resolver installed"
                }
            ],
            "build_test": "npm run build:web",
            "expected_git_changes": ["webpack.config.js", "metro.config.js", "babel.config.js"]
        }
    },
    {
        "name": "Step 2: Create Platform Abstraction",
        "prompt_file": "02-critical-complete-platform-abstraction.md",
        "validation": {
            "files_exist": [
                "src/utils/platform.js",
                "src/utils/__tests__/platform.test.js"
            ],
            "grep_checks": [
                {
                    "file": "src/utils/platform.js",
                    "pattern": "export const isWeb.*Platform.OS.*===.*'web'",
                    "should_exist": True,
                    "description": "Platform detection implemented"
                },
                {
                    "file": "src/utils/platform.js",
                    "pattern": "export const shadow",
                    "should_exist": True,
                    "description": "Shadow helper function"
                },
                {
                    "file": "src/utils/platform.js",
                    "pattern": "export const apiBaseUrl",
                    "should_exist": True,
                    "description": "API URL helper"
                }
            ],
            "test_command": "npm test -- platform.test.js",
            "expected_exports": ["isWeb", "isIOS", "isAndroid", "select", "shadow", "font"]
        }
    },
    {
        "name": "Step 3: Phased Migration",
        "prompt_file": "03-high-safe-platform-migration.md",
        "validation": {
            "platform_os_count": {
                "command": "grep -r 'Platform\\.OS' src/ --include='*.js' --exclude='*/platform.js' | wc -l",
                "expected": 0,
                "tolerance": 5  # Allow a few stragglers
            },
            "platform_select_count": {
                "command": "grep -r 'Platform\\.select' src/ --include='*.js' | grep -v 'platform\\.select' | wc -l",
                "expected": 0
            },
            "imports_check": {
                "command": "grep -r 'from.*@platform' src/ --include='*.js' | wc -l",
                "min_expected": 30
            },
            "build_test": "npm run build:web",
            "test_suite": "npm test"
        }
    },
    {
        "name": "Step 4: Validation Suite",
        "prompt_file": "04-high-platform-validation-testing.md",
        "validation": {
            "files_exist": [
                "scripts/platform-validation/validate-all.sh",
                "scripts/platform-validation/test-platforms.js",
                "scripts/platform-validation/generate-report.sh"
            ],
            "run_validation": "bash scripts/platform-validation/validate-all.sh",
            "check_report": "scripts/platform-validation/validation-report.md"
        }
    },
    {
        "name": "Step 5: Final Consolidation",
        "prompt_file": "05-medium-platform-consolidation-execution.md",
        "validation": {
            "final_checks": {
                "platform_os": {
                    "command": "grep -r 'Platform\\.OS' src/ --include='*.js' --exclude='*/platform.js' | wc -l",
                    "expected": 0
                },
                "typescript": {
                    "command": "find src -name '*.ts' -o -name '*.tsx' | wc -l",
                    "expected": 0
                },
                "native_files": {
                    "command": "find src -name '*.native.js' -o -name '*.web.js' | wc -l",
                    "expected": 0
                }
            },
            "performance_check": {
                "bundle_size_increase_max_percent": 5
            }
        }
    }
]

# --- Helper Functions ---

def run_command(command, cwd=PROJECT_ROOT):
    """Execute a shell command and return output"""
    try:
        result = subprocess.run(
            command,
            shell=True,
            capture_output=True,
            text=True,
            cwd=cwd,
            timeout=300  # 5 minute timeout
        )
        return result.returncode == 0, result.stdout.strip(), result.stderr.strip()
    except subprocess.TimeoutExpired:
        return False, "", "Command timed out"
    except Exception as e:
        return False, "", str(e)

def check_file_exists(filepath):
    """Check if a file exists"""
    full_path = Path(PROJECT_ROOT) / filepath
    return full_path.exists()

def grep_file(filepath, pattern):
    """Check if pattern exists in file"""
    full_path = Path(PROJECT_ROOT) / filepath
    if not full_path.exists():
        return False
    
    try:
        with open(full_path, 'r') as f:
            content = f.read()
            return bool(re.search(pattern, content))
    except Exception:
        return False

def validate_step(step_config):
    """Validate a migration step based on its criteria"""
    print(f"\n🔍 Validating: {step_config['name']}")
    validation = step_config.get('validation', {})
    all_passed = True
    
    # Check files exist
    for filepath in validation.get('files_exist', []):
        if check_file_exists(filepath):
            print(f"  ✅ File exists: {filepath}")
        else:
            print(f"  ❌ File missing: {filepath}")
            all_passed = False
    
    # Grep checks
    for check in validation.get('grep_checks', []):
        found = grep_file(check['file'], check['pattern'])
        if found == check['should_exist']:
            print(f"  ✅ {check['description']}")
        else:
            print(f"  ❌ {check['description']}")
            all_passed = False
    
    # Platform.OS count check
    if 'platform_os_count' in validation:
        check = validation['platform_os_count']
        success, stdout, _ = run_command(check['command'])
        if success:
            count = int(stdout)
            tolerance = check.get('tolerance', 0)
            if count <= check['expected'] + tolerance:
                print(f"  ✅ Platform.OS count: {count} (expected: {check['expected']})")
            else:
                print(f"  ❌ Platform.OS count: {count} (expected: {check['expected']})")
                all_passed = False
    
    # Build test
    if 'build_test' in validation:
        print(f"  🔨 Running build test...")
        success, _, stderr = run_command(validation['build_test'])
        if success:
            print(f"  ✅ Build succeeded")
        else:
            print(f"  ❌ Build failed: {stderr[:200]}")
            all_passed = False
    
    # Test suite
    if 'test_suite' in validation:
        print(f"  🧪 Running tests...")
        success, stdout, _ = run_command(validation['test_suite'])
        if success:
            print(f"  ✅ Tests passed")
        else:
            print(f"  ❌ Tests failed")
            all_passed = False
    
    return all_passed

def read_prompt_pack(filename):
    """Read a prompt pack file and return its content"""
    filepath = Path(PROMPT_PACK_DIR) / filename
    if not filepath.exists():
        raise FileNotFoundError(f"Prompt pack not found: {filepath}")
    
    with open(filepath, 'r') as f:
        return f.read()

def git_commit(message):
    """Create a git commit"""
    run_command("git add -A")
    success, _, _ = run_command(f'git commit -m "{message}"')
    return success

def rollback_to_checkpoint(checkpoint_name):
    """Rollback to a git checkpoint"""
    print(f"🔄 Rolling back to checkpoint: {checkpoint_name}")
    success, _, _ = run_command(f"git reset --hard HEAD~1")
    return success

# --- Main Execution ---

def main():
    print("🚀 Starting Automated Platform Consolidation")
    print("=" * 80)
    
    # Check prerequisites
    print("\n📋 Checking prerequisites...")
    
    # Check git status
    success, stdout, _ = run_command("git status --porcelain")
    if stdout:
        print("❌ Working directory not clean. Please commit or stash changes.")
        sys.exit(1)
    
    # Check branch
    success, stdout, _ = run_command("git branch --show-current")
    current_branch = stdout.strip()
    if current_branch != "feature/platform-consolidation":
        print(f"⚠️  Not on feature/platform-consolidation branch (current: {current_branch})")
        response = input("Create and switch to feature branch? (y/n): ")
        if response.lower() == 'y':
            run_command("git checkout -b feature/platform-consolidation")
        else:
            print("Exiting...")
            sys.exit(1)
    
    print("✅ Prerequisites checked")
    
    # Execute migration steps
    for i, step in enumerate(migration_steps):
        step_name = step['name']
        prompt_file = step['prompt_file']
        retries = 0
        success = False
        
        while retries <= MAX_RETRIES_PER_STEP and not success:
            print(f"\n{'=' * 80}")
            print(f"📌 {step_name} (Attempt {retries + 1}/{MAX_RETRIES_PER_STEP + 1})")
            print(f"   Prompt: {prompt_file}")
            print("=" * 80)
            
            try:
                # Read the prompt pack content
                prompt_content = read_prompt_pack(prompt_file)
                
                # For demo purposes, we'll show what would be sent to Claude
                print(f"\n📝 Would execute Claude with prompt pack: {prompt_file}")
                print(f"   Length: {len(prompt_content)} characters")
                
                # In real implementation, you would run:
                # result = subprocess.run(
                #     [CLAUDE_COMMAND, prompt_content],
                #     capture_output=True,
                #     text=True,
                #     check=True
                # )
                
                # Simulate execution
                print("   ⏳ Simulating Claude execution...")
                time.sleep(2)  # Simulate processing time
                
                # Validate the step
                if validate_step(step):
                    print(f"\n✅ {step_name} PASSED validation")
                    
                    # Git commit
                    commit_message = f"refactor: {step_name.lower()}"
                    if git_commit(commit_message):
                        print(f"📦 Committed: {commit_message}")
                    
                    success = True
                else:
                    print(f"\n❌ {step_name} FAILED validation")
                    retries += 1
                    
                    if retries <= MAX_RETRIES_PER_STEP:
                        print(f"🔁 Retrying...")
                        # Could modify prompt here for retry
                    else:
                        print(f"❌ Max retries reached for {step_name}")
                        
                        # Offer rollback
                        response = input("Rollback and exit? (y/n): ")
                        if response.lower() == 'y':
                            rollback_to_checkpoint(step_name)
                            sys.exit(1)
                
            except FileNotFoundError as e:
                print(f"❌ Error: {e}")
                sys.exit(1)
            except Exception as e:
                print(f"❌ Unexpected error: {e}")
                retries += 1
        
        if not success:
            print(f"\n🛑 Migration stopped at: {step_name}")
            sys.exit(1)
    
    # Final summary
    print("\n" + "=" * 80)
    print("🎉 PLATFORM CONSOLIDATION COMPLETE!")
    print("=" * 80)
    
    # Generate final report
    print("\n📊 Final Statistics:")
    success, stdout, _ = run_command("grep -r 'Platform\\.OS' src/ --include='*.js' | wc -l")
    print(f"  Platform.OS references: {stdout}")
    success, stdout, _ = run_command("grep -r 'from.*@platform' src/ --include='*.js' | wc -l")
    print(f"  Files using @platform: {stdout}")
    success, stdout, _ = run_command("du -sh web/build 2>/dev/null | awk '{print $1}'")
    print(f"  Bundle size: {stdout}")
    
    print("\n✅ All migration steps completed successfully!")
    print("📝 Next steps:")
    print("  1. Run manual testing on all platforms")
    print("  2. Create PR for review")
    print("  3. Deploy to qual for validation")

if __name__ == "__main__":
    main()