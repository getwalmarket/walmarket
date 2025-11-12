"""
GPT-5 Inference Module for Walmarket AI Oracle

⚠️ WARNING: This is a Proof-of-Concept (PoC) implementation for the Walrus Haulout Hackathon.
DO NOT use in production without proper security audits, error handling, and production-grade infrastructure.

This module handles:
- GPT-5 API calls with fixed prompts
- JSON schema enforcement
- Response parsing and validation
"""
import json
import hashlib
from typing import Dict, Any, List
from openai import OpenAI
import config

class GPT5Inference:
    """Handles GPT-5 API calls for market resolution"""

    def __init__(self, api_key: str = None):
        """
        Initialize GPT-5 client

        Args:
            api_key: OpenAI API key (defaults to config.OPENAI_API_KEY)
        """
        self.api_key = api_key or config.OPENAI_API_KEY
        if not self.api_key:
            raise ValueError("OpenAI API key is required. Set OPENAI_API_KEY environment variable.")

        self.client = OpenAI(api_key=self.api_key)
        self.model = config.GPT5_MODEL

    def create_prompt_hash(self, system_prompt: str, user_prompt: str) -> str:
        """
        Create deterministic hash of prompts for verification

        Args:
            system_prompt: System prompt
            user_prompt: User prompt

        Returns:
            SHA256 hash of combined prompts
        """
        combined = f"{system_prompt}|||{user_prompt}"
        return hashlib.sha256(combined.encode()).hexdigest()

    def normalize_sources_data(self, sources: List[Dict[str, Any]]) -> str:
        """
        Normalize source data for consistent hashing

        Args:
            sources: List of data sources with content

        Returns:
            Formatted string of source data
        """
        normalized = []
        for source in sources:
            normalized.append(f"Source: {source['id']}")
            normalized.append(f"URL: {source['url']}")
            normalized.append(f"Data: {source['data']}")
            normalized.append("---")
        return "\n".join(normalized)

    def infer(
        self,
        question: str,
        sources: List[Dict[str, Any]],
        resolution_criteria: str
    ) -> Dict[str, Any]:
        """
        Run GPT-5 inference on market question

        Args:
            question: Market question
            sources: List of data sources
            resolution_criteria: How to resolve the market

        Returns:
            Inference result with resolution, confidence, sources, rationale

        ⚠️ PoC Warning: This is a simplified implementation. Production version should include:
            - Rate limiting
            - Retry logic with exponential backoff
            - Timeout handling
            - Cost tracking
            - Response caching
        """
        # Format sources data
        sources_data = self.normalize_sources_data(sources)

        # Create user prompt from template
        user_prompt = config.USER_PROMPT_TEMPLATE.format(
            question=question,
            sources_data=sources_data,
            resolution_criteria=resolution_criteria,
            schema=json.dumps(config.RESOLUTION_SCHEMA, indent=2)
        )

        # Calculate prompt hash for verification
        prompt_hash = self.create_prompt_hash(config.SYSTEM_PROMPT, user_prompt)

        try:
            # Call GPT-5 API
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": config.SYSTEM_PROMPT},
                    {"role": "user", "content": user_prompt}
                ],
                max_tokens=config.MAX_TOKENS,
                temperature=config.TEMPERATURE,
                response_format={"type": "json_object"}  # Force JSON output
            )

            # Parse response
            output_text = response.choices[0].message.content
            output_json = json.loads(output_text)

            # Add metadata
            result = {
                "input": {
                    "question": question,
                    "sources": sources,
                    "resolution_criteria": resolution_criteria
                },
                "output": output_json,
                "metadata": {
                    "model": self.model,
                    "prompt_hash": f"0x{prompt_hash}",
                    "tokens_used": response.usage.total_tokens,
                    "finish_reason": response.choices[0].finish_reason
                }
            }

            return result

        except Exception as e:
            raise RuntimeError(f"GPT-5 inference failed: {str(e)}")

    def validate_output(self, output: Dict[str, Any]) -> bool:
        """
        Validate output against resolution schema

        Args:
            output: GPT-5 output to validate

        Returns:
            True if valid, False otherwise

        Note: This is a basic validation. Production should use jsonschema library.
        """
        required_fields = ["resolution", "sources", "rationale"]

        for field in required_fields:
            if field not in output:
                return False

        # Validate resolution
        if "value" not in output["resolution"] or "confidence" not in output["resolution"]:
            return False

        # Validate confidence range
        confidence = output["resolution"]["confidence"]
        if not (0.0 <= confidence <= 1.0):
            return False

        # Validate value (binary: 0 or 1)
        value = output["resolution"]["value"]
        if value not in [0, 1]:
            return False

        return True


def main():
    """
    Example usage

    ⚠️ PoC Warning: This is for testing only. Do not use with real API keys in production.
    """
    # Example: Bitcoin price prediction
    oracle = GPT5Inference()

    question = "Will BTC reach $100k by end of 2024?"
    sources = [
        {
            "id": "coinmarketcap:btc",
            "url": "https://coinmarketcap.com/currencies/bitcoin/",
            "data": "Current BTC price: $95,234 (as of Dec 30, 2024)"
        },
        {
            "id": "coingecko:btc",
            "url": "https://www.coingecko.com/en/coins/bitcoin",
            "data": "Current BTC price: $95,180 (as of Dec 30, 2024)"
        }
    ]
    resolution_criteria = "Market resolves YES if Bitcoin reaches $100,000 USD on any major exchange (Coinbase, Binance, Kraken) before Dec 31, 2024 23:59:59 UTC"

    result = oracle.infer(question, sources, resolution_criteria)

    print("=== GPT-5 Inference Result ===")
    print(json.dumps(result, indent=2))

    # Validate
    is_valid = oracle.validate_output(result["output"])
    print(f"\nOutput validation: {'✓ PASS' if is_valid else '✗ FAIL'}")


if __name__ == "__main__":
    main()
