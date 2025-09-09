# Scripts Directory

## 🚨 CRITICAL: Deployment Script

### deploy-qual.sh
**This is the ONLY approved method to deploy to QUAL environment.**

Usage:
```bash
./scripts/deploy-qual.sh
```

This script:
- Validates all code quality checks
- Requires updated release notes
- Builds and tests the project
- Commits changes with proper versioning
- Deploys to qual environment
- Runs post-deployment health checks

**DO NOT:**
- Create alternative deployment scripts
- Modify this script to bypass checks
- Use any other deployment method

### Other Scripts

- `setup-ssh.sh` - Configure SSH for deployment
- `deploy-api-config.sh` - Deploy API configuration
- `apply-schema-qual.sh` - Apply database schema to qual
- `deploy-prod.sh` - Production deployment (use with extreme caution)

## Important Notes

1. All deployment scripts require clean git status
2. Release notes must be updated before deployment
3. All validation checks must pass
4. No workarounds or bypasses are acceptable

If a deployment fails, fix the underlying issue, don't bypass the check.