"""
Tests for TEE Signature Generator Module

⚠️ PoC Warning: These tests validate the SIMULATED TEE functionality only.
Real TEE attestation requires actual hardware and cannot be unit tested.
"""
import pytest
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from signature_generator import TEESignatureGenerator


class TestTEESignatureGenerator:
    """Test TEE signature generation (simulation)"""

    def test_generate_nonce(self):
        """Test nonce generation"""
        tee = TEESignatureGenerator()

        nonce1 = tee.generate_nonce()
        nonce2 = tee.generate_nonce()

        # Nonces should be different
        assert nonce1 != nonce2

        # Nonces should have correct format
        assert nonce1.startswith("0x")
        assert len(nonce1) == 66  # 0x + 64 hex chars

    def test_hash_input_deterministic(self):
        """Test input hashing is deterministic"""
        tee = TEESignatureGenerator()

        data = {"question": "Test?", "sources": [{"id": "test", "data": "value"}]}

        hash1 = tee.hash_input(data)
        hash2 = tee.hash_input(data)

        assert hash1 == hash2
        assert hash1.startswith("0x")

    def test_hash_output_deterministic(self):
        """Test output hashing is deterministic"""
        tee = TEESignatureGenerator()

        data = {
            "resolution": {"value": 1, "confidence": 0.9},
            "sources": [],
            "rationale": "Test"
        }

        hash1 = tee.hash_output(data)
        hash2 = tee.hash_output(data)

        assert hash1 == hash2
        assert hash1.startswith("0x")

    def test_create_report_digest(self):
        """Test report digest creation"""
        tee = TEESignatureGenerator()

        digest = tee.create_report_digest(
            h_in="0xabc123",
            h_out="0xdef456",
            blob_id="test_blob_id",
            blob_hash="0x789",
            timestamp=1234567890,
            nonce="0xnonce"
        )

        assert isinstance(digest, bytes)
        assert len(digest) == 32  # SHA256 produces 32 bytes

    def test_sign_and_verify_report(self):
        """Test signature generation and verification"""
        tee = TEESignatureGenerator()

        # Create a test report digest
        report_digest = tee.create_report_digest(
            h_in="0xabc",
            h_out="0xdef",
            blob_id="test",
            blob_hash="0x123",
            timestamp=1234567890,
            nonce="0x999"
        )

        # Sign the digest
        signature = tee.sign_report(report_digest)

        assert signature.startswith("0x")
        assert len(signature) > 66  # Signature should be longer than a hash

        # Verify the signature
        is_valid = tee.verify_signature(report_digest, signature)
        assert is_valid is True

    def test_verify_signature_invalid(self):
        """Test signature verification with wrong signature"""
        tee = TEESignatureGenerator()

        report_digest = tee.create_report_digest(
            h_in="0xabc",
            h_out="0xdef",
            blob_id="test",
            blob_hash="0x123",
            timestamp=1234567890,
            nonce="0x999"
        )

        # Create a fake signature
        fake_signature = "0x" + "00" * 71  # Invalid signature

        is_valid = tee.verify_signature(report_digest, fake_signature)
        assert is_valid is False

    def test_create_tee_proof(self):
        """Test complete TEE proof creation"""
        tee = TEESignatureGenerator()

        inference_input = {"question": "Test?"}
        inference_output = {
            "resolution": {"value": 1, "confidence": 0.9},
            "sources": [],
            "rationale": "Test"
        }
        blob_id = "test_blob"
        blob_hash = "0xabc123"

        tee_proof = tee.create_tee_proof(
            inference_input,
            inference_output,
            blob_id,
            blob_hash
        )

        # Verify all required fields are present
        required_fields = [
            "enclave_id", "enclave_pubkey", "mrenclave",
            "sig", "attestation", "timestamp", "nonce",
            "h_in", "h_out", "blob_id", "blob_hash"
        ]

        for field in required_fields:
            assert field in tee_proof

        # Verify field formats
        assert tee_proof["enclave_id"] == tee.enclave_id
        assert tee_proof["blob_id"] == blob_id
        assert tee_proof["blob_hash"] == blob_hash
        assert isinstance(tee_proof["timestamp"], int)

    def test_generate_attestation(self):
        """Test attestation generation"""
        tee = TEESignatureGenerator()

        report_digest = b"test_digest_bytes_12345678901234"

        attestation = tee.generate_attestation(report_digest)

        assert attestation.startswith("0x")
        assert len(attestation) == 66  # 0x + 64 hex chars


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
