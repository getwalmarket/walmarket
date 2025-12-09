/**
 * Nautilus TEE Client Library
 *
 * This library provides integration with Nautilus TEE (Trusted Execution Environment)
 * for verifiable AI oracle execution on Sui blockchain.
 *
 * Nautilus provides:
 * - Secure enclave execution (AWS Nitro Enclaves)
 * - Cryptographic attestation of AI inference
 * - On-chain verification via Move smart contracts
 *
 * @see https://docs.sui.io/concepts/cryptography/nautilus
 * @see https://github.com/MystenLabs/nautilus
 */

// Environment configuration
const NAUTILUS_ENCLAVE_URL = process.env.NAUTILUS_ENCLAVE_URL || 'http://localhost:3000';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

/**
 * Nautilus TEE Response structure
 */
export interface NautilusResponse {
  response: {
    intent: string;
    timestamp_ms: number;
    data: unknown;
  };
  signature: string; // 256-character hex string (Ed25519 signature)
}

/**
 * Attestation document from TEE enclave
 */
export interface AttestationDocument {
  public_key: string;
  attestation: string;
  pcr0: string; // Enclave image file measurement
  pcr1: string; // Linux kernel and boot parameters
  pcr2: string; // Application measurement
}

/**
 * Health check response
 */
export interface HealthCheckResponse {
  status: string;
  public_key: string;
  endpoints: { [key: string]: string };
}

/**
 * AI Oracle resolution result with TEE attestation
 */
export interface TEEOracleResult {
  outcome: 'yes' | 'no';
  reasoning: string;
  model: string;
  provider: string;
  tee: {
    enclave_url: string;
    public_key: string;
    signature: string;
    timestamp_ms: number;
    attestation_available: boolean;
  };
}

/**
 * Nautilus TEE Client
 *
 * Connects to a Nautilus enclave running on AWS Nitro for
 * verifiable AI oracle execution.
 */
export class NautilusTEEClient {
  private enclaveUrl: string;
  private openaiApiKey: string;

  constructor(enclaveUrl?: string, openaiApiKey?: string) {
    this.enclaveUrl = enclaveUrl || NAUTILUS_ENCLAVE_URL;
    this.openaiApiKey = openaiApiKey || OPENAI_API_KEY;
  }

  /**
   * Check if the Nautilus enclave is healthy and get its public key
   */
  async healthCheck(): Promise<HealthCheckResponse> {
    const response = await fetch(`${this.enclaveUrl}/health_check`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`Nautilus health check failed: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get attestation document for on-chain registration
   */
  async getAttestation(): Promise<AttestationDocument> {
    const response = await fetch(`${this.enclaveUrl}/get_attestation`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`Failed to get attestation: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Process data inside the TEE enclave
   *
   * This is the main entry point for verifiable computation.
   * The enclave will:
   * 1. Execute the computation inside secure enclave
   * 2. Sign the result with the ephemeral enclave key
   * 3. Return the result with cryptographic signature
   */
  async processData<T>(payload: Record<string, unknown>): Promise<NautilusResponse & { data: T }> {
    const response = await fetch(`${this.enclaveUrl}/process_data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payload }),
    });

    if (!response.ok) {
      throw new Error(`Nautilus process_data failed: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Execute AI Oracle resolution inside TEE
   *
   * This method:
   * 1. Sends market data to the Nautilus enclave
   * 2. Enclave calls OpenAI API inside secure environment
   * 3. Signs the result with enclave key
   * 4. Returns verifiable oracle result
   */
  async resolveMarket(
    title: string,
    description: string,
    category: string,
    endDate: number
  ): Promise<TEEOracleResult> {
    const payload = {
      action: 'resolve_market',
      market: {
        title,
        description,
        category,
        end_date: endDate,
      },
      openai_api_key: this.openaiApiKey,
    };

    try {
      // Try to use Nautilus TEE enclave
      interface OracleData {
        outcome: string;
        reasoning: string;
        model: string;
        provider: string;
      }
      const teeResponse = await this.processData<OracleData>(payload);
      const data = teeResponse.response.data as OracleData;

      return {
        outcome: data.outcome as 'yes' | 'no',
        reasoning: data.reasoning,
        model: data.model || 'gpt-5-mini',
        provider: data.provider || 'OpenAI',
        tee: {
          enclave_url: this.enclaveUrl,
          public_key: '', // Will be populated from health check
          signature: teeResponse.signature,
          timestamp_ms: teeResponse.response.timestamp_ms,
          attestation_available: true,
        },
      };
    } catch (error) {
      // Fallback to direct API call with simulated TEE attestation
      console.warn('Nautilus TEE not available, using fallback mode:', error);
      return this.resolveMarketFallback(title, description, category, endDate);
    }
  }

  /**
   * Fallback resolution when TEE enclave is not available
   *
   * This provides the same interface but without TEE attestation.
   * Used for development/testing or when enclave is down.
   */
  private async resolveMarketFallback(
    title: string,
    description: string,
    category: string,
    endDate: number
  ): Promise<TEEOracleResult> {
    const endDateStr = new Date(endDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const prompt = `You are an AI oracle for a prediction market. Your job is to determine the outcome of prediction market questions based on publicly available information.

Market Question: ${title}

Description/Resolution Criteria: ${description}

Category: ${category}

Resolution Date: ${endDateStr}

Based on publicly available information and the resolution criteria provided, determine if this market should resolve to YES or NO.

IMPORTANT:
- Only respond with a JSON object
- The outcome must be either "yes" or "no"
- Provide clear reasoning for your decision
- If the event hasn't happened yet or information is unclear, make your best judgment based on available data

Respond in this exact JSON format:
{
  "outcome": "yes" or "no",
  "reasoning": "Your detailed reasoning here"
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-5-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an AI oracle that resolves prediction market outcomes. Always respond with valid JSON only.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_completion_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API failed: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;

    if (!aiResponse) {
      throw new Error('No response from AI');
    }

    // Parse the AI response
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    const parsedResponse = jsonMatch
      ? JSON.parse(jsonMatch[0])
      : JSON.parse(aiResponse);

    // Generate simulated TEE signature (for development/fallback)
    const timestamp = Date.now();
    const simulatedSignature = await this.generateSimulatedSignature({
      outcome: parsedResponse.outcome,
      reasoning: parsedResponse.reasoning,
      timestamp,
    });

    return {
      outcome: parsedResponse.outcome.toLowerCase() as 'yes' | 'no',
      reasoning: parsedResponse.reasoning || 'No reasoning provided',
      model: 'gpt-5-mini',
      provider: 'OpenAI',
      tee: {
        enclave_url: 'fallback-mode',
        public_key: 'simulated',
        signature: simulatedSignature,
        timestamp_ms: timestamp,
        attestation_available: false,
      },
    };
  }

  /**
   * Generate simulated signature for fallback mode
   *
   * WARNING: This is NOT a real TEE signature!
   * Only used when Nautilus enclave is not available.
   */
  private async generateSimulatedSignature(data: Record<string, unknown>): Promise<string> {
    const encoder = new TextEncoder();
    const dataBytes = encoder.encode(JSON.stringify(data));
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBytes);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    // Pad to 256 characters to match Ed25519 signature length
    return hashHex.padEnd(256, '0');
  }

  /**
   * Check if result has valid TEE attestation
   */
  static hasValidAttestation(result: TEEOracleResult): boolean {
    return (
      result.tee.attestation_available &&
      result.tee.signature.length === 256 &&
      result.tee.enclave_url !== 'fallback-mode'
    );
  }
}

/**
 * Default Nautilus client instance
 */
export const nautilusClient = new NautilusTEEClient();
