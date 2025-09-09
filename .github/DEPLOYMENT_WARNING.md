# ⛔ DEPLOYMENT WARNING

## DO NOT CREATE GITHUB ACTIONS FOR DEPLOYMENT

All deployments to QUAL must go through the local validation script:

```bash
./scripts/deploy-qual.sh
```

This ensures:
- Release notes are updated
- All validation checks pass
- Human review before deployment
- Proper error handling

## DO NOT CREATE:
- Auto-deployment workflows
- CI/CD pipelines that bypass checks
- Alternative deployment methods
- Shortcuts or workarounds

The deployment script is intentionally local-only to maintain control and quality.