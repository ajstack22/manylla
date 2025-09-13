# 🚨 DEPLOYMENT RULES - CRITICAL

## THE ONLY WAY TO DEPLOY TO QUAL

```bash
./scripts/deploy-qual.sh
```

## ❌ NEVER DO ANY OF THESE:
1. **DO NOT** run `npm run deploy:qual` 
2. **DO NOT** manually rsync or scp files to the server
3. **DO NOT** create alternative deployment scripts
4. **DO NOT** skip validation checks
5. **DO NOT** deploy with uncommitted changes
6. **DO NOT** deploy without updating release notes
7. **DO NOT** bypass lint, TypeScript, or security errors
8. **DO NOT** attempt workarounds when deployment fails

## ✅ ENHANCED PRE-COMMIT VALIDATION

The deployment script now performs ALL validation BEFORE any commits:

### Phase 1: Pre-Commit Validation (ALL must pass)
- [ ] No uncommitted changes (`git status` is clean)
- [ ] Release notes updated in `docs/RELEASE_NOTES.md`
- [ ] Code formatting check (Prettier)
- [ ] License compliance check
- [ ] No critical security vulnerabilities (`npm audit`)
- [ ] ESLint has no errors
- [ ] TypeScript has no errors
- [ ] Less than 20 TODOs in src/
- [ ] Less than 5 console.logs in src/
- [ ] No debugger statements
- [ ] No hardcoded secrets
- [ ] Unused dependencies check
- [ ] Circular dependencies check
- [ ] Bundle size analysis

## WHEN DEPLOYMENT FAILS

If the deployment script fails:

1. **READ THE ERROR MESSAGE CAREFULLY**
2. **DO NOT BYPASS THE CHECK**
3. **FIX THE ACTUAL ISSUE**
4. **Report to the user exactly what failed**
5. **Request human review if needed**

## WHY THESE RULES EXIST

1. **Quality Assurance**: Every deployment must meet quality standards
2. **Traceability**: All deployments must be documented in release notes
3. **Security**: No vulnerable code should reach production
4. **Consistency**: Same process every time prevents mistakes
5. **Auditability**: Git history shows what was deployed when

## DEPLOYMENT SCRIPT PHASES

The enhanced `deploy-qual.sh` script now has 4 distinct phases:

### Phase 1: Pre-Commit Validation (BEFORE any commits)
1. Check for uncommitted changes
2. Validate release notes
3. Code formatting check (Prettier)
4. License compliance check
5. Security vulnerability scan
6. ESLint check
7. TypeScript check
8. Code quality metrics (TODOs, console.logs, debugger)
9. Dependency analysis (unused, circular, duplicates)
10. Bundle size pre-check

### Phase 2: Version & Commit (ONLY if all validation passes)
1. Update version in package.json
2. Commit changes with release notes title (follows convention: `v<version>: <title>`)
3. Push to GitHub
   - See `processes/GIT_COMMIT_CONVENTIONS.md` for commit standards

### Phase 3: Web Deployment (FASTEST - happens first)
1. Build web application
2. Deploy to qual server
3. Run health checks
4. Immediate validation available

### Phase 4: Mobile Deployment (OPTIONAL)
1. Deploy to running iOS simulators
2. Deploy to connected Android devices
3. Open qual URL in simulator Safari

**Every validation must pass BEFORE code reaches GitHub. There are no shortcuts.**

## FOR AI ASSISTANTS

When asked to deploy:
1. Always use `./scripts/deploy-qual.sh`
2. Never create workarounds
3. Report failures exactly as shown
4. Do not attempt to fix deployment script checks
5. If deployment fails, help fix the underlying issue, not bypass the check

## ENFORCEMENT

The deployment script includes:
- **Error messages that explicitly say "DO NOT bypass"**
- **Removal of all partial deployment options**
- **No skip flags or shortcuts**
- **Required release notes validation**
- **Post-deployment health checks**

This is the way. There is no other way.