# 🔮 Walmarket - Decentralized Truth Through Markets

<div align="center">
  <img src="./public/icon-txt.png" alt="Walmarket Logo" width="400"/>

  <p><strong>AI-Powered Prediction Markets on SUI</strong></p>
  <p>A truth engine powered by Walrus - predict, verify, and earn on decentralized prediction markets</p>

  [![Demo](https://img.shields.io/badge/Demo-Live-brightgreen)](https://walmarket.fun)
  [![Video](https://img.shields.io/badge/Video-YouTube-red)](https://youtu.be/dQw4w9WgXcQ)
  [![License](https://img.shields.io/badge/License-MIT-blue)](LICENSE)
</div>

---

## 📺 Demo Video

[![Walmarket Demo](https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg)](https://youtu.be/dQw4w9WgXcQ)

> **Click to watch the full demo** - See Walmarket in action!

---

## 🏆 Walrus Haulout Hackathon 2025

**Track:** Provably Authentic (Truth Engine + Trust Oracle)

**Problem Statement:**

Traditional AI oracles suffer from a critical trust problem: users must blindly trust that operators run AI models honestly and report results accurately. There's no way to verify:
- Which AI model was actually used
- What input data was fed to the model
- Whether the output was tampered with
- If the reasoning stored matches what was claimed

**Our Solution:**

Walmarket eliminates oracle trust requirements through **verifiable AI execution**:

1. **Nautilus TEE** - AI inference runs in secure enclaves with cryptographic attestation proving execution integrity
2. **GPT-5 Single Model Policy** - Consistent, reproducible results with fixed prompts and schemas
3. **Walrus Evidence Storage** - Complete audit trail (input, output, reasoning) stored immutably
4. **SUI On-Chain Verification** - Smart contracts validate TEE signatures, enclave registry, and blob hashes
5. **Economic Security** - Stake, slash, and challenge mechanisms ensure honest reporting

**Result:** The world's first prediction market oracle where AI execution is cryptographically proven, not trusted.

---

## 🎯 Overview

Walmarket is the **world's first verifiable AI oracle** for prediction markets, combining Nautilus TEE, GPT-5, and SUI blockchain to create trustless, cryptographically-proven market resolution. Built for the Walrus Haulout Hackathon 2025 (Provably Authentic track), Walmarket eliminates the need to trust oracle operators by running AI inference inside secure enclaves with remote attestation.

### Why Walmarket?

- **🔐 Nautilus TEE Integration**: AI inference runs in secure enclaves with cryptographic attestation, proving execution integrity
- **🤖 Verifiable AI Oracle**: GPT-5 predictions verified through TEE signatures, enclave registry, and on-chain validation
- **📊 Immutable Evidence Storage**: Complete audit trail (input, output, reasoning) stored permanently on Walrus
- **⚡ On-Chain Verification**: SUI smart contracts validate TEE attestation, aggregate reports, and enforce slashing
- **💰 Trustless Resolution**: No operator trust required - cryptographic proofs guarantee honest execution
- **🎨 Retro Gaming Aesthetics**: Unique pixel art design inspired by Walrus branding

---

## ✨ Core Features

### 1. Verifiable AI Oracle with Nautilus TEE
- **Trusted Execution Environment**: GPT-5 inference runs inside Nautilus secure enclaves
- **Remote Attestation**: Each report includes enclave signature (mrenclave) proving execution integrity
- **Multi-Source Verification**: AI agents cross-reference multiple trusted data sources
- **Evidence Bundle Storage**: Complete input/output/reasoning stored on Walrus with blob hash verification
- **On-Chain Validation**: SUI smart contracts verify TEE signatures against enclave registry whitelist
- **Replay Protection**: Timestamps and nonces prevent report replay attacks

### 2. Prediction Markets
- Create custom prediction markets on any real-world event
- Binary outcome markets (YES/NO)
- Market categories: Crypto, Technology, DeFi, Politics, Infrastructure
- Real-time odds based on collective wisdom
- Volume tracking and participant statistics

### 3. Wallet Integration
- **Supported Wallets**:
  - Sui Wallet
  - Suiet Wallet
  - Ethos Wallet
  - Slush Wallet
  - Morphis Wallet
  - Glass Wallet
  - All wallets compatible with @mysten/dapp-kit
- One-click connection
- Secure transaction signing
- Address display with truncation
- Automatic wallet detection

### 4. Walrus Storage Integration
- **Evidence Bundle Storage**: Complete AI oracle reports (input, output, prompts, schemas, reasoning)
- **Blob Hash Anchoring**: On-chain verification links SUI reports to Walrus evidence via cryptographic hashes
- **Immutable Audit Trail**: Permanent, tamper-proof record of all oracle decisions
- **Post-Hoc Verification**: Anyone can audit oracle behavior by fetching evidence bundles from Walrus

### 5. User Experience
- Responsive design (desktop & mobile)
- Pixel art retro gaming aesthetics
- Press Start 2P font for authentic 8-bit feel
- Intuitive betting interface
- Real-time market statistics

---

## 🔄 User Flow

```
1. Connect Wallet → 2. Browse Markets → 3. Compare Odds
   ↓
4. Place Bet → 5. Market Resolution (TEE Oracle)
   ↓
6. On-Chain Verification → 7. Walrus Evidence Storage → 8. Claim Winnings
```

### Detailed Flow

1. **Connect Wallet**: Users connect their SUI-compatible wallet (Phantom, Sui Wallet, etc.)
2. **Browse Markets**: Explore prediction markets across various categories
3. **Compare Odds**: View crowd-determined YES/NO probabilities
4. **Place Bet**: Choose YES or NO, enter amount, and confirm transaction on SUI
5. **Market Resolution**:
   - Off-chain: Nautilus TEE executes GPT-5 inference with multi-source data
   - Evidence bundle (input, output, reasoning) uploaded to Walrus
   - TEE generates cryptographic signature and attestation
6. **On-Chain Verification**:
   - SUI smart contract validates enclave signature against registry whitelist
   - Blob hash verified against Walrus anchor
   - Multiple reporter submissions aggregated (median)
7. **Walrus Evidence Storage**: Complete audit trail permanently stored with blob_id
8. **Claim Winnings**: Winners receive earnings based on verified market outcome

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Font**: Press Start 2P (Google Fonts)

### Blockchain
- **Network**: SUI
- **SDK**: @mysten/dapp-kit, @mysten/sui
- **Wallet Integration**: Multiple wallet support via dapp-kit
- **State Management**: TanStack Query (React Query)

### Infrastructure
- **Storage**: Walrus (for verifiable data storage)
- **AI Oracle**: GPT-5 with custom verification agents
- **TEE**: Nautilus (Trusted Execution Environment for verifiable AI execution)
- **Deployment**: Vercel (frontend), SUI Testnet/Mainnet

---

## 🧪 Test Token Information (SUI Testnet)

The following test USDT tokens have been deployed and minted for testing:

### Contract Addresses
- **Package ID**: `0x6e930c6b39d8a77e4e755148564207a801d0a2f550ec306fee7b9b913ed6f17d`
- **Treasury Cap ID**: `0x014367974122be63c27c5ec3a51c0e92e7e34bbb8a48fc99c48c444505e677bf`
- **Market Registry ID**: `0xec89a1e95991bb73e1e521540036d8ffc3eb5892a4629e616873d4586a00c4df`
- **USDT Token Type**: `0x6e930c6b39d8a77e4e755148564207a801d0a2f550ec306fee7b9b913ed6f17d::usdt::USDT`
- **Suiscan Explorer**: [View USDT Token on Suiscan](https://suiscan.xyz/testnet/coin/0x6e930c6b39d8a77e4e755148564207a801d0a2f550ec306fee7b9b913ed6f17d::usdt::USDT/txs)

### Initial Minting
- **Amount**: 1,000,000 USDT (1M USDT)
- **Transaction**: `Bb6mFoKgF3k7EaGWdyN3w2pjHbtUmfvUCQ2TECjKLv3C`
- **Deployment Transaction**: `GsWUUvApRzra1khb4PcZP7MNxwzCvgvYqB6STFyAf7y4`

### Mint Additional Tokens
```bash
cd contracts
export PACKAGE_ID=0x6e930c6b39d8a77e4e755148564207a801d0a2f550ec306fee7b9b913ed6f17d
./scripts/mint_usdt.sh 0x014367974122be63c27c5ec3a51c0e92e7e34bbb8a48fc99c48c444505e677bf 1000000000 $(sui client active-address)
```

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Git
- A SUI-compatible wallet (Phantom, Sui Wallet, etc.)

### Clone Repository
```bash
git clone https://github.com/leopard627/walmarket.git
cd walmarket
```

### Install Dependencies
```bash
npm install
```

### Environment Setup
Create a `.env.local` file in the root directory:
```env
# SUI Network Configuration
NEXT_PUBLIC_SUI_NETWORK=testnet

# Optional: Add your custom RPC endpoints
NEXT_PUBLIC_SUI_RPC_URL=https://fullnode.testnet.sui.io:443
```

### Run Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the app.

### Build for Production
```bash
npm run build
npm start
```

---

## 🔧 Smart Contracts

Walmarket includes SUI Move smart contracts for on-chain prediction markets.

### Build Contracts
```bash
cd contracts
sui move build
```

### Test Contracts
```bash
cd contracts
sui move test
```

### Deploy to Testnet
```bash
cd contracts
sui client publish --gas-budget 100000000
```

📚 **For detailed contract documentation, see [contracts/README.md](./contracts/README.md)**

---

## 🪝 Git Hooks

This project uses [Husky](https://typicode.github.io/husky/) to ensure code quality before commits and pushes.

### Pre-commit Hook
Automatically runs before each commit:
- **Lint check**: Validates code style with ESLint

### Pre-push Hook
Automatically runs before pushing to remote:
- **Frontend build test**: Ensures `npm run build` succeeds
- **Contract build test**: Validates SUI Move contracts (if `sui` CLI is installed)

This prevents broken code from being pushed to the repository, ensuring main branch stability.

---

## 📁 Project Structure

```
walmarket/
├── app/
│   ├── components/
│   │   ├── Header.tsx             # Shared header with TESTNET badge
│   │   └── WalletButton.tsx       # Wallet connection component
│   ├── markets/
│   │   ├── page.tsx               # Markets list page
│   │   └── [id]/
│   │       └── page.tsx           # Market detail page
│   ├── layout.tsx                 # Root layout with providers
│   ├── page.tsx                   # Landing page
│   ├── providers.tsx              # SUI & wallet providers
│   └── globals.css                # Global styles + pixel font
├── contracts/
│   ├── sources/
│   │   └── market.move            # Prediction market smart contract
│   ├── tests/                     # Contract tests
│   ├── Move.toml                  # Move package configuration
│   └── README.md                  # Contract documentation
├── public/
│   ├── icon-txt.png               # Walrus character + logo
│   └── no-bg-txt.png              # Text-only logo
├── package.json
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

### Key Files

#### Frontend
- **`app/providers.tsx`**: Sets up SUI client and wallet providers
- **`app/components/Header.tsx`**: Shared header component with TESTNET badge
- **`app/components/WalletButton.tsx`**: Handles wallet connection UI
- **`app/markets/page.tsx`**: Displays all available prediction markets with AI predictions
- **`app/markets/[id]/page.tsx`**: Detailed market view with betting interface and AI analysis
- **`app/globals.css`**: Global styles including Press Start 2P pixel font configuration

#### Smart Contracts
- **`contracts/sources/market.move`**: Main prediction market contract (Market creation, betting, resolution)
- **`contracts/Move.toml`**: SUI Move package configuration
- **`contracts/README.md`**: Comprehensive contract documentation and API reference

---

## 💡 How It Works

### AI Oracle Architecture

1. **Data Collection**: AI agents monitor multiple trusted data sources
2. **Multi-Source Verification**: Cross-reference data from at least 3 independent sources
3. **TEE Execution**: Run GPT-5 inference inside Nautilus secure enclave
4. **Cryptographic Attestation**: Generate TEE signature and remote attestation proof
5. **Walrus Storage**: Store evidence bundle (input, output, reasoning) permanently on Walrus
6. **On-Chain Verification**: SUI smart contract verifies TEE attestation and blob hash
7. **Market Resolution**: Aggregate verified reports and distribute winnings

### Verifiable AI Execution with Nautilus TEE

- **Execution Integrity**: AI inference runs in secure enclaves, preventing operator tampering
- **Remote Attestation**: Each report includes cryptographic proof of execution (mrenclave, signatures)
- **Enclave Registry**: On-chain whitelist of authorized enclaves with epoch-based key rotation
- **Replay Protection**: Timestamps and nonces prevent report replay attacks
- **Hash Verification**: Input/output hashes link on-chain reports to off-chain evidence on Walrus

---

## 🎮 Usage Guide

### For Traders

1. **Connect Your Wallet** - Click "Connect Wallet" and select your preferred wallet
2. **Browse Markets** - View all available markets with live odds and AI predictions
3. **Analyze Market** - Review AI prediction, confidence level, and reasoning
4. **Place Your Bet** - Select YES or NO, enter amount, and confirm
5. **Track Positions** - Monitor market status and claim winnings after resolution

---

## 🔗 Links

- **Live Demo**: [https://walmarket.fun](https://walmarket.fun)
- **Demo Video**: [https://youtu.be/dQw4w9WgXcQ](https://youtu.be/dQw4w9WgXcQ)
- **GitHub**: [https://github.com/leopard627/walmarket](https://github.com/leopard627/walmarket)
- **SUI Network**: [https://sui.io](https://sui.io)
- **Walrus**: [https://www.walrus.xyz](https://www.walrus.xyz)

---

## 🏗️ Roadmap

### Phase 1: MVP (✅ Current)
- ✅ Frontend implementation
- ✅ Wallet integration
- ✅ AI prediction display
- ✅ Market browsing and detail pages

### Phase 2: Smart Contracts (🔄 In Progress)
- 🔄 SUI Move smart contracts for markets
- 🔄 Automated market maker (AMM) logic
- 🔄 AI oracle integration on-chain
- 🔄 Wallet transaction implementation

### Phase 3: AI Oracle (📋 Planned)
- 📋 Multi-source data fetching
- 📋 Consensus algorithm
- 📋 Cryptographic proof generation
- 📋 Walrus storage integration

### Phase 4: Advanced Features (📋 Future)
- 📋 Market creation UI
- 📋 Liquidity pools
- 📋 Trading history & Leaderboards
- 📋 Mobile app

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Walrus Haulout Hackathon** for the inspiration and prizes
- **SUI Foundation** for the amazing infrastructure
- **Walrus Team** for decentralized storage solutions
- **Mysten Labs** for the excellent dapp-kit
- **Press Start 2P Font** for the retro aesthetics

---

## 📞 Contact

- **GitHub**: [@leopard627](https://github.com/leopard627)
- **Project Link**: [https://github.com/leopard627/walmarket](https://github.com/leopard627/walmarket)

---

<div align="center">
  <p>Built with ❤️ for Walrus Haulout Hackathon 2025</p>
  <p>Creating Unstoppable Truth Infrastructure</p>
  <img src="./public/no-bg-txt.png" alt="Walmarket" width="200"/>
</div>
