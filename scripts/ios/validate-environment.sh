#!/bin/bash

# Manylla iOS Environment Validation Script
# Validates development environment for iOS builds
# Created: 2025-01-14

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔧 Validating iOS Development Environment${NC}"
echo "=============================================="

# Initialize counters
PASSED=0
FAILED=0

# Helper function for checks
check_requirement() {
    local name=$1
    local command=$2
    local expected=$3

    echo -n "   • $name: "

    if eval "$command" >/dev/null 2>&1; then
        if [ -n "$expected" ]; then
            local result=$(eval "$command" 2>/dev/null)
            if echo "$result" | grep -q "$expected"; then
                echo -e "${GREEN}✅ PASS${NC}"
                ((PASSED++))
                return 0
            else
                echo -e "${RED}❌ FAIL${NC} (Expected: $expected)"
                ((FAILED++))
                return 1
            fi
        else
            echo -e "${GREEN}✅ PASS${NC}"
            ((PASSED++))
            return 0
        fi
    else
        echo -e "${RED}❌ FAIL${NC}"
        ((FAILED++))
        return 1
    fi
}

echo ""
echo -e "${YELLOW}📱 Xcode Environment${NC}"

# Check Xcode installation
check_requirement "Xcode installed" "xcode-select -p"

# Check Xcode version
if command -v xcodebuild >/dev/null 2>&1; then
    XCODE_VERSION=$(xcodebuild -version | head -n 1 | sed 's/Xcode //')
    echo -n "   • Xcode version ($XCODE_VERSION): "
    # Check if version is 15.0 or higher
    if [[ $(echo "$XCODE_VERSION 15.0" | tr " " "\n" | sort -V | tail -1) == "$XCODE_VERSION" ]]; then
        echo -e "${GREEN}✅ PASS${NC} (>= 15.0)"
        ((PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC} (Need >= 15.0, found $XCODE_VERSION)"
        ((FAILED++))
    fi
else
    echo -e "   • Xcode version: ${RED}❌ FAIL${NC} (xcodebuild not found)"
    ((FAILED++))
fi

# Check command line tools
check_requirement "Command Line Tools" "xcode-select --install 2>&1 | grep -E '(already installed|install requested)'"

# Check iOS Simulator
check_requirement "iOS Simulator" "xcrun simctl list devices | grep -E 'iPhone|iPad'"

echo ""
echo -e "${YELLOW}🔨 Build Tools${NC}"

# Check CocoaPods
if command -v pod >/dev/null 2>&1; then
    POD_VERSION=$(pod --version)
    echo -e "   • CocoaPods: ${GREEN}✅ PASS${NC} ($POD_VERSION)"
    ((PASSED++))
else
    echo -e "   • CocoaPods: ${RED}❌ FAIL${NC} (Run: gem install cocoapods)"
    ((FAILED++))
fi

# Check Node.js
if command -v node >/dev/null 2>&1; then
    NODE_VERSION=$(node --version)
    echo -e "   • Node.js: ${GREEN}✅ PASS${NC} ($NODE_VERSION)"
    ((PASSED++))
else
    echo -e "   • Node.js: ${RED}❌ FAIL${NC}"
    ((FAILED++))
fi

# Check npm
if command -v npm >/dev/null 2>&1; then
    NPM_VERSION=$(npm --version)
    echo -e "   • npm: ${GREEN}✅ PASS${NC} ($NPM_VERSION)"
    ((PASSED++))
else
    echo -e "   • npm: ${RED}❌ FAIL${NC}"
    ((FAILED++))
fi

echo ""
echo -e "${YELLOW}📱 iOS Project Status${NC}"

# Check project root
PROJECT_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$PROJECT_ROOT"

# Check iOS project exists
check_requirement "iOS project exists" "test -d ios/ManyllaMobile.xcodeproj"

# Check iOS workspace
check_requirement "iOS workspace exists" "test -d ios/ManyllaMobile.xcworkspace"

# Check Podfile
check_requirement "Podfile exists" "test -f ios/Podfile"

# Check if pods are installed
if [ -f "ios/Podfile.lock" ] && [ -d "ios/Pods" ]; then
    echo -e "   • CocoaPods installed: ${GREEN}✅ PASS${NC}"
    ((PASSED++))
else
    echo -e "   • CocoaPods installed: ${YELLOW}⚠️  NEED INSTALL${NC} (Run: cd ios && pod install)"
    # Don't count as failure, just needs setup
fi

# Check React Native CLI
if command -v npx >/dev/null 2>&1; then
    if npx react-native --version >/dev/null 2>&1; then
        RN_VERSION=$(npx react-native --version | head -1)
        echo -e "   • React Native CLI: ${GREEN}✅ PASS${NC} ($RN_VERSION)"
        ((PASSED++))
    else
        echo -e "   • React Native CLI: ${YELLOW}⚠️  WARN${NC} (Install: npm install -g @react-native-community/cli)"
    fi
else
    echo -e "   • React Native CLI: ${RED}❌ FAIL${NC} (npx not available)"
    ((FAILED++))
fi

echo ""
echo -e "${YELLOW}🔐 Code Signing${NC}"

# Check security command (for keychain access)
check_requirement "Security framework" "command -v security"

# Check for signing identities
if security find-identity -v -p codesigning 2>/dev/null | grep -q "iPhone"; then
    CERT_COUNT=$(security find-identity -v -p codesigning 2>/dev/null | grep "iPhone" | wc -l)
    echo -e "   • Signing certificates: ${GREEN}✅ PASS${NC} ($CERT_COUNT found)"
    ((PASSED++))
else
    echo -e "   • Signing certificates: ${YELLOW}⚠️  WARN${NC} (No iPhone certificates found)"
    echo -e "     ${YELLOW}Note: You'll need Apple Developer certificates for device builds${NC}"
fi

# Check Apple Developer membership (indirect check)
if [ -d "$HOME/Library/MobileDevice/Provisioning Profiles" ]; then
    PROFILE_COUNT=$(ls "$HOME/Library/MobileDevice/Provisioning Profiles" 2>/dev/null | wc -l)
    if [ "$PROFILE_COUNT" -gt 0 ]; then
        echo -e "   • Provisioning profiles: ${GREEN}✅ PASS${NC} ($PROFILE_COUNT found)"
        ((PASSED++))
    else
        echo -e "   • Provisioning profiles: ${YELLOW}⚠️  WARN${NC} (No profiles found)"
    fi
else
    echo -e "   • Provisioning profiles: ${YELLOW}⚠️  WARN${NC} (Directory doesn't exist)"
fi

echo ""
echo -e "${YELLOW}🚀 Build Test${NC}"

# Quick build test (if environment looks good)
if [ "$FAILED" -eq 0 ]; then
    echo "   • Testing iOS build..."
    cd ios
    if xcodebuild -list -workspace ManyllaMobile.xcworkspace >/dev/null 2>&1; then
        echo -e "   • Xcode project valid: ${GREEN}✅ PASS${NC}"
        ((PASSED++))
    else
        echo -e "   • Xcode project valid: ${RED}❌ FAIL${NC}"
        ((FAILED++))
    fi
    cd ..
else
    echo -e "   • Build test: ${YELLOW}⚠️  SKIPPED${NC} (Fix environment issues first)"
fi

echo ""
echo "=============================================="
echo -e "${BLUE}📊 Environment Validation Results${NC}"
echo ""

if [ "$FAILED" -eq 0 ]; then
    echo -e "${GREEN}✅ ENVIRONMENT READY${NC}"
    echo -e "   Passed: $PASSED checks"
    echo -e "   Failed: $FAILED checks"
    echo ""
    echo -e "${GREEN}Your iOS development environment is ready for Manylla builds!${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. ./scripts/ios/build-ios.sh debug    # Test debug build"
    echo "  2. ./scripts/ios/run-ios.sh            # Run on simulator"
    echo "  3. ./scripts/ios/setup-certificates.sh # Configure signing"
    exit 0
else
    echo -e "${RED}❌ ENVIRONMENT ISSUES FOUND${NC}"
    echo -e "   Passed: $PASSED checks"
    echo -e "   Failed: $FAILED checks"
    echo ""
    echo -e "${YELLOW}Please fix the issues above before proceeding.${NC}"
    echo ""
    echo "Common fixes:"
    echo "  • Install Xcode from App Store"
    echo "  • Run: xcode-select --install"
    echo "  • Install CocoaPods: gem install cocoapods"
    echo "  • Run: cd ios && pod install"
    echo "  • Join Apple Developer Program for certificates"
    exit 1
fi