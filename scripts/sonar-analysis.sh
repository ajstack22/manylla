#!/bin/bash

# SonarCloud Analysis Script for Manylla
# Run code quality analysis and send results to SonarCloud

set -e  # Exit on error

echo "🔍 SonarCloud Code Quality Analysis"
echo "===================================="

# Check if sonar-scanner is installed
if ! command -v sonar-scanner &> /dev/null; then
    echo "❌ sonar-scanner is not installed"
    echo "Please install with: npm install -g sonarqube-scanner"
    exit 1
fi

# Check if SONAR_TOKEN is set
if [ -z "$SONAR_TOKEN" ]; then
    echo "⚠️  Warning: SONAR_TOKEN environment variable is not set"
    echo ""
    echo "To set it up:"
    echo "1. Go to https://sonarcloud.io"
    echo "2. Sign in with GitHub"
    echo "3. Go to: My Account > Security > Generate Token"
    echo "4. Add to ~/.zshrc or ~/.bash_profile:"
    echo "   export SONAR_TOKEN='your-token-here'"
    echo "5. Run: source ~/.zshrc"
    echo ""
    echo "For now, you can run with:"
    echo "SONAR_TOKEN='your-token' npm run sonar"
    exit 1
fi

# Run tests with coverage first
echo ""
echo "📊 Generating test coverage..."
npm run test:coverage

# Check if coverage was generated
if [ ! -f "coverage/lcov.info" ]; then
    echo "⚠️  Warning: Coverage file not found"
    echo "SonarCloud analysis will proceed without coverage data"
fi

# Run SonarCloud analysis
echo ""
echo "☁️  Sending analysis to SonarCloud..."
sonar-scanner \
  -Dsonar.token="$SONAR_TOKEN" \
  -Dsonar.projectVersion="$(git rev-parse --short HEAD 2>/dev/null || echo 'unknown')"

# Check if analysis succeeded
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ SonarCloud analysis completed successfully!"
    echo ""
    echo "📊 View results at:"
    echo "   https://sonarcloud.io/project/overview?id=manylla"
    echo ""
    echo "Quality Gate Status:"
    echo "   https://sonarcloud.io/summary/overall?id=manylla"
else
    echo ""
    echo "❌ SonarCloud analysis failed"
    echo "Check the error messages above"
    exit 1
fi