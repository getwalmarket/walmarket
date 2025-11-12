"""
Tests for Walrus Uploader Module

⚠️ PoC Warning: These are basic tests for hackathon demonstration.
Real Walrus uploads are disabled in tests to avoid costs and network calls.
"""
import pytest
import json
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from walrus_uploader import WalrusUploader


class TestWalrusUploader:
    """Test Walrus uploader functionality"""

    def test_create_evidence_bundle(self):
        """Test evidence bundle creation"""
        uploader = WalrusUploader()

        inference_input = {"question": "Test?", "sources": []}
        inference_output = {
            "resolution": {"value": 1, "confidence": 0.9},
            "sources": [],
            "rationale": "Test"
        }
        metadata = {"model": "gpt-5", "timestamp": 1234567890}

        bundle = uploader.create_evidence_bundle(
            inference_input,
            inference_output,
            metadata
        )

        assert bundle["version"] == "1.0"
        assert bundle["input"] == inference_input
        assert bundle["output"] == inference_output
        assert bundle["metadata"] == metadata

    def test_hash_bundle_deterministic(self):
        """Test that bundle hashing is deterministic"""
        uploader = WalrusUploader()

        bundle = {
            "version": "1.0",
            "input": {"test": "data"},
            "output": {"result": "value"},
            "metadata": {"timestamp": 12345}
        }

        hash1 = uploader.hash_bundle(bundle)
        hash2 = uploader.hash_bundle(bundle)

        assert hash1 == hash2
        assert hash1.startswith("0x")
        assert len(hash1) == 66  # 0x + 64 hex chars

    def test_hash_bundle_different_data(self):
        """Test that different bundles produce different hashes"""
        uploader = WalrusUploader()

        bundle1 = {
            "version": "1.0",
            "input": {"test": "data1"},
            "output": {},
            "metadata": {}
        }

        bundle2 = {
            "version": "1.0",
            "input": {"test": "data2"},
            "output": {},
            "metadata": {}
        }

        hash1 = uploader.hash_bundle(bundle1)
        hash2 = uploader.hash_bundle(bundle2)

        assert hash1 != hash2

    def test_hash_bundle_key_order_independent(self):
        """Test that hash is independent of key order"""
        uploader = WalrusUploader()

        bundle1 = {"a": 1, "b": 2, "c": 3}
        bundle2 = {"c": 3, "a": 1, "b": 2}

        hash1 = uploader.hash_bundle(bundle1)
        hash2 = uploader.hash_bundle(bundle2)

        assert hash1 == hash2


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
