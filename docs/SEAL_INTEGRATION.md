# Seal Framework Integration Guide

## Overview

This document describes the integration of Mysten Labs' **Seal framework** into Walmarket for premium access control and encrypted oracle evidence storage.

**Related Issue:** [#2 - Evaluate Seal framework integration](https://github.com/getwalmarket/walmarket/issues/2)

## Table of Contents

1. [What is Seal?](#what-is-seal)
2. [Integration Architecture](#integration-architecture)
3. [Smart Contract Changes](#smart-contract-changes)
4. [Oracle Integration](#oracle-integration)
5. [Frontend Integration](#frontend-integration)
6. [Access Tiers](#access-tiers)
7. [Deployment Guide](#deployment-guide)
8. [Security Considerations](#security-considerations)

---

## What is Seal?

**Seal** is a decentralized secrets management (DSM) system that enables:

- **Identity-based encryption/decryption** of sensitive data
- **Onchain policy-based access control** on Sui blockchain
- **Threshold encryption** via distributed key servers
- **Composable access policies** using Move smart contracts

### Key Features

- ✅ No centralized key custodian
- ✅ Programmable, verifiable, and recoverable encryption
- ✅ Native integration with Walrus storage
- ✅ Support for time-locked and token-gated access

---

## Integration Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Walmarket + Seal                         │
└─────────────────────────────────────────────────────────────┘

┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   Free Tier  │      │ Premium Tier │      │Enterprise Tier│
│              │      │              │      │              │
│ Public       │      │ Full Oracle  │      │ Historical   │
│ Outcome Only │      │ Evidence     │      │ Analytics    │
└──────┬───────┘      └──────┬───────┘      └──────┬───────┘
       │                     │                     │
       v                     v                     v
┌──────────────────────────────────────────────────────────────┐
│                   Access Control Layer                        │
│                  (seal_access.move)                          │
│                                                              │
│  - PremiumAccessPass NFT                                     │
│  - Tier-based verification                                   │
│  - Expiration management                                     │
└──────┬───────────────────────────────────────────────┬───────┘
       │                                               │
       v                                               v
┌─────────────────┐                           ┌─────────────────┐
│ Public Evidence │                           │Encrypted Evidence│
│  (Walrus Blob)  │                           │  (Seal + Walrus)│
│                 │                           │                 │
│ - Outcome: YES  │                           │ - Full Reasoning│
│ - Date          │                           │ - Data Sources  │
│ - Version       │                           │ - TEE Proof     │
└─────────────────┘                           └─────────────────┘
```

---

## Smart Contract Changes

### New Module: `seal_access.move`

Location: `contracts/sources/seal_access.move`

#### Key Structs

**1. PremiumAccessPass**
```move
public struct PremiumAccessPass has key, store {
    id: UID,
    owner: address,
    tier: u8,  // 0=Free, 1=Premium, 2=Enterprise
    expires_at: u64,
    created_at: u64,
}
```

**2. MarketAccessControl**
```move
public struct MarketAccessControl has key {
    id: UID,
    market_id: address,
    requires_premium: bool,
    encrypted_evidence_blob_id: vector<u8>,
    public_outcome_blob_id: vector<u8>,
    seal_package_id: address,
    seal_policy_id: address,
}
```

#### Main Functions

```move
// Issue premium access pass
public entry fun issue_access_pass(
    registry: &mut AccessRegistry,
    recipient: address,
    tier: u8,
    duration_days: u64,
    ctx: &mut TxContext
)

// Configure Seal access for a market
public entry fun configure_market_access(
    market_id: address,
    requires_premium: bool,
    encrypted_evidence_blob_id: vector<u8>,
    public_outcome_blob_id: vector<u8>,
    seal_package_id: address,
    seal_policy_id: address,
    ctx: &mut TxContext
)

// Verify user access and return appropriate blob ID
public fun verify_access(
    access_control: &MarketAccessControl,
    pass: &PremiumAccessPass,
    ctx: &TxContext
): vector<u8>
```

### Updated Module: `market.move`

Added fields to `Market` struct:

```move
public struct Market has key, store {
    // ... existing fields ...

    /// Seal-encrypted premium evidence blob ID
    encrypted_evidence_blob_id: vector<u8>,

    /// Whether this market requires premium access
    requires_premium_access: bool,

    /// Seal policy ID for access control
    seal_policy_id: vector<u8>,
}
```

New resolution function:

```move
public entry fun resolve_market_with_premium(
    market: &mut Market,
    outcome: u8,
    public_outcome_blob_id: vector<u8>,
    encrypted_evidence_blob_id: vector<u8>,
    seal_policy_id: vector<u8>,
    ctx: &mut TxContext
)
```

---

## Oracle Integration

### New Module: `seal_encryptor.py`

Location: `contracts/oracle/seal_encryptor.py`

#### Key Functions

**1. Encrypt Oracle Evidence**
```python
def encrypt_evidence(
    full_evidence: Dict[str, Any],
    market_id: str
) -> EncryptedEvidence
```

Creates:
- **Public summary**: Outcome only (free tier)
- **Encrypted full evidence**: Reasoning + sources + TEE proof (premium tier)

**2. Decrypt for Premium Users**
```python
def decrypt_evidence(
    encrypted_blob: bytes,
    market_id: str
) -> Dict[str, Any]
```

Requires:
- Valid premium access pass
- Session key from Seal client
- On-chain policy verification

#### Example Usage

```python
from seal_encryptor import SealEncryptor, SealConfig

# Configure Seal
config = SealConfig(
    seal_package_id="0x...",
    seal_policy_id="0x...",
    threshold=2,
    key_servers=["https://seal1.example.com", ...]
)

encryptor = SealEncryptor(config)

# Encrypt oracle evidence
encrypted = encryptor.encrypt_evidence(
    full_evidence={
        "outcome": "YES",
        "reasoning": "BTC exceeded $100k based on...",
        "sources": [...],
        "tee_attestation": {...}
    },
    market_id="0xmarket123"
)

# Upload to Walrus
public_blob_id = upload_to_walrus(encrypted.public_summary)
encrypted_blob_id = upload_to_walrus(encrypted.encrypted_blob)

# Configure on-chain access control
tx = encryptor.create_access_policy_tx(
    market_id="0xmarket123",
    encrypted_blob_id=encrypted_blob_id,
    public_blob_id=public_blob_id
)
```

---

## Frontend Integration

### New Utilities: `app/lib/seal.ts`

#### Initialize Seal Client

```typescript
import { initializeSealClient } from '@/lib/seal';

const sealClient = await initializeSealClient({
  suiClient,
  serverConfigs: [
    '0x...server1',
    '0x...server2',
    '0x...server3'
  ],
  verifyKeyServers: true
});
```

#### Check Premium Access

```typescript
import { hasPremiumAccess } from '@/lib/seal';

const isPremium = await hasPremiumAccess(
  suiClient,
  userAddress,
  accessRegistryId
);
```

#### Decrypt Evidence

```typescript
import { decryptOracleEvidence, fetchFromWalrus } from '@/lib/seal';

if (isPremium) {
  const encryptedBlob = await fetchFromWalrus(encryptedBlobId);
  const evidence = await decryptOracleEvidence(sealClient, {
    encryptedData: encryptedBlob,
    sessionKey: userSessionKey
  });

  // Display full reasoning, sources, TEE proof
  console.log(evidence.reasoning);
  console.log(evidence.sources);
}
```

---

## Access Tiers

### Tier 0: Free (Public)

**Access:**
- Market outcome (YES/NO)
- Resolution date
- Oracle version

**Restrictions:**
- No reasoning or sources
- No TEE attestation details
- No historical data

### Tier 1: Premium

**Access:**
- All Free tier features
- Full AI reasoning
- Data sources with URLs
- TEE attestation proof
- Walrus evidence links

**Price:** Token-gated or subscription

### Tier 2: Enterprise

**Access:**
- All Premium tier features
- Historical market data
- Analytics dashboard
- API access
- Custom reports

**Price:** Higher subscription or governance token staking

---

## Deployment Guide

### 1. Deploy Smart Contracts

```bash
cd contracts

# Build contracts with Seal integration
sui move build

# Deploy to testnet
sui client publish --gas-budget 100000000

# Save deployed addresses
export PACKAGE_ID=0x...
export ACCESS_REGISTRY_ID=0x...
```

### 2. Configure Seal Key Servers

```bash
# Set up Seal key servers (testnet)
export SEAL_SERVER_1=https://seal-testnet-1.mystenlabs.com
export SEAL_SERVER_2=https://seal-testnet-2.mystenlabs.com
export SEAL_SERVER_3=https://seal-testnet-3.mystenlabs.com
```

### 3. Update Environment Variables

Add to `.env.local`:

```env
# Seal Configuration
NEXT_PUBLIC_SEAL_PACKAGE_ID=0x...
NEXT_PUBLIC_ACCESS_REGISTRY_ID=0x...
NEXT_PUBLIC_SEAL_SERVER_1=https://seal-testnet-1.mystenlabs.com
NEXT_PUBLIC_SEAL_SERVER_2=https://seal-testnet-2.mystenlabs.com
NEXT_PUBLIC_SEAL_SERVER_3=https://seal-testnet-3.mystenlabs.com
```

### 4. Issue Access Passes

```bash
# Issue premium access pass (90 days)
sui client call \
  --package $PACKAGE_ID \
  --module seal_access \
  --function issue_access_pass \
  --args $ACCESS_REGISTRY_ID \
         $USER_ADDRESS \
         1 \
         90 \
  --gas-budget 10000000
```

---

## Security Considerations

### ⚠️ Current Status: Proof of Concept

This integration is a **PoC implementation** for the Walrus Haulout Hackathon. Production deployment requires:

#### 1. Real Seal SDK Integration

Current: Simulated encryption/decryption
**Required:**
- Actual Seal client initialization
- Real threshold encryption with key servers
- Proper session key management

#### 2. Key Server Infrastructure

Current: Placeholder endpoints
**Required:**
- Deploy production Seal key servers
- Implement redundancy and failover
- Monitor server health and availability

#### 3. Access Policy Validation

Current: Basic tier checking
**Required:**
- On-chain policy verification
- Time-based access expiration
- Token balance verification for subscriptions

#### 4. Walrus Integration

Current: Mock blob upload/download
**Required:**
- Real Walrus SDK integration
- Blob hash verification
- Content integrity checks

#### 5. TEE Attestation

Current: Simulated enclave signatures
**Required:**
- Nautilus TEE integration
- Remote attestation verification
- Enclave registry management

---

## Testing

### Unit Tests

```bash
# Test Seal encryption
cd contracts/oracle
python -m pytest tests/test_seal_encryptor.py -v

# Test Move contracts
cd ../
sui move test
```

### Integration Tests

```bash
# Test end-to-end flow
npm run test:integration
```

---

## Roadmap

### Phase 1: PoC ✅ (Completed)
- ✅ Basic Seal integration
- ✅ Premium access NFTs
- ✅ Simulated encryption
- ✅ Documentation
- ✅ Walrus SDK integration (@mysten/walrus)

### Phase 2: MVP (In Progress - ALP-20)
- ✅ Walrus SDK installed and configured
- ⏳ Real Seal SDK integration
- ⏳ Production key servers setup
- ⏳ Token-gated subscriptions
- ⏳ Encrypted Walrus storage implementation

### Phase 3: Production (Planned)
- ⏳ Enterprise tier features
- ⏳ Analytics marketplace
- ⏳ Historical data API
- ⏳ Revenue distribution

---

## Implementation Notes (ALP-20)

### 2025-11-19: Walrus SDK Integration

**Status**: ✅ Dependencies installed

**Changes**:
- Installed `@mysten/walrus` package for blob storage operations
- Prepared for real Walrus upload/download implementation
- Ready to replace mock functions in `app/lib/seal.ts`

**Next Steps**:
1. Implement real `uploadToWalrus()` function using WalrusClient
2. Implement real `fetchFromWalrus()` function
3. Configure Walrus testnet endpoints in environment variables
4. Test end-to-end blob upload/download flow
5. Integrate with Seal encryption pipeline

**Related Issues**:
- Linear: [ALP-20](https://linear.app/alpsoft/issue/ALP-20/complete-seal-premium-access-control-integration)
- GitHub: Will be linked via PR

---

## References

- **Seal Documentation**: https://seal-docs.wal.app/
- **Seal SDK**: https://www.npmjs.com/package/@mysten/seal
- **Walrus Documentation**: https://docs.walrus.xyz
- **Issue #2**: https://github.com/getwalmarket/walmarket/issues/2

---

## Support

For questions or issues:
- Open an issue: https://github.com/getwalmarket/walmarket/issues
- Contact: See README.md

---

**Built for Walrus Haulout Hackathon 2025** 🦭
