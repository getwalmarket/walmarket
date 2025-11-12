"""
Tests for GPT-5 Inference Module

⚠️ PoC Warning: These are basic tests for hackathon demonstration.
Production tests should include:
- Integration tests with actual API
- Mock API responses
- Error handling scenarios
- Rate limiting tests
- Cost tracking tests
"""
import pytest
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from openai_inference import GPT5Inference
import config


class TestGPT5Inference:
    """Test GPT-5 inference functionality"""

    def test_prompt_hash_deterministic(self):
        """Test that prompt hashing is deterministic"""
        oracle = GPT5Inference(api_key="test_key")

        system_prompt = "Test system prompt"
        user_prompt = "Test user prompt"

        hash1 = oracle.create_prompt_hash(system_prompt, user_prompt)
        hash2 = oracle.create_prompt_hash(system_prompt, user_prompt)

        assert hash1 == hash2
        assert hash1.startswith("0x")
        assert len(hash1) == 66  # 0x + 64 hex chars

    def test_normalize_sources_data(self):
        """Test source data normalization"""
        oracle = GPT5Inference(api_key="test_key")

        sources = [
            {
                "id": "source1",
                "url": "https://example.com/1",
                "data": "Test data 1"
            },
            {
                "id": "source2",
                "url": "https://example.com/2",
                "data": "Test data 2"
            }
        ]

        normalized = oracle.normalize_sources_data(sources)

        assert "Source: source1" in normalized
        assert "URL: https://example.com/1" in normalized
        assert "Data: Test data 1" in normalized
        assert "---" in normalized

    def test_validate_output_valid(self):
        """Test output validation with valid data"""
        oracle = GPT5Inference(api_key="test_key")

        valid_output = {
            "resolution": {
                "value": 1,
                "confidence": 0.85
            },
            "sources": [
                {
                    "id": "test:source",
                    "url": "https://example.com",
                    "quote_hash": "0xabc123"
                }
            ],
            "rationale": "Test rationale"
        }

        assert oracle.validate_output(valid_output) is True

    def test_validate_output_invalid_confidence(self):
        """Test output validation with invalid confidence"""
        oracle = GPT5Inference(api_key="test_key")

        invalid_output = {
            "resolution": {
                "value": 1,
                "confidence": 1.5  # Invalid: > 1.0
            },
            "sources": [],
            "rationale": "Test"
        }

        assert oracle.validate_output(invalid_output) is False

    def test_validate_output_missing_fields(self):
        """Test output validation with missing required fields"""
        oracle = GPT5Inference(api_key="test_key")

        invalid_output = {
            "resolution": {
                "value": 1,
                "confidence": 0.85
            }
            # Missing sources and rationale
        }

        assert oracle.validate_output(invalid_output) is False

    def test_validate_output_invalid_value(self):
        """Test output validation with invalid binary value"""
        oracle = GPT5Inference(api_key="test_key")

        invalid_output = {
            "resolution": {
                "value": 2,  # Invalid: must be 0 or 1
                "confidence": 0.85
            },
            "sources": [],
            "rationale": "Test"
        }

        assert oracle.validate_output(invalid_output) is False


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
