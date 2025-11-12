# Walmarket AI Oracle with Nautilus TEE

## ⚠️ IMPORTANT: Proof-of-Concept Implementation

**THIS IS A PoC DEMONSTRATION FOR THE WALRUS HAULOUT HACKATHON 2025**

This code **SIMULATES** the Nautilus TEE integration for demonstration purposes. It is **NOT** production-ready and should **NOT** be used in any live environment.

### What This PoC Demonstrates:
✅ Complete AI Oracle workflow architecture
✅ GPT-5 integration with deterministic prompts
✅ Walrus evidence storage integration
✅ TEE attestation data structures
✅ Cryptographic proof concepts

### What This PoC Does NOT Include:
❌ Real Nautilus TEE hardware integration
❌ Production-grade error handling
❌ Security audits
❌ Rate limiting and cost controls
❌ Multi-node redundancy
❌ Real remote attestation

---

## Overview

The Walmarket AI Oracle combines GPT-5, Walrus storage, and Nautilus TEE to create verifiable, tamper-proof prediction market resolution. This PoC implementation demonstrates the complete workflow.

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Walmarket AI Oracle                      │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────────┐   ┌───────────────┐
│ Data Sources │    │  GPT-5 Inference │   │ Walrus Storage│
│   (APIs)     │───▶│   (Nautilus TEE) │──▶│   (Evidence)  │
└──────────────┘    └──────────────────┘   └───────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  TEE Attestation │
                    │   (Signatures)   │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  SUI Smart       │
                    │  Contract        │
                    └──────────────────┘
```

### Workflow

1. **Data Collection**: Gather data from multiple trusted sources (CoinMarketCap, Reuters, etc.)
2. **GPT-5 Inference**: Analyze data using fixed prompts in TEE environment
3. **Evidence Bundle**: Package input, output, and metadata
4. **Walrus Upload**: Store evidence permanently on Walrus
5. **TEE Signature**: Generate cryptographic proof (simulated)
6. **Resolution Report**: Assemble final report with all proofs

---

## Installation

### Prerequisites

- Python 3.9+
- OpenAI API key (for GPT-5)
- Walrus CLI (optional, for actual uploads)
- SUI CLI (for on-chain submission)

### Setup

```bash
# Navigate to oracle directory
cd contracts/oracle

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export OPENAI_API_KEY="your_openai_api_key_here"
export WALRUS_CLI_PATH="/path/to/walrus"  # Optional
```

---

## Usage

### Run Complete Oracle Flow

```bash
# Run the TEE reporter (simulation mode)
python tee_reporter.py
```

This will:
1. Collect simulated data sources
2. Run GPT-5 inference
3. Create evidence bundle
4. Simulate Walrus upload
5. Generate TEE proof (simulated)
6. Output complete resolution report

### Run Individual Modules

#### GPT-5 Inference Only

```bash
python openai_inference.py
```

#### Walrus Uploader Only

```bash
python walrus_uploader.py
```

#### TEE Signature Generator Only

```bash
python signature_generator.py
```

---

## Testing

```bash
# Run all tests
pytest tests/ -v

# Run specific test file
pytest tests/test_inference.py -v

# Run with coverage
pytest tests/ --cov=. --cov-report=html
```

---

## File Structure

```
oracle/
├── README.md                   # This file
├── requirements.txt            # Python dependencies
├── config.py                   # Configuration and constants
├── openai_inference.py         # GPT-5 API integration
├── walrus_uploader.py          # Walrus storage integration
├── signature_generator.py      # TEE attestation (simulated)
├── tee_reporter.py             # Main orchestrator
├── example_output.json         # Example resolution report
└── tests/
    ├── test_inference.py       # GPT-5 inference tests
    ├── test_walrus.py          # Walrus uploader tests
    └── test_tee.py             # TEE signature tests
```

---

## Configuration

Edit `config.py` to customize:

- **GPT-5 Model**: `GPT5_MODEL = "gpt-5-thinking@2025-11-POC"`
- **Data Sources**: Add/remove API endpoints in `DATA_SOURCES`
- **TEE Settings**: Enclave IDs and measurement hashes
- **Walrus Settings**: Epochs, CLI path, etc.

---

## Example Output

See `example_output.json` for a complete resolution report structure.

Key components:
- **resolution**: Binary value (0/1) with confidence score
- **sources**: List of data sources with quote hashes
- **rationale**: AI's reasoning for the decision
- **controls**: Model ID, prompt hash, schema hash
- **tee_proof**: Complete TEE attestation (simulated)

---

## Security Warnings

### ⚠️ DO NOT Use in Production

This PoC has **NOT** been audited and contains:
- Simulated TEE attestation (not real secure enclaves)
- Basic error handling only
- No rate limiting
- No cost controls
- Simplified cryptography

### For Production Deployment, You Must:

1. **Integrate Real Nautilus TEE**
   - Use actual Intel SGX or AMD SEV hardware
   - Implement real remote attestation
   - Use Nautilus SDK properly

2. **Security Audits**
   - Professional smart contract audit
   - Cryptography review
   - Penetration testing

3. **Infrastructure**
   - Multi-node validator network
   - Redundant data sources
   - Monitoring and alerting
   - Automated failover

4. **Economic Modeling**
   - Game theory analysis
   - Attack vector mitigation
   - Stake and slash mechanisms

---

## Development Roadmap

### Phase 1 ✅ (Hackathon - Current)
- PoC implementation
- Architecture demonstration
- Basic testing

### Phase 2 (Next 3 Months)
- Real Nautilus TEE integration
- Multi-source data aggregation
- Production error handling
- Rate limiting and monitoring

### Phase 3 (6-12 Months)
- Mainnet deployment
- Validator network launch
- Economic incentives
- Governance DAO

---

## Contributing

This is a hackathon project. For questions or suggestions:
- GitHub: https://github.com/leopard627/walmarket
- LinkedIn: https://www.linkedin.com/in/jihun-kim-556a32110/

---

## License

MIT License - See [LICENSE](../../LICENSE) for details

---

## Acknowledgments

Built for **Walrus Haulout Hackathon 2025** using:
- SUI Blockchain
- Walrus Decentralized Storage
- Nautilus TEE (concept integration)
- GPT-5 AI
- OpenAI API

---

**Remember: This is a Proof-of-Concept for demonstration purposes only!**
