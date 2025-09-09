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

## ✅ DEPLOYMENT CHECKLIST

Before running `./scripts/deploy-qual.sh`, ensure:

- [ ] All code changes are complete
- [ ] No uncommitted changes (`git status` is clean)
- [ ] Release notes updated in `docs/RELEASE_NOTES.md`
- [ ] Version entry matches what will be deployed (YYYY.MM.DD.BUILD format)
- [ ] ESLint has no errors (`npm run lint`)
- [ ] TypeScript has no errors (`npm run typecheck`)
- [ ] No critical security vulnerabilities (`npm audit`)
- [ ] Less than 20 TODOs in src/
- [ ] Less than 5 console.logs in src/

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

## DEPLOYMENT SCRIPT FEATURES

The `deploy-qual.sh` script performs these steps in order:

1. Check for uncommitted changes
2. Validate release notes are updated
3. Run ESLint (no errors allowed)
4. Run TypeScript checks
5. Run security audit
6. Check TODO and console.log counts
7. Build the project
8. Commit with release notes title
9. Push to GitHub
10. Clean QUAL directory
11. Deploy via rsync
12. Deploy API with permissions
13. Run health checks

**Every step must pass. There are no shortcuts.**

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