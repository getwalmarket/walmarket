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
# Mint 1000 USDT (1000000000 = 1000 * 10^6)
./scripts/mint_usdt.sh <TREASURY_CAP_ID> 1000000000 $(sui client active-address)

# Or use the environment variable
export PACKAGE_ID=<your_package_id>
./scripts/mint_usdt.sh <TREASURY_CAP_ID> 1000000000 $(sui client active-address)
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
