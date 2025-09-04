# LLM Toolsets & Development Practices

## GitHub Operations

### Repository Information
```bash
# Repository URL
https://github.com/ajstack22/manylla.git

# Clone command
git clone https://github.com/ajstack22/manylla.git

# Default branch: main
```

### Git Workflow Commands
```bash
# Check status
git status

# View recent commits
git log --oneline -10

# Check uncommitted changes
git diff
git diff --stat  # Summary view

# Stage and commit
git add .
git commit -m "Description of changes"

# Push to GitHub
git push origin main

# Pull latest changes
git pull origin main

# Create and switch to new branch
git checkout -b feature/branch-name

# Merge branch
git checkout main
git merge feature/branch-name
```

### GitHub CLI (gh)
```bash
# Create pull request
gh pr create --title "Title" --body "Description"

# View PR comments
gh api repos/ajstack22/manylla/pulls/123/comments

# Create issue
gh issue create --title "Bug report" --body "Details"

# View issues
gh issue list
```

### Commit Message Conventions
```bash
# Format: type: description
feat: add share wizard implementation
fix: resolve demo mode navigation issue
docs: update deployment guide
style: apply consistent modal patterns
refactor: consolidate documentation structure
test: add share dialog tests
chore: update dependencies

# With emoji (if user requests)
✨ feat: add new feature
🐛 fix: resolve bug
📝 docs: update documentation
💄 style: improve UI
♻️ refactor: restructure code
✅ test: add tests
🔧 chore: maintenance tasks
```

## cPanel SSH Access

### Connection Details
```bash
# SSH connection
ssh adam@manylla.com

# Alternative with port (if needed)
ssh -p 22 adam@manylla.com

# With key authentication (recommended)
ssh -i ~/.ssh/id_rsa adam@manylla.com
```

### cPanel File Structure
```bash
/home/stachblx/                    # Home directory
├── public_html/                   # Web root
│   ├── index.html                 # Production frontend
│   ├── static/                    # React build assets
│   ├── api/                       # Production API
│   │   ├── share/                 # Share endpoints
│   │   ├── sync/                  # Sync endpoints
│   │   ├── config.php             # API configuration
│   │   └── .htaccess              # API routing
│   ├── qual/                      # Staging environment
│   │   ├── index.html             # Staging frontend
│   │   ├── static/                # Staging assets
│   │   └── api/                   # Staging API
│   └── .htaccess                  # Main routing rules
├── logs/                          # Log files
│   ├── access.log                 # Apache access log
│   └── error.log                  # Error log
└── backups/                       # Database backups
```

### Common SSH Commands for cPanel
```bash
# Navigate to web root
cd /home/stachblx/public_html

# Check disk usage
df -h
du -sh *

# View error logs
tail -f ~/logs/error.log

# Check running processes
ps aux | grep php
ps aux | grep mysql

# File permissions
chmod 644 file.html  # Standard file
chmod 755 directory/ # Standard directory
chmod 600 config.php # Sensitive config

# Database operations
mysql -u stachblx_manyqual -p stachblx_manylla_sync_qual
mysql -u stachblx_manyprod -p stachblx_manylla_sync_prod

# Create backup
mysqldump -u user -p database > backup.sql

# Restore backup
mysql -u user -p database < backup.sql
```

## Deployment via SSH

### Manual File Transfer
```bash
# Upload single file
scp file.html adam@manylla.com:/home/stachblx/public_html/

# Upload directory
scp -r build/* adam@manylla.com:/home/stachblx/public_html/qual/

# Using rsync (preferred - only transfers changes)
rsync -avz --delete build/ adam@manylla.com:/home/stachblx/public_html/qual/

# Exclude files during sync
rsync -avz --exclude='.git' --exclude='node_modules' ./ adam@manylla.com:/home/stachblx/project/
```

### Deployment Scripts via SSH
```bash
# Make script executable
chmod +x deploy-qual.sh

# Run deployment script locally (it SSHs to server)
./scripts/deploy-qual.sh

# Or run commands directly on server
ssh adam@manylla.com "cd /home/stachblx/public_html && git pull"
```

## Development Tools Setup

### Local Development Environment
```bash
# Required tools
node --version  # Should be >= 18.0.0
npm --version   # Should be >= 9.0.0
git --version   # Should be >= 2.0.0

# VS Code extensions (recommended)
- ESLint
- Prettier
- TypeScript and JavaScript
- Material Icon Theme
- GitLens

# Browser extensions
- React Developer Tools
- Redux DevTools (if using Redux)
```

### Environment Files
```bash
# Local development (.env.local)
REACT_APP_API_URL=http://localhost:3000/api
REACT_APP_SHARE_DOMAIN=http://localhost:3000

# Staging (.env.staging)
REACT_APP_API_URL=https://manylla.com/qual/api
REACT_APP_SHARE_DOMAIN=https://manylla.com/qual

# Production (.env.production)
REACT_APP_API_URL=https://manylla.com/api
REACT_APP_SHARE_DOMAIN=https://manylla.com
```

## Database Access

### cPanel MySQL
```bash
# Access via SSH
mysql -h localhost -u stachblx_manyqual -p

# Common queries
USE stachblx_manylla_sync_qual;
SHOW TABLES;
DESCRIBE sync_groups;
SELECT * FROM share_links WHERE expires_at > NOW();
SELECT COUNT(*) FROM sync_data;

# Export data
SELECT * FROM share_links INTO OUTFILE '/tmp/shares.csv';
```

### phpMyAdmin Access
```
URL: https://manylla.com:2083/
Navigate to: Databases > phpMyAdmin

Databases:
- stachblx_manylla_sync_qual (staging)
- stachblx_manylla_sync_prod (production)
```

## Testing & Debugging

### Local Testing Commands
```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test ShareDialog.test

# Lint code
npm run lint

# Type checking
npx tsc --noEmit

# Bundle analysis
npm run build -- --stats
npx webpack-bundle-analyzer build/bundle-stats.json
```

### Remote Debugging via SSH
```bash
# Check API endpoint
curl -X GET https://manylla.com/api/health.php

# Test with specific headers
curl -H "Content-Type: application/json" \
     -X POST \
     -d '{"test":"data"}' \
     https://manylla.com/api/share/create.php

# Monitor real-time logs
ssh adam@manylla.com "tail -f /home/stachblx/logs/error.log"

# Check PHP errors
ssh adam@manylla.com "grep -i error /home/stachblx/logs/error.log | tail -20"
```

## File Management Best Practices

### For LLMs Working with Files
```bash
# Always check before creating files
ls -la src/components/

# Use descriptive file names
ShareDialogNew.tsx     # Good - indicates it's a new version
sd2.tsx               # Bad - not descriptive

# Follow existing patterns
src/components/[Feature]/[Component].tsx
src/hooks/use[HookName].ts
src/utils/[utilityName].ts

# Check file size before reading
ls -lh large_file.json

# Read specific sections of large files
head -50 file.tsx      # First 50 lines
tail -50 file.tsx      # Last 50 lines
sed -n '100,200p' file # Lines 100-200
```

## Security Practices

### SSH Key Management
```bash
# Generate SSH key
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"

# Add to SSH agent
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_rsa

# Copy public key to server
ssh-copy-id adam@manylla.com

# Test connection
ssh -T adam@manylla.com
```

### Sensitive Data Handling
```bash
# Never commit these files
.env.local
.env.production
config.php
*.key
*.pem

# Check for secrets before committing
git diff --staged | grep -E "(password|secret|token|key|api)" 

# Use environment variables
process.env.REACT_APP_API_KEY  # In React
$_ENV['API_KEY']               # In PHP
```

## Monitoring Commands

### System Status
```bash
# Check server status
ssh adam@manylla.com "uptime"
ssh adam@manylla.com "free -m"
ssh adam@manylla.com "df -h"

# Check Apache status
ssh adam@manylla.com "systemctl status apache2"

# Check MySQL status
ssh adam@manylla.com "systemctl status mysql"
```

### Application Monitoring
```bash
# Check recent API calls
ssh adam@manylla.com "tail -100 /home/stachblx/logs/access.log | grep '/api/'"

# Monitor error rate
ssh adam@manylla.com "grep -c 'ERROR' /home/stachblx/logs/error.log"

# Check response times
ssh adam@manylla.com "grep 'api/share' /home/stachblx/logs/access.log | awk '{print $10}' | sort -n"
```

## Quick Reference for Common Tasks

### Deploy to Qual
```bash
./scripts/deploy-qual.sh
```

### Deploy to Production
```bash
./scripts/deploy-prod.sh
```

### Quick Database Backup
```bash
ssh adam@manylla.com "mysqldump -u stachblx_manyprod -p stachblx_manylla_sync_prod > ~/backups/backup_$(date +%Y%m%d).sql"
```

### Clear React Build Cache
```bash
rm -rf node_modules/.cache
npm run build
```

### Fix Permission Issues
```bash
ssh adam@manylla.com "find /home/stachblx/public_html -type f -exec chmod 644 {} \;"
ssh adam@manylla.com "find /home/stachblx/public_html -type d -exec chmod 755 {} \;"
```

### Emergency Rollback
```bash
# Frontend
ssh adam@manylla.com "cd /home/stachblx/public_html && cp -r qual_backup/* qual/"

# Database
ssh adam@manylla.com "mysql -u stachblx_manyqual -p stachblx_manylla_sync_qual < ~/backups/last_known_good.sql"
```

## LLM-Specific Instructions

When using these tools:

1. **Always verify before destructive operations**
   - Use `git status` before committing
   - Use `--dry-run` with rsync first
   - Check file existence before deleting

2. **Follow the existing patterns**
   - Check how similar operations were done before
   - Maintain consistent file naming
   - Use established deployment scripts

3. **Test locally first**
   - Run build before deploying
   - Test API endpoints with curl
   - Verify database queries work

4. **Document changes**
   - Update DEPLOY_NOTES.md
   - Add comments for complex operations
   - Keep commit messages descriptive

5. **Security awareness**
   - Never expose credentials
   - Use environment variables
   - Check file permissions after deployment