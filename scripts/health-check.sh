#!/bin/bash

# Quick health check for Manylla development environment
# Run time: < 3 seconds

echo "🏥 Manylla Health Check"
echo "======================="

# Check Node version
NODE_VERSION=$(node --version)
REQUIRED_NODE="16"
if [[ "$NODE_VERSION" < "v$REQUIRED_NODE" ]]; then
    echo "❌ Node version $NODE_VERSION (requires v$REQUIRED_NODE+)"
else
    echo "✅ Node version: $NODE_VERSION"
fi

# Check npm version
NPM_VERSION=$(npm --version)
echo "✅ npm version: $NPM_VERSION"

# Check if port 3000 is available
if lsof -i :3000 > /dev/null 2>&1; then
    echo "⚠️  Port 3000 is in use (dev server may be running)"
else
    echo "✅ Port 3000 is available"
fi

# Check git status
MODIFIED_FILES=$(git status --porcelain 2>/dev/null | wc -l)
if [ "$MODIFIED_FILES" -gt 0 ]; then
    echo "📝 $MODIFIED_FILES uncommitted changes"
else
    echo "✅ Working directory clean"
fi

# Check if node_modules exists
if [ -d "node_modules" ]; then
    MODULE_COUNT=$(ls node_modules | wc -l)
    echo "✅ Dependencies installed ($MODULE_COUNT packages)"
else
    echo "❌ Dependencies not installed (run: npm install)"
fi

# Check if build exists
if [ -d "web/build" ]; then
    BUILD_TIME=$(stat -f "%Sm" -t "%Y-%m-%d %H:%M" web/build/index.html 2>/dev/null || stat -c "%y" web/build/index.html 2>/dev/null | cut -d' ' -f1,2)
    echo "✅ Build exists (last: $BUILD_TIME)"
else
    echo "ℹ️  No build found (run: npm run build:web)"
fi

# Check disk space
DISK_USAGE=$(df -h . | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt 90 ]; then
    echo "⚠️  Disk usage high: ${DISK_USAGE}%"
else
    echo "✅ Disk usage: ${DISK_USAGE}%"
fi

# Check API health (if server is supposed to be up)
if curl -s --max-time 2 https://manylla.com/qual/api/sync_health.php > /dev/null 2>&1; then
    echo "✅ API endpoint reachable"
else
    echo "ℹ️  API endpoint not responding (may be expected)"
fi

echo "======================="
echo "Health check complete!"