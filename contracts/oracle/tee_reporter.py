"""
TEE Reporter - Main Orchestrator for Walmarket AI Oracle

⚠️ WARNING: This is a Proof-of-Concept (PoC) implementation for the Walrus Haulout Hackathon.
DO NOT use in production without proper security audits, error handling, and production-grade infrastructure.

This module orchestrates the complete AI Oracle flow:
1. Data collection from trusted sources
2. GPT-5 inference in TEE environment (simulated)
3. Evidence bundle creation
4. Walrus storage upload
5. TEE signature generation
6. Final report assembly
"""
import json
import time
from typing import Dict, Any, List
import config
from openai_inference import GPT5Inference
from walrus_uploader import WalrusUploader
from signature_generator import TEESignatureGenerator


class TEEReporter:
    """
    Main orchestrator for AI Oracle reports

    ⚠️ PoC Warning: This is a simplified orchestrator for hackathon demonstration.
    Production version requires:
    - Actual Nautilus TEE integration
    - Real data source APIs
    - Error recovery and retry logic
    - Monitoring and alerting
    - Rate limiting and cost controls
    """

    def __init__(
        self,
        openai_api_key: str = None,
        walrus_cli_path: str = None,
        enable_walrus_upload: bool = False
    ):
        """
        Initialize TEE Reporter

        Args:
            openai_api_key: OpenAI API key (defaults to config)
            walrus_cli_path: Path to Walrus CLI (defaults to config)
            enable_walrus_upload: Actually upload to Walrus (default: False for safety)

        ⚠️ PoC Warning: Set enable_walrus_upload=True only for testing with real Walrus CLI
        """
        self.gpt5 = GPT5Inference(api_key=openai_api_key)
        self.walrus = WalrusUploader(walrus_cli_path=walrus_cli_path)
        self.tee_signer = TEESignatureGenerator()
        self.enable_walrus_upload = enable_walrus_upload

        print("=" * 70)
        print("⚠️  Walmarket AI Oracle - PoC Implementation  ⚠️")
        print("=" * 70)
        if not enable_walrus_upload:
            print("  Walrus upload is DISABLED (simulation mode)")
        print()

    def collect_data_sources(
        self,
        market_question: str,
        category: str
    ) -> List[Dict[str, Any]]:
        """
        Collect data from trusted sources

        Args:
            market_question: The prediction market question
            category: Market category (crypto, politics, sports, etc.)

        Returns:
            List of data sources with fetched data

        ⚠️ PoC SIMULATION: This returns mock data.
        Real implementation would fetch from actual APIs.
        """
        # Get relevant data source URLs for category
        source_urls = config.DATA_SOURCES.get(category.lower(), [])

        # Simulate data collection
        # ⚠️ In production, actually fetch from APIs
        sources = []

        if category.lower() == "crypto":
            sources = [
                {
                    "id": "coinmarketcap:btc",
                    "url": "https://coinmarketcap.com/currencies/bitcoin/",
                    "data": "Current BTC price: $95,234 (Dec 30, 2024 14:30 UTC)"
                },
                {
                    "id": "coingecko:btc",
                    "url": "https://www.coingecko.com/en/coins/bitcoin",
                    "data": "Current BTC price: $95,180 (Dec 30, 2024 14:31 UTC)"
                },
                {
                    "id": "binance:btc",
                    "url": "https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT",
                    "data": "BTC/USDT: $95,195 (Dec 30, 2024 14:30 UTC)"
                }
            ]
        elif category.lower() == "politics":
            sources = [
                {
                    "id": "ap_news:election_2024",
                    "url": "https://apnews.com/...",
                    "data": "Mock political data for testing"
                }
            ]
        else:
            sources = [
                {
                    "id": "generic:source1",
                    "url": "https://example.com/...",
                    "data": f"Mock data for {category} category"
                }
            ]

        return sources

    def create_resolution_report(
        self,
        market_id: str,
        market_question: str,
        category: str,
        resolution_criteria: str,
        round_number: int = 1
    ) -> Dict[str, Any]:
        """
        Create complete resolution report with TEE attestation

        Args:
            market_id: Market ID on SUI
            market_question: The prediction market question
            category: Market category
            resolution_criteria: How to resolve the market
            round_number: Report round number

        Returns:
            Complete resolution report with TEE proof

        ⚠️ PoC Warning: This demonstrates the full flow but uses simulated TEE
        """
        print(f"\n{'='*70}")
        print(f"Creating Resolution Report for Market: {market_id}")
        print(f"Question: {market_question}")
        print(f"{'='*70}\n")

        # Step 1: Collect data from sources
        print("[1/6] Collecting data from trusted sources...")
        sources = self.collect_data_sources(market_question, category)
        print(f"      ✓ Collected data from {len(sources)} sources")

        # Step 2: Run GPT-5 inference
        print("[2/6] Running GPT-5 inference...")
        inference_result = self.gpt5.infer(
            question=market_question,
            sources=sources,
            resolution_criteria=resolution_criteria
        )
        print(f"      ✓ Inference complete (tokens: {inference_result['metadata']['tokens_used']})")

        # Validate output
        is_valid = self.gpt5.validate_output(inference_result['output'])
        if not is_valid:
            raise ValueError("GPT-5 output failed validation")
        print(f"      ✓ Output validation passed")

        # Step 3: Create evidence bundle
        print("[3/6] Creating evidence bundle...")
        timestamp = int(time.time())
        metadata = {
            **inference_result['metadata'],
            "timestamp": timestamp,
            "market_id": market_id,
            "category": category
        }

        evidence_bundle = self.walrus.create_evidence_bundle(
            inference_input=inference_result['input'],
            inference_output=inference_result['output'],
            metadata=metadata
        )
        print(f"      ✓ Evidence bundle created")

        # Step 4: Upload to Walrus (or simulate)
        print("[4/6] Uploading evidence to Walrus...")
        if self.enable_walrus_upload:
            blob_id, blob_hash = self.walrus.upload_to_walrus(evidence_bundle)
            print(f"      ✓ Uploaded to Walrus")
            print(f"        Blob ID: {blob_id}")
            print(f"        Blob Hash: {blob_hash}")
        else:
            # Simulate Walrus upload
            import hashlib
            blob_id = "SIMULATED_" + hashlib.sha256(json.dumps(evidence_bundle).encode()).hexdigest()[:32]
            blob_hash = self.walrus.hash_bundle(evidence_bundle)
            print(f"      ⚠ Simulated upload (Walrus upload disabled)")
            print(f"        Simulated Blob ID: {blob_id}")
            print(f"        Blob Hash: {blob_hash}")

        # Step 5: Generate TEE proof
        print("[5/6] Generating TEE attestation...")
        tee_proof = self.tee_signer.create_tee_proof(
            inference_input=inference_result['input'],
            inference_output=inference_result['output'],
            blob_id=blob_id,
            blob_hash=blob_hash
        )
        print(f"      ⚠ TEE proof generated (SIMULATED for PoC)")

        # Step 6: Assemble final report
        print("[6/6] Assembling final resolution report...")

        # Calculate hashes for controls
        import hashlib
        prompt_hash = inference_result['metadata']['prompt_hash']
        parser_hash = "0x" + hashlib.sha256(b"parser_v1").hexdigest()
        schema_hash = "0x" + hashlib.sha256(json.dumps(config.RESOLUTION_SCHEMA).encode()).hexdigest()

        final_report = {
            "round": round_number,
            "task": "binary",
            "resolution": inference_result['output']['resolution'],
            "sources": inference_result['output']['sources'],
            "rationale": inference_result['output']['rationale'],
            "controls": {
                "model_id": config.GPT5_MODEL,
                "prompt_hash": prompt_hash,
                "parser_hash": parser_hash,
                "schema_hash": schema_hash
            },
            "tee_proof": tee_proof
        }

        print(f"      ✓ Resolution report complete\n")

        return final_report


def main():
    """
    Example usage - Create a resolution report for a test market

    ⚠️ PoC Warning: This is for demonstration only
    """
    # Initialize reporter (Walrus upload disabled by default)
    reporter = TEEReporter(enable_walrus_upload=False)

    # Example market
    market_id = "0xe50c1c46468a510e2bef9e056e52eef552edf0b0ff7f7490d9f695f15139b470"
    market_question = "Will BTC reach $100k by end of 2024?"
    category = "Crypto"
    resolution_criteria = (
        "Market resolves YES if Bitcoin reaches $100,000 USD on any major exchange "
        "(Coinbase, Binance, Kraken) before Dec 31, 2024 23:59:59 UTC. "
        "Price must be sustained for at least 1 minute."
    )

    # Create resolution report
    report = reporter.create_resolution_report(
        market_id=market_id,
        market_question=market_question,
        category=category,
        resolution_criteria=resolution_criteria,
        round_number=12345
    )

    # Display result
    print("\n" + "="*70)
    print("RESOLUTION REPORT")
    print("="*70)
    print(json.dumps(report, indent=2))
    print("\n" + "="*70)
    print("⚠️  This is a PoC simulation for hackathon demonstration")
    print("   Real production requires actual Nautilus TEE integration")
    print("="*70)


if __name__ == "__main__":
    main()
