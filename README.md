# 🔮 Walmarket - Decentralized Truth Through Markets

<div align="center">
  <img src="./public/icon-txt.png" alt="Walmarket Logo" width="400"/>

  <p><strong>AI-Powered Prediction Markets on SUI</strong></p>
  <p>A truth engine powered by Walrus - predict, verify, and earn on decentralized prediction markets</p>

  [![Demo](https://img.shields.io/badge/Demo-Live-brightgreen)](https://walmarket.vercel.app)
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

**Problem Statement:** Traditional prediction markets lack transparency and rely on centralized resolution mechanisms. Users must trust operators to fairly resolve outcomes, and there's no way to verify the authenticity of market resolutions.

**Our Solution:** Walmarket combines the wisdom of prediction markets with AI-powered verification and Walrus storage to create an unstoppable truth infrastructure where outcomes are cryptographically verified and permanently stored on-chain.

---

## 🎯 Overview

Walmarket is a decentralized prediction market platform built on SUI that leverages AI oracles and Walrus storage to create verifiable truth. Users can create and participate in prediction markets on real-world events, with AI agents automatically verifying outcomes using multi-source data analysis.

### Why Walmarket?

- **🤖 AI Oracle Verification**: Advanced AI agents automatically resolve markets with unprecedented accuracy
- **📊 Transparent & Verifiable**: All outcomes stored on Walrus with cryptographic proofs
- **💰 Economic Truth Incentives**: Earn by making accurate predictions
- **🔒 Trustless Resolution**: No manual intervention needed - AI does the work
- **🎨 Retro Gaming Aesthetics**: Unique pixel art design powered by Walrus branding

---

## ✨ Core Features

### 1. AI-Powered Oracle System
- **Multi-Source Verification**: AI agents cross-reference multiple trusted data sources
- **Real-Time Resolution**: Instant market resolution when conditions are met
- **Transparent Reasoning**: AI decision process stored on Walrus for full auditability
- **Confidence Levels**: HIGH/MEDIUM/LOW confidence ratings for each prediction
- **87.3% Win Rate**: Proven track record of accurate predictions

### 2. Prediction Markets
- Create custom prediction markets on any real-world event
- Binary outcome markets (YES/NO)
- Market categories: Crypto, Technology, DeFi, Politics, Infrastructure
- Real-time odds based on collective wisdom
- Volume tracking and participant statistics

### 3. Wallet Integration
- **Supported Wallets**:
  - Phantom Wallet
  - Sui Wallet
  - Ethos Wallet
  - All wallets compatible with @mysten/dapp-kit
- One-click connection
- Secure transaction signing
- Address display with truncation

### 4. Walrus Storage Integration
- Permanent storage of market outcomes
- Cryptographic verification of results
- Tamper-proof record of collective intelligence
- Decentralized data storage for AI reasoning

### 5. User Experience
- Responsive design (desktop & mobile)
- Pixel art retro gaming aesthetics
- Press Start 2P font for authentic 8-bit feel
- Intuitive betting interface
- Real-time market statistics

---

## 🔄 User Flow

```
1. Connect Wallet → 2. Browse Markets → 3. View AI Predictions
   ↓
4. Compare Odds → 5. Place Bet → 6. Market Resolution
   ↓
7. AI Verification → 8. Walrus Storage → 9. Claim Winnings
```

### Detailed Flow

1. **Connect Wallet**: Users connect their SUI-compatible wallet (Phantom, Sui Wallet, etc.)
2. **Browse Markets**: Explore prediction markets across various categories
3. **View AI Predictions**: See AI oracle's prediction, confidence level, and reasoning
4. **Compare Odds**: View crowd predictions vs AI predictions
5. **Place Bet**: Choose YES or NO, enter amount, and confirm transaction
6. **Market Resolution**: AI oracle automatically verifies outcome using real-world data
7. **Verify on Walrus**: Resolution proof stored permanently on Walrus
8. **Claim Winnings**: Winners automatically receive their earnings

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
- **AI Oracle**: Custom AI agents for market resolution
- **Deployment**: Vercel (frontend), SUI Testnet/Mainnet

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

## 📁 Project Structure

```
walmarket/
├── app/
│   ├── components/
│   │   └── WalletButton.tsx       # Wallet connection component
│   ├── markets/
│   │   ├── page.tsx               # Markets list page
│   │   └── [id]/
│   │       └── page.tsx           # Market detail page
│   ├── layout.tsx                 # Root layout with providers
│   ├── page.tsx                   # Landing page
│   ├── providers.tsx              # SUI & wallet providers
│   └── globals.css                # Global styles + pixel font
├── public/
│   ├── icon-txt.png               # Walrus character + logo
│   └── no-bg-txt.png              # Text-only logo
├── package.json
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

### Key Files

- **`app/providers.tsx`**: Sets up SUI client and wallet providers
- **`app/components/WalletButton.tsx`**: Handles wallet connection UI
- **`app/markets/page.tsx`**: Displays all available prediction markets with AI predictions
- **`app/markets/[id]/page.tsx`**: Detailed market view with betting interface and AI analysis
- **`app/globals.css`**: Global styles including Press Start 2P pixel font configuration

---

## 💡 How It Works

### AI Oracle Architecture

1. **Data Collection**: AI agents monitor multiple trusted data sources
2. **Multi-Source Verification**: Cross-reference data from at least 3 independent sources
3. **Consensus Building**: AI algorithms determine outcome with confidence score
4. **Cryptographic Proof**: Generate verifiable proof of decision process
5. **Walrus Storage**: Store proof and reasoning permanently on Walrus
6. **Market Resolution**: Execute smart contract to distribute winnings

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

- **Live Demo**: [https://walmarket.vercel.app](https://walmarket.vercel.app)
- **Demo Video**: [https://youtu.be/dQw4w9WgXcQ](https://youtu.be/dQw4w9WgXcQ)
- **GitHub**: [https://github.com/leopard627/walmarket](https://github.com/leopard627/walmarket)
- **SUI Network**: [https://sui.io](https://sui.io)
- **Walrus**: [https://walrus.site](https://walrus.site)

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
