#!/bin/bash
# Script to create market metadata, upload to Walrus, and create market on-chain
# Usage: ./create_market_with_walrus.sh <market_title> <description> <category> <end_timestamp>

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check arguments
if [ "$#" -lt 4 ]; then
    echo -e "${RED}Usage: $0 <title> <description> <category> <end_timestamp>${NC}"
    echo "Example: $0 \"Will BTC reach \$100k?\" \"Bitcoin price prediction\" \"Crypto\" 1735689600000"
    exit 1
fi

TITLE="$1"
DESCRIPTION="$2"
CATEGORY="$3"
END_DATE="$4"

# Configuration
PACKAGE_ID="${PACKAGE_ID:-0x6e930c6b39d8a77e4e755148564207a801d0a2f550ec306fee7b9b913ed6f17d}"
MARKET_REGISTRY="${MARKET_REGISTRY:-0xec89a1e95991bb73e1e521540036d8ffc3eb5892a4629e616873d4586a00c4df}"

echo -e "${YELLOW}=== Walmarket Market Creation ===${NC}"
echo ""

# Step 1: Create market metadata JSON
echo -e "${GREEN}Step 1: Creating market metadata JSON...${NC}"
METADATA_FILE="/tmp/walmarket_metadata_$(date +%s).json"

cat > "$METADATA_FILE" <<EOF
{
  "title": "$TITLE",
  "description": "$DESCRIPTION",
  "category": "$CATEGORY",
  "end_date": $END_DATE,
  "created_at": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "version": "1.0",
  "data_sources": {
    "crypto": [
      "CoinMarketCap API",
      "CoinGecko API",
      "Coinbase API",
      "Binance API"
    ],
    "traditional_finance": [
      "Bloomberg API",
      "Reuters API",
      "Yahoo Finance API"
    ],
    "politics": [
      "AP News",
      "Reuters",
      "Fox News",
      "Official Government Sources"
    ],
    "sports": [
      "ESPN API",
      "Official League APIs"
    ]
  },
  "resolution_criteria": "Market will be resolved by AI oracle using multi-source verification",
  "tags": ["prediction", "market", "$CATEGORY"],
  "images": []
}
EOF

echo "Metadata file created: $METADATA_FILE"
cat "$METADATA_FILE"
echo ""

# Step 2: Upload to Walrus
echo -e "${GREEN}Step 2: Uploading metadata to Walrus...${NC}"

# Check if walrus CLI is available
if command -v walrus &> /dev/null; then
    echo "Using Walrus CLI..."

    # Upload to Walrus (adjust command based on actual Walrus CLI)
    # For now, this is a placeholder - replace with actual Walrus upload command
    BLOB_ID=$(walrus store "$METADATA_FILE" 2>&1 | grep -oE "blob_id: [a-zA-Z0-9]+" | cut -d' ' -f2 || echo "")

    if [ -z "$BLOB_ID" ]; then
        echo -e "${RED}Failed to upload to Walrus. Using placeholder blob ID...${NC}"
        # Generate a placeholder blob ID (32 random hex characters)
        BLOB_ID=$(openssl rand -hex 32)
        echo -e "${YELLOW}Placeholder Blob ID: $BLOB_ID${NC}"
    else
        echo -e "${GREEN}Successfully uploaded to Walrus!${NC}"
        echo "Blob ID: $BLOB_ID"
    fi
else
    echo -e "${YELLOW}Walrus CLI not found. Generating placeholder blob ID...${NC}"
    echo "To actually upload to Walrus, install the Walrus CLI:"
    echo "  https://docs.walrus.xyz/usage/client-cli.html"
    echo ""

    # Generate a placeholder blob ID
    BLOB_ID=$(openssl rand -hex 32)
    echo "Placeholder Blob ID: $BLOB_ID"
    echo ""
    echo -e "${YELLOW}Note: This is a simulated blob ID for testing purposes.${NC}"
    echo "In production, this would be a real Walrus blob ID."
fi

echo ""

# Step 3: Create market on-chain
echo -e "${GREEN}Step 3: Creating market on SUI blockchain...${NC}"

# Convert title, description, category to hex
TITLE_HEX=$(echo -n "$TITLE" | xxd -p | tr -d '\n')
DESC_HEX=$(echo -n "$DESCRIPTION" | xxd -p | tr -d '\n')
CATEGORY_HEX=$(echo -n "$CATEGORY" | xxd -p | tr -d '\n')
BLOB_ID_HEX=$(echo -n "$BLOB_ID" | xxd -p | tr -d '\n')

echo "Calling create_market function..."
echo "  Package ID: $PACKAGE_ID"
echo "  Market Registry: $MARKET_REGISTRY"
echo "  Title: $TITLE"
echo "  Description: $DESCRIPTION"
echo "  Category: $CATEGORY"
echo "  End Date: $END_DATE"
echo "  Walrus Blob ID: $BLOB_ID"
echo ""

# Call SUI move function
sui client call \
    --package "$PACKAGE_ID" \
    --module market \
    --function create_market \
    --args \
        "$MARKET_REGISTRY" \
        "vector<u8>[0x$TITLE_HEX]" \
        "vector<u8>[0x$DESC_HEX]" \
        "vector<u8>[0x$CATEGORY_HEX]" \
        "$END_DATE" \
        "vector<u8>[0x$BLOB_ID_HEX]" \
    --gas-budget 100000000

echo ""
echo -e "${GREEN}=== Market Creation Complete ===${NC}"
echo "Metadata file: $METADATA_FILE"
echo "Walrus Blob ID: $BLOB_ID"
echo ""
echo "To fetch the metadata from Walrus (once uploaded):"
echo "  walrus read $BLOB_ID"
