# Manylla Deployment Process v3
*Last Updated: September 9, 2025*

## Overview
This document describes the complete deployment process for Manylla to the qual (staging) environment. Version 3 includes critical fixes for build directory paths and .htaccess configuration.

## Prerequisites

### SSH Configuration
Ensure you have the following in your `~/.ssh/config`:
```
Host stackmap-cpanel
  HostName 199.188.200.57
  Port 21098
  User stachblx
  IdentityFile ~/.ssh/id_rsa_cpanel
```

### Directory Structure
- **Build Output**: `web/build/` (NOT `build/`)
- **Deployment Target**: `~/public_html/manylla/qual/`
- **API Location**: `~/public_html/manylla/qual/api/`

## Critical Files

### 1. `.htaccess` Configuration
**IMPORTANT**: Manylla requires its own .htaccess file with correct paths.

Location: `public/.htaccess.manylla-qual`
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /manylla/qual/
  
  # Handle share routes explicitly - always send to React app
  RewriteRule ^share/.*$ /manylla/qual/index.html [L]
  
  # Handle sync routes explicitly - always send to React app  
  RewriteRule ^sync/.*$ /manylla/qual/index.html [L]
  
  # Don't rewrite files or directories (except share and sync)
  RewriteCond %{REQUEST_FILENAME} -f [OR]
  RewriteCond %{REQUEST_FILENAME} -d
  RewriteRule ^ - [L]
  
  # Rewrite everything else to /manylla/qual/index.html
  RewriteRule ^ /manylla/qual/index.html [L]
</IfModule>
```

### 2. Webpack Configuration
Output directory in `webpack.config.js`:
```javascript
output: {
  path: path.resolve(__dirname, 'web/build'),
  filename: 'bundle.[contenthash].js',
  publicPath: process.env.NODE_ENV === 'production' ? './' : '/',
  clean: true,
}
```

## Deployment Script

### Primary Method: `./scripts/deploy-qual.sh`
This is the **ONLY** approved method for deployment to qual.

### Script Phases

#### Phase 1: Pre-Commit Validation
- Uncommitted changes check
- Release notes validation
- Code formatting (Prettier)
- License compliance
- Security vulnerability scan
- ESLint check
- TypeScript check
- Code quality metrics
  - TODO count (max 20)
  - Console.log count (max 5)
  - No debugger statements
- Dependency analysis

#### Phase 2: Version Update & Commit
- Updates package.json version
- Commits changes with release notes title
- Pushes to GitHub

#### Phase 3: Web Deployment
- Builds application with `npm run build:web`
- Deploys from `web/build/` to server
- Deploys correct .htaccess file
- Deploys API if exists
- Runs health check

### Common Issues and Fixes

#### Issue 1: HTTP 403 Forbidden
**Cause**: Wrong .htaccess file deployed
**Fix**: Deploy `public/.htaccess.manylla-qual` instead of `public/.htaccess.qual`

#### Issue 2: No index.html on server
**Cause**: Deploying from wrong directory (`build/` instead of `web/build/`)
**Fix**: Update rsync command to use `web/build/`

#### Issue 3: Script exits early
**Cause**: grep commands returning exit code 1 when no matches found
**Fix**: Add `|| true` to grep commands in script

## Manual Deployment Commands

If you need to manually deploy specific components:

### Deploy built files:
```bash
rsync -avz --delete \
  --exclude='.git' \
  --exclude='node_modules' \
  --exclude='.env' \
  web/build/ stackmap-cpanel:~/public_html/manylla/qual/
```

### Deploy .htaccess:
```bash
scp public/.htaccess.manylla-qual stackmap-cpanel:~/public_html/manylla/qual/.htaccess
```

### Deploy API:
```bash
rsync -avz api/ stackmap-cpanel:~/public_html/manylla/qual/api/ \
  --exclude='config/local.php' \
  --exclude='*.log'
```

## Build Commands

### Development Build:
```bash
npm run web
```

### Production Build:
```bash
NODE_OPTIONS=--max-old-space-size=8192 npm run build:web
```

## Verification

After deployment, verify:

1. **Main site accessible**: https://manylla.com/qual/
2. **API health check**: https://manylla.com/qual/api/health.php
3. **Check console for errors**: Open browser developer tools
4. **Test category system**: Verify 6 simplified categories are working
5. **Test demo mode**: Check that Ellie's demo profile loads correctly

## Rollback Procedure

If deployment fails:

1. Check out previous version:
   ```bash
   git checkout HEAD~1
   ```

2. Rebuild:
   ```bash
   NODE_OPTIONS=--max-old-space-size=8192 npm run build:web
   ```

3. Deploy manually:
   ```bash
   rsync -avz web/build/ stackmap-cpanel:~/public_html/manylla/qual/
   scp public/.htaccess.manylla-qual stackmap-cpanel:~/public_html/manylla/qual/.htaccess
   ```

## Important Notes

1. **Never bypass the deployment script** for production deployments
2. **Always update release notes** before deploying
3. **The build directory is `web/build/`**, not `build/`
4. **Use `.htaccess.manylla-qual`**, not `.htaccess.qual`
5. **All validation checks must pass** before deployment proceeds

## Recent Changes (v2025.09.09.3)

- Fixed deployment script to use correct build directory (`web/build/`)
- Created proper .htaccess file for Manylla (`public/.htaccess.manylla-qual`)
- Added error handling for grep commands in deployment script
- Simplified categories from 13 to 6
- Fixed TypeScript errors from Quick Info refactoring