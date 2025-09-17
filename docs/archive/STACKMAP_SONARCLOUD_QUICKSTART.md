# ⚡ StackMap SonarCloud Quick Start (5 Minutes)

## 1️⃣ Create Config File (in StackMap root)
```bash
cat > sonar-project.properties << 'EOF'
sonar.organization=ajstack22
sonar.projectKey=ajstack22_stackmap
sonar.projectName=StackMap
sonar.sources=src
sonar.host.url=https://sonarcloud.io
sonar.javascript.lcov.reportPaths=coverage/lcov.info
sonar.exclusions=**/node_modules/**,**/build/**,**/*.test.js
EOF
```

## 2️⃣ Create Analysis Script
```bash
cat > scripts/sonar-analysis.sh << 'EOF'
#!/bin/bash
set -e
echo "🔍 SonarCloud Analysis for StackMap"

if [ -z "$SONAR_TOKEN" ]; then
    source ~/.manylla-env 2>/dev/null || {
        echo "❌ SONAR_TOKEN not set"
        exit 1
    }
fi

sonar-scanner -Dsonar.token="$SONAR_TOKEN"
echo "✅ View results: https://sonarcloud.io/project/overview?id=ajstack22_stackmap"
EOF

chmod +x scripts/sonar-analysis.sh
```

## 3️⃣ Add to package.json
```json
"scripts": {
  "sonar": "./scripts/sonar-analysis.sh"
}
```

## 4️⃣ Add to Deployment Script
```bash
# In your deploy script, add:
source ~/.manylla-env 2>/dev/null

# Then add this step:
echo "Running SonarCloud analysis..."
npm run sonar || echo "⚠️  Analysis failed (continuing)"
```

## 5️⃣ Test It!
```bash
npm run sonar
```

## 🎯 Done!

Your StackMap project now has:
- ✅ Automated code quality analysis
- ✅ UNLIMITED scans (public repo)
- ✅ Security vulnerability detection
- ✅ Technical debt tracking

Dashboard: https://sonarcloud.io/project/overview?id=ajstack22_stackmap

---

### 💡 Pro Tips for StackMap (Public Repo)

Since StackMap is PUBLIC, you can:
1. **Run analysis on EVERY commit** (no limits!)
2. **Enable Automatic Analysis** in SonarCloud settings
3. **Add badges** to your README:
```markdown
[![Quality Gate](https://sonarcloud.io/api/project_badges/measure?project=ajstack22_stackmap&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=ajstack22_stackmap)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=ajstack22_stackmap&metric=coverage)](https://sonarcloud.io/summary/new_code?id=ajstack22_stackmap)
[![Maintainability](https://sonarcloud.io/api/project_badges/measure?project=ajstack22_stackmap&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=ajstack22_stackmap)
```

### 🔄 Copy These Files from Manylla
If you want the advanced features:
- `scripts/sonar-smart.sh` - Analyze only changed files
- `scripts/sonar-quota-check.sh` - Not needed (unlimited!)
- `scripts/quality-gate.sh` - Pre-deployment checks