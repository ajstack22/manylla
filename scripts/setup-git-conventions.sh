#!/bin/bash

# Setup Git Commit Conventions for Manylla/StackMap Projects
# This script configures git to use our commit conventions

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "🔧 Setting up Git commit conventions..."

# Set up commit template
if [ -f "$PROJECT_ROOT/.gitmessage" ]; then
    git config --local commit.template .gitmessage
    echo "✅ Commit template configured"
else
    echo "⚠️  .gitmessage file not found, skipping template setup"
fi

# Set up useful aliases for common commit types
echo "📝 Setting up git aliases..."

git config --local alias.feat '!f() { git commit -m "feat($1): $2"; }; f'
git config --local alias.fix '!f() { git commit -m "fix($1): $2"; }; f'
git config --local alias.docs '!f() { git commit -m "docs($1): $2"; }; f'
git config --local alias.chore '!f() { git commit -m "chore($1): $2"; }; f'
git config --local alias.refactor '!f() { git commit -m "refactor($1): $2"; }; f'
git config --local alias.style '!f() { git commit -m "style($1): $2"; }; f'
git config --local alias.test '!f() { git commit -m "test($1): $2"; }; f'
git config --local alias.perf '!f() { git commit -m "perf($1): $2"; }; f'

echo "✅ Git aliases configured"

# Show quick reference
echo ""
echo "📋 Quick Reference:"
echo "  Use 'git commit' to open editor with template"
echo "  Or use aliases for quick commits:"
echo ""
echo "  git feat sync 'add retry logic for network failures'"
echo "  git fix ios 'resolve header overlap on iPhone 14 Pro'"
echo "  git docs readme 'update deployment instructions'"
echo "  git chore deps 'update Material-UI to v7.0.1'"
echo ""
echo "  See processes/GIT_COMMIT_CONVENTIONS.md for full details"
echo ""

# Optional: Show current git config
echo "📊 Current git commit configuration:"
git config --local --get commit.template || echo "  No commit template set"
echo ""
echo "🎯 Aliases configured:"
git config --local --get-regexp alias.feat || true
git config --local --get-regexp alias.fix || true
git config --local --get-regexp alias.docs || true

echo ""
echo "✨ Git conventions setup complete!"