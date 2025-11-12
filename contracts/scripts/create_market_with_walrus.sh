#!/bin/bash
# Script to create market metadata, upload to Walrus (with images), and create market on-chain
# Usage: ./create_market_with_walrus.sh <market_title> <description> <category> <end_timestamp> [image_files...]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check arguments
if [ "$#" -lt 4 ]; then
    echo -e "${RED}Usage: $0 <title> <description> <category> <end_timestamp> [image_files_or_urls...]${NC}"
    echo ""
    echo "Examples:"
    echo "  # No images (use single quotes for \$ in title)"
    echo "  $0 'Will BTC reach \$100k?' 'Bitcoin price prediction' 'Crypto' 1735689600000"
    echo ""
    echo "  # With local image files"
    echo "  $0 'Will BTC reach \$100k?' 'Bitcoin price prediction' 'Crypto' 1735689600000 chart.png logo.jpg"
    echo ""
    echo "  # With image URLs"
    echo "  $0 'Will BTC reach \$100k?' 'Bitcoin price prediction' 'Crypto' 1735689600000 https://example.com/chart.png"
    echo ""
    echo "  # Mix of files and URLs"
    echo "  $0 'Will BTC reach \$100k?' 'Bitcoin price prediction' 'Crypto' 1735689600000 chart.png https://example.com/logo.png"
    echo ""
    echo "Note: Use single quotes (') instead of double quotes (\") to preserve \$ signs in your text."
    exit 1
fi

TITLE="$1"
DESCRIPTION="$2"
CATEGORY="$3"
END_DATE="$4"
shift 4
IMAGE_FILES=("$@")

# Configuration
PACKAGE_ID="${PACKAGE_ID:-0x03746b9be956d9964e460a0fe401b46e7af331e912fb9aca4d5fefebb38ae9fb}"
MARKET_REGISTRY="${MARKET_REGISTRY:-0xea117fd8fe57fcbd3412ed2e265ee63e0773d91b5ca8f52c7bfd10c3d3a0e976}"

echo -e "${YELLOW}=== Walmarket Market Creation ===${NC}"
echo ""

# Step 1: Upload images to Walrus (if provided)
IMAGE_BLOB_IDS=()
IMAGE_NAMES=()
TEMP_FILES=()

if [ "${#IMAGE_FILES[@]}" -gt 0 ]; then
    echo -e "${GREEN}Step 1: Processing images...${NC}"

    for IMAGE_INPUT in "${IMAGE_FILES[@]}"; do
        IMAGE_FILE=""
        IMAGE_NAME=""

        # Check if input is a URL
        if [[ "$IMAGE_INPUT" =~ ^https?:// ]]; then
            echo "Downloading from URL: $IMAGE_INPUT"

            # Extract filename from URL or generate one
            IMAGE_NAME=$(basename "$IMAGE_INPUT" | sed 's/[?#].*//')
            if [ -z "$IMAGE_NAME" ] || [[ ! "$IMAGE_NAME" =~ \.(jpg|jpeg|png|gif|webp|svg)$ ]]; then
                IMAGE_NAME="image_$(date +%s).jpg"
            fi

            # Download to temp file
            TEMP_FILE="/tmp/walmarket_img_$(date +%s)_$IMAGE_NAME"
            if command -v curl &> /dev/null; then
                curl -sL "$IMAGE_INPUT" -o "$TEMP_FILE"
            elif command -v wget &> /dev/null; then
                wget -q "$IMAGE_INPUT" -O "$TEMP_FILE"
            else
                echo -e "${RED}  Error: curl or wget required to download images${NC}"
                continue
            fi

            if [ ! -f "$TEMP_FILE" ] || [ ! -s "$TEMP_FILE" ]; then
                echo -e "${YELLOW}  Failed to download. Skipping...${NC}"
                continue
            fi

            IMAGE_FILE="$TEMP_FILE"
            TEMP_FILES+=("$TEMP_FILE")
            echo -e "${GREEN}  Downloaded successfully!${NC}"
        else
            # Treat as file path
            if [ ! -f "$IMAGE_INPUT" ]; then
                echo -e "${YELLOW}Warning: Image file not found: $IMAGE_INPUT (skipping)${NC}"
                continue
            fi
            IMAGE_FILE="$IMAGE_INPUT"
            IMAGE_NAME=$(basename "$IMAGE_FILE")
        fi

        echo "Uploading to Walrus: $IMAGE_NAME"

        if command -v walrus &> /dev/null; then
            # Upload image to Walrus with 5 epochs storage
            IMAGE_WALRUS_OUTPUT=$(walrus store --epochs 5 "$IMAGE_FILE" 2>&1)
            IMAGE_BLOB_ID=$(echo "$IMAGE_WALRUS_OUTPUT" | grep -oE "Blob ID: [a-zA-Z0-9_\-]+" | cut -d' ' -f3)

            if [ -z "$IMAGE_BLOB_ID" ]; then
                echo -e "${YELLOW}  Failed to upload. Using placeholder...${NC}"
                IMAGE_BLOB_ID=$(openssl rand -hex 32)
            else
                echo -e "${GREEN}  Uploaded successfully!${NC}"
            fi
        else
            # Generate placeholder
            IMAGE_BLOB_ID=$(openssl rand -hex 32)
            echo -e "${YELLOW}  Walrus CLI not found. Using placeholder blob ID${NC}"
        fi

        echo "  Blob ID: $IMAGE_BLOB_ID"
        IMAGE_BLOB_IDS+=("$IMAGE_BLOB_ID")
        IMAGE_NAMES+=("$IMAGE_NAME")
    done

    # Clean up temporary files
    for TEMP_FILE in "${TEMP_FILES[@]}"; do
        rm -f "$TEMP_FILE"
    done

    echo ""
fi

# Step 2: Create market metadata JSON
echo -e "${GREEN}Step 2: Creating market metadata JSON...${NC}"
METADATA_FILE="/tmp/walmarket_metadata_$(date +%s).json"

# Build images JSON array
IMAGES_JSON="[]"
if [ "${#IMAGE_BLOB_IDS[@]}" -gt 0 ]; then
    IMAGES_JSON="["
    for i in "${!IMAGE_BLOB_IDS[@]}"; do
        BLOB_ID="${IMAGE_BLOB_IDS[$i]}"
        IMAGE_NAME="${IMAGE_NAMES[$i]}"
        IMAGES_JSON="$IMAGES_JSON{\"blob_id\":\"$BLOB_ID\",\"filename\":\"$IMAGE_NAME\"}"
        if [ $i -lt $((${#IMAGE_BLOB_IDS[@]} - 1)) ]; then
            IMAGES_JSON="$IMAGES_JSON,"
        fi
    done
    IMAGES_JSON="$IMAGES_JSON]"
fi

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
  "images": $IMAGES_JSON
}
EOF

echo "Metadata file created: $METADATA_FILE"
cat "$METADATA_FILE"
echo ""

# Step 3: Upload metadata to Walrus
echo -e "${GREEN}Step 3: Uploading metadata to Walrus...${NC}"

# Check if walrus CLI is available
if command -v walrus &> /dev/null; then
    echo "Using Walrus CLI..."

    # Upload to Walrus with 5 epochs storage
    WALRUS_OUTPUT=$(walrus store --epochs 5 "$METADATA_FILE" 2>&1)

    # Extract blob ID from output (format: "Blob ID: ...")
    BLOB_ID=$(echo "$WALRUS_OUTPUT" | grep -oE "Blob ID: [a-zA-Z0-9_\-]+" | cut -d' ' -f3)

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

# Step 4: Create market on-chain
echo -e "${GREEN}Step 4: Creating market on SUI blockchain...${NC}"

echo "Calling create_market function..."
echo "  Package ID: $PACKAGE_ID"
echo "  Market Registry: $MARKET_REGISTRY"
echo "  Title: $TITLE"
echo "  Description: $DESCRIPTION"
echo "  Category: $CATEGORY"
echo "  End Date: $END_DATE"
echo "  Walrus Blob ID: $BLOB_ID"
echo ""

# Debug: Show detailed argument information
echo -e "${YELLOW}=== DETAILED DEBUG INFO ===${NC}"
echo "Number of arguments to pass: 6"
echo ""
echo "Arg 1 (registry shared object):"
echo "  Value: $MARKET_REGISTRY"
echo "  Type: address (shared object reference)"
echo ""
echo "Arg 2 (title):"
echo "  Value: $TITLE"
echo "  Type: vector<u8> (string)"
echo ""
echo "Arg 3 (description):"
echo "  Value: $DESCRIPTION"
echo "  Type: vector<u8> (string)"
echo ""
echo "Arg 4 (category):"
echo "  Value: $CATEGORY"
echo "  Type: vector<u8> (string)"
echo ""
echo "Arg 5 (end_date):"
echo "  Value: $END_DATE"
echo "  Type: u64 (number)"
echo ""
echo "Arg 6 (walrus_blob_id):"
echo "  Value: $BLOB_ID"
echo "  Type: vector<u8> (string)"
echo ""
echo -e "${YELLOW}=== END DEBUG INFO ===${NC}"
echo ""

# Call SUI move function
# Note: Strings are passed WITHOUT quotes - sui client handles conversion to vector<u8>
echo "Executing sui client call command..."
echo ""

sui client call \
    --package "$PACKAGE_ID" \
    --module market \
    --function create_market \
    --args \
        "$MARKET_REGISTRY" \
        "$TITLE" \
        "$DESCRIPTION" \
        "$CATEGORY" \
        "$END_DATE" \
        "$BLOB_ID" \
    --gas-budget 100000000

echo ""
echo -e "${GREEN}=== Market Creation Complete ===${NC}"
echo "Metadata file: $METADATA_FILE"
echo "Metadata Walrus Blob ID: $BLOB_ID"

if [ "${#IMAGE_BLOB_IDS[@]}" -gt 0 ]; then
    echo ""
    echo "Uploaded Images:"
    for i in "${!IMAGE_BLOB_IDS[@]}"; do
        echo "  - ${IMAGE_NAMES[$i]}: ${IMAGE_BLOB_IDS[$i]}"
    done
fi

echo ""
echo "To fetch the metadata from Walrus (once uploaded):"
echo "  walrus read $BLOB_ID"

if [ "${#IMAGE_BLOB_IDS[@]}" -gt 0 ]; then
    echo ""
    echo "To fetch an image from Walrus:"
    echo "  walrus read ${IMAGE_BLOB_IDS[0]} > image_file"
fi
