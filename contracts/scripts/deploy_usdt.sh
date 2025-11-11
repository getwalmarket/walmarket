#!/bin/bash

# USDT Deployment Script for Walmarket
# This script deploys the USDT token contract and provides instructions for minting

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   Walmarket USDT Deployment Script   ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""

# Build the contract first
echo -e "${YELLOW}Building USDT contract...${NC}"
cd "$(dirname "$0")/.."
sui move build

echo ""
echo -e "${GREEN}✓ Build successful${NC}"
echo ""

# Deploy
echo -e "${YELLOW}Deploying USDT contract to SUI testnet...${NC}"
echo ""

DEPLOY_OUTPUT=$(sui client publish --gas-budget 100000000 2>&1)

echo "$DEPLOY_OUTPUT"

# Extract package ID and treasury cap ID from output
PACKAGE_ID=$(echo "$DEPLOY_OUTPUT" | grep -oP 'Package ID: \K[0-9a-fx]+' || echo "$DEPLOY_OUTPUT" | grep -A1 "Published Objects:" | grep "PackageID" | awk '{print $4}')
TREASURY_CAP=$(echo "$DEPLOY_OUTPUT" | grep "TreasuryCap" | grep -oP '0x[0-9a-f]+' | head -1)

echo ""
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║        Deployment Successful!         ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""

if [ -n "$PACKAGE_ID" ]; then
    echo -e "${BLUE}Package ID:${NC}"
    echo "  $PACKAGE_ID"
    echo ""
fi

if [ -n "$TREASURY_CAP" ]; then
    echo -e "${BLUE}Treasury Cap ID:${NC}"
    echo "  $TREASURY_CAP"
    echo ""
fi

echo -e "${YELLOW}Next Steps:${NC}"
echo ""
echo "1. Save the Package ID and Treasury Cap ID above"
echo ""
echo "2. Export the Package ID for easy access:"
echo -e "   ${GREEN}export PACKAGE_ID=$PACKAGE_ID${NC}"
echo ""
echo "3. Mint USDT tokens to yourself:"
echo -e "   ${GREEN}./scripts/mint_usdt.sh $TREASURY_CAP <AMOUNT> <YOUR_ADDRESS>${NC}"
echo ""
echo "   Example (mint 1000 USDT):"
echo -e "   ${GREEN}./scripts/mint_usdt.sh $TREASURY_CAP 1000000000 \$(sui client active-address)${NC}"
echo ""
echo "4. Update your frontend .env.local with:"
echo -e "   ${GREEN}NEXT_PUBLIC_USDT_PACKAGE_ID=$PACKAGE_ID${NC}"
echo -e "   ${GREEN}NEXT_PUBLIC_TREASURY_CAP_ID=$TREASURY_CAP${NC}"
echo ""
