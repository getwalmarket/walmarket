"""
Seal Encryption Module for Oracle Evidence

This module handles encryption of oracle evidence using Seal framework
for premium access control. It supports:
- Encrypting full oracle evidence (reasoning, sources, TEE attestation)
- Creating public summaries (outcome only)
- Managing access policies on Sui blockchain

NOTE: This is a PoC implementation. Production requires:
- Actual Seal SDK integration (currently placeholder)
- Real key management with Seal key servers
- Proper threshold encryption setup
- Integration with Walrus for blob storage
"""

import json
import hashlib
from typing import Dict, Any, Tuple
from dataclasses import dataclass, asdict


@dataclass
class SealConfig:
    """Configuration for Seal encryption"""
    seal_package_id: str
    seal_policy_id: str
    threshold: int
    key_servers: list[str]  # List of Seal key server endpoints


@dataclass
class EncryptedEvidence:
    """Container for encrypted oracle evidence"""
    encrypted_blob: bytes
    public_summary: Dict[str, Any]
    seal_policy_id: str
    encryption_metadata: Dict[str, Any]


class SealEncryptor:
    """
    Handles encryption of oracle evidence using Seal framework

    WARNING: This is a SIMULATION for hackathon demonstration.
    Real implementation requires actual Seal SDK integration.
    """

    def __init__(self, config: SealConfig):
        """
        Initialize Seal encryptor with configuration

        Args:
            config: Seal configuration including package ID, policy, and key servers
        """
        self.config = config
        print(f"⚠️  WARNING: Using simulated Seal encryption (PoC only)")
        print(f"Seal Package: {config.seal_package_id}")
        print(f"Seal Policy: {config.seal_policy_id}")
        print(f"Threshold: {config.threshold}")

    def encrypt_evidence(
        self,
        full_evidence: Dict[str, Any],
        market_id: str
    ) -> EncryptedEvidence:
        """
        Encrypt full oracle evidence for premium subscribers

        Creates two outputs:
        1. Encrypted full evidence (with reasoning, sources, TEE proof)
        2. Public summary (outcome only, no sensitive data)

        Args:
            full_evidence: Complete oracle evidence including reasoning
            market_id: Market ID this evidence is for

        Returns:
            EncryptedEvidence containing encrypted blob and public summary
        """
        print(f"\n🔐 Encrypting oracle evidence for market {market_id}")

        # Create public summary (outcome only, no reasoning)
        public_summary = self._create_public_summary(full_evidence, market_id)

        # Serialize full evidence for encryption
        evidence_json = json.dumps(full_evidence, indent=2)
        evidence_bytes = evidence_json.encode('utf-8')

        # TODO: Replace with actual Seal encryption
        # For PoC, we simulate encryption
        encrypted_blob = self._simulate_seal_encryption(
            evidence_bytes,
            market_id
        )

        # Create encryption metadata
        encryption_metadata = {
            "seal_package_id": self.config.seal_package_id,
            "seal_policy_id": self.config.seal_policy_id,
            "threshold": self.config.threshold,
            "key_servers": self.config.key_servers,
            "encrypted_size_bytes": len(encrypted_blob),
            "original_size_bytes": len(evidence_bytes),
            "encryption_method": "Seal-Threshold-AES-GCM (simulated)",
            "content_hash": hashlib.sha256(evidence_bytes).hexdigest()
        }

        print(f"✅ Encrypted evidence:")
        print(f"   - Original size: {len(evidence_bytes)} bytes")
        print(f"   - Encrypted size: {len(encrypted_blob)} bytes")
        print(f"   - Public summary: {len(json.dumps(public_summary))} bytes")

        return EncryptedEvidence(
            encrypted_blob=encrypted_blob,
            public_summary=public_summary,
            seal_policy_id=self.config.seal_policy_id,
            encryption_metadata=encryption_metadata
        )

    def _create_public_summary(
        self,
        full_evidence: Dict[str, Any],
        market_id: str
    ) -> Dict[str, Any]:
        """
        Create public summary with outcome only (no reasoning or sources)

        Args:
            full_evidence: Complete oracle evidence
            market_id: Market ID

        Returns:
            Public summary dictionary
        """
        return {
            "market_id": market_id,
            "outcome": full_evidence.get("outcome"),
            "resolution_date": full_evidence.get("resolution_date"),
            "oracle_version": full_evidence.get("tee_attestation", {}).get("version", "1.0"),
            "evidence_type": "public_summary",
            "premium_available": True,
            "message": "Full reasoning and sources available for premium subscribers"
        }

    def _simulate_seal_encryption(
        self,
        data: bytes,
        market_id: str
    ) -> bytes:
        """
        SIMULATION: Encrypt data using Seal framework

        In production, this would:
        1. Initialize Seal client with key servers
        2. Use threshold encryption with policy
        3. Return encrypted ciphertext

        For PoC, we use simple AES-like simulation

        Args:
            data: Data to encrypt
            market_id: Context for encryption

        Returns:
            Encrypted bytes (simulated)
        """
        # Simulate encryption by XOR with hash-based key
        # WARNING: NOT SECURE - only for demonstration
        key = hashlib.sha256(
            f"{self.config.seal_policy_id}:{market_id}".encode()
        ).digest()

        encrypted = bytearray(data)
        for i in range(len(encrypted)):
            encrypted[i] ^= key[i % len(key)]

        # Add encryption header (simulated)
        header = b"SEAL_ENC_V1:"
        return header + bytes(encrypted)

    def decrypt_evidence(
        self,
        encrypted_blob: bytes,
        market_id: str
    ) -> Dict[str, Any]:
        """
        SIMULATION: Decrypt oracle evidence

        In production, this would:
        1. Verify user has premium access (on-chain check)
        2. Request decryption from Seal key servers
        3. Reconstruct plaintext using threshold shares

        Args:
            encrypted_blob: Encrypted evidence blob
            market_id: Market ID for context

        Returns:
            Decrypted evidence dictionary
        """
        print(f"\n🔓 Decrypting evidence for market {market_id}")

        # Remove header
        if not encrypted_blob.startswith(b"SEAL_ENC_V1:"):
            raise ValueError("Invalid encrypted blob format")

        encrypted_data = encrypted_blob[12:]  # Remove header

        # Simulate decryption (reverse of encryption)
        key = hashlib.sha256(
            f"{self.config.seal_policy_id}:{market_id}".encode()
        ).digest()

        decrypted = bytearray(encrypted_data)
        for i in range(len(decrypted)):
            decrypted[i] ^= key[i % len(key)]

        # Parse JSON
        evidence_json = bytes(decrypted).decode('utf-8')
        evidence = json.loads(evidence_json)

        print(f"✅ Successfully decrypted evidence")
        return evidence

    def create_access_policy_tx(
        self,
        market_id: str,
        encrypted_blob_id: str,
        public_blob_id: str
    ) -> Dict[str, Any]:
        """
        Create transaction data for configuring market access control

        This would be called on-chain to set up Seal policy

        Args:
            market_id: Market address
            encrypted_blob_id: Walrus blob ID for encrypted evidence
            public_blob_id: Walrus blob ID for public summary

        Returns:
            Transaction configuration dictionary
        """
        return {
            "function": "configure_market_access",
            "module": "seal_access",
            "arguments": [
                market_id,
                True,  # requires_premium
                encrypted_blob_id,
                public_blob_id,
                self.config.seal_package_id,
                self.config.seal_policy_id
            ],
            "type_arguments": []
        }


# Example usage
if __name__ == "__main__":
    # Example configuration
    config = SealConfig(
        seal_package_id="0x1234...seal_package",
        seal_policy_id="0x5678...policy_object",
        threshold=2,  # 2-of-3 key servers required
        key_servers=[
            "https://seal-server-1.example.com",
            "https://seal-server-2.example.com",
            "https://seal-server-3.example.com"
        ]
    )

    encryptor = SealEncryptor(config)

    # Example oracle evidence
    evidence = {
        "market_id": "0xmarket123",
        "question": "Will BTC reach $100k by Dec 2025?",
        "outcome": "YES",
        "resolution_date": "2025-12-31T23:59:59Z",
        "sources": [
            {"name": "CoinMarketCap", "price": "$102,450"},
            {"name": "CoinGecko", "price": "$102,380"}
        ],
        "reasoning": "Based on 3 independent sources, BTC exceeded $100k threshold.",
        "tee_attestation": {
            "mrenclave": "0xdef456...",
            "signature": "0x789abc...",
            "version": "1.0"
        }
    }

    # Encrypt evidence
    encrypted = encryptor.encrypt_evidence(evidence, "0xmarket123")

    print("\n📦 Encrypted Evidence Package:")
    print(f"Public Summary: {json.dumps(encrypted.public_summary, indent=2)}")
    print(f"\nEncryption Metadata: {json.dumps(encrypted.encryption_metadata, indent=2)}")

    # Test decryption
    decrypted = encryptor.decrypt_evidence(encrypted.encrypted_blob, "0xmarket123")
    print(f"\n✅ Decryption successful: {decrypted.get('outcome')}")

    # Generate access policy transaction
    policy_tx = encryptor.create_access_policy_tx(
        "0xmarket123",
        "walrus_blob_encrypted",
        "walrus_blob_public"
    )
    print(f"\n📝 Access Policy TX: {json.dumps(policy_tx, indent=2)}")
