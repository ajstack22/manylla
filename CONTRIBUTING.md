# Contributing to Manylla

Thank you for your interest in contributing to Manylla! We're building software that makes a real difference in the lives of special needs families, and we welcome your help.

## 🌟 Our Mission

Manylla helps families organize and protect their most sensitive information. Every contribution should align with our core values:
- **Privacy First** - User data security is non-negotiable
- **Accessibility** - Software that works for everyone
- **Reliability** - Families depend on us during critical moments
- **Simplicity** - Complex problems, simple solutions

## 📋 Before You Begin

1. **Read the Documentation**
   - [README.md](README.md) - Project overview
   - [TEAM_AGREEMENTS.md](docs/TEAM_AGREEMENTS.md) - Critical development standards
   - [ARCHITECTURE.md](docs/ARCHITECTURE.md) - System design

2. **Check Existing Work**
   - [BACKLOG.md](processes/BACKLOG.md) - Current priorities
   - [GitHub Issues](https://github.com/yourusername/manylla/issues) - Open tasks
   - [Pull Requests](https://github.com/yourusername/manylla/pulls) - Work in progress

## 🚀 Getting Started

### Development Setup

```bash
# 1. Fork and clone the repository
git clone https://github.com/yourusername/manylla.git
cd manylla

# 2. Install dependencies
npm install

# 3. iOS setup (Mac only)
cd ios && pod install && cd ..

# 4. Run development server
npm run web  # For web development
# or
npx react-native run-ios  # For iOS
# or
npx react-native run-android  # For Android
```

### Development Workflow

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow existing code patterns
   - Write/update tests
   - Update documentation

3. **Test thoroughly**
   ```bash
   npm test                # Run tests
   npm run lint           # Check code style
   npm run typecheck      # TypeScript validation
   ./scripts/deploy-qual.sh --dry-run  # Validate deployment
   ```

4. **Commit with conventional commits**
   ```bash
   git commit -m "feat: add profile export functionality"
   # See processes/GIT_COMMIT_CONVENTIONS.md for format
   ```

5. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

## 📝 Coding Standards

### General Principles
- **No TypeScript** - We use JavaScript with JSDoc comments
- **Single file pattern** - Follow the App.js architecture
- **Platform-specific code** - Use `.native.js` and `.web.js` extensions
- **Zero-knowledge security** - Never compromise encryption

### Code Style
```javascript
// Good: Clear, simple, documented
/**
 * Encrypts profile data before storage
 * @param {Object} profile - Profile data to encrypt
 * @returns {string} Encrypted data string
 */
function encryptProfile(profile) {
  // Implementation
}

// Bad: Unclear, complex, undocumented
function enc(p) { /* mystery code */ }
```

### Testing Requirements
- Minimum 30% code coverage
- Test critical paths thoroughly
- Include error cases
- Mock external dependencies

### Commit Message Format
```
type: subject (max 50 chars)

Body (optional): Explain what and why, not how
- Use bullet points for multiple changes
- Reference issue numbers: Fixes #123

Co-authored-by: Name <email>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

## 🐛 Reporting Issues

### Before Creating an Issue
1. Search existing issues
2. Check you're on the latest version
3. Verify it's reproducible

### Issue Template
```markdown
### Description
Clear description of the issue

### Steps to Reproduce
1. Go to...
2. Click on...
3. See error...

### Expected Behavior
What should happen

### Actual Behavior
What actually happens

### Environment
- Platform: [iOS/Android/Web]
- Version: [e.g., 2025.09.14]
- Device: [e.g., iPhone 14]
```

## 🎯 What We're Looking For

### High Priority Contributions
- 🔒 **Security improvements** - Encryption, privacy features
- ♿ **Accessibility enhancements** - Screen readers, keyboard navigation
- 🐛 **Bug fixes** - Especially data integrity issues
- 📱 **Mobile optimizations** - Performance, offline capabilities
- 📚 **Documentation** - User guides, API docs

### Good First Issues
Look for issues labeled `good-first-issue` - these are:
- Well-defined scope
- Minimal prerequisites
- Good learning opportunities

## 🚫 What We Won't Accept

- Features that compromise user privacy
- Dependencies with restrictive licenses (GPL, AGPL, LGPL)
- Code without tests
- Breaking changes without migration paths
- Commits directly to main branch

## 🔄 Pull Request Process

1. **Before Submitting**
   - ✅ All tests pass
   - ✅ Lint checks pass
   - ✅ Documentation updated
   - ✅ Commit messages follow convention
   - ✅ Branch is up-to-date with main

2. **PR Template**
   ```markdown
   ### What does this PR do?
   Brief description

   ### Why is this needed?
   Problem it solves or feature it adds

   ### How to test
   Steps for reviewers to test

   ### Screenshots (if UI changes)
   Before/after images

   ### Checklist
   - [ ] Tests added/updated
   - [ ] Documentation updated
   - [ ] No console.logs left
   - [ ] Follows team agreements
   ```

3. **Review Process**
   - Automated checks must pass
   - Code review by maintainer
   - Testing in staging environment
   - Approval and merge

## 🎓 Learning Resources

- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [TweetNaCl.js](https://github.com/dchest/tweetnacl-js) - Our encryption library
- [Material-UI](https://mui.com/) - Web UI components
- [Team Learnings](atlas/05_LEARNINGS/) - Lessons from our team

## 💬 Communication

- **GitHub Issues** - Bug reports, feature requests
- **GitHub Discussions** - Questions, ideas, community chat
- **Pull Requests** - Code reviews and implementation discussion

## 🙏 Recognition

Contributors are recognized in:
- Release notes
- Contributors file
- Project documentation

## ❓ Questions?

If something isn't clear, please:
1. Check the [documentation](docs/)
2. Search [existing issues](https://github.com/yourusername/manylla/issues)
3. Ask in [GitHub Discussions](https://github.com/yourusername/manylla/discussions)

---

Thank you for helping us build better software for special needs families! 💙