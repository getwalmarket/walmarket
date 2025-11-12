"""
Walrus Storage Uploader for Evidence Bundles

⚠️ WARNING: This is a Proof-of-Concept (PoC) implementation for the Walrus Haulout Hackathon.
DO NOT use in production without proper security audits, error handling, and production-grade infrastructure.

This module handles:
- Evidence bundle creation
- Upload to Walrus decentralized storage
- Blob ID and hash extraction
- Verification
"""
import json
import hashlib
import subprocess
import tempfile
import os
from typing import Dict, Any, Tuple
import config


class WalrusUploader:
    """Handles uploading evidence bundles to Walrus storage"""

    def __init__(self, walrus_cli_path: str = None, epochs: int = None):
        """
        Initialize Walrus uploader

        Args:
            walrus_cli_path: Path to walrus CLI (defaults to config.WALRUS_CLI_PATH)
            epochs: Number of epochs to store (defaults to config.WALRUS_EPOCHS)
        """
        self.walrus_cli = walrus_cli_path or config.WALRUS_CLI_PATH
        self.epochs = epochs or config.WALRUS_EPOCHS

        # Verify walrus CLI is available
        try:
            subprocess.run(
                [self.walrus_cli, "--version"],
                capture_output=True,
                check=True
            )
        except (subprocess.CalledProcessError, FileNotFoundError):
            raise RuntimeError(
                f"Walrus CLI not found at {self.walrus_cli}. "
                "Please install Walrus CLI or set WALRUS_CLI_PATH environment variable."
            )

    def create_evidence_bundle(
        self,
        inference_input: Dict[str, Any],
        inference_output: Dict[str, Any],
        metadata: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Create evidence bundle with all data needed for verification

        Args:
            inference_input: Input data to GPT-5
            inference_output: Output from GPT-5
            metadata: Additional metadata (model, prompt_hash, etc.)

        Returns:
            Evidence bundle as dictionary
        """
        bundle = {
            "version": "1.0",
            "timestamp": metadata.get("timestamp", 0),
            "input": inference_input,
            "output": inference_output,
            "metadata": metadata
        }

        return bundle

    def hash_bundle(self, bundle: Dict[str, Any]) -> str:
        """
        Create SHA256 hash of evidence bundle

        Args:
            bundle: Evidence bundle

        Returns:
            SHA256 hash (hex string with 0x prefix)
        """
        # Serialize to JSON with sorted keys for deterministic hashing
        bundle_json = json.dumps(bundle, sort_keys=True, separators=(',', ':'))
        bundle_hash = hashlib.sha256(bundle_json.encode()).hexdigest()
        return f"0x{bundle_hash}"

    def upload_to_walrus(self, bundle: Dict[str, Any]) -> Tuple[str, str]:
        """
        Upload evidence bundle to Walrus storage

        Args:
            bundle: Evidence bundle to upload

        Returns:
            Tuple of (blob_id, blob_hash)

        Raises:
            RuntimeError: If upload fails

        ⚠️ PoC Warning: This is a simplified implementation. Production version should include:
            - Retry logic
            - Upload progress tracking
            - Verification of upload success
            - Cost estimation
            - Multi-node redundancy
        """
        # Create temporary file for upload
        with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
            json.dump(bundle, f, indent=2)
            temp_file = f.name

        try:
            # Upload to Walrus
            result = subprocess.run(
                [self.walrus_cli, "store", "--epochs", str(self.epochs), temp_file],
                capture_output=True,
                text=True,
                check=True
            )

            # Parse output to extract blob ID
            output = result.stdout
            blob_id = None

            for line in output.split('\n'):
                if "Blob ID:" in line:
                    # Extract blob ID from "Blob ID: Cu7KD1o8bwuW-rCVihj40Nu-iHBBRjy-C6eJJgiXqPw"
                    blob_id = line.split("Blob ID:")[1].strip()
                    break

            if not blob_id:
                raise RuntimeError(f"Failed to extract blob ID from Walrus output: {output}")

            # Calculate blob hash
            blob_hash = self.hash_bundle(bundle)

            return blob_id, blob_hash

        except subprocess.CalledProcessError as e:
            raise RuntimeError(f"Walrus upload failed: {e.stderr}")

        finally:
            # Clean up temporary file
            if os.path.exists(temp_file):
                os.remove(temp_file)

    def verify_upload(self, blob_id: str, expected_hash: str) -> bool:
        """
        Verify uploaded blob by reading it back from Walrus

        Args:
            blob_id: Blob ID to verify
            expected_hash: Expected hash of the blob

        Returns:
            True if verification succeeds, False otherwise

        ⚠️ PoC Warning: This requires walrus read functionality.
        In production, implement multi-node verification.
        """
        try:
            # Read blob from Walrus
            result = subprocess.run(
                [self.walrus_cli, "read", blob_id],
                capture_output=True,
                text=True,
                check=True
            )

            # Parse JSON and hash
            blob_data = json.loads(result.stdout)
            actual_hash = self.hash_bundle(blob_data)

            return actual_hash == expected_hash

        except Exception as e:
            print(f"Warning: Verification failed: {e}")
            return False


def main():
    """
    Example usage

    ⚠️ PoC Warning: This is for testing only.
    """
    uploader = WalrusUploader()

    # Create example evidence bundle
    inference_input = {
        "question": "Will BTC reach $100k by end of 2024?",
        "sources": [
            {
                "id": "coinmarketcap:btc",
                "url": "https://coinmarketcap.com/currencies/bitcoin/",
                "data": "Current BTC price: $95,234"
            }
        ],
        "resolution_criteria": "Market resolves YES if Bitcoin reaches $100,000 USD"
    }

    inference_output = {
        "resolution": {
            "value": 0,
            "confidence": 0.85
        },
        "sources": [
            {
                "id": "coinmarketcap:btc",
                "url": "https://coinmarketcap.com/currencies/bitcoin/",
                "quote_hash": "0xabc123"
            }
        ],
        "rationale": "BTC is currently at $95k with only 1 day left in 2024. Unlikely to reach $100k."
    }

    metadata = {
        "model": "gpt-5-thinking@2025-11-POC",
        "prompt_hash": "0xdef456",
        "timestamp": 1735689600,
        "tokens_used": 450
    }

    # Create bundle
    bundle = uploader.create_evidence_bundle(
        inference_input,
        inference_output,
        metadata
    )

    print("=== Evidence Bundle ===")
    print(json.dumps(bundle, indent=2))

    # Calculate hash
    bundle_hash = uploader.hash_bundle(bundle)
    print(f"\nBundle Hash: {bundle_hash}")

    # Upload to Walrus (commented out for safety)
    # blob_id, blob_hash = uploader.upload_to_walrus(bundle)
    # print(f"\nBlob ID: {blob_id}")
    # print(f"Blob Hash: {blob_hash}")
    #
    # # Verify
    # verified = uploader.verify_upload(blob_id, blob_hash)
    # print(f"Verification: {'✓ PASS' if verified else '✗ FAIL'}")


if __name__ == "__main__":
    main()
