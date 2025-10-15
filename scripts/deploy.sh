#!/bin/bash

# Manylla Master Deployment Router
# Routes deployments to appropriate tier script
#
# Usage: ./scripts/deploy.sh [TIER]
# Example: ./scripts/deploy.sh stage

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Banner
echo -e "${CYAN}"
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                                                                ║"
echo "║        MANYLLA DEPLOYMENT ROUTER                               ║"
echo "║        Unified Interface for All Deployment Tiers             ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo

# Usage
usage() {
    echo "Usage: ./scripts/deploy.sh [TIER]"
    echo
    echo "Available Tiers:"
    echo "  ${GREEN}qual${NC}   - Deploy to QUAL (development testing)"
    echo "           URL: https://manylla.com/qual/"
    echo "           Frequency: Multiple times per day"
    echo "           Database: qual (shared with STAGE)"
    echo
    echo "  ${YELLOW}stage${NC}  - Deploy to STAGE (internal team validation)"
    echo "           URL: https://manylla.com/stage/"
    echo "           Frequency: 1-2 times per day"
    echo "           Database: qual (shared with QUAL)"
    echo
    echo "  ${RED}prod${NC}   - Deploy to PROD (production release)"
    echo "           URL: https://manylla.com/"
    echo "           Frequency: Weekly or as needed"
    echo "           Database: prod (isolated)"
    echo "           Requires: Team sign-off, 2 confirmations"
    echo
    echo "Examples:"
    echo "  ./scripts/deploy.sh qual"
    echo "  ./scripts/deploy.sh stage"
    echo "  ./scripts/deploy.sh prod"
    echo
    echo "Notes:"
    echo "  - Each tier has its own validation requirements"
    echo "  - PROD deployments require explicit confirmation"
    echo "  - All deployments create automatic backups"
    echo "  - Use scripts/rollback-prod.sh for production rollbacks"
    echo
}

# Get tier argument
TIER="$1"

if [ -z "$TIER" ]; then
    echo -e "${RED}❌ Error: No tier specified${NC}"
    echo
    usage
    exit 1
fi

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Validate tier and route
case "$TIER" in
    qual|QUAL)
        echo -e "${BLUE}📦 Routing to QUAL deployment...${NC}"
        echo -e "${BLUE}   Script: deploy-qual.sh${NC}"
        echo
        exec "$SCRIPT_DIR/deploy-qual.sh"
        ;;

    stage|STAGE)
        echo -e "${YELLOW}📦 Routing to STAGE deployment...${NC}"
        echo -e "${YELLOW}   Script: deploy-stage.sh${NC}"
        echo

        # Check if deploy-stage.sh exists
        if [ ! -f "$SCRIPT_DIR/deploy-stage.sh" ]; then
            echo -e "${RED}❌ Error: deploy-stage.sh not found${NC}"
            echo "   Expected location: $SCRIPT_DIR/deploy-stage.sh"
            echo
            echo "   STAGE deployment script may not be created yet."
            echo "   Please complete Wave 2 of the deployment roadmap."
            exit 1
        fi

        exec "$SCRIPT_DIR/deploy-stage.sh"
        ;;

    prod|PROD|production|PRODUCTION)
        echo -e "${RED}📦 Routing to PRODUCTION deployment...${NC}"
        echo -e "${RED}   Script: deploy-prod.sh${NC}"
        echo -e "${RED}   ⚠️  PRODUCTION DEPLOYMENT - REQUIRES CONFIRMATION${NC}"
        echo

        # Check if deploy-prod.sh exists
        if [ ! -f "$SCRIPT_DIR/deploy-prod.sh" ]; then
            echo -e "${RED}❌ Error: deploy-prod.sh not found${NC}"
            echo "   Expected location: $SCRIPT_DIR/deploy-prod.sh"
            echo
            echo "   PROD deployment script may not be created yet."
            echo "   Please complete Wave 3 of the deployment roadmap."
            exit 1
        fi

        exec "$SCRIPT_DIR/deploy-prod.sh"
        ;;

    beta|BETA)
        echo -e "${CYAN}📦 Routing to BETA deployment...${NC}"
        echo -e "${CYAN}   Script: deploy-beta.sh${NC}"
        echo

        # Check if deploy-beta.sh exists
        if [ ! -f "$SCRIPT_DIR/deploy-beta.sh" ]; then
            echo -e "${RED}❌ Error: deploy-beta.sh not found${NC}"
            echo "   Expected location: $SCRIPT_DIR/deploy-beta.sh"
            echo
            echo "   BETA deployment is planned for Wave 5."
            echo "   Currently: Web deployment only (QUAL, STAGE, PROD)"
            echo "   Future: Mobile app store deployment (TestFlight, Play Console)"
            exit 1
        fi

        exec "$SCRIPT_DIR/deploy-beta.sh"
        ;;

    help|--help|-h)
        usage
        exit 0
        ;;

    *)
        echo -e "${RED}❌ Error: Unknown tier '$TIER'${NC}"
        echo
        usage
        exit 1
        ;;
esac
