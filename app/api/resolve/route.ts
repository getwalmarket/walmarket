import { NextRequest, NextResponse } from 'next/server';
import { NautilusTEEClient, TEEOracleResult } from '../../lib/nautilus';

/**
 * AI Oracle Resolution API with Nautilus TEE Integration
 *
 * This endpoint resolves prediction market outcomes using AI inference
 * executed inside a Nautilus TEE (Trusted Execution Environment).
 *
 * Flow:
 * 1. Client sends market data (title, description, category, endDate)
 * 2. Nautilus enclave executes GPT-5-mini inference inside AWS Nitro TEE
 * 3. Enclave signs the result with its ephemeral key
 * 4. Response includes TEE attestation for on-chain verification
 *
 * If Nautilus enclave is unavailable, falls back to direct API call
 * with simulated attestation (for development/testing).
 *
 * @see https://docs.sui.io/concepts/cryptography/nautilus
 */
export async function POST(request: NextRequest) {
  try {
    const { title, description, category, endDate } = await request.json();

    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      );
    }

    // Initialize Nautilus TEE client
    const nautilusClient = new NautilusTEEClient();

    // Execute AI resolution inside TEE (or fallback)
    let result: TEEOracleResult;
    try {
      result = await nautilusClient.resolveMarket(
        title,
        description,
        category || 'General',
        endDate || Date.now()
      );
    } catch (error) {
      console.error('Failed to resolve market:', error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Failed to resolve market' },
        { status: 500 }
      );
    }

    // Validate the outcome
    if (!result.outcome || !['yes', 'no'].includes(result.outcome)) {
      return NextResponse.json(
        { error: 'Invalid outcome from AI oracle' },
        { status: 500 }
      );
    }

    // Return result with TEE attestation
    return NextResponse.json({
      outcome: result.outcome,
      reasoning: result.reasoning,
      model: result.model,
      provider: result.provider,
      tee: {
        enclave_url: result.tee.enclave_url,
        signature: result.tee.signature,
        timestamp_ms: result.tee.timestamp_ms,
        attestation_available: result.tee.attestation_available,
        verified: NautilusTEEClient.hasValidAttestation(result),
      },
    });
  } catch (error: unknown) {
    console.error('Resolve API error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

/**
 * Health check for Nautilus TEE enclave
 */
export async function GET() {
  try {
    const nautilusClient = new NautilusTEEClient();
    const health = await nautilusClient.healthCheck();

    return NextResponse.json({
      status: 'ok',
      nautilus: {
        available: true,
        ...health,
      },
    });
  } catch (error) {
    // Nautilus not available, return fallback status
    return NextResponse.json({
      status: 'ok',
      nautilus: {
        available: false,
        message: 'Nautilus TEE enclave not available, using fallback mode',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    });
  }
}
