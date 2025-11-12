# Walmarket Smart Contracts

SUI Move smart contracts for the Walmarket prediction market platform.

## Overview

This directory contains the on-chain logic for Walmarket's decentralized prediction markets, built using SUI Move.

## Contract Structure

### `usdt.move`

Test USDT token contract for Walmarket prediction markets.

- **Token Creation**: Creates a test USDT token with 6 decimals (matching real USDT)
- **Minting**: Treasury cap holder can mint tokens to any address
- **Burning**: Tokens can be burned to reduce supply
- **Metadata**: Includes token name, symbol, description, and icon URL

### `market.move`

The main prediction market contract that handles:

- **Market Creation**: Create new binary prediction markets with customizable parameters
- **Betting**: Users can place bets on YES or NO outcomes
- **Position Management**: Each bet creates a Position NFT for the user
- **Market Resolution**: Markets are resolved by creators or AI oracles
- **Winnings Distribution**: Winners can claim their proportional share of the total pool

### Key Features

#### Market Object
```move
public struct Market {
    id: UID,
    title: vector<u8>,
    description: vector<u8>,
    category: vector<u8>,
    end_date: u64,
    yes_pool: Balance<SUI>,
    no_pool: Balance<SUI>,
    creator: address,
    status: u8,
    outcome: u8,
}
```

#### Position NFT
```move
public struct Position {
    id: UID,
    market_id: address,
    owner: address,
    prediction: bool,  // true = YES, false = NO
    amount: u64,
    created_at: u64,
}
```

## Setup

### Prerequisites

1. Install SUI CLI:
```bash
cargo install --locked --git https://github.com/MystenLabs/sui.git --branch testnet sui
```

2. Create a SUI wallet:
```bash
sui client new-address ed25519
```

3. Get testnet SUI tokens:
```bash
sui client faucet
```

### Build

Compile the contracts:
```bash
cd contracts
sui move build
```

### Test

Run Move tests:
```bash
sui move test
```

### Deploy

#### Deploy USDT Token

First, deploy the test USDT token:
```bash
cd contracts
./scripts/deploy_usdt.sh
```

This will:
1. Build and deploy the USDT token contract
2. Display the Package ID and Treasury Cap ID
3. Provide instructions for minting tokens

#### Mint USDT Tokens

After deployment, mint test USDT tokens to your address:
```bash
# Method 1: Pass Package ID as 4th argument
./scripts/mint_usdt.sh <TREASURY_CAP_ID> 1000000000 $(sui client active-address) <PACKAGE_ID>

# Method 2: Set environment variable
export PACKAGE_ID=<your_package_id>
./scripts/mint_usdt.sh <TREASURY_CAP_ID> 1000000000 $(sui client active-address)

# Example (mint 1000 USDT):
./scripts/mint_usdt.sh 0xdb8d1f0c27b12fc8a6daed7721f40f49397cd100f1c8591d88204c948c00681c 1000000000 $(sui client active-address) 0xae3273cb0f33d575f9165df267df7e6c18eac407364e8f4bd0d1f359ab4a19b6
```

**Note:** USDT uses 6 decimals, so:
- 1 USDT = 1,000,000 (1e6)
- 10 USDT = 10,000,000 (1e7)
- 1,000 USDT = 1,000,000,000 (1e9)

#### Deploy Market Contract

Deploy the prediction market contract:
```bash
sui client publish --gas-budget 100000000
```

After deployment, save the package ID and update your frontend configuration.

---

## 🎯 Live Test Market on SUI Testnet

A live test market has been deployed for judges and testers to interact with and verify the Walrus integration.

### Latest Deployment (With Walrus Integration)
- **Package ID**: `0x03746b9be956d9964e460a0fe401b46e7af331e912fb9aca4d5fefebb38ae9fb`
- **Market Registry ID**: `0xea117fd8fe57fcbd3412ed2e265ee63e0773d91b5ca8f52c7bfd10c3d3a0e976`
- **USDT Treasury Cap**: `0xb0875388986c88bd91d9558c7e486e424601b508d50d7e3b98759d77999f26b6`
- **Deployment Transaction**: [59ZsmXowjja2G2BJe4wTJbzoftCER1WsJxS6XsWV5Nh8](https://suiscan.xyz/testnet/tx/59ZsmXowjja2G2BJe4wTJbzoftCER1WsJxS6XsWV5Nh8)

### Test Market Details

**Market Information:**
- **Market ID**: `0xe50c1c46468a510e2bef9e056e52eef552edf0b0ff7f7490d9f695f15139b470`
- **Question**: "Will BTC reach $100k by end of 2024?"
- **Description**: "Bitcoin price prediction market"
- **Category**: Crypto
- **End Date**: December 31, 2024 (timestamp: 1735689600000)
- **Creation Transaction**: [AbozzspGSpiRq81c1QakW6cYJj76RMZVAe2za1cyhyV1](https://suiscan.xyz/testnet/tx/AbozzspGSpiRq81c1QakW6cYJj76RMZVAe2za1cyhyV1)

**Walrus Integration:**
- **Metadata Blob ID**: `Cu7KD1o8bwuW-rCVihj40Nu-iHBBRjy-C6eJJgiXqPw`
- **Metadata Contents**: Full market details including data sources, resolution criteria, and images
- **Storage**: Permanently stored on Walrus for immutable audit trail

### View Market Data on Explorers

**SUI Blockchain:**
- [Market Object on Suiscan](https://suiscan.xyz/testnet/object/0xe50c1c46468a510e2bef9e056e52eef552edf0b0ff7f7490d9f695f15139b470)
- [Package on Suiscan](https://suiscan.xyz/testnet/object/0x03746b9be956d9964e460a0fe401b46e7af331e912fb9aca4d5fefebb38ae9fb)
- [Registry on Suiscan](https://suiscan.xyz/testnet/object/0xea117fd8fe57fcbd3412ed2e265ee63e0773d91b5ca8f52c7bfd10c3d3a0e976)

**Walrus Storage:**
- [Metadata Blob on Walruscan](https://walruscan.com/testnet/blob/Cu7KD1o8bwuW-rCVihj40Nu-iHBBRjy-C6eJJgiXqPw)
- [Walrus Testnet Explorer](https://walruscan.com/testnet/home)

### Inspect Market Using SUI CLI

```bash
# View full market object details
sui client object 0xe50c1c46468a510e2bef9e056e52eef552edf0b0ff7f7490d9f695f15139b470

# View market registry
sui client object 0xea117fd8fe57fcbd3412ed2e265ee63e0773d91b5ca8f52c7bfd10c3d3a0e976

# View package
sui client object 0x03746b9be956d9964e460a0fe401b46e7af331e912fb9aca4d5fefebb38ae9fb
```

### Fetch Walrus Metadata

The market metadata is stored on Walrus and can be retrieved using the blob ID:

```bash
# Fetch metadata from Walrus (requires Walrus CLI)
walrus read Cu7KD1o8bwuW-rCVihj40Nu-iHBBRjy-C6eJJgiXqPw
```

**Expected Metadata Structure:**
```json
{
  "title": "Will BTC reach $100k by end of 2024?",
  "description": "Bitcoin price prediction market",
  "category": "Crypto",
  "end_date": 1735689600000,
  "created_at": "2025-11-12T01:25:25Z",
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
  "tags": ["prediction", "market", "Crypto"],
  "images": []
}
```

### Create Additional Test Markets

Use the provided script to create more markets with Walrus integration:

```bash
cd scripts

# Example: Crypto market without images
./create_market_with_walrus.sh \
  'Will ETH reach $10k?' \
  'Ethereum price prediction for 2025' \
  'Crypto' \
  1735689600000

# Example: Politics market
./create_market_with_walrus.sh \
  'Will there be a US recession in 2025?' \
  'Economic outlook prediction' \
  'Politics' \
  1735689600000

# Example: Market with images (local files or URLs)
./create_market_with_walrus.sh \
  'Will BTC reach $100k?' \
  'Bitcoin price prediction' \
  'Crypto' \
  1735689600000 \
  chart.png \
  https://example.com/logo.png

# The script will:
# 1. Upload images to Walrus (if provided)
# 2. Create metadata JSON with data sources
# 3. Upload metadata to Walrus
# 4. Create market on-chain with Walrus blob ID
```

### Verify Walrus Integration

To verify the complete Walrus integration workflow:

1. **Check On-Chain Market**:
   ```bash
   sui client object 0xe50c1c46468a510e2bef9e056e52eef552edf0b0ff7f7490d9f695f15139b470 --json | jq '.content.fields.walrus_metadata_blob_id'
   ```

2. **Fetch Metadata from Walrus**:
   ```bash
   walrus read Cu7KD1o8bwuW-rCVihj40Nu-iHBBRjy-C6eJJgiXqPw
   ```

3. **View on Walruscan**:
   - Visit [Walruscan](https://walruscan.com/testnet/blob/Cu7KD1o8bwuW-rCVihj40Nu-iHBBRjy-C6eJJgiXqPw) to see blob details

4. **Verify Data Integrity**:
   - Compare on-chain blob ID with Walrus storage
   - Verify metadata structure matches expected format
   - Confirm all data sources are listed

---

## Contract Functions

### USDT Token Functions

#### `mint`
Mint new USDT tokens to a recipient address.

**Parameters:**
- `treasury: &mut TreasuryCap<USDT>` - Treasury capability (only holder can call)
- `amount: u64` - Amount to mint (in smallest unit, 6 decimals)
- `recipient: address` - Address to receive the tokens
- `ctx: &mut TxContext` - Transaction context

**Usage:**
```bash
sui client call \
    --package <PACKAGE_ID> \
    --module usdt \
    --function mint \
    --args <TREASURY_CAP_ID> 1000000000 <RECIPIENT_ADDRESS> \
    --gas-budget 10000000
```

#### `burn`
Burn USDT tokens to reduce supply.

**Parameters:**
- `treasury: &mut TreasuryCap<USDT>` - Treasury capability
- `coin: Coin<USDT>` - USDT coin to burn

### Market Contract Functions

#### `create_market`
Create a new prediction market.

**Parameters:**
- `registry: &mut MarketRegistry` - The market registry
- `title: vector<u8>` - Market question/title
- `description: vector<u8>` - Detailed description
- `category: vector<u8>` - Category (Crypto, Technology, etc.)
- `end_date: u64` - End timestamp in milliseconds
- `ctx: &mut TxContext` - Transaction context

#### `place_bet`
Place a bet on a market outcome.

**Parameters:**
- `market: &mut Market` - The market to bet on
- `prediction: bool` - true for YES, false for NO
- `payment: Coin<SUI>` - SUI tokens to bet
- `ctx: &mut TxContext` - Transaction context

**Returns:** Position NFT to the caller

#### `resolve_market`
Resolve a market with the final outcome (creator/oracle only).

**Parameters:**
- `market: &mut Market` - The market to resolve
- `outcome: u8` - Final outcome (1 = YES, 2 = NO)
- `ctx: &mut TxContext` - Transaction context

#### `claim_winnings`
Claim winnings from a resolved market.

**Parameters:**
- `market: &mut Market` - The resolved market
- `position: Position` - Position NFT to claim
- `ctx: &mut TxContext` - Transaction context

**Returns:** Winning amount transferred to position owner

### View Functions

- `get_market_status(market: &Market): u8` - Get market status
- `get_yes_pool(market: &Market): u64` - Get YES pool amount
- `get_no_pool(market: &Market): u64` - Get NO pool amount

## Events

The contract emits the following events:

- `MarketCreated` - When a new market is created
- `BetPlaced` - When a user places a bet
- `MarketResolved` - When a market is resolved

## Roadmap

### Phase 1 (Current)
- ✅ Basic market creation and betting
- ✅ Position NFT system
- ✅ Manual market resolution
- ✅ Winnings distribution

### Phase 2 (Planned)
- 🔄 AI Oracle integration for automated resolution
- 🔄 Time-based market closure
- 🔄 Market fees and treasury
- 🔄 Liquidity provider mechanisms

### Phase 3 (Future)
- 📋 Multi-outcome markets (beyond binary)
- 📋 Market AMM (Automated Market Maker)
- 📋 Governance token integration
- 📋 Cross-market liquidity

## Security Considerations

⚠️ **This is a hackathon prototype. DO NOT use in production without:**

1. Professional security audit
2. Comprehensive testing suite
3. Economic modeling and game theory analysis
4. Oracle security hardening
5. Emergency pause mechanisms
6. Upgrade/migration strategies

## License

MIT License - See [LICENSE](../LICENSE) for details

## Support

For questions or issues:
- GitHub Issues: https://github.com/leopard627/walmarket/issues
- Project README: [../README.md](../README.md)
