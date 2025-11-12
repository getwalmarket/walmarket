"""
TEE Signature Generator for Nautilus Integration

⚠️ WARNING: This is a Proof-of-Concept (PoC) SIMULATION for the Walrus Haulout Hackathon.
This code SIMULATES Nautilus TEE attestation for demonstration purposes only.

REAL Nautilus TEE integration requires:
- Actual Intel SGX or AMD SEV hardware
- Nautilus SDK and runtime
- Remote attestation infrastructure
- Secure enclave key management
- Production-grade cryptographic libraries

DO NOT use this simulation in production!

This module simulates:
- TEE signature generation
- Remote attestation proofs
- Enclave measurement verification
"""
import hashlib
import secrets
import time
from typing import Dict, Any, Tuple
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives import serialization
import config


class TEESignatureGenerator:
    """
    Simulates Nautilus TEE signature generation

    ⚠️ PoC SIMULATION WARNING ⚠️
    This is NOT real TEE attestation. It's a simulation for hackathon demonstration.
    Real implementation requires actual secure enclave hardware and Nautilus SDK.
    """

    def __init__(self, enclave_id: str = None, enclave_pubkey: str = None, mrenclave: str = None):
        """
        Initialize TEE signature generator

        Args:
            enclave_id: Enclave identifier (defaults to config.TEE_ENCLAVE_ID)
            enclave_pubkey: Enclave public key (defaults to config.TEE_ENCLAVE_PUBKEY)
            mrenclave: Enclave measurement hash (defaults to config.TEE_MRENCLAVE)

        ⚠️ PoC Warning: In real TEE, these values come from hardware attestation
        """
        self.enclave_id = enclave_id or config.TEE_ENCLAVE_ID
        self.enclave_pubkey = enclave_pubkey or config.TEE_ENCLAVE_PUBKEY
        self.mrenclave = mrenclave or config.TEE_MRENCLAVE

        # Generate ephemeral key pair for simulation
        # ⚠️ In real TEE, this key is sealed inside the enclave
        self.private_key = ec.generate_private_key(ec.SECP256R1())
        self.public_key = self.private_key.public_key()

    def generate_nonce(self) -> str:
        """
        Generate cryptographic nonce for replay protection

        Returns:
            Hex nonce with 0x prefix
        """
        nonce = secrets.token_hex(32)
        return f"0x{nonce}"

    def hash_input(self, data: Dict[str, Any]) -> str:
        """
        Hash input data for TEE proof

        Args:
            data: Input data dictionary

        Returns:
            SHA256 hash with 0x prefix
        """
        import json
        data_json = json.dumps(data, sort_keys=True)
        h = hashlib.sha256(data_json.encode()).hexdigest()
        return f"0x{h}"

    def hash_output(self, data: Dict[str, Any]) -> str:
        """
        Hash output data for TEE proof

        Args:
            data: Output data dictionary

        Returns:
            SHA256 hash with 0x prefix
        """
        import json
        data_json = json.dumps(data, sort_keys=True)
        h = hashlib.sha256(data_json.encode()).hexdigest()
        return f"0x{h}"

    def create_report_digest(
        self,
        h_in: str,
        h_out: str,
        blob_id: str,
        blob_hash: str,
        timestamp: int,
        nonce: str
    ) -> bytes:
        """
        Create report digest for signing

        Args:
            h_in: Input hash
            h_out: Output hash
            blob_id: Walrus blob ID
            blob_hash: Walrus blob hash
            timestamp: Unix timestamp
            nonce: Cryptographic nonce

        Returns:
            Report digest as bytes
        """
        digest_components = [
            str(h_in),
            str(h_out),
            str(blob_id),
            str(blob_hash),
            str(timestamp),
            str(nonce),
            str(self.enclave_id),
            str(self.mrenclave)
        ]

        digest_string = "||".join(digest_components)
        digest = hashlib.sha256(digest_string.encode()).digest()

        return digest

    def sign_report(self, report_digest: bytes) -> str:
        """
        Sign report digest with enclave private key

        Args:
            report_digest: Report digest to sign

        Returns:
            Signature as hex string with 0x prefix

        ⚠️ PoC SIMULATION: In real TEE, signing happens inside secure enclave
        and private key never leaves the enclave
        """
        from cryptography.hazmat.primitives.asymmetric import utils

        # Sign the digest
        signature = self.private_key.sign(
            report_digest,
            ec.ECDSA(utils.Prehashed(hashes.SHA256()))
        )

        # Convert to hex
        sig_hex = signature.hex()
        return f"0x{sig_hex}"

    def generate_attestation(self, report_digest: bytes) -> str:
        """
        Generate remote attestation proof

        Args:
            report_digest: Report digest

        Returns:
            Simulated attestation proof

        ⚠️ PoC SIMULATION: Real attestation involves Intel IAS or AMD AESM service
        This is a placeholder that simulates the attestation structure
        """
        # Simulate attestation report structure
        attestation_data = {
            "version": 4,
            "sign_type": 1,  # EPID/DCAP
            "enclave_id": self.enclave_id,
            "mrenclave": self.mrenclave,
            "mrsigner": "0x" + secrets.token_hex(32),  # Simulated
            "report_data": report_digest.hex(),
            "timestamp": int(time.time()),
            "status": "OK"
        }

        import json
        attestation_json = json.dumps(attestation_data, sort_keys=True)
        attestation_hash = hashlib.sha256(attestation_json.encode()).hexdigest()

        return f"0x{attestation_hash}"

    def create_tee_proof(
        self,
        inference_input: Dict[str, Any],
        inference_output: Dict[str, Any],
        blob_id: str,
        blob_hash: str
    ) -> Dict[str, Any]:
        """
        Create complete TEE proof package

        Args:
            inference_input: Input to AI model
            inference_output: Output from AI model
            blob_id: Walrus blob ID
            blob_hash: Walrus blob hash

        Returns:
            TEE proof dictionary with all attestation data

        ⚠️ PoC SIMULATION: This simulates the complete TEE attestation flow
        """
        # Generate timestamp and nonce
        timestamp = int(time.time())
        nonce = self.generate_nonce()

        # Hash input and output
        h_in = self.hash_input(inference_input)
        h_out = self.hash_output(inference_output)

        # Create report digest
        report_digest = self.create_report_digest(
            h_in, h_out, blob_id, blob_hash, timestamp, nonce
        )

        # Sign report
        signature = self.sign_report(report_digest)

        # Generate attestation
        attestation = self.generate_attestation(report_digest)

        # Assemble TEE proof
        tee_proof = {
            "enclave_id": self.enclave_id,
            "enclave_pubkey": self.enclave_pubkey,
            "mrenclave": self.mrenclave,
            "sig": signature,
            "attestation": attestation,
            "timestamp": timestamp,
            "nonce": nonce,
            "h_in": h_in,
            "h_out": h_out,
            "blob_id": blob_id,
            "blob_hash": blob_hash
        }

        return tee_proof

    def verify_signature(self, report_digest: bytes, signature: str) -> bool:
        """
        Verify TEE signature

        Args:
            report_digest: Report digest
            signature: Signature to verify (hex with 0x prefix)

        Returns:
            True if signature is valid, False otherwise

        ⚠️ PoC SIMULATION: Real verification happens on-chain in SUI smart contract
        """
        try:
            from cryptography.hazmat.primitives.asymmetric import utils

            # Remove 0x prefix and convert to bytes
            sig_bytes = bytes.fromhex(signature[2:])

            # Verify signature
            self.public_key.verify(
                sig_bytes,
                report_digest,
                ec.ECDSA(utils.Prehashed(hashes.SHA256()))
            )

            return True

        except Exception:
            return False


def main():
    """
    Example usage

    ⚠️ PoC SIMULATION WARNING ⚠️
    This is a simulation for demonstration only.
    """
    print("=" * 60)
    print("⚠️  PoC SIMULATION - NOT REAL TEE ATTESTATION  ⚠️")
    print("=" * 60)
    print()

    # Initialize TEE signer
    tee_signer = TEESignatureGenerator()

    # Example data
    inference_input = {
        "question": "Will BTC reach $100k by end of 2024?",
        "sources": [{"id": "coinmarketcap:btc", "url": "https://...", "data": "BTC: $95k"}]
    }

    inference_output = {
        "resolution": {"value": 0, "confidence": 0.85},
        "sources": [{"id": "coinmarketcap:btc", "url": "https://...", "quote_hash": "0xabc"}],
        "rationale": "BTC unlikely to reach $100k with 1 day left"
    }

    blob_id = "Cu7KD1o8bwuW-rCVihj40Nu-iHBBRjy-C6eJJgiXqPw"
    blob_hash = "0x" + hashlib.sha256(b"example_blob").hexdigest()

    # Create TEE proof
    tee_proof = tee_signer.create_tee_proof(
        inference_input,
        inference_output,
        blob_id,
        blob_hash
    )

    print("=== TEE Proof (Simulated) ===")
    import json
    print(json.dumps(tee_proof, indent=2))
    print()

    # Verify signature
    report_digest = tee_signer.create_report_digest(
        tee_proof["h_in"],
        tee_proof["h_out"],
        tee_proof["blob_id"],
        tee_proof["blob_hash"],
        tee_proof["timestamp"],
        tee_proof["nonce"]
    )

    is_valid = tee_signer.verify_signature(report_digest, tee_proof["sig"])
    print(f"Signature verification: {'✓ PASS' if is_valid else '✗ FAIL'}")
    print()
    print("⚠️  Remember: This is a SIMULATION for hackathon demo purposes!")


if __name__ == "__main__":
    main()
