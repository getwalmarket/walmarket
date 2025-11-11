# Walmarket Smart Contracts

SUI Move smart contracts for the Walmarket prediction market platform.

## Overview

This directory contains the on-chain logic for Walmarket's decentralized prediction markets, built using SUI Move.

## Contract Structure

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

Deploy to SUI testnet:
```bash
sui client publish --gas-budget 100000000
```

After deployment, save the package ID and update your frontend configuration.

## Contract Functions

### Public Entry Functions

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
