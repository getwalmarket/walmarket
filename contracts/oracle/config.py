"""
Configuration for Walmarket AI Oracle with Nautilus TEE
"""
import os
from typing import Dict, List

# OpenAI GPT-5 Configuration
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
GPT5_MODEL = "gpt-5-thinking@2025-11-POC"
MAX_TOKENS = 1000
TEMPERATURE = 0.1  # Low temperature for consistent outputs

# Walrus Configuration
WALRUS_CLI_PATH = os.getenv("WALRUS_CLI_PATH", "walrus")
WALRUS_EPOCHS = 5  # Storage duration
WALRUS_TESTNET_AGGREGATOR = "https://aggregator.walrus-testnet.walrus.space"

# SUI Configuration
SUI_NETWORK = "testnet"
PACKAGE_ID = "0x03746b9be956d9964e460a0fe401b46e7af331e912fb9aca4d5fefebb38ae9fb"
MARKET_REGISTRY = "0xea117fd8fe57fcbd3412ed2e265ee63e0773d91b5ca8f52c7bfd10c3d3a0e976"

# Data Sources Configuration
DATA_SOURCES: Dict[str, List[str]] = {
    "crypto": [
        "https://api.coinmarketcap.com/v1",
        "https://api.coingecko.com/api/v3",
        "https://api.coinbase.com/v2",
        "https://api.binance.com/api/v3",
    ],
    "traditional_finance": [
        "https://api.bloomberg.com",
        "https://api.reuters.com",
        "https://query1.finance.yahoo.com",
    ],
    "politics": [
        "https://newsapi.org/v2",
        "https://api.apnews.com",
        "https://api.reuters.com",
    ],
    "sports": [
        "https://api.espn.com",
        "https://api.thesportsdb.com",
    ],
}

# TEE Configuration (Nautilus)
TEE_ENCLAVE_ID = "0x1234567890abcdef"  # Example enclave ID
TEE_ENCLAVE_PUBKEY = "0xabcdef1234567890"  # Example public key
TEE_MRENCLAVE = "0xdef1234567890abc"  # Measurement hash

# Resolution Schema
RESOLUTION_SCHEMA = {
    "type": "object",
    "required": ["round", "task", "resolution", "sources", "rationale", "controls", "tee_proof"],
    "properties": {
        "round": {"type": "integer"},
        "task": {"type": "string", "enum": ["binary", "numeric"]},
        "resolution": {
            "type": "object",
            "required": ["value", "confidence"],
            "properties": {
                "value": {"type": "number"},
                "confidence": {"type": "number", "minimum": 0, "maximum": 1}
            }
        },
        "sources": {
            "type": "array",
            "items": {
                "type": "object",
                "required": ["id", "url", "quote_hash"],
                "properties": {
                    "id": {"type": "string"},
                    "url": {"type": "string"},
                    "quote_hash": {"type": "string"}
                }
            }
        },
        "rationale": {"type": "string"},
        "controls": {
            "type": "object",
            "required": ["model_id", "prompt_hash", "parser_hash", "schema_hash"],
            "properties": {
                "model_id": {"type": "string"},
                "prompt_hash": {"type": "string"},
                "parser_hash": {"type": "string"},
                "schema_hash": {"type": "string"}
            }
        },
        "tee_proof": {
            "type": "object",
            "required": ["enclave_id", "enclave_pubkey", "mrenclave", "sig", "attestation", "timestamp", "nonce", "h_in", "h_out", "blob_id", "blob_hash"],
            "properties": {
                "enclave_id": {"type": "string"},
                "enclave_pubkey": {"type": "string"},
                "mrenclave": {"type": "string"},
                "sig": {"type": "string"},
                "attestation": {"type": "string"},
                "timestamp": {"type": "integer"},
                "nonce": {"type": "string"},
                "h_in": {"type": "string"},
                "h_out": {"type": "string"},
                "blob_id": {"type": "string"},
                "blob_hash": {"type": "string"}
            }
        }
    }
}

# Prompt Template for GPT-5
SYSTEM_PROMPT = """You are a verifiable AI oracle for prediction markets.
Your task is to analyze data from multiple trusted sources and determine the outcome of a prediction market question.

You must:
1. Cross-reference multiple data sources
2. Provide a confidence score (0.0 to 1.0)
3. Cite specific sources with quotes
4. Explain your reasoning clearly
5. Return output in strict JSON format

Be objective, factual, and transparent in your analysis."""

USER_PROMPT_TEMPLATE = """Market Question: {question}

Data Sources:
{sources_data}

Resolution Criteria:
{resolution_criteria}

Please analyze the data and determine:
1. Resolution value (1 for YES, 0 for NO)
2. Confidence score (0.0 to 1.0)
3. List of sources used with specific quotes
4. Clear rationale for your decision

Return your answer in the following JSON format:
{schema}
"""
